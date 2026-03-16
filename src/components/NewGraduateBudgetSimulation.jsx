import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  CheckCircle2, AlertCircle, TrendingUp, TrendingDown, GraduationCap,
  Home, Zap, ShoppingBag, Shield, CreditCard, RefreshCw, Coffee,
  Package, Target, Activity, BookOpen, ChevronDown, ChevronUp,
  Plus, Minus, RotateCcw, DollarSign, Navigation, Lightbulb,
  AlertTriangle, ArrowRight, BarChart2, Briefcase
} from "lucide-react";

// ─── Tokens ──────────────────────────────────────────────────────────────────
const C = {
  navy:"#1F3A64", navyMid:"#172E52", navyLight:"#2A4A7F",
  accent:"#3B82F6", accentSoft:"#EFF6FF", accentMid:"#DBEAFE",
  green:"#16A34A", greenSoft:"#F0FDF4", greenMid:"#DCFCE7",
  amber:"#D97706", amberSoft:"#FFFBEB", amberMid:"#FEF3C7",
  red:"#DC2626", redSoft:"#FEF2F2", redMid:"#FECACA",
  purple:"#7C3AED", purpleSoft:"#F5F3FF",
  teal:"#0D9488", tealSoft:"#F0FDFA",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E2E8F0", borderMid:"#CBD5E1",
  shadow:"0 1px 3px rgba(0,0,0,0.07)",
  shadowMd:"0 4px 16px rgba(0,0,0,0.07)",
  shadowLg:"0 12px 40px rgba(31,58,100,0.12)",
};

const MONTHLY_INCOME = 5000;
const ANNUAL_SALARY = 60000;

// ─── Category Config ──────────────────────────────────────────────────────────
const CATS = [
  { key:"housing",      label:"Housing",               icon:Home,        max:3000, step:50,  benchmark:0.30, group:"needs",   desc:"Rent or mortgage payment" },
  { key:"utilities",    label:"Utilities",              icon:Zap,         max:400,  step:10,  benchmark:0.04, group:"needs",   desc:"Electric, gas, internet" },
  { key:"groceries",    label:"Groceries",              icon:ShoppingBag, max:700,  step:10,  benchmark:0.07, group:"needs",   desc:"Food and household basics" },
  { key:"transportation",label:"Transportation",        icon:Navigation,  max:600,  step:10,  benchmark:0.08, group:"needs",   desc:"Car, gas, transit, rideshare" },
  { key:"insurance",    label:"Insurance",              icon:Shield,      max:400,  step:10,  benchmark:0.04, group:"needs",   desc:"Health, auto, renters" },
  { key:"debtPayments", label:"Debt Payments",          icon:CreditCard,  max:800,  step:25,  benchmark:0.10, group:"needs",   desc:"Student loans and credit cards" },
  { key:"subscriptions",label:"Subscriptions",          icon:RefreshCw,   max:200,  step:5,   benchmark:0.02, group:"wants",   desc:"Streaming, apps, memberships" },
  { key:"dining",       label:"Dining & Entertainment", icon:Coffee,      max:600,  step:10,  benchmark:0.05, group:"wants",   desc:"Restaurants, bars, events" },
  { key:"misc",         label:"Miscellaneous",          icon:Package,     max:500,  step:10,  benchmark:0.04, group:"wants",   desc:"Clothing, personal care, other" },
  { key:"retirement",   label:"Retirement",             icon:TrendingUp,  max:1000, step:25,  benchmark:0.10, group:"savings", desc:"401k or IRA contributions" },
  { key:"emergency",    label:"Emergency Savings",      icon:Shield,      max:1000, step:25,  benchmark:0.08, group:"savings", desc:"Building your safety net" },
];

const BASE = {
  housing:1600, utilities:160, groceries:350, transportation:220,
  insurance:180, debtPayments:350, subscriptions:45, dining:250,
  misc:150, retirement:300, emergency:250,
};

const TRADEOFFS = [
  { id:"roommate",   label:"Get a Roommate",         desc:"Split rent, reducing housing costs significantly", delta:{ housing:-600 },             icon:Home },
  { id:"transit",    label:"Switch to Public Transit",desc:"Sell your car and use transit full-time",         delta:{ transportation:-120 },       icon:Navigation },
  { id:"cooking",    label:"Cook at Home More",       desc:"Reduce dining out 4 nights per week",             delta:{ dining:-100 },               icon:Coffee },
  { id:"cutSubs",    label:"Cut Subscriptions",       desc:"Cancel all non-essential streaming and apps",     delta:{ subscriptions:-30 },         icon:RefreshCw },
  { id:"refinance",  label:"Refinance Student Loans", desc:"Lower rate reduces monthly debt obligations",     delta:{ debtPayments:-75 },          icon:CreditCard },
  { id:"boostRetire",label:"Boost Retirement 2%",     desc:"Add $100/month; redirect from misc spending",    delta:{ retirement:100, misc:-100 },  icon:TrendingUp },
];

const STRESS_EVENTS = [
  { id:"carRepair",   label:"Surprise Car Repair",   desc:"$800 repair bill hits this month",          type:"one-time",   impact:-800,  icon:AlertTriangle },
  { id:"medical",     label:"Unexpected Medical Bill",desc:"$500 bill after an ER visit",               type:"one-time",   impact:-500,  icon:AlertTriangle },
  { id:"rentHike",    label:"Rent Increase",          desc:"Landlord raises rent by $150/month",        type:"recurring",  delta:{ housing:150 }, icon:Home },
  { id:"bonus",       label:"Year-End Bonus",         desc:"Received a $2,000 performance bonus",       type:"one-time",   impact:2000,  icon:TrendingUp },
  { id:"cutHours",    label:"Reduced Work Hours",     desc:"Income drops $400/month for 3 months",      type:"recurring",  incomeImpact:-400, icon:TrendingDown },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v);
