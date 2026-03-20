import React, { useState, useMemo, useCallback } from "react";
import {
  BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  CheckCircle2, AlertCircle, BookOpen, ChevronDown, ChevronUp,
  RotateCcw, Users, Bus, Tv, Briefcase, Coffee, Minus, Plus,
  BarChart2, Clock,
} from "lucide-react";

/* ─────────────────────────────────────────────────────────────
   TOKENS
───────────────────────────────────────────────────────────── */
const C = {
  navy:       "#1B2B5E",
  navyMid:    "#141E43",
  navyLight:  "#243570",
  accent:     "#2563EB",
  accentSoft: "#EFF6FF",
  accentMid:  "#BFDBFE",
  green:      "#15803D",
  greenSoft:  "#F0FDF4",
  greenMid:   "#86EFAC",
  amber:      "#D97706",
  amberSoft:  "#FFFBEB",
  amberMid:   "#FDE68A",
  red:        "#DC2626",
  redSoft:    "#FEF2F2",
  redMid:     "#FECACA",
  bg:         "#FFFFFF",
  bgSoft:     "#F8FAFC",
  bgMid:      "#F1F5F9",
  border:     "#E2E8F0",
  borderDark: "#CBD5E1",
  text:       "#0F172A",
  textSec:    "#475569",
  textMuted:  "#94A3B8",
};

/* ─────────────────────────────────────────────────────────────
   CONSTANTS — all unchanged from original
───────────────────────────────────────────────────────────── */
const MONTHS          = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const SUMMER          = new Set([4,5,6,7]);
const TEXTBOOK_TARGET = 600;

const fmt      = (v) => new Intl.NumberFormat("en-US",{style:"currency",currency:"USD",maximumFractionDigits:0}).format(v);
const fmtShort = (v) => { const a=Math.abs(v); const s=a>=1000?`$${(a/1000).toFixed(1)}K`:`$${Math.round(a)}`; return v<0?`-${s}`:s; };

const BASE_INCOME = (m) => SUMMER.has(m) ? 2000 : 1500;

const BASE = {
  housing:800, utilities:90, groceries:250, transportation:120,
  insurance:80, subscriptions:35, dining:180, misc:100, emergency:75,
};

function seasonal(m) {
  return {
    utilities: BASE.utilities + ([0,1,11].includes(m) ? 30 : 0),
    groceries: BASE.groceries + ([10,11].includes(m) ? 75 : 0),
  };
}

function buildRow(m) {
  const s = seasonal(m);
  return {
    month:MONTHS[m], income:BASE_INCOME(m),
    housing:BASE.housing, utilities:s.utilities, groceries:s.groceries,
    transportation:BASE.transportation, insurance:BASE.insurance,
    subscriptions:BASE.subscriptions, dining:BASE.dining,
    misc:BASE.misc, emergency:BASE.emergency, textbook:0,
  };
}

function initBudget() { return Array.from({length:12},(_,m)=>buildRow(m)); }

const EXPENSE_KEYS = [
  "housing","utilities","groceries","transportation",
  "insurance","subscriptions","dining","misc","emergency",
];

const LABELS = {
  housing:"Housing", utilities:"Utilities", groceries:"Groceries",
  transportation:"Transport", insurance:"Insurance",
  subscriptions:"Subscriptions", dining:"Dining", misc:"Misc", emergency:"Emergency",
};

const DISC = new Set(["dining","subscriptions","misc"]);

/* ─────────────────────────────────────────────────────────────
   MATH — unchanged
───────────────────────────────────────────────────────────── */
function totals(month) {
  const exp = EXPENSE_KEYS.reduce((s,k)=>s+(month[k]||0),0)+(month.textbook||0);
  return { totalExpense:exp, savings:month.income-exp };
}

/* ─────────────────────────────────────────────────────────────
   TRADEOFFS — unchanged
───────────────────────────────────────────────────────────── */
const TRADEOFFS = [
  { id:"roommate",   icon:Users,    title:"Find a Roommate",       sub:"-$150 housing/mo",        annualImpact:1800, delta:{housing:-150},       months:null     },
  { id:"cook_more",  icon:Coffee,   title:"Cook More, Dine Less",  sub:"-$60 dining/mo",          annualImpact:720,  delta:{dining:-60},          months:null     },
  { id:"transit",    icon:Bus,      title:"Campus Transit Pass",   sub:"-$40 transport/mo",       annualImpact:480,  delta:{transportation:-40},  months:null     },
  { id:"cut_subs",   icon:Tv,       title:"Audit Subscriptions",   sub:"-$20 subs/mo",            annualImpact:240,  delta:{subscriptions:-20},   months:null     },
  { id:"summer_hrs", icon:Briefcase,title:"Maximize Summer Hours", sub:"+$200 income (May–Aug)",  annualImpact:800,  delta:{income:200},          months:[4,5,6,7]},
];

/* ─────────────────────────────────────────────────────────────
   GLOBAL CSS
───────────────────────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  .csb-wrap * { box-sizing: border-box; }
  .csb-wrap { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif; background: #FFFFFF; }
  .csb-pill { cursor: pointer; transition: all 0.15s ease; }
  .csb-pill:hover { opacity: 0.88; transform: translateY(-1px); }
  .csb-tab { cursor: pointer; border: none; transition: all 0.15s; }
  .csb-exp-row:hover { background: #F8FAFC !important; }
  .csb-input-wrap { transition: border-color 0.15s; }
  .csb-input-wrap:focus-within { border-color: #2563EB !important; }
  .csb-nudge { cursor: pointer; transition: background 0.12s; border: none; }
  .csb-nudge:hover { background: #E2E8F0 !important; }
  .csb-num-input { border: none; outline: none; background: transparent; font-size: 14px; font-weight: 700; color: #0F172A; -moz-appearance: textfield; width: 100%; }
  .csb-num-input::-webkit-outer-spin-button, .csb-num-input::-webkit-inner-spin-button { -webkit-appearance: none; }
  @keyframes csb-in { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
  .csb-fade { animation: csb-in 0.28s ease both; }
`;

/* ─────────────────────────────────────────────────────────────
   CARD STYLE
───────────────────────────────────────────────────────────── */
const card = (extra={}) => ({
  background: C.bg,
  borderRadius: 16,
  border: `1px solid ${C.border}`,
  boxShadow: "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.04)",
  ...extra,
});

