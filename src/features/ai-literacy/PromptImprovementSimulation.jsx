import React, { useState } from "react";

const C = {
  navy: "#1B2B5E",
  navyMid: "#141E43",
  navyGlow: "rgba(27,43,94,0.12)",
  green: "#059669",
  greenBg: "#ECFDF5",
  greenBorder: "#A7F3D0",
  red: "#DC2626",
  redBg: "#FEF2F2",
  redBorder: "#FECACA",
  amber: "#B45309",
  amberBg: "#FFFBEB",
  amberBorder: "#FDE68A",
  purple: "#7C3AED",
  purpleBg: "#F5F3FF",
  purpleBorder: "#DDD6FE",
  border: "#E5E7EB",
  borderMid: "#D1D5DB",
  bg: "#FFFFFF",
  bgSoft: "#F8FAFC",
  text: "#0F172A",
  textSub: "#475569",
  textMuted: "#94A3B8",
};

// ─── Criteria evaluation ─────────────────────────────────────────────────────

const CONTEXT_SIGNALS = [
  /\bI'?m\b/i, /\bmy\b/i, /\bstudent\b/i, /\bgrade\b/i, /\bclass\b/i,
  /\bcourse\b/i, /\bbeginne?r\b/i, /\bexam\b/i, /\btest\b/i, /\bproject\b/i,
  /\bassignment\b/i, /\b(for|about)\s+\w+\s+class\b/i, /\bpreparing\b/i,
  /\bworking on\b/i, /\bsubject\b/i, /\bteacher\b/i, /\bschool\b/i,
];
const TASK_SIGNALS = [
  /\bcreate\b/i, /\bwrite\b/i, /\bexplain\b/i, /\bsummariz/i, /\blist\b/i,
  /\bcompare\b/i, /\bgive me\b/i, /\bshow me\b/i, /\bmake\b/i, /\bbuild\b/i,
  /\bgenerate\b/i, /\bhelp me (write|create|build|make|draft|plan|understand|learn|study)\b/i,
  /\bprovide\b/i, /\boutline\b/i, /\bdraft\b/i, /\bteach\b/i, /\bbreakdown\b/i,
  /\bstep.by.step\b/i, /\bpractice questions?\b/i, /\bstudy guide\b/i,
];
const CONSTRAINT_SIGNALS = [
  /\bword(s)?\b/i, /\bshort\b/i, /\bbrief\b/i, /\bconcise\b/i,
  /\bonly\b/i, /\bavoid\b/i, /\bno jargon\b/i, /\bsimple\b/i,
  /\bmax(imum)?\b/i, /\blimit\b/i, /\bformal\b/i, /\bcasual\b/i,
  /\btone\b/i, /\bdo not include\b/i, /\bdon'?t include\b/i,
  /\bfocus (on|only)\b/i, /\bunder \d+\b/i, /\b\d+ words?\b/i,
  /\bno more than\b/i, /\bat least\b/i, /\bkeep it\b/i,
];
const FORMAT_SIGNALS = [
  /\bbullet(s|ed)?\b/i, /\blist\b/i, /\btable\b/i, /\bparagraph\b/i,
  /\bheader(s)?\b/i, /\bnumber(ed)?\b/i, /\bformat\b/i, /\bchart\b/i,
  /\boutline\b/i, /\bstep.by.step\b/i, /\bsection(s)?\b/i,
  /\bcolumn(s)?\b/i, /\brow(s)?\b/i, /\bpros and cons\b/i, /\bq(&|and)a\b/i,
  /\bflashcard(s)?\b/i, /\bstructure(d)?\b/i, /\bsub.?heading(s)?\b/i,
];

function scorePrompt(text, criteria) {
  const results = {};
  if (criteria.includes("context"))
    results.context = CONTEXT_SIGNALS.some((r) => r.test(text));
  if (criteria.includes("task"))
    results.task = TASK_SIGNALS.some((r) => r.test(text));
  if (criteria.includes("constraints"))
    results.constraints = CONSTRAINT_SIGNALS.some((r) => r.test(text));
  if (criteria.includes("format"))
    results.format = FORMAT_SIGNALS.some((r) => r.test(text));
  return results;
}

