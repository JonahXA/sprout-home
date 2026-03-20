import React, { useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle, XCircle, Trophy, Zap, Target, Lightbulb } from "lucide-react";

export default function InteractiveQuiz({ questions, onComplete }) {
 const [currentQuestion, setCurrentQuestion] = useState(0);
 const [answers, setAnswers] = useState({});
 const [showExplanation, setShowExplanation] = useState(false);
 const [quizComplete, setQuizComplete] = useState(false);

 const question = questions[currentQuestion];
 const userAnswer = answers[currentQuestion];
 const isCorrect = userAnswer === question.correct_answer;
 const score = Object.keys(answers).filter((key) => answers[key] === questions[key].correct_answer).length;

 const handleAnswer = (answerIndex) => {
 if (userAnswer !== undefined) return;
 setAnswers((prev) => ({ ...prev, [currentQuestion]: answerIndex }));
 setShowExplanation(true);
 };

 const handleNext = () => {
 if (currentQuestion < questions.length - 1) {
 setCurrentQuestion((q) => q + 1);
 setShowExplanation(false);
 } else {
 setQuizComplete(true);
 }
 };

 const handlePrevious = () => {
 if (currentQuestion > 0) {
 setCurrentQuestion((q) => q - 1);
 setShowExplanation(answers[currentQuestion - 1] !== undefined);
 }
 };

 if (quizComplete) {
 const percentage = Math.round((score / questions.length) * 100);
 const passed = percentage >= 80;

 return (
 <Card className={`border-none shadow-2xl ${passed ? "bg-[#1B2B5E]" : "bg-[#DC2626]"} text-white`}>
 <CardContent className="p-8 md:p-12 text-center">
 {passed ? (
 <>
 <Trophy className="w-32 h-32 mx-auto mb-6 animate-bounce" />
 <h2 className="text-5xl md:text-6xl font-bold mb-4">Amazing Work!</h2>
 <p className="text-7xl font-bold mb-6">{percentage}%</p>
 <p className="text-2xl opacity-90 mb-8">You scored {score} out of {questions.length} correct!</p>
 <div className="flex items-center justify-center gap-3 mb-10 text-3xl font-bold">
 <Zap className="w-10 h-10" />
 Knowledge Mastered!
 </div>
 <Button onClick={() => onComplete?.(score)} className="bg-white text-[#2D9B6F] hover:bg-gray-100 h-16 px-12 text-xl shadow-2xl">
 Continue Learning
 </Button>
 </>
 ) : (
 <>
 <Target className="w-32 h-32 mx-auto mb-6" />
 <h2 className="text-5xl font-bold mb-4">Keep Practicing!</h2>
 <p className="text-7xl font-bold mb-6">{percentage}%</p>
 <p className="text-2xl opacity-90 mb-10">
 You scored {score} out of {questions.length}. Review and try again to master this!
 </p>
 <div className="flex gap-4 justify-center flex-wrap">
 <Button
 onClick={() => {
 setAnswers({});
 setCurrentQuestion(0);
 setQuizComplete(false);
 setShowExplanation(false);
 }}
 className="bg-white text-[#1B2B5E] hover:bg-gray-100 h-14 px-8 text-lg"
 >
 Try Again
 </Button>
 <Button onClick={() => onComplete?.(score)} variant="outline" className="h-14 px-8 text-lg bg-white/20 border-2 border-white text-white hover:bg-white/30">
 Continue Anyway
 </Button>
 </div>
 </>
 )}
 </CardContent>
 </Card>
 );
 }

 const progress = ((currentQuestion + 1) / questions.length) * 100;

 return (
 <div className="space-y-6">
 {/* Progress Bar */}
 <div className="space-y-2">
 <div className="flex justify-between text-sm text-gray-600">
 <span>
 Question {currentQuestion + 1} of {questions.length}
 </span>
 <span>{Math.round(progress)}%</span>
 </div>
 <Progress value={progress} className="h-2" />
 </div>

 {/* Question Card */}
 <AnimatePresence mode="wait">
 <motion.div
 key={currentQuestion}
 initial={{ opacity: 0, x: 20 }}
 animate={{ opacity: 1, x: 0 }}
 exit={{ opacity: 0, x: -20 }}
 transition={{ duration: 0.3 }}
 >
 <Card className="border-2 border-gray-200 shadow-xl">
 <CardContent className="p-6 md:p-8">
 <div className="flex items-start gap-4 mb-6">
 <div className="w-14 h-14 rounded-xl bg-[#1B2B5E] flex items-center justify-center flex-shrink-0 shadow-lg text-white font-bold text-xl">
 {currentQuestion + 1}
 </div>
 <div className="flex-1">
 <Badge className="mb-2 bg-[#E6F5EF] text-[#2D9B6F]">Interactive Quiz</Badge>
 <h3 className="text-2xl font-bold text-gray-900 mb-4">{question.question}</h3>

 {question.scenario && (
 <div className="bg-[#E8F0FE] p-4 rounded-xl border-l-4 border-[#1B2B5E] mb-6">
 <p className="text-gray-700">{question.scenario}</p>
 </div>
 )}
 </div>
 </div>

 {/* Answer Options */}
 <div className="space-y-3 mb-6">
 {question.options.map((option, idx) => {
 const isSelected = userAnswer === idx;
 const isCorrectAnswer = idx === question.correct_answer;
 const showResult = userAnswer !== undefined;

 return (
 <button
 key={idx}
 onClick={() => handleAnswer(idx)}
 disabled={userAnswer !== undefined}
 className={`w-full p-5 rounded-xl text-left transition-all font-medium text-base relative overflow-hidden group ${
 showResult
 ? isCorrectAnswer
 ? "bg-[#1B2B5E] text-white border-2 border-green-600 shadow-lg"
 : isSelected
 ? "bg-[#FEF2F2] text-[#DC2626] border-2 border-[#DC2626]"
 : "bg-gray-100 border-2 border-gray-300 text-gray-500"
 : isSelected
 ? "bg-[#1B2B5E] text-white border-2 border-[#243570] shadow-lg"
 : "bg-white border-2 border-gray-300 hover:border-[#1B2B5E] hover:shadow-md text-gray-700 cursor-pointer"
 }`}
 >
 <div className="flex items-center justify-between relative z-10">
 <span>{option}</span>
 {showResult && isCorrectAnswer && <CheckCircle className="w-6 h-6 flex-shrink-0 ml-2" />}
 {showResult && isSelected && !isCorrectAnswer && <XCircle className="w-6 h-6 flex-shrink-0 ml-2" />}
 </div>
 </button>
 );
 })}
 </div>

 {/* Explanation */}
 {showExplanation && question.explanation && (
 <motion.div
 initial={{ opacity: 0, y: -10 }}
 animate={{ opacity: 1, y: 0 }}
 className={`p-5 rounded-xl border-l-4 ${
 isCorrect ? "bg-[#E6F5EF] border-[#2D9B6F]" : "bg-[#E8F0FE] border-[#1B2B5E]"
 }`}
 >
 <div className="flex items-start gap-3">
 <Lightbulb className={`w-5 h-5 flex-shrink-0 mt-0.5 ${isCorrect ? "text-[#2D9B6F]" : "text-[#1B2B5E]"}`} />
 <div>
 <p className="font-semibold mb-1 text-gray-900">{isCorrect ? "Correct!" : "Not quite!"}</p>
 <p className="text-sm text-gray-700">{question.explanation}</p>
 </div>
 </div>
 </motion.div>
 )}
 </CardContent>
 </Card>
 </motion.div>
 </AnimatePresence>

 {/* Navigation */}
 <div className="flex justify-between gap-4">
 <Button onClick={handlePrevious} disabled={currentQuestion === 0} variant="outline" className="h-12 px-6">
 <ChevronLeft className="w-5 h-5 mr-2" />
 Previous
 </Button>
 <Button
 onClick={handleNext}
 disabled={userAnswer === undefined}
 className="h-12 px-6 bg-[#1B2B5E] hover:bg-[#141E43]"
 >
 {currentQuestion === questions.length - 1 ? "Finish" : "Continue"}
 <ChevronRight className="w-5 h-5 ml-2" />
 </Button>
 </div>
 </div>
 );
}
