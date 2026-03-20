// src/pages/AILiteracy.jsx
import React, { useState, useEffect } from "react";
import { getCurrentUserSafe, getAllAIDayProgressForUser } from "@/lib/appClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Lock, CheckCircle, Brain, ChevronRight, Trophy, Calendar, Clock, Zap, Target, BookOpen, LogIn } from "lucide-react";

const C = {
 navy:"#1B2B5E", navyMid:"#141E43", navyLight:"#243570", navyGlow:"rgba(27,43,94,0.12)",
 accent:"#3B82F6", accentSoft:"#E8F0FE",
 green:"#2D9B6F", greenSoft:"#E8F8F0",
 amber:"#F59E0B", amberSoft:"#FFF3E0",
 bg:"#FFFFFF", bgSoft:"#F8FAFC", bgMid:"#F1F5F9",
 border:"#E5E7EB",
 text:"#0F172A", textSub:"#475569", textMuted:"#94A3B8",
};

export default function AILiteracy() {
 const navigate = useNavigate();
 const [user, setUser] = useState(null);
 const [isLoadingUser, setIsLoadingUser] = useState(true);

 useEffect(() => {
 const loadUser = async () => {
 try {
 const currentUser = await getCurrentUserSafe();
 setUser(currentUser ?? { id: "guest", email: "guest@example.com", full_name: "Guest User", isGuest: true });
 } catch (error) {
 console.error("Error loading user:", error);
 setUser({ id: "guest", email: "guest@example.com", full_name: "Guest User", isGuest: true });
 } finally {
 setIsLoadingUser(false);
 }
 };
 loadUser();
 }, []);

 const { data: dayProgress = [] } = useQuery({
 queryKey: ['aiDayProgress', user?.email],
 queryFn: () => getAllAIDayProgressForUser(user.email),
 enabled: !!user && !user.isGuest
 });

 const days = [
 { number: 1, title: "What is AI and Why AI Literacy Matters", icon: Brain },
 { number: 2, title: "How Machines Learn: Data, Training, and Models", icon: Target },
 { number: 3, title: "AI in the Real World", icon: BookOpen },
 { number: 4, title: "Generative AI and Hallucinations", icon: Zap },
 { number: 5, title: "Using AI Effectively", icon: Target },
 { number: 6, title: "Ethics: Bias, Privacy, Deepfakes", icon: Brain },
 { number: 7, title: "AI and Society", icon: BookOpen },
 { number: 8, title: "Practical AI Skills Lab", icon: Zap },
 { number: 9, title: "Capstone + Review", icon: Trophy },
 { number: 10, title: "Final Exam + Certification", icon: Trophy },
 ];

 const getDayStatus = (dayNumber) => {
 if (!user || user.isGuest) return 'available';
 const progress = dayProgress.find(p => p.day_number === dayNumber);
 if (progress?.completed) return 'completed';
 if (dayNumber === 1) return 'available';
 const previousDay = dayProgress.find(p => p.day_number === dayNumber - 1);
 if (previousDay?.completed) return 'available';
 return 'locked';
 };

 const completedDays = dayProgress.filter(p => p.completed).length;
 const progressPercent = (completedDays / 10) * 100;

 if (isLoadingUser) {
 return (
 <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg }}>
 <div style={{ textAlign:"center" }}>
 <div style={{ width:64, height:64, border:`4px solid ${C.border}`, borderTopColor:C.navy, borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }} />
 <p style={{ color:C.textSub }}>Loading AI Literacy Course...</p>
 </div>
 </div>
 );
 }

 return (
 <>
 <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
 <div style={{ minHeight:"100vh", background:C.bg, padding:"32px 16px", fontFamily:"'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif" }}>
 <div style={{ maxWidth:1000, margin:"0 auto", display:"flex", flexDirection:"column", gap:24 }}>

 {/* Header */}
 <div style={{ textAlign:"center", display:"flex", flexDirection:"column", alignItems:"center", gap:12 }}>
 <div style={{ display:"inline-flex", padding:16, background:C.navy, borderRadius:20, boxShadow:`0 8px 24px ${C.navyGlow}`, marginBottom:8 }}>
 <Brain size={48} color="#fff" />
 </div>
 <h1 style={{ fontSize:38, fontWeight:900, color:C.text, letterSpacing:"-1px", margin:0 }}>AI Literacy Course</h1>
 <p style={{ fontSize:16, color:C.textSub, maxWidth:500, margin:0 }}>
 A comprehensive 2-week program teaching you to understand, use, and critically evaluate AI
 </p>
 </div>

 {/* Guest Notice */}
 {user.isGuest && (
 <div style={{ borderRadius:16, border:`1px solid ${C.border}`, padding:"20px 24px", background:C.bgSoft, display:"flex", alignItems:"flex-start", gap:16 }}>
 <div style={{ padding:10, background:C.accentSoft, borderRadius:10, flexShrink:0 }}>
 <LogIn size={22} color={C.navy} />
 </div>
 <div style={{ flex:1 }}>
 <h3 style={{ fontWeight:700, color:C.text, margin:"0 0 4px", fontSize:15 }}>You're viewing as a guest</h3>
 <p style={{ fontSize:13, color:C.textSub, margin:"0 0 14px" }}>
 All lessons are available to view, but progress won't be saved. Log in to track your completion and earn XP!
 </p>
 <button
 onClick={() => navigate(createPageUrl("Login"))}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"9px 20px", borderRadius:999, background:C.navy, color:"#fff", border:"none", fontWeight:700, fontSize:13, cursor:"pointer" }}
 >
 <LogIn size={14} />Log In to Save Progress
 </button>
 </div>
 </div>
 )}

 {/* Progress Overview */}
 {!user.isGuest && (
 <div style={{ borderRadius:16, border:`1px solid ${C.border}`, boxShadow:"0 1px 4px rgba(0,0,0,0.05)", background:C.bg, padding:"20px 24px" }}>
 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
 <div style={{ display:"flex", alignItems:"center", gap:8, fontWeight:700, color:C.text }}>
 <Calendar size={18} color={C.accent} />Your Progress
 </div>
 <span style={{ fontSize:24, fontWeight:900, color:C.accent }}>{Math.round(progressPercent)}%</span>
 </div>
 <div style={{ height:10, borderRadius:999, background:C.bgMid, overflow:"hidden", marginBottom:16 }}>
 <div style={{ height:"100%", width:`${progressPercent}%`, borderRadius:999, background:C.accent, transition:"width 0.4s" }} />
 </div>
 <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:12 }}>
 {[
 [completedDays, "Days Completed", C.navy, C.accentSoft],
 [10 - completedDays, "Days Remaining", C.textSub, C.bgMid],
 [10, "Hours Total", C.green, C.greenSoft],
 [1000, "XP Available", C.amber, C.amberSoft],
 ].map(([val, label, color, bg]) => (
 <div key={label} style={{ textAlign:"center", padding:"12px 8px", borderRadius:12, background:bg }}>
 <div style={{ fontSize:22, fontWeight:900, color }}>{val}</div>
 <div style={{ fontSize:12, color:C.textSub, marginTop:2 }}>{label}</div>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* Course Days */}
 <div>
 <h2 style={{ fontSize:20, fontWeight:800, color:C.text, margin:"0 0 14px" }}>Course Days</h2>
 <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
 {days.map((day) => {
 const status = getDayStatus(day.number);
 const Icon = day.icon;
 const isLocked = status === 'locked';
 const isCompleted = status === 'completed';

 return (
 <div
 key={day.number}
 onClick={() => !isLocked && navigate(createPageUrl(`AIDay${day.number}`))}
 style={{
 borderRadius:16, border:`1px solid ${C.border}`, padding:"18px 20px",
 background:isLocked ? C.bgSoft : C.bg,
 opacity:isLocked ? 0.65 : 1,
 cursor:isLocked ? "not-allowed" : "pointer",
 display:"flex", alignItems:"center", gap:16,
 transition:"all 0.2s",
 boxShadow:"0 1px 4px rgba(0,0,0,0.04)",
 }}
 onMouseEnter={e => { if(!isLocked) { e.currentTarget.style.boxShadow = `0 6px 24px ${C.navyGlow}`; e.currentTarget.style.transform = "translateY(-2px)"; } }}
 onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "translateY(0)"; }}
 >
 {/* Circle */}
 <div style={{ width:56, height:56, borderRadius:"50%", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", background:isCompleted ? C.green : isLocked ? C.bgMid : C.navy }}>
 {isCompleted ? <CheckCircle size={26} color="#fff" /> : isLocked ? <Lock size={22} color={C.textMuted} /> : <span style={{ fontSize:20, fontWeight:800, color:"#fff" }}>{day.number}</span>}
 </div>

 {/* Content */}
 <div style={{ flex:1 }}>
 <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
 <span style={{ fontWeight:800, color:C.text, fontSize:16 }}>Day {day.number}</span>
 {isCompleted && <span style={{ fontSize:11, fontWeight:700, color:C.green, background:C.greenSoft, padding:"2px 10px", borderRadius:999 }}>Completed</span>}
 {isLocked && <span style={{ fontSize:11, fontWeight:600, color:C.textMuted, background:C.bgMid, padding:"2px 10px", borderRadius:999, border:`1px solid ${C.border}` }}>Locked</span>}
 </div>
 <p style={{ fontSize:14, color:C.textSub, margin:"0 0 8px" }}>{day.title}</p>
 <div style={{ display:"flex", alignItems:"center", gap:16, fontSize:12, color:C.textMuted }}>
 <span style={{ display:"flex", alignItems:"center", gap:4 }}><Clock size={12} />60 min</span>
 <span style={{ display:"flex", alignItems:"center", gap:4 }}><Zap size={12} color={C.amber} />100 XP</span>
 </div>
 </div>

 {!isLocked && <ChevronRight size={20} color={C.textMuted} />}
 </div>
 );
 })}
 </div>
 </div>

 {/* Completion CTA */}
 {!user.isGuest && completedDays === 10 && (
 <div style={{ background:`linear-gradient(135deg,${C.navy},${C.navyLight})`, borderRadius:20, padding:"40px 32px", textAlign:"center", color:"#fff", boxShadow:`0 12px 48px ${C.navyGlow}` }}>
 <Trophy size={56} style={{ margin:"0 auto 16px" }} />
 <h2 style={{ fontSize:28, fontWeight:900, margin:"0 0 8px" }}>Congratulations!</h2>
 <p style={{ fontSize:16, opacity:0.85, margin:"0 0 24px" }}>
 You've completed all 10 days. Take the final exam to earn your certificate!
 </p>
 <button
 onClick={() => navigate(createPageUrl("AIDay10"))}
 style={{ display:"inline-flex", alignItems:"center", gap:8, padding:"14px 32px", borderRadius:999, background:"#fff", color:C.navy, border:"none", fontWeight:800, fontSize:15, cursor:"pointer" }}
 >
 Take Final Exam
 </button>
 </div>
 )}

 </div>
 </div>
 </>
 );
}
