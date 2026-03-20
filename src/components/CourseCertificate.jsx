import React from "react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Download, Trophy, Award, Sparkles, Sprout } from "lucide-react";
import { format } from "date-fns";

export default function CourseCertificate({ course, user, completionDate, onContinue }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="max-w-4xl w-full space-y-6">
        {/* Celebration Header */}
        <div className="text-center space-y-4 animate-in fade-in slide-in-from-top duration-500">
          <div className="flex justify-center gap-3 mb-4">
            <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
            <Sparkles className="w-16 h-16 text-purple-500 animate-pulse" />
            <Award className="w-16 h-16 text-pink-500 animate-bounce" style={{ animationDelay: "0.2s" }} />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
            Congratulations! 🎉
          </h1>
          <p className="text-xl text-gray-600">You've completed the entire course!</p>
        </div>

        {/* Certificate */}
        <Card className="border-4 border-purple-200 shadow-2xl bg-white">
          <CardContent className="p-8 md:p-12">
            {/* Certificate Header */}
            <div className="text-center mb-8 border-b-2 border-purple-200 pb-6">
              <div className="flex justify-center items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-[#1B2B5E] rounded-xl flex items-center justify-center">
                  <Sprout className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h2 className="text-2xl font-bold text-gray-900">Sprout</h2>
                  <p className="text-sm text-gray-500">Certificate of Completion</p>
                </div>
              </div>
            </div>

            {/* Certificate Body */}
            <div className="text-center space-y-6 mb-8">
              <p className="text-lg text-gray-600">This certifies that</p>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900">{user.full_name}</h2>
              <p className="text-lg text-gray-600">has successfully completed</p>
              <h3 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {course.name}
              </h3>

              <div className="flex justify-center gap-8 py-6">
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Category</p>
                  <p className="font-semibold text-gray-900">{course.category}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Difficulty</p>
                  <p className="font-semibold text-gray-900">{course.difficulty}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-sm mb-1">Lessons</p>
                  <p className="font-semibold text-gray-900">{course.lessons_count}</p>
                </div>
              </div>

              <p className="text-gray-600">Completed on {format(new Date(completionDate), "MMMM dd, yyyy")}</p>
            </div>

            {/* Signature Line */}
            <div className="flex justify-center pt-8 border-t-2 border-purple-200">
              <div className="text-center">
                <div className="w-48 border-t-2 border-gray-400 pt-2">
                  <p className="font-semibold text-gray-900">Sprout Team</p>
                  <p className="text-sm text-gray-500">Education Platform</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="outline" className="h-14 px-8 text-base shadow-lg" onClick={() => window.print()}>
            <Download className="w-5 h-5 mr-2" />
            Download Certificate
          </Button>

          <Button
            className="h-14 px-8 text-base bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg"
            onClick={onContinue}
          >
            Continue Learning
            <Sparkles className="w-5 h-5 ml-2" />
          </Button>
        </div>

        {/* Stats */}
        <Card className="border-none shadow-lg bg-gradient-to-r from-purple-400 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-3xl font-bold">+{course.xp_reward}</p>
                <p className="text-sm opacity-90">XP Earned</p>
              </div>
              <div>
                <p className="text-3xl font-bold">{course.lessons_count}</p>
                <p className="text-sm opacity-90">Lessons Mastered</p>
              </div>
              <div>
                <p className="text-3xl font-bold">100%</p>
                <p className="text-sm opacity-90">Course Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
