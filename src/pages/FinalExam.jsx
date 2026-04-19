import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import {
 Trophy, Sparkles, AlertCircle, CheckCircle, Zap,
 ArrowLeft, BookOpen, TrendingUp, Award
} from "lucide-react";
import { toast } from "sonner";
import CourseCertificate from "@/components/shared/CourseCertificate";

const C = {
 navy:"#1B2B5E", navyMid:"#141E43", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 red:"#EF4444", redSoft:"#FEF2F2",
 amber:"#F59E0B", amberSoft:"#FFF3E0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB", borderMid:"#D1D5DB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

const getLocalUser = () => {
 try {
 const raw = localStorage.getItem("sprout_user");
 return raw ? JSON.parse(raw) : null;
 } catch { return null; }
};

const data = {
 async listCourses() { return []; },
 async listLessons() { return []; },
 async listUserProgress() { return []; },
 async getCourseCompletion() { return null; },
 async upsertCourseCompletion() { return; },
 async updateUserXP() { return; }
};

export default function FinalExam() {
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [user, setUser] = useState(null);
 const [examAnswers, setExamAnswers] = useState({});
 const [examSubmitted, setExamSubmitted] = useState(false);
 const [score, setScore] = useState(0);
 const [showCertificate, setShowCertificate] = useState(false);

 const urlParams = new URLSearchParams(window.location.search);
 const courseId = urlParams.get("courseId");

 useEffect(() => {
 setUser(getLocalUser()); // null = guest, allowed
 }, []);

 const { data: course } = useQuery({
 queryKey: ["course", courseId],
 queryFn: async () => {
 const courses = await data.listCourses();
 return courses.find((c) => c.id === courseId);
 },
 enabled: !!courseId,
 });

 const { data: lessons = [] } = useQuery({
 queryKey: ["lessons", courseId],
 queryFn: async () => {
 const allLessons = await data.listLessons(courseId);
 return allLessons.filter((l) => l.course_id === courseId).sort((a, b) => (a.order || 0) - (b.order || 0));
 },
 enabled: !!courseId,
 });

 const { data: userProgress = [] } = useQuery({
 queryKey: ["userProgress", user?.email, courseId],
 queryFn: async () => {
 if (!user?.email || !courseId) return [];
 return data.listUserProgress(user.email, courseId);
 },
 enabled: !!user && !!courseId,
 });

 const { data: courseCompletion } = useQuery({
 queryKey: ["courseCompletion", user?.email, courseId],
 queryFn: async () => {
 if (!user?.email || !courseId) return null;
 return data.getCourseCompletion(user.email, courseId);
 },
 enabled: !!user && !!courseId,
 });

 const completeMutation = useMutation({
 mutationFn: async ({ examScore }) => {
 if (!user?.email || !courseId) return;
 const now = new Date().toISOString();
 const finalExamXP = 500;
 await data.upsertCourseCompletion({ user_email: user.email, course_id: courseId, completed: true, completed_date: now, final_exam_score: examScore });
 await data.updateUserXP({ email: user.email, xp_delta: finalExamXP, courses_completed_delta: 1 });
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["courseCompletion"] });
 queryClient.invalidateQueries({ queryKey: ["user"] });
 toast.success("Course completed! +500 XP");
 setShowCertificate(true);
 },
 });

 const handleExamSubmit = () => {
 if (!course?.final_exam_questions) { toast.error("This course is missing a final exam. Please contact support."); return; }
 const totalQuestions = course.final_exam_questions.length;
 let correctAnswers = 0;
 course.final_exam_questions.forEach((q, index) => { if (examAnswers[index] === q.correct_answer) correctAnswers++; });
 const examScore = Math.round((correctAnswers / totalQuestions) * 100);
 setScore(examScore);
 setExamSubmitted(true);
 if (examScore === 100) completeMutation.mutate({ examScore });
 };

 const handleRetakeExam = () => {
 setExamAnswers({});
 setExamSubmitted(false);
 setScore(0);
 window.scrollTo({ top: 0, behavior: "smooth" });
 };

 const [loadingTimeout, setLoadingTimeout] = useState(false);
 useEffect(() => {
 const timer = setTimeout(() => { if (!course) setLoadingTimeout(true); }, 10000);
 return () => clearTimeout(timer);
 }, [course]);

 if (!course && loadingTimeout) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
 <div style={{ maxWidth:400, width:"100%", borderRadius:20, border:`1px solid ${C.border}`, padding:40, textAlign:"center", background:C.bg }}>
 <AlertCircle size={56} color={C.red} style={{ margin:"0 auto 16px" }} />
 <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8 }}>Having Trouble Loading</h2>
 <p style={{ color:C.textSub, marginBottom:24 }}>We're having trouble loading this exam. Please refresh or try again.</p>
 <div style={{ display:"flex", gap:10, justifyContent:"center" }}>
 <button onClick={() => window.location.reload()} style={{ padding:"10px 22px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>Retry</button>
 <button onClick={() => navigate(createPageUrl("Learn"))} style={{ padding:"10px 22px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontWeight:600, cursor:"pointer" }}>Back to Courses</button>
 </div>
 </div>
 </div>
 );
 }

 if (!course) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
 <div style={{ textAlign:"center" }}>
 <div style={{ width:64, height:64, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
 <p style={{ color:C.textSub }}>Loading exam...</p>
 </div>
 </div>
 );
 }

 const allLessonsCompleted =
 lessons.length > 0 &&
 lessons.every((lesson) => userProgress.some((p) => p.lesson_id === lesson.id && p.completed));

 if (lessons.length > 0 && !allLessonsCompleted) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
 <div style={{ maxWidth:400, width:"100%", borderRadius:20, border:`1px solid ${C.border}`, padding:40, textAlign:"center", background:C.bg }}>
 <AlertCircle size={56} color={C.amber} style={{ margin:"0 auto 16px" }} />
 <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8 }}>Not Ready Yet!</h2>
 <p style={{ color:C.textSub, marginBottom:24 }}>You must complete all lessons before taking the final exam.</p>
 <button onClick={() => navigate(createPageUrl(`CourseDetail?id=${courseId}`))} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>
 <ArrowLeft size={16} />Back to Course
 </button>
 </div>
 </div>
 );
 }

 if (showCertificate) {
 return <CourseCertificate course={course} user={user} completionDate={new Date().toISOString()} onContinue={() => navigate(createPageUrl("Learn"))} />;
 }

 if (!course.final_exam_questions || course.final_exam_questions.length === 0) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}>
 <div style={{ maxWidth:400, width:"100%", borderRadius:20, border:`1px solid ${C.border}`, padding:40, textAlign:"center", background:C.bg }}>
 <AlertCircle size={56} color={C.red} style={{ margin:"0 auto 16px" }} />
 <h2 style={{ fontSize:22, fontWeight:800, color:C.text, marginBottom:8 }}>Missing Exam</h2>
 <p style={{ color:C.textSub, marginBottom:24 }}>This course doesn't have a final exam configured yet.</p>
 <button onClick={() => navigate(createPageUrl(`CourseDetail?id=${courseId}`))} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"10px 24px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, cursor:"pointer" }}>
 <ArrowLeft size={16} />Back to Course
 </button>
 </div>
 </div>
 );
 }

 return (
 <>
 <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
 <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
 <div style={{ maxWidth:960, margin:"0 auto", display:"flex", flexDirection:"column", gap:20 }}>

 {/* Top bar */}
 <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
 <button
 onClick={() => navigate(createPageUrl(`CourseDetail?id=${courseId}`))}
 style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"8px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.textSub, fontSize:14, fontWeight:500, cursor:"pointer" }}
 >
 <ArrowLeft size={16} />Back to Course
 </button>
 <span style={{ fontSize:12, fontWeight:700, color:C.navy, background:C.accentSoft, padding:"4px 12px", borderRadius:999 }}>Final Exam</span>
 </div>

 {/* Hero */}
 <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight},#1a4080)`, borderRadius:20, padding:"40px 48px", color:"#fff", boxShadow:`0 12px 48px ${C.navyGlow}`, position:"relative", overflow:"hidden" }}>
 <div style={{ position:"absolute", top:0, right:0, opacity:0.08 }}>
 <Trophy size={220} />
 </div>
 <div style={{ position:"relative", zIndex:1 }}>
 <div style={{ display:"flex", alignItems:"center", gap:16, marginBottom:28 }}>
 <Award size={44} />
 <div>
 <h1 style={{ fontSize:38, fontWeight:900, letterSpacing:"-1px", margin:"0 0 4px" }}>Final Exam</h1>
 <p style={{ fontSize:16, opacity:0.85, margin:0 }}>{course.name}</p>
 </div>
 </div>
 <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:16 }}>
 {[
 [course.final_exam_questions.length, "Questions"],
 ["100%", "Required"],
 ["500 XP", "Reward"],
 ].map(([val, label]) => (
 <div key={label} style={{ textAlign:"center", background:"rgba(255,255,255,0.1)", backdropFilter:"blur(4px)", borderRadius:14, padding:"16px 0" }}>
 <p style={{ fontSize:28, fontWeight:900, margin:"0 0 4px" }}>{val}</p>
 <p style={{ fontSize:12, opacity:0.8, margin:0 }}>{label}</p>
 </div>
 ))}
 </div>
 </div>
 </div>

 {/* Instructions */}
 {!examSubmitted && (
 <div style={{ borderRadius:16, border:`1px solid ${C.accentSoft}`, background:C.accentSoft, padding:"20px 24px" }}>
 <h3 style={{ fontWeight:800, fontSize:15, color:C.text, margin:"0 0 12px" }}>Instructions</h3>
 <ul style={{ margin:0, padding:0, listStyle:"none", display:"flex", flexDirection:"column", gap:10 }}>
 {[
 "You must score 100% to complete the course",
 "You can retake the exam as many times as needed",
 "Review the lessons if you need a refresher",
 "Earn a certificate upon successful completion!",
 ].map((item) => (
 <li key={item} style={{ display:"flex", alignItems:"flex-start", gap:10, fontSize:14, color:C.textSub }}>
 <CheckCircle size={18} color={C.navy} style={{ flexShrink:0, marginTop:1 }} />
 <span dangerouslySetInnerHTML={{ __html: item.replace("100%", "<strong>100%</strong>") }} />
 </li>
 ))}
 </ul>
 </div>
 )}

 {/* Questions */}
 <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
 {course.final_exam_questions.map((question, qIndex) => (
 <div key={qIndex} style={{ borderRadius:16, border:`2px solid ${C.border}`, overflow:"hidden" }}>
 <div style={{ background:C.bgSoft, borderBottom:`1px solid ${C.border}`, padding:"18px 24px", display:"flex", alignItems:"flex-start", gap:16 }}>
 <div style={{ width:48, height:48, borderRadius:"50%", background:C.navy, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff", fontWeight:800, fontSize:18 }}>
 {qIndex + 1}
 </div>
 <p style={{ fontWeight:700, fontSize:18, color:C.text, margin:0, paddingTop:10 }}>{question.question}</p>
 </div>
 <div style={{ padding:"16px 24px", display:"flex", flexDirection:"column", gap:10 }}>
 {question.options.map((option, oIndex) => {
 const isSelected = examAnswers[qIndex] === oIndex;
 const isCorrect = question.correct_answer === oIndex;
 const showResult = examSubmitted;
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
 onClick={() => !examSubmitted && setExamAnswers({ ...examAnswers, [qIndex]: oIndex })}
 disabled={examSubmitted}
 style={{ width:"100%", padding:"14px 20px", borderRadius:12, textAlign:"left", fontWeight:600, fontSize:15, background:bg, border:`2px solid ${border2}`, color, cursor:examSubmitted ? "default" : "pointer", transition:"all 0.15s", display:"flex", alignItems:"center", justifyContent:"space-between" }}
 >
 <span>{option}</span>
 {showResult && isCorrect && <CheckCircle size={18} style={{ flexShrink:0 }} />}
 {showResult && isSelected && !isCorrect && <AlertCircle size={18} style={{ flexShrink:0 }} />}
 </button>
 );
 })}
 {examSubmitted && question.explanation && (
 <div style={{ marginTop:8, padding:"14px 18px", borderRadius:12, background:C.accentSoft, borderLeft:`4px solid ${C.accent}` }}>
 <p style={{ fontSize:13, color:C.textSub, margin:0, display:"flex", alignItems:"flex-start", gap:8 }}>
 <Sparkles size={15} color={C.accent} style={{ flexShrink:0, marginTop:1 }} />
 <span><strong style={{ color:C.text }}>Explanation:</strong> {question.explanation}</span>
 </p>
 </div>
 )}
 </div>
 </div>
 ))}
 </div>

 {/* Submit / Results */}
 {!examSubmitted ? (
 <div style={{ borderRadius:16, background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, padding:"20px 28px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:16, flexWrap:"wrap", position:"sticky", bottom:16 }}>
 <p style={{ color:"rgba(255,255,255,0.8)", margin:0, fontSize:14 }}>
 {Object.keys(examAnswers).length} of {course.final_exam_questions.length} questions answered
 </p>
 <button
 onClick={handleExamSubmit}
 disabled={Object.keys(examAnswers).length !== course.final_exam_questions.length}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:999, background:"#fff", color:C.navy, border:"none", fontWeight:800, fontSize:15, cursor:"pointer", opacity:Object.keys(examAnswers).length !== course.final_exam_questions.length ? 0.5 : 1 }}
 >
 <Trophy size={18} />Submit Final Exam
 </button>
 </div>
 ) : (
 <div style={{ borderRadius:20, padding:"48px 32px", textAlign:"center", background:score === 100 ? `linear-gradient(135deg,${C.navy},${C.navyLight})` : `linear-gradient(135deg,#C0392B,#E74C3C)`, color:"#fff" }}>
 {score === 100 ? (
 <>
 <Trophy size={80} style={{ margin:"0 auto 20px", animation:"bounce 1s ease infinite" }} />
 <h2 style={{ fontSize:44, fontWeight:900, margin:"0 0 8px" }}>Perfect Score!</h2>
 <p style={{ fontSize:56, fontWeight:900, margin:"0 0 16px" }}>{score}%</p>
 <p style={{ fontSize:20, opacity:0.9, marginBottom:28 }}>Congratulations! You've mastered this course!</p>
 <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontSize:24, fontWeight:800, marginBottom:32 }}>
 <Zap size={28} />+500 XP Earned!
 </div>
 <button onClick={() => setShowCertificate(true)} style={{ display:"inline-flex", alignItems:"center", gap:10, padding:"16px 40px", borderRadius:999, background:"#fff", color:C.navy, border:"none", fontWeight:800, fontSize:17, cursor:"pointer" }}>
 <Award size={20} />View Certificate
 </button>
 </>
 ) : (
 <>
 <AlertCircle size={80} style={{ margin:"0 auto 20px" }} />
 <h2 style={{ fontSize:40, fontWeight:900, margin:"0 0 8px" }}>Keep Trying!</h2>
 <p style={{ fontSize:56, fontWeight:900, margin:"0 0 16px" }}>{score}%</p>
 <p style={{ fontSize:18, opacity:0.9, marginBottom:32 }}>You need 100% to complete the course. Review the lessons and try again!</p>
 <div style={{ display:"flex", gap:12, justifyContent:"center", flexWrap:"wrap" }}>
 <button onClick={() => navigate(createPageUrl(`CourseDetail?id=${courseId}`))} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background:"rgba(255,255,255,0.2)", border:"2px solid rgba(255,255,255,0.5)", color:"#fff", fontWeight:700, cursor:"pointer", fontSize:14 }}>
 <BookOpen size={16} />Review Course
 </button>
 <button onClick={handleRetakeExam} style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"12px 24px", borderRadius:999, background:"#fff", color:"#C0392B", border:"none", fontWeight:700, cursor:"pointer", fontSize:14 }}>
 <TrendingUp size={16} />Retake Exam
 </button>
 </div>
 </>
 )}
 </div>
 )}

 </div>
 </div>
 </>
 );
}
