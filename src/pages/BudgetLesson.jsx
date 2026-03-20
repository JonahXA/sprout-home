import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, TrendingUp, PiggyBank, Target } from "lucide-react";
import BudgetWalkthrough from "@/components/BudgetWalkthrough";

const C = {
  navy:"#1F3A64", navyLight:"#264D82", navyGlow:"rgba(31,58,100,0.12)",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", border:"#E5E7EB",
  text:"#0F172A", textSub:"#475569",
};

export default function BudgetLesson() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth:960, margin:"0 auto", display:"flex", flexDirection:"column", gap:24 }}>
        {/* Back Button */}
        <button
          onClick={() => navigate(createPageUrl("Learn"))}
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer", width:"fit-content" }}
        >
          <ArrowLeft size={16} />
          Back to Courses
        </button>

        {/* Header */}
        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <div style={{ display:"inline-flex", padding:16, background:C.navy, borderRadius:20, boxShadow:`0 8px 24px ${C.navyGlow}`, marginBottom:8 }}>
            <PiggyBank size={48} color="#fff" />
          </div>
          <h1 style={{ fontSize:40, fontWeight:900, color:C.text, letterSpacing:"-1px", margin:0 }}>
            Build Your First Real Budget
          </h1>
          <p style={{ fontSize:17, color:C.textSub, maxWidth:560, margin:0 }}>
            Step-by-step walkthrough of a real budget spreadsheet. Learn where your money goes and how to take control.
          </p>
        </div>

        {/* Interactive Walkthrough */}
        <BudgetWalkthrough />

        {/* Summary */}
        <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:20, padding:32, color:"#fff", boxShadow:`0 8px 32px ${C.navyGlow}` }}>
          <h2 style={{ fontSize:22, fontWeight:800, margin:"0 0 20px" }}>What You've Learned</h2>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:24 }}>
            {[
              { Icon: Target, title:"Budget Structure", desc:"How to organize expenses by month and category" },
              { Icon: TrendingUp, title:"Fixed vs Variable", desc:"The difference and why it matters" },
              { Icon: PiggyBank, title:"Real Savings", desc:"How to calculate and grow what's left over" },
            ].map(({ Icon, title, desc }) => (
              <div key={title} style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                <Icon size={22} style={{ flexShrink:0, marginTop:2 }} />
                <div>
                  <div style={{ fontWeight:700, marginBottom:4 }}>{title}</div>
                  <div style={{ fontSize:13, opacity:0.85 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ background:C.bg, borderRadius:20, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", padding:40, textAlign:"center" }}>
          <h3 style={{ fontSize:22, fontWeight:800, color:C.text, margin:"0 0 10px" }}>Ready to Test Your Knowledge?</h3>
          <p style={{ fontSize:15, color:C.textSub, marginBottom:24 }}>
            Take the interactive quiz to analyze real budget scenarios and make smart financial decisions!
          </p>
          <button
            onClick={() => navigate(createPageUrl("BudgetQuiz"))}
            style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:999, background:C.navy, color:"#fff", fontSize:16, fontWeight:700, border:"none", cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}
          >
            Take the Quiz
            <ArrowLeft size={18} style={{ transform:"rotate(180deg)" }} />
          </button>
        </div>
      </div>
    </div>
  );
}
