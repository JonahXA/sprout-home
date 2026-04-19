// src/pages/Landing.jsx
// Professional landing page with sprout-home navy design language.
// Always shown on first load — no auth redirect.
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/config/routes";
import {
 ArrowRight, BookOpen, TrendingUp, Shield,
 Zap, Star, BarChart2, Target, CheckCircle, Calculator,
 DollarSign, PiggyBank, CreditCard, Brain,
} from "lucide-react";
import logoImg from "../assets/logo.png";

// ─── Color tokens ─────────────────────────────────────────────
const navy = "#1B2B5E";
const navyMid = "#141E43";
const navyShadow = "rgba(27,43,94,0.22)";
const accentSoft = "#E8F0FE";
const accentBorder = "#BFDBFE";

// ─── Static data ──────────────────────────────────────────────

const FEATURES = [
 {
 icon: BookOpen,
 title: "Interactive Lessons",
 desc: "Bite-sized lessons built around real financial scenarios. Learn budgeting, investing, credit, and more in under 10 minutes a day.",
 },
 {
 icon: Target,
 title: "Hands-On Simulations",
 desc: "Practice reading a paycheck, building a budget, or managing a credit card — with real numbers and real consequences.",
 },
 {
 icon: Zap,
 title: "Certificates & Progress",
 desc: "Complete modules and courses to earn certificates. Maintain your learning streak and track your growth over time.",
 },
 {
 icon: Shield,
 title: "Trusted Content",
 desc: "Every lesson is grounded in real financial principles. No ads. No sponsored content. Just clear, practical education.",
 },
];

const COURSES = [
 { icon: DollarSign, title: "Budgeting Fundamentals", lessons: 6, level: "Beginner", desc: "Learn to track income, manage expenses, and build a budget that works." },
 { icon: TrendingUp, title: "Investing Fundamentals", lessons: 5, level: "Intermediate", desc: "Understand stocks, ETFs, compound interest, and long-term wealth building." },
 { icon: CreditCard, title: "Credit, Debt and Borrowing", lessons: 3, level: "Beginner", desc: "Master credit scores, interest rates, and responsible borrowing strategies." },
 { icon: BookOpen, title: "Banking in the Modern World", lessons: 5, level: "Beginner", desc: "Navigate checking, savings, and digital banking with confidence." },
 { icon: PiggyBank, title: "Saving and Building Wealth", lessons: 4, level: "Intermediate", desc: "Create savings habits, set financial goals, and grow your net worth." },
 { icon: Brain, title: "AI Literacy", lessons: 10, level: "All levels", desc: "Use AI tools responsibly and effectively in everyday life and work." },
];

const SIMULATIONS = [
 {
 icon: BarChart2,
 title: "Budget Scenario Lab",
 desc: "Step through four real-life budget scenarios — college student, first job, freelancer, new parent — and balance each one.",
 tag: "Simulation",
 },
 {
 icon: Calculator,
 title: "Compound Interest Calculator",
 desc: "See how your investments grow over time. Adjust contributions, rate, and horizon to understand long-term wealth building.",
 tag: "Calculator",
 },
 {
 icon: DollarSign,
 title: "Paycheck Walkthrough",
 desc: "Learn to read a real pay stub step by step — gross pay, taxes, deductions, and your actual take-home amount.",
 tag: "Walkthrough",
 },
 {
 icon: TrendingUp,
 title: "Investment Calculator",
 desc: "Compare stocks, bonds, and savings accounts side by side. Visualize portfolio growth with real asset allocations.",
 tag: "Calculator",
 },
];

const STATS = [
 { value: "6", label: "Courses" },
 { value: "50+", label: "Lessons" },
 { value: "4", label: "Simulations" },
 { value: "Free", label: "Always" },
];

const HOW_IT_WORKS = [
 { step: "01", title: "Create your account", desc: "Sign up in under a minute. No credit card required." },
 { step: "02", title: "Choose a course", desc: "Start with budgeting basics or jump straight to investing — your call." },
 { step: "03", title: "Learn by doing", desc: "Answer questions, run simulations, and earn certificates as you progress." },
 { step: "04", title: "Build real skills", desc: "Apply what you learn. Track your progress. Grow your financial confidence." },
];

