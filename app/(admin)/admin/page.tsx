"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, StatCard } from "@/components/ui/card";
import { useApi } from "@/lib/useApi";
import { useAction } from "@/lib/useAction";
import { actionLabel } from "@/lib/format";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  UserPlus,
  CalendarPlus,
  Settings,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  TrendingUp,
  X,
  BarChart3,
  Activity,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Radio,
  AlertCircle,
  Loader2
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

// 30 days of data for rich analysis
/** A day on the activity chart, as GET /admin/dashboard returns it. */
type SeriesPoint = { date: string; logins: number; exams: number };

type DashboardData = {
  stats: {
    activeUsers: { value: number; previous: number };
    examsToday: { total: number; inProgress: number };
    openAlerts: { total: number; high: number };
    uptimeSeconds: number;
  };
  series: SeriesPoint[];
  health: { name: string; status: string; latencyMs: number | null }[];
  recent: {
    id: string;
    requestId: string;
    at: string;
    actorName: string;
    action: string;
    targetType: string;
    targetLabel: string | null;
  }[];
  serverTime: string;
};

/** Roles the API accepts on POST /admin/users, with their display labels. */
const ROLE_OPTIONS = [
  { key: "STUDENT", label: "Student" },
  { key: "LECTURER", label: "Lecturer" },
  { key: "ADMIN", label: "System Administrator" },
] as const;

const formatDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });
};

const formatUptime = (seconds: number) => {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  return days > 0 ? `${days}d ${hours}h` : `${hours}h`;
};

