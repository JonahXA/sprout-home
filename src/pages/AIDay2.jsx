// src/pages/AIDay2.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, Database, Target, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import MLTrainingSimulator from "@/components/MLTrainingSimulator";

import { getCurrentUserSafe, getAIDayProgress, upsertAIDayProgress } from "@/lib/appClient";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay2() {
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
 queryKey: ["aiDayProgress", user?.email, 2],
 queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 2 }),
 enabled: !!user,
 });

 const completeDayMutation = useMutation({
 mutationFn: async (quizScore) => {
 await upsertAIDayProgress({
 user_email: user.email,
 day_number: 2,
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
 title: "The Machine Learning Pipeline",
 type: "concept",
 content: (
 <div className="space-y-6">
 <div className="bg-[#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E]">
 <h3 className="text-xl font-bold text-gray-900 mb-4">How Machines Learn</h3>
 <div className="space-y-4">
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center font-bold text-xl">1</div>
 <div>
 <h4 className="font-bold text-gray-900">Collect Data</h4>
 <p className="text-sm text-gray-600">Examples with features and labels. For a cat classifier, you need thousands of images labeled "cat" or "not cat"</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center font-bold text-xl">2</div>
 <div>
 <h4 className="font-bold text-gray-900">Training</h4>
 <p className="text-sm text-gray-600">Model analyzes patterns - what makes a cat a cat? Whiskers, ears, eyes? It adjusts internal parameters millions of times</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center font-bold text-xl">3</div>
 <div>
 <h4 className="font-bold text-gray-900">Create Model</h4>
 <p className="text-sm text-gray-600">The result is a mathematical function: Input (image) → Output (cat probability). Not magic, just math!</p>
 </div>
 </div>
 <div className="flex items-center gap-4">
 <div className="w-12 h-12 rounded-full bg-[#1B2B5E] text-white flex items-center justify-center font-bold text-xl">4</div>
 <div>
 <h4 className="font-bold text-gray-900">Test & Deploy</h4>
 <p className="text-sm text-gray-600">Test on NEW images it's never seen. If accurate, deploy. If not, collect more/better data and retrain</p>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
 <p className="text-sm text-gray-800">
 <strong>Important:</strong> The model doesn't "understand" cats like you do. It found statistical patterns in pixel data.
 Show it a cat-shaped cloud and it might say "cat" - because it's pattern-matching, not thinking.
 </p>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 <div className="border-2 border-[#2D9B6F]/30 bg-[#E6F5EF] rounded-lg overflow-hidden">
 <div className="px-4 py-3">
 <h4 className="font-bold text-[#2D9B6F]">Supervised Learning</h4>
 </div>
 <div className="p-4 space-y-3 text-sm">
 <p className="text-gray-700"><strong>What it is:</strong> Learning from labeled examples (you tell it the right answer)</p>
 <p className="text-gray-700"><strong>Examples:</strong></p>
 <ul className="list-disc ml-6 space-y-1 text-gray-600">
 <li>Spam filter: Email text → "spam" or "not spam"</li>
 <li>Medical diagnosis: X-ray image → "tumor" or "healthy"</li>
 <li>House prices: Features (size, location) → price</li>
 </ul>
 <p className="text-gray-700"><strong>Data format:</strong> Input + correct label</p>
 <div className="bg-green-100 p-2 rounded text-xs">
 <strong>Real example:</strong> Netflix trained an algorithm on millions of (user, movie, rating) examples to predict what you'll enjoy
 </div>
 </div>
 </div>

 <div className="border-2 border-gray-200 bg-[#E8F0FE] rounded-lg overflow-hidden">
 <div className="px-4 py-3">
 <h4 className="font-bold text-purple-700">Unsupervised Learning</h4>
 </div>
 <div className="p-4 space-y-3 text-sm">
 <p className="text-gray-700"><strong>What it is:</strong> Finding patterns without labels (discover structure on its own)</p>
 <p className="text-gray-700"><strong>Examples:</strong></p>
 <ul className="list-disc ml-6 space-y-1 text-gray-600">
 <li>Customer segmentation: Group similar shoppers</li>
 <li>Fraud detection: Find unusual transaction patterns</li>
 <li>Topic discovery: What themes appear in documents?</li>
 </ul>
 <p className="text-gray-700"><strong>Data format:</strong> Just inputs, no labels</p>
 <div className="bg-purple-100 p-2 rounded text-xs">
 <strong>Real example:</strong> Spotify's "Discover Weekly" finds patterns in your listening to group you with similar users, then recommends their favorites
 </div>
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
 title: "Interactive Lab: Train Your Own Model",
 type: "activity",
 content: (
 <div className="space-y-6">
 <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500">
 <h3 className="text-xl font-bold text-gray-900 mb-2">🧪 Hands-On Lab</h3>
 <p className="text-gray-700">
 You'll train a cat vs dog classifier. See how data quality affects model accuracy!
 </p>
 </div>

 <MLTrainingSimulator onComplete={() => setActivityComplete(true)} />

 {activityComplete && (
 <button onClick={() => setCurrentStep(2)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
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
 <InteractiveQuiz
 questions={[
 {
 question: "In supervised learning, the training data usually includes:",
 options: ["only inputs", "inputs + correct outputs", "only outputs", "random noise"],
 correct_answer: 1,
 explanation: "Supervised learning requires both inputs (features) and outputs (labels) so the model can learn the relationship between them."
 },
 {
 question: "If a model works great on training examples but poorly on new examples, that suggests:",
 options: ["good generalization", "overfitting", "privacy", "encryption"],
 correct_answer: 1,
 explanation: "This is overfitting - the model memorized training examples instead of learning general patterns that work on new data."
 },
 {
 question: "What improves a weak ML model the most?",
 options: ["Add diverse training examples", "Use the same training data", "Skip testing", "Avoid edge cases"],
 correct_answer: 0,
 explanation: "Adding diverse, balanced training examples significantly improves model performance and generalization."
 }
 ]}
 onComplete={(score) => {
 const percentage = Math.round((score / 3) * 100);
 if (percentage >= 66) {
 completeDayMutation.mutate(percentage);
 }
 }}
 />
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
 <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 2 of 10</span>
 <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
 How Machines Learn: Data, Training, and Models
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
 {currentStepData.type === "concept" && <Database className="w-6 h-6" />}
 {currentStepData.type === "activity" && <Target className="w-6 h-6" />}
 {currentStepData.type === "quiz" && <Brain className="w-6 h-6" />}
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
