"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Wifi,
  WifiOff,
  Flag,
  CheckCircle2,
  Clock,
  Pause,
  Play,
  Send,
  ShieldAlert,
  ArrowLeft,
  RefreshCw,
  LayoutGrid,
  List,
  Download,
  Megaphone,
  MapPin,
  SlidersHorizontal,
  Eye,
  RotateCcw,
  UserCheck,
  Ban,
  Timer,
  Loader2,
  Camera,
  Video,
  VideoOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiClient, apiDownload } from "@/lib/apiClient";
import { getRealtimeSocket } from "@/lib/realtime";
import { useApi } from "@/lib/useApi";
import { fmtDateTime, timeAgo } from "@/lib/format";
import {
  ConfirmModal,
  ErrorBanner,
  Modal,
  errMessage,
  selectCls,
  useToast,
} from "@/components/admin/ui";

// ---------- types (mirror modules/admin/live.controller.ts) ----------

type StudentState =
  | "NOT_STARTED"
  | "ACTIVE"
  | "OFFLINE"
  | "PAUSED"
  | "SUBMITTED"
  | "AUTO_SUBMITTED"
  | "TERMINATED"
  | "EXPIRED";

interface FlagLite {
  id: string;
  ruleKey: string;
  severity: string;
  createdAt: string;
  details: unknown;
}

interface LiveStudent {
  attemptId: string | null;
  studentId: string;
  name: string;
  matricNo: string | null;
  seat: string | null;
  status: string;
  progress: number;
  answered: number;
  questionCount: number;
  flags: number;
  recentFlags: FlagLite[];
  extraMinutes: number;
  startedAt: string | null;
  deadlineAt: string | null;
  submittedAt: string | null;
  pausedAt: string | null;
  lastSeenAt: string | null;
  offlineSeconds: number | null;
  isPaused: boolean;
  state: StudentState;
}

interface IncidentLite {
  id: string;
  referenceNo: string;
  category: string;
  severity: string;
  status: string;
  candidateName: string | null;
  description: string;
  createdAt: string;
}

interface InterventionLite {
  id: string;
  attemptId: string;
  studentName: string;
  action: string;
  params: unknown;
  reason: string | null;
  actorName: string;
  createdAt: string;
}

interface LiveSitting {
  id: string;
  examId: string;
  examTitle: string;
  courseCode: string;
  courseTitle: string;
  startsAt: string;
  endsAt: string;
  durationMin: number;
  venue: string;
  venueId: string | null;
  venueCapacity: number | null;
  status: string;
  requireWebcam: boolean;
  requireSeb: boolean;
}

interface LiveDetail {
  sitting: LiveSitting;
  invigilators: { id: string; names: string; staffId: string | null }[];
  students: LiveStudent[];
  incidents: IncidentLite[];
  interventions: InterventionLite[];
}

type Filter = "all" | "active" | "flagged" | "offline" | "submitted" | "not_started";

const STATE_META: Record<StudentState, { label: string; cls: string }> = {
  NOT_STARTED: { label: "Not started", cls: "bg-gray-100 text-gray-700 border-gray-200" },
  ACTIVE: { label: "Active", cls: "bg-emerald-50 text-emerald-800 border-emerald-200" },
  OFFLINE: { label: "Offline", cls: "bg-rose-50 text-rose-800 border-rose-200" },
  PAUSED: { label: "Paused", cls: "bg-amber-50 text-amber-800 border-amber-200" },
  SUBMITTED: { label: "Submitted", cls: "bg-blue-50 text-blue-800 border-blue-200" },
  AUTO_SUBMITTED: { label: "Auto-submitted", cls: "bg-blue-50 text-blue-800 border-blue-200" },
  TERMINATED: { label: "Terminated", cls: "bg-rose-100 text-rose-900 border-rose-300" },
  EXPIRED: { label: "Expired", cls: "bg-gray-100 text-gray-700 border-gray-200" },
};

const CATEGORY_LABEL: Record<string, string> = {
  MALPRACTICE: "Malpractice & collusion",
  TECHNICAL: "Technical & workstation",
  INFRASTRUCTURE: "Infrastructure & power",
  MEDICAL: "Medical emergency",
  CONDUCT: "Candidate conduct",
};

function clock(iso: string, now: number) {
  const ms = new Date(iso).getTime() - now;
  const abs = Math.abs(ms);
  const mins = Math.floor(abs / 60_000);
  const secs = Math.floor((abs % 60_000) / 1000);
  const text = `${mins}m ${String(secs).padStart(2, "0")}s`;
  return ms >= 0 ? `${text} left` : `${text} over`;
}

