import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, DollarSign, TrendingUp, Calendar, Home, Calculator, PiggyBank, BarChart, Eye, CheckCircle2, Lightbulb } from "lucide-react";

const budgetSteps = [
 {
 id: 1,
 title: "Meet Your Budget Sheet",
 description:
 "This is what real budgeting looks like—a simple spreadsheet tracking where money goes each month.",
 highlight: null,
 content:
 "Before we dive in, here's the big picture: budgeting isn't about restricting yourself. It's about awareness. This sheet shows real expenses over several months. Let's break it down together, one piece at a time.",
 tip: "The best budgets are honest, not perfect. Your first budget will never be perfect—and that's okay!",
 icon: Eye,
 },
 {
 id: 2,
 title: "Time Structure—Why Monthly?",
 description: "Notice the months in the left column? That's not random.",
 highlight: "months",
 content:
 "Most bills come monthly: rent, subscriptions, phone. Tracking by month helps you see patterns. Did you spend more in July? Was December higher? Trends matter more than one-off months.",
 tip: "Pro tip: Set a budget review day each month—like the 1st or payday. Make it a habit.",
 icon: Calendar,
 },
 {
 id: 3,
 title: "Fixed Expenses—The Non-Negotiables",
 description: "These are costs that stay (mostly) the same every month.",
 highlight: "fixed",
 content:
 "**Rent, subscriptions, health insurance**—these don't change much. They come first because they're predictable and often mandatory. Knowing your fixed costs gives you a baseline: this is the minimum you *must* cover.",
 tip: "Rule of thumb: Fixed expenses should be ≤50% of your income. If they're higher, it might be time to cut or negotiate.",
 icon: Home,
 },
 {
 id: 4,
 title: "Variable Expenses—The Flex Zone",
 description: "These change month to month based on your choices.",
 highlight: "variable",
 content:
 "**Groceries, gas, food, misc**—these fluctuate. Maybe you cooked more in March, ate out more in August. Variable expenses are where you have the most control. Small changes here add up fast.",
 tip: "Start by tracking, not judging. After a month or two, patterns will reveal themselves.",
 icon: TrendingUp,
 },
 {
 id: 5,
 title: "Total Expenditures—The Reality Check",
 description: "This column is your spending truth.",
 highlight: "total",
 content:
 "Add up all your expenses for the month, and you get your **total expenditures**. This number matters more than any single line item. It tells you: *Did I live within my means this month?*",
 tip: "If your total is consistently rising, dig into which categories are growing. One category usually leads the way.",
 icon: Calculator,
 },
 {
 id: 6,
 title: "Income—Where It All Starts",
 description: "This is your take-home pay—what actually hits your account.",
 highlight: "income",
 content:
 "Remember the paycheck lesson? This is your **net income** (after taxes and deductions). Always budget based on what you take home, not your gross salary. If your income varies, use your lowest month as a baseline.",
 tip: "If you have multiple income streams (side gigs, freelance), track them separately at first, then combine.",
 icon: DollarSign,
 },
 {
 id: 7,
 title: "Savings = Income Minus Spending",
 description: "The money left over? That's your savings (or remaining funds).",
 highlight: "savings",
 content:
 "**Gross Savings** = Income - Total Expenditures. This is what you have left to save, invest, or put toward goals. If this number is negative, you're overspending. If it's zero, you're breaking even. Positive? You're winning.",
 tip: "Aim to save at least 20% of your income. Start with 10% if you're just beginning. Automate it so it happens first.",
 icon: PiggyBank,
 },
 {
 id: 8,
 title: "Visual Insights—Patterns at a Glance",
 description: "Charts make patterns obvious instantly.",
 highlight: "charts",
 content:
 "The **yearly breakdown bar chart** shows spending trends over time. The **category pie chart** reveals where most of your money goes. If food is 40% of your budget, you'll see it immediately. Visuals don't lie.",
 tip: "Look for spikes and surprises. Big bar in August? Check what happened. Small slice for savings? Time to adjust.",
 icon: BarChart,
 },
 {
 id: 9,
 title: "How to Actually Use This",
 description: "Budgeting is a practice, not a one-time event.",
 highlight: null,
 content:
 "**Monthly routine:** \n1. Record all expenses (weekly is easier) \n2. Compare actual vs. planned spending \n3. Adjust next month based on what you learned \n4. Celebrate wins (stayed under budget? Nice!) \n5. No guilt—just awareness and adjustment",
 tip: "The first 3 months are messy. By month 4, you'll have a rhythm. Stick with it.",
 icon: TrendingUp,
 },
];

