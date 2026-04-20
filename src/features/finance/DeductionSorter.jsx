import React, { useState, useRef } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
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
  "mandatory-vs-optional": {
    prompt: "Which of these come out of every paycheck — and which only if Jordan chooses them?",
    chips: [
      { id: "fed",      label: "Federal Income Tax",  correct: "mandatory" },
      { id: "ss",       label: "Social Security",     correct: "mandatory" },
      { id: "medicare", label: "Medicare",            correct: "mandatory" },
      { id: "401k",     label: "401(k) contribution", correct: "optional"  },
      { id: "health",   label: "Health Insurance",    correct: "optional"  },
      { id: "union",    label: "Union Dues",          correct: "optional"  },
    ],
    buckets: [
      { id: "mandatory", label: "Every paycheck, no choice" },
      { id: "optional",  label: "Only if Jordan signs up"   },
    ],
    hints: {
      fed:      "Federal tax is withheld by law — no opt-out.",
      ss:       "Social Security (6.2%) is part of FICA — mandatory.",
      medicare: "Medicare (1.45%) is part of FICA — mandatory.",
      "401k":   "401(k) is a retirement plan Jordan chooses to join.",
      health:   "Health insurance is an elected benefit — she can decline.",
      union:    "Union dues only apply if she's in a union role.",
    },
  },
};

