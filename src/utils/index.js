// src/utils/index.js

const pageRoutes = {
 Home: "/",
 Welcome: "/welcome",
 Login: "/login",
 Signup: "/signup",

 Dashboard: "/dashboard",
 Learn: "/learn",
 Lesson: "/lesson",
 CourseDetail: "/course",
 Progress: "/progress",
 Goals: "/goals",
 Leaderboard: "/leaderboard",

 Simulations: "/simulations",
 InvestmentCalculator: "/investment-calculator",
 PaperTrading: "/paper-trading",

 SchoolSelection: "/school-selection",
};

export function createPageUrl(pageName) {
 if (!pageName) return "/";

 // Support inputs like:
 // "CourseDetail?id=123"
 // "FinalExam?courseId=abc"
 const [name, query] = String(pageName).split("?");

 const base = pageRoutes[name] || `/${name.toLowerCase()}`;
 return query ? `${base}?${query}` : base;
}

export { pageRoutes };
