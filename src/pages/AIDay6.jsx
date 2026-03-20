import React, { useState, useEffect } from "react";
import { getCurrentUserSafe, upsertAIDayProgress, getAIDayProgress } from "@/lib/appClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, Shield, Scale, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import EthicsScenarios from "@/components/EthicsScenarios";

const C = {
  navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
  accent:"#3B82F6", accentSoft:"#E8F0FE",
  green:"#2D9B6F", greenSoft:"#E8F8F0",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E5E7EB",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay6() {
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
    queryKey: ['aiDayProgress', user?.email, 6],
    queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 6 }),
    enabled: !!user
  });

  const completeDayMutation = useMutation({
    mutationFn: async (quizScore) => {
      if (!user?.email) throw new Error("Missing user");
      await upsertAIDayProgress({
        user_email: user.email,
        day_number: 6,
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
      title: "The Four Ethics Pillars",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border-l-4 border-red-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Ethics Matters in AI</h3>
            <p className="text-lg text-gray-700">
              AI is powerful, but it can perpetuate bias, invade privacy, and spread misinformation. Understanding ethics helps you use AI responsibly.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3">
                <h4 className="font-bold text-blue-700 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Fairness
                </h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700"><strong>Principle:</strong> AI should not systematically disadvantage any group</p>
                <p className="text-gray-700"><strong>Issues:</strong> Algorithmic bias, disparate impact, representation in data</p>
              </div>
            </div>

            <div className="border-2 border-[#2D9B6F]/30 rounded-lg overflow-hidden">
              <div className="bg-[#E6F5EF] px-4 py-3">
                <h4 className="font-bold text-[#2D9B6F] flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy
                </h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700"><strong>Principle:</strong> Protect personal information and respect consent</p>
                <p className="text-gray-700"><strong>Issues:</strong> Data collection, informed consent, data minimization</p>
              </div>
            </div>

            <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-3">
                <h4 className="font-bold text-purple-700 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Transparency
                </h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700"><strong>Principle:</strong> People should know when and how AI is being used</p>
                <p className="text-gray-700"><strong>Issues:</strong> Explainability, disclosure of AI use, understanding decisions</p>
              </div>
            </div>

            <div className="border-2 border-orange-200 rounded-lg overflow-hidden">
              <div className="bg-orange-50 px-4 py-3">
                <h4 className="font-bold text-orange-700 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Accountability
                </h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700"><strong>Principle:</strong> Humans remain responsible for AI decisions</p>
                <p className="text-gray-700"><strong>Issues:</strong> Human oversight, responsibility for outcomes, redress mechanisms</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-bold text-gray-900 mb-3">Real Example: COMPAS (Criminal Justice AI)</h4>
            <p className="text-gray-700 mb-2">System predicted recidivism risk for sentencing decisions</p>
            <p className="text-sm text-gray-600">❌ <strong>Problem:</strong> Higher false positive rates for Black defendants</p>
            <p className="text-sm text-gray-600">📊 <strong>Cause:</strong> Trained on biased historical data</p>
            <p className="text-sm text-gray-600">⚖️ <strong>Impact:</strong> Influenced bail and sentencing, perpetuating bias</p>
          </div>

          <button onClick={() => setCurrentStep(1)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            Continue to Ethical Scenarios <ChevronRight size={18} />
          </button>
        </div>
      )
    },
    {
      title: "Interactive: Ethics Decision Making",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Scale className="w-6 h-6 text-purple-600" />
              Real-World Ethical Dilemmas
            </h3>
            <p className="text-gray-700">
              You'll face realistic scenarios involving AI ethics. Make decisions and see the reasoning behind ethical choices.
            </p>
          </div>

          <EthicsScenarios onComplete={(ethicalChoices) => {
            setActivityComplete(true);
          }} />

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
              question: "Algorithmic bias means:",
              options: ["any mistake", "systematic unfair outcomes for some groups", "faster internet", "battery drain"],
              correct_answer: 1,
              explanation: "Algorithmic bias refers to AI systems producing systematically unfair results for certain demographic groups."
            },
            {
              question: "Best rule for privacy with AI tools:",
              options: ["share everything", "avoid personal/sensitive info", "post passwords", "ignore policies"],
              correct_answer: 1,
              explanation: "Never share personal, sensitive, or private information with AI tools - assume anything entered could be stored."
            },
            {
              question: "To verify suspicious media, you should:",
              options: ["Share it immediately", "Reverse image search and check sources", "Assume it's real", "Ignore all media"],
              correct_answer: 1,
              explanation: "Use reverse image search, check original sources, look for corroboration from reputable outlets, and verify context before believing suspicious media."
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
            <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 6 of 10</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Ethics: Bias, Privacy, Deepfakes, and Responsible Use
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
              {currentStepData.type === 'concept' && <Shield className="w-6 h-6" />}
              {currentStepData.type === 'activity' && <Scale className="w-6 h-6" />}
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
