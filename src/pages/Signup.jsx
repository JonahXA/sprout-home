import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import logoImg from "../assets/logo.png";

const safeParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};
const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const normalizeEmail = (email) => String(email || "").trim().toLowerCase();
const genId = () => {
  try { return crypto?.randomUUID?.() || `id_${Date.now()}_${Math.random().toString(16).slice(2)}`; }
  catch { return `id_${Date.now()}_${Math.random().toString(16).slice(2)}`; }
};

const data = {
  async upsertUser(user) {
    const users = getJSON("sprout_users", []);
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx >= 0) users[idx] = { ...users[idx], ...user };
    else users.push(user);
    setJSON("sprout_users", users);
    return user;
  },
  async findUserByEmail(email) {
    const users = getJSON("sprout_users", []);
    const e = normalizeEmail(email);
    return users.find((u) => normalizeEmail(u.email) === e) || null;
  },
  async setCurrentUser(user) { setJSON("sprout_user", user); },
};

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name:"", email:"", password:"", confirm_password:"" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailNormalized = useMemo(() => normalizeEmail(form.email), [form.email]);

  const validate = () => {
    if (!String(form.full_name||"").trim()) return "Please enter your name.";
    if (!emailNormalized || !emailNormalized.includes("@")) return "Please enter a valid email.";
    if (String(form.password||"").length < 6) return "Password must be at least 6 characters.";
    if (form.password !== form.confirm_password) return "Passwords do not match.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { toast.error(err); return; }
    setIsSubmitting(true);
    try {
      const existing = await data.findUserByEmail(emailNormalized);
      if (existing) { toast.error("An account with that email already exists. Try logging in."); setIsSubmitting(false); return; }
      const newUser = {
        id: genId(),
        full_name: String(form.full_name||"").trim(),
        email: emailNormalized,
        password: String(form.password||""),
        onboarding_completed: false,
        school_id:"", grade:"",
        xp_points:0, level:1, current_streak:0, longest_streak:0,
        total_lessons_completed:0, total_courses_completed:0,
        created_at: new Date().toISOString(),
      };
      await data.upsertUser(newUser);
      await data.setCurrentUser(newUser);
      toast.success("Account created!");
      navigate(createPageUrl("SchoolSelection"));
    } catch (error) {
      console.error(error);
      toast.error("Signup failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC]">
      <div className="w-full max-w-lg space-y-6">

        {/* Brand — matches Dashboard exactly */}
        <div className="flex justify-center">
          <Link to={createPageUrl("Dashboard")} style={{ display:"flex", alignItems:"center", gap:2, textDecoration:"none" }}>
            <span style={{ fontSize:34, fontWeight:900, color:"#1F3A64", letterSpacing:"-1.2px" }}>Sprout</span>
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
                  <Input value={form.full_name} onChange={(e) => setForm((p) => ({ ...p, full_name:e.target.value }))}
                    className="pl-10 h-11" autoComplete="name" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email:e.target.value }))}
                    type="email" className="pl-10 h-11" autoComplete="email" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="password" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password:e.target.value }))}
                    className="pl-10 h-11" autoComplete="new-password" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700 font-semibold">Confirm password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input type="password" value={form.confirm_password} onChange={(e) => setForm((p) => ({ ...p, confirm_password:e.target.value }))}
                    className="pl-10 h-11" autoComplete="new-password" required />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}
                className="w-full h-12 text-base font-semibold text-white rounded-lg mt-2"
                style={{ background:"#1F3A64" }}
                onMouseEnter={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#172E52"; }}
                onMouseLeave={(e) => { if (!isSubmitting) e.currentTarget.style.background = "#1F3A64"; }}
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">Create Account <ArrowRight className="w-4 h-4" /></div>
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to={createPageUrl("Login")} className="text-[#3B82F6] font-semibold hover:underline">Log in</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}