import React, { useState, useRef, useCallback } from "react";
import * as RadixSlider from "@radix-ui/react-slider";
import { motion, AnimatePresence } from "framer-motion";
import { federalTaxOwed, effectiveRate, BRACKETS_2024_SINGLE } from "./taxBrackets";
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

// Bracket colors — lightest to darkest
const BRACKET_COLORS = [
  "#BFDBFE", "#93C5FD", "#60A5FA", "#3B82F6",
  "#2563EB", "#1D4ED8", "#1E3A8A",
];

const MARKERS      = [25000, 52000, 95000, 180000];
const MARKER_LABELS = ["$25K", "$52K", "$95K", "$180K"];

const fmt    = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const fmtPct = (r) => (r * 100).toFixed(1) + "%";

const OPTIONS = [
  { id: "flat",        label: "It stays flat — same rate no matter what" },
  { id: "progressive", label: "It climbs — higher earners pay a bigger share" },
  { id: "regressive",  label: "It falls — higher earners pay a smaller share" },
  { id: "random",      label: "It jumps around with no clear pattern" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProgressiveTaxSlider({ scenarioId, onComplete, lessonId }) {
  const brackets = BRACKETS_2024_SINGLE;

  const [salary, setSalary]           = useState(52000);
  const [touched, setTouched]         = useState(false);
  const [liveText, setLiveText]       = useState("");
  const [selectedAnswer, setSelected] = useState(null);
  const [submitted, setSubmitted]     = useState(false);
  const throttleRef = useRef(null);
  const correctFirstRef = useRef(true);

  const tax  = federalTaxOwed(salary, brackets);
  const rate = effectiveRate(salary, brackets);

  // ── Slider handler ─────────────────────────────────────────────────────────
  const handleChange = useCallback(([val]) => {
    setSalary(val);
    if (!touched) setTouched(true);
    if (throttleRef.current) clearTimeout(throttleRef.current);
    throttleRef.current = setTimeout(() => {
      const r = effectiveRate(val, brackets);
      setLiveText(`At ${fmt(val)}, the effective federal rate is about ${fmtPct(r)}.`);
    }, 200);
  }, [touched, brackets]);

  // ── Build bracket bar segments ─────────────────────────────────────────────
  const segments = brackets.map((b, i) => {
    const from = i === 0 ? 0 : brackets[i - 1].upto;
    const to   = b.upto;
    if (from >= salary || from >= 220000) return null;
    const segEnd = Math.min(to, salary, 220000);
    const width  = ((segEnd - from) / 220000) * 100;
    return { width, rate: b.rate, color: BRACKET_COLORS[i], label: `${(b.rate * 100).toFixed(0)}%` };
  }).filter(Boolean);

  const marginalRate = brackets.find((b) => salary <= b.upto)?.rate ?? 0.37;

  // ── Question logic ─────────────────────────────────────────────────────────
  const isCorrect = selectedAnswer === "progressive";

  const handleSubmit = () => {
    setSubmitted(true);
    if (!isCorrect) correctFirstRef.current = false;
  };

  const handleRetry = () => {
    setSubmitted(false);
    setSelected(null);
  };

  const handleComplete = () => {
    trackEvent("progressive_tax_discovered", {
      lesson_id: lessonId,
      correct_first_try: correctFirstRef.current,
    }).catch(() => {});
    onComplete();
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        maxWidth: 560,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* aria-live for slider readout */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
      >
        {liveText}
      </div>

      {/* Instruction */}
      <div
        style={{
          fontSize: 14,
          color: C.textSub,
          background: C.accentSoft,
          border: `1px solid ${C.accentMid}`,
          borderRadius: 10,
          padding: "12px 16px",
          fontWeight: 500,
          lineHeight: 1.6,
        }}
      >
        Drag the slider to explore how salary affects your effective federal tax rate.
      </div>

      {/* Slider card */}
      <div
        style={{
          background: C.bgCard,
          border: `1.5px solid ${C.border}`,
          borderRadius: 16,
          padding: "24px 24px 20px",
          boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
        }}
      >
        {/* Headline readout */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.navy, fontVariantNumeric: "tabular-nums" }}>
              {fmt(salary)}
            </div>
            <div style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Annual salary</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: C.accent, fontVariantNumeric: "tabular-nums" }}>
              {fmtPct(rate)}
            </div>
            <div style={{ fontSize: 13, color: C.textSub, marginTop: 2 }}>Effective rate</div>
          </div>
        </div>

        {/* Radix slider */}
        <RadixSlider.Root
          value={[salary]}
          onValueChange={handleChange}
          min={20000}
          max={220000}
          step={1000}
          aria-label="Annual salary"
          style={{
            position: "relative",
            display: "flex",
            alignItems: "center",
            userSelect: "none",
            touchAction: "none",
            width: "100%",
            height: 24,
          }}
        >
          <RadixSlider.Track
            style={{
              background: C.border,
              position: "relative",
              flexGrow: 1,
              borderRadius: 999,
              height: 6,
            }}
          >
            <RadixSlider.Range
              style={{
                position: "absolute",
                background: C.navy,
                borderRadius: 999,
                height: "100%",
              }}
            />
          </RadixSlider.Track>
          <RadixSlider.Thumb
            style={{
              display: "block",
              width: 24,
              height: 24,
              background: "#fff",
              border: `2.5px solid ${C.navy}`,
              borderRadius: 999,
              boxShadow: "0 2px 8px rgba(27,43,94,0.22)",
              cursor: "pointer",
              outline: "none",
            }}
          />
        </RadixSlider.Root>

        {/* Snap markers */}
        <div style={{ position: "relative", height: 20, marginTop: 6, marginBottom: 4 }}>
          {MARKERS.map((m, i) => {
            const pct = ((m - 20000) / (220000 - 20000)) * 100;
            return (
              <span
                key={m}
                style={{
                  position: "absolute",
                  left: `${pct}%`,
                  transform: "translateX(-50%)",
                  fontSize: 11,
                  color: C.textMuted,
                  fontWeight: 600,
                  whiteSpace: "nowrap",
                }}
              >
                {MARKER_LABELS[i]}
              </span>
            );
          })}
        </div>

        {/* Bracket bar */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, marginBottom: 6 }}>
            Salary colored by bracket — marginal rate: <strong style={{ color: C.text }}>{fmtPct(marginalRate)}</strong>
          </div>
          <div
            style={{
              height: 22,
              borderRadius: 6,
              overflow: "hidden",
              display: "flex",
              background: C.border,
            }}
          >
            {segments.map((seg, i) => (
              <motion.div
                key={i}
                animate={{ width: `${seg.width}%` }}
                transition={{ duration: reducedMotion ? 0 : 0.2 }}
                title={`${seg.label} bracket`}
                aria-hidden="true"
                style={{ height: "100%", background: seg.color, minWidth: 1 }}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
            {BRACKETS_2024_SINGLE.slice(0, segments.length).map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: C.textSub }}>
                <div style={{ width: 10, height: 10, borderRadius: 2, background: BRACKET_COLORS[i] }} />
                {(b.rate * 100).toFixed(0)}%
              </div>
            ))}
          </div>
        </div>

        {/* Tax / take-home summary */}
        <div
          style={{
            marginTop: 16,
            display: "flex",
            gap: 16,
            padding: "12px 16px",
            background: C.bg,
            borderRadius: 10,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Federal tax</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#DC2626", fontVariantNumeric: "tabular-nums" }}>{fmt(tax)}</div>
          </div>
          <div style={{ width: 1, background: C.border }} />
          <div>
            <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em" }}>Take-home (approx.)</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: C.green, fontVariantNumeric: "tabular-nums" }}>{fmt(salary - tax)}</div>
          </div>
        </div>
      </div>

      {/* Follow-up question — only after slider is touched */}
      <AnimatePresence>
        {touched && (
          <motion.div
            key="question"
            initial={reducedMotion ? {} : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: C.bgCard,
              border: `1.5px solid ${C.border}`,
              borderRadius: 16,
              padding: "20px 24px",
              boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 16 }}>
              What pattern are you seeing as salary goes up?
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {OPTIONS.map((opt) => {
                const isSelected = selectedAnswer === opt.id;
                const isRight    = submitted && opt.id === "progressive";
                const isWrong    = submitted && isSelected && !isRight;
                return (
                  <button
                    key={opt.id}
                    onClick={() => { if (!submitted) setSelected(opt.id); }}
                    disabled={submitted}
                    style={{
                      textAlign: "left",
                      padding: "11px 16px",
                      borderRadius: 10,
                      border: `1.5px solid ${isRight ? C.green : isWrong ? "#DC2626" : isSelected ? C.navy : C.border}`,
                      background: isRight ? C.greenSoft : isWrong ? "#FEF2F2" : isSelected ? C.accentSoft : C.bg,
                      color: isRight ? C.green : isWrong ? "#DC2626" : C.text,
                      fontSize: 14,
                      fontWeight: isSelected || isRight ? 600 : 400,
                      cursor: submitted ? "default" : "pointer",
                      transition: "background 0.12s, border-color 0.12s",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            {/* Submit */}
            {!submitted && selectedAnswer && (
              <button
                onClick={handleSubmit}
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
                Check answer
              </button>
            )}

            {/* Wrong feedback */}
            {submitted && !isCorrect && (
              <div style={{ marginTop: 14 }}>
                <div
                  style={{
                    fontSize: 13,
                    color: C.textSub,
                    padding: "10px 14px",
                    background: C.bg,
                    borderRadius: 8,
                    lineHeight: 1.6,
                  }}
                >
                  Not quite. As salary rises, the <em>effective</em> rate climbs because more dollars fall into
                  higher brackets. That's the definition of a <strong>progressive</strong> tax.
                </div>
                <button
                  onClick={handleRetry}
                  style={{
                    marginTop: 10,
                    padding: "8px 20px",
                    borderRadius: 999,
                    background: "none",
                    color: C.accent,
                    border: `1.5px solid ${C.accent}`,
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: "pointer",
                  }}
                >
                  Try again
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue — only after correct answer */}
      <AnimatePresence>
        {submitted && isCorrect && (
          <motion.button
            initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28 }}
            onClick={handleComplete}
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
