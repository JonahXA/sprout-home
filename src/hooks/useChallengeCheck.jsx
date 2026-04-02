// src/components/useChallengeCheck.jsx
import { useCallback, useEffect, useMemo, useState } from "react";

/**
 * Local-only challenge check (Supabase disabled for migration).
 * Prevents hook/render crashes and removes `your_project_id.supabase.co` errors.
 */

const STORAGE_KEY = "sprout_completed_challenge";

function safeParse(raw, fallback) {
 try {
 return raw ? JSON.parse(raw) : fallback;
 } catch {
 return fallback;
 }
}

export function useChallengeCheck(user) {
 // Always derive a stable "user key" even if your local user is { email, ... }
 const userKey = useMemo(() => {
 return user?.id || user?.email || null;
 }, [user]);

 const [completedChallenge, setCompletedChallenge] = useState(null);

 // Load any stored completion when user changes
 useEffect(() => {
 if (!userKey) {
 setCompletedChallenge(null);
 return;
 }

 const saved = safeParse(localStorage.getItem(STORAGE_KEY), null);
 if (!saved) {
 setCompletedChallenge(null);
 return;
 }

 // Ignore if saved belongs to a different user
 if (saved.userKey && saved.userKey !== userKey) {
 setCompletedChallenge(null);
 return;
 }

 setCompletedChallenge(saved.challenge || null);
 }, [userKey]);

 const clearCompletedChallenge = useCallback(() => {
 localStorage.removeItem(STORAGE_KEY);
 setCompletedChallenge(null);
 }, []);

 // Optional helper if you ever want to set it manually later
 const markCompletedChallenge = useCallback(
 (challenge) => {
 if (!userKey) return;
 localStorage.setItem(STORAGE_KEY, JSON.stringify({ userKey, challenge }));
 setCompletedChallenge(challenge);
 },
 [userKey]
 );

 return { completedChallenge, clearCompletedChallenge, markCompletedChallenge };
}
