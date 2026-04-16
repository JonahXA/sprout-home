import { supabase } from "./supabase";
import { subDays, format, startOfDay } from "date-fns";

/**
 * Daily Active Users — unique user_emails per day for the last `days` days.
 * Reads from user_activity_events.
 * Returns: [{ date: "Apr 01", count: 12 }, ...]
 */
export async function getDAU(days = 30) {
  const since = subDays(new Date(), days).toISOString();

  const { data, error } = await supabase
    .from("user_activity_events")
    .select("user_email, created_at")
    .gte("created_at", since)
    .order("created_at", { ascending: true });

  if (error) throw error;

  // Group by calendar day and count unique emails
  const byDay = {};
  (data || []).forEach(({ user_email, created_at }) => {
    const day = format(new Date(created_at), "MMM dd");
    if (!byDay[day]) byDay[day] = new Set();
    byDay[day].add(user_email);
  });

  // Fill every day in the range so the chart has no gaps
  const result = [];
  for (let i = days - 1; i >= 0; i--) {
    const day = format(subDays(new Date(), i), "MMM dd");
    result.push({ date: day, users: byDay[day]?.size ?? 0 });
  }
  return result;
}

/**
 * New signups per day for the last `days` days.
 * Reads from profiles.created_at.
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
 * Top courses by lesson_view events.
 * Returns: [{ course: "AI Literacy", views: 45 }, ...]
 */
export async function getTopCourses() {
  const { data, error } = await supabase
    .from("user_activity_events")
    .select("event_data, course_id")
    .eq("event_type", "lesson_view");

  if (error) throw error;

  // Tally by course_id
  const counts = {};
  (data || []).forEach(({ course_id, event_data }) => {
    const key = event_data?.course_name || course_id || "Unknown";
    counts[key] = (counts[key] ?? 0) + 1;
  });

  return Object.entries(counts)
    .map(([course, views]) => ({ course, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 8);
}

/**
 * Retention — percentage of users who appeared on at least 2 distinct days.
 * Returns: { totalUsers, retainedUsers, retentionRate }
 */
export async function getRetentionData() {
  const { data, error } = await supabase
    .from("user_activity_events")
    .select("user_email, created_at");

  if (error) throw error;

  const userDays = {};
  (data || []).forEach(({ user_email, created_at }) => {
    const day = format(new Date(created_at), "yyyy-MM-dd");
    if (!userDays[user_email]) userDays[user_email] = new Set();
    userDays[user_email].add(day);
  });

  const totalUsers = Object.keys(userDays).length;
  const retainedUsers = Object.values(userDays).filter((days) => days.size >= 2).length;
  const retentionRate = totalUsers > 0 ? Math.round((retainedUsers / totalUsers) * 100) : 0;

  return { totalUsers, retainedUsers, retentionRate };
}

/**
 * DAU for today — single integer count of unique active users today.
 */
export async function getTodayDAU() {
  const todayStart = startOfDay(new Date()).toISOString();

  const { data, error } = await supabase
    .from("user_activity_events")
    .select("user_email")
    .gte("created_at", todayStart);

  if (error) throw error;

  const unique = new Set((data || []).map((r) => r.user_email));
  return unique.size;
}
