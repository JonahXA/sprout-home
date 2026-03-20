import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ArrowRight, ArrowLeft, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreditCardStatement() {
 const [currentStep, setCurrentStep] = useState(0);

 const steps = [
 {
 id: "intro",
 title: "This Is Your First Credit Card Statement",
 description:
 "Don't worry—we'll walk through it together, step by step. Understanding your statement is the key to avoiding debt and building great credit!",
 highlight: null,
 content:
 "A credit card statement shows everything that happened with your card in the past month. Think of it like a report card for your spending.",
 tip: "Tip: Reading your statement carefully every month helps you catch fraud and stay on budget.",
 },
 {
 id: "header",
 title: "Statement Header",
 description: "This is your account information at a glance.",
 highlight: "header",
 content:
 "Your statement date is when the billing period ended. Your payment due date is when you need to pay to avoid fees. These are NOT the same!",
 tip: "Important: Your credit limit isn't \"free money\"—it's the maximum you can borrow, and you have to pay it back.",
 },
 {
 id: "previous",
 title: "Previous Balance",
 description: "This is what you owed from last month.",
 highlight: "previous",
 content:
 "If you didn't pay your balance in full last month, it shows up here. That's how balances \"carry over\" and start collecting interest.",
 tip: "Pro Tip: If this number is $0, that means you paid off everything last month. That's exactly what you want!",
 },
 {
 id: "purchases",
 title: "New Purchases",
 description: "Everything you bought this month.",
 highlight: "purchases",
 content:
 "This section shows all the charges you made during the billing period. Each swipe, tap, or online purchase adds to your balance.",
 tip: "Watch out: Some transactions take a few days to \"post\" (show up officially). Always check your app for pending charges.",
 },
 {
 id: "payments",
 title: "Payments & Credits",
 description: "Money you paid back or refunds you received.",
 highlight: "payments",
 content:
 "Payments reduce your balance. Credits come from returns or refunds. Timing matters—payments made after the statement date won't show up until next month.",
 tip: "Smart Move: Set up autopay for at least the minimum payment so you never miss a due date.",
 },
 {
 id: "total",
 title: "Total Amount Due",
 description: "What you actually owe right now.",
 highlight: "total",
 content:
 "This is the number that matters most. Previous Balance + New Purchases - Payments = Total Amount Due.",
 tip: "Goal: Pay this full amount by the due date to avoid interest charges completely.",
 },
 {
 id: "minimum",
 title: "Minimum Payment",
 description: "The smallest amount you can pay—but it's a trap.",
 highlight: "minimum",
 content:
 "Only paying the minimum keeps your account in \"good standing,\" but you'll pay massive interest on the rest. A $1,000 balance can take years to pay off and cost hundreds in interest!",
 tip: "Sprout Advice: Always pay the statement balance in full if you can. If you can't, pay as much as possible above the minimum.",
 },
 {
 id: "transactions",
 title: "Transaction Details",
 description: "Your complete spending history.",
 highlight: "transactions",
 content:
 "Review this list every month. Look for charges you don't recognize—fraud happens! Each line shows the date, merchant, and amount.",
 tip: "Safety Check: If you see something suspicious, contact your bank immediately. Most fraud is covered if you report it quickly.",
 },
 {
 id: "education",
 title: "How This Affects Your Credit",
 description: "Two key factors that impact your credit score:",
 highlight: null,
 content:
 "1) On-Time Payments (35% of your score): Pay by the due date, every month. Even one late payment can hurt your score for years.\n\n2) Credit Utilization (30% of your score): Keep your balance below 30% of your limit. Using $500 of a $1,000 limit = 50% utilization = bad for your score.",
 tip: "Credit Building Tip: Pay in full, on time, every month. That's the formula for a great credit score.",
 },
 ];

 const currentStepData = steps[currentStep];

 const handleNext = () => {
 if (currentStep < steps.length - 1) setCurrentStep((s) => s + 1);
 };
 const handlePrev = () => {
 if (currentStep > 0) setCurrentStep((s) => s - 1);
 };

 return (
 <div className="space-y-6">
 {/* Progress */}
 <div className="flex items-center justify-between mb-2">
 <p className="text-sm text-gray-600">
 Step {currentStep + 1} of {steps.length}
 </p>
 <Badge className="bg-[#E6F5EF] text-[#2D9B6F]">Credit Card Basics</Badge>
 </div>

 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
 <motion.div
 className="h-full bg-[#1B2B5E]"
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
 <Card className="border-2 border-gray-200 shadow-xl">
 <CardContent className="p-8">
 <div className="mb-6">
 <h2 className="text-3xl font-bold text-gray-900 mb-3 flex items-center gap-3">
 <CreditCard className="w-8 h-8 text-[#1B2B5E]" />
 {currentStepData.title}
 </h2>
 <p className="text-lg text-gray-700">{currentStepData.description}</p>
 </div>

 {/* Mock Statement */}
 <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-6 font-mono text-sm relative overflow-hidden">
 {/* Header */}
 <div
 className={`transition-all duration-300 ${
 currentStepData.highlight === "header"
 ? "bg-[#E8F0FE] border-2 border-[#1B2B5E] rounded-lg p-4 scale-105 shadow-lg"
 : "p-2"
 }`}
 >
 <div className="flex justify-between items-start mb-4">
 <div>
 <div className="text-[#1B2B5E] font-bold text-xl mb-2">SPROUT BANK</div>
 <div className="text-gray-700 font-semibold">CREDIT CARD ACCOUNT</div>
 </div>
 <div className="text-right">
 <div className="text-xs text-gray-600 mb-1">Account Number</div>
 <div className="font-bold">**** **** **** 1234</div>
 <div className="text-xs text-gray-600 mt-2 mb-1">Credit Limit</div>
 <div className="font-bold text-[#2D9B6F]">$5,000</div>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-4 mt-4">
 <div className="border border-gray-300 p-2">
 <div className="text-xs text-gray-600">Statement Date</div>
 <div className="font-bold">Jan 23, 2024</div>
 </div>
 <div className="border border-gray-300 p-2">
 <div className="text-xs text-gray-600">Payment Due Date</div>
 <div className="font-bold text-red-600">Feb 15, 2024</div>
 </div>
 </div>
 </div>

 {/* Summary */}
 <div className="mt-4 bg-gray-100 p-4 rounded">
 <div className="grid grid-cols-4 gap-2 text-center text-xs font-bold border-b border-gray-400 pb-2 mb-2">
 <div>Previous Balance</div>
 <div>+ Purchases/Debits</div>
 <div>- Payments/Credits</div>
 <div>= Total Amount Due</div>
 </div>
 <div className="grid grid-cols-4 gap-2 text-center">
 <div
 className={`transition-all duration-300 ${
 currentStepData.highlight === "previous"
 ? "bg-[#E8F0FE] border-2 border-[#1B2B5E] rounded p-2 font-bold text-base"
 : "p-2"
 }`}
 >
 $1,250.00
 </div>
 <div
 className={`transition-all duration-300 ${
 currentStepData.highlight === "purchases"
 ? "bg-[#E8F0FE] border-2 border-[#1B2B5E] rounded p-2 font-bold text-base"
 : "p-2"
 }`}
 >
 $850.00
 </div>
 <div
 className={`transition-all duration-300 ${
 currentStepData.highlight === "payments"
 ? "bg-[#E8F0FE] border-2 border-[#1B2B5E] rounded p-2 font-bold text-base"
 : "p-2"
 }`}
 >
 $500.00
 </div>
 <div
 className={`transition-all duration-300 ${
 currentStepData.highlight === "total"
 ? "bg-[#E8F0FE] border-2 border-[#1B2B5E] rounded p-2 font-bold text-lg"
 : "p-2 font-bold text-base"
 }`}
 >
 $1,600.00
 </div>
 </div>
 </div>

 {/* Payment Info */}
 <div className="mt-4 grid grid-cols-2 gap-4">
 <div
 className={`border border-gray-300 p-3 rounded transition-all duration-300 ${
 currentStepData.highlight === "total" ? "bg-[#E8F0FE] border-[#1B2B5E] scale-105" : ""
 }`}
 >
 <div className="text-xs text-gray-600">Total Amount Due</div>
 <div className="font-bold text-xl text-red-600">$1,600.00</div>
 </div>
 <div
 className={`border border-gray-300 p-3 rounded transition-all duration-300 ${
 currentStepData.highlight === "minimum" ? "bg-[#E8F0FE] border-[#1B2B5E] scale-105" : ""
 }`}
 >
 <div className="text-xs text-gray-600">Minimum Amount Due</div>
 <div className="font-bold text-xl text-[#1B2B5E]">$50.00</div>
 </div>
 </div>

 {/* Transactions */}
 <div
 className={`mt-6 transition-all duration-300 ${
 currentStepData.highlight === "transactions"
 ? "bg-[#E8F0FE] border-2 border-[#1B2B5E] rounded-lg p-4 scale-105"
 : "p-2"
 }`}
 >
 <div className="font-bold text-base mb-3 text-gray-800">TRANSACTION DETAILS</div>
 <div className="space-y-2 text-xs">
 <div className="flex justify-between border-b pb-1">
 <span className="text-gray-600">Date</span>
 <span className="text-gray-600">Description</span>
 <span className="text-gray-600">Amount</span>
 </div>
 <div className="flex justify-between">
 <span>01/20</span>
 <span>Coffee Shop</span>
 <span>$12.50</span>
 </div>
 <div className="flex justify-between">
 <span>01/18</span>
 <span>Online Shopping</span>
 <span>$89.99</span>
 </div>
 <div className="flex justify-between">
 <span>01/15</span>
 <span>Gas Station</span>
 <span>$45.00</span>
 </div>
 <div className="flex justify-between">
 <span>01/12</span>
 <span>Restaurant</span>
 <span>$67.80</span>
 </div>
 <div className="flex justify-between">
 <span>01/10</span>
 <span>Grocery Store</span>
 <span>$134.50</span>
 </div>
 <div className="flex justify-between border-t pt-2 font-bold">
 <span>PAYMENT - Thank You</span>
 <span />
 <span className="text-[#2D9B6F]">-$500.00</span>
 </div>
 </div>
 </div>

 <div className="mt-6 text-center text-xs text-gray-500 border-t pt-4">*** END OF STATEMENT ***</div>
 </div>

 {/* Explanation */}
 <div className="bg-[#E8F0FE] border-l-4 border-[#1B2B5E] p-6 rounded-lg mb-4">
 <p className="text-gray-800 whitespace-pre-line leading-relaxed">{currentStepData.content}</p>
 </div>

 {/* Tip */}
 <div className="bg-[#E8F0FE] border-l-4 border-[#1B2B5E] p-4 rounded-lg">
 <p className="text-sm text-blue-900 font-medium">{currentStepData.tip}</p>
 </div>
 </CardContent>
 </Card>
 </motion.div>
 </AnimatePresence>

 {/* Navigation */}
 <div className="flex justify-between items-center">
 <Button onClick={handlePrev} disabled={currentStep === 0} variant="outline" className="h-12 px-6">
 <ArrowLeft className="w-4 h-4 mr-2" />
 Previous
 </Button>

 <div className="flex gap-2">
 {steps.map((_, index) => (
 <div
 key={index}
 className={`h-2 w-2 rounded-full transition-all ${
 index === currentStep ? "bg-[#1B2B5E] w-8" : index < currentStep ? "bg-[#243570]" : "bg-gray-300"
 }`}
 />
 ))}
 </div>

 <Button
 onClick={handleNext}
 disabled={currentStep === steps.length - 1}
 className="h-12 px-6 bg-[#1B2B5E] hover:bg-[#141E43]"
 >
 Next
 <ArrowRight className="w-4 h-4 ml-2" />
 </Button>
 </div>
 </div>
 );
}
