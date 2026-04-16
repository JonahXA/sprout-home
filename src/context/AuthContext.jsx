import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/services/supabase";
import { getCurrentUser } from "@/services/auth";

const AuthContext = createContext(null);

const STORAGE_KEY = "sprout_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: "local", public_settings: {} });

  useEffect(() => {
    let mounted = true;

    const finishLoading = (profile) => {
      if (!mounted) return;
      if (profile) setUser(profile);
      setIsLoadingAuth(false);
    };

    const restoreFromStorage = () => {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try { return JSON.parse(stored); } catch { /* invalid JSON */ }
      }
      return null;
    };

    // Check for an existing Supabase session, with localStorage fallback
    supabase.auth
      .getSession()
      .then(async ({ data: { session }, error }) => {
        if (!mounted) return;

        if (error || !session) {
          // No Supabase session — fall back to localStorage cache
          finishLoading(restoreFromStorage());
          return;
        }

        // Valid Supabase session — fetch full profile
        try {
          const profile = await getCurrentUser();
          if (mounted) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
            finishLoading(profile);
          }
        } catch {
          // Profile fetch failed — use localStorage cache if available
          finishLoading(restoreFromStorage());
        }
      })
      .catch(() => {
        // Supabase completely unavailable (no env vars, network issue, etc.)
        // Fall back to localStorage so the app still works locally
        if (!mounted) return;
        finishLoading(restoreFromStorage());
      });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        if (event === "SIGNED_OUT" || !session) {
          setUser(null);
          localStorage.removeItem(STORAGE_KEY);
        }
        // SIGNED_IN is handled by Login/Signup calling loginUser() directly
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Call this after a successful login or signup
  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = async (shouldRedirect = true) => {
    try { await supabase.auth.signOut(); } catch { /* ignore if Supabase unavailable */ }
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
    setAuthError(null);
    if (shouldRedirect) {
      window.location.assign("/");
    }
  };

  const navigateToLogin = () => {
    window.location.assign("/#/Login");
  };

  const checkAppState = async () => {};

  const isAuthenticated = !!user;

  const value = useMemo(
    () => ({
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      loginUser,
      logout,
      navigateToLogin,
      checkAppState,
      setUser,
      setAuthError,
    }),
    [user, isAuthenticated, isLoadingAuth, isLoadingPublicSettings, authError, appPublicSettings]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}