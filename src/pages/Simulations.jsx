import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { Calculator, TrendingUp, Briefcase, Users, Home, GraduationCap, Wallet, Award } from "lucide-react";
import InterestCalculator from "@/features/finance/InterestCalculator";
import PaperTradingSimulator from "@/features/finance/PaperTradingSimulator";
import BuildYourBudget from "@/features/finance/BuildYourBudget";
import ScenarioBudgetSimulation from "@/features/finance/ScenarioBudgetSimulation";
import NewGraduateBudgetSimulation from "@/features/finance/NewGraduateBudgetSimulation";
import CollegeStudentBudget from "@/features/finance/CollegeStudentBudget";

const safeParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const getLocalUser = () => safeParse(localStorage.getItem("sprout_user"), null);

const C = {
 navy:"#1B2B5E", navyMid:"#141E43",
 text:"#0F172A", textSub:"#475569",
 bg:"#FFFFFF", bgMid:"#F1F5F9", border:"#E5E7EB", borderMid:"#D1D5DB",
 navyGlow:"rgba(27,43,94,0.12)",
};

const NICHES = {
 Finance: { color:"#2D9B6F", softBg:"#E6F5EF", label:"Finance" },
 "AI & Technology": { color:"#7C3AED", softBg:"#F3F0FF", label:"AI & Technology" },
 Entrepreneurship: { color:"#F97316", softBg:"#FFF0E6", label:"Entrepreneurship" },
 "Critical Thinking": { color:"#0891B2", softBg:"#E0F5FA", label:"Critical Thinking" },
};

const NICHE_ORDER = ["Finance", "AI & Technology", "Entrepreneurship", "Critical Thinking"];

