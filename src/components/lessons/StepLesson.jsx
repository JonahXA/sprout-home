// src/components/lessons/StepLesson.jsx
//
// Mastery-based interactive lesson renderer.
//
// Progression rules:
//   - Progress bar only advances on a CORRECT answer.
//   - Wrong answer → show corrective feedback → load a retry_variant.
//   - After 2 wrong attempts, show the hint before the next retry.
//   - Max 3 retries per step; after that, accept and move on (no progress increment).
//   - Final evaluation follows same logic; score counts only first-try correctness.

import React, { useState, useCallback, useRef } from "react";
import { ArrowRight, CheckCircle, XCircle, Lightbulb, Trophy, Star, BookOpen } from "lucide-react";

const C = {
  navy: "#1B2B5E", navyLight: "#243570", navyGlow: "rgba(27,43,94,0.12)",
  accent: "#3B82F6", accentSoft: "#E8F0FE", accentMid: "#BFDBFE",
  green: "#2D9B6F", greenSoft: "#E8F8F0",
  red: "#EF4444", redSoft: "#FEF2F2",
  amber: "#F59E0B", amberSoft: "#FFF3E0",
  bg: "#FFFFFF", bgSoft: "#F8FAFC", bgMid: "#F1F5F9",
  border: "#E5E7EB", borderMid: "#D1D5DB",
  text: "#0F172A", textSub: "#475569", textMuted: "#94A3B8",
};

const MAX_RETRIES = 3;

// ─── helpers ─────────────────────────────────────────────────────
function parseNum(raw) {
  if (raw == null) return NaN;
  return parseFloat(String(raw).replace(/[$,%\s]/g, ""));
}
function numCorrect(input, answer, tolerance = 0.5) {
  const a = parseNum(input);
  const b = parseNum(answer);
  if (isNaN(a) || isNaN(b)) return false;
  return Math.abs(a - b) <= tolerance;
}

// ─── Feedback strip ───────────────────────────────────────────────
function FeedbackStrip({ correct, text }) {
  return (
    <div style={{
      borderRadius: 12, padding: "14px 18px",
      background: correct ? C.greenSoft : C.redSoft,
      border: `1.5px solid ${correct ? C.green : C.red}`,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      {correct
        ? <CheckCircle size={18} color={C.green} style={{ flexShrink: 0, marginTop: 1 }} />
        : <XCircle size={18} color={C.red} style={{ flexShrink: 0, marginTop: 1 }} />}
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: correct ? C.green : C.red, margin: "0 0 2px" }}>
          {correct ? "Correct!" : "Not quite"}
        </p>
        <p style={{ fontSize: 13, color: correct ? "#14532D" : "#7F1D1D", margin: 0, lineHeight: 1.5 }}>{text}</p>
      </div>
    </div>
  );
}

// ─── LearnBlock — passive teaching step ──────────────────────────
function LearnBlock({ step, onContinue }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: C.accentSoft, border: `1px solid ${C.accentMid}`, borderRadius: 8, padding: "6px 14px", alignSelf: "flex-start" }}>
        <BookOpen size={13} color={C.accent} />
        <span style={{ fontSize: 12, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: "0.06em" }}>Learn</span>
      </div>
      {step.heading && (
        <h3 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: 0, letterSpacing: "-0.3px", lineHeight: 1.25 }}>{step.heading}</h3>
      )}
      <p style={{ fontSize: 16, color: C.textSub, margin: 0, lineHeight: 1.75 }}>{step.body}</p>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onContinue}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 999, background: C.navy, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: `0 4px 16px ${C.navyGlow}` }}
        >
          Got it <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Hint strip ───────────────────────────────────────────────────
function HintStrip({ text }) {
  return (
    <div style={{
      borderRadius: 12, padding: "12px 16px",
      background: C.amberSoft, border: `1.5px solid ${C.amber}`,
      display: "flex", alignItems: "flex-start", gap: 10,
    }}>
      <Lightbulb size={16} color={C.amber} style={{ flexShrink: 0, marginTop: 1 }} />
      <p style={{ fontSize: 13, color: "#92400E", margin: 0, lineHeight: 1.5 }}>
        <strong>Hint:</strong> {text}
      </p>
    </div>
  );
}

// ─── Continue button ──────────────────────────────────────────────
function ContinueBtn({ label = "Continue", onClick }) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end" }}>
      <button
        onClick={onClick}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 999, background: C.navy, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: `0 4px 16px ${C.navyGlow}` }}
      >
        {label} <ArrowRight size={15} />
      </button>
    </div>
  );
}

