import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

/** ---------- local helpers ---------- */
const safeParse = (raw, fallback) => {
 try {
 return raw ? JSON.parse(raw) : fallback;
 } catch {
 return fallback;
 }
};
const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const getLocalUser = () => getJSON("sprout_user", null);

export default function Welcome() {
 const navigate = useNavigate();

 useEffect(() => {
 // No async needed now
 const user = getLocalUser();

 if (!user) {
 navigate(createPageUrl("Login"));
 return;
 }

 if (user.onboarding_completed) {
 navigate(createPageUrl("Dashboard"));
 } else {
 navigate(createPageUrl("SchoolSelection"));
 }
 }, [navigate]);

 return (
 <div className="min-h-screen flex items-center justify-center">
 <div className="text-center">
 <div className="w-16 h-16 border-4 border-[#1B2B5E] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
 <p className="text-gray-600">Loading...</p>
 </div>
 </div>
 );
}
