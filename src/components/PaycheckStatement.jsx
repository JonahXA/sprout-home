import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function PaycheckStatement() {
  const [currentStep, setCurrentStep] = useState(0);
  const [userName, setUserName] = useState("Student User");

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { data: userRes, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;

        const user = userRes?.user;
        if (!user) {
          setUserName("Student User");
          return;
        }

        const { data: profile, error: profileErr } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .maybeSingle();

        if (profileErr) {
          setUserName(user.email ? user.email.split("@")[0] : "Student User");
          return;
        }

        setUserName(profile?.full_name || (user.email ? user.email.split("@")[0] : "Student User"));
      } catch (error) {
        setUserName("Student User");
      }
    };
    loadUser();
  }, []);

  const steps = [
    {
      id: "intro",
      title: "This Is Your First Paycheck",
      description: "Congratulations! But why is it so much less than you expected?",
      highlight: null,
      content: "Your paycheck has a lot of deductions—taxes, benefits, and more. Understanding where your money goes is empowering, not scary. Let's break it down together!",
      tip: "💡 Remember: Everyone's paycheck looks like this. You're not alone!"
    },
    {
      id: "gross",
      title: "Gross Pay",
      description: "This is what you earned BEFORE anything is taken out.",
      highlight: "gross",
      content: "Gross pay is your hourly rate × hours worked (or your annual salary ÷ pay periods). This is the \"big number\" you were expecting. But this is NOT what hits your bank account.",
      tip: "💰 Example: $20/hour × 80 hours = $1,600 gross pay for two weeks."
    },
    {
      id: "federal",
      title: "Federal Income Tax",
      description: "The government's share—used to fund federal programs.",
      highlight: "federal",
      content: "Federal income tax pays for things like national defense, infrastructure, and federal programs. The amount depends on how much you earn and your filing status. It's withheld automatically from every paycheck.",
      tip: "📝 Fun Fact: Getting a tax refund means you overpaid all year—it's not \"bonus money,\" it's YOUR money coming back."
    },
    {
      id: "state",
      title: "State & Local Tax",
      description: "Your state and city's cut (if applicable).",
      highlight: "state",
      content: "Not all states have income tax! States like Texas and Florida don't charge it, while states like California and New York do. This money funds state programs like schools, roads, and public services.",
      tip: "🗺️ Location Matters: Your take-home pay can vary significantly depending on where you live."
    },
    {
      id: "social",
      title: "Social Security Tax",
      description: "Saving for your future retirement.",
      highlight: "social",
      content: "Social Security is a federal program that provides income for retirees, disabled individuals, and survivors. You pay 6.2% of your gross pay (your employer matches it). Even though you won't see this money for decades, it's there for your future.",
      tip: "⏰ Long-Term Benefit: Yes, you're young now—but this helps ensure you have income when you're older."
    },
    {
      id: "medicare",
      title: "Medicare Tax",
      description: "Healthcare for older adults.",
      highlight: "medicare",
      content: "Medicare provides health insurance for people 65+. You pay 1.45% of your gross pay. Like Social Security, your employer also contributes on your behalf.",
      tip: "🏥 Why It Matters: This ensures healthcare coverage when you retire."
    },
    {
      id: "other",
      title: "Other Deductions",
      description: "Health insurance, retirement savings, and more.",
      highlight: "other",
      content: "Pre-tax deductions (like 401k and health insurance) reduce your taxable income—which saves you money on taxes! Post-tax deductions come out after taxes are calculated.",
      tip: "💡 Smart Move: Contributing to a 401k now means less taxes AND more savings for your future."
    },
    {
      id: "net",
      title: "Net Pay (Take-Home)",
      description: "THIS is what actually hits your bank account.",
      highlight: "net",
      content: "Net pay is what's left after all deductions. This is the number you should use when budgeting. Gross pay is NOT spendable money—net pay is.",
      tip: "🎯 Budget Tip: Always budget based on your net pay, not your gross pay!"
    },
    {
      id: "takeaway",
      title: "Why First Paychecks Feel \"Low\"",
      description: "It's normal to feel surprised—here's why.",
      highlight: null,
      content: "When you calculate $20/hour × 40 hours × 2 weeks, you expect $1,600. But after federal tax, state tax, Social Security, Medicare, and benefits, you might take home $1,100-$1,200. That's about 30% less than you expected!\n\nUnderstanding this early helps you plan better. You're not being \"cheated\"—you're contributing to important programs and your own future.",
      tip: "✨ Confidence Builder: Now you know exactly where your money goes. That's powerful!"
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress Bar */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-gray-600">Step {currentStep + 1} of {steps.length}</p>
        <Badge className="bg-blue-100 text-blue-700">Understanding Paychecks</Badge>
      </div>
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="border-2 border-blue-200 shadow-xl">
            <CardContent className="p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  {currentStepData.title}
                </h2>
                <p className="text-lg text-gray-700">{currentStepData.description}</p>
              </div>

              {/* Mock Paycheck */}
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6 font-mono text-sm">
                <div className="mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-blue-600 font-bold text-xl mb-1">SPROUT COMPANY</div>
                      <div className="text-xs text-gray-600">123 Business Ave</div>
                      <div className="text-xs text-gray-600">Suite 100</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">EARNINGS STATEMENT</div>
                      <div className="text-xs text-gray-600 mt-1">Pay Period: Jan 1-15, 2024</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
                    <div>
                      <div className="text-gray-600">Employee ID: EMP123</div>
                      <div className="text-gray-600">Status: Single</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold">{userName}</div>
                      <div className="text-gray-600">456 Main Street</div>
                      <div className="text-gray-600">Anywhere, USA 12345</div>
                    </div>
                  </div>
                </div>

                {/* Earnings Section */}
                <div className="mb-4">
                  <div className="bg-[#E6F5EF] border-l-4 border-[#2D9B6F] p-3 mb-2">
                    <div className="font-bold text-sm mb-2 text-[#2D9B6F]">EARNINGS</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs font-bold border-b pb-2 mb-2">
                    <div>Description</div>
                    <div className="text-right">Rate</div>
                    <div className="text-right">Hours</div>
                    <div className="text-right">Amount</div>
                  </div>
                  <div className={`grid grid-cols-4 gap-2 text-xs transition-all duration-300 ${currentStepData.highlight === 'gross' ? 'bg-yellow-100 border-2 border-yellow-400 rounded p-2 scale-105' : 'py-1'}`}>
                    <div>Regular Pay</div>
                    <div className="text-right">$20.00</div>
                    <div className="text-right">80</div>
                    <div className="text-right font-bold">$1,600.00</div>
                  </div>
                  <div className={`mt-2 pt-2 border-t flex justify-between font-bold transition-all duration-300 ${currentStepData.highlight === 'gross' ? 'bg-yellow-200 p-2 rounded text-base' : ''}`}>
                    <div>GROSS PAY</div>
                    <div className="text-[#2D9B6F] text-base">$1,600.00</div>
                  </div>
                </div>

                {/* Deductions Section */}
                <div className={`mb-4 transition-all duration-300 ${currentStepData.highlight === 'federal' || currentStepData.highlight === 'state' || currentStepData.highlight === 'social' || currentStepData.highlight === 'medicare' || currentStepData.highlight === 'other' ? 'border-2 border-yellow-400 rounded-lg p-2' : ''}`}>
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 mb-2">
                    <div className="font-bold text-sm mb-2 text-red-800">DEDUCTIONS</div>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="font-bold border-b pb-1 mb-2">Statutory (Required by Law)</div>
                    <div className={`flex justify-between transition-all duration-300 ${currentStepData.highlight === 'federal' ? 'bg-yellow-200 border-2 border-yellow-400 rounded p-2 scale-105 font-bold' : 'py-1'}`}>
                      <div>Federal Income Tax</div>
                      <div className="text-red-600">-$192.00</div>
                    </div>
                    <div className={`flex justify-between transition-all duration-300 ${currentStepData.highlight === 'state' ? 'bg-yellow-200 border-2 border-yellow-400 rounded p-2 scale-105 font-bold' : 'py-1'}`}>
                      <div>State Income Tax</div>
                      <div className="text-red-600">-$80.00</div>
                    </div>
                    <div className={`flex justify-between transition-all duration-300 ${currentStepData.highlight === 'social' ? 'bg-yellow-200 border-2 border-yellow-400 rounded p-2 scale-105 font-bold' : 'py-1'}`}>
                      <div>Social Security Tax (6.2%)</div>
                      <div className="text-red-600">-$99.20</div>
                    </div>
                    <div className={`flex justify-between transition-all duration-300 ${currentStepData.highlight === 'medicare' ? 'bg-yellow-200 border-2 border-yellow-400 rounded p-2 scale-105 font-bold' : 'py-1'}`}>
                      <div>Medicare Tax (1.45%)</div>
                      <div className="text-red-600">-$23.20</div>
                    </div>

                    <div className={`font-bold border-b pb-1 mb-2 mt-3 transition-all duration-300 ${currentStepData.highlight === 'other' ? 'bg-yellow-100' : ''}`}>Other Deductions</div>
                    <div className={`flex justify-between transition-all duration-300 ${currentStepData.highlight === 'other' ? 'bg-yellow-200 border-2 border-yellow-400 rounded p-2 scale-105 font-bold' : 'py-1'}`}>
                      <div>Health Insurance (Pre-tax)</div>
                      <div className="text-red-600">-$60.00</div>
                    </div>
                    <div className={`flex justify-between transition-all duration-300 ${currentStepData.highlight === 'other' ? 'bg-yellow-200 border-2 border-yellow-400 rounded p-2 scale-105 font-bold' : 'py-1'}`}>
                      <div>401k Retirement (Pre-tax)</div>
                      <div className="text-red-600">-$80.00</div>
                    </div>
                  </div>
                </div>

                {/* Net Pay Section */}
                <div className={`bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-400 rounded-lg p-4 transition-all duration-300 ${currentStepData.highlight === 'net' ? 'scale-105 shadow-xl border-yellow-400' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xs text-gray-600 mb-1">NET PAY (Take-Home)</div>
                      <div className="text-3xl font-bold text-blue-600">$1,065.60</div>
                    </div>
                    <div className="text-right text-xs text-gray-600">
                      <div>This is what goes</div>
                      <div>in your bank account</div>
                    </div>
                  </div>
                </div>

                {/* Mock Check */}
                <div className="mt-6 p-4 bg-gradient-to-r from-cyan-50 to-blue-100 border-2 border-blue-300 rounded-lg">
                  <div className="flex justify-between items-start mb-3">
                    <div className="text-xs">
                      <div className="font-bold text-blue-800">SPROUT COMPANY</div>
                      <div className="text-gray-600">123 Business Ave</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-600">Check Number</div>
                      <div className="font-bold">9999</div>
                      <div className="text-xs text-gray-600 mt-1">Date</div>
                      <div className="font-bold">1/16/24</div>
                    </div>
                  </div>
                  <div className="border-t border-b border-blue-300 py-3 mb-3">
                    <div className="text-xs text-gray-600 mb-1">PAY TO THE ORDER OF</div>
                    <div className="font-bold text-lg">{userName}</div>
                    <div className="text-right mt-2">
                      <span className="text-2xl font-bold text-blue-600">$1,065.60</span>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 text-center">
                    One thousand sixty-five dollars and 60/100
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500 p-6 rounded-lg mb-4">
                <p className="text-gray-800 whitespace-pre-line leading-relaxed">{currentStepData.content}</p>
              </div>

              {/* Tip */}
              <div className="bg-gradient-to-r bg-[#E6F5EF] border-l-4 border-[#2D9B6F] p-4 rounded-lg">
                <p className="text-sm text-green-900 font-medium">{currentStepData.tip}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrev}
          disabled={currentStep === 0}
          variant="outline"
          className="h-12 px-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 w-2 rounded-full transition-all ${
                index === currentStep
                  ? 'bg-blue-600 w-8'
                  : index < currentStep
                  ? 'bg-blue-400'
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length - 1}
          className="h-12 px-6 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
        >
          Next
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
