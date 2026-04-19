import React, { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import { Search, TrendingUp, PiggyBank, CreditCard, Shield, Brain, Briefcase, GraduationCap, Award, Clock, Target, Lock } from "lucide-react";

const C = {
 navy:"#1B2B5E", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB", borderMid:"#D1D5DB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

const NICHES = {
 Finance: { color:"#2D9B6F", softBg:"#E6F5EF", label:"Finance" },
 "AI & Technology": { color:"#7C3AED", softBg:"#F3F0FF", label:"AI & Technology" },
 Entrepreneurship: { color:"#F97316", softBg:"#FFF0E6", label:"Entrepreneurship" },
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

// ─── V2 lesson metadata ─────────────────────────────────────────
// Short descriptions (6–12 words) and icon/difficulty per lesson ID.
const V2_LESSON_META = {
 "lesson-mf-001": { description: "Understand gross pay, taxes, and take-home pay.",          icon: Briefcase,   difficulty: "Beginner" },
 "lesson-mf-002": { description: "Learn where to keep your money and why it matters.",        icon: Briefcase,   difficulty: "Beginner" },
 "lesson-mf-003": { description: "Understand the habits and behavior behind your spending.",  icon: Briefcase,   difficulty: "Beginner" },
 "lesson-mf-004": { description: "Learn how to set clear, achievable money goals.",           icon: Briefcase,   difficulty: "Beginner" },
 "lesson-bc-001": { description: "Create a simple budget that fits your real life.",          icon: PiggyBank,   difficulty: "Beginner" },
 "lesson-bc-002": { description: "Stay on track and adjust your budget when life shifts.",    icon: PiggyBank,   difficulty: "Beginner" },
 "lesson-bc-003": { description: "Budget confidently even when your income isn't consistent.",icon: PiggyBank,   difficulty: "Intermediate" },
 "lesson-sf-001": { description: "Build a financial cushion for unexpected expenses.",        icon: PiggyBank,   difficulty: "Beginner" },
 "lesson-sf-002": { description: "Set up automatic savings so you never forget to save.",    icon: PiggyBank,   difficulty: "Beginner" },
 "lesson-sf-003": { description: "Learn how money grows on itself over time.",               icon: TrendingUp,  difficulty: "Beginner" },
 "lesson-sf-004": { description: "Match your savings strategy to your time horizon.",        icon: PiggyBank,   difficulty: "Beginner" },
 "lesson-cd-001": { description: "Understand billing cycles, interest, and smart card use.", icon: CreditCard,  difficulty: "Beginner" },
 "lesson-cd-002": { description: "Learn how your credit score is calculated and improved.",  icon: CreditCard,  difficulty: "Beginner" },
 "lesson-cd-003": { description: "Know which debt builds wealth and which drains it.",       icon: CreditCard,  difficulty: "Beginner" },
 "lesson-cd-004": { description: "See how interest makes debt cost more than expected.",     icon: CreditCard,  difficulty: "Intermediate" },
 "lesson-cd-005": { description: "Choose the best plan to pay off what you owe.",            icon: CreditCard,  difficulty: "Intermediate" },
 "lesson-inv-001": { description: "Understand why investing beats saving alone long-term.",  icon: TrendingUp,  difficulty: "Beginner" },
 "lesson-inv-002": { description: "Explore stocks, bonds, index funds, and ETFs.",           icon: TrendingUp,  difficulty: "Beginner" },
 "lesson-inv-003": { description: "Match your investments to your risk tolerance and goals.",icon: TrendingUp,  difficulty: "Intermediate" },
 "lesson-inv-004": { description: "Take the first steps toward opening an investment account.", icon: TrendingUp, difficulty: "Beginner" },
 "lesson-inv-005": { description: "Learn about 401(k)s, IRAs, and tax-advantaged saving.",  icon: TrendingUp,  difficulty: "Beginner" },
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
 async listV2Curriculum() {
 try {
   const base = import.meta.env.BASE_URL || "/";
   const res = await fetch(`${base}data/lessons_v2/index.json`, { cache: "no-store" });
   if (res.ok) return res.json();
 } catch {}
 return null;
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

 const { data: v2Curriculum } = useQuery({
 queryKey: ["v2_curriculum_learn"],
 queryFn: () => dataClient.listV2Curriculum(),
 });

 // Flat array of all 21 v2 lessons mapped to card format
 const financeV2Cards = useMemo(() => {
 if (!v2Curriculum?.modules) return [];
 return v2Curriculum.modules
   .flatMap((mod) => mod.lessons)
   .map((lesson) => {
     const meta = V2_LESSON_META[lesson.id] || {};
     return {
       ...lesson,
       _v2: true,
       name: lesson.title,
       description: meta.description || "",
       category: "Personal Finance",
       difficulty: meta.difficulty || "Beginner",
       _icon: meta.icon || Briefcase,
     };
   });
 }, [v2Curriculum]);

 // Non-Finance v1 courses (keep as-is); Finance is replaced by v2 lessons
 const coursesByNiche = useMemo(() => {
 const groups = {};
 const q = searchQuery.toLowerCase();

 courses
   .filter((c) => CATEGORY_TO_NICHE[c.category] !== "Finance")
   .forEach((course) => {
     const niche = CATEGORY_TO_NICHE[course.category] || "Other";
     if (!groups[niche]) groups[niche] = [];
     groups[niche].push(course);
   });

 const financeCards = q
   ? financeV2Cards.filter((l) =>
       l.name.toLowerCase().includes(q) ||
       l.description.toLowerCase().includes(q)
     )
   : financeV2Cards;

 if (financeCards.length > 0) groups["Finance"] = financeCards;

 return groups;
 }, [courses, financeV2Cards, searchQuery]);

 const getCourseProgress = (courseId) => {
 const course = courses.find((c) => String(c.id) === String(courseId));
 if (!course) return 0;
 const completed = userProgress.filter((p) => String(p.course_id) === String(courseId) && p.completed).length;
 return (completed / (Number(course.lessons_count || 0) || 1)) * 100;
 };

 const handleCourseClick = (course) => {
 if (course._v2) {
     navigate(createPageUrl(`Lesson?id=${course.id}`));
   return;
 }
 if (course.name?.includes("AI Literacy")) {
   navigate(createPageUrl("AILiteracy"));
 } else {
   navigate(createPageUrl(`CourseDetail?id=${course.id}`));
 }
 };

 const totalVisible = Object.values(coursesByNiche).reduce((s, arr) => s + arr.length, 0);

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
   placeholder="Search lessons..."
   value={searchQuery}
   onChange={(e) => setSearchQuery(e.target.value)}
   style={{ width:"100%", height:48, paddingLeft:44, paddingRight:16, borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, fontSize:14, color:C.text, outline:"none", boxSizing:"border-box", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}
 />
 </div>

 {/* Niche sections */}
 {totalVisible === 0 ? (
 <div style={{ textAlign:"center", padding:"64px 0" }}>
 <div style={{ width:80, height:80, background:C.bgMid, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" }}>
   <Search size={36} color={C.textMuted} />
 </div>
 <h3 style={{ fontSize:17, fontWeight:700, color:C.text, margin:"0 0 6px" }}>No results found</h3>
 <p style={{ fontSize:13, color:C.textMuted, margin:0 }}>Try adjusting your search.</p>
 </div>
 ) : (
 NICHE_ORDER.map((nicheName) => {
   const nicheCourses = coursesByNiche[nicheName];
   if (!nicheCourses || nicheCourses.length === 0) return null;
   const niche = NICHES[nicheName];
   const isFinance = nicheName === "Finance";
   return (
   <div key={nicheName}>
     {/* Section header */}
     <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:16 }}>
     <div style={{ width:4, height:28, borderRadius:999, background:niche.color, flexShrink:0 }} />
     <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:0, letterSpacing:"-0.5px" }}>{niche.label}</h2>
     <span style={{ fontSize:12, fontWeight:700, color:niche.color, background:niche.softBg, borderRadius:999, padding:"3px 10px" }}>
       {nicheCourses.length} {isFinance ? "lessons" : nicheCourses.length === 1 ? "course" : "courses"}
     </span>
     </div>

     {/* Card grid */}
     <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:20 }} className="course-grid">
     {nicheCourses.map((course) => {
       const Icon = course._v2 ? (course._icon || Briefcase) : (categoryIcons[course.category] || Target);
       const progress = course._v2 ? 0 : getCourseProgress(course.id);
       const isLocked = false;
       return (
       <div
         key={course.id}
         onClick={() => handleCourseClick(course)}
         style={{ borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", background:C.bg, cursor: isLocked ? "default" : "pointer", overflow:"hidden", transition:"all 0.2s", display:"flex", flexDirection:"column", opacity: isLocked ? 0.72 : 1 }}
         onMouseEnter={e => { if (!isLocked) { e.currentTarget.style.boxShadow = `0 10px 36px ${C.navyGlow}`; e.currentTarget.style.transform = "translateY(-3px)"; } }}
         onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
       >
         {/* Thumbnail */}
         <div style={{ height:112, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background: isLocked ? C.bgMid : niche.softBg, borderBottom:`1px solid ${C.border}`, position:"relative" }}>
         <div style={{ width:52, height:52, borderRadius:14, background:"rgba(255,255,255,0.72)", display:"flex", alignItems:"center", justifyContent:"center", color: isLocked ? C.textMuted : niche.color }}>
           {isLocked ? <Lock size={22} /> : <Icon size={26} />}
         </div>
         <div style={{ position:"absolute", top:10, left:10, background: isLocked ? C.bgMid : niche.softBg, border:`1px solid ${isLocked ? C.borderMid : niche.color}`, borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:700, color: isLocked ? C.textMuted : niche.color }}>
           {niche.label}
         </div>
         <div style={{ position:"absolute", top:10, right:10, background:C.bg, border:`1px solid ${C.border}`, borderRadius:999, padding:"3px 10px", fontSize:11, fontWeight:600, color:C.textSub }}>
           {course.difficulty || "Beginner"}
         </div>
         </div>

         {/* Body */}
         <div style={{ padding:"14px 16px 16px", display:"flex", flexDirection:"column", flex:1 }}>
         <div style={{ fontSize:14, fontWeight:800, color:C.text, marginBottom:6, letterSpacing:"-0.3px", lineHeight:1.35, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{course.name}</div>
         <p style={{ fontSize:12, color:C.textSub, margin:"0 0 10px", lineHeight:1.5, flex:1, display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden" }}>{course.description}</p>
         <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", fontSize:11, color:C.textMuted, marginBottom:10 }}>
           {course._v2 ? (
           <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={12} />{course.duration_minutes} min</span>
           ) : (
           <>
             <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={12} />{course.lessons_count} lessons</span>
             <span style={{ display:"flex", alignItems:"center", gap:4, color:niche.color, fontWeight:700 }}><Award size={12} />Certificate</span>
           </>
           )}
         </div>
         {!course._v2 && progress > 0 ? (
           <div>
           <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, marginBottom:5 }}>
             <span style={{ color:C.textMuted }}>Progress</span>
             <span style={{ fontWeight:700, color:niche.color }}>{Math.round(progress)}%</span>
           </div>
           <div style={{ height:5, borderRadius:999, background:C.bgMid, overflow:"hidden" }}>
             <div style={{ height:"100%", width:`${progress}%`, borderRadius:999, background:niche.color, transition:"width 0.3s" }} />
           </div>
           </div>
         ) : (
           <button
           disabled={isLocked}
           onClick={(e) => { e.stopPropagation(); handleCourseClick(course); }}
           style={{ width:"100%", height:38, borderRadius:999, background: isLocked ? C.bgMid : C.navy, color: isLocked ? C.textMuted : "#fff", fontSize:12, fontWeight:700, border:`1px solid ${isLocked ? C.borderMid : "transparent"}`, cursor: isLocked ? "not-allowed" : "pointer", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", gap:6, transition:"background 0.15s" }}
           onMouseEnter={e => { if (!isLocked) e.currentTarget.style.background = C.navyLight; }}
           onMouseLeave={e => { if (!isLocked) e.currentTarget.style.background = C.navy; }}
           >
           {isLocked ? <><Lock size={12} />Locked</> : (user ? "Start Learning" : "Sign in to Start")}
           </button>
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
