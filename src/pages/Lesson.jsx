// src/pages/Lesson.jsx
//
// Lesson renderer with typed-section support.
//
// New lessons use lesson.sections (typed array) + lesson.exit_ticket.
// Old lessons use lesson.content (flat markdown) + lesson.quiz_questions.
// Both paths are handled by normalizeToSections() — no migration needed.

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, ArrowRight, CheckCircle, XCircle, Zap, Trophy, Clock,
  Sparkles, BookOpen, Star, Target, TrendingUp, AlertCircle,
  ChevronDown, ChevronUp, Lightbulb, Play,
} from "lucide-react";
import { toast } from "sonner";
import LevelUpModal from "@/components/shared/LevelUpModal";
import ChallengeCompleteModal from "@/components/shared/ChallengeCompleteModal";
import { useChallengeCheck } from "@/hooks/useChallengeCheck";
import { trackEvent } from "@/services/activity";

// ─── Color tokens (unchanged from before) ──────────────────────
const C = {
  navy:"#1B2B5E", navyMid:"#141E43", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
  accent:"#3B82F6", accentSoft:"#E8F0FE", accentMid:"#BFDBFE",
  green:"#2D9B6F", greenSoft:"#E8F8F0",
  red:"#EF4444", redSoft:"#FEF2F2",
  amber:"#F59E0B", amberSoft:"#FFF3E0",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E5E7EB", borderMid:"#D1D5DB",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

// ─── Local helpers (unchanged) ──────────────────────────────────
const safeParse = (raw, fallback) => {
  try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};
const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getLocalUser = () => getJSON("sprout_user", null);
const setLocalUser = (user) => setJSON("sprout_user", user);
const safeUUID = () => {
  try { return globalThis?.crypto?.randomUUID?.() || null; } catch { return null; }
};

async function fetchJsonWithCache(url, cacheKey, fallback = []) {
  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const d = await res.json();
    setJSON(cacheKey, d);
    return Array.isArray(d) ? d : fallback;
  } catch {
    return getJSON(cacheKey, fallback);
  }
}

const data = {
  async listLessons() {
    const base = import.meta.env.BASE_URL || "/";
    return fetchJsonWithCache(`${base}data/lessons.json`, "sprout_lessons", []);
  },
  async listCourses() {
    const base = import.meta.env.BASE_URL || "/";
    return fetchJsonWithCache(`${base}data/courses.json`, "sprout_courses", []);
  },
  async listUserProgress({ user_email, course_id, lesson_id } = {}) {
    const all = getJSON("sprout_user_progress", []);
    return all.filter((p) => {
      if (user_email && p.user_email !== user_email) return false;
      if (course_id && String(p.course_id) !== String(course_id)) return false;
      if (lesson_id && String(p.lesson_id) !== String(lesson_id)) return false;
      return true;
    });
  },
  async upsertUserProgress(record) {
    const all = getJSON("sprout_user_progress", []);
    const idx = all.findIndex((p) => String(p.id) === String(record.id));
    if (idx >= 0) all[idx] = { ...all[idx], ...record };
    else all.push(record);
    setJSON("sprout_user_progress", all);
    return record;
  },
  async upsertDailyActivity(record) {
    const all = getJSON("sprout_daily_activity", []);
    const idx = all.findIndex((a) => a.user_email === record.user_email && a.date === record.date);
    if (idx >= 0) all[idx] = { ...all[idx], ...record };
    else all.push(record);
    setJSON("sprout_daily_activity", all);
    return record;
  },
  async getDailyActivity({ user_email, date }) {
    return getJSON("sprout_daily_activity", []).filter(
      (a) => a.user_email === user_email && a.date === date
    );
  },
};

// ─── Legacy image map (unchanged) ──────────────────────────────
const lessonImages = {
  budget:    "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
  paycheck:  "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
  insurance: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
  ai:        "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
  ml:        "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80",
  piggybank: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
  investing: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
  credit:    "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
  career:    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
};

// ─── Legacy special-page detection (unchanged) ─────────────────
function detectSpecialLessonPage(lesson) {
  if (!lesson?.title) return null;
  const title = (lesson.title || "").toLowerCase();
  const content = lesson.content || "";
  const contentLength = content.trim().length;
  const dayMatch = lesson.title.match(/^Day (\d+):/i);
  if (dayMatch) return `AIDay${dayMatch[1]}`;
  if (contentLength > 300) return null;
  if (title.includes("budget") && !title.includes("quiz")) return "BudgetLesson";
  if (title.includes("paycheck") && !title.includes("quiz")) return "PaycheckLesson";
  if ((title.includes("credit") || title.includes("statement")) && !title.includes("quiz")) return "CreditCardLesson";
  return null;
}

function hasSubstantialContent(content) {
  if (!content || typeof content !== "string") return false;
  const trimmed = content.trim();
  if (trimmed.length < 200) return false;
  return /^##\s/m.test(trimmed);
}

// ─── normalizeToSections ────────────────────────────────────────
// New lessons: lesson.sections is a typed array → returned as-is.
// Old lessons: lesson.content is split on ## headers → each chunk
//              wrapped as { type:"instruction" } so the renderer
//              handles it identically to before.
function normalizeToSections(lesson) {
  if (Array.isArray(lesson.sections) && lesson.sections.length > 0) {
    return lesson.sections;
  }
  const raw = String(lesson.content || "");
  const chunks = raw.split(/(?=^## )/m).filter((s) => s.trim());
  const parts = chunks.length > 1 ? chunks : [raw];
  return parts.map((body, i) => ({
    section_id: `legacy-${i}`,
    type: "instruction",
    body,
  }));
}

// ─── Section type label (shown in step indicator) ───────────────
const SECTION_LABELS = {
  hook:            "Hook",
  instruction:     "Learn",
  guided_practice: "Practice",
  check:           "Check",
  simulation:      "Simulation",
  misconception:   "Misconception",
  reflection:      "Reflect",
};

// ─── Inline components ──────────────────────────────────────────

// ─── Shared check primitives ────────────────────────────────────
function CheckBanner({ label = "Quick Check" }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:C.accentSoft, border:`1px solid ${C.accentMid}`, borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:700, color:C.accent }}>
      <Lightbulb size={14} />{label}
    </div>
  );
}
function CheckExplanation({ correct, text }) {
  return (
    <div style={{ borderRadius:10, padding:"14px 16px", background: correct ? C.greenSoft : C.amberSoft, border:`1px solid ${correct ? C.green : C.amber}`, fontSize:14, color: correct ? C.green : "#92400E" }}>
      <p style={{ fontWeight:700, margin:"0 0 4px" }}>{correct ? "Correct!" : "Good to know:"}</p>
      <p style={{ margin:0 }}>{text}</p>
    </div>
  );
}
function ContinueBtn({ onPass }) {
  return (
    <div style={{ display:"flex", justifyContent:"flex-end" }}>
      <button onClick={onPass} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}>
        Continue <ArrowRight size={16} />
      </button>
    </div>
  );
}