// ─── MultipleChoice (handles true_false too) ──────────────────────
function MultipleChoice({ question, prompt, options, correct_answer, onResult }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const isCorrect = selected === correct_answer;

  const choose = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
        {prompt || question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(options || []).map((opt, i) => {
          let bg = C.bg, border2 = C.borderMid, color = C.text, cursor = "pointer";
          if (revealed) {
            if (i === correct_answer) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (i === selected) { bg = C.redSoft; border2 = C.red; color = C.red; }
            else { bg = C.bgMid; border2 = C.border; color = C.textMuted; }
            cursor = "default";
          }
          return (
            <button key={i} onClick={() => choose(i)} disabled={revealed}
              style={{ width: "100%", textAlign: "left", padding: "13px 16px", borderRadius: 10, border: `2px solid ${border2}`, background: bg, color, fontWeight: 600, fontSize: 14, cursor, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}
            >
              <span style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid currentColor", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                {revealed && i === correct_answer ? "✓" : revealed && i === selected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {/* Feedback strip shown inline — Continue button rendered by parent */}
          <div style={{
            borderRadius: 12, padding: "12px 16px",
            background: isCorrect ? C.greenSoft : C.redSoft,
            border: `1.5px solid ${isCorrect ? C.green : C.red}`,
            display: "flex", alignItems: "flex-start", gap: 10,
          }}>
            {isCorrect
              ? <CheckCircle size={16} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
              : <XCircle size={16} color={C.red} style={{ flexShrink: 0, marginTop: 2 }} />}
            <p style={{ fontSize: 13, color: isCorrect ? "#14532D" : "#7F1D1D", margin: 0, lineHeight: 1.5 }}>
              {/* feedback text comes from parent via onResult */}
            </p>
          </div>
        </div>
      )}
      {revealed && <span style={{ display: "none" }}>{onResult(isCorrect)}</span>}
    </div>
  );
}

// ─── NumericInput ─────────────────────────────────────────────────
function NumericInput({ question, prompt, unit, correct_answer, tolerance, onResult }) {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);

  const submit = () => {
    if (!value.trim() || revealed) return;
    const ok = numCorrect(value, correct_answer, tolerance ?? 0.5);
    setCorrect(ok);
    setRevealed(true);
    onResult(ok);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
        {prompt || question}
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {unit && <span style={{ fontSize: 18, fontWeight: 700, color: C.textSub }}>{unit}</span>}
        <input
          type="number" value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
          disabled={revealed}
          placeholder="Enter your answer"
          style={{ flex: 1, height: 48, padding: "0 14px", borderRadius: 10, border: `2px solid ${revealed ? (correct ? C.green : C.red) : (value ? C.navy : C.border)}`, fontSize: 16, fontWeight: 600, color: C.text, outline: "none", background: C.bg, transition: "border-color 0.15s" }}
        />
        {!revealed && (
          <button onClick={submit} disabled={!value.trim()}
            style={{ padding: "0 22px", height: 48, borderRadius: 10, background: value.trim() ? C.navy : C.bgMid, color: value.trim() ? "#fff" : C.textMuted, border: "none", fontWeight: 700, fontSize: 14, cursor: value.trim() ? "pointer" : "not-allowed" }}>
            Check
          </button>
        )}
      </div>
    </div>
  );
}

// ─── PaycheckRead ─────────────────────────────────────────────────
function PaycheckRead({ step, onResult }) {
  const { paycheck } = step;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>{step.prompt}</p>
      <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden" }}>
        <div style={{ background: C.navy, padding: "14px 20px", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.7, marginBottom: 2 }}>Pay Stub</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{paycheck.name}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Pay Period: {paycheck.period}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", background: C.bgSoft, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Gross Pay</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.green }}>${paycheck.gross_pay.toFixed(2)}</span>
        </div>
        {(paycheck.deductions || []).map((d, i) => (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderBottom: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 12, color: C.textSub }}>{d.label}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>−${d.amount.toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", background: C.bgMid, borderTop: `2px solid ${C.navy}` }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Net Pay</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.navy, letterSpacing: "0.05em" }}>???</span>
        </div>
      </div>
      <NumericInput
        prompt="Calculate and enter the net pay:"
        unit={step.unit}
        correct_answer={step.correct_answer}
        tolerance={step.tolerance}
        onResult={onResult}
      />
    </div>
  );
}

// ─── Matching ─────────────────────────────────────────────────────
function Matching({ step, onResult }) {
  const pairs = step.pairs || [];
  const [shuffled] = useState(() => [...pairs.map((p) => p.match)].sort(() => Math.random() - 0.5));
  const [selected, setSelected] = useState(null);
  const [connections, setConnections] = useState({});
  const [revealed, setRevealed] = useState(false);

  const handleTerm = (i) => {
    if (revealed) return;
    setSelected((s) => (s?.side === "term" && s.index === i ? null : { side: "term", index: i }));
  };
  const handleMatch = (i) => {
    if (revealed) return;
    if (selected?.side === "term") {
      setConnections((prev) => ({ ...prev, [selected.index]: i }));
      setSelected(null);
    }
  };

  const allPaired = Object.keys(connections).length === pairs.length;
  const termCorrect = (ti) => connections[ti] !== undefined && shuffled[connections[ti]] === pairs[ti].match;
  const allCorrect = pairs.every((_, ti) => termCorrect(ti));

  const check = () => { setRevealed(true); onResult(allCorrect); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>{step.prompt}</p>
      <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Click a term, then click its match.</p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Deduction</div>
          {pairs.map((pair, i) => {
            const isSel = selected?.side === "term" && selected.index === i;
            const isPaired = connections[i] !== undefined;
            const ok = revealed && termCorrect(i);
            const bad = revealed && isPaired && !termCorrect(i);
            let bg = C.bg, border2 = C.border, color = C.text;
            if (isSel) { bg = C.accentSoft; border2 = C.accent; }
            else if (ok) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (bad) { bg = C.redSoft; border2 = C.red; color = C.red; }
            else if (isPaired) { bg = C.bgMid; border2 = C.borderMid; }
            return (
              <button key={i} onClick={() => handleTerm(i)} disabled={revealed}
                style={{ padding: "10px 14px", borderRadius: 8, border: `2px solid ${border2}`, background: bg, color, fontWeight: 600, fontSize: 13, textAlign: "left", cursor: revealed ? "default" : "pointer", transition: "all 0.15s" }}>
                {pair.term}{isPaired && !revealed && <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 6 }}>✓</span>}
              </button>
            );
          })}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Funds</div>
          {shuffled.map((match, i) => {
            const usedBy = Object.entries(connections).find(([, mi]) => mi === i)?.[0];
            const isPaired = usedBy !== undefined;
            const ok = revealed && isPaired && shuffled[i] === pairs[Number(usedBy)].match;
            const bad = revealed && isPaired && !ok;
            let bg = C.bg, border2 = C.border, color = C.text;
            if (ok) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (bad) { bg = C.redSoft; border2 = C.red; color = C.red; }
            else if (isPaired) { bg = C.bgMid; border2 = C.borderMid; }
            return (
              <button key={i} onClick={() => handleMatch(i)} disabled={revealed}
                style={{ padding: "10px 14px", borderRadius: 8, border: `2px solid ${border2}`, background: bg, color, fontWeight: 500, fontSize: 13, textAlign: "left", cursor: revealed ? "default" : "pointer", transition: "all 0.15s" }}>
                {match}
              </button>
            );
          })}
        </div>
      </div>
      {!revealed && (
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <button onClick={check} disabled={!allPaired}
            style={{ padding: "10px 22px", borderRadius: 999, background: allPaired ? C.navy : C.bgMid, color: allPaired ? "#fff" : C.textMuted, border: "none", fontWeight: 700, fontSize: 14, cursor: allPaired ? "pointer" : "not-allowed" }}>
            Check Matches
          </button>
        </div>
      )}
    </div>
  );
}

