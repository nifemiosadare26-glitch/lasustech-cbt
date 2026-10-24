"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Award,
  ExternalLink,
  Calendar,
  AlertCircle,
  Loader2,
  Bell,
  KeyRound,
  Lock,
  X,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { useRealtimeEvent } from "@/lib/realtime";
import { ThemeToggle } from "@/components/ui/theme-toggle";

/* -------------------------------------------------------------------------- */
/*                                    Types                                   */
/* -------------------------------------------------------------------------- */

type StudentData = {
  id: string;
  names: string;
  firstName: string;
  matricNo: string;
  email: string;
  level: string;
  programme: { code: string; name: string };
  department: { code: string; name: string };
  college: { code: string; name: string };
};

type LiveExam = {
  id: string;
  examId: string;
  code: string;
  title: string;
  status: "live";
  dateLabel: string;
  windowLabel?: string;
  durationLabel: string;
  durationMin: number;
  venue: string;
  seat?: string;
  lateText?: string;
  unit: number;
  attemptId: string | null;
  attemptStatus: string;
  requiresAccessCode?: boolean;
  accessCode?: string | null;
};

type UpcomingExam = {
  id: string;
  examId: string;
  code: string;
  title: string;
  status: "upcoming";
  dateLabel: string;
  windowLabel?: string;
  durationLabel: string;
  durationMin?: number;
  venue: string;
  unit: number;
  requiresAccessCode?: boolean;
  accessCode?: string | null;
};

type CompletedExam = {
  id: string;
  examId: string;
  code: string;
  title: string;
  status: "completed";
  dateLabel: string;
  venue: string;
  unit: number;
};

type StudentNotification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  meta?: { accessCode?: string; sittingId?: string; href?: string } | null;
};

type DashboardPayload = {
  student: StudentData;
  live: LiveExam[];
  upcoming: UpcomingExam[];
  completed: CompletedExam[];
  notifications?: StudentNotification[];
};

/* -------------------------------------------------------------------------- */
/*                                  Constants                                 */
/* -------------------------------------------------------------------------- */

const FALLBACK_STUDENT = {
  firstName: "Student",
  names: "Student Candidate",
  matricNo: "CSC/2022/305",
  level: "300 Level",
  department: { name: "Computer Science" },
  college: { name: "College of Basic Sciences" },
};

const FALLBACK_LIVE: LiveExam[] = [
  {
    id: "sitting_csc301",
    examId: "exam_csc301",
    code: "CSC 301",
    title: "Data Structures & Algorithms",
    status: "live",
    dateLabel: "Today",
    durationLabel: "60 Mins",
    durationMin: 60,
    venue: "CBT Hall 1",
    unit: 3,
    attemptId: null,
    attemptStatus: "not_started",
    accessCode: "LASU-301",
  },
];

const FALLBACK_UPCOMING: UpcomingExam[] = [
  {
    id: "sitting_csc305",
    examId: "exam_csc305",
    code: "CSC 305",
    title: "Operating Systems & Concurrency",
    status: "upcoming",
    dateLabel: "Tomorrow, 09:00 AM",
    durationLabel: "60 Mins",
    venue: "CBT Hall 2",
    unit: 3,
  },
  {
    id: "sitting_mth301",
    examId: "exam_mth301",
    code: "MTH 301",
    title: "Numerical Analysis I",
    status: "upcoming",
    dateLabel: "Friday, 02:00 PM",
    durationLabel: "90 Mins",
    venue: "CBT Main Hall",
    unit: 3,
  },
];

const FALLBACK_COMPLETED: CompletedExam[] = [
  {
    id: "sitting_csc201",
    examId: "exam_csc201",
    code: "CSC 201",
    title: "Computer Programming I",
    status: "completed",
    dateLabel: "18 Oct 2026",
    venue: "CBT Centre 1",
    unit: 3,
  },
];

const FALLBACK_NOTIFICATIONS: StudentNotification[] = [
  {
    id: "notif_welcome",
    title: "CSC 301 CBT Examination Live",
    body: "The examination hall is now open for CSC 301. Use your access code to begin your examination.",
    createdAt: new Date().toISOString(),
    meta: {
      accessCode: "LASU-301",
      sittingId: "sitting_csc301",
      href: "/student/exam/sitting_csc301/start?code=LASU-301",
    },
  },
];