const reducedMotion =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// ─── Component ────────────────────────────────────────────────────────────────
export default function DeductionSorter({ scenarioId, onComplete, lessonId }) {
  const scenario = SCENARIOS[scenarioId] ?? SCENARIOS["mandatory-vs-optional"];
  const { prompt, chips, buckets, hints } = scenario;

  const [placed, setPlaced]         = useState({}); // chipId → bucketId (correct placements only)
  const [wrongDrops, setWrongDrops] = useState(0);
  const [kbSelected, setKbSelected] = useState(null); // chipId currently "held" via keyboard
  const [announcement, setAnnouncement] = useState("");

  const poolChips  = chips.filter((c) => !placed[c.id]);
  const allCorrect = poolChips.length === 0;

  // ── Drag-and-drop ──────────────────────────────────────────────────────────
  const handleDragEnd = ({ draggableId, destination }) => {
    if (!destination || destination.droppableId === "pool") return;
    const chip = chips.find((c) => c.id === draggableId);
    if (!chip) return;

    if (destination.droppableId === chip.correct) {
      setPlaced((prev) => ({ ...prev, [chip.id]: chip.correct }));
      setAnnouncement(`${chip.label} placed correctly.`);
    } else {
      setWrongDrops((n) => n + 1);
      toast(hints[chip.id], { duration: 3000 });
      setAnnouncement(`Incorrect. ${hints[chip.id]}`);
    }
  };

  // ── Keyboard helpers ───────────────────────────────────────────────────────
  const handleChipKey = (e, chipId) => {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      setKbSelected(chipId);
      const chip = chips.find((c) => c.id === chipId);
      setAnnouncement(
        `${chip.label} picked up. Tab to a bucket and press Enter to drop, or Escape to cancel.`
      );
    }
  };

  const dropViaKeyboard = (bucketId) => {
    if (!kbSelected) return;
    const chip = chips.find((c) => c.id === kbSelected);
    if (chip.correct === bucketId) {
      setPlaced((prev) => ({ ...prev, [chip.id]: chip.correct }));
      setAnnouncement(`${chip.label} placed correctly.`);
    } else {
      setWrongDrops((n) => n + 1);
      toast(hints[chip.id], { duration: 3000 });
      setAnnouncement(`Incorrect. ${hints[chip.id]}`);
    }
    setKbSelected(null);
  };

  const handleBucketKey = (e, bucketId) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      dropViaKeyboard(bucketId);
    } else if (e.key === "Escape") {
      setKbSelected(null);
      setAnnouncement("Drop cancelled.");
    }
  };

  // ── Complete ───────────────────────────────────────────────────────────────
  const handleComplete = () => {
    trackEvent("deductions_sorted", {
      lesson_id: lessonId,
      wrong_drops_count: wrongDrops,
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
      {/* Screen-reader live region */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
      >
        {announcement}
      </div>

      {/* Prompt */}
      <div style={{ fontSize: 15, fontWeight: 600, color: C.text, lineHeight: 1.55 }}>
        {prompt}
      </div>

      {/* Keyboard state banner */}
      <AnimatePresence>
        {kbSelected && (
          <motion.div
            initial={reducedMotion ? {} : { opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            style={{
              fontSize: 13,
              color: C.accent,
              background: C.accentSoft,
              border: `1px solid ${C.accentMid}`,
              borderRadius: 8,
              padding: "8px 12px",
              fontWeight: 500,
            }}
          >
            <strong>&ldquo;{chips.find((c) => c.id === kbSelected)?.label}&rdquo;</strong> picked up —
            Tab to a bucket and press Enter to drop, or Escape to cancel.
          </motion.div>
        )}
      </AnimatePresence>

      <DragDropContext onDragEnd={handleDragEnd}>
        {/* ── Pool ── */}
        <Droppable droppableId="pool" direction="horizontal">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              aria-label="Available deductions"
              style={{
                minHeight: 60,
                background: snapshot.isDraggingOver ? C.accentSoft : C.bg,
                border: `1.5px dashed ${snapshot.isDraggingOver ? C.accent : C.border}`,
                borderRadius: 12,
                padding: "10px 12px",
                display: "flex",
                flexWrap: "wrap",
                gap: 8,
                transition: "background 0.15s, border-color 0.15s",
              }}
            >
              {poolChips.length === 0 && (
                <span style={{ fontSize: 13, color: C.textMuted, padding: "8px 4px" }}>
                  All chips placed!
                </span>
              )}
              {poolChips.map((chip, index) => (
                <Draggable key={chip.id} draggableId={chip.id} index={index}>
                  {(provided, snapshot) => {
                    const isHeld = kbSelected === chip.id;
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        tabIndex={0}
                        role="button"
                        aria-label={`${chip.label} — press Space to pick up`}
                        onKeyDown={(e) => handleChipKey(e, chip.id)}
                        style={{
                          ...provided.draggableProps.style,
                          padding: "7px 14px",
                          borderRadius: 999,
                          background: isHeld
                            ? C.accent
                            : snapshot.isDragging
                            ? C.navyLight
                            : C.bgCard,
                          color:
                            isHeld || snapshot.isDragging ? "#fff" : C.text,
                          border: `1.5px solid ${
                            isHeld
                              ? C.accent
                              : snapshot.isDragging
                              ? C.navyLight
                              : C.border
                          }`,
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "grab",
                          boxShadow: snapshot.isDragging
                            ? "0 4px 16px rgba(27,43,94,0.22)"
                            : "0 1px 3px rgba(0,0,0,0.06)",
                          userSelect: "none",
                          outline: "none",
                          transition: "background 0.12s, color 0.12s, border-color 0.12s",
                        }}
                      >
                        {chip.label}
                      </div>
                    );
                  }}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* ── Buckets ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 14,
          }}
        >
          {buckets.map((bucket) => {
            const bucketChips = chips.filter((c) => placed[c.id] === bucket.id);
            return (
              <Droppable key={bucket.id} droppableId={bucket.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: 130,
                      background: snapshot.isDraggingOver ? C.greenSoft : C.bgCard,
                      border: `1.5px solid ${
                        snapshot.isDraggingOver
                          ? C.green
                          : kbSelected
                          ? C.accent
                          : C.border
                      }`,
                      borderRadius: 12,
                      padding: "14px 12px",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: C.textSub,
                        marginBottom: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {bucket.label}
                    </div>

                    {/* Keyboard drop target */}
                    {kbSelected && (
                      <button
                        tabIndex={0}
                        onClick={() => dropViaKeyboard(bucket.id)}
                        onKeyDown={(e) => handleBucketKey(e, bucket.id)}
                        style={{
                          width: "100%",
                          padding: "6px 12px",
                          marginBottom: 10,
                          borderRadius: 8,
                          background: C.accentSoft,
                          border: `1.5px solid ${C.accent}`,
                          color: C.accent,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Drop here ↵
                      </button>
                    )}

                    {/* Correctly placed chips */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {bucketChips.map((chip) => (
                        <motion.div
                          key={chip.id}
                          initial={reducedMotion ? {} : { opacity: 0, scale: 0.88 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.22 }}
                          style={{
                            padding: "6px 12px",
                            borderRadius: 999,
                            background: C.greenSoft,
                            border: `1.5px solid ${C.greenMid}`,
                            fontSize: 13,
                            fontWeight: 600,
                            color: C.green,
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span style={{ fontSize: 11, fontWeight: 800 }}>✓</span>
                          {chip.label}
                        </motion.div>
                      ))}
                    </div>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {/* Progress indicator */}
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
            animate={{ width: `${(Object.keys(placed).length / chips.length) * 100}%` }}
            transition={{ duration: 0.3 }}
            style={{ height: "100%", background: C.green, borderRadius: 999 }}
          />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: C.textMuted, whiteSpace: "nowrap", minWidth: 72, textAlign: "right" }}>
          {Object.keys(placed).length} / {chips.length} sorted
        </span>
      </div>

      {/* Continue — only after all correct */}
      <AnimatePresence>
        {allCorrect && (
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