export default function Simulations() {
 const navigate = useNavigate();
 const [activeSimulation, setActiveSimulation] = useState(null);

 const simulations = [
 {
 id:"budget-basics",
 title:"Build Your Budget",
 description:"Learn the fundamentals of budgeting with an interactive walkthrough of a real budget sheet.",
 icon:Wallet,
 niche:"Finance",
 component:BuildYourBudget,
 },
 {
 id:"college-budget",
 title:"College Student Budget",
 description:"Navigate variable income and irregular expenses. Spread textbook costs without going negative.",
 icon:GraduationCap,
 niche:"Finance",
 component:CollegeStudentBudget,
 },
 {
 id:"first-job-budget",
 title:"New Graduate Budget",
 description:"First full-time job, first real budget. Build an emergency fund while managing debt.",
 icon:Briefcase,
 niche:"Finance",
 component:NewGraduateBudgetSimulation,
 },
 {
 id:"dual-income-budget",
 title:"Early Career Dual Income",
 description:"Two incomes, one budget. Save for a down payment while balancing lifestyle and future.",
 icon:Users,
 niche:"Finance",
 component:() => <ScenarioBudgetSimulation scenarioId={2} />,
 },
 {
 id:"family-budget",
 title:"Mid-Career Family Budget",
 description:"Two kids, two incomes. Add expenses without sacrificing retirement savings.",
 icon:Home,
 niche:"Finance",
 component:() => <ScenarioBudgetSimulation scenarioId={3} />,
 },
 {
 id:"paper-trading",
 title:"Paper Trading",
 description:"Practice investing with virtual money. Trade real stocks and indexes with live market data.",
 icon:TrendingUp,
 niche:"Finance",
 component:PaperTradingSimulator,
 },
 {
 id:"investment-calculator",
 title:"Investment Growth Calculator",
 description:"Visualize how your investments grow over time with compound interest and adjustable contributions.",
 icon:Calculator,
 niche:"Finance",
 component:InterestCalculator,
 },
 ];

 const simsByNiche = {};
 simulations.forEach((sim) => {
 if (!simsByNiche[sim.niche]) simsByNiche[sim.niche] = [];
 simsByNiche[sim.niche].push(sim);
 });

 const handleLaunch = (sim, e) => {
 e.stopPropagation();
 setActiveSimulation(sim);
 };

 if (activeSimulation) {
 const Simulation = activeSimulation.component;
 return (
 <div style={{ fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif" }}>
 <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
 <div style={{ marginBottom:24 }}>
 <button
 onClick={() => setActiveSimulation(null)}
 style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s ease" }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.boxShadow = `0 4px 12px ${C.navyGlow}`; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
 >&#8592; Back to Simulations</button>
 </div>
 <Simulation />
 </div>
 );
 }

 return (
 <div style={{ fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif" }}>
 <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>

 {/* Header */}
 <div style={{ marginBottom:32 }}>
 <h1 style={{ fontSize:34, fontWeight:900, color:C.text, margin:0, letterSpacing:"-1px", lineHeight:1.1 }}>Simulations</h1>
 <p style={{ fontSize:15, color:C.textSub, margin:"8px 0 0", fontWeight:500, lineHeight:1.5 }}>Interactive modules to practice real-world decisions — no risk, all learning.</p>
 </div>

 {/* Niche sections */}
 <div style={{ display:"flex", flexDirection:"column", gap:36 }}>
 {NICHE_ORDER.map((nicheName) => {
 const nicheSims = simsByNiche[nicheName];
 if (!nicheSims || nicheSims.length === 0) return null;
 const niche = NICHES[nicheName];
 return (
 <div key={nicheName}>
 {/* Section header */}
 <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
 <div style={{ width:4, height:28, borderRadius:999, background:niche.color, flexShrink:0 }} />
 <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:0, letterSpacing:"-0.5px" }}>{niche.label}</h2>
 <span style={{ fontSize:12, fontWeight:700, color:niche.color, background:niche.softBg, borderRadius:999, padding:"3px 10px" }}>
 {nicheSims.length} {nicheSims.length === 1 ? "simulation" : "simulations"}
 </span>
 </div>

 {/* Simulation grid */}
 <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }} className="sim-grid">
 {nicheSims.map((sim) => {
 const Icon = sim.icon;
 return (
 <div key={sim.id}
 style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:16, overflow:"hidden", display:"flex", flexDirection:"column", boxShadow:"0 1px 4px rgba(0,0,0,0.05)", transition:"all 0.22s" }}
 onMouseEnter={(e) => { e.currentTarget.style.boxShadow = `0 10px 36px ${C.navyGlow}`; e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.transform = "translateY(-3px)"; }}
 onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor = C.border; e.currentTarget.style.transform = "none"; }}
 >
 {/* Thumbnail */}
 <div style={{ height:112, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:niche.softBg, borderBottom:`1px solid ${C.border}`, position:"relative" }}>
 <div style={{ width:54, height:54, borderRadius:15, background:"rgba(255,255,255,0.72)", display:"flex", alignItems:"center", justifyContent:"center", color:niche.color }}>
 <Icon size={26} />
 </div>
 {/* Niche tag */}
 <div style={{ position:"absolute", top:10, left:10, background:niche.softBg, border:`1px solid ${niche.color}`, borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:700, color:niche.color }}>
 {niche.label}
 </div>
 </div>

 {/* Body */}
 <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", flex:1 }}>
 <p style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:6, letterSpacing:"-0.3px", lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{sim.title}</p>
 <p style={{ fontSize:12, color:C.textSub, lineHeight:1.6, flex:1, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden", marginBottom:10, fontWeight:400 }}>{sim.description}</p>
 <div style={{ display:"flex", alignItems:"center", fontSize:11, color:C.textMuted, marginBottom:10 }}>
 <span style={{ display:"flex", alignItems:"center", gap:4, color:niche.color, fontWeight:700 }}><Award size={12} />Certificate</span>
 </div>
 <button
 onClick={(e) => handleLaunch(sim, e)}
 style={{ width:"100%", height:44, borderRadius:999, background:C.navy, color:"#fff", fontSize:14, fontWeight:700, border:"none", cursor:"pointer", transition:"all 0.15s ease", flexShrink:0, letterSpacing:"-0.1px" }}
 onMouseEnter={(e) => { e.currentTarget.style.background = C.navyMid; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${C.navyGlow}`; }}
 onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
 >Launch</button>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 );
 })}
 </div>
 <style>{`@media (max-width:1100px){.sim-grid{grid-template-columns:repeat(3,1fr)!important;}} @media (max-width:780px){.sim-grid{grid-template-columns:repeat(2,1fr)!important;}} @media (max-width:480px){.sim-grid{grid-template-columns:1fr!important;}}`}</style>
 </div>
 );
}
