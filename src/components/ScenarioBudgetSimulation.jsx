import React, { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from "recharts";
import {
  CheckCircle2, AlertCircle, TrendingUp, Users, Briefcase,
  Home, GraduationCap, BookOpen, ChevronDown, ChevronUp,
  Plus, Minus, RotateCcw, Target, Activity, Zap,
  TrendingDown, Shield, DollarSign
} from "lucide-react";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  navy:"#1F3A64", navyMid:"#172E52", navyLight:"#2A4A7F",
  accent:"#3B82F6", accentSoft:"#EFF6FF", accentMid:"#DBEAFE",
  green:"#16A34A", greenSoft:"#F0FDF4", greenMid:"#DCFCE7",
  amber:"#D97706", amberSoft:"#FFFBEB", amberMid:"#FEF3C7",
  red:"#DC2626", redSoft:"#FEF2F2", redMid:"#FECACA",
  purple:"#7C3AED", purpleSoft:"#F5F3FF",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E2E8F0", borderMid:"#CBD5E1",
  shadow:"0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)",
  shadowMd:"0 4px 16px rgba(0,0,0,0.07), 0 2px 4px rgba(0,0,0,0.04)",
  shadowLg:"0 12px 40px rgba(31,58,100,0.13)",
};

// ─── Scenarios ─────────────────────────────────────────────────────────────────
const SCENARIOS = {
  0: {
    title:"College Student", subtitle:"Part-Time Job, Variable Income",
    icon:GraduationCap, iconBg:"#EFF6FF", iconColor:"#3B82F6",
    age:20, workExp:"Part-time", userIncome:18000, partnerIncome:0,
    children:0, retirementSavings:0,
    incomeLogic:(m) => [4,5,6,7].includes(m) ? 2000 : 1500,
    baseExpenses:{
      housing:800, utilities:90, groceries:250, transportation:120,
      insurance:80, childcare:0, subscriptions:35, debtPayments:0,
      dining:180, misc:100, retirement:0, emergency:75
    },
    challenge:{
      icon:Target, title:"Textbook Challenge",
      description:"Textbooks cost $600 this semester. Spread the cost over 4 months without going negative.",
      requirements:[
        "Gross Savings must be zero or positive every month",
        "Distribute $600 textbook cost across 4 months",
        "Adjust at least 2 discretionary spending categories",
      ]
    },
    teaching:[
      { icon:Activity, title:"Variable Income Planning", body:"Income that changes month-to-month requires a flexible budget. Build a buffer during high-income months to cover leaner ones." },
      { icon:TrendingDown, title:"Avoiding Negative Cash Flow", body:"Spending more than you earn — even for one month — can create a debt spiral that compounds quickly and is hard to escape." },
      { icon:Shield, title:"Planning for Irregular Expenses", body:"Large one-time costs like textbooks should be anticipated well in advance and spread over time, not absorbed in a single month." },
    ]
  },
  1: {
    title:"New Graduate", subtitle:"First Job, First Real Budget",
    icon:TrendingUp, iconBg:"#F0FDF4", iconColor:"#16A34A",
    age:22, workExp:"0 years full-time", userIncome:60000, partnerIncome:0,
    children:0, retirementSavings:0,
    incomeLogic:() => 5000,
    baseExpenses:{
      housing:1600, utilities:160, groceries:350, transportation:220,
      insurance:180, childcare:0, subscriptions:45, debtPayments:350,
      dining:250, misc:150, retirement:300, emergency:250
    },
    challenge:{
      icon:Shield, title:"Emergency Fund Challenge",
      description:"Financial advisors recommend 3–6 months of expenses in emergency savings. Increase your monthly contribution by $200.",
      requirements:[
        "Emergency savings increased by at least $200/month",
        "Reduce spending in at least 2 categories to offset the increase",
        "Total monthly expenditure must not exceed total income",
      ]
    },
    teaching:[
      { icon:Shield, title:"Building an Emergency Fund", body:"An emergency fund is your financial safety net — it prevents one bad month from derailing your entire financial plan." },
      { icon:Activity, title:"Making Budget Tradeoffs", body:"Every dollar allocated to savings is a dollar not spent elsewhere. Learning to prioritize is the core skill of personal finance." },
      { icon:DollarSign, title:"Living Within Your Means", body:"Lifestyle inflation is real. As income grows, so do expectations. Keeping expenses well below income is the foundation of lasting wealth." },
    ]
  },
  2: {
    title:"Early Career Couple", subtitle:"Dual Income, Planning Ahead",
    icon:Users, iconBg:"#F5F3FF", iconColor:"#7C3AED",
    age:30, workExp:"7 years", userIncome:85000, partnerIncome:55000,
    children:0, retirementSavings:35000,
    incomeLogic:() => ({ user:7083, partner:4583 }),
    baseExpenses:{
      housing:2500, utilities:240, groceries:700, transportation:500,
      insurance:350, childcare:0, subscriptions:80, debtPayments:600,
      dining:650, misc:350, retirement:1500, emergency:800
    },
    challenge:{
      icon:Home, title:"Down Payment Challenge",
      description:"You want to buy a home in 3 years. Add $500/month toward a dedicated down payment fund.",
      requirements:[
        "Add down payment savings of at least $500/month",
        "Dining and entertainment must stay at $300 or above",
        "You may not increase either income stream",
      ]
    },
    teaching:[
      { icon:Users, title:"Dual Income Budgeting", body:"Two incomes create more flexibility but also more complexity. Align on shared goals before splitting expenses." },
      { icon:Target, title:"Saving for Major Purchases", body:"Large goals like a home down payment require intentional, long-horizon saving — not just whatever is left over each month." },
      { icon:Activity, title:"Balancing Lifestyle and Savings", body:"Dual income households often see lifestyle inflation accelerate. Protecting your savings rate early is the key to long-term security." },
    ]
  },
  3: {
    title:"Mid-Career Family", subtitle:"Two Kids, Dual Income",
    icon:Home, iconBg:"#FFF7ED", iconColor:"#EA580C",
    age:40, workExp:"18 years", userIncome:120000, partnerIncome:75000,
    children:2, retirementSavings:235000,
    incomeLogic:() => ({ user:10000, partner:6250 }),
    baseExpenses:{
      housing:3300, utilities:380, groceries:1100, transportation:900,
      insurance:600, childcare:450, subscriptions:95, debtPayments:450,
      dining:500, misc:450, retirement:2000, emergency:1000
    },
    challenge:{
      icon:Zap, title:"New Activity Challenge",
      description:"Your child is joining an after-school program adding $150/month. Absorb this cost without cutting retirement contributions.",
      requirements:[
        "Absorb the $150/month cost within Childcare or Misc",
        "Retirement contributions must stay at their current level or higher",
        "Total monthly expenditure must not exceed total income",
      ]
    },
    teaching:[
      { icon:Home, title:"Family Budget Complexity", body:"Family budgets have less flexibility and higher fixed costs. Every discretionary dollar requires deliberate allocation." },
      { icon:Shield, title:"Protecting Retirement Savings", body:"It is tempting to cut retirement contributions when expenses rise. Resist this — compounding time lost is irreplaceable." },
      { icon:Activity, title:"Managing Expense Creep", body:"Children's expenses grow continuously over time. Building buffer into your budget early prevents constant re-planning and stress." },
    ]
  }
};

