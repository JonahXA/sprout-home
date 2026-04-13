// src/components/lessons/StepLesson.jsx
//
// Renders lessons that use the steps + final_evaluation schema.
// Interaction types: multiple_choice, true_false, numeric_input,
//                    paycheck_read, matching.

import React, { useState, useCallback } from "react";
import { ArrowRight, CheckCircle, XCircle, Lock, Trophy, Star } from "lucide-react";

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

// ─── Numeric answer comparison ──────────────────────────────────
function parseNum(raw) {
  if (raw === null || raw === undefined) return NaN;
  return parseFloat(String(raw).replace(/[$,%\s]/g, ""));
}
function numCorrect(input, answer, tolerance = 0.5) {
  const a = parseNum(input);
  const b = parseNum(answer);
  if (isNaN(a) || isNaN(b)) return false;
  return Math.abs(a - b) <= tolerance;
}

// ─── Feedback banner ────────────────────────────────────────────
function Feedback({ correct, text, onContinue, continueLabel = "Continue" }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{
        borderRadius: 12, padding: "14px 18px",
        background: correct ? C.greenSoft : C.redSoft,
        border: `1px solid ${correct ? C.green : C.red}`,
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
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onContinue}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "11px 26px", borderRadius: 999, background: C.navy, color: "#fff", border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer", boxShadow: `0 4px 16px ${C.navyGlow}` }}
        >
          {continueLabel} <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── MultipleChoice (also handles true_false) ────────────────────
function MultipleChoice({ step, onPass }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const isCorrect = selected === step.correct_answer;

  const choose = (i) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
        {step.prompt || step.question}
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {(step.options || []).map((opt, i) => {
          let bg = C.bg, border2 = C.borderMid, color = C.text, cursor = "pointer";
          if (revealed) {
            if (i === step.correct_answer) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (i === selected) { bg = C.redSoft; border2 = C.red; color = C.red; }
            else { bg = C.bgMid; border2 = C.border; color = C.textMuted; }
            cursor = "default";
          }
          return (
            <button
              key={i} onClick={() => choose(i)} disabled={revealed}
              style={{ width: "100%", textAlign: "left", padding: "13px 16px", borderRadius: 10, border: `2px solid ${border2}`, background: bg, color, fontWeight: 600, fontSize: 14, cursor, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}
            >
              <span style={{ width: 26, height: 26, borderRadius: "50%", border: `2px solid currentColor`, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                {revealed && i === step.correct_answer ? "✓" : revealed && i === selected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && (
        <Feedback
          correct={isCorrect}
          text={isCorrect ? step.feedback.correct : step.feedback.incorrect}
          onContinue={onPass}
        />
      )}
    </div>
  );
}

// ─── NumericInput ────────────────────────────────────────────────
function NumericInput({ step, onPass }) {
  const [value, setValue] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(false);

  const submit = () => {
    if (!value.trim()) return;
    const ok = numCorrect(value, step.correct_answer, step.tolerance ?? 0.5);
    setCorrect(ok);
    setRevealed(true);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>
        {step.prompt || step.question}
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        {step.unit && (
          <span style={{ fontSize: 18, fontWeight: 700, color: C.textSub }}>{step.unit}</span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !revealed) submit(); }}
          disabled={revealed}
          placeholder="Enter your answer"
          style={{ flex: 1, height: 48, padding: "0 14px", borderRadius: 10, border: `2px solid ${revealed ? (correct ? C.green : C.red) : (value ? C.navy : C.border)}`, fontSize: 16, fontWeight: 600, color: C.text, outline: "none", background: C.bg, transition: "border-color 0.15s" }}
        />
        {!revealed && (
          <button
            onClick={submit} disabled={!value.trim()}
            style={{ padding: "0 22px", height: 48, borderRadius: 10, background: value.trim() ? C.navy : C.bgMid, color: value.trim() ? "#fff" : C.textMuted, border: "none", fontWeight: 700, fontSize: 14, cursor: value.trim() ? "pointer" : "not-allowed" }}
          >
            Check
          </button>
        )}
      </div>
      {revealed && (
        <Feedback
          correct={correct}
          text={correct ? step.feedback.correct : step.feedback.incorrect}
          onContinue={onPass}
        />
      )}
    </div>
  );
}

// ─── PaycheckRead ────────────────────────────────────────────────
function PaycheckRead({ step, onPass }) {
  const { paycheck } = step;
  const totalDeductions = (paycheck.deductions || []).reduce((s, d) => s + d.amount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>{step.prompt}</p>

      {/* Paycheck stub */}
      <div style={{ borderRadius: 12, border: `1px solid ${C.border}`, overflow: "hidden", fontFamily: "monospace" }}>
        {/* Header */}
        <div style={{ background: C.navy, padding: "14px 20px", color: "#fff" }}>
          <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", opacity: 0.7, marginBottom: 2 }}>Pay Stub</div>
          <div style={{ fontSize: 15, fontWeight: 700 }}>{paycheck.name}</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Pay Period: {paycheck.period}</div>
        </div>

        {/* Gross row */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 20px", background: C.bgSoft, borderBottom: `1px solid ${C.border}` }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text }}>Gross Pay</span>
          <span style={{ fontSize: 13, fontWeight: 800, color: C.green }}>${paycheck.gross_pay.toFixed(2)}</span>
        </div>

        {/* Deductions */}
        <div style={{ padding: "4px 0" }}>
          {(paycheck.deductions || []).map((d, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 20px", borderBottom: `1px solid ${C.border}` }}>
              <span style={{ fontSize: 12, color: C.textSub }}>{d.label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: C.red }}>−${d.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>

        {/* Net pay — hidden with "???" */}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 20px", background: C.bgMid, borderTop: `2px solid ${C.navy}` }}>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.text }}>Net Pay</span>
          <span style={{ fontSize: 14, fontWeight: 800, color: C.navy, letterSpacing: "0.05em" }}>???</span>
        </div>
      </div>

      <NumericInput step={step} onPass={onPass} />
    </div>
  );
}

// ─── Matching ────────────────────────────────────────────────────
function Matching({ step, onPass }) {
  const pairs = step.pairs || [];
  const shuffledMatches = [...pairs.map((p) => p.match)].sort(() => Math.random() - 0.5);
  const [matches] = useState(shuffledMatches);
  const [selected, setSelected] = useState(null); // { side: "term"|"match", index }
  const [connections, setConnections] = useState({}); // termIdx → matchIdx
  const [revealed, setRevealed] = useState(false);

  const handleTerm = (i) => {
    if (revealed) return;
    if (selected?.side === "term" && selected.index === i) { setSelected(null); return; }
    setSelected({ side: "term", index: i });
  };

  const handleMatch = (i) => {
    if (revealed) return;
    if (selected?.side === "term") {
      setConnections((prev) => ({ ...prev, [selected.index]: i }));
      setSelected(null);
    } else {
      setSelected({ side: "match", index: i });
    }
  };

  const allPaired = Object.keys(connections).length === pairs.length;

  const checkAnswers = () => {
    setRevealed(true);
  };

  const allCorrect = pairs.every((pair, termIdx) => {
    const matchIdx = connections[termIdx];
    return matchIdx !== undefined && matches[matchIdx] === pair.match;
  });

  const termIsCorrect = (termIdx) => {
    const matchIdx = connections[termIdx];
    return matchIdx !== undefined && matches[matchIdx] === pairs[termIdx].match;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>{step.prompt}</p>
      <p style={{ fontSize: 12, color: C.textMuted, margin: 0 }}>Click a term, then click its match.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {/* Terms column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Deduction</div>
          {pairs.map((pair, i) => {
            const isSelected = selected?.side === "term" && selected.index === i;
            const isPaired = connections[i] !== undefined;
            const isCorrectPair = revealed && termIsCorrect(i);
            const isWrongPair = revealed && isPaired && !termIsCorrect(i);
            let bg = C.bg, border2 = C.border, color = C.text;
            if (isSelected) { bg = C.accentSoft; border2 = C.accent; }
            else if (isCorrectPair) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (isWrongPair) { bg = C.redSoft; border2 = C.red; color = C.red; }
            else if (isPaired) { bg = C.bgMid; border2 = C.borderMid; }
            return (
              <button key={i} onClick={() => handleTerm(i)} disabled={revealed}
                style={{ padding: "10px 14px", borderRadius: 8, border: `2px solid ${border2}`, background: bg, color, fontWeight: 600, fontSize: 13, textAlign: "left", cursor: revealed ? "default" : "pointer", transition: "all 0.15s" }}>
                {pair.term}
                {isPaired && !revealed && <span style={{ fontSize: 10, color: C.textMuted, marginLeft: 6 }}>✓</span>}
              </button>
            );
          })}
        </div>

        {/* Matches column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 2 }}>Funds</div>
          {matches.map((match, i) => {
            const isSelected = selected?.side === "match" && selected.index === i;
            const usedByTerm = Object.entries(connections).find(([, mi]) => mi === i)?.[0];
            const isPaired = usedByTerm !== undefined;
            const isCorrectPair = revealed && isPaired && matches[i] === pairs[Number(usedByTerm)].match;
            const isWrongPair = revealed && isPaired && !isCorrectPair;
            let bg = C.bg, border2 = C.border, color = C.text;
            if (isSelected) { bg = C.accentSoft; border2 = C.accent; }
            else if (isCorrectPair) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (isWrongPair) { bg = C.redSoft; border2 = C.red; color = C.red; }
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
          <button onClick={checkAnswers} disabled={!allPaired}
            style={{ padding: "10px 22px", borderRadius: 999, background: allPaired ? C.navy : C.bgMid, color: allPaired ? "#fff" : C.textMuted, border: "none", fontWeight: 700, fontSize: 14, cursor: allPaired ? "pointer" : "not-allowed" }}>
            Check Matches
          </button>
        </div>
      )}

      {revealed && (
        <Feedback
          correct={allCorrect}
          text={allCorrect ? step.feedback.correct : step.feedback.incorrect}
          onContinue={onPass}
        />
      )}
    </div>
  );
}

// ─── Step dispatcher ─────────────────────────────────────────────
function StepContent({ step, onPass }) {
  switch (step.type) {
    case "true_false":
    case "multiple_choice":
      return <MultipleChoice step={step} onPass={onPass} />;
    case "numeric_input":
      return <NumericInput step={step} onPass={onPass} />;
    case "paycheck_read":
      return <PaycheckRead step={step} onPass={onPass} />;
    case "matching":
      return <Matching step={step} onPass={onPass} />;
    default:
      return <MultipleChoice step={step} onPass={onPass} />;
  }
}

// ─── Progress bar ─────────────────────────────────────────────────
function ProgressBar({ current, total, color = C.accent }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600 }}>
        <span style={{ color: C.textMuted }}>{current} / {total}</span>
        <span style={{ color }}>{Math.round((current / total) * 100)}%</span>
      </div>
      <div style={{ height: 6, borderRadius: 999, background: C.bgMid, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(current / total) * 100}%`, borderRadius: 999, background: color, transition: "width 0.35s ease" }} />
      </div>
    </div>
  );
}

// ─── Final score screen ──────────────────────────────────────────
function ScoreScreen({ score, total, onComplete }) {
  const pct = Math.round((score / total) * 100);
  const passed = pct >= 70;
  return (
    <div style={{ textAlign: "center", padding: "40px 0" }}>
      <div style={{ width: 80, height: 80, borderRadius: "50%", background: passed ? C.greenSoft : C.amberSoft, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
        {passed ? <Trophy size={36} color={C.green} /> : <Star size={36} color={C.amber} />}
      </div>
      <h2 style={{ fontSize: 26, fontWeight: 900, color: C.text, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
        {passed ? "Lesson Complete!" : "Good effort!"}
      </h2>
      <p style={{ fontSize: 15, color: C.textSub, margin: "0 0 4px" }}>
        You got <strong>{score} of {total}</strong> correct — <strong>{pct}%</strong>
      </p>
      <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 28px" }}>
        {passed ? "You've mastered this lesson." : "Review the concepts and try again anytime."}
      </p>
      <button
        onClick={() => onComplete(pct)}
        style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 32px", borderRadius: 999, background: C.navy, color: "#fff", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: `0 4px 20px ${C.navyGlow}` }}
      >
        {passed ? "Continue" : "Back to Dashboard"} <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── Main export ─────────────────────────────────────────────────
export default function StepLesson({ lesson, onComplete }) {
  const steps = lesson.steps || [];
  const evalQs = lesson.final_evaluation || [];
  const totalSteps = steps.length;
  const totalEval = evalQs.length;

  const [phase, setPhase] = useState("steps"); // "steps" | "eval_intro" | "eval" | "score"
  const [stepIdx, setStepIdx] = useState(0);
  const [evalIdx, setEvalIdx] = useState(0);
  const [evalScore, setEvalScore] = useState(0);

  const advanceStep = useCallback(() => {
    if (stepIdx < totalSteps - 1) {
      setStepIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("eval_intro");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [stepIdx, totalSteps]);

  const advanceEval = useCallback((wasCorrect) => {
    if (wasCorrect) setEvalScore((s) => s + 1);
    if (evalIdx < totalEval - 1) {
      setEvalIdx((i) => i + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setPhase("score");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [evalIdx, totalEval]);

  // ── Phase: steps ─────────────────────────────────────────────
  if (phase === "steps") {
    const step = steps[stepIdx];
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <ProgressBar current={stepIdx + 1} total={totalSteps} color={C.accent} />
        <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, padding: "28px 32px", background: C.bg, minHeight: 300 }}>
          <StepContent
            key={step.id}
            step={step}
            onPass={advanceStep}
          />
        </div>
      </div>
    );
  }

  // ── Phase: eval intro ────────────────────────────────────────
  if (phase === "eval_intro") {
    return (
      <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, padding: "40px 32px", background: C.bg, textAlign: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg,${C.navy},${C.navyLight})`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
          <Trophy size={26} color="#fff" />
        </div>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: C.text, margin: "0 0 10px", letterSpacing: "-0.5px" }}>
          Final Evaluation
        </h2>
        <p style={{ fontSize: 15, color: C.textSub, margin: "0 0 6px", lineHeight: 1.6 }}>
          {totalEval} questions covering everything you just learned.
        </p>
        <p style={{ fontSize: 13, color: C.textMuted, margin: "0 0 28px" }}>
          Can you actually apply it?
        </p>
        <button
          onClick={() => setPhase("eval")}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 32px", borderRadius: 999, background: C.navy, color: "#fff", border: "none", fontWeight: 800, fontSize: 15, cursor: "pointer", boxShadow: `0 4px 20px ${C.navyGlow}` }}
        >
          Start Evaluation <ArrowRight size={16} />
        </button>
      </div>
    );
  }

  // ── Phase: eval ──────────────────────────────────────────────
  if (phase === "eval") {
    const q = evalQs[evalIdx];

    // Wrap each eval question type so we can capture correct/incorrect
    const EvalStep = ({ question, onDone }) => {
      const wrappedStep = { ...question, prompt: question.question };

      if (question.type === "numeric_input") {
        const [value, setValue] = useState("");
        const [revealed, setRevealed] = useState(false);
        const [correct, setCorrect] = useState(false);
        const submit = () => {
          if (!value.trim()) return;
          const ok = numCorrect(value, question.correct_answer, question.tolerance ?? 0.5);
          setCorrect(ok);
          setRevealed(true);
        };
        return (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>{question.question}</p>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {question.unit && <span style={{ fontSize: 18, fontWeight: 700, color: C.textSub }}>{question.unit}</span>}
              <input type="number" value={value} onChange={(e) => setValue(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !revealed) submit(); }} disabled={revealed}
                placeholder="Enter your answer"
                style={{ flex: 1, height: 48, padding: "0 14px", borderRadius: 10, border: `2px solid ${revealed ? (correct ? C.green : C.red) : (value ? C.navy : C.border)}`, fontSize: 16, fontWeight: 600, color: C.text, outline: "none", background: C.bg, transition: "border-color 0.15s" }} />
              {!revealed && (
                <button onClick={submit} disabled={!value.trim()}
                  style={{ padding: "0 22px", height: 48, borderRadius: 10, background: value.trim() ? C.navy : C.bgMid, color: value.trim() ? "#fff" : C.textMuted, border: "none", fontWeight: 700, fontSize: 14, cursor: value.trim() ? "pointer" : "not-allowed" }}>
                  Check
                </button>
              )}
            </div>
            {revealed && <Feedback correct={correct} text={correct ? question.feedback.correct : question.feedback.incorrect} onContinue={() => onDone(correct)} continueLabel={evalIdx < totalEval - 1 ? "Next Question" : "See Results"} />}
          </div>
        );
      }

      // multiple_choice / true_false
      const [selected, setSelected] = useState(null);
      const [revealed, setRevealed] = useState(false);
      const isCorrect = selected === question.correct_answer;
      const choose = (i) => { if (revealed) return; setSelected(i); setRevealed(true); };
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <p style={{ fontSize: 17, fontWeight: 700, color: C.text, margin: 0, lineHeight: 1.5 }}>{question.question}</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(question.options || []).map((opt, i) => {
              let bg = C.bg, border2 = C.borderMid, color = C.text, cursor = "pointer";
              if (revealed) {
                if (i === question.correct_answer) { bg = C.greenSoft; border2 = C.green; color = C.green; }
                else if (i === selected) { bg = C.redSoft; border2 = C.red; color = C.red; }
                else { bg = C.bgMid; border2 = C.border; color = C.textMuted; }
                cursor = "default";
              }
              return (
                <button key={i} onClick={() => choose(i)} disabled={revealed}
                  style={{ width: "100%", textAlign: "left", padding: "13px 16px", borderRadius: 10, border: `2px solid ${border2}`, background: bg, color, fontWeight: 600, fontSize: 14, cursor, transition: "all 0.15s", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 26, height: 26, borderRadius: "50%", border: "2px solid currentColor", display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>
                    {revealed && i === question.correct_answer ? "✓" : revealed && i === selected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {revealed && <Feedback correct={isCorrect} text={isCorrect ? question.feedback.correct : question.feedback.incorrect} onContinue={() => onDone(isCorrect)} continueLabel={evalIdx < totalEval - 1 ? "Next Question" : "See Results"} />}
        </div>
      );
    };

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Final Evaluation
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.accent }}>
            {evalIdx + 1} / {totalEval}
          </span>
        </div>
        <ProgressBar current={evalIdx + 1} total={totalEval} color={C.green} />
        <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, padding: "28px 32px", background: C.bg, minHeight: 300 }}>
          <EvalStep key={q.id} question={q} onDone={advanceEval} />
        </div>
      </div>
    );
  }

  // ── Phase: score ─────────────────────────────────────────────
  if (phase === "score") {
    return (
      <div style={{ borderRadius: 16, border: `1px solid ${C.border}`, padding: "28px 32px", background: C.bg }}>
        <ScoreScreen score={evalScore} total={totalEval} onComplete={onComplete} />
      </div>
    );
  }

  return null;
}
