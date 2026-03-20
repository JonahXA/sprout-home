// src/pages/AIDay1.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, CheckCircle, Brain, Lightbulb, Target } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

import { getCurrentUserSafe, getAIDayProgress, upsertAIDayProgress } from "@/lib/appClient";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay1() {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [user, setUser] = useState(null);
 const [isLoadingUser, setIsLoadingUser] = useState(true);
 const [currentStep, setCurrentStep] = useState(0);
 const [activityComplete, setActivityComplete] = useState(false);

 useEffect(() => {
 const loadUser = async () => {
 try {
 const currentUser = await getCurrentUserSafe();
 setUser(currentUser);
 setIsLoadingUser(false);
 } catch (error) {
 console.error("Error loading user:", error);
 setIsLoadingUser(false);
 }
 };
 loadUser();
 }, [navigate]);

 const { data: dayProgress } = useQuery({
 queryKey: ["aiDayProgress", user?.email, 1],
 queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 1 }),
 enabled: !!user,
 });

 const completeDayMutation = useMutation({
 mutationFn: async (quizScore) => {
 await upsertAIDayProgress({
 user_email: user.email,
 day_number: 1,
 completed: true,
 completed_date: new Date().toISOString(),
 activity_completed: true,
 quiz_score: quizScore,
 time_spent_minutes: 60,
 });
 },
 onSuccess: () => {
 queryClient.invalidateQueries(["aiDayProgress"]);
 navigate(createPageUrl("AILiteracy"));
 },
 });

 const steps = [
 {
 title: "What is AI?",
 type: "concept",
 content: (
 <div className="space-y-6">
 <div className="bg-[#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E]">
 <h3 className="text-xl font-bold text-gray-900 mb-3">Working Definition</h3>
 <p className="text-lg text-gray-700">
 <strong>AI = computer systems that perform tasks associated with human intelligence</strong>
 (perception, language, learning, decision-making).
 </p>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div className="border-2 border-[#2D9B6F]/30 bg-[#E6F5EF] rounded-lg p-4">
 <h4 className="font-bold text-[#2D9B6F] mb-3">Narrow AI (Today)</h4>
 <div className="space-y-2">
 <p className="text-gray-700">Excellent at <strong>specific tasks</strong></p>
 <p className="text-gray-700">Not conscious</p>
 <p className="text-gray-700">Can be wrong with confidence</p>
 <p className="text-sm text-gray-600 mt-3"><strong>Examples:</strong> Face recognition, voice assistants, recommendations</p>
 </div>
 </div>

 <div className="border-2 border-gray-200 bg-gray-50 rounded-lg p-4">
 <h4 className="font-bold text-gray-700 mb-3">General AI (Future)</h4>
 <div className="space-y-2">
 <p className="text-gray-700">? Human-level intelligence</p>
 <p className="text-gray-700">? Flexible reasoning</p>
 <p className="text-gray-700">? Theoretical/not yet real</p>
 <p className="text-sm text-gray-600 mt-3"><strong>Status:</strong> Still science fiction</p>
 </div>
 </div>
 </div>

 <button onClick={() => setCurrentStep(1)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
 Continue <ChevronRight size={18} />
 </button>
 </div>
 ),
 },
 {
 title: "AI in Your Daily Life",
 type: "exploration",
 content: (
 <div className="space-y-6">
 <p className="text-lg text-gray-700">
 Let's explore where you already encounter AI every day...
 </p>

 <div className="grid md:grid-cols-2 gap-4">
 {[
 { category: "Your Phone", items: ["Face unlock", "Autocorrect", "Photo organization", "Voice assistants"] },
 { category: "Social Media", items: ["News feed curation", "Friend suggestions", "Content moderation", "Ad targeting"] },
 { category: "Entertainment", items: ["Netflix recommendations", "Spotify playlists", "YouTube suggestions", "TikTok For You"] },
 { category: "Search & Navigation", items: ["Google Search", "Maps traffic predictions", "Spam filtering", "Smart replies"] }
 ].map((group, idx) => (
 <div key={idx} className="border-2 border-gray-200 hover:border-blue-400 transition-all rounded-lg overflow-hidden">
 <div className="bg-[#E8F0FE] px-4 py-3">
 <h4 className="font-bold text-[#1B2B5E]">{group.category}</h4>
 </div>
 <div className="p-4">
 <ul className="space-y-2">
 {group.items.map((item, i) => (
 <li key={i} className="flex items-center gap-2 text-gray-700">
 <CheckCircle className="w-4 h-4 text-blue-500" />
 {item}
 </li>
 ))}
 </ul>
 </div>
 </div>
 ))}
 </div>

 <button onClick={() => setCurrentStep(2)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
 Continue <ChevronRight size={18} />
 </button>
 </div>
 ),
 },
 {
 title: "Interactive: AI or Human?",
 type: "activity",
 content: (
 <div className="space-y-6">
 <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500">
 <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
 <Lightbulb className="w-6 h-6 text-yellow-600" />
 Test Your AI Detection Skills
 </h3>
 <p className="text-gray-700">
 Read the following responses and guess: Was this written by AI or a human?
 </p>
 </div>

 <AIOrHumanGame onComplete={() => setActivityComplete(true)} />

 {activityComplete && (
 <button onClick={() => setCurrentStep(3)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
 Continue to Quiz <ChevronRight size={18} />
 </button>
 )}
 </div>
 ),
 },
 {
 title: "Checkpoint Quiz",
 type: "quiz",
 content: (
 <div className="space-y-6">
 <InteractiveQuiz
 questions={[
 {
 question: "Which is the best description of most AI used today?",
 options: ["General AI", "Narrow AI", "Human-level consciousness", "Telepathy"],
 correct_answer: 1,
 explanation: "Today's AI is narrow AI - excellent at specific tasks like face recognition or language translation, but not conscious or generally intelligent."
 },
 {
 question: "AI literacy includes:",
 options: ["Only coding", "Only tool use", "Understanding, using, and evaluating AI", "Memorizing model names"],
 correct_answer: 2,
 explanation: "AI literacy is about understanding how AI works, using it effectively, and evaluating it critically and ethically - not just coding or tool use."
 },
 {
 question: "True or False: If AI sounds confident, it is usually correct.",
 options: ["True", "False"],
 correct_answer: 1,
 explanation: "FALSE. AI can be wrong with confidence - sounding certain doesn't mean it's correct. Always verify important claims."
 }
 ]}
 onComplete={(score) => {
 const percentage = Math.round((score / 3) * 100);
 if (percentage >= 66) {
 completeDayMutation.mutate(percentage);
 }
 }}
 />
 </div>
 ),
 },
 ];

 const currentStepData = steps[currentStep];
 const progressPercent = ((currentStep + 1) / steps.length) * 100;

 if (isLoadingUser) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg }}>
 <div style={{ textAlign:"center" }}>
 <div style={{ width:64, height:64, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
 <p style={{ color:C.textSub }}>Loading...</p>
 </div>
 </div>
 );
 }

 return (
 <>
 <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
 <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
 <div className="max-w-4xl mx-auto space-y-6">
 <button onClick={() => navigate(createPageUrl("AILiteracy"))} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer", width:"fit-content" }}>
 <ArrowLeft className="w-4 h-4" />
 Back to Course
 </button>

 <div className="text-center space-y-2">
 <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 1 of 10</span>
 <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
 What is AI and Why AI Literacy Matters
 </h1>
 </div>

 <div style={{ borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", background:C.bg, padding:"16px 20px" }}>
 <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, color:C.textSub, marginBottom:8 }}>
 <span>Step {currentStep + 1} of {steps.length}</span>
 <span style={{ color:C.accent }}>{Math.round(progressPercent)}%</span>
 </div>
 <div style={{ height:6, borderRadius:999, background:C.bgMid, overflow:"hidden" }}>
 <div style={{ height:"100%", width:`${progressPercent}%`, borderRadius:999, background:C.accent, transition:"width 0.3s" }} />
 </div>
 </div>

 <div style={{ borderRadius:20, border:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(0,0,0,0.05)", background:C.bg, overflow:"hidden" }}>
 <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, padding:"20px 28px", color:"#fff", display:"flex", alignItems:"center", gap:10 }}>
 {currentStepData.type === "concept" && <Brain className="w-6 h-6" />}
 {currentStepData.type === "activity" && <Target className="w-6 h-6" />}
 {currentStepData.type === "quiz" && <CheckCircle className="w-6 h-6" />}
 <span style={{ fontSize:17, fontWeight:800 }}>{currentStepData.title}</span>
 </div>
 <div style={{ padding:"28px 32px" }}>
 {currentStepData.content}
 </div>
 </div>

 <div style={{ display:"flex", justifyContent:"center", gap:8 }}>
 {steps.map((_, idx) => (
 <button
 key={idx}
 onClick={() => idx <= currentStep && setCurrentStep(idx)}
 disabled={idx > currentStep}
 style={{ height:10, width:idx === currentStep ? 28 : 10, borderRadius:999, background:idx === currentStep ? C.navy : idx < currentStep ? C.green : C.bgMid, border:"none", cursor:idx > currentStep ? "default" : "pointer", transition:"all 0.2s", padding:0 }}
 />
 ))}
 </div>
 </div>
 </div>
 </>
 );
}

