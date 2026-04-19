import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { GraduationCap, BookOpen } from "lucide-react";
import logoImg from "@/assets/logo.png";

// sessionStorage key — controls popup visibility per browser session.
// Cleared automatically when the tab/browser closes; survives page refresh.
const SESSION_KEY = "rolePopupShown";

// localStorage key — persists the actual role choice for Account Settings display.
const ROLE_KEY = "userRole";

// Hook — use this anywhere you need to read or reset the role
export function useUserRole() {
  const [role, setRole] = useState(() => localStorage.getItem(ROLE_KEY));

  const resetRole = useCallback(() => {
    localStorage.removeItem(ROLE_KEY);
    sessionStorage.removeItem(SESSION_KEY); // allow popup to re-appear next visit
    setRole(null);
  }, []);

  return { role, resetRole };
}

const C = {
  navy: "#1B2B5E",
  navyLight: "#243570",
  green: "#2D9B6F",
  greenSoft: "#E6F5EF",
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
  border: "#E5E7EB",
  text: "#0F172A",
  textSub: "#475569",
  overlay: "rgba(15,23,42,0.55)",
};

export default function RoleSelectModal() {
  const navigate = useNavigate();

  // Show the popup if it has NOT been shown yet this browser session
  const [visible, setVisible] = useState(
    () => !sessionStorage.getItem(SESSION_KEY)
  );
  const [selecting, setSelecting] = useState(null);

  if (!visible) return null;

  const handleSelect = (role) => {
    setSelecting(role);
    // Mark popup as shown for this session (survives refresh, not new tab)
    sessionStorage.setItem(SESSION_KEY, "true");
    // Persist the actual role for Account Settings display
    localStorage.setItem(ROLE_KEY, role);
    setVisible(false);
    navigate(role === "teacher" ? createPageUrl("Landing") : createPageUrl("Dashboard"));
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: C.overlay,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        style={{
          background: C.bg,
          borderRadius: 20,
          width: "100%",
          maxWidth: 480,
          boxShadow: "0 24px 64px rgba(0,0,0,0.18)",
          overflow: "hidden",
        }}
      >
        {/* Header — matches dashboard branding */}
        <div
          style={{
            background: C.navy,
            padding: "28px 32px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 0,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 28,
                fontWeight: 900,
                color: "#fff",
                letterSpacing: "-1.2px",
              }}
            >
              Sprout
            </span>
            <img
              src={logoImg}
              alt="Sprout"
              style={{ width: 52, height: 52, objectFit: "contain" }}
            />
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: 20,
              fontWeight: 700,
              margin: "0 0 6px",
            }}
          >
            Welcome to Sprout
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0 }}>
            Are you a Learner or a Teacher?
          </p>
        </div>

        {/* Options */}
        <div
          style={{
            padding: "28px 32px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          <RoleButton
            icon={<BookOpen size={26} color={C.navy} />}
            label="I'm a Learner"
            description="Explore courses, simulations, and build financial skills."
            loading={selecting === "learner"}
            onClick={() => handleSelect("learner")}
            accent={C.navy}
            accentSoft="#EEF2FF"
          />
          <RoleButton
            icon={<GraduationCap size={26} color={C.green} />}
            label="I'm a Teacher"
            description="Guide students, track class progress, and manage content."
            loading={selecting === "teacher"}
            onClick={() => handleSelect("teacher")}
            accent={C.green}
            accentSoft={C.greenSoft}
          />
          <p
            style={{
              textAlign: "center",
              fontSize: 12,
              color: C.textSub,
              margin: "8px 0 0",
            }}
          >
            You can change this later in Account Settings.
          </p>
        </div>
      </div>
    </div>
  );
}

function RoleButton({ icon, label, description, onClick, loading, accent, accentSoft }) {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      disabled={!!loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        padding: "18px 20px",
        borderRadius: 14,
        border: `2px solid ${hovered ? accent : "#E5E7EB"}`,
        background: hovered ? accentSoft : "#F8FAFC",
        cursor: loading ? "wait" : "pointer",
        textAlign: "left",
        transition: "all 0.15s",
        width: "100%",
        opacity: loading ? 0.7 : 1,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 12,
          background: "#fff",
          border: `1px solid ${hovered ? accent : "#E5E7EB"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          transition: "all 0.15s",
        }}
      >
        {icon}
      </div>
      <div>
        <div
          style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 3 }}
        >
          {label}
        </div>
        <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.4 }}>
          {description}
        </div>
      </div>
    </button>
  );
}