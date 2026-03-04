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
import { ArrowLeft, ChevronRight, Eye, Image as ImageIcon, Brain } from "lucide-react";
import InteractiveQuiz from "@/components/InteractiveQuiz";

export default function AIDay3() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);

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
    queryKey: ["aiDayProgress", user?.email, 3],
    queryFn: async () => {
      const progress = await dataClient.entities.AICourseDayProgress.filter({
        user_email: user?.email,
        day_number: 3,
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
          day_number: 3,
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

  const imageExamples = [
    { url: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131", isAI: false, label: "Real Cat Photo" },
    { url: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba", isAI: false, label: "Real Cat Photo" },
    { url: "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8", isAI: false, label: "Real Cat Photo" },
  ];

  const steps = [
    {
      title: "Computer Vision: Teaching Computers to 'See'",
      type: "concept",
      content: (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-l-4 border-purple-500">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">How Do Computers See Images?</h3>
            <p className="text-lg text-gray-700 mb-4">
              To a computer, an image is just a grid of numbers. Each pixel has values for Red, Green, and Blue (0-255).
            </p>

            <div className="bg-white p-4 rounded-lg border-2 border-purple-300 mb-4">
              <p className="font-bold text-gray-900 mb-2">Example: A 3x3 red pixel patch</p>
              <div className="grid grid-cols-3 gap-1 w-24 mb-2">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="w-6 h-6 bg-red-500"></div>
                ))}
              </div>
              <p className="text-sm text-gray-600">To you: Red square</p>
              <p className="text-sm text-gray-600">To computer: [[255,0,0], [255,0,0], [255,0,0], ...]</p>
            </div>
          </div>

          <div className="space-y-4">
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50">
                <CardTitle className="text-blue-700">What is Computer Vision?</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-2 text-sm">
                <p className="text-gray-700">Teaching computers to extract meaning from images and videos</p>
                <p className="text-gray-700"><strong>Tasks:</strong></p>
                <ul className="list-disc ml-6 space-y-1 text-gray-600">
                  <li>Classification: "This is a cat"</li>
                  <li>Detection: "There's a cat at position X,Y"</li>
                  <li>Segmentation: "These exact pixels are the cat"</li>
                  <li>Face recognition, medical imaging, self-driving cars</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardHeader className="bg-green-50">
                <CardTitle className="text-green-700">How It Works: Convolutional Neural Networks (CNNs)</CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3 text-sm">
                <div className="space-y-2">
                  <p className="font-bold text-gray-900">Layer 1: Edge Detection</p>
                  <p className="text-gray-600">Finds simple patterns like horizontal/vertical lines</p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-gray-900">Layer 2: Shapes</p>
                  <p className="text-gray-600">Combines edges into circles, triangles, curves</p>
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-gray-900">Layer 3+: Complex Features</p>
                  <p className="text-gray-600">Eyes, ears, fur patterns → "CAT"</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-800">
              <strong>Real Application:</strong> Medical AI can detect cancer in X-rays by learning from thousands of labeled medical images,
              often spotting patterns invisible to human eyes.
            </p>
          </div>

          <Button onClick={() => setCurrentStep(1)} className="w-full bg-purple-600 hover:bg-purple-700">
            Continue to Activity <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      ),
    },
    {
      title: "Interactive: AI vs Real Images",
      type: "activity",
      content: (
        <div className="space-y-6">
          <div className="bg-purple-50 p-6 rounded-xl border-l-4 border-purple-500">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Can You Spot the Difference?</h3>
            <p className="text-gray-700">
              Examine these images. Computer vision systems analyze pixels, edges, and patterns to classify images.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {imageExamples.map((img, idx) => (
              <div
                key={idx}
                onClick={() => {
                  if (!selectedImages.includes(idx)) {
                    setSelectedImages([...selectedImages, idx]);
                  }
                }}
                className={`cursor-pointer rounded-lg overflow-hidden border-4 transition-all ${
                  selectedImages.includes(idx)
                    ? "border-green-500 shadow-lg"
                    : "border-gray-200 hover:border-purple-300"
                }`}
              >
                <img src={img.url} alt={img.label} className="w-full h-48 object-cover" />
                <div className="p-3 bg-white">
                  <p className="text-sm font-semibold text-gray-900">{img.label}</p>
                  {selectedImages.includes(idx) && (
                    <Badge className="mt-2 bg-green-500 text-white">Analyzed ✓</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-800">
              <strong>How CV systems work:</strong> They break images into features (edges, colors, textures), then use neural networks to classify.
              Training data quality is crucial!
            </p>
          </div>

          {selectedImages.length >= 2 && (
            <Button onClick={() => setCurrentStep(2)} className="w-full bg-purple-600 hover:bg-purple-700">
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
              question: "To a computer, an image is represented as:",
              options: ["magic", "a grid of numbers (pixels)", "thoughts", "sound waves"],
              correct_answer: 1,
              explanation:
                "Images are grids of numbers representing pixel colors (RGB values). Computers don't 'see' - they process numerical data.",
            },
            {
              question: "Computer vision is used in:",
              options: ["only games", "medical diagnosis, self-driving cars, face recognition", "only social media", "microwave ovens"],
              correct_answer: 1,
              explanation:
                "Computer vision has countless real-world applications including healthcare, autonomous vehicles, security, agriculture, and more.",
            },
            {
              question: "CNNs (Convolutional Neural Networks) work by:",
              options: ["random guessing", "learning hierarchical features from simple to complex", "asking humans", "magic spells"],
              correct_answer: 1,
              explanation:
                "CNNs learn in layers: first detecting edges, then shapes, then complex patterns, building understanding hierarchically.",
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
          <Badge className="bg-purple-600 text-white">Day 3 of 10</Badge>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Computer Vision and Image Recognition
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
              {currentStepData.type === "concept" && <Eye className="w-6 h-6" />}
              {currentStepData.type === "activity" && <ImageIcon className="w-6 h-6" />}
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
                idx === currentStep ? "bg-purple-600 w-8" : idx < currentStep ? "bg-green-500" : "bg-gray-300"
              }`}
              disabled={idx > currentStep}
            />
          ))}
        </div>
      </div>
    </div>
  );
}