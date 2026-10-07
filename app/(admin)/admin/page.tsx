"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, StatCard } from "@/components/ui/card";
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
  ShieldAlert
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
const fullTrafficData = [
  { date: 'Sep 08', logins: 380, exams: 2 },
  { date: 'Sep 09', logins: 410, exams: 3 },
  { date: 'Sep 10', logins: 395, exams: 2 },
  { date: 'Sep 11', logins: 450, exams: 4 },
  { date: 'Sep 12', logins: 480, exams: 3 },
  { date: 'Sep 13', logins: 220, exams: 1 },
  { date: 'Sep 14', logins: 190, exams: 0 },
  { date: 'Sep 15', logins: 510, exams: 4 },
  { date: 'Sep 16', logins: 530, exams: 5 },
  { date: 'Sep 17', logins: 490, exams: 3 },
  { date: 'Sep 18', logins: 560, exams: 5 },
  { date: 'Sep 19', logins: 600, exams: 4 },
  { date: 'Sep 20', logins: 250, exams: 1 },
  { date: 'Sep 21', logins: 450, exams: 3 },
  { date: 'Sep 22', logins: 520, exams: 4 },
  { date: 'Sep 23', logins: 490, exams: 3 },
  { date: 'Sep 24', logins: 590, exams: 5 },
  { date: 'Sep 25', logins: 700, exams: 6 },
  { date: 'Sep 26', logins: 610, exams: 4 },
  { date: 'Sep 27', logins: 300, exams: 1 },
  { date: 'Sep 28', logins: 280, exams: 1 },
  { date: 'Sep 29', logins: 800, exams: 5 },
  { date: 'Sep 30', logins: 950, exams: 7 },
  { date: 'Oct 01', logins: 1100, exams: 6 },
  { date: 'Oct 02', logins: 1250, exams: 8 },
  { date: 'Oct 03', logins: 900, exams: 5 },
  { date: 'Oct 04', logins: 1284, exams: 6 },
];

const initialAuditEvents = [
  { id: "req_9f8a", time: "10:42 AM", user: "N. Osadare", action: "Created session 2026/2027" },
  { id: "req_8b3c", time: "09:15 AM", user: "T. Bello", action: "Approved CSC 301 exam" },
  { id: "req_7d1e", time: "08:50 AM", user: "System", action: "Automated backup completed" },
  { id: "req_6c9f", time: "Yesterday", user: "A. Ibrahim", action: "Paused student exam (CSC/22/101)" },
  { id: "req_5e4d", time: "Yesterday", user: "N. Osadare", action: "Changed password rules" },
  { id: "req_4a2b", time: "Yesterday", user: "System", action: "Realtime sync reset" },
];

