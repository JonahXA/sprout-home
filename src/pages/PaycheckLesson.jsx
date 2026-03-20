import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, DollarSign } from "lucide-react";
import PaycheckStatement from "../components/PaycheckStatement";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accentSoft:"#E8F0FE", bg:"#FFFFFF", border:"#E5E7EB",
 text:"#0F172A", textSub:"#475569",
};

export default function PaycheckLesson() {
 const navigate = useNavigate();

 return (
 <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
 <div style={{ maxWidth:960, margin:"0 auto", display:"flex", flexDirection:"column", gap:24 }}>
 <button
 onClick={() => navigate(createPageUrl("Learn"))}
 style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer", width:"fit-content" }}
 >
 <ArrowLeft size={16} />
 Back to Courses
 </button>

 <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
 <div style={{ width:64, height:64, background:C.navy, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 8px 24px ${C.navyGlow}` }}>
 <DollarSign size={32} color="#fff" />
 </div>
 <h1 style={{ fontSize:36, fontWeight:900, color:C.text, letterSpacing:"-1px", margin:0 }}>
 Understanding Your First Paycheck
 </h1>
 <p style={{ fontSize:16, color:C.textSub, maxWidth:640, margin:0 }}>
 Ever wonder why your paycheck is smaller than expected? We'll break down every deduction
 so you understand exactly where your money goes—and why it matters.
 </p>
 </div>

 <PaycheckStatement />

 <div style={{ background:C.accentSoft, borderLeft:`4px solid ${C.navy}`, padding:24, borderRadius:"0 12px 12px 0" }}>
 <h3 style={{ fontWeight:800, fontSize:16, color:C.text, margin:"0 0 10px" }}>What You Just Learned</h3>
 <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:8 }}>
 {[
 "The difference between gross pay and net pay",
 "What federal and state taxes fund",
 "How Social Security and Medicare work",
 "Why pre-tax deductions save you money",
 "How to budget based on take-home pay",
 ].map((item) => (
 <li key={item} style={{ color:C.textSub, fontSize:14 }}>• <strong style={{ color:C.text }}>{item}</strong></li>
 ))}
 </ul>
 </div>

 <div style={{ textAlign:"center" }}>
 <button
 onClick={() => navigate(createPageUrl("PaycheckQuiz"))}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:999, background:C.navy, color:"#fff", fontSize:16, fontWeight:700, border:"none", cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}
 >
 Test Your Knowledge →
 </button>
 </div>
 </div>
 </div>
 );
}