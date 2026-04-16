import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { GraduationCap, BookOpen } from "lucide-react";

const STORAGE_KEY = "userRole";

// Hook — use this anywhere you need to read or reset the role
export function useUserRole() {
  const [role, setRole] = useState(() => localStorage.getItem(STORAGE_KEY));

  const resetRole = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
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
  const [visible, setVisible] = useState(() => !localStorage.getItem(STORAGE_KEY));
  const [selecting, setSelecting] = useState(null);

  if (!visible) return null;

  const handleSelect = (role) => {
    setSelecting(role);
    localStorage.setItem(STORAGE_KEY, role);
    setVisible(false);
    if (role === "teacher") {
      navigate(createPageUrl("Landing"));
    } else {
      navigate(createPageUrl("Dashboard"));
    }
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
        {/* Header */}
        <div
          style={{
            background: C.navy,
            padding: "28px 32px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "rgba(255,255,255,0.15)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
            }}
          >
            <BookOpen size={28} color="#fff" />
          </div>
          <h2
            style={{
              color: "#fff",
              fontSize: 22,
              fontWeight: 800,
              margin: "0 0 6px",
            }}
          >
            Welcome to Sprout
          </h2>
          <p style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, margin: 0 }}>
            How are you using Sprout today?
          </p>
        </div>

        {/* Options */}
        <div style={{ padding: "28px 32px 32px", display: "flex", flexDirection: "column", gap: 14 }}>
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
          background: hovered ? "#fff" : "#fff",
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
        <div style={{ fontWeight: 700, fontSize: 15, color: "#0F172A", marginBottom: 3 }}>
          {label}
        </div>
        <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.4 }}>{description}</div>
      </div>
    </button>
  );
}
