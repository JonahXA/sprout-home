import React, { useState, useEffect } from "react";
import { getCurrentUserSafe, upsertAIDayProgress, getAIDayProgress } from "@/lib/appClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, TrendingUp, Rocket, Brain, AlertCircle } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

const C = {
  navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
  accent:"#3B82F6", accentSoft:"#E8F0FE",
  green:"#2D9B6F", greenSoft:"#E8F8F0",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E5E7EB",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AIDay9() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTrends, setSelectedTrends] = useState([]);

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
    queryKey: ['aiDayProgress', user?.email, 9],
    queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 9 }),
    enabled: !!user
  });

  const completeDayMutation = useMutation({
    mutationFn: async (quizScore) => {
      if (!user?.email) throw new Error("Missing user");
      await upsertAIDayProgress({
        user_email: user.email,
        day_number: 9,
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

  const futureTrends = [
    {
      name: "Multimodal AI",
      timeline: "Now - 2025",
      description: "AI that understands text, images, audio, video together",
      impact: "ChatGPT can now 'see' images and discuss them. Future: AI assistants that truly understand your world."
    },
    {
      name: "AI Agents",
      timeline: "2024-2026",
      description: "AI that takes actions for you, not just responds",
      impact: "Beyond chatting: AI that books appointments, researches products, manages your calendar autonomously."
    },
    {
      name: "Personalized AI",
      timeline: "2025-2027",
      description: "AI tutors, coaches, therapists customized to you",
      impact: "Every student gets a personal AI tutor that knows exactly how they learn best."
    },
    {
      name: "AI in Physical World",
      timeline: "2026-2030",
      description: "Humanoid robots, advanced automation",
      impact: "Robots in warehouses, hospitals, homes. Tesla Optimus, Boston Dynamics becoming mainstream."
    },
    {
      name: "AGI Progress",
      timeline: "2030s?",
      description: "Artificial General Intelligence - human-level AI",
      impact: "AI that can learn any task a human can. Massive societal transformation if achieved."
    }
  ];

  const steps = [
    {
      title: "The Next 5-10 Years: What's Coming",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-violet-50 to-purple-50 p-6 rounded-xl border-l-4 border-violet-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">AI is Accelerating - Faster Than You Think</h3>
            <p className="text-lg text-gray-700 mb-4">
              ChatGPT went from 0 to 100 million users in 2 months (fastest in history). We're in exponential growth.
            </p>

            <div className="bg-white p-4 rounded-lg border-2 border-violet-300">
              <p className="font-bold text-gray-900 mb-2">AI Capability Timeline:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• <strong>2018:</strong> GPT-1 could barely write coherent sentences</li>
                <li>• <strong>2020:</strong> GPT-3 wrote convincing articles</li>
                <li>• <strong>2023:</strong> GPT-4 passed bar exam, med school exams</li>
                <li>• <strong>2024:</strong> AI can code, design, analyze data at professional level</li>
                <li>• <strong>2025+:</strong> ??? (The pace is increasing)</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-[#2D9B6F]/30 bg-[#E6F5EF] rounded-lg overflow-hidden">
              <div className="px-4 py-3">
                <h4 className="font-bold text-[#2D9B6F]">Opportunities Ahead</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700">✓ <strong>Education revolution:</strong> Personalized learning for everyone</p>
                <p className="text-gray-700">✓ <strong>Healthcare:</strong> Early disease detection, faster drug discovery</p>
                <p className="text-gray-700">✓ <strong>Climate:</strong> AI optimizing energy, predicting disasters</p>
                <p className="text-gray-700">✓ <strong>Accessibility:</strong> AI helping people with disabilities</p>
                <p className="text-gray-700">✓ <strong>Creativity:</strong> New forms of art, music, storytelling</p>
              </div>
            </div>

            <div className="border-2 border-red-200 bg-red-50 rounded-lg overflow-hidden">
              <div className="px-4 py-3">
                <h4 className="font-bold text-red-700">Challenges to Address</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700">⚠ <strong>Job displacement:</strong> Some careers will vanish</p>
                <p className="text-gray-700">⚠ <strong>Misinformation:</strong> Deepfakes getting more convincing</p>
                <p className="text-gray-700">⚠ <strong>Privacy:</strong> AI surveillance concerns</p>
                <p className="text-gray-700">⚠ <strong>Inequality:</strong> AI access gaps between rich/poor</p>
                <p className="text-gray-700">⚠ <strong>Control:</strong> Ensuring AI stays beneficial</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-800"><strong>Key insight:</strong> The world your kids grow up in will be radically different from today. AI literacy isn't optional - it's survival.</p>
          </div>

          <button onClick={() => setCurrentStep(1)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            Explore Future Trends <ChevronRight size={18} />
          </button>
        </div>
      )
    },
    {
      title: "Interactive: Future AI Trends",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">What's Next in AI?</h3>
            <p className="text-gray-700">
              Click each trend to understand where AI is heading and when to expect it.
            </p>
          </div>

          <div className="space-y-4">
            {futureTrends.map((trend, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (!selectedTrends.includes(idx)) {
                    setSelectedTrends([...selectedTrends, idx]);
                  }
                }}
                className={`cursor-pointer border-2 transition-all rounded-lg overflow-hidden ${
                  selectedTrends.includes(idx)
                    ? 'border-violet-500 bg-violet-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <div className="px-4 py-3">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-lg">{trend.name}</span>
                    <span style={{ fontSize:11, fontWeight:700, color:"#fff", background:"#7C3AED", padding:"3px 10px", borderRadius:999 }}>{trend.timeline}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{trend.description}</p>
                </div>
                {selectedTrends.includes(idx) && (
                  <div className="px-4 pb-4">
                    <div className="p-3 bg-white rounded border-l-4 border-violet-500">
                      <p className="text-sm font-bold text-gray-900 mb-1">Expected Impact:</p>
                      <p className="text-sm text-gray-700">{trend.impact}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {selectedTrends.length >= 3 && (
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
              question: "AI development is currently:",
              options: ["slowing down", "accelerating exponentially", "stopped", "the same as 10 years ago"],
              correct_answer: 1,
              explanation: "AI capabilities are improving faster than ever. What took years now happens in months. We're in exponential growth."
            },
            {
              question: "Best way to prepare for AI future:",
              options: ["ignore it", "learn to use AI tools + think critically", "fear all technology", "avoid learning"],
              correct_answer: 1,
              explanation: "Combining AI tool mastery with critical thinking, creativity, and ethics positions you to thrive in the AI era."
            },
            {
              question: "AGI (Artificial General Intelligence) means:",
              options: ["AI in games only", "AI that can learn any task humans can", "faster phones", "better graphics"],
              correct_answer: 1,
              explanation: "AGI would be AI with human-level general intelligence - able to learn and excel at any cognitive task, not just narrow specialized tasks."
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
            <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 9 of 10</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              The Future of AI: Trends, Predictions, and What to Expect
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
              {currentStepData.type === 'concept' && <TrendingUp className="w-6 h-6" />}
              {currentStepData.type === 'activity' && <Rocket className="w-6 h-6" />}
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
