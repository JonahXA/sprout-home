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
import { ArrowLeft, ChevronRight, Cpu, Zap, Brain, Activity } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

export default function AIDay8() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTechs, setSelectedTechs] = useState([]);

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
    queryKey: ['aiDayProgress', user?.email, 8],
    queryFn: async () => {
      const progress = await dataClient.entities.AICourseDayProgress.filter({ 
        user_email: user?.email,
        day_number: 8
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
          day_number: 8,
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

  const aiTechnologies = [
    { name: "Natural Language Processing", icon: "💬", uses: "Translation, chatbots, sentiment analysis" },
    { name: "Computer Vision", icon: "👁️", uses: "Face recognition, medical imaging, self-driving" },
    { name: "Recommendation Systems", icon: "🎯", uses: "Netflix, Spotify, Amazon product suggestions" },
    { name: "Robotics & Automation", icon: "🤖", uses: "Manufacturing, warehouse logistics, surgery assistance" },
    { name: "Predictive Analytics", icon: "📊", uses: "Weather forecasting, stock prediction, risk assessment" },
    { name: "Voice Assistants", icon: "🎙️", uses: "Siri, Alexa, Google Assistant" }
  ];

  const steps = [
    {
      title: "AI in Everyday Life: All Around You",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-cyan-50 to-blue-50 p-6 rounded-xl border-l-4 border-cyan-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">You Use AI Every Day Without Realizing</h3>
            <p className="text-lg text-gray-700 mb-4">
              AI isn't science fiction - it's your phone's camera, email spam filter, and Netflix recommendations.
            </p>

            <div className="space-y-3">
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-gray-900">🏠 At Home</p>
                <p className="text-sm text-gray-600">Smart thermostats learn your schedule, voice assistants answer questions, smart doorbells detect people</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                <p className="font-bold text-gray-900">📱 On Your Phone</p>
                <p className="text-sm text-gray-600">Face unlock, photo organization, autocorrect, navigation with traffic prediction</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-purple-500">
                <p className="font-bold text-gray-900">🎬 Entertainment</p>
                <p className="text-sm text-gray-600">Netflix/Spotify recommendations, TikTok For You page, YouTube suggestions, gaming AI opponents</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                <p className="font-bold text-gray-900">🏥 Healthcare</p>
                <p className="text-sm text-gray-600">Cancer detection in scans, drug discovery, fitness trackers predicting health issues</p>
              </div>

              <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                <p className="font-bold text-gray-900">🚗 Transportation</p>
                <p className="text-sm text-gray-600">Google Maps traffic routing, Tesla Autopilot, parking assistance, ride-share matching</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-800"><strong>Mind-blowing fact:</strong> Your smartphone has more AI computing power than NASA had for the entire Apollo moon landing program.</p>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-cyan-600 hover:bg-cyan-700">
            Explore AI Technologies <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )
    },
    {
      title: "Interactive: AI Tech Explorer",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 p-6 rounded-xl border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Major AI Technology Categories</h3>
            <p className="text-gray-700">
              Click each to see real-world applications you use regularly!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {aiTechnologies.map((tech, idx) => (
              <Card
                key={idx}
                onClick={() => {
                  if (!selectedTechs.includes(idx)) {
                    setSelectedTechs([...selectedTechs, idx]);
                  }
                }}
                className={`cursor-pointer border-2 transition-all ${
                  selectedTechs.includes(idx)
                    ? 'border-cyan-500 bg-cyan-50 shadow-lg'
                    : 'border-gray-200 hover:border-blue-300'
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-3xl">{tech.icon}</span>
                    {tech.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTechs.includes(idx) && (
                    <div className="p-3 bg-white rounded border-l-4 border-cyan-500">
                      <p className="text-sm font-bold text-gray-900 mb-1">Real Uses:</p>
                      <p className="text-sm text-gray-700">{tech.uses}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedTechs.length >= 4 && (
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-cyan-600 hover:bg-cyan-700">
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
              question: "Which is NOT an example of everyday AI?",
              options: ["spam filters", "Netflix recommendations", "a basic calculator", "face unlock"],
              correct_answer: 2,
              explanation: "Basic calculators follow fixed programmed rules, not AI. AI systems learn patterns from data to make predictions."
            },
            {
              question: "Recommendation systems (Netflix, Spotify) work by:",
              options: ["random guessing", "analyzing your patterns + similar users' patterns", "asking employees", "coin flips"],
              correct_answer: 1,
              explanation: "Recommendation systems use collaborative filtering - they find users similar to you and suggest what those users liked."
            },
            {
              question: "AI in healthcare helps with:",
              options: ["only billing", "detecting diseases in medical scans", "only scheduling", "making coffee"],
              correct_answer: 1,
              explanation: "Medical AI can detect cancer, predict heart attacks, assist in surgery, and discover new drugs - revolutionizing healthcare."
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
        <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("AILiteracy"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center space-y-2">
          <Badge className="bg-cyan-600 text-white">Day 8 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Real-World AI Applications Across Industries
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
          <CardHeader className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white">
            <CardTitle className="flex items-center gap-2">
              {currentStepData.type === 'concept' && <Cpu className="w-6 h-6" />}
              {currentStepData.type === 'activity' && <Activity className="w-6 h-6" />}
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
                idx === currentStep ? 'bg-cyan-600 w-8' : idx < currentStep ? 'bg-green-500' : 'bg-gray-300'
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}