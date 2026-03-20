import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaycheckLesson1({ userName = "Your Name", onComplete }) {
  const [step, setStep] = useState(0);
  const [grossPayInput, setGrossPayInput] = useState("");
  const [selectedNetPay, setSelectedNetPay] = useState(null);
  const [errors, setErrors] = useState({});

  const paycheckData = {
    employeeName: userName,
    payPeriod: "12/01/2025 - 12/14/2025",
    payDate: "12/20/2025",
    hourlyRate: 18,
    hoursWorked: 80,
    grossPay: 1440.00,
    deductions: {
      federalTax: 172.80,
      stateTax: 72.00,
      socialSecurity: 89.28,
      medicare: 20.88
    },
    netPay: 1085.04
  };

  const totalDeductions = Object.values(paycheckData.deductions).reduce((sum, val) => sum + val, 0);

  const steps = [
    {
      title: "Meet Your First Paycheck",
      description: "This is what a real biweekly paycheck looks like for an hourly retail job at $18/hour.",
      content: "Before we break it down, take a look at the full earnings statement below. Notice the difference between what you earned (Gross Pay) and what hits your bank account (Net Pay). That gap? That's what we're about to understand.",
      highlight: null
    },
    {
      title: "Calculate Your Gross Pay",
      description: "Gross pay is your total earnings before any deductions.",
      content: `You worked **80 hours** at **$${paycheckData.hourlyRate}/hour**. Calculate your gross pay by multiplying hours × rate. Enter the result below.`,
      highlight: "gross",
      interactive: true,
      check: () => {
        const input = parseFloat(grossPayInput);
        if (input === paycheckData.grossPay) {
          return { valid: true };
        }
        return { valid: false, message: "Not quite. Multiply 80 hours × $18/hour" };
      }
    },
    {
      title: "Understanding Tax Deductions",
      description: "Every paycheck has mandatory tax deductions taken out automatically.",
      content: "Look at the deductions section below. You'll see four types of taxes:\n\n**Federal Income Tax (12%)** - Goes to the federal government\n**State Income Tax (5%)** - Goes to your state\n**Social Security (6.2%)** - Funds retirement benefits\n**Medicare (1.45%)** - Funds healthcare for seniors\n\nThese percentages are applied to your gross pay and deducted automatically.",
      highlight: "taxes"
    },
    {
      title: "What Actually Hits Your Bank?",
      description: "Net pay is what's left after all deductions - this is your take-home pay.",
      content: "After all taxes are taken out, your **net pay** is what gets deposited into your bank account. This is the number you need to budget with - not your gross pay.\n\nSelect the correct net pay amount below:",
      highlight: "net",
      interactive: true,
      options: [1440.00, 1085.04, 1200.00],
      check: () => {
        if (selectedNetPay === paycheckData.netPay) {
          return { valid: true };
        }
        return { valid: false, message: "Look at the Net Pay line in the earnings statement" };
      }
    },
    {
      title: "Key Takeaway",
      description: "Always budget based on net pay, not gross pay.",
      content: `🎯 **What You Learned:**\n\n✓ Gross Pay ($${paycheckData.grossPay.toFixed(2)}) = Your total earnings\n✓ Deductions ($${totalDeductions.toFixed(2)}) = Mandatory taxes\n✓ Net Pay ($${paycheckData.netPay.toFixed(2)}) = What you actually get\n\n**Critical Rule:** When budgeting or thinking about affordability, always use your **net pay**. If you budget using gross pay, you'll overspend every time.`,
      highlight: null
    }
  ];

  const currentStep = steps[step];

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
    } else {
      if (onComplete) onComplete();
    }
  };

  const getHighlightStyle = (area) => {
    if (currentStep.highlight !== area) return {};
    return {
      outline: '4px solid #10b981',
      outlineOffset: '4px',
      borderRadius: '8px',
      boxShadow: '0 0 20px rgba(16, 185, 129, 0.4)',
      backgroundColor: 'rgba(16, 185, 129, 0.05)'
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
          <Card className="border-2 border-[#2D9B6F]/30">
            <CardContent className="p-6">
              <Badge className="mb-3">Step {step + 1} of {steps.length}</Badge>
              <h3 className="text-2xl font-bold mb-2">{currentStep.title}</h3>
              <p className="text-gray-600 mb-4">{currentStep.description}</p>
              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500 mb-4">
                {currentStep.content.split('\n').map((para, i) => (
                  <p key={i} className="mb-2 last:mb-0">
                    {para.split('**').map((part, j) =>
                      j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                    )}
                  </p>
                ))}
              </div>

              {currentStep.interactive && currentStep.check && !currentStep.options && (
                <div className="space-y-3">
                  <Input
                    type="number"
                    placeholder="Enter gross pay"
                    value={grossPayInput}
                    onChange={(e) => setGrossPayInput(e.target.value)}
                    className="text-lg"
                  />
                  {errors.step && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {errors.step}
                    </div>
                  )}
                </div>
              )}

              {currentStep.options && (
                <div className="grid grid-cols-3 gap-4">
                  {currentStep.options.map(option => (
                    <Button
                      key={option}
                      variant={selectedNetPay === option ? "default" : "outline"}
                      className={selectedNetPay === option ? "bg-green-600" : ""}
                      onClick={() => setSelectedNetPay(option)}
                    >
                      ${option.toFixed(2)}
                    </Button>
                  ))}
                  {errors.step && (
                    <div className="col-span-3 flex items-center gap-2 text-red-600 text-sm">
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

      {/* Earnings Statement */}
      <Card className="border-2 border-gray-200">
        <CardContent className="p-6">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-lg space-y-4">
            <div className="border-b-2 border-gray-300 pb-4">
              <h4 className="text-xl font-bold">Earnings Statement</h4>
              <p className="text-sm text-gray-600">Employee: {paycheckData.employeeName}</p>
              <p className="text-sm text-gray-600">Pay Period: {paycheckData.payPeriod}</p>
              <p className="text-sm text-gray-600">Pay Date: {paycheckData.payDate}</p>
            </div>

            <div style={getHighlightStyle('gross')} className="p-4 rounded-lg">
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
                <span>Federal Income Tax:</span>
                <span className="text-right">-${paycheckData.deductions.federalTax.toFixed(2)}</span>
                <span>State Income Tax:</span>
                <span className="text-right">-${paycheckData.deductions.stateTax.toFixed(2)}</span>
                <span>Social Security:</span>
                <span className="text-right">-${paycheckData.deductions.socialSecurity.toFixed(2)}</span>
                <span>Medicare:</span>
                <span className="text-right">-${paycheckData.deductions.medicare.toFixed(2)}</span>
                <span className="font-bold mt-2">Total Deductions:</span>
                <span className="font-bold text-right mt-2">-${totalDeductions.toFixed(2)}</span>
              </div>
            </div>

            <div style={getHighlightStyle('net')} className="p-4 rounded-lg bg-[#E6F5EF] border-2 border-[#2D9B6F]">
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold">NET PAY:</span>
                <span className="text-2xl font-bold text-[#2D9B6F]">${paycheckData.netPay.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} variant="outline">
          Previous
        </Button>
        <Button onClick={handleNext} className="bg-green-600 hover:bg-green-700">
          {step === steps.length - 1 ? <><CheckCircle2 className="w-4 h-4 mr-2" />Complete</> : "Continue"}
        </Button>
      </div>
    </div>
  );
}
