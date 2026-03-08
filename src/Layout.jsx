import React from "react";
import { createPageUrl } from "@/utils";

const noLayoutPages = new Set([
  "login", "signup", "forgotpassword", "schoolselection", "welcome",
]);

export default function Layout({ children, currentPageName }) {
  if (noLayoutPages.has(String(currentPageName || "").toLowerCase())) {
    return (
      <div style={{ minHeight: "100vh", background: "#F6F8FA" }}>
        {children}
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#FFFFFF" }}>
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 32px 80px" }}>
        {children}
      </main>
    </div>
  );
}