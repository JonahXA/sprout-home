import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";

export default function PromptWorkshop({ onComplete }) {
 const [currentTask, setCurrentTask] = useState(0);
 const [userPrompt, setUserPrompt] = useState("");
 const [evaluated, setEvaluated] = useState(false);
 const [score, setScore] = useState(0);

 const tasks = [
 {
 task: "Get AI to explain photosynthesis to a 9th grader",
 weakExample: "Explain photosynthesis",
 strongExample: "Explain photosynthesis to a 9th grader in 5 bullet points, including one real-world analogy they can relate to",
 criteria: ["mentions audience (9th grader)", "specifies format", "clear and specific"],
 tips: "Include WHO the audience is, WHAT format you want, and HOW detailed"
 },
 {
 task: "Create practice questions for studying biology",
 weakExample: "Give me questions about biology",
 strongExample: "Create 5 multiple-choice questions about cellular respiration for a high school biology test. Include explanations for the correct answers.",
 criteria: ["specific topic", "number of questions", "format specified", "mentions explanations"],
 tips: "Be specific about the topic, quantity, format, and what extra info you need"
 },
 {
 task: "Get feedback on a paragraph you wrote",
 weakExample: "Make this better",
 strongExample: "Review this paragraph for clarity and conciseness. Suggest 2-3 specific improvements. [paragraph text]",
 criteria: ["what to review for", "number of suggestions", "specific request"],
 tips: "Specify WHAT to improve, HOW MANY suggestions, and include your actual text"
 }
 ];

 const task = tasks[currentTask];

 const evaluatePrompt = () => {
 const prompt = userPrompt.toLowerCase();
 let points = 0;

 task.criteria.forEach(criterion => {
 if (criterion === "mentions audience (9th grader)" && (prompt.includes("9th grade") || prompt.includes("high school"))) points++;
 if (criterion === "specifies format" && (prompt.includes("bullet") || prompt.includes("points") || prompt.includes("list"))) points++;
 if (criterion === "clear and specific" && prompt.length > 30) points++;
 if (criterion === "specific topic" && (prompt.includes("cellular") || prompt.includes("respiration") || prompt.includes("mitochondria"))) points++;
 if (criterion === "number of questions" && /\d+/.test(prompt)) points++;
 if (criterion === "format specified" && (prompt.includes("multiple") || prompt.includes("choice") || prompt.includes("quiz"))) points++;
 if (criterion === "mentions explanations" && (prompt.includes("explanation") || prompt.includes("explain") || prompt.includes("why"))) points++;
 if (criterion === "what to review for" && (prompt.includes("clarity") || prompt.includes("concise") || prompt.includes("grammar"))) points++;
 if (criterion === "number of suggestions" && /\d+/.test(prompt)) points++;
 if (criterion === "specific request" && prompt.length > 20) points++;
 });

 setScore(points);
 setEvaluated(true);
 };

 const handleNext = () => {
 setEvaluated(false);
 setUserPrompt("");
 setScore(0);
 if (currentTask < tasks.length - 1) {
 setCurrentTask(currentTask + 1);
 } else {
 onComplete && onComplete();
 }
 };

 return (
 <div className="space-y-6">
 <div className="text-center">
 <Badge className="mb-2">Task {currentTask + 1} of {tasks.length}</Badge>
 <h3 className="text-2xl font-bold text-gray-900 mb-2">Write a Strong Prompt</h3>
 <p className="text-gray-600">{task.task}</p>
 </div>

 {/* Show weak vs strong examples */}
 <div className="grid md:grid-cols-2 gap-4">
 <Card className="border-2 border-red-200 bg-red-50">
 <CardContent className="pt-4">
 <div className="flex items-center gap-2 mb-3">
 <XCircle className="w-5 h-5 text-red-600" />
 <span className="font-bold text-red-900">Weak Prompt:</span>
 </div>
 <p className="text-sm text-gray-700 italic">"{task.weakExample}"</p>
 <p className="text-xs text-red-700 mt-2">Too vague, no context or constraints</p>
 </CardContent>
 </Card>

 <Card className="border-2 border-[#2D9B6F]/30 bg-[#E6F5EF]">
 <CardContent className="pt-4">
 <div className="flex items-center gap-2 mb-3">
 <CheckCircle className="w-5 h-5 text-[#2D9B6F]" />
 <span className="font-bold text-green-900">Strong Prompt:</span>
 </div>
 <p className="text-sm text-gray-700 italic">"{task.strongExample}"</p>
 <p className="text-xs text-[#2D9B6F] mt-2">Specific, clear audience, format defined</p>
 </CardContent>
 </Card>
 </div>

 {/* User input */}
 <Card className="border-2 border-purple-200">
 <CardContent className="pt-6 space-y-4">
 <div>
 <label className="block font-semibold text-gray-900 mb-2">
 Now you try! Write your prompt:
 </label>
 <Textarea
 value={userPrompt}
 onChange={(e) => setUserPrompt(e.target.value)}
 placeholder="Type your prompt here..."
 className="h-32 text-base border-2"
 disabled={evaluated}
 />
 </div>

 <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
 <Lightbulb className="w-5 h-5 text-blue-600 inline mr-2" />
 <span className="font-semibold text-gray-900">Tip:</span>
 <p className="text-sm text-gray-700 mt-1">{task.tips}</p>
 </div>

 {!evaluated ? (
 <Button
 onClick={evaluatePrompt}
 disabled={userPrompt.length < 10}
 className="w-full h-12 bg-purple-600 hover:bg-purple-700"
 >
 Evaluate My Prompt
 </Button>
 ) : (
 <div className="space-y-4">
 <Card className={`border-2 ${score >= task.criteria.length * 0.7 ? 'border-[#2D9B6F] bg-[#E6F5EF]' : 'border-orange-400 bg-orange-50'}`}>
 <CardContent className="pt-6">
 <div className="text-center mb-4">
 <div className="text-4xl font-bold mb-2">
 {score}/{task.criteria.length}
 </div>
 <p className="text-gray-700">
 {score >= task.criteria.length * 0.7 ? "Great prompt! " : "Good start! Try adding more details."}
 </p>
 </div>

 <div className="space-y-2">
 <p className="font-semibold text-gray-900">Checklist:</p>
 {task.criteria.map((criterion, i) => (
 <div key={i} className="flex items-center gap-2 text-sm">
 <div className="w-5 h-5">
 {userPrompt.toLowerCase().includes(criterion.split(" ")[0].toLowerCase()) ? (
 <CheckCircle className="w-5 h-5 text-[#2D9B6F]" />
 ) : (
 <XCircle className="w-5 h-5 text-gray-400" />
 )}
 </div>
 <span className="text-gray-700">{criterion}</span>
 </div>
 ))}
 </div>
 </CardContent>
 </Card>

 <Button
 onClick={handleNext}
 className="w-full h-12 bg-purple-600 hover:bg-purple-700"
 >
 {currentTask < tasks.length - 1 ? "Next Task →" : "Complete Workshop →"}
 </Button>
 </div>
 )}
 </CardContent>
 </Card>
 </div>
 );
}
