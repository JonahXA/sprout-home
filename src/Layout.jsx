import React from "react";
import { useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";

const noLayoutPages = new Set([
  "login", "signup", "forgotpassword", "schoolselection", "welcome",
]);

export default function Layout({ children, currentPageName }) {
  if (noLayoutPages.has(String(currentPageName || "").toLowerCase())) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-lime-50 via-white to-green-50">
        {children}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb" }}>
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 28px 80px" }}>
        {children}
      </main>
    </div>
  );
}