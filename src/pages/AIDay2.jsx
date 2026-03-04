// src/pages/AIDay2.jsx
import React, { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChevronRight, Database, Target, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";
import MLTrainingSimulator from "@/components/MLTrainingSimulator";

import { getCurrentUserSafe, getAIDayProgress, upsertAIDayProgress } from "@/lib/appClient";

export default function AIDay2() {
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
    queryKey: ["aiDayProgress", user?.email, 2],
    queryFn: async () => getAIDayProgress({ user_email: user?.email, day_number: 2 }),
    enabled: !!user,
  });

  const completeDayMutation = useMutation({
    mutationFn: async (quizScore) => {
      await upsertAIDayProgress({
        user_email: user.email,
        day_number: 2,
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
      title: "The Machine Learning Pipeline",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border-l-4 border-blue-500">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How Machines Learn</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">1</div>
                <div>
                  <h4 className="font-bold text-gray-900">Collect Data</h4>
                  <p className="text-sm text-gray-600">Examples with features and labels. For a cat classifier, you need thousands of images labeled "cat" or "not cat"</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">2</div>
                <div>
                  <h4 className="font-bold text-gray-900">Training</h4>
                  <p className="text-sm text-gray-600">Model analyzes patterns - what makes a cat a cat? Whiskers, ears, eyes? It adjusts internal parameters millions of times</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">3</div>
                <div>
                  <h4 className="font-bold text-gray-900">Create Model</h4>
                  <p className="text-sm text-gray-600">The result is a mathematical function: Input (image) → Output (cat probability). Not magic, just math!</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl">4</div>
                <div>
                  <h4 className="font-bold text-gray-900">Test & Deploy</h4>
                  <p className="text-sm text-gray-600">Test on NEW images it's never seen. If accurate, deploy. If not, collect more/better data and retrain</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-800">
              <strong>Important:</strong> The model doesn't "understand" cats like you do. It found statistical patterns in pixel data.
              Show it a cat-shaped cloud and it might say "cat" - because it's pattern-matching, not thinking.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-700">Supervised Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-gray-700"><strong>What it is:</strong> Learning from labeled examples (you tell it the right answer)</p>
                <p className="text-gray-700"><strong>Examples:</strong></p>
                <ul className="list-disc ml-6 space-y-1 text-gray-600">
                  <li>Spam filter: Email text → "spam" or "not spam"</li>
                  <li>Medical diagnosis: X-ray image → "tumor" or "healthy"</li>
                  <li>House prices: Features (size, location) → price</li>
                </ul>
                <p className="text-gray-700"><strong>Data format:</strong> Input + correct label</p>
                <div className="bg-green-100 p-2 rounded text-xs">
                  <strong>Real example:</strong> Netflix trained an algorithm on millions of (user, movie, rating) examples to predict what you'll enjoy
                </div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-700">Unsupervised Learning</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <p className="text-gray-700"><strong>What it is:</strong> Finding patterns without labels (discover structure on its own)</p>
                <p className="text-gray-700"><strong>Examples:</strong></p>
                <ul className="list-disc ml-6 space-y-1 text-gray-600">
                  <li>Customer segmentation: Group similar shoppers</li>
                  <li>Fraud detection: Find unusual transaction patterns</li>
                  <li>Topic discovery: What themes appear in documents?</li>
                </ul>
                <p className="text-gray-700"><strong>Data format:</strong> Just inputs, no labels</p>
                <div className="bg-purple-100 p-2 rounded text-xs">
                  <strong>Real example:</strong> Spotify's "Discover Weekly" finds patterns in your listening to group you with similar users, then recommends their favorites
                </div>
              </CardContent>
            </Card>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-blue-600 hover:bg-blue-700">
            Continue <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      ),
    },
    {
      title: "Interactive Lab: Train Your Own Model",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-yellow-50 p-6 rounded-xl border-l-4 border-yellow-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">🧪 Hands-On Lab</h3>
            <p className="text-gray-700">
              You'll train a cat vs dog classifier. See how data quality affects model accuracy!
            </p>
          </div>

          <MLTrainingSimulator onComplete={() => setActivityComplete(true)} />

          {activityComplete && (
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-blue-600 hover:bg-blue-700">
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
              question: "In supervised learning, the training data usually includes:",
              options: ["only inputs", "inputs + correct outputs", "only outputs", "random noise"],
              correct_answer: 1,
              explanation: "Supervised learning requires both inputs (features) and outputs (labels) so the model can learn the relationship between them."
            },
            {
              question: "If a model works great on training examples but poorly on new examples, that suggests:",
              options: ["good generalization", "overfitting", "privacy", "encryption"],
              correct_answer: 1,
              explanation: "This is overfitting - the model memorized training examples instead of learning general patterns that work on new data."
            },
            {
              question: "What improves a weak ML model the most?",
              options: ["Add diverse training examples", "Use the same training data", "Skip testing", "Avoid edge cases"],
              correct_answer: 0,
              explanation: "Adding diverse, balanced training examples significantly improves model performance and generalization."
            }
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
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate(createPageUrl("AILiteracy"))}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Course
        </Button>

        <div className="text-center space-y-2">
          <Badge className="bg-blue-600 text-white">Day 2 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            How Machines Learn: Data, Training, and Models
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
          <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
            <CardTitle className="flex items-center gap-2">
              {currentStepData.type === "concept" && <Database className="w-6 h-6" />}
              {currentStepData.type === "activity" && <Target className="w-6 h-6" />}
              {currentStepData.type === "quiz" && <Brain className="w-6 h-6" />}
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
                idx === currentStep ? "bg-blue-600 w-8" : idx < currentStep ? "bg-green-500" : "bg-gray-300"
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}