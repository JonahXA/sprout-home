// ============================================================
// FOR_MAIN_APP/activityTracker.js
// Copy to: main-app/src/lib/activityTracker.js
//
// Requires: main-app/src/lib/supabaseClient.js (standard Supabase client)
// Usage examples in README.md
// ============================================================

import { supabase } from "./supabaseClient";

let _lastSeenAt = 0;

// ── upsert profile row on signup / login ─────────────────────
export async function upsertProfile({ id, email, displayName } = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  const uid = id ?? user?.id;
  if (!uid) return;

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: uid,
        email: email ?? user?.email,
        full_name: displayName ?? user?.user_metadata?.full_name ?? user?.email?.split("@")[0],
        last_seen_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

  if (error) console.warn("[tracker] upsertProfile:", error.message);
}

// ── touch last_seen_at (throttled to once/60s) ───────────────
export async function touchLastSeen() {
  const now = Date.now();
  if (now - _lastSeenAt < 60_000) return;
  _lastSeenAt = now;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) console.warn("[tracker] touchLastSeen:", error.message);
}

// ── track a generic event ────────────────────────────────────
export async function trackEvent(eventType, { courseSlug, dayNumber, metadata } = {}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // Resolve course_id from slug if provided
  let courseId = null;
  if (courseSlug) {
    const { data } = await supabase
      .from("courses")
      .select("id")
      .eq("slug", courseSlug)
      .single();
    courseId = data?.id ?? null;
  }

  const { error } = await supabase.from("user_activity_events").insert({
    user_id:    user.id,
    course_id:  courseId,
    event_type: eventType,
    day_number: dayNumber ?? null,
    metadata:   metadata ?? null,
  });

  if (error) console.warn("[tracker] trackEvent:", error.message);
}

// ── convenience: track login ─────────────────────────────────
export async function trackLogin() {
  await upsertProfile();
  await trackEvent("login");
}

// ── upsert lesson completion + course progress ───────────────
export async function upsertLessonProgress({
  courseSlug,
  dayNumber,
  quizScore = null,
  xpEarned = 0,
  totalDays = 10,
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  // 1. Resolve course_id
  const { data: courseRow, error: courseErr } = await supabase
    .from("courses")
    .select("id, total_days")
    .eq("slug", courseSlug)
    .single();

  if (courseErr || !courseRow) {
    console.warn("[tracker] upsertLessonProgress: course not found", courseSlug);
    return;
  }

  const courseId  = courseRow.id;
  const totalD    = courseRow.total_days ?? totalDays;
  const now       = new Date().toISOString();

  // 2. Upsert lesson-level progress
  const { error: ulpErr } = await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id:      user.id,
        course_id:    courseId,
        day_number:   dayNumber,
        status:       "completed",
        quiz_score:   quizScore,
        xp_earned:    xpEarned,
        completed_at: now,
      },
      { onConflict: "user_id,course_id,day_number" }
    );

  if (ulpErr) console.warn("[tracker] ulp upsert:", ulpErr.message);

  // 3. Recount completed lessons to update course-level progress
  const { data: completed } = await supabase
    .from("user_lesson_progress")
    .select("day_number", { count: "exact", head: false })
    .eq("user_id",   user.id)
    .eq("course_id", courseId)
    .eq("status",    "completed");

  const completedCount = completed?.length ?? 0;
  const pct = Math.min(100, Math.round((completedCount / totalD) * 100));

  const { error: ucpErr } = await supabase
    .from("user_course_progress")
    .upsert(
      {
        user_id:           user.id,
        course_id:         courseId,
        completed_days:    completedCount,
        percent_complete:  pct,
        last_day_completed: dayNumber,
        total_xp:          xpEarned, // Supabase can't SUM here; caller can accumulate
        enrolled_at:       now,
      },
      { onConflict: "user_id,course_id" }
    );

  if (ucpErr) console.warn("[tracker] ucp upsert:", ucpErr.message);

  // 4. Fire event
  await trackEvent("lesson_completed", {
    courseSlug,
    dayNumber,
    metadata: { quiz_score: quizScore, xp_earned: xpEarned },
  });
}

// ── track lesson start ───────────────────────────────────────
export async function trackLessonStart(courseSlug, dayNumber) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: courseRow } = await supabase
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (!courseRow) return;

  // Upsert in_progress only if no completed record exists
  await supabase
    .from("user_lesson_progress")
    .upsert(
      {
        user_id:    user.id,
        course_id:  courseRow.id,
        day_number: dayNumber,
        status:     "in_progress",
      },
      {
        onConflict:        "user_id,course_id,day_number",
        ignoreDuplicates:  false,
      }
    );

  // Also ensure enrolled
  await supabase
    .from("user_course_progress")
    .upsert(
      { user_id: user.id, course_id: courseRow.id },
      { onConflict: "user_id,course_id", ignoreDuplicates: true }
    );

  await trackEvent("lesson_started", { courseSlug, dayNumber });
}