// ─── multiple_choice ─────────────────────────────────────────────
function MultipleChoice({ section, onPass }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const isCorrect = selected === section.correct_answer;
  const choose = (idx) => { if (revealed) return; setSelected(idx); setRevealed(true); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <CheckBanner />
      {section.setup && (
        <div style={{ background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", fontSize:14, color:C.text, lineHeight:1.7 }}>
          <ReactMarkdown>{section.setup}</ReactMarkdown>
        </div>
      )}
      <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:0, lineHeight:1.5 }}>{section.question}</p>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {(section.options || []).map((opt, i) => {
          let bg = C.bg, border2 = C.borderMid, color = C.text, cursor = "pointer";
          if (revealed) {
            if (i === section.correct_answer) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (i === selected) { bg = C.redSoft; border2 = C.red; color = C.red; }
            else { bg = C.bgMid; border2 = C.border; color = C.textMuted; }
            cursor = "default";
          }
          return (
            <button key={i} onClick={() => choose(i)} disabled={revealed}
              style={{ width:"100%", textAlign:"left", padding:"12px 16px", borderRadius:10, border:`2px solid ${border2}`, background:bg, color, fontWeight:600, fontSize:14, cursor, transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:24, height:24, borderRadius:"50%", border:`2px solid currentColor`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>
                {revealed && i === section.correct_answer ? "✓" : revealed && i === selected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && <CheckExplanation correct={isCorrect} text={section.explanation} />}
      {revealed && <ContinueBtn onPass={onPass} />}
    </div>
  );
}

// ─── multi_select ────────────────────────────────────────────────
// section.correct_answers: number[] (indices of all correct options)
// section.min_correct: optional minimum required to pass (default: all)
function MultiSelect({ section, onPass }) {
  const [selected, setSelected] = useState(new Set());
  const [revealed, setRevealed] = useState(false);
  const correct = new Set(section.correct_answers || []);
  const toggle = (i) => { if (revealed) return; setSelected(prev => { const n = new Set(prev); n.has(i) ? n.delete(i) : n.add(i); return n; }); };
  const submit = () => setRevealed(true);
  const allCorrect = [...correct].every(i => selected.has(i)) && [...selected].every(i => correct.has(i));
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <CheckBanner label="Select All That Apply" />
      {section.setup && (
        <div style={{ background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:10, padding:"14px 16px", fontSize:14, color:C.text, lineHeight:1.7 }}>
          <ReactMarkdown>{section.setup}</ReactMarkdown>
        </div>
      )}
      <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:0, lineHeight:1.5 }}>{section.question}</p>
      <p style={{ fontSize:12, color:C.textMuted, margin:0 }}>Select all correct answers, then click Check.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {(section.options || []).map((opt, i) => {
          const isSelected = selected.has(i);
          const isCorrectOpt = correct.has(i);
          let bg = isSelected ? C.accentSoft : C.bg;
          let border2 = isSelected ? C.accent : C.borderMid;
          let color = C.text;
          if (revealed) {
            if (isCorrectOpt) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (isSelected) { bg = C.redSoft; border2 = C.red; color = C.red; }
            else { bg = C.bgMid; border2 = C.border; color = C.textMuted; }
          }
          return (
            <button key={i} onClick={() => toggle(i)} disabled={revealed}
              style={{ width:"100%", textAlign:"left", padding:"12px 16px", borderRadius:10, border:`2px solid ${border2}`, background:bg, color, fontWeight:600, fontSize:14, cursor: revealed ? "default" : "pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:22, height:22, borderRadius:4, border:`2px solid currentColor`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:900, flexShrink:0 }}>
                {revealed && isCorrectOpt ? "✓" : revealed && isSelected && !isCorrectOpt ? "✗" : isSelected ? "✓" : ""}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {!revealed && (
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button onClick={submit} disabled={selected.size === 0}
            style={{ padding:"10px 22px", borderRadius:999, background: selected.size === 0 ? C.borderMid : C.navy, color: selected.size === 0 ? C.textMuted : "#fff", border:"none", fontWeight:700, fontSize:14, cursor: selected.size === 0 ? "not-allowed" : "pointer" }}>
            Check Answers
          </button>
        </div>
      )}
      {revealed && <CheckExplanation correct={allCorrect} text={section.explanation} />}
      {revealed && <ContinueBtn onPass={onPass} />}
    </div>
  );
}

// ─── prompt_improve ──────────────────────────────────────────────
// section.weak_prompt: string — the bad prompt to rewrite
// section.criteria: string[] — signals to detect ("context","task","constraints","format")
// section.min_length: number — minimum character count before Submit unlocks
// section.improved_output: string — shown after passing
// Uses same signal arrays as PromptImprovementSimulation
const _CTX = [/\bI'?m\b/i,/\bmy\b/i,/\bstudent\b/i,/\bgrade\b/i,/\bclass\b/i,/\bcourse\b/i,/\bbeginne?r\b/i,/\bexam\b/i,/\btest\b/i,/\bproject\b/i,/\bassignment\b/i,/\bpreparing\b/i,/\bworking on\b/i,/\bsubject\b/i,/\bschool\b/i];
const _TASK = [/\bcreate\b/i,/\bwrite\b/i,/\bexplain\b/i,/\bsummariz/i,/\blist\b/i,/\bcompare\b/i,/\bgive me\b/i,/\bshow me\b/i,/\bmake\b/i,/\bgenerate\b/i,/\bprovide\b/i,/\boutline\b/i,/\bdraft\b/i,/\bteach\b/i,/\bstep.by.step\b/i,/\bstudy guide\b/i,/\bpractice questions?\b/i];
const _CON = [/\bword(s)?\b/i,/\bshort\b/i,/\bbrief\b/i,/\bconcise\b/i,/\bonly\b/i,/\bavoid\b/i,/\bno jargon\b/i,/\bsimple\b/i,/\bmax(imum)?\b/i,/\blimit\b/i,/\bformal\b/i,/\bcasual\b/i,/\btone\b/i,/\bdo not include\b/i,/\bunder \d+\b/i,/\b\d+ words?\b/i,/\bkeep it\b/i];
const _FMT = [/\bbullet(s|ed)?\b/i,/\blist\b/i,/\btable\b/i,/\bparagraph\b/i,/\bheader(s)?\b/i,/\bnumber(ed)?\b/i,/\bformat\b/i,/\bchart\b/i,/\boutline\b/i,/\bstep.by.step\b/i,/\bsection(s)?\b/i,/\bpros and cons\b/i,/\bflashcard(s)?\b/i];
const SIGNAL_MAP = { context: _CTX, task: _TASK, constraints: _CON, format: _FMT };
function scorePromptText(text, criteria) {
  const res = {};
  (criteria || []).forEach(c => { res[c] = (SIGNAL_MAP[c] || []).some(r => r.test(text)); });
  return res;
}
const CRITERIA_HINTS = {
  context: "Who are you? What subject/situation? What do you already know?",
  task: "What exactly do you want the AI to produce?",
  constraints: "Length, tone, scope, or exclusions?",
  format: "How should it be structured — list, table, steps, chart?",
};

function PromptImprove({ section, onPass }) {
  const [input, setInput]       = useState("");
  const [phase, setPhase]       = useState("input"); // input | feedback | output
  const [scores, setScores]     = useState(null);
  const [reflection, setReflection] = useState(""); // branching free-response
  const criteria = section.criteria || ["context", "task"];
  const minLen   = section.min_length || 30;
  const tooShort = input.trim().length < minLen;
  const allPassed = scores && criteria.every(c => scores[c]);

  // ── Branching support (sec-sim-act2) ────────────────────────────
  // section.branching: { enabled, branches: { low, mid, high } }
  // Each branch: { criteria_threshold: [min,max], excerpt, note }
  const branching = section.branching;
  const branchEnabled = !!branching?.enabled;

  const selectBranch = (scoresObj) => {
    if (!branchEnabled || !scoresObj) return null;
    const count = criteria.filter(c => scoresObj[c]).length;
    const { low, mid, high } = branching.branches;
    if (count <= 1) return low;
    if (count <= 3) return mid;
    return high;
  };
  const currentBranch    = scores ? selectBranch(scores) : null;
  const reflectionReady  = reflection.trim().length >= 1;

  const evaluate = () => { setScores(scorePromptText(input, criteria)); setPhase("feedback"); };
  const retry    = () => { setScores(null); setPhase("input"); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <CheckBanner label="Improve the Prompt" />
      <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:0, lineHeight:1.5 }}>{section.question || "Rewrite this prompt to include the missing elements."}</p>

      {/* Weak prompt display */}
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:5 }}>Weak Prompt</div>
        <div style={{ background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px", fontSize:14, color:C.textSub, lineHeight:1.6 }}>{section.weak_prompt}</div>
      </div>

      {phase === "input" && (
        <>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:5 }}>Your Improved Prompt</div>
            <textarea value={input} onChange={e => setInput(e.target.value)}
              placeholder={`Rewrite the prompt with: ${criteria.join(", ")}...`}
              style={{ width:"100%", boxSizing:"border-box", minHeight:90, padding:"12px 14px", borderRadius:10, border:`1.5px solid ${input.length > 20 ? C.navy : C.border}`, fontSize:14, color:C.text, lineHeight:1.6, fontFamily:"inherit", resize:"vertical", outline:"none", background:"#fff" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button onClick={evaluate} disabled={tooShort}
              style={{ padding:"10px 22px", borderRadius:999, background: tooShort ? C.borderMid : C.navy, color: tooShort ? C.textMuted : "#fff", border:"none", fontWeight:700, fontSize:14, cursor: tooShort ? "not-allowed" : "pointer" }}>
              Evaluate
            </button>
          </div>
        </>
      )}

      {/* ── Branching feedback (Act 2 simulation) ── */}
      {phase === "feedback" && branchEnabled && currentBranch && (
        <>
          {/* 1. AI-output excerpt block */}
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:6 }}>AI Output — Based on Your Prompt</div>
            <div style={{ background:"#F0F4FF", border:`1.5px solid ${C.accent}`, borderRadius:10, padding:"16px 18px", fontSize:14, color:C.text, lineHeight:1.75, fontStyle:"italic" }}>
              "{currentBranch.excerpt}"
            </div>
            {/* 2. Note caption */}
            <p style={{ fontSize:12, color:C.textSub, margin:"8px 0 0", lineHeight:1.5, fontStyle:"normal" }}>{currentBranch.note}</p>
          </div>

          {/* 3. Criteria scorecard */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {criteria.map(c => (
              <div key={c} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"8px 10px", borderRadius:8, background: scores[c] ? C.greenSoft : C.bgMid, border:`1px solid ${scores[c] ? C.green : C.border}` }}>
                <span style={{ fontSize:13, fontWeight:900, color: scores[c] ? C.green : C.textMuted, flexShrink:0 }}>{scores[c] ? "✓" : "○"}</span>
                <div>
                  <span style={{ fontSize:13, fontWeight:700, color: scores[c] ? C.green : C.textSub }}>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                  {!scores[c] && <p style={{ margin:"2px 0 0", fontSize:12, color:C.textMuted, lineHeight:1.4 }}>{CRITERIA_HINTS[c]}</p>}
                </div>
              </div>
            ))}
          </div>

          {/* 4. Reflection free-response */}
          <div>
            <div style={{ fontSize:13, fontWeight:700, color:C.text, marginBottom:8, lineHeight:1.4 }}>
              What's the one thing you'd add or change to move this response up a level?
            </div>
            <textarea value={reflection} onChange={e => setReflection(e.target.value)}
              placeholder="Write your answer here..."
              style={{ width:"100%", boxSizing:"border-box", minHeight:72, padding:"10px 12px", borderRadius:10, border:`1.5px solid ${reflection.length > 0 ? C.navy : C.border}`, fontSize:14, color:C.text, lineHeight:1.6, fontFamily:"inherit", resize:"vertical", outline:"none", background:"#fff", transition:"border-color 0.15s" }} />
          </div>

          {/* 5. Advance button — unlocks after 1+ char */}
          <div style={{ display:"flex", justifyContent:"flex-end" }}>
            <button onClick={onPass} disabled={!reflectionReady}
              style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background: reflectionReady ? C.navy : C.borderMid, color: reflectionReady ? "#fff" : C.textMuted, border:"none", fontWeight:700, fontSize:14, cursor: reflectionReady ? "pointer" : "not-allowed", transition:"all 0.15s", boxShadow: reflectionReady ? `0 4px 16px ${C.navyGlow}` : "none" }}>
              See what a full prompt produces <ArrowRight size={16} />
            </button>
          </div>
        </>
      )}

      {/* ── Standard feedback (all other prompt_improve checks) ── */}
      {phase === "feedback" && !branchEnabled && (
        <>
          <div style={{ background:"#fff", border:`1.5px solid ${allPassed ? C.green : "#F59E0B"}`, borderRadius:10, padding:"12px 14px", fontSize:14, color:C.text, lineHeight:1.6 }}>{input}</div>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {criteria.map(c => (
              <div key={c} style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"8px 10px", borderRadius:8, background: scores[c] ? C.greenSoft : C.redSoft, border:`1px solid ${scores[c] ? C.green : C.red}` }}>
                <span style={{ fontSize:13, fontWeight:900, color: scores[c] ? C.green : C.red, flexShrink:0 }}>{scores[c] ? "✓" : "✗"}</span>
                <div>
                  <span style={{ fontSize:13, fontWeight:700, color: scores[c] ? C.green : C.red }}>{c.charAt(0).toUpperCase() + c.slice(1)}</span>
                  {!scores[c] && <p style={{ margin:"2px 0 0", fontSize:12, color:C.textSub, lineHeight:1.4 }}>{CRITERIA_HINTS[c]}</p>}
                </div>
              </div>
            ))}
          </div>
          {allPassed ? (
            <>
              <div style={{ borderRadius:10, padding:"12px 14px", background:C.greenSoft, border:`1px solid ${C.green}`, fontSize:14, color:C.green }}>{section.explanation || "Great — that prompt has all the key elements."}</div>
              {section.improved_output && (
                <button onClick={() => setPhase("output")} style={{ width:"100%", padding:"11px 0", borderRadius:999, background:C.green, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer" }}>See the improved output →</button>
              )}
              {!section.improved_output && <ContinueBtn onPass={onPass} />}
            </>
          ) : (
            <>
              <div style={{ borderRadius:10, padding:"12px 14px", background:"#FFFBEB", border:"1px solid #FDE68A", fontSize:14, color:"#92400E" }}>
                Missing: {criteria.filter(c => !scores[c]).join(" and ")}. Revise and try again.
              </div>
              <button onClick={retry} style={{ width:"100%", padding:"11px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer" }}>Revise and retry</button>
            </>
          )}
        </>
      )}

      {phase === "output" && (
        <>
          <div>
            <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, letterSpacing:"0.06em", textTransform:"uppercase", marginBottom:5 }}>Result With Your Improved Prompt</div>
            <div style={{ background:C.greenSoft, border:`1px solid ${C.green}`, borderRadius:10, padding:"12px 14px", fontSize:13.5, color:C.text, lineHeight:1.7, whiteSpace:"pre-wrap" }}>{section.improved_output}</div>
          </div>
          <ContinueBtn onPass={onPass} />
        </>
      )}
    </div>
  );
}

// ─── compare ─────────────────────────────────────────────────────
// section.prompt_a / section.prompt_b: string — two prompts (or outputs) to compare
// section.label_a / section.label_b: optional labels (default "Option A" / "Option B")
// section.better: "a" | "b" — which is better
// section.explanation: string
function Compare({ section, onPass }) {
  const [choice, setChoice] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const correct = (section.better || "b").toLowerCase();
  const isCorrect = choice === correct;
  const choose = (v) => { if (revealed) return; setChoice(v); setRevealed(true); };
  const labelA = section.label_a || "Option A";
  const labelB = section.label_b || "Option B";
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <CheckBanner label="Compare" />
      <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:0, lineHeight:1.5 }}>{section.question || "Which is better?"}</p>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        {[["a", labelA, section.prompt_a], ["b", labelB, section.prompt_b]].map(([val, label, text]) => {
          const isChosen = choice === val;
          const isCorrectOpt = val === correct;
          let border2 = C.borderMid, bg = C.bgSoft;
          if (revealed) {
            if (isCorrectOpt) { border2 = C.green; bg = C.greenSoft; }
            else if (isChosen) { border2 = C.red; bg = C.redSoft; }
          } else if (isChosen) { border2 = C.navy; bg = C.accentSoft; }
          return (
            <button key={val} onClick={() => choose(val)} disabled={revealed}
              style={{ textAlign:"left", padding:"14px 16px", borderRadius:12, border:`2px solid ${border2}`, background:bg, cursor: revealed ? "default" : "pointer", transition:"all 0.15s", display:"flex", flexDirection:"column", gap:8 }}>
              <span style={{ fontSize:11, fontWeight:800, color: revealed && isCorrectOpt ? C.green : revealed && isChosen && !isCorrectOpt ? C.red : C.textSub, textTransform:"uppercase", letterSpacing:"0.05em" }}>
                {revealed && isCorrectOpt ? "✓ " : revealed && isChosen && !isCorrectOpt ? "✗ " : ""}{label}
              </span>
              <span style={{ fontSize:13.5, color:C.text, lineHeight:1.6, fontStyle:"italic" }}>"{text}"</span>
            </button>
          );
        })}
      </div>
      {revealed && <CheckExplanation correct={isCorrect} text={section.explanation} />}
      {revealed && <ContinueBtn onPass={onPass} />}
    </div>
  );
}

