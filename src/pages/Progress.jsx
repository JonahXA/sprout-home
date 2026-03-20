import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
 Flame,
 Trophy,
 Calendar,
 Award,
 Zap,
 Clock,
 CheckCircle,
 Star,
 AlertCircle,
} from "lucide-react";
import { format, isThisWeek, isThisMonth } from "date-fns";

/** ---------- local helpers ---------- */
const safeParse = (raw, fallback) => {
 try {
 return raw ? JSON.parse(raw) : fallback;
 } catch {
 return fallback;
 }
};
const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);

const getLocalUser = () => getJSON("sprout_user", null);

// Safe date parsing: returns Date or null
const safeDate = (value) => {
 try {
 const d = new Date(value);
 return Number.isNaN(d.getTime()) ? null : d;
 } catch {
 return null;
 }
};

/**
 * Local storage keys used:
 * - sprout_user_progress: UserProgress[]
 * - sprout_badges: Badge[]
 * - sprout_user_badges: UserBadge[]
 * - sprout_daily_activity: DailyActivity[]
 */
const data = {
 async listUserProgress(userEmail) {
 const all = getJSON("sprout_user_progress", []);
 return all.filter((p) => p?.user_email === userEmail);
 },
 async listBadges() {
 return getJSON("sprout_badges", []);
 },
 async listUserBadges(userEmail) {
 const all = getJSON("sprout_user_badges", []);
 return all.filter((ub) => ub?.user_email === userEmail);
 },
 async listDailyActivity(userEmail) {
 const all = getJSON("sprout_daily_activity", []);
 // Sort descending by date when possible
 return [...all]
 .filter((a) => a?.user_email === userEmail)
 .sort((a, b) => {
 const da = safeDate(a?.date)?.getTime() ?? 0;
 const db = safeDate(b?.date)?.getTime() ?? 0;
 return db - da;
 });
 },
};

