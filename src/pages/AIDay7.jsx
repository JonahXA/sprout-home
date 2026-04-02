import React, { useState, useEffect } from "react";
import { getCurrentUserSafe, upsertAIDayProgress, getAIDayProgress } from "@/services/auth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { ArrowLeft, ChevronRight, Briefcase, TrendingUp, Brain, Lightbulb } from "lucide-react";
import InteractiveQuiz from "@/components/shared/InteractiveQuiz";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay7() {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [user, setUser] = useState(null);
 const [isLoadingUser, setIsLoadingUser] = useState(true);
 const [currentStep, setCurrentStep] = useState(0);
 const [selectedSkills, setSelectedSkills] = useState([]);

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
 queryKey: ['aiDayProgress', user?.email, 7],
 queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 7 }),
 enabled: !!user
 });

 const completeDayMutation = useMutation({
 mutationFn: async (quizScore) => {
 if (!user?.email) throw new Error("Missing user");
 await upsertAIDayProgress({
 user_email: user.email,
 day_number: 7,
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

 const careerSkills = [
 { name: "Prompt Engineering", demand: "High", description: "Writing effective AI prompts" },
 { name: "AI Tool Proficiency", demand: "Critical", description: "Using ChatGPT, Midjourney, etc." },
 { name: "Data Literacy", demand: "High", description: "Understanding data quality & bias" },
 { name: "Critical Thinking", demand: "Critical", description: "Verifying AI outputs" },
 { name: "Ethics & Responsibility", demand: "High", description: "Using AI responsibly" },
 { name: "Adaptability", demand: "Critical", description: "Learning new AI tools quickly" }
 ];

 const steps = [
 {
 title: "AI in the Workplace: Transformation Ahead",
 type: "concept",
 content: (
 <div className="space-y-6">
 <div className="#E6F5EF] p-6 rounded-xl border-l-4 border-[#2D9B6F]">
 <h3 className="text-2xl font-bold text-gray-900 mb-4">The AI Skills Revolution</h3>
 <p className="text-lg text-gray-700 mb-4">
 AI won't replace humans, but humans using AI will replace those who don't. Every career will be impacted.
 </p>

 <div className="bg-white p-4 rounded-lg border-2 border-green-300">
 <p className="font-bold text-gray-900 mb-2">McKinsey Research (2023):</p>
 <ul className="space-y-2 text-sm text-gray-700">
 <li>• 75% of value from generative AI in 4 areas: Customer ops, marketing, software, R&D</li>
 <li>• Workers could automate 60-70% of their time with AI</li>
 <li>• Skills required changing faster than ever before</li>
 </ul>
 </div>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
 <div className="bg-[#E8F0FE] px-4 py-3">
 <h4 className="font-bold text-[#1B2B5E]">Jobs AI Enhances</h4>
 </div>
 <div className="p-4 space-y-2 text-sm">
 <p className="text-gray-700 font-bold">Creative fields:</p>
 <ul className="list-disc ml-6 text-gray-600">
 <li>Designers use AI for rapid prototyping</li>
 <li>Writers use AI for brainstorming, editing</li>
 <li>Marketers use AI for personalization</li>
 </ul>
 <p className="text-gray-700 font-bold mt-3">Technical fields:</p>
 <ul className="list-disc ml-6 text-gray-600">
 <li>Programmers use AI coding assistants</li>
 <li>Data analysts automate reporting</li>
 <li>Researchers accelerate discovery</li>
 </ul>
 </div>
 </div>

 <div className="border-2 border-orange-200 rounded-lg overflow-hidden">
 <div className="bg-orange-50 px-4 py-3">
 <h4 className="font-bold text-orange-700">Jobs At Risk</h4>
 </div>
 <div className="p-4 space-y-2 text-sm">
 <p className="text-gray-700">Roles with repetitive, predictable tasks:</p>
 <ul className="list-disc ml-6 text-gray-600 space-y-1">
 <li>Data entry clerks</li>
 <li>Basic customer service</li>
 <li>Simple content writing</li>
 <li>Routine accounting</li>
 <li>Telemarketing</li>
 </ul>
 <div className="bg-orange-100 p-2 rounded mt-3">
 <p className="text-xs text-orange-900"><strong>Key insight:</strong> Jobs requiring human judgment, creativity, empathy, and complex problem-solving are safer</p>
 </div>
 </div>
 </div>
 </div>

 <button onClick={() => setCurrentStep(1)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
 Explore Career Skills <ChevronRight size={18} />
 </button>
 </div>
 )
 },
 {
 title: "Interactive: Build Your AI Skill Set",
 type: "activity",
 content: (
 <div className="space-y-6">
 <div className="bg-teal-50 p-6 rounded-xl border-l-4 border-teal-500">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Essential AI-Era Skills</h3>
 <p className="text-gray-700">
 Click on skills to learn why they matter. These are what employers will look for.
 </p>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 {careerSkills.map((skill, idx) => (
 <div
 key={idx}
 onClick={() => {
 if (!selectedSkills.includes(idx)) {
 setSelectedSkills([...selectedSkills, idx]);
 }
 }}
 className={`cursor-pointer border-2 transition-all rounded-lg overflow-hidden ${
 selectedSkills.includes(idx)
 ? 'border-[#2D9B6F] bg-[#E6F5EF] shadow-lg'
 : 'border-gray-200 hover:border-teal-300'
 }`}
 >
 <div className="px-4 py-3">
 <div className="flex items-center justify-between">
 <span className="font-bold text-lg">{skill.name}</span>
 <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:skill.demand === "Critical" ? "#EF4444" : "#F97316", padding:"3px 10px", borderRadius:999 }}>
 {skill.demand}
 </span>
 </div>
 </div>
 <div className="px-4 pb-4">
 <p className="text-sm text-gray-600">{skill.description}</p>
 {selectedSkills.includes(idx) && (
 <div className="mt-3 p-3 bg-white rounded border-l-4 border-[#2D9B6F]">
 <p className="text-xs text-gray-700">
 <strong>Why it matters:</strong> {
 idx === 0 ? "Effective prompting makes you 10x more productive with AI tools" :
 idx === 1 ? "Every industry uses AI tools - proficiency is becoming baseline expectation" :
 idx === 2 ? "Understanding data helps you spot AI mistakes and biases" :
 idx === 3 ? "AI can be wrong - you need to verify and think critically" :
 idx === 4 ? "Companies need employees who use AI responsibly and ethically" :
 "AI evolves fast - ability to learn new tools quickly is crucial"
 }
 </p>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>

 {selectedSkills.length >= 4 && (
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
 question: "In the AI era, what becomes most valuable?",
 options: ["memorizing facts", "creative thinking + AI tool mastery", "avoiding technology", "manual data entry"],
 correct_answer: 1,
 explanation: "Combining human creativity, judgment, and critical thinking with AI tools creates the most value in modern careers."
 },
 {
 question: "Jobs least likely to be automated involve:",
 options: ["repetitive tasks", "empathy, creativity, complex judgment", "data entry", "routine calculations"],
 correct_answer: 1,
 explanation: "AI struggles with tasks requiring human empathy, creative problem-solving, ethical judgment, and nuanced social understanding."
 },
 {
 question: "Best career strategy for AI era:",
 options: ["ignore AI entirely", "learn to use AI as a powerful tool", "let AI do everything", "avoid learning"],
 correct_answer: 1,
 explanation: "Learning to effectively use AI tools while maintaining critical thinking and creativity positions you for success."
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
 <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 7 of 10</span>
 <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
 AI and Your Future Career: Skills for Tomorrow
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
 {currentStepData.type === 'concept' && <Briefcase className="w-6 h-6" />}
 {currentStepData.type === 'activity' && <Lightbulb className="w-6 h-6" />}
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
