import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, TrendingUp, PiggyBank, CreditCard, Shield, Brain, Briefcase, GraduationCap, Zap, Clock, Target } from "lucide-react";

const C = {
  navy:"#1F3A64", navyLight:"#264D82", navyGlow:"rgba(31,58,100,0.12)",
  accent:"#3B82F6", accentSoft:"#E8F0FE",
  green:"#22C55E", greenSoft:"#E8F8F0",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E5E7EB", borderMid:"#D1D5DB",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

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

  const handleCourseClick = (course) => {
    if (!user) { navigate(createPageUrl("Login")); return; }
    if (course.name?.includes("AI Literacy")) {
      navigate(createPageUrl("AILiteracy"));
    } else {
      navigate(createPageUrl(`CourseDetail?id=${course.id}`));
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:28 }}>

        {/* Heading */}
        <div>
          <h1 style={{ fontSize:34, fontWeight:900, color:C.text, letterSpacing:"-1px", margin:"0 0 6px" }}>Explore Courses</h1>
          <p style={{ fontSize:15, color:C.textSub, fontWeight:500, margin:0 }}>Browse and discover real-world skills — sign in to start learning.</p>
        </div>

        {/* Search */}
        <div style={{ position:"relative", maxWidth:480 }}>
          <Search size={18} style={{ position:"absolute", left:14, top:"50%", transform:"translateY(-50%)", color:C.textMuted }} />
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width:"100%", height:48, paddingLeft:44, paddingRight:16, borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, fontSize:14, color:C.text, outline:"none", boxSizing:"border-box", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}
          />
        </div>

        {/* Category filters */}
        <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
          {categories.map((category) => {
            const Icon = categoryIcons[category] || Target;
            const isActive = selectedCategory === category;
            return (
              <button key={category} onClick={() => setSelectedCategory(category)}
                style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 16px", borderRadius:999, border:`1px solid ${isActive ? C.navy : C.border}`, background:isActive ? C.navy : C.bg, color:isActive ? "#fff" : C.textSub, fontSize:13, fontWeight:600, whiteSpace:"nowrap", cursor:"pointer", transition:"all 0.15s", flexShrink:0 }}
              >
                {category !== "All" && <Icon size={14} />}{category}
              </button>
            );
          })}
        </div>

        {/* Course Grid */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:20 }}>
          {filteredCourses.map((course) => {
            const Icon = categoryIcons[course.category] || Target;
            const progress = getCourseProgress(course.id);
            const thumb = categoryThumb[course.category] || { bg:C.bgMid, color:C.textMuted };
            return (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                style={{ borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", background:C.bg, cursor:"pointer", overflow:"hidden", transition:"all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 10px 36px ${C.navyGlow}`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
              >
                {/* Thumbnail */}
                <div style={{ height:128, display:"flex", alignItems:"center", justifyContent:"center", background:thumb.bg, borderBottom:`1px solid ${C.border}`, position:"relative" }}>
                  <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.72)", display:"flex", alignItems:"center", justifyContent:"center", color:thumb.color }}>
                    <Icon size={26} />
                  </div>
                  <div style={{ position:"absolute", top:10, right:10, background:C.bg, border:`1px solid ${C.border}`, borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:600, color:C.textSub }}>
                    {course.difficulty || "Beginner"}
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding:"16px 18px 20px" }}>
                  <div style={{ fontSize:15, fontWeight:800, color:C.text, marginBottom:6, letterSpacing:"-0.3px" }}>{course.name}</div>
                  <p style={{ fontSize:13, color:C.textSub, margin:"0 0 14px", lineHeight:1.5, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{course.description}</p>

                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:12, color:C.textMuted, marginBottom:12 }}>
                    <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={13} />{course.lessons_count} lessons</span>
                    <span style={{ display:"flex", alignItems:"center", gap:4, color:C.green, fontWeight:700 }}><Zap size={13} />{course.xp_reward} XP</span>
                  </div>

                  {progress > 0 ? (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                        <span style={{ color:C.textMuted }}>Progress</span>
                        <span style={{ fontWeight:700, color:C.accent }}>{Math.round(progress)}%</span>
                      </div>
                      <div style={{ height:6, borderRadius:999, background:C.bgMid, overflow:"hidden" }}>
                        <div style={{ height:"100%", width:`${progress}%`, borderRadius:999, background:C.accent, transition:"width 0.3s" }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ textAlign:"center", padding:"8px 0", borderRadius:999, border:`1px solid ${C.accent}`, color:C.accent, fontSize:12, fontWeight:700 }}>
                      {user ? "Start Learning" : "Sign in to Start"}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {filteredCourses.length === 0 && (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <div style={{ width:80, height:80, background:C.bgMid, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Search size={36} color={C.textMuted} />
            </div>
            <h3 style={{ fontSize:17, fontWeight:700, color:C.text, margin:"0 0 6px" }}>No courses found</h3>
            <p style={{ fontSize:13, color:C.textMuted, margin:0 }}>Try adjusting your search or filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
