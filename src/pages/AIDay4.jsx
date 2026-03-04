import React, { useState, useEffect } from "react";
import { getCurrentUserSafe } from "@/lib/appClient";
import { dataClient } from "@/api/dataClient";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight, MessageSquare, AlertTriangle, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import HallucinationDetector from "@/components/HallucinationDetector";

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
    queryFn: async () => {
      const progress = await dataClient.entities.AICourseDayProgress.filter({
        user_email: user?.email,
        day_number: 4,
      });
      return progress[0];
    },
    enabled: !!user,
  });

  const completeDayMutation = useMutation({
    mutationFn: async (quizScore) => {
      if (!user?.email) throw new Error("Missing user");
      if (dayProgress) {
        await dataClient.entities.AICourseDayProgress.update(dayProgress.id, {
          completed: true,
          completed_date: new Date().toISOString(),
          activity_completed: true,
          quiz_score: quizScore,
          time_spent_minutes: 60,
        });
      } else {
        await dataClient.entities.AICourseDayProgress.create({
          user_email: user.email,
          day_number: 4,
          completed: true,
          completed_date: new Date().toISOString(),
          activity_completed: true,
          quiz_score: quizScore,
          time_spent_minutes: 60,
        });
      }
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
            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700">What LLMs CAN Do</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p>✓ Write essays, stories, code</p>
                <p>✓ Explain complex topics</p>
                <p>✓ Translate languages</p>
                <p>✓ Summarize documents</p>
                <p>✓ Answer questions</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200">
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700">What LLMs CAN'T Do</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p>✗ Truly "understand" meaning</p>
                <p>✗ Access real-time information</p>
                <p>✗ Verify their own outputs</p>
                <p>✗ Do perfect math calculations</p>
                <p>✗ Know what's actually true</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-yellow-600 hover:bg-yellow-700">
            Continue <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
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
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-yellow-600 hover:bg-yellow-700">
              Continue to Quiz <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("AILiteracy"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center space-y-2">
          <Badge className="bg-yellow-600 text-white">Day 4 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Generative AI: Large Language Models and Hallucinations
          </h1>
        </div>

        <Card className="border-none shadow-lg">
          <CardContent className="pt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Step {currentStep + 1} of {steps.length}</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl">
          <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <CardTitle className="flex items-center gap-2">
              {currentStepData.type === "concept" && <MessageSquare className="w-6 h-6" />}
              {currentStepData.type === "activity" && <AlertTriangle className="w-6 h-6" />}
              {currentStepData.type === "quiz" && <Brain className="w-6 h-6" />}
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">{currentStepData.content}</CardContent>
        </Card>

        <div className="flex justify-center gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentStep ? "bg-yellow-600 w-8" : idx < currentStep ? "bg-green-500" : "bg-gray-300"
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}