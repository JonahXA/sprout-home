import React from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, DollarSign } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

const C = {
  navy:"#1F3A64", navyLight:"#264D82", navyGlow:"rgba(31,58,100,0.12)",
  bg:"#FFFFFF", border:"#E5E7EB", bgSoft:"#F8FAFC",
  text:"#0F172A", textSub:"#475569",
};

const quizQuestions = [
  {
    question: "You earned $4,000 this month. Your paycheck shows $3,100. Where did $900 go?",
    scenario: "Looking at your paycheck: Gross Pay: $4,000, Federal Tax: $400, State Tax: $200, Social Security: $248, Medicare: $58, Net Pay: $3,100",
    options: [
      "The company kept it as profit",
      "Taxes and mandatory deductions",
      "Your 401(k) savings",
      "Bank fees"
    ],
    correct_answer: 1,
    explanation: "The $900 went to mandatory deductions: Federal Tax ($400) + State Tax ($200) + Social Security ($248) + Medicare ($58) = $906. These are automatically taken out before you get paid."
  },
  {
    question: "What's the difference between Gross Pay and Net Pay?",
    options: [
      "Gross Pay is yearly, Net Pay is monthly",
      "Gross Pay is what you earn before deductions, Net Pay is what you actually take home",
      "Gross Pay includes bonuses, Net Pay doesn't",
      "They're the same thing"
    ],
    correct_answer: 1,
    explanation: "Gross Pay is your total earnings before anything is taken out. Net Pay (take-home pay) is what's left after taxes and deductions. Always budget based on Net Pay, not Gross Pay!"
  },
  {
    question: "Your paycheck shows: Gross $2,000, Federal Tax $200, 401(k) $120. What can you control?",
    scenario: "You're reviewing deductions and want to have more take-home pay.",
    options: [
      "Federal Tax amount",
      "Social Security contribution",
      "Medicare deduction",
      "401(k) contribution"
    ],
    correct_answer: 3,
    explanation: "You can control voluntary deductions like 401(k) contributions. Federal Tax, Social Security, and Medicare are mandatory and calculated automatically based on your income. However, reducing 401(k) means less retirement savings!"
  },
  {
    question: "Social Security deduction: What is it and why do you pay it?",
    scenario: "Your check shows Social Security: $155 (6.2% of gross pay)",
    options: [
      "A savings account the company manages for you",
      "Federal program providing retirement and disability benefits",
      "State income tax under a different name",
      "Optional insurance you can opt out of"
    ],
    correct_answer: 1,
    explanation: "Social Security is a federal program. You pay 6.2% of your gross pay, and it funds benefits for retirees, disabled workers, and survivors. When you retire, you'll receive Social Security benefits based on what you paid in."
  },
  {
    question: "If you earn $50,000/year, why might you take home only $38,000?",
    options: [
      "The company is withholding too much",
      "Normal taxes and deductions (Federal, State, Social Security, Medicare, 401k)",
      "You're paying penalties",
      "Bank fees are very high"
    ],
    correct_answer: 1,
    explanation: "A typical breakdown: Federal Tax (~15%), State Tax (~5%), Social Security (6.2%), Medicare (1.45%), 401(k) (5-10%). This equals about 24% in deductions, leaving you with roughly $38,000 take-home from $50,000 gross."
  },
  {
    question: "You see 'YTD Gross: $20,000' in June. What does YTD mean and is this correct?",
    scenario: "You make $4,000/month gross pay. It's June (6 months into the year).",
    options: [
      "Year To Date - total earned so far this year. This seems too low.",
      "Yearly Total Deductions - what you've paid in taxes",
      "Year To Date - this is correct ($4,000 × 5 months = $20,000)",
      "Your Take-home Deposit amount"
    ],
    correct_answer: 0,
    explanation: "YTD means Year To Date. If it's June and you make $4,000/month, you should have earned $24,000 YTD ($4,000 × 6 months), not $20,000. Check with HR if there's a discrepancy!"
  },
  {
    question: "Your employer 'matches' 3% on your 401(k). You earn $5,000/month and contribute $100. How much goes to retirement?",
    options: [
      "$100 (just your contribution)",
      "$200 (your $100 + employer $100)",
      "$150 (your $100 + employer $50)",
      "$250 (your $150 + employer $100)"
    ],
    correct_answer: 1,
    explanation: "You contribute $100. Since you contribute 2% of your $5,000 salary, and the employer matches up to 3%, they also add $100. Total retirement savings: $200/month. Employer match is FREE MONEY - always contribute enough to get the full match!"
  }
];

export default function PaycheckQuiz() {
  const navigate = useNavigate();

  const handleComplete = (score) => {
    navigate(createPageUrl("Learn"));
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth:960, margin:"0 auto", display:"flex", flexDirection:"column", gap:24 }}>
        <button
          onClick={() => navigate(createPageUrl("PaycheckLesson"))}
          style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer", width:"fit-content" }}
        >
          <ArrowLeft size={16} />
          Back to Lesson
        </button>

        <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
          <div style={{ display:"inline-flex", padding:16, background:C.navy, borderRadius:20, boxShadow:`0 8px 24px ${C.navyGlow}`, marginBottom:8 }}>
            <DollarSign size={48} color="#fff" />
          </div>
          <h1 style={{ fontSize:40, fontWeight:900, color:C.text, letterSpacing:"-1px", margin:0 }}>
            Paycheck Knowledge Quiz
          </h1>
          <p style={{ fontSize:17, color:C.textSub, maxWidth:560, margin:0 }}>
            Apply what you learned! Calculate deductions and understand where your money goes.
          </p>
        </div>

        <InteractiveQuiz questions={quizQuestions} onComplete={handleComplete} />

        <div style={{ background:C.bgSoft, borderRadius:16, border:`1px solid ${C.border}`, padding:24, textAlign:"center" }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:C.text, margin:"0 0 8px" }}>Remember</h3>
          <p style={{ fontSize:14, color:C.textSub, margin:0 }}>
            Understanding your paycheck is the first step to budgeting. Always base your budget on Net Pay (take-home), not Gross Pay!
          </p>
        </div>
      </div>
    </div>
  );
}