// ─── Round data ──────────────────────────────────────────────────────────────

const ROUNDS = [
  {
    id: 1,
    badge: "Round 1 of 3",
    title: "Give It Something to Work With",
    instruction:
      "The prompt below produced a useless response because it gave the AI nothing to work with. Rewrite it to include (1) context — who you are and what situation you're in, and (2) a specific task — exactly what you want the AI to produce.",
    weakPrompt: "Help me study",
    weakOutput:
      "Sure! Studying can be tough. Here are some general tips: try making flashcards, reread your notes, do practice problems, study in short bursts with breaks, and make sure to get enough sleep. Let me know if you need more help!",
    improvedOutput:
      "**Personalized Study Guide — AP Biology: Cell Division**\n\n**Key Concepts to Know:**\n- **Mitosis** — cell division for growth/repair; produces 2 identical diploid cells\n- **Meiosis** — division for reproduction; produces 4 genetically unique haploid cells\n- **Checkpoint Mechanisms** — G1, S, G2/M checkpoints prevent uncontrolled growth\n- **Cytokinesis** — physical splitting of cytoplasm following nuclear division\n\n**Most Common Exam Mistakes:**\n- Mixing up mitosis and meiosis stage names (prophase I vs. regular prophase)\n- Forgetting that meiosis II is essentially identical to mitosis\n- Confusing haploid (n) vs. diploid (2n) cell counts\n\n**3 Short-Answer Practice Questions:**\n1. A cell has 46 chromosomes before meiosis begins. How many chromosomes will each daughter cell have after meiosis II?\n2. What would happen if the G1 checkpoint failed to detect DNA damage?\n3. Compare crossing over in meiosis to what happens in mitosis.",
    criteria: ["context", "task"],
    criteriaHints: {
      context: "Who are you? What are you studying? When is your exam?",
      task: "What specifically do you want — a study guide, practice questions, a review schedule?",
    },
    feedbackOnPass:
      "Nice — that's a real prompt. With context, the AI knew the subject, your level, and the deadline. With a clear task, it produced something actually useful instead of generic advice.",
    minLength: 30,
  },
  {
    id: 2,
    badge: "Round 2 of 3",
    title: "Add Constraints and Format",
    instruction:
      "This prompt has context and a task — but the output it gets is generic and hard to use. Rewrite it with all four parts: context, task, constraints (limits on length, tone, scope), and output format (how it should be structured).",
    weakPrompt:
      "I'm a 10th grade student writing a persuasive essay on social media and teen mental health for English class. Help me write an introduction.",
    weakOutput:
      "Social media has become a major part of modern life. Millions of people use platforms like Instagram, TikTok, and Twitter every day. While these platforms help us stay connected, research shows they can have serious negative effects on mental health — especially for teenagers. Studies link heavy social media use to higher rates of anxiety, depression, and loneliness among young people. This essay will argue that social media companies have a responsibility to protect their users' mental wellbeing.\n\n*(Let me know if you'd like a different angle or style!)*",
    improvedOutput:
      "**Opening Hook (grab attention immediately):**\nIn 2023, U.S. Surgeon General Vivek Murthy issued an unprecedented public advisory calling social media \"a profound risk\" to teen mental health — a warning backed by longitudinal studies linking excessive platform use to increased rates of anxiety, depression, and self-harm in adolescents.\n\n**Bridge (connect hook to your argument):**\nFor Generation Z, social media is not optional — it is the primary infrastructure of social life, identity, and communication. This makes its psychological effects uniquely difficult to escape, and uniquely urgent to address.\n\n**Thesis (your arguable claim):**\nWhile social media companies profit from maximizing engagement at any cost, their algorithmic designs exploit psychological vulnerabilities in ways that measurably harm teenage mental health — making stronger platform accountability not just warranted, but overdue.\n\n*(~120 words. Designed to open with a credible, provocative hook that immediately establishes the stakes of your argument.)*",
    criteria: ["context", "task", "constraints", "format"],
    criteriaHints: {
      context: "Who you are, what class, what purpose",
      task: "Specific deliverable — write the introduction for X",
      constraints: "Word count, tone, argument angle, what to include",
      format: "Structure of the intro — e.g., hook + bridge + thesis",
    },
    feedbackOnPass:
      "That's the full framework. With constraints, the AI knew the length and tone. With a format, it produced a structured intro you can actually use — not just a paragraph that sounds like everyone else's.",
    minLength: 60,
  },
];

