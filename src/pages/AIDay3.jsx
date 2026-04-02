import React, { useState, useEffect } from "react";
import { getCurrentUserSafe, upsertAIDayProgress, getAIDayProgress } from "@/services/auth";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { ArrowLeft, ChevronRight, Eye, Image as ImageIcon, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/shared/InteractiveQuiz";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay3() {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [user, setUser] = useState(null);
 const [isLoadingUser, setIsLoadingUser] = useState(true);
 const [currentStep, setCurrentStep] = useState(0);
 const [selectedImages, setSelectedImages] = useState([]);

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
 queryKey: ["aiDayProgress", user?.email, 3],
 queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 3 }),
 enabled: !!user,
 });

 const completeDayMutation = useMutation({
 mutationFn: async (quizScore) => {
 if (!user?.email) throw new Error("Missing user");
 await upsertAIDayProgress({
 user_email: user.email,
 day_number: 3,
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

 const imageExamples = [
 { url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131", isAI: false, label: "Real Cat Photo" },
 { url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", isAI: false, label: "Real Cat Photo" },
 { url: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8", isAI: false, label: "Real Cat Photo" },
 ];

 const steps = [
 {
 title: "Computer Vision: Teaching Computers to 'See'",
 type: "concept",
 content: (
 <div className="space-y-6">
 <div className="#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E]">
 <h3 className="text-2xl font-bold text-gray-900 mb-4">How Do Computers See Images?</h3>
 <p className="text-lg text-gray-700 mb-4">
 To a computer, an image is just a grid of numbers. Each pixel has values for Red, Green, and Blue (0-255).
 </p>

 <div className="bg-white p-4 rounded-lg border-2 border-purple-300 mb-4">
 <p className="font-bold text-gray-900 mb-2">Example: A 3x3 red pixel patch</p>
 <div className="grid grid-cols-3 gap-1 w-24 mb-2">
 {[...Array(9)].map((_, i) => (
 <div key={i} className="w-6 h-6 bg-red-500"></div>
 ))}
 </div>
 <p className="text-sm text-gray-600">To you: Red square</p>
 <p className="text-sm text-gray-600">To computer: [[255,0,0], [255,0,0], [255,0,0], ...]</p>
 </div>
 </div>

 <div className="space-y-4">
 <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
 <div className="bg-[#E8F0FE] px-4 py-3">
 <h4 className="font-bold text-[#1B2B5E]">What is Computer Vision?</h4>
 </div>
 <div className="p-4 space-y-2 text-sm">
 <p className="text-gray-700">Teaching computers to extract meaning from images and videos</p>
 <p className="text-gray-700"><strong>Tasks:</strong></p>
 <ul className="list-disc ml-6 space-y-1 text-gray-600">
 <li>Classification: "This is a cat"</li>
 <li>Detection: "There's a cat at position X,Y"</li>
 <li>Segmentation: "These exact pixels are the cat"</li>
 <li>Face recognition, medical imaging, self-driving cars</li>
 </ul>
 </div>
 </div>

 <div className="border-2 border-[#2D9B6F]/30 rounded-lg overflow-hidden">
 <div className="bg-[#E6F5EF] px-4 py-3">
 <h4 className="font-bold text-[#2D9B6F]">How It Works: Convolutional Neural Networks (CNNs)</h4>
 </div>
 <div className="p-4 space-y-3 text-sm">
 <div className="space-y-2">
 <p className="font-bold text-gray-900">Layer 1: Edge Detection</p>
 <p className="text-gray-600">Finds simple patterns like horizontal/vertical lines</p>
 </div>
 <div className="space-y-2">
 <p className="font-bold text-gray-900">Layer 2: Shapes</p>
 <p className="text-gray-600">Combines edges into circles, triangles, curves</p>
 </div>
 <div className="space-y-2">
 <p className="font-bold text-gray-900">Layer 3+: Complex Features</p>
 <p className="text-gray-600">Eyes, ears, fur patterns → "CAT"</p>
 </div>
 </div>
 </div>
 </div>

 <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
 <p className="text-sm text-gray-800">
 <strong>Real Application:</strong> Medical AI can detect cancer in X-rays by learning from thousands of labeled medical images,
 often spotting patterns invisible to human eyes.
 </p>
 </div>

 <button onClick={() => setCurrentStep(1)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
 Continue to Activity <ChevronRight size={18} />
 </button>
 </div>
 ),
 },
 {
 title: "Interactive: AI vs Real Images",
 type: "activity",
 content: (
 <div className="space-y-6">
 <div className="bg-[#E8F0FE] p-6 rounded-xl border-l-4 border-[#1B2B5E]">
 <h3 className="text-xl font-bold text-gray-900 mb-2">Can You Spot the Difference?</h3>
 <p className="text-gray-700">
 Examine these images. Computer vision systems analyze pixels, edges, and patterns to classify images.
 </p>
 </div>

 <div className="grid md:grid-cols-3 gap-4">
 {imageExamples.map((img, idx) => (
 <div
 key={idx}
 onClick={() => {
 if (!selectedImages.includes(idx)) {
 setSelectedImages([...selectedImages, idx]);
 }
 }}
 className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
 selectedImages.includes(idx)
 ? "border-[#2D9B6F] shadow-lg"
 : "border-gray-200 hover:border-purple-300"
 }`}
 >
 <img src={img.url} alt={img.label} className="w-full h-48 object-cover" />
 <div className="p-3 bg-white">
 <p className="text-sm font-semibold text-gray-900">{img.label}</p>
 {selectedImages.includes(idx) && (
 <span style={{ display:"inline-block", marginTop:8, fontSize:12, fontWeight:700, color:"#fff", background:"#2D9B6F", padding:"3px 10px", borderRadius:999 }}>Analyzed </span>
 )}
 </div>
 </div>
 ))}
 </div>

 <div className="bg-[#E8F0FE] p-4 rounded-lg">
 <p className="text-sm text-gray-800">
 <strong>How CV systems work:</strong> They break images into features (edges, colors, textures), then use neural networks to classify.
 Training data quality is crucial!
 </p>
 </div>

 {selectedImages.length >= 2 && (
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
 question: "To a computer, an image is represented as:",
 options: ["magic", "a grid of numbers (pixels)", "thoughts", "sound waves"],
 correct_answer: 1,
 explanation:
 "Images are grids of numbers representing pixel colors (RGB values). Computers don't 'see' - they process numerical data.",
 },
 {
 question: "Computer vision is used in:",
 options: ["only games", "medical diagnosis, self-driving cars, face recognition", "only social media", "microwave ovens"],
 correct_answer: 1,
 explanation:
 "Computer vision has countless real-world applications including healthcare, autonomous vehicles, security, agriculture, and more.",
 },
 {
 question: "CNNs (Convolutional Neural Networks) work by:",
 options: ["random guessing", "learning hierarchical features from simple to complex", "asking humans", "magic spells"],
 correct_answer: 1,
 explanation:
 "CNNs learn in layers: first detecting edges, then shapes, then complex patterns, building understanding hierarchically.",
 },
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
 <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 3 of 10</span>
 <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
 Computer Vision and Image Recognition
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
 {currentStepData.type === "concept" && <Eye className="w-6 h-6" />}
 {currentStepData.type === "activity" && <ImageIcon className="w-6 h-6" />}
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
