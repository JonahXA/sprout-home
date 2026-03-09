import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useAuth } from "@/lib/AuthContext";
import { ChevronUp, User, Settings, BarChart2, Users, LogOut } from "lucide-react";
import { toast } from "sonner";
import logoImg from "./assets/logo.png";

const C = {
  navy:"#1F3A64", navyMid:"#172E52", navyLight:"#264D82", navyGlow:"rgba(31,58,100,0.12)",
  accent:"#3B82F6", accentSoft:"#E8F0FE", accentMid:"#BFDBFE",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E5E7EB", borderMid:"#D1D5DB",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

const pill = {
  base: {
    display:"inline-flex", alignItems:"center", justifyContent:"center",
    padding:"10px 22px", borderRadius:999, fontSize:14, fontWeight:500,
    cursor:"pointer", textDecoration:"none", transition:"all 0.15s ease",
    whiteSpace:"nowrap", lineHeight:1, border:"none",
  },
};
pill.nav    = { ...pill.base, background:C.bgSoft, color:C.textSub, border:`1px solid ${C.border}` };
pill.navAct = { ...pill.base, background:C.bg, color:C.text, border:`1.5px solid ${C.borderMid}`, fontWeight:600 };
pill.auth   = { ...pill.base, background:C.navy, color:"#fff", border:`1px solid ${C.navy}`, fontWeight:600, padding:"10px 24px" };
pill.danger = { ...pill.base, background:C.bg, color:"#DC2626", border:"1px solid #FECACA" };

// Home / Learn / Simulations / Challenges — no Leaderboard, no Browse Courses

const navLinks = [
  { label:"Home",           path:"Dashboard" },
  { label:"Browse Courses", path:"Learn" },
  { label:"Simulations",    path:"Simulations" },
  { label:"Challenges",     path:"Challenges" },
];

const noLayoutPages = new Set([
  "login","signup","forgotpassword","schoolselection","welcome",
]);

function NavBar({ currentPageName }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (label, path) => {
    if (label === "Home") return false;
    return currentPageName === path;
  };

  return (
    <div style={{ borderBottom:`1px solid ${C.border}`, background:C.bg, position:"sticky", top:0, zIndex:50 }}>
      <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 32px", display:"flex", alignItems:"center", justifyContent:"space-between", height:80 }}>
        {/* Brand */}
        <Link to={createPageUrl("Dashboard")} style={{ display:"flex", alignItems:"center", gap:0, textDecoration:"none", marginLeft:-4 }}>
          <span style={{ fontSize:32, fontWeight:900, color:C.navy, letterSpacing:"-1.2px" }}>Sprout</span>
          <img src={logoImg} alt="Sprout" style={{ width:68, height:68, objectFit:"contain" }} />
        </Link>

        {/* Nav links */}
        <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
          {navLinks.map((item) => {
            const active = isActive(item.label, item.path);
            return (
              <Link
                key={item.label}
                to={createPageUrl(item.path)}
                style={active ? pill.navAct : pill.nav}
                onMouseEnter={(e) => { if (!active) { e.currentTarget.style.background = C.bgMid; e.currentTarget.style.color = C.text; }}}
                onMouseLeave={(e) => { if (!active) { e.currentTarget.style.background = C.bgSoft; e.currentTarget.style.color = C.textSub; }}}
              >{item.label}</Link>
            );
          })}
          <div style={{ width:1, height:24, background:C.border, margin:"0 4px" }} />
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
            <button
              onClick={() => { logout(false); navigate(createPageUrl("Dashboard")); }}
              style={pill.danger}
              onMouseEnter={(e) => e.currentTarget.style.background = "#FEF2F2"}
              onMouseLeave={(e) => e.currentTarget.style.background = C.bg}
            >Log out</button>
          )}
        </div>
      </div>
    </div>
  );
}

function UserProfileMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  if (!user) return null;

  // Always show full name, fall back to email only if name is truly empty
  const displayName = (user.full_name || "").trim() || user.email?.split("@")[0] || "User";
  const initial = displayName[0].toUpperCase();

  const menuItems = [
    { Icon:User,      label:"My Profile",          action:() => { navigate(createPageUrl("Account"));  setOpen(false); } },
    { Icon:Settings,  label:"Account Settings",    action:() => { navigate(createPageUrl("Account"));  setOpen(false); } },
    { Icon:BarChart2, label:"My Stats / Progress", action:() => { navigate(createPageUrl("Progress")); setOpen(false); } },
    { Icon:Users,     label:"Join a Class",         action:() => { toast("Coming soon!"); setOpen(false); } },
  ];

  return (
    <div ref={menuRef} style={{ position:"fixed", bottom:0, left:0, width:256, zIndex:100 }}>
      {open && (
        <div style={{ margin:"0 12px", background:C.bg, border:`1px solid ${C.border}`, borderRadius:"12px 12px 0 0", borderBottom:"none", padding:"6px", boxShadow:`0 -8px 32px ${C.navyGlow}` }}>
          {menuItems.map(({ Icon, label, action }) => (
            <button key={label} onClick={action}
              style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 12px", borderRadius:8, border:"none", background:"transparent", cursor:"pointer", fontSize:13, fontWeight:500, color:C.text, textAlign:"left", transition:"background 0.12s" }}
              onMouseEnter={(e) => e.currentTarget.style.background = C.bgSoft}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              <Icon size={15} style={{ color:C.textSub, flexShrink:0 }} />{label}
            </button>
          ))}
          <div style={{ borderTop:`1px solid ${C.border}`, margin:"4px 0" }} />
          <button
            onClick={() => { logout(false); navigate(createPageUrl("Dashboard")); setOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:10, width:"100%", padding:"9px 12px", borderRadius:8, border:"none", background:"transparent", cursor:"pointer", fontSize:13, fontWeight:500, color:"#DC2626", textAlign:"left", transition:"background 0.12s" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "#FEF2F2"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            <LogOut size={15} style={{ flexShrink:0 }} />Log Out
          </button>
        </div>
      )}
      <div onClick={() => setOpen(!open)}
        style={{ margin:"0 12px 12px", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", cursor:"pointer", background:C.bg, border:`1px solid ${C.border}`, borderRadius: open ? "0 0 12px 12px" : 12, boxShadow: open ? "none" : "0 2px 12px rgba(0,0,0,0.08)", transition:"all 0.15s", userSelect:"none" }}
        onMouseEnter={(e) => { if (!open) e.currentTarget.style.background = C.bgSoft; }}
        onMouseLeave={(e) => { if (!open) e.currentTarget.style.background = C.bg; }}
      >
        <div style={{ width:34, height:34, borderRadius:"50%", background:C.navy, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, fontWeight:800, flexShrink:0 }}>{initial}</div>
        <span style={{ fontSize:13, fontWeight:600, color:C.text, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</span>
        <ChevronUp size={14} style={{ color:C.textMuted, flexShrink:0, transition:"transform 0.2s", transform: open ? "rotate(0deg)" : "rotate(180deg)" }} />
      </div>
    </div>
  );
}

export default function Layout({ children, currentPageName }) {
  const isNoLayout = noLayoutPages.has(String(currentPageName || "").toLowerCase());
  if (isNoLayout) {
    return (
      <div style={{ minHeight:"100vh", background:"#F8FAFC", fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif" }}>
        {children}
      </div>
    );
  }
  return (
    <div style={{ minHeight:"100vh", background:"#FFFFFF", fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif" }}>
      <NavBar currentPageName={currentPageName} />
      <main style={{ maxWidth:1200, margin:"0 auto", padding:"40px 32px 100px" }}>
        {children}
      </main>
      <UserProfileMenu />
    </div>
  );
}