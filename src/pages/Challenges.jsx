import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Target, Flame, Zap, BookOpen, Trophy, CheckCircle,
  Calendar, Star, TrendingUp, Award, Lightbulb, Crown, Medal
} from "lucide-react";
import ChallengeCompleteModal from "@/components/ChallengeCompleteModal";

const safeParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const getLocalUser = () => safeParse(localStorage.getItem("sprout_user"), null);
const getAllUsersLocal = () => safeParse(localStorage.getItem("sprout_leaderboard_users"), []);

const normalizeUsers = (users = []) =>
  users.map((u) => ({
    id: u.id || u.email || String(Math.random()),
    email: u.email, username: u.username,
    full_name: u.full_name || u.name,
    xp_points: u.xp_points ?? 0,
    current_streak: u.current_streak ?? 0,
    level: u.level ?? 1,
    school_id: u.school_id ?? null,
    grade: u.grade ?? null,
    show_on_leaderboard: u.show_on_leaderboard !== false,
  })).filter((u) => u.show_on_leaderboard !== false);

const data = {
  async listChallenges() { return []; },
  async listUserChallenges() { return []; },
  async listUserProgress() { return []; },
  async listDailyActivity() { return []; },
  async upsertUserChallenge() { return null; },
  async updateUserXP() { return; },
};