/** "10:42" today, "Yesterday", or a date — whichever reads fastest. */
const formatWhen = (iso: string) => {
  const at = new Date(iso);
  if (Number.isNaN(at.getTime())) return "—";

  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const daysAgo = Math.round((startOfDay(new Date()) - startOfDay(at)) / 86_400_000);

  if (daysAgo === 0) return at.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  if (daysAgo === 1) return "Yesterday";
  return at.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("14d");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [metric, setMetric] = useState<"logins" | "exams">("logins");

  const { data, loading, error, reload } = useApi<DashboardData>("/admin/dashboard");
  const { toast } = useToast();
  const createUserAction = useAction();
  const createSessionAction = useAction();

  // Quick action modals
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);

  // Form states. Role keys and field names match POST /admin/users exactly.
  const [newUser, setNewUser] = useState({
    names: "",
    staffId: "",
    email: "",
    role: "STUDENT" as (typeof ROLE_OPTIONS)[number]["key"],
    password: "",
  });

  // POST /admin/sessions takes a consecutive-year name plus the two dates.
  const [newSession, setNewSession] = useState({
    name: "",
    startsOn: "",
    endsOn: "",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = data?.stats;
  const series = data?.series ?? [];

  // Week-on-week change in distinct signed-in accounts. The endpoint compares
  // the last 7 days against the 7 before them.
  const { activeUsersDelta, activeUsersTrend } = useMemo(() => {
    if (!stats) return { activeUsersDelta: "", activeUsersTrend: "neutral" as const };
    const { value, previous } = stats.activeUsers;
    if (!previous) return { activeUsersDelta: "no prior week to compare", activeUsersTrend: "neutral" as const };
    const pct = Math.round(((value - previous) / previous) * 100);
    return {
      activeUsersDelta: `${pct >= 0 ? "+" : ""}${pct}% vs last week`,
      activeUsersTrend: pct > 0 ? ("up" as const) : pct < 0 ? ("down" as const) : ("neutral" as const),
    };
  }, [stats]);

  // The endpoint always returns a 30-day window; the range control slices it.
  const visibleData = useMemo(() => {
    const slice = timeRange === "7d" ? -7 : timeRange === "14d" ? -14 : 0;
    return series.slice(slice).map((point) => ({ ...point, date: formatDay(point.date) }));
  }, [series, timeRange]);

  // Calculations for graph KPIs
  const currentMetricValues = visibleData.map(d => d[metric]);
  const peakVal = currentMetricValues.length ? Math.max(...currentMetricValues) : 0;
  const totalVal = currentMetricValues.reduce((a, b) => a + b, 0);
  const avgVal = currentMetricValues.length ? Math.round(totalVal / currentMetricValues.length) : 0;

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    await createUserAction.run<{ id: string }, { temporaryPassword?: string }>("/admin/users", {
      method: "POST",
      body: JSON.stringify({
        names: newUser.names,
        roles: [newUser.role],
        staffId: newUser.staffId || undefined,
        email: newUser.email || undefined,
        // Omitted for a student, where the API derives one from surname+matric.
        password: newUser.password || undefined,
      }),
      success: `${newUser.names} created`,
      onSuccess: (_created, meta) => {
        // The API returns the generated password exactly once, so surface it
        // rather than silently discarding it — the admin has to pass it on.
        if (meta?.temporaryPassword) {
          toast({
            title: "Temporary password",
            description: `${meta.temporaryPassword} — share this now, it is not shown again.`,
            variant: "info",
            duration: 0,
          });
        }
        setIsAddUserOpen(false);
        setNewUser({ names: "", staffId: "", email: "", role: "STUDENT", password: "" });
        void reload();
      },
    });
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();

    await createSessionAction.run("/admin/sessions", {
      method: "POST",
      body: JSON.stringify({
        name: newSession.name,
        startsOn: newSession.startsOn,
        endsOn: newSession.endsOn,
      }),
      success: `Session ${newSession.name} created`,
      onSuccess: () => {
        setIsCreateSessionOpen(false);
        setNewSession({ name: "", startsOn: "", endsOn: "" });
        void reload();
      },
    });
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">System overview</h2>
          <p className="text-gray-500 text-[14px] mt-0.5">Monitor platform health and active sessions.</p>
        </div>
        <div className="flex items-center gap-2 text-[12px] text-gray-500 bg-white border border-gray-200 px-3 py-1.5 rounded-md shadow-xs">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>System status: <strong className="text-gray-900 font-medium">All services normal</strong></span>
        </div>
      </div>

      {/* 1. Stat Cards with mini trend sparklines */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active users — distinct accounts seen in the last 7 days */}
        <StatCard
          label="Active users"
          value={stats ? stats.activeUsers.value.toLocaleString() : "—"}
          delta={activeUsersDelta}
          trendType={activeUsersTrend}
          href="/admin/users"
          chart={
            <div className="w-16 h-8 flex items-end justify-end pb-1" title={activeUsersDelta}>
              <svg className="w-14 h-6 text-blue-500 overflow-visible" viewBox="0 0 56 24" fill="none">
                <path
                  d="M2 18 L10 16 L18 19 L26 13 L34 14 L42 8 L54 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="54" cy="3" r="2.5" fill="#1D5FD1" />
              </svg>
            </div>
          }
        />

        {/* Exams today */}
        <StatCard
          label="Exams today"
          value={stats ? String(stats.examsToday.total) : "—"}
          delta={stats ? `${stats.examsToday.inProgress} in progress` : ""}
          trendType="neutral"
          href="/admin/sessions"
          chart={
            <div className="w-16 h-8 flex items-center justify-end pb-1">
              <span className="text-[13px] font-semibold text-gray-500">today</span>
            </div>
          }
        />

        {/* Open alerts — unreviewed proctoring flags */}
        <StatCard
          label="Open alerts"
          value={stats ? String(stats.openAlerts.total) : "—"}
          delta={stats ? `${stats.openAlerts.high} high severity` : ""}
          trendType={stats && stats.openAlerts.high > 0 ? "down" : "neutral"}
          href="/admin/incidents"
          chart={
            <div className="w-16 h-8 flex items-center justify-end pb-1">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-bold">
                !
              </span>
            </div>
          }
        />

        {/* Server uptime. This is the API process, not a monthly figure — the
            endpoint reports process.uptime(), so it restarts with the service. */}
        <StatCard
          label="Server uptime"
          value={stats ? formatUptime(stats.uptimeSeconds) : "—"}
          delta="since last restart"
          trendType="up"
          href="/admin/settings"
          chart={
            <div className="w-16 h-8 flex items-center justify-end pb-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
          }
        />
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-danger/40 bg-danger-tint px-4 py-3"
        >
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-danger-ink" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-gray-900">Couldn&apos;t load the dashboard</p>
            <p className="mt-0.5 text-[13px] text-gray-600">
              {error.message ?? "The server did not respond."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void reload()}
            className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      <div className="w-full">
        {/* 2. Proper Interactive Platform Activity Graph */}
        <Card className="w-full">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-blue-600" />
                <h3 className="font-semibold text-[17px] text-gray-900 tracking-tight">
                  Platform activity & traffic
                </h3>
              </div>
              <p className="text-[13px] text-gray-500 mt-0.5">
                Real-time student & faculty session volume over time
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Metric Switcher */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[12px] font-medium">
                <button
                  type="button"
                  onClick={() => setMetric("logins")}
                  className={`px-2.5 py-1 rounded-[6px] transition-all ${
                    metric === "logins"
                      ? "bg-white text-blue-900 font-semibold shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Logins
                </button>
                <button
                  type="button"
                  onClick={() => setMetric("exams")}
                  className={`px-2.5 py-1 rounded-[6px] transition-all ${
                    metric === "exams"
                      ? "bg-white text-blue-900 font-semibold shadow-xs"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  Exams
                </button>
              </div>

              {/* Time Range Selector */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200 text-[12px] font-medium">
                {(["7d", "14d", "30d"] as const).map((range) => (
                  <button
                    key={range}
                    type="button"
                    onClick={() => setTimeRange(range)}
                    className={`px-2 py-1 rounded-[6px] transition-all ${
                      timeRange === range
                        ? "bg-white text-blue-900 font-semibold shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    {range.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Chart Style Toggle */}
              <div className="flex bg-gray-100 p-0.5 rounded-lg border border-gray-200">
                <button
                  type="button"
                  title="Area chart"
                  onClick={() => setChartType("area")}
                  className={`p-1 rounded-[6px] transition-all ${
                    chartType === "area"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Activity size={15} />
                </button>
                <button
                  type="button"
                  title="Bar chart"
                  onClick={() => setChartType("bar")}
                  className={`p-1 rounded-[6px] transition-all ${
                    chartType === "bar"
                      ? "bg-white text-blue-700 shadow-xs"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <BarChart3 size={15} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Graph KPIs */}
          <div className="grid grid-cols-3 gap-3 py-3 border-b border-gray-100 bg-gray-50/50 rounded-lg px-3 mt-3">
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Peak in period</span>
              <span className="text-[17px] font-bold text-gray-900">
                {peakVal.toLocaleString()} {metric === "logins" ? "users" : "exams"}
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Daily average</span>
              <span className="text-[17px] font-bold text-gray-900">
                {avgVal.toLocaleString()} / day
              </span>
            </div>
            <div>
              <span className="text-[11px] font-medium text-gray-500 uppercase tracking-wider block">Total volume</span>
              <span className="text-[17px] font-bold text-blue-600">
                {totalVal.toLocaleString()} {metric}
              </span>
            </div>
          </div>

          {/* The Graph */}
          <div className="h-[280px] w-full mt-4">
            {mounted ? (
              <ResponsiveContainer width="100%" height="100%">
                {chartType === "area" ? (
                  <AreaChart data={visibleData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B7BEA" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3B7BEA" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={{ stroke: '#E1E5EB' }}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6B7587' }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6B7587' }}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                    />
                    <Tooltip
                      cursor={{ stroke: '#3B7BEA', strokeWidth: 1.5, strokeDasharray: '4 4' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const val = data[metric];
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-[13px] min-w-[140px]">
                              <p className="font-semibold text-gray-900 mb-1">{data.date}, 2026</p>
                              <div className="flex items-center justify-between gap-3">
                                <span className="flex items-center gap-1.5 text-gray-600">
                                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
                                  {metric === "logins" ? "Logins" : "Exams"}
                                </span>
                                <span className="font-bold text-gray-900">{val.toLocaleString()}</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey={metric}
                      stroke="#1D5FD1"
                      strokeWidth={2.5}
                      fillOpacity={1}
                      fill="url(#activityGradient)"
                      activeDot={{ r: 6, fill: '#0B2A5B', stroke: '#FFFFFF', strokeWidth: 2 }}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={visibleData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EEF1F5" vertical={false} />
                    <XAxis
                      dataKey="date"
                      axisLine={{ stroke: '#E1E5EB' }}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6B7587' }}
                      dy={8}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 11, fill: '#6B7587' }}
                      tickFormatter={(val) => (val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val)}
                    />
                    <Tooltip
                      cursor={{ fill: '#F0F5FD' }}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #E1E5EB',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                      }}
                    />
                    <Bar dataKey={metric} radius={[4, 4, 0, 0]}>
                      {visibleData.map((entry, index) => {
                        const isPeak = entry[metric] === peakVal;
                        return (
                          <Cell
                            key={`cell-${index}`}
                            fill={isPeak ? '#0B2A5B' : '#3B7BEA'}
                          />
                        );
                      })}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-50/50 rounded-lg">
                <span className="text-[13px] text-gray-400">Loading chart data...</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 4. Recent audit events */}
        <Card
          title="Recent audit events"
          action={{ label: "View all", href: "/admin/audit" }}
          className="col-span-1 lg:col-span-2"
          noPadding
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-blue-50/70 border-b border-gray-200">
                  <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Time</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">User</th>
                  <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {(data?.recent ?? []).map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">
                      {formatWhen(event.at)}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-gray-900 font-medium whitespace-nowrap">
                      {event.actorName}
                    </td>
                    <td className="px-4 py-3 text-[14px] text-gray-700">
                      {actionLabel(event.action)}
                      {event.targetLabel ? (
                        <span className="text-gray-500"> · {event.targetLabel}</span>
                      ) : null}
                    </td>
                  </tr>
                ))}
                {!loading && (data?.recent ?? []).length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[13px] text-gray-500">
                      No audit activity recorded yet.
                    </td>
                  </tr>
                )}
                {loading && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-[13px] text-gray-500">
                      <Loader2 size={16} className="inline animate-spin mr-2" />
                      Loading recent activity…
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* 5. Quick actions - NOW FULLY CLICKABLE & INTERACTIVE */}
        <Card title="Quick actions">
          <div className="flex flex-col gap-3 mt-2">
            {/* Action 1: Add user */}
            <button
              type="button"
              onClick={() => setIsAddUserOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50/30 text-gray-900 transition-all text-left group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <UserPlus size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900 group-hover:text-blue-700">Add user</div>
                  <div className="text-[12px] text-gray-500">Student, lecturer or staff</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Action 2: Create session */}
            <button
              type="button"
              onClick={() => setIsCreateSessionOpen(true)}
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50/30 text-gray-900 transition-all text-left group shadow-2xs cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <CalendarPlus size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900 group-hover:text-indigo-700">Create session</div>
                  <div className="text-[12px] text-gray-500">Academic semester schedule</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            {/* Action 3: Live Invigilation */}
            <Link
              href="/admin/live"
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-white hover:border-emerald-500 hover:bg-emerald-50/30 text-gray-900 transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Radio size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900 group-hover:text-emerald-700">Live invigilation</div>
                  <div className="text-[12px] text-gray-500">Monitor workstations & candidate states</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all" />
            </Link>

            {/* Action 4: Exam Schedule */}
            <Link
              href="/admin/schedule"
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50/30 text-gray-900 transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Calendar size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900 group-hover:text-blue-700">Exam schedule</div>
                  <div className="text-[12px] text-gray-500">Allocate dates, venues &amp; session windows</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500">
            <span>Administration:</span>
            <div className="flex gap-3">
              <Link href="/admin/structure" className="text-blue-600 hover:underline font-medium">
                Colleges & Depts &rarr;
              </Link>
              <Link href="/admin/results" className="text-blue-600 hover:underline font-medium">
                Results &rarr;
              </Link>
            </div>
          </div>
        </Card>
      </div>

      {/* SIDE PANEL 1: ADD USER */}
      {isAddUserOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsAddUserOpen(false)}
            aria-hidden="true"
          />
          <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <UserPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-gray-900">Add new user</h3>
                    <p className="text-[12px] text-gray-500">Create login credentials and assign roles</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddUserOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form id="addUserSideForm" onSubmit={handleCreateUser} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. Dr. Babatunde Lawal"
                    value={newUser.names}
                    onChange={(e) => setNewUser({ ...newUser, names: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">
                      Staff / Matric ID <span className="text-red-500">*</span>
                    </label>
                    <Input
                      required
                      placeholder="e.g. STAFF/089"
                      value={newUser.staffId}
                      onChange={(e) => setNewUser({ ...newUser, staffId: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">Role</label>
                    <select
                      className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      value={newUser.role}
                      onChange={(e) =>
                        setNewUser({
                          ...newUser,
                          role: e.target.value as (typeof ROLE_OPTIONS)[number]["key"],
                        })
                      }
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="user@lasustech.edu.ng"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Password</label>
                  <Input
                    type="password"
                    autoComplete="new-password"
                    placeholder="Leave blank to generate one"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                  <p className="mt-1 text-[12px] text-gray-500">
                    Students get a default password derived from their name and matric number.
                    Staff passwords are generated and shown once after creation. Assign a
                    department later from the Users page.
                  </p>
                </div>
              </form>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
                <Link
                  href="/admin/users"
                  className="text-[13px] text-blue-600 hover:underline font-medium"
                  onClick={() => setIsAddUserOpen(false)}
                >
                  Go to Users table &rarr;
                </Link>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsAddUserOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" form="addUserSideForm">
                    Create user
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SIDE PANEL 2: CREATE SESSION */}
      {isCreateSessionOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={() => setIsCreateSessionOpen(false)}
            aria-hidden="true"
          />
          <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
              <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/70 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                    <CalendarPlus size={18} />
                  </div>
                  <div>
                    <h3 className="text-[17px] font-semibold text-gray-900">Create session</h3>
                    <p className="text-[12px] text-gray-500">Define an academic calendar & exam term</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsCreateSessionOpen(false)}
                  className="text-gray-400 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form id="createSessionSideForm" onSubmit={handleCreateSession} className="flex-1 overflow-y-auto p-6 space-y-4">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">
                    Academic Session Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    required
                    placeholder="e.g. 2027/2028 Academic Session"
                    value={newSession.name}
                    onChange={(e) => setNewSession({ ...newSession, name: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      required
                      value={newSession.startsOn}
                      onChange={(e) => setNewSession({ ...newSession, startsOn: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="date"
                      required
                      value={newSession.endsOn}
                      onChange={(e) => setNewSession({ ...newSession, endsOn: e.target.value })}
                    />
                  </div>
                </div>
                <p className="text-[12px] text-gray-500">
                  Semester dates can be configured after the session is created.
                </p>
              </form>

              <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3 shrink-0">
                <Link
                  href="/admin/sessions"
                  className="text-[13px] text-blue-600 hover:underline font-medium"
                  onClick={() => setIsCreateSessionOpen(false)}
                >
                  View sessions schedule &rarr;
                </Link>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsCreateSessionOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" form="createSessionSideForm">
                    Save session
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