const QUOTES = [
 { text: "I finally understand how my paycheck works. I learned more in one afternoon than in a full semester of economics.", name: "Marcus T.", role: "High school senior" },
 { text: "The budget simulator felt like a game. I did not realize I was learning until I was three lessons deep.", name: "Priya K.", role: "College freshman" },
 { text: "Finally a platform that teaches personal finance without making it boring. I recommend it to everyone.", name: "Jordan L.", role: "Community college student" },
];

// ─── Sub-sections ─────────────────────────────────────────────

const LANDING_PILL = {
 base: {
 display: "inline-flex", alignItems: "center",
 padding: "7px 16px", borderRadius: 999,
 border: "1.5px solid #e2ddd8", background: "transparent",
 fontSize: 13.5, fontWeight: 500, color: "#4a5568",
 textDecoration: "none", cursor: "pointer",
 transition: "color 0.18s, background 0.18s, border-color 0.18s",
 whiteSpace: "nowrap", lineHeight: 1,
 },
};

function NavPill({ href, children }) {
 return (
 <a
 href={href}
 style={LANDING_PILL.base}
 onMouseOver={e => {
 e.currentTarget.style.color = navy;
 e.currentTarget.style.borderColor = navy;
 e.currentTarget.style.background = accentSoft;
 }}
 onMouseOut={e => {
 e.currentTarget.style.color = "#4a5568";
 e.currentTarget.style.borderColor = "#e2ddd8";
 e.currentTarget.style.background = "transparent";
 }}
 >
 {children}
 </a>
 );
}

function Nav({ scrolled, navigate }) {
 return (
 <>
 <style>{`
 .ln-grid {
 display: grid;
 grid-template-columns: auto 1fr auto;
 align-items: center;
 height: 64px;
 max-width: 1200px;
 margin: 0 auto;
 padding: 0 28px;
 gap: 16px;
 }
 .ln-pills {
 display: flex; align-items: center;
 justify-content: center;
 gap: 6px; flex-wrap: nowrap;
 }
 .ln-auth { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
 @media (max-width: 640px) {
 .ln-pills { display: none !important; }
 }
 `}</style>
 <header
 style={{
 position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
 background: scrolled ? "rgba(255,255,255,0.98)" : "#ffffff",
 borderBottom: "1px solid #e8e3de",
 boxShadow: scrolled ? "0 2px 16px rgba(27,43,94,0.07)" : "none",
 backdropFilter: "blur(12px)",
 transition: "box-shadow 0.25s",
 }}
 >
 <div className="ln-grid">
 {/* Logo — left */}
 <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
 <span style={{ fontSize: 32, fontWeight: 900, color: navy, letterSpacing: "-1.2px" }}>Sprout</span>
 <img src={logoImg} alt="Sprout" style={{ width: 56, height: 56, objectFit: "contain" }} />
 </div>

 {/* Pill links — centered */}
 <nav className="ln-pills">
 <NavPill href="#">Home</NavPill>
 <NavPill href="#courses">Browse Courses</NavPill>
 <NavPill href="#simulations">Simulations</NavPill>
 <NavPill href="#how">How it works</NavPill>
 </nav>

 {/* Auth — right */}
 <div className="ln-auth">
 <button
 onClick={() => navigate(createPageUrl("Login"))}
 style={{ ...LANDING_PILL.base, border: "1.5px solid #e2ddd8", color: "#374151" }}
 onMouseOver={e => { e.currentTarget.style.borderColor = navy; e.currentTarget.style.color = navy; e.currentTarget.style.background = accentSoft; }}
 onMouseOut={e => { e.currentTarget.style.borderColor = "#e2ddd8"; e.currentTarget.style.color = "#374151"; e.currentTarget.style.background = "transparent"; }}
 >
 Log in
 </button>
 <button
 onClick={() => navigate(createPageUrl("Signup"))}
 style={{ ...LANDING_PILL.base, background: navy, borderColor: navy, color: "white", fontWeight: 600 }}
 onMouseOver={e => { e.currentTarget.style.background = navyMid; e.currentTarget.style.borderColor = navyMid; }}
 onMouseOut={e => { e.currentTarget.style.background = navy; e.currentTarget.style.borderColor = navy; }}
 >
 Sign up
 </button>
 </div>
 </div>
 </header>
 </>
 );
}

