import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/lib/AuthContext";
import {
  Flame, Trophy, BookOpen, Target, Zap, ArrowRight,
  TrendingUp, Award, ChevronRight, Sparkles, Calculator
} from "lucide-react";
import logoImg from "../assets/logo.png";

const data = {
  async listCourses() { return []; },
  async listUserProgress() { return []; },
  async listUserBadges() { return []; },
};

const getFirstName = (fullName) => {
  if (!fullName) return "";
  const first = String(fullName).trim().split(" ")[0];
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
};

const pillBase = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "10px 22px",
  borderRadius: 999,
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  border: "none",
  textDecoration: "none",
  transition: "all 0.15s ease",
  whiteSpace: "nowrap",
  lineHeight: 1,
};
const pillGhost = { ...pillBase, background: "white", color: "#374151", border: "1.5px solid #e5e7eb", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" };
const pillGhostActive = { ...pillGhost, background: "#f0fdf4", color: "#15803d", border: "1.5px solid #bbf7d0" };
const pillGreen = { ...pillBase, background: "linear-gradient(135deg, #4ade80, #16a34a)", color: "white", boxShadow: "0 2px 10px rgba(22,163,74,0.28)" };
const pillOutlineGreen = { ...pillBase, background: "white", color: "#16a34a", border: "1.5px solid #4ade80" };

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: courses = [] } = useQuery({ queryKey: ["courses"], queryFn: () => data.listCourses() });
  const { data: userProgress = [] } = useQuery({ queryKey: ["userProgress", user?.email], queryFn: () => data.listUserProgress(user?.email), enabled: !!user });
  const { data: userBadges = [] } = useQuery({ queryKey: ["userBadges", user?.email], queryFn: () => data.listUserBadges(user?.email), enabled: !!user });

  const completedLessons = userProgress.filter((p) => p.completed).length;
  const totalXP = user?.xp_points || 0;
  const currentStreak = user?.current_streak || 0;
  const level = user?.level || 1;
  const xpForNextLevel = level * 100;
  const xpProgress = totalXP % 100;
  const featuredCourses = courses.filter((c) => c.is_featured).slice(0, 3);

  const navLinks = [
    { label: "Home", path: "Dashboard" },
    { label: "Learn", path: "Learn" },
    { label: "Simulations", path: "Simulations" },
    { label: "Challenges", path: "Challenges" },
    { label: "Leaderboard", path: "Leaderboard" },
  ];

  return (
    <div style={{ minHeight: "100vh" }}>

      {/* ── SEAMLESS NAV ROW ── */}
      <div style={{ marginBottom: 48 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}>

          {/* Brand: custom logo + large wordmark */}
          <Link
            to={createPageUrl("Dashboard")}
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            <img src={logoImg} alt="Sprout" style={{ width: 44, height: 44, objectFit: "contain" }} />
            <span style={{
              fontSize: 28,
              fontWeight: 800,
              color: "#0d2233",
              letterSpacing: "-0.6px",
              fontFamily: "Georgia, 'Times New Roman', serif",
              lineHeight: 1,
            }}>
              Sprout
            </span>
          </Link>

          {/* All nav + actions in one pill row */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {navLinks.map((item) => {
              const isActive =
                window.location.hash.toLowerCase().includes(item.path.toLowerCase()) ||
                (item.path === "Dashboard" && (
                  window.location.hash === "" ||
                  window.location.hash === "#/" ||
                  window.location.hash === "#/dashboard"
                ));
              return (
                <Link
                  key={item.label}
                  to={createPageUrl(item.path)}
                  style={isActive ? pillGhostActive : pillGhost}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "#f9fafb"; e.currentTarget.style.borderColor = "#d1d5db"; }}}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "white"; e.currentTarget.style.borderColor = "#e5e7eb"; }}}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Divider */}
            <div style={{ width: 1, height: 28, background: "#e5e7eb", margin: "0 4px" }} />

            <Link
              to={createPageUrl("Learn")}
              style={pillGhost}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#f9fafb"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
            >
              Browse Courses
            </Link>

            {!user ? (
              <>
                <Link
                  to={createPageUrl("Login")}
                  style={pillOutlineGreen}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#f0fdf4"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
                >
                  Log in
                </Link>
                <Link
                  to={createPageUrl("Signup")}
                  style={pillGreen}
                  onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
                >
                  Sign up
                </Link>
              </>
            ) : (
              <button
                onClick={() => { logout(false); navigate(createPageUrl("Dashboard")); }}
                style={{ ...pillGhost, color: "#dc2626", borderColor: "#fecaca" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#fef2f2"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "white"; }}
              >
                Log out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── WELCOME HEADING ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 32, fontWeight: 700, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
          {user ? `Welcome back, ${getFirstName(user.full_name)}!` : "Hello!"}
        </h1>
        <p style={{ color: "#6b7280", marginTop: 6, fontSize: 15 }}>Ready to continue growing today?</p>
      </div>

      {/* ── STATS GRID ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" style={{ marginBottom: 24 }}>
        <Card className="border-none shadow-lg bg-gradient-to-br from-orange-400 to-red-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="pb-2"><Flame className="w-8 h-8 mb-2" /><CardTitle className="text-3xl font-bold">{currentStreak}</CardTitle></CardHeader>
          <CardContent><p className="text-sm opacity-90">Day Streak 🔥</p><p className="text-xs opacity-75 mt-1">Keep it up!</p></CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="pb-2"><Zap className="w-8 h-8 mb-2" /><CardTitle className="text-3xl font-bold">{totalXP}</CardTitle></CardHeader>
          <CardContent><p className="text-sm opacity-90">Total XP</p><p className="text-xs opacity-75 mt-1">Level {level}</p></CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-blue-400 to-cyan-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="pb-2"><BookOpen className="w-8 h-8 mb-2" /><CardTitle className="text-3xl font-bold">{completedLessons}</CardTitle></CardHeader>
          <CardContent><p className="text-sm opacity-90">Lessons Done</p><p className="text-xs opacity-75 mt-1">Great progress!</p></CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
          <CardHeader className="pb-2"><Award className="w-8 h-8 mb-2" /><CardTitle className="text-3xl font-bold">{userBadges.length}</CardTitle></CardHeader>
          <CardContent><p className="text-sm opacity-90">Badges Earned</p><p className="text-xs opacity-75 mt-1">Collector!</p></CardContent>
        </Card>
      </div>

      {/* ── LEVEL PROGRESS ── */}
      <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm" style={{ marginBottom: 24 }}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5 text-purple-500" />Level {level} Progress</CardTitle>
            <span className="text-sm text-gray-600">{xpProgress} / {xpForNextLevel} XP</span>
          </div>
        </CardHeader>
        <CardContent>
          <Progress value={(xpProgress / xpForNextLevel) * 100} className="h-3 bg-gray-200" />
          <p className="text-sm text-gray-600 mt-2">{xpForNextLevel - xpProgress} XP until Level {level + 1}</p>
        </CardContent>
      </Card>

      {/* ── FEATURED COURSES ── */}
      <div style={{ marginBottom: 24 }}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Featured Courses</h2>
          <Link to={createPageUrl("Learn")} className="text-lime-600 hover:text-lime-700 font-medium flex items-center gap-1">View All <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredCourses.map((course) => {
            const cp = userProgress.filter((p) => p.course_id === course.id && p.completed).length;
            const pct = (cp / (course.lessons_count || 1)) * 100;
            const gr = { Investing: "from-green-400 to-emerald-500", Saving: "from-blue-400 to-cyan-500", "Credit & Debt": "from-purple-400 to-pink-500", Insurance: "from-orange-400 to-red-500" };
            return (
              <Card key={course.id} className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group bg-white/80 overflow-hidden" onClick={() => navigate(createPageUrl(`CourseDetail?id=${course.id}`))}>
                <div className={`h-40 bg-gradient-to-br ${gr[course.category] || "from-gray-400 to-gray-500"} flex items-center justify-center relative`}>
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                  <div className="text-white text-6xl z-10">{course.icon || "📚"}</div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-lime-600 transition-colors">{course.name}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{Math.round(pct)}% Complete</span>
                    <span className="text-lime-600 font-medium flex items-center gap-1"><Zap className="w-3 h-3" />{course.xp_reward} XP</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2"><BookOpen className="w-3 h-3" />{course.lessons_count} lessons</div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* ── QUICK ACCESS ── */}
      <div style={{ marginBottom: 24 }}>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Browse Courses", sub: `${courses.length} available`, icon: <BookOpen className="w-6 h-6 text-blue-600" />, bg: "from-blue-100 to-cyan-100", path: "Learn" },
            { label: "Savings Goals", sub: "Track progress", icon: <Target className="w-6 h-6 text-lime-600" />, bg: "from-lime-100 to-green-100", path: "Goals" },
            { label: "Calculator", sub: "Growth projections", icon: <Calculator className="w-6 h-6 text-green-600" />, bg: "from-green-100 to-emerald-100", path: "InvestmentCalculator" },
            { label: "Leaderboard", sub: "See rankings", icon: <Trophy className="w-6 h-6 text-yellow-600" />, bg: "from-yellow-100 to-orange-100", path: "Leaderboard" },
            { label: "My Progress", sub: "View stats", icon: <TrendingUp className="w-6 h-6 text-purple-600" />, bg: "from-purple-100 to-pink-100", path: "Progress" },
          ].map((item) => (
            <Card key={item.label} className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/80" onClick={() => navigate(createPageUrl(item.path))}>
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 bg-gradient-to-br ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-3`}>{item.icon}</div>
                <p className="font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-600 mt-1">{item.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* ── BOTTOM PROMO CARDS ── */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="border-none shadow-lg bg-gradient-to-r from-lime-400 to-green-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10"><Target className="w-48 h-48" /></div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-xl font-bold mb-2">🎯 Daily Challenge</h3>
            <p className="opacity-90 mb-1">Complete 3 lessons today!</p>
            <p className="text-sm opacity-75 mb-4">Earn a bonus 50 XP</p>
            <button onClick={() => navigate(createPageUrl("Learn"))} style={{ ...pillBase, background: "white", color: "#16a34a", fontWeight: 700 }}>
              Start Challenge <ArrowRight className="w-4 h-4 ml-1 inline" />
            </button>
          </CardContent>
        </Card>
        <Card className="border-none shadow-lg bg-gradient-to-r from-blue-400 to-cyan-500 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 opacity-10"><Target className="w-48 h-48" /></div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-xl font-bold mb-2">💰 Savings Goals</h3>
            <p className="opacity-90 mb-1">Track your financial targets</p>
            <p className="text-sm opacity-75 mb-4">Set and achieve goals</p>
            <button onClick={() => navigate(createPageUrl("Goals"))} style={{ ...pillBase, background: "white", color: "#0284c7", fontWeight: 700 }}>
              View Goals <ArrowRight className="w-4 h-4 ml-1 inline" />
            </button>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}