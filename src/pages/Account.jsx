import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, School, GraduationCap, LogOut, Edit, Check, Shield, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";

// Capitalizes each word: "jonah alsfasser" -> "Jonah Alsfasser"
const capitalizeName = (name) =>
  String(name || "")
    .trim()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

export default function Account() {
  const navigate = useNavigate();
  const { user, loginUser, logout } = useAuth();

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: user?.full_name || "",
    phone: user?.phone || "",
    school_id: user?.school_id || "",
    grade: user?.grade || "",
    username: user?.username || "",
    show_on_leaderboard: user?.show_on_leaderboard !== false,
  });

  // Redirect to login if not authenticated
  if (!user) {
    navigate(createPageUrl("Login"));
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      ...formData,
      full_name: capitalizeName(formData.full_name),
    };
    loginUser(updated); // persist to state + localStorage
    setEditing(false);
    toast.success("Profile updated successfully!");
  };

  const handleLogout = () => {
    logout(false);
    navigate(createPageUrl("Dashboard"));
  };

  const displayName = capitalizeName(user.full_name);

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">My Account</h1>
            <p className="text-gray-600 mt-1">Manage your profile and settings</p>
          </div>
          {user.role === "admin" && (
            <Link to={createPageUrl("Admin")}>
              <Button className="bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white shadow-lg">
                <Shield className="w-5 h-5 mr-2" />
                Admin Dashboard
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>

        {/* Profile Banner */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-lime-400 to-green-500 text-white">
          <CardContent className="p-8">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <span className="text-4xl font-bold">{displayName?.[0] || "U"}</span>
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-2">{displayName}</h2>
                <p className="text-lg opacity-90">{user.email}</p>
                <div className="flex items-center gap-4 mt-3">
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="font-semibold">Level {user.level || 1}</span>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                    <span className="font-semibold">{user.xp_points || 0} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Profile Details */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Profile Information</CardTitle>
            {!editing && (
              <Button onClick={() => setEditing(true)} variant="outline" className="gap-2">
                <Edit className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <Mail className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <Phone className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{user.phone || "Not provided"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <School className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">School</p>
                    <p className="font-semibold">{user.school_id || "Not selected"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-xl bg-gray-50">
                  <GraduationCap className="w-5 h-5 text-gray-600" />
                  <div>
                    <p className="text-sm text-gray-600">Grade</p>
                    <p className="font-semibold">{user.grade || "Not provided"}</p>
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    placeholder="Jonah Alsfasser"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(123) 456-7890"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Grade</Label>
                  <Select value={formData.grade} onValueChange={(v) => setFormData({ ...formData, grade: v })}>
                    <SelectTrigger><SelectValue placeholder="Select your grade" /></SelectTrigger>
                    <SelectContent>
                      {["6th Grade","7th Grade","8th Grade","9th Grade (Freshman)","10th Grade (Sophomore)","11th Grade (Junior)","12th Grade (Senior)","College Freshman","College Sophomore","College Junior","College Senior","Graduate Student","Other"].map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Username (leaderboard display name)</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="How you appear on leaderboards"
                  />
                </div>
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <input
                    type="checkbox"
                    id="show_on_leaderboard"
                    checked={formData.show_on_leaderboard}
                    onChange={(e) => setFormData({ ...formData, show_on_leaderboard: e.target.checked })}
                    className="w-5 h-5"
                  />
                  <label htmlFor="show_on_leaderboard" className="text-sm text-gray-700 cursor-pointer">
                    Show my profile on the leaderboard
                  </label>
                </div>
                <div className="flex gap-3">
                  <Button type="submit" className="bg-lime-500 hover:bg-lime-600 flex-1">
                    <Check className="w-5 h-5 mr-2" />Save Changes
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader><CardTitle>My Stats</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200">
                <p className="text-sm text-gray-600 mb-1">Lessons Completed</p>
                <p className="text-3xl font-bold text-blue-600">{user.total_lessons_completed || 0}</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200">
                <p className="text-sm text-gray-600 mb-1">Current Streak</p>
                <p className="text-3xl font-bold text-purple-600">{user.current_streak || 0} days</p>
              </div>
              <div className="p-4 rounded-xl bg-gradient-to-br from-orange-50 to-red-50 border border-orange-200">
                <p className="text-sm text-gray-600 mb-1">Longest Streak</p>
                <p className="text-3xl font-bold text-orange-600">{user.longest_streak || 0} days</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logout */}
        <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-6">
            <Button onClick={handleLogout} variant="outline" className="w-full h-12 border-red-200 text-red-600 hover:bg-red-50">
              <LogOut className="w-5 h-5 mr-2" />Log Out
            </Button>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}