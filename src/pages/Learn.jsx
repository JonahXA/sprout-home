import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, PiggyBank, CreditCard, Shield, Brain, Briefcase, GraduationCap, Zap, Clock, Target } from "lucide-react";

const safeParse = (raw, fallback) => { try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; } };
const getLocalUser = () => safeParse(localStorage.getItem("sprout_user"), null);
const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

async function fetchJsonWithCache(url, cacheKey, fallback = []) {
  try {
    const res = await fetch(url, { cache:"no-store" });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
    const data = await res.json();
    setJSON(cacheKey, data);
    return Array.isArray(data) ? data : fallback;
  } catch { return getJSON(cacheKey, fallback); }
}

const dataClient = {
  async listCourses() {
    const basePath = import.meta.env.BASE_URL || "/";
    return fetchJsonWithCache(`${basePath}data/courses.json`, "sprout_courses", []);
  },
  async listUserProgress(userEmail) {
    const all = getJSON("sprout_user_progress", []);
    return all.filter((p) => p.user_email === userEmail);
  },
};

const categoryIcons = {
  Investing: TrendingUp, Saving: PiggyBank, "Credit & Debt": CreditCard,
  Insurance: Shield, "AI & ML": Brain, "Personal Finance": Briefcase, "Career Readiness": GraduationCap,
};

const categoryThumb = {
  Investing:          { bg:"#E8F8F0", color:"#22C55E" },
  Saving:             { bg:"#E8F0FE", color:"#3B82F6" },
  "Credit & Debt":    { bg:"#F2ECFF", color:"#8B5CF6" },
  Insurance:          { bg:"#FFF3E0", color:"#F59E0B" },
  "AI & ML":          { bg:"#F2ECFF", color:"#8B5CF6" },
  "Personal Finance": { bg:"#FFF3E0", color:"#F59E0B" },
  "Career Readiness": { bg:"#E8F8F0", color:"#22C55E" },
};

export default function Learn() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Load user for progress display — but do NOT redirect if not logged in
  const user = getLocalUser();

  const { data: courses = [] } = useQuery({
    queryKey: ["courses_hybrid"],
    queryFn: () => dataClient.listCourses(),
  });

  const { data: userProgress = [] } = useQuery({
    queryKey: ["userProgress_hybrid", user?.email],
    queryFn: () => dataClient.listUserProgress(user?.email),
    enabled: !!user?.email,
  });

  const categories = useMemo(
    () => ["All", ...new Set(courses.map((c) => c.category).filter(Boolean))],
    [courses]
  );

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return courses.filter((course) => {
      const matchesSearch = (course.name||"").toLowerCase().includes(q) || (course.description||"").toLowerCase().includes(q);
      const matchesCategory = selectedCategory === "All" || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  const getCourseProgress = (courseId) => {
    const course = courses.find((c) => String(c.id) === String(courseId));
    if (!course) return 0;
    const completed = userProgress.filter((p) => String(p.course_id) === String(courseId) && p.completed).length;
    return (completed / (Number(course.lessons_count||0)||1)) * 100;
  };

  // Gate: redirect to login only when user actually tries to start a course
  const handleCourseClick = (course) => {
    if (!user) { navigate(createPageUrl("Login")); return; }
    if (course.name?.includes("AI Literacy")) {
      navigate(createPageUrl("AILiteracy"));
    } else {
      navigate(createPageUrl(`CourseDetail?id=${course.id}`));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2 tracking-tight">Explore Courses</h1>
          <p className="text-gray-500">Browse and discover real-world skills — sign in to start learning.</p>
        </div>

        <div className="relative max-w-xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input type="text" placeholder="Search courses..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 bg-white border-gray-200 shadow-sm" />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Target;
            const isActive = selectedCategory === category;
            return (
              <button key={category} onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${isActive ? "bg-[#1F3A64] text-white border-[#1F3A64] shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50 hover:text-gray-900"}`}
              >
                {category !== "All" && <Icon className="w-4 h-4" />}{category}
              </button>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => {
            const Icon = categoryIcons[course.category] || Target;
            const progress = getCourseProgress(course.id);
            const thumb = categoryThumb[course.category] || { bg:"#F1F5F9", color:"#64748B" };
            return (
              <Card key={course.id} className="border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group overflow-hidden bg-white" onClick={() => handleCourseClick(course)}>
                <div className="h-36 flex items-center justify-center relative border-b border-gray-100" style={{ background:thumb.bg }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:"rgba(255,255,255,0.72)", color:thumb.color }}>
                    <Icon className="w-7 h-7" />
                  </div>
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-white text-gray-700 border border-gray-200 shadow-sm font-medium text-xs">{course.difficulty || "Beginner"}</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-bold group-hover:text-[#3B82F6] transition-colors tracking-tight">{course.name}</CardTitle>
                  <p className="text-sm text-gray-500 line-clamp-2 mt-1 font-normal">{course.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-gray-500"><Clock className="w-4 h-4" />{course.lessons_count} lessons</div>
                    <div className="flex items-center gap-1 font-semibold" style={{ color:"#22C55E" }}><Zap className="w-4 h-4" />{course.xp_reward} XP</div>
                  </div>
                  {progress > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-medium text-[#3B82F6]">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ) : (
                    <Badge variant="outline" className="w-full justify-center py-2 border-[#3B82F6] text-[#3B82F6] font-medium">
                      {user ? "Start Learning" : "Sign in to Start"}
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="w-10 h-10 text-gray-400" /></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-500 text-sm">Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}