import { useState, useMemo, useCallback } from "react";

/* ─────────────────────────────────────────────────────────────
   DESIGN TOKENS  — aligned to Sprout's Investment Simulator
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
  amber:      "#92400E",
  amberSoft:  "#FFFBEB",
  amberMid:   "#FDE68A",
  red:        "#991B1B",
  redSoft:    "#FEF2F2",
  redMid:     "#FECACA",
  bg:         "#F5F7FB",
  card:       "#FFFFFF",
  surface:    "#F8FAFC",
  border:     "#E5E7EB",
  borderDark: "#D1D5DB",
  text:       "#0F172A",
  textSec:    "#475569",
  textMuted:  "#94A3B8",
  white:      "#FFFFFF",
};

const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  .byb-wrap * { box-sizing: border-box; }
  .byb-wrap { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif; background: #FFFFFF; min-height: 100vh; }
  .byb-persona:hover  { border-color: #2563EB !important; background: #EFF6FF !important; transform: translateY(-1px); }
  .byb-persona.active { border-color: #2563EB !important; background: #EFF6FF !important; }
  .byb-btn-primary { cursor: pointer; transition: all 0.18s ease; }
  .byb-btn-primary:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
  .byb-btn-primary:active:not(:disabled) { transform: translateY(0); }
  .byb-btn-primary:disabled { opacity: 0.45; cursor: not-allowed; }
  .byb-btn-ghost { cursor: pointer; transition: all 0.18s ease; }
  .byb-btn-ghost:hover:not(:disabled) { background: #E5E7EB !important; }
  .byb-btn-ghost:disabled { opacity: 0.4; cursor: not-allowed; }
  .byb-sort-card { cursor: pointer; user-select: none; transition: all 0.18s ease; }
  .byb-sort-card:hover { transform: translateY(-2px); box-shadow: 0 4px 14px rgba(0,0,0,0.10) !important; }
  .byb-exp-row:hover { background: #F8FAFC !important; }
  .byb-num-input { width: 88px; padding: 6px 10px; border: 1.5px solid #D1D5DB; border-radius: 8px; font-size: 14px; font-weight: 600; color: #0F172A; text-align: right; outline: none; transition: border-color 0.15s; -moz-appearance: textfield; }
  .byb-num-input:focus { border-color: #2563EB; }
  .byb-num-input::-webkit-outer-spin-button, .byb-num-input::-webkit-inner-spin-button { -webkit-appearance: none; }
  .byb-goal-btn { cursor: pointer; transition: all 0.15s ease; border: 2px solid #E5E7EB; border-radius: 10px; padding: 10px 18px; background: white; font-size: 15px; font-weight: 600; color: #0F172A; }
  .byb-goal-btn:hover  { border-color: #2563EB; background: #EFF6FF; }
  .byb-goal-btn.active { border-color: #2563EB !important; background: #EFF6FF !important; color: #1D4ED8 !important; }
  .byb-progress-bar { transition: width 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94); }
  @keyframes byb-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
  .byb-fade-in { animation: byb-in 0.30s ease both; }
  .byb-feedback-item { animation: byb-in 0.22s ease both; }
`;

/* ─────────────────────────────────────────────────────────────
   CONSTANTS — unchanged from original
───────────────────────────────────────────────────────────── */
const PERSONAS = [
  { id: "first-job",    label: "First Job",    income: 2200, note: "Part-time or starter role" },
  { id: "entry",        label: "Entry Level",  income: 2800, note: "Full-time, entry position" },
  { id: "early-career", label: "Early Career", income: 3500, note: "Mid-level, 2–4 years in"  },
];

const INITIAL_EXPENSES = [
  { id:  1, category: "Rent",           amount: 1050, type: "fixed",    kind: "need", locked: true,  desc: "Monthly housing payment"       },
  { id:  2, category: "Groceries",      amount:  380, type: "variable", kind: "need", locked: false, desc: "Food and household supplies"    },
  { id:  3, category: "Car Payment",    amount:  280, type: "fixed",    kind: "need", locked: true,  desc: "Fixed monthly loan payment"     },
  { id:  4, category: "Gas",            amount:  130, type: "variable", kind: "need", locked: false, desc: "Fuel for transportation"        },
  { id:  5, category: "Utilities",      amount:  115, type: "fixed",    kind: "need", locked: false, desc: "Electric, water, internet"      },
  { id:  6, category: "Phone",          amount:   80, type: "fixed",    kind: "need", locked: true,  desc: "Mobile phone plan"              },
  { id:  7, category: "Subscriptions",  amount:   95, type: "fixed",    kind: "want", locked: false, desc: "Streaming, apps, memberships"   },
  { id:  8, category: "Dining Out",     amount:  350, type: "variable", kind: "want", locked: false, desc: "Restaurants and takeout"        },
  { id:  9, category: "Entertainment",  amount:  160, type: "variable", kind: "want", locked: false, desc: "Events, hobbies, activities"    },
  { id: 10, category: "Clothing",       amount:  130, type: "variable", kind: "want", locked: false, desc: "Apparel and accessories"        },
  { id: 11, category: "Personal Care",  amount:   65, type: "variable", kind: "need", locked: false, desc: "Haircuts, hygiene products"     },
  { id: 12, category: "Misc",           amount:  180, type: "variable", kind: "want", locked: false, desc: "Catch-all for small purchases"  },
  { id: 13, category: "Savings",        amount:    0, type: "variable", kind: "need", locked: false, desc: "Monthly savings contribution"   },
  { id: 14, category: "Emergency Fund", amount:    0, type: "variable", kind: "need", locked: false, desc: "Building your safety net"       },
];

const STEPS = [
  { n: 1, title: "Set Your Income",  short: "Income",   obj: "Establish your monthly take-home pay",            time: "1 min" },
  { n: 2, title: "Expense Snapshot", short: "Snapshot", obj: "Understand where your money currently goes",      time: "2 min" },
  { n: 3, title: "Needs vs. Wants",  short: "Classify", obj: "Classify your spending to find balance",          time: "3 min" },
  { n: 4, title: "Budget Workshop",  short: "Adjust",   obj: "Adjust your budget until it is sustainable",      time: "5 min" },
  { n: 5, title: "Life Event",       short: "Surprise", obj: "Handle a real-world financial surprise",          time: "3 min" },
  { n: 6, title: "Savings Goal",     short: "Save",     obj: "Decide what you are building toward",             time: "2 min" },
  { n: 7, title: "Your Summary",     short: "Results",  obj: "See how far your budget has come",                time: "2 min" },
];

const SURPRISE_EVENT = {
  title:  "Car Repair",
  amount: 350,
  body:   "Your brakes need urgent attention. The mechanic quotes $350 — this cannot be deferred safely.",
  lesson: "This is exactly why financial advisors recommend 3–6 months of expenses in an emergency fund.",
};

/* ─────────────────────────────────────────────────────────────
   UTILITIES — unchanged from original
───────────────────────────────────────────────────────────── */
const fmt = (n) => `$${Number(n).toLocaleString()}`;

function scaleExpenses(expenses, factor) {
  return expenses.map((e) => ({ ...e, amount: Math.round(e.amount * factor) }));
}

function computeTotals(income, expenses) {
  const total   = expenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const needs   = expenses.filter((e) => e.kind === "need").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const wants   = expenses.filter((e) => e.kind === "want").reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const savings = (expenses.find((e) => e.category === "Savings")?.amount || 0)
                + (expenses.find((e) => e.category === "Emergency Fund")?.amount || 0);
  const cashFlow = income - total;
  return { total, needs, wants, savings, cashFlow };
}

