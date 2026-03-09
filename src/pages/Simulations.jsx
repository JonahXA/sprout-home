import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Calculator, TrendingUp, Briefcase, Users, Home, GraduationCap, Wallet } from "lucide-react";
import InterestCalculator from "@/components/InterestCalculator";
import PaperTradingSimulator from "@/components/PaperTradingSimulator";
import BudgetWalkthrough from "@/components/BudgetWalkthrough";
import ScenarioBudgetSimulation from "@/components/ScenarioBudgetSimulation";

const safeParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const getLocalUser = () => safeParse(localStorage.getItem("sprout_user"), null);

const C = {
  navy:"#1F3A64", navyMid:"#172E52",
  text:"#0F172A", textSub:"#475569",
  bg:"#FFFFFF", border:"#E5E7EB", borderMid:"#D1D5DB",
  navyGlow:"rgba(31,58,100,0.12)",
};

export default function Simulations() {
  const navigate = useNavigate();
  const [activeSimulation, setActiveSimulation] = useState(null);

  const simulations = [
    { id:"budget-basics",         title:"Build Your First Budget",        description:"Learn the fundamentals of budgeting with an interactive walkthrough of a real budget sheet.",         icon:Wallet,       thumb:{ bg:"#FFF3E0", color:"#F59E0B" }, component:BudgetWalkthrough },
    { id:"college-budget",        title:"College Student Budget",         description:"Navigate variable income and irregular expenses. Spread textbook costs without going negative.",         icon:GraduationCap,thumb:{ bg:"#E8F0FE", color:"#3B82F6" }, component:() => <ScenarioBudgetSimulation scenarioId={0} /> },
    { id:"first-job-budget",      title:"New Graduate Budget",            description:"First full-time job, first real budget. Build an emergency fund while managing debt.",                   icon:Briefcase,    thumb:{ bg:"#F2ECFF", color:"#8B5CF6" }, component:() => <ScenarioBudgetSimulation scenarioId={1} /> },
    { id:"dual-income-budget",    title:"Early Career Dual Income",       description:"Two incomes, one budget. Save for a down payment while balancing lifestyle and future.",                 icon:Users,        thumb:{ bg:"#E8F0FE", color:"#3B82F6" }, component:() => <ScenarioBudgetSimulation scenarioId={2} /> },
    { id:"family-budget",         title:"Mid-Career Family Budget",       description:"Two kids, two incomes. Add expenses without sacrificing retirement savings.",                             icon:Home,         thumb:{ bg:"#FFF3E0", color:"#F59E0B" }, component:() => <ScenarioBudgetSimulation scenarioId={3} /> },
    { id:"paper-trading",         title:"Paper Trading",                  description:"Practice investing with virtual money. Trade real stocks and indexes with live market data.",             icon:TrendingUp,   thumb:{ bg:"#E8F8F0", color:"#22C55E" }, component:PaperTradingSimulator },
    { id:"investment-calculator", title:"Investment Growth Calculator",   description:"Visualize how your investments grow over time with compound interest and adjustable contributions.",     icon:Calculator,   thumb:{ bg:"#E8F0FE", color:"#3B82F6" }, component:InterestCalculator },
  ];

  // Gate: only redirect on Launch, not on page visit
  const handleLaunch = (sim, e) => {
    e.stopPropagation();
    const user = getLocalUser();
    if (!user) { navigate(createPageUrl("Login")); return; }
    setActiveSimulation(sim);
  };

  if (activeSimulation) {
    const Simulation = activeSimulation.component;
    return (
      <div className="min-h-screen bg-white p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Button variant="outline" onClick={() => setActiveSimulation(null)}>&larr; Back to Simulations</Button>
          <Simulation />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">Simulations</h1>
          <p className="text-gray-500 mt-2">Interactive modules to practice real-world decisions — no risk, all learning.</p>
        </div>

        {/* Uniform grid — each card uses flex-col so all content stretches identically */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {simulations.map((sim) => {
            const Icon = sim.icon;
            return (
              <div key={sim.id}
                style={{
                  background:C.bg,
                  border:`1px solid ${C.border}`,
                  borderRadius:16,
                  overflow:"hidden",
                  display:"flex",
                  flexDirection:"column",
                  boxShadow:"0 1px 4px rgba(0,0,0,0.05)",
                  transition:"all 0.22s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 10px 36px ${C.navyGlow}`; e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}
              >
                {/* Thumbnail — fixed height */}
                <div style={{ height:112, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:sim.thumb.bg, borderBottom:`1px solid ${C.border}` }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.72)", display:"flex", alignItems:"center", justifyContent:"center", color:sim.thumb.color }}>
                    <Icon size={26} />
                  </div>
                </div>

                {/* Body — flex-col so description fills space and button stays at bottom */}
                <div style={{ padding:"20px 20px 20px", display:"flex", flexDirection:"column", flex:1 }}>
                  <p style={{ fontSize:15, fontWeight:700, color:C.text, marginBottom:10, letterSpacing:"-0.3px", lineHeight:1.35 }}>{sim.title}</p>
                  {/* Description fixed height so all cards align at button */}
                  <p style={{ fontSize:13, color:"#475569", lineHeight:1.6, flex:1, minHeight:60, marginBottom:20 }}>{sim.description}</p>
                  <button
                    onClick={(e) => handleLaunch(sim, e)}
                    style={{ width:"100%", height:42, borderRadius:10, background:C.navy, color:"#fff", fontSize:14, fontWeight:600, border:"none", cursor:"pointer", transition:"background 0.15s", flexShrink:0 }}
                    onMouseEnter={(e) => e.currentTarget.style.background = C.navyMid}
                    onMouseLeave={(e) => e.currentTarget.style.background = C.navy}
                  >Launch</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}