// ─── MasteryStep — wraps a question with retry logic ─────────────
//
// Props:
//   step         — the current step or variant object
//   originalStep — the root step (for feedback + hint)
//   retryCount   — how many times we've retried so far
//   onCorrect    — called when user answers correctly
//   onExhausted  — called when max retries reached without correct answer
//
function MasteryStep({ step, originalStep, retryCount, onCorrect, onExhausted }) {
  const [result, setResult] = useState(null); // null | true | false
  const resultFired = useRef(false);

  const handleResult = useCallback((correct) => {
    if (resultFired.current) return;
    resultFired.current = true;
    setResult(correct);
  }, []);

  const showHint = !result && retryCount >= 2 && originalStep.hint;

  const feedbackText = result === true
    ? originalStep.feedback.correct
    : result === false
      ? originalStep.feedback.incorrect
      : null;

  // Determine continue label
  const continueLabel = result === true
    ? "Continue"
    : retryCount >= MAX_RETRIES - 1
      ? "Move On"
      : "Try Again";

  const handleContinue = () => {
    if (result === true) onCorrect();
    else if (retryCount >= MAX_RETRIES - 1) onExhausted();
    else onExhausted(); // will load next variant
  };

  // The actual interactive question — key ensures remount on variant change
  const renderQuestion = () => {
    const type = step.type || originalStep.type;
    const props = { ...originalStep, ...step }; // merge — variant overrides prompt/options/correct_answer

    switch (type) {
      case "true_false":
      case "multiple_choice":
        return (
          <MultipleChoice
            key={step.id || step.prompt}
            prompt={props.prompt || props.question}
            options={props.options}
            correct_answer={props.correct_answer}
            onResult={handleResult}
          />
        );
      case "numeric_input":
        return (
          <NumericInput
            key={step.id || step.prompt}
            prompt={props.prompt || props.question}
            unit={props.unit || originalStep.unit}
            correct_answer={props.correct_answer}
            tolerance={props.tolerance ?? originalStep.tolerance}
            onResult={handleResult}
          />
        );
      case "paycheck_read":
        return <PaycheckRead key={step.id} step={props} onResult={handleResult} />;
      case "matching":
        return <Matching key={step.id} step={props} onResult={handleResult} />;
      default:
        return (
          <MultipleChoice
            key={step.id || step.prompt}
            prompt={props.prompt || props.question}
            options={props.options}
            correct_answer={props.correct_answer}
            onResult={handleResult}
          />
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {showHint && <HintStrip text={originalStep.hint} />}
      {renderQuestion()}
      {result !== null && (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <FeedbackStrip correct={result} text={feedbackText} />
          <ContinueBtn label={continueLabel} onClick={handleContinue} />
        </div>
      )}
    </div>
  );
}

// ─── StepDriver — manages retry cycle for a single step ──────────
//
// Chooses which question to show (original or a retry_variant).
// Calls onMastered(true) if answered correctly, onMastered(false) if exhausted.
//
function StepDriver({ step, onMastered }) {
  const [retryCount, setRetryCount] = useState(0);
  const [variantIndex, setVariantIndex] = useState(-1); // -1 = show original

  const variants = step.retry_variants || [];
  const currentQuestion = variantIndex === -1 ? step : (variants[variantIndex] || step);

  const handleCorrect = () => onMastered(true);

  const handleExhausted = () => {
    const nextVariant = variantIndex + 1;
    const newRetryCount = retryCount + 1;

    if (newRetryCount >= MAX_RETRIES || nextVariant >= variants.length) {
      // Out of retries — move on without credit
      onMastered(false);
    } else {
      setRetryCount(newRetryCount);
      setVariantIndex(nextVariant);
    }
  };

  return (
    <MasteryStep
      key={`${step.id}-retry${retryCount}`}
      step={{ ...currentQuestion, type: currentQuestion.type || step.type }}
      originalStep={step}
      retryCount={retryCount}
      onCorrect={handleCorrect}
      onExhausted={handleExhausted}
    />
  );
}

// ─── Progress bar ─────────────────────────────────────────────────
function ProgressBar({ correct, total, color = C.accent }) {
  const pct = total === 0 ? 0 : Math.round((correct / total) * 100);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
        <span style={{ color: C.textMuted }}>{correct} / {total} correct</span>
        <span style={{ color }}>{pct}%</span>
      </div>
      <div style={{ height: 8, borderRadius: 999, background: C.bgMid, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${pct}%`, borderRadius: 999, background: color, transition: "width 0.4s ease" }} />
      </div>
    </div>
  );
}

// ─── Score screen ─────────────────────────────────────────────────
function ScoreScreen({ score, total, onComplete }) {
  const pct = total === 0 ? 100 : Math.round((score / total) * 100);
  const passed = pct >= 70;
  return (
    <div style={{ textAlign: "center", padding: "48px 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: passed ? C.greenSoft : C.amberSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        {passed ? <Trophy size={36} color={C.green} /> : <Star size={36} color={C.amber} />}
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
        {passed ? "Lesson Complete!" : "Good effort!"}
      </h2>
      <p style={{ fontSize: 15, color: C.textSub, margin: "0 0 4px" }}>
        You got <strong>{score} of {total}</strong> right on the first try — <strong>{pct}%</strong>
      </p>
      <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 28px", lineHeight: 1.5 }}>
        {passed
          ? "You've demonstrated mastery of this topic."
          : "You worked through the material. Review anytime to sharpen your knowledge."}
      </p>
      <button
        onClick={() => onComplete(pct)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 32px", borderRadius: 999, background: C.navy, color: "#fff", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: `0 4px 20px ${C.navyGlow}` }}
      >
        Finish <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────
export default function StepLesson({ lesson, onComplete }) {
  const steps = lesson.steps || [];
  const evalQs = lesson.final_evaluation || [];

  // Interactive steps only — learn steps don't count toward progress
  const interactiveSteps = steps.filter((s) => s.type !== "learn");

  // phase: "steps" | "eval_intro" | "eval" | "score"
  const [phase, setPhase] = useState("steps");
  const [stepIdx, setStepIdx] = useState(0);
  const [stepCorrectCount, setStepCorrectCount] = useState(0);

  const [evalIdx, setEvalIdx] = useState(0);
  const [evalCorrectCount, setEvalCorrectCount] = useState(0);

  const advanceStep = useCallback(() => {
    const next = stepIdx + 1;
    if (next >= steps.length) {
      setPhase(evalQs.length > 0 ? "eval_intro" : "score");
    } else {
      setStepIdx(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [stepIdx, steps.length, evalQs.length]);

  // ── steps phase ─────────────────────────────────────────────────
  const handleStepMastered = useCallback((wasCorrect) => {
    if (wasCorrect) setStepCorrectCount((n) => n + 1);
    advanceStep();
  }, [advanceStep]);

  // ── eval phase ──────────────────────────────────────────────────
  const handleEvalMastered = useCallback((wasCorrect) => {
    if (wasCorrect) setEvalCorrectCount((n) => n + 1);
    const next = evalIdx + 1;
    if (next >= evalQs.length) {
      setPhase("score");
    } else {
      setEvalIdx(next);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [evalIdx, evalQs.length]);

  // ── steps ────────────────────────────────────────────────────────
  if (phase === "steps") {
    const currentStep = steps[stepIdx];
    const isLearn = currentStep?.type === "learn";

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        {/* Progress bar counts only interactive steps */}
        <ProgressBar correct={stepCorrectCount} total={interactiveSteps.length} color={C.accent} />
        <div style={{ borderRadius: 16, border: `1px solid ${isLearn ? C.accentMid : C.border}`, padding: "28px 32px", background: isLearn ? C.accentSoft : C.bg, minHeight: 280 }}>
          {isLearn ? (
            <LearnBlock key={currentStep.id} step={currentStep} onContinue={advanceStep} />
          ) : (
            <StepDriver
              key={`step-${stepIdx}`}
              step={currentStep}
              onMastered={handleStepMastered}
            />
          )}
        </div>
      </div>
    );
  }

  // ── eval intro ───────────────────────────────────────────────────
  if (phase === "eval_intro") {
    return (
      <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, padding: "40px 32px", background: C.bg, textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg,${C.navy},${C.navyLight})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Trophy size={26} color="#fff" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 10px" }}>Final Evaluation</h2>
        <p style={{ fontSize: 15, color: C.textSub, margin: "0 0 6px", lineHeight: 1.6 }}>
          {evalQs.length} questions. Same rules — answer correctly to advance.
        </p>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 28px" }}>Can you apply what you just learned?</p>
        <button
          onClick={() => setPhase("eval")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 32px", borderRadius: 999, background: C.navy, color: "#fff", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: `0 4px 20px ${C.navyGlow}` }}
        >
          Start Evaluation <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // ── eval ─────────────────────────────────────────────────────────
  if (phase === "eval") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>Final Evaluation</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>{evalIdx + 1} / {evalQs.length}</span>
        </div>
        <ProgressBar correct={evalCorrectCount} total={evalQs.length} color={C.green} />
        <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, padding: "28px 32px", background: C.bg, minHeight: 280 }}>
          <StepDriver
            key={`eval-${evalIdx}`}
            step={{ ...evalQs[evalIdx], prompt: evalQs[evalIdx].question }}
            onMastered={handleEvalMastered}
          />
        </div>
      </div>
    );
  }

  // ── score ────────────────────────────────────────────────────────
  if (phase === "score") {
    return (
      <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, padding: "28px 32px", background: C.bg }}>
        <ScoreScreen
          score={evalCorrectCount}
          total={evalQs.length}
          onComplete={onComplete}
        />
      </div>
    );
  }

  return null;
}
