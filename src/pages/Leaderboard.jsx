import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, TrendingUp, Flame, Zap, Crown } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const getLocalUser = () => {
  try {
    const raw = localStorage.getItem("sprout_user");
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const getAllUsersLocal = () => {
  try {
    const raw = localStorage.getItem("sprout_leaderboard_users");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
};

const normalizeUsers = (users = []) => {
  return users
    .map((u) => ({
      id: u.id || u.email || u.username || String(Math.random()),
      email: u.email,
      username: u.username,
      full_name: u.full_name || u.name,
      xp_points: u.xp_points ?? 0,
      current_streak: u.current_streak ?? 0,
      level: u.level ?? 1,
      school_id: u.school_id ?? null,
      grade: u.grade ?? null,
      show_on_leaderboard: u.show_on_leaderboard !== false,
    }))
    .filter((u) => u.show_on_leaderboard !== false);
};

export default function Leaderboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("school");

  React.useEffect(() => {
    const currentUser = getLocalUser();
    if (currentUser) setUser(currentUser);
  }, []);

  const { data: allUsers = [] } = useQuery({
    queryKey: ["leaderboard_local_all"],
    queryFn: async () => {
      const currentUser = getLocalUser();
      const stored = normalizeUsers(getAllUsersLocal());
      const combined = currentUser ? normalizeUsers([currentUser, ...stored]) : stored;
      const seen = new Set();
      const deduped = combined.filter((u) => {
        const key = u.email || u.id;
        if (!key) return true;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      return deduped.sort((a, b) => (b.xp_points || 0) - (a.xp_points || 0));
    },
  });

  const { data: schoolUsers = [] } = useQuery({
    queryKey: ["leaderboard_local_school", user?.school_id],
    queryFn: async () => {
      if (!user?.school_id) return [];
      return allUsers.filter((u) => u.school_id === user.school_id)
        .sort((a, b) => (b.xp_points || 0) - (a.xp_points || 0));
    },
    enabled: !!user?.school_id && allUsers.length > 0,
  });

  const { data: gradeUsers = [] } = useQuery({
    queryKey: ["leaderboard_local_grade", user?.grade, user?.school_id],
    queryFn: async () => {
      if (!user?.grade || !user?.school_id) return [];
      return allUsers
        .filter((u) => u.school_id === user.school_id && u.grade === user.grade)
        .sort((a, b) => (b.xp_points || 0) - (a.xp_points || 0));
    },
    enabled: !!user?.grade && !!user?.school_id && allUsers.length > 0,
  });

  const getDisplayUsers = () => {
    switch (activeTab) {
      case "school": return user?.school_id ? schoolUsers : allUsers;
      case "grade":  return (user?.grade && user?.school_id) ? gradeUsers : allUsers;
      case "global": return allUsers;
      default:       return allUsers;
    }
  };

  const displayUsers = getDisplayUsers();
  const myRank = user?.email
    ? displayUsers.findIndex((u) => u.email === user.email) + 1
    : -1;

  const podiumMeta = {
    1: { borderColor: "#F59E0B", bg: "#FFF3E0", icon: <Crown className="w-4 h-4" style={{ color: "#F59E0B" }} />, label: "#1", labelColor: "#F59E0B" },
    2: { borderColor: "#D1D5DB", bg: "#F8FAFC",  icon: <Medal className="w-4 h-4 text-gray-400" />,               label: "#2", labelColor: "#64748B" },
    3: { borderColor: "#D1D5DB", bg: "#F8FAFC",  icon: <Medal className="w-4 h-4" style={{ color: "#B45309" }} />, label: "#3", labelColor: "#B45309" },
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Leaderboard
          </h1>
          <p className="text-gray-500">Compete with fellow learners</p>
        </div>

        {/* My Rank Card */}
        {user && myRank > 0 && (
          <Card className="border-none shadow-md overflow-hidden" style={{ background: "#1F3A64" }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold"
                    style={{ background: "rgba(255,255,255,0.12)", color: "#fff" }}>
                    #{myRank}
                  </div>
                  <div>
                    <p className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>Your Rank</p>
                    <p className="text-2xl font-bold text-white">{user.full_name}</p>
                    <div className="flex items-center gap-3 mt-1" style={{ color: "rgba(255,255,255,0.75)" }}>
                      <div className="flex items-center gap-1">
                        <Zap className="w-4 h-4" />
                        <span className="text-sm">{user.xp_points || 0} XP</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Flame className="w-4 h-4" />
                        <span className="text-sm">{user.current_streak || 0} day streak</span>
                      </div>
                    </div>
                  </div>
                </div>
                <TrendingUp className="w-10 h-10 text-white opacity-15" />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 bg-gray-100">
            <TabsTrigger value="school">My School</TabsTrigger>
            <TabsTrigger value="grade">My Grade</TabsTrigger>
            <TabsTrigger value="global">Global</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">

            {/* Top 3 Podium */}
            {displayUsers.length >= 3 && displayUsers[0] && displayUsers[1] && displayUsers[2] && (
              <div className="grid grid-cols-3 gap-4 mb-8 items-end">
                {[
                  { data: displayUsers[1], rank: 2 },
                  { data: displayUsers[0], rank: 1 },
                  { data: displayUsers[2], rank: 3 },
                ].map(({ data: u, rank }) => {
                  const meta = podiumMeta[rank];
                  const isFirst = rank === 1;
                  return (
                    <div key={rank} className={isFirst ? "-mt-4" : ""}>
                      <Card className={`border ${isFirst ? "border-2" : ""} shadow-sm`}
                        style={{ borderColor: meta.borderColor, background: meta.bg }}>
                        <CardContent className={`${isFirst ? "p-5" : "p-4"} text-center`}>
                          <div className="flex items-center justify-center gap-1 mb-3 font-bold text-sm"
                            style={{ color: meta.labelColor }}>
                            {meta.icon} {meta.label}
                          </div>
                          <div
                            className={`${isFirst ? "w-14 h-14 text-xl" : "w-12 h-12 text-lg"} rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2`}
                            style={{ background: "#1F3A64" }}
                          >
                            {((u?.username || u?.full_name || "?")[0]).toUpperCase()}
                          </div>
                          <p className={`${isFirst ? "font-bold" : "font-semibold text-sm"} text-gray-900 text-center`}>
                            {u?.username || u?.full_name || "Anonymous"}
                          </p>
                          <p className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
                            <Zap className="w-3 h-3 text-[#22C55E]" />
                            {u?.xp_points || 0} XP
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Rankings 4+ */}
            <Card className="border border-gray-100 shadow-sm bg-white">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-bold text-gray-900">Rankings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {displayUsers.slice(3).map((u, idx) => {
                  const rank = idx + 4;
                  const isCurrentUser = u.email && user?.email && u.email === user.email;
                  return (
                    <div key={u.id}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                        isCurrentUser ? "border-2 border-[#1F3A64]/20 bg-[#E8F0FE]" : "bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 flex items-center justify-center rounded-lg font-bold text-sm border border-gray-200 bg-white text-gray-500"
                          style={isCurrentUser ? { background: "#1F3A64", color: "#fff", border: "none" } : {}}
                        >
                          {rank}
                        </div>
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ background: "#1F3A64" }}>
                          {((u.username || u.full_name || "?")[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className={`font-semibold text-sm ${isCurrentUser ? "text-[#1F3A64]" : "text-gray-900"}`}>
                            {u.username || u.full_name || "Anonymous"}
                            {isCurrentUser && <span className="ml-2 text-xs font-normal text-gray-400">(You)</span>}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Flame className="w-3 h-3 text-[#F59E0B]" />
                              {u.current_streak || 0}
                            </span>
                            <span>&middot;</span>
                            <span>Level {u.level || 1}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base text-[#22C55E]">{u.xp_points || 0}</p>
                        <p className="text-xs text-gray-400">XP</p>
                      </div>
                    </div>
                  );
                })}

                {displayUsers.length === 0 && (
                  <div className="text-center py-10 text-gray-400 text-sm">
                    No data yet. Start learning to appear on the leaderboard!
                  </div>
                )}
              </CardContent>
            </Card>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}