import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/config/routes";
import PaycheckLesson1 from "@/features/finance/PaycheckLesson1";
import PaycheckLesson2 from "@/features/finance/PaycheckLesson2";
import { trackSimulationStart, trackSimulationComplete } from "@/services/activity";

/**
 * NOTE: Base44 removed.
 * This simulation now:
 * - Reads user from localStorage (sprout_user)
 * - Writes completion to sprout_user_progress
 * - Adds XP to user.xp_points
 */

const lessonComponents = {
 1: PaycheckLesson1,
 2: PaycheckLesson2,
 3: PaycheckLesson1,
 4: PaycheckLesson1,
};

const lessonTitles = {
 1: "Your First Paycheck",
 2: "College Student Job",
 3: "First Salary Job",
 4: "Mid-Career Paycheck",
};

const COURSE_ID = "6943400844fa0b0b1fa81a56"; // keep as-is if your routes depend on it

const safeParse = (raw, fallback) => {
 try {
 return raw ? JSON.parse(raw) : fallback;
 } catch {
 return fallback;
 }
};

const getUser = () => safeParse(localStorage.getItem("sprout_user"), null);
const setUser = (u) => localStorage.setItem("sprout_user", JSON.stringify(u));

const getProgress = () => safeParse(localStorage.getItem("sprout_user_progress"), []);
const setProgress = (p) => localStorage.setItem("sprout_user_progress", JSON.stringify(p));

export default function PaycheckSimulation() {
 const { lessonNumber } = useParams();
 const navigate = useNavigate();

 const [user, setUserState] = useState(null);

 useEffect(() => {
 const currentUser = getUser();
 setUserState(currentUser); // null = guest, allowed
 if (currentUser) {
 trackSimulationStart("paycheck-simulation", "Paycheck Simulation").catch(() => {});
 }
 }, []);

 const lessonNum = useMemo(() => parseInt(lessonNumber, 10) || 1, [lessonNumber]);
 const LessonComponent = lessonComponents[lessonNum] || PaycheckLesson1;

 const handleComplete = () => {
 if (!user) return;

 const now = new Date().toISOString();
 const title = `Paycheck ${lessonNum}: ${lessonTitles[lessonNum]}`;

 // Mark progress complete locally
 const all = getProgress();
 const existingIdx = all.findIndex(
 (p) => p.user_email === user.email && p.course_id === COURSE_ID && p.lesson_title === title
 );

 const record = {
 id: existingIdx >= 0 ? all[existingIdx].id : (crypto?.randomUUID?.() || `pp_${Date.now()}`),
 user_email: user.email,
 course_id: COURSE_ID,
 lesson_title: title,
 completed: true,
 completed_date: now,
 quiz_score: 100,
 time_spent_minutes: 15,
 };

 if (existingIdx >= 0) all[existingIdx] = { ...all[existingIdx], ...record };
 else all.push(record);

 setProgress(all);

 // XP reward (fallback if you don’t have the lessons list here)
 const xpReward = 100;

 const updatedUser = {
 ...user,
 xp_points: (user.xp_points || 0) + xpReward,
 total_lessons_completed: (user.total_lessons_completed || 0) + 1,
 level: Math.floor(((user.xp_points || 0) + xpReward) / 100) + 1,
 };

 setUser(updatedUser);
 setUserState(updatedUser);
 trackSimulationComplete("paycheck-simulation", "Paycheck Simulation", { lesson_number: lessonNum, lesson_title: lessonTitles[lessonNum], xp_earned: xpReward }).catch(() => {});
 navigate(createPageUrl("CourseDetail") + `?id=${COURSE_ID}`);
 };

 const C = { navy:"#1B2B5E", navyMid:"#141E43", navyGlow:"rgba(27,43,94,0.12)", border:"#E5E7EB", borderMid:"#D1D5DB", bg:"#FFFFFF", text:"#0F172A", textSub:"#475569" };

 return (
 <div style={{ fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif" }}>
 <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
 <div style={{ marginBottom:24 }}>
 <button
 onClick={() => navigate(createPageUrl("CourseDetail") + `?id=${COURSE_ID}`)}
 style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s ease" }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.boxShadow = `0 4px 12px ${C.navyGlow}`; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
 >&#8592; Back to Course</button>
 </div>

 <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", padding:"36px 40px" }}>
 <h1 style={{ fontSize:28, fontWeight:900, color:C.text, margin:"0 0 8px", letterSpacing:"-0.7px", lineHeight:1.15 }}>
 Paycheck {lessonNum}: {lessonTitles[lessonNum]}
 </h1>
 <p style={{ fontSize:14, color:C.textSub, margin:"0 0 32px", fontWeight:500, lineHeight:1.6 }}>Interactive paycheck breakdown</p>

 <LessonComponent
 userName={user?.full_name || "Student"}
 onComplete={handleComplete}
 />
 </div>
 </div>
 );
}