// ─── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v);
const fmtShort = (v) => v >= 1e6 ? `$${(v/1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v/1e3).toFixed(0)}K` : `$${Math.round(Math.abs(v))}`;
const pct = (a,b) => b === 0 ? 0 : Math.round((a/b)*100);

const CHART_COLORS = [C.navy,C.accent,"#F59E0B","#EF4444",C.purple,"#EC4899","#14B8A6","#F97316","#06B6D4","#84CC16"];
const DISCRETIONARY = new Set(["dining","subscriptions","misc"]);
const EXPENSE_LABELS = {
  housing:"Housing", utilities:"Utilities", groceries:"Groceries",
  transportation:"Transport", insurance:"Insurance", childcare:"Childcare",
  subscriptions:"Subscriptions", debtPayments:"Debt Payments",
  dining:"Dining", misc:"Misc", retirement:"Retirement",
  emergency:"Emergency", downPayment:"Down Payment"
};
const BENCHMARKS = {
  housing:0.30, utilities:0.05, groceries:0.10, transportation:0.10,
  insurance:0.05, dining:0.05, misc:0.05, retirement:0.15, emergency:0.05
};

// ─── Sub-components ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, color, bg, icon: Icon }) {
  return (
    <div style={{
      background:bg||C.bgSoft, border:`1px solid ${C.border}`,
      borderRadius:14, padding:"18px 20px",
      display:"flex", flexDirection:"column", gap:6,
    }}>
      {Icon && (
        <div style={{
          width:32, height:32, borderRadius:8,
          background:color ? color+"18" : C.bgMid,
          display:"flex", alignItems:"center", justifyContent:"center", marginBottom:2,
        }}>
          <Icon size={15} color={color||C.textMuted} />
        </div>
      )}
      <span style={{ fontSize:11, color:C.textMuted, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>{label}</span>
      <span style={{ fontSize:24, fontWeight:800, color:color||C.text, letterSpacing:"-0.6px", lineHeight:1 }}>{value}</span>
      {sub && <span style={{ fontSize:12, color:C.textSub, lineHeight:1.4 }}>{sub}</span>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.navy, borderRadius:10, padding:"10px 14px", boxShadow:C.shadowLg }}>
      <p style={{ color:"#94A3B8", fontSize:11, fontWeight:700, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color, fontSize:13, fontWeight:600, margin:"2px 0" }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
}

function HealthBar({ score }) {
  const color = score >= 75 ? C.green : score >= 50 ? C.amber : C.red;
  const label = score >= 75 ? "Healthy" : score >= 50 ? "Needs Work" : "At Risk";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>Budget Health Score</span>
        <span style={{ fontSize:13, fontWeight:800, color }}>{score}/100 · {label}</span>
      </div>
      <div style={{ height:8, background:C.bgMid, borderRadius:99, overflow:"hidden" }}>
        <div style={{
          width:`${score}%`, height:"100%",
          background:`linear-gradient(90deg, ${color}, ${color}cc)`,
          borderRadius:99, transition:"width 0.5s ease",
        }} />
      </div>
    </div>
  );
}

function RulePanel({ totalIncome, totalNeeds, totalWants, totalSavings }) {
  const bars = [
    { label:"Needs", value:pct(totalNeeds,totalIncome), target:50, color:C.accent },
    { label:"Wants", value:pct(totalWants,totalIncome), target:30, color:C.amber },
    { label:"Savings & Debt", value:pct(totalSavings,totalIncome), target:20, color:C.green },
  ];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>50/30/20 Rule Analysis</span>
        <span style={{ fontSize:11, color:C.textSub, background:C.bgMid, padding:"2px 8px", borderRadius:20, fontWeight:500 }}>Annual average</span>
      </div>
      <p style={{ fontSize:12, color:C.textSub, margin:0, lineHeight:1.5 }}>
        The 50/30/20 rule suggests spending 50% on needs, 30% on wants, and 20% on savings and debt repayment.
      </p>
      {bars.map(b => (
        <div key={b.label}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:12, fontWeight:600, color:C.textSub }}>{b.label}</span>
            <span style={{ fontSize:12, fontWeight:700, color: Math.abs(b.value - b.target) <= 5 ? C.green : C.amber }}>
              {b.value}% <span style={{ color:C.textMuted, fontWeight:500 }}>/ {b.target}% target</span>
            </span>
          </div>
          <div style={{ height:7, background:C.bgMid, borderRadius:99, position:"relative", overflow:"visible" }}>
            <div style={{
              width:`${Math.min(b.value,100)}%`, height:"100%",
              background:b.color, borderRadius:99, transition:"width 0.4s ease",
            }} />
            <div style={{
              position:"absolute", top:-3, left:`${b.target}%`,
              width:2, height:13, background:C.borderMid, borderRadius:2,
              transform:"translateX(-50%)",
            }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ProjectionPanel({ monthlySavings }) {
  const r = 0.07;
  const monthly = monthlySavings / 12;
  const project = (yrs) => {
    if (monthly <= 0) return 0;
    return monthly * ((Math.pow(1 + r/12, yrs*12) - 1) / (r/12));
  };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
        <span style={{ fontSize:13, fontWeight:700, color:C.text }}>Savings Projection</span>
        <span style={{ fontSize:11, color:C.textSub, background:C.bgMid, padding:"2px 8px", borderRadius:20, fontWeight:500 }}>7% avg annual return</span>
      </div>
      <p style={{ fontSize:12, color:C.textSub, margin:0, lineHeight:1.5 }}>
        If you invest your annual surplus at a 7% average return, here is what it could grow to over time.
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
        {[5,10,20,30].map(y => {
          const val = project(y);
          return (
            <div key={y} style={{
              background:C.bgSoft, border:`1px solid ${C.border}`,
              borderRadius:10, padding:"14px 16px",
            }}>
              <div style={{ fontSize:11, color:C.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:4 }}>{y} Years</div>
              <div style={{ fontSize:20, fontWeight:800, color:monthly > 0 ? C.green : C.textMuted, letterSpacing:"-0.4px" }}>
                {monthly > 0 ? fmtShort(val) : "—"}
              </div>
              {monthly > 0 && <div style={{ fontSize:11, color:C.textSub, marginTop:3 }}>invested at this rate</div>}
            </div>
          );
        })}
      </div>
      {monthly <= 0 && (
        <p style={{ fontSize:12, color:C.red, margin:0 }}>
          Your budget currently runs a deficit. Fix the negative months first to unlock savings projections.
        </p>
      )}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function ScenarioBudgetSimulation({ scenarioId = 0, onComplete }) {
  const scenario = SCENARIOS[scenarioId];
  const [budget, setBudget] = useState(() => initializeBudget(scenario));
  const [completed, setCompleted] = useState(false);
  const [showLearning, setShowLearning] = useState(false);
  const [activeTab, setActiveTab] = useState("table");

  function initializeBudget(sc) {
    return Array.from({ length:12 }, (_, m) => {
      const raw = sc.incomeLogic(m);
      const income = typeof raw === "number" ? raw : raw.user + raw.partner;
      return {
        month:MONTHS[m], income,
        housing:sc.baseExpenses.housing,
        utilities:sc.baseExpenses.utilities + ([0,1,11].includes(m) ? 30 : 0),
        groceries:sc.baseExpenses.groceries + ([10,11].includes(m) ? 75 : 0),
        transportation:sc.baseExpenses.transportation,
        insurance:sc.baseExpenses.insurance,
        childcare:sc.baseExpenses.childcare,
        subscriptions:sc.baseExpenses.subscriptions,
        debtPayments:sc.baseExpenses.debtPayments,
        dining:sc.baseExpenses.dining,
        misc:sc.baseExpenses.misc,
        retirement:sc.baseExpenses.retirement,
        emergency:sc.baseExpenses.emergency,
        downPayment:0,
      };
    });
  }

  const getDefaultRow = useCallback((m) => {
    const raw = scenario.incomeLogic(m);
    const income = typeof raw === "number" ? raw : raw.user + raw.partner;
    return {
      month:MONTHS[m], income,
      housing:scenario.baseExpenses.housing,
      utilities:scenario.baseExpenses.utilities + ([0,1,11].includes(m) ? 30 : 0),
      groceries:scenario.baseExpenses.groceries + ([10,11].includes(m) ? 75 : 0),
      transportation:scenario.baseExpenses.transportation,
      insurance:scenario.baseExpenses.insurance,
      childcare:scenario.baseExpenses.childcare,
      subscriptions:scenario.baseExpenses.subscriptions,
      debtPayments:scenario.baseExpenses.debtPayments,
      dining:scenario.baseExpenses.dining,
      misc:scenario.baseExpenses.misc,
      retirement:scenario.baseExpenses.retirement,
      emergency:scenario.baseExpenses.emergency,
      downPayment:0,
    };
  }, [scenario]);

  const updateCell = (monthIndex, key, value) => {
    setBudget(prev => {
      const next = [...prev];
      next[monthIndex] = { ...next[monthIndex], [key]: Math.max(0, value) };
      return next;
    });
  };

  const nudgeCell = (monthIndex, key, delta) => {
    setBudget(prev => {
      const next = [...prev];
      next[monthIndex] = { ...next[monthIndex], [key]: Math.max(0, (next[monthIndex][key]||0) + delta) };
      return next;
    });
  };

  const applyToAll = (key, value) => {
    setBudget(prev => prev.map(m => ({ ...m, [key]: Math.max(0, value) })));
  };

  const resetRow = (idx) => {
    setBudget(prev => { const next = [...prev]; next[idx] = getDefaultRow(idx); return next; });
  };

  const resetAll = () => setBudget(initializeBudget(scenario));

  const getRowTotals = (month) => {
    const totalExpense = month.housing + month.utilities + month.groceries +
      month.transportation + month.insurance + month.childcare +
      month.subscriptions + month.debtPayments + month.dining +
      month.misc + month.retirement + month.emergency + (month.downPayment||0);
    return { totalExpense, savings: month.income - totalExpense };
  };

  const isChanged = useCallback((month, idx, key) => {
    return month[key] !== getDefaultRow(idx)[key];
  }, [getDefaultRow]);

  const validation = useMemo(() => {
    let allPositive = true;
    const adjustedCategories = new Set();
    budget.forEach((month, idx) => {
      if (getRowTotals(month).savings < 0) allPositive = false;
      ["dining","subscriptions","misc"].forEach(k => {
        if (isChanged(month, idx, k)) adjustedCategories.add(k);
      });
    });
    let challengeMet = false;
    if (scenarioId === 0) challengeMet = allPositive && adjustedCategories.size >= 2;
    else if (scenarioId === 1) {
      const avgEmergency = budget.reduce((s,m) => s + m.emergency, 0) / 12;
      challengeMet = avgEmergency >= scenario.baseExpenses.emergency + 200 && adjustedCategories.size >= 2;
    } else if (scenarioId === 2) {
      const avgDP = budget.reduce((s,m) => s + (m.downPayment||0), 0) / 12;
      const minDining = Math.min(...budget.map(m => m.dining));
      challengeMet = avgDP >= 500 && minDining >= 300 && allPositive;
    } else if (scenarioId === 3) {
      challengeMet = allPositive && budget.every(m => m.retirement >= scenario.baseExpenses.retirement);
    }
    return { allPositive, challengeMet, adjustedCategories };
  }, [budget, scenarioId, scenario, isChanged]);

  const annualStats = useMemo(() => {
    const totalIncome = budget.reduce((s,m) => s + m.income, 0);
    const totalExpenses = budget.reduce((s,m) => s + getRowTotals(m).totalExpense, 0);
    const totalSavings = totalIncome - totalExpenses;
    const negativeMonths = budget.filter(m => getRowTotals(m).savings < 0).length;
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;
    const needsKeys = ["housing","utilities","groceries","transportation","insurance","childcare","debtPayments"];
    const wantsKeys = ["dining","subscriptions","misc"];
    const savingsKeys = ["retirement","emergency","downPayment"];
    const totalNeeds = budget.reduce((s,m) => s + needsKeys.reduce((a,k) => a+(m[k]||0),0), 0);
    const totalWants = budget.reduce((s,m) => s + wantsKeys.reduce((a,k) => a+(m[k]||0),0), 0);
    const totalSavingsAlloc = budget.reduce((s,m) => s + savingsKeys.reduce((a,k) => a+(m[k]||0),0), 0);
    return { totalIncome, totalExpenses, totalSavings, negativeMonths, savingsRate, totalNeeds, totalWants, totalSavingsAlloc };
  }, [budget]);

  const healthScore = useMemo(() => {
    let score = 0;
    score += Math.max(0, 40 - annualStats.negativeMonths * 8);
    score += Math.min(30, Math.max(0, annualStats.savingsRate * 1.5));
    if (validation.challengeMet) score += 20;
    else if (validation.allPositive) score += 10;
    score += Math.min(10, validation.adjustedCategories.size * 4);
    return Math.round(Math.min(100, score));
  }, [annualStats, validation]);

  const yearlyData = useMemo(() => budget.map(month => {
    const { totalExpense, savings } = getRowTotals(month);
    return { month:month.month, Income:month.income, Expenses:totalExpense, Savings:savings };
  }), [budget]);

  const categoryData = useMemo(() => {
    const totals = {};
    Object.keys(EXPENSE_LABELS).forEach(key => {
      const total = budget.reduce((s,m) => s+(m[key]||0), 0);
      if (total > 0) totals[EXPENSE_LABELS[key]] = total;
    });
    return Object.entries(totals).map(([name,value]) => ({ name, value }));
  }, [budget]);

  const editableCols = [
    { key:"housing", label:"Housing" },
    { key:"utilities", label:"Utilities" },
    { key:"groceries", label:"Groceries" },
    { key:"transportation", label:"Transport" },
    { key:"insurance", label:"Insurance" },
    ...(scenario.baseExpenses.childcare > 0 ? [{ key:"childcare", label:"Childcare" }] : []),
    { key:"subscriptions", label:"Subscriptions" },
    ...(scenario.baseExpenses.debtPayments > 0 ? [{ key:"debtPayments", label:"Debt" }] : []),
    { key:"dining", label:"Dining" },
    { key:"misc", label:"Misc" },
    { key:"retirement", label:"Retirement" },
    { key:"emergency", label:"Emergency" },
    ...(scenarioId === 2 ? [{ key:"downPayment", label:"Down Payment" }] : []),
  ];

  const ChallengeIcon = scenario.challenge.icon;
  const ScenarioIcon = scenario.icon;

  const tabStyle = (active) => ({
    padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:600,
    border:"none", cursor:"pointer", transition:"all 0.15s",
    background:active ? C.navy : "transparent",
    color:active ? "#fff" : C.textSub,
  });

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:24, fontFamily:"'Inter', system-ui, sans-serif" }}>

      {/* ── Hero ── */}
      <div style={{
        background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
        borderRadius:20, padding:"28px 32px",
        display:"flex", alignItems:"center", gap:24,
        boxShadow:C.shadowLg, position:"relative", overflow:"hidden",
      }}>
        <div style={{ position:"absolute",right:-40,top:-40,width:200,height:200,borderRadius:"50%",background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute",right:60,bottom:-60,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.03)" }} />
        <div style={{
          width:56,height:56,borderRadius:16,flexShrink:0,background:scenario.iconBg,
          display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 12px rgba(0,0,0,0.2)",
        }}>
          <ScenarioIcon size={26} color={scenario.iconColor} />
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.45)",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:4 }}>Budget Simulation</div>
          <h2 style={{ fontSize:22,fontWeight:800,color:"#fff",margin:0,letterSpacing:"-0.5px" }}>{scenario.title}</h2>
          <p style={{ fontSize:14,color:"rgba(255,255,255,0.55)",margin:"4px 0 0" }}>{scenario.subtitle}</p>
        </div>
        <div style={{ display:"flex", gap:28, flexShrink:0 }}>
          {[
            { label:"Age", value:scenario.age },
            { label:"Income", value:`$${(scenario.userIncome/1000).toFixed(0)}K${scenario.partnerIncome ? ` + $${(scenario.partnerIncome/1000).toFixed(0)}K`:""}` },
            { label:"Children", value:scenario.children },
            ...(scenario.retirementSavings > 0 ? [{ label:"Retirement", value:fmtShort(scenario.retirementSavings) }] : []),
          ].map(({ label, value }) => (
            <div key={label} style={{ textAlign:"center" }}>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.4)",fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>{label}</div>
              <div style={{ fontSize:18,fontWeight:800,color:"#fff",letterSpacing:"-0.3px" }}>{value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr 1fr 1fr", gap:14 }}>
        <div style={{
          background:C.bg, border:`1px solid ${C.border}`,
          borderRadius:14, padding:"18px 22px",
          display:"flex", flexDirection:"column", justifyContent:"center", gap:12,
          boxShadow:C.shadow,
        }}>
          <HealthBar score={healthScore} />
          <div style={{ display:"flex", gap:20 }}>
            {[
              { label:"No negative months", met:annualStats.negativeMonths === 0 },
              { label:"Positive savings rate", met:annualStats.savingsRate > 0 },
              { label:"Challenge complete", met:validation.challengeMet },
            ].map(({ label, met }) => (
              <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                <div style={{ width:7,height:7,borderRadius:"50%",background:met?C.green:C.border,transition:"background 0.3s" }} />
                <span style={{ fontSize:11, color:met?C.textSub:C.textMuted }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
        <StatCard label="Annual Savings" value={fmtShort(annualStats.totalSavings)} sub={`${annualStats.savingsRate.toFixed(1)}% savings rate`} bg={annualStats.totalSavings>=0?C.greenSoft:C.redSoft} color={annualStats.totalSavings>=0?C.green:C.red} icon={annualStats.totalSavings>=0?TrendingUp:TrendingDown} />
        <StatCard label="Annual Expenses" value={fmtShort(annualStats.totalExpenses)} sub={`${pct(annualStats.totalExpenses,annualStats.totalIncome)}% of income`} icon={Activity} />
        <StatCard label="Negative Months" value={annualStats.negativeMonths} sub={annualStats.negativeMonths===0?"All months balanced":"months in deficit"} bg={annualStats.negativeMonths===0?C.greenSoft:C.redSoft} color={annualStats.negativeMonths===0?C.green:C.red} icon={annualStats.negativeMonths===0?CheckCircle2:AlertCircle} />
      </div>

      {/* ── Challenge ── */}
      <div style={{
        background:C.bg,
        border:`1.5px solid ${validation.challengeMet ? C.green : C.border}`,
        borderRadius:16, overflow:"hidden", boxShadow:C.shadowMd,
        transition:"border-color 0.3s",
      }}>
        <div style={{
          padding:"20px 24px",
          background:validation.challengeMet ? C.greenSoft : C.bgSoft,
          borderBottom:`1px solid ${validation.challengeMet ? "#BBF7D0" : C.border}`,
          display:"flex", alignItems:"flex-start", gap:14,
          transition:"background 0.3s",
        }}>
          <div style={{
            width:40,height:40,borderRadius:10,flexShrink:0,
            background:validation.challengeMet?C.greenMid:C.bgMid,
            display:"flex",alignItems:"center",justifyContent:"center",
          }}>
            <ChallengeIcon size={18} color={validation.challengeMet?C.green:C.textMuted} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:10,marginBottom:4 }}>
              <h3 style={{ margin:0,fontSize:16,fontWeight:700,color:C.text }}>{scenario.challenge.title}</h3>
              {validation.challengeMet && (
                <span style={{ display:"inline-flex",alignItems:"center",gap:4,background:C.green,color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20,letterSpacing:"0.05em" }}>
                  <CheckCircle2 size={10} /> COMPLETE
                </span>
              )}
            </div>
            <p style={{ margin:0,fontSize:13,color:C.textSub,lineHeight:1.6 }}>{scenario.challenge.description}</p>
          </div>
        </div>
        <div style={{ padding:"18px 24px 20px" }}>
          <div style={{ display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:16 }}>
            {scenario.challenge.requirements.map((req,i) => (
              <div key={i} style={{ padding:"12px 14px",background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:10,fontSize:12,color:C.textSub,lineHeight:1.55 }}>
                <span style={{ display:"block",fontSize:10,fontWeight:700,color:C.accent,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4 }}>Requirement {i+1}</span>
                {req}
              </div>
            ))}
          </div>
          {validation.challengeMet ? (
            <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:C.greenSoft,border:`1.5px solid #86EFAC`,borderRadius:12 }}>
              <CheckCircle2 size={20} color={C.green} />
              <div>
                <p style={{ margin:0,fontWeight:700,fontSize:14,color:"#14532D" }}>Challenge Complete</p>
                <p style={{ margin:0,fontSize:12,color:"#166534" }}>Your budget meets all requirements. Well done.</p>
              </div>
            </div>
          ) : (
            <div style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 18px",background:C.amberSoft,border:`1.5px solid #FCD34D`,borderRadius:12 }}>
              <AlertCircle size={20} color={C.amber} />
              <div>
                <p style={{ margin:0,fontWeight:700,fontSize:14,color:"#78350F" }}>Keep adjusting your budget</p>
                <p style={{ margin:0,fontSize:12,color:"#92400E" }}>Ensure all months stay positive and all requirements are satisfied.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"inline-flex",gap:4,padding:4,background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:10 }}>
          {[{ id:"table",label:"Budget Table" },{ id:"charts",label:"Charts" },{ id:"analysis",label:"Analysis" }].map(t => (
            <button key={t.id} style={tabStyle(activeTab===t.id)} onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>
        <button
          onClick={resetAll}
          style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 14px",background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:8,fontSize:12,fontWeight:600,color:C.textSub,cursor:"pointer" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor=C.borderMid; e.currentTarget.style.color=C.text; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.color=C.textSub; }}
        >
          <RotateCcw size={13} /> Reset All
        </button>
      </div>

      {/* ── Table Tab ── */}
      {activeTab === "table" && (
        <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadowMd }}>
          <div style={{ padding:"18px 24px 14px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <h3 style={{ margin:0,fontSize:15,fontWeight:700,color:C.text }}>Monthly Budget</h3>
              <p style={{ margin:"4px 0 0",fontSize:12,color:C.textSub }}>
                Use <strong style={{ color:C.navy }}>+/−</strong> to nudge values by $10. Click <strong style={{ color:C.accent }}>Apply all</strong> to copy a value across all 12 months.
                <span style={{ marginLeft:8,padding:"1px 7px",background:C.amberSoft,border:`1px solid ${C.amberMid}`,borderRadius:20,fontSize:11,color:C.amber,fontWeight:600 }}>Amber = discretionary</span>
              </p>
            </div>
          </div>
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%",borderCollapse:"collapse",fontSize:12 }}>
              <thead>
                <tr style={{ background:C.bgSoft }}>
                  <th style={{ padding:"10px 14px",textAlign:"left",fontWeight:700,color:C.textSub,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap" }}>Month</th>
                  <th style={{ padding:"10px 10px",textAlign:"right",fontWeight:700,color:C.green,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,background:C.greenSoft,whiteSpace:"nowrap" }}>Income</th>
                  {editableCols.map(col => (
                    <th key={col.key} style={{ padding:"10px 6px",textAlign:"center",fontWeight:700,color:DISCRETIONARY.has(col.key)?C.amber:C.textSub,fontSize:10,textTransform:"uppercase",letterSpacing:"0.06em",borderBottom:`2px solid ${C.border}`,background:DISCRETIONARY.has(col.key)?"#FFFBEB":"transparent",whiteSpace:"nowrap" }}>
                      <div style={{ display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}>
                        <span>{col.label}</span>
                        <button
                          onClick={() => applyToAll(col.key, budget[0][col.key])}
                          style={{ fontSize:9,padding:"1px 6px",borderRadius:4,background:DISCRETIONARY.has(col.key)?C.amberSoft:C.bgMid,border:`1px solid ${DISCRETIONARY.has(col.key)?C.amberMid:C.border}`,color:DISCRETIONARY.has(col.key)?C.amber:C.textMuted,cursor:"pointer",fontWeight:600,lineHeight:1.6 }}
                        >Apply all</button>
                      </div>
                    </th>
                  ))}
                  <th style={{ padding:"10px 10px",textAlign:"right",fontWeight:700,color:C.accent,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,background:C.accentSoft,whiteSpace:"nowrap" }}>Total Exp</th>
                  <th style={{ padding:"10px 10px",textAlign:"right",fontWeight:700,color:C.navy,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap" }}>Savings</th>
                  <th style={{ padding:"10px 10px",textAlign:"center",fontWeight:700,color:C.textMuted,fontSize:10,textTransform:"uppercase",letterSpacing:"0.07em",borderBottom:`2px solid ${C.border}`,whiteSpace:"nowrap" }}>Reset</th>
                </tr>
              </thead>
              <tbody>
                {budget.map((month, idx) => {
                  const { totalExpense, savings } = getRowTotals(month);
                  const isNegative = savings < 0;
                  return (
                    <tr key={idx} style={{ background:isNegative?"#FEF2F2":idx%2===0?C.bg:C.bgSoft,borderBottom:`1px solid ${C.border}` }}>
                      <td style={{ padding:"6px 14px",fontWeight:700,color:C.text,whiteSpace:"nowrap" }}>{month.month}</td>
                      <td style={{ padding:"6px 10px",textAlign:"right",fontWeight:700,color:C.green,background:C.greenSoft,whiteSpace:"nowrap" }}>{fmt(month.income)}</td>
                      {editableCols.map(col => {
                        const changed = isChanged(month, idx, col.key);
                        return (
                          <td key={col.key} style={{ padding:"4px 4px",textAlign:"center",background:DISCRETIONARY.has(col.key)?"#FFFDF5":"transparent" }}>
                            <div style={{ display:"flex",alignItems:"center",gap:2,justifyContent:"center" }}>
                              <button onClick={() => nudgeCell(idx, col.key, -10)} style={{ width:18,height:28,borderRadius:4,background:C.bgMid,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted,flexShrink:0 }}>
                                <Minus size={9} />
                              </button>
                              <input
                                type="number"
                                value={month[col.key]}
                                onChange={(e) => updateCell(idx, col.key, parseFloat(e.target.value)||0)}
                                style={{
                                  width:60,height:28,textAlign:"center",fontSize:12,
                                  fontWeight:changed?700:500,
                                  border:`1.5px solid ${changed?(DISCRETIONARY.has(col.key)?C.amber:C.accent):C.border}`,
                                  borderRadius:5,padding:"0 4px",
                                  background:changed?(DISCRETIONARY.has(col.key)?C.amberSoft:C.accentSoft):C.bg,
                                  color:changed?(DISCRETIONARY.has(col.key)?C.amber:C.accent):C.text,
                                  outline:"none",
                                }}
                              />
                              <button onClick={() => nudgeCell(idx, col.key, 10)} style={{ width:18,height:28,borderRadius:4,background:C.bgMid,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",color:C.textMuted,flexShrink:0 }}>
                                <Plus size={9} />
                              </button>
                            </div>
                          </td>
                        );
                      })}
                      <td style={{ padding:"6px 10px",textAlign:"right",fontWeight:700,color:C.accent,background:C.accentSoft,whiteSpace:"nowrap" }}>{fmt(totalExpense)}</td>
                      <td style={{ padding:"6px 10px",textAlign:"right",fontWeight:800,color:isNegative?C.red:C.green,whiteSpace:"nowrap" }}>
                        {isNegative?"−":"+"}{fmt(Math.abs(savings))}
                      </td>
                      <td style={{ padding:"6px 10px",textAlign:"center" }}>
                        <button onClick={() => resetRow(idx)} title="Reset this month" style={{ width:26,height:26,borderRadius:6,background:C.bgMid,border:`1px solid ${C.border}`,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center",color:C.textMuted }}>
                          <RotateCcw size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Charts Tab ── */}
      {activeTab === "charts" && (
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,padding:24,boxShadow:C.shadowMd }}>
            <h3 style={{ margin:"0 0 4px",fontSize:15,fontWeight:700,color:C.text }}>Monthly Overview</h3>
            <p style={{ margin:"0 0 20px",fontSize:12,color:C.textSub }}>Income, expenses, and savings across all 12 months</p>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={yearlyData} barSize={10} barGap={2}>
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
          </div>

          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
            <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,padding:24,boxShadow:C.shadowMd }}>
              <h3 style={{ margin:"0 0 4px",fontSize:15,fontWeight:700,color:C.text }}>Annual Spending Breakdown</h3>
              <p style={{ margin:"0 0 16px",fontSize:12,color:C.textSub }}>Where your money goes across the year</p>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} innerRadius={44} paddingAngle={2}>
                    {categoryData.map((_,i) => <Cell key={i} fill={CHART_COLORS[i%CHART_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ background:C.navy,border:"none",borderRadius:10,fontSize:12,color:"#fff" }} />
                  <Legend wrapperStyle={{ fontSize:11,paddingTop:8 }} formatter={(value,entry) => <span style={{ color:C.textSub }}>{value}: {fmtShort(entry.payload.value)}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,padding:24,boxShadow:C.shadowMd }}>
              <h3 style={{ margin:"0 0 4px",fontSize:15,fontWeight:700,color:C.text }}>Category Benchmarks</h3>
              <p style={{ margin:"0 0 16px",fontSize:12,color:C.textSub }}>Your spend vs. recommended % of monthly income</p>
              <div style={{ display:"flex",flexDirection:"column",gap:13 }}>
                {editableCols.filter(c => BENCHMARKS[c.key]).map(col => {
                  const avgMonthly = budget.reduce((s,m) => s+(m[col.key]||0),0)/12;
                  const avgIncome = budget.reduce((s,m) => s+m.income,0)/12;
                  const actualPct = avgIncome > 0 ? (avgMonthly/avgIncome)*100 : 0;
                  const targetPct = BENCHMARKS[col.key]*100;
                  const over = actualPct > targetPct + 2;
                  const color = over ? C.red : C.green;
                  return (
                    <div key={col.key}>
                      <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
                        <span style={{ fontSize:11,fontWeight:600,color:C.textSub }}>{col.label}</span>
                        <span style={{ fontSize:11,fontWeight:700,color }}>
                          {actualPct.toFixed(1)}%
                          <span style={{ color:C.textMuted,fontWeight:500 }}> / {targetPct}% guideline</span>
                        </span>
                      </div>
                      <div style={{ height:5,background:C.bgMid,borderRadius:99,position:"relative" }}>
                        <div style={{ width:`${Math.min(actualPct/targetPct*100,100)}%`,maxWidth:"100%",height:"100%",background:color,borderRadius:99,transition:"width 0.4s ease" }} />
                        <div style={{ position:"absolute",top:-2,left:"66.7%",width:1.5,height:9,background:C.borderMid }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Analysis Tab ── */}
      {activeTab === "analysis" && (
        <div style={{ display:"flex",flexDirection:"column",gap:20 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:20 }}>
            <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,padding:24,boxShadow:C.shadowMd }}>
              <RulePanel totalIncome={annualStats.totalIncome} totalNeeds={annualStats.totalNeeds} totalWants={annualStats.totalWants} totalSavings={annualStats.totalSavingsAlloc} />
            </div>
            <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,padding:24,boxShadow:C.shadowMd }}>
              <ProjectionPanel monthlySavings={annualStats.totalSavings} />
            </div>
          </div>

          <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,padding:24,boxShadow:C.shadowMd }}>
            <h3 style={{ margin:"0 0 4px",fontSize:15,fontWeight:700,color:C.text }}>Monthly Savings Rate</h3>
            <p style={{ margin:"0 0 20px",fontSize:12,color:C.textSub }}>How much of each month's income you retain after all expenses</p>
            <div style={{ display:"flex",gap:6,alignItems:"flex-end",height:130 }}>
              {budget.map((month, idx) => {
                const { savings } = getRowTotals(month);
                const rate = month.income > 0 ? savings/month.income : 0;
                const barH = Math.max(2, Math.min(100, Math.abs(rate)*100));
                const color = savings < 0 ? C.red : rate > 0.2 ? C.green : rate > 0.05 ? C.amber : C.accent;
                return (
                  <div key={idx} style={{ flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:4 }}>
                    <span style={{ fontSize:9,fontWeight:700,color,lineHeight:1 }}>{savings<0?"−":"+"}{Math.round(Math.abs(rate)*100)}%</span>
                    <div style={{ width:"100%",display:"flex",flexDirection:"column",justifyContent:"flex-end",height:80 }}>
                      <div style={{ width:"100%",height:barH,background:color,borderRadius:4,transition:"height 0.4s ease, background 0.3s ease",opacity:0.85 }} />
                    </div>
                    <span style={{ fontSize:9,color:C.textMuted,fontWeight:500 }}>{month.month}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Learning ── */}
      <div style={{ background:C.bg,border:`1px solid ${C.border}`,borderRadius:16,overflow:"hidden",boxShadow:C.shadow }}>
        <button
          onClick={() => setShowLearning(v => !v)}
          style={{ width:"100%",padding:"18px 24px",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:"none",cursor:"pointer",borderBottom:showLearning?`1px solid ${C.border}`:"none" }}
        >
          <div style={{ display:"flex",alignItems:"center",gap:12 }}>
            <div style={{ width:36,height:36,borderRadius:10,background:C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center" }}>
              <BookOpen size={17} color={C.accent} />
            </div>
            <div style={{ textAlign:"left" }}>
              <div style={{ fontSize:14,fontWeight:700,color:C.text }}>Key Learning Points</div>
              <div style={{ fontSize:12,color:C.textSub }}>What this simulation is designed to teach</div>
            </div>
          </div>
          {showLearning ? <ChevronUp size={17} color={C.textMuted} /> : <ChevronDown size={17} color={C.textMuted} />}
        </button>
        {showLearning && (
          <div style={{ padding:"16px 24px 20px",display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:14 }}>
            {scenario.teaching.map((point, i) => {
              const PointIcon = point.icon;
              return (
                <div key={i} style={{ padding:"16px 18px",background:C.bgSoft,border:`1px solid ${C.border}`,borderRadius:12 }}>
                  <div style={{ width:32,height:32,borderRadius:8,background:C.accentSoft,display:"flex",alignItems:"center",justifyContent:"center",marginBottom:10 }}>
                    <PointIcon size={15} color={C.accent} />
                  </div>
                  <div style={{ fontSize:13,fontWeight:700,color:C.text,marginBottom:6 }}>{point.title}</div>
                  <div style={{ fontSize:12,color:C.textSub,lineHeight:1.6 }}>{point.body}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Complete ── */}
      {validation.challengeMet && !completed && (
        <button
          onClick={() => { setCompleted(true); if (onComplete) onComplete(); }}
          style={{
            width:"100%",height:56,borderRadius:14,
            background:`linear-gradient(135deg, ${C.green} 0%, #15803D 100%)`,
            color:"#fff",fontSize:15,fontWeight:700,border:"none",cursor:"pointer",
            display:"flex",alignItems:"center",justifyContent:"center",gap:10,
            boxShadow:"0 4px 20px rgba(22,163,74,0.3)",
            transition:"transform 0.15s, box-shadow 0.15s",
            letterSpacing:"-0.2px",
          }}
          onMouseEnter={e => { e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow="0 8px 28px rgba(22,163,74,0.4)"; }}
          onMouseLeave={e => { e.currentTarget.style.transform="none"; e.currentTarget.style.boxShadow="0 4px 20px rgba(22,163,74,0.3)"; }}
        >
          <CheckCircle2 size={20} />
          Complete Challenge and Continue
        </button>
      )}
    </div>
  );
}