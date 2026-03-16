import React, { useState, useMemo, useCallback } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import {
  TrendingUp, DollarSign, Zap, Info, BarChart2, Shield, Clock,
  ChevronDown, ChevronUp, ArrowUpRight, BookOpen, Save, Sprout
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy: "#1F3A64", navyMid: "#172E52", navyLight: "#264D82",
  navyGlow: "rgba(31,58,100,0.12)",
  accent: "#3B82F6", accentSoft: "#E8F0FE", accentMid: "#BFDBFE",
  green: "#22C55E", greenSoft: "#E8F8F0", greenMid: "#BBF7D0",
  amber: "#F59E0B", amberSoft: "#FFF3E0",
  purple: "#8B5CF6", purpleSoft: "#F2ECFF",
  bg: "#F5F7FB", bgCard: "#FFFFFF",
  border: "#E5E7EB", borderMid: "#D1D5DB",
  text: "#0F172A", textSub: "#475569", textMuted: "#94A3B8",
};

const COMPOUND_OPTS = [
  { value: "annually", label: "Annually", n: 1 },
  { value: "quarterly", label: "Quarterly", n: 4 },
  { value: "monthly", label: "Monthly", n: 12 },
  { value: "daily", label: "Daily", n: 365 },
];

const SCENARIOS = [
  { label: "Starter Investor", Icon: Sprout, desc: "Just getting started", values: { principal: 1000, years: 10, rate: 6, compound: "monthly", contribution: 50, contribFreq: "monthly", timing: "end" } },
  { label: "Steady Builder", Icon: BarChart2, desc: "Consistent long-term growth", values: { principal: 10000, years: 30, rate: 8, compound: "monthly", contribution: 100, contribFreq: "monthly", timing: "end" } },
  { label: "Aggressive Growth", Icon: TrendingUp, desc: "High contributions, high returns", values: { principal: 25000, years: 20, rate: 10, compound: "monthly", contribution: 500, contribFreq: "monthly", timing: "beginning" } },
  { label: "Retirement Plan", Icon: Shield, desc: "40-year wealth building", values: { principal: 5000, years: 40, rate: 7, compound: "monthly", contribution: 200, contribFreq: "monthly", timing: "end" } },
];

const WAIT_OPTIONS = [
  { label: "Start Now", delay: 0 },
  { label: "Wait 5 Years", delay: 5 },
  { label: "Wait 10 Years", delay: 10 },
];

