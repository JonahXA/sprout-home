// src/lib/schoolsData.js
import { getJSON, setJSON } from "@/lib/sproutStorage";
import { createClient } from "@supabase/supabase-js";

const STORAGE_KEY = "sprout_schools";
const META_KEY = "sprout_schools_meta";

export const FALLBACK_SCHOOLS = [
 { id: "sch_msu", name: "Michigan State University", location: "East Lansing, MI" },
 { id: "sch_umich", name: "University of Michigan", location: "Ann Arbor, MI" },
 { id: "sch_wsu", name: "Wayne State University", location: "Detroit, MI" },
 { id: "sch_osu", name: "The Ohio State University", location: "Columbus, OH" },
];

const getSupabaseClient = () => {
 const url = import.meta.env.VITE_SUPABASE_URL;
 const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
 if (!url || !key) return null;
 return createClient(url, key);
};

export function getCachedSchools() {
 const cached = getJSON(STORAGE_KEY, null);
 if (Array.isArray(cached) && cached.length) return cached;
 return FALLBACK_SCHOOLS;
}

export function setCachedSchools(list, source = "unknown") {
 setJSON(STORAGE_KEY, list);
 setJSON(META_KEY, { source, updatedAt: new Date().toISOString(), count: list?.length ?? 0 });
}

export function getSchoolsMeta() {
 return getJSON(META_KEY, { source: "fallback", updatedAt: null, count: 0 });
}

export async function refreshSchoolsHybrid({ prefer = "auto" } = {}) {
 // 1) Try hosted JSON (public/data/schools.json)
 if (prefer === "json" || prefer === "auto") {
 try {
 const res = await fetch("/data/schools.json", { cache: "no-cache" });
 if (res.ok) {
 const data = await res.json();
 if (Array.isArray(data) && data.length) {
 setCachedSchools(data, "json");
 return { ok: true, source: "json", count: data.length };
 }
 }
 } catch {
 // ignore
 }
 }

 // 2) Try Supabase (optional, only if env vars exist)
 if (prefer === "supabase" || prefer === "auto") {
 try {
 const supabase = getSupabaseClient();
 if (!supabase) return { ok: false, source: "supabase", error: "missing_env" };

 const { data, error } = await supabase
 .from("schools")
 .select("id,name,location")
 .order("name", { ascending: true })
 .limit(50000);

 if (error) return { ok: false, source: "supabase", error: error.message };
 if (Array.isArray(data) && data.length) {
 setCachedSchools(data, "supabase");
 return { ok: true, source: "supabase", count: data.length };
 }
 } catch (e) {
 return { ok: false, source: "supabase", error: e?.message || "unknown" };
 }
 }

 // 3) Ensure fallback cached at least once
 const cached = getJSON(STORAGE_KEY, null);
 if (!Array.isArray(cached) || !cached.length) {
 setCachedSchools(FALLBACK_SCHOOLS, "fallback");
 }
 return { ok: true, source: "fallback", count: getCachedSchools().length };
}
