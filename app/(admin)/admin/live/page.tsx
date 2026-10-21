"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Radio, Users, AlertTriangle, MapPin, CheckCircle2, Search, Monitor, ShieldAlert, Power, RefreshCw, Loader2,
} from "lucide-react";
import Link from "next/link";
import { useApi, useDebounced } from "@/lib/useApi";
import { useRealtimeEvent } from "@/lib/realtime";
import { ErrorBanner } from "@/components/admin/ui";

type SittingStatus = "SCHEDULED" | "OPEN" | "CLOSED";

interface LiveSession {
  id: string;
  examId: string;
  examTitle: string;
  courseCode: string;
  courseTitle: string;
  startsAt: string;
  endsAt: string;
  durationMin: number;
  venue: string;
  status: SittingStatus;
  registered: number;
  terminals: number;
  invigilators: number;
  active: number;
  submitted: number;
  flagged: number;
  offline: number;
}

interface LiveMeta {
  today: string;
  counts: { sessions: number; active: number; flagged: number; offline: number };
}

const lagosTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(iso),
  );

export default function AdminLiveInvigilation() {
  const [filter, setFilter] = React.useState<"all" | "live" | "upcoming" | "completed">("all");
  const [search, setSearch] = React.useState("");
  const debounced = useDebounced(search, 300);

  const status = filter === "live" ? "OPEN" : filter === "upcoming" ? "SCHEDULED" : filter === "completed" ? "CLOSED" : "ALL";
  const query = new URLSearchParams({ status });
  if (debounced.trim()) query.set("search", debounced.trim());

  const { data, meta, error, loading, reload } = useApi<LiveSession[], LiveMeta>(
    `/admin/live?${query.toString()}`,
    { keepPrevious: true },
  );
  const sessions = data ?? [];

  // The live console is the one page that should poll on its own.
  React.useEffect(() => {
    const timer = setInterval(() => void reload(), 15_000);
    return () => clearInterval(timer);
  }, [reload]);

  // Instant update via WebSocket event
  useRealtimeEvent("sitting.status", () => {
    void reload();
  });
  useRealtimeEvent("sitting.created", () => {
    void reload();
  });

  const [refreshing, setRefreshing] = React.useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  };

  const liveSessions = sessions.filter((s) => s.status === "OPEN");
  const liveSession = liveSessions[0];
  const counts = meta?.counts;
  const registered = sessions.reduce((n, s) => n + s.registered, 0);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Invigilation Console
            </span>
          </div>
          <h2 className="text-[26px] font-bold text-gray-900 tracking-tight">
            Today&apos;s Examinations &amp; Live Sessions
          </h2>
          <p className="text-[14px] text-gray-500">
            Real-time candidate supervision, workstation verification, and emergency exam controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="outline" onClick={refresh} isLoading={refreshing}>
            <RefreshCw className="mr-2" size={16} /> Refresh
          </Button>
          <Link
            href="/admin/incidents"
            className="inline-flex h-10 items-center justify-center rounded-md border border-rose-200 bg-white px-4 text-[15px] font-medium text-rose-600 transition-colors hover:bg-rose-50"
          >
            <ShieldAlert className="mr-2" size={16} /> Incident Reports
          </Link>
          {liveSession && (
            <Link
              href={`/admin/live/${liveSession.id}`}
              className="inline-flex h-10 items-center justify-center rounded-md bg-blue-600 px-4 text-[15px] font-medium text-white transition-colors hover:bg-blue-700"
            >
              <Radio className="mr-2" size={16} /> Open Candidate Grid
            </Link>
          )}
        </div>
      </div>

      {error && <ErrorBanner error={error} onRetry={reload} />}

      {/* KPI banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Candidates</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {counts?.active ?? 0}
            <span className="text-xs text-gray-400 font-normal ml-1.5">/ {registered}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">
            {liveSessions.length} live session{liveSessions.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Submitted Papers</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {sessions.reduce((n, s) => n + s.submitted, 0)}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Verified by server</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Flagged Workstations</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">{counts?.flagged ?? 0}</div>
          <span className="text-[11px] text-amber-600 font-medium">Open proctoring flags</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Offline Workstations</span>
            <Power size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">{counts?.offline ?? 0}</div>
          <span className="text-[11px] text-rose-600 font-medium">No heartbeat in the last 60 seconds</span>
        </div>
      </div>

      {/* Filter and list */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search by course code, title, or hall..."
              className="pl-9 h-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {(["all", "live", "upcoming", "completed"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                  filter === tab
                    ? "bg-slate-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {loading && !sessions.length ? (
            <div className="p-10 text-center text-[14px] text-gray-500">
              <Loader2 size={18} className="animate-spin inline mr-2" /> Loading today&apos;s sessions...
            </div>
          ) : sessions.length === 0 ? (
            <div className="p-10 text-center text-[14px] text-gray-500">
              No sittings{filter === "all" ? "" : ` marked ${filter}`} for today.{" "}
              <Link href="/admin/schedule" className="text-blue-600 hover:underline">
                Schedule one
              </Link>
              .
            </div>
          ) : (
            sessions.map((session) => (
              <div key={session.id} className="p-6 hover:bg-gray-50/60 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono font-bold text-sm bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded">
                        {session.courseCode}
                      </span>
                      <Badge
                        variant={
                          session.status === "OPEN"
                            ? "success-solid"
                            : session.status === "SCHEDULED"
                              ? "blue-outline"
                              : "gray-solid"
                        }
                        className="capitalize font-semibold text-xs"
                      >
                        {session.status === "OPEN" ? "live" : session.status === "SCHEDULED" ? "upcoming" : "completed"}
                      </Badge>
                      <span className="text-xs text-gray-500 font-medium">
                        {lagosTime(session.startsAt)} – {lagosTime(session.endsAt)}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-gray-900">{session.courseTitle}</h3>
                    <p className="text-[12px] text-gray-500">{session.examTitle}</p>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600 font-medium">
                      <span className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-gray-400" />
                        {session.venue}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Monitor size={14} className="text-gray-400" />
                        {session.terminals} seats
                      </span>
                      <span>{session.invigilators} invigilator(s)</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 shrink-0">
                    <div className="grid grid-cols-4 gap-3 text-center border-l border-gray-200 pl-6 hidden sm:grid">
                      <div>
                        <span className="text-[11px] text-gray-400 block font-medium">Registered</span>
                        <span className="text-base font-bold text-gray-900">{session.registered}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 block font-medium">Active</span>
                        <span className="text-base font-bold text-blue-600">{session.active}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 block font-medium">Flagged</span>
                        <span className="text-base font-bold text-amber-600">{session.flagged}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-gray-400 block font-medium">Offline</span>
                        <span className="text-base font-bold text-rose-600">{session.offline}</span>
                      </div>
                    </div>

                    <Link
                      href={`/admin/live/${session.id}`}
                      className={`inline-flex h-10 items-center justify-center rounded-md px-4 text-[15px] font-medium transition-colors ${
                        session.status === "OPEN"
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "border border-gray-300 bg-white text-gray-900 hover:border-blue-700 hover:text-blue-700"
                      }`}
                    >
                      <Radio size={14} className="mr-1.5" />
                      {session.status === "OPEN" ? "Live Monitor" : "View Candidates"}
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
