import React, { useState, useEffect } from "react";
import { getCurrentUserSafe, upsertAIDayProgress, getAIDayProgress } from "@/lib/appClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, MessageSquare, AlertTriangle, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import HallucinationDetector from "@/components/HallucinationDetector";

const C = {
  navy:"#1F3A64", navyLight:"#264D82", navyGlow:"rgba(31,58,100,0.12)",
  accent:"#3B82F6", accentSoft:"#E8F0FE",
  green:"#22C55E", greenSoft:"#E8F8F0",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E5E7EB",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay4() {
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
    queryKey: ["aiDayProgress", user?.email, 4],
    queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 4 }),
    enabled: !!user,
  });

  const completeDayMutation = useMutation({
    mutationFn: async (quizScore) => {
      if (!user?.email) throw new Error("Missing user");
      await upsertAIDayProgress({
        user_email: user.email,
        day_number: 4,
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
      title: "How LLMs Actually Work",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border-l-4 border-yellow-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Next-Token Prediction</h3>
            <p className="text-lg text-gray-700 mb-4">
              LLMs don't "understand" like humans. They predict the most likely next word based on patterns they learned.
            </p>

            <div className="bg-white p-4 rounded-lg border-2 border-yellow-300 mb-4">
              <p className="text-gray-800 mb-2"><strong>Input:</strong> "The capital of France is"</p>
              <div className="ml-4 space-y-1 text-sm">
                <p className="text-green-600">✓ "Paris" (99.9% probability)</p>
                <p className="text-gray-500">✗ "London" (0.05%)</p>
                <p className="text-gray-400">✗ "pizza" (0.00001%)</p>
              </div>
              <p className="text-gray-800 mt-3"><strong>Output:</strong> "The capital of France is Paris"</p>
            </div>

            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
              <p className="text-red-900 font-bold">⚠️ Critical Insight:</p>
              <p className="text-red-800 text-sm">LLMs predict <em>plausible</em> text, not <em>truth</em>. They can be confidently wrong!</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-green-200 rounded-lg overflow-hidden">
              <div className="bg-green-50 px-4 py-3">
                <h4 className="font-bold text-green-700">What LLMs CAN Do</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p>✓ Write essays, stories, code</p>
                <p>✓ Explain complex topics</p>
                <p>✓ Translate languages</p>
                <p>✓ Summarize documents</p>
                <p>✓ Answer questions</p>
              </div>
            </div>

            <div className="border-2 border-red-200 rounded-lg overflow-hidden">
              <div className="bg-red-50 px-4 py-3">
                <h4 className="font-bold text-red-700">What LLMs CAN'T Do</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p>✗ Truly "understand" meaning</p>
                <p>✗ Access real-time information</p>
                <p>✗ Verify their own outputs</p>
                <p>✗ Do perfect math calculations</p>
                <p>✗ Know what's actually true</p>
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
      title: "Interactive: Spot the Hallucinations",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-red-50 p-6 rounded-xl border-l-4 border-red-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Hallucination Detection Lab
            </h3>
            <p className="text-gray-700">
              Read AI responses and determine: Is this accurate information or a hallucination?
            </p>
          </div>

          <HallucinationDetector
            onComplete={() => {
              setActivityComplete(true);
            }}
          />

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
              question: "A common failure mode of LLMs is:",
              options: ["rust", "hallucination", "photosynthesis", "gravity"],
              correct_answer: 1,
              explanation: "Hallucination is when LLMs generate plausible-sounding but factually incorrect information.",
            },
            {
              question: "Best practice when AI gives a factual claim:",
              options: ["assume correct", "verify with reputable sources", "post immediately", "never use AI again"],
              correct_answer: 1,
              explanation: "Always verify AI-generated factual claims with reputable sources before trusting or acting on them.",
            },
            {
              question: "What does 'hallucination' mean in the context of AI?",
              options: ["The AI is dreaming", "Plausible but incorrect fabricated content", "Perfect accuracy", "Colorful outputs"],
              correct_answer: 1,
              explanation: "AI hallucination means generating content that sounds plausible and authoritative but is actually false or fabricated.",
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
            <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 4 of 10</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Generative AI: Large Language Models and Hallucinations
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
              {currentStepData.type === "concept" && <MessageSquare className="w-6 h-6" />}
              {currentStepData.type === "activity" && <AlertTriangle className="w-6 h-6" />}
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
