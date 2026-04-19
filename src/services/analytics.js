import { supabase } from "./supabase";
import { subDays, format, startOfDay } from "date-fns";

/**
 * Daily Active Users — unique identifiers (user_id + guest_id) per day.
 * Combines user_activity_events and guest_activity tables.
 * Returns: [{ date: "Apr 01", users: 12 }, ...]
 */
export async function getDAU(days = 30) {
  const since = subDays(new Date(), days).toISOString();

  const [{ data: userEvents }, { data: guestEvents }] = await Promise.all([
    supabase
      .from("user_activity_events")
      .select("user_id, created_at")
      .gte("created_at", since),
    supabase
      .from("guest_activity")
      .select("guest_id, created_at")
      .gte("created_at", since),
  ]);

  const byDay = {};
  (userEvents || []).forEach(({ user_id, created_at }) => {
    const day = format(new Date(created_at), "MMM dd");
    if (!byDay[day]) byDay[day] = new Set();
    byDay[day].add(`u_${user_id}`);
  });
  (guestEvents || []).forEach(({ guest_id, created_at }) => {
    const day = format(new Date(created_at), "MMM dd");
    if (!byDay[day]) byDay[day] = new Set();
    byDay[day].add(guest_id);
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = format(subDays(new Date(), i), "MMM dd");
    result.push({ date: day, users: byDay[day]?.size ?? 0 });
  }
  return result;
}

/**
 * New signups per day for the last `days` days.
 * Returns: [{ date: "Apr 01", signups: 3 }, ...]
 */
export async function getSignupsByDay(days = 30) {
  const since = subDays(new Date(), days).toISOString();

  const { data, error } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const byDay = {};
  (data || []).forEach(({ created_at }) => {
    const day = format(new Date(created_at), "MMM dd");
    byDay[day] = (byDay[day] ?? 0) + 1;
  });

  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = format(subDays(new Date(), i), "MMM dd");
    result.push({ date: day, signups: byDay[day] ?? 0 });
  }
  return result;
}

/**
 * Top courses by lesson_completed events (users + guests combined).
 * Returns: [{ course: "AI Literacy", views: 45 }, ...]
 */
export async function getTopCourses() {
  const [{ data: userEvents }, { data: guestEvents }] = await Promise.all([
    supabase
      .from("user_activity_events")
      .select("course_id, metadata")
      .eq("event_type", "lesson_completed"),
    supabase
      .from("guest_activity")
      .select("course_id, metadata")
      .eq("event_type", "lesson_completed"),
  ]);

  const counts = {};
  const tally = (rows) => {
    (rows || []).forEach(({ course_id, metadata }) => {
      const key = metadata?.course_name || course_id || "Unknown";
      if (key === "Unknown" || !key) return;
      counts[key] = (counts[key] ?? 0) + 1;
    });
  };
  tally(userEvents);
  tally(guestEvents);

  return Object.entries(counts)
    .map(([course, views]) => ({ course, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

/**
 * Retention — users who appeared on at least 2 distinct days (authenticated only).
 * Returns: { totalUsers, retainedUsers, retentionRate }
 */
export async function getRetentionData() {
  const { data, error } = await supabase
    .from("user_activity_events")
    .select("user_id, created_at");

  if (error) throw error;

  const userDays = {};
  (data || []).forEach(({ user_id, created_at }) => {
    const day = format(new Date(created_at), "yyyy-MM-dd");
    if (!userDays[user_id]) userDays[user_id] = new Set();
    userDays[user_id].add(day);
  });

  const totalUsers = Object.keys(userDays).length;
  const retainedUsers = Object.values(userDays).filter((days) => days.size >= 2).length;
  const retentionRate = totalUsers > 0 ? Math.round((retainedUsers / totalUsers) * 100) : 0;

  return { totalUsers, retainedUsers, retentionRate };
}

/**
 * DAU for today — unique active users + guests today.
 */
export async function getTodayDAU() {
  const todayStart = startOfDay(new Date()).toISOString();

  const [{ data: userEvents }, { data: guestEvents }] = await Promise.all([
    supabase
      .from("user_activity_events")
      .select("user_id")
      .gte("created_at", todayStart),
    supabase
      .from("guest_activity")
      .select("guest_id")
      .gte("created_at", todayStart),
  ]);

  const ids = new Set([
    ...(userEvents || []).map((r) => `u_${r.user_id}`),
    ...(guestEvents || []).map((r) => r.guest_id),
  ]);
  return ids.size;
}

/**
 * Total distinct guest sessions in the last `days` days.
 */
export async function getGuestSessionCount(days = 30) {
  const since = subDays(new Date(), days).toISOString();

  const { data, error } = await supabase
    .from("guest_activity")
    .select("guest_id")
    .gte("created_at", since);

  if (error) return 0;
  return new Set((data || []).map((r) => r.guest_id)).size;
}
