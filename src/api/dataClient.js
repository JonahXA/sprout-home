// src/api/dataClient.js

const LS_KEYS = {
 currentUser: "sm_current_user",
 schools: "sm_schools",
 users: "sm_users",
 userProgress: "sm_user_progress",
 userBadges: "sm_user_badges",
 aiCourseDayProgress: "sm_ai_course_day_progress",

 // ADD THIS
 courses: "sm_courses",
};

function safeJsonParse(value, fallback) {
 try {
 return value ? JSON.parse(value) : fallback;
 } catch {
 return fallback;
 }
}

function loadArray(key, fallback = []) {
 return safeJsonParse(localStorage.getItem(key), fallback);
}

function saveArray(key, arr) {
 localStorage.setItem(key, JSON.stringify(arr));
}

function loadObject(key, fallback = null) {
 return safeJsonParse(localStorage.getItem(key), fallback);
}

function saveObject(key, obj) {
 localStorage.setItem(key, JSON.stringify(obj));
}

function uuid() {
 if (typeof crypto !== "undefined" && crypto.randomUUID) return crypto.randomUUID();
 return `id_${Math.random().toString(16).slice(2)}_${Date.now()}`;
}

function ensureSeedData() {
 // Seed schools
 const existingSchools = loadArray(LS_KEYS.schools, null);
 if (!existingSchools) {
 saveArray(LS_KEYS.schools, [
 { id: "school_1", name: "Michigan State University", location: "East Lansing, MI", type: "University" },
 { id: "school_2", name: "Wayne State University", location: "Detroit, MI", type: "University" },
 { id: "school_3", name: "Detroit Country Day School", location: "Beverly Hills, MI", type: "High School" },
 ]);
 }

 // Seed users
 const existingUsers = loadArray(LS_KEYS.users, null);
 if (!existingUsers) {
 saveArray(LS_KEYS.users, []);
 }

 // Seed courses so AILiteracy.jsx doesn't crash
 const existingCourses = loadArray(LS_KEYS.courses, null);
 if (!existingCourses) {
 saveArray(LS_KEYS.courses, [
 {
 id: "course_ai_literacy",
 name: "AI Literacy: Using AI Responsibly and Effectively",
 created_date: new Date().toISOString(),
 },
 ]);
 }

 // Seed other collections
 const collections = [
 LS_KEYS.userProgress,
 LS_KEYS.userBadges,
 LS_KEYS.aiCourseDayProgress,
 ];
 for (const k of collections) {
 const v = loadArray(k, null);
 if (!v) saveArray(k, []);
 }
}

ensureSeedData();

// --------- Auth API ----------
const auth = {
 async me() {
 const u = loadObject(LS_KEYS.currentUser, null);
 if (!u) throw new Error("Not authenticated");
 return u;
 },

 // ADD: safe version that doesn't throw
 async maybeMe() {
 return loadObject(LS_KEYS.currentUser, null);
 },

 // ADD: convenience
 async isAuthenticated() {
 return !!loadObject(LS_KEYS.currentUser, null);
 },

 async updateMe(data) {
 const current = await auth.me();
 const updated = { ...current, ...data };
 saveObject(LS_KEYS.currentUser, updated);

 const users = loadArray(LS_KEYS.users, []);
 const idx = users.findIndex((x) => x.email === updated.email || x.id === updated.id);
 if (idx >= 0) {
 users[idx] = { ...users[idx], ...updated };
 } else {
 users.push({ ...updated, id: updated.id || uuid() });
 }
 saveArray(LS_KEYS.users, users);

 return updated;
 },

 async logout() {
 localStorage.removeItem(LS_KEYS.currentUser);
 },

 async __setCurrentUser(user) {
 const normalized = {
 id: user.id || uuid(),
 role: user.role || "user",
 level: user.level ?? 1,
 xp_points: user.xp_points ?? 0,
 total_lessons_completed: user.total_lessons_completed ?? 0,
 current_streak: user.current_streak ?? 0,
 longest_streak: user.longest_streak ?? 0,
 show_on_leaderboard: user.show_on_leaderboard ?? true,
 created_date: user.created_date || new Date().toISOString(),
 ...user,
 };
 saveObject(LS_KEYS.currentUser, normalized);

 const users = loadArray(LS_KEYS.users, []);
 const idx = users.findIndex((x) => x.email === normalized.email || x.id === normalized.id);
 if (idx >= 0) users[idx] = { ...users[idx], ...normalized };
 else users.push(normalized);
 saveArray(LS_KEYS.users, users);

 return normalized;
 },
};

// --------- Entities API ----------
function makeCollectionApi(storageKey) {
 return {
 async list() {
 return loadArray(storageKey, []);
 },

 async create(record) {
 const arr = loadArray(storageKey, []);
 const created = { id: uuid(), created_date: new Date().toISOString(), ...record };
 arr.push(created);
 saveArray(storageKey, arr);
 return created;
 },

 async update(id, patch) {
 const arr = loadArray(storageKey, []);
 const idx = arr.findIndex((x) => x.id === id);
 if (idx < 0) throw new Error(`Record not found: ${id}`);
 arr[idx] = { ...arr[idx], ...patch };
 saveArray(storageKey, arr);
 return arr[idx];
 },

 async filter(where) {
 const arr = loadArray(storageKey, []);
 return arr.filter((row) => {
 return Object.entries(where || {}).every(([k, v]) => row?.[k] === v);
 });
 },
 };
}

const entities = {
 // ADD so AILiteracy.jsx works
 Course: makeCollectionApi(LS_KEYS.courses),

 School: makeCollectionApi(LS_KEYS.schools),
 User: makeCollectionApi(LS_KEYS.users),
 UserProgress: makeCollectionApi(LS_KEYS.userProgress),
 UserBadge: makeCollectionApi(LS_KEYS.userBadges),
 AICourseDayProgress: makeCollectionApi(LS_KEYS.aiCourseDayProgress),
};

export const dataClient = { auth, entities };
