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
import { ArrowLeft, ChevronRight, Briefcase, TrendingUp, Brain, Lightbulb } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

export default function AIDay7() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedSkills, setSelectedSkills] = useState([]);

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
    queryKey: ['aiDayProgress', user?.email, 7],
    queryFn: async () => {
      const progress = await dataClient.entities.AICourseDayProgress.filter({ 
        user_email: user?.email,
        day_number: 7
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
          day_number: 7,
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

  const careerSkills = [
    { name: "Prompt Engineering", demand: "High", description: "Writing effective AI prompts" },
    { name: "AI Tool Proficiency", demand: "Critical", description: "Using ChatGPT, Midjourney, etc." },
    { name: "Data Literacy", demand: "High", description: "Understanding data quality & bias" },
    { name: "Critical Thinking", demand: "Critical", description: "Verifying AI outputs" },
    { name: "Ethics & Responsibility", demand: "High", description: "Using AI responsibly" },
    { name: "Adaptability", demand: "Critical", description: "Learning new AI tools quickly" }
  ];

  const steps = [
    {
      title: "AI in the Workplace: Transformation Ahead",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 rounded-xl border-l-4 border-green-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">The AI Skills Revolution</h3>
            <p className="text-lg text-gray-700 mb-4">
              AI won't replace humans, but humans using AI will replace those who don't. Every career will be impacted.
            </p>

            <div className="bg-white p-4 rounded-lg border-2 border-green-300">
              <p className="font-bold text-gray-900 mb-2">McKinsey Research (2023):</p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 75% of value from generative AI in 4 areas: Customer ops, marketing, software, R&D</li>
                <li>• Workers could automate 60-70% of their time with AI</li>
                <li>• Skills required changing faster than ever before</li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700">Jobs AI Enhances</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p className="text-gray-700 font-bold">Creative fields:</p>
                <ul className="list-disc ml-6 text-gray-600">
                  <li>Designers use AI for rapid prototyping</li>
                  <li>Writers use AI for brainstorming, editing</li>
                  <li>Marketers use AI for personalization</li>
                </ul>
                <p className="text-gray-700 font-bold mt-3">Technical fields:</p>
                <ul className="list-disc ml-6 text-gray-600">
                  <li>Programmers use AI coding assistants</li>
                  <li>Data analysts automate reporting</li>
                  <li>Researchers accelerate discovery</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200">
              <CardHeader className="bg-orange-50">
                <CardTitle className="text-orange-700">Jobs At Risk</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p className="text-gray-700">Roles with repetitive, predictable tasks:</p>
                <ul className="list-disc ml-6 text-gray-600 space-y-1">
                  <li>Data entry clerks</li>
                  <li>Basic customer service</li>
                  <li>Simple content writing</li>
                  <li>Routine accounting</li>
                  <li>Telemarketing</li>
                </ul>
                <div className="bg-orange-100 p-2 rounded mt-3">
                  <p className="text-xs text-orange-900"><strong>Key insight:</strong> Jobs requiring human judgment, creativity, empathy, and complex problem-solving are safer</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-green-600 hover:bg-green-700">
            Explore Career Skills <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )
    },
    {
      title: "Interactive: Build Your AI Skill Set",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-teal-50 p-6 rounded-xl border-l-4 border-teal-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Essential AI-Era Skills</h3>
            <p className="text-gray-700">
              Click on skills to learn why they matter. These are what employers will look for.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {careerSkills.map((skill, idx) => (
              <Card
                key={idx}
                onClick={() => {
                  if (!selectedSkills.includes(idx)) {
                    setSelectedSkills([...selectedSkills, idx]);
                  }
                }}
                className={`cursor-pointer border-2 transition-all ${
                  selectedSkills.includes(idx)
                    ? 'border-green-500 bg-green-50 shadow-lg'
                    : 'border-gray-200 hover:border-teal-300'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>{skill.name}</span>
                    <Badge className={skill.demand === "Critical" ? "bg-red-500" : "bg-orange-500"}>
                      {skill.demand}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600">{skill.description}</p>
                  {selectedSkills.includes(idx) && (
                    <div className="mt-3 p-3 bg-white rounded border-l-4 border-green-500">
                      <p className="text-xs text-gray-700">
                        <strong>Why it matters:</strong> {
                          idx === 0 ? "Effective prompting makes you 10x more productive with AI tools" :
                          idx === 1 ? "Every industry uses AI tools - proficiency is becoming baseline expectation" :
                          idx === 2 ? "Understanding data helps you spot AI mistakes and biases" :
                          idx === 3 ? "AI can be wrong - you need to verify and think critically" :
                          idx === 4 ? "Companies need employees who use AI responsibly and ethically" :
                          "AI evolves fast - ability to learn new tools quickly is crucial"
                        }
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedSkills.length >= 4 && (
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-green-600 hover:bg-green-700">
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
              question: "In the AI era, what becomes most valuable?",
              options: ["memorizing facts", "creative thinking + AI tool mastery", "avoiding technology", "manual data entry"],
              correct_answer: 1,
              explanation: "Combining human creativity, judgment, and critical thinking with AI tools creates the most value in modern careers."
            },
            {
              question: "Jobs least likely to be automated involve:",
              options: ["repetitive tasks", "empathy, creativity, complex judgment", "data entry", "routine calculations"],
              correct_answer: 1,
              explanation: "AI struggles with tasks requiring human empathy, creative problem-solving, ethical judgment, and nuanced social understanding."
            },
            {
              question: "Best career strategy for AI era:",
              options: ["ignore AI entirely", "learn to use AI as a powerful tool", "let AI do everything", "avoid learning"],
              correct_answer: 1,
              explanation: "Learning to effectively use AI tools while maintaining critical thinking and creativity positions you for success."
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
        <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-teal-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("AILiteracy"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center space-y-2">
          <Badge className="bg-green-600 text-white">Day 7 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            AI and Your Future Career: Skills for Tomorrow
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
          <CardHeader className="bg-gradient-to-r from-green-500 to-teal-500 text-white">
            <CardTitle className="flex items-center gap-2">
              {currentStepData.type === 'concept' && <Briefcase className="w-6 h-6" />}
              {currentStepData.type === 'activity' && <Lightbulb className="w-6 h-6" />}
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
                idx === currentStep ? 'bg-green-600 w-8' : idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}