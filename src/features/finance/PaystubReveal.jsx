import React, { useState, useEffect, useRef } from "react";
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

// ─── Scenario data ────────────────────────────────────────────────────────────
const SCENARIOS = {
  "jordan-first-paycheck": {
    name: "Jordan Martinez",
    period: "First paycheck — bi-weekly",
    rows: [
      {
        id: "gross",
        label: "Gross Pay",
        value: 2000.00,
        kind: "total",
        caption: "What Jordan's contract says she earns every two weeks — before anything is taken out.",
      },
      {
        id: "fed",
        label: "Federal Income Tax",
        value: -160.00,
        kind: "deduction",
        caption: "Goes to the IRS. Pays for national programs — military, roads, agencies.",
      },
      {
        id: "state",
        label: "State Income Tax",
        value: -60.00,
        kind: "deduction",
        caption: "Jordan lives in Michigan. Nine states don't have this — Texas and Florida, for example.",
      },
      {
        id: "ss",
        label: "Social Security",
        value: -124.00,
        kind: "deduction",
        caption: "6.2% of gross. Funds retirement income Jordan will collect when she's older.",
      },
      {
        id: "medicare",
        label: "Medicare",
        value: -29.00,
        kind: "deduction",
        caption: "1.45% of gross. Funds healthcare coverage at age 65+.",
      },
      {
        id: "net",
        label: "Net Pay",
        value: 1627.00,
        kind: "total",
        caption: "What actually hits Jordan's bank account. (Her real check was $1,538 — she has one more deduction we'll uncover later.)",
        emphasis: true,
      },
    ],
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (v) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(Math.abs(v));

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Component ────────────────────────────────────────────────────────────────
export default function PaystubReveal({ scenarioId, onComplete, lessonId }) {
  const scenario = SCENARIOS[scenarioId] ?? SCENARIOS["jordan-first-paycheck"];
  const { name, period, rows } = scenario;

  const [revealed, setRevealed] = useState(new Set());
  const startTime = useRef(Date.now());

  const allRevealed = revealed.size === rows.length;

  const reveal = (id) => {
    if (revealed.has(id)) return;
    // Enforce sequential reveal: only allow the next unrevealed row
    const idx = rows.findIndex((r) => r.id === id);
    if (idx !== revealed.size) return;
    setRevealed((prev) => new Set([...prev, id]));
  };

  const handleComplete = () => {
    const duration = Math.round((Date.now() - startTime.current) / 1000);
    trackEvent("paystub_revealed", {
      lesson_id: lessonId,
      scenario_id: scenarioId,
      duration_seconds: duration,
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
      {/* Instruction banner */}
      <div
        style={{
          fontSize: 14,
          color: C.textSub,
          lineHeight: 1.6,
          background: C.accentSoft,
          border: `1px solid ${C.accentMid}`,
          borderRadius: 10,
          padding: "12px 16px",
          fontWeight: 500,
        }}
      >
        Tap each row to reveal it — one at a time.
      </div>

      {/* Paystub card */}
      <div
        style={{
          background: C.bgCard,
          border: `1.5px solid ${C.border}`,
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 2px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
            padding: "20px 24px",
            color: "#fff",
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              opacity: 0.7,
              marginBottom: 4,
              textTransform: "uppercase",
            }}
          >
            Pay Statement
          </div>
          <div style={{ fontSize: 18, fontWeight: 800 }}>{name}</div>
          <div style={{ fontSize: 13, opacity: 0.75, marginTop: 2 }}>{period}</div>
        </div>

        {/* Rows */}
        <div style={{ padding: "4px 0" }}>
          {rows.map((row, idx) => {
            const isRevealed = revealed.has(row.id);
            const isNext = idx === revealed.size;
            const isDeduction = row.kind === "deduction";

            return (
              <div key={row.id}>
                {/* Divider before net pay */}
                {row.id === "net" && (
                  <div style={{ height: 1, background: C.border, margin: "4px 24px 8px" }} />
                )}

                <button
                  onClick={() => reveal(row.id)}
                  disabled={isRevealed || !isNext}
                  aria-label={
                    isRevealed
                      ? `${row.label}: ${isDeduction ? "−" : ""}${fmt(row.value)}`
                      : isNext
                      ? `Tap to reveal ${row.label}`
                      : `${row.label} — locked`
                  }
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: isNext && !isRevealed ? "pointer" : "default",
                    padding: 0,
                    textAlign: "left",
                  }}
                >
                  <motion.div
                    animate={
                      isNext && !isRevealed && !reducedMotion
                        ? {
                            backgroundColor: [
                              "rgba(59,130,246,0.03)",
                              "rgba(59,130,246,0.09)",
                              "rgba(59,130,246,0.03)",
                            ],
                          }
                        : { backgroundColor: "rgba(0,0,0,0)" }
                    }
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    style={{ padding: "13px 24px" }}
                  >
                    {/* Main row line */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: row.kind === "total" ? 700 : 500,
                          color: isRevealed ? C.text : C.textMuted,
                          transition: "color 0.2s",
                        }}
                      >
                        {row.label}
                      </span>

                      <AnimatePresence mode="wait">
                        {isRevealed ? (
                          <motion.span
                            key="value"
                            initial={reducedMotion ? {} : { opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: row.emphasis
                                ? C.navy
                                : isDeduction
                                ? "#DC2626"
                                : C.green,
                              fontVariantNumeric: "tabular-nums",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isDeduction ? `−${fmt(row.value)}` : fmt(row.value)}
                          </motion.span>
                        ) : (
                          <motion.span
                            key="placeholder"
                            initial={{ opacity: 1 }}
                            exit={reducedMotion ? {} : { opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            style={{
                              fontSize: 13,
                              color: isNext ? C.accent : C.textMuted,
                              fontWeight: isNext ? 600 : 400,
                              fontStyle: isNext ? "normal" : "normal",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {isNext ? "Tap to reveal →" : "· · ·"}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Caption — slides in after reveal */}
                    <AnimatePresence>
                      {isRevealed && (
                        <motion.div
                          initial={reducedMotion ? {} : { opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.28, delay: 0.12 }}
                          style={{ overflow: "hidden" }}
                        >
                          <p
                            style={{
                              margin: "6px 0 0",
                              fontSize: 12,
                              color: C.textSub,
                              lineHeight: 1.6,
                              paddingRight: 4,
                            }}
                          >
                            {row.caption}
                          </p>

                          {/* Emphasis callout on net pay */}
                          {row.emphasis && (
                            <motion.div
                              initial={reducedMotion ? {} : { scale: 0.96, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.35, delay: 0.22 }}
                              style={{
                                marginTop: 10,
                                padding: "10px 14px",
                                background: C.accentSoft,
                                border: `1.5px solid ${C.accentMid}`,
                                borderRadius: 8,
                                fontSize: 13,
                                fontWeight: 700,
                                color: C.navy,
                              }}
                            >
                              This is what Jordan can actually spend, save, or use to pay bills.
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            background: C.border,
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${(revealed.size / rows.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%", background: C.navy, borderRadius: 999 }}
          />
        </div>
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: C.textMuted,
            whiteSpace: "nowrap",
            minWidth: 72,
            textAlign: "right",
          }}
        >
          {revealed.size} / {rows.length} revealed
        </span>
      </div>

      {/* Continue — only after all rows revealed */}
      <AnimatePresence>
        {allRevealed && (
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
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Continue →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
