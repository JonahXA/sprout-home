import React, { useState, useMemo, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import {
  TrendingUp, BarChart2, Shield, ChevronDown, ChevronUp,
  ArrowUpRight, Save, Sprout, Settings2,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  navy: "#1B2B5E", navyMid: "#141E43", navyLight: "#243570",
  navyGlow: "rgba(27,43,94,0.12)",
  accent: "#3B82F6", accentSoft: "#E8F0FE", accentMid: "#BFDBFE",
  green: "#2D9B6F", greenSoft: "#E8F8F0", greenMid: "#BBF7D0",
  amber: "#F59E0B",
  purple: "#8B5CF6",
  bg: "#F5F7FB", bgCard: "#FFFFFF",
  border: "#E5E7EB", borderMid: "#D1D5DB",
  text: "#0F172A", textSub: "#475569", textMuted: "#94A3B8",
};

// ─── Constants ────────────────────────────────────────────────────────────────
const COMPOUND_OPTS = [
  { value: "annually",  label: "Annually",  n: 1   },
  { value: "quarterly", label: "Quarterly", n: 4   },
  { value: "monthly",   label: "Monthly",   n: 12  },
  { value: "daily",     label: "Daily",     n: 365 },
];

const SCENARIOS = [
  { label: "Starter",    Icon: Sprout,    desc: "Just getting started",       values: { principal: 1000,  years: 10, rate: 6,  compound: "monthly", contribution: 50,  contribFreq: "monthly", timing: "end"       } },
  { label: "Builder",    Icon: BarChart2, desc: "Consistent long-term growth", values: { principal: 10000, years: 30, rate: 8,  compound: "monthly", contribution: 100, contribFreq: "monthly", timing: "end"       } },
  { label: "Aggressive", Icon: TrendingUp, desc: "High contributions",         values: { principal: 25000, years: 20, rate: 10, compound: "monthly", contribution: 500, contribFreq: "monthly", timing: "beginning" } },
  { label: "Retirement", Icon: Shield,    desc: "40-year wealth building",     values: { principal: 5000,  years: 40, rate: 7,  compound: "monthly", contribution: 200, contribFreq: "monthly", timing: "end"       } },
];

const WAIT_OPTIONS = [
  { label: "Start Now",     delay: 0  },
  { label: "Wait 5 Years",  delay: 5  },
  { label: "Wait 10 Years", delay: 10 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);

const fmtShort = (v) =>
  v >= 1e6 ? `$${(v / 1e6).toFixed(1)}M` : v >= 1e3 ? `$${(v / 1e3).toFixed(0)}K` : `$${Math.round(v)}`;

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
    data.push({
      year: yr,
      portfolio: Math.round(balance),
      contributions: Math.round(totalContrib),
      interest: Math.round(balance - totalContrib),
    });
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
  return {
    data,
    finalValue: balance,
    totalContributions: totalContrib,
    totalInterest: balance - totalContrib,
    interestPct: ((balance - totalContrib) / Math.max(balance, 1)) * 100,
  };
}

function getMilestones(data, principal) {
  const milestones = [];
  let doubleFound = false, crossFound = false;
  for (let i = 1; i < data.length; i++) {
    const d = data[i];
    if (!doubleFound && d.portfolio >= principal * 2 && d.portfolio > 0) {
      milestones.push({ year: d.year, label: "2× Your Money", color: C.green });
      doubleFound = true;
    }
    if (!crossFound && d.interest > d.contributions && d.year > 0) {
      milestones.push({ year: d.year, label: "Growth > Contributions", color: C.purple });
      crossFound = true;
    }
  }
  return milestones;
}

// ─── UI primitives ────────────────────────────────────────────────────────────
const inputStyle = {
  width: "100%", height: 40, padding: "0 12px",
  border: `1.5px solid ${C.border}`, borderRadius: 10,
  fontSize: 14, fontWeight: 500, color: C.text, background: C.bgCard,
  outline: "none", boxSizing: "border-box", fontFamily: "inherit",
};

const selectStyle = {
  ...inputStyle,
  appearance: "none", WebkitAppearance: "none",
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center",
  paddingRight: 32, cursor: "pointer",
};

function Label({ children }) {
  return (
    <div style={{ marginBottom: 6 }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.textSub, textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {children}
      </span>
    </div>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 500, color: C.textSub }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{ width: 40, height: 22, borderRadius: 999, cursor: "pointer", transition: "background 0.2s", background: value ? C.navy : C.border, position: "relative", flexShrink: 0 }}
      >
        <div style={{ position: "absolute", top: 3, left: value ? 20 : 3, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
      </div>
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
  const [v, setV] = useState({
    principal: 10000, years: 30, rate: 8,
    compound: "monthly", contribution: 100, contribFreq: "monthly", timing: "end",
  });
  const [activeScenario, setActiveScenario] = useState(1);
  const [scrubYear, setScrubYear]         = useState(null);
  const [inflationAdj, setInflationAdj]   = useState(false);
  const [logScale, setLogScale]           = useState(false);
  const [compareMode, setCompareMode]     = useState(false);
  const [compareContrib, setCompareContrib] = useState(300);
  const [waitMode, setWaitMode]           = useState(0);
  const [advancedOpen, setAdvancedOpen]   = useState(false);
  const [savedSims, setSavedSims]         = useState([]);
  const [saveMsg, setSaveMsg]             = useState("");

  const set = useCallback((key, val) => {
    setV(prev => ({ ...prev, [key]: val }));
    setActiveScenario(null);
  }, []);

  const result        = useMemo(() => calcGrowth({ ...v, startDelay: waitMode }), [v, waitMode]);
  const compareResult = useMemo(() =>
    compareMode ? calcGrowth({ ...v, contribution: compareContrib, startDelay: waitMode }) : null,
    [v, compareContrib, compareMode, waitMode]
  );
  const milestones = useMemo(() => getMilestones(result.data, v.principal), [result.data, v.principal]);

  const totalYears  = v.years + waitMode;
  const displayYear = scrubYear ?? totalYears;
  const scrubPoint  = result.data[Math.min(displayYear, result.data.length - 1)] || result.data[result.data.length - 1];

  const chartData = useMemo(() => result.data.map(d => {
    const adj = inflationAdj ? Math.pow(1.03, d.year) : 1;
    return {
      ...d,
      portfolio:       Math.round(d.portfolio / adj),
      contributions:   Math.round(d.contributions / adj),
      portfolioNominal: inflationAdj ? d.portfolio : undefined,
      portfolioB:      compareResult ? Math.round((compareResult.data[d.year]?.portfolio || 0) / adj) : undefined,
    };
  }), [result.data, compareResult, inflationAdj]);

  const saveSim = () => {
    setSavedSims(prev => [
      { id: Date.now(), label: `${fmt(v.principal)} @ ${v.rate}% · ${v.years}yr`, finalValue: result.finalValue, params: { ...v } },
      ...prev,
    ].slice(0, 5));
    setSaveMsg("Saved!");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const contribLabel = v.contribFreq === "monthly" ? "mo" : "yr";

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif", color: C.text }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        input:focus, select:focus { border-color: ${C.accent} !important; box-shadow: 0 0 0 3px ${C.accentSoft}; }
        input[type=range] { -webkit-appearance: none; height: 4px; border-radius: 999px; background: ${C.border}; outline: none; border: none; padding: 0; width: 100%; }
        input[type=range]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${C.navy}; cursor: pointer; border: 3px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); }
        .sc-btn { transition: all 0.18s !important; }
        .sc-btn:hover { background: ${C.navy} !important; color: #fff !important; border-color: ${C.navy} !important; }
        @media (max-width: 900px) { .sim-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <div style={{ background: `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 60%, #1e4d8c 100%)`, borderRadius: 20, padding: "32px 36px", marginBottom: 20, position: "relative", overflow: "hidden", boxShadow: `0 12px 48px ${C.navyGlow}` }}>
        <div style={{ position: "absolute", right: -60, top: -60, width: 280, height: 280, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.04)" }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.1)", borderRadius: 999, padding: "4px 12px", marginBottom: 12 }}>
              <TrendingUp size={11} style={{ color: "rgba(255,255,255,0.75)" }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: "0.09em" }}>Simulation</span>
            </div>
            <h1 style={{ fontSize: 28, fontWeight: 900, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.6px", lineHeight: 1.1 }}>Investment Growth Simulator</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", margin: 0 }}>See how your money grows over time. Adjust inputs to explore.</p>
          </div>
          <div style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 16, padding: "18px 22px", minWidth: 200, backdropFilter: "blur(8px)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.55)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 5px" }}>Projected Value</p>
            <p style={{ fontSize: 30, fontWeight: 900, color: "#fff", margin: "0 0 8px", letterSpacing: "-1px", lineHeight: 1 }}>{fmt(scrubPoint.portfolio)}</p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(34,197,94,0.2)", borderRadius: 999, padding: "3px 9px" }}>
                <ArrowUpRight size={11} style={{ color: "#86EFAC" }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: "#86EFAC" }}>+{fmt(scrubPoint.portfolio - v.principal)}</span>
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>after {displayYear} yr{displayYear !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SCENARIO PRESETS ──────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {SCENARIOS.map(({ label, Icon }, i) => (
          <button
            key={i}
            className="sc-btn"
            onClick={() => { setActiveScenario(i); setV(SCENARIOS[i].values); setScrubYear(null); }}
            style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 999, cursor: "pointer", border: `1.5px solid ${activeScenario === i ? C.navy : C.border}`, background: activeScenario === i ? C.navy : C.bgCard, color: activeScenario === i ? "#fff" : C.text, fontSize: 13, fontWeight: 600, fontFamily: "inherit" }}
          >
            <Icon size={14} style={{ opacity: 0.8 }} />
            {label}
          </button>
        ))}
      </div>

      {/* ── MAIN GRID ─────────────────────────────────────────────────────── */}
      <div className="sim-grid" style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 20, alignItems: "start" }}>

        {/* LEFT: Controls */}
        <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px", display: "flex", flexDirection: "column", gap: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

          {/* Starting Amount */}
          <div>
            <Label>Starting Amount</Label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13, fontWeight: 600 }}>$</span>
              <input type="number" value={v.principal} onChange={e => set("principal", +e.target.value)} style={{ ...inputStyle, paddingLeft: 24 }} min={0} />
            </div>
            <div style={{ marginTop: 8 }}>
              <input type="range" min={0} max={100000} step={500} value={v.principal} onChange={e => set("principal", +e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}><span>$0</span><span>$100K</span></div>
            </div>
          </div>

          {/* Contribution */}
          <div>
            <Label>Monthly Contribution</Label>
            <div style={{ position: "relative" }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13, fontWeight: 600 }}>$</span>
              <input type="number" value={v.contribution} onChange={e => set("contribution", +e.target.value)} style={{ ...inputStyle, paddingLeft: 24, paddingRight: 38 }} min={0} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 11, fontWeight: 600 }}>/{contribLabel}</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <input type="range" min={0} max={2000} step={25} value={v.contribution} onChange={e => set("contribution", +e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}><span>$0</span><span>$2K</span></div>
            </div>
          </div>

          {/* Years */}
          <div>
            <Label>Investment Length</Label>
            <div style={{ position: "relative" }}>
              <input type="number" value={v.years} onChange={e => set("years", +e.target.value)} style={{ ...inputStyle, paddingRight: 36 }} min={1} max={50} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 11, fontWeight: 600 }}>yrs</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <input type="range" min={1} max={50} step={1} value={v.years} onChange={e => set("years", +e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}><span>1 yr</span><span>50 yrs</span></div>
            </div>
          </div>

          {/* Rate */}
          <div>
            <Label>Annual Return</Label>
            <div style={{ position: "relative" }}>
              <input type="number" value={v.rate} onChange={e => set("rate", +e.target.value)} style={{ ...inputStyle, paddingRight: 36 }} min={0} max={30} step={0.5} />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 11, fontWeight: 600 }}>%</span>
            </div>
            <div style={{ marginTop: 8 }}>
              <input type="range" min={0} max={20} step={0.5} value={v.rate} onChange={e => set("rate", +e.target.value)} />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}><span>0%</span><span>20%</span></div>
            </div>
          </div>

          {/* ── Advanced Settings ──────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <button
              onClick={() => setAdvancedOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <Settings2 size={13} style={{ color: C.textMuted }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: C.textSub }}>Advanced Settings</span>
              </div>
              {advancedOpen
                ? <ChevronUp size={14} style={{ color: C.textMuted }} />
                : <ChevronDown size={14} style={{ color: C.textMuted }} />}
            </button>

            {advancedOpen && (
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: 16 }}>

                {/* Compound Frequency */}
                <div>
                  <Label>Compound Frequency</Label>
                  <select value={v.compound} onChange={e => set("compound", e.target.value)} style={selectStyle}>
                    {COMPOUND_OPTS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                {/* Contribution Frequency */}
                <div>
                  <Label>Contribution Frequency</Label>
                  <select value={v.contribFreq} onChange={e => set("contribFreq", e.target.value)} style={selectStyle}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>

                {/* Contribution Timing */}
                <div>
                  <Label>Contribution Timing</Label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {[{ v: "beginning", l: "Beginning" }, { v: "end", l: "End of Period" }].map(opt => (
                      <button
                        key={opt.v}
                        onClick={() => set("timing", opt.v)}
                        style={{ height: 34, borderRadius: 8, border: `1.5px solid ${v.timing === opt.v ? C.navy : C.border}`, background: v.timing === opt.v ? C.navy : "transparent", color: v.timing === opt.v ? "#fff" : C.textSub, fontSize: 11, fontWeight: 600, cursor: "pointer", transition: "all 0.15s", fontFamily: "inherit" }}
                      >
                        {opt.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wait to Start */}
                <div>
                  <Label>Start Investing</Label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {WAIT_OPTIONS.map((w, i) => {
                      const active = waitMode === w.delay;
                      return (
                        <button
                          key={i}
                          onClick={() => setWaitMode(w.delay)}
                          style={{ flex: 1, padding: "7px 6px", borderRadius: 8, cursor: "pointer", fontFamily: "inherit", fontSize: 11, fontWeight: 600, border: `1.5px solid ${active ? C.navy : C.border}`, background: active ? C.navy : C.bgCard, color: active ? "#fff" : C.textSub, transition: "all 0.15s", whiteSpace: "nowrap" }}
                        >
                          {w.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <Toggle label="Adjust for Inflation (3%)" value={inflationAdj} onChange={setInflationAdj} />
                  <Toggle label="Log Scale Chart"           value={logScale}     onChange={setLogScale}     />
                  <Toggle label="Compare Two Scenarios"     value={compareMode}  onChange={setCompareMode}  />
                </div>

                {compareMode && (
                  <div style={{ background: C.accentSoft, borderRadius: 10, padding: 12, border: `1px solid ${C.accentMid}` }}>
                    <p style={{ fontSize: 10, fontWeight: 700, color: C.accent, margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Scenario B — Monthly Contribution</p>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: C.textMuted, fontSize: 13, fontWeight: 600 }}>$</span>
                      <input type="number" value={compareContrib} onChange={e => setCompareContrib(+e.target.value)} style={{ ...inputStyle, paddingLeft: 24 }} />
                    </div>
                    {compareResult && (
                      <p style={{ fontSize: 12, color: C.accent, fontWeight: 700, margin: "8px 0 0" }}>
                        Final: {fmt(compareResult.finalValue)} (+{fmt(compareResult.finalValue - result.finalValue)})
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Save ──────────────────────────────────────────────────────── */}
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
            <button
              onClick={saveSim}
              style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%", height: 38, borderRadius: 999, border: `1.5px solid ${C.border}`, background: "transparent", color: C.textSub, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
            >
              <Save size={13} />{saveMsg || "Save Simulation"}
            </button>

            {savedSims.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 5, marginTop: 10 }}>
                {savedSims.map(s => (
                  <div
                    key={s.id}
                    onClick={() => { setV(s.params); setActiveScenario(null); }}
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 10px", background: C.bg, borderRadius: 8, cursor: "pointer", fontSize: 11 }}
                  >
                    <span style={{ color: C.textSub, fontWeight: 500 }}>{s.label}</span>
                    <span style={{ color: C.green, fontWeight: 700 }}>{fmtShort(s.finalValue)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Chart + Results */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Stat Pills */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            {[
              { label: "Projected Value",    value: fmt(scrubPoint.portfolio),     sub: `After ${displayYear} yrs`, dark: true  },
              { label: "Total Contributed",  value: fmt(scrubPoint.contributions), sub: "Money you put in"                      },
              { label: "Interest Earned",    value: fmt(scrubPoint.interest),      sub: `${result.interestPct.toFixed(0)}% of balance`, green: true },
            ].map(({ label, value, sub, dark, green }) => (
              <div
                key={label}
                style={{ background: dark ? C.navy : green ? C.greenSoft : C.bgCard, border: `1px solid ${dark ? "transparent" : green ? C.greenMid : C.border}`, borderRadius: 14, padding: "14px 16px", boxShadow: dark ? `0 4px 20px ${C.navyGlow}` : "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p style={{ fontSize: 10, fontWeight: 700, color: dark ? "rgba(255,255,255,0.6)" : green ? C.green : C.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", margin: "0 0 6px" }}>{label}</p>
                <p style={{ fontSize: 20, fontWeight: 900, color: dark ? "#fff" : green ? C.green : C.text, margin: 0, letterSpacing: "-0.4px", lineHeight: 1 }}>{value}</p>
                <p style={{ fontSize: 11, color: dark ? "rgba(255,255,255,0.5)" : C.textMuted, marginTop: 4, fontWeight: 500 }}>{sub}</p>
              </div>
            ))}
          </div>

          {/* Chart Card */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: 16, padding: "20px 22px", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>

            {/* Chart header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 800, color: C.text, margin: "0 0 3px" }}>Portfolio Growth</h3>
                <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>
                  {inflationAdj ? "Inflation-adjusted · " : ""}
                  {totalYears}-year projection
                  {waitMode > 0 ? ` · Starting in ${waitMode} years` : ""}
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 11, fontWeight: 600 }}>
                {[
                  { color: C.navy,   label: "Portfolio Value"  },
                  { color: C.accent, label: "Contributions"    },
                  inflationAdj  ? { color: C.amber,  label: "Nominal Value" } : null,
                  compareMode   ? { color: C.purple, label: "Scenario B"    } : null,
                ].filter(Boolean).map(item => (
                  <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 14, height: 3, borderRadius: 2, background: item.color }} />
                    <span style={{ color: C.textSub }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline scrubber */}
            <div style={{ marginBottom: 16, padding: "10px 14px", background: C.bg, borderRadius: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: C.textSub }}>Timeline</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: C.navy }}>
                  Year {scrubYear ?? totalYears} — {fmtShort(scrubPoint.portfolio)}
                </span>
              </div>
              <input
                type="range" min={0} max={totalYears} step={1} value={scrubYear ?? totalYears}
                onChange={e => setScrubYear(+e.target.value)}
                onMouseUp={() => setScrubYear(null)}
                onTouchEnd={() => setScrubYear(null)}
                style={{ width: "100%" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: C.textMuted, marginTop: 2 }}>
                <span>Year 0</span><span>Year {totalYears}</span>
              </div>
            </div>

            {/* Chart */}
            <div style={{ height: 360 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 4, left: 4, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.navy}   stopOpacity={0.13} />
                      <stop offset="95%" stopColor={C.navy}   stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.accent} stopOpacity={0.08} />
                      <stop offset="95%" stopColor={C.accent} stopOpacity={0}    />
                    </linearGradient>
                    <linearGradient id="g3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={C.purple} stopOpacity={0.1}  />
                      <stop offset="95%" stopColor={C.purple} stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
                  <XAxis dataKey="year" tick={{ fontSize: 11, fill: C.textMuted, fontWeight: 500 }} tickFormatter={v => `Yr ${v}`} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: C.textMuted, fontWeight: 500 }} tickFormatter={fmtShort} axisLine={false} tickLine={false} scale={logScale ? "log" : "auto"} domain={logScale ? ["auto", "auto"] : [0, "auto"]} />
                  <Tooltip content={<CustomTooltip />} />
                  {milestones.map(m => (
                    <ReferenceLine
                      key={m.label} x={m.year} stroke={m.color}
                      strokeDasharray="4 3" strokeWidth={1.5}
                      label={{ value: m.label, position: "insideTopRight", fontSize: 9, fill: m.color, fontWeight: 700 }}
                    />
                  ))}
                  {scrubYear !== null && <ReferenceLine x={scrubYear} stroke={C.amber} strokeWidth={2} strokeDasharray="3 3" />}
                  <Area type="monotone" dataKey="portfolio"     name="Portfolio Value" stroke={C.navy}   strokeWidth={2.5} fill="url(#g1)" dot={false} />
                  <Area type="monotone" dataKey="contributions" name="Contributions"   stroke={C.accent} strokeWidth={2}   strokeDasharray="5 3" fill="url(#g2)" dot={false} />
                  {inflationAdj && <Area type="monotone" dataKey="portfolioNominal" name="Nominal Value" stroke={C.amber}  strokeWidth={1.5} strokeDasharray="3 2" fill="none" dot={false} />}
                  {compareMode  && <Area type="monotone" dataKey="portfolioB"       name="Scenario B"   stroke={C.purple} strokeWidth={2}   fill="url(#g3)" dot={false} />}
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Milestone tags */}
            {milestones.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                {milestones.map(m => (
                  <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 5, background: C.bg, borderRadius: 999, padding: "4px 10px" }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: m.color }} />
                    <span style={{ fontSize: 11, fontWeight: 600, color: C.textSub }}>Yr {m.year} — {m.label}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Balance breakdown bar */}
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px solid ${C.border}` }}>
              <div style={{ height: 8, borderRadius: 999, overflow: "hidden", background: C.border, marginBottom: 8 }}>
                <div style={{ display: "flex", height: "100%", transition: "all 0.5s" }}>
                  <div style={{ width: `${(result.totalContributions / result.finalValue) * 100}%`, background: C.accent, borderRadius: "999px 0 0 999px" }} />
                  <div style={{ flex: 1, background: C.green, borderRadius: "0 999px 999px 0" }} />
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: C.accent }} />
                  <span style={{ fontSize: 11, color: C.textSub, fontWeight: 600 }}>
                    Contributions — {((result.totalContributions / result.finalValue) * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 8, height: 8, borderRadius: 2, background: C.green }} />
                  <span style={{ fontSize: 11, color: C.textSub, fontWeight: 600 }}>
                    Growth — {result.interestPct.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