const ROUND_3 = {
  id: 3,
  badge: "Round 3 of 3",
  title: "Trust, But Verify",
  instruction:
    "Below is a well-structured prompt and a detailed AI response. The math is correct, the explanation is clear — but one claim in this response is not verifiable and is likely fabricated. Read it carefully. What will you do?",
  prompt:
    "I'm a 9th grader learning about personal finance. Explain the Rule of 72 in simple terms — what it is, how to use it, and give me a concrete example with a $1,000 investment at 8% annual return. Keep it under 150 words.",
  output:
    "**The Rule of 72** is a quick mental math shortcut for estimating how long it takes an investment to double.\n\n**How to use it:** Divide 72 by your annual interest rate. The answer is approximately how many years it takes to double your money.\n\n**Example:**\nInvest $1,000 at 8% annual return.\n72 ÷ 8 = **9 years**\nYour $1,000 becomes roughly $2,000 in 9 years — and $4,000 by year 18.\n\n**The bottom line:** Start early. Small amounts grow dramatically over time.\n\n*Note: Albert Einstein reportedly called compound interest \"the eighth wonder of the world,\" saying those who understand it earn it, and those who don't, pay it.*",
  errorHint:
    "The math is correct. The explanation is clear. But look at the last sentence carefully.",
  acceptConsequence:
    "You submitted the response — Einstein quote and all. Your teacher flagged it: there is no credible historical evidence Albert Einstein ever said this. It's one of the most widely repeated financial misattributions on the internet, and AI systems repeat it with complete confidence. The Rule of 72 and the math were accurate. But the quote was almost certainly invented. One unverified claim in a well-written response can undermine the whole thing.",
  verifyReward:
    "Good instinct. That Einstein quote is one of the most widely circulated financial misattributions on the internet — there is no credible historical evidence he ever said it. The Rule of 72 and the math are completely correct. But the attribution is almost certainly fabricated. You caught exactly what verification is for: specific claims, quotes, and attributions that sound right but can't be confirmed. That's the habit that separates careful AI users from ones who get burned.",
  errorExplanation:
    'The fabricated claim: the Einstein "eighth wonder of the world" quote. No credible historical source confirms he ever said this. AI models repeat it because it appears frequently in training data — not because it\'s true. The rest of the response is accurate.',
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function RoundBadge({ text }) {
  return (
    <span style={{
      display: "inline-block", padding: "3px 10px", borderRadius: 999,
      background: C.purpleBg, color: C.purple, fontSize: 11, fontWeight: 700,
      border: `1px solid ${C.purpleBorder}`, letterSpacing: "0.04em", marginBottom: 10,
    }}>
      {text}
    </span>
  );
}

function PromptBox({ label, text, dim }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <div style={{
        background: dim ? C.bgSoft : "#fff", border: `1px solid ${C.border}`,
        borderRadius: 10, padding: "12px 14px", fontSize: 14, color: dim ? C.textSub : C.text,
        lineHeight: 1.6, fontFamily: "inherit", opacity: dim ? 0.75 : 1,
      }}>
        {text}
      </div>
    </div>
  );
}

function OutputBox({ label, text, highlight }) {
  const lines = text.split("\n");
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>{label}</div>
      <div style={{
        background: highlight ? C.greenBg : C.bgSoft,
        border: `1px solid ${highlight ? C.greenBorder : C.border}`,
        borderRadius: 10, padding: "12px 14px", fontSize: 13.5,
        color: C.text, lineHeight: 1.7, fontFamily: "inherit",
      }}>
        {lines.map((line, i) => {
          const bold = line.replace(/\*\*(.+?)\*\*/g, (_, m) => `<strong>${m}</strong>`);
          return <p key={i} style={{ margin: "0 0 4px" }} dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />;
        })}
      </div>
    </div>
  );
}