/* ─────────────────────────────────────────────────────────────
   RECHARTS TOOLTIP
───────────────────────────────────────────────────────────── */
function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background:C.navy, borderRadius:10, padding:"10px 14px", boxShadow:"0 8px 32px rgba(0,0,0,0.2)" }}>
      <p style={{ color:"rgba(255,255,255,0.5)", fontSize:11, fontWeight:600, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.06em" }}>{label}</p>
      {payload.map((p,i) => (
        <p key={i} style={{ color:p.color||"#fff", fontSize:13, fontWeight:600, margin:"2px 0" }}>{p.name}: {fmt(p.value)}</p>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function CollegeStudentBudget() {
  const [budget,          setBudget]         = useState(initBudget);
  const [activeTradeoffs, setActiveTradeoffs] = useState(new Set());
  const [activeTab,       setActiveTab]       = useState("table");
  const [showLearning,    setShowLearning]    = useState(false);
  const [completed,       setCompleted]       = useState(false);

  /* ── mutations — all unchanged ── */
  const updateCell = useCallback((mIdx, key, val) => {
    setBudget(prev => { const n=[...prev]; n[mIdx]={...n[mIdx],[key]:Math.max(0,Number(val)||0)}; return n; });
  }, []);

  const nudge = useCallback((mIdx, key, delta) => {
    setBudget(prev => { const n=[...prev]; n[mIdx]={...n[mIdx],[key]:Math.max(0,(n[mIdx][key]||0)+delta)}; return n; });
  }, []);

  // NEW: nudge all 12 months at once (for left panel controls)
  const nudgeAll = useCallback((key, delta) => {
    setBudget(prev => prev.map(month => ({ ...month, [key]: Math.max(0, (month[key]||0) + delta) })));
  }, []);

  const resetRow = useCallback((idx) => { setBudget(prev=>{const n=[...prev];n[idx]=buildRow(idx);return n;}); }, []);
  const resetAll = useCallback(() => { setBudget(initBudget()); setActiveTradeoffs(new Set()); setCompleted(false); }, []);

  const toggleTradeoff = useCallback((id) => {
    const t=TRADEOFFS.find(t=>t.id===id); const isOn=activeTradeoffs.has(id); const sign=isOn?-1:1;
    setBudget(prev => prev.map((month,idx) => {
      if(t.months&&!t.months.includes(idx)) return month;
      const u={...month};
      Object.entries(t.delta).forEach(([k,d])=>{ u[k]=Math.max(0,(u[k]||0)+sign*d); });
      return u;
    }));
    setActiveTradeoffs(prev => { const n=new Set(prev); if(isOn) n.delete(id); else n.add(id); return n; });
  }, [activeTradeoffs]);

  const setTextbook = useCallback((idx, val) => {
    setBudget(prev => { const n=[...prev]; n[idx]={...n[idx],textbook:Math.max(0,Number(val)||0)}; return n; });
  }, []);

  const autoDistribute = useCallback(() => {
    const targets=[0,1,8,9]; const each=Math.round(TEXTBOOK_TARGET/targets.length);
    setBudget(prev => {
      const n=prev.map(m=>({...m,textbook:0}));
      targets.forEach((idx,i)=>{ n[idx]={...n[idx],textbook:i===targets.length-1?TEXTBOOK_TARGET-each*(targets.length-1):each}; });
      return n;
    });
  }, []);

  /* ── derived — all unchanged ── */
  const monthly = useMemo(() => budget.map((m,idx) => {
    const {totalExpense,savings}=totals(m);
    return {...m,totalExpense,savings,isNeg:savings<0,isSummer:SUMMER.has(idx)};
  }), [budget]);

  const annual = useMemo(() => {
    const totalIncome   = budget.reduce((s,m)=>s+m.income,0);
    const totalExpenses = budget.reduce((s,m)=>s+totals(m).totalExpense,0);
    const totalSavings  = totalIncome-totalExpenses;
    const negMonths     = budget.filter(m=>totals(m).savings<0).length;
    const savingsRate   = totalIncome>0?(totalSavings/totalIncome)*100:0;
    const tbTotal       = budget.reduce((s,m)=>s+(m.textbook||0),0);
    const tbMonths      = budget.filter(m=>(m.textbook||0)>0).length;
    return {totalIncome,totalExpenses,totalSavings,negMonths,savingsRate,tbTotal,tbMonths};
  }, [budget]);

  const valid = useMemo(() => {
    const allPositive  = budget.every(m=>totals(m).savings>=0);
    const textbookMet  = annual.tbTotal>=598&&annual.tbTotal<=602&&annual.tbMonths>=4;
    const discChanged  = EXPENSE_KEYS.filter(k=>DISC.has(k)&&budget.some((m,i)=>m[k]!==buildRow(i)[k])).length;
    const discMet      = discChanged>=2;
    const challengeMet = allPositive&&textbookMet&&discMet;
    return {allPositive,textbookMet,discMet,discChanged,challengeMet};
  }, [budget, annual]);

  const health = useMemo(() => {
    let s=0;
    s+=Math.max(0,40-annual.negMonths*10);
    s+=Math.min(25,Math.max(0,annual.savingsRate*2));
    if(valid.challengeMet) s+=25; else if(valid.allPositive) s+=10;
    if(valid.textbookMet) s+=10;
    return Math.round(Math.min(100,s));
  }, [annual, valid]);

  const hColor = health>=75?C.green:health>=50?C.amber:C.red;
  const hLabel = health>=75?"Healthy":health>=50?"Needs Work":"At Risk";
  const reqCount = [valid.allPositive,valid.textbookMet,valid.discMet].filter(Boolean).length;

  // "What if you didn't spread the cost?" comparisons
  const spreadComparisons = useMemo(() => {
    const current = Math.min(...budget.map(m=>totals(m).savings));
    const septBudget = budget.map((m,idx)=>({...m,textbook:idx===8?600:0}));
    const concentrated = Math.min(...septBudget.map(m=>totals(m).savings));
    const noBookBudget = budget.map(m=>({...m,textbook:0}));
    const noBook = Math.min(...noBookBudget.map(m=>totals(m).savings));
    return {current, concentrated, noBook};
  }, [budget]);

  // Average value across all months for left panel display
  const avgVal = (key) => Math.round(budget.reduce((s,m)=>s+(m[key]||0),0)/12);

  // Spending breakdown for the bar
  const breakdown = useMemo(() => {
    const needsKeys    = ["housing","utilities","groceries","transportation","insurance","emergency"];
    const wantsKeys    = ["dining","subscriptions","misc"];
    const needs  = budget.reduce((s,m)=>s+needsKeys.reduce((a,k)=>a+(m[k]||0),0),0);
    const wants  = budget.reduce((s,m)=>s+wantsKeys.reduce((a,k)=>a+(m[k]||0),0),0);
    const total  = needs + wants;
    return { needsPct: total>0?Math.round(needs/total*100):0, wantsPct: total>0?Math.round(wants/total*100):0 };
  }, [budget]);

  /* ═══════════════════════════════════════════════════════════
     RENDER
  ═══════════════════════════════════════════════════════════ */
  return (
    <div className="csb-wrap" style={{ paddingBottom:60 }}>
      <style>{GLOBAL_CSS}</style>

      {/* ════════════════════════════════════
          HERO — matches Investment Simulator
      ════════════════════════════════════ */}
      <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 65%, #0F2344 100%)`, borderRadius:20, padding:"28px 32px", position:"relative", overflow:"hidden", marginBottom:16 }}>
        <div style={{ position:"absolute", inset:0, opacity:0.035, backgroundImage:"linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:-80, right:-80, width:360, height:360, borderRadius:"50%", background:"radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"relative", display:"flex", alignItems:"center", justifyContent:"space-between", gap:32, flexWrap:"wrap" }}>
          {/* Left */}
          <div style={{ flex:1, minWidth:260 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(255,255,255,0.09)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:999, padding:"4px 13px", marginBottom:16 }}>
              <span style={{ fontSize:11, fontWeight:600, color:"rgba(255,255,255,0.6)", letterSpacing:"0.07em" }}>Budget Simulation</span>
            </div>
            <h1 style={{ fontSize:28, fontWeight:900, color:"#fff", margin:"0 0 10px", lineHeight:1.15, letterSpacing:"-0.4px" }}>College Student Budget</h1>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.52)", margin:0, maxWidth:400, lineHeight:1.65 }}>
              Manage variable income, spread semester costs, and stay cash-flow positive all year.
            </p>
          </div>
          {/* Right — matches the "Projected Portfolio Value" card */}
          <div style={{ background:"rgba(255,255,255,0.09)", border:"1px solid rgba(255,255,255,0.14)", borderRadius:14, padding:"18px 22px", minWidth:210, flexShrink:0 }}>
            <div style={{ fontSize:10, color:"rgba(255,255,255,0.45)", fontWeight:700, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Budget Health Score</div>
            <div style={{ fontSize:36, fontWeight:900, color:hColor, letterSpacing:"-1px", lineHeight:1, marginBottom:4 }}>{health}</div>
            <div style={{ fontSize:13, fontWeight:600, color:hColor, marginBottom:14 }}>{hLabel}</div>
            <div style={{ height:3, background:"rgba(255,255,255,0.12)", borderRadius:999 }}>
              <div style={{ height:"100%", width:`${health}%`, borderRadius:999, background:hColor, transition:"width 0.5s ease" }} />
            </div>
            <div style={{ marginTop:10, display:"flex", gap:16 }}>
              <div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", marginBottom:2 }}>Summer</div>
                <div style={{ fontSize:13, fontWeight:800, color:"rgba(52,211,153,0.9)" }}>$2,000/mo</div>
              </div>
              <div>
                <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", marginBottom:2 }}>Semester</div>
                <div style={{ fontSize:13, fontWeight:800, color:"rgba(255,255,255,0.75)" }}>$1,500/mo</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════
          BUDGET LEVERS — scenario-button style
      ════════════════════════════════════ */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:10, marginBottom:16 }}>
        {TRADEOFFS.map(t => {
          const active = activeTradeoffs.has(t.id);
          const Icon   = t.icon;
          return (
            <div key={t.id} className="csb-pill"
              onClick={()=>toggleTradeoff(t.id)}
              style={{
                display:"flex", alignItems:"center", gap:12, padding:"13px 16px",
                borderRadius:12, border:`1.5px solid ${active?C.navy:C.border}`,
                background:active?C.navy:C.bg,
                boxShadow:active?"0 2px 12px rgba(31,58,100,0.2)":"0 1px 3px rgba(0,0,0,0.06)",
              }}>
              <div style={{ width:34, height:34, borderRadius:9, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:active?"rgba(255,255,255,0.12)":C.bgMid }}>
                <Icon size={15} color={active?"#fff":C.textSec} />
              </div>
              <div style={{ minWidth:0 }}>
                <div style={{ fontSize:12, fontWeight:700, color:active?"#fff":C.text, lineHeight:1.3, marginBottom:2 }}>{t.title}</div>
                <div style={{ fontSize:11, color:active?"rgba(255,255,255,0.55)":C.textMuted, lineHeight:1.3 }}>{t.sub}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ════════════════════════════════════
          TWO-COLUMN LAYOUT
      ════════════════════════════════════ */}
      <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>

        {/* ─── LEFT: Budget Controls (matches "Investment Settings") ─── */}
        <div style={{ width:340, flexShrink:0, position:"sticky", top:20, alignSelf:"flex-start" }}>
          <div style={card()}>
            {/* Panel header */}
            <div style={{ padding:"18px 20px 14px", borderBottom:`1px solid ${C.border}`, display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:30, height:30, borderRadius:8, background:C.bgMid, display:"flex", alignItems:"center", justifyContent:"center" }}>
                <BarChart2 size={14} color={C.textSec} />
              </div>
              <span style={{ fontSize:14, fontWeight:700, color:C.text }}>Budget Controls</span>
            </div>

            <div style={{ padding:"16px 20px" }}>
              {/* Income summary (non-editable) */}
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>Income</div>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
                  {[
                    { label:"Semester months", value:"$1,500", sub:"8 months" },
                    { label:"Summer months",   value:"$2,000", sub:"May–Aug"  },
                  ].map(({label,value,sub}) => (
                    <div key={label} style={{ background:C.bgSoft, borderRadius:10, padding:"10px 12px" }}>
                      <div style={{ fontSize:10, color:C.textMuted, marginBottom:4 }}>{label}</div>
                      <div style={{ fontSize:16, fontWeight:800, color:C.text }}>{value}</div>
                      <div style={{ fontSize:11, color:C.textMuted }}>{sub}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ height:1, background:C.border, marginBottom:16 }} />

              {/* Expense controls — one row per category */}
              <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>
                Monthly Expenses <span style={{ fontSize:10, fontWeight:500, color:C.textMuted, textTransform:"none", letterSpacing:0 }}>— applies to all months</span>
              </div>

              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {EXPENSE_KEYS.map(key => {
                  const val     = avgVal(key);
                  const isDisc  = DISC.has(key);
                  const changed = budget.some((m,i)=>m[key]!==buildRow(i)[key]);
                  return (
                    <div key={key}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:5 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:isDisc?C.amber:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em" }}>
                          {LABELS[key]}
                        </span>
                        {changed && <span style={{ fontSize:10, fontWeight:600, color:isDisc?C.amber:C.accent }}>modified</span>}
                      </div>
                      <div className="csb-input-wrap" style={{ display:"flex", alignItems:"center", gap:0, border:`1.5px solid ${changed?(isDisc?C.amberMid:C.accentMid):C.border}`, borderRadius:8, height:38, overflow:"hidden", background:changed?(isDisc?C.amberSoft:C.accentSoft):C.bg }}>
                        <span style={{ padding:"0 0 0 12px", fontSize:13, color:C.textMuted, userSelect:"none" }}>$</span>
                        <input
                          type="number"
                          className="csb-num-input"
                          value={val}
                          onChange={e => nudgeAll(key, (Number(e.target.value)||0) - val)}
                          style={{ flex:1, padding:"0 8px", fontSize:14, fontWeight:700, color:changed?(isDisc?C.amber:C.accent):C.text }}
                        />
                        <button className="csb-nudge" onClick={()=>nudgeAll(key,-10)}
                          style={{ width:32, height:"100%", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted, borderLeft:`1px solid ${C.border}` }}>
                          <Minus size={11} />
                        </button>
                        <button className="csb-nudge" onClick={()=>nudgeAll(key,10)}
                          style={{ width:32, height:"100%", background:"transparent", display:"flex", alignItems:"center", justifyContent:"center", color:C.textMuted, borderLeft:`1px solid ${C.border}` }}>
                          <Plus size={11} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ height:1, background:C.border, margin:"16px 0" }} />

              {/* Reset button — matches "Save Simulation" button style */}
              <button onClick={resetAll} style={{
                width:"100%", height:38, borderRadius:8, display:"flex", alignItems:"center", justifyContent:"center", gap:7,
                background:C.bgSoft, border:`1px solid ${C.border}`, fontSize:13, fontWeight:600, color:C.textSec, cursor:"pointer",
              }}>
                <RotateCcw size={13} /> Reset to defaults
              </button>
            </div>
          </div>
        </div>

        {/* ─── RIGHT: Results ─── */}
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16, minWidth:0 }}>

          {/* THREE METRIC CARDS — matches Final Value / Contributions / Interest */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12 }}>
            {/* Card 1: navy — Annual Income */}
            <div style={{ background:C.navy, borderRadius:16, padding:"20px 22px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:"rgba(255,255,255,0.45)", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Annual Income</div>
              <div style={{ fontSize:28, fontWeight:900, color:"#fff", letterSpacing:"-0.8px", lineHeight:1, marginBottom:6 }}>{fmt(annual.totalIncome)}</div>
              <div style={{ fontSize:12, color:"rgba(255,255,255,0.45)" }}>Semester + summer combined</div>
            </div>
            {/* Card 2: neutral — Annual Expenses */}
            <div style={card({ padding:"20px 22px" })}>
              <div style={{ fontSize:10, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Annual Expenses</div>
              <div style={{ fontSize:28, fontWeight:900, color:C.text, letterSpacing:"-0.8px", lineHeight:1, marginBottom:6 }}>{fmt(annual.totalExpenses)}</div>
              <div style={{ fontSize:12, color:C.textMuted }}>{(annual.totalExpenses/annual.totalIncome*100).toFixed(1)}% of annual income</div>
            </div>
            {/* Card 3: green/red — Annual Savings */}
            <div style={{ background:annual.totalSavings>=0?C.greenSoft:C.redSoft, border:`1px solid ${annual.totalSavings>=0?C.greenMid:C.redMid}`, borderRadius:16, padding:"20px 22px" }}>
              <div style={{ fontSize:10, fontWeight:700, color:annual.totalSavings>=0?C.green:C.red, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>Annual Savings</div>
              <div style={{ fontSize:28, fontWeight:900, color:annual.totalSavings>=0?C.green:C.red, letterSpacing:"-0.8px", lineHeight:1, marginBottom:6 }}>{fmtShort(annual.totalSavings)}</div>
              <div style={{ fontSize:12, color:annual.totalSavings>=0?C.green:C.red }}>{annual.savingsRate.toFixed(1)}% savings rate</div>
            </div>
          </div>

          {/* WHAT IF YOU DIDN'T SPREAD THE COST? — matches "What if you waited?" */}
          <div style={card({ padding:"18px 22px" })}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:16 }}>
              <Clock size={14} color={C.textMuted} />
              <span style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em" }}>
                What if you didn't spread the cost?
              </span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10 }}>
              {[
                { label:"Your plan",         value:spreadComparisons.current,      sub:"Current distribution",    primary:true  },
                { label:"All in September",  value:spreadComparisons.concentrated, sub:"$600 in one month",       primary:false },
                { label:"No textbooks",      value:spreadComparisons.noBook,       sub:"Best case (no costs)",    primary:false },
              ].map(({label,value,sub,primary}) => {
                const isNeg  = value<0;
                const isMain = primary;
                return (
                  <div key={label} style={{
                    padding:"14px 16px", borderRadius:12, textAlign:"center",
                    background: isMain ? C.navy : isNeg ? C.redSoft : C.bgSoft,
                    border: `1.5px solid ${isMain ? C.navy : isNeg ? C.redMid : C.border}`,
                  }}>
                    <div style={{ fontSize:11, fontWeight:600, color:isMain?"rgba(255,255,255,0.55)":C.textMuted, marginBottom:8 }}>{label}</div>
                    <div style={{ fontSize:20, fontWeight:900, color:isMain?"#fff":isNeg?C.red:C.green, letterSpacing:"-0.4px", marginBottom:4 }}>
                      {isNeg?"−":"+"}{fmtShort(Math.abs(value))}
                    </div>
                    <div style={{ fontSize:11, color:isMain?"rgba(255,255,255,0.45)":C.textMuted }}>worst month</div>
                    <div style={{ fontSize:10, color:isMain?"rgba(255,255,255,0.35)":C.textMuted, marginTop:3 }}>{sub}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* MONTHLY CASH FLOW — matches "Portfolio Growth Over Time" */}
          <div style={card({ padding:"20px 22px" })}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:4 }}>
              <h3 style={{ fontSize:15, fontWeight:700, color:C.text, margin:0 }}>Monthly Cash Flow</h3>
              <div style={{ display:"flex", gap:16 }}>
                {[{color:"#BBF7D0",label:"Income"},{color:C.accentMid,label:"Expenses"},{color:C.navy,label:"Remaining"}].map(({color,label})=>(
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <div style={{ width:24, height:3, borderRadius:2, background:color }} />
                    <span style={{ fontSize:11, color:C.textMuted }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
            <p style={{ fontSize:12, color:C.textMuted, margin:"0 0 18px" }}>
              Income drops $500/mo during semester months — expenses barely move
            </p>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={monthly} barSize={9} barGap={2} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke={C.bgMid} vertical={false} />
                <XAxis dataKey="month" tick={{fontSize:10,fill:C.textMuted}} axisLine={false} tickLine={false} />
                <YAxis tick={{fontSize:10,fill:C.textMuted}} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={36} />
                <ReferenceLine y={0} stroke={C.borderDark} />
                <Tooltip content={<ChartTip />} />
                <Bar dataKey="income"       name="Income"    fill="#BBF7D0" radius={[3,3,0,0]} />
                <Bar dataKey="totalExpense" name="Expenses"  fill={C.accentMid} radius={[3,3,0,0]} />
                <Bar dataKey="savings"      name="Remaining" radius={[3,3,0,0]}>
                  {monthly.map((entry,i)=>(
                    <Cell key={i} fill={entry.isNeg?C.redMid:SUMMER.has(i)?C.greenMid:C.navy+"99"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* TEXTBOOK PLANNER */}
          <div style={card({ padding:"20px 22px" })}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18, flexWrap:"wrap", gap:12 }}>
              <div>
                <h3 style={{ fontSize:15, fontWeight:700, color:C.text, margin:"0 0 3px" }}>Textbook Cost Planner</h3>
                <p style={{ fontSize:12, color:C.textMuted, margin:0 }}>Distribute $600 across 4+ months. Red months are over budget.</p>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:12, flexShrink:0 }}>
                <div style={{ textAlign:"right" }}>
                  <div style={{ fontSize:10, color:C.textMuted, marginBottom:2 }}>Allocated</div>
                  <div style={{ fontSize:18, fontWeight:900, color:annual.tbTotal>602?C.red:annual.tbTotal>=598?C.green:C.text }}>{fmt(annual.tbTotal)} <span style={{ fontSize:12, color:C.textMuted, fontWeight:500 }}>/ $600</span></div>
                </div>
                <button onClick={autoDistribute} style={{ padding:"8px 14px", borderRadius:8, fontSize:12, fontWeight:700, color:C.accent, background:C.accentSoft, border:`1px solid ${C.accentMid}`, cursor:"pointer", whiteSpace:"nowrap" }}>
                  Distribute evenly
                </button>
              </div>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:8 }}>
              {budget.map((m,idx) => {
                const {savings,isNeg} = monthly[idx];
                const isSummer        = SUMMER.has(idx);
                const hasBook         = (m.textbook||0)>0;
                return (
                  <div key={idx} style={{
                    borderRadius:10, padding:"10px 8px", textAlign:"center",
                    background: isNeg?C.redSoft:hasBook?C.accentSoft:C.bgSoft,
                    border:`1.5px solid ${isNeg?C.redMid:hasBook?C.accentMid:"transparent"}`,
                    transition:"all 0.2s",
                  }}>
                    <div style={{ fontSize:10, fontWeight:700, color:isSummer?C.green:C.textSec, marginBottom:2 }}>{m.month}</div>
                    <div style={{ fontSize:10, color:C.textMuted, marginBottom:6 }}>{fmtShort(m.income)}</div>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:2, background:C.bg, borderRadius:6, padding:"3px 4px", border:`1px solid ${C.border}` }}>
                      <button onClick={()=>setTextbook(idx,(m.textbook||0)-25)} style={{ width:16,height:18,border:"none",background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,color:C.textMuted }}>
                        <Minus size={9} />
                      </button>
                      <input type="number" value={m.textbook||0} onChange={e=>setTextbook(idx,e.target.value)}
                        className="csb-num-input" style={{ width:36,textAlign:"center",fontSize:11,fontWeight:700,color:hasBook?C.accent:C.text }} />
                      <button onClick={()=>setTextbook(idx,(m.textbook||0)+25)} style={{ width:16,height:18,border:"none",background:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",padding:0,color:C.textMuted }}>
                        <Plus size={9} />
                      </button>
                    </div>
                    {isNeg&&<div style={{ fontSize:9,color:C.red,fontWeight:700,marginTop:4 }}>Over</div>}
                    {!isNeg&&hasBook&&<div style={{ fontSize:9,color:C.green,fontWeight:600,marginTop:4 }}>{fmt(savings)} left</div>}
                  </div>
                );
              })}
            </div>
            {annual.tbTotal>0&&(
              <div style={{ marginTop:12, padding:"9px 14px", borderRadius:8, fontSize:12, fontWeight:500,
                background:valid.textbookMet?C.greenSoft:annual.tbTotal>602?C.redSoft:C.amberSoft,
                color:valid.textbookMet?C.green:annual.tbTotal>602?C.red:C.amber }}>
                {valid.textbookMet ? `All $600 distributed across ${annual.tbMonths} months.`
                  : annual.tbTotal>602 ? `Over target — ${fmt(annual.tbTotal)} allocated.`
                  : `${fmt(annual.tbTotal)} of $600 across ${annual.tbMonths} month${annual.tbMonths!==1?"s":""}.`}
              </div>
            )}
          </div>

          {/* CHALLENGE — dynamic border color */}
          <div style={{ ...card(), border:`1.5px solid ${valid.challengeMet?C.greenMid:C.border}`, background:valid.challengeMet?C.greenSoft:C.bg, transition:"all 0.3s" }}>
            <div style={{ padding:"18px 22px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                <div>
                  <h3 style={{ fontSize:15, fontWeight:700, color:C.text, margin:"0 0 4px" }}>Textbook Challenge</h3>
                  <p style={{ fontSize:13, color:C.textSec, margin:0, lineHeight:1.55, maxWidth:460 }}>
                    Stay non-negative every month, distribute $600 across 4+ months, and adjust two spending categories.
                  </p>
                </div>
                {valid.challengeMet&&(
                  <div style={{ display:"flex", alignItems:"center", gap:5, background:C.green, color:"#fff", padding:"5px 12px", borderRadius:999, flexShrink:0, marginLeft:16 }}>
                    <CheckCircle2 size={12}/><span style={{ fontSize:12, fontWeight:700 }}>Complete</span>
                  </div>
                )}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {[
                  { met:valid.allPositive,   label:"Stay non-negative every month",      status:annual.negMonths===0?"All 12 months balanced":`${annual.negMonths} month${annual.negMonths>1?"s":""} in deficit` },
                  { met:valid.textbookMet,   label:"Distribute $600 across 4+ months",  status:annual.tbTotal>0?`${fmt(annual.tbTotal)} across ${annual.tbMonths} months`:"Not started" },
                  { met:valid.discMet,       label:"Adjust 2+ discretionary categories",status:`${valid.discChanged} of 3 adjusted` },
                ].map(({met,label,status},i)=>(
                  <div key={label} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 0", borderBottom:i<2?`1px solid ${C.border}`:"none" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:met?C.green:C.bgMid, transition:"background 0.3s" }}>
                      {met ? <CheckCircle2 size={11} color="#fff"/> : <div style={{ width:5, height:5, borderRadius:"50%", background:C.textMuted }} />}
                    </div>
                    <span style={{ flex:1, fontSize:13, fontWeight:600, color:C.text }}>{label}</span>
                    <span style={{ fontSize:12, color:met?C.green:C.textMuted, fontWeight:met?600:400 }}>{status}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop:14, height:3, background:C.bgMid, borderRadius:999, overflow:"hidden" }}>
                <div style={{ height:"100%", width:`${(reqCount/3)*100}%`, borderRadius:999, background:`linear-gradient(90deg, ${C.accent}, ${valid.challengeMet?C.green:C.accent})`, transition:"width 0.5s, background 0.5s" }} />
              </div>
            </div>
          </div>

          {/* BALANCE BREAKDOWN — matches the simulator's horizontal stacked bar */}
          <div style={card({ padding:"18px 22px" })}>
            <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:12 }}>Spending Breakdown</div>
            <div style={{ height:10, borderRadius:999, overflow:"hidden", display:"flex", marginBottom:10 }}>
              <div style={{ width:`${breakdown.needsPct}%`, background:C.navy, transition:"width 0.5s ease" }} />
              <div style={{ width:`${breakdown.wantsPct}%`, background:C.accentMid, transition:"width 0.5s ease" }} />
              <div style={{ flex:1, background:C.greenMid }} />
            </div>
            <div style={{ display:"flex", gap:20 }}>
              {[
                { color:C.navy,     label:`Needs — ${breakdown.needsPct}%`  },
                { color:C.accentMid,label:`Wants — ${breakdown.wantsPct}%`  },
                { color:C.greenMid, label:`Savings — ${100-breakdown.needsPct-breakdown.wantsPct}%` },
              ].map(({color,label})=>(
                <div key={label} style={{ display:"flex", alignItems:"center", gap:6 }}>
                  <div style={{ width:10, height:10, borderRadius:3, background:color }} />
                  <span style={{ fontSize:12, color:C.textSec }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>{/* end right panel */}
      </div>{/* end two-column */}

      {/* ════════════════════════════════════
          DETAIL TABS (full width below)
      ════════════════════════════════════ */}
      <div style={{ marginTop:16 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
          <div style={{ display:"inline-flex", gap:3, padding:3, background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:10 }}>
            {[{id:"table",label:"Monthly Table"},{id:"charts",label:"Charts"},{id:"analysis",label:"Analysis"}].map(t=>(
              <button key={t.id} className="csb-tab" onClick={()=>setActiveTab(t.id)} style={{ padding:"8px 18px", borderRadius:8, fontSize:13, fontWeight:600, background:activeTab===t.id?C.navy:"transparent", color:activeTab===t.id?"#fff":C.textSec }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* TABLE */}
        {activeTab==="table"&&(
          <div className="csb-fade" style={{ ...card(), padding:0, overflow:"hidden" }}>
            <div style={{ padding:"14px 20px 12px", borderBottom:`1px solid ${C.border}` }}>
              <h3 style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:C.text }}>Monthly Budget Table</h3>
              <p style={{ margin:0, fontSize:12, color:C.textMuted }}>
                Use +/− to nudge individual months by $10. <span style={{ color:C.amber, fontWeight:600 }}>Amber</span> = discretionary.
              </p>
            </div>
            <div style={{ overflowX:"auto" }}>
              <table style={{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
                <thead>
                  <tr style={{ background:C.bgSoft }}>
                    <th style={{ padding:"9px 14px", textAlign:"left", fontWeight:700, color:C.textSec, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>Month</th>
                    <th style={{ padding:"9px 10px", textAlign:"right", fontWeight:700, color:C.green, fontSize:10, textTransform:"uppercase", letterSpacing:"0.07em", borderBottom:`1px solid ${C.border}`, background:C.greenSoft, whiteSpace:"nowrap" }}>Income</th>
                    {EXPENSE_KEYS.map(key=>(
                      <th key={key} style={{ padding:"9px 5px", textAlign:"center", fontWeight:700, color:DISC.has(key)?C.amber:C.textSec, fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", borderBottom:`1px solid ${C.border}`, background:DISC.has(key)?"#FFFBEB":"transparent", whiteSpace:"nowrap" }}>
                        {LABELS[key]}
                      </th>
                    ))}
                    <th style={{ padding:"9px 10px", textAlign:"right", fontWeight:700, color:C.accent, fontSize:10, textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, background:C.accentSoft, whiteSpace:"nowrap" }}>Total</th>
                    <th style={{ padding:"9px 10px", textAlign:"right", fontWeight:700, color:C.navy, fontSize:10, textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>Remaining</th>
                    <th style={{ padding:"9px 10px", textAlign:"center", fontWeight:700, color:C.textMuted, fontSize:10, textTransform:"uppercase", borderBottom:`1px solid ${C.border}`, whiteSpace:"nowrap" }}>Reset</th>
                  </tr>
                </thead>
                <tbody>
                  {budget.map((m,idx)=>{
                    const {totalExpense,savings}=totals(m);
                    const isNeg=savings<0; const isSummer=SUMMER.has(idx);
                    return (
                      <tr key={idx} className="csb-exp-row" style={{ background:isNeg?"#FEF2F2":isSummer?"#F0FDF4":idx%2===0?C.bg:C.bgSoft, borderBottom:`1px solid ${C.border}` }}>
                        <td style={{ padding:"5px 14px", fontWeight:700, color:C.text, whiteSpace:"nowrap" }}>
                          {m.month}
                          {isSummer&&<span style={{ marginLeft:5, fontSize:9, fontWeight:700, color:C.green, background:C.greenSoft, padding:"1px 5px", borderRadius:4 }}>S</span>}
                        </td>
                        <td style={{ padding:"5px 10px", textAlign:"right", fontWeight:700, color:isSummer?C.green:C.textSec, background:isSummer?"#E8FEF1":C.greenSoft, whiteSpace:"nowrap" }}>{fmt(m.income)}</td>
                        {EXPENSE_KEYS.map(key=>{
                          const changed=m[key]!==buildRow(idx)[key];
                          return (
                            <td key={key} style={{ padding:"2px 2px", textAlign:"center", background:DISC.has(key)?"#FFFDF7":"transparent" }}>
                              <div style={{ display:"flex", alignItems:"center", gap:1, justifyContent:"center" }}>
                                <button onClick={()=>nudge(idx,key,-10)} style={{ width:17,height:24,borderRadius:3,background:C.bgMid,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Minus size={8} color={C.textMuted}/></button>
                                <input type="number" value={m[key]} onChange={e=>updateCell(idx,key,e.target.value)} style={{ width:54,height:24,textAlign:"center",fontSize:11,fontWeight:changed?700:500,border:`1.5px solid ${changed?(DISC.has(key)?C.amberMid:C.accentMid):C.border}`,borderRadius:4,padding:"0 3px",background:changed?(DISC.has(key)?C.amberSoft:C.accentSoft):C.bg,color:changed?(DISC.has(key)?C.amber:C.accent):C.text,outline:"none" }}/>
                                <button onClick={()=>nudge(idx,key,10)} style={{ width:17,height:24,borderRadius:3,background:C.bgMid,border:`1px solid ${C.border}`,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Plus size={8} color={C.textMuted}/></button>
                              </div>
                            </td>
                          );
                        })}
                        <td style={{ padding:"5px 10px", textAlign:"right", fontWeight:700, color:C.accent, background:C.accentSoft, whiteSpace:"nowrap" }}>{fmt(totalExpense)}</td>
                        <td style={{ padding:"5px 10px", textAlign:"right", fontWeight:800, color:isNeg?C.red:C.green, whiteSpace:"nowrap" }}>{isNeg?"−":"+"}{fmt(Math.abs(savings))}</td>
                        <td style={{ padding:"5px 10px", textAlign:"center" }}>
                          <button onClick={()=>resetRow(idx)} style={{ width:24,height:24,borderRadius:5,background:C.bgMid,border:`1px solid ${C.border}`,cursor:"pointer",display:"inline-flex",alignItems:"center",justifyContent:"center" }}>
                            <RotateCcw size={10} color={C.textMuted}/>
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

        {/* CHARTS */}
        {activeTab==="charts"&&(
          <div className="csb-fade" style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={card({ padding:"20px 22px" })}>
                <h3 style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:C.text }}>Cash Remaining by Month</h3>
                <p style={{ margin:"0 0 16px", fontSize:12, color:C.textMuted }}>After all expenses including textbooks</p>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthly} barSize={20}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.bgMid} vertical={false}/>
                    <XAxis dataKey="month" tick={{fontSize:9,fill:C.textMuted}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fontSize:9,fill:C.textMuted}} axisLine={false} tickLine={false} tickFormatter={fmtShort} width={32}/>
                    <ReferenceLine y={0} stroke={C.borderDark}/>
                    <Tooltip formatter={v=>[fmt(v),"Remaining"]} contentStyle={{background:C.navy,border:"none",borderRadius:8,fontSize:12,color:"#fff"}}/>
                    <Bar dataKey="savings" radius={[3,3,0,0]}>
                      {monthly.map((e,i)=><Cell key={i} fill={e.isNeg?C.redMid:SUMMER.has(i)?C.greenMid:C.navy+"99"}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div style={card({ padding:"20px 22px" })}>
                <h3 style={{ margin:"0 0 3px", fontSize:14, fontWeight:700, color:C.text }}>Textbook Distribution</h3>
                <p style={{ margin:"0 0 16px", fontSize:12, color:C.textMuted }}>{fmt(annual.tbTotal)} of $600 allocated</p>
                <div style={{ display:"flex", gap:4, alignItems:"flex-end", height:120 }}>
                  {budget.map((m,idx)=>{
                    const book=m.textbook||0; const isNeg=monthly[idx]?.isNeg;
                    const barH=book>0?Math.max(8,(book/TEXTBOOK_TARGET)*100):3;
                    return (
                      <div key={idx} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
                        {book>0&&<span style={{ fontSize:9, fontWeight:700, color:isNeg?C.red:C.accent }}>{fmtShort(book)}</span>}
                        <div style={{ width:"100%", flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                          <div style={{ width:"100%", height:barH, background:isNeg?C.redMid:book>0?C.accentMid:C.bgMid, borderRadius:3, transition:"height 0.3s" }}/>
                        </div>
                        <span style={{ fontSize:9, color:C.textMuted }}>{m.month}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ANALYSIS */}
        {activeTab==="analysis"&&(
          <div className="csb-fade" style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
              <div style={card({ padding:"20px 22px" })}>
                <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:C.text }}>Income Gap</h3>
                {[
                  { label:"Summer income (4 mo)", value:fmt(budget.filter((_,i)=>SUMMER.has(i)).reduce((s,m)=>s+m.income,0)), color:C.green },
                  { label:"Semester income (8 mo)", value:fmt(budget.filter((_,i)=>!SUMMER.has(i)).reduce((s,m)=>s+m.income,0)), color:C.text },
                  { label:"Monthly gap", value:"$500", color:C.amber },
                  { label:"Annual impact", value:"$4,000", color:C.amber },
                ].map(({label,value,color})=>(
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:`1px solid ${C.border}` }}>
                    <span style={{ fontSize:13, color:C.textSec }}>{label}</span>
                    <span style={{ fontSize:13, fontWeight:700, color }}>{value}</span>
                  </div>
                ))}
                <p style={{ fontSize:12, color:C.textSec, marginTop:12, lineHeight:1.65, marginBottom:0 }}>
                  Build summer surplus to cover the semester dip — save ahead, not after.
                </p>
              </div>
              <div style={card({ padding:"20px 22px" })}>
                <h3 style={{ margin:"0 0 16px", fontSize:14, fontWeight:700, color:C.text }}>Discretionary Spending</h3>
                {["dining","subscriptions","misc"].map(key=>{
                  const avg=budget.reduce((s,m)=>s+(m[key]||0),0)/12;
                  const def=BASE[key]; const changed=budget.some((m,i)=>m[key]!==buildRow(i)[key]);
                  const saved=(def-avg)*12;
                  return (
                    <div key={key} style={{ marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12, fontWeight:600, color:C.text }}>{LABELS[key]}</span>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ fontSize:12, fontWeight:700, color:C.text }}>{fmt(avg)}/mo</span>
                          {changed&&saved>0&&<span style={{ fontSize:11, color:C.green, fontWeight:600 }}>−{fmt(saved)}/yr</span>}
                        </div>
                      </div>
                      <div style={{ height:4, background:C.bgMid, borderRadius:99 }}>
                        <div style={{ width:`${Math.min((avg/(def*1.5))*100,100)}%`, height:"100%", background:changed?C.green:C.amber, borderRadius:99, transition:"width 0.4s" }}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div style={card({ padding:"20px 22px" })}>
              <h3 style={{ margin:"0 0 18px", fontSize:14, fontWeight:700, color:C.text }}>Budget Assessment</h3>
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {[
                  { show:annual.negMonths>0,    type:"warn", title:"Negative months detected",       body:`${annual.negMonths} month${annual.negMonths>1?"s are":" is"} over budget. Cut dining or misc first.` },
                  { show:annual.negMonths===0,  type:"good", title:"All months cash-flow positive",  body:"Every month ends in the black — the foundation of a healthy student budget." },
                  { show:!valid.textbookMet&&annual.tbTotal<598, type:"warn", title:"Textbooks not fully distributed", body:`${fmt(annual.tbTotal)} of $600 allocated. Spread the remainder.` },
                  { show:valid.textbookMet,     type:"good", title:"Textbook cost distributed",      body:`$600 spread across ${annual.tbMonths} months — the right approach to semester costs.` },
                  { show:annual.savingsRate<5,  type:"info", title:"Low savings rate",               body:"Even $50/month builds resilience. Use summer months — income is higher, costs are identical." },
                  { show:annual.savingsRate>=5, type:"good", title:`${annual.savingsRate.toFixed(0)}% savings rate`, body:"A positive savings rate on student income is a strong habit." },
                ].filter(x=>x.show).slice(0,4).map(({type,title,body},i,arr)=>{
                  const color=type==="good"?C.green:type==="warn"?C.amber:C.accent;
                  return (
                    <div key={title} style={{ display:"flex", gap:12, alignItems:"flex-start", padding:"12px 0", borderBottom:i<arr.length-1?`1px solid ${C.border}`:"none" }}>
                      <div style={{ width:7, height:7, borderRadius:"50%", background:color, flexShrink:0, marginTop:5 }}/>
                      <div>
                        <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:3 }}>{title}</div>
                        <div style={{ fontSize:12, color:C.textSec, lineHeight:1.6 }}>{body}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ════════════════════════════════════
          LEARNING ACCORDION
      ════════════════════════════════════ */}
      <div style={{ ...card(), marginTop:14, padding:0, overflow:"hidden" }}>
        <button onClick={()=>setShowLearning(v=>!v)} style={{ width:"100%", padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between", background:"none", border:"none", cursor:"pointer", borderBottom:showLearning?`1px solid ${C.border}`:"none" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <BookOpen size={15} color={C.textMuted}/>
            <span style={{ fontSize:14, fontWeight:700, color:C.text }}>Key lessons from this simulation</span>
          </div>
          {showLearning?<ChevronUp size={15} color={C.textMuted}/>:<ChevronDown size={15} color={C.textMuted}/>}
        </button>
        {showLearning&&(
          <div style={{ padding:"22px", display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:0 }}>
            {[
              { title:"Variable income planning",     body:"Build a buffer during high-income months to cover the lean ones. Summer surplus is your semester safety net." },
              { title:"Avoiding negative cash flow",  body:"Spending more than you earn — even for one month — creates a debt spiral that compounds quickly." },
              { title:"Planning for irregular costs", body:"Large one-time costs like textbooks should be anticipated in advance and spread over time, not absorbed in one hit." },
            ].map((p,i)=>(
              <div key={i} style={{ paddingRight:i<2?28:0, paddingLeft:i>0?28:0, borderLeft:i>0?`1px solid ${C.border}`:"none" }}>
                <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:7 }}>{p.title}</div>
                <div style={{ fontSize:13, color:C.textSec, lineHeight:1.65 }}>{p.body}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ════════════════════════════════════
          COMPLETION
      ════════════════════════════════════ */}
      {valid.challengeMet&&!completed&&(
        <div className="csb-fade" style={{ marginTop:14 }}>
          <div style={{ background:`linear-gradient(135deg, ${C.navy} 0%, #0F2344 100%)`, borderRadius:20, padding:"30px 36px", marginBottom:14, position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", inset:0, opacity:0.03, backgroundImage:"linear-gradient(rgba(255,255,255,0.7) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.7) 1px,transparent 1px)", backgroundSize:"40px 40px", pointerEvents:"none" }}/>
            <div style={{ fontSize:11, color:"rgba(255,255,255,0.42)", fontWeight:600, letterSpacing:"0.08em", textTransform:"uppercase", marginBottom:8 }}>Challenge complete</div>
            <div style={{ fontSize:22, fontWeight:900, color:"#fff", marginBottom:22, letterSpacing:"-0.4px" }}>You managed a student budget under real constraints.</div>
            <div style={{ display:"flex", gap:40, flexWrap:"wrap" }}>
              {[
                { label:"Negative months",  value:`${annual.negMonths}`,           good:annual.negMonths===0  },
                { label:"Textbook spread",  value:`${annual.tbMonths} months`,      good:true                 },
                { label:"Annual savings",   value:fmtShort(annual.totalSavings),    good:annual.totalSavings>=0},
                { label:"Health score",     value:`${health}/100`,                  good:health>=60            },
              ].map(({label,value,good})=>(
                <div key={label}>
                  <div style={{ fontSize:10, color:"rgba(255,255,255,0.38)", fontWeight:600, marginBottom:4 }}>{label}</div>
                  <div style={{ fontSize:22, fontWeight:900, color:good?"#34D399":"#FCA5A5" }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14, marginBottom:14 }}>
            <div style={{ ...card(), background:C.greenSoft, border:`1px solid ${C.greenMid}`, padding:"22px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.green, marginBottom:14 }}>What you accomplished</div>
              {[
                annual.negMonths===0&&"Kept every month cash-flow positive despite uneven income",
                valid.textbookMet&&`Spread $600 across ${annual.tbMonths} months without going negative`,
                valid.discMet&&`Adjusted ${valid.discChanged} discretionary categories to create room`,
                activeTradeoffs.size>0&&`Applied ${activeTradeoffs.size} real-world budget lever${activeTradeoffs.size>1?"s":""}`,
              ].filter(Boolean).map((w,i)=>(
                <div key={i} style={{ display:"flex", gap:9, alignItems:"flex-start", marginBottom:i<3?9:0 }}>
                  <CheckCircle2 size={13} color={C.green} style={{ flexShrink:0, marginTop:2 }}/>
                  <span style={{ fontSize:12, color:"#166534", lineHeight:1.55 }}>{w}</span>
                </div>
              ))}
            </div>
            <div style={{ ...card(), padding:"22px" }}>
              <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:10 }}>The core lesson</div>
              <p style={{ fontSize:13, color:C.textSec, lineHeight:1.7, margin:"0 0 14px" }}>
                Variable income doesn't mean variable discipline. Fixed expenses arrive every month — the skill is building buffers during the good months to cover the lean ones.
              </p>
              <div style={{ fontSize:13, fontWeight:600, color:C.accent }}>
                Next: Build an emergency fund before your next semester starts.
              </div>
            </div>
          </div>
          <button onClick={()=>setCompleted(true)} style={{ width:"100%", height:50, borderRadius:13, background:C.navy, color:"#fff", fontSize:14, fontWeight:700, border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:9 }}>
            <CheckCircle2 size={16}/> Mark challenge complete
          </button>
        </div>
      )}

      {completed&&(
        <div style={{ padding:"20px 24px", background:C.greenSoft, border:`1.5px solid ${C.greenMid}`, borderRadius:14, marginTop:14, textAlign:"center" }}>
          <div style={{ fontSize:15, fontWeight:700, color:C.green, marginBottom:4 }}>Challenge complete</div>
          <div style={{ fontSize:13, color:"#166534" }}>You have finished the College Student Budget simulation.</div>
        </div>
      )}
    </div>
  );
}