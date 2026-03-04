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
import { ArrowLeft, ChevronRight, Zap, PenTool, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import PromptWorkshop from "@/components/PromptWorkshop";

export default function AIDay5() {
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
    queryKey: ['aiDayProgress', user?.email, 5],
    queryFn: async () => {
      const progress = await dataClient.entities.AICourseDayProgress.filter({ 
        user_email: user?.email,
        day_number: 5
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
          day_number: 5,
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
      title: "The CLEAR Prompting Framework",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border-l-4 border-indigo-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Better Prompts = Better Outputs</h3>
            <p className="text-lg text-gray-700 mb-6">
              Prompting is HOW you communicate with AI. Master it and you'll get dramatically better results.
            </p>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">C</div>
                  <h4 className="font-bold text-gray-900">Context</h4>
                </div>
                <p className="text-sm text-gray-600 ml-10">Provide background and relevant information</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">L</div>
                  <h4 className="font-bold text-gray-900">Limits</h4>
                </div>
                <p className="text-sm text-gray-600 ml-10">Set boundaries and constraints</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-yellow-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-yellow-600 text-white flex items-center justify-center font-bold">E</div>
                  <h4 className="font-bold text-gray-900">Examples</h4>
                </div>
                <p className="text-sm text-gray-600 ml-10">Show what you want</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center font-bold">A</div>
                  <h4 className="font-bold text-gray-900">Ask</h4>
                </div>
                <p className="text-sm text-gray-600 ml-10">Make your request specific and clear</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-pink-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-pink-600 text-white flex items-center justify-center font-bold">R</div>
                  <h4 className="font-bold text-gray-900">Review</h4>
                </div>
                <p className="text-sm text-gray-600 ml-10">Specify output format and requirements</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">❌ Weak Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="italic text-gray-700">"Explain photosynthesis"</p>
                <p className="text-red-700">• No audience specified</p>
                <p className="text-red-700">• No format requested</p>
                <p className="text-red-700">• Too vague</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">✓ Strong Prompt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="italic text-gray-700">"Explain photosynthesis to a 9th grader in 5 bullet points with one analogy"</p>
                <p className="text-green-700">✓ Audience: 9th grader</p>
                <p className="text-green-700">✓ Format: 5 bullet points</p>
                <p className="text-green-700">✓ Extra: include analogy</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-indigo-600 hover:bg-indigo-700">
            Try It Yourself <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )
    },
    {
      title: "Interactive: Prompt Writing Workshop",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <PenTool className="w-6 h-6 text-purple-600" />
              Practice Writing Strong Prompts
            </h3>
            <p className="text-gray-700">
              You'll be given tasks. Write prompts and get scored on how well you applied the CLEAR framework!
            </p>
          </div>

          <PromptWorkshop onComplete={() => setActivityComplete(true)} />

          {activityComplete && (
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-indigo-600 hover:bg-indigo-700">
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
              question: "A strong prompt usually includes:",
              options: ["nothing", "context and constraints", "only emojis", "a secret code"],
              correct_answer: 1,
              explanation: "Strong prompts include context (background), constraints (limitations), format specifications, and clear requests."
            },
            {
              question: "Using AI to fully write and submit your assignment as your own is:",
              options: ["best practice", "academic dishonesty", "required", "impossible"],
              correct_answer: 1,
              explanation: "Submitting AI-generated work as your own without disclosure violates academic integrity and is considered cheating."
            },
            {
              question: "Ethical AI use for studying includes:",
              options: ["Have AI write your essay", "Create practice questions to answer yourself", "Use AI during closed-book exams", "Copy AI answers directly"],
              correct_answer: 1,
              explanation: "Using AI to generate practice questions, explain concepts, or provide study guidance - then doing the work yourself - is ethical."
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
        <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("AILiteracy"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center space-y-2">
          <Badge className="bg-indigo-600 text-white">Day 5 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Using AI Effectively: Prompting, Iteration, and Study Workflows
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
          <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white">
            <CardTitle className="flex items-center gap-2">
              {currentStepData.type === 'concept' && <Zap className="w-6 h-6" />}
              {currentStepData.type === 'activity' && <PenTool className="w-6 h-6" />}
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
                idx === currentStep ? 'bg-indigo-600 w-8' : idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}