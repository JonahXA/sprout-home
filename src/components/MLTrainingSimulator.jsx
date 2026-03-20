import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

export default function MLTrainingSimulator({ onComplete }) {
  const [step, setStep] = useState(0);
  const [trainingData, setTrainingData] = useState({ cats: 0, dogs: 0 });
  const [catImages, setCatImages] = useState([]);
  const [dogImages, setDogImages] = useState([]);
  const [testResults, setTestResults] = useState(null);
  const [modelTrained, setModelTrained] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(null);

  const addTrainingExample = (type) => {
    setTrainingData((prev) => ({ ...prev, [type]: prev[type] + 1 }));
  };

  const handleImageUpload = (e, type) => {
    const files = Array.from(e.target.files);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = event.target.result;
        if (type === "cats") {
          setCatImages((prev) => [...prev, img]);
          setTrainingData((prev) => ({ ...prev, cats: prev.cats + 1 }));
        } else {
          setDogImages((prev) => [...prev, img]);
          setTrainingData((prev) => ({ ...prev, dogs: prev.dogs + 1 }));
        }
      };
      reader.readAsDataURL(file);
    });
    setShowImageUpload(null);
  };

  const trainModel = () => {
    if (modelTrained) return;
    setModelTrained(true);
    setStep(1);
  };

  const testModel = () => {
    const total = trainingData.cats + trainingData.dogs;
    const balanced = Math.abs(trainingData.cats - trainingData.dogs) < 5;
    const sufficient = total >= 20;

    const accuracy = balanced && sufficient ? 85 + Math.random() * 10 : 45 + Math.random() * 20;

    setTestResults({
      accuracy: Math.round(accuracy),
      balanced,
      sufficient,
      total,
    });
    setStep(2);
  };

  if (step === 0) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <Camera className="w-16 h-16 mx-auto text-purple-600 mb-4" />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Train Your Cat vs Dog Classifier
            </h3>
            <p className="text-gray-600">
              Click to add training examples. You need at least 10 of each to train the model!
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-6xl mb-2">🐱</div>
                <Badge className="text-2xl font-bold bg-orange-100 text-orange-700 px-4 py-2">
                  {trainingData.cats} examples
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => addTrainingExample("cats")}
                  className="h-14 bg-orange-500 hover:bg-orange-600 text-sm"
                >
                  Quick Add
                </Button>
                <Button
                  onClick={() => setShowImageUpload("cats")}
                  className="h-14 bg-orange-600 hover:bg-orange-700 text-sm"
                >
                  Upload Image
                </Button>
              </div>

              {showImageUpload === "cats" && (
                <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-300">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, "cats")}
                    className="w-full text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">Upload cat images from your device</p>
                </div>
              )}

              {catImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {catImages.slice(-6).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="cat"
                      className="w-full h-16 object-cover rounded border-2 border-orange-300"
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="text-center">
                <div className="text-6xl mb-2">🐶</div>
                <Badge className="text-2xl font-bold bg-blue-100 text-blue-700 px-4 py-2">
                  {trainingData.dogs} examples
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={() => addTrainingExample("dogs")}
                  className="h-14 bg-blue-500 hover:bg-blue-600 text-sm"
                >
                  Quick Add
                </Button>
                <Button
                  onClick={() => setShowImageUpload("dogs")}
                  className="h-14 bg-blue-600 hover:bg-blue-700 text-sm"
                >
                  Upload Image
                </Button>
              </div>

              {showImageUpload === "dogs" && (
                <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleImageUpload(e, "dogs")}
                    className="w-full text-sm"
                  />
                  <p className="text-xs text-gray-600 mt-2">Upload dog images from your device</p>
                </div>
              )}

              {dogImages.length > 0 && (
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {dogImages.slice(-6).map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt="dog"
                      className="w-full h-16 object-cover rounded border-2 border-blue-300"
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
            <p className="text-sm text-gray-700">
              <strong>💡 Tip:</strong> Good training data should be balanced. Try to get similar numbers
              of cats and dogs!
            </p>
          </div>

          <Button
            onClick={trainModel}
            disabled={trainingData.cats < 10 || trainingData.dogs < 10 || modelTrained}
            className="w-full h-14 bg-purple-600 hover:bg-purple-700 disabled:opacity-50"
          >
            {modelTrained
              ? "Training..."
              : trainingData.cats < 10 || trainingData.dogs < 10
              ? `Need ${Math.max(10 - trainingData.cats, 10 - trainingData.dogs)} more examples`
              : "Train Model →"}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (step === 1) {
    return (
      <Card className="border-2 border-purple-200">
        <CardContent className="pt-6 space-y-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full"
              />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Training Model...</h3>
            <p className="text-gray-600 mb-4">
              Processing {trainingData.cats + trainingData.dogs} training examples
            </p>
            <Progress value={100} className="h-3 mb-6" />
          </div>

          <div className="bg-blue-50 p-6 rounded-lg space-y-3">
            <h4 className="font-bold text-gray-900">What's Happening:</h4>
            <p className="text-sm text-gray-700">✓ Model analyzing {trainingData.cats} cat images</p>
            <p className="text-sm text-gray-700">✓ Model analyzing {trainingData.dogs} dog images</p>
            <p className="text-sm text-gray-700">✓ Finding patterns in the data</p>
            <p className="text-sm text-gray-700">✓ Adjusting parameters to improve accuracy</p>
          </div>

          <Button onClick={testModel} className="w-full h-14 bg-green-600 hover:bg-green-700">
            Test Model on New Data →
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`border-2 ${
        testResults.accuracy >= 80 ? "border-[#2D9B6F]/30 bg-[#E6F5EF]" : "border-orange-200 bg-orange-50"
      }`}
    >
      <CardContent className="pt-6 space-y-6">
        <div className="text-center">
          {testResults.accuracy >= 80 ? (
            <>
              <CheckCircle className="w-16 h-16 mx-auto text-[#2D9B6F] mb-4" />
              <h3 className="text-2xl font-bold text-green-900 mb-2">Great Model! 🎉</h3>
            </>
          ) : (
            <>
              <AlertCircle className="w-16 h-16 mx-auto text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-orange-900 mb-2">Model Needs Improvement</h3>
            </>
          )}
          <div className="text-5xl font-bold mb-4">{testResults.accuracy}%</div>
          <p className="text-gray-700">Accuracy on test data</p>
        </div>

        <div className="space-y-3">
          <div
            className={`p-4 rounded-lg ${
              testResults.balanced ? "bg-green-100 border-2 border-green-400" : "bg-red-100 border-2 border-red-400"
            }`}
          >
            {testResults.balanced ? (
              <CheckCircle className="inline w-5 h-5 text-[#2D9B6F] mr-2" />
            ) : (
              <AlertCircle className="inline w-5 h-5 text-red-600 mr-2" />
            )}
            <strong>Data Balance:</strong> {Math.abs(trainingData.cats - trainingData.dogs)} example difference
            {!testResults.balanced && <p className="text-sm mt-1 text-red-700">Try to balance your training data!</p>}
          </div>

          <div
            className={`p-4 rounded-lg ${
              testResults.sufficient
                ? "bg-green-100 border-2 border-green-400"
                : "bg-yellow-100 border-2 border-yellow-400"
            }`}
          >
            {testResults.sufficient ? (
              <CheckCircle className="inline w-5 h-5 text-[#2D9B6F] mr-2" />
            ) : (
              <AlertCircle className="inline w-5 h-5 text-yellow-600 mr-2" />
            )}
            <strong>Data Size:</strong> {testResults.total} total examples
            {!testResults.sufficient && <p className="text-sm mt-1 text-yellow-700">More data = better accuracy!</p>}
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
          <h4 className="font-bold text-gray-900 mb-2">Key Takeaways:</h4>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• <strong>Data quality matters:</strong> Balanced, diverse data improves accuracy</li>
            <li>• <strong>More data helps:</strong> Models learn better with more examples</li>
            <li>• <strong>Testing is essential:</strong> Always test on NEW data, not training data</li>
            <li>• <strong>Garbage in, garbage out:</strong> Bad training data = bad model</li>
          </ul>
        </div>

        <Button onClick={() => onComplete && onComplete()} className="w-full h-14 bg-purple-600 hover:bg-purple-700">
          Continue to Next Step →
        </Button>
      </CardContent>
    </Card>
  );
}
