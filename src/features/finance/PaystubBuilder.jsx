import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  "jordan-build-full-paystub": {
    subject: { name: "Jordan Martinez", period: "Bi-weekly", gross: 2000.00 },
    rates: [
      { id: "fed",      label: "Federal Income Tax", rate: 0.08,   flat: null },
      { id: "state",    label: "State Income Tax",   rate: 0.03,   flat: null },
      { id: "ss",       label: "Social Security",    rate: 0.062,  flat: null },
      { id: "medicare", label: "Medicare",           rate: 0.0145, flat: null },
      { id: "health",   label: "Health Insurance",   rate: null,   flat: 48.10 },
    ],
    fields: [
      { id: "fed",      expected: 160.00,   tolerance: 0.50, hint: "Federal is 8% of gross. Try $2,000 × 0.08." },
      { id: "state",    expected:  60.00,   tolerance: 0.50, hint: "State is 3% of gross. $2,000 × 0.03." },
      { id: "ss",       expected: 124.00,   tolerance: 0.50, hint: "Social Security is 6.2%. $2,000 × 0.062." },
      { id: "medicare", expected:  29.00,   tolerance: 0.50, hint: "Medicare is 1.45%. $2,000 × 0.0145." },
      { id: "health",   expected:  48.10,   tolerance: 0.10, hint: "Health insurance is a flat $48.10 — not a percentage." },
      { id: "net",      expected: 1578.90,  tolerance: 1.00, hint: "Net = Gross minus every deduction. Add them up and subtract from $2,000.", computed: true },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtUSD = (n) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2 }).format(n);

const parseDollar = (s) => {
  const cleaned = s.replace(/[$,\s]/g, "");
  const n = parseFloat(cleaned);
  return isNaN(n) ? null : n;
};

