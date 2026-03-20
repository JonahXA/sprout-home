import React, { useState, useEffect } from "react";
import { getCurrentUserSafe, upsertAIDayProgress, getAIDayProgress } from "@/lib/appClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, Cpu, Zap, Brain, Activity, MessageSquare, Eye, Mic, Film, Car } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay8() {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [user, setUser] = useState(null);
 const [isLoadingUser, setIsLoadingUser] = useState(true);
 const [currentStep, setCurrentStep] = useState(0);
 const [selectedTechs, setSelectedTechs] = useState([]);

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
 queryKey: ['aiDayProgress', user?.email, 8],
 queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 8 }),
 enabled: !!user
 });

 const completeDayMutation = useMutation({
 mutationFn: async (quizScore) => {
 if (!user?.email) throw new Error("Missing user");
 await upsertAIDayProgress({
 user_email: user.email,
 day_number: 8,
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

 const aiTechnologies = [
 { name: "Natural Language Processing", Icon: MessageSquare, uses: "Translation, chatbots, sentiment analysis" },
 { name: "Computer Vision", Icon: Eye, uses: "Face recognition, medical imaging, self-driving" },
 { name: "Recommendation Systems", Icon: Cpu, uses: "Netflix, Spotify, Amazon product suggestions" },
 { name: "Robotics & Automation", Icon: Activity, uses: "Manufacturing, warehouse logistics, surgery assistance" },
 { name: "Predictive Analytics", Icon: Zap, uses: "Weather forecasting, stock prediction, risk assessment" },
 { name: "Voice Assistants", Icon: Mic, uses: "Siri, Alexa, Google Assistant" }
 ];

 const steps = [
 {
 title: "AI in Everyday Life: All Around You",
 type: "concept",
 content: (
 <div className="space-y-6">
 <div className="bg-[#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E]">
 <h3 className="text-2xl font-bold text-gray-900 mb-4">You Use AI Every Day Without Realizing</h3>
 <p className="text-lg text-gray-700 mb-4">
 AI isn't science fiction - it's your phone's camera, email spam filter, and Netflix recommendations.
 </p>

 <div className="space-y-3">
 <div className="bg-white p-4 rounded-lg border-l-4 border-[#1B2B5E]">
 <p className="font-bold text-gray-900">At Home</p>
 <p className="text-sm text-gray-600">Smart thermostats learn your schedule, voice assistants answer questions, smart doorbells detect people</p>
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-[#2D9B6F]">
 <p className="font-bold text-gray-900">On Your Phone</p>
 <p className="text-sm text-gray-600">Face unlock, photo organization, autocorrect, navigation with traffic prediction</p>
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-[#1B2B5E]">
 <p className="font-bold text-gray-900">Entertainment</p>
 <p className="text-sm text-gray-600">Netflix/Spotify recommendations, TikTok For You page, YouTube suggestions, gaming AI opponents</p>
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
 <p className="font-bold text-gray-900">Healthcare</p>
 <p className="text-sm text-gray-600">Cancer detection in scans, drug discovery, fitness trackers predicting health issues</p>
 </div>

 <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
 <p className="font-bold text-gray-900">Transportation</p>
 <p className="text-sm text-gray-600">Google Maps traffic routing, Tesla Autopilot, parking assistance, ride-share matching</p>
 </div>
 </div>
 </div>

 <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
 <p className="text-sm text-gray-800"><strong>Mind-blowing fact:</strong> Your smartphone has more AI computing power than NASA had for the entire Apollo moon landing program.</p>
 </div>

 <button onClick={() => setCurrentStep(1)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
 Explore AI Technologies <ChevronRight size={18} />
 </button>
 </div>
 )
 },
 {
 title: "Interactive: AI Tech Explorer",
 type: "activity",
 content: (
 <div className="space-y-6">
 <div className="bg-[#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E]">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Major AI Technology Categories</h3>
 <p className="text-gray-700">
 Click each to see real-world applications you use regularly!
 </p>
 </div>

 <div className="grid md:grid-cols-2 gap-4">
 {aiTechnologies.map((tech, idx) => (
 <div
 key={idx}
 onClick={() => {
 if (!selectedTechs.includes(idx)) {
 setSelectedTechs([...selectedTechs, idx]);
 }
 }}
 className={`cursor-pointer border-2 transition-all rounded-lg overflow-hidden ${
 selectedTechs.includes(idx)
 ? 'border-cyan-500 bg-cyan-50 shadow-lg'
 : 'border-gray-200 hover:border-blue-300'
 }`}
 >
 <div className="px-4 py-3">
 <div className="flex items-center gap-2">
 {tech.Icon && <tech.Icon className="w-7 h-7 text-[#1B2B5E]" />}
 <span className="font-bold text-lg">{tech.name}</span>
 </div>
 </div>
 <div className="px-4 pb-4">
 {selectedTechs.includes(idx) && (
 <div className="p-3 bg-white rounded border-l-4 border-cyan-500">
 <p className="text-sm font-bold text-gray-900 mb-1">Real Uses:</p>
 <p className="text-sm text-gray-700">{tech.uses}</p>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>

 {selectedTechs.length >= 4 && (
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
 question: "Which is NOT an example of everyday AI?",
 options: ["spam filters", "Netflix recommendations", "a basic calculator", "face unlock"],
 correct_answer: 2,
 explanation: "Basic calculators follow fixed programmed rules, not AI. AI systems learn patterns from data to make predictions."
 },
 {
 question: "Recommendation systems (Netflix, Spotify) work by:",
 options: ["random guessing", "analyzing your patterns + similar users' patterns", "asking employees", "coin flips"],
 correct_answer: 1,
 explanation: "Recommendation systems use collaborative filtering - they find users similar to you and suggest what those users liked."
 },
 {
 question: "AI in healthcare helps with:",
 options: ["only billing", "detecting diseases in medical scans", "only scheduling", "making coffee"],
 correct_answer: 1,
 explanation: "Medical AI can detect cancer, predict heart attacks, assist in surgery, and discover new drugs - revolutionizing healthcare."
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
 <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 8 of 10</span>
 <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
 Real-World AI Applications Across Industries
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
 {currentStepData.type === 'concept' && <Cpu className="w-6 h-6" />}
 {currentStepData.type === 'activity' && <Activity className="w-6 h-6" />}
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
