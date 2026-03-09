import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, Lock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import logoImg from "../assets/logo.png";

const safeParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

export default function Login() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }

    // Try to restore an existing user by email
    const users = safeParse(localStorage.getItem("sprout_users"), []);
    const normalizedEmail = email.trim().toLowerCase();
    const existing = users.find((u) => (u.email || "").toLowerCase() === normalizedEmail);

    const user = existing || {
      id: crypto?.randomUUID?.() || `u_${Date.now()}`,
      full_name: "",
      email: normalizedEmail,
      onboarding_completed: true,
      xp_points: 0, level: 1, current_streak: 0,
      total_lessons_completed: 0, total_courses_completed: 0,
      show_on_leaderboard: true,
    };

    loginUser(user);
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-md">

        {/* Brand — matches Dashboard exactly */}
        <div className="flex justify-center mb-8">
          <Link to={createPageUrl("Dashboard")} style={{ display:"flex", alignItems:"center", gap:2, textDecoration:"none" }}>
            <span style={{ fontSize:34, fontWeight:900, color:"#1F3A64", letterSpacing:"-1.2px" }}>Sprout</span>
            <img src={logoImg} alt="Sprout" style={{ width:64, height:64, objectFit:"contain" }} />
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
                  />
                </div>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              <Button
                type="submit"
                className="w-full h-11 font-semibold text-white rounded-lg mt-2"
                style={{ background:"#1F3A64" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#172E52"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#1F3A64"}
              >
                Continue
              </Button>

              <div className="text-center space-y-2 pt-2">
                <div className="text-sm">
                  <Link className="text-[#3B82F6] font-medium hover:underline" to={createPageUrl("ForgotPassword")}>
                    Forgot password?
                  </Link>
                </div>
                <div className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <Link to={createPageUrl("Signup")} className="text-[#3B82F6] font-semibold hover:underline">
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