export default function AdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [timeRange, setTimeRange] = useState<"7d" | "14d" | "30d">("14d");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const [metric, setMetric] = useState<"logins" | "exams">("logins");
  const [auditEvents, setAuditEvents] = useState(initialAuditEvents);

  // Quick action modals & toasts
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [newUser, setNewUser] = useState({
    name: "",
    staffId: "",
    email: "",
    role: "Student",
    dept: "Computer Science"
  });

  const [newSession, setNewSession] = useState({
    name: "2027/2028 Session",
    semester: "Harmattan Semester",
    startDate: "2027-10-01",
    endDate: "2028-03-31"
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter data based on selected time range
  const visibleData = fullTrafficData.slice(
    timeRange === "7d" ? -7 : timeRange === "14d" ? -14 : 0
  );

  // Calculations for graph KPIs
  const currentMetricValues = visibleData.map(d => d[metric]);
  const peakVal = Math.max(...currentMetricValues);
  const totalVal = currentMetricValues.reduce((a, b) => a + b, 0);
  const avgVal = Math.round(totalVal / visibleData.length);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim()) return;

    const event = {
      id: `req_${Math.random().toString(36).substr(2, 4)}`,
      time: "Just now",
      user: "Admin (You)",
      action: `Created user ${newUser.name} (${newUser.role})`
    };

    setAuditEvents([event, ...auditEvents]);
    setIsAddUserOpen(false);
    showToast(`User ${newUser.name} created successfully!`);
    setNewUser({ name: "", staffId: "", email: "", role: "Student", dept: "Computer Science" });
  };

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.name.trim()) return;

    const event = {
      id: `req_${Math.random().toString(36).substr(2, 4)}`,
      time: "Just now",
      user: "Admin (You)",
      action: `Created session ${newSession.name} (${newSession.semester})`
    };

    setAuditEvents([event, ...auditEvents]);
    setIsCreateSessionOpen(false);
    showToast(`Session ${newSession.name} created successfully!`);
  };

  return (
    <div className="space-y-6 pb-12 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
          <span className="text-[14px] font-medium">{toastMessage}</span>
        </div>
      )}

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
        {/* Active users */}
        <StatCard
          label="Active users"
          value="1,284"
          delta="+8% vs last week"
          trendType="up"
          href="/admin/users"
          chart={
            <div className="w-16 h-8 flex items-end justify-end pb-1" title="User trend +8%">
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
          value="6"
          delta="2 in progress"
          trendType="neutral"
          href="/admin/sessions"
          chart={
            <div className="w-16 h-8 flex items-end justify-end gap-1 pb-1" title="6 scheduled today">
              <span className="w-1.5 h-3 bg-blue-200 rounded-xs"></span>
              <span className="w-1.5 h-4 bg-blue-300 rounded-xs"></span>
              <span className="w-1.5 h-5 bg-blue-400 rounded-xs"></span>
              <span className="w-1.5 h-6 bg-blue-600 rounded-xs"></span>
              <span className="w-1.5 h-3 bg-blue-300 rounded-xs"></span>
            </div>
          }
        />

        {/* Open alerts */}
        <StatCard
          label="Open alerts"
          value="3"
          delta="2 critical"
          trendType="down"
          href="/admin/audit"
          chart={
            <div className="w-16 h-8 flex items-center justify-end pb-1">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-amber-50 text-amber-600 border border-amber-200 text-[11px] font-bold">
                !
              </span>
            </div>
          }
        />

        {/* Uptime this month */}
        <StatCard
          label="Uptime this month"
          value="99.9%"
          delta="Optimal"
          trendType="up"
          href="/admin/settings"
          chart={
            <div className="w-16 h-8 flex items-center justify-end pb-1">
              <div className="w-14 bg-gray-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 2. Proper Interactive Platform Activity Graph */}
        <Card className="col-span-1 lg:col-span-2">
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

        {/* 3. System Health Card */}
        <Card title="System health">
          <div className="space-y-6 mt-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={20} />
                <span className="text-[15px] font-medium text-gray-900">API Gateway</span>
              </div>
              <span className="text-[13px] text-gray-500 font-mono">12 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={20} />
                <span className="text-[15px] font-medium text-gray-900">Database</span>
              </div>
              <span className="text-[13px] text-gray-500 font-mono">45 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="text-amber-500" size={20} />
                <span className="text-[15px] font-medium text-gray-900">Realtime Socket</span>
              </div>
              <span className="text-[13px] text-amber-600 font-mono font-medium">320 ms</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={20} />
                <span className="text-[15px] font-medium text-gray-900">File Storage</span>
              </div>
              <span className="text-[13px] text-gray-500 font-mono">80 ms</span>
            </div>
            <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500">
              <span>Last checked 20s ago</span>
              <Link href="/admin/settings" className="text-blue-600 hover:underline font-medium">
                Diagnostics &rarr;
              </Link>
            </div>
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
                {auditEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-[13px] text-gray-500 whitespace-nowrap">{event.time}</td>
                    <td className="px-4 py-3 text-[14px] text-gray-900 font-medium whitespace-nowrap">{event.user}</td>
                    <td className="px-4 py-3 text-[14px] text-gray-700">{event.action}</td>
                  </tr>
                ))}
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

            {/* Action 3: Open settings */}
            <Link
              href="/admin/settings"
              className="w-full flex items-center justify-between p-3.5 rounded-lg border border-gray-200 bg-white hover:border-blue-500 hover:bg-blue-50/30 text-gray-900 transition-all text-left group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-md bg-slate-100 text-slate-700 group-hover:bg-slate-800 group-hover:text-white transition-colors">
                  <Settings size={18} />
                </div>
                <div>
                  <div className="text-[14px] font-semibold text-gray-900 group-hover:text-slate-900">Open settings</div>
                  <div className="text-[12px] text-gray-500">System configuration & backups</div>
                </div>
              </div>
              <ArrowRight size={16} className="text-gray-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[12px] text-gray-500">
            <span>More administration:</span>
            <Link href="/admin/structure" className="text-blue-600 hover:underline font-medium">
              Departments & Courses &rarr;
            </Link>
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
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
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
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    >
                      <option value="Student">Student</option>
                      <option value="Lecturer">Lecturer</option>
                      <option value="Exam Officer">Exam Officer</option>
                      <option value="Admin">Administrator</option>
                      <option value="Invigilator">Invigilator</option>
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
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Department</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={newUser.dept}
                    onChange={(e) => setNewUser({ ...newUser, dept: e.target.value })}
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Software Engineering">Software Engineering</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electrical Engineering">Electrical Engineering</option>
                    <option value="Registry">Registry / Exams Office</option>
                  </select>
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

                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Semester</label>
                  <select
                    className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                    value={newSession.semester}
                    onChange={(e) => setNewSession({ ...newSession, semester: e.target.value })}
                  >
                    <option value="Harmattan Semester">Harmattan Semester (1st Semester)</option>
                    <option value="Rain Semester">Rain Semester (2nd Semester)</option>
                    <option value="Full Academic Year">Full Academic Year</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">
                      Start Date
                    </label>
                    <Input
                      type="date"
                      value={newSession.startDate}
                      onChange={(e) => setNewSession({ ...newSession, startDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-medium text-gray-700 block mb-1">
                      End Date
                    </label>
                    <Input
                      type="date"
                      value={newSession.endDate}
                      onChange={(e) => setNewSession({ ...newSession, endDate: e.target.value })}
                    />
                  </div>
                </div>
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
