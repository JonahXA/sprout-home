// src/pages/Lesson.jsx - FIXED VERSION
import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import ReactMarkdown from "react-markdown";
import {
 ArrowLeft, ArrowRight, CheckCircle, Zap, Trophy, Clock,
 Sparkles, BookOpen, Star, Target, TrendingUp, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import LevelUpModal from "@/components/LevelUpModal";
import ChallengeCompleteModal from "@/components/ChallengeCompleteModal";
import { useChallengeCheck } from "@/components/useChallengeCheck";
import { trackEvent } from "@/lib/activityTracker";

const C = {
 navy:"#1B2B5E", navyMid:"#141E43", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE", accentMid:"#BFDBFE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 red:"#EF4444", redSoft:"#FEF2F2",
 amber:"#F59E0B", amberSoft:"#FFF3E0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB", borderMid:"#D1D5DB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

/** ---------- local helpers ---------- */
const safeParse = (raw, fallback) => {
 try { return raw ? JSON.parse(raw) : fallback; } catch { return fallback; }
};

const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const getLocalUser = () => getJSON("sprout_user", null);
const setLocalUser = (user) => setJSON("sprout_user", user);

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

const safeUUID = () => {
 try { return globalThis?.crypto?.randomUUID?.() || null; } catch { return null; }
};

const data = {
 async listLessons() {
 const basePath = import.meta.env.BASE_URL || "/";
 return fetchJsonWithCache(`${basePath}data/lessons.json`, "sprout_lessons", []);
 },
 async listCourses() {
 const basePath = import.meta.env.BASE_URL || "/";
 return fetchJsonWithCache(`${basePath}data/courses.json`, "sprout_courses", []);
 },
 async listUserProgress({ user_email, course_id, lesson_id } = {}) {
 const all = getJSON("sprout_user_progress", []);
 return all.filter((p) => {
 if (user_email && p.user_email !== user_email) return false;
 if (course_id && String(p.course_id) !== String(course_id)) return false;
 if (lesson_id && String(p.lesson_id) !== String(lesson_id)) return false;
 return true;
 });
 },
 async upsertUserProgress(record) {
 const all = getJSON("sprout_user_progress", []);
 const idx = all.findIndex((p) => String(p.id) === String(record.id));
 if (idx >= 0) all[idx] = { ...all[idx], ...record };
 else all.push(record);
 setJSON("sprout_user_progress", all);
 return record;
 },
 async upsertDailyActivity(record) {
 const all = getJSON("sprout_daily_activity", []);
 const idx = all.findIndex(
 (a) => a.user_email === record.user_email && a.date === record.date
 );
 if (idx >= 0) all[idx] = { ...all[idx], ...record };
 else all.push(record);
 setJSON("sprout_daily_activity", all);
 return record;
 },
 async getDailyActivity({ user_email, date }) {
 const all = getJSON("sprout_daily_activity", []);
 return all.filter((a) => a.user_email === user_email && a.date === date);
 },
};

const lessonImages = {
 budget: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=800&q=80",
 paycheck: "https://images.unsplash.com/photo-1554224154-26032ffc0d07?w=800&q=80",
 insurance: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&q=80",
 ai: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
 ml: "https://images.unsplash.com/photo-1555255707-c07966088b7b?w=800&q=80",
 piggybank: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80",
 investing: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80",
 credit: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=800&q=80",
 career: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80",
};

function detectSpecialLessonPage(lesson) {
 if (!lesson || !lesson.title) return null;
 const title = lesson.title.toLowerCase();
 const content = lesson.content || '';
 const contentLength = content.trim().length;
 const dayMatch = lesson.title.match(/^Day (\d+):/i);
 if (dayMatch) return `AIDay${dayMatch[1]}`;
 if (contentLength > 300) return null;
 if (title.includes('budget') && !title.includes('quiz')) return 'BudgetLesson';
 if (title.includes('paycheck') && !title.includes('quiz')) return 'PaycheckLesson';
 if ((title.includes('credit') || title.includes('statement')) && !title.includes('quiz')) return 'CreditCardLesson';
 return null;
}

function hasSubstantialContent(content) {
 if (!content || typeof content !== 'string') return false;
 const trimmed = content.trim();
 if (trimmed.length < 200) return false;
 return /^##\s/m.test(trimmed);
}

export default function Lesson() {
 const navigate = useNavigate();
 const queryClient = useQueryClient();

 const [user, setUser] = useState(null);
 const [currentSection, setCurrentSection] = useState(0);
 const [showQuiz, setShowQuiz] = useState(false);
 const [quizAnswers, setQuizAnswers] = useState({});
 const [quizSubmitted, setQuizSubmitted] = useState(false);
 const [score, setScore] = useState(0);
 const [showLevelUp, setShowLevelUp] = useState(false);
 const [newLevel, setNewLevel] = useState(null);

 const lessonId = useMemo(() => {
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
 if (!currentUser.onboarding_completed) navigate(createPageUrl("SchoolSelection"));
 }, [navigate]);

 const { completedChallenge, clearCompletedChallenge } = useChallengeCheck(user);

 const { data: lesson } = useQuery({
 queryKey: ["lesson", lessonId],
 queryFn: async () => {
 const lessons = await data.listLessons();
 return lessons.find((l) => String(l.id) === String(lessonId)) || null;
 },
 enabled: !!lessonId,
 });

 useEffect(() => {
 if (!lesson) return;
 const specialPage = detectSpecialLessonPage(lesson);
 if (specialPage) navigate(createPageUrl(specialPage), { replace: true });
 }, [lesson, navigate]);

 const { data: course } = useQuery({
 queryKey: ["course", lesson?.course_id],
 queryFn: async () => {
 const courses = await data.listCourses();
 return courses.find((c) => String(c.id) === String(lesson?.course_id)) || null;
 },
 enabled: !!lesson?.course_id,
 });

 const { data: allLessons = [] } = useQuery({
 queryKey: ["lessons", lesson?.course_id],
 queryFn: async () => {
 const lessons = await data.listLessons();
 return lessons
 .filter((l) => String(l.course_id) === String(lesson?.course_id))
 .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
 },
 enabled: !!lesson?.course_id,
 });

 const { data: progress, refetch: refetchProgress } = useQuery({
 queryKey: ["lessonProgress", user?.email, lessonId],
 queryFn: async () => {
 const progressList = await data.listUserProgress({ user_email: user?.email, lesson_id: lessonId });
 return progressList[0] || null;
 },
 enabled: !!user && !!lessonId,
 });

 const completeMutation = useMutation({
 mutationFn: async ({ quizScore }) => {
 if (!user?.email) throw new Error("Missing user");
 if (!lesson?.course_id) throw new Error("Missing lesson/course");
 if (!lessonId) throw new Error("Missing lessonId");
 const now = new Date().toISOString();
 const userEmail = user.email;
 const existing = progress;
 const progressRecord = existing
 ? { ...existing, completed: true, completed_date: now, quiz_score: quizScore }
 : { id: safeUUID() || `up_${Date.now()}`, user_email: userEmail, lesson_id: lessonId, course_id: lesson.course_id, completed: true, completed_date: now, quiz_score: quizScore };
 await data.upsertUserProgress(progressRecord);
 trackEvent("lesson_completed", { lesson_id: lessonId, lesson_title: lesson.title, course_id: lesson.course_id, quiz_score: quizScore, xp_earned: Number(lesson.xp_reward || 0) }).catch(() => {});
 const oldLevel = user.level || 1;
 const xpReward = Number(lesson.xp_reward || 0);
 const newXP = (user.xp_points || 0) + xpReward;
 const calculatedLevel = Math.floor(newXP / 100) + 1;
 const updatedUser = { ...user, xp_points: newXP, level: calculatedLevel, total_lessons_completed: (user.total_lessons_completed || 0) + 1 };
 setLocalUser(updatedUser);
 setUser(updatedUser);
 if (calculatedLevel > oldLevel) { setNewLevel(calculatedLevel); setShowLevelUp(true); }
 const today = new Date().toISOString().split("T")[0];
 const activities = await data.getDailyActivity({ user_email: userEmail, date: today });
 if (activities.length > 0) {
 const a = activities[0];
 await data.upsertDailyActivity({ ...a, lessons_completed: (a.lessons_completed || 0) + 1, xp_earned: (a.xp_earned || 0) + xpReward });
 } else {
 await data.upsertDailyActivity({ id: safeUUID() || `da_${Date.now()}`, user_email: userEmail, date: today, lessons_completed: 1, xp_earned: xpReward });
 }
 },
 onSuccess: () => {
 refetchProgress();
 queryClient.invalidateQueries({ queryKey: ["userProgress"] });
 queryClient.invalidateQueries({ queryKey: ["allUserProgress"] });
 queryClient.invalidateQueries({ queryKey: ["dailyActivity"] });
 queryClient.invalidateQueries({ queryKey: ["userChallenges"] });
 toast.success(`Lesson completed! +${lesson?.xp_reward || 0} XP`);
 },
 onError: (err) => {
 console.error(err);
 toast.error("Something went wrong saving your progress. Please try again.");
 },
 });

 const handleQuizSubmit = () => {
 const questions = lesson?.quiz_questions || [];
 const totalQuestions = questions.length;
 if (!totalQuestions) { toast.error("This lesson is missing a quiz."); return; }
 let correct = 0;
 questions.forEach((q, index) => { if (quizAnswers[index] === q.correct_answer) correct++; });
 const quizScore = Math.round((correct / totalQuestions) * 100);
 setScore(quizScore);
 setQuizSubmitted(true);
 if (quizScore === 100) completeMutation.mutate({ quizScore });
 };

 const handleRetakeQuiz = () => {
 setQuizAnswers({});
 setQuizSubmitted(false);
 setScore(0);
 window.scrollTo({ top: 0, behavior: "smooth" });
 };

 const handleNext = () => {
 const currentIndex = allLessons.findIndex((l) => String(l.id) === String(lessonId));
 if (currentIndex === -1) { navigate(createPageUrl("Learn")); return; }
 if (currentIndex === allLessons.length - 1) { navigate(createPageUrl(`FinalExam?courseId=${lesson.course_id}`)); return; }
 if (!progress?.completed) { toast.error("Complete this lesson first!"); return; }
 const nextLesson = allLessons[currentIndex + 1];
 navigate(createPageUrl(`Lesson?id=${nextLesson.id}`));
 setCurrentSection(0);
 setShowQuiz(false);
 window.scrollTo(0, 0);
 };

 if (!lessonId) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24, textAlign:"center" }}>
 <div style={{ maxWidth:400, width:"100%", borderRadius:20, border:`1px solid ${C.border}`, padding:40, background:C.bg }}>
 <AlertCircle size={48} color="#F59E0B" style={{ margin:"0 auto 16px" }} />
 <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8 }}>Missing Lesson ID</h2>
 <p style={{ color:C.textSub, marginBottom:24 }}>This page needs a lesson id in the URL.</p>
 <button onClick={() => navigate(createPageUrl("Learn"))} style={{ padding:"10px 24px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>Back to Courses</button>
 </div>
 </div>
 );
 }

 if (!lesson || !course) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
 <div style={{ textAlign:"center" }}>
 <div style={{ width:64, height:64, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
 <p style={{ color:C.textSub }}>Loading lesson...</p>
 </div>
 </div>
 );
 }

 const specialPage = detectSpecialLessonPage(lesson);
 if (specialPage) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
 <div style={{ textAlign:"center" }}>
 <div style={{ width:64, height:64, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
 <p style={{ color:C.textSub }}>Loading interactive lesson...</p>
 </div>
 </div>
 );
 }

 const splitContentIntoPages = (content) => {
 const sections = String(content || "").split(/(?=^## )/m).filter((s) => s.trim());
 return sections.length > 1 ? sections : [String(content || "")];
 };

 const contentSections = splitContentIntoPages(lesson.content);
 const totalSections = contentSections.length;

 const currentIndex = allLessons.findIndex((l) => String(l.id) === String(lessonId));
 const progressPercent = allLessons.length ? ((currentIndex + 1) / allLessons.length) * 100 : 0;

 let lessonImage = lessonImages.piggybank;
 const t = (lesson.title || "").toLowerCase();
 if (t.includes("budget")) lessonImage = lessonImages.budget;
 if (t.includes("paycheck")) lessonImage = lessonImages.paycheck;
 if (t.includes("insurance")) lessonImage = lessonImages.insurance;
 if (t.includes("ai") || t.includes("artificial")) lessonImage = lessonImages.ai;
 if (t.includes("machine") || t.includes("neural")) lessonImage = lessonImages.ml;
 if (t.includes("invest")) lessonImage = lessonImages.investing;
 if (t.includes("credit") || t.includes("debt")) lessonImage = lessonImages.credit;
 if (t.includes("career")) lessonImage = lessonImages.career;

 const hasLessonContent = hasSubstantialContent(lesson.content);

 return (
 <>
 <style>{`
 @keyframes spin{to{transform:rotate(360deg)}}
 .lesson-prose h1{font-size:26px;font-weight:800;margin-bottom:12px;color:${C.text}}
 .lesson-prose h2{font-size:21px;font-weight:800;margin:24px 0 10px;color:${C.text}}
 .lesson-prose h3{font-size:17px;font-weight:700;margin:18px 0 8px;color:${C.text}}
 .lesson-prose p{font-size:16px;line-height:1.75;color:${C.textSub};margin-bottom:14px}
 .lesson-prose ul,.lesson-prose ol{padding-left:22px;margin-bottom:14px}
 .lesson-prose li{font-size:15px;line-height:1.7;color:${C.textSub};margin-bottom:6px}
 .lesson-prose strong{color:${C.text};font-weight:700}
 .lesson-prose code{background:${C.bgMid};padding:2px 6px;border-radius:4px;font-size:13px}
 .lesson-prose blockquote{border-left:4px solid ${C.navy};padding:12px 16px;background:${C.accentSoft};border-radius:0 8px 8px 0;margin:16px 0}
 `}</style>

 {showLevelUp && newLevel && <LevelUpModal level={newLevel} onClose={() => setShowLevelUp(false)} />}
 {completedChallenge && <ChallengeCompleteModal challenge={completedChallenge} onClose={clearCompletedChallenge} />}

 <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
 <div style={{ maxWidth:800, margin:"0 auto", display:"flex", flexDirection:"column", gap:16 }}>

 {/* Header row */}
 <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
 <button
 onClick={() => navigate(createPageUrl(`CourseDetail?id=${lesson.course_id}`))}
 style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer" }}
 >
 <ArrowLeft size={16} />
 Back to Course
 </button>
 <div style={{ display:"flex", alignItems:"center", gap:10 }}>
 <span style={{ fontSize:12, fontWeight:700, color:C.accent, background:C.accentSoft, padding:"4px 12px", borderRadius:999 }}>
 Lesson {Math.max(currentIndex, 0) + 1} of {allLessons.length || 1}
 </span>
 {progress?.completed && (
 <span style={{ fontSize:12, fontWeight:700, color:C.green, background:C.greenSoft, padding:"4px 12px", borderRadius:999, display:"inline-flex", alignItems:"center", gap:4 }}>
 <CheckCircle size={12} />Completed
 </span>
 )}
 </div>
 </div>

 {/* Course Progress Bar */}
 <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:16, padding:"16px 24px", color:"#fff", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16 }}>
 <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:600 }}>
 <Target size={16} />{course.name}
 </div>
 <div style={{ display:"flex", alignItems:"center", gap:8, fontSize:14, fontWeight:700 }}>
 <Trophy size={16} />{Math.round(progressPercent)}%
 </div>
 </div>

 {/* Lesson Content / Quiz */}
 {!showQuiz ? (
 <div style={{ borderRadius:20, border:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(0,0,0,0.05)", background:C.bg, overflow:"hidden" }}>
 {currentSection === 0 && (
 <div style={{ height:220, overflow:"hidden", position:"relative" }}>
 <img src={lessonImage} alt={lesson.title} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
 <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(0,0,0,0.65),transparent)" }} />
 <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:24, color:"#fff" }}>
 <span style={{ display:"inline-block", fontSize:11, fontWeight:700, background:"rgba(255,255,255,0.2)", backdropFilter:"blur(4px)", padding:"3px 10px", borderRadius:999, marginBottom:8, border:"1px solid rgba(255,255,255,0.3)" }}>
 {course.category}
 </span>
 <h1 style={{ fontSize:26, fontWeight:900, margin:0, letterSpacing:"-0.5px" }}>{lesson.title}</h1>
 </div>
 </div>
 )}

 <div style={{ padding:"32px 40px" }}>
 {currentSection === 0 && (
 <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:32, paddingBottom:24, borderBottom:`1px solid ${C.border}`, flexWrap:"wrap", gap:16 }}>
 {[
 [Clock, `${lesson.duration_minutes} minutes`, C.textSub],
 [Zap, `${lesson.xp_reward} XP`, C.amber],
 [Star, "Quiz Required", C.accent],
 ].map(([Icon, text, color]) => (
 <div key={text} style={{ display:"flex", alignItems:"center", gap:6, fontSize:14, fontWeight:600, color }}>
 <Icon size={16} />{text}
 </div>
 ))}
 </div>
 )}

 {!hasLessonContent ? (
 <div style={{ textAlign:"center", padding:"48px 0" }}>
 <AlertCircle size={56} color={C.amber} style={{ margin:"0 auto 16px" }} />
 <h3 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:10 }}>Incomplete Lesson Content</h3>
 <p style={{ color:C.textSub, marginBottom:8, maxWidth:400, margin:"0 auto 8px" }}>This lesson doesn't have proper content yet. The content field only contains:</p>
 <div style={{ background:C.bgMid, padding:16, borderRadius:12, maxWidth:400, margin:"0 auto 16px" }}>
 <p style={{ fontSize:13, color:C.textSub, fontStyle:"italic", margin:0 }}>"{lesson.content}"</p>
 </div>
 <p style={{ fontSize:13, color:C.textMuted, maxWidth:400, margin:"0 auto 24px" }}>
 Lessons need structured markdown content with ## headers.
 </p>
 <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
 <button onClick={() => navigate(createPageUrl(`CourseDetail?id=${lesson.course_id}`))} style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"10px 20px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontWeight:600, cursor:"pointer", fontSize:14 }}>
 <ArrowLeft size={14} />Back to Course
 </button>
 <button onClick={() => navigate(createPageUrl("Learn"))} style={{ padding:"10px 20px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer", fontSize:14 }}>
 Browse All Courses
 </button>
 </div>
 </div>
 ) : (
 <>
 {/* Section Progress */}
 <div style={{ marginBottom:24 }}>
 <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, fontWeight:600, marginBottom:8 }}>
 <span style={{ color:C.textSub }}>Section {currentSection + 1} of {totalSections}</span>
 <span style={{ color:C.accent }}>{Math.round(((currentSection + 1) / totalSections) * 100)}%</span>
 </div>
 <div style={{ height:6, borderRadius:999, background:C.bgMid, overflow:"hidden" }}>
 <div style={{ height:"100%", width:`${((currentSection + 1) / totalSections) * 100}%`, borderRadius:999, background:C.accent, transition:"width 0.3s" }} />
 </div>
 </div>

 {/* Content */}
 <div className="lesson-prose" style={{ marginBottom:32 }}>
 <ReactMarkdown>{contentSections[currentSection]}</ReactMarkdown>
 </div>

 {/* Nav Buttons */}
 <div style={{ display:"flex", justifyContent:"space-between", gap:12, paddingTop:24, borderTop:`1px solid ${C.border}` }}>
 {currentSection > 0 && (
 <button
 onClick={() => { setCurrentSection(currentSection - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontWeight:600, fontSize:14, cursor:"pointer" }}
 >
 <ArrowLeft size={16} />Previous
 </button>
 )}
 {currentSection < totalSections - 1 ? (
 <button
 onClick={() => { setCurrentSection(currentSection + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
 style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}
 >
 Continue<ArrowRight size={16} />
 </button>
 ) : (
 <button
 onClick={() => {
 if (!lesson.quiz_questions || lesson.quiz_questions.length === 0) { toast.error("This lesson is missing a quiz."); return; }
 setShowQuiz(true);
 window.scrollTo({ top: 0, behavior: "smooth" });
 }}
 style={{ marginLeft:"auto", display:"inline-flex", alignItems:"center", gap:8, padding:"12px 28px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:14, cursor:"pointer", boxShadow:`0 4px 16px ${C.navyGlow}` }}
 >
 <Sparkles size={16} />Take Quiz
 </button>
 )}
 </div>
 </>
 )}
 </div>
 </div>
 ) : (
 <div style={{ borderRadius:20, border:`1px solid ${C.border}`, boxShadow:"0 2px 16px rgba(0,0,0,0.05)", background:C.bg, overflow:"hidden" }}>
 {/* Quiz Header */}
 <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, padding:"32px 40px", color:"#fff" }}>
 <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
 <div>
 <h2 style={{ fontSize:26, fontWeight:900, margin:"0 0 6px", display:"flex", alignItems:"center", gap:10 }}>
 <Sparkles size={26} />Knowledge Challenge
 </h2>
 <p style={{ opacity:0.85, margin:0, fontSize:14 }}>You must score 100% to advance!</p>
 </div>
 <div style={{ textAlign:"center", background:"rgba(255,255,255,0.15)", backdropFilter:"blur(4px)", borderRadius:16, padding:"12px 20px" }}>
 <Trophy size={28} style={{ margin:"0 auto 4px" }} />
 <p style={{ fontSize:20, fontWeight:900, margin:0 }}>{lesson.xp_reward} XP</p>
 </div>
 </div>
 </div>

 <div style={{ padding:"28px 40px", display:"flex", flexDirection:"column", gap:20 }}>
 {(lesson.quiz_questions || []).map((question, qIndex) => (
 <div key={qIndex} style={{ borderRadius:16, border:`2px solid ${C.border}`, overflow:"hidden" }}>
 <div style={{ background:C.bgSoft, borderBottom:`1px solid ${C.border}`, padding:"16px 20px", display:"flex", alignItems:"flex-start", gap:16 }}>
 <div style={{ width:44, height:44, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff", fontWeight:800, fontSize:16 }}>
 {qIndex + 1}
 </div>
 <p style={{ fontWeight:700, fontSize:17, color:C.text, margin:0, paddingTop:8 }}>{question.question}</p>
 </div>
 <div style={{ padding:"16px 20px", display:"flex", flexDirection:"column", gap:10 }}>
 {(question.options || []).map((option, oIndex) => {
 const isSelected = quizAnswers[qIndex] === oIndex;
 const isCorrect = question.correct_answer === oIndex;
 const showResult = quizSubmitted;
 let bg = C.bg; let border2 = C.borderMid; let color = C.text;
 if (showResult) {
 if (isCorrect) { bg = C.green; border2 = C.green; color = "#fff"; }
 else if (isSelected) { bg = C.red; border2 = C.red; color = "#fff"; }
 else { bg = C.bgMid; border2 = C.border; color = C.textMuted; }
 } else if (isSelected) {
 bg = C.navy; border2 = C.navy; color = "#fff";
 }
 return (
 <button
 key={oIndex}
 onClick={() => { if (!quizSubmitted) setQuizAnswers({ ...quizAnswers, [qIndex]: oIndex }); }}
 disabled={quizSubmitted}
 style={{ width:"100%", padding:"14px 18px", borderRadius:12, textAlign:"left", fontWeight:600, fontSize:15, background:bg, border:`2px solid ${border2}`, color, cursor:quizSubmitted ? "default" : "pointer", transition:"all 0.15s" }}
 >
 {option}
 </button>
 );
 })}
 </div>
 </div>
 ))}

 {!quizSubmitted ? (
 <button
 onClick={handleQuizSubmit}
 disabled={Object.keys(quizAnswers).length !== (lesson.quiz_questions || []).length}
 style={{ width:"100%", padding:"16px 0", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:800, fontSize:16, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, boxShadow:`0 4px 20px ${C.navyGlow}`, opacity:Object.keys(quizAnswers).length !== (lesson.quiz_questions || []).length ? 0.5 : 1 }}
 >
 <Trophy size={20} />Submit Answers
 </button>
 ) : (
 <div style={{ borderRadius:20, padding:"40px 32px", textAlign:"center", background:score === 100 ? `linear-gradient(135deg,${C.navy},${C.navyLight})` : `linear-gradient(135deg,#C0392B,#E74C3C)`, color:"#fff" }}>
 <h3 style={{ fontSize:32, fontWeight:900, margin:"0 0 8px" }}>{score === 100 ? "Perfect!" : "Try again"}</h3>
 <p style={{ fontSize:56, fontWeight:900, margin:"0 0 20px" }}>{score}%</p>
 {score === 100 ? (
 <button onClick={handleNext} style={{ padding:"14px 36px", borderRadius:999, background:"#fff", color:C.navy, border:"none", fontWeight:800, fontSize:16, cursor:"pointer" }}>
 Next <ArrowRight size={16} style={{ display:"inline", marginLeft:6 }} />
 </button>
 ) : (
 <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
 <button
 onClick={() => { setShowQuiz(false); setCurrentSection(0); window.scrollTo(0, 0); }}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.5)", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:14 }}
 >
 <BookOpen size={16} />Review Lesson
 </button>
 <button
 onClick={handleRetakeQuiz}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background:"#fff", color:"#C0392B", border:"none", fontWeight:700, cursor:"pointer", fontSize:14 }}
 >
 <TrendingUp size={16} />Retake Quiz
 </button>
 </div>
 )}
 </div>
 )}
 </div>
 </div>
 )}

 </div>
 </div>
 </>
 );
}