// ─── AnimatedNumber ────────────────────────────────────────────────────────────
function AnimatedNumber({ value }) {
  return (
    <motion.span
      key={value.toFixed(2)}
      initial={reducedMotion ? {} : { opacity: 0.3, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {fmtUSD(value)}
    </motion.span>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function PaystubBuilder({ scenarioId, onComplete, lessonId }) {
  const scenario = SCENARIOS[scenarioId] ?? SCENARIOS["jordan-build-full-paystub"];
  const { subject, rates, fields } = scenario;

  // values[fieldId] = string the user typed
  const [values, setValues] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.id, ""]))
  );
  // status[fieldId] = null | "correct" | "wrong"
  const [status, setStatus] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.id, null]))
  );
  const [hints, setHints] = useState(() =>
    Object.fromEntries(fields.map((f) => [f.id, false]))
  );
  const [submitted, setSubmitted] = useState(false);
  const [allCorrect, setAllCorrect] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const firstWrongRef = useRef(null);
  const firstAttemptCorrectRef = useRef({});

  // Derived: total deductions entered so far (non-net fields)
  const deductionFields = fields.filter((f) => !f.computed);
  const totalDeductions = deductionFields.reduce((sum, f) => {
    const v = parseDollar(values[f.id]);
    return sum + (v ?? 0);
  }, 0);

  // Computed net pay = gross - total deductions
  const computedNet = subject.gross - totalDeductions;

  const handleChange = (fieldId, raw) => {
    setValues((prev) => ({ ...prev, [fieldId]: raw }));
    // clear wrong status as user edits
    if (status[fieldId] === "wrong") {
      setStatus((prev) => ({ ...prev, [fieldId]: null }));
    }
  };

  const handleSubmit = () => {
    const newStatus = { ...status };
    const newHints  = { ...hints };
    const wrongIds  = [];
    let allOk = true;

    for (const field of fields) {
      if (field.computed) {
        // auto-evaluate net pay from computed value
        const diff = Math.abs(computedNet - field.expected);
        if (diff <= field.tolerance) {
          newStatus[field.id] = "correct";
          if (!(field.id in firstAttemptCorrectRef.current)) {
            firstAttemptCorrectRef.current[field.id] = true;
          }
        } else {
          newStatus[field.id] = "wrong";
          newHints[field.id]  = true;
          wrongIds.push(field.id);
          allOk = false;
          if (!(field.id in firstAttemptCorrectRef.current)) {
            firstAttemptCorrectRef.current[field.id] = false;
          }
        }
        continue;
      }

      const entered = parseDollar(values[field.id]);
      if (entered === null) {
        newStatus[field.id] = "wrong";
        newHints[field.id]  = true;
        wrongIds.push(field.id);
        allOk = false;
        if (!(field.id in firstAttemptCorrectRef.current)) {
          firstAttemptCorrectRef.current[field.id] = false;
        }
        continue;
      }

      const diff = Math.abs(entered - field.expected);
      if (diff <= field.tolerance) {
        newStatus[field.id] = "correct";
        if (!(field.id in firstAttemptCorrectRef.current)) {
          firstAttemptCorrectRef.current[field.id] = true;
        }
      } else {
        newStatus[field.id] = "wrong";
        newHints[field.id]  = true;
        wrongIds.push(field.id);
        allOk = false;
        if (!(field.id in firstAttemptCorrectRef.current)) {
          firstAttemptCorrectRef.current[field.id] = false;
        }
      }
    }

    setStatus(newStatus);
    setHints(newHints);
    setSubmitted(true);

    if (allOk) {
      setAllCorrect(true);
      const fieldsCorrectFirstTry = Object.values(firstAttemptCorrectRef.current).filter(Boolean).length;
      trackEvent("paystub_builder_completed", {
        lesson_id: lessonId,
        fields_correct_first_try: fieldsCorrectFirstTry,
        total_fields: fields.length,
      }).catch(() => {});
    } else {
      // Focus first wrong field
      firstWrongRef.current = wrongIds[0];
      const el = document.getElementById(`field-${wrongIds[0]}`);
      if (el) el.focus();
      const wrongCount = wrongIds.length;
      setAnnouncement(
        `${wrongCount} field${wrongCount > 1 ? "s" : ""} need${wrongCount === 1 ? "s" : ""} correction. Check the hints below each one.`
      );
    }
  };

  // Check if a field is locked (correct)
  const isLocked = (fieldId) => status[fieldId] === "correct";

  // Rate display string
  const rateLabel = (r) => {
    if (r.flat !== null) return `$${r.flat.toFixed(2)} flat`;
    return `${(r.rate * 100).toFixed(2).replace(/\.?0+$/, "")}%`;
  };

  return (
    <div
      style={{
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
        maxWidth: 640,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        gap: 20,
      }}
    >
      {/* Screen-reader live region */}
      <div
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
      >
        {announcement}
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
        Use the rates on the right to fill in Jordan&apos;s paystub. When you&apos;re ready, hit &ldquo;Check my paystub.&rdquo;
      </div>

      {/* Two-column layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr minmax(0, 180px)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* ── Left: paystub ── */}
        <div
          style={{
            background: C.bgCard,
            border: `1.5px solid ${C.border}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(0,0,0,0.05)",
          }}
        >
          {/* Header */}
          <div
            style={{
              background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
              padding: "18px 24px",
              color: "#fff",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", opacity: 0.7, marginBottom: 4, textTransform: "uppercase" }}>
              Pay Statement
            </div>
            <div style={{ fontSize: 17, fontWeight: 800 }}>{subject.name}</div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{subject.period}</div>
          </div>

          {/* Gross pay row */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "14px 24px",
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Gross Pay</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: C.green, fontVariantNumeric: "tabular-nums" }}>
              {fmtUSD(subject.gross)}
            </span>
          </div>

          {/* Deduction input rows */}
          {fields.filter((f) => !f.computed).map((field) => {
            const locked = isLocked(field.id);
            const isWrong = status[field.id] === "wrong";
            return (
              <div key={field.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 24px",
                    gap: 12,
                    background: locked ? C.greenSoft : isWrong ? "#FEF2F2" : "transparent",
                    transition: "background 0.2s",
                  }}
                >
                  <label
                    htmlFor={`field-${field.id}`}
                    style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: locked ? C.green : isWrong ? "#DC2626" : C.text,
                      flexShrink: 0,
                    }}
                  >
                    {field.id === "fed"      ? "Federal Income Tax" :
                     field.id === "state"    ? "State Income Tax"   :
                     field.id === "ss"       ? "Social Security"    :
                     field.id === "medicare" ? "Medicare"           :
                                               "Health Insurance"}
                  </label>

                  {locked ? (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: "#DC2626",
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        −{fmtUSD(field.expected)}
                      </span>
                      <span style={{ color: C.green, fontSize: 16, fontWeight: 800 }}>✓</span>
                    </div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14, color: C.textMuted }}>−$</span>
                      <input
                        id={`field-${field.id}`}
                        type="text"
                        inputMode="decimal"
                        value={values[field.id]}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder="0.00"
                        aria-describedby={hints[field.id] ? `hint-${field.id}` : undefined}
                        aria-invalid={isWrong}
                        style={{
                          width: 90,
                          padding: "6px 10px",
                          borderRadius: 8,
                          border: `1.5px solid ${isWrong ? "#DC2626" : C.border}`,
                          fontSize: 14,
                          fontWeight: 600,
                          fontVariantNumeric: "tabular-nums",
                          color: C.text,
                          textAlign: "right",
                          outline: "none",
                          background: isWrong ? "#FEF9F9" : C.bg,
                        }}
                      />
                      {isWrong && (
                        <span aria-hidden="true" style={{ color: "#DC2626", fontSize: 16 }}>⚠</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Hint */}
                <AnimatePresence>
                  {hints[field.id] && !locked && (
                    <motion.div
                      id={`hint-${field.id}`}
                      initial={reducedMotion ? {} : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          margin: "0 24px 10px",
                          padding: "8px 12px",
                          background: "#FFF7ED",
                          border: `1px solid #FED7AA`,
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#92400E",
                          lineHeight: 1.6,
                        }}
                      >
                        💡 {fields.find((f) => f.id === field.id)?.hint}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}

          {/* Running total */}
          <div
            style={{
              padding: "10px 24px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: C.bg,
              borderBottom: `1px solid ${C.border}`,
            }}
          >
            <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600 }}>
              Total deductions so far
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#DC2626" }}>
              −<AnimatedNumber value={totalDeductions} />
            </span>
          </div>

          {/* Net pay row */}
          {(() => {
            const netField = fields.find((f) => f.computed);
            const netCorrect = status[netField.id] === "correct";
            const netWrong   = status[netField.id] === "wrong";
            return (
              <div>
                <motion.div
                  animate={
                    netCorrect && !reducedMotion
                      ? {
                          backgroundColor: [C.greenSoft, "#D1FAE5", C.greenSoft],
                        }
                      : { backgroundColor: netWrong ? "#FEF2F2" : C.bgCard }
                  }
                  transition={netCorrect ? { duration: 1.2, repeat: 2 } : {}}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "16px 24px",
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 800, color: C.text }}>Net Pay</span>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 18,
                        fontWeight: 800,
                        color: netCorrect ? C.green : netWrong ? "#DC2626" : C.navy,
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      <AnimatedNumber value={computedNet} />
                    </span>
                    {netCorrect && (
                      <span style={{ color: C.green, fontSize: 18, fontWeight: 800 }}>✓</span>
                    )}
                  </div>
                </motion.div>
                {/* Net hint */}
                <AnimatePresence>
                  {hints[netField.id] && !netCorrect && (
                    <motion.div
                      id={`hint-${netField.id}`}
                      initial={reducedMotion ? {} : { opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div
                        style={{
                          margin: "0 24px 12px",
                          padding: "8px 12px",
                          background: "#FFF7ED",
                          border: `1px solid #FED7AA`,
                          borderRadius: 8,
                          fontSize: 12,
                          color: "#92400E",
                          lineHeight: 1.6,
                        }}
                      >
                        💡 {netField.hint}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })()}
        </div>

        {/* ── Right: rates reference ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>
            Jordan&apos;s rates
          </div>
          {rates.map((r) => (
            <div
              key={r.id}
              style={{
                background: C.bgCard,
                border: `1px solid ${C.border}`,
                borderRadius: 10,
                padding: "10px 12px",
              }}
            >
              <div style={{ fontSize: 11, color: C.textMuted, fontWeight: 600, marginBottom: 3 }}>
                {r.label}
              </div>
              <div style={{ fontSize: 15, fontWeight: 800, color: C.navy }}>
                {rateLabel(r)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Submit button */}
      {!allCorrect && (
        <button
          onClick={handleSubmit}
          style={{
            alignSelf: "flex-start",
            padding: "13px 28px",
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
          Check my paystub
        </button>
      )}

      {/* Success message */}
      <AnimatePresence>
        {allCorrect && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: C.greenSoft,
              border: `1.5px solid ${C.greenMid}`,
              borderRadius: 14,
              padding: "18px 22px",
              fontSize: 14,
              color: C.green,
              fontWeight: 500,
              lineHeight: 1.65,
            }}
          >
            <span style={{ fontSize: 18, marginRight: 8 }}>🎉</span>
            <strong>This is Jordan&apos;s actual paystub.</strong> The $1,578.90 — that&apos;s what she told us at the
            start, once you include the health insurance she&apos;d signed up for.
          </motion.div>
        )}
      </AnimatePresence>

      {/* Continue — only after all correct */}
      <AnimatePresence>
        {allCorrect && (
          <motion.button
            initial={reducedMotion ? {} : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.15 }}
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