export default function Progress() {
 const navigate = useNavigate();
 const [user, setUser] = useState(null);

 useEffect(() => {
 const currentUser = getLocalUser();
 if (!currentUser) {
 navigate(createPageUrl("Login"));
 return;
 }
 setUser(currentUser);

 if (!currentUser.onboarding_completed) {
 navigate(createPageUrl("SchoolSelection"));
 }
 }, [navigate]);

 const { data: userProgress = [] } = useQuery({
 queryKey: ["userProgress", user?.email],
 queryFn: () => data.listUserProgress(user.email),
 enabled: !!user?.email,
 });

 const { data: badges = [] } = useQuery({
 queryKey: ["badges"],
 queryFn: () => data.listBadges(),
 });

 const { data: userBadges = [] } = useQuery({
 queryKey: ["userBadges", user?.email],
 queryFn: () => data.listUserBadges(user.email),
 enabled: !!user?.email,
 });

 const { data: activities = [] } = useQuery({
 queryKey: ["activities", user?.email],
 queryFn: () => data.listDailyActivity(user.email),
 enabled: !!user?.email,
 });

 if (!user) return null;

 const completedLessons = (userProgress || []).filter((p) => p?.completed);

 const thisWeekLessons = completedLessons.filter((p) => {
 const d = safeDate(p?.completed_date);
 return d ? isThisWeek(d) : false;
 }).length;

 const thisMonthLessons = completedLessons.filter((p) => {
 const d = safeDate(p?.completed_date);
 return d ? isThisMonth(d) : false;
 }).length;

 const earnedBadgeIds = new Set((userBadges || []).map((ub) => ub?.badge_id).filter(Boolean));
 const earnedBadges = (badges || []).filter((b) => earnedBadgeIds.has(b?.id));
 const availableBadges = (badges || []).filter((b) => !earnedBadgeIds.has(b?.id));

 const level = Number(user.level || 1);
 const xp = Number(user.xp_points || 0);
 const xpForNextLevel = level * 100;
 const xpProgress = xp % 100;

 const weekXp = (activities || [])
 .filter((a) => {
 const d = safeDate(a?.date);
 return d ? isThisWeek(d) : false;
 })
 .reduce((sum, a) => sum + Number(a?.xp_earned || 0), 0);

 const weekMinutes = (activities || [])
 .filter((a) => {
 const d = safeDate(a?.date);
 return d ? isThisWeek(d) : false;
 })
 .reduce((sum, a) => sum + Number(a?.time_spent_minutes || 0), 0);

 return (
 <div className="min-h-screen p-4 md:p-8">
 <div className="max-w-7xl mx-auto space-y-6">
 {/* Header */}
 <div>
 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
 Your Progress 
 </h1>
 <p className="text-gray-600">Track your learning journey</p>
 </div>

 {/* If you haven't seeded progress yet */}
 {!localStorage.getItem("sprout_user_progress") && (
 <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
 <CardContent className="p-6 flex items-start gap-3">
 <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
 <div className="text-sm text-gray-700">
 Your progress data isn’t in localStorage yet. That’s okay — once you complete lessons,
 this will populate automatically.
 </div>
 </CardContent>
 </Card>
 )}

 {/* Stats Grid */}
 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
 <Card className="border-none shadow-lg bg-[#F97316] text-white">
 <CardContent className="p-6">
 <Flame className="w-8 h-8 mb-2" />
 <p className="text-3xl font-bold">{Number(user.current_streak || 0)}</p>
 <p className="text-sm opacity-90">Day Streak</p>
 <p className="text-xs opacity-75 mt-1">Longest: {Number(user.longest_streak || 0)}</p>
 </CardContent>
 </Card>

 <Card className="border-none shadow-lg bg-[#7C3AED] text-white">
 <CardContent className="p-6">
 <Zap className="w-8 h-8 mb-2" />
 <p className="text-3xl font-bold">{xp}</p>
 <p className="text-sm opacity-90">Total XP</p>
 <p className="text-xs opacity-75 mt-1">Level {level}</p>
 </CardContent>
 </Card>

 <Card className="border-none shadow-lg bg-[#1B2B5E] text-white">
 <CardContent className="p-6">
 <CheckCircle className="w-8 h-8 mb-2" />
 <p className="text-3xl font-bold">{completedLessons.length}</p>
 <p className="text-sm opacity-90">Lessons Done</p>
 <p className="text-xs opacity-75 mt-1">This week: {thisWeekLessons}</p>
 </CardContent>
 </Card>

 <Card className="border-none shadow-lg bg-[#F97316] text-white">
 <CardContent className="p-6">
 <Award className="w-8 h-8 mb-2" />
 <p className="text-3xl font-bold">{earnedBadges.length}</p>
 <p className="text-sm opacity-90">Badges</p>
 <p className="text-xs opacity-75 mt-1">Earned</p>
 </CardContent>
 </Card>
 </div>

 {/* Level Progress */}
 <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Star className="w-6 h-6 text-purple-500" />
 Level Progress
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="space-y-4">
 <div className="flex justify-between items-center">
 <span className="text-2xl font-bold">Level {level}</span>
 <span className="text-gray-600">
 {xpProgress} / {xpForNextLevel} XP
 </span>
 </div>
 <ProgressBar value={(xpProgress / xpForNextLevel) * 100} className="h-4" />
 <p className="text-sm text-gray-600">
 {xpForNextLevel - xpProgress} XP needed to reach Level {level + 1}
 </p>
 </div>
 </CardContent>
 </Card>

 {/* Weekly Activity */}
 <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Calendar className="w-6 h-6 text-[#2D9B6F]" />
 This Week's Activity
 </CardTitle>
 </CardHeader>
 <CardContent>
 <div className="grid grid-cols-3 gap-4">
 <div className="text-center p-4 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100">
 <p className="text-3xl font-bold text-[#2D9B6F]">{thisWeekLessons}</p>
 <p className="text-sm text-gray-600 mt-1">Lessons</p>
 </div>
 <div className="text-center p-4 rounded-xl bg-[#E8F0FE]">
 <p className="text-3xl font-bold text-blue-600">{weekXp}</p>
 <p className="text-sm text-gray-600 mt-1">XP Earned</p>
 </div>
 <div className="text-center p-4 rounded-xl bg-[#F3F0FF]">
 <p className="text-3xl font-bold text-purple-600">{weekMinutes}</p>
 <p className="text-sm text-gray-600 mt-1">Minutes</p>
 </div>
 </div>
 </CardContent>
 </Card>

 {/* Badges */}
 <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Trophy className="w-6 h-6 text-yellow-500" />
 Your Badges ({earnedBadges.length}/{badges.length || 0})
 </CardTitle>
 </CardHeader>
 <CardContent>
 {earnedBadges.length > 0 ? (
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
 {earnedBadges.map((badge) => (
 <div
 key={badge.id}
 className="p-4 rounded-xl bg-[#FFF0E6] border-2 border-[#F97316]/30 text-center"
 >
 <div className="text-4xl mb-2">{badge.icon || ""}</div>
 <p className="font-semibold text-sm">{badge.name || "Badge"}</p>
 <Badge className="mt-2 bg-yellow-100 text-yellow-800">
 {badge.rarity || "common"}
 </Badge>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-gray-500 text-center py-4">
 No badges earned yet. Keep learning!
 </p>
 )}

 {availableBadges.length > 0 && (
 <>
 <h3 className="font-semibold text-gray-900 mb-3 mt-6">Available Badges</h3>
 <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
 {availableBadges.slice(0, 8).map((badge) => (
 <div
 key={badge.id}
 className="p-4 rounded-xl bg-gray-50 border-2 border-gray-200 text-center opacity-60 hover:opacity-100 transition-opacity"
 >
 <div className="text-4xl mb-2 grayscale">{badge.icon || ""}</div>
 <p className="font-semibold text-sm text-gray-700">{badge.name}</p>
 <p className="text-xs text-gray-500 mt-1">{badge.description}</p>
 </div>
 ))}
 </div>
 </>
 )}
 </CardContent>
 </Card>

 {/* Recent Activity */}
 <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
 <CardHeader>
 <CardTitle className="flex items-center gap-2">
 <Clock className="w-6 h-6 text-blue-500" />
 Recent Activity
 </CardTitle>
 </CardHeader>
 <CardContent>
 {completedLessons.slice(0, 10).map((p) => {
 const d = safeDate(p?.completed_date);
 return (
 <div
 key={p.id || `${p.lesson_id}_${p.completed_date}`}
 className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors"
 >
 <div className="flex items-center gap-3">
 <CheckCircle className="w-5 h-5 text-[#2D9B6F]" />
 <div>
 <p className="font-medium text-gray-900">Lesson Completed</p>
 <p className="text-sm text-gray-600">
 {d ? format(d, "MMM d, yyyy 'at' h:mm a") : "Date unavailable"}
 </p>
 </div>
 </div>
 {p.quiz_score != null && (
 <Badge className="bg-blue-100 text-[#2D9B6F]">{p.quiz_score}% score</Badge>
 )}
 </div>
 );
 })}

 {completedLessons.length === 0 && (
 <p className="text-gray-500 text-center py-4">
 No activity yet. Start your first lesson!
 </p>
 )}

 {thisMonthLessons === 0 && completedLessons.length > 0 && (
 <p className="text-xs text-gray-500 text-center mt-3">
 (You have past completions, but none this month yet.)
 </p>
 )}
 </CardContent>
 </Card>
 </div>
 </div>
 );
}