// ─── prediction ──────────────────────────────────────────────────
// section.setup: string — scenario / prompt shown to student
// section.options: string[] — possible outputs to predict
// section.correct_answer: number — index of what will actually appear
// section.reveal: string — the actual output revealed after answering
function Prediction({ section, onPass }) {
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const isCorrect = selected === section.correct_answer;
  const choose = (i) => { if (revealed) return; setSelected(i); setRevealed(true); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <CheckBanner label="Predict the Output" />
      <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:0, lineHeight:1.5 }}>{section.question || "What will the AI produce?"}</p>
      {section.setup && (
        <div style={{ background:C.bgSoft, border:`1px solid ${C.border}`, borderRadius:10, padding:"12px 14px" }}>
          <div style={{ fontSize:11, fontWeight:700, color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.06em", marginBottom:6 }}>The Prompt</div>
          <p style={{ fontSize:14, color:C.text, margin:0, lineHeight:1.6, fontStyle:"italic" }}>"{section.setup}"</p>
        </div>
      )}
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {(section.options || []).map((opt, i) => {
          let bg = C.bg, border2 = C.borderMid, color = C.text;
          if (revealed) {
            if (i === section.correct_answer) { bg = C.greenSoft; border2 = C.green; color = C.green; }
            else if (i === selected) { bg = C.redSoft; border2 = C.red; color = C.red; }
            else { bg = C.bgMid; border2 = C.border; color = C.textMuted; }
          }
          return (
            <button key={i} onClick={() => choose(i)} disabled={revealed}
              style={{ width:"100%", textAlign:"left", padding:"12px 16px", borderRadius:10, border:`2px solid ${border2}`, background:bg, color, fontWeight:600, fontSize:14, cursor: revealed ? "default" : "pointer", transition:"all 0.15s", display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ width:24, height:24, borderRadius:"50%", border:`2px solid currentColor`, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>
                {revealed && i === section.correct_answer ? "✓" : revealed && i === selected && !isCorrect ? "✗" : String.fromCharCode(65 + i)}
              </span>
              {opt}
            </button>
          );
        })}
      </div>
      {revealed && section.reveal && (
        <div style={{ borderRadius:10, border:`1px solid ${C.borderMid}`, overflow:"hidden" }}>
          <div style={{ padding:"8px 14px", background:C.bgMid, fontSize:11, fontWeight:700, color:C.textSub, textTransform:"uppercase", letterSpacing:"0.06em" }}>Actual Output</div>
          <div style={{ padding:"14px 16px", fontSize:13.5, color:C.text, lineHeight:1.7, background:"#fff", whiteSpace:"pre-wrap" }}>{section.reveal}</div>
        </div>
      )}
      {revealed && <CheckExplanation correct={isCorrect} text={section.explanation} />}
      {revealed && <ContinueBtn onPass={onPass} />}
    </div>
  );
}

// ─── ordering ────────────────────────────────────────────────────
// section.items: string[] — items in shuffled order as presented
// section.correct_order: number[] — indices of section.items in correct sequence
function Ordering({ section, onPass }) {
  const items = section.items || [];
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [revealed, setRevealed] = useState(false);
  const [dragIdx, setDragIdx] = useState(null);

  const moveItem = (from, to) => {
    if (from === to) return;
    setOrder(prev => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };

  const check = () => setRevealed(true);

  const correctOrder = section.correct_order || items.map((_, i) => i);
  const allCorrect = order.every((itemIdx, pos) => itemIdx === correctOrder[pos]);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <CheckBanner label="Put in Order" />
      <p style={{ fontSize:16, fontWeight:700, color:C.text, margin:0, lineHeight:1.5 }}>{section.question || "Arrange these in the correct order."}</p>
      <p style={{ fontSize:12, color:C.textMuted, margin:0 }}>Use the arrows to reorder, then click Check.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
        {order.map((itemIdx, pos) => {
          const isCorrectPos = revealed && itemIdx === correctOrder[pos];
          const isWrongPos = revealed && itemIdx !== correctOrder[pos];
          return (
            <div key={itemIdx} style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 14px", borderRadius:10, border:`2px solid ${isCorrectPos ? C.green : isWrongPos ? C.red : C.borderMid}`, background: isCorrectPos ? C.greenSoft : isWrongPos ? C.redSoft : C.bg, transition:"all 0.15s" }}>
              <span style={{ width:24, height:24, borderRadius:"50%", background: isCorrectPos ? C.green : isWrongPos ? C.red : C.bgMid, color: (isCorrectPos || isWrongPos) ? "#fff" : C.textSub, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, flexShrink:0 }}>
                {pos + 1}
              </span>
              <span style={{ flex:1, fontSize:14, fontWeight:600, color: isCorrectPos ? C.green : isWrongPos ? C.red : C.text, lineHeight:1.4 }}>{items[itemIdx]}</span>
              {!revealed && (
                <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
                  <button onClick={() => moveItem(pos, pos - 1)} disabled={pos === 0}
                    style={{ padding:"2px 6px", borderRadius:4, border:`1px solid ${C.border}`, background:C.bg, cursor: pos === 0 ? "not-allowed" : "pointer", opacity: pos === 0 ? 0.3 : 1, fontSize:10 }}>▲</button>
                  <button onClick={() => moveItem(pos, pos + 1)} disabled={pos === order.length - 1}
                    style={{ padding:"2px 6px", borderRadius:4, border:`1px solid ${C.border}`, background:C.bg, cursor: pos === order.length - 1 ? "not-allowed" : "pointer", opacity: pos === order.length - 1 ? 0.3 : 1, fontSize:10 }}>▼</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {!revealed && (
        <div style={{ display:"flex", justifyContent:"flex-end" }}>
          <button onClick={check} style={{ padding:"10px 22px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer" }}>Check Order</button>
        </div>
      )}
      {revealed && <CheckExplanation correct={allCorrect} text={section.explanation} />}
      {revealed && <ContinueBtn onPass={onPass} />}
    </div>
  );
}

// ─── InlineCheck — dispatcher ────────────────────────────────────
// Routes to the correct sub-component based on check_type.
// Preserves full backward compatibility — existing multiple_choice
// sections continue to work unchanged.
function InlineCheck({ section, onPass }) {
  switch (section.check_type) {
    case "multi_select":   return <MultiSelect    section={section} onPass={onPass} />;
    case "prompt_improve": return <PromptImprove  section={section} onPass={onPass} />;
    case "compare":        return <Compare        section={section} onPass={onPass} />;
    case "prediction":     return <Prediction     section={section} onPass={onPass} />;
    case "ordering":       return <Ordering       section={section} onPass={onPass} />;
    case "multiple_choice":
    default:               return <MultipleChoice section={section} onPass={onPass} />;
  }
}

// MisconceptionCard — myth vs reality callout.
function MisconceptionCard({ myth, reality, onContinue }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#FFF7ED", border:"1px solid #FED7AA", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:700, color:"#C2410C" }}>
        <AlertCircle size={14} />
        Common Misconception
      </div>

      <div style={{ borderRadius:12, border:`1px solid ${C.border}`, overflow:"hidden" }}>
        <div style={{ padding:"16px 20px", background:C.redSoft, borderBottom:`1px solid #FECACA` }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.red, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.05em" }}>The Myth</p>
          <p style={{ fontSize:15, fontWeight:600, color:"#7F1D1D", margin:0, textDecoration:"line-through", opacity:0.8 }}>{myth}</p>
        </div>
        <div style={{ padding:"16px 20px", background:C.greenSoft }}>
          <p style={{ fontSize:12, fontWeight:700, color:C.green, margin:"0 0 6px", textTransform:"uppercase", letterSpacing:"0.05em" }}>The Reality</p>
          <p style={{ fontSize:15, fontWeight:600, color:"#14532D", margin:0 }}>{reality}</p>
        </div>
      </div>

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button
          onClick={onContinue}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}
        >
          Continue <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ReflectionCard — prompt with a textarea for writing thoughts + continue button.
function ReflectionCard({ prompt, onContinue }) {
  const [text, setText] = useState("");
  const hasWritten = text.trim().length > 20;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
      <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"#F5F3FF", border:"1px solid #DDD6FE", borderRadius:8, padding:"8px 14px", fontSize:13, fontWeight:700, color:"#7C3AED" }}>
        <Star size={14} />
        Reflection
      </div>

      <div style={{ borderRadius:12, border:"1px solid #DDD6FE", background:"#F5F3FF", padding:"20px 24px" }}>
        <p style={{ fontSize:16, lineHeight:1.7, color:"#4C1D95", margin:0, fontStyle:"italic" }}>
          {prompt}
        </p>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your thoughts here..."
        style={{
          width:"100%", boxSizing:"border-box", minHeight:110,
          padding:"12px 14px", borderRadius:10,
          border:`1.5px solid ${text.length > 10 ? "#7C3AED" : C.border}`,
          fontSize:14, color:C.text, lineHeight:1.6, fontFamily:"inherit",
          resize:"vertical", outline:"none", transition:"border-color 0.15s",
          background:"#fff",
        }}
      />

      <div style={{ display:"flex", justifyContent:"flex-end" }}>
        <button
          onClick={onContinue}
          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:999, background:"#7C3AED", color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer" }}
        >
          {hasWritten ? "Continue" : "Skip — continue"} <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ObjectivesPanel — collapsible, shown at section 0 only.
function ObjectivesPanel({ objectives }) {
  const [open, setOpen] = useState(false);
  if (!objectives?.length) return null;
  return (
    <div style={{ borderRadius:12, border:`1px solid ${C.accentMid}`, background:C.accentSoft, overflow:"hidden", marginBottom:8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:700, color:C.accent }}
      >
        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
          <Target size={14} />
          Learning Objectives ({objectives.length})
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <ul style={{ margin:0, padding:"0 16px 14px 16px", listStyle:"none", display:"flex", flexDirection:"column", gap:6 }}>
          {objectives.map((obj) => (
            <li key={obj.id || obj.text} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:14, color:C.textSub, lineHeight:1.5 }}>
              <CheckCircle size={14} style={{ color:C.accent, flexShrink:0, marginTop:2 }} />
              {obj.text}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// VocabularyPanel — collapsible, shown at section 0 only.
function VocabularyPanel({ vocabulary }) {
  const [open, setOpen] = useState(false);
  if (!vocabulary?.length) return null;
  return (
    <div style={{ borderRadius:12, border:`1px solid ${C.borderMid}`, background:C.bgSoft, overflow:"hidden", marginBottom:8 }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"12px 16px", background:"none", border:"none", cursor:"pointer", fontSize:13, fontWeight:700, color:C.textSub }}
      >
        <span style={{ display:"flex", alignItems:"center", gap:6 }}>
          <BookOpen size={14} />
          Key Vocabulary ({vocabulary.length})
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && (
        <dl style={{ margin:0, padding:"0 16px 14px 16px", display:"flex", flexDirection:"column", gap:8 }}>
          {vocabulary.map((v) => (
            <div key={v.term} style={{ borderRadius:8, background:C.bg, border:`1px solid ${C.border}`, padding:"10px 14px" }}>
              <dt style={{ fontSize:13, fontWeight:800, color:C.text, marginBottom:2 }}>{v.term}</dt>
              <dd style={{ fontSize:13, color:C.textSub, margin:0, lineHeight:1.5 }}>{v.definition}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}

// SimulationEmbed — lazy-loads a named component (new section-based path).
// The legacy path (getSimulationForLesson) is no longer needed for new lessons
// since the section declares component + scenario_id directly.
function SimulationEmbed({ component: componentName, scenarioId, onComplete }) {
  const [Comp, setComp] = useState(null);
  const [launched, setLaunched] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        let m;
        if (componentName === "BudgetWalkthrough") m = await import("@/features/finance/BudgetWalkthrough");
        else if (componentName === "ScenarioBudgetSimulation") m = await import("@/features/finance/ScenarioBudgetSimulation");
        else if (componentName === "InterestCalculator") m = await import("@/features/finance/InterestCalculator");
        else if (componentName === "CreditCardStatement") m = await import("@/features/finance/CreditCardStatement");
        else if (componentName === "PaycheckStatement") m = await import("@/features/finance/PaycheckStatement");
        else if (componentName === "PromptImprovementSimulation") m = await import("@/features/ai-literacy/PromptImprovementSimulation");
        if (m) setComp(() => m.default);
      } catch (e) {
        console.error("SimulationEmbed: failed to load", componentName, e);
      }
    }
    if (launched) load();
  }, [componentName, launched]);

  if (!launched) {
    return (
      <div style={{ borderRadius:12, border:`2px dashed ${C.borderMid}`, background:C.bgSoft, padding:"32px 24px", textAlign:"center" }}>
        <div style={{ width:48, height:48, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 12px" }}>
          <Play size={20} color="#fff" />
        </div>
        <p style={{ fontSize:15, fontWeight:700, color:C.text, margin:"0 0 6px" }}>Interactive Simulation</p>
        <p style={{ fontSize:13, color:C.textSub, margin:"0 0 16px" }}>Apply what you've learned with a hands-on exercise.</p>
        <button
          onClick={() => setLaunched(true)}
          style={{ padding:"10px 24px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer" }}
        >
          Launch Simulation
        </button>
      </div>
    );
  }

  if (!Comp) {
    return (
      <div style={{ display:"flex", justifyContent:"center", padding:"32px 0" }}>
        <div style={{ width:36, height:36, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite" }} />
      </div>
    );
  }

  if (scenarioId !== null && scenarioId !== undefined) {
    return <Comp scenarioId={scenarioId} onComplete={onComplete} />;
  }
  return <Comp onComplete={onComplete} />;
}

// ─── Main section renderer ──────────────────────────────────────
function renderSection(section, { onContinue, lesson, misconceptions }) {
  switch (section.type) {
    case "hook":
    case "instruction":
    case "guided_practice":
      return (
        <div className="lesson-prose">
          <ReactMarkdown>{section.body || ""}</ReactMarkdown>
        </div>
      );

    case "check":
      return <InlineCheck section={section} onPass={onContinue} />;

    case "simulation":
      return (
        <SimulationEmbed
          component={section.component}
          scenarioId={section.scenario_id ?? null}
          onComplete={onContinue}
        />
      );

    case "misconception": {
      const entry = section.misconception_ref
        ? (misconceptions || []).find((m) => m.id === section.misconception_ref)
        : section;
      return (
        <MisconceptionCard
          myth={entry?.myth}
          reality={entry?.reality}
          onContinue={onContinue}
        />
      );
    }

    case "reflection":
      return <ReflectionCard prompt={section.prompt} onContinue={onContinue} />;

    default:
      // Unknown type — fall back to markdown body so future types don't break
      return (
        <div className="lesson-prose">
          <ReactMarkdown>{section.body || ""}</ReactMarkdown>
        </div>
      );
  }
}

// ─── Main component ─────────────────────────────────────────────
export default function Lesson() {
  const navigate    = useNavigate();
  const queryClient = useQueryClient();

  const [user,         setUser]         = useState(null);
  const [sectionIndex, setSectionIndex] = useState(0);
  const [showQuiz,     setShowQuiz]     = useState(false);
  const [quizAnswers,  setQuizAnswers]  = useState({});
  const [quizSubmitted,setQuizSubmitted]= useState(false);
  const [score,        setScore]        = useState(0);
  const [showLevelUp,  setShowLevelUp]  = useState(false);
  const [newLevel,     setNewLevel]     = useState(null);
  // Tracks which check/simulation/misconception/reflection sections have been
  // "passed" so Continue is only enabled after interaction
  const [passedSections, setPassedSections] = useState(new Set());

  const lessonId = useMemo(() => {
    const hash = window.location.hash;
    const qi = hash.indexOf("?");
    if (qi === -1) return null;
    return new URLSearchParams(hash.slice(qi + 1)).get("id");
  }, []);

  useEffect(() => {
    const currentUser = getLocalUser();
    if (!currentUser) { navigate(createPageUrl("Login")); return; }
    setUser(currentUser);
    if (!currentUser.onboarding_completed) navigate(createPageUrl("SchoolSelection"));
  }, [navigate]);

  const { completedChallenge, clearCompletedChallenge } = useChallengeCheck(user);

  const { data: lesson } = useQuery({
    queryKey: ["lesson", lessonId],
    queryFn: async () => {
      const lessons = await data.listLessons();
      return lessons.find((l) => String(l.id) === String(lessonId)) || null;
    },
    enabled: !!lessonId,
  });

  // Legacy special-page redirect — unchanged
  useEffect(() => {
    if (!lesson) return;
    const sp = detectSpecialLessonPage(lesson);
    if (sp) navigate(createPageUrl(sp), { replace: true });
  }, [lesson, navigate]);

  const { data: course } = useQuery({
    queryKey: ["course", lesson?.course_id],
    queryFn: async () => {
      const courses = await data.listCourses();
      return courses.find((c) => String(c.id) === String(lesson?.course_id)) || null;
    },
    enabled: !!lesson?.course_id,
  });

  const { data: allLessons = [] } = useQuery({
    queryKey: ["lessons", lesson?.course_id],
    queryFn: async () => {
      const lessons = await data.listLessons();
      return lessons
        .filter((l) => String(l.course_id) === String(lesson?.course_id))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    },
    enabled: !!lesson?.course_id,
  });

  const { data: progress, refetch: refetchProgress } = useQuery({
    queryKey: ["lessonProgress", user?.email, lessonId],
    queryFn: async () => {
      const list = await data.listUserProgress({ user_email: user?.email, lesson_id: lessonId });
      return list[0] || null;
    },
    enabled: !!user && !!lessonId,
  });

  const completeMutation = useMutation({
    mutationFn: async ({ quizScore }) => {
      if (!user?.email) throw new Error("Missing user");
      if (!lesson?.course_id) throw new Error("Missing lesson/course");
      if (!lessonId) throw new Error("Missing lessonId");
      const now = new Date().toISOString();
      const existing = progress;
      const record = existing
        ? { ...existing, completed: true, completed_date: now, quiz_score: quizScore }
        : { id: safeUUID() || `up_${Date.now()}`, user_email: user.email, lesson_id: lessonId, course_id: lesson.course_id, completed: true, completed_date: now, quiz_score: quizScore };
      await data.upsertUserProgress(record);
      trackEvent("lesson_completed", { lesson_id: lessonId, lesson_title: lesson.title, course_id: lesson.course_id, quiz_score: quizScore, xp_earned: Number(lesson.xp_reward || 0) }).catch(() => {});
      const xpReward = Number(lesson.xp_reward || 0);
      const newXP = (user.xp_points || 0) + xpReward;
      const calculatedLevel = Math.floor(newXP / 100) + 1;
      const updatedUser = { ...user, xp_points: newXP, level: calculatedLevel, total_lessons_completed: (user.total_lessons_completed || 0) + 1 };
      setLocalUser(updatedUser);
      setUser(updatedUser);
      if (calculatedLevel > (user.level || 1)) { setNewLevel(calculatedLevel); setShowLevelUp(true); }
      const today = now.split("T")[0];
      const acts = await data.getDailyActivity({ user_email: user.email, date: today });
      if (acts.length > 0) {
        await data.upsertDailyActivity({ ...acts[0], lessons_completed: (acts[0].lessons_completed || 0) + 1, xp_earned: (acts[0].xp_earned || 0) + xpReward });
      } else {
        await data.upsertDailyActivity({ id: safeUUID() || `da_${Date.now()}`, user_email: user.email, date: today, lessons_completed: 1, xp_earned: xpReward });
      }
    },
    onSuccess: () => {
      refetchProgress();
      queryClient.invalidateQueries({ queryKey: ["userProgress"] });
      queryClient.invalidateQueries({ queryKey: ["allUserProgress"] });
      queryClient.invalidateQueries({ queryKey: ["dailyActivity"] });
      queryClient.invalidateQueries({ queryKey: ["userChallenges"] });
      toast.success(`Lesson completed! +${lesson?.xp_reward || 0} XP`);
    },
    onError: (err) => {
      console.error(err);
      toast.error("Something went wrong saving your progress. Please try again.");
    },
  });

  // ── Quiz handlers (unchanged logic, updated field) ────────────
  // exit_ticket takes priority over quiz_questions for new lessons
  const terminalQuestions = useMemo(
    () => lesson?.exit_ticket ?? lesson?.quiz_questions ?? [],
    [lesson]
  );

  const handleQuizSubmit = () => {
    const total = terminalQuestions.length;
    if (!total) { toast.error("This lesson is missing a quiz."); return; }
    let correct = 0;
    terminalQuestions.forEach((q, i) => { if (quizAnswers[i] === q.correct_answer) correct++; });
    const quizScore = Math.round((correct / total) * 100);
    setScore(quizScore);
    setQuizSubmitted(true);
    if (quizScore === 100) completeMutation.mutate({ quizScore });
  };

  const handleRetakeQuiz = () => {
    setQuizAnswers({});
    setQuizSubmitted(false);
    setScore(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNext = () => {
    const idx = allLessons.findIndex((l) => String(l.id) === String(lessonId));
    if (idx === -1) { navigate(createPageUrl("Learn")); return; }
    if (idx === allLessons.length - 1) { navigate(createPageUrl(`FinalExam?courseId=${lesson.course_id}`)); return; }
    if (!progress?.completed) { toast.error("Complete this lesson first!"); return; }
    const next = allLessons[idx + 1];
    navigate(createPageUrl(`Lesson?id=${next.id}`));
    setSectionIndex(0);
    setShowQuiz(false);
    window.scrollTo(0, 0);
  };

  // ── Section navigation ────────────────────────────────────────
  const goToSection = useCallback((idx) => {
    setSectionIndex(idx);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const markSectionPassed = useCallback((sectionId) => {
    setPassedSections((prev) => new Set([...prev, sectionId]));
  }, []);

  // ── Early returns ─────────────────────────────────────────────
  if (!lessonId) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
        <div style={{ maxWidth:400, width:"100%", borderRadius:20, border:`1px solid ${C.border}`, padding:40, background:C.bg }}>
          <AlertCircle size={48} color="#F59E0B" style={{ margin:"0 auto 16px" }} />
          <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8 }}>Missing Lesson ID</h2>
          <p style={{ color:C.textSub, marginBottom:24 }}>This page needs a lesson id in the URL.</p>
          <button onClick={() => navigate(createPageUrl("Learn"))} style={{ padding:"10px 24px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>Back to Courses</button>
        </div>
      </div>
    );
  }

  if (!lesson || !course) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:64, height:64, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
          <p style={{ color:C.textSub }}>Loading lesson...</p>
        </div>
      </div>
    );
  }

  const specialPage = detectSpecialLessonPage(lesson);
  if (specialPage) {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ textAlign:"center" }}>
          <div style={{ width:64, height:64, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
          <p style={{ color:C.textSub }}>Loading interactive lesson...</p>
        </div>
      </div>
    );
  }

  // ── Compute sections ──────────────────────────────────────────
  const sections     = normalizeToSections(lesson);
  const totalSections = sections.length;
  const currentSection = sections[sectionIndex];
  const sectionType  = currentSection?.type ?? "instruction";

  // Sections that require interaction before Continue is enabled
  const GATED_TYPES = new Set(["check", "simulation", "misconception", "reflection"]);
  const isGated = GATED_TYPES.has(sectionType);
  const sectionKey = currentSection?.section_id ?? `legacy-${sectionIndex}`;
  const sectionPassed = passedSections.has(sectionKey);
  const canContinue = !isGated || sectionPassed;

  // Course progress (position in course, not within lesson)
  const courseIdx = allLessons.findIndex((l) => String(l.id) === String(lessonId));
  const progressPercent = allLessons.length ? ((courseIdx + 1) / allLessons.length) * 100 : 0;

  // Lesson image (unchanged logic)
  let lessonImage = lessonImages.piggybank;
  const t = (lesson.title || "").toLowerCase();
  if (t.includes("budget")) lessonImage = lessonImages.budget;
  if (t.includes("paycheck")) lessonImage = lessonImages.paycheck;
  if (t.includes("insurance")) lessonImage = lessonImages.insurance;
  if (t.includes("ai") || t.includes("artificial") || t.includes("prompt")) lessonImage = lessonImages.ai;
  if (t.includes("machine") || t.includes("neural")) lessonImage = lessonImages.ml;
  if (t.includes("invest")) lessonImage = lessonImages.investing;
  if (t.includes("credit") || t.includes("debt")) lessonImage = lessonImages.credit;
  if (t.includes("career")) lessonImage = lessonImages.career;

  const hasLessonContent = hasSubstantialContent(lesson.content) || sections.some((s) => s.body?.length > 50);

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        .lesson-prose h1{font-size:26px;font-weight:800;margin-bottom:12px;color:${C.text}}
        .lesson-prose h2{font-size:21px;font-weight:800;margin:24px 0 10px;color:${C.text}}
        .lesson-prose h3{font-size:17px;font-weight:700;margin:18px 0 8px;color:${C.text}}
        .lesson-prose p{font-size:16px;line-height:1.75;color:${C.textSub};margin-bottom:14px}
        .lesson-prose ul,.lesson-prose ol{padding-left:22px;margin-bottom:14px}
        .lesson-prose li{font-size:15px;line-height:1.7;color:${C.textSub};margin-bottom:6px}
        .lesson-prose strong{color:${C.text};font-weight:700}
        .lesson-prose code{background:${C.bgMid};padding:2px 6px;border-radius:4px;font-size:13px}
        .lesson-prose blockquote{border-left:4px solid ${C.navy};padding:12px 16px;background:${C.accentSoft};border-radius:0 8px 8px 0;margin:16px 0}
      `}</style>

      {showLevelUp && newLevel && <LevelUpModal level={newLevel} onClose={() => setShowLevelUp(false)} />}
      {completedChallenge && <ChallengeCompleteModal challenge={completedChallenge} onClose={clearCompletedChallenge} />}

      <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
        <div style={{ maxWidth:800, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 }}>

          {/* ── Header row (unchanged) ── */}
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
            <button
              onClick={() => navigate(createPageUrl(`CourseDetail?id=${lesson.course_id}`))}
              style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer" }}
            >
              <ArrowLeft size={16} />Back to Course
            </button>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <span style={{ fontSize:12, fontWeight:700, color:C.accent, background:C.accentSoft, padding:"4px 12px", borderRadius:999 }}>
                Lesson {Math.max(courseIdx, 0) + 1} of {allLessons.length || 1}
              </span>
              {progress?.completed && (
                <span style={{ fontSize:12, fontWeight:700, color:C.green, background:C.greenSoft, padding:"4px 12px", borderRadius:999, display:"inline-flex", alignItems:"center", gap:4 }}>
                  <CheckCircle size={12} />Completed
                </span>
              )}
            </div>
          </div>

          {/* ── Course progress bar (unchanged) ── */}
          <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:16, padding:"16px 24px", color:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:600 }}>
              <Target size={16} />{course.name}
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700 }}>
              <Trophy size={16} />{Math.round(progressPercent)}%
            </div>
          </div>

          {/* ── Lesson content / quiz ── */}
          {!showQuiz ? (
            <div style={{ borderRadius:20, border:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(0,0,0,0.05)", background:C.bg, overflow:"hidden" }}>

              {/* Hero image — shown on section 0 only (unchanged) */}
              {sectionIndex === 0 && (
                <div style={{ height:220, overflow:"hidden", position:"relative" }}>
                  <img src={lessonImage} alt={lesson.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.65),transparent)" }} />
                  <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:24, color:"#fff" }}>
                    <span style={{ display:"inline-block", fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.2)", backdropFilter:"blur(4px)", padding:"3px 10px", borderRadius:999, marginBottom:8, border:"1px solid rgba(255,255,255,0.3)" }}>
                      {course.category}
                    </span>
                    <h1 style={{ fontSize:26, fontWeight:900, margin:0, letterSpacing:"-0.5px" }}>{lesson.title}</h1>
                  </div>
                </div>
              )}

              <div style={{ padding:"32px 40px" }}>

                {/* Metadata row — shown on section 0 only (unchanged) */}
                {sectionIndex === 0 && (
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, paddingBottom:20, borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:16 }}>
                    {[
                      [Clock,   `${lesson.duration_minutes} min`, C.textSub],
                      [Zap,     `${lesson.xp_reward} XP`,         C.amber],
                      [Star,    "Quiz Required",                   C.accent],
                    ].map(([Icon, text, color]) => (
                      <div key={text} style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, fontWeight:600, color }}>
                        <Icon size={16} />{text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Objectives + Vocabulary — section 0 only, collapsible */}
                {sectionIndex === 0 && (
                  <>
                    <ObjectivesPanel objectives={lesson.objectives} />
                    <VocabularyPanel vocabulary={lesson.vocabulary} />
                  </>
                )}

                {!hasLessonContent ? (
                  <div style={{ textAlign:"center", padding:"48px 0" }}>
                    <AlertCircle size={56} color={C.amber} style={{ margin:"0 auto 16px" }} />
                    <h3 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:10 }}>Incomplete Lesson Content</h3>
                    <p style={{ color:C.textSub, marginBottom:8, maxWidth:400, margin:"0 auto 8px" }}>This lesson doesn't have proper content yet.</p>
                    <div style={{ background:C.bgMid, padding:16, borderRadius:12, maxWidth:400, margin:"0 auto 16px" }}>
                      <p style={{ fontSize:13, color:C.textSub, fontStyle:"italic", margin:0 }}>"{lesson.content}"</p>
                    </div>
                    <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                      <button onClick={() => navigate(createPageUrl(`CourseDetail?id=${lesson.course_id}`))} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontWeight:600, cursor:"pointer", fontSize:14 }}>
                        <ArrowLeft size={14} />Back to Course
                      </button>
                      <button onClick={() => navigate(createPageUrl("Learn"))} style={{ padding:"10px 20px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontSize:14 }}>
                        Browse All Courses
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Section progress bar */}
                    <div style={{ marginBottom:24 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, marginBottom:8 }}>
                        <span style={{ color:C.textSub }}>
                          {SECTION_LABELS[sectionType] || "Section"} {sectionIndex + 1} of {totalSections}
                        </span>
                        <span style={{ color:C.accent }}>{Math.round(((sectionIndex + 1) / totalSections) * 100)}%</span>
                      </div>
                      <div style={{ height:6, borderRadius:999, background:C.bgMid, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${((sectionIndex + 1) / totalSections) * 100}%`, borderRadius:999, background:C.accent, transition:"width 0.3s" }} />
                      </div>
                    </div>

                    {/* Section content — type switch */}
                    <div style={{ marginBottom:32 }}>
                      {renderSection(currentSection, {
                        // onContinue: used by gated types (check, simulation, misconception, reflection)
                        // Each section renders its own forward button; this handler marks + advances.
                        onContinue: () => {
                          markSectionPassed(sectionKey);
                          if (sectionIndex < totalSections - 1) goToSection(sectionIndex + 1);
                          else if (terminalQuestions.length > 0) { setShowQuiz(true); window.scrollTo(0, 0); }
                          else completeMutation.mutate({ quizScore: 100 });
                        },
                        lesson,
                        misconceptions: lesson.misconceptions,
                      })}
                    </div>

                    {/* Nav buttons — Previous always available; Continue only for non-gated types.
                        Gated types (check / simulation / misconception / reflection) own their
                        forward button internally — no shell Continue rendered for them. */}
                    <div style={{ display:"flex", justifyContent:"space-between", gap:12, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
                      {sectionIndex > 0 && (
                        <button
                          onClick={() => goToSection(sectionIndex - 1)}
                          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontWeight:600, fontSize:14, cursor:"pointer" }}
                        >
                          <ArrowLeft size={16} />Previous
                        </button>
                      )}

                      {/* Shell Continue is shown ONLY for non-gated types (hook, instruction, guided_practice).
                          All gated types handle their own forward action. */}
                      {!isGated && (
                        sectionIndex < totalSections - 1 ? (
                          <button
                            onClick={() => goToSection(sectionIndex + 1)}
                            style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}
                          >
                            Continue <ArrowRight size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => {
                              if (!terminalQuestions.length) { toast.error("This lesson is missing a quiz."); return; }
                              setShowQuiz(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}
                          >
                            <Sparkles size={16} />Take Quiz
                          </button>
                        )
                      )}

                      {/* REMOVED: the old "check + sectionPassed" shell Continue block that caused
                          a duplicate button alongside the check component's own ContinueBtn.
                          Checks now route onPass → onContinue directly (mark + advance). */}
                      {false && sectionType === "check" && sectionPassed && (
                        sectionIndex < totalSections - 1 ? (
                          <button onClick={() => goToSection(sectionIndex + 1)} style={{ display:"none" }}>
                            Continue <ArrowRight size={16} />
                          </button>
                        ) : (
                          <button onClick={() => {
                              if (!terminalQuestions.length) { toast.error("This lesson is missing a quiz."); return; }
                              setShowQuiz(true);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}
                          >
                            <Sparkles size={16} />Take Quiz
                          </button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

          ) : (
            /* ── Terminal quiz (exit_ticket or quiz_questions) ── */
            <div style={{ borderRadius:20, border:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(0,0,0,0.05)", background:C.bg, overflow:"hidden" }}>
              <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, padding:"32px 40px", color:"#fff" }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                  <div>
                    <h2 style={{ fontSize:26, fontWeight:900, margin:"0 0 6px", display:"flex", alignItems:"center", gap:10 }}>
                      <Sparkles size={26} />Knowledge Challenge
                    </h2>
                    <p style={{ opacity:0.85, margin:0, fontSize:14 }}>You must score 100% to advance!</p>
                  </div>
                  <div style={{ textAlign:"center", background:"rgba(255,255,255,0.15)", backdropFilter:"blur(4px)", borderRadius:16, padding:"12px 20px" }}>
                    <Trophy size={28} style={{ margin:"0 auto 4px" }} />
                    <p style={{ fontSize:20, fontWeight:900, margin:0 }}>{lesson.xp_reward} XP</p>
                  </div>
                </div>
              </div>

              <div style={{ padding:"28px 40px", display:"flex", flexDirection:"column", gap:20 }}>
                {terminalQuestions.map((question, qIndex) => (
                  <div key={qIndex} style={{ borderRadius:16, border:`2px solid ${C.border}`, overflow:"hidden" }}>
                    <div style={{ background:C.bgSoft, borderBottom:`1px solid ${C.border}`, padding:"16px 20px", display:"flex", alignItems:"flex-start", gap:16 }}>
                      <div style={{ width:44, height:44, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff", fontWeight:800, fontSize:16 }}>
                        {qIndex + 1}
                      </div>
                      <p style={{ fontWeight:700, fontSize:17, color:C.text, margin:0, paddingTop:8 }}>{question.question}</p>
                    </div>
                    <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
                      {(question.options || []).map((option, oIndex) => {
                        const isSelected = quizAnswers[qIndex] === oIndex;
                        const isCorrect  = question.correct_answer === oIndex;
                        let bg = C.bg, border2 = C.borderMid, color = C.text;
                        if (quizSubmitted) {
                          if (isCorrect) { bg = C.green; border2 = C.green; color = "#fff"; }
                          else if (isSelected) { bg = C.red; border2 = C.red; color = "#fff"; }
                          else { bg = C.bgMid; border2 = C.border; color = C.textMuted; }
                        } else if (isSelected) { bg = C.navy; border2 = C.navy; color = "#fff"; }
                        return (
                          <button
                            key={oIndex}
                            onClick={() => { if (!quizSubmitted) setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex }); }}
                            disabled={quizSubmitted}
                            style={{ width:"100%", padding:"14px 18px", borderRadius:12, textAlign:"left", fontWeight:600, fontSize:15, background:bg, border:`2px solid ${border2}`, color, cursor:quizSubmitted ? "default" : "pointer", transition:"all 0.15s" }}
                          >
                            {option}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}

                {!quizSubmitted ? (
                  <button
                    onClick={handleQuizSubmit}
                    disabled={Object.keys(quizAnswers).length !== terminalQuestions.length}
                    style={{ width:"100%", padding:"16px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:800, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:`0 4px 20px ${C.navyGlow}`, opacity:Object.keys(quizAnswers).length !== terminalQuestions.length ? 0.5 : 1 }}
                  >
                    <Trophy size={20} />Submit Answers
                  </button>
                ) : (
                  <div style={{ borderRadius:20, padding:"40px 32px", textAlign:"center", background:score === 100 ? `linear-gradient(135deg,${C.navy},${C.navyLight})` : `linear-gradient(135deg,#C0392B,#E74C3C)`, color:"#fff" }}>
                    <h3 style={{ fontSize:32, fontWeight:900, margin:"0 0 8px" }}>{score === 100 ? "Perfect!" : "Try again"}</h3>
                    <p style={{ fontSize:56, fontWeight:900, margin:"0 0 20px" }}>{score}%</p>
                    {score === 100 ? (
                      <button onClick={handleNext} style={{ padding:"14px 36px", borderRadius:999, background:"#fff", color:C.navy, border:"none", fontWeight:800, fontSize:16, cursor:"pointer" }}>
                        Next <ArrowRight size={16} style={{ display:"inline", marginLeft:6 }} />
                      </button>
                    ) : (
                      <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
                        <button
                          onClick={() => { setShowQuiz(false); setSectionIndex(0); window.scrollTo(0, 0); }}
                          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.5)", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:14 }}
                        >
                          <BookOpen size={16} />Review Lesson
                        </button>
                        <button
                          onClick={handleRetakeQuiz}
                          style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background:"#fff", color:"#C0392B", border:"none", fontWeight:700, cursor:"pointer", fontSize:14 }}
                        >
                          <TrendingUp size={16} />Retake Quiz
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