function CriteriaTag({ label, passed, hint }) {
  return (
    <div style={{
      display: "flex", alignItems: "flex-start", gap: 8,
      padding: "8px 10px", borderRadius: 8,
      background: passed ? C.greenBg : C.redBg,
      border: `1px solid ${passed ? C.greenBorder : C.redBorder}`,
      marginBottom: 6,
    }}>
      <span style={{ fontSize: 14, lineHeight: 1, marginTop: 1 }}>{passed ? "✓" : "✗"}</span>
      <div>
        <span style={{ fontSize: 13, fontWeight: 700, color: passed ? C.green : C.red }}>{label}</span>
        {!passed && <p style={{ margin: "2px 0 0", fontSize: 12, color: C.textSub, lineHeight: 1.4 }}>{hint}</p>}
      </div>
    </div>
  );
}

function ProgressDots({ current }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", justifyContent: "center", marginBottom: 24 }}>
      {[1, 2, 3].map((n) => (
        <div key={n} style={{
          width: n < current ? 8 : n === current ? 10 : 8,
          height: n < current ? 8 : n === current ? 10 : 8,
          borderRadius: "50%",
          background: n < current ? C.green : n === current ? C.navy : C.borderMid,
          transition: "all 0.2s",
        }} />
      ))}
    </div>
  );
}

// ─── Round 1 & 2 ────────────────────────────────────────────────────────────

