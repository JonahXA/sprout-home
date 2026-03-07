import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Flame, Trophy, BookOpen, Target, Zap, ArrowRight,
  TrendingUp, Award, ChevronRight, Sparkles, Calculator
} from "lucide-react";

const getLocalUser = () => {
  try {
    const raw = localStorage.getItem("sprout_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const data = {
  async listCourses() { return []; },
  async listUserProgress() { return []; },
  async listRecentActivity() { return []; },
  async listUserBadges() { return []; }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Don't auto-login from localStorage
    // Users must explicitly log in each visit
  }, [navigate]);

  const { data: courses = [] } = useQuery({
    queryKey: ["courses"],
    queryFn: () => data.listCourses(),
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["userProgress", user?.email],
    queryFn: () => data.listUserProgress(user?.email),
    enabled: !!user,
  });

  const { data: userBadges = [] } = useQuery({
    queryKey: ["userBadges", user?.email],
    queryFn: () => data.listUserBadges(user?.email),
    enabled: !!user,
  });

  const completedLessons = userProgress.filter((p) => p.completed).length;
  const totalXP = user?.xp_points || 0;
  const currentStreak = user?.current_streak || 0;
  const level = user?.level || 1;
  const xpForNextLevel = level * 100;
  const xpProgress = totalXP % 100;
  const featuredCourses = courses.filter((c) => c.is_featured).slice(0, 3);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {user ? `Welcome back, ${user.full_name?.split(" ")[0]}! 👋` : "Hello! 👋"}
            </h1>
            <p className="text-gray-600 mt-1">Ready to continue growing today?</p>
          </div>
          <div className="flex gap-3">
            {!user && (
              <>
                <Button
                  onClick={() => navigate(createPageUrl("Login"))}
                  variant="outline"
                  className="border-lime-500 text-lime-600 hover:bg-lime-50"
                >
                  Login
                </Button>
                <Button
                  onClick={() => navigate(createPageUrl("Signup"))}
                  className="bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-white shadow-lg shadow-lime-200"
                >
                  Sign Up
                </Button>
              </>
            )}
            <Button
              onClick={() => navigate(createPageUrl("Learn"))}
              className="bg-gradient-to-r from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600 text-white shadow-lg shadow-lime-200"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Browse Courses
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-400 to-red-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="pb-2">
              <Flame className="w-8 h-8 mb-2" />
              <CardTitle className="text-3xl font-bold">{currentStreak}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Day Streak 🔥</p>
              <p className="text-xs opacity-75 mt-1">Keep it up!</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="pb-2">
              <Zap className="w-8 h-8 mb-2" />
              <CardTitle className="text-3xl font-bold">{totalXP}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Total XP</p>
              <p className="text-xs opacity-75 mt-1">Level {level}</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-400 to-cyan-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="pb-2">
              <BookOpen className="w-8 h-8 mb-2" />
              <CardTitle className="text-3xl font-bold">{completedLessons}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Lessons Done</p>
              <p className="text-xs opacity-75 mt-1">Great progress!</p>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-br from-yellow-400 to-orange-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader className="pb-2">
              <Award className="w-8 h-8 mb-2" />
              <CardTitle className="text-3xl font-bold">{userBadges.length}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm opacity-90">Badges Earned</p>
              <p className="text-xs opacity-75 mt-1">Collector!</p>
            </CardContent>
          </Card>
        </div>

        {/* Level Progress */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-500" />
                Level {level} Progress
              </CardTitle>
              <span className="text-sm text-gray-600">
                {xpProgress} / {xpForNextLevel} XP
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={(xpProgress / xpForNextLevel) * 100} className="h-3 bg-gray-200">
              <div className="h-full bg-gradient-to-r from-purple-400 to-pink-500 rounded-full transition-all" />
            </Progress>
            <p className="text-sm text-gray-600 mt-2">
              {xpForNextLevel - xpProgress} XP until Level {level + 1}
            </p>
          </CardContent>
        </Card>

        {/* Featured Courses */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Featured Courses</h2>
            <Link
              to={createPageUrl("Learn")}
              className="text-lime-600 hover:text-lime-700 font-medium flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredCourses.map((course) => {
              const courseProgress = userProgress.filter(
                (p) => p.course_id === course.id && p.completed
              ).length;
              const progressPercent = (courseProgress / (course.lessons_count || 1)) * 100;
              const categoryGradients = {
                Investing: "from-green-400 to-emerald-500",
                Saving: "from-blue-400 to-cyan-500",
                "Credit & Debt": "from-purple-400 to-pink-500",
                Insurance: "from-orange-400 to-red-500",
              };
              return (
                <Card
                  key={course.id}
                  className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer group bg-white/80 backdrop-blur-sm overflow-hidden"
                  onClick={() => navigate(createPageUrl(`CourseDetail?id=${course.id}`))}
                >
                  <div
                    className={`h-40 bg-gradient-to-br ${
                      categoryGradients[course.category] || "from-gray-400 to-gray-500"
                    } flex items-center justify-center relative`}
                  >
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
                    <div className="text-white text-6xl z-10">{course.icon || "📚"}</div>
                  </div>
                  <CardHeader>
                    <CardTitle className="text-lg group-hover:text-lime-600 transition-colors">
                      {course.name}
                    </CardTitle>
                    <p className="text-sm text-gray-600 line-clamp-2">{course.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">{Math.round(progressPercent)}% Complete</span>
                        <span className="text-lime-600 font-medium flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          {course.xp_reward} XP
                        </span>
                      </div>
                      <Progress value={progressPercent} className="h-2" />
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                        <BookOpen className="w-3 h-3" />
                        {course.lessons_count} lessons
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Quick Access */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card
              className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
              onClick={() => navigate(createPageUrl("Learn"))}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <p className="font-semibold text-gray-900">Browse Courses</p>
                <p className="text-xs text-gray-600 mt-1">{courses.length} available</p>
              </CardContent>
            </Card>

            <Card
              className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
              onClick={() => navigate(createPageUrl("Goals"))}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-lime-100 to-green-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Target className="w-6 h-6 text-lime-600" />
                </div>
                <p className="font-semibold text-gray-900">Savings Goals</p>
                <p className="text-xs text-gray-600 mt-1">Track progress</p>
              </CardContent>
            </Card>

            <Card
              className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
              onClick={() => navigate(createPageUrl("InvestmentCalculator"))}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <p className="font-semibold text-gray-900">Calculator</p>
                <p className="text-xs text-gray-600 mt-1">Growth projections</p>
              </CardContent>
            </Card>

            <Card
              className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
              onClick={() => navigate(createPageUrl("Leaderboard"))}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <Trophy className="w-6 h-6 text-yellow-600" />
                </div>
                <p className="font-semibold text-gray-900">Leaderboard</p>
                <p className="text-xs text-gray-600 mt-1">See rankings</p>
              </CardContent>
            </Card>

            <Card
              className="border-none shadow-lg hover:shadow-xl transition-all cursor-pointer bg-white/80 backdrop-blur-sm"
              onClick={() => navigate(createPageUrl("Progress"))}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-purple-600" />
                </div>
                <p className="font-semibold text-gray-900">My Progress</p>
                <p className="text-xs text-gray-600 mt-1">View stats</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-none shadow-lg bg-gradient-to-r from-lime-400 to-green-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Target className="w-48 h-48" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-xl font-bold mb-2">🎯 Daily Challenge</h3>
              <p className="opacity-90 mb-1">Complete 3 lessons today!</p>
              <p className="text-sm opacity-75 mb-4">Earn a bonus 50 XP</p>
              <Button
                onClick={() => navigate(createPageUrl("Learn"))}
                className="bg-white text-lime-600 hover:bg-gray-100 shadow-lg"
              >
                Start Challenge
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>

          <Card className="border-none shadow-lg bg-gradient-to-r from-blue-400 to-cyan-500 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 opacity-10">
              <Target className="w-48 h-48" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-xl font-bold mb-2">💰 Savings Goals</h3>
              <p className="opacity-90 mb-1">Track your financial targets</p>
              <p className="text-sm opacity-75 mb-4">Set and achieve goals</p>
              <Button
                onClick={() => navigate(createPageUrl("Goals"))}
                className="bg-white text-blue-600 hover:bg-gray-100 shadow-lg"
              >
                View Goals
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}