const headerCols = [
 { key: "months", label: "Month", span: 1 },
 { key: "variable", label: "Groceries", span: 1 },
 { key: "fixed", label: "Rent", span: 1 },
 { key: "variable", label: "Gas", span: 1 },
 { key: "fixed", label: "Health", span: 1 },
 { key: "fixed", label: "Subscriptions", span: 1 },
 { key: "variable", label: "Food", span: 1 },
 { key: "variable", label: "Misc", span: 1 },
 { key: "total", label: "Total Exp", span: 1 },
 { key: "income", label: "Income", span: 1 },
 { key: "savings", label: "Gross Savings", span: 2 },
];

const rows = [
 {
 month: "July 2025",
 groceries: "$530",
 rent: "$1,728",
 gas: "$47",
 health: "$30",
 subs: "$79",
 food: "-",
 misc: "-",
 total: "$2,415",
 income: "$2,210",
 savings: "-$205",
 },
 {
 month: "Aug 2025",
 groceries: "$530",
 rent: "$1,728",
 gas: "$47",
 health: "$30",
 subs: "$79",
 food: "-",
 misc: "-",
 total: "$2,415",
 income: "$7,655",
 savings: "$5,240",
 },
 {
 month: "Sept 2025",
 groceries: "$502",
 rent: "$1,728",
 gas: "-",
 health: "$30",
 subs: "$79",
 food: "-",
 misc: "-",
 total: "$2,484",
 income: "$5,076",
 savings: "$2,592",
 },
];

