"use client";

import * as React from "react";
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
import { useUser } from "@/components/auth/user-context";

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
/*                                  Component                                 */
/* -------------------------------------------------------------------------- */

export default function StudentDashboard() {
  const user = useUser();
  const { data, loading, error, reload } =
    useApi<DashboardPayload>("/student/dashboard");

  const [showLoginNotice, setShowLoginNotice] = React.useState(false);

  // Pop up notifications immediately upon login, then remember dismissal for the session
  React.useEffect(() => {
    if (data?.notifications && data.notifications.length > 0) {
      try {
        const seen = sessionStorage.getItem("cbt_seen_login_notice");
        if (!seen) {
          setShowLoginNotice(true);
        }
      } catch {}
    }
  }, [data?.notifications]);

  const handleDismissNotice = () => {
    setShowLoginNotice(false);
    try {
      sessionStorage.setItem("cbt_seen_login_notice", "true");
    } catch {}
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
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading your examination timetable...
        </p>
      </div>
    );
  }

  /* ------------------------------- Error state ------------------------------ */
  if (error && !data) {
    return (
      <div className="mx-auto w-full max-w-4xl py-12">
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 p-6 text-rose-800 dark:text-rose-200">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-rose-600 dark:text-rose-400" />
            <div>
              <h3 className="text-base font-bold">Unable to load student portal</h3>
              <p className="mt-0.5 text-sm">
                {error.message || "Could not retrieve examination details."}
              </p>
            </div>
          </div>
          <button
            onClick={() => reload()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700 cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const student = data?.student ?? {
    firstName: user?.me?.names ? user.me.names.split(" ")[0] : "Student",
    names: user?.me?.names ?? "Candidate",
    matricNo: user?.me?.matricNo ?? "—",
    email: user?.me?.email ?? "",
    level: "Undergraduate",
    programme: { code: "DEGREE", name: "Undergraduate Studies" },
    department: { code: "DEPT", name: "Academic Department" },
    college: { code: "COL", name: "LASUSTECH" },
  };
  const live = data?.live ?? [];
  const upcoming = data?.upcoming ?? [];
  const completed = data?.completed ?? [];

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12 pt-2 text-slate-900 dark:text-slate-100 font-sans">
      {/* ----------------- Blinking Red Line: Ongoing Exam Alert ----------------- */}
      {live.length > 0 && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white p-4 shadow-lg border-2 border-red-500 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-3.5 w-3.5 relative shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white" />
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-[11px] uppercase tracking-wider bg-white/20 px-2 py-0.5 rounded text-white">
                    Ongoing Examination
                  </span>
                  <span className="font-bold text-sm">
                    {live[0].code} — {live[0].title}
                  </span>
                </div>
                <p className="text-xs text-red-100 mt-0.5">
                  Your examination is currently LIVE. Please enter the examination hall immediately.
                </p>
              </div>
            </div>
            <Link
              href={
                live[0].attemptStatus === "IN_PROGRESS"
                  ? `/student/exam/${live[0].id}`
                  : live[0].accessCode
                    ? `/student/exam/${live[0].id}/start?code=${encodeURIComponent(live[0].accessCode)}`
                    : `/student/exam/${live[0].id}/start`
              }
              className="shrink-0 inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white text-red-700 hover:bg-red-50 text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              {live[0].attemptStatus === "IN_PROGRESS" ? "Resume Exam Now" : "Enter Exam Now"} &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* ------------------------- Student profile strip ------------------------ */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <span className="rounded-md bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300">
            Student Examination Portal
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome, {student.firstName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {student.matricNo} • {student.department.name} ({student.level})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl" />
          <Link
            href="/student/results"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 dark:bg-slate-800 px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800 dark:hover:bg-slate-700 border border-transparent dark:border-slate-700"
          >
            <Award size={16} />
            View Results
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/60"
          >
            Help & Support <ExternalLink size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ------------------------ Section 1: Live exams ------------------------- */}
      {live.length > 0 ? (
        <section aria-labelledby="live-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="live-heading"
              className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600" />
              </span>
              Exam Ready to Take Now
            </h2>
            <span className="rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-0.5 text-xs font-semibold uppercase text-emerald-700 dark:text-emerald-300">
              Active Session
            </span>
          </div>

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
                className="relative overflow-hidden rounded-2xl border-2 border-blue-600 bg-white dark:bg-slate-900 p-6 shadow-md"
              >
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-blue-100 dark:bg-blue-900/60 px-3 py-1 font-mono text-base font-bold text-blue-900 dark:text-blue-200">
                        {exam.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {exam.unit} Credit Units
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{exam.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                        {student.college?.name || ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock size={16} className="text-blue-600 dark:text-blue-400" />
                        <span>
                          {exam.durationLabel}
                          {exam.windowLabel ? ` (${exam.windowLabel})` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin size={16} className="text-blue-600 dark:text-blue-400" />
                        <span>
                          {exam.venue}
                          {exam.seat ? ` • ${exam.seat}` : ""}
                        </span>
                      </div>
                    </div>

                    {exam.requiresAccessCode && (
                      <div className="flex items-center gap-2 pt-0.5">
                        {exam.accessCode ? (
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950/40 px-3 py-1 text-xs font-semibold text-amber-900 dark:text-amber-200">
                            <KeyRound size={13} className="text-amber-600 dark:text-amber-400" />
                            <span>Unlock Access Code: <strong className="font-mono tracking-wider">{exam.accessCode}</strong></span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1 text-xs font-medium text-slate-600 dark:text-slate-400">
                            <Lock size={13} className="text-slate-500 dark:text-slate-400" />
                            <span>Requires Invigilator Access Code</span>
                          </div>
                        )}
                      </div>
                    )}

                    {exam.lateText && (
                      <p className="inline-block rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/50 px-3 py-1.5 text-xs font-medium text-blue-900 dark:text-blue-200">
                        {hasStarted ? "Exam in progress — resume now" : exam.lateText}
                      </p>
                    )}
                  </div>

                  <div className="flex w-full shrink-0 flex-col gap-2 sm:flex-row md:w-auto md:flex-col">
                    <Link
                      href={targetUrl}
                      className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 text-base font-bold text-white shadow-sm transition-all hover:bg-blue-700 hover:shadow"
                    >
                      {hasStarted ? "Resume Exam" : "Start Exam"}
                      <ArrowRight size={18} />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center">
          <CheckCircle2 size={32} className="mx-auto text-emerald-600 dark:text-emerald-400" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No Examinations In Progress
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            You do not have any active CBT examinations scheduled for this moment.
          </p>
        </div>
      )}

      {/* ---------------------- Section 2: Upcoming exams ----------------------- */}
      {upcoming.length > 0 && (
        <section aria-labelledby="upcoming-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="upcoming-heading"
              className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"
            >
              <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
              Upcoming Scheduled Examinations
            </h2>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              {upcoming.length} Paper{upcoming.length === 1 ? "" : "s"} Scheduled
            </span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            {upcoming.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      {exam.code}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {exam.unit} Credit Units
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {exam.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Clock size={13} className="text-blue-600 dark:text-blue-400" />
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
                  <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
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
              className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white"
            >
              <CheckCircle2 size={18} className="text-blue-600 dark:text-blue-400" />
              Completed Examinations
            </h2>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
            {completed.map((exam) => (
              <div
                key={exam.id}
                className="flex flex-col justify-between gap-4 p-5 transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="rounded bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 font-mono text-sm font-bold text-slate-900 dark:text-slate-100">
                      {exam.code}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {exam.unit} Credit Units
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    {exam.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 pt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                      <Clock size={13} className="text-blue-600 dark:text-blue-400" /> {exam.dateLabel}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} className="text-slate-400" /> {exam.venue}
                    </span>
                  </div>
                </div>

                <div className="shrink-0">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 size={13} />
                    Completed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* -------------------- Login Pop-up Notification Modal -------------------- */}
      {showLoginNotice && data?.notifications && data.notifications.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-base">Examination Notice</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Important notification for your session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDismissNotice}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {data.notifications.map((n) => (
                <div
                  key={n.id}
                  className="p-4 rounded-2xl bg-blue-50/80 dark:bg-slate-800/80 border border-blue-200 dark:border-slate-700 space-y-2"
                >
                  <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{n.title}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{n.body}</p>
                  {n.meta?.accessCode && (
                    <div className="pt-1 flex items-center justify-between">
                      <span className="text-xs text-slate-500 dark:text-slate-400">Access Code:</span>
                      <span className="font-mono font-bold text-xs bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200">
                        {n.meta.accessCode}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 text-center">
              You can revisit notifications anytime from the side panel or top navigation bar.
            </p>

            <button
              type="button"
              onClick={handleDismissNotice}
              className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors cursor-pointer shadow-xs"
            >
              Acknowledge &amp; Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