function Hero({ navigate }) {
 return (
 <section style={{ paddingTop: 120, paddingBottom: 96, paddingLeft: 24, paddingRight: 24, background: "#ffffff", textAlign: "center" }}>
 <div style={{ maxWidth: 760, margin: "0 auto" }}>
 {/* Badge */}
 <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: accentSoft, border: `1px solid ${accentBorder}`, borderRadius: 999, padding: "5px 14px", marginBottom: 32 }}>
 <span style={{ width: 7, height: 7, borderRadius: "50%", background: navy, display: "inline-block" }} />
 <span style={{ fontSize: 13, color: navy, fontWeight: 600 }}>Free for all students and learners</span>
 </div>

 {/* Logo mark in hero */}
 <div style={{ display: "flex", justifyContent: "center", marginBottom: 28 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
 <span style={{ fontSize: 34, fontWeight: 900, color: navy, letterSpacing: "-1.2px", lineHeight: 1 }}>Sprout</span>
 <img src={logoImg} alt="Sprout" style={{ width: 64, height: 64, objectFit: "contain" }} />
 </div>
 </div>

 {/* Headline */}
 <h1 style={{ fontSize: "clamp(36px,6vw,66px)", fontWeight: 900, color: "#111827", lineHeight: 1.1, marginBottom: 24, letterSpacing: "-1.5px" }}>
 Fill gaps in your learning.{" "}
 <span style={{ color: navy }}>One lesson at a time.</span>
 </h1>

 <p style={{ fontSize: "clamp(16px,2vw,19px)", color: "#6b7280", maxWidth: 560, margin: "0 auto 40px", lineHeight: 1.7 }}>
 Sprout is an interactive financial education platform built for students and young professionals. Learn through guided lessons, real-world simulations, and a system that makes financial literacy feel like a game.
 </p>

 {/* CTAs */}
 <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 64 }}>
 <button
 onClick={() => navigate(createPageUrl("Signup"))}
 style={{ display: "flex", alignItems: "center", gap: 8, background: navy, color: "white", fontWeight: 700, fontSize: 16, padding: "13px 28px", borderRadius: 999, border: "none", cursor: "pointer", boxShadow: `0 2px 8px ${navyShadow}` }}
 onMouseOver={e => { e.currentTarget.style.background = navyMid; }}
 onMouseOut={e => { e.currentTarget.style.background = navy; }}
 >
 Start learning free <ArrowRight size={17} />
 </button>
 <button
 onClick={() => navigate(createPageUrl("Login"))}
 style={{ display: "flex", alignItems: "center", gap: 8, background: "white", color: "#374151", fontWeight: 600, fontSize: 16, padding: "13px 28px", borderRadius: 10, border: "1px solid #d0cbc4", cursor: "pointer" }}
 onMouseOver={e => { e.currentTarget.style.background = accentSoft; }}
 onMouseOut={e => { e.currentTarget.style.background = "white"; }}
 >
 I have an account
 </button>
 </div>

 {/* Stats strip */}
 <div style={{ display: "flex", justifyContent: "center", gap: 40, flexWrap: "wrap", borderTop: "1px solid #d0cbc4", paddingTop: 32 }}>
 {STATS.map(s => (
 <div key={s.label} style={{ textAlign: "center" }}>
 <p style={{ fontSize: 30, fontWeight: 900, color: "#111827", margin: 0, lineHeight: 1 }}>{s.value}</p>
 <p style={{ fontSize: 12, color: "#9ca3af", fontWeight: 500, marginTop: 4 }}>{s.label}</p>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

function Features() {
 return (
 <section id="features" style={{ padding: "88px 24px", background: "#f8f9fa" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto" }}>
 <div style={{ textAlign: "center", marginBottom: 52 }}>
 <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: navy, marginBottom: 10 }}>Why Sprout</p>
 <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
 Financial education that actually works
 </h2>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))", gap: 20 }}>
 {FEATURES.map(f => {
 const Icon = f.icon;
 return (
 <div key={f.title} style={{ background: "white", border: "1px solid #d0cbc4", borderRadius: 16, padding: 28 }}>
 <div style={{ width: 44, height: 44, background: accentSoft, border: `1px solid ${accentBorder}`, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 18 }}>
 <Icon size={20} color={navy} />
 </div>
 <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 8, marginTop: 0 }}>{f.title}</h3>
 <p style={{ color: "#6b7280", lineHeight: 1.65, margin: 0, fontSize: 14 }}>{f.desc}</p>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
}

function Courses({ navigate }) {
 return (
 <section id="courses" style={{ padding: "88px 24px", background: "white" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto" }}>
 <div style={{ textAlign: "center", marginBottom: 52 }}>
 <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: navy, marginBottom: 10 }}>What you will learn</p>
 <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
 Real courses. Real financial skills.
 </h2>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
 {COURSES.map(c => {
 const Icon = c.icon;
 return (
 <div
 key={c.title}
 onClick={() => navigate(createPageUrl("Signup"))}
 style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s" }}
 onMouseOver={e => { e.currentTarget.style.borderColor = accentBorder; e.currentTarget.style.boxShadow = "0 4px 16px rgba(31,58,100,0.08)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
 onMouseOut={e => { e.currentTarget.style.borderColor = "#e5e7eb"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
 >
 <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
 <div style={{ width: 44, height: 44, background: navy, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
 <Icon size={20} color="white" />
 </div>
 <span style={{ fontSize: 11, fontWeight: 600, color: navy, background: accentSoft, border: `1px solid ${accentBorder}`, borderRadius: 999, padding: "3px 10px" }}>
 {c.level}
 </span>
 </div>
 <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>{c.title}</h3>
 <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px", lineHeight: 1.55 }}>{c.desc}</p>
 <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
 <span style={{ fontSize: 13, color: "#9ca3af" }}>{c.lessons} lessons</span>
 <div style={{ display: "flex", alignItems: "center", gap: 5, color: navy, fontSize: 13, fontWeight: 600 }}>
 Start course <ArrowRight size={13} />
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
}

function SimulationsSection({ navigate }) {
 return (
 <section id="simulations" style={{ padding: "88px 24px", background: accentSoft }}>
 <div style={{ maxWidth: 1100, margin: "0 auto" }}>
 <div style={{ textAlign: "center", marginBottom: 52 }}>
 <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: navy, marginBottom: 10 }}>Practice before it counts</p>
 <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
 Interactive financial simulations
 </h2>
 <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 520, margin: "16px auto 0", lineHeight: 1.65 }}>
 Each simulation guides you through a structured learning lab — introduction, scenario setup, step-by-step interaction, and a completion summary.
 </p>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 16 }}>
 {SIMULATIONS.map(s => {
 const Icon = s.icon;
 return (
 <div
 key={s.title}
 onClick={() => navigate(createPageUrl("Signup"))}
 style={{ background: "white", border: `1px solid ${accentBorder}`, borderRadius: 16, padding: 24, cursor: "pointer", transition: "all 0.2s" }}
 onMouseOver={e => { e.currentTarget.style.boxShadow = "0 4px 16px rgba(31,58,100,0.1)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
 onMouseOut={e => { e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.transform = "translateY(0)"; }}
 >
 <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
 <div style={{ width: 44, height: 44, background: navy, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
 <Icon size={20} color="white" />
 </div>
 <span style={{ fontSize: 11, fontWeight: 600, color: navy, background: accentSoft, border: `1px solid ${accentBorder}`, borderRadius: 999, padding: "3px 10px" }}>
 {s.tag}
 </span>
 </div>
 <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{s.title}</h3>
 <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 16px", lineHeight: 1.55 }}>{s.desc}</p>
 <div style={{ display: "flex", alignItems: "center", gap: 5, color: navy, fontSize: 13, fontWeight: 600 }}>
 Try simulation <ArrowRight size={13} />
 </div>
 </div>
 );
 })}
 </div>
 </div>
 </section>
 );
}

function HowItWorks() {
 return (
 <section id="how" style={{ padding: "88px 24px", background: "#f8f9fa" }}>
 <div style={{ maxWidth: 720, margin: "0 auto" }}>
 <div style={{ textAlign: "center", marginBottom: 52 }}>
 <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: navy, marginBottom: 10 }}>Getting started</p>
 <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
 How Sprout works
 </h2>
 </div>
 <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
 {HOW_IT_WORKS.map(s => (
 <div key={s.step} style={{ display: "flex", gap: 20, alignItems: "flex-start", background: "white", border: "1px solid #d0cbc4", borderRadius: 14, padding: 22 }}>
 <div style={{ flexShrink: 0, width: 44, height: 44, background: navy, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
 <span style={{ fontSize: 13, fontWeight: 800, color: "white" }}>{s.step}</span>
 </div>
 <div>
 <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "2px 0 5px" }}>{s.title}</h3>
 <p style={{ color: "#6b7280", margin: 0, lineHeight: 1.6, fontSize: 14 }}>{s.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

function SocialProof() {
 return (
 <section style={{ padding: "88px 24px", background: "white" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto" }}>
 <div style={{ textAlign: "center", marginBottom: 48 }}>
 <div style={{ display: "flex", justifyContent: "center", gap: 3, marginBottom: 14 }}>
 {[...Array(5)].map((_,i) => <Star key={i} size={17} color="#f59e0b" fill="#f59e0b" />)}
 </div>
 <h2 style={{ fontSize: "clamp(24px,3.5vw,38px)", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
 Students love Sprout
 </h2>
 </div>
 <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16 }}>
 {QUOTES.map(q => (
 <div key={q.name} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 16, padding: 24 }}>
 <p style={{ color: "#374151", lineHeight: 1.7, marginBottom: 18, marginTop: 0, fontSize: 15 }}>"{q.text}"</p>
 <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
 <div style={{ width: 34, height: 34, background: navy, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 13 }}>
 {q.name[0]}
 </div>
 <div>
 <p style={{ color: "#111827", fontWeight: 600, fontSize: 14, margin: 0 }}>{q.name}</p>
 <p style={{ color: "#9ca3af", fontSize: 12, margin: 0 }}>{q.role}</p>
 </div>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

function CTA({ navigate }) {
 return (
 <section style={{ padding: "88px 24px", background: "#f8f9fa", borderTop: "1px solid #e5e7eb" }}>
 <div style={{ maxWidth: 560, margin: "0 auto", textAlign: "center" }}>
 <div style={{ margin: "0 auto 20px", display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
 <span style={{ fontSize: 28, fontWeight: 900, color: navy, letterSpacing: "-1.2px" }}>Sprout</span>
 <img src={logoImg} alt="Sprout" style={{ width: 52, height: 52, objectFit: "contain" }} />
 </div>
 <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "#111827", margin: "0 0 18px", letterSpacing: "-0.5px" }}>
 Your financial future starts today.
 </h2>
 <p style={{ color: "#6b7280", fontSize: 17, marginBottom: 32, lineHeight: 1.65 }}>
 Join thousands of students already building smarter money habits. Free, structured, and it actually works.
 </p>
 <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
 <button
 onClick={() => navigate(createPageUrl("Signup"))}
 style={{ display: "inline-flex", alignItems: "center", gap: 8, background: navy, color: "white", fontWeight: 700, fontSize: 16, padding: "13px 28px", borderRadius: 999, border: "none", cursor: "pointer", boxShadow: `0 2px 8px ${navyShadow}` }}
 onMouseOver={e => { e.currentTarget.style.background = navyMid; }}
 onMouseOut={e => { e.currentTarget.style.background = navy; }}
 >
 Create free account <ArrowRight size={17} />
 </button>
 <button
 onClick={() => navigate(createPageUrl("Login"))}
 style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "white", color: "#374151", fontWeight: 600, fontSize: 16, padding: "13px 28px", borderRadius: 10, border: "1px solid #d0cbc4", cursor: "pointer" }}
 onMouseOver={e => { e.currentTarget.style.background = accentSoft; }}
 onMouseOut={e => { e.currentTarget.style.background = "white"; }}
 >
 Log in
 </button>
 </div>
 <p style={{ color: "#9ca3af", fontSize: 13, marginTop: 16 }}>No credit card required. No spam. Free forever.</p>
 </div>
 </section>
 );
}

function WhatYouGet() {
 const items = [
 "Guided, step-by-step financial lessons",
 "Real-world budget and investment simulations",
 "Certificates and progress tracking",
 "Courses on budgeting, credit, investing, and more",
 "No cost — free for all students",
 ];
 return (
 <section style={{ padding: "88px 24px", background: "white" }}>
 <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="sprout-two-col">
 <div>
 <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: navy, marginBottom: 10 }}>Platform overview</p>
 <h2 style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 800, color: "#111827", margin: "0 0 16px", letterSpacing: "-0.5px" }}>
 Everything you need to build financial confidence.
 </h2>
 <p style={{ fontSize: 15, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>
 Sprout combines structured learning, hands-on simulations, and a progress system into one platform designed to make financial literacy accessible for everyone.
 </p>
 </div>
 <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
 {items.map(item => (
 <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
 <div style={{ flexShrink: 0, marginTop: 1 }}>
 <CheckCircle size={18} color={navy} />
 </div>
 <span style={{ fontSize: 15, color: "#374151", lineHeight: 1.5 }}>{item}</span>
 </div>
 ))}
 </div>
 </div>
 </section>
 );
}

function Footer() {
 return (
 <footer style={{ background: "#f8f9fa", borderTop: "1px solid #e5e7eb", padding: "32px 24px" }}>
 <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
 <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
 <span style={{ color: navy, fontWeight: 900, fontSize: 15, letterSpacing: "-0.5px" }}>Sprout</span>
 <img src={logoImg} alt="Sprout" style={{ width: 32, height: 32, objectFit: "contain" }} />
 </div>
 <p style={{ color: "#9ca3af", fontSize: 13, margin: 0 }}>
 © {new Date().getFullYear()} Sprout. Built to grow your financial knowledge.
 </p>
 <div style={{ display: "flex", gap: 20, fontSize: 13, color: "#9ca3af" }}>
 <span style={{ cursor: "pointer" }} onMouseOver={e => e.target.style.color=navy} onMouseOut={e => e.target.style.color="#9ca3af"}>Privacy</span>
 <span style={{ cursor: "pointer" }} onMouseOver={e => e.target.style.color=navy} onMouseOut={e => e.target.style.color="#9ca3af"}>Terms</span>
 </div>
 </div>
 </footer>
 );
}

// ─── Main export ──────────────────────────────────────────────

export default function Landing() {
 const navigate = useNavigate();
 const [scrolled, setScrolled] = useState(false);

 useEffect(() => {
 const onScroll = () => setScrolled(window.scrollY > 10);
 window.addEventListener("scroll", onScroll, { passive: true });
 return () => window.removeEventListener("scroll", onScroll);
 }, []);

 return (
 <>
 <style>{`
 html { scroll-behavior: smooth; }
 @media (max-width: 640px) {
 .sprout-nav-links { display: none !important; }
 }
 @media (max-width: 700px) {
 .sprout-two-col { grid-template-columns: 1fr !important; gap: 32px !important; }
 }
 `}</style>
 <div style={{ fontFamily: "'Inter',-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif", WebkitFontSmoothing: "antialiased", color: "#111827" }}>
 <Nav scrolled={scrolled} navigate={navigate} />
 <Hero navigate={navigate} />
 <Features />
 <Courses navigate={navigate} />
 <SimulationsSection navigate={navigate} />
 <HowItWorks />
 <WhatYouGet />
 <SocialProof />
 <CTA navigate={navigate} />
 <Footer />
 </div>
 </>
 );
}
