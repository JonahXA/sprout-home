import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import logoImg from "../assets/logo.png";
import { supabase } from "@/services/supabase";
import { getCurrentUser } from "@/services/auth";
import { useAuth } from "@/context/AuthContext";
import { getGuestId, clearGuestSession } from "@/services/guestSession";
import { mergeGuestToUser } from "@/services/guestTracking";

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

export default function Signup() {
  const navigate = useNavigate();
  const { loginUser } = useAuth();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", confirm_password: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailNormalized = useMemo(() => normalizeEmail(form.email), [form.email]);

  const validate = () => {
    if (!String(form.full_name || "").trim()) return "Please enter your name.";
    if (!emailNormalized || !emailNormalized.includes("@")) return "Please enter a valid email.";
    if (String(form.password || "").length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }

    setIsSubmitting(true);
    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: emailNormalized,
        password: form.password,
        options: {
          data: { full_name: form.full_name.trim() },
        },
      });

      if (authError) {
        if (authError.message.toLowerCase().includes("already registered") ||
            authError.message.toLowerCase().includes("already been registered")) {
          toast.error("An account with that email already exists. Try logging in.");
        } else {
          toast.error(authError.message);
        }
        return;
      }

      // Supabase silently returns identities:[] when the email is already registered
      // (happens when email confirmation is enabled — no error is thrown)
      if (data.user && (!data.user.identities || data.user.identities.length === 0)) {
        toast.error("An account with that email already exists. Try logging in.");
        return;
      }

      // Email confirmation is enabled — no session yet; ask them to confirm first
      if (!data.session) {
        toast.success("Account created! Check your email to confirm your address, then log in.");
        navigate(createPageUrl("Login"));
        return;
      }

      // Confirmation disabled — session exists, log them in immediately
      const profile = await getCurrentUser();
      loginUser(profile);

      // Merge any guest activity into the new user account
      const guestId = getGuestId();
      if (guestId) {
        await mergeGuestToUser(guestId, profile.id).catch(() => {});
        clearGuestSession();
      }

      toast.success("Account created!");
      navigate(createPageUrl("SchoolSelection"));
    } catch {
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (key) => ({
    value: form[key],
    onChange: (e) => setForm((p) => ({ ...p, [key]: e.target.value })),
    disabled: isSubmitting,
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-lg space-y-6">

        {/* Brand */}
        <div className="flex justify-center">
          <Link to={createPageUrl("Dashboard")} style={{ display:"flex", alignItems:"center", gap:2, textDecoration:"none" }}>
            <span style={{ fontSize:34, fontWeight:900, color:"#1B2B5E", letterSpacing:"-1.2px" }}>Sprout</span>
            <img src={logoImg} alt="Sprout" style={{ width:64, height:64, objectFit:"contain" }} />
          </Link>
        </div>

        <Card className="border border-gray-200 shadow-lg bg-white rounded-2xl overflow-hidden">
          <CardHeader className="text-center pb-6 border-b border-gray-100">
            <CardTitle className="text-2xl font-bold tracking-tight">Create your account</CardTitle>
            <p className="text-gray-500 mt-2 text-sm">
              Start learning with progress tracking, XP, and simulations.
            </p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Full name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input {...field("full_name")} className="pl-10 h-11" autoComplete="name" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input {...field("email")} type="email" className="pl-10 h-11" autoComplete="email" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input {...field("password")} type="password" className="pl-10 h-11" autoComplete="new-password" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input {...field("confirm_password")} type="password" className="pl-10 h-11" autoComplete="new-password" required />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold text-white rounded-lg mt-2"
                style={{ background:"#1B2B5E" }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#141E43"; }}
                onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#1B2B5E"; }}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Create Account <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to={createPageUrl("Login")} className="text-[#3B82F6] font-semibold hover:underline">
                  Log in
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
