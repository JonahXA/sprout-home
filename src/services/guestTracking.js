import { supabase } from "./supabase";
import { getOrCreateGuestId } from "./guestSession";

export async function trackGuestEvent(eventType, data = {}) {
  const guestId = getOrCreateGuestId();
  const { course_id, lesson_id, simulation_id, page_path, metadata } = data;

  await supabase.from("guest_activity").insert({
    guest_id: guestId,
    event_type: eventType,
    course_id: course_id ?? null,
    lesson_id: lesson_id ?? null,
    simulation_id: simulation_id ?? null,
    page_path: page_path ?? window.location.hash,
    device_type: /Mobi|Android/i.test(navigator.userAgent) ? "mobile" : "desktop",
    metadata: metadata ?? null,
  }).catch(() => {});
}

export async function saveGuestLessonProgress(lessonId, courseId, score) {
  const guestId = getOrCreateGuestId();
  await supabase.from("guest_lesson_progress").upsert({
    guest_id: guestId,
    lesson_id: lessonId,
    course_id: courseId ?? null,
    completed: true,
    quiz_score: score,
    completed_at: new Date().toISOString(),
  }, { onConflict: "guest_id,lesson_id" }).catch(() => {});
}

export async function mergeGuestToUser(guestId, userId) {
  const { data: guestProgress } = await supabase
    .from("guest_lesson_progress")
    .select("*")
    .eq("guest_id", guestId);

  if (!guestProgress?.length) return;

  const events = guestProgress.map((row) => ({
    user_id: userId,
    event_type: "lesson_completed",
    course_id: row.course_id,
    metadata: {
      lesson_id: row.lesson_id,
      quiz_score: row.quiz_score,
      merged_from_guest: guestId,
    },
    created_at: row.completed_at || new Date().toISOString(),
  }));

  await supabase.from("user_activity_events").insert(events).catch(() => {});
}