function lagosTime(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Lagos",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

export default function LiveCandidateGrid() {
  const params = useParams();
  const rawExamId = params?.examId;
  const examId = (Array.isArray(rawExamId) ? rawExamId[0] : rawExamId) ?? "";
  const toast = useToast();

  const { data, error, loading, reload } = useApi<LiveDetail>(
    examId ? `/admin/live/${examId}` : null,
    { keepPrevious: true },
  );

  const [now, setNow] = React.useState(() => Date.now());
  React.useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  // The candidate grid is the live console; poll every 10 seconds.
  React.useEffect(() => {
    const t = setInterval(() => void reload(), 10_000);
    return () => clearInterval(t);
  }, [reload]);

  const [refreshing, setRefreshing] = React.useState(false);
  const refresh = async () => {
    setRefreshing(true);
    try {
      await reload();
    } finally {
      setRefreshing(false);
    }
  };

  const [filter, setFilter] = React.useState<Filter>("all");
  const [search, setSearch] = React.useState("");
  const [view, setView] = React.useState<"grid" | "table">("grid");
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const [extendFor, setExtendFor] = React.useState<LiveStudent | null>(null);
  const [messageFor, setMessageFor] = React.useState<LiveStudent | null>(null);
  const [seatFor, setSeatFor] = React.useState<LiveStudent | null>(null);
  const [flagFor, setFlagFor] = React.useState<LiveStudent | null>(null);
  const [incidentFor, setIncidentFor] = React.useState<LiveStudent | null>(null);
  const [broadcastOpen, setBroadcastOpen] = React.useState(false);
  const [extendAllOpen, setExtendAllOpen] = React.useState(false);
  const [confirmState, setConfirmState] = React.useState<ConfirmState | null>(null);
  const [busyKey, setBusyKey] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);
  const [candidateFrames, setCandidateFrames] = React.useState<Record<string, string>>({});

  // Real-time Socket.IO Connection for live video streams & instant interventions
  React.useEffect(() => {
    if (!examId) return;
    const socket = getRealtimeSocket();
    if (!socket) return;

    socket.emit("join_sitting", examId);

    const handleCameraFrame = (data: { studentId?: string; matricNo?: string; frame: string }) => {
      if (data?.frame) {
        setCandidateFrames((prev) => {
          const next = { ...prev };
          if (data.studentId) next[data.studentId] = data.frame;
          if (data.matricNo) next[data.matricNo] = data.frame;
          return next;
        });
      }
    };

    const handleLiveEvent = (payload: any) => {
      if (
        payload?.type === "attempt.intervene" ||
        payload?.type === "sitting.broadcast" ||
        payload?.type === "sitting.extend_all" ||
        payload?.type === "incident.created" ||
        payload?.type === "attempt.flagged" ||
        payload?.type === "attempt.flags_cleared" ||
        payload?.type === "attempt.seat_reassigned"
      ) {
        void reload();
      }
    };

    socket.on("candidate_camera_frame", handleCameraFrame);
    socket.on("event", handleLiveEvent);
    socket.on("attempt.intervene", handleLiveEvent);
    socket.on("sitting.broadcast", handleLiveEvent);
    socket.on("incident.created", handleLiveEvent);

    return () => {
      socket.off("candidate_camera_frame", handleCameraFrame);
      socket.off("event", handleLiveEvent);
      socket.off("attempt.intervene", handleLiveEvent);
      socket.off("sitting.broadcast", handleLiveEvent);
      socket.off("incident.created", handleLiveEvent);
    };
  }, [examId, reload]);

  const sitting = data?.sitting;
  const students = React.useMemo(() => data?.students ?? [], [data?.students]);
  const interventions = data?.interventions ?? [];
  const incidents = data?.incidents ?? [];

  const counts = React.useMemo(() => {
    const base = {
      all: students.length,
      active: 0,
      flagged: 0,
      offline: 0,
      submitted: 0,
      not_started: 0,
    };
    for (const s of students) {
      if (s.state === "ACTIVE" || s.state === "PAUSED") base.active += 1;
      if (s.flags > 0) base.flagged += 1;
      if (s.state === "OFFLINE") base.offline += 1;
      if (s.state === "SUBMITTED" || s.state === "AUTO_SUBMITTED" || s.state === "TERMINATED") base.submitted += 1;
      if (s.state === "NOT_STARTED") base.not_started += 1;
    }
    return base;
  }, [students]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    return students.filter((s) => {
      if (filter === "active" && !(s.state === "ACTIVE" || s.state === "PAUSED")) return false;
      if (filter === "flagged" && s.flags === 0) return false;
      if (filter === "offline" && s.state !== "OFFLINE") return false;
      if (
        filter === "submitted" &&
        !(s.state === "SUBMITTED" || s.state === "AUTO_SUBMITTED" || s.state === "TERMINATED")
      ) {
        return false;
      }
      if (filter === "not_started" && s.state !== "NOT_STARTED") return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        (s.matricNo ?? "").toLowerCase().includes(q) ||
        (s.seat ?? "").toLowerCase().includes(q)
      );
    });
  }, [students, filter, search]);

  const selected = students.find((s) => s.studentId === selectedId) ?? null;

  const filterTabs: { key: Filter; label: string; count: number }[] = [
    { key: "all", label: "All", count: counts.all },
    { key: "active", label: "Active", count: counts.active },
    { key: "flagged", label: "Flagged", count: counts.flagged },
    { key: "offline", label: "Offline", count: counts.offline },
    { key: "submitted", label: "Submitted", count: counts.submitted },
    { key: "not_started", label: "Not started", count: counts.not_started },
  ];

  const callIntervene = (student: LiveStudent, action: string, extra: Record<string, unknown> = {}) => {
    if (!student.attemptId) throw new Error("This candidate has not started an attempt yet.");
    return apiClient(`/admin/live/${examId}/intervene`, {
      method: "POST",
      body: JSON.stringify({ attemptId: student.attemptId, action, ...extra }),
    });
  };

  const quickIntervene = async (student: LiveStudent, action: "PAUSE" | "RESUME") => {
    setBusyKey(student.studentId);
    try {
      await callIntervene(student, action);
      toast.show(`${student.name} ${action === "PAUSE" ? "paused" : "resumed"}.`);
      await reload();
    } catch (e) {
      toast.show(errMessage(e), "err");
    } finally {
      setBusyKey(null);
    }
  };

  const exportLog = async () => {
    setExporting(true);
    try {
      await apiDownload(
        `/admin/live/${examId}/export`,
        `proctor-log-${sitting?.courseCode?.replace(/\s+/g, "-") ?? "sitting"}-${new Date()
          .toISOString()
          .slice(0, 10)}.csv`,
      );
      toast.show("Proctor log exported.");
    } catch (e) {
      toast.show(errMessage(e, "Could not export the proctor log."), "err");
    } finally {
      setExporting(false);
    }
  };

  const startAction = () => setSelectedId(null);

  if (!examId) {
    return (
      <div className="p-10 text-center text-gray-500">
        No sitting selected. <Link href="/admin/live" className="text-blue-600">Back to live console</Link>.
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-12">
      {toast.node}

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <Link href="/admin/live" className="text-[12px] font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1">
              <ArrowLeft size={14} /> Live console
            </Link>
            <span className="text-gray-300">•</span>
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600" />
              </span>
              Live workstation grid
            </span>
            {sitting && (
              <Badge
                variant={sitting.status === "OPEN" ? "success-solid" : sitting.status === "CLOSED" ? "gray-solid" : "blue-outline"}
                className="text-[11px]"
              >
                {sitting.status === "OPEN" ? "Sitting open" : sitting.status === "CLOSED" ? "Sitting closed" : sitting.status}
              </Badge>
            )}
          </div>

          <h1 className="text-[24px] font-bold text-gray-900 tracking-tight truncate">
            {sitting ? `${sitting.courseCode} — ${sitting.courseTitle}` : loading ? "Loading sitting..." : "Sitting"}
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-gray-600 mt-1">
            {sitting && (
              <>
                <span className="inline-flex items-center gap-1"><MapPin size={13} className="text-gray-400" />{sitting.venue}</span>
                <span className="inline-flex items-center gap-1"><Clock size={13} className="text-gray-400" />{lagosTime(sitting.startsAt)} – {lagosTime(sitting.endsAt)}</span>
                <span>{sitting.durationMin} minutes</span>
                <span className="text-gray-500">{sitting.examTitle}</span>
                <span className="inline-flex items-center gap-1"><Timer size={13} className="text-gray-400" />{clock(sitting.endsAt, now)}</span>
                {sitting.requireWebcam && <span className="text-amber-700">Webcam required</span>}
                {sitting.requireSeb && <span className="text-amber-700">SEB required</span>}
              </>
            )}
          </div>
          {data?.invigilators?.length ? (
            <p className="text-[12px] text-gray-500 mt-1">
              Invigilators: {data.invigilators.map((i) => i.names).join(", ")}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button variant="outline" onClick={refresh} isLoading={refreshing}>
            {!refreshing && <RefreshCw size={16} className="mr-2" />} Refresh
          </Button>
          <Button variant="secondary" onClick={exportLog} isLoading={exporting}>
            {!exporting && <Download size={16} className="mr-2" />} Proctor log
          </Button>
          <Button variant="secondary" onClick={() => setBroadcastOpen(true)}>
            <Megaphone size={16} className="mr-2" /> Broadcast
          </Button>
          <Button onClick={() => setExtendAllOpen(true)}>
            <Timer size={16} className="mr-2" /> Extend all
          </Button>
        </div>
      </div>

      {error && <ErrorBanner error={error} onRetry={reload} />}

      {/* KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Kpi label="Registered" value={counts.all} tone="text-gray-900" icon={<UserCheck size={16} className="text-gray-400" />} />
        <Kpi label="Active" value={counts.active} tone="text-blue-700" icon={<Wifi size={16} className="text-blue-600" />} />
        <Kpi label="Flagged" value={counts.flagged} tone="text-amber-700" icon={<Flag size={16} className="text-amber-600" />} />
        <Kpi label="Offline" value={counts.offline} tone="text-rose-700" icon={<WifiOff size={16} className="text-rose-600" />} />
        <Kpi label="Submitted" value={counts.submitted} tone="text-emerald-700" icon={<CheckCircle2 size={16} className="text-emerald-600" />} />
      </div>

      {/* Toolbar */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[220px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search name, matric number or seat..."
              className="pl-9 h-9 bg-white"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 flex-wrap">
              {filterTabs.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors ${
                    filter === key
                      ? "bg-slate-900 text-white"
                      : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  {label} <span className={filter === key ? "text-gray-300" : "text-gray-400"}>{count}</span>
                </button>
              ))}
            </div>

            <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
              <button
                onClick={() => setView("grid")}
                aria-label="Grid view"
                className={`p-1.5 rounded-md ${view === "grid" ? "bg-slate-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => setView("table")}
                aria-label="Table view"
                className={`p-1.5 rounded-md ${view === "table" ? "bg-slate-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                <List size={15} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4">
          {loading && !students.length ? (
            <div className="p-10 text-center text-[14px] text-gray-500">
              <Loader2 size={18} className="animate-spin inline mr-2" /> Loading candidates...
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-[14px] text-gray-500">
              No candidates match this view.
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {filtered.map((s) => (
                <CandidateCard
                  key={s.studentId}
                  student={s}
                  frame={candidateFrames[s.studentId] || (s.attemptId ? candidateFrames[s.attemptId] : undefined) || (s.matricNo ? candidateFrames[s.matricNo] : undefined)}
                  now={now}
                  busy={busyKey === s.studentId}
                  onInspect={() => setSelectedId(s.studentId)}
                  onPauseResume={() => void quickIntervene(s, s.isPaused ? "RESUME" : "PAUSE")}
                />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto border border-gray-200 rounded-xl">
              <table className="w-full text-left text-[13px] min-w-[860px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 text-[11px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-2.5 px-4">Seat</th>
                    <th className="py-2.5 px-4">Candidate</th>
                    <th className="py-2.5 px-4">State</th>
                    <th className="py-2.5 px-4">Progress</th>
                    <th className="py-2.5 px-4">Flags</th>
                    <th className="py-2.5 px-4">Extra</th>
                    <th className="py-2.5 px-4">Last seen</th>
                    <th className="py-2.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((s) => (
                    <tr key={s.studentId} className="hover:bg-gray-50/70">
                      <td className="py-2.5 px-4 font-mono font-bold text-gray-900">{s.seat ?? "—"}</td>
                      <td className="py-2.5 px-4">
                        <div className="font-semibold text-gray-900">{s.name}</div>
                        <div className="text-[11px] text-gray-500 font-mono">{s.matricNo ?? "—"}</div>
                      </td>
                      <td className="py-2.5 px-4"><StateChip state={s.state} /></td>
                      <td className="py-2.5 px-4 min-w-[130px]">
                        <Progress student={s} />
                      </td>
                      <td className="py-2.5 px-4">
                        {s.flags > 0 ? (
                          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold">
                            <Flag size={13} /> {s.flags}
                          </span>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="py-2.5 px-4 text-gray-700">{s.extraMinutes > 0 ? `+${s.extraMinutes}m` : "—"}</td>
                      <td className="py-2.5 px-4 text-gray-600 text-[12px]">
                        {s.lastSeenAt ? timeAgo(s.lastSeenAt) : "No heartbeat"}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <Button size="sm" variant="secondary" className="h-8" onClick={() => setSelectedId(s.studentId)}>
                          <Eye size={13} className="mr-1.5" /> Inspect
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Activity panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-gray-400" /> Recent interventions
            </h3>
            <span className="text-[11px] text-gray-500">{interventions.length} recorded</span>
          </div>
          {interventions.length === 0 ? (
            <p className="text-[13px] text-gray-500 py-6 text-center">No invigilator interventions yet.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {interventions.slice(0, 20).map((i) => (
                <div key={i.id} className="text-[12px] border border-gray-100 rounded-lg p-2.5 bg-gray-50/60">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-gray-900">{i.studentName}</span>
                    <span className="text-gray-500">{fmtDateTime(i.createdAt)}</span>
                  </div>
                  <div className="text-gray-700 mt-0.5">
                    <span className="font-mono text-[11px] font-bold text-blue-700">{i.action}</span>
                    {i.reason ? ` — ${i.reason}` : ""}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-0.5">by {i.actorName}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[14px] font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert size={16} className="text-rose-500" /> Open incident dockets
            </h3>
            <Link href="/admin/incidents" className="text-[11px] text-blue-600 hover:underline">
              All dockets
            </Link>
          </div>
          {incidents.length === 0 ? (
            <p className="text-[13px] text-gray-500 py-6 text-center">No open dockets for this sitting.</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {incidents.map((i) => (
                <div key={i.id} className="text-[12px] border border-rose-100 rounded-lg p-2.5 bg-rose-50/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-bold text-rose-800">{i.referenceNo}</span>
                    <span className="text-gray-500">{fmtDateTime(i.createdAt)}</span>
                  </div>
                  <div className="text-gray-800 mt-0.5">
                    {CATEGORY_LABEL[i.category] ?? i.category} · {i.severity} · {i.status.replace("_", " ")}
                  </div>
                  <p className="text-[11px] text-gray-600 mt-0.5 line-clamp-2">{i.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Inspector */}
      {selected && (
        <InspectorModal
          student={selected}
          sittingId={examId}
          liveFrame={candidateFrames[selected.studentId] || (selected.attemptId ? candidateFrames[selected.attemptId] : undefined) || (selected.matricNo ? candidateFrames[selected.matricNo] : undefined)}
          now={now}
          onClose={() => setSelectedId(null)}
          onAction={(kind) => {
            startAction();
            if (kind === "extend") setExtendFor(selected);
            if (kind === "message") setMessageFor(selected);
            if (kind === "seat") setSeatFor(selected);
            if (kind === "flag") setFlagFor(selected);
            if (kind === "incident") setIncidentFor(selected);
            if (kind === "pause" || kind === "resume") {
              void quickIntervene(selected, kind === "pause" ? "PAUSE" : "RESUME");
            }
            if (kind === "clearFlags") {
              setConfirmState({
                title: `Clear ${selected.flags} flag(s) for ${selected.name}?`,
                body: (
                  <p>
                    All open proctoring flags for <strong>{selected.name}</strong> will be marked reviewed. This does
                    not change the candidate&apos;s score.
                  </p>
                ),
                confirmLabel: "Mark reviewed",
                success: `Flags cleared for ${selected.name}.`,
                run: () =>
                  apiClient(`/admin/live/${examId}/attempts/${selected.attemptId}/clear-flags`, { method: "POST" }),
              });
            }
            if (kind === "reset") {
              setConfirmState({
                title: `Release ${selected.name}'s session?`,
                body: (
                  <p>
                    The candidate&apos;s active login session and device lock will be cleared so they can sign in on a
                    replacement workstation. Their answers are preserved.
                  </p>
                ),
                confirmLabel: "Release session",
                success: `${selected.name}'s session released.`,
                run: () => callIntervene(selected, "RESET_SESSION"),
              });
            }
            if (kind === "end") {
              setConfirmState({
                title: `End ${selected.name}'s script?`,
                body: (
                  <p>
                    This terminates the attempt immediately and the candidate cannot resume. The script is marked
                    <strong> TERMINATED</strong> and recorded against the audit trail.
                  </p>
                ),
                confirmLabel: "End script",
                danger: true,
                success: `${selected.name}'s script ended.`,
                run: () => callIntervene(selected, "END"),
              });
            }
          }}
        />
      )}

      {/* Action modals */}
      {extendFor && (
        <MinutesModal
          title={`Grant extra time to ${extendFor.name}`}
          subtitle={`${extendFor.seat ?? "No seat"} · currently +${extendFor.extraMinutes} min`}
          max={120}
          submitLabel="Grant time"
          onSubmit={(minutes, reason) => callIntervene(extendFor, "EXTEND", { minutes, reason: reason || undefined })}
          onClose={() => setExtendFor(null)}
          onDone={async () => {
            setExtendFor(null);
            toast.show("Extra time granted.");
            await reload();
          }}
        />
      )}

      {extendAllOpen && (
        <MinutesModal
          title="Extend the whole hall"
          subtitle="Applies to every in-progress or paused attempt in this sitting"
          max={60}
          submitLabel="Extend all"
          onSubmit={(minutes, reason) =>
            apiClient(`/admin/live/${examId}/extend-all`, {
              method: "POST",
              body: JSON.stringify({ minutes, reason: reason || undefined }),
            })
          }
          onClose={() => setExtendAllOpen(false)}
          onDone={async () => {
            setExtendAllOpen(false);
            toast.show("Hall-wide extension applied.");
            await reload();
          }}
        />
      )}

      {messageFor && (
        <MessageModal
          title={`Message ${messageFor.name}`}
          subtitle="Delivered to the candidate's screen"
          submitLabel="Send message"
          onSubmit={(message, reason) => callIntervene(messageFor, "MESSAGE", { message, reason: reason || undefined })}
          onClose={() => setMessageFor(null)}
          onDone={async () => {
            setMessageFor(null);
            toast.show("Message sent.");
            await reload();
          }}
        />
      )}

      {broadcastOpen && (
        <MessageModal
          title="Broadcast to the hall"
          subtitle="Delivered to every in-progress or paused candidate"
          submitLabel="Broadcast"
          onSubmit={(message, reason) =>
            apiClient(`/admin/live/${examId}/broadcast`, {
              method: "POST",
              body: JSON.stringify({ message, reason: reason || undefined }),
            })
          }
          onClose={() => setBroadcastOpen(false)}
          onDone={async () => {
            setBroadcastOpen(false);
            toast.show("Broadcast sent to the hall.");
            await reload();
          }}
        />
      )}

      {seatFor && (
        <SeatModal
          student={seatFor}
          onSubmit={(seatLabel) =>
            apiClient(`/admin/live/${examId}/attempts/${seatFor.attemptId}/seat`, {
              method: "PATCH",
              body: JSON.stringify({ seatLabel }),
            })
          }
          onClose={() => setSeatFor(null)}
          onDone={async () => {
            setSeatFor(null);
            toast.show("Seat reassigned.");
            await reload();
          }}
        />
      )}

      {flagFor && (
        <FlagModal
          student={flagFor}
          onSubmit={(severity, note) =>
            apiClient(`/admin/live/${examId}/attempts/${flagFor.attemptId}/flag`, {
              method: "POST",
              body: JSON.stringify({ severity, ...(note ? { note } : {}) }),
            })
          }
          onClose={() => setFlagFor(null)}
          onDone={async () => {
            setFlagFor(null);
            toast.show("Manual invigilator flag recorded.");
            await reload();
          }}
        />
      )}

      {incidentFor && (
        <FileIncidentModal
          student={incidentFor}
          onSubmit={(body) => apiClient("/admin/incidents", { method: "POST", body: JSON.stringify(body) })}
          onClose={() => setIncidentFor(null)}
          onDone={async () => {
            setIncidentFor(null);
            toast.show("Incident docket filed.");
            await reload();
          }}
        />
      )}

      {confirmState && (
        <ConfirmModal
          title={confirmState.title}
          body={confirmState.body}
          confirmLabel={confirmState.confirmLabel}
          danger={confirmState.danger}
          onClose={() => setConfirmState(null)}
          onConfirm={async () => {
            await confirmState.run();
            toast.show(confirmState.success);
            setConfirmState(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

interface ConfirmState {
  title: string;
  body: React.ReactNode;
  confirmLabel: string;
  danger?: boolean;
  success: string;
  run: () => Promise<unknown>;
}

function Kpi({ label, value, tone, icon }: { label: string; value: number; tone: string; icon: React.ReactNode }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
      <div className="flex items-center justify-between text-gray-500 mb-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <div className={`text-2xl font-bold ${tone}`}>{value}</div>
    </div>
  );
}

function StateChip({ state }: { state: StudentState }) {
  const meta = STATE_META[state] ?? { label: state, cls: "bg-gray-100 text-gray-700 border-gray-200" };
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

function Progress({ student }: { student: LiveStudent }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px] text-gray-500 mb-1">
        <span>
          {student.answered}/{student.questionCount || "—"}
        </span>
        <span className="font-semibold text-gray-700">{student.progress}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full ${
            student.progress >= 100 ? "bg-emerald-500" : student.progress > 0 ? "bg-blue-500" : "bg-gray-300"
          }`}
          style={{ width: `${Math.max(2, student.progress)}%` }}
        />
      </div>
    </div>
  );
}

function CandidateCard({
  student,
  frame,
  now,
  busy,
  onInspect,
  onPauseResume,
}: {
  student: LiveStudent;
  frame?: string;
  now: number;
  busy: boolean;
  onInspect: () => void;
  onPauseResume: () => void;
}) {
  const canRun = student.attemptId && (student.state === "ACTIVE" || student.state === "OFFLINE" || student.state === "PAUSED");
  return (
    <div
      className={`rounded-xl border bg-white p-3.5 transition-shadow hover:shadow-sm ${
        student.state === "OFFLINE"
          ? "border-rose-200"
          : student.state === "PAUSED"
            ? "border-amber-200"
            : student.flags > 0
              ? "border-amber-200"
              : "border-gray-200"
      }`}
    >
      {/* Live Video / Snapshot Preview Thumbnail */}
      <div
        className="relative w-full h-28 rounded-lg overflow-hidden bg-slate-950 mb-2.5 border border-slate-800 flex items-center justify-center group cursor-pointer"
        onClick={onInspect}
      >
        {frame ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={frame} alt={student.name} className="w-full h-full object-cover transform -scale-x-100" />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500 p-2 text-center">
            <Camera size={22} className="mb-1 text-slate-600" />
            <span className="text-[10px] font-medium text-slate-400">
              {student.state === "ACTIVE" ? "Camera Standby" : "No live camera"}
            </span>
          </div>
        )}
        <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-bold text-emerald-400 border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          LIVE
        </div>
        <div className="absolute bottom-1 right-1 bg-black/70 px-1.5 py-0.5 rounded text-[9px] text-white/90 font-mono">
          {student.seat ?? "NO SEAT"}
        </div>
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[11px] font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded shrink-0">
            {student.seat ?? "NO SEAT"}
          </span>
          <StateChip state={student.state} />
        </div>
        {student.flags > 0 && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded px-1.5 py-0.5 shrink-0">
            <Flag size={11} /> {student.flags}
          </span>
        )}
      </div>

      <button onClick={onInspect} className="block text-left w-full mt-2">
        <div className="font-semibold text-[13px] text-gray-900 truncate">{student.name}</div>
        <div className="text-[11px] font-mono text-gray-500">{student.matricNo ?? "—"}</div>
      </button>

      <div className="mt-2.5">
        <Progress student={student} />
      </div>

      <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px] text-gray-500">
        <span className="flex items-center gap-1 truncate">
          {student.state === "OFFLINE" ? <WifiOff size={12} className="text-rose-500" /> : <Wifi size={12} className="text-gray-400" />}
          {student.state === "OFFLINE" && student.offlineSeconds !== null
            ? `Silent ${Math.floor(student.offlineSeconds / 60)}m ${student.offlineSeconds % 60}s`
            : student.lastSeenAt
              ? timeAgo(student.lastSeenAt)
              : "No heartbeat"}
        </span>
        <span className="text-right truncate">
          {student.deadlineAt ? clock(student.deadlineAt, now) : student.submittedAt ? "Submitted" : "No timer"}
        </span>
        {student.extraMinutes > 0 && (
          <span className="text-blue-700 font-medium">+{student.extraMinutes} min extra</span>
        )}
        {student.questionCount > 0 && (
          <span className="text-right">{student.answered} answered</span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <Button size="sm" variant="secondary" className="h-7 flex-1 text-[12px]" onClick={onInspect}>
          <Eye size={13} className="mr-1" /> Inspect
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="h-7 text-[12px]"
          disabled={!canRun || busy}
          isLoading={busy}
          onClick={onPauseResume}
          title={student.isPaused ? "Resume candidate" : "Pause candidate"}
        >
          {!busy && (student.isPaused ? <Play size={13} /> : <Pause size={13} />)}
        </Button>
      </div>
    </div>
  );
}

type InspectorAction =
  | "pause"
  | "resume"
  | "extend"
  | "message"
  | "flag"
  | "seat"
  | "incident"
  | "clearFlags"
  | "reset"
  | "end";

function InspectorModal({
  student,
  sittingId,
  liveFrame,
  now,
  onClose,
  onAction,
}: {
  student: LiveStudent;
  sittingId: string;
  liveFrame?: string;
  now: number;
  onClose: () => void;
  onAction: (action: InspectorAction) => void;
}) {
  const running = student.state === "ACTIVE" || student.state === "OFFLINE" || student.state === "PAUSED";
  const webrtcVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const pcRef = React.useRef<RTCPeerConnection | null>(null);
  const [hasWebRtcStream, setHasWebRtcStream] = React.useState(false);

  const requestLiveFeed = React.useCallback(() => {
    const socket = getRealtimeSocket();
    if (!socket || !sittingId) return;

    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    setHasWebRtcStream(false);

    try {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });
      pcRef.current = pc;

      pc.ontrack = (event) => {
        if (event.streams && event.streams[0] && webrtcVideoRef.current) {
          webrtcVideoRef.current.srcObject = event.streams[0];
          webrtcVideoRef.current.play().catch(() => {});
          setHasWebRtcStream(true);
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("webrtc_signal", {
            sittingId,
            targetSocketId: student.attemptId || student.studentId,
            signal: { candidate: event.candidate },
            kind: "invigilator",
          });
        }
      };

      socket.emit("request_live_feed", {
        sittingId,
        targetStudentId: student.attemptId || student.studentId,
        invigilatorSocketId: socket.id,
      });
    } catch (e) {
      console.warn("[WebRTC] Setup error:", e);
    }
  }, [sittingId, student.attemptId, student.studentId]);

  React.useEffect(() => {
    requestLiveFeed();
    const socket = getRealtimeSocket();
    if (!socket) return;

    const handleWebRTCSignal = async (data: any) => {
      const pc = pcRef.current;
      if (!pc) return;
      try {
        if (data.signal?.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
          if (data.signal.sdp.type === "offer") {
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit("webrtc_signal", {
              sittingId,
              targetSocketId: data.senderSocketId,
              signal: { sdp: pc.localDescription },
              kind: "invigilator",
            });
          }
        } else if (data.signal?.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
        }
      } catch (err) {
        console.warn("[WebRTC] Remote signal error:", err);
      }
    };

    socket.on("webrtc_signal", handleWebRTCSignal);

    return () => {
      socket.off("webrtc_signal", handleWebRTCSignal);
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
    };
  }, [requestLiveFeed, sittingId]);

  return (
    <Modal
      title={`${student.name} · ${student.seat ?? "no seat"}`}
      subtitle={`${student.matricNo ?? "no matric"} · ${STATE_META[student.state]?.label ?? student.state}`}
      onClose={onClose}
      width="max-w-2xl"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="space-y-4">
        {/* Live Proctoring Video Feed (WebRTC + Snapshot Relay) */}
        <div className="bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 p-3 shadow-inner">
          <div className="flex items-center justify-between mb-2 px-1">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-[12px] font-bold text-emerald-400 flex items-center gap-1.5">
                <Camera size={14} /> Candidate Live Stream
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {hasWebRtcStream ? "WebRTC HD Peer Stream" : "Continuous Snapshot Relay"}
              </span>
              <button
                type="button"
                onClick={requestLiveFeed}
                className="text-[10px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-950/60 border border-blue-800 px-2 py-0.5 rounded transition-colors"
              >
                Reconnect WebRTC
              </button>
            </div>
          </div>

          <div className="relative aspect-video w-full rounded-xl bg-black overflow-hidden flex items-center justify-center border border-slate-900">
            {/* Live WebRTC Video element */}
            <video
              ref={webrtcVideoRef}
              autoPlay
              playsInline
              muted
              className={cn("w-full h-full object-cover transform -scale-x-100", !hasWebRtcStream && "hidden")}
            />

            {/* Fallback continuous frame snapshot from candidate's browser */}
            {!hasWebRtcStream && (
              liveFrame ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={liveFrame}
                  alt={student.name}
                  className="w-full h-full object-cover transform -scale-x-100"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 p-6 text-center">
                  <VideoOff size={32} className="mb-2 text-slate-600" />
                  <span className="text-xs font-semibold text-slate-300">Awaiting Candidate Camera Feed</span>
                  <span className="text-[11px] text-slate-500 mt-1 max-w-xs">
                    Candidate webcam will display automatically once they enter the exam room.
                  </span>
                </div>
              )
            )}

            {/* Overlays on live video stream */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/80 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              PROCTOR &bull; {student.name}
            </div>
            <div className="absolute bottom-2.5 right-2.5 text-[10px] font-mono text-white/90 bg-black/80 backdrop-blur-xs px-2 py-1 rounded border border-white/10">
              {student.matricNo ?? "ID"} &bull; Seat: {student.seat ?? "Unassigned"}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Stat label="Answered" value={`${student.answered}/${student.questionCount || "—"}`} />
          <Stat label="Progress" value={`${student.progress}%`} />
          <Stat label="Extra time" value={student.extraMinutes ? `+${student.extraMinutes} min` : "None"} />
          <Stat label="Flags" value={String(student.flags)} />
          <Stat label="Started" value={student.startedAt ? fmtDateTime(student.startedAt) : "Not started"} wide />
          <Stat
            label="Deadline"
            value={student.deadlineAt ? `${fmtDateTime(student.deadlineAt)} · ${clock(student.deadlineAt, now)}` : "—"}
            wide
          />
          <Stat
            label="Last heartbeat"
            value={
              student.offlineSeconds !== null
                ? `${student.offlineSeconds}s ago`
                : student.lastSeenAt
                  ? timeAgo(student.lastSeenAt)
                  : "No heartbeat"
            }
            wide
          />
          <Stat label="Attempt status" value={student.status.replace("_", " ")} />
        </div>

        {student.recentFlags.length > 0 && (
          <div>
            <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-1.5">Open flags</h4>
            <div className="space-y-1.5">
              {student.recentFlags.map((f) => (
                <div key={f.id} className="flex items-start justify-between gap-2 text-[12px] border border-amber-200 bg-amber-50/60 rounded-lg px-2.5 py-2">
                  <div>
                    <span className="font-mono font-bold text-amber-900">{f.ruleKey}</span>
                    <span className="text-gray-600"> · {f.severity}</span>
                    {flagNote(f.details) && <p className="text-gray-700 mt-0.5">{flagNote(f.details)}</p>}
                  </div>
                  <span className="text-[11px] text-gray-500 shrink-0">{fmtDateTime(f.createdAt)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {!student.attemptId ? (
          <p className="text-[13px] text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
            This candidate has not started an attempt yet, so proctoring actions are unavailable. You can still
            reassign their seat or file an incident.
          </p>
        ) : null}

        <div className="pt-2 border-t border-gray-100">
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-gray-700 mb-2">Invigilator actions</h4>
          <div className="flex flex-wrap gap-2">
            {running &&
              (student.isPaused ? (
                <Button size="sm" onClick={() => onAction("resume")}>
                  <Play size={14} className="mr-1.5" /> Resume
                </Button>
              ) : (
                <Button size="sm" variant="secondary" onClick={() => onAction("pause")}>
                  <Pause size={14} className="mr-1.5" /> Pause
                </Button>
              ))}
            <Button size="sm" variant="secondary" disabled={!running} onClick={() => onAction("extend")}>
              <Timer size={14} className="mr-1.5" /> Extra time
            </Button>
            <Button size="sm" variant="secondary" disabled={!student.attemptId} onClick={() => onAction("message")}>
              <Send size={14} className="mr-1.5" /> Message
            </Button>
            <Button size="sm" variant="secondary" disabled={!student.attemptId} onClick={() => onAction("flag")}>
              <Flag size={14} className="mr-1.5" /> Flag
            </Button>
            <Button size="sm" variant="secondary" onClick={() => onAction("seat")}>
              <RotateCcw size={14} className="mr-1.5" /> Reassign seat
            </Button>
            <Button size="sm" variant="secondary" disabled={!student.attemptId} onClick={() => onAction("incident")}>
              <ShieldAlert size={14} className="mr-1.5" /> File incident
            </Button>
            {student.flags > 0 && (
              <Button size="sm" variant="secondary" onClick={() => onAction("clearFlags")}>
                <CheckCircle2 size={14} className="mr-1.5" /> Clear flags
              </Button>
            )}
            <Button size="sm" variant="secondary" disabled={!student.attemptId} onClick={() => onAction("reset")}>
              <Wifi size={14} className="mr-1.5" /> Release session
            </Button>
            <Button
              size="sm"
              className="bg-rose-600 text-white hover:bg-rose-700"
              disabled={!running}
              onClick={() => onAction("end")}
            >
              <Ban size={14} className="mr-1.5" /> End script
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function Stat({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={`bg-gray-50 border border-gray-200 rounded-lg p-2.5 ${wide ? "col-span-2" : ""}`}>
      <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
      <div className="text-[12px] font-semibold text-gray-900 mt-0.5 break-words">{value}</div>
    </div>
  );
}

function flagNote(details: unknown): string | null {
  if (!details || typeof details !== "object") return null;
  const note = (details as Record<string, unknown>).note;
  return typeof note === "string" ? note : null;
}

function MinutesModal({
  title,
  subtitle,
  max,
  submitLabel,
  onSubmit,
  onClose,
  onDone,
}: {
  title: string;
  subtitle: string;
  max: number;
  submitLabel: string;
  onSubmit: (minutes: number, reason: string) => Promise<unknown>;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [minutes, setMinutes] = React.useState("5");
  const [reason, setReason] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const value = Number(minutes);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await onSubmit(value, reason.trim());
      await onDone();
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      lockDismiss={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={pending} disabled={!Number.isFinite(value) || value < 1 || value > max}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Extra minutes (1–{max})</label>
          <Input type="number" min={1} max={max} value={minutes} onChange={(e) => setMinutes(e.target.value)} />
        </div>
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Reason (optional)</label>
          <textarea
            className="w-full min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Recorded on the audit trail..."
          />
        </div>
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

function MessageModal({
  title,
  subtitle,
  submitLabel,
  onSubmit,
  onClose,
  onDone,
}: {
  title: string;
  subtitle: string;
  submitLabel: string;
  onSubmit: (message: string, reason: string) => Promise<unknown>;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [message, setMessage] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await onSubmit(message.trim(), reason.trim());
      await onDone();
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      lockDismiss={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={pending} disabled={!message.trim()}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Message</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            maxLength={500}
            placeholder="Shown on the candidate screen..."
          />
          <p className="text-[11px] text-gray-500 mt-1">{message.length}/500</p>
        </div>
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Reason (optional)</label>
          <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Recorded on the audit trail" />
        </div>
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

function SeatModal({
  student,
  onSubmit,
  onClose,
  onDone,
}: {
  student: LiveStudent;
  onSubmit: (seatLabel: string) => Promise<unknown>;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [seat, setSeat] = React.useState(student.seat ?? "");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await onSubmit(seat.trim());
      await onDone();
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal
      title="Reassign seat"
      subtitle={`${student.name} · currently ${student.seat ?? "unassigned"}`}
      onClose={onClose}
      lockDismiss={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} isLoading={pending} disabled={!seat.trim()}>
            Save seat
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">New seat / workstation label</label>
          <Input value={seat} onChange={(e) => setSeat(e.target.value)} maxLength={40} placeholder="e.g. SEAT-115" />
        </div>
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

function FlagModal({
  student,
  onSubmit,
  onClose,
  onDone,
}: {
  student: LiveStudent;
  onSubmit: (severity: "INFO" | "WARNING" | "HIGH", note: string) => Promise<unknown>;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [severity, setSeverity] = React.useState<"INFO" | "WARNING" | "HIGH">("WARNING");
  const [note, setNote] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await onSubmit(severity, note.trim());
      await onDone();
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal
      title="Record a manual flag"
      subtitle={`${student.name} · ${student.seat ?? "no seat"}`}
      onClose={onClose}
      lockDismiss={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} isLoading={pending}>
            Record flag
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Severity</label>
          <select className={selectCls} value={severity} onChange={(e) => setSeverity(e.target.value as typeof severity)}>
            <option value="INFO">Info</option>
            <option value="WARNING">Warning</option>
            <option value="HIGH">High</option>
          </select>
        </div>
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Observation (optional)</label>
          <textarea
            className="w-full min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            maxLength={1000}
            placeholder="What did the invigilator observe?"
          />
        </div>
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}

function FileIncidentModal({
  student,
  onSubmit,
  onClose,
  onDone,
}: {
  student: LiveStudent;
  onSubmit: (body: Record<string, unknown>) => Promise<unknown>;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [category, setCategory] = React.useState("MALPRACTICE");
  const [severity, setSeverity] = React.useState("MEDIUM");
  const [description, setDescription] = React.useState("");
  const [actionTaken, setActionTaken] = React.useState("");
  const [docketConfiscated, setDocketConfiscated] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await onSubmit({
        ...(student.attemptId ? { attemptId: student.attemptId } : {}),
        ...(student.seat ? { seatLabel: student.seat } : {}),
        category,
        severity,
        description: description.trim(),
        ...(actionTaken.trim() ? { actionTaken: actionTaken.trim() } : {}),
        docketConfiscated,
      });
      await onDone();
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal
      title="File incident docket"
      subtitle={`${student.name} · ${student.seat ?? "no seat"}`}
      onClose={onClose}
      lockDismiss={pending}
      width="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} isLoading={pending} disabled={description.trim().length < 5}>
            File docket
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1">Category</label>
            <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value)}>
              {Object.entries(CATEGORY_LABEL).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1">Severity</label>
            <select className={selectCls} value={severity} onChange={(e) => setSeverity(e.target.value)}>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="CRITICAL">Critical</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Observation</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="State exact facts, evidence observed, witness proctors..."
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Action enforced (optional)</label>
          <Input value={actionTaken} onChange={(e) => setActionTaken(e.target.value)} placeholder="e.g. Candidate paused, docket marked" />
        </div>
        <label className="flex items-center gap-2 text-[13px] text-gray-700">
          <input
            type="checkbox"
            checked={docketConfiscated}
            onChange={(e) => setDocketConfiscated(e.target.checked)}
            className="rounded text-blue-600"
          />
          Confiscate examination docket / rough sheets as physical exhibit
        </label>
        {error && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
            {error}
          </div>
        )}
      </div>
    </Modal>
  );
}