export default function BudgetWalkthrough() {
 const [started, setStarted] = useState(false);
 const [currentStep, setCurrentStep] = useState(0);
 const [isComplete, setIsComplete] = useState(false);

 const step = budgetSteps[currentStep];
 const Icon = step.icon;
 const isLastStep = currentStep === budgetSteps.length - 1;

 const nextStep = () => {
 if (isLastStep) {
 setIsComplete(true);
 } else {
 setCurrentStep((s) => s + 1);
 }
 };
 const prevStep = () => {
 if (currentStep > 0) setCurrentStep((s) => s - 1);
 };

 const getHighlightStyle = (area) => {
 if (!step.highlight || step.highlight !== area) return {};
 return {
 outline: "4px solid #2D9B6F",
 outlineOffset: "4px",
 borderRadius: "8px",
 boxShadow: "0 0 20px rgba(132, 204, 22, 0.4)",
 transition: "all 0.3s ease",
 position: "relative",
 zIndex: 10,
 };
 };

 const progress = ((currentStep + 1) / budgetSteps.length) * 100;

 // ── Intro screen ────────────────────────────────────────────────────────────
 if (!started) return (
 <div className="space-y-5">
 <Card className="border-2 border-gray-200 shadow-xl overflow-hidden">
 <div className="bg-[#1B2B5E] p-6 text-white">
 <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-4">
 <Eye className="w-6 h-6 text-white" />
 </div>
 <p className="text-white/80 text-xs font-semibold uppercase tracking-widest mb-2">Budget Walkthrough</p>
 <h2 className="text-2xl font-bold mb-2">How to Read a Real Budget</h2>
 <p className="text-white/90 text-sm leading-relaxed">
 Most people have never seen a real personal budget laid out as a spreadsheet. This walkthrough breaks down a real budget sheet section by section — so you understand exactly where every dollar goes and what the numbers mean.
 </p>
 </div>
 <CardContent className="p-6">
 <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">What you will learn</p>
 <div className="space-y-3">
 {[
 ["Why budgets are tracked monthly", "Monthly tracking reveals spending patterns that one-off reviews miss."],
 ["Fixed vs. variable expenses", "Some costs never change; others are fully in your control."],
 ["How to calculate net savings", "Income minus expenses — and why that number matters more than anything."],
 ["How to read financial charts", "Bar charts and pie charts that make your spending obvious at a glance."],
 ].map(([title, desc]) => (
 <div key={title} className="flex items-start gap-3">
 <CheckCircle2 className="w-4 h-4 text-[#2D9B6F] flex-shrink-0 mt-0.5" />
 <div>
 <p className="text-sm font-semibold text-gray-900">{title}</p>
 <p className="text-xs text-gray-500">{desc}</p>
 </div>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <div className="bg-blue-50 border border-gray-200 rounded-xl p-5 flex items-start gap-3">
 <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
 <Lightbulb className="w-4 h-4 text-[#2D9B6F]" />
 </div>
 <div>
 <p className="font-semibold text-gray-900 text-sm mb-1">How this works</p>
 <p className="text-gray-600 text-sm leading-relaxed">
 A real budget sheet is shown throughout the walkthrough. As you progress through each of the 9 steps, the relevant section of the sheet is highlighted so you can see exactly what's being discussed.
 </p>
 </div>
 </div>

 <Button
 onClick={() => setStarted(true)}
 className="w-full h-12 bg-[#1B2B5E] hover:bg-[#141E43] text-white font-semibold text-base"
 >
 Start Walkthrough
 <ChevronRight className="w-4 h-4 ml-2" />
 </Button>
 </div>
 );

 // ── Completion screen ────────────────────────────────────────────────────────
 if (isComplete) return (
 <div className="space-y-6">
 <Card className="border-2 border-gray-200 shadow-xl">
 <CardContent className="p-8 text-center">
 <div className="w-16 h-16 bg-[#1B2B5E] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
 <CheckCircle2 className="w-8 h-8 text-white" />
 </div>
 <h2 className="text-2xl font-bold text-gray-900 mb-2">Walkthrough Complete!</h2>
 <p className="text-gray-500 mb-6 max-w-sm mx-auto">
 You've reviewed all 9 sections of a real budget sheet. You now know how to read and use a monthly budget.
 </p>
 <div className="bg-blue-50 border border-gray-200 rounded-xl p-5 text-left max-w-sm mx-auto mb-6">
 <p className="text-xs font-semibold text-[#2D9B6F] uppercase tracking-wide mb-3">What You Covered</p>
 <ul className="space-y-2 text-sm text-gray-700">
 {["Fixed vs. variable expenses", "How to read income and savings", "Monthly patterns and visual charts", "A practical monthly budgeting routine"].map((item, i) => (
 <li key={i} className="flex items-start gap-2">
 <CheckCircle2 className="w-4 h-4 text-[#2D9B6F] flex-shrink-0 mt-0.5" />
 {item}
 </li>
 ))}
 </ul>
 </div>
 <Button
 onClick={() => { setCurrentStep(0); setIsComplete(false); }}
 variant="outline"
 className="border-gray-200 text-gray-700 hover:bg-slate-50"
 >
 Review Again
 </Button>
 </CardContent>
 </Card>
 </div>
 );

 return (
 <div className="space-y-6">
 {/* Progress Bar */}
 <div className="space-y-2">
 <div className="flex justify-between text-sm text-gray-600">
 <span>
 Step {currentStep + 1} of {budgetSteps.length}
 </span>
 <span>{Math.round(progress)}%</span>
 </div>
 <Progress value={progress} className="h-2" />
 </div>

 {/* Current Step Card */}
 <AnimatePresence mode="wait">
 <motion.div
 key={currentStep}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.3 }}
 >
 <Card className="border-2 border-gray-200 shadow-xl">
 <CardContent className="p-6 md:p-8">
 <div className="flex items-start gap-4 mb-6">
 <div className="w-14 h-14 rounded-xl bg-[#1B2B5E] flex items-center justify-center flex-shrink-0 shadow-lg">
 <Icon className="w-7 h-7 text-white" />
 </div>
 <div className="flex-1">
 <Badge className="mb-2 bg-blue-100 text-[#2D9B6F]">
 Step {currentStep + 1}
 </Badge>
 <h3 className="text-2xl font-bold text-gray-900 mb-2">{step.title}</h3>
 <p className="text-gray-600">{step.description}</p>
 </div>
 </div>

 <div className="prose prose-lg max-w-none mb-6">
 <div className="bg-[#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E] mb-4">
 {step.content.split("\n").map((para, i) => (
 <p key={i} className="text-gray-700 leading-relaxed mb-2 last:mb-0">
 {para.split("**").map((part, j) =>
 j % 2 === 0 ? part : (
 <strong key={j} className="text-gray-900 font-bold">
 {part}
 </strong>
 )
 )}
 </p>
 ))}
 </div>
 </div>

 {step.tip && (
 <div className="bg-[#E6F5EF] p-5 rounded-xl border-l-4 border-[#2D9B6F]">
 <p className="text-sm text-gray-800 font-medium">{step.tip}</p>
 </div>
 )}
 </CardContent>
 </Card>
 </motion.div>
 </AnimatePresence>

 {/* Mock Budget Sheet */}
 <Card className="border-2 border-gray-200 shadow-xl overflow-hidden">
 <CardContent className="p-0">
 <div className="overflow-x-auto">
 <div className="min-w-[900px] bg-white">
 {/* Header Row */}
 <div className="grid grid-cols-12 gap-2 p-4 bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300 font-bold text-xs">
 {headerCols.map((c) => (
 <div
 key={c.label}
 className={`col-span-${c.span}`}
 style={getHighlightStyle(c.key)}
 >
 {c.label}
 </div>
 ))}
 </div>

 {/* Data Rows */}
 {rows.map((r, idx) => (
 <div
 key={idx}
 className="grid grid-cols-12 gap-2 p-4 border-b border-gray-200 text-xs hover:bg-slate-50 transition-colors"
 >
 <div className="col-span-1 truncate">{r.month}</div>
 <div className="col-span-1 truncate">{r.groceries}</div>
 <div className="col-span-1 truncate">{r.rent}</div>
 <div className="col-span-1 truncate">{r.gas}</div>
 <div className="col-span-1 truncate">{r.health}</div>
 <div className="col-span-1 truncate">{r.subs}</div>
 <div className="col-span-1 truncate">{r.food}</div>
 <div className="col-span-1 truncate">{r.misc}</div>
 <div className="col-span-1 truncate">{r.total}</div>
 <div className="col-span-1 truncate">{r.income}</div>
 <div className="col-span-2 truncate font-semibold">{r.savings}</div>
 </div>
 ))}

 {/* Charts Section */}
 <div
 className="grid md:grid-cols-2 gap-4 p-4 bg-gray-50"
 style={getHighlightStyle("charts")}
 >
 <div className="bg-white p-4 rounded-lg border">
 <h4 className="font-semibold text-sm mb-2 text-gray-700">Yearly Breakdown</h4>
 <div className="flex items-end gap-1 h-24">
 {[45, 78, 62, 85, 50, 70].map((height, i) => (
 <div
 key={i}
 className="flex-1 bg-[#1B2B5E] rounded-t"
 style={{ height: `${height}%` }}
 />
 ))}
 </div>
 </div>

 <div className="bg-white p-4 rounded-lg border">
 <h4 className="font-semibold text-sm mb-2 text-gray-700">Categories</h4>
 <div className="flex items-center justify-center h-24">
 <svg viewBox="0 0 100 100" className="w-24 h-24">
 <path d="M 50 50 L 50 0 A 50 50 0 0 1 85.36 14.64 Z" fill="#10b981" />
 <path d="M 50 50 L 85.36 14.64 A 50 50 0 0 1 85.36 85.36 Z" fill="#3b82f6" />
 <path d="M 50 50 L 85.36 85.36 A 50 50 0 0 1 14.64 85.36 Z" fill="#f59e0b" />
 <path d="M 50 50 L 14.64 85.36 A 50 50 0 0 1 50 0 Z" fill="#8b5cf6" />
 </svg>
 </div>

 <div className="mt-2 text-xs space-y-1">
 <div className="flex justify-between">
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-[#10b981]" />
 Rent
 </span>
 <span>40%</span>
 </div>
 <div className="flex justify-between">
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-[#3b82f6]" />
 Groceries
 </span>
 <span>25%</span>
 </div>
 <div className="flex justify-between">
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
 Food
 </span>
 <span>20%</span>
 </div>
 <div className="flex justify-between">
 <span className="flex items-center gap-1">
 <span className="w-2 h-2 rounded-full bg-[#8b5cf6]" />
 Other
 </span>
 <span>15%</span>
 </div>
 </div>
 </div>
 </div>
 {/* end charts */}
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Navigation */}
 <div className="flex justify-between gap-4">
 <Button onClick={prevStep} disabled={currentStep === 0} variant="outline" className="h-12 px-6">
 <ChevronLeft className="w-5 h-5 mr-2" />
 Previous
 </Button>

 <Button
 onClick={nextStep}
 className="h-12 px-6 bg-[#1B2B5E] hover:bg-[#141E43]"
 >
 {isLastStep ? "Complete Walkthrough" : "Continue"}
 {!isLastStep && <ChevronRight className="w-5 h-5 ml-2" />}
 </Button>
 </div>
 </div>
 );
}