const REAL_WORLD = [
  { threshold: 2000, items: ["a smartphone", "a weekend trip", "a month of streaming"] },
  { threshold: 10000, items: ["a used car", "6 months of rent", "a home down payment start"] },
  { threshold: 50000, items: ["a new car", "a year of college tuition", "a home renovation"] },
  { threshold: 200000, items: ["a home down payment", "early retirement seed", "a business launch"] },
  { threshold: Infinity, items: ["full financial independence", "generational wealth", "a life without financial stress"] },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
const fmtShort = (v) => v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${Math.round(v)}`;

function calcGrowth({ principal, years, rate, compound, contribution, contribFreq, timing, startDelay = 0 }) {
  const n = COMPOUND_OPTS.find(o => o.value === compound)?.n || 12;
  const r = rate / 100;
  const contribPerPeriod = contribFreq === "monthly" ? contribution : contribution / 12;
  const data = [];
  let balance = startDelay > 0 ? 0 : principal;
  let totalContrib = startDelay > 0 ? 0 : principal;
  const totalYears = years + startDelay;

  for (let yr = 0; yr <= totalYears; yr++) {
    const active = yr >= startDelay;
    data.push({ year: yr, portfolio: Math.round(balance), contributions: Math.round(totalContrib), interest: Math.round(balance - totalContrib) });
    if (yr < totalYears) {
      for (let p = 0; p < n; p++) {
        const monthlyContribs = contribFreq === "monthly" ? 12 / n : 1 / n;
        const periodContrib = active ? contribPerPeriod * monthlyContribs : 0;
        const initialContrib = (active && yr === startDelay && p === 0 && startDelay > 0) ? principal : 0;
        if (timing === "beginning") balance += periodContrib + initialContrib;
        balance *= (1 + r / n);
        if (timing === "end") balance += periodContrib + initialContrib;
        if (active || (yr === startDelay && p === 0)) totalContrib += periodContrib + initialContrib;
      }
    }
  }
  return { data, finalValue: balance, totalContributions: totalContrib, totalInterest: balance - totalContrib, interestPct: ((balance - totalContrib) / Math.max(balance, 1)) * 100 };
}

function getMilestones(data, principal) {
  const milestones = [];
  let doubleFound = false, crossFound = false;
  for (let i = 1; i < data.length; i++) {
    const d = data[i];
    if (!doubleFound && d.portfolio >= principal * 2 && d.portfolio > 0) { milestones.push({ year: d.year, label: "Investment Doubles", color: C.green }); doubleFound = true; }
    if (!crossFound && d.interest > d.contributions && d.year > 0) { milestones.push({ year: d.year, label: "Interest > Contributions", color: C.purple }); crossFound = true; }
  }
  return milestones;
}

function getInsights({ rate, years, interestPct, finalValue, principal, contribution, contribFreq }) {
  const monthly = contribFreq === "monthly" ? contribution : contribution / 12;
  const extra50 = calcGrowth({ principal, years, rate, compound: "monthly", contribution: monthly + 50, contribFreq: "monthly", timing: "end" });
  const earlier5 = calcGrowth({ principal, years: years + 5, rate, compound: "monthly", contribution: monthly, contribFreq: "monthly", timing: "end" });
  const doublingYears = (72 / rate).toFixed(1);
  return [
    `${interestPct.toFixed(0)}% of your final balance comes from compound growth — not your own contributions.`,
    `Increasing your monthly contribution by $50 could add ${fmt(extra50.finalValue - finalValue)} over ${years} years.`,
    `Starting 5 years earlier could add ${fmt(earlier5.finalValue - finalValue)} to your final balance.`,
    `At ${rate}% annual return, your money doubles roughly every ${doublingYears} years.`,
  ];
}

function getRealWorldItems(value) {
  return (REAL_WORLD.find(r => value < r.threshold) || REAL_WORLD[REAL_WORLD.length - 1]).items;
}

// ─── UI Primitives ────────────────────────────────────────────────────────────
const inputStyle = { width: "100%", height: 40, padding: "0 12px", border: `1.5px solid ${C.border}`, borderRadius: 10, fontSize: 14, fontWeight: 500, color: C.text, background: C.bgCard, outline: "none", boxSizing: "border-box", fontFamily: "inherit" };
const selectStyle = { ...inputStyle, appearance: "none", WebkitAppearance: "none", backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: 32, cursor: "pointer" };

function Label({ children, tooltip }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>{children}</span>
      {tooltip && <span title={tooltip} style={{ cursor: "help", color: C.textMuted, display: "flex" }}><Info size={11} /></span>}
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: C.textSub }}>{label}</span>
      <div onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 999, cursor: "pointer", transition: "background 0.2s", background: value ? C.navy : C.border, position: "relative" }}>
        <div style={{ position: "absolute", top: 3, left: value ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, dark, green }) {
  const bg = dark ? C.navy : green ? C.greenSoft : C.bgCard;
  const col = dark ? "#fff" : green ? C.green : C.text;
  return (
    <div style={{ background: bg, border: `1px solid ${dark ? "transparent" : green ? C.greenMid : C.border}`, borderRadius: 14, padding: "16px 18px", boxShadow: dark ? `0 4px 20px ${C.navyGlow}` : "0 1px 3px rgba(0,0,0,0.04)" }}>
      <p style={{ fontSize: 10, fontWeight: 700, color: dark ? "rgba(255,255,255,0.7)" : green ? C.green : C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 8px" }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 900, color: col, margin: 0, letterSpacing: "-0.5px", lineHeight: 1 }}>{value}</p>
      {sub && <p style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.55)" : C.textMuted, marginTop: 5, fontWeight: 500 }}>{sub}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#fff", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", boxShadow: "0 4px 20px rgba(0,0,0,0.1)", fontSize: 13 }}>
      <p style={{ fontWeight: 700, color: C.text, margin: "0 0 8px" }}>Year {label}</p>
      {payload.filter(p => p.value > 0).map(p => (
        <div key={p.dataKey} style={{ display: "flex", justifyContent: "space-between", gap: 16, color: p.color, fontWeight: 600, marginBottom: 2 }}>
          <span>{p.name}</span><span>{fmtShort(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InterestCalculator() {
  const [v, setV] = useState({ principal: 10000, years: 30, rate: 8, compound: "monthly", contribution: 100, contribFreq: "monthly", timing: "end" });
  const [activeScenario, setActiveScenario] = useState(1);
  const [scrubYear, setScrubYear] = useState(null);
  const [inflationAdj, setInflationAdj] = useState(false);
  const [logScale, setLogScale] = useState(false);
  const [compareMode, setCompareMode] = useState(false);
  const [compareContrib, setCompareContrib] = useState(300);
  const [waitMode, setWaitMode] = useState(0);
  const [mathOpen, setMathOpen] = useState(false);
  const [savedSims, setSavedSims] = useState([]);
  const [saveMsg, setSaveMsg] = useState("");
  const [insightIdx, setInsightIdx] = useState(0);

  const set = useCallback((key, val) => { setV(prev => ({ ...prev, [key]: val })); setActiveScenario(null); }, []);

  const result = useMemo(() => calcGrowth({ ...v, startDelay: waitMode }), [v, waitMode]);
  const compareResult = useMemo(() => compareMode ? calcGrowth({ ...v, contribution: compareContrib, startDelay: waitMode }) : null, [v, compareContrib, compareMode, waitMode]);
  const milestones = useMemo(() => getMilestones(result.data, v.principal), [result.data, v.principal]);
  const insights = useMemo(() => getInsights({ ...v, ...result }), [v, result]);
  const realWorldItems = useMemo(() => getRealWorldItems(result.finalValue), [result.finalValue]);

  const totalYears = v.years + waitMode;
  const displayYear = scrubYear ?? totalYears;
  const scrubPoint = result.data[Math.min(displayYear, result.data.length - 1)] || result.data[result.data.length - 1];

  const chartData = useMemo(() => result.data.map(d => {
    const adj = inflationAdj ? Math.pow(1.03, d.year) : 1;
    return {
      ...d,
      portfolio: Math.round(d.portfolio / adj),
      contributions: Math.round(d.contributions / adj),
      portfolioNominal: inflationAdj ? d.portfolio : undefined,
      portfolioB: compareResult ? Math.round((compareResult.data[d.year]?.portfolio || 0) / adj) : undefined,
    };
  }), [result.data, compareResult, inflationAdj]);

  const saveSim = () => {
    setSavedSims(prev => [{ id: Date.now(), label: `${fmt(v.principal)} @ ${v.rate}% for ${v.years}yr`, finalValue: result.finalValue, params: { ...v } }, ...prev].slice(0, 5));
    setSaveMsg("Saved!"); setTimeout(() => setSaveMsg(""), 2000);
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Inter', system-ui, sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        input:focus, select:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentSoft}; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 999px; background: ${C.border}; outline: none; border: none; padding: 0; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${C.navy}; cursor: pointer; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        .sc-btn { transition: all 0.18s !important; }
        .sc-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 20px ${C.navyGlow} !important; }
        .card { background: #fff; border: 1px solid ${C.border}; border-radius: 18px; padding: 22px 24px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); }
        @media (max-width: 960px) { .main-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 640px) { .metric-grid { grid-template-columns: 1fr 1fr !important; } }
      `}</style>

      {/* HERO */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 60%, #1e4d8c 100%)`, borderRadius: 20, padding: "36px 40px", marginBottom: 20, position: "relative", overflow: "hidden", boxShadow: `0 12px 48px ${C.navyGlow}` }}>
        <div style={{ position: "absolute", right: -50, top: -50, width: 260, height: 260, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.05)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.1)", borderRadius: 999, padding: "5px 14px", marginBottom: 14 }}>
              <TrendingUp size={12} style={{ color: "rgba(255,255,255,0.8)" }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.8)", textTransform: "uppercase", letterSpacing: "0.08em" }}>Simulation</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: "-0.7px", lineHeight: 1.1 }}>Investment Growth Simulator</h1>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", margin: 0 }}>Explore how compound interest grows your investments over time.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 16, padding: "20px 24px", minWidth: 220, backdropFilter: "blur(8px)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.6)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 6px" }}>Projected Portfolio Value</p>
            <p style={{ fontSize: 32, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-1px", lineHeight: 1 }}>{fmt(scrubPoint.portfolio)}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.2)", borderRadius: 999, padding: "3px 10px" }}>
                <ArrowUpRight size={11} style={{ color: "#86EFAC" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#86EFAC" }}>+{fmt(scrubPoint.portfolio - v.principal)}</span>
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 500 }}>after {displayYear} yr{displayYear !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SCENARIO BUTTONS */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {SCENARIOS.map(({ label, Icon, desc }, i) => (
          <button key={i} className="sc-btn" onClick={() => { setActiveScenario(i); setV(SCENARIOS[i].values); setScrubYear(null); }} style={{ display: "flex", alignItems: "center", gap: 9, padding: "10px 18px", borderRadius: 12, cursor: "pointer", border: `1.5px solid ${activeScenario === i ? C.navy : C.border}`, background: activeScenario === i ? C.navy : C.bgCard, color: activeScenario === i ? "#fff" : C.text, fontSize: 13, fontWeight: 600, boxShadow: activeScenario === i ? `0 4px 16px ${C.navyGlow}` : "0 1px 3px rgba(0,0,0,0.04)", fontFamily: "inherit" }}>
            <Icon size={15} style={{ opacity: 0.8 }} />
            <div style={{ textAlign: "left" }}>
              <div>{label}</div>
              <div style={{ fontSize: 10, opacity: 0.65, fontWeight: 400 }}>{desc}</div>
            </div>
          </button>
        ))}
      </div>

      {/* MAIN GRID */}
      <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: 20, alignItems: "start" }}>

        {/* LEFT: INPUTS */}
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 14, borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 32, height: 32, borderRadius: 9, background: C.accentSoft, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BarChart2 size={15} style={{ color: C.accent }} />
            </div>
            <h2 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: 0 }}>Investment Settings</h2>
          </div>

          {/* Starting Amount */}
          <div>
            <Label tooltip="The lump sum you invest today">Starting Amount</Label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13, fontWeight: 600 }}>$</span>
              <input type="number" value={v.principal} onChange={e => set("principal", +e.target.value)} style={{ ...inputStyle, paddingLeft: 24 }} min={0} />
            </div>
            <div style={{ marginTop: 8 }}>
              <input type="range" min={0} max={100000} step={500} value={v.principal} onChange={e => set("principal", +e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}><span>$0</span><span>$100K</span></div>
            </div>
          </div>

          {/* Investment Length */}
          <div>
            <Label tooltip="How many years you plan to stay invested">Investment Length</Label>
            <div style={{ position: "relative" }}>
              <input type="number" value={v.years} onChange={e => set("years", +e.target.value)} style={{ ...inputStyle, paddingRight: 36 }} min={1} max={50} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 11, fontWeight: 600 }}>yrs</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <input type="range" min={1} max={50} step={1} value={v.years} onChange={e => set("years", +e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}><span>1 yr</span><span>50 yrs</span></div>
            </div>
          </div>

          {/* Annual Return Rate */}
          <div>
            <Label tooltip="Expected average annual return. S&P 500 has historically averaged ~10%.">Annual Return Rate</Label>
            <div style={{ position: "relative" }}>
              <input type="number" value={v.rate} onChange={e => set("rate", +e.target.value)} style={{ ...inputStyle, paddingRight: 36 }} min={0} max={30} step={0.5} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 11, fontWeight: 600 }}>%</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <input type="range" min={0} max={20} step={0.5} value={v.rate} onChange={e => set("rate", +e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}><span>0%</span><span>20%</span></div>
            </div>
          </div>

          {/* Compound Frequency */}
          <div>
            <Label tooltip="How often interest compounds. More frequent = slightly more growth.">Compound Frequency</Label>
            <select value={v.compound} onChange={e => set("compound", e.target.value)} style={selectStyle}>
              {COMPOUND_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>

          <div style={{ height: 1, background: C.border }} />

          {/* Contribution Amount */}
          <div>
            <Label tooltip="How much you add to your investment regularly">Contribution Amount</Label>
            <div style={{ position: "relative", marginBottom: 8 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13, fontWeight: 600 }}>$</span>
              <input type="number" value={v.contribution} onChange={e => set("contribution", +e.target.value)} style={{ ...inputStyle, paddingLeft: 24 }} min={0} />
            </div>
            <select value={v.contribFreq} onChange={e => set("contribFreq", e.target.value)} style={selectStyle}>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Contribution Timing */}
          <div>
            <Label tooltip="Beginning of period contributions earn slightly more interest">Contribution Timing</Label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {[{ v: "beginning", l: "Beginning" }, { v: "end", l: "End of Period" }].map(opt => (
                <button key={opt.v} onClick={() => set("timing", opt.v)} style={{ height: 36, borderRadius: 8, border: `1.5px solid ${v.timing === opt.v ? C.navy : C.border}`, background: v.timing === opt.v ? C.navy : "transparent", color: v.timing === opt.v ? "#fff" : C.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}>
                  {opt.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{ height: 1, background: C.border }} />

          {/* Toggles */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Toggle label="Adjust for Inflation (3%)" value={inflationAdj} onChange={setInflationAdj} />
            <Toggle label="Logarithmic Chart Scale" value={logScale} onChange={setLogScale} />
            <Toggle label="Compare Two Scenarios" value={compareMode} onChange={setCompareMode} />
          </div>

          {/* Compare B */}
          {compareMode && (
            <div style={{ background: C.accentSoft, borderRadius: 12, padding: 14, border: `1px solid ${C.accentMid}` }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.accent, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Scenario B — Monthly Contribution</p>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13, fontWeight: 600 }}>$</span>
                <input type="number" value={compareContrib} onChange={e => setCompareContrib(+e.target.value)} style={{ ...inputStyle, paddingLeft: 24 }} />
              </div>
              {compareResult && (
                <p style={{ fontSize: 12, color: C.accent, fontWeight: 700, margin: "8px 0 0" }}>
                  Final: {fmt(compareResult.finalValue)} (+{fmt(compareResult.finalValue - result.finalValue)} more)
                </p>
              )}
            </div>
          )}

          {/* Save */}
          <button onClick={saveSim} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, height: 40, borderRadius: 10, border: `1.5px solid ${C.border}`, background: C.bgCard, color: C.textSub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
            <Save size={14} />{saveMsg || "Save Simulation"}
          </button>

          {savedSims.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", margin: 0 }}>Saved Simulations</p>
              {savedSims.map(s => (
                <div key={s.id} onClick={() => { setV(s.params); setActiveScenario(null); }} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: C.bg, borderRadius: 8, cursor: "pointer", fontSize: 12 }}>
                  <span style={{ color: C.textSub, fontWeight: 500 }}>{s.label}</span>
                  <span style={{ color: C.green, fontWeight: 700 }}>{fmtShort(s.finalValue)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: RESULTS */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Metric Cards */}
          <div className="metric-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <MetricCard dark label="Final Value" value={fmt(scrubPoint.portfolio)} sub={`After ${displayYear} years`} />
            <MetricCard label="Total Contributions" value={fmt(scrubPoint.contributions)} sub="Money you put in" />
            <MetricCard green label="Interest Earned" value={fmt(scrubPoint.interest)} sub={`${result.interestPct.toFixed(0)}% of final balance`} />
          </div>

          {/* What if you waited? */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
              <Clock size={14} style={{ color: C.textMuted }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSub, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>What If You Waited?</p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {WAIT_OPTIONS.map((w, i) => {
                const delayed = i > 0 ? calcGrowth({ ...v, startDelay: w.delay }) : result;
                const loss = result.finalValue - delayed.finalValue;
                const active = waitMode === w.delay;
                return (
                  <button key={i} onClick={() => setWaitMode(w.delay)} style={{ flex: 1, padding: "10px 8px", borderRadius: 10, cursor: "pointer", fontFamily: "inherit", border: `1.5px solid ${active ? C.navy : C.border}`, background: active ? C.navy : C.bgCard, color: active ? "#fff" : C.text, transition: "all 0.15s" }}>
                    <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 3 }}>{w.label}</div>
                    {i === 0
                      ? <div style={{ fontSize: 11, color: active ? "#86EFAC" : C.green, fontWeight: 600 }}>{fmtShort(result.finalValue)}</div>
                      : <div style={{ fontSize: 11, color: active ? "rgba(255,120,120,0.9)" : "#EF4444", fontWeight: 600 }}>−{fmtShort(loss)}</div>
                    }
                  </button>
                );
              })}
            </div>
          </div>

          {/* Timeline Scrubber */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSub, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Timeline Scrubber</p>
              <span style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>Year {scrubYear ?? totalYears} — {fmtShort(scrubPoint.portfolio)}</span>
            </div>
            <input type="range" min={0} max={totalYears} step={1} value={scrubYear ?? totalYears}
              onChange={e => setScrubYear(+e.target.value)}
              onMouseUp={() => setScrubYear(null)} onTouchEnd={() => setScrubYear(null)}
              style={{ width: "100%" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}>
              <span>Year 0</span><span>Year {totalYears}</span>
            </div>
          </div>

          {/* Chart */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: C.text, margin: "0 0 3px" }}>Portfolio Growth Over Time</h3>
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>{inflationAdj ? "Inflation-adjusted (3%)" : "Nominal value"} · {totalYears} year projection</p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 5, fontSize: 11, fontWeight: 600 }}>
                {[
                  { color: C.navy, label: "Portfolio Value" },
                  { color: C.accent, label: "Contributions", dashed: true },
                  inflationAdj ? { color: C.amber, label: "Nominal Value" } : null,
                  compareMode ? { color: C.purple, label: "Scenario B" } : null,
                ].filter(Boolean).map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 16, height: 3, borderRadius: 2, background: item.color, opacity: item.dashed ? 0.7 : 1 }} />
                    <span style={{ color: C.textSub }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ height: 300 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.navy} stopOpacity={0.12} /><stop offset="95%" stopColor={C.navy} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.accent} stopOpacity={0.08} /><stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={C.purple} stopOpacity={0.1} /><stop offset="95%" stopColor={C.purple} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.textMuted, fontWeight: 500 }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.textMuted, fontWeight: 500 }} tickFormatter={fmtShort} axisLine={false} tickLine={false} scale={logScale ? "log" : "auto"} domain={logScale ? ["auto", "auto"] : [0, "auto"]} />
                  <Tooltip content={<CustomTooltip />} />
                  {milestones.map(m => (
                    <ReferenceLine key={m.label} x={m.year} stroke={m.color} strokeDasharray="4 3" strokeWidth={1.5}
                      label={{ value: m.label, position: "insideTopRight", fontSize: 9, fill: m.color, fontWeight: 700 }} />
                  ))}
                  {scrubYear !== null && <ReferenceLine x={scrubYear} stroke={C.amber} strokeWidth={2} strokeDasharray="3 3" />}
                  <Area type="monotone" dataKey="portfolio" name="Portfolio Value" stroke={C.navy} strokeWidth={2.5} fill="url(#g1)" dot={false} />
                  <Area type="monotone" dataKey="contributions" name="Contributions" stroke={C.accent} strokeWidth={2} strokeDasharray="5 3" fill="url(#g2)" dot={false} />
                  {inflationAdj && <Area type="monotone" dataKey="portfolioNominal" name="Nominal Value" stroke={C.amber} strokeWidth={1.5} strokeDasharray="3 2" fill="none" dot={false} />}
                  {compareMode && <Area type="monotone" dataKey="portfolioB" name="Scenario B" stroke={C.purple} strokeWidth={2} fill="url(#g3)" dot={false} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>
            {milestones.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {milestones.map(m => (
                  <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 5, background: C.bg, borderRadius: 999, padding: "4px 10px" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: m.color }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.textSub }}>Yr {m.year} — {m.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Balance Breakdown */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 12px" }}>Balance Breakdown</p>
            <div style={{ height: 10, borderRadius: 999, overflow: "hidden", background: C.border, marginBottom: 10 }}>
              <div style={{ display: "flex", height: "100%", transition: "all 0.5s" }}>
                <div style={{ width: `${(result.totalContributions / result.finalValue) * 100}%`, background: C.accent, borderRadius: "999px 0 0 999px" }} />
                <div style={{ flex: 1, background: C.green, borderRadius: "0 999px 999px 0" }} />
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: C.accent }} /><span style={{ fontSize: 12, color: C.textSub, fontWeight: 600 }}>Contributions — {((result.totalContributions / result.finalValue) * 100).toFixed(0)}%</span></div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}><div style={{ width: 10, height: 10, borderRadius: 3, background: C.green }} /><span style={{ fontSize: 12, color: C.textSub, fontWeight: 600 }}>Interest — {result.interestPct.toFixed(0)}%</span></div>
            </div>
          </div>

          {/* Real World Value */}
          <div className="card" style={{ padding: "16px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
              <DollarSign size={14} style={{ color: C.textMuted }} />
              <p style={{ fontSize: 12, fontWeight: 700, color: C.textSub, margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>Real World Value</p>
            </div>
            <p style={{ fontSize: 13, color: C.textSub, margin: "0 0 8px", fontWeight: 500 }}>{fmt(result.finalValue)} could buy:</p>
            {realWorldItems.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: C.accent, flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: C.text, fontWeight: 500 }}>{item}</span>
              </div>
            ))}
          </div>

          {/* Learning Insights */}
          <div style={{ background: `linear-gradient(135deg, ${C.accentSoft}, #F0FDF4)`, border: `1px solid ${C.accentMid}`, borderRadius: 18, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <BookOpen size={15} style={{ color: C.accent }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: C.accent, textTransform: "uppercase", letterSpacing: "0.07em", margin: 0 }}>Learning Insight</p>
                  <div style={{ display: "flex", gap: 4 }}>
                    {insights.map((_, i) => (
                      <button key={i} onClick={() => setInsightIdx(i)} style={{ width: 8, height: 8, borderRadius: "50%", padding: 0, background: i === insightIdx ? C.accent : C.accentMid, border: "none", cursor: "pointer" }} />
                    ))}
                  </div>
                </div>
                <p style={{ fontSize: 14, color: C.text, margin: 0, lineHeight: 1.6, fontWeight: 500 }}>{insights[insightIdx]}</p>
              </div>
            </div>
          </div>

          {/* Explain the Math */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <button onClick={() => setMathOpen(!mathOpen)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <BookOpen size={14} style={{ color: C.textMuted }} />
                <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>How is this calculated?</span>
              </div>
              {mathOpen ? <ChevronUp size={16} style={{ color: C.textMuted }} /> : <ChevronDown size={16} style={{ color: C.textMuted }} />}
            </button>
            {mathOpen && (
              <div style={{ padding: "0 20px 20px", borderTop: `1px solid ${C.border}` }}>
                <div style={{ background: C.bg, borderRadius: 10, padding: "14px 16px", margin: "14px 0", fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: C.navy, textAlign: "center", letterSpacing: "0.02em" }}>
                  A = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) − 1) / (r/n)]
                </div>
                {[["A", "Final amount — what you end up with"], ["P", `Principal — starting amount (${fmt(v.principal)})`], ["r", `Annual interest rate as a decimal (${v.rate / 100})`], ["n", `Compounding periods per year (${COMPOUND_OPTS.find(o => o.value === v.compound)?.n})`], ["t", `Time in years (${v.years})`], ["PMT", `Regular contribution per period`]].map(([sym, desc]) => (
                  <div key={sym} style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 6 }}>
                    <span style={{ fontFamily: "monospace", fontWeight: 800, color: C.navy, minWidth: 28, fontSize: 13 }}>{sym}</span>
                    <span style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>{desc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}