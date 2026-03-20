// src/pages/AIDay10.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, ChevronRight, Award, CheckCircle, Brain } from "lucide-react";
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

export default function AIDay10() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

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
    queryKey: ["aiDayProgress", user?.email, 10],
    queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 10 }),
    enabled: !!user,
  });

  const completeDayMutation = useMutation({
    mutationFn: async (quizScore) => {
      await upsertAIDayProgress({
        user_email: user.email,
        day_number: 10,
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

  const keyTakeaways = [
    "AI is pattern-matching math, not magic or consciousness",
    "Data quality determines AI quality - garbage in, garbage out",
    "LLMs predict plausible text, not truth - always verify claims",
    "Effective prompting requires context, constraints, and clarity",
    "AI has serious biases from training data - stay critical",
    "Jobs requiring creativity, empathy, judgment are safer from automation",
    "AI literacy is becoming as essential as reading and writing",
    "Use AI as a tool to augment your abilities, not replace thinking",
    "The AI era rewards continuous learning and adaptability",
    "Ethics matter: bias, privacy, misinformation are real challenges",
  ];

  const steps = [
    {
      title: "Course Review: What You've Mastered",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-6 rounded-xl border-l-4 border-amber-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">🎓 You're Now AI Literate!</h3>
            <p className="text-lg text-gray-700 mb-4">
              Over 10 days, you've gone from AI beginner to informed, critical user. Here's what you now understand:
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="border-2 border-blue-200 rounded-lg overflow-hidden">
              <div className="bg-blue-50 px-4 py-3">
                <h4 className="font-bold text-blue-700">Technical Foundations</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700">✓ How machine learning works (data → training → model)</p>
                <p className="text-gray-700">✓ Supervised vs unsupervised learning</p>
                <p className="text-gray-700">✓ Computer vision and image recognition</p>
                <p className="text-gray-700">✓ How LLMs generate text (next-token prediction)</p>
                <p className="text-gray-700">✓ Why AI hallucinates and how to spot it</p>
              </div>
            </div>

            <div className="border-2 border-[#2D9B6F]/30 rounded-lg overflow-hidden">
              <div className="bg-[#E6F5EF] px-4 py-3">
                <h4 className="font-bold text-[#2D9B6F]">Practical Skills</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700">✓ Writing effective prompts (CLEAR framework)</p>
                <p className="text-gray-700">✓ Recognizing algorithmic bias</p>
                <p className="text-gray-700">✓ Protecting privacy with AI tools</p>
                <p className="text-gray-700">✓ Detecting deepfakes and misinformation</p>
                <p className="text-gray-700">✓ Using AI ethically in school and work</p>
              </div>
            </div>

            <div className="border-2 border-purple-200 rounded-lg overflow-hidden">
              <div className="bg-purple-50 px-4 py-3">
                <h4 className="font-bold text-purple-700">Future Readiness</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700">✓ Understanding AI's impact on careers</p>
                <p className="text-gray-700">✓ Skills that will remain valuable (creativity, ethics, critical thinking)</p>
                <p className="text-gray-700">✓ Real-world AI applications across industries</p>
                <p className="text-gray-700">✓ Emerging trends (multimodal AI, AI agents, personalization)</p>
              </div>
            </div>

            <div className="border-2 border-orange-200 rounded-lg overflow-hidden">
              <div className="bg-orange-50 px-4 py-3">
                <h4 className="font-bold text-orange-700">Critical Mindset</h4>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <p className="text-gray-700">✓ Question AI outputs, don't blindly trust</p>
                <p className="text-gray-700">✓ Understand limitations and failure modes</p>
                <p className="text-gray-700">✓ Recognize when AI is appropriate vs inappropriate</p>
                <p className="text-gray-700">✓ Balance excitement with healthy skepticism</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r bg-[#E6F5EF] p-6 rounded-xl border-l-4 border-[#2D9B6F]">
            <h4 className="font-bold text-gray-900 mb-3 text-lg">🔑 Top 10 Takeaways</h4>
            <div className="space-y-2">
              {keyTakeaways.map((takeaway, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-[#2D9B6F] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-gray-700">{takeaway}</p>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setCurrentStep(1)} style={{ width:"100%", padding:"14px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
            Take Final Assessment <ChevronRight size={18} />
          </button>
        </div>
      ),
    },
    {
      title: "Final Comprehensive Assessment",
      type: "quiz",
      content: (
        <InteractiveQuiz
          questions={[
            {
              question: "Machine learning fundamentally works by:",
              options: ["magic", "finding patterns in data to make predictions", "human intelligence", "random guessing"],
              correct_answer: 1,
              explanation: "ML algorithms analyze data to find patterns, then use those patterns to make predictions on new data. It's math, not magic."
            },
            {
              question: "When an LLM 'hallucinates', it means:",
              options: ["the AI is dreaming", "it generated plausible but false information", "it's working perfectly", "it needs sleep"],
              correct_answer: 1,
              explanation: "Hallucination is when AI confidently generates false information that sounds plausible. Always verify factual claims."
            },
            {
              question: "The BEST prompt includes:",
              options: ["one vague word", "context, constraints, format, and clear request", "emojis only", "secrets"],
              correct_answer: 1,
              explanation: "Effective prompts provide context, set constraints, specify format, and make clear requests - the CLEAR framework."
            },
            {
              question: "Algorithmic bias comes from:",
              options: ["AI being evil", "biased training data reflecting human biases", "electricity", "monitors"],
              correct_answer: 1,
              explanation: "AI learns from data. If training data contains human biases, the AI will learn and perpetuate those biases."
            },
            {
              question: "In the AI era, what becomes MOST valuable?",
              options: ["memorizing facts", "creativity + critical thinking + AI tool mastery", "avoiding all technology", "repetitive tasks"],
              correct_answer: 1,
              explanation: "Combining uniquely human skills (creativity, empathy, judgment) with AI proficiency creates the most value going forward."
            },
            {
              question: "When using AI for schoolwork, you should:",
              options: ["copy AI output directly and submit", "use AI to learn concepts and create your own work", "never use AI", "only use AI"],
              correct_answer: 1,
              explanation: "Use AI as a learning aid (explain concepts, create practice questions), but do the actual work yourself to truly learn."
            },
            {
              question: "Computer vision systems 'see' images as:",
              options: ["magic visions", "grids of numbers representing pixels", "actual pictures", "thoughts"],
              correct_answer: 1,
              explanation: "To computers, images are numerical data - grids of RGB values. CV systems find patterns in these numbers."
            },
            {
              question: "Best practice for AI and privacy:",
              options: ["share everything", "never input personal/sensitive information", "post passwords", "ignore privacy"],
              correct_answer: 1,
              explanation: "Assume anything you input to AI tools could be stored. Never share personal, sensitive, or confidential information."
            },
            {
              question: "AI's current limitation is that it:",
              options: ["is perfect", "lacks true understanding and consciousness", "never makes mistakes", "knows everything"],
              correct_answer: 1,
              explanation: "AI is sophisticated pattern-matching, not conscious understanding. It doesn't 'know' what it's saying, just predicts likely outputs."
            },
            {
              question: "You've completed this course! What's your next step?",
              options: ["forget everything", "practice using AI tools responsibly + stay curious", "fear all AI", "stop learning"],
              correct_answer: 1,
              explanation: "Keep exploring AI tools, practice prompting, stay informed on developments, and use AI responsibly to augment your capabilities!"
            }
          ]}
          onComplete={(score) => {
            const percentage = Math.round((score / 10) * 100);
            completeDayMutation.mutate(percentage);
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
            <span style={{ fontSize:12, fontWeight:700, color:"#fff", background:C.navy, padding:"5px 14px", borderRadius:999 }}>Day 10 of 10 - Final Day! 🎉</span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Course Wrap-Up and Final Assessment
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
              {currentStepData.type === "concept" && <Award className="w-6 h-6" />}
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
