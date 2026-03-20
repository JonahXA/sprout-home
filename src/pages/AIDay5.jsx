import React, { useState, useEffect } from "react";
import { getCurrentUserSafe, upsertAIDayProgress, getAIDayProgress } from "@/lib/appClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, Zap, PenTool, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import PromptWorkshop from "@/components/PromptWorkshop";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay5() {
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
 queryKey: ['aiDayProgress', user?.email, 5],
 queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 5 }),
 enabled: !!user
 });

 const completeDayMutation = useMutation({
 mutationFn: async (quizScore) => {
 if (!user?.email) throw new Error("Missing user");
 await upsertAIDayProgress({
 user_email: user.email,
 day_number: 5,
 completed: true,
 completed_date: new Date().toISOString(),
 activity_completed: true,
 quiz_score: quizScore,
 time_spent_minutes: 60,
 });
 },
 onSuccess: () => {
 queryClient.invalidateQueries(['aiDayProgress']);
 navigate(createPageUrl("AILiteracy"));
 }
 });

 const steps = [
 {
 title: "The CLEAR Prompting Framework",
 type: "concept",
 content: (
 <div className="space-y-6">
 <div className="bg-[#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E]">
 <h3 className="text-2xl font-bold text-gray-900 mb-4">Better Prompts = Better Outputs</h3>
 <p className="text-lg text-gray-700 mb-6">
 Prompting is HOW you communicate with AI. Master it and you'll get dramatically better results.
 </p>

 <div className="space-y-3">
 <div className="bg-white p-4 rounded-lg border-l-4 border-[#1B2B5E]">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-8 h-8 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center font-bold">C</div>
 <h4 className="font-bold text-gray-900">Context</h4>
 </div>
 <p className="text-sm text-gray-600 ml-10">Provide background and relevant information</p>
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-[#2D9B6F]">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">L</div>
 <h4 className="font-bold text-gray-900">Limits</h4>
 </div>
 <p className="text-sm text-gray-600 ml-10">Set boundaries and constraints</p>
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">E</div>
 <h4 className="font-bold text-gray-900">Examples</h4>
 </div>
 <p className="text-sm text-gray-600 ml-10">Show what you want</p>
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-[#1B2B5E]">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-8 h-8 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center font-bold">A</div>
 <h4 className="font-bold text-gray-900">Ask</h4>
 </div>
 <p className="text-sm text-gray-600 ml-10">Make your request specific and clear</p>
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500">
 <div className="flex items-center gap-2 mb-2">
 <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">R</div>
 <h4 className="font-bold text-gray-900">Review</h4>
 </div>
 <p className="text-sm text-gray-600 ml-10">Specify output format and requirements</p>
 </div>
 </div>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div className="border-2 border-red-200 bg-red-50 rounded-lg overflow-hidden">
 <div className="px-4 py-3">
 <h4 className="font-bold text-red-700">Weak Prompt</h4>
 </div>
 <div className="p-4 space-y-2 text-sm">
 <p className="italic text-gray-700">"Explain photosynthesis"</p>
 <p className="text-red-700">• No audience specified</p>
 <p className="text-red-700">• No format requested</p>
 <p className="text-red-700">• Too vague</p>
 </div>
 </div>

 <div className="border-2 border-[#2D9B6F]/30 bg-[#E6F5EF] rounded-lg overflow-hidden">
 <div className="px-4 py-3">
 <h4 className="font-bold text-[#2D9B6F]">Strong Prompt</h4>
 </div>
 <div className="p-4 space-y-2 text-sm">
 <p className="italic text-gray-700">"Explain photosynthesis to a 9th grader in 5 bullet points with one analogy"</p>
 <p className="text-[#2D9B6F]">Audience: 9th grader</p>
 <p className="text-[#2D9B6F]">Format: 5 bullet points</p>
 <p className="text-[#2D9B6F]">Extra: include analogy</p>
 </div>
 </div>
 </div>

 <button onClick={() => setCurrentStep(1)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
 Try It Yourself <ChevronRight size={18} />
 </button>
 </div>
 )
 },
 {
 title: "Interactive: Prompt Writing Workshop",
 type: "activity",
 content: (
 <div className="space-y-6">
 <div className="bg-[#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E]">
 <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
 <PenTool className="w-6 h-6 text-[#1B2B5E]" />
 Practice Writing Strong Prompts
 </h3>
 <p className="text-gray-700">
 You'll be given tasks. Write prompts and get scored on how well you applied the CLEAR framework!
 </p>
 </div>

 <PromptWorkshop onComplete={() => setActivityComplete(true)} />

 {activityComplete && (
 <button onClick={() => setCurrentStep(2)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
 Continue to Quiz <ChevronRight size={18} />
 </button>
 )}
 </div>
 )
 },
 {
 title: "Checkpoint Quiz",
 type: "quiz",
 content: (
 <InteractiveQuiz
 questions={[
 {
 question: "A strong prompt usually includes:",
 options: ["nothing", "context and constraints", "only emojis", "a secret code"],
 correct_answer: 1,
 explanation: "Strong prompts include context (background), constraints (limitations), format specifications, and clear requests."
 },
 {
 question: "Using AI to fully write and submit your assignment as your own is:",
 options: ["best practice", "academic dishonesty", "required", "impossible"],
 correct_answer: 1,
 explanation: "Submitting AI-generated work as your own without disclosure violates academic integrity and is considered cheating."
 },
 {
 question: "Ethical AI use for studying includes:",
 options: ["Have AI write your essay", "Create practice questions to answer yourself", "Use AI during closed-book exams", "Copy AI answers directly"],
 correct_answer: 1,
 explanation: "Using AI to generate practice questions, explain concepts, or provide study guidance - then doing the work yourself - is ethical."
 }
 ]}
 onComplete={(score) => {
 const percentage = Math.round((score / 3) * 100);
 if (percentage >= 66) {
 completeDayMutation.mutate(percentage);
 }
 }}
 />
 )
 }
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
 <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 5 of 10</span>
 <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
 Using AI Effectively: Prompting, Iteration, and Study Workflows
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
 {currentStepData.type === 'concept' && <Zap className="w-6 h-6" />}
 {currentStepData.type === 'activity' && <PenTool className="w-6 h-6" />}
 {currentStepData.type === 'quiz' && <Brain className="w-6 h-6" />}
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
