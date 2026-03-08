import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import {
  Flame, Trophy, BookOpen, Target, Zap, ArrowRight,
  TrendingUp, Award, ChevronRight, Sparkles, Calculator,
  Play, BarChart2, CreditCard, Shield, Cpu, PieChart, Book
} from "lucide-react";
import logoImg from "../assets/logo.png";

// ─────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────
const C = {
  // Brand
  navy:       "#1F3A64",
  navyMid:    "#172E52",
  navyLight:  "#264D82",
  navyGlow:   "rgba(31,58,100,0.12)",
  // Blue
  accent:     "#3B82F6",
  accentSoft: "#E8F0FE",
  accentMid:  "#BFDBFE",
  // Green
  green:      "#22C55E",
  greenSoft:  "#E8F8F0",
  // Amber / Orange
  amber:      "#F59E0B",
  amberSoft:  "#FFF3E0",
  // Purple
  purple:     "#8B5CF6",
  purpleSoft: "#F2ECFF",
  // Neutrals
  bg:         "#FFFFFF",
  bgSoft:     "#F8FAFC",
  bgMid:      "#F1F5F9",
  border:     "#E5E7EB",
  borderMid:  "#D1D5DB",
  // Typography
  text:       "#0F172A",
  textSub:    "#475569",
  textMuted:  "#94A3B8",
};

const data = {
  async listCourses() { return []; },
  async listUserProgress() { return []; },
  async listUserBadges() { return []; },
};

const getFirstName = (n) => {
  if (!n) return "";
  const w = String(n).trim().split(" ")[0];
  return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
};

// ─────────────────────────────────────────────
// PILL STYLES
// ─────────────────────────────────────────────
const pill = {
  base: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    padding: "8px 20px", borderRadius: 999, fontSize: 13, fontWeight: 500,
    cursor: "pointer", textDecoration: "none", transition: "all 0.15s ease",
    whiteSpace: "nowrap", lineHeight: 1, border: "none",
  },
};
pill.nav    = { ...pill.base, background: C.bgSoft, color: C.textSub, border: `1px solid ${C.border}` };
pill.navAct = { ...pill.base, background: C.bg, color: C.text, border: `1.5px solid ${C.borderMid}`, fontWeight: 600 };
pill.auth   = { ...pill.base, background: C.navy, color: "#fff", border: `1px solid ${C.navy}`, fontWeight: 600, padding: "9px 22px" };
pill.danger = { ...pill.base, background: C.bg, color: "#DC2626", border: "1px solid #FECACA" };

