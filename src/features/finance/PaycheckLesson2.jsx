import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaycheckLesson2({ userName = "Your Name", onComplete }) {
 const [step, setStep] = useState(0);
 const [selectedAnswer, setSelectedAnswer] = useState(null);
 const [netPayClicked, setNetPayClicked] = useState(false);
 const [budgetAnswer, setBudgetAnswer] = useState(null);
 const [errors, setErrors] = useState({});

 const paycheckData = {
 employeeName: userName,
 payPeriod: "01/01/2026 - 01/14/2026",
 payDate: "01/17/2026",
 hourlyRate: 15,
 hoursWorked: 40,
 grossPay: 600.00,
 deductions: {
 federalTax: 60.00,
 stateTax: 18.00,
 socialSecurity: 37.20,
 medicare: 8.70
 },
 netPay: 476.10
 };

 const steps = [
 {
 title: "Your College Campus Job",
 description: "Part-time work while in school - different pay, different taxes.",
 content: "This paycheck is from a campus job at **$15/hour** for **40 hours** (biweekly). Notice anything different from Lesson 1? The tax amounts are lower - but why?",
 highlight: null
 },
 {
 title: "Why Are Taxes Lower?",
 description: "Lower income = lower tax rates in most cases.",
 content: "Your taxes are lower because you're earning less. Tax rates are progressive - the more you earn, the higher percentage you pay. Select the correct reason below:",
 highlight: "taxes",
 interactive: true,
 options: [
 { text: "Students don't pay taxes", value: "wrong1" },
 { text: "Lower income = lower tax brackets", value: "correct" },
 { text: "Part-time jobs are tax-free", value: "wrong2" }
 ],
 correctAnswer: "correct",
 check: () => {
 if (selectedAnswer === "correct") {
 return { valid: true };
 }
 return { valid: false, message: "Think about how tax brackets work based on income" };
 }
 },
 {
 title: "What Hits Your Bank?",
 description: "Click the net pay section to confirm your take-home amount.",
 content: `After all deductions, your **net pay** is **$${paycheckData.netPay.toFixed(2)}**. This is what actually gets deposited. Click on the Net Pay box below to confirm you understand this is your real budget number.`,
 highlight: "net",
 interactive: true,
 check: () => {
 if (netPayClicked) {
 return { valid: true };
 }
 return { valid: false, message: "Click the green Net Pay box to continue" };
 }
 },
 {
 title: "Budget Reality Check",
 description: "You can only budget with money you actually receive.",
 content: "If you told someone you make **$600** per paycheck (gross pay), you'd be misleading them - and yourself. What number should you use for budgeting?",
 highlight: null,
 interactive: true,
 options: [
 { text: "$600 (gross pay)", value: "wrong" },
 { text: "$476.10 (net pay)", value: "correct" },
 { text: "Somewhere in between", value: "wrong2" }
 ],
 correctAnswer: "correct",
 check: () => {
 if (budgetAnswer === "correct") {
 return { valid: true };
 }
 return { valid: false, message: "Always budget using net pay - what actually hits your account" };
 }
 }
 ];

 const currentStep = steps[step];
 const totalDeductions = Object.values(paycheckData.deductions).reduce((sum, val) => sum + val, 0);

 const handleNext = () => {
 if (currentStep.interactive && currentStep.check) {
 const result = currentStep.check();
 if (!result.valid) {
 setErrors({ step: result.message });
 return;
 }
 }
 setErrors({});
 if (step < steps.length - 1) {
 setStep(step + 1);
 setSelectedAnswer(null);
 setBudgetAnswer(null);
 } else {
 if (onComplete) onComplete();
 }
 };

 const getHighlightStyle = (area) => {
 if (currentStep.highlight !== area) return {};
 return {
 outline: '4px solid #3b82f6',
 outlineOffset: '4px',
 borderRadius: '8px',
 boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)',
 backgroundColor: 'rgba(59, 130, 246, 0.05)'
 };
 };

 return (
 <div className="space-y-6">
 <Progress value={((step + 1) / steps.length) * 100} className="h-2" />

 <AnimatePresence mode="wait">
 <motion.div
 key={step}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 >
 <Card className="border-2 border-blue-200">
 <CardContent className="p-6">
 <Badge className="mb-3 bg-blue-500">Step {step + 1} of {steps.length}</Badge>
 <h3 className="text-2xl font-bold mb-2">{currentStep.title}</h3>
 <p className="text-gray-600 mb-4">{currentStep.description}</p>
 <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500 mb-4">
 {currentStep.content.split('**').map((part, j) =>
 j % 2 === 0 ? part : <strong key={j}>{part}</strong>
 )}
 </div>

 {currentStep.options && (step === 1 || step === 3) && (
 <div className="space-y-2">
 {currentStep.options.map(option => (
 <Button
 key={option.value}
 variant={(step === 1 ? selectedAnswer : budgetAnswer) === option.value ? "default" : "outline"}
 className={`w-full justify-start ${(step === 1 ? selectedAnswer : budgetAnswer) === option.value ? "bg-blue-600" : ""}`}
 onClick={() => step === 1 ? setSelectedAnswer(option.value) : setBudgetAnswer(option.value)}
 >
 {option.text}
 </Button>
 ))}
 {errors.step && (
 <div className="flex items-center gap-2 text-red-600 text-sm">
 <AlertCircle className="w-4 h-4" />
 {errors.step}
 </div>
 )}
 </div>
 )}
 </CardContent>
 </Card>
 </motion.div>
 </AnimatePresence>

 <Card className="border-2 border-gray-200">
 <CardContent className="p-6">
 <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg space-y-4">
 <div className="border-b-2 border-gray-300 pb-4">
 <h4 className="text-xl font-bold">Earnings Statement</h4>
 <p className="text-sm text-gray-600">Employee: {paycheckData.employeeName}</p>
 <p className="text-sm text-gray-600">Pay Period: {paycheckData.payPeriod}</p>
 <p className="text-sm text-gray-600">Pay Date: {paycheckData.payDate}</p>
 </div>

 <div className="p-4 rounded-lg">
 <h5 className="font-semibold mb-2">Earnings</h5>
 <div className="grid grid-cols-2 gap-2 text-sm">
 <span>Hourly Rate:</span>
 <span className="text-right">${paycheckData.hourlyRate.toFixed(2)}/hr</span>
 <span>Hours Worked:</span>
 <span className="text-right">{paycheckData.hoursWorked} hours</span>
 <span className="font-bold text-lg mt-2">Gross Pay:</span>
 <span className="font-bold text-lg text-right mt-2">${paycheckData.grossPay.toFixed(2)}</span>
 </div>
 </div>

 <div style={getHighlightStyle('taxes')} className="p-4 rounded-lg">
 <h5 className="font-semibold mb-2">Deductions</h5>
 <div className="grid grid-cols-2 gap-2 text-sm">
 <span>Federal Income Tax (10%):</span>
 <span className="text-right">-${paycheckData.deductions.federalTax.toFixed(2)}</span>
 <span>State Income Tax (3%):</span>
 <span className="text-right">-${paycheckData.deductions.stateTax.toFixed(2)}</span>
 <span>Social Security (6.2%):</span>
 <span className="text-right">-${paycheckData.deductions.socialSecurity.toFixed(2)}</span>
 <span>Medicare (1.45%):</span>
 <span className="text-right">-${paycheckData.deductions.medicare.toFixed(2)}</span>
 <span className="font-bold mt-2">Total Deductions:</span>
 <span className="font-bold text-right mt-2">-${totalDeductions.toFixed(2)}</span>
 </div>
 </div>

 <div
 style={getHighlightStyle('net')}
 className={`p-4 rounded-lg bg-blue-50 border-2 border-blue-500 ${step === 2 ? 'cursor-pointer hover:bg-blue-100' : ''}`}
 onClick={() => step === 2 && setNetPayClicked(true)}
 >
 <div className="flex justify-between items-center">
 <span className="text-xl font-bold">NET PAY:</span>
 <span className="text-2xl font-bold text-blue-600">${paycheckData.netPay.toFixed(2)}</span>
 </div>
 {step === 2 && !netPayClicked && (
 <p className="text-xs text-gray-600 mt-2">Click to confirm</p>
 )}
 {netPayClicked && step === 2 && (
 <div className="flex items-center gap-2 text-[#2D9B6F] text-sm mt-2">
 <CheckCircle2 className="w-4 h-4" />
 Confirmed!
 </div>
 )}
 </div>
 </div>
 </CardContent>
 </Card>

 <div className="flex justify-between">
 <Button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} variant="outline">
 Previous
 </Button>
 <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700">
 {step === steps.length - 1 ? <><CheckCircle2 className="w-4 h-4 mr-2" />Complete</> : "Continue"}
 </Button>
 </div>
 </div>
 );
}