// ── Leaderboard section component ──────────────────────────────────────────
function LeaderboardSection({ user }) {
  const [activeTab, setActiveTab] = useState("global");

  const { data: allUsers = [] } = useQuery({
    queryKey: ["leaderboard_local_all"],
    queryFn: async () => {
      const currentUser = getLocalUser();
      const stored = normalizeUsers(getAllUsersLocal());
      const combined = currentUser ? normalizeUsers([currentUser, ...stored]) : stored;
      const seen = new Set();
      return combined
        .filter((u) => { const key = u.email||u.id; if (!key) return true; if (seen.has(key)) return false; seen.add(key); return true; })
        .sort((a, b) => (b.xp_points||0) - (a.xp_points||0));
    },
  });

  const { data: schoolUsers = [] } = useQuery({
    queryKey: ["lb_school", user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) return [];
      return allUsers.filter((u) => u.school_id === user.school_id).sort((a, b) => (b.xp_points||0)-(a.xp_points||0));
    },
    enabled: !!user?.school_id && allUsers.length > 0,
  });

  const { data: gradeUsers = [] } = useQuery({
    queryKey: ["lb_grade", user?.grade, user?.school_id],
    queryFn: async () => {
      if (!user?.grade || !user?.school_id) return [];
      return allUsers.filter((u) => u.school_id===user.school_id && u.grade===user.grade).sort((a,b)=>(b.xp_points||0)-(a.xp_points||0));
    },
    enabled: !!user?.grade && !!user?.school_id && allUsers.length > 0,
  });

  const displayUsers = activeTab==="school" ? (user?.school_id ? schoolUsers : allUsers)
                     : activeTab==="grade"  ? (user?.grade && user?.school_id ? gradeUsers : allUsers)
                     : allUsers;

  const myRank = user?.email ? displayUsers.findIndex((u) => u.email===user.email)+1 : -1;

  const podiumMeta = {
    1: { borderColor:"#F59E0B", bg:"#FFF3E0", icon:<Crown className="w-4 h-4" style={{ color:"#F59E0B" }}/>, label:"#1", labelColor:"#F59E0B" },
    2: { borderColor:"#D1D5DB", bg:"#F8FAFC", icon:<Medal className="w-4 h-4 text-gray-400"/>,               label:"#2", labelColor:"#64748B" },
    3: { borderColor:"#D1D5DB", bg:"#F8FAFC", icon:<Medal className="w-4 h-4" style={{ color:"#B45309" }}/>, label:"#3", labelColor:"#B45309" },
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-gray-400" />Leaderboard
      </h2>

      {user && myRank > 0 && (
        <Card className="border-none shadow-md overflow-hidden" style={{ background:"#1F3A64" }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold" style={{ background:"rgba(255,255,255,0.12)", color:"#fff" }}>#{myRank}</div>
                <div>
                  <p className="text-xs font-medium" style={{ color:"rgba(255,255,255,0.6)" }}>Your Rank</p>
                  <p className="text-xl font-bold text-white">{user.full_name}</p>
                  <div className="flex items-center gap-3 mt-1" style={{ color:"rgba(255,255,255,0.75)" }}>
                    <span className="flex items-center gap-1 text-sm"><Zap className="w-3 h-3"/>{user.xp_points||0} XP</span>
                    <span className="flex items-center gap-1 text-sm"><Flame className="w-3 h-3"/>{user.current_streak||0} day streak</span>
                  </div>
                </div>
              </div>
              <TrendingUp className="w-8 h-8 text-white opacity-15" />
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-100">
          <TabsTrigger value="school">My School</TabsTrigger>
          <TabsTrigger value="grade">My Grade</TabsTrigger>
          <TabsTrigger value="global">Global</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4 space-y-4">
          {displayUsers.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 items-end">
              {[{ d:displayUsers[1], rank:2 },{ d:displayUsers[0], rank:1 },{ d:displayUsers[2], rank:3 }].map(({ d:u, rank }) => {
                const meta = podiumMeta[rank];
                const isFirst = rank===1;
                return (
                  <div key={rank} className={isFirst ? "-mt-4" : ""}>
                    <Card className={`border ${isFirst?"border-2":""} shadow-sm`} style={{ borderColor:meta.borderColor, background:meta.bg }}>
                      <CardContent className={`${isFirst?"p-5":"p-4"} text-center`}>
                        <div className="flex items-center justify-center gap-1 mb-3 font-bold text-sm" style={{ color:meta.labelColor }}>{meta.icon}{meta.label}</div>
                        <div className={`${isFirst?"w-12 h-12 text-lg":"w-10 h-10 text-base"} rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2`} style={{ background:"#1F3A64" }}>
                          {((u?.username||u?.full_name||"?")[0]).toUpperCase()}
                        </div>
                        <p className={`${isFirst?"font-bold":"font-semibold text-sm"} text-gray-900 text-center`}>{u?.username||u?.full_name||"Anonymous"}</p>
                        <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1"><Zap className="w-3 h-3 text-[#22C55E]"/>{u?.xp_points||0} XP</p>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          )}

          <Card className="border border-gray-100 shadow-sm bg-white">
            <CardHeader className="pb-2"><CardTitle className="text-base font-bold text-gray-900">Rankings</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {displayUsers.slice(3).map((u, idx) => {
                const rank = idx+4;
                const isMe = u.email && user?.email && u.email===user.email;
                return (
                  <div key={u.id} className={`flex items-center justify-between p-3 rounded-xl transition-all ${isMe?"border-2 border-[#1F3A64]/20 bg-[#E8F0FE]":"bg-gray-50 hover:bg-gray-100"}`}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg font-bold text-sm border border-gray-200 bg-white text-gray-500"
                        style={isMe ? { background:"#1F3A64", color:"#fff", border:"none" } : {}}>
                        {rank}
                      </div>
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background:"#1F3A64" }}>
                        {((u.username||u.full_name||"?")[0]).toUpperCase()}
                      </div>
                      <div>
                        <p className={`font-semibold text-sm ${isMe?"text-[#1F3A64]":"text-gray-900"}`}>
                          {u.username||u.full_name||"Anonymous"}{isMe&&<span className="ml-2 text-xs font-normal text-gray-400">(You)</span>}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1"><Flame className="w-3 h-3 text-[#F59E0B]"/>{u.current_streak||0}</span>
                          <span>&middot;</span><span>Level {u.level||1}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-[#22C55E]">{u.xp_points||0}</p>
                      <p className="text-xs text-gray-400">XP</p>
                    </div>
                  </div>
                );
              })}
              {displayUsers.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">No data yet. Start learning to appear on the leaderboard!</div>}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ── Main Challenges page ───────────────────────────────────────────────────
export default function Challenges() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [browsing, setBrowsing] = useState(false); // true = logged-out visitor
  const [completedChallenge, setCompletedChallenge] = useState(null);

  useEffect(() => {
    const currentUser = getLocalUser();
    if (!currentUser) {
      setBrowsing(true); // allow browsing, don't redirect
      return;
    }
    setUser(currentUser);
  }, []);

  const { data: challenges = [] } = useQuery({ queryKey:["challenges"], queryFn:() => data.listChallenges() });
  const { data: userChallenges = [] } = useQuery({ queryKey:["userChallenges", user?.email], queryFn:() => data.listUserChallenges(user?.email), enabled:!!user });
  const { data: userProgress = [] } = useQuery({ queryKey:["userProgress", user?.email], queryFn:() => data.listUserProgress(user?.email), enabled:!!user });
  const { data: dailyActivity = [] } = useQuery({ queryKey:["dailyActivity", user?.email], queryFn:() => data.listDailyActivity(user?.email), enabled:!!user });

  const updateChallengeMutation = useMutation({
    mutationFn: async ({ challengeId, progress, completed }) => {
      if (!user?.email) return null;
      const today = new Date().toISOString().split("T")[0];
      await data.upsertUserChallenge({ user_email:user.email, challenge_id:challengeId, progress, completed, completed_date: completed ? new Date().toISOString() : null, date:today });
      if (completed) {
        const challenge = challenges.find((c) => c.id===challengeId);
        if (challenge) { await data.updateUserXP({ email:user.email, xp_delta:challenge.xp_reward }); return challenge; }
      }
      return null;
    },
    onSuccess: (challenge) => {
      queryClient.invalidateQueries({ queryKey:["userChallenges"] });
      queryClient.invalidateQueries({ queryKey:["user"] });
      if (challenge) setCompletedChallenge(challenge);
    },
  });

  const today = new Date().toISOString().split("T")[0];
  const dailyChallenges     = challenges.filter((c) => c.challenge_type==="daily");
  const weeklyChallenges    = challenges.filter((c) => c.challenge_type==="weekly");
  const milestoneChallenges = challenges.filter((c) => c.challenge_type==="milestone");

  const getTodayProgress = (challengeId, challengeType) => {
    if (challengeType==="daily") return userChallenges.find((uc) => uc.challenge_id===challengeId && uc.date===today);
    return userChallenges.find((uc) => uc.challenge_id===challengeId);
  };

  const completedToday = dailyChallenges.filter((c) => getTodayProgress(c.id,"daily")?.completed).length;
  const totalDailyXP   = dailyChallenges.reduce((sum,c) => sum + (getTodayProgress(c.id,"daily")?.completed ? c.xp_reward : 0), 0);

  const challengeIcons = { complete_lesson:BookOpen, earn_xp:Zap, complete_quiz:Star, login_streak:Flame, complete_course:Trophy };

  const ChallengeCard = ({ challenge, userChallenge }) => {
    const Icon = challengeIcons[challenge.requirement] || Target;
    const progress   = userChallenge?.progress || 0;
    const percentage = Math.min((progress/challenge.requirement_value)*100, 100);
    const isCompleted = userChallenge?.completed;
    return (
      <Card className={`border shadow-sm transition-all ${isCompleted?"bg-[#E8F8F0] border-[#22C55E]/30":"bg-white border-gray-100 hover:shadow-md"}`}>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background:isCompleted?"#E8F8F0":"#E8F0FE", color:isCompleted?"#22C55E":"#3B82F6" }}>
                {isCompleted ? <CheckCircle className="w-5 h-5"/> : <Icon className="w-5 h-5"/>}
              </div>
              <div>
                <CardTitle className="text-base font-bold">{challenge.title}</CardTitle>
                <p className="text-sm text-gray-500 mt-1">{challenge.description}</p>
              </div>
            </div>
            <Badge className={isCompleted ? "bg-[#E8F8F0] text-[#22C55E] border border-[#22C55E]/30 font-semibold" : "bg-[#E8F0FE] text-[#3B82F6] border border-[#3B82F6]/20 font-semibold"}>+{challenge.xp_reward} XP</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">{progress} / {challenge.requirement_value}</span>
              <span className="font-semibold text-[#3B82F6]">{Math.round(percentage)}%</span>
            </div>
            <Progress value={percentage} className="h-2"/>
            {isCompleted && <p className="text-sm text-[#22C55E] font-semibold flex items-center gap-2 mt-3"><CheckCircle className="w-4 h-4"/>Challenge Completed!</p>}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Logged-out view: show leaderboard + sign-in prompt
  if (browsing) {
    return (
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Challenges & Leaderboard</h1>
            <p className="text-gray-500">Sign in to complete challenges, earn XP, and appear on the leaderboard.</p>
          </div>
          {/* Sign-in CTA */}
          <Card className="border border-[#BFDBFE] bg-[#E8F0FE] shadow-sm">
            <CardContent className="p-6 flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Join the competition</h3>
                <p className="text-sm text-gray-600">Create a free account to unlock daily challenges and track your progress.</p>
              </div>
              <button
                onClick={() => navigate(createPageUrl("Login"))}
                style={{ background:"#1F3A64", color:"#fff", border:"none", borderRadius:10, padding:"10px 24px", fontSize:14, fontWeight:600, cursor:"pointer", whiteSpace:"nowrap" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#172E52"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#1F3A64"}
              >Sign in to start</button>
            </CardContent>
          </Card>
          <LeaderboardSection user={null} />
        </div>
      </div>
    );
  }

  return (
    <>
      {completedChallenge && <ChallengeCompleteModal challenge={completedChallenge} onClose={() => setCompletedChallenge(null)} />}
      <div className="min-h-screen p-4 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6">

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Challenges & Leaderboard</h1>
            <p className="text-gray-500">Complete challenges to earn bonus XP and climb the leaderboard.</p>
          </div>

          {/* Stat cards */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:"#FFF3E0" }}><Target className="w-5 h-5" style={{ color:"#F59E0B" }}/></div>
                <p className="text-3xl font-bold text-gray-900">{completedToday}</p>
                <p className="text-sm text-gray-500 mt-1">Completed Today</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:"#E8F8F0" }}><Zap className="w-5 h-5" style={{ color:"#22C55E" }}/></div>
                <p className="text-3xl font-bold text-gray-900">{totalDailyXP}</p>
                <p className="text-sm text-gray-500 mt-1">XP Earned Today</p>
              </CardContent>
            </Card>
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardContent className="p-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background:"#FFF3E0" }}><Flame className="w-5 h-5" style={{ color:"#F59E0B" }}/></div>
                <p className="text-3xl font-bold text-gray-900">{user?.current_streak || 0}</p>
                <p className="text-sm text-gray-500 mt-1">Day Streak</p>
              </CardContent>
            </Card>
          </div>

          {/* Daily Challenges */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5 text-gray-400"/>Today's Challenges</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {dailyChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} userChallenge={getTodayProgress(c.id,"daily")}/>)}
            </div>
          </div>

          {weeklyChallenges.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-gray-400"/>Weekly Challenges</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {weeklyChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} userChallenge={getTodayProgress(c.id,"weekly")}/>)}
              </div>
            </div>
          )}

          {milestoneChallenges.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-gray-400"/>Milestone Challenges</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {milestoneChallenges.map((c) => <ChallengeCard key={c.id} challenge={c} userChallenge={getTodayProgress(c.id,"milestone")}/>)}
              </div>
            </div>
          )}

          {/* Pro tip */}
          <Card className="border border-[#BFDBFE] bg-[#E8F0FE] shadow-sm">
            <CardContent className="p-6 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 bg-white"><Lightbulb className="w-4 h-4 text-[#3B82F6]"/></div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Pro Tip</h3>
                <p className="text-sm text-gray-600">Challenges reset daily at midnight. Complete them before the day ends to maximize your XP earnings!</p>
              </div>
            </CardContent>
          </Card>

          {/* Embedded Leaderboard */}
          <div className="pt-4 border-t border-gray-100">
            <LeaderboardSection user={user} />
          </div>

        </div>
      </div>
    </>
  );
}