// AI or Human Game Component
function AIOrHumanGame({ onComplete }) {
 const [currentQuestion, setCurrentQuestion] = useState(0);
 const [answers, setAnswers] = useState({});
 const [showResults, setShowResults] = useState(false);

 const questions = [
 {
 text: "The weather today is pleasant with temperatures around 72°F. You might want to bring a light jacket for the evening.",
 answer: "AI",
 explanation: "Generic, formal tone typical of AI weather summaries",
 },
 {
 text: "OMG it's so nice out!! Finally stopped raining lol. Gonna hit the park with my dog 🐕",
 answer: "Human",
 explanation: "Casual tone, emojis, personal details, informal language",
 },
 {
 text: "To optimize your productivity, consider implementing time-blocking techniques and prioritizing high-impact tasks.",
 answer: "AI",
 explanation: "Overly formal, generic advice without personal context",
 },
 {
 text: "I've been trying the pomodoro thing but honestly I just end up scrolling twitter during the breaks lmao",
 answer: "Human",
 explanation: "Self-aware, casual, mentions specific apps, relatable struggles",
 },
 ];

 const handleAnswer = (userAnswer) => {
 setAnswers({ ...answers, [currentQuestion]: userAnswer });

 if (currentQuestion < questions.length - 1) {
 setTimeout(() => setCurrentQuestion(currentQuestion + 1), 1500);
 } else {
 setTimeout(() => {
 setShowResults(true);
 onComplete();
 }, 1500);
 }
 };

 const score = Object.keys(answers).filter((key) => answers[key] === questions[key].answer).length;

 if (showResults) {
 return (
 <div className="border-2 border-[#2D9B6F]/30 bg-[#E6F5EF] rounded-lg p-6 text-center">
 <CheckCircle className="w-16 h-16 text-[#2D9B6F] mx-auto mb-4" />
 <h3 className="text-2xl font-bold text-gray-900 mb-2">
 You scored {score}/{questions.length}!
 </h3>
 <p className="text-gray-700 mb-4">
 {score >= 3 ? "Great job detecting AI!" : "Keep practicing your AI detection skills!"}
 </p>
 <div className="text-left space-y-3">
 <p className="font-semibold text-gray-900">Key Takeaways:</p>
 <ul className="space-y-2 text-gray-700">
 <li>• AI often uses formal, generic language</li>
 <li>• Humans use slang, emojis, and personal details</li>
 <li>• Context and tone are important clues</li>
 <li>• AI can sound confident even when wrong</li>
 </ul>
 </div>
 </div>
 );
 }

 const question = questions[currentQuestion];
 const userAnswer = answers[currentQuestion];
 const isCorrect = userAnswer === question.answer;

 return (
 <div className="space-y-4">
 <div className="border-2 border-gray-200 rounded-lg p-6">
 <p className="text-lg text-gray-800 mb-6 italic">"{question.text}"</p>

 {!userAnswer ? (
 <div className="grid grid-cols-2 gap-4">
 <button onClick={() => handleAnswer("AI")} style={{ height:80, fontSize:18, borderRadius:12, background:"#2563EB", color:"#fff", border:"none", cursor:"pointer", fontWeight:600 }}>
 AI Generated
 </button>
 <button onClick={() => handleAnswer("Human")} style={{ height:80, fontSize:18, borderRadius:12, background:"#16A34A", color:"#fff", border:"none", cursor:"pointer", fontWeight:600 }}>
 👤 Human Written
 </button>
 </div>
 ) : (
 <div className={`p-4 rounded-lg ${isCorrect ? "bg-[#E6F5EF] border-2 border-[#2D9B6F]" : "bg-orange-50 border-2 border-orange-500"}`}>
 <p className="font-semibold mb-2">{isCorrect ? "Correct!" : "✗ Not quite!"}</p>
 <p className="text-sm text-gray-700">
 <strong>Answer:</strong> {question.answer}
 </p>
 <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
 </div>
 )}
 </div>

 <div className="text-center text-sm text-gray-600">
 Question {currentQuestion + 1} of {questions.length}
 </div>
 </div>
 );
}
