import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Sprout, Mail, Lock } from "lucide-react";

const setLocalUser = (u) => localStorage.setItem("sprout_user", JSON.stringify(u));

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }

    const user = {
      id: crypto?.randomUUID?.() || `u_${Date.now()}`,
      full_name: email.split("@")[0],
      email: email,
      onboarding_completed: true,
      xp_points: 0,
      level: 1,
      current_streak: 0,
      total_lessons_completed: 0,
      total_courses_completed: 0,
      show_on_leaderboard: true,
    };

    setLocalUser(user);
    navigate(createPageUrl("Dashboard"));
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-lime-50 via-white to-green-50">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gradient-to-br from-lime-400 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sprout</h1>
              <p className="text-sm text-gray-500">Grow Your Knowledge</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 text-center pb-6">
            <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
            <CardDescription className="text-base">
              Enter your details to continue learning
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label className="text-gray-700">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@school.edu"
                    className="pl-10 h-12 border-gray-200"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 h-12 border-gray-200"
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full h-12 bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-white font-semibold shadow-lg shadow-lime-200"
              >
                Continue
              </Button>

              <div className="text-center space-y-2">
                <div className="text-sm text-gray-500">
                  <Link className="underline" to={createPageUrl("ForgotPassword")}>
                    Forgot password?
                  </Link>
                </div>
                <div className="text-sm text-gray-600">
                  Don't have an account yet?{" "}
                  <Link
                    to={createPageUrl("Signup")}
                    className="text-lime-600 font-semibold hover:underline"
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