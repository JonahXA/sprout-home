import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { createPageUrl } from "@/utils";
import BudgetWalkthrough from "@/components/BudgetWalkthrough";
import ScenarioBudgetSimulation from "@/components/ScenarioBudgetSimulation";
import { trackEvent, trackSimulationStart, trackSimulationComplete } from "@/lib/activityTracker";

// NOTE: Base44 removed in migration pass.
// TODO (later phase): replace these stubs with your real API/client layer.
const getLocalUser = () => {
 try {
 const raw = localStorage.getItem("sprout_user");
 return raw ? JSON.parse(raw) : null;
 } catch {
 return null;
 }
};

// Minimal stub “data layer” so the page renders without Base44.
// Replace with fetch calls later (e.g., /api/lessons, /api/progress, etc.).
const data = {
 async listLessons() {
 return [];
 },
 async listUserProgress(/* userEmail, courseId */) {
 return [];
 },
 async upsertUserProgress(/* payload */) {
 return;
 },
 async updateUserXP(/* payload */) {
 return;
 }
};

export default function BudgetSimulation() {
 const { lessonNumber } = useParams();
 const navigate = useNavigate();
 const queryClient = useQueryClient();
 const [user, setUser] = useState(null);

 useEffect(() => {
 const currentUser = getLocalUser();
 if (!currentUser) {
 navigate(createPageUrl("Login"));
 return;
 }
 setUser(currentUser);
 trackSimulationStart("budget-simulation", "Budget Simulation").catch(() => {});
 }, [navigate]);

 const lessonNum = parseInt(lessonNumber, 10) || 0;

 const { data: lessons = [] } = useQuery({
 queryKey: ["budget-lessons"],
 queryFn: async () => {
 const allLessons = await data.listLessons();
 return allLessons
 .filter(
 (l) =>
 l.course_id === "6972392c60eb785db714b719" &&
 !l.is_deleted
 )
 .sort((a, b) => (a.order || 0) - (b.order || 0));
 },
 enabled: !!user
 });

 const { data: progress = [] } = useQuery({
 queryKey: ["budget-progress", user?.email],
 queryFn: async () => {
 if (!user?.email) return [];
 return data.listUserProgress(user.email, "6972392c60eb785db714b719");
 },
 enabled: !!user
 });

 const completeMutation = useMutation({
 mutationFn: async () => {
 const lesson = lessons[lessonNum];
 if (!lesson || !user?.email) return;

 // In Base44 version, this upserted progress + added XP.
 // In this migration pass, we keep the call sites but use stubs.
 await data.upsertUserProgress({
 user_email: user.email,
 lesson_id: lesson.id,
 course_id: lesson.course_id,
 completed: true,
 completed_date: new Date().toISOString(),
 quiz_score: 100,
 time_spent_minutes: lesson.duration_minutes || 20
 });

 await data.updateUserXP({
 email: user.email,
 // you can decide how XP is stored later
 xp_delta: lesson.xp_reward || 150
 });
 },
 onSuccess: () => {
 queryClient.invalidateQueries({ queryKey: ["budget-progress"] });
 queryClient.invalidateQueries({ queryKey: ["userProgress"] });
 navigate(createPageUrl("CourseDetail") + "?id=6972392c60eb785db714b719");
 }
 });

 if (!user) {
 return (
 <div className="flex items-center justify-center min-h-screen">
 <div className="w-12 h-12 border-4 border-[#2D9B6F] border-t-transparent rounded-full animate-spin"></div>
 </div>
 );
 }

 const currentLesson = lessons[lessonNum];

 const C = { navy:"#1B2B5E", navyMid:"#141E43", navyGlow:"rgba(27,43,94,0.12)", border:"#E5E7EB", borderMid:"#D1D5DB", bg:"#FFFFFF", text:"#0F172A", textSub:"#475569" };

 return (
 <div style={{ fontFamily:"'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif" }}>
 <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');`}</style>
 <div style={{ marginBottom:24 }}>
 <button
 onClick={() => navigate(createPageUrl("CourseDetail") + "?id=6972392c60eb785db714b719")}
 style={{ display:"inline-flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:999, border:`1px solid ${C.border}`, background:C.bg, color:C.text, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.15s ease" }}
 onMouseEnter={(e) => { e.currentTarget.style.borderColor = C.borderMid; e.currentTarget.style.boxShadow = `0 4px 12px ${C.navyGlow}`; }}
 onMouseLeave={(e) => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.boxShadow = "none"; }}
 >&#8592; Back to Course</button>
 </div>

 <div style={{ background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, boxShadow:"0 2px 12px rgba(0,0,0,0.05)", padding:"36px 40px" }}>
 {lessonNum === 0 ? (
 <>
 <h1 style={{ fontSize:28, fontWeight:900, color:C.text, margin:"0 0 8px", letterSpacing:"-0.7px", lineHeight:1.15 }}>
 {currentLesson?.title || "Build Your First Budget"}
 </h1>
 <p style={{ fontSize:14, color:C.textSub, margin:"0 0 32px", fontWeight:500, lineHeight:1.6 }}>
 Learn budgeting fundamentals with an interactive walkthrough
 </p>
 <BudgetWalkthrough />
 <div style={{ marginTop:24, display:"flex", justifyContent:"flex-end" }}>
 <button
 onClick={() => completeMutation.mutate()}
 style={{ padding:"11px 28px", borderRadius:999, background:C.navy, color:"#fff", fontSize:14, fontWeight:700, border:"none", cursor:"pointer", transition:"all 0.15s ease" }}
 onMouseEnter={(e) => { e.currentTarget.style.background = C.navyMid; e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 20px ${C.navyGlow}`; }}
 onMouseLeave={(e) => { e.currentTarget.style.background = C.navy; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
 >Complete Lesson</button>
 </div>
 </>
 ) : (
 <>
 <h1 style={{ fontSize:28, fontWeight:900, color:C.text, margin:"0 0 8px", letterSpacing:"-0.7px", lineHeight:1.15 }}>
 {currentLesson?.title || `Budget ${lessonNum}`}
 </h1>
 <p style={{ fontSize:14, color:C.textSub, margin:"0 0 32px", fontWeight:500, lineHeight:1.6 }}>
 {currentLesson?.content || "Interactive budget challenge"}
 </p>
 <ScenarioBudgetSimulation
 scenarioId={lessonNum - 1}
 onComplete={() => completeMutation.mutate()}
 />
 </>
 )}
 </div>
 </div>
 );
}
