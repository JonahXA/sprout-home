// src/lib/appClient.js
// Replacement for Base44 auth + entities using Supabase.
// Keeps pages clean and minimizes migration changes.

import { supabase } from "@/lib/supabaseClient";

/**
 * Update these if your Supabase table names differ
 */
const TABLES = {
 profiles: "profiles", // user profile table (role, xp, phone, school_id, etc.)
 schools: "schools",
 userProgress: "user_progress",
 userBadges: "user_badges",
 aiCourseDayProgress: "ai_course_day_progress",
};

/**
 * Base44 used `user.email` as join key everywhere.
 * We’ll keep that convention to avoid rewriting your app.
 */
async function requireAuthedEmail() {
 const { data, error } = await supabase.auth.getUser();
 if (error) throw error;
 const email = data?.user?.email;
 if (!email) throw new Error("Not authenticated");
 return { user: data.user, email };
}

/**
 * Returns the "current user" object your UI expects.
 * It merges Supabase auth user + profile row.
 */
export async function getCurrentUser() {
 const { user, email } = await requireAuthedEmail();

 // Pull profile fields (role, xp, etc.) from your profiles table
 const { data: profile, error } = await supabase
 .from(TABLES.profiles)
 .select("*")
 .eq("email", email)
 .maybeSingle();

 if (error) throw error;

 // If there is no profile row yet, return auth user minimally.
 // (You can create profiles on signup later.)
 return {
 id: profile?.id ?? user.id,
 email,
 full_name: profile?.full_name ?? user.user_metadata?.full_name ?? user.user_metadata?.name ?? "",
 phone: profile?.phone ?? "",
 school_id: profile?.school_id ?? "",
 grade: profile?.grade ?? "",
 username: profile?.username ?? "",
 show_on_leaderboard: profile?.show_on_leaderboard ?? true,

 role: profile?.role ?? "user",
 level: profile?.level ?? 1,
 xp_points: profile?.xp_points ?? 0,
 total_lessons_completed: profile?.total_lessons_completed ?? 0,
 current_streak: profile?.current_streak ?? 0,
 longest_streak: profile?.longest_streak ?? 0,

 created_date: profile?.created_at ?? user.created_at ?? null,
 };
}

/**
 * Safe version of getCurrentUser — returns null instead of throwing when
 * the user is not authenticated. Use this in lesson pages so unauthenticated
 * users see the page rather than being bounced to Login.
 */
export async function getCurrentUserSafe() {
 try {
 return await getCurrentUser();
 } catch {
 return null;
 }
}

/**
 * Update current user's profile fields
 */
export async function updateCurrentUserProfile(patch) {
 const { email } = await requireAuthedEmail();

 // Upsert so it works even if profile row doesn't exist yet
 const { error } = await supabase
 .from(TABLES.profiles)
 .upsert({ email, ...patch }, { onConflict: "email" });

 if (error) throw error;
}

/**
 * Logout
 */
export async function logout() {
 const { error } = await supabase.auth.signOut();
 if (error) throw error;
}

/**
 * List schools
 */
export async function listSchools() {
 const { data, error } = await supabase
 .from(TABLES.schools)
 .select("*")
 .order("name", { ascending: true });

 if (error) throw error;
 return data ?? [];
}

/**
 * Admin: list all users (profiles)
 */
export async function listAllUsers() {
 const { data, error } = await supabase
 .from(TABLES.profiles)
 .select("*")
 .order("created_at", { ascending: false });

 if (error) throw error;
 return data ?? [];
}

/**
 * Admin: list all progress rows
 */
export async function listAllUserProgress() {
 const { data, error } = await supabase
 .from(TABLES.userProgress)
 .select("*");

 if (error) throw error;
 return data ?? [];
}

/**
 * Admin: list all badge rows
 */
export async function listAllUserBadges() {
 const { data, error } = await supabase
 .from(TABLES.userBadges)
 .select("*");

 if (error) throw error;
 return data ?? [];
}

/**
 * AICourseDayProgress: get one row by user_email + day_number
 */
export async function getAIDayProgress({ user_email, day_number }) {
 const { data, error } = await supabase
 .from(TABLES.aiCourseDayProgress)
 .select("*")
 .eq("user_email", user_email)
 .eq("day_number", day_number)
 .maybeSingle();

 if (error) throw error;
 return data ?? null;
}

/**
 * AICourseDayProgress: upsert completion state
 * - if existing row exists, updates it
 * - else creates it
 */
export async function upsertAIDayProgress(payload) {
 // Expect payload includes user_email + day_number
 const { error } = await supabase
 .from(TABLES.aiCourseDayProgress)
 .upsert(payload, { onConflict: "user_email,day_number" });

 if (error) throw error;
}

/**
 * Admin: list all AI course day progress rows (all users)
 */
export async function listAllAIDayProgress() {
 const { data, error } = await supabase
 .from(TABLES.aiCourseDayProgress)
 .select("*")
 .order("user_email", { ascending: true });

 if (error) throw error;
 return data ?? [];
}

/**
 * Get all AI day progress rows for a single user
 */
export async function getAllAIDayProgressForUser(user_email) {
 const { data, error } = await supabase
 .from(TABLES.aiCourseDayProgress)
 .select("*")
 .eq("user_email", user_email);

 if (error) throw error;
 return data ?? [];
}