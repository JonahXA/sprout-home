import React from "react";
import { GraduationCap } from "lucide-react";

const C = {
  navy:"#1B2B5E",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
  bg:"#FFFFFF", bgMid:"#F1F5F9", border:"#E5E7EB",
};

export default function Modules() {
  return (
    <div style={{ minHeight:"60vh", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>

      {/* Page header */}
      <div style={{ marginBottom:48 }}>
        <h1 style={{ fontSize:34, fontWeight:900, color:C.text, letterSpacing:"-1px", margin:"0 0 6px" }}>Modules</h1>
        <p style={{ fontSize:15, color:C.textSub, fontWeight:500, margin:0 }}>
          Curated collections of courses and simulations. Complete a full module to earn a certificate.
        </p>
      </div>

      {/* Coming soon placeholder */}
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"80px 24px", gap:16, borderRadius:20, border:`1px dashed ${C.border}`, background:C.bgMid }}>
        <div style={{ width:72, height:72, borderRadius:20, background:C.navy, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <GraduationCap size={34} color="#fff" />
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:C.text, margin:0, letterSpacing:"-0.5px" }}>Coming Soon</h2>
        <p style={{ fontSize:14, color:C.textSub, margin:0, textAlign:"center", maxWidth:400, lineHeight:1.6 }}>
          Modules are curated learning paths combining courses and simulations into a structured experience. Complete a module to earn a shareable certificate.
        </p>
      </div>
    </div>
  );
}
