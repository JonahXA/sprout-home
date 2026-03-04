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
import { ArrowLeft, ChevronRight, Shield, Scale, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import EthicsScenarios from "@/components/EthicsScenarios";

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
    queryFn: async () => {
      const progress = await dataClient.entities.AICourseDayProgress.filter({ 
        user_email: user?.email,
        day_number: 6
      });
      return progress[0];
    },
    enabled: !!user
  });

  const completeDayMutation = useMutation({
    mutationFn: async (quizScore) => {
      if (dayProgress) {
        await dataClient.entities.AICourseDayProgress.update(dayProgress.id, {
          completed: true,
          completed_date: new Date().toISOString(),
          activity_completed: true,
          quiz_score: quizScore,
          time_spent_minutes: 60
        });
      } else {
        await dataClient.entities.AICourseDayProgress.create({
          user_email: user.email,
          day_number: 6,
          completed: true,
          completed_date: new Date().toISOString(),
          activity_completed: true,
          quiz_score: quizScore,
          time_spent_minutes: 60
        });
      }
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
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Fairness
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p className="text-gray-700"><strong>Principle:</strong> AI should not systematically disadvantage any group</p>
                <p className="text-gray-700"><strong>Issues:</strong> Algorithmic bias, disparate impact, representation in data</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p className="text-gray-700"><strong>Principle:</strong> Protect personal information and respect consent</p>
                <p className="text-gray-700"><strong>Issues:</strong> Data collection, informed consent, data minimization</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardHeader className="bg-purple-50">
                <CardTitle className="text-purple-700 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Transparency
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p className="text-gray-700"><strong>Principle:</strong> People should know when and how AI is being used</p>
                <p className="text-gray-700"><strong>Issues:</strong> Explainability, disclosure of AI use, understanding decisions</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-700 flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Accountability
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p className="text-gray-700"><strong>Principle:</strong> Humans remain responsible for AI decisions</p>
                <p className="text-gray-700"><strong>Issues:</strong> Human oversight, responsibility for outcomes, redress mechanisms</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 p-6 rounded-lg border-l-4 border-yellow-500">
            <h4 className="font-bold text-gray-900 mb-3">Real Example: COMPAS (Criminal Justice AI)</h4>
            <p className="text-gray-700 mb-2">System predicted recidivism risk for sentencing decisions</p>
            <p className="text-sm text-gray-600">❌ <strong>Problem:</strong> Higher false positive rates for Black defendants</p>
            <p className="text-sm text-gray-600">📊 <strong>Cause:</strong> Trained on biased historical data</p>
            <p className="text-sm text-gray-600">⚖️ <strong>Impact:</strong> Influenced bail and sentencing, perpetuating bias</p>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-red-600 hover:bg-red-700">
            Continue to Ethical Scenarios <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
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
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-red-600 hover:bg-red-700">
              Continue to Quiz <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("AILiteracy"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center space-y-2">
          <Badge className="bg-red-600 text-white">Day 6 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Ethics: Bias, Privacy, Deepfakes, and Responsible Use
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
          <CardHeader className="bg-gradient-to-r from-red-500 to-pink-500 text-white">
            <CardTitle className="flex items-center gap-2">
              {currentStepData.type === 'concept' && <Shield className="w-6 h-6" />}
              {currentStepData.type === 'activity' && <Scale className="w-6 h-6" />}
              {currentStepData.type === 'quiz' && <Brain className="w-6 h-6" />}
              {currentStepData.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            {currentStepData.content}
          </CardContent>
        </Card>

        <div className="flex justify-center gap-2">
          {steps.map((_, idx) => (
            <button
              key={idx}
              onClick={() => idx <= currentStep && setCurrentStep(idx)}
              className={`w-3 h-3 rounded-full transition-all ${
                idx === currentStep ? 'bg-red-600 w-8' : idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}