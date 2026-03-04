// src/pages/AIDay1.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight, CheckCircle, Brain, Lightbulb, Target } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

import { getCurrentUserSafe, getAIDayProgress, upsertAIDayProgress } from "@/lib/appClient";

export default function AIDay1() {
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
    queryKey: ["aiDayProgress", user?.email, 1],
    queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 1 }),
    enabled: !!user,
  });

  const completeDayMutation = useMutation({
    mutationFn: async (quizScore) => {
      await upsertAIDayProgress({
        user_email: user.email,
        day_number: 1,
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
      title: "What is AI?",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Working Definition</h3>
            <p className="text-lg text-gray-700">
              <strong>AI = computer systems that perform tasks associated with human intelligence</strong>
              (perception, language, learning, decision-making).
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Narrow AI (Today)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-700">✓ Excellent at <strong>specific tasks</strong></p>
                <p className="text-gray-700">✓ Not conscious</p>
                <p className="text-gray-700">✓ Can be wrong with confidence</p>
                <p className="text-sm text-gray-600 mt-3"><strong>Examples:</strong> Face recognition, voice assistants, recommendations</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-gray-200 bg-gray-50">
              <CardHeader>
                <CardTitle className="text-gray-700">General AI (Future)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-gray-700">? Human-level intelligence</p>
                <p className="text-gray-700">? Flexible reasoning</p>
                <p className="text-gray-700">? Theoretical/not yet real</p>
                <p className="text-sm text-gray-600 mt-3"><strong>Status:</strong> Still science fiction</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-purple-600 hover:bg-purple-700">
            Continue <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      ),
    },
    {
      title: "AI in Your Daily Life",
      type: "exploration",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-gray-700">
            Let's explore where you already encounter AI every day...
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            {[
              { category: "Your Phone", items: ["Face unlock", "Autocorrect", "Photo organization", "Voice assistants"] },
              { category: "Social Media", items: ["News feed curation", "Friend suggestions", "Content moderation", "Ad targeting"] },
              { category: "Entertainment", items: ["Netflix recommendations", "Spotify playlists", "YouTube suggestions", "TikTok For You"] },
              { category: "Search & Navigation", items: ["Google Search", "Maps traffic predictions", "Spam filtering", "Smart replies"] }
            ].map((group, idx) => (
              <Card key={idx} className="border-2 border-blue-200 hover:border-blue-400 transition-all">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="text-blue-700">{group.category}</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="space-y-2">
                    {group.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle className="w-4 h-4 text-blue-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={() => setCurrentStep(2)} className="w-full bg-purple-600 hover:bg-purple-700">
            Continue <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      ),
    },
    {
      title: "Interactive: AI or Human?",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-600" />
              Test Your AI Detection Skills
            </h3>
            <p className="text-gray-700">
              Read the following responses and guess: Was this written by AI or a human?
            </p>
          </div>

          <AIOrHumanGame onComplete={() => setActivityComplete(true)} />

          {activityComplete && (
            <Button onClick={() => setCurrentStep(3)} className="w-full bg-purple-600 hover:bg-purple-700">
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
        <div className="space-y-6">
          <InteractiveQuiz
            questions={[
              {
                question: "Which is the best description of most AI used today?",
                options: ["General AI", "Narrow AI", "Human-level consciousness", "Telepathy"],
                correct_answer: 1,
                explanation: "Today's AI is narrow AI - excellent at specific tasks like face recognition or language translation, but not conscious or generally intelligent."
              },
              {
                question: "AI literacy includes:",
                options: ["Only coding", "Only tool use", "Understanding, using, and evaluating AI", "Memorizing model names"],
                correct_answer: 2,
                explanation: "AI literacy is about understanding how AI works, using it effectively, and evaluating it critically and ethically - not just coding or tool use."
              },
              {
                question: "True or False: If AI sounds confident, it is usually correct.",
                options: ["True", "False"],
                correct_answer: 1,
                explanation: "FALSE. AI can be wrong with confidence - sounding certain doesn't mean it's correct. Always verify important claims."
              }
            ]}
            onComplete={(score) => {
              const percentage = Math.round((score / 3) * 100);
              if (percentage >= 66) {
                completeDayMutation.mutate(percentage);
              }
            }}
          />
        </div>
      ),
    },
  ];

  const currentStepData = steps[currentStep];
  const progressPercent = ((currentStep + 1) / steps.length) * 100;

  if (isLoadingUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("AILiteracy"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center space-y-2">
          <Badge className="bg-purple-600 text-white">Day 1 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            What is AI and Why AI Literacy Matters
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
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
            <CardTitle className="flex items-center gap-2">
              {currentStepData.type === "concept" && <Brain className="w-6 h-6" />}
              {currentStepData.type === "activity" && <Target className="w-6 h-6" />}
              {currentStepData.type === "quiz" && <CheckCircle className="w-6 h-6" />}
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
                idx === currentStep
                  ? "bg-purple-600 w-8"
                  : idx < currentStep
                  ? "bg-green-500"
                  : "bg-gray-300"
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// AI or Human Game Component
function AIOrHumanGame({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = [
    {
      text: "The weather today is pleasant with temperatures around 72°F. You might want to bring a light jacket for the evening.",
      answer: "AI",
      explanation: "Generic, formal tone typical of AI weather summaries",
    },
    {
      text: "OMG it's so nice out!! Finally stopped raining lol. Gonna hit the park with my dog 🐕",
      answer: "Human",
      explanation: "Casual tone, emojis, personal details, informal language",
    },
    {
      text: "To optimize your productivity, consider implementing time-blocking techniques and prioritizing high-impact tasks.",
      answer: "AI",
      explanation: "Overly formal, generic advice without personal context",
    },
    {
      text: "I've been trying the pomodoro thing but honestly I just end up scrolling twitter during the breaks lmao",
      answer: "Human",
      explanation: "Self-aware, casual, mentions specific apps, relatable struggles",
    },
  ];

  const handleAnswer = (userAnswer) => {
    setAnswers({ ...answers, [currentQuestion]: userAnswer });

    if (currentQuestion < questions.length - 1) {
      setTimeout(() => setCurrentQuestion(currentQuestion + 1), 1500);
    } else {
      setTimeout(() => {
        setShowResults(true);
        onComplete();
      }, 1500);
    }
  };

  const score = Object.keys(answers).filter((key) => answers[key] === questions[key].answer).length;

  if (showResults) {
    return (
      <Card className="border-2 border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-gray-900 mb-2">
            You scored {score}/{questions.length}!
          </h3>
          <p className="text-gray-700 mb-4">
            {score >= 3 ? "Great job detecting AI!" : "Keep practicing your AI detection skills!"}
          </p>
          <div className="text-left space-y-3">
            <p className="font-semibold text-gray-900">Key Takeaways:</p>
            <ul className="space-y-2 text-gray-700">
              <li>• AI often uses formal, generic language</li>
              <li>• Humans use slang, emojis, and personal details</li>
              <li>• Context and tone are important clues</li>
              <li>• AI can sound confident even when wrong</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = questions[currentQuestion];
  const userAnswer = answers[currentQuestion];
  const isCorrect = userAnswer === question.answer;

  return (
    <div className="space-y-4">
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6">
          <p className="text-lg text-gray-800 mb-6 italic">"{question.text}"</p>

          {!userAnswer ? (
            <div className="grid grid-cols-2 gap-4">
              <Button onClick={() => handleAnswer("AI")} className="h-20 text-lg bg-blue-600 hover:bg-blue-700">
                🤖 AI Generated
              </Button>
              <Button onClick={() => handleAnswer("Human")} className="h-20 text-lg bg-green-600 hover:bg-green-700">
                👤 Human Written
              </Button>
            </div>
          ) : (
            <div className={`p-4 rounded-lg ${isCorrect ? "bg-green-50 border-2 border-green-500" : "bg-orange-50 border-2 border-orange-500"}`}>
              <p className="font-semibold mb-2">{isCorrect ? "✓ Correct!" : "✗ Not quite!"}</p>
              <p className="text-sm text-gray-700">
                <strong>Answer:</strong> {question.answer}
              </p>
              <p className="text-sm text-gray-600 mt-1">{question.explanation}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="text-center text-sm text-gray-600">
        Question {currentQuestion + 1} of {questions.length}
      </div>
    </div>
  );
}