const fmtShort = (v) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${Math.round(Math.abs(v))}`;
const pct = (a,b) => b===0?0:Math.round((a/b)*100);

function calcTotals(budget, incomeOverride) {
  const income = incomeOverride ?? MONTHLY_INCOME;
  const total = Object.values(budget).reduce((s,v) => s+v, 0);
  const margin = income - total;
  const savingsRate = income > 0 ? ((budget.retirement + budget.emergency) / income) * 100 : 0;
  const housingRatio = income > 0 ? (budget.housing / income) * 100 : 0;
  const debtRatio = income > 0 ? (budget.debtPayments / income) * 100 : 0;
  const discretionary = budget.dining + budget.subscriptions + budget.misc;
  return { income, total, margin, savingsRate, housingRatio, debtRatio, discretionary };
}

function calcHealth(budget, t) {
  let score = 0;
  // Margin: 25 pts
  if (t.margin >= 0) score += 25;
  else score += Math.max(0, 25 + t.margin / 20);
  // Savings rate: 20 pts
  score += Math.min(20, t.savingsRate * 1.3);
  // Emergency target ($450+): 15 pts
  if (budget.emergency >= 450) score += 15;
  else score += Math.round((budget.emergency / 450) * 15);
  // Retirement: 15 pts
  if (budget.retirement >= 300) score += 15;
  else score += Math.round((budget.retirement / 300) * 15);
  // Housing ratio: 15 pts
  if (t.housingRatio <= 30) score += 15;
  else if (t.housingRatio <= 38) score += Math.round((1 - (t.housingRatio-30)/20) * 15);
  // Debt ratio: 10 pts
  if (t.debtRatio <= 15) score += 10;
  else score += Math.max(0, Math.round((1 - (t.debtRatio-15)/20) * 10));
  return Math.round(Math.min(100, Math.max(0, score)));
}

function calcInsights(budget, t, score) {
  const insights = [];
  if (t.margin < 0) {
    insights.push({ level:"red", text:`Your budget runs a deficit of ${fmt(Math.abs(t.margin))}/month. This is not sustainable — you need to cut ${fmt(Math.abs(t.margin))} somewhere.` });
  } else if (t.margin < 100) {
    insights.push({ level:"amber", text:`Your monthly margin is only ${fmt(t.margin)}, leaving very little cushion for unexpected expenses.` });
  }
  if (t.housingRatio > 35) {
    insights.push({ level:"amber", text:`Housing takes up ${t.housingRatio.toFixed(0)}% of your take-home pay. The general guideline is under 30%. Consider a roommate or lower-cost area.` });
  }
  if (budget.emergency < 250) {
    insights.push({ level:"amber", text:`Your emergency fund contribution of ${fmt(budget.emergency)}/month is low. Financial advisors recommend building 3–6 months of expenses as a safety net.` });
  } else if (budget.emergency >= 450) {
    insights.push({ level:"green", text:`Emergency savings of ${fmt(budget.emergency)}/month puts you on track to reach a $5,000 safety net in about ${Math.ceil(5000/(budget.emergency))} months. Strong move.` });
  }
  if (budget.retirement < 150) {
    insights.push({ level:"amber", text:`Your retirement contribution is low. Starting early matters more than the amount — even adding $50/month now will compound significantly over 40 years.` });
  } else if (budget.retirement >= 300) {
    insights.push({ level:"green", text:`Contributing ${fmt(budget.retirement)}/month to retirement at 22 is a strong start. Over 40 years at 7% return, this alone could grow to over ${fmtShort(budget.retirement * 12 * ((Math.pow(1.07,40)-1)/0.07))}.` });
  }
  if (budget.dining > 350) {
    insights.push({ level:"amber", text:`Dining and entertainment at ${fmt(budget.dining)}/month is ${pct(budget.dining, t.income)}% of your income. Reducing by $100/month adds $1,200 to your annual savings.` });
  }
  if (t.savingsRate >= 15 && t.margin >= 0) {
    insights.push({ level:"green", text:`A savings rate of ${t.savingsRate.toFixed(1)}% at this stage of your career is impressive. You are setting yourself up for strong long-term financial health.` });
  }
  if (t.debtRatio > 15) {
    insights.push({ level:"amber", text:`Debt payments represent ${t.debtRatio.toFixed(0)}% of take-home pay. Look into income-driven repayment options or refinancing to lower your rate.` });
  }
  if (insights.length === 0) {
    insights.push({ level:"green", text:`Your budget is well-balanced across needs, wants, and savings. You are making smart financial decisions for someone just starting out.` });
  }
  return insights.slice(0, 4);
}

function calcProjections(budget, t) {
  const annualSavings = (budget.retirement + budget.emergency + Math.max(0, t.margin)) * 12;
  const emergencyMonths = budget.emergency > 0 ? Math.ceil(5000 / budget.emergency) : null;
  const retirementAt7pct = (yrs) => budget.retirement * 12 * ((Math.pow(1.07, yrs) - 1) / 0.07);
  const annualDiscretionary = budget.dining * 12 + budget.subscriptions * 12 + budget.misc * 12;
  const annualDebt = budget.debtPayments * 12;
  return { annualSavings, emergencyMonths, retirementAt7pct, annualDiscretionary, annualDebt };
}

// ─── Sub-Components ───────────────────────────────────────────────────────────
function StatPill({ label, value, color, bg }) {
  return (
    <div style={{ display:"flex",flexDirection:"column",gap:2 }}>
      <span style={{ fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.45)",textTransform:"uppercase",letterSpacing:"0.08em" }}>{label}</span>
      <span style={{ fontSize:20,fontWeight:800,color:color||"#fff",letterSpacing:"-0.4px" }}>{value}</span>
    </div>
  );
}

function MetricCard({ label, value, sub, color, bg, icon:Icon }) {
  return (
    <div style={{ background:bg||C.bgSoft,border:`1px solid ${C.border}`,borderRadius:12,padding:"16px 18px",display:"flex",flexDirection:"column",gap:5 }}>
      {Icon && <div style={{ width:30,height:30,borderRadius:8,background:color?color+"1A":C.bgMid,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:2 }}><Icon size={14} color={color||C.textMuted} /></div>}
      <span style={{ fontSize:10,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.07em" }}>{label}</span>
      <span style={{ fontSize:22,fontWeight:800,color:color||C.text,letterSpacing:"-0.5px",lineHeight:1 }}>{value}</span>
      {sub && <span style={{ fontSize:11,color:C.textSub,lineHeight:1.4 }}>{sub}</span>}
    </div>
  );
}

function HealthMeter({ score }) {
  const color = score>=75?C.green:score>=50?C.amber:C.red;
  const label = score>=75?"Strong":score>=50?"Solid":"Needs Work";
  const radius = 44, circ = 2*Math.PI*radius;
  const dash = (score/100)*circ;
  return (
    <div style={{ display:"flex",alignItems:"center",gap:20 }}>
      <div style={{ position:"relative",width:100,height:100,flexShrink:0 }}>
        <svg width="100" height="100" style={{ transform:"rotate(-90deg)" }}>
          <circle cx="50" cy="50" r={radius} fill="none" stroke={C.bgMid} strokeWidth="8" />
          <circle cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
            strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
            style={{ transition:"stroke-dasharray 0.6s ease" }} />
        </svg>
        <div style={{ position:"absolute",inset:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center" }}>
          <span style={{ fontSize:22,fontWeight:800,color,letterSpacing:"-0.5px",lineHeight:1 }}>{score}</span>
          <span style={{ fontSize:9,fontWeight:700,color:C.textMuted,textTransform:"uppercase",letterSpacing:"0.06em" }}>/ 100</span>
        </div>
      </div>
      <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
        <div>
          <div style={{ fontSize:16,fontWeight:800,color,letterSpacing:"-0.3px" }}>{label}</div>
          <div style={{ fontSize:12,color:C.textSub,marginTop:2 }}>Budget health score</div>
        </div>
        {[
          { label:"Positive margin", met:true, check:(s,b,t) => t.margin >= 0 },
          { label:"Savings rate > 10%", met:true, check:(s,b,t) => t.savingsRate >= 10 },
          { label:"Emergency on track", met:true, check:(s,b,t) => b.emergency >= 250 },
          { label:"Retirement active", met:true, check:(s,b,t) => b.retirement >= 100 },
        ].map((item,i) => (
          <div key={i} style={{ display:"flex",alignItems:"center",gap:6 }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:score>=(i+1)*20?C.green:C.border,transition:"background 0.3s",flexShrink:0 }} />
            <span style={{ fontSize:11,color:score>=(i+1)*20?C.textSub:C.textMuted }}>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CategoryCard({ cat, value, income, onChange }) {
  const ratio = income > 0 ? value/income : 0;
  const isSavings = cat.group === "savings";
  const status = isSavings
    ? ratio >= cat.benchmark ? "good" : ratio >= cat.benchmark*0.5 ? "watch" : "low"
    : ratio <= cat.benchmark ? "good" : ratio <= cat.benchmark*1.3 ? "watch" : "high";
  const statusColors = {
    good:{ dot:C.green, bg:C.greenSoft, text:C.green, label:"On track" },
    watch:{ dot:C.amber, bg:C.amberSoft, text:C.amber, label:isSavings?"Below target":"Watch" },
    low:{ dot:C.red, bg:C.redSoft, text:C.red, label:"Too low" },
    high:{ dot:C.red, bg:C.redSoft, text:C.red, label:"High" },
  };
  const s = statusColors[status];
  const Icon = cat.icon;
  const fillPct = Math.min(100, (value/cat.max)*100);
  const groupColors = { needs:C.accent, wants:C.amber, savings:C.green };

  return (
    <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:12,padding:"14px 16px",display:"flex",flexDirection:"column",gap:10,boxShadow:C.shadow }}>
      <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between" }}>
        <div style={{ display:"flex",alignItems:"center",gap:10 }}>
          <div style={{ width:32,height:32,borderRadius:8,background:groupColors[cat.group]+"18",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Icon size={15} color={groupColors[cat.group]} />
          </div>
          <div>
            <div style={{ fontSize:13,fontWeight:700,color:C.text,lineHeight:1.2 }}>{cat.label}</div>
            <div style={{ fontSize:11,color:C.textMuted,lineHeight:1.3 }}>{cat.desc}</div>
          </div>
        </div>
        <div style={{ display:"flex",alignItems:"center",gap:4 }}>
          <div style={{ width:7,height:7,borderRadius:"50%",background:s.dot,flexShrink:0 }} />
          <span style={{ fontSize:10,fontWeight:700,color:s.text,whiteSpace:"nowrap" }}>{s.label}</span>
        </div>
      </div>

      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <button onClick={() => onChange(Math.max(0,value-cat.step))} style={{ width:24,height:24,borderRadius:6,background:C.bgMid,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted,flexShrink:0 }}><Minus size={11} /></button>
        <div style={{ position:"relative",flex:1,height:6,background:C.bgMid,borderRadius:99 }}>
          <div style={{ width:`${fillPct}%`,height:"100%",background:groupColors[cat.group],borderRadius:99,transition:"width 0.2s ease" }} />
        </div>
        <button onClick={() => onChange(Math.min(cat.max,value+cat.step))} style={{ width:24,height:24,borderRadius:6,background:C.bgMid,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted,flexShrink:0 }}><Plus size={11} /></button>
        <input
          type="number"
          value={value}
          onChange={e => onChange(Math.max(0,Math.min(cat.max,parseFloat(e.target.value)||0)))}
          style={{ width:72,height:30,textAlign:"right",fontSize:13,fontWeight:700,border:`1.5px solid ${C.border}`,borderRadius:7,padding:"0 8px",color:C.text,background:C.bg,outline:"none" }}
        />
      </div>

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center" }}>
        <span style={{ fontSize:11,color:C.textMuted }}>{pct(ratio*100,1)}% of income · guideline {Math.round(cat.benchmark*100)}%</span>
        <span style={{ fontSize:11,fontWeight:700,color:C.textSub }}>{fmt(value * 12)}/yr</span>
      </div>
    </div>
  );
}

function InsightCard({ insight }) {
  const colors = { green:{ bg:C.greenSoft,border:"#86EFAC",icon:C.green }, amber:{ bg:C.amberSoft,border:"#FCD34D",icon:C.amber }, red:{ bg:C.redSoft,border:"#FCA5A5",icon:C.red } };
  const c = colors[insight.level] || colors.amber;
  const Icon = insight.level==="green" ? CheckCircle2 : insight.level==="red" ? AlertCircle : Lightbulb;
  return (
    <div style={{ padding:"12px 14px",background:c.bg,border:`1px solid ${c.border}`,borderRadius:10,display:"flex",gap:10,alignItems:"flex-start" }}>
      <Icon size={15} color={c.icon} style={{ flexShrink:0,marginTop:1 }} />
      <p style={{ margin:0,fontSize:12,color:C.text,lineHeight:1.6 }}>{insight.text}</p>
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active||!payload?.length) return null;
  return (
    <div style={{ background:C.navy,borderRadius:10,padding:"10px 14px",boxShadow:C.shadowLg }}>
      <p style={{ color:"#94A3B8",fontSize:11,fontWeight:700,marginBottom:6,textTransform:"uppercase",letterSpacing:"0.06em" }}>{label}</p>
      {payload.map((p,i) => <p key={i} style={{ color:p.color,fontSize:13,fontWeight:600,margin:"2px 0" }}>{p.name}: {fmt(p.value)}</p>)}
    </div>
  );
}

const CHART_COLORS = [C.navy,C.accent,"#F59E0B","#EF4444",C.purple,"#EC4899","#14B8A6","#F97316","#06B6D4","#84CC16","#8B5CF6"];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function NewGraduateBudgetSimulation({ onComplete }) {
  const [budget, setBudget] = useState({ ...BASE });
  const [activeStress, setActiveStress] = useState(null);
  const [showTable, setShowTable] = useState(false);
  const [showRecap, setShowRecap] = useState(false);
  const [activeChartTab, setActiveChartTab] = useState("cashflow");
  const [hoveredTradeoff, setHoveredTradeoff] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [activeGroup, setActiveGroup] = useState("needs");

  const effectiveBudget = useMemo(() => {
    if (!activeStress) return budget;
    if (activeStress.delta) {
      const b = { ...budget };
      Object.entries(activeStress.delta).forEach(([k,v]) => { if (b[k] !== undefined) b[k] = Math.max(0, b[k]+v); });
      return b;
    }
    return budget;
  }, [budget, activeStress]);

  const effectiveIncome = useMemo(() => {
    if (activeStress?.incomeImpact) return MONTHLY_INCOME + activeStress.incomeImpact;
    return MONTHLY_INCOME;
  }, [activeStress]);

  const totals = useMemo(() => calcTotals(effectiveBudget, effectiveIncome), [effectiveBudget, effectiveIncome]);
  const health = useMemo(() => calcHealth(effectiveBudget, totals), [effectiveBudget, totals]);
  const insights = useMemo(() => calcInsights(effectiveBudget, totals, health), [effectiveBudget, totals, health]);
  const projections = useMemo(() => calcProjections(effectiveBudget, totals), [effectiveBudget, totals]);

  const validation = useMemo(() => {
    const emergencyOk = budget.emergency >= BASE.emergency + 200;
    const reducedCats = ["dining","subscriptions","misc","transportation","groceries"].filter(k => budget[k] < BASE[k]).length;
    const underIncome = totals.margin >= 0;
    const retirementOk = budget.retirement >= 300;
    return {
      emergencyOk, reducedCats, underIncome, retirementOk,
      challengeMet: emergencyOk && reducedCats >= 2 && underIncome,
    };
  }, [budget, totals]);

  const tradeoffImpact = useMemo(() => {
    if (!hoveredTradeoff) return null;
    const t = TRADEOFFS.find(t => t.id === hoveredTradeoff);
    if (!t) return null;
    const newBudget = { ...budget };
    Object.entries(t.delta).forEach(([k,v]) => { if (newBudget[k]!==undefined) newBudget[k]=Math.max(0,newBudget[k]+v); });
    const newTotals = calcTotals(newBudget, MONTHLY_INCOME);
    const newHealth = calcHealth(newBudget, newTotals);
    const marginDelta = newTotals.margin - totals.margin;
    return { marginDelta, newHealth, annualImpact: marginDelta * 12 };
  }, [hoveredTradeoff, budget, totals]);

  const chartData = useMemo(() => {
    return Array.from({ length:12 },(_,m) => {
      const total = Object.values(effectiveBudget).reduce((s,v)=>s+v,0);
      const savings = effectiveIncome - total;
      const cumSavings = (budget.retirement+budget.emergency+Math.max(0,totals.margin))*(m+1);
      return { month:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m], Income:effectiveIncome, Expenses:total, Savings:savings, CumulativeSavings:cumSavings };
    });
  }, [effectiveBudget, effectiveIncome, totals]);

  const spendingData = useMemo(() => CATS.map(c => ({ name:c.label, value:effectiveBudget[c.key]||0 })).filter(d=>d.value>0), [effectiveBudget]);

  const update = (key, val) => setBudget(prev => ({ ...prev, [key]: Math.max(0, val) }));
  const resetAll = () => setBudget({ ...BASE });

  const groupedCats = { needs: CATS.filter(c=>c.group==="needs"), wants: CATS.filter(c=>c.group==="wants"), savings: CATS.filter(c=>c.group==="savings") };
  const groupLabels = { needs:"Essential Expenses", wants:"Flexible Spending", savings:"Savings & Investments" };
  const groupColors = { needs:C.accent, wants:C.amber, savings:C.green };

  const tabStyle = (active, color) => ({
    padding:"7px 16px",borderRadius:8,fontSize:12,fontWeight:600,
    border:"none",cursor:"pointer",transition:"all 0.15s",
    background:active?(color||C.navy):"transparent",
    color:active?"#fff":C.textSub,
  });

  const dynamicRecap = useMemo(() => {
    const items = [];
    if (totals.margin >= 0) items.push({ good:true, text:`You created a positive monthly cash flow of ${fmt(totals.margin)}, meaning your budget is sustainable.` });
    else items.push({ good:false, text:`Your budget currently runs a deficit of ${fmt(Math.abs(totals.margin))}. Address this before locking in your plan.` });
    if (validation.emergencyOk) items.push({ good:true, text:`Emergency savings reached the ${fmt(budget.emergency)}/month target — you will reach a $5,000 fund in about ${Math.ceil(5000/budget.emergency)} months.` });
    else items.push({ good:false, text:`Emergency savings are still below the $450/month target. This is your most important financial safety adjustment.` });
    if (budget.retirement >= 300) items.push({ good:true, text:`Retirement contributions of ${fmt(budget.retirement)}/month at age 22 will compound significantly — the earlier you start, the more time works in your favor.` });
    else items.push({ good:false, text:`Retirement contributions are low. Even a small increase now compounds into a large difference over 40 years.` });
    const biggestCat = CATS.filter(c=>c.group!=="savings").sort((a,b)=>(effectiveBudget[b.key]||0)-(effectiveBudget[a.key]||0))[0];
    items.push({ good:null, text:`Your largest expense category is ${biggestCat.label} at ${fmt(effectiveBudget[biggestCat.key]||0)}/month — ${pct(effectiveBudget[biggestCat.key]||0, totals.income)}% of take-home pay.` });
    if (totals.savingsRate >= 10) items.push({ good:true, text:`A savings rate of ${totals.savingsRate.toFixed(1)}% puts you ahead of most people your age. Keep this discipline as income grows.` });
    return items.slice(0,5);
  }, [budget, totals, validation, effectiveBudget]);

  return (
    <div style={{ display:"flex",flexDirection:"column",gap:24,fontFamily:"'Inter',system-ui,sans-serif" }}>

      {/* ── HERO ── */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,borderRadius:20,padding:"28px 32px",boxShadow:C.shadowLg,position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",right:-60,top:-60,width:220,height:220,borderRadius:"50%",background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute",right:80,bottom:-80,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.03)" }} />
        <div style={{ display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:32 }}>
          <div style={{ display:"flex",gap:20,alignItems:"flex-start" }}>
            <div style={{ width:56,height:56,borderRadius:16,background:"#EFF6FF",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 4px 12px rgba(0,0,0,0.2)" }}>
              <GraduationCap size={26} color="#3B82F6" />
            </div>
            <div>
              <div style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>Budget Simulation</div>
              <h2 style={{ margin:0,fontSize:22,fontWeight:800,color:"#fff",letterSpacing:"-0.5px" }}>New Graduate — First Job, First Budget</h2>
              <p style={{ margin:"6px 0 0",fontSize:14,color:"rgba(255,255,255,0.55)",lineHeight:1.5,maxWidth:520 }}>
                Build a realistic first-year budget, manage real expenses, and hit your savings goals on a starting salary of $60,000.
              </p>
              <div style={{ display:"flex",gap:24,marginTop:16 }}>
                {[{l:"Age",v:"22"},{l:"Salary",v:"$60K"},{l:"Experience",v:"New hire"},{l:"Children",v:"0"}].map(({l,v}) => (
                  <div key={l}>
                    <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:2 }}>{l}</div>
                    <div style={{ fontSize:14,fontWeight:700,color:"rgba(255,255,255,0.85)" }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:"flex",gap:28,flexShrink:0,background:"rgba(255,255,255,0.07)",borderRadius:14,padding:"16px 24px",border:"1px solid rgba(255,255,255,0.1)" }}>
            <StatPill label="Take-Home" value={fmt(effectiveIncome)} />
            <div style={{ width:1,background:"rgba(255,255,255,0.1)" }} />
            <StatPill label="Monthly Savings" value={fmt(Math.max(0,totals.margin))} color={totals.margin>=0?"#86EFAC":"#FCA5A5"} />
            <div style={{ width:1,background:"rgba(255,255,255,0.1)" }} />
            <StatPill label="Savings Rate" value={`${totals.savingsRate.toFixed(1)}%`} color={totals.savingsRate>=10?"#86EFAC":"#FCD34D"} />
            <div style={{ width:1,background:"rgba(255,255,255,0.1)" }} />
            <StatPill label="Health Score" value={`${health}/100`} color={health>=75?"#86EFAC":health>=50?"#FCD34D":"#FCA5A5"} />
          </div>
        </div>
      </div>

      {/* ── MISSION ── */}
      <div style={{ background:C.bg,border:`1.5px solid ${validation.challengeMet?C.green:C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadowMd,transition:"border-color 0.3s" }}>
        <div style={{ padding:"18px 24px",background:validation.challengeMet?C.greenSoft:C.bgSoft,borderBottom:`1px solid ${validation.challengeMet?"#BBF7D0":C.border}`,display:"flex",alignItems:"center",gap:14 }}>
          <div style={{ width:40,height:40,borderRadius:10,background:validation.challengeMet?C.greenMid:C.bgMid,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            <Target size={18} color={validation.challengeMet?C.green:C.textMuted} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10 }}>
              <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:C.text }}>Emergency Fund Challenge</h3>
              {validation.challengeMet && <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:C.green,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,letterSpacing:"0.05em" }}><CheckCircle2 size={10} /> COMPLETE</span>}
            </div>
            <p style={{ margin:"3px 0 0",fontSize:13,color:C.textSub }}>Increase emergency savings by $200/month, reduce 2 categories, and keep your budget balanced.</p>
          </div>
          {/* Progress bar */}
          <div style={{ width:160,flexShrink:0 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
              <span style={{ fontSize:11,color:C.textMuted,fontWeight:600 }}>Progress</span>
              <span style={{ fontSize:11,fontWeight:700,color:C.navy }}>{[validation.emergencyOk,validation.reducedCats>=2,validation.underIncome,validation.retirementOk].filter(Boolean).length}/4</span>
            </div>
            <div style={{ height:6,background:C.bgMid,borderRadius:99,overflow:"hidden" }}>
              <div style={{ width:`${[validation.emergencyOk,validation.reducedCats>=2,validation.underIncome,validation.retirementOk].filter(Boolean).length*25}%`,height:"100%",background:validation.challengeMet?C.green:C.accent,borderRadius:99,transition:"width 0.4s ease" }} />
            </div>
          </div>
        </div>
        <div style={{ padding:"16px 24px 18px",display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12 }}>
          {[
            { label:"Emergency savings +$200/mo",  met:validation.emergencyOk,   detail:`Currently ${fmt(budget.emergency)}/mo — target ${fmt(BASE.emergency+200)}/mo` },
            { label:"Reduce 2+ spending categories",met:validation.reducedCats>=2,detail:`${validation.reducedCats} of 2 required reductions made` },
            { label:"Total spending under income",   met:validation.underIncome,   detail:validation.underIncome?`${fmt(totals.margin)} margin remaining`:`Overspending by ${fmt(Math.abs(totals.margin))}` },
            { label:"Maintain retirement contribution",met:validation.retirementOk,detail:`Currently ${fmt(budget.retirement)}/mo — min $300/mo` },
          ].map((req,i) => (
            <div key={i} style={{ padding:"12px 14px",background:req.met?C.greenSoft:C.bgSoft,border:`1px solid ${req.met?"#86EFAC":C.border}`,borderRadius:10,transition:"all 0.2s" }}>
              <div style={{ display:"flex",alignItems:"flex-start",gap:8,marginBottom:6 }}>
                <div style={{ width:16,height:16,borderRadius:"50%",background:req.met?C.green:C.bgMid,border:`1.5px solid ${req.met?C.green:C.borderMid}`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1 }}>
                  {req.met && <CheckCircle2 size={10} color="#fff" />}
                </div>
                <span style={{ fontSize:12,fontWeight:600,color:C.text,lineHeight:1.4 }}>{req.label}</span>
              </div>
              <p style={{ margin:0,fontSize:11,color:C.textSub,lineHeight:1.4 }}>{req.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN GRID ── */}
      <div style={{ display:"grid",gridTemplateColumns:"1fr 380px",gap:20,alignItems:"start" }}>

        {/* LEFT: Budget Builder */}
        <div style={{ display:"flex",flexDirection:"column",gap:16 }}>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div>
              <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:C.text }}>Budget Builder</h3>
              <p style={{ margin:"3px 0 0",fontSize:12,color:C.textSub }}>Adjust each category using the slider or input. Changes update all metrics instantly.</p>
            </div>
            <div style={{ display:"flex",gap:8,alignItems:"center" }}>
              <div style={{ display:"inline-flex",gap:3,padding:3,background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:8 }}>
                {Object.keys(groupLabels).map(g => (
                  <button key={g} style={tabStyle(activeGroup===g,groupColors[g])} onClick={() => setActiveGroup(g)}>{g.charAt(0).toUpperCase()+g.slice(1)}</button>
                ))}
              </div>
              <button onClick={resetAll} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:7,fontSize:12,fontWeight:600,color:C.textSub,cursor:"pointer" }}>
                <RotateCcw size={12} /> Reset
              </button>
            </div>
          </div>

          <div style={{ background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:12,padding:"10px 14px",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <span style={{ fontSize:12,color:C.textSub }}><strong style={{ color:C.text }}>{groupLabels[activeGroup]}</strong> · {groupedCats[activeGroup].length} categories</span>
            <span style={{ fontSize:12,color:C.textSub }}>
              Total: <strong style={{ color:C.text }}>{fmt(groupedCats[activeGroup].reduce((s,c)=>s+(budget[c.key]||0),0))}/mo</strong>
            </span>
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            {groupedCats[activeGroup].map(cat => (
              <CategoryCard key={cat.key} cat={cat} value={budget[cat.key]||0} income={MONTHLY_INCOME} onChange={v => update(cat.key, v)} />
            ))}
          </div>
        </div>

        {/* RIGHT: Cash Flow + Health + Coaching */}
        <div style={{ display:"flex",flexDirection:"column",gap:16,position:"sticky",top:20 }}>

          {/* Cash Flow */}
          <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",boxShadow:C.shadowMd }}>
            <h4 style={{ margin:"0 0 14px",fontSize:14,fontWeight:700,color:C.text }}>Monthly Cash Flow</h4>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {[
                { label:"Take-home pay", value:effectiveIncome, color:C.green, bold:true },
                { label:"Essential expenses", value:-Object.keys(budget).filter(k=>CATS.find(c=>c.key===k&&c.group==="needs")).reduce((s,k)=>s+(budget[k]||0),0), color:C.text },
                { label:"Flexible spending", value:-Object.keys(budget).filter(k=>CATS.find(c=>c.key===k&&c.group==="wants")).reduce((s,k)=>s+(budget[k]||0),0), color:C.text },
                { label:"Savings & retirement", value:-Object.keys(budget).filter(k=>CATS.find(c=>c.key===k&&c.group==="savings")).reduce((s,k)=>s+(budget[k]||0),0), color:C.text },
              ].map((row,i) => (
                <div key={i} style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:i<3?`1px dashed ${C.border}`:"none" }}>
                  <span style={{ fontSize:12,color:C.textSub }}>{row.label}</span>
                  <span style={{ fontSize:13,fontWeight:row.bold?800:600,color:row.color }}>{row.value<0?`-${fmt(Math.abs(row.value))}`:fmt(row.value)}</span>
                </div>
              ))}
              <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 12px",background:totals.margin>=0?C.greenSoft:C.redSoft,border:`1px solid ${totals.margin>=0?"#86EFAC":"#FCA5A5"}`,borderRadius:8,marginTop:4 }}>
                <span style={{ fontSize:13,fontWeight:700,color:totals.margin>=0?C.green:C.red }}>Monthly Margin</span>
                <span style={{ fontSize:16,fontWeight:800,color:totals.margin>=0?C.green:C.red }}>{totals.margin>=0?"+":""}{fmt(totals.margin)}</span>
              </div>
            </div>
          </div>

          {/* Health Score */}
          <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",boxShadow:C.shadow }}>
            <h4 style={{ margin:"0 0 16px",fontSize:14,fontWeight:700,color:C.text }}>Budget Health Score</h4>
            <HealthMeter score={health} />
          </div>

          {/* Coaching Insights */}
          <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:14,padding:"18px 20px",boxShadow:C.shadow }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:12 }}>
              <div style={{ width:28,height:28,borderRadius:8,background:C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Lightbulb size={14} color={C.accent} />
              </div>
              <h4 style={{ margin:0,fontSize:14,fontWeight:700,color:C.text }}>Coach Feedback</h4>
            </div>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {insights.map((ins,i) => <InsightCard key={i} insight={ins} />)}
            </div>
          </div>
        </div>
      </div>

      {/* ── GOAL PROJECTIONS ── */}
      <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,padding:"20px 24px",boxShadow:C.shadowMd }}>
        <h3 style={{ margin:"0 0 4px",fontSize:15,fontWeight:700,color:C.text }}>Goal Projections</h3>
        <p style={{ margin:"0 0 18px",fontSize:12,color:C.textSub }}>Based on your current budget, here is where you are headed over the next year and beyond.</p>
        <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:12 }}>
          {[
            { label:"Annual Savings", value:fmt(projections.annualSavings), sub:"Total saved this year", color:totals.margin>=0?C.green:C.red, bg:totals.margin>=0?C.greenSoft:C.redSoft, icon:TrendingUp },
            { label:"Emergency Fund", value:projections.emergencyMonths?`${projections.emergencyMonths} mo`:"Never", sub:"Months to reach $5,000", color:budget.emergency>0?C.accent:C.textMuted, icon:Shield },
            { label:"Retirement in 10yr", value:fmtShort(projections.retirementAt7pct(10)), sub:"At 7% avg return", color:C.purple, bg:C.purpleSoft, icon:TrendingUp },
            { label:"Annual Discretionary", value:fmt(projections.annualDiscretionary), sub:"Dining, subs, misc", color:C.amber, bg:C.amberSoft, icon:Coffee },
            { label:"Annual Debt Payments", value:fmt(projections.annualDebt), sub:"Toward loans this year", color:C.textSub, icon:CreditCard },
          ].map((card,i) => (
            <MetricCard key={i} label={card.label} value={card.value} sub={card.sub} color={card.color} bg={card.bg} icon={card.icon} />
          ))}
        </div>
      </div>

      {/* ── CHARTS ── */}
      <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadowMd }}>
        <div style={{ padding:"18px 24px 0",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <h3 style={{ margin:0,fontSize:15,fontWeight:700,color:C.text }}>Budget Visualizations</h3>
          </div>
          <div style={{ display:"inline-flex",gap:3,padding:3,background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:9,marginBottom:16 }}>
            {[{id:"cashflow",label:"Cash Flow"},{id:"breakdown",label:"Spending Breakdown"},{id:"savings",label:"Savings Growth"}].map(t => (
              <button key={t.id} style={tabStyle(activeChartTab===t.id)} onClick={()=>setActiveChartTab(t.id)}>{t.label}</button>
            ))}
          </div>
        </div>
        <div style={{ padding:"20px 24px" }}>
          {activeChartTab==="cashflow" && (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={chartData} barSize={12} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:11,fill:C.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11,fill:C.textMuted }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <ReferenceLine y={0} stroke={C.borderMid} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:12,paddingTop:12 }} />
                <Bar dataKey="Income" fill={C.green} radius={[3,3,0,0]} />
                <Bar dataKey="Expenses" fill={C.accent} radius={[3,3,0,0]} />
                <Bar dataKey="Savings" fill={C.navy} radius={[3,3,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          {activeChartTab==="breakdown" && (
            <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20,alignItems:"center" }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={spendingData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={110} innerRadius={44} paddingAngle={2}>
                    {spendingData.map((_,i)=><Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={v=>fmt(v)} contentStyle={{ background:C.navy,border:"none",borderRadius:10,fontSize:12,color:"#fff" }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
                {spendingData.sort((a,b)=>b.value-a.value).slice(0,8).map((d,i)=>(
                  <div key={i} style={{ display:"flex",alignItems:"center",gap:10 }}>
                    <div style={{ width:10,height:10,borderRadius:3,background:CHART_COLORS[spendingData.findIndex(s=>s.name===d.name)%CHART_COLORS.length],flexShrink:0 }} />
                    <span style={{ fontSize:12,color:C.textSub,flex:1 }}>{d.name}</span>
                    <span style={{ fontSize:12,fontWeight:700,color:C.text }}>{fmt(d.value)}</span>
                    <span style={{ fontSize:11,color:C.textMuted,width:32,textAlign:"right" }}>{pct(d.value,totals.income)}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {activeChartTab==="savings" && (
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize:11,fill:C.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize:11,fill:C.textMuted }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize:12,paddingTop:12 }} />
                <Line type="monotone" dataKey="CumulativeSavings" stroke={C.green} strokeWidth={2.5} dot={{ fill:C.green,r:4 }} name="Cumulative Savings" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── TRADEOFF EXPLORER ── */}
      <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadowMd }}>
        <div style={{ padding:"20px 24px",borderBottom:`1px solid ${C.border}` }}>
          <h3 style={{ margin:0,fontSize:15,fontWeight:700,color:C.text }}>Tradeoff Explorer</h3>
          <p style={{ margin:"4px 0 0",fontSize:12,color:C.textSub }}>Hover over a decision to preview the impact on your budget before applying it.</p>
        </div>
        <div style={{ padding:"20px 24px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:12 }}>
            {TRADEOFFS.map(t => {
              const hovered = hoveredTradeoff===t.id;
              const Icon = t.icon;
              let impactText = null;
              if (hovered && tradeoffImpact) {
                const d = tradeoffImpact;
                impactText = `${d.marginDelta>=0?"+":""}${fmt(d.marginDelta)}/mo · ${d.annualImpact>=0?"+":""}${fmt(d.annualImpact)}/yr · Score: ${d.newHealth}/100`;
              }
              return (
                <div
                  key={t.id}
                  onMouseEnter={()=>setHoveredTradeoff(t.id)}
                  onMouseLeave={()=>setHoveredTradeoff(null)}
                  style={{
                    padding:"16px 18px",borderRadius:12,cursor:"pointer",
                    border:`1.5px solid ${hovered?C.accent:C.border}`,
                    background:hovered?C.accentSoft:C.bgSoft,
                    transition:"all 0.15s",
                  }}
                >
                  <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:8 }}>
                    <div style={{ width:30,height:30,borderRadius:8,background:hovered?C.accentMid:C.bgMid,display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.15s" }}>
                      <Icon size={14} color={hovered?C.accent:C.textMuted} />
                    </div>
                    <span style={{ fontSize:13,fontWeight:700,color:hovered?C.accent:C.text }}>{t.label}</span>
                  </div>
                  <p style={{ margin:"0 0 8px",fontSize:12,color:C.textSub,lineHeight:1.5 }}>{t.desc}</p>
                  {hovered && tradeoffImpact && (
                    <div style={{ fontSize:11,fontWeight:700,color:tradeoffImpact.marginDelta>=0?C.green:C.red,padding:"5px 8px",background:tradeoffImpact.marginDelta>=0?C.greenSoft:C.redSoft,borderRadius:6,lineHeight:1.5 }}>
                      {impactText}
                    </div>
                  )}
                  {!hovered && (
                    <div style={{ fontSize:11,color:C.textMuted }}>Hover to preview impact</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── STRESS TEST ── */}
      <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow }}>
        <div style={{ padding:"20px 24px",borderBottom:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <h3 style={{ margin:0,fontSize:15,fontWeight:700,color:C.text }}>Life Event Stress Test</h3>
            <p style={{ margin:"4px 0 0",fontSize:12,color:C.textSub }}>Can your budget handle an unexpected event? Select one to see the impact.</p>
          </div>
          {activeStress && (
            <button onClick={()=>setActiveStress(null)} style={{ display:"flex",alignItems:"center",gap:5,padding:"6px 12px",background:C.redSoft,border:`1px solid ${C.redMid}`,borderRadius:7,fontSize:12,fontWeight:600,color:C.red,cursor:"pointer" }}>
              <RotateCcw size={12} /> Clear Event
            </button>
          )}
        </div>
        <div style={{ padding:"16px 24px 20px" }}>
          {activeStress && (
            <div style={{ padding:"12px 16px",background:C.amberSoft,border:`1px solid ${C.amberMid}`,borderRadius:10,marginBottom:14,display:"flex",alignItems:"center",gap:10 }}>
              <AlertTriangle size={16} color={C.amber} />
              <span style={{ fontSize:13,fontWeight:600,color:"#78350F" }}>
                Active event: <strong>{activeStress.label}</strong> — {activeStress.desc}.
                {activeStress.impact && ` One-time impact: ${fmt(activeStress.impact)}.`}
                {activeStress.incomeImpact && ` Monthly income reduced by ${fmt(Math.abs(activeStress.incomeImpact))}.`}
                New margin: <strong style={{ color:totals.margin+(activeStress.impact||0)>=0?C.green:C.red }}>{fmt(totals.margin+(activeStress.impact||0))}</strong>
              </span>
            </div>
          )}
          <div style={{ display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:10 }}>
            {STRESS_EVENTS.map(ev => {
              const Icon = ev.icon;
              const active = activeStress?.id===ev.id;
              return (
                <div
                  key={ev.id}
                  onClick={()=>setActiveStress(active?null:ev)}
                  style={{
                    padding:"14px 14px",borderRadius:11,cursor:"pointer",textAlign:"center",
                    border:`1.5px solid ${active?C.amber:C.border}`,
                    background:active?C.amberSoft:C.bgSoft,
                    transition:"all 0.15s",
                  }}
                >
                  <div style={{ width:32,height:32,borderRadius:9,background:active?C.amberMid:C.bgMid,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 8px" }}>
                    <Icon size={15} color={active?C.amber:C.textMuted} />
                  </div>
                  <div style={{ fontSize:12,fontWeight:700,color:active?C.amber:C.text,lineHeight:1.3,marginBottom:4 }}>{ev.label}</div>
                  <div style={{ fontSize:11,color:C.textSub,lineHeight:1.4 }}>{ev.desc}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── FULL YEAR TABLE (collapsible) ── */}
      <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow }}>
        <button
          onClick={()=>setShowTable(v=>!v)}
          style={{ width:"100%",padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",borderBottom:showTable?`1px solid ${C.border}`:"none" }}
        >
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:34,height:34,borderRadius:9,background:C.bgMid,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <BarChart2 size={16} color={C.textSub} />
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:14,fontWeight:700,color:C.text }}>View Full 12-Month Budget Table</div>
              <div style={{ fontSize:12,color:C.textSub }}>Detailed month-by-month breakdown of your budget</div>
            </div>
          </div>
          {showTable?<ChevronUp size={17} color={C.textMuted}/>:<ChevronDown size={17} color={C.textMuted}/>}
        </button>
        {showTable && (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <thead>
                <tr style={{ background:C.bgSoft }}>
                  <th style={{ padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textSub,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,position:"sticky",left:0,background:C.bgSoft,whiteSpace:"nowrap" }}>Month</th>
                  <th style={{ padding:"10px 10px",textAlign:"right",fontWeight:700,color:C.green,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,background:C.greenSoft,whiteSpace:"nowrap" }}>Income</th>
                  {CATS.map(c=>(
                    <th key={c.key} style={{ padding:"10px 10px",textAlign:"right",fontWeight:700,color:c.group==="wants"?C.amber:c.group==="savings"?C.green:C.textSub,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap" }}>{c.label.split(" ")[0]}</th>
                  ))}
                  <th style={{ padding:"10px 10px",textAlign:"right",fontWeight:700,color:C.accent,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,background:C.accentSoft,whiteSpace:"nowrap" }}>Total</th>
                  <th style={{ padding:"10px 10px",textAlign:"right",fontWeight:700,color:C.navy,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap" }}>Savings</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({length:12},(_,m)=>{
                  const total = Object.values(budget).reduce((s,v)=>s+v,0);
                  const savings = MONTHLY_INCOME - total;
                  const isNeg = savings<0;
                  return (
                    <tr key={m} style={{ background:isNeg?"#FEF2F2":m%2===0?C.bg:C.bgSoft,borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ padding:"8px 14px",fontWeight:700,color:C.text,position:"sticky",left:0,background:isNeg?"#FEF2F2":m%2===0?C.bg:C.bgSoft }}>{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][m]}</td>
                      <td style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:C.green,background:C.greenSoft }}>{fmt(MONTHLY_INCOME)}</td>
                      {CATS.map(c=><td key={c.key} style={{ padding:"8px 10px",textAlign:"right",color:C.textSub }}>{fmt(budget[c.key]||0)}</td>)}
                      <td style={{ padding:"8px 10px",textAlign:"right",fontWeight:700,color:C.accent,background:C.accentSoft }}>{fmt(total)}</td>
                      <td style={{ padding:"8px 10px",textAlign:"right",fontWeight:800,color:isNeg?C.red:C.green }}>{isNeg?"−":"+"}{fmt(Math.abs(savings))}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DECISION RECAP ── */}
      <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow }}>
        <button
          onClick={()=>setShowRecap(v=>!v)}
          style={{ width:"100%",padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",borderBottom:showRecap?`1px solid ${C.border}`:"none" }}
        >
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:34,height:34,borderRadius:9,background:C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <BookOpen size={16} color={C.accent} />
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:14,fontWeight:700,color:C.text }}>What You Learned From This Budget</div>
              <div style={{ fontSize:12,color:C.textSub }}>Dynamic takeaways based on your decisions</div>
            </div>
          </div>
          {showRecap?<ChevronUp size={17} color={C.textMuted}/>:<ChevronDown size={17} color={C.textMuted}/>}
        </button>
        {showRecap && (
          <div style={{ padding:"18px 24px 22px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            {dynamicRecap.map((item,i) => {
              const color = item.good===true?C.green:item.good===false?C.red:C.accent;
              const bg = item.good===true?C.greenSoft:item.good===false?C.redSoft:C.accentSoft;
              const border = item.good===true?"#86EFAC":item.good===false?"#FCA5A5":C.accentMid;
              const Icon = item.good===true?CheckCircle2:item.good===false?AlertCircle:ArrowRight;
              return (
                <div key={i} style={{ padding:"14px 16px",background:bg,border:`1px solid ${border}`,borderRadius:11,display:"flex",gap:10,alignItems:"flex-start" }}>
                  <Icon size={15} color={color} style={{ flexShrink:0,marginTop:2 }} />
                  <p style={{ margin:0,fontSize:12,color:C.text,lineHeight:1.65 }}>{item.text}</p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── COMPLETE BUTTON ── */}
      {validation.challengeMet && !completed && (
        <button
          onClick={()=>{ setCompleted(true); if(onComplete) onComplete(); }}
          style={{
            width:"100%",height:56,borderRadius:14,
            background:`linear-gradient(135deg, ${C.green} 0%, #15803D 100%)`,
            color:"#fff",fontSize:15,fontWeight:700,border:"none",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            boxShadow:"0 4px 20px rgba(22,163,74,0.3)",
            transition:"transform 0.15s, box-shadow 0.15s",
          }}
          onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-2px)";e.currentTarget.style.boxShadow="0 8px 28px rgba(22,163,74,0.4)";}}
          onMouseLeave={e=>{e.currentTarget.style.transform="none";e.currentTarget.style.boxShadow="0 4px 20px rgba(22,163,74,0.3)";}}
        >
          <CheckCircle2 size={20} />
          Complete Challenge and Continue
        </button>
      )}
    </div>
  );
}