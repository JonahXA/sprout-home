import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { getDAU, getSignupsByDay, getTopCourses, getRetentionData } from "@/services/analytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Users, UserCheck, BookOpen } from "lucide-react";

const C = {
  navy: "#1B2B5E",
  green: "#2D9B6F",
  accent: "#3B82F6",
  amber: "#F59E0B",
  purple: "#7C3AED",
  border: "#E5E7EB",
  text: "#0F172A",
  textSub: "#475569",
  bgSoft: "#F8FAFC",
};

// ─── DAU Line Chart ──────────────────────────────────────────────
export function DAUChart() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["analytics-dau"],
    queryFn: () => getDAU(30),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Daily Active Users (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: C.textSub }}
                tickLine={false}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11, fill: C.textSub }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
              />
              <Line
                type="monotone"
                dataKey="users"
                stroke={C.accent}
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4 }}
                name="Active Users"
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Signups Bar Chart ───────────────────────────────────────────
export function SignupsChart() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["analytics-signups"],
    queryFn: () => getSignupsByDay(30),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="w-5 h-5 text-green-600" />
          New Signups (Last 30 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: C.textSub }}
                tickLine={false}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11, fill: C.textSub }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
              />
              <Bar dataKey="signups" fill={C.green} radius={[4, 4, 0, 0]} name="New Signups" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Top Courses Bar Chart ───────────────────────────────────────
export function TopCoursesChart() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["analytics-top-courses"],
    queryFn: getTopCourses,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <BookOpen className="w-5 h-5 text-purple-500" />
          Top Courses by Views
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ChartSkeleton />
        ) : data.length === 0 ? (
          <EmptyState label="No lesson view events recorded yet." />
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
              <XAxis
                type="number"
                tick={{ fontSize: 11, fill: C.textSub }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                type="category"
                dataKey="course"
                width={100}
                tick={{ fontSize: 11, fill: C.textSub }}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: `1px solid ${C.border}`, fontSize: 12 }}
              />
              <Bar dataKey="views" fill={C.purple} radius={[0, 4, 4, 0]} name="Views" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Retention Card ──────────────────────────────────────────────
export function RetentionCard() {
  const { data, isLoading } = useQuery({
    queryKey: ["analytics-retention"],
    queryFn: getRetentionData,
    staleTime: 5 * 60 * 1000,
  });

  return (
    <Card className="border-none shadow-lg bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCheck className="w-5 h-5 text-amber-500" />
          User Retention
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-28 animate-pulse bg-gray-100 rounded-lg" />
        ) : (
          <div className="flex flex-col items-center justify-center py-4 gap-2">
            <div
              style={{
                fontSize: 52,
                fontWeight: 800,
                color: C.navy,
                lineHeight: 1,
              }}
            >
              {data?.retentionRate ?? 0}%
            </div>
            <p style={{ fontSize: 13, color: C.textSub, textAlign: "center" }}>
              of users returned on a second day
            </p>
            <div
              style={{
                display: "flex",
                gap: 24,
                marginTop: 8,
                fontSize: 12,
                color: C.textSub,
              }}
            >
              <span>
                <strong style={{ color: C.text }}>{data?.retainedUsers ?? 0}</strong> retained
              </span>
              <span>
                <strong style={{ color: C.text }}>{data?.totalUsers ?? 0}</strong> total active
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Default export — full analytics tab ────────────────────────
export default function AnalyticsCharts() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <DAUChart />
        <SignupsChart />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
        <TopCoursesChart />
        <RetentionCard />
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────
function ChartSkeleton() {
  return <div className="h-[220px] animate-pulse bg-gray-100 rounded-lg" />;
}

function EmptyState({ label }) {
  return (
    <div className="h-[220px] flex items-center justify-center text-sm text-gray-400">
      {label}
    </div>
  );
}