function EvaluationRound({ round, onNext }) {
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState("input"); // input | feedback | improved
  const [scores, setScores] = useState(null);

  const allPassed = scores && round.criteria.every((c) => scores[c]);
  const tooShort = input.trim().length < round.minLength;

  const handleEvaluate = () => {
    const result = scorePrompt(input, round.criteria);
    setScores(result);
    setPhase("feedback");
  };

  const handleRetry = () => {
    setScores(null);
    setPhase("input");
  };

  return (
    <div>
      <RoundBadge text={round.badge} />
      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 6px", letterSpacing: "-0.3px" }}>
        {round.title}
      </h2>
      <p style={{ fontSize: 14, color: C.textSub, margin: "0 0 20px", lineHeight: 1.6 }}>
        {round.instruction}
      </p>

      <PromptBox label="Weak Prompt" text={round.weakPrompt} dim />
      <OutputBox label="AI Output (weak)" text={round.weakOutput} />

      <div style={{ height: 1, background: C.border, margin: "20px 0" }} />

      {phase === "input" && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 5 }}>
            Your Improved Prompt
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Rewrite the prompt with ${round.criteria.join(", ")}...`}
            style={{
              width: "100%", boxSizing: "border-box", minHeight: 100,
              padding: "12px 14px", borderRadius: 10,
              border: `1.5px solid ${input.length > 20 ? C.navy : C.border}`,
              fontSize: 14, color: C.text, lineHeight: 1.6, fontFamily: "inherit",
              resize: "vertical", outline: "none", transition: "border-color 0.15s",
              background: "#fff",
            }}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button
              onClick={handleEvaluate}
              disabled={tooShort}
              style={{
                padding: "10px 22px", borderRadius: 999,
                background: tooShort ? C.borderMid : C.navy,
                color: tooShort ? C.textMuted : "#fff",
                border: "none", fontWeight: 700, fontSize: 14,
                cursor: tooShort ? "not-allowed" : "pointer",
                transition: "all 0.15s",
              }}
            >
              Evaluate Prompt
            </button>
          </div>
        </>
      )}

      {phase === "feedback" && (
        <>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 8 }}>
            Your Prompt
          </div>
          <div style={{
            background: "#fff", border: `1.5px solid ${allPassed ? C.greenBorder : C.amberBorder}`,
            borderRadius: 10, padding: "12px 14px", fontSize: 14, color: C.text,
            lineHeight: 1.6, marginBottom: 14,
          }}>
            {input}
          </div>

          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: C.textSub, marginBottom: 8 }}>
              Criteria Check
            </div>
            {round.criteria.map((c) => (
              <CriteriaTag
                key={c}
                label={round.criteriaHints[c] ? c.charAt(0).toUpperCase() + c.slice(1) : c}
                passed={scores[c]}
                hint={round.criteriaHints[c]}
              />
            ))}
          </div>

          {allPassed ? (
            <>
              <div style={{
                background: C.greenBg, border: `1px solid ${C.greenBorder}`,
                borderRadius: 10, padding: "12px 14px", fontSize: 14,
                color: C.green, lineHeight: 1.6, marginBottom: 16, fontWeight: 500,
              }}>
                {round.feedbackOnPass}
              </div>
              <button
                onClick={() => setPhase("improved")}
                style={{
                  width: "100%", padding: "11px 0", borderRadius: 999,
                  background: C.green, color: "#fff", border: "none",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
              >
                See the improved output →
              </button>
            </>
          ) : (
            <>
              <div style={{
                background: C.amberBg, border: `1px solid ${C.amberBorder}`,
                borderRadius: 10, padding: "12px 14px", fontSize: 14,
                color: C.amber, lineHeight: 1.6, marginBottom: 16,
              }}>
                You're missing {round.criteria.filter((c) => !scores[c]).join(" and ")}. Look at the hints above and revise your prompt.
              </div>
              <button
                onClick={handleRetry}
                style={{
                  width: "100%", padding: "11px 0", borderRadius: 999,
                  background: C.navy, color: "#fff", border: "none",
                  fontWeight: 700, fontSize: 14, cursor: "pointer",
                }}
              >
                Revise and try again
              </button>
            </>
          )}
        </>
      )}

      {phase === "improved" && (
        <>
          <OutputBox
            label="AI Output — with your improved prompt"
            text={typeof round.improvedOutput === "function" ? round.improvedOutput(input) : round.improvedOutput}
            highlight
          />
          <button
            onClick={onNext}
            style={{
              width: "100%", padding: "11px 0", marginTop: 8, borderRadius: 999,
              background: C.navy, color: "#fff", border: "none",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Continue to {round.id < 2 ? "Round " + (round.id + 1) : "Final Round"} →
          </button>
        </>
      )}
    </div>
  );
}

// ─── Round 3 ─────────────────────────────────────────────────────────────────

function VerificationRound({ onComplete }) {
  const [choice, setChoice] = useState(null); // null | "accept" | "verify"

  return (
    <div>
      <RoundBadge text={ROUND_3.badge} />
      <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, margin: "0 0 6px", letterSpacing: "-0.3px" }}>
        {ROUND_3.title}
      </h2>
      <p style={{ fontSize: 14, color: C.textSub, margin: "0 0 20px", lineHeight: 1.6 }}>
        {ROUND_3.instruction}
      </p>

      <PromptBox label="The Prompt (well-structured)" text={ROUND_3.prompt} />
      <OutputBox label="AI Output" text={ROUND_3.output} />

      <div style={{
        background: C.amberBg, border: `1px solid ${C.amberBorder}`,
        borderRadius: 10, padding: "10px 14px", marginBottom: 20,
        fontSize: 13, color: C.amber, lineHeight: 1.5,
      }}>
        <strong>Hint:</strong> {ROUND_3.errorHint}
      </div>

      {!choice && (
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={() => setChoice("accept")}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 999,
              background: C.bgSoft, color: C.text,
              border: `1.5px solid ${C.border}`, fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Accept the output as accurate
          </button>
          <button
            onClick={() => setChoice("verify")}
            style={{
              flex: 1, padding: "11px 0", borderRadius: 999,
              background: C.navy, color: "#fff",
              border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Flag it — verify before using
          </button>
        </div>
      )}

      {choice === "accept" && (
        <>
          <div style={{
            background: C.redBg, border: `1px solid ${C.redBorder}`,
            borderRadius: 10, padding: "14px 16px", marginBottom: 16,
            fontSize: 14, color: C.red, lineHeight: 1.65,
          }}>
            <strong style={{ display: "block", marginBottom: 4 }}>Not quite.</strong>
            {ROUND_3.acceptConsequence}
          </div>
          <div style={{
            background: C.bgSoft, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "12px 14px", marginBottom: 16,
            fontSize: 13, color: C.textSub, lineHeight: 1.6,
          }}>
            <strong style={{ color: C.text }}>What went wrong: </strong>{ROUND_3.errorExplanation}
          </div>
          <button
            onClick={onComplete}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 999,
              background: C.navy, color: "#fff", border: "none",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Finish simulation
          </button>
        </>
      )}

      {choice === "verify" && (
        <>
          <div style={{
            background: C.greenBg, border: `1px solid ${C.greenBorder}`,
            borderRadius: 10, padding: "14px 16px", marginBottom: 16,
            fontSize: 14, color: C.green, lineHeight: 1.65,
          }}>
            <strong style={{ display: "block", marginBottom: 4 }}>Correct instinct.</strong>
            {ROUND_3.verifyReward}
          </div>
          <div style={{
            background: C.bgSoft, border: `1px solid ${C.border}`,
            borderRadius: 10, padding: "12px 14px", marginBottom: 16,
            fontSize: 13, color: C.textSub, lineHeight: 1.6,
          }}>
            <strong style={{ color: C.text }}>The error: </strong>{ROUND_3.errorExplanation}
          </div>
          <button
            onClick={onComplete}
            style={{
              width: "100%", padding: "11px 0", borderRadius: 999,
              background: C.green, color: "#fff", border: "none",
              fontWeight: 700, fontSize: 14, cursor: "pointer",
            }}
          >
            Complete simulation →
          </button>
        </>
      )}
    </div>
  );
}

// ─── Completion screen ───────────────────────────────────────────────────────

function CompletionScreen({ onComplete }) {
  return (
    <div style={{ textAlign: "center", padding: "24px 0" }}>
      <div style={{
        width: 64, height: 64, borderRadius: "50%",
        background: C.greenBg, border: `2px solid ${C.greenBorder}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        margin: "0 auto 16px", fontSize: 28,
      }}>
        ✓
      </div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, margin: "0 0 8px", letterSpacing: "-0.3px" }}>
        Lab Complete
      </h2>
      <p style={{ fontSize: 15, color: C.textSub, maxWidth: 380, margin: "0 auto 24px", lineHeight: 1.6 }}>
        You rewrote two weak prompts using the full four-part framework, and caught a hallucinated claim in a confident AI response.
      </p>
      <div style={{
        display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
        gap: 10, maxWidth: 400, margin: "0 auto 24px",
      }}>
        {["Context + Task", "Constraints + Format", "Verification"].map((label, i) => (
          <div key={i} style={{
            padding: "10px 8px", borderRadius: 10,
            background: C.greenBg, border: `1px solid ${C.greenBorder}`,
            fontSize: 12, fontWeight: 600, color: C.green, textAlign: "center",
          }}>
            {label}
          </div>
        ))}
      </div>
      <button
        onClick={onComplete}
        style={{
          padding: "12px 32px", borderRadius: 999,
          background: C.navy, color: "#fff", border: "none",
          fontWeight: 700, fontSize: 15, cursor: "pointer",
          boxShadow: `0 4px 16px ${C.navyGlow}`,
        }}
      >
        Continue lesson →
      </button>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

export default function PromptImprovementSimulation({ onComplete }) {
  const [round, setRound] = useState(1); // 1 | 2 | 3 | "complete"

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif",
      background: C.bg, border: `1.5px solid ${C.border}`, borderRadius: 16,
      padding: "28px 28px 24px", maxWidth: 720,
    }}>
      <ProgressDots current={round === "complete" ? 4 : round} />

      {round === 1 && (
        <EvaluationRound round={ROUNDS[0]} onNext={() => setRound(2)} />
      )}
      {round === 2 && (
        <EvaluationRound round={ROUNDS[1]} onNext={() => setRound(3)} />
      )}
      {round === 3 && (
        <VerificationRound onComplete={() => setRound("complete")} />
      )}
      {round === "complete" && (
        <CompletionScreen onComplete={onComplete} />
      )}
    </div>
  );
}
