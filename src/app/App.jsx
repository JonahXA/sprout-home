// src/App.jsx
import "./App.css";
import React from "react";
import { HashRouter as Router, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";

import { Toaster } from "@/components/ui/toaster";
import UserNotRegisteredError from "@/components/shared/UserNotRegisteredError";

import { queryClientInstance } from "@/lib/queryClient";
import VisualEditAgent from "@/components/shared/VisualEditAgent";
import NavigationTracker from "@/components/shared/NavigationTracker";
import PageNotFound from "@/components/shared/PageNotFound";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import RoleSelectModal from "@/components/shared/RoleSelectModal";

import { pagesConfig } from "../config/pages.config";
import { createPageUrl } from "@/config/routes";

const { Pages, Layout, mainPage } = pagesConfig;
const firstPageKey = Object.keys(Pages || {})[0];
const mainPageKey = mainPage ?? firstPageKey ?? "Dashboard";

const LayoutWrapper = ({ children, currentPageName }) =>
 Layout ? <Layout currentPageName={currentPageName}>{children}</Layout> : <>{children}</>;

function AuthGate() {
 const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

 // Loading spinner while checking auth
 if (isLoadingPublicSettings || isLoadingAuth) {
 return (
 <div className="fixed inset-0 flex items-center justify-center">
 <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin" />
 </div>
 );
 }

 // Handle unregistered user error
 if (authError?.type === "user_not_registered") {
 return <UserNotRegisteredError />;
 }

 // All other cases — render the routes normally
 // Unauthenticated users will see the Home page (Dashboard)
 // Individual pages handle their own auth checks if needed
 return (
 <>
 <RoleSelectModal />
 <Routes>
 {/* Default route goes to main page (Dashboard/Home) */}
 <Route path="/" element={<Navigate to={createPageUrl(mainPageKey)} replace />} />

 {/* Register every page */}
 {Object.entries(Pages).map(([pageKey, Page]) => (
 <Route
 key={pageKey}
 path={createPageUrl(pageKey)}
 element={
 <LayoutWrapper currentPageName={pageKey}>
 <Page />
 </LayoutWrapper>
 }
 />
 ))}

 <Route path="*" element={<PageNotFound />} />
 </Routes>
 </>
 );
}

export default function App() {
 return (
 <AuthProvider>
 <QueryClientProvider client={queryClientInstance}>
 <Router>
 <NavigationTracker />
 <AuthGate />
 </Router>

 <Toaster />
 <VisualEditAgent />
 </QueryClientProvider>
 </AuthProvider>
 );
}