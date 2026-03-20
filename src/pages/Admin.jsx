import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users, TrendingUp, BookOpen, Trophy, Search, Shield,
  Mail, Zap, School, Brain, CheckCircle
} from "lucide-react";
import { format } from "date-fns";
import {
  getCurrentUser,
  listAllUsers,
  listAllUserProgress,
  listAllUserBadges,
  listSchools,
  listAllAIDayProgress,
} from "@/lib/appClient";

export default function Admin() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("users");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser.role !== "admin") {
          navigate(createPageUrl("Dashboard"));
          return;
        }
        setUser(currentUser);
      } catch (error) {
        navigate(createPageUrl("Login"));
      }
    };
    checkAuth();
  }, [navigate]);

  const { data: allUsers = [] } = useQuery({
    queryKey: ["admin-allUsers"],
    queryFn: listAllUsers,
    enabled: !!user && user.role === "admin",
  });

  const { data: schools = [] } = useQuery({
    queryKey: ["admin-schools"],
    queryFn: listSchools,
    enabled: !!user,
  });

  const { data: allProgress = [] } = useQuery({
    queryKey: ["admin-allProgress"],
    queryFn: listAllUserProgress,
    enabled: !!user && user.role === "admin",
  });

  const { data: allBadges = [] } = useQuery({
    queryKey: ["admin-allBadges"],
    queryFn: listAllUserBadges,
    enabled: !!user && user.role === "admin",
  });

  const { data: allAIDayProgress = [] } = useQuery({
    queryKey: ["admin-aiDayProgress"],
    queryFn: listAllAIDayProgress,
    enabled: !!user && user.role === "admin",
  });

  if (!user || user.role !== "admin") return null;

  const filteredUsers = allUsers.filter((u) =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.school_id?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalXP = allUsers.reduce((sum, u) => sum + (u.xp_points || 0), 0);
  const avgXP = allUsers.length > 0 ? Math.round(totalXP / allUsers.length) : 0;
  const totalLessons = allProgress.filter((p) => p.completed).length;
  const activeUsers = allUsers.filter((u) => (u.xp_points || 0) > 0).length;
  const aiLessonsCompleted = allAIDayProgress.filter((p) => p.completed).length;

  const getSchoolName = (schoolId) => {
    const school = schools.find((s) => s.id === schoolId);
    return school?.name || "No School";
  };

  const getUserAIProgress = (email) => {
    return allAIDayProgress.filter((p) => p.user_email === email && p.completed);
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600">Manage users and monitor platform activity</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="border-none shadow-lg bg-gradient-to-br from-blue-400 to-cyan-500 text-white">
            <CardContent className="p-6">
              <Users className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{allUsers.length}</p>
              <p className="text-sm opacity-90">Total Users</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-[#1B2B5E] text-white">
            <CardContent className="p-6">
              <TrendingUp className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{activeUsers}</p>
              <p className="text-sm opacity-90">Active Users</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-gradient-to-br from-purple-400 to-pink-500 text-white">
            <CardContent className="p-6">
              <BookOpen className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{totalLessons}</p>
              <p className="text-sm opacity-90">Lessons Completed</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-gradient-to-br from-indigo-400 to-purple-500 text-white">
            <CardContent className="p-6">
              <Brain className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{aiLessonsCompleted}</p>
              <p className="text-sm opacity-90">AI Lessons Done</p>
            </CardContent>
          </Card>
          <Card className="border-none shadow-lg bg-gradient-to-br from-orange-400 to-red-500 text-white">
            <CardContent className="p-6">
              <Zap className="w-8 h-8 mb-2" />
              <p className="text-3xl font-bold">{avgXP}</p>
              <p className="text-sm opacity-90">Avg XP / User</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          {["users", "ai-course", "schools"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-3 text-sm font-semibold capitalize transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "border-purple-500 text-purple-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab === "ai-course" ? "AI Course" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Users Tab */}
        {activeTab === "users" && (
          <>
            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search users by name, email, or school..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-12 h-14 text-base border-gray-200"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-6 h-6 text-blue-500" />
                  All Users ({filteredUsers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-gray-200">
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">User</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Email</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">School</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Grade</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Level</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">XP</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">AI Days</th>
                        <th className="text-left py-4 px-4 font-semibold text-gray-700">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => {
                        const userAIDays = getUserAIProgress(u.email);
                        const userBadges = allBadges.filter((b) => b.user_email === u.email);
                        return (
                          <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-[#1B2B5E] rounded-full flex items-center justify-center text-white font-bold">
                                  {u.full_name?.[0]?.toUpperCase() || "U"}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">{u.full_name || "Unnamed"}</p>
                                  {u.role === "admin" && (
                                    <Badge className="bg-red-100 text-red-700 text-xs">Admin</Badge>
                                  )}
                                  {userBadges.length > 0 && (
                                    <Badge variant="outline" className="ml-2 text-xs">{userBadges.length} badges</Badge>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2 text-gray-600">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm">{u.email}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <School className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-700">{getSchoolName(u.school_id)}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              {u.grade ? (
                                <Badge variant="outline" className="text-xs">{u.grade}</Badge>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" />
                                <span className="font-semibold text-gray-900">{u.level || 1}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Zap className="w-4 h-4 text-[#2D9B6F]" />
                                <span className="font-semibold text-[#2D9B6F]">{u.xp_points || 0}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-2">
                                <Brain className="w-4 h-4 text-purple-500" />
                                <span className="font-semibold text-purple-600">{userAIDays.length}/10</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-sm text-gray-600">
                              {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-600">No users found</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* AI Course Tab */}
        {activeTab === "ai-course" && (
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-6 h-6 text-purple-500" />
                AI Literacy Course Progress — All Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">User</th>
                      {[1,2,3,4,5,6,7,8,9,10].map(d => (
                        <th key={d} className="text-center py-3 px-2 font-semibold text-gray-700">D{d}</th>
                      ))}
                      <th className="text-center py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allUsers.map((u) => {
                      const userProgress = allAIDayProgress.filter(p => p.user_email === u.email);
                      const completedCount = userProgress.filter(p => p.completed).length;
                      return (
                        <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <p className="font-medium text-gray-900 text-sm">{u.full_name || u.email}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </td>
                          {[1,2,3,4,5,6,7,8,9,10].map(d => {
                            const dayRow = userProgress.find(p => p.day_number === d);
                            return (
                              <td key={d} className="text-center py-3 px-2">
                                {dayRow?.completed ? (
                                  <CheckCircle className="w-5 h-5 text-[#2D9B6F] mx-auto" />
                                ) : (
                                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 mx-auto" />
                                )}
                              </td>
                            );
                          })}
                          <td className="text-center py-3 px-4">
                            <Badge className={completedCount === 10 ? "bg-green-100 text-[#2D9B6F]" : "bg-purple-100 text-purple-700"}>
                              {completedCount}/10
                            </Badge>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {allUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">No users yet</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Schools Tab */}
        {activeTab === "schools" && (
          <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <School className="w-6 h-6 text-purple-500" />
                Schools Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {schools.map((school) => {
                  const schoolUsers = allUsers.filter((u) => u.school_id === school.id);
                  const schoolXP = schoolUsers.reduce((sum, u) => sum + (u.xp_points || 0), 0);
                  const schoolAIDays = allAIDayProgress.filter(p =>
                    schoolUsers.some(u => u.email === p.user_email) && p.completed
                  ).length;
                  return (
                    <Card key={school.id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">{school.name}</h3>
                            {school.location && <p className="text-sm text-gray-600">{school.location}</p>}
                          </div>
                          <Badge variant="outline">{school.type}</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Students</span>
                            <span className="font-semibold">{schoolUsers.length}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Total XP</span>
                            <span className="font-semibold text-[#2D9B6F]">{schoolXP}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">AI Days Completed</span>
                            <span className="font-semibold text-purple-600">{schoolAIDays}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}