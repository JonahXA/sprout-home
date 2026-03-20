import React, { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
 ArrowLeft, Play, CheckCircle, Lock, Clock, Zap, BookOpen, Award, TrendingUp, Calculator,
} from "lucide-react";

const C = {
 navy:"#1B2B5E", navyMid:"#141E43", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB", borderMid:"#D1D5DB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

const safeParse = (raw, fallback) => {
 try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getLocalUser = () => safeParse(localStorage.getItem("sprout_user"), null);

async function fetchJsonWithCache(url, cacheKey, fallback = []) {
 try {
 const res = await fetch(url, { cache: "no-store" });
 if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
 const data = await res.json();
 setJSON(cacheKey, data);
 return Array.isArray(data) ? data : fallback;
 } catch {
 return getJSON(cacheKey, fallback);
 }
}

const dataClient = {
 async listCourses() {
 const basePath = import.meta.env.BASE_URL || "/";
 return fetchJsonWithCache(`${basePath}data/courses.json`, "sprout_courses", []);
 },
 async listLessons() {
 const basePath = import.meta.env.BASE_URL || "/";
 return fetchJsonWithCache(`${basePath}data/lessons.json`, "sprout_lessons", []);
 },
 async listUserProgress(userEmail, courseId) {
 const all = getJSON("sprout_user_progress", []);
 return all.filter(
 (p) => String(p.user_email) === String(userEmail) && String(p.course_id) === String(courseId)
 );
 },
};

function Loading({ label }) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
 <div style={{ textAlign:"center" }}>
 <div style={{ width:64, height:64, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
 <p style={{ color:C.textSub, margin:0 }}>{label}</p>
 </div>
 </div>
 );
}

export default function CourseDetail() {
 const navigate = useNavigate();
 const [user, setUser] = useState(null);

 const courseId = useMemo(() => {
 const hash = window.location.hash;
 const queryStart = hash.indexOf('?');
 if (queryStart === -1) return null;
 const queryString = hash.substring(queryStart + 1);
 const urlParams = new URLSearchParams(queryString);
 return urlParams.get("id");
 }, []);

 useEffect(() => {
 const currentUser = getLocalUser();
 if (!currentUser) { navigate(createPageUrl("Login")); return; }
 setUser(currentUser);
 }, [navigate]);

 if (!courseId) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
 <div style={{ maxWidth:400, width:"100%", borderRadius:20, border:`1px solid ${C.border}`, padding:40, textAlign:"center", background:C.bg }}>
 <p style={{ fontWeight:700, color:C.text, fontSize:17, marginBottom:8 }}>Missing Course ID</p>
 <p style={{ color:C.textSub, marginBottom:24 }}>This page needs an id in the URL.</p>
 <button onClick={() => navigate(createPageUrl("Learn"))} style={{ padding:"10px 24px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>Back to Courses</button>
 </div>
 </div>
 );
 }

 const {
 data: course, isLoading: courseLoading, isFetched: courseFetched,
 isError: courseIsError, error: courseError,
 } = useQuery({
 queryKey: ["course", courseId],
 queryFn: async () => {
 const courses = await dataClient.listCourses();
 return courses.find((c) => String(c.id) === String(courseId)) || null;
 },
 enabled: !!courseId,
 });

 const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
 queryKey: ["lessons", courseId],
 queryFn: async () => {
 const allLessons = await dataClient.listLessons();
 return allLessons
 .filter((l) => String(l.course_id) === String(courseId) && !l.is_deleted)
 .sort((a, b) => (a.order || 0) - (b.order || 0));
 },
 enabled: !!courseId && !!course,
 });

 const { data: userProgress = [] } = useQuery({
 queryKey: ["userProgress", user?.email, courseId],
 queryFn: async () => {
 if (!user?.email) return [];
 return dataClient.listUserProgress(user.email, courseId);
 },
 enabled: !!user?.email && !!courseId,
 });

 if (courseLoading) return <Loading label="Loading course..." />;

 if (courseIsError) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
 <div style={{ maxWidth:480, width:"100%", borderRadius:20, border:`1px solid ${C.border}`, padding:40, background:C.bg }}>
 <p style={{ fontWeight:700, color:C.text, fontSize:17, marginBottom:8 }}>Course load failed</p>
 <p style={{ color:C.textSub, marginBottom:24 }}>{String(courseError?.message || "Unknown error")}</p>
 <button onClick={() => navigate(createPageUrl("Learn"))} style={{ padding:"10px 24px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontWeight:600, cursor:"pointer" }}>Back to Courses</button>
 </div>
 </div>
 );
 }

 if (courseFetched && !course) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
 <div style={{ maxWidth:480, width:"100%", borderRadius:20, border:`1px solid ${C.border}`, padding:40, background:C.bg }}>
 <p style={{ fontWeight:700, color:C.text, fontSize:17, marginBottom:8 }}>Course not found</p>
 <p style={{ color:C.textSub, marginBottom:24 }}>This course id doesn't match anything in <code>/public/data/courses.json</code>.</p>
 <button onClick={() => navigate(createPageUrl("Learn"))} style={{ padding:"10px 24px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontWeight:600, cursor:"pointer" }}>Back to Courses</button>
 </div>
 </div>
 );
 }

 if (lessonsLoading) return <Loading label="Loading lessons..." />;

 const completedLessons = userProgress.filter((p) => p.completed).length;
 const progressPercent = (completedLessons / (lessons.length || 1)) * 100;

 const nextLesson = lessons.find(
 (l) => !userProgress.find((p) => String(p.lesson_id) === String(l.id) && p.completed)
 );

 return (
 <>
 <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
 <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
 <div style={{ maxWidth:1100, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

 {/* Back Button */}
 <button
 onClick={() => navigate(createPageUrl("Learn"))}
 style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer", width:"fit-content" }}
 >
 <ArrowLeft size={16} />
 Back to Courses
 </button>

 {/* Hero Banner */}
 <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight},#1a4080)`, borderRadius:20, padding:"40px 48px", color:"#fff", boxShadow:`0 12px 48px ${C.navyGlow}` }}>
 <div style={{ display:"inline-flex", padding:"4px 14px", borderRadius:999, background:"rgba(255,255,255,0.15)", fontSize:12, fontWeight:700, marginBottom:16, letterSpacing:"0.5px" }}>
 {course.category}
 </div>
 <h1 style={{ fontSize:36, fontWeight:900, letterSpacing:"-1px", margin:"0 0 12px" }}>{course.name}</h1>
 <p style={{ fontSize:16, opacity:0.85, margin:"0 0 24px" }}>{course.description}</p>
 <div style={{ display:"flex", flexWrap:"wrap", gap:24, fontSize:14 }}>
 {[
 [BookOpen, `${lessons.length} Lessons`],
 [Clock, `${lessons.reduce((sum, l) => sum + (Number(l.duration_minutes) || 0), 0)} Minutes`],
 [Award, "Earn Certificate"],
 [Award, course.difficulty || "Beginner"],
 ].map(([Icon, text]) => (
 <div key={text} style={{ display:"flex", alignItems:"center", gap:8, opacity:0.9 }}>
 <Icon size={16} />{text}
 </div>
 ))}
 </div>
 </div>

 {/* Progress Card */}
 <div style={{ borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", background:C.bg, padding:"20px 24px" }}>
 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
 <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, color:C.text }}>
 <TrendingUp size={18} color={C.accent} />
 Your Progress
 </div>
 <span style={{ fontSize:24, fontWeight:900, color:C.accent }}>{Math.round(progressPercent)}%</span>
 </div>
 <div style={{ height:10, borderRadius:999, background:C.bgMid, overflow:"hidden", marginBottom:12 }}>
 <div style={{ height:"100%", width:`${progressPercent}%`, borderRadius:999, background:C.accent, transition:"width 0.4s" }} />
 </div>
 <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:C.textSub }}>
 <span>{completedLessons} of {lessons.length} lessons completed</span>
 <span>{lessons.length - completedLessons} lessons remaining</span>
 </div>
 </div>

 {/* Continue Learning Banner */}
 {nextLesson && (
 <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:16, padding:"24px 28px", color:"#fff", boxShadow:`0 4px 20px ${C.navyGlow}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
 <div>
 <p style={{ fontSize:12, opacity:0.8, margin:"0 0 4px", fontWeight:600 }}>Continue Learning</p>
 <h3 style={{ fontSize:20, fontWeight:800, margin:"0 0 6px" }}>{nextLesson.title}</h3>
 <p style={{ fontSize:13, opacity:0.7, margin:0 }}>{nextLesson.duration_minutes} minutes</p>
 </div>
 <button
 onClick={() => navigate(createPageUrl(`Lesson?id=${nextLesson.id}`))}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background:"#fff", color:C.navy, border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:"0 2px 8px rgba(0,0,0,0.1)" }}
 >
 <Play size={16} />
 Start Lesson
 </button>
 </div>
 )}

 {/* Investment Calculator Banner */}
 {course.category === "Investing" && (
 <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:16, padding:"24px 28px", color:"#fff", boxShadow:`0 4px 20px ${C.navyGlow}`, display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap" }}>
 <div>
 <p style={{ fontSize:12, opacity:0.8, margin:"0 0 4px", fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
 <Calculator size={14} />Interactive Tool
 </p>
 <h3 style={{ fontSize:20, fontWeight:800, margin:"0 0 6px" }}>Investment Growth Calculator</h3>
 <p style={{ fontSize:13, opacity:0.7, margin:0 }}>See how your investments can grow over time with compound interest</p>
 </div>
 <button
 onClick={() => navigate(createPageUrl("InvestmentCalculator"))}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background:"#fff", color:C.navy, border:"none", fontWeight:700, fontSize:14, cursor:"pointer" }}
 >
 <Calculator size={16} />
 Open Calculator
 </button>
 </div>
 )}

 {/* Lessons List */}
 <div style={{ borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", background:C.bg, overflow:"hidden" }}>
 <div style={{ padding:"18px 24px", borderBottom:`1px solid ${C.border}` }}>
 <h3 style={{ fontSize:16, fontWeight:800, color:C.text, margin:0 }}>Course Content</h3>
 </div>
 <div style={{ padding:"12px 16px", display:"flex", flexDirection:"column", gap:8 }}>
 {lessons.map((lesson, index) => {
 const isCompleted = userProgress.find(
 (p) => String(p.lesson_id) === String(lesson.id) && p.completed
 );

 const isProgressiveCourse =
 course?.name === "Money Management Essentials" ||
 course?.name === "Smart Savings Strategies";

 const isLocked =
 isProgressiveCourse &&
 index > 0 &&
 !userProgress.find((p) => String(p.lesson_id) === String(lessons[index - 1]?.id) && p.completed) &&
 !isCompleted;

 return (
 <div
 key={lesson.id}
 onClick={() => !isLocked && navigate(createPageUrl(`Lesson?id=${lesson.id}`))}
 style={{
 display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 16px",
 borderRadius:12, transition:"all 0.15s",
 background:isLocked ? C.bgSoft : C.bg,
 border:`1px solid ${isLocked ? C.border : "transparent"}`,
 opacity:isLocked ? 0.6 : 1,
 cursor:isLocked ? "not-allowed" : "pointer",
 }}
 onMouseEnter={e => { if(!isLocked) { e.currentTarget.style.background = C.accentSoft; e.currentTarget.style.borderColor = C.accent; } }}
 onMouseLeave={e => { e.currentTarget.style.background = isLocked ? C.bgSoft : C.bg; e.currentTarget.style.borderColor = isLocked ? C.border : "transparent"; }}
 >
 <div style={{ display:"flex", alignItems:"center", gap:16 }}>
 <div style={{
 width:44, height:44, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0,
 background:isCompleted ? C.green : isLocked ? C.bgMid : C.navy,
 }}>
 {isCompleted ? <CheckCircle size={22} color="#fff" /> : isLocked ? <Lock size={20} color={C.textMuted} /> : <span style={{ color:"#fff", fontWeight:800, fontSize:15 }}>{index + 1}</span>}
 </div>
 <div>
 <div style={{ fontWeight:700, color:C.text, fontSize:14, marginBottom:4 }}>{lesson.title}</div>
 <div style={{ display:"flex", alignItems:"center", gap:12, fontSize:12, color:C.textMuted }}>
 <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={11} />{lesson.duration_minutes} min</span>
 <span style={{ display:"flex", alignItems:"center", gap:4 }}>{lesson.duration_minutes} min</span>
 </div>
 </div>
 </div>
 {isCompleted && <span style={{ fontSize:11, fontWeight:700, color:C.green, background:C.greenSoft, padding:"3px 10px", borderRadius:999 }}>Completed</span>}
 {isLocked && <span style={{ fontSize:11, fontWeight:600, color:C.textMuted, background:C.bgMid, padding:"3px 10px", borderRadius:999, border:`1px solid ${C.border}` }}>Locked</span>}
 </div>
 );
 })}
 {lessons.length === 0 && (
 <div style={{ fontSize:13, color:C.textSub, padding:"16px 8px" }}>
 No lessons found for this course. Check that lessons in{" "}
 <code style={{ background:C.bgMid, padding:"2px 6px", borderRadius:4 }}>public/data/lessons.json</code>{" "}
 use the right <code style={{ background:C.bgMid, padding:"2px 6px", borderRadius:4 }}>course_id</code>.
 </div>
 )}
 </div>
 </div>

 </div>
 </div>
 </>
 );
}
