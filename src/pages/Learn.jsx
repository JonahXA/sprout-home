import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Search, TrendingUp, PiggyBank, CreditCard, Shield, Brain, Briefcase, GraduationCap, Award, Clock, Target } from "lucide-react";

const C = {
  navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
  bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
  border:"#E5E7EB", borderMid:"#D1D5DB",
  text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

const NICHES = {
  Finance:              { color:"#2D9B6F", softBg:"#E6F5EF", label:"Finance" },
  "AI & Technology":   { color:"#7C3AED", softBg:"#F3F0FF", label:"AI & Technology" },
  Entrepreneurship:    { color:"#F97316", softBg:"#FFF0E6", label:"Entrepreneurship" },
  "Critical Thinking": { color:"#0891B2", softBg:"#E0F5FA", label:"Critical Thinking" },
};

const NICHE_ORDER = ["Finance", "AI & Technology", "Entrepreneurship", "Critical Thinking"];

const CATEGORY_TO_NICHE = {
  "Saving": "Finance",
  "Personal Finance": "Finance",
  "Credit & Debt": "Finance",
  "Investing": "Finance",
  "Insurance": "Finance",
  "AI & ML": "AI & Technology",
  "Career Readiness": "Entrepreneurship",
  "Entrepreneurship": "Entrepreneurship",
  "Critical Thinking": "Critical Thinking",
  "Decision Making": "Critical Thinking",
};

const categoryIcons = {
  Investing: TrendingUp, Saving: PiggyBank, "Credit & Debt": CreditCard,
  Insurance: Shield, "AI & ML": Brain, "Personal Finance": Briefcase, "Career Readiness": GraduationCap,
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

export default function Learn() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

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

  const filteredCourses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return courses;
    return courses.filter((course) =>
      (course.name||"").toLowerCase().includes(q) || (course.description||"").toLowerCase().includes(q)
    );
  }, [courses, searchQuery]);

  const coursesByNiche = useMemo(() => {
    const groups = {};
    filteredCourses.forEach((course) => {
      const niche = CATEGORY_TO_NICHE[course.category] || "Finance";
      if (!groups[niche]) groups[niche] = [];
      groups[niche].push(course);
    });
    return groups;
  }, [filteredCourses]);

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

  const totalCourses = filteredCourses.length;

  return (
    <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
      <div style={{ maxWidth:1200, margin:"0 auto", display:"flex", flexDirection:"column", gap:32 }}>

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

        {/* Niche sections */}
        {totalCourses === 0 ? (
          <div style={{ textAlign:"center", padding:"64px 0" }}>
            <div style={{ width:80, height:80, background:C.bgMid, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
              <Search size={36} color={C.textMuted} />
            </div>
            <h3 style={{ fontSize:17, fontWeight:700, color:C.text, margin:"0 0 6px" }}>No courses found</h3>
            <p style={{ fontSize:13, color:C.textMuted, margin:0 }}>Try adjusting your search.</p>
          </div>
        ) : (
          NICHE_ORDER.map((nicheName) => {
            const nicheCourses = coursesByNiche[nicheName];
            if (!nicheCourses || nicheCourses.length === 0) return null;
            const niche = NICHES[nicheName];
            return (
              <div key={nicheName}>
                {/* Section header */}
                <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
                  <div style={{ width:4, height:28, borderRadius:999, background:niche.color, flexShrink:0 }} />
                  <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:0, letterSpacing:"-0.5px" }}>{niche.label}</h2>
                  <span style={{ fontSize:12, fontWeight:700, color:niche.color, background:niche.softBg, borderRadius:999, padding:"3px 10px" }}>
                    {nicheCourses.length} {nicheCourses.length === 1 ? "course" : "courses"}
                  </span>
                </div>

                {/* Course grid */}
                <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }} className="course-grid">
                  {nicheCourses.map((course) => {
                    const Icon = categoryIcons[course.category] || Target;
                    const progress = getCourseProgress(course.id);
                    return (
                      <div
                        key={course.id}
                        onClick={() => handleCourseClick(course)}
                        style={{ borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", background:C.bg, cursor:"pointer", overflow:"hidden", transition:"all 0.2s" }}
                        onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 10px 36px ${C.navyGlow}`; e.currentTarget.style.transform = "translateY(-3px)"; }}
                        onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
                      >
                        {/* Thumbnail */}
                        <div style={{ height:128, display:"flex", alignItems:"center", justifyContent:"center", background:niche.softBg, borderBottom:`1px solid ${C.border}`, position:"relative" }}>
                          <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.72)", display:"flex", alignItems:"center", justifyContent:"center", color:niche.color }}>
                            <Icon size={26} />
                          </div>
                          {/* Niche tag */}
                          <div style={{ position:"absolute", top:10, left:10, background:niche.softBg, border:`1px solid ${niche.color}`, borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:700, color:niche.color }}>
                            {niche.label}
                          </div>
                          {/* Difficulty badge */}
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
                            <span style={{ display:"flex", alignItems:"center", gap:4, color:niche.color, fontWeight:700 }}><Award size={13} />Certificate</span>
                          </div>

                          {progress > 0 ? (
                            <div>
                              <div style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:6 }}>
                                <span style={{ color:C.textMuted }}>Progress</span>
                                <span style={{ fontWeight:700, color:niche.color }}>{Math.round(progress)}%</span>
                              </div>
                              <div style={{ height:6, borderRadius:999, background:C.bgMid, overflow:"hidden" }}>
                                <div style={{ height:"100%", width:`${progress}%`, borderRadius:999, background:niche.color, transition:"width 0.3s" }} />
                              </div>
                            </div>
                          ) : (
                            <div style={{ textAlign:"center", padding:"8px 0", borderRadius:999, border:`1px solid ${niche.color}`, color:niche.color, fontSize:12, fontWeight:700 }}>
                              {user ? "Start Learning" : "Sign in to Start"}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
      <style>{`@media (max-width:1100px){.course-grid{grid-template-columns:repeat(3,1fr)!important;}} @media (max-width:780px){.course-grid{grid-template-columns:repeat(2,1fr)!important;}} @media (max-width:480px){.course-grid{grid-template-columns:1fr!important;}}`}</style>
    </div>
  );
}
