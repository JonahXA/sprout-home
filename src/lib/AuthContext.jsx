import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext(null);

const STORAGE_KEY = "sprout_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings, setIsLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings, setAppPublicSettings] = useState({ id: "local", public_settings: {} });

  // On app load: do NOT restore from localStorage (fresh session = logged out)
  useEffect(() => {
    setUser(null);
    setIsLoadingAuth(false);
  }, []);

  // Call this after a successful login or signup
  const loginUser = (userData) => {
    setUser(userData);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
  };

  const logout = (shouldRedirect = true) => {
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