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
import { ArrowLeft, ChevronRight, TrendingUp, Rocket, Brain, AlertCircle } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

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
    queryFn: async () => {
      const progress = await dataClient.entities.AICourseDayProgress.filter({ 
        user_email: user?.email,
        day_number: 9
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
          day_number: 9,
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
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Opportunities Ahead</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-gray-700">✓ <strong>Education revolution:</strong> Personalized learning for everyone</p>
                <p className="text-gray-700">✓ <strong>Healthcare:</strong> Early disease detection, faster drug discovery</p>
                <p className="text-gray-700">✓ <strong>Climate:</strong> AI optimizing energy, predicting disasters</p>
                <p className="text-gray-700">✓ <strong>Accessibility:</strong> AI helping people with disabilities</p>
                <p className="text-gray-700">✓ <strong>Creativity:</strong> New forms of art, music, storytelling</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-700">Challenges to Address</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p className="text-gray-700">⚠ <strong>Job displacement:</strong> Some careers will vanish</p>
                <p className="text-gray-700">⚠ <strong>Misinformation:</strong> Deepfakes getting more convincing</p>
                <p className="text-gray-700">⚠ <strong>Privacy:</strong> AI surveillance concerns</p>
                <p className="text-gray-700">⚠ <strong>Inequality:</strong> AI access gaps between rich/poor</p>
                <p className="text-gray-700">⚠ <strong>Control:</strong> Ensuring AI stays beneficial</p>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-800"><strong>Key insight:</strong> The world your kids grow up in will be radically different from today. AI literacy isn't optional - it's survival.</p>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-violet-600 hover:bg-violet-700">
            Explore Future Trends <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
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
              <Card
                key={idx}
                onClick={() => {
                  if (!selectedTrends.includes(idx)) {
                    setSelectedTrends([...selectedTrends, idx]);
                  }
                }}
                className={`cursor-pointer border-2 transition-all ${
                  selectedTrends.includes(idx)
                    ? 'border-violet-500 bg-violet-50 shadow-lg'
                    : 'border-gray-200 hover:border-purple-300'
                }`}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{trend.name}</CardTitle>
                    <Badge className="bg-violet-600 text-white">{trend.timeline}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">{trend.description}</p>
                </CardHeader>
                {selectedTrends.includes(idx) && (
                  <CardContent>
                    <div className="p-3 bg-white rounded border-l-4 border-violet-500">
                      <p className="text-sm font-bold text-gray-900 mb-1">Expected Impact:</p>
                      <p className="text-sm text-gray-700">{trend.impact}</p>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>

          {selectedTrends.length >= 3 && (
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-violet-600 hover:bg-violet-700">
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("AILiteracy"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center space-y-2">
          <Badge className="bg-violet-600 text-white">Day 9 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            The Future of AI: Trends, Predictions, and What to Expect
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
          <CardHeader className="bg-gradient-to-r from-violet-500 to-purple-500 text-white">
            <CardTitle className="flex items-center gap-2">
              {currentStepData.type === 'concept' && <TrendingUp className="w-6 h-6" />}
              {currentStepData.type === 'activity' && <Rocket className="w-6 h-6" />}
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
                idx === currentStep ? 'bg-violet-600 w-8' : idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}