// ─────────────────────────────────────────────
// SECTION HEADER
// ─────────────────────────────────────────────
function SectionHeader({ title, sub, linkTo, linkLabel }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.5px", lineHeight: 1.2 }}>{title}</h2>
        {sub && <p style={{ fontSize: 14, color: C.textSub, margin: "5px 0 0", fontWeight: 500, lineHeight: 1.4 }}>{sub}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} style={{ fontSize: 13, color: C.accent, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 3, paddingBottom: 2 }}>
          {linkLabel} <ChevronRight size={14} />
        </Link>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// STAT CARD
// ─────────────────────────────────────────────
function StatCard({ icon, value, label, sub, iconBg, iconColor }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: C.bg,
        border: `1px solid ${hov ? C.borderMid : C.border}`,
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: hov ? `0 8px 32px ${C.navyGlow}` : "0 1px 4px rgba(0,0,0,0.05)",
        transition: "all 0.22s ease",
        transform: hov ? "translateY(-3px)" : "none",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Soft color header band */}
      <div style={{
        background: iconBg,
        padding: "20px 22px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: `1px solid ${C.border}`,
      }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", justifyContent: "center", color: iconColor }}>
          {icon}
        </div>
        <div style={{ fontSize: 11, fontWeight: 700, color: iconColor, opacity: 0.7, textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</div>
      </div>
      {/* White body */}
      <div style={{ padding: "18px 22px 20px" }}>
        <div style={{ fontSize: 36, fontWeight: 900, color: C.text, lineHeight: 1, letterSpacing: "-1.4px" }}>{value}</div>
        <div style={{ fontSize: 12, color: C.textSub, marginTop: 6, fontWeight: 500 }}>{sub}</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// QUICK TILE
// ─────────────────────────────────────────────
function QuickTile({ icon, label, sub, onClick, iconBg, iconColor }) {
  const [hov, setHov] = React.useState(false);
  return (
    <div onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? C.navy : C.bg,
        border: `1px solid ${hov ? C.navy : C.border}`,
        borderRadius: 16, padding: "22px 18px", cursor: "pointer", textAlign: "center",
        transition: "all 0.22s ease",
        boxShadow: hov ? `0 10px 32px ${C.navyGlow}` : "0 1px 4px rgba(0,0,0,0.05)",
        transform: hov ? "translateY(-3px)" : "none",
      }}
    >
      <div style={{
        width: 46, height: 46, borderRadius: 13,
        background: hov ? "rgba(255,255,255,0.12)" : (iconBg || C.accentSoft),
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 12px",
        transition: "all 0.22s",
        color: hov ? "#fff" : (iconColor || C.accent),
      }}>
        {icon}
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: hov ? "#fff" : C.text, transition: "color 0.22s" }}>{label}</div>
      <div style={{ fontSize: 11, color: hov ? "rgba(255,255,255,0.65)" : C.textSub, marginTop: 4, fontWeight: 500, transition: "color 0.22s" }}>{sub}</div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const { data: courses = [] }      = useQuery({ queryKey: ["courses"],      queryFn: () => data.listCourses() });
  const { data: userProgress = [] } = useQuery({ queryKey: ["userProgress", user?.email], queryFn: () => data.listUserProgress(user?.email), enabled: !!user });
  const { data: userBadges = [] }   = useQuery({ queryKey: ["userBadges",   user?.email], queryFn: () => data.listUserBadges(user?.email),   enabled: !!user });

  const completedLessons = userProgress.filter((p) => p.completed).length;
  const totalXP         = user?.xp_points || 0;
  const currentStreak   = user?.current_streak || 0;
  const level           = user?.level || 1;
  const xpForNextLevel  = level * 100;
  const xpProgress      = totalXP % 100;
  const featuredCourses = courses.filter((c) => c.is_featured).slice(0, 3);
  const firstName       = getFirstName(user?.full_name);

  const navLinks = [
    { label: "Home",           path: "Dashboard" },
    { label: "Learn",          path: "Learn" },
    { label: "Simulations",    path: "Simulations" },
    { label: "Challenges",     path: "Challenges" },
    { label: "Leaderboard",    path: "Leaderboard" },
    { label: "Browse Courses", path: "Learn" },
  ];

  const isHome =
    window.location.hash === "" ||
    window.location.hash === "#/" ||
    window.location.hash.toLowerCase().includes("dashboard");

  const isActive = (path, label) => {
    if (label === "Home") return false;          // never highlight Home
    if (label === "Browse Courses") return false; // never highlight Browse Courses
    return window.location.hash.toLowerCase().includes(path.toLowerCase());
  };

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif" }}>

      {/* ══════════════════════════════════════
          NAV BAR
      ══════════════════════════════════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 0, paddingTop: 4, paddingBottom: 28, borderBottom: `1px solid ${C.border}` }}>

        <Link to={createPageUrl("Dashboard")} style={{ display: "flex", alignItems: "center", gap: 2, textDecoration: "none", marginLeft: -4 }}>
          <span style={{ fontSize: 34, fontWeight: 900, color: C.navy, letterSpacing: "-1.2px" }}>Sprout</span>
          <img src={logoImg} alt="Sprout" style={{ width: 68, height: 68, objectFit: "contain" }} />
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {navLinks.map((item) => {
            const active = isActive(item.path, item.label);
            return (
              <Link key={item.label} to={createPageUrl(item.path)}
                style={active ? pill.navAct : pill.nav}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = C.bgMid; e.currentTarget.style.color = C.text; }}}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = C.bgSoft; e.currentTarget.style.color = C.textSub; }}}
              >{item.label}</Link>
            );
          })}
          <div style={{ width: 1, height: 22, background: C.border, margin: "0 4px" }} />
          {!user ? (
            <>
              <Link to={createPageUrl("Login")} style={pill.auth}
                onMouseEnter={(e) => e.currentTarget.style.background = C.navyMid}
                onMouseLeave={(e) => e.currentTarget.style.background = C.navy}
              >Log in</Link>
              <Link to={createPageUrl("Signup")} style={pill.auth}
                onMouseEnter={(e) => e.currentTarget.style.background = C.navyMid}
                onMouseLeave={(e) => e.currentTarget.style.background = C.navy}
              >Sign up</Link>
            </>
          ) : (
            <button onClick={() => { logout(false); navigate(createPageUrl("Dashboard")); }}
              style={pill.danger}
              onMouseEnter={(e) => e.currentTarget.style.background = "#FEF2F2"}
              onMouseLeave={(e) => e.currentTarget.style.background = C.bg}
            >Log out</button>
          )}
        </div>
      </div>

      {/* ══════════════════════════════════════
          HERO WELCOME BAND
      ══════════════════════════════════════ */}
      <div style={{
        background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 60%, #1a4080 100%)`,
        borderRadius: 20,
        padding: "48px 52px",
        marginTop: 36,
        marginBottom: 32,
        position: "relative",
        overflow: "hidden",
        boxShadow: `0 12px 48px ${C.navyGlow}`,
      }}>
        {/* Decorative shapes */}
        <div style={{ position: "absolute", right: -60, top: -60, width: 300, height: 300, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", right: 40, top: -20, width: 180, height: 180, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.07)" }} />
        <div style={{ position: "absolute", right: 120, bottom: -80, width: 240, height: 240, borderRadius: "50%", background: "rgba(255,255,255,0.025)" }} />

        <div style={{ position: "relative", zIndex: 1, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 32, flexWrap: "wrap" }}>

          {/* Left: greeting */}
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 10 }}>
              {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </div>
            <h1 style={{ fontSize: 42, fontWeight: 900, color: "#fff", margin: 0, letterSpacing: "-1.2px", lineHeight: 1.08 }}>
              {user ? `Welcome back,\n${firstName}!` : "Hello, learner!"}
            </h1>
            <p style={{ fontSize: 16, color: "rgba(255,255,255,0.75)", margin: "14px 0 0", lineHeight: 1.6, fontWeight: 400 }}>
              {user ? "Keep the momentum going — your goals are within reach." : "Build real-world skills through interactive courses, simulations, and practical tools."}
            </p>
            <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap" }}>
              <button onClick={() => navigate(createPageUrl("Learn"))}
                style={{ ...pill.base, background: "#fff", color: C.navy, fontWeight: 700, fontSize: 14, padding: "11px 26px", boxShadow: "0 2px 16px rgba(0,0,0,0.15)" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; }}
              >
                Start Learning <ArrowRight size={15} style={{ marginLeft: 6 }} />
              </button>
              {!user && (
                <Link to={createPageUrl("Signup")}
                  style={{ ...pill.base, background: "rgba(255,255,255,0.12)", color: "#fff", fontWeight: 600, fontSize: 14, padding: "11px 26px", border: "1px solid rgba(255,255,255,0.2)" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.18)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.12)"}
                >
                  Create Account
                </Link>
              )}
            </div>
          </div>

          {/* Right: progress snapshot */}
          <div style={{
            background: "rgba(255,255,255,0.07)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 16,
            padding: "24px 28px",
            minWidth: 260,
            backdropFilter: "blur(8px)",
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.65)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 16 }}>
              Your Progress
            </div>

            {/* XP bar */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Sparkles size={13} style={{ color: "#86EFAC" }} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Level {level}</span>
                </div>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: 600 }}>{xpProgress}/{xpForNextLevel} XP</span>
              </div>
              <div style={{ height: 7, background: "rgba(255,255,255,0.12)", borderRadius: 999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${(xpProgress / xpForNextLevel) * 100}%`, background: "linear-gradient(90deg, #22C55E, #86EFAC)", borderRadius: 999, transition: "width 0.5s ease" }} />
              </div>
            </div>

            {/* Quick stats row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[
                { icon: <Flame size={14} />, val: currentStreak, lbl: "Streak" },
                { icon: <BookOpen size={14} />, val: completedLessons, lbl: "Lessons" },
                { icon: <Award size={14} />, val: userBadges.length, lbl: "Badges" },
              ].map((s) => (
                <div key={s.lbl} style={{ background: "rgba(255,255,255,0.07)", borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
                  <div style={{ color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{s.val}</div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", marginTop: 3, fontWeight: 600, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.lbl}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════
          STAT CARDS
      ══════════════════════════════════════ */}
      <div className="stat-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 32 }}>
        <StatCard icon={<Flame size={19} />}    value={currentStreak}     label="Day Streak"    sub="Keep it up"      iconBg={C.amberSoft}  iconColor={C.amber}  />
        <StatCard icon={<Zap size={19} />}      value={totalXP}           label="Total XP"      sub={`Level ${level}`} iconBg={C.accentSoft} iconColor={C.accent} />
        <StatCard icon={<BookOpen size={19} />} value={completedLessons}  label="Lessons Done"  sub="Great progress"  iconBg={C.greenSoft}  iconColor={C.green}  />
        <StatCard icon={<Award size={19} />}    value={userBadges.length} label="Badges Earned" sub="Collector"       iconBg={C.purpleSoft} iconColor={C.purple} />
      </div>

      {/* ══════════════════════════════════════
          FOCAL MODULES — Daily Challenge + Continue Learning
      ══════════════════════════════════════ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 36 }}>

        {/* ── DAILY CHALLENGE ── */}
        <div style={{
          background: `linear-gradient(140deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
          borderRadius: 20, padding: "40px",
          position: "relative", overflow: "hidden",
          boxShadow: `0 12px 48px ${C.navyGlow}`,
          minHeight: 260,
        }}>
          {/* Decorative rings */}
          <div style={{ position: "absolute", right: -50, bottom: -50, width: 220, height: 220, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.06)" }} />
          <div style={{ position: "absolute", right: 30, top: -40, width: 140, height: 140, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />
          <div style={{ position: "absolute", left: -20, bottom: -60, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.02)" }} />

          <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Label pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.10)", borderRadius: 999, padding: "5px 14px", marginBottom: 20, alignSelf: "flex-start" }}>
              <Target size={12} style={{ color: "rgba(255,255,255,0.75)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Daily Challenge</span>
            </div>

            {/* Title — auth-aware */}
            <div style={{ fontSize: 30, fontWeight: 900, color: "#fff", marginBottom: 10, letterSpacing: "-0.7px", lineHeight: 1.1 }}>
              {user ? "Complete 3 lessons today" : "Start your learning journey"}
            </div>
            <div style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", marginBottom: 16, lineHeight: 1.6 }}>
              {user
                ? "Build your streak and stay on track with your goals."
                : "Sign up to unlock daily challenges, earn XP, and track your progress."}
            </div>

            {/* XP badge — only when logged in */}
            {user && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(134,239,172,0.14)", border: "1px solid rgba(134,239,172,0.25)", borderRadius: 999, padding: "5px 14px", marginBottom: 8, alignSelf: "flex-start" }}>
                <Zap size={12} style={{ color: "#86EFAC" }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: "#86EFAC" }}>+50 XP Reward</span>
              </div>
            )}

            {/* Streak badge — only when logged in and has streak */}
            {user && currentStreak > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(253,186,116,0.14)", border: "1px solid rgba(253,186,116,0.25)", borderRadius: 999, padding: "5px 14px", marginBottom: 8, alignSelf: "flex-start" }}>
                <Flame size={12} style={{ color: "#FCA5A5" }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: "#FCA5A5" }}>{currentStreak} day streak 🔥</span>
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* CTA button */}
            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => user ? navigate(createPageUrl("Learn")) : navigate(createPageUrl("Login"))}
                style={{ ...pill.base, background: "#fff", color: C.navy, fontWeight: 800, fontSize: 14, padding: "13px 30px", boxShadow: "0 2px 20px rgba(0,0,0,0.22)", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#EFF6FF"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(0,0,0,0.22)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#fff"; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 2px 20px rgba(0,0,0,0.22)"; }}
              >
                {user ? "Start Challenge" : "Start Learning"}
                <ArrowRight size={15} style={{ marginLeft: 7 }} />
              </button>
            </div>
          </div>
        </div>

        {/* ── CONTINUE LEARNING ── */}
        <div style={{
          background: C.bg,
          border: `1px solid ${C.border}`,
          borderRadius: 20, padding: "40px",
          position: "relative", overflow: "hidden",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
          transition: "box-shadow 0.22s, border-color 0.22s",
          minHeight: 260,
        }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 16px 48px ${C.navyGlow}`; e.currentTarget.style.borderColor = C.borderMid; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = C.border; }}
        >
          {/* Soft decorative circle */}
          <div style={{ position: "absolute", right: -40, bottom: -40, width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${C.accentSoft} 0%, transparent 70%)`, opacity: 0.8 }} />

          <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column" }}>
            {/* Label pill */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.accentSoft, border: `1px solid ${C.accentMid}`, borderRadius: 999, padding: "5px 14px", marginBottom: 20, alignSelf: "flex-start" }}>
              <Play size={12} style={{ color: C.accent }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Continue Learning</span>
            </div>

            {/* Title — auth-aware */}
            <div style={{ fontSize: 30, fontWeight: 900, color: C.text, marginBottom: 10, letterSpacing: "-0.7px", lineHeight: 1.1 }}>
              {user ? "Pick up where you left off" : "Track your progress"}
            </div>
            <div style={{ fontSize: 14, color: C.textSub, marginBottom: 16, lineHeight: 1.6 }}>
              {user
                ? "You're building great habits — consistency is the key to mastery."
                : "Create a free account to save your progress, earn badges, and resume lessons anytime."}
            </div>

            {/* Streak status — only if logged in with active streak */}
            {user && currentStreak > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.greenSoft, border: `1px solid #BBF7D0`, borderRadius: 999, padding: "5px 14px", marginBottom: 8, alignSelf: "flex-start" }}>
                <Flame size={12} style={{ color: C.green }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: C.green }}>Streak active — {currentStreak} days</span>
              </div>
            )}

            {/* Lessons completed — only if logged in */}
            {user && completedLessons > 0 && (
              <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: C.accentSoft, border: `1px solid ${C.accentMid}`, borderRadius: 999, padding: "5px 14px", marginBottom: 8, alignSelf: "flex-start" }}>
                <BookOpen size={12} style={{ color: C.accent }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: C.accent }}>{completedLessons} lesson{completedLessons !== 1 ? "s" : ""} completed</span>
              </div>
            )}

            <div style={{ flex: 1 }} />

            {/* CTA button */}
            <div style={{ marginTop: 24 }}>
              <button
                onClick={() => user ? navigate(createPageUrl("Learn")) : navigate(createPageUrl("Login"))}
                style={{ ...pill.base, background: C.navy, color: "#fff", fontWeight: 800, fontSize: 14, padding: "13px 30px", transition: "all 0.2s" }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.navyMid; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 28px ${C.navyGlow}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
              >
                {user ? "Resume Course" : "Sign In to Continue"}
                <ArrowRight size={15} style={{ marginLeft: 7 }} />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* ══════════════════════════════════════
          FEATURED COURSES
      ══════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader title="Featured Courses" sub="Curated lessons to grow your financial knowledge" linkTo={createPageUrl("Learn")} linkLabel="View all" />
        <div className="course-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {[
            {
              id: "credit",
              icon: <CreditCard size={28} />,
              name: "Understanding Credit",
              description: "Learn how credit scores work, what affects them, and how to build healthy credit over time.",
              tag: "Finance Basics",
              tagColor: C.accentSoft,
              tagText: C.accent,
              accentTo: "#DBEAFE",
              xp: 120,
              path: "Learn",
            },
            {
              id: "insurance",
              icon: <Shield size={28} />,
              name: "Insurance 101",
              description: "Understand the basics of insurance — health, auto, renters — and how to protect your finances.",
              tag: "Risk Management",
              tagColor: C.greenSoft,
              tagText: C.green,
              accentTo: "#BBF7D0",
              xp: 100,
              path: "Learn",
            },
            {
              id: "ai-literacy",
              icon: <Cpu size={28} />,
              name: "AI Literacy",
              description: "Learn how to use modern AI tools productively and responsibly in school, work, and everyday life.",
              tag: "Technology",
              tagColor: C.purpleSoft,
              tagText: C.purple,
              accentTo: "#DDD6FE",
              xp: 150,
              path: "Learn",
            },
          ].map((course) => {
            const pct = userProgress.filter((p) => p.course_id === course.id && p.completed).length > 0 ? 40 : 0;
            return (
              <div key={course.id}
                onClick={() => navigate(createPageUrl(course.path))}
                style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "all 0.22s", display: "flex", flexDirection: "column" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 10px 36px ${C.navyGlow}`; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = C.borderMid; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = C.border; }}
              >
                {/* Thumbnail — solid soft color */}
                <div style={{ height: 110, background: course.tagColor, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                  <div style={{ width: 54, height: 54, borderRadius: 15, background: "rgba(255,255,255,0.72)", display: "flex", alignItems: "center", justifyContent: "center", color: course.tagText }}>
                    {course.icon}
                  </div>
                </div>
                <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                  {/* Category tag */}
                  <div style={{ display: "inline-block", background: course.tagColor, color: course.tagText, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, marginBottom: 10, alignSelf: "flex-start", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                    {course.tag}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 7, letterSpacing: "-0.3px", lineHeight: 1.35 }}>{course.name}</div>
                  <div style={{ fontSize: 12.5, color: C.textSub, marginBottom: 16, lineHeight: 1.65, flex: 1, fontWeight: 400 }}>{course.description}</div>
                  {/* Progress bar */}
                  <div style={{ height: 4, background: C.bgMid, borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${C.accent}, #22C55E)`, borderRadius: 999, transition: "width 0.5s" }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11, fontWeight: 500 }}>
                    <span style={{ color: C.textSub, fontWeight: 500 }}>{pct > 0 ? `${pct}% complete` : "Not started"}</span>
                    <span style={{ color: C.green, fontWeight: 700 }}>+{course.xp} XP</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════
          FEATURED SIMULATIONS
      ══════════════════════════════════════ */}
      <div style={{ marginBottom: 36 }}>
        <SectionHeader title="Featured Simulations" sub="Hands-on tools to practice real financial decisions" linkTo={createPageUrl("Simulations")} linkLabel="View all" />
        <div className="course-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
          {[
            {
              id: "paper-trading",
              icon: <TrendingUp size={28} />,
              name: "Paper Trading",
              description: "Practice buying and selling stocks in a risk-free simulated market. Build confidence before investing real money.",
              tag: "Investing",
              tagColor: C.accentSoft,
              tagText: C.accent,
              accentFrom: "#EFF6FF",
              accentTo: "#DBEAFE",
              path: "Simulations",
              label: "Launch Simulation",
            },
            {
              id: "investment-calculator",
              icon: <Calculator size={28} />,
              name: "Investment Growth Calculator",
              description: "Explore how your money grows over time with compound interest. Adjust rate, time, and contributions interactively.",
              tag: "Planning",
              tagColor: C.greenSoft,
              tagText: C.green,
              accentFrom: "#F0FDF4",
              accentTo: "#DCFCE7",
              path: "InvestmentCalculator",
              label: "Open Calculator",
            },
            {
              id: "budget-builder",
              icon: <PieChart size={28} />,
              name: "Build Your First Budget",
              description: "Create a personal budget from scratch, categorize your expenses, and learn how to stay financially balanced.",
              tag: "Budgeting",
              tagColor: C.amberSoft,
              tagText: C.amber,
              accentFrom: "#FFFBEB",
              accentTo: "#FEF3C7",
              path: "Simulations",
              label: "Start Budgeting",
            },
          ].map((sim) => (
            <div key={sim.id}
              onClick={() => navigate(createPageUrl(sim.path))}
              style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden", cursor: "pointer", boxShadow: "0 1px 4px rgba(0,0,0,0.05)", transition: "all 0.22s", display: "flex", flexDirection: "column" }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 10px 36px ${C.navyGlow}`; e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.borderColor = C.borderMid; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "none"; e.currentTarget.style.borderColor = C.border; }}
            >
              {/* Thumbnail — solid soft color */}
              <div style={{ height: 110, background: sim.tagColor, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
                <div style={{ width: 54, height: 54, borderRadius: 15, background: "rgba(255,255,255,0.72)", display: "flex", alignItems: "center", justifyContent: "center", color: sim.tagText }}>
                  {sim.icon}
                </div>
              </div>
              <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Category tag */}
                <div style={{ display: "inline-block", background: sim.tagColor, color: sim.tagText, fontSize: 10, fontWeight: 700, padding: "3px 10px", borderRadius: 999, marginBottom: 10, alignSelf: "flex-start", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {sim.tag}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: C.text, marginBottom: 7, letterSpacing: "-0.3px", lineHeight: 1.35 }}>{sim.name}</div>
                <div style={{ fontSize: 12.5, color: C.textSub, marginBottom: 18, lineHeight: 1.65, flex: 1, fontWeight: 400 }}>{sim.description}</div>
                {/* Launch row */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: sim.tagText, display: "flex", alignItems: "center", gap: 4 }}>
                    <Play size={11} />
                    {sim.label}
                  </span>
                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: sim.tagColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <ArrowRight size={13} style={{ color: sim.tagText }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════
          QUICK ACCESS
      ══════════════════════════════════════ */}
      <div style={{ marginBottom: 16 }}>
        <SectionHeader title="Quick Access" sub="Jump to any feature instantly" />
        <div className="quick-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14 }}>
          <QuickTile icon={<Book size={18} />}        label="Browse Courses" sub={`${courses.length} available`}  onClick={() => navigate(createPageUrl("Learn"))}                iconBg={C.accentSoft}  iconColor={C.accent}  />
          <QuickTile icon={<Target size={18} />}     label="Savings Goals"  sub="Track progress"                onClick={() => navigate(createPageUrl("Goals"))}                iconBg={C.greenSoft}   iconColor={C.green}   />
          <QuickTile icon={<Calculator size={18} />} label="Calculator"     sub="Growth projections"            onClick={() => navigate(createPageUrl("InvestmentCalculator"))} iconBg={C.amberSoft}   iconColor={C.amber}   />
          <QuickTile icon={<Trophy size={18} />}     label="Leaderboard"    sub="See rankings"                  onClick={() => navigate(createPageUrl("Leaderboard"))}          iconBg={C.purpleSoft}  iconColor={C.purple}  />
          <QuickTile icon={<BarChart2 size={18} />}  label="My Progress"    sub="View stats"                    onClick={() => navigate(createPageUrl("Progress"))}             iconBg={C.accentSoft}  iconColor={C.accent}  />
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        @media (max-width: 1024px) {
          .course-grid { grid-template-columns: repeat(2,1fr) !important; }
        }
        @media (max-width: 900px) {
          .stat-grid   { grid-template-columns: repeat(2,1fr) !important; }
          .quick-grid  { grid-template-columns: repeat(3,1fr) !important; }
        }
        @media (max-width: 640px) {
          .stat-grid   { grid-template-columns: 1fr 1fr !important; }
          .course-grid { grid-template-columns: 1fr !important; }
          .quick-grid  { grid-template-columns: repeat(2,1fr) !important; }
        }
      `}</style>

    </div>
  );
}