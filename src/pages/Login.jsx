import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/services/supabase";
import { getCurrentUser } from "@/services/auth";
import logoImg from "../assets/logo.png";

// Translate Supabase error messages into user-friendly text
function friendlyAuthError(message) {
  const m = (message || "").toLowerCase();
  if (m.includes("email not confirmed") || m.includes("not confirmed")) {
    return {
      type: "confirm",
      text: "Your email address hasn't been confirmed yet. Please check your inbox for the confirmation link, then try logging in again.",
    };
  }
  if (m.includes("invalid login credentials") || m.includes("invalid credentials") || m.includes("wrong password")) {
    return { type: "error", text: "Incorrect email or password. Please try again." };
  }
  if (m.includes("too many requests") || m.includes("rate limit")) {
    return { type: "error", text: "Too many attempts. Please wait a moment, then try again." };
  }
  if (m.includes("user not found") || m.includes("no user found")) {
    return { type: "error", text: "No account found with that email. Check the email or sign up." };
  }
  // Fall back to showing the raw Supabase message so nothing is hidden
  return { type: "error", text: message || "Login failed. Please try again." };
}

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState(null); // { type: "error"|"confirm", text }
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setAuthMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password; // do NOT trim passwords — spaces are valid

    if (!trimmedEmail || !trimmedPassword) {
      setAuthMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }

    setIsLoading(true);
    try {
      // Sign out any stale session first to avoid state conflicts
      await supabase.auth.signOut().catch(() => {});

      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (authError) {
        setAuthMessage(friendlyAuthError(authError.message));
        return;
      }

      if (!data?.session) {
        // Should not happen when email confirmation is off, but guard anyway
        setAuthMessage({
          type: "confirm",
          text: "Please confirm your email address before logging in. Check your inbox for a confirmation link.",
        });
        return;
      }

      const profile = await getCurrentUser();
      loginUser(profile);
      navigate(createPageUrl("Dashboard"));
    } catch (err) {
      console.error("[Login] unexpected error:", err);
      setAuthMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-md">

        {/* Brand — identical to dashboard / layout */}
        <div className="flex justify-center mb-8">
          <Link
            to={createPageUrl("Dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 0, textDecoration: "none" }}
          >
            <span style={{ fontSize: 32, fontWeight: 900, color: "#1B2B5E", letterSpacing: "-1.2px" }}>
              Sprout
            </span>
            <img src={logoImg} alt="Sprout" style={{ width: 64, height: 64, objectFit: "contain" }} />
          </Link>
        </div>

        <Card className="border border-gray-200 shadow-lg bg-white rounded-2xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-base text-gray-500">
              Enter your details to continue learning
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-11 border-gray-200"
                    autoComplete="email"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-medium">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-11 border-gray-200"
                    autoComplete="current-password"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Auth message — error or email-confirmation notice */}
              {authMessage && (
                <div
                  className={`flex items-start gap-2 rounded-lg p-3 text-sm ${
                    authMessage.type === "confirm"
                      ? "bg-blue-50 border border-blue-200 text-blue-800"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  {authMessage.type === "confirm" ? (
                    <CheckCircle className="w-4 h-4 mt-0.5 shrink-0 text-blue-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-500" />
                  )}
                  <span>{authMessage.text}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 font-semibold text-white rounded-lg mt-2"
                style={{ background: "#1B2B5E" }}
                onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.background = "#141E43"; }}
                onMouseLeave={(e) => { if (!isLoading) e.currentTarget.style.background = "#1B2B5E"; }}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in…
                  </div>
                ) : "Continue"}
              </Button>

              <div className="text-center space-y-2 pt-2">
                <div className="text-sm">
                  <Link
                    className="text-[#3B82F6] font-medium hover:underline"
                    to={createPageUrl("ForgotPassword")}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    to={createPageUrl("Signup")}
                    className="text-[#3B82F6] font-semibold hover:underline"
                  >
                    Sign up
                  </Link>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}