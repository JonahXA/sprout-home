import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Flag } from "lucide-react";
import { motion } from "framer-motion";

export default function HallucinationDetector({ onComplete }) {
 const [currentQ, setCurrentQ] = useState(0);
 const [answers, setAnswers] = useState({});
 const [showResult, setShowResult] = useState(false);

 const scenarios = [
 {
 prompt: "What are some research papers about AI ethics?",
 response:
 "Here are three important papers:\n\n1. \"Ethics in AI Systems\" by Smith et al. (2019) in the Journal of AI Research\n2. \"Fairness and Machine Learning\" by Johnson & Lee (2020) in Nature AI\n3. \"Bias in Neural Networks\" by Chen (2021) in AI Review",
 isHallucination: true,
 explanation:
 "These papers don't exist! AI made up plausible-sounding titles, authors, and journals. Always verify citations.",
 redFlags: ["Specific citations without links", "Perfect formatting", "No way to verify"],
 },
 {
 prompt: "Explain how photosynthesis works",
 response:
 "Photosynthesis is the process where plants convert sunlight into energy. Chlorophyll in the leaves absorbs light, which helps convert CO2 and water into glucose and oxygen. The equation is: 6CO2 + 6H2O + light → C6H12O6 + 6O2",
 isHallucination: false,
 explanation:
 "This is accurate! It's basic science that the AI learned from reliable sources in its training data.",
 redFlags: [],
 },
 {
 prompt: "When was the Eiffel Tower moved to Rome?",
 response:
 "The Eiffel Tower was relocated to Rome in 1967 as a symbol of European unity. The move was supervised by architect Paolo Rossi and took 18 months. It now stands near the Colosseum as a tourist attraction.",
 isHallucination: true,
 explanation:
 "Complete fabrication! The Eiffel Tower has never moved from Paris. AI generated a plausible story for an impossible premise.",
 redFlags: ["Answering an absurd question seriously", "Specific false details", "No skepticism about the premise"],
 },
 {
 prompt: "What's 2 + 2?",
 response: "2 + 2 = 4",
 isHallucination: false,
 explanation: "Correct! Simple math that AI can handle reliably.",
 redFlags: [],
 },
 {
 prompt: "Tell me about the Battle of Northfield Pass in 1847",
 response:
 "The Battle of Northfield Pass (1847) was a decisive conflict during the Mexican-American War. General John Thompson led 3,000 troops against Mexican forces. The battle lasted three days and resulted in 427 casualties. It's considered a turning point in the war.",
 isHallucination: true,
 explanation:
 "Made-up battle with fake details! The Mexican-American War did happen, but this battle never occurred. AI created plausible historical-sounding fiction.",
 redFlags: ["Obscure event with specific details", "Can't find this in history books", "Too perfect narrative"],
 },
 ];

 const scenario = scenarios[currentQ];
 const userAnswer = answers[currentQ];
 const score = Object.keys(answers).filter((k) => answers[k] === scenarios[k].isHallucination).length;

 const handleAnswer = (isHallucination) => {
 setAnswers((prev) => ({ ...prev, [currentQ]: isHallucination }));
 setShowResult(true);
 };

 const handleNext = () => {
 setShowResult(false);
 if (currentQ < scenarios.length - 1) {
 setCurrentQ((q) => q + 1);
 } else {
 onComplete?.(score);
 }
 };

 return (
 <div className="space-y-4">
 <div className="text-center">
 <Badge className="mb-2">
 Question {currentQ + 1} of {scenarios.length}
 </Badge>
 <h3 className="text-xl font-bold text-gray-900 mb-4">
 Is This AI Response Accurate or Hallucinated?
 </h3>
 </div>

 <Card className="border-2 border-yellow-200 bg-yellow-50">
 <CardContent className="pt-6 space-y-4">
 <div>
 <div className="text-sm font-semibold text-gray-600 mb-2">Prompt:</div>
 <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
 <p className="text-gray-800 italic">"{scenario.prompt}"</p>
 </div>
 </div>

 <div>
 <div className="text-sm font-semibold text-gray-600 mb-2">AI Response:</div>
 <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
 <p className="text-gray-800 whitespace-pre-line">{scenario.response}</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {!showResult ? (
 <div className="grid grid-cols-2 gap-4">
 <Button onClick={() => handleAnswer(false)} className="h-20 text-lg bg-green-600 hover:bg-green-700">
 <CheckCircle className="w-6 h-6 mr-2" />
 Accurate 
 </Button>
 <Button onClick={() => handleAnswer(true)} className="h-20 text-lg bg-red-600 hover:bg-red-700">
 <AlertTriangle className="w-6 h-6 mr-2" />
 Hallucination!
 </Button>
 </div>
 ) : (
 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
 <Card
 className={`border-2 ${
 userAnswer === scenario.isHallucination ? "border-[#2D9B6F] bg-[#E6F5EF]" : "border-red-400 bg-red-50"
 }`}
 >
 <CardContent className="pt-6 space-y-4">
 <div className="text-center">
 {userAnswer === scenario.isHallucination ? (
 <>
 <CheckCircle className="w-12 h-12 mx-auto text-[#2D9B6F] mb-2" />
 <h4 className="text-xl font-bold text-green-900">Correct!</h4>
 </>
 ) : (
 <>
 <XCircle className="w-12 h-12 mx-auto text-red-600 mb-2" />
 <h4 className="text-xl font-bold text-red-900">Not Quite</h4>
 </>
 )}
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-[#1B2B5E]">
 <p className="font-semibold text-gray-900 mb-2">
 This is {scenario.isHallucination ? "a HALLUCINATION " : "ACCURATE "}
 </p>
 <p className="text-sm text-gray-700">{scenario.explanation}</p>
 </div>

 {scenario.redFlags.length > 0 && (
 <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
 <p className="font-semibold text-gray-900 mb-2 flex items-center gap-2"><Flag className="w-4 h-4 text-red-500" /> Red Flags:</p>
 <ul className="text-sm text-gray-700 space-y-1">
 {scenario.redFlags.map((flag, i) => (
 <li key={i}>• {flag}</li>
 ))}
 </ul>
 </div>
 )}

 <Button onClick={handleNext} className="w-full h-12 bg-[#1B2B5E] hover:bg-purple-700">
 {currentQ < scenarios.length - 1 ? "Next Question →" : "Finish →"}
 </Button>
 </CardContent>
 </Card>
 </motion.div>
 )}
 </div>
 );
}
