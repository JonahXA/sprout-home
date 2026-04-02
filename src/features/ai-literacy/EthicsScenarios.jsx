import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Scale, AlertTriangle, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function EthicsScenarios({ onComplete }) {
 const [currentScenario, setCurrentScenario] = useState(0);
 const [choices, setChoices] = useState({});
 const [showFeedback, setShowFeedback] = useState(false);

 const scenarios = [
 {
 title: "Hiring Algorithm Bias",
 scenario:
 "Your company uses an AI to screen resumes. You discover it's rejecting qualified women because it was trained on historical data from when the company mostly hired men. What do you do?",
 options: [
 {
 text: "Keep using it - it's just following the data",
 isEthical: false,
 feedback:
 "This perpetuates discrimination. AI trained on biased data will be biased. We must fix the training data and retrain the model.",
 },
 {
 text: "Stop using it and retrain with balanced data",
 isEthical: true,
 feedback:
 "Correct! We need to audit for bias, collect representative data, and test across all demographic groups before deploying.",
 },
 {
 text: "Use it but manually review flagged candidates",
 isEthical: false,
 feedback:
 "This is a band-aid solution. The root problem is biased training data. Human review helps but doesn't fix the underlying issue.",
 },
 ],
 },
 {
 title: "Facial Recognition Surveillance",
 scenario:
 "Your school wants to use facial recognition for attendance and security. It's convenient but means constant surveillance. Students weren't asked for consent.",
 options: [
 {
 text: "Implement it - it makes things easier",
 isEthical: false,
 feedback:
 "This violates privacy without consent. Students should have a say, and surveillance has serious implications for freedom and trust.",
 },
 {
 text: "Get student/parent consent and limit use",
 isEthical: true,
 feedback:
 "Much better! Informed consent, clear policies on data use, and limited scope protect privacy while potentially allowing helpful uses.",
 },
 {
 text: "Don't use facial recognition at all",
 isEthical: true,
 feedback:
 "Also valid! Many argue surveillance in schools is inappropriate regardless of consent. The privacy risks may outweigh benefits.",
 },
 ],
 },
 {
 title: "AI-Generated Homework",
 scenario:
 "You can use ChatGPT to write your entire essay. It would save hours and probably get you an A. Your teacher didn't explicitly forbid AI use.",
 options: [
 {
 text: "Have AI write it - it wasn't explicitly banned",
 isEthical: false,
 feedback:
 "This violates academic integrity. The spirit of the assignment is for YOU to learn by doing the work. Not explicitly banned ≠ okay.",
 },
 {
 text: "Use AI to brainstorm, but write it yourself",
 isEthical: true,
 feedback:
 "Good approach! Using AI as a tool to help you learn while doing your own work maintains integrity. Disclose AI use if required.",
 },
 {
 text: "Ask the teacher about AI policy first",
 isEthical: true,
 feedback:
 "Excellent! When in doubt, ask. Clarifying expectations shows integrity and helps establish clear norms for everyone.",
 },
 ],
 },
 {
 title: "Deepfake Detection",
 scenario:
 "You see a shocking video of a politician saying something outrageous. It's going viral. You suspect it might be a deepfake but aren't sure.",
 options: [
 {
 text: "Share it - people need to see this",
 isEthical: false,
 feedback:
 "Spreading potential misinformation is harmful. Deepfakes can destroy reputations and spread false narratives. Verify first!",
 },
 {
 text: "Verify with fact-checkers before sharing",
 isEthical: true,
 feedback:
 "Correct! Check reputable sources, look for verification from news outlets, and examine the video for artifacts. Slow down before spreading.",
 },
 {
 text: "Share with a warning that it might be fake",
 isEthical: false,
 feedback:
 "Still problematic. Most people won't read warnings carefully. If you can't verify it's real, don't amplify it.",
 },
 ],
 },
 {
 title: "AI Decision Accountability",
 scenario:
 "An AI system denies someone a loan. The person asks why. The company says \"the AI decided\" and can't explain the reasoning. Is this acceptable?",
 options: [
 {
 text: "Yes - AI decisions are too complex to explain",
 isEthical: false,
 feedback:
 "Unacceptable! People have a right to understand decisions that affect them. If we can't explain it, we shouldn't use it for high-stakes decisions.",
 },
 {
 text: "No - humans must be able to explain decisions",
 isEthical: true,
 feedback:
 "Correct! Accountability requires explainability. High-stakes AI systems need human oversight and the ability to explain reasoning.",
 },
 {
 text: "Only explain if the decision is challenged legally",
 isEthical: false,
 feedback:
 "Too little, too late. Transparency should be built-in from the start, not only when legally forced. People deserve to understand how they're being evaluated.",
 },
 ],
 },
 ];

 const scenario = scenarios[currentScenario];
 const userChoice = choices[currentScenario];

 const handleChoice = (optionIndex) => {
 setChoices((prev) => ({ ...prev, [currentScenario]: optionIndex }));
 setShowFeedback(true);
 };

 const handleNext = () => {
 setShowFeedback(false);
 if (currentScenario < scenarios.length - 1) {
 setCurrentScenario((s) => s + 1);
 } else {
 const ethicalChoices = Object.keys(choices).filter(
 (key) => scenarios[key].options[choices[key]].isEthical
 ).length;
 onComplete?.(ethicalChoices);
 }
 };

 return (
 <div className="space-y-6">
 <div className="text-center">
 <Scale className="w-12 h-12 mx-auto text-[#1B2B5E] mb-3" />
 <Badge className="mb-2">
 Scenario {currentScenario + 1} of {scenarios.length}
 </Badge>
 <h3 className="text-2xl font-bold text-gray-900 mb-2">{scenario.title}</h3>
 </div>

 <Card className="border-2 border-gray-200 #E8F0FE]">
 <CardContent className="pt-6">
 <p className="text-lg text-gray-800 leading-relaxed">{scenario.scenario}</p>
 </CardContent>
 </Card>

 {!showFeedback ? (
 <div className="space-y-3">
 <p className="font-semibold text-gray-900 text-center mb-4">What would you do?</p>
 {scenario.options.map((option, idx) => (
 <Button
 key={idx}
 onClick={() => handleChoice(idx)}
 className="w-full h-auto py-4 px-6 text-left bg-white hover:bg-gray-50 text-gray-800 border-2 border-gray-300 hover:border-[#1B2B5E] transition-all"
 variant="outline"
 >
 <div className="flex items-start gap-3">
 <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0 mt-1">
 <span className="text-sm font-bold text-[#1B2B5E]">
 {String.fromCharCode(65 + idx)}
 </span>
 </div>
 <span className="text-base">{option.text}</span>
 </div>
 </Button>
 ))}
 </div>
 ) : (
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
 <Card
 className={`border-2 ${
 scenario.options[userChoice].isEthical
 ? "border-[#2D9B6F] bg-[#E6F5EF]"
 : "border-orange-400 bg-orange-50"
 }`}
 >
 <CardContent className="pt-6 space-y-4">
 <div className="text-center">
 {scenario.options[userChoice].isEthical ? (
 <>
 <CheckCircle className="w-12 h-12 mx-auto text-[#2D9B6F] mb-2" />
 <h4 className="text-xl font-bold text-green-900">Ethical Choice </h4>
 </>
 ) : (
 <>
 <AlertTriangle className="w-12 h-12 mx-auto text-[#1B2B5E] mb-2" />
 <h4 className="text-xl font-bold text-orange-900">Consider This...</h4>
 </>
 )}
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-[#1B2B5E]">
 <p className="text-gray-800">{scenario.options[userChoice].feedback}</p>
 </div>

 <Button onClick={handleNext} className="w-full h-12 bg-[#1B2B5E] hover:bg-purple-700">
 {currentScenario < scenarios.length - 1 ? "Next Scenario →" : "See Results →"}
 </Button>
 </CardContent>
 </Card>
 </motion.div>
 )}
 </div>
 );
}
