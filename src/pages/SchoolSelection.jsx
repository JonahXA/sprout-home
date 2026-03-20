import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sprout, School, ArrowRight, Search, CheckCircle } from "lucide-react";
import { toast } from "sonner";

/** ----------------------------
 * Hybrid data client (public/data -> localStorage fallback)
 * ---------------------------- */
const safeParse = (raw, fallback) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const getJSON = (key, fallback) => safeParse(localStorage.getItem(key), fallback);
const setJSON = (key, value) => localStorage.setItem(key, JSON.stringify(value));

const getLocalUser = () => safeParse(localStorage.getItem("sprout_user"), null);
const setLocalUser = (u) => localStorage.setItem("sprout_user", JSON.stringify(u));

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
  async listSchools() {
    return fetchJsonWithCache(
      `${import.meta.env.BASE_URL}data/schools.json`,
      "sprout_schools",
      []
    );
  },
};


export default function SchoolSelection() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // form
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [grade, setGrade] = useState("");

  useEffect(() => {
    const currentUser = getLocalUser();
    if (!currentUser) {
      navigate(createPageUrl("Login"));
      return;
    }
    if (currentUser.onboarding_completed) {
      navigate(createPageUrl("Dashboard"));
      return;
    }
    setUser(currentUser);
  }, [navigate]);

  const { data: schools = [] } = useQuery({
    queryKey: ["schools_hybrid"],
    queryFn: () => dataClient.listSchools(),
  });

  const filteredSchools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    // startsWith feels best for school search UX, but include contains too
    const starts = schools.filter((s) => (s.name || "").toLowerCase().startsWith(q));
    const contains = schools.filter(
      (s) => !starts.includes(s) && (s.name || "").toLowerCase().includes(q)
    );
    return [...starts, ...contains].slice(0, 12);
  }, [schools, searchQuery]);

  const handlePickSchool = (s) => {
    setSelectedSchool(s);
    setSearchQuery(s.name);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedSchool?.id) {
      toast.error("Please choose a school from the list.");
      return;
    }
    if (!grade) {
      toast.error("Please select your grade.");
      return;
    }

    const updated = {
      ...user,
      school_id: selectedSchool.id,
      school_name: selectedSchool.name,
      grade,
      onboarding_completed: true,

      // ensure these exist
      xp_points: user.xp_points ?? 0,
      level: user.level ?? 1,
      current_streak: user.current_streak ?? 0,
      longest_streak: user.longest_streak ?? 0,
      total_lessons_completed: user.total_lessons_completed ?? 0,
      total_courses_completed: user.total_courses_completed ?? 0,
    };

    setLocalUser(updated);
    toast.success("Welcome to Sprout! 🌱");
    navigate(createPageUrl("Dashboard"));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#1B2B5E] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="w-full max-w-2xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-[#1B2B5E] rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Sprout</h1>
              <p className="text-sm text-gray-500">Grow Your Knowledge</p>
            </div>
          </div>
        </div>

        <Card className="border-none shadow-2xl bg-white/90 backdrop-blur-xl">
          <CardHeader className="text-center pb-6 bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <School className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Tell us about yourself</CardTitle>
            <p className="text-gray-600 mt-2">Help us personalize your learning experience</p>
          </CardHeader>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* School Search + Autocomplete */}
              <div className="space-y-3">
                <Label className="text-gray-700 text-base font-semibold">
                  Which school do you attend?
                </Label>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 z-10" />
                  <input
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setSelectedSchool(null);
                    }}
                    placeholder="Type to search your school..."
                    className="w-full pl-10 h-12 px-4 border-2 border-gray-300 rounded-lg bg-white text-base focus:border-[#1B2B5E] focus:outline-none"
                    autoComplete="off"
                    required
                  />

                  {/* Dropdown */}
                  {searchQuery.trim() && !selectedSchool && filteredSchools.length > 0 && (
                    <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden">
                      {filteredSchools.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => handlePickSchool(s)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start justify-between gap-3"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{s.name}</p>
                            <p className="text-xs text-gray-500">
                              {s.location ? s.location : " "}
                              {s.type ? ` • ${s.type}` : ""}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400">Select</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedSchool && (
                  <div className="flex items-center gap-2 text-sm text-[#2D9B6F] bg-blue-50 border border-gray-200 rounded-lg px-3 py-2">
                    <CheckCircle className="w-4 h-4" />
                    Selected: <span className="font-semibold">{selectedSchool.name}</span>
                  </div>
                )}

                {searchQuery.trim() && !selectedSchool && filteredSchools.length === 0 && (
                  <p className="text-sm text-gray-500 mt-2">
                    No schools found. Try a different search term.
                  </p>
                )}
              </div>

              {/* Grade */}
              <div className="space-y-3">
                <Label className="text-gray-700 text-base font-semibold">What grade are you in?</Label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="w-full h-12 px-4 border-2 border-gray-300 rounded-lg bg-white text-base focus:border-[#1B2B5E] focus:outline-none"
                  required
                >
                  <option value="">Select your grade</option>
                  <option value="6th Grade">6th Grade</option>
                  <option value="7th Grade">7th Grade</option>
                  <option value="8th Grade">8th Grade</option>
                  <option value="9th Grade (Freshman)">9th Grade (Freshman)</option>
                  <option value="10th Grade (Sophomore)">10th Grade (Sophomore)</option>
                  <option value="11th Grade (Junior)">11th Grade (Junior)</option>
                  <option value="12th Grade (Senior)">12th Grade (Senior)</option>
                  <option value="Freshman">College Freshman</option>
                  <option value="Sophomore">College Sophomore</option>
                  <option value="Junior">College Junior</option>
                  <option value="Senior">College Senior</option>
                  <option value="Graduate Student">Graduate Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Info */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 border-2 border-gray-200">
                <p className="text-sm text-gray-700">
                  💡 <span className="font-semibold">Why we ask:</span> This helps us connect you
                  with classmates and personalize your experience.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base bg-[#1B2B5E] hover:bg-[#141E43] text-white shadow-lg "
              >
                Continue to Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex justify-center mt-6 gap-2">
          <div className="w-12 h-2 rounded-full bg-blue-500" />
          <div className="w-12 h-2 rounded-full bg-[#1B2B5E]" />
        </div>
        <p className="text-center mt-3 text-sm text-gray-600">Step 1 of 2</p>
      </div>
    </div>
  );
}