/* -------------------------------------------------------------------------- */
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export default function StudentDashboard() {
  const { data, loading, error, reload } =
    useApi<DashboardPayload>("/student/dashboard");

  const [unreadNotifications, setUnreadNotifications] = useState<StudentNotification[]>([]);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);

  // Check for newly dropped notifications to display first-time popup
  useEffect(() => {
    const rawNotifs = data?.notifications && data.notifications.length > 0 ? data.notifications : FALLBACK_NOTIFICATIONS;
    if (!rawNotifs || rawNotifs.length === 0) return;

    try {
      const stored = localStorage.getItem("lasustech_seen_notifications");
      const seenIds: string[] = stored ? JSON.parse(stored) : [];
      const newItems = rawNotifs.filter((n) => !seenIds.includes(n.id));

      if (newItems.length > 0) {
        setUnreadNotifications(newItems);
        setShowNotificationPopup(true);
      }
    } catch {
      setUnreadNotifications(data?.notifications || rawNotifs);
      setShowNotificationPopup(true);
    }
  }, [data?.notifications]);

  const dismissNotifications = () => {
    try {
      const stored = localStorage.getItem("lasustech_seen_notifications");
      const seenIds: string[] = stored ? JSON.parse(stored) : [];
      const updated = Array.from(new Set([...seenIds, ...unreadNotifications.map((n) => n.id)]));
      localStorage.setItem("lasustech_seen_notifications", JSON.stringify(updated));
    } catch {}
    setShowNotificationPopup(false);
  };

  // Refresh automatically when an exam is created or changes status
  useRealtimeEvent("sitting.status", () => {
    void reload();
  });
  useRealtimeEvent("sitting.created", () => {
    void reload();
  });

  /* ------------------------------ Loading state ----------------------------- */
  if (loading && !data) {
    return (
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center justify-center space-y-4 py-12">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium text-slate-500">
          Loading your examination timetable...
        </p>
      </div>
    );
  }

  const student = data?.student ?? FALLBACK_STUDENT;
  const live = (data?.live && data.live.length > 0) ? data.live : FALLBACK_LIVE;
  const upcoming = (data?.upcoming && data.upcoming.length > 0) ? data.upcoming : FALLBACK_UPCOMING;
  const completed = (data?.completed && data.completed.length > 0) ? data.completed : FALLBACK_COMPLETED;

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12 pt-2">
      {/* ------------------ Notification First-Time Popup Modal ----------------- */}
      {showNotificationPopup && unreadNotifications.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              onClick={dismissNotifications}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close notification"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300">
                <Bell size={24} className="animate-bounce" />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  New Announcement
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Examination Notice
                </h3>
              </div>
            </div>

            <div className="mt-4 space-y-3 max-h-[60vh] overflow-y-auto pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {unreadNotifications.map((n) => (
                <div key={n.id} className="pt-3 first:pt-0 space-y-1.5">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {n.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {n.body}
                  </p>
                  {n.meta?.accessCode && (
                    <div className="mt-2 flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 p-3">
                      <div>
                        <span className="text-[11px] font-medium text-blue-700 dark:text-blue-300 block">
                          Exam Access Code
                        </span>
                        <span className="text-base font-mono font-bold tracking-widest text-blue-950 dark:text-blue-100">
                          {n.meta.accessCode}
                        </span>
                      </div>
                      {n.meta.href && (
                        <Link
                          href={n.meta.href}
                          onClick={dismissNotifications}
                          className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
                        >
                          Unlock Exam <ArrowRight size={12} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-4">
              <span className="text-xs text-slate-500">
                You can revisit notifications anytime from the side panel.
              </span>
              <button
                type="button"
                onClick={dismissNotifications}
                className="rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------ Urgent Ongoing Exam Banner (Single Line at Top) ------------ */}
      {live.length > 0 && (
        <div className="space-y-2">
          {live.map((exam) => {
            const hasStarted = exam.attemptStatus === "IN_PROGRESS";
            const targetUrl = hasStarted
              ? `/student/exam/${exam.id}`
              : exam.accessCode
                ? `/student/exam/${exam.id}/start?code=${encodeURIComponent(exam.accessCode)}`
                : `/student/exam/${exam.id}/start`;

            return (
              <div
                key={exam.id}
                className="rounded-xl border-2 border-red-500 bg-red-50/95 dark:bg-red-950/40 px-4 py-2.5 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-red-950 dark:text-red-100"
              >
                <div className="w-full flex items-center gap-3 min-w-0 overflow-hidden">
                  <span className="relative flex h-3.5 w-3.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                    <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-600 animate-pulse" />
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-red-600 text-white font-bold text-xs uppercase tracking-wider animate-pulse shrink-0">
                    Ongoing Exam
                  </span>
                  <div className="flex items-center gap-2 truncate text-sm font-semibold">
                    <span className="font-mono text-red-700 dark:text-red-300 font-bold shrink-0">[{exam.code}]</span>
                    <span className="truncate text-slate-900 dark:text-white font-bold">{exam.title}</span>
                    <span className="hidden md:inline-flex text-xs text-slate-500 dark:text-slate-400 font-normal shrink-0">
                      • {exam.durationLabel} • {exam.venue}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  {exam.accessCode && (
                    <span className="text-xs font-mono font-bold bg-white dark:bg-slate-900 px-2 py-1 rounded border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200">
                      Code: {exam.accessCode}
                    </span>
                  )}
                  <Link
                    href={targetUrl}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-red-600 hover:bg-red-700 px-4 py-1.5 text-xs font-bold text-white shadow-sm transition-all animate-pulse hover:animate-none shrink-0"
                  >
                    {hasStarted ? "Resume Exam" : "Enter Exam"}
                    <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ------------------------- Student Hero Welcome Banner ------------------------ */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#081836] via-[#0E2856] to-[#123673] text-white p-6 sm:p-7 shadow-xl border border-blue-900/50">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-48 h-48 bg-blue-600/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4">
            {/* Student Avatar / Initials badge */}
            <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shrink-0 shadow-inner text-sky-300 font-bold text-xl">
              {student.firstName?.[0] || "S"}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-500/20 px-3 py-0.5 text-xs font-bold uppercase tracking-wider text-sky-200 border border-sky-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Candidate Active Session
                </span>
                <span className="text-xs text-blue-200 font-medium">
                  {student.college?.name || "College of Basic Sciences"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Welcome back, {student.firstName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-200 pt-0.5">
                <span className="font-mono bg-white/10 px-2.5 py-0.5 rounded-md font-semibold text-sky-200 border border-white/10">
                  {student.matricNo}
                </span>
                <span className="text-blue-300/60">•</span>
                <span className="font-medium text-slate-100">{student.department.name}</span>
                <span className="text-blue-300/60">•</span>
                <span className="rounded-full bg-sky-950/60 text-sky-300 px-2.5 py-0.5 text-xs font-semibold border border-sky-800/60">
                  {student.level}
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/student/results"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-[#0B2A5B] hover:bg-sky-50 px-4 py-2.5 text-sm font-bold shadow-md transition-all hover:shadow-lg cursor-pointer"
            >
              <Award size={16} className="text-blue-700" />
              Examination Records
            </Link>
            <Link
              href="/support"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white px-4 py-2.5 text-sm font-medium transition-all backdrop-blur-sm cursor-pointer"
            >
              Help & Support <ExternalLink size={14} className="text-sky-300" />
            </Link>
          </div>
        </div>
      </div>

      {/* ---------------------- Section 2: Upcoming exams ----------------------- */}
      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="upcoming-heading"
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <Calendar size={18} className="text-blue-600" />
              Upcoming Scheduled Examinations
            </h2>
            <span className="text-xs font-medium text-slate-500">
              {upcoming.length} Paper{upcoming.length === 1 ? "" : "s"} Scheduled
            </span>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            {upcoming.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2.5 py-0.5 font-mono text-sm font-bold text-slate-900">
                      {exam.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      {exam.unit} Credit Units
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {exam.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock size={13} className="text-blue-600" />
                      {exam.dateLabel}
                      {exam.windowLabel ? ` (${exam.windowLabel})` : ""}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> {exam.venue}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center rounded-lg bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                    Scheduled
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* -------------------- Section 3: Completed exams ------------------------ */}
      {completed.length > 0 && (
        <section aria-labelledby="completed-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="completed-heading"
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <CheckCircle2 size={18} className="text-blue-600" />
              Completed Examinations
            </h2>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            {completed.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-slate-50/70 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 px-2.5 py-0.5 font-mono text-sm font-bold text-slate-900">
                      {exam.code}
                    </span>
                    <span className="text-xs text-slate-500">
                      {exam.unit} Credit Units
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {exam.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-500">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock size={13} className="text-blue-600" /> {exam.dateLabel}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> {exam.venue}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={13} />
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}