function computeHealthScore(income, expenses) {
  const { wants, savings, cashFlow } = computeTotals(income, expenses);
  let score = 50;
  if      (cashFlow < 0)   score -= 30;
  else if (cashFlow < 50)  score -= 8;
  else                     score += 8;
  const savingsRate = savings / income;
  if      (savingsRate >= 0.15) score += 25;
  else if (savingsRate >= 0.10) score += 18;
  else if (savingsRate >= 0.05) score += 10;
  else if (savingsRate > 0)     score += 4;
  else                          score -= 12;
  const wantsPct = wants / income;
  if      (wantsPct > 0.40) score -= 10;
  else if (wantsPct > 0.30) score -= 4;
  else if (wantsPct < 0.20) score += 5;
  const rent = expenses.find((e) => e.category === "Rent")?.amount || 0;
  if (rent / income > 0.35) score -= 5;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getHealthStatus(score) {
  if (score < 25) return { label: "Critical",  color: C.red,     bg: C.redSoft    };
  if (score < 45) return { label: "Tight",     color: "#B45309", bg: C.amberSoft  };
  if (score < 60) return { label: "Balanced",  color: "#0369A1", bg: "#E0F2FE"    };
  if (score < 75) return { label: "Stable",    color: C.accent,  bg: C.accentSoft };
  if (score < 90) return { label: "Healthy",   color: C.green,   bg: C.greenSoft  };
  return               { label: "Strong",    color: C.green,   bg: C.greenSoft  };
}

function getSmartFeedback(income, expenses) {
  const { wants, savings, cashFlow } = computeTotals(income, expenses);
  const msgs  = [];
  const rent  = expenses.find((e) => e.category === "Rent")?.amount || 0;
  const dining= expenses.find((e) => e.category === "Dining Out")?.amount || 0;
  const subs  = expenses.find((e) => e.category === "Subscriptions")?.amount || 0;
  const misc  = expenses.find((e) => e.category === "Misc")?.amount || 0;
  if      (cashFlow < 0)   msgs.push({ type: "error",   text: `You are over budget by ${fmt(Math.abs(cashFlow))} this month.` });
  else if (cashFlow < 50)  msgs.push({ type: "warn",    text: "Your budget is balanced but leaves almost no breathing room." });
  else                     msgs.push({ type: "success", text: `You have ${fmt(cashFlow)} of positive cash flow this month.` });
  if      (savings === 0)             msgs.push({ type: "warn",    text: "You have $0 allocated to savings. One surprise expense could push you into debt." });
  else if (savings / income < 0.05)   msgs.push({ type: "info",    text: `Saving ${fmt(savings)}/mo is a start. Aim for at least 10% of income (${fmt(Math.round(income * 0.10))}).` });
  else if (savings / income >= 0.10)  msgs.push({ type: "success", text: `Saving ${fmt(savings)}/mo (${Math.round((savings/income)*100)}%) puts you ahead of most budgets.` });
  if (rent / income > 0.35)           msgs.push({ type: "warn", text: `Rent is ${Math.round((rent/income)*100)}% of your income. Experts suggest keeping housing under 30%.` });
  if (dining > 200)                   msgs.push({ type: "info", text: `Dining out at ${fmt(dining)}/mo is one of the easiest categories to reduce and save.` });
  if (subs >= 90)                     msgs.push({ type: "info", text: `${fmt(subs)}/mo in subscriptions adds up to ${fmt(subs * 12)}/year. Worth auditing.` });
  if (misc >= 150)                    msgs.push({ type: "info", text: `Misc spending of ${fmt(misc)} is high. Tracking this category often reveals hidden savings.` });
  if (wants / income > 0.30 && cashFlow < 0)
    msgs.push({ type: "warn", text: `Wants are ${Math.round((wants/income)*100)}% of your budget. Reducing them could unlock meaningful savings.` });
  return msgs.slice(0, 4);
}

/* ─────────────────────────────────────────────────────────────
   SVG COMPONENTS — unchanged from original
───────────────────────────────────────────────────────────── */
function SemiGauge({ score = 0, size = 130 }) {
  const status = getHealthStatus(score);
  const cx = size / 2, cy = size * 0.58, r = size * 0.38, sw = size * 0.1;
  const circ = Math.PI * r, filled = (score / 100) * circ;
  return (
    <svg width={size} height={size * 0.62} viewBox={`0 0 ${size} ${size * 0.62}`} overflow="visible">
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke={C.border} strokeWidth={sw} strokeLinecap="round" />
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`} fill="none" stroke={status.color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`} style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.25,0.46,0.45,0.94), stroke 0.5s ease" }} />
      <text x={cx} y={cy-2} textAnchor="middle" fontSize={size*0.22} fontWeight="800" fill={status.color} style={{ transition: "fill 0.5s ease" }}>{score}</text>
      <text x={cx} y={cy+size*0.14} textAnchor="middle" fontSize={size*0.10} fontWeight="600" fill={C.textSec} letterSpacing="0.5">{status.label.toUpperCase()}</text>
    </svg>
  );
}

function DonutChart({ needs = 0, wants = 0, size = 150 }) {
  const total = needs + wants || 1, r = size*0.36, sw = size*0.14, circ = 2*Math.PI*r;
  const needsDash = (needs/total)*circ, wantsDash = (wants/total)*circ;
  const cx = size/2, cy = size/2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.border} strokeWidth={sw} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={C.accent} strokeWidth={sw} strokeDasharray={`${needsDash} ${circ}`} strokeDashoffset={circ*0.25} strokeLinecap="butt" style={{ transition: "stroke-dasharray 0.7s ease" }} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F59E0B" strokeWidth={sw} strokeDasharray={`${wantsDash} ${circ}`} strokeDashoffset={circ*0.25-needsDash} strokeLinecap="butt" style={{ transition: "all 0.7s ease" }} />
      <text x={cx} y={cy-4} textAnchor="middle" fontSize={size*0.14} fontWeight="800" fill={C.text}>{total > 0 ? Math.round((needs/total)*100) : 0}%</text>
      <text x={cx} y={cy+size*0.13} textAnchor="middle" fontSize={size*0.09} fill={C.textMuted}>Needs</text>
    </svg>
  );
}

function BarCompare({ income, total, size = { w: 280, h: 70 } }) {
  const maxVal = Math.max(income, total) * 1.05;
  const incW = (income/maxVal)*size.w, totW = (total/maxVal)*size.w, isOver = total > income;
  return (
    <svg width={size.w} height={size.h} viewBox={`0 0 ${size.w} ${size.h}`}>
      <rect x={0} y={6}  width={incW} height={22} rx={4} fill="#BFDBFE" />
      <rect x={0} y={6}  width={incW} height={22} rx={4} fill="none" stroke={C.accent} strokeWidth={1.5} />
      <text x={incW+6} y={21} fontSize={12} fontWeight={700} fill="#1D4ED8">{fmt(income)}</text>
      <text x={0} y={48} fontSize={11} fill={C.textSec}>Income</text>
      <rect x={0} y={42} width={totW} height={22} rx={4} fill={isOver ? "#FECACA" : "#BBF7D0"} />
      <rect x={0} y={42} width={totW} height={22} rx={4} fill="none" stroke={isOver ? "#EF4444" : "#16A34A"} strokeWidth={1.5} style={{ transition: "width 0.6s ease" }} />
      <text x={totW+6} y={57} fontSize={12} fontWeight={700} fill={isOver ? "#DC2626" : "#15803D"}>{fmt(total)}</text>
      <text x={0} y={size.h} fontSize={11} fill={C.textSec}>Expenses</text>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   SHARED UI
───────────────────────────────────────────────────────────── */
function Tag({ label, type }) {
  const colors = {
    fixed:    { bg: C.accentSoft, color: "#1D4ED8", border: C.accentMid },
    variable: { bg: C.greenSoft,  color: C.green,   border: C.greenMid  },
    need:     { bg: C.greenSoft,  color: C.green,   border: C.greenMid  },
    want:     { bg: C.amberSoft,  color: C.amber,   border: C.amberMid  },
  };
  const s = colors[type] || colors.fixed;
  return (
    <span style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700, letterSpacing: "0.3px", whiteSpace: "nowrap" }}>
      {label}
    </span>
  );
}

function FeedbackPanel({ msgs }) {
  if (!msgs.length) return null;
  const icons = { error: "!", warn: "!", success: "✓", info: "i" };
  const styles = {
    error:   { bg: C.redSoft,   border: C.redMid,   color: C.red,    icon: C.red     },
    warn:    { bg: C.amberSoft, border: C.amberMid,  color: C.amber,  icon: "#D97706" },
    success: { bg: C.greenSoft, border: C.greenMid,  color: C.green,  icon: C.green   },
    info:    { bg: C.accentSoft,border: C.accentMid, color: "#1E40AF",icon: C.accent  },
  };
  return (
    <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ padding: "10px 18px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Budget Coaching</span>
      </div>
      <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => {
          const s = styles[m.type] || styles.info;
          return (
            <div key={i} className="byb-feedback-item" style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "flex-start", gap: 10, animationDelay: `${i * 0.06}s` }}>
              <span style={{ width: 20, height: 20, borderRadius: "50%", background: s.icon, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{icons[m.type]}</span>
              <span style={{ fontSize: 13, lineHeight: 1.55, color: s.color, fontWeight: 500 }}>{m.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function NavRow({ onPrev, onNext, prevLabel = "Previous", nextLabel = "Continue", nextDisabled = false, blockMsg = null }) {
  return (
    <div style={{ background: C.card, borderTop: `1px solid ${C.border}`, padding: "18px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", borderRadius: "0 0 18px 18px" }}>
      <div>
        {onPrev && (
          <button className="byb-btn-ghost" onClick={onPrev}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 22px", borderRadius: 999, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 14, fontWeight: 600, color: C.textSec }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7"/></svg>
            {prevLabel}
          </button>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
        {blockMsg && <div style={{ fontSize: 12, color: C.red, fontWeight: 500 }}>{blockMsg}</div>}
        {onNext && (
          <button className="byb-btn-primary" onClick={onNext} disabled={nextDisabled}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 26px", borderRadius: 999, background: nextDisabled ? C.border : C.navy, color: nextDisabled ? C.textMuted : C.white, border: "none", fontSize: 14, fontWeight: 700 }}>
            {nextLabel}
            {!nextDisabled && <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>}
          </button>
        )}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   HERO — full-width navy gradient, matches Investment Simulator
───────────────────────────────────────────────────────────── */
function SimHero({ step, totalSteps, score }) {
  const progress = Math.round(((step - 1) / (totalSteps - 1)) * 100);
  const status   = getHealthStatus(score);
  const showScore = step >= 2;
  return (
    <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyMid} 60%, #0F2344 100%)`, position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "32px 32px", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: -80, right: -80, width: 360, height: 360, borderRadius: "50%", background: "radial-gradient(circle, rgba(59,130,246,0.16) 0%, transparent 70%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "36px 32px 0", position: "relative" }}>
        {/* Title row */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, marginBottom: 28 }}>
          <div style={{ flex: 1, minWidth: 260 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "5px 14px", marginBottom: 14 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.75)" strokeWidth="2.5" strokeLinecap="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-4 0v2"/></svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Guided Simulation</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: "0 0 8px", lineHeight: 1.15, letterSpacing: "-0.4px" }}>Build Your Budget</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.62)", margin: 0, maxWidth: 420, lineHeight: 1.65 }}>
              A 7-step guided journey through real budgeting decisions — income, expenses, trade-offs, a financial surprise, and a savings plan.
            </p>
          </div>
          {/* Progress card */}
          <div style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 16, padding: "18px 22px", backdropFilter: "blur(8px)", display: "flex", flexDirection: "column", gap: 12, minWidth: 210 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.07em" }}>Progress</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Step {step} of {totalSteps}</span>
            </div>
            <div style={{ height: 4, background: "rgba(255,255,255,0.14)", borderRadius: 999 }}>
              <div style={{ height: "100%", borderRadius: 999, width: `${progress}%`, background: "linear-gradient(90deg, #60A5FA, #34D399)", transition: "width 0.45s ease" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{progress}% complete</span>
              {showScore ? (
                <span style={{ fontSize: 12, fontWeight: 700, color: status.color, background: status.bg + "22", border: `1px solid ${status.color}44`, padding: "3px 10px", borderRadius: 999 }}>{status.label} · {score}</span>
              ) : (
                <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.35)", background: "rgba(255,255,255,0.06)", padding: "3px 10px", borderRadius: 999 }}>No score yet</span>
              )}
            </div>
          </div>
        </div>
        {/* Step rail */}
        <div style={{ display: "flex", alignItems: "center" }}>
          {STEPS.map((s, i) => {
            const done = s.n < step, current = s.n === step;
            return (
              <div key={s.n} style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0 }}>
                {i > 0 && <div style={{ flex: 1, height: 2, minWidth: 4, background: done ? "rgba(96,165,250,0.75)" : "rgba(255,255,255,0.12)", transition: "background 0.35s" }} />}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 7, flexShrink: 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", transition: "all 0.3s", display: "flex", alignItems: "center", justifyContent: "center", background: done ? "rgba(96,165,250,0.85)" : current ? "#fff" : "rgba(255,255,255,0.09)", border: current ? "2.5px solid #60A5FA" : done ? "none" : "1.5px solid rgba(255,255,255,0.2)" }}>
                    {done ? (
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    ) : (
                      <span style={{ fontSize: 11, fontWeight: 800, color: current ? C.navy : "rgba(255,255,255,0.45)" }}>{s.n}</span>
                    )}
                  </div>
                  <span style={{ fontSize: 10, fontWeight: current ? 700 : 500, whiteSpace: "nowrap", transition: "color 0.3s", color: current ? "#fff" : done ? "rgba(96,165,250,0.9)" : "rgba(255,255,255,0.32)" }}>{s.short}</span>
                </div>
                {i === STEPS.length - 1 && <div style={{ flex: 1 }} />}
              </div>
            );
          })}
        </div>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP CARD SHELL
───────────────────────────────────────────────────────────── */
function StepCard({ stepObj, children, onPrev, onNext, nextLabel, nextDisabled, blockMsg }) {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "28px 0 60px" }}>
      <div style={{ marginBottom: 18 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.08em" }}>Step {stepObj.n} of {STEPS.length} &nbsp;·&nbsp; {stepObj.time}</span>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: C.text, margin: "5px 0 5px", letterSpacing: "-0.3px" }}>{stepObj.title}</h2>
        <p style={{ fontSize: 14, color: C.textSec, margin: 0, lineHeight: 1.6, maxWidth: 520 }}>{stepObj.obj}</p>
      </div>
      <div className="byb-fade-in" style={{ background: C.card, borderRadius: 18, border: `1px solid ${C.border}`, boxShadow: "0 2px 16px rgba(27,43,94,0.07), 0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <div style={{ padding: "26px 28px 6px" }}>{children}</div>
        <NavRow onPrev={onPrev} onNext={onNext} nextLabel={nextLabel} nextDisabled={nextDisabled} blockMsg={blockMsg} />
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 1 — SET YOUR INCOME
───────────────────────────────────────────────────────────── */
function Step1({ income, setIncome, persona, setPersona }) {
  const [custom, setCustom] = useState(false);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 6 }}>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>Choose your income scenario</div>
        <div style={{ fontSize: 13, color: C.textSec, marginBottom: 14 }}>Select the profile that best fits your current or near-future situation.</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
          {PERSONAS.map((p) => (
            <div key={p.id} className={`byb-persona ${persona === p.id && !custom ? "active" : ""}`}
              onClick={() => { setPersona(p.id); setIncome(p.income); setCustom(false); }}
              style={{ border: `2px solid ${persona === p.id && !custom ? C.accent : C.border}`, borderRadius: 14, padding: "18px 16px", cursor: "pointer", transition: "all 0.18s ease", background: persona === p.id && !custom ? C.accentSoft : C.card }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 4 }}>{p.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.accent, marginBottom: 6 }}>{fmt(p.income)}<span style={{ fontSize: 13, fontWeight: 500, color: C.textSec }}>/mo</span></div>
              <div style={{ fontSize: 12, color: C.textSec }}>{p.note}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 10 }}>
          <input type="checkbox" id="byb-custom" checked={custom} onChange={(e) => setCustom(e.target.checked)} style={{ width: 16, height: 16, accentColor: C.accent }} />
          <label htmlFor="byb-custom" style={{ fontSize: 14, color: C.textSec, cursor: "pointer" }}>Enter a custom monthly take-home amount</label>
        </div>
        {custom && (
          <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.text }}>$</span>
            <input type="number" value={income} min={800} max={15000} step={100} onChange={(e) => setIncome(Number(e.target.value))} className="byb-num-input" style={{ width: 140, fontSize: 18, padding: "8px 14px" }} />
            <span style={{ fontSize: 14, color: C.textSec }}>per month, after tax</span>
          </div>
        )}
      </div>
      <div style={{ background: C.greenSoft, border: `1px solid ${C.greenMid}`, borderRadius: 12, padding: "12px 18px", display: "flex", gap: 10, alignItems: "flex-start" }}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={C.green} strokeWidth="2.5" strokeLinecap="round" style={{ flexShrink: 0, marginTop: 1 }}><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
        <span style={{ fontSize: 13, color: C.green, lineHeight: 1.55 }}><strong>Selected: {fmt(income)}/month.</strong> All expense amounts will scale to your income level.</span>
      </div>
      <div style={{ background: C.accentSoft, border: `1px solid ${C.accentMid}`, borderRadius: 12, padding: "13px 18px", fontSize: 13, color: "#1E40AF", lineHeight: 1.6 }}>
        You will build a real monthly budget, classify your spending, handle a financial surprise, and walk away with a personalized budget health score. Every decision you make affects your outcome.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 2 — EXPENSE SNAPSHOT
───────────────────────────────────────────────────────────── */
function Step2({ income, expenses }) {
  const { total, cashFlow } = computeTotals(income, expenses);
  const isOver = cashFlow < 0;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
        {[
          { label: "Monthly Income", value: fmt(income),   color: C.accent, bg: C.accentSoft },
          { label: "Total Expenses", value: fmt(total),    color: isOver ? C.red : C.text, bg: isOver ? C.redSoft : C.surface },
          { label: "Cash Flow",      value: fmt(cashFlow), color: isOver ? C.red : C.green, bg: isOver ? C.redSoft : C.greenSoft },
          { label: "Savings",        value: fmt(expenses.find(e=>e.category==="Savings")?.amount||0), color: C.textSec, bg: C.surface },
        ].map((s, i) => (
          <div key={i} style={{ background: s.bg, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 6 }}>{s.label}</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Income vs. Expenses</div>
        <BarCompare income={income} total={total} size={{ w: 500, h: 72 }} />
        {isOver && <div style={{ marginTop: 12, padding: "10px 14px", background: C.redSoft, border: `1px solid ${C.redMid}`, borderRadius: 8, fontSize: 13, color: C.red, fontWeight: 500 }}>This budget is over by {fmt(Math.abs(cashFlow))}. Something needs to change.</div>}
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center", background: C.surface }}>
          {["Category", "Type", "Kind", "Amount"].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", textAlign: h === "Amount" ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        {expenses.filter(e => e.amount > 0 || e.category === "Savings" || e.category === "Emergency Fund").map((exp, i, arr) => (
          <div key={exp.id} className="byb-exp-row" style={{ padding: "11px 20px", borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none", display: "grid", gridTemplateColumns: "1fr auto auto auto", gap: 12, alignItems: "center", transition: "background 0.15s" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{exp.category}</div>
              <div style={{ fontSize: 11, color: C.textMuted, marginTop: 1 }}>{exp.desc}</div>
            </div>
            <Tag label={exp.type === "fixed" ? "Fixed" : "Variable"} type={exp.type} />
            <Tag label={exp.kind === "need" ? "Need" : "Want"} type={exp.kind} />
            <div style={{ fontSize: 14, fontWeight: 700, color: C.text, textAlign: "right" }}>{fmt(exp.amount)}</div>
          </div>
        ))}
        <div style={{ padding: "12px 20px", background: C.surface, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: `2px solid ${C.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Total Expenses</span>
          <span style={{ fontSize: 15, fontWeight: 800, color: isOver ? C.red : C.text }}>{fmt(total)}</span>
        </div>
      </div>
      <div style={{ background: "#FFF7ED", border: "1px solid #FED7AA", borderRadius: 12, padding: "12px 18px", fontSize: 13, color: "#92400E", lineHeight: 1.55 }}>
        <strong>Notice anything?</strong> This starting budget has some issues. In the next steps, you will classify spending as needs or wants, then adjust the budget to reach financial stability.
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 3 — NEEDS VS WANTS
───────────────────────────────────────────────────────────── */
function Step3({ expenses, setExpenses }) {
  const { needs, wants } = computeTotals(0, expenses);
  const toggleKind = useCallback((id) => {
    setExpenses((prev) => prev.map((e) => e.id === id && !e.locked ? { ...e, kind: e.kind === "need" ? "want" : "need" } : e));
  }, [setExpenses]);
  const needsList  = expenses.filter((e) => e.kind === "need"  && !e.locked && e.amount > 0);
  const wantsList  = expenses.filter((e) => e.kind === "want"  && !e.locked && e.amount > 0);
  const lockedList = expenses.filter((e) => e.locked && e.amount > 0);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 6 }}>
      <div style={{ background: C.accentSoft, border: `1px solid ${C.accentMid}`, borderRadius: 12, padding: "13px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF", marginBottom: 5 }}>How to classify spending</div>
        <div style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.6 }}>
          <strong>Needs</strong> are essential: housing, food, transportation, utilities, healthcare.{" "}
          <strong>Wants</strong> are lifestyle choices: dining out, streaming, entertainment, clothing beyond basics. The goal is awareness, not elimination.
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 22, alignItems: "center" }}>
        <DonutChart needs={needs} wants={wants} size={128} />
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { label: "Needs", value: needs, color: C.accent, bg: C.accentSoft, pct: needs+wants>0 ? Math.round(needs/(needs+wants)*100) : 0 },
            { label: "Wants", value: wants, color: "#D97706", bg: C.amberSoft, pct: needs+wants>0 ? Math.round(wants/(needs+wants)*100) : 0 },
          ].map((s) => (
            <div key={s.label} style={{ background: s.bg, borderRadius: 10, padding: "11px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{s.label}</span>
              </div>
              <div>
                <span style={{ fontSize: 16, fontWeight: 800, color: s.color }}>{fmt(s.value)}</span>
                <span style={{ fontSize: 12, color: C.textSec, marginLeft: 6 }}>({s.pct}%)</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {lockedList.length > 0 && (
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 10 }}>Locked as Needs (cannot be changed)</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {lockedList.map((e) => (
              <div key={e.id} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "7px 14px", fontSize: 13, color: C.textSec }}>
                <strong>{e.category}</strong> — {fmt(e.amount)}
              </div>
            ))}
          </div>
        </div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {[
          { label: "Needs", color: C.accent, bg: C.accentSoft, border: C.accentMid, list: needsList },
          { label: "Wants", color: "#D97706", bg: C.amberSoft, border: C.amberMid, list: wantsList },
        ].map((col) => (
          <div key={col.label}>
            <div style={{ background: col.bg, border: `1.5px solid ${col.border}`, borderRadius: "12px 12px 0 0", padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: col.color }}>{col.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: col.color }}>{col.list.length} items</span>
            </div>
            <div style={{ border: `1.5px solid ${col.border}`, borderTop: "none", borderRadius: "0 0 12px 12px", minHeight: 72, padding: 8, display: "flex", flexDirection: "column", gap: 6, background: C.card }}>
              {col.list.length === 0 && <div style={{ textAlign: "center", color: C.textMuted, fontSize: 13, padding: "18px 10px" }}>Click expense cards to move them here</div>}
              {col.list.map((e) => (
                <div key={e.id} className="byb-sort-card" onClick={() => toggleKind(e.id)}
                  style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{e.category}</div>
                    <div style={{ fontSize: 11, color: C.textMuted }}>{e.desc}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 800, color: C.text }}>{fmt(e.amount)}</span>
                    <span style={{ fontSize: 10, color: col.color, fontWeight: 700 }}>click to flip</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div style={{ background: C.greenSoft, border: `1px solid ${C.greenMid}`, borderRadius: 12, padding: "12px 18px", fontSize: 13, color: C.green, lineHeight: 1.55 }}>
        <strong>Pro tip:</strong> Financial experts suggest keeping wants under 30% of your budget. Yours are currently at {Math.round((wants / (needs + wants || 1)) * 100)}%.
        {wants / (needs + wants || 1) > 0.30 ? " There is room to trim." : " That is well within healthy range."}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 4 — BUDGET WORKSHOP
───────────────────────────────────────────────────────────── */
function Step4({ income, expenses, setExpenses }) {
  const { total, cashFlow, savings } = computeTotals(income, expenses);
  const score  = computeHealthScore(income, expenses);
  const msgs   = getSmartFeedback(income, expenses);
  const isOver = cashFlow < 0;
  const status = getHealthStatus(score);
  const updateAmount = useCallback((id, val) => {
    setExpenses((prev) => prev.map((e) => e.id === id ? { ...e, amount: Math.max(0, Number(val) || 0) } : e));
  }, [setExpenses]);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 6 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        {[
          { label: "Cash Flow",       value: (cashFlow>=0?"+":"")+fmt(cashFlow), color: isOver ? C.red : C.green, bg: isOver ? C.redSoft : C.greenSoft, border: isOver ? C.redMid : C.greenMid },
          { label: "Monthly Savings", value: fmt(savings), color: savings>0 ? C.green : C.amber, bg: savings>0 ? C.greenSoft : C.amberSoft, border: savings>0 ? C.greenMid : C.amberMid },
          { label: "Budget Health",   value: `${score}`, color: status.color, bg: status.bg, border: C.border, sub: status.label },
        ].map((s) => (
          <div key={s.label} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</div>
            {s.sub && <div style={{ fontSize: 11, color: s.color, fontWeight: 700, marginTop: 2 }}>{s.sub}</div>}
          </div>
        ))}
      </div>
      <FeedbackPanel msgs={msgs} />
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: C.surface }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Adjust Your Spending</span>
          <span style={{ fontSize: 12, color: C.textMuted }}>Click any amount to edit</span>
        </div>
        {expenses.map((exp, i) => {
          const pct = income > 0 ? (exp.amount / income) * 100 : 0;
          const isHigh = pct > 35 && exp.category !== "Rent";
          return (
            <div key={exp.id} className="byb-exp-row" style={{ padding: "10px 20px", borderBottom: i < expenses.length-1 ? `1px solid ${C.border}` : "none", display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, alignItems: "center", background: isHigh ? "#FFFBEB" : "transparent" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
                  {exp.category}
                  {isHigh && <span style={{ fontSize: 10, color: C.amber, fontWeight: 800, background: C.amberSoft, padding: "1px 7px", borderRadius: 999 }}>HIGH</span>}
                </div>
                {pct > 0 && (
                  <div style={{ marginTop: 4 }}>
                    <div style={{ width: "100%", maxWidth: 160, height: 3, background: C.border, borderRadius: 99 }}>
                      <div style={{ width: `${Math.min(pct*2.5, 100)}%`, height: "100%", borderRadius: 99, background: pct > 25 ? C.amber : C.accent, transition: "width 0.4s ease" }} />
                    </div>
                  </div>
                )}
              </div>
              <Tag label={exp.kind === "need" ? "Need" : "Want"} type={exp.kind} />
              <input type="number" className="byb-num-input" value={exp.amount} min={0} max={income} disabled={exp.locked}
                onChange={(e) => updateAmount(exp.id, e.target.value)}
                style={{ borderColor: isHigh ? C.amberMid : C.borderDark, background: exp.locked ? C.surface : C.card, color: exp.locked ? C.textMuted : C.text }} />
            </div>
          );
        })}
        <div style={{ padding: "12px 20px", background: C.surface, borderTop: `2px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr auto auto", gap: 14, alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Total</span>
          <span />
          <span style={{ fontSize: 14, fontWeight: 800, color: isOver ? C.red : C.text, minWidth: 88, textAlign: "right" }}>{fmt(total)}</span>
        </div>
      </div>
      {!isOver && !savings && (
        <div style={{ background: C.amberSoft, border: `1px solid ${C.amberMid}`, borderRadius: 12, padding: "12px 18px", fontSize: 13, color: C.amber, lineHeight: 1.55 }}>
          <strong>You are no longer over budget — good progress.</strong> Now allocate some amount to Savings or Emergency Fund to move forward.
        </div>
      )}
      {savings > 0 && !isOver && (
        <div style={{ background: C.greenSoft, border: `1px solid ${C.greenMid}`, borderRadius: 12, padding: "12px 18px", fontSize: 13, color: C.green, lineHeight: 1.55 }}>
          <strong>Solid work.</strong> You have created positive savings of {fmt(savings)}/month. You can continue or keep refining your numbers.
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 5 — LIFE EVENT
───────────────────────────────────────────────────────────── */
function Step5({ income, expenses, setExpenses, eventHandled, setEventHandled }) {
  const ev = SURPRISE_EVENT;
  const { cashFlow } = computeTotals(income, expenses);
  const emergencyFund = expenses.find((e) => e.category === "Emergency Fund")?.amount || 0;
  const hasEmergency  = emergencyFund >= ev.amount;
  const [choice, setChoice]       = useState(null);
  const [adjustId, setAdjustId]   = useState(null);
  const [adjustAmt, setAdjustAmt] = useState(0);
  const adjustableExpenses = expenses.filter((e) => e.kind === "want" && !e.locked && e.amount > 0);
  const impactedFlow = cashFlow - ev.amount;
  const handleChoose = (c) => { setChoice(c); if (c === "fund" || c === "overspend") setEventHandled(true); };
  const handleAdjust = () => {
    if (!adjustId || adjustAmt <= 0) return;
    setExpenses((prev) => prev.map((e) => e.id === adjustId ? { ...e, amount: Math.max(0, e.amount - adjustAmt) } : e));
    setEventHandled(true);
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 6 }}>
      {/* Event card */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, borderRadius: 16, padding: "22px 26px", color: C.white, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "rgba(239,68,68,0.12)", pointerEvents: "none" }} />
        <div style={{ fontSize: 11, color: "#93C5FD", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>Life Event</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 10 }}>{ev.title}</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.6, marginBottom: 16 }}>{ev.body}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 30, fontWeight: 900, color: "#FCA5A5" }}>{fmt(ev.amount)}</span>
          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>unexpected expense</span>
        </div>
      </div>
      {/* Impact */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>Budget Impact</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
          {[
            { label: "Before Event", value: fmt(cashFlow),       color: cashFlow >= 0 ? C.green : C.red },
            { label: "Event Cost",   value: `-${fmt(ev.amount)}`, color: C.red },
            { label: "After Event",  value: fmt(impactedFlow),   color: impactedFlow >= 0 ? C.green : C.red },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: "center", padding: "11px 8px", background: C.surface, borderRadius: 10 }}>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
      {/* Options */}
      {!eventHandled && (
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>How will you respond?</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div className="byb-sort-card" onClick={() => hasEmergency && handleChoose("fund")}
              style={{ border: `2px solid ${hasEmergency ? C.accent : C.border}`, borderRadius: 14, padding: "15px 20px", background: hasEmergency ? C.accentSoft : C.surface, opacity: hasEmergency ? 1 : 0.5 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: hasEmergency ? "#1D4ED8" : C.textSec, marginBottom: 4 }}>Use Emergency Fund {!hasEmergency && "(not funded)"}</div>
              <div style={{ fontSize: 13, color: hasEmergency ? "#1E40AF" : C.textMuted }}>{hasEmergency ? `You have ${fmt(emergencyFund*12)} saved annually. This covers the repair.` : "You have $0 in your emergency fund. This option is unavailable."}</div>
            </div>
            <div className="byb-sort-card" onClick={() => setChoice("adjust")}
              style={{ border: `2px solid ${choice === "adjust" ? C.green : C.border}`, borderRadius: 14, padding: "15px 20px", background: choice === "adjust" ? C.greenSoft : C.card }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Cut Spending This Month</div>
              <div style={{ fontSize: 13, color: C.textSec }}>Reduce a want category to absorb the cost. This is what a tight budget requires.</div>
              {choice === "adjust" && (
                <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                  <select value={adjustId || ""} onChange={(e) => setAdjustId(Number(e.target.value))} style={{ padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: 13, color: C.text, width: "100%", background: C.card }}>
                    <option value="">Select a category to reduce...</option>
                    {adjustableExpenses.map((e) => (<option key={e.id} value={e.id}>{e.category} — {fmt(e.amount)}</option>))}
                  </select>
                  {adjustId && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 13, color: C.textSec }}>Reduce by:</span>
                      <input type="number" className="byb-num-input" value={adjustAmt} min={0} max={ev.amount} onChange={(e) => setAdjustAmt(Number(e.target.value))} />
                      <button className="byb-btn-primary" onClick={handleAdjust} disabled={adjustAmt <= 0} style={{ padding: "8px 16px", background: C.green, color: C.white, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13 }}>Apply</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="byb-sort-card" onClick={() => handleChoose("overspend")}
              style={{ border: `2px solid ${choice === "overspend" ? C.red : C.border}`, borderRadius: 14, padding: "15px 20px", background: choice === "overspend" ? C.redSoft : C.card }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: choice === "overspend" ? C.red : C.text, marginBottom: 4 }}>Go Over Budget This Month</div>
              <div style={{ fontSize: 13, color: C.textSec }}>Charge the expense and deal with it later. This is what most people do when unprepared.</div>
            </div>
          </div>
        </div>
      )}
      {eventHandled && choice === "fund"      && <div style={{ background: C.greenSoft, border: `1px solid ${C.greenMid}`, borderRadius: 12, padding: "15px 20px", fontSize: 13, color: C.green, lineHeight: 1.6 }}><strong>Emergency fund to the rescue.</strong> This is exactly what it is for. Your day-to-day budget is unaffected because you planned ahead. This is the power of a funded safety net.</div>}
      {eventHandled && choice === "adjust"    && <div style={{ background: C.greenSoft, border: `1px solid ${C.greenMid}`, borderRadius: 12, padding: "15px 20px", fontSize: 13, color: C.green, lineHeight: 1.6 }}><strong>Good adaptation.</strong> You found room in your budget by cutting back on a want. This required tradeoffs, but you stayed out of debt. This is what financial flexibility looks like.</div>}
      {eventHandled && choice === "overspend" && <div style={{ background: C.redSoft, border: `1px solid ${C.redMid}`, borderRadius: 12, padding: "15px 20px", fontSize: 13, color: C.red, lineHeight: 1.6 }}><strong>This is the most common outcome.</strong> Without a buffer, surprise expenses become debt. A $350 repair on a credit card at 22% APR costs significantly more over time. This is why margin in a budget matters.</div>}
      <div style={{ background: C.navy, borderRadius: 12, padding: "14px 20px", fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}><strong style={{ color: C.white }}>Key insight:</strong> {ev.lesson}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 6 — SAVINGS GOAL
───────────────────────────────────────────────────────────── */
function Step6({ income, expenses, savingsGoal, setSavingsGoal }) {
  const { savings } = computeTotals(income, expenses);
  const monthlySavings = Math.max(savings, 0);
  const monthsToGoal   = monthlySavings > 0 ? Math.ceil(savingsGoal / monthlySavings) : null;
  const yearProgress   = monthlySavings > 0 ? Math.min((monthlySavings * 12) / savingsGoal * 100, 100) : 0;
  const PRESETS = [250, 500, 1000, 2000];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, paddingBottom: 6 }}>
      <div style={{ background: C.accentSoft, border: `1px solid ${C.accentMid}`, borderRadius: 12, padding: "13px 18px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#1E40AF", marginBottom: 5 }}>Why savings goals matter</div>
        <div style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.6 }}>Without a specific target, savings tend to drift. Naming a goal — even a small one — makes you more likely to follow through. Financial advisors recommend starting with a $500–$1,000 emergency fund before building further.</div>
      </div>
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>Your current savings rate</div>
        <div style={{ fontSize: 28, fontWeight: 900, color: monthlySavings > 0 ? C.green : C.red, marginBottom: 6 }}>{fmt(monthlySavings)}<span style={{ fontSize: 14, fontWeight: 500, color: C.textSec }}>/month</span></div>
        {monthlySavings === 0 && <div style={{ fontSize: 13, color: C.red, lineHeight: 1.5 }}>Go back to the Budget Workshop and allocate an amount to Savings or Emergency Fund.</div>}
        {monthlySavings > 0 && <div style={{ fontSize: 13, color: C.textSec }}>That is {Math.round((monthlySavings / income) * 100)}% of your monthly income — {(monthlySavings/income) >= 0.10 ? "above the 10% benchmark." : "below the recommended 10%."}</div>}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12 }}>Set your emergency fund goal</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
          {PRESETS.map((p) => (<button key={p} className={`byb-goal-btn ${savingsGoal === p ? "active" : ""}`} onClick={() => setSavingsGoal(p)}>{fmt(p)}</button>))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 13, color: C.textSec }}>Custom:</span>
          <input type="number" className="byb-num-input" value={savingsGoal} min={100} max={50000} step={50} onChange={(e) => setSavingsGoal(Number(e.target.value))} />
        </div>
      </div>
      {monthlySavings > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 14 }}>Progress toward {fmt(savingsGoal)} goal</div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: C.textSec }}>In 12 months: {fmt(Math.min(monthlySavings * 12, savingsGoal))}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>{Math.round(yearProgress)}%</span>
            </div>
            <div style={{ width: "100%", height: 8, background: C.border, borderRadius: 999 }}>
              <div className="byb-progress-bar" style={{ height: "100%", borderRadius: 999, width: `${yearProgress}%`, background: `linear-gradient(90deg, ${C.accent}, ${C.green})` }} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Monthly saving",  value: fmt(monthlySavings) },
              { label: "Months to goal",  value: monthsToGoal ? `${monthsToGoal} mo` : "N/A" },
              { label: "Saved in 1 year", value: fmt(Math.min(monthlySavings*12, savingsGoal*2)) },
            ].map((s) => (
              <div key={s.label} style={{ background: C.surface, borderRadius: 10, padding: "11px 14px", textAlign: "center" }}>
                <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.4px", textTransform: "uppercase", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: C.text }}>{s.value}</div>
              </div>
            ))}
          </div>
          {monthsToGoal && monthsToGoal <= 12 && (
            <div style={{ marginTop: 14, padding: "10px 14px", background: C.greenSoft, border: `1px solid ${C.greenMid}`, borderRadius: 8, fontSize: 13, color: C.green }}>
              <strong>You can hit this goal in under a year.</strong> Once reached, you will have a real safety net that prevents future surprises from becoming debt.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   STEP 7 — SUMMARY
───────────────────────────────────────────────────────────── */
function Step7({ income, expenses, initialExpenses, savingsGoal, onRestart }) {
  const now    = computeTotals(income, expenses);
  const before = computeTotals(income, initialExpenses);
  const scoreNow    = computeHealthScore(income, expenses);
  const scoreBefore = computeHealthScore(income, initialExpenses);
  const statusNow   = getHealthStatus(scoreNow);
  const wins = [];
  if (now.cashFlow > before.cashFlow)  wins.push(`Improved cash flow by ${fmt(now.cashFlow - before.cashFlow)}/month`);
  if (now.savings  > before.savings)   wins.push(`Added ${fmt(now.savings - before.savings)}/month in savings`);
  if (now.wants    < before.wants)     wins.push(`Reduced wants spending by ${fmt(before.wants - now.wants)}/month`);
  if (scoreNow > scoreBefore)          wins.push(`Raised your Budget Health score from ${scoreBefore} to ${scoreNow}`);
  if (now.savings > 0 && before.savings === 0) wins.push("Created a dedicated monthly savings allocation for the first time");
  const improvements = [];
  const rent = expenses.find((e) => e.category === "Rent")?.amount || 0;
  if (rent / income > 0.35)             improvements.push("Housing costs are still above 30% of income — the most common budget pressure point");
  if (now.savings / income < 0.10)      improvements.push(`Savings rate is ${Math.round((now.savings/income)*100)}% — building toward 10–15% would improve long-term stability`);
  if (!expenses.find((e) => e.category === "Emergency Fund")?.amount) improvements.push("An emergency fund is still unfunded — prioritizing even $50/month builds resilience over time");
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 22, paddingBottom: 6 }}>
      {/* Completion banner */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`, borderRadius: 16, padding: "22px 28px", color: C.white, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 0.04, backgroundImage: "linear-gradient(rgba(255,255,255,0.6) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.6) 1px,transparent 1px)", backgroundSize: "28px 28px", pointerEvents: "none" }} />
        <div style={{ fontSize: 11, color: "#93C5FD", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: 8 }}>Simulation Complete</div>
        <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>You built a real monthly budget</div>
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.65)" }}>Here is what changed and what to focus on next.</div>
      </div>
      {/* Before / After scores */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", gap: 16, alignItems: "center" }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>Starting Score</div>
          <SemiGauge score={scoreBefore} size={110} />
        </div>
        <div style={{ textAlign: "center", fontSize: 24, color: C.textMuted, fontWeight: 300, padding: "0 4px" }}>→</div>
        <div style={{ background: statusNow.bg, border: `2px solid ${statusNow.color}22`, borderRadius: 14, padding: "20px", textAlign: "center" }}>
          <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 8 }}>Final Score</div>
          <SemiGauge score={scoreNow} size={110} />
        </div>
      </div>
      {/* Comparison table */}
      <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ padding: "12px 20px", borderBottom: `1px solid ${C.border}`, background: C.surface }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Budget Comparison</span>
        </div>
        <div style={{ padding: "10px 20px", borderBottom: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "1fr 1fr 1fr 28px", gap: 12 }}>
          {["Category","Before","After",""].map(h => (
            <span key={h} style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.4px", textAlign: h === "Before" || h === "After" ? "center" : "left" }}>{h}</span>
          ))}
        </div>
        {[
          { label: "Total Expenses", before: before.total,    after: now.total,    lowerIsBetter: true  },
          { label: "Needs",          before: before.needs,    after: now.needs,    lowerIsBetter: false },
          { label: "Wants",          before: before.wants,    after: now.wants,    lowerIsBetter: true  },
          { label: "Savings",        before: before.savings,  after: now.savings,  lowerIsBetter: false },
          { label: "Cash Flow",      before: before.cashFlow, after: now.cashFlow, lowerIsBetter: false },
        ].map((row, i) => {
          const improved = row.lowerIsBetter ? row.after < row.before : row.after > row.before;
          const changed  = row.after !== row.before;
          return (
            <div key={row.label} style={{ padding: "10px 20px", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", display: "grid", gridTemplateColumns: "1fr 1fr 1fr 28px", gap: 12, alignItems: "center" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{row.label}</span>
              <span style={{ fontSize: 13, color: C.textSec, textAlign: "center" }}>{fmt(row.before)}</span>
              <span style={{ fontSize: 13, fontWeight: 700, textAlign: "center", color: changed ? (improved ? C.green : C.red) : C.textMuted }}>{fmt(row.after)}</span>
              {changed && <span style={{ fontSize: 13, fontWeight: 800, textAlign: "center", color: improved ? C.green : C.red }}>{improved ? "↑" : "↓"}</span>}
            </div>
          );
        })}
      </div>
      {/* Final needs/wants donut */}
      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center", background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px" }}>
        <DonutChart needs={now.needs} wants={now.wants} size={118} />
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>Final Needs vs. Wants Split</div>
          {[
            { label: "Needs", val: now.needs, color: C.accent },
            { label: "Wants", val: now.wants, color: "#D97706" },
          ].map((s) => (
            <div key={s.label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                <span style={{ fontSize: 13, color: C.textSec }}>{s.label}</span>
              </div>
              <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{fmt(s.val)}</span>
            </div>
          ))}
          <div style={{ marginTop: 10, fontSize: 13, color: C.textSec }}>Savings goal: {fmt(savingsGoal)} emergency fund</div>
        </div>
      </div>
      {/* Wins */}
      {wins.length > 0 && (
        <div style={{ background: C.greenSoft, border: `1px solid ${C.greenMid}`, borderRadius: 14, padding: "18px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 12 }}>What you accomplished</div>
          {wins.map((w, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < wins.length-1 ? 10 : 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.green, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>✓</div>
              <span style={{ fontSize: 13, color: C.green, lineHeight: 1.55 }}>{w}</span>
            </div>
          ))}
        </div>
      )}
      {/* Improvements */}
      {improvements.length > 0 && (
        <div style={{ background: C.accentSoft, border: `1px solid ${C.accentMid}`, borderRadius: 14, padding: "18px 22px" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#1D4ED8", marginBottom: 12 }}>Keep improving</div>
          {improvements.map((p, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < improvements.length-1 ? 10 : 0 }}>
              <div style={{ width: 20, height: 20, borderRadius: "50%", background: C.accent, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>→</div>
              <span style={{ fontSize: 13, color: "#1E40AF", lineHeight: 1.55 }}>{p}</span>
            </div>
          ))}
        </div>
      )}
      {/* Savings goal progress */}
      {now.savings > 0 && (
        <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
            <div>
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 4 }}>Savings Goal Progress</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Emergency Fund — {fmt(savingsGoal)}</div>
            </div>
            {Math.ceil(savingsGoal / now.savings) <= 24 && (
              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: 11, color: C.textMuted, display: "block" }}>Reach goal in</span>
                <span style={{ fontSize: 20, fontWeight: 900, color: C.green }}>{Math.ceil(savingsGoal / now.savings)} months</span>
              </div>
            )}
          </div>
          <div style={{ height: 10, background: C.greenMid + "44", borderRadius: 999, overflow: "hidden", marginBottom: 8 }}>
            <div className="byb-progress-bar" style={{ height: "100%", width: `${Math.min(100, (now.savings / (savingsGoal / 12)) * 100)}%`, background: `linear-gradient(90deg, ${C.green}, #34D399)`, borderRadius: 999 }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: C.textSec, fontWeight: 500 }}>
            <span>{fmt(now.savings)}/month saved</span>
            <span>Goal: {fmt(savingsGoal)}</span>
          </div>
        </div>
      )}

      {/* Key takeaways */}
      <div style={{ background: C.navy, borderRadius: 14, padding: "18px 22px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: C.white, marginBottom: 14 }}>Key takeaways from this simulation</div>
        {[
          "A budget is not about restricting life — it is about directing money with intention.",
          "Small adjustments to wants create meaningful room for savings without major sacrifice.",
          "Emergency funds are not optional. They are the difference between a setback and a spiral.",
          "Budget health is not a fixed score. It improves steadily with small, consistent decisions.",
        ].map((t, i) => (
          <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: i < 3 ? 12 : 0 }}>
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.28)", color: "rgba(255,255,255,0.65)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i+1}</div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.78)", lineHeight: 1.6 }}>{t}</span>
          </div>
        ))}
      </div>

      {/* Restart / next action row */}
      <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap", paddingBottom: 4 }}>
        <button className="byb-btn-ghost" onClick={onRestart}
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.card, color: C.textSec, fontSize: 13, fontWeight: 700 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          Restart Simulation
        </button>
        <button className="byb-btn-primary"
          style={{ display: "flex", alignItems: "center", gap: 7, padding: "11px 22px", borderRadius: 12, background: C.navy, color: C.white, border: "none", fontSize: 13, fontWeight: 700 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Try Investment Simulator
        </button>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────────────────────── */
export default function BuildYourBudget({ onBack }) {
  const [step, setStep]           = useState(1);
  const [income, setIncomeRaw]    = useState(2800);
  const [persona, setPersona]     = useState("entry");
  const [expenses, setExpenses]   = useState(() => scaleExpenses(INITIAL_EXPENSES, 1));
  const [initialExpenses]         = useState(INITIAL_EXPENSES);
  const [eventHandled, setEventHandled] = useState(false);
  const [savingsGoal, setSavingsGoal]   = useState(500);

  const setIncome = useCallback((val) => {
    const ratio = val / 2800;
    setIncomeRaw(val);
    setExpenses(scaleExpenses(INITIAL_EXPENSES, ratio));
  }, []);

  const handleRestart = useCallback(() => {
    setStep(1);
    setIncomeRaw(2800);
    setPersona("entry");
    setExpenses(scaleExpenses(INITIAL_EXPENSES, 1));
    setEventHandled(false);
    setSavingsGoal(500);
  }, []);

  const score = useMemo(() => computeHealthScore(income, expenses), [income, expenses]);
  const { cashFlow, savings } = useMemo(() => computeTotals(income, expenses), [income, expenses]);

  const canProceed = useMemo(() => {
    if (step === 4) return cashFlow >= 0 && savings > 0;
    if (step === 5) return eventHandled;
    return true;
  }, [step, cashFlow, savings, eventHandled]);

  const blockMsg = useMemo(() => {
    if (step === 4 && cashFlow < 0)   return `Still over budget by ${fmt(Math.abs(cashFlow))}. Reduce expenses before continuing.`;
    if (step === 4 && savings === 0)  return "Allocate at least $1 to Savings or Emergency Fund to continue.";
    if (step === 5 && !eventHandled)  return "Choose a response to the life event above before continuing.";
    return null;
  }, [step, cashFlow, savings, eventHandled]);

  const goNext = () => { if (canProceed) setStep((s) => Math.min(s + 1, 7)); };
  const goPrev = () => setStep((s) => Math.max(s - 1, 1));

  const nextLabel =
    step === 1 ? "Start Building" :
    step === 4 ? "My Budget is Ready" :
    step === 7 ? null :
    "Continue";

  const stepObj = STEPS[step - 1];

  return (
    <div className="byb-wrap">
      <style>{GLOBAL_CSS}</style>
      <SimHero step={step} totalSteps={STEPS.length} score={score} />
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "0 24px" }}>
        <StepCard stepObj={stepObj} onPrev={step > 1 ? goPrev : null} onNext={step < 7 ? goNext : null}
          nextLabel={nextLabel} nextDisabled={!canProceed} blockMsg={blockMsg}>
          {step === 1 && <Step1 income={income} setIncome={setIncome} persona={persona} setPersona={setPersona} />}
          {step === 2 && <Step2 income={income} expenses={expenses} />}
          {step === 3 && <Step3 expenses={expenses} setExpenses={setExpenses} />}
          {step === 4 && <Step4 income={income} expenses={expenses} setExpenses={setExpenses} />}
          {step === 5 && <Step5 income={income} expenses={expenses} setExpenses={setExpenses} eventHandled={eventHandled} setEventHandled={setEventHandled} />}
          {step === 6 && <Step6 income={income} expenses={expenses} savingsGoal={savingsGoal} setSavingsGoal={setSavingsGoal} />}
          {step === 7 && <Step7 income={income} expenses={expenses} initialExpenses={initialExpenses} savingsGoal={savingsGoal} onRestart={handleRestart} />}
        </StepCard>
      </div>
    </div>
  );
}