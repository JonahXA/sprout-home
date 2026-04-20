import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { federalTaxOwed, BRACKETS_2024_SINGLE } from "./taxBrackets";
import { trackEvent } from "@/services/activity";

// ─── Design tokens (copied from InterestCalculator.jsx) ───────────────────────
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

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Scenario data ────────────────────────────────────────────────────────────
const SCENARIOS = {
  "jordan-raise-40k-to-42k": {
    persona: { name: "Jordan", avatarColor: "#1B2B5E" },
    message:
      "My manager said I can get a $2,000 raise but warned me it might push me into a higher tax bracket and I'd take home less money overall. Should I turn it down??",
    before: { salary: 40000, label: "Jordan now" },
    after:  { salary: 42000, label: "Jordan with raise" },
    brackets: BRACKETS_2024_SINGLE,
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);

const round = (n) => Math.round(n);

// Build bracket segments for a salary bar, normalized to maxSalary
function buildSegments(salary, brackets, maxSalary) {
  return brackets
    .map((b, i) => {
      const from = i === 0 ? 0 : brackets[i - 1].upto;
      if (from >= salary) return null;
      const segEnd = Math.min(b.upto, salary);
      return {
        from,
        to: segEnd,
        rate: b.rate,
        widthPct: ((segEnd - from) / maxSalary) * 100,
      };
    })
    .filter(Boolean);
}

// Bracket colors by rate
const RATE_COLOR = {
  0.10: "#BFDBFE",
  0.12: "#93C5FD",
  0.22: "#3B82F6",
  0.24: "#2563EB",
  0.32: "#1D4ED8",
  0.35: "#1E40AF",
  0.37: "#1E3A8A",
};

const PRE_OPTIONS = [
  { id: "worry",  label: "Yes — she should think twice about taking it" },
  { id: "fine",   label: "No — a raise always increases take-home pay" },
];

const POST_OPTIONS = [
  { id: "turn-down",  label: "Turn it down — the bracket will hurt her" },
  { id: "take",       label: "Take the raise — she'll keep most of it" },
  { id: "negotiate",  label: "Negotiate to stay under the bracket threshold" },
  { id: "ask-hr",     label: "Ask HR for more details before deciding" },
];

// ─── Stacked bar component ────────────────────────────────────────────────────
function TaxBar({ label, salary, taxOwed, takeHome, segments, raiseSliver, showTable }) {
  const maxSalary = 42000;
  const restWidth = 100 - segments.reduce((a, s) => a + s.widthPct, 0);

  if (showTable) {
    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} aria-label={`${label} breakdown`}>
        <caption style={{ fontSize: 12, color: C.textMuted, textAlign: "left", paddingBottom: 6 }}>{label}</caption>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "4px 8px", color: C.textSub, fontWeight: 700 }}>Bracket</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: C.textSub, fontWeight: 700 }}>Income in bracket</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: C.textSub, fontWeight: 700 }}>Rate</th>
            <th style={{ textAlign: "right", padding: "4px 8px", color: C.textSub, fontWeight: 700 }}>Tax</th>
          </tr>
        </thead>
        <tbody>
          {segments.map((seg, i) => (
            <tr key={i} style={{ borderTop: `1px solid ${C.border}` }}>
              <td style={{ padding: "6px 8px" }}>{(seg.rate * 100).toFixed(0)}%</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {fmtUSD(seg.to - seg.from)}
              </td>
              <td style={{ padding: "6px 8px", textAlign: "right" }}>{(seg.rate * 100).toFixed(0)}%</td>
              <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                {fmtUSD((seg.to - seg.from) * seg.rate)}
              </td>
            </tr>
          ))}
          <tr style={{ borderTop: `2px solid ${C.border}`, fontWeight: 700 }}>
            <td colSpan={3} style={{ padding: "6px 8px" }}>Federal tax owed</td>
            <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtUSD(taxOwed)}</td>
          </tr>
          <tr style={{ fontWeight: 700, color: C.green }}>
            <td colSpan={3} style={{ padding: "6px 8px" }}>Take-home</td>
            <td style={{ padding: "6px 8px", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>{fmtUSD(takeHome)}</td>
          </tr>
        </tbody>
      </table>
    );
  }

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: C.textSub }}>{label}</span>
        <span style={{ fontSize: 12, color: C.textMuted, fontVariantNumeric: "tabular-nums" }}>{fmtUSD(salary)}</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        {/* Bar */}
        <div
          style={{
            flex: 1,
            height: 32,
            borderRadius: 6,
            overflow: "hidden",
            display: "flex",
            background: C.border,
          }}
        >
          {segments.map((seg, i) => (
            <motion.div
              key={i}
              initial={reducedMotion ? {} : { width: 0 }}
              animate={{ width: `${seg.widthPct}%` }}
              transition={{ duration: reducedMotion ? 0 : 0.8, ease: "easeOut", delay: i * 0.08 }}
              style={{
                height: "100%",
                background: RATE_COLOR[seg.rate] ?? C.accent,
                position: "relative",
              }}
            />
          ))}
          {/* Raise sliver */}
          {raiseSliver && (
            <motion.div
              initial={reducedMotion ? {} : { width: 0, opacity: 0 }}
              animate={{ width: `${raiseSliver.widthPct}%`, opacity: 1 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, delay: 0.85 }}
              style={{
                height: "100%",
                background: C.amber,
                boxShadow: `inset 0 0 0 2px rgba(255,255,255,0.4)`,
              }}
              title={`$2,000 raise taxed at ${(raiseSliver.rate * 100).toFixed(0)}%`}
            />
          )}
          {/* Grey remainder */}
          {restWidth > 0 && (
            <div style={{ flex: 1, height: "100%", background: C.border }} />
          )}
        </div>

        {/* Summary */}
        <div style={{ minWidth: 120, fontSize: 12 }}>
          <div style={{ color: "#DC2626", fontVariantNumeric: "tabular-nums" }}>
            Tax: <strong>{fmtUSD(taxOwed)}</strong>
          </div>
          <div style={{ color: C.green, fontVariantNumeric: "tabular-nums", marginTop: 2 }}>
            Take-home: <strong>{fmtUSD(takeHome)}</strong>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function BracketMathViz({ scenarioId, onComplete, lessonId }) {
  const scenario = SCENARIOS[scenarioId] ?? SCENARIOS["jordan-raise-40k-to-42k"];
  const { persona, message, before, after, brackets } = scenario;

  const taxBefore   = federalTaxOwed(before.salary, brackets);
  const taxAfter    = federalTaxOwed(after.salary, brackets);
  const deltaTax    = taxAfter - taxBefore;
  const deltaTakeHome = after.salary - before.salary - deltaTax;

  const segsBefore = buildSegments(before.salary, brackets, after.salary);
  const segsAfterBase = buildSegments(before.salary, brackets, after.salary);
  const raiseSliver = {
    widthPct: ((after.salary - before.salary) / after.salary) * 100,
    rate: brackets.find((b) => after.salary <= b.upto)?.rate ?? 0.22,
  };

  const readoutLines = [
    `Before: Jordan owes about ${fmtUSD(round(taxBefore))} in federal tax.`,
    `After: Jordan owes about ${fmtUSD(round(taxAfter))} in federal tax.`,
    `The extra $2,000 is taxed at ${(raiseSliver.rate * 100).toFixed(0)}% — not her whole salary.`,
    `Take-home goes UP by about +${fmtUSD(round(deltaTakeHome))}.`,
  ];

  const [preAnswer, setPreAnswer]     = useState(null);
  const [preSubmitted, setPreSubmitted] = useState(false);
  const [showViz, setShowViz]         = useState(false);
  const [visibleLines, setVisibleLines] = useState(0);
  const [postAnswer, setPostAnswer]   = useState(null);
  const [postSubmitted, setPostSubmitted] = useState(false);
  const [showTable, setShowTable]     = useState(false);

  // Reveal readout lines one by one after viz appears
  useEffect(() => {
    if (!showViz) return;
    if (visibleLines >= readoutLines.length) return;
    const delay = reducedMotion ? 0 : 300;
    const t = setTimeout(() => setVisibleLines((n) => n + 1), delay);
    return () => clearTimeout(t);
  }, [showViz, visibleLines, readoutLines.length]);

  const handlePreSubmit = () => {
    setPreSubmitted(true);
    // slight delay so student sees the pre-question result, then viz sweeps in
    setTimeout(() => setShowViz(true), reducedMotion ? 0 : 600);
  };

  const postCorrect = postAnswer === "take";

  const handlePostSubmit = () => {
    setPostSubmitted(true);
    if (postCorrect && preAnswer !== "fine") {
      // myth was held, now resolved
      trackEvent("bracket_myth_resolved", {
        lesson_id: lessonId,
        pre_correct: false,
        post_correct: true,
      }).catch(() => {});
    } else if (postCorrect) {
      trackEvent("bracket_myth_resolved", {
        lesson_id: lessonId,
        pre_correct: true,
        post_correct: true,
      }).catch(() => {});
    }
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        maxWidth: 580,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* ── Chat bubble ── */}
      <div
        style={{
          background: C.bgCard,
          border: `1.5px solid ${C.border}`,
          borderRadius: 16,
          padding: "20px 24px",
          boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
          {/* Avatar */}
          <div
            aria-hidden="true"
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: persona.avatarColor,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontWeight: 800,
              fontSize: 16,
              flexShrink: 0,
            }}
          >
            {persona.name[0]}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 6 }}>
              {persona.name}
            </div>
            <div
              style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: "4px 16px 16px 16px",
                padding: "12px 16px",
                fontSize: 14,
                color: C.text,
                lineHeight: 1.65,
              }}
            >
              {message}
            </div>
          </div>
        </div>
      </div>

      {/* ── Pre-question gut check ── */}
      {!showViz && (
        <div
          style={{
            background: C.bgCard,
            border: `1.5px solid ${C.border}`,
            borderRadius: 16,
            padding: "20px 24px",
          }}
        >
          <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>
            Quick gut check — is Jordan right to worry?
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {PRE_OPTIONS.map((opt) => {
              const isSelected = preAnswer === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => { if (!preSubmitted) setPreAnswer(opt.id); }}
                  disabled={preSubmitted}
                  style={{
                    textAlign: "left",
                    padding: "11px 16px",
                    borderRadius: 10,
                    border: `1.5px solid ${isSelected ? C.navy : C.border}`,
                    background: isSelected ? C.accentSoft : C.bg,
                    color: C.text,
                    fontSize: 14,
                    fontWeight: isSelected ? 600 : 400,
                    cursor: preSubmitted ? "default" : "pointer",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
          {!preSubmitted && preAnswer && (
            <button
              onClick={handlePreSubmit}
              style={{
                marginTop: 16,
                padding: "10px 24px",
                borderRadius: 999,
                background: C.navy,
                color: "#fff",
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Let&apos;s see the math →
            </button>
          )}
        </div>
      )}

      {/* ── Visualization ── */}
      <AnimatePresence>
        {showViz && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            style={{
              background: C.bgCard,
              border: `1.5px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
            }}
          >
            {/* Header row with table toggle */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: C.text }}>
                Bracket math — side by side
              </div>
              <button
                onClick={() => setShowTable((v) => !v)}
                aria-pressed={showTable}
                style={{
                  padding: "4px 12px",
                  borderRadius: 6,
                  background: showTable ? C.navy : C.bg,
                  color: showTable ? "#fff" : C.textSub,
                  border: `1px solid ${showTable ? C.navy : C.border}`,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {showTable ? "Show bars" : "Show as table"}
              </button>
            </div>

            {/* Bracket color legend */}
            {!showTable && (
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 14 }}>
                {[0.10, 0.12].map((rate) => (
                  <div key={rate} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textSub }}>
                    <div style={{ width: 10, height: 10, borderRadius: 2, background: RATE_COLOR[rate] }} />
                    {(rate * 100).toFixed(0)}% bracket
                  </div>
                ))}
                <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textSub }}>
                  <div style={{ width: 10, height: 10, borderRadius: 2, background: C.amber }} />
                  $2,000 raise (22% bracket)
                </div>
              </div>
            )}

            {/* Before bar */}
            <TaxBar
              label={before.label}
              salary={before.salary}
              taxOwed={taxBefore}
              takeHome={before.salary - taxBefore}
              segments={segsBefore}
              raiseSliver={null}
              showTable={showTable}
            />

            <div style={{ height: 10 }} />

            {/* After bar */}
            <TaxBar
              label={after.label}
              salary={after.salary}
              taxOwed={taxAfter}
              takeHome={after.salary - taxAfter}
              segments={segsAfterBase}
              raiseSliver={raiseSliver}
              showTable={showTable}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Readout lines ── */}
      <AnimatePresence>
        {showViz && visibleLines > 0 && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              background: C.bgCard,
              border: `1.5px solid ${C.border}`,
              borderRadius: 16,
              padding: "18px 24px",
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {readoutLines.slice(0, visibleLines).map((line, i) => (
              <motion.div
                key={i}
                initial={reducedMotion ? {} : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
                style={{
                  fontSize: 14,
                  color: i === 3 ? C.green : C.textSub,
                  fontWeight: i === 3 ? 700 : 400,
                  lineHeight: 1.5,
                  paddingLeft: i === 3 ? 0 : 0,
                }}
              >
                {i === 3 ? "✓ " : ""}{line}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Post-question ── */}
      <AnimatePresence>
        {showViz && visibleLines >= readoutLines.length && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: C.bgCard,
              border: `1.5px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px 24px",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 14 }}>
              So what should you tell Jordan?
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {POST_OPTIONS.map((opt) => {
                const isSelected = postAnswer === opt.id;
                const isRight    = postSubmitted && opt.id === "take";
                const isWrong    = postSubmitted && isSelected && !isRight;
                return (
                  <button
                    key={opt.id}
                    onClick={() => { if (!postSubmitted) setPostAnswer(opt.id); }}
                    disabled={postSubmitted}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      borderRadius: 10,
                      border: `1.5px solid ${isRight ? C.green : isWrong ? "#DC2626" : isSelected ? C.navy : C.border}`,
                      background: isRight ? C.greenSoft : isWrong ? "#FEF2F2" : isSelected ? C.accentSoft : C.bg,
                      color: isRight ? C.green : isWrong ? "#DC2626" : C.text,
                      fontSize: 14,
                      fontWeight: isSelected || isRight ? 600 : 400,
                      cursor: postSubmitted ? "default" : "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            {!postSubmitted && postAnswer && (
              <button
                onClick={handlePostSubmit}
                style={{
                  marginTop: 16,
                  padding: "10px 24px",
                  borderRadius: 999,
                  background: C.navy,
                  color: "#fff",
                  border: "none",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: "pointer",
                }}
              >
                Submit
              </button>
            )}
            {postSubmitted && !postCorrect && (
              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: C.textSub,
                  padding: "10px 14px",
                  background: C.bg,
                  borderRadius: 8,
                  lineHeight: 1.6,
                }}
              >
                Look at the numbers above: take-home goes <em>up</em> by {fmtUSD(round(deltaTakeHome))} after the raise. The bracket only affects the dollars above the threshold — not her whole salary. Tell Jordan to take it.
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Continue ── */}
      <AnimatePresence>
        {postSubmitted && postCorrect && (
          <motion.button
            initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            onClick={onComplete}
            style={{
              alignSelf: "flex-end",
              padding: "13px 32px",
              borderRadius: 999,
              background: C.navy,
              color: "#fff",
              border: "none",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
              boxShadow: `0 4px 16px ${C.navyGlow}`,
            }}
          >
            Continue →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
