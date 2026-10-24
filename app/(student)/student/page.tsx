"use client";

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
  const { data, loading, error, reload } =
    useApi<DashboardPayload>("/student/dashboard");

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

  /* ------------------------------- Error state ------------------------------ */
  if (error && !data) {
    return (
      <div className="mx-auto w-full max-w-4xl py-12">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-800">
          <div className="flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0 text-rose-600" />
            <div>
              <h3 className="text-base font-bold">Unable to load student portal</h3>
              <p className="mt-0.5 text-sm">
                {error.message || "Could not retrieve examination details."}
              </p>
            </div>
          </div>
          <button
            onClick={() => reload()}
            className="mt-4 rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const user = useUser();
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
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12 pt-2">
      {/* ------------------------- Student profile strip ------------------------ */}
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs sm:flex-row sm:items-center">
        <div>
          <span className="rounded-md bg-blue-50 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-blue-700">
            Student Examination Portal
          </span>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            Welcome, {student.firstName}
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {student.matricNo} • {student.department.name} ({student.level})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl" />
          <Link
            href="/student/results"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-2xs transition-colors hover:bg-slate-800"
          >
            <Award size={16} />
            View Results
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Help & Support <ExternalLink size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* ----------------- Notifications & Access Codes Banner ----------------- */}
      {data?.notifications && data.notifications.length > 0 && (
        <div className="space-y-2.5">
          {data.notifications.slice(0, 3).map((n) => (
            <div
              key={n.id}
              className="flex items-start justify-between gap-3 p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-sm shadow-2xs"
            >
              <div className="flex items-start gap-3">
                <Bell size={18} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-950 dark:text-blue-100">{n.title}</p>
                  <p className="text-xs text-blue-800 dark:text-blue-300 mt-0.5 leading-relaxed">{n.body}</p>
                </div>
              </div>
              {n.meta?.accessCode && (
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-mono font-bold text-xs bg-white dark:bg-slate-800 px-3 py-1 rounded-lg border border-blue-200 dark:border-blue-700 text-blue-900 dark:text-blue-200 shadow-2xs">
                    Code: {n.meta.accessCode}
                  </span>
                  {n.meta?.href && (
                    <Link
                      href={n.meta.href}
                      className="text-[11px] font-semibold text-blue-700 dark:text-blue-300 hover:underline inline-flex items-center gap-0.5"
                    >
                      Unlock now <ArrowRight size={11} />
                    </Link>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ------------------------ Section 1: Live exams ------------------------- */}
      {live.length > 0 ? (
        <section aria-labelledby="live-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2
              id="live-heading"
              className="flex items-center gap-2 text-lg font-bold text-slate-900"
            >
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600" />
              </span>
              Exam Ready to Take Now
            </h2>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold uppercase text-emerald-700">
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
                className="relative overflow-hidden rounded-2xl border-2 border-blue-600 bg-white p-6 shadow-md"
              >
                <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="rounded-md bg-blue-100 px-3 py-1 font-mono text-base font-bold text-blue-900">
                        {exam.code}
                      </span>
                      <span className="text-xs font-medium text-slate-500">
                        {exam.unit} Credit Units
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
                      <p className="mt-0.5 text-sm text-slate-500">
                        {student.college?.name || ""}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-slate-700">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Clock size={16} className="text-blue-600" />
                        <span>
                          {exam.durationLabel}
                          {exam.windowLabel ? ` (${exam.windowLabel})` : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium">
                        <MapPin size={16} className="text-blue-600" />
                        <span>
                          {exam.venue}
                          {exam.seat ? ` • ${exam.seat}` : ""}
                        </span>
                      </div>
                    </div>

                    {exam.requiresAccessCode && (
                      <div className="flex items-center gap-2 pt-0.5">
                        {exam.accessCode ? (
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-900">
                            <KeyRound size={13} className="text-amber-600" />
                            <span>Unlock Access Code: <strong className="font-mono tracking-wider">{exam.accessCode}</strong></span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
                            <Lock size={13} className="text-slate-500" />
                            <span>Requires Invigilator Access Code</span>
                          </div>
                        )}
                      </div>
                    )}

                    {exam.lateText && (
                      <p className="inline-block rounded-lg border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-medium text-blue-900">
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
        <div className="space-y-2 rounded-2xl border border-slate-200 bg-white p-6 text-center">
          <CheckCircle2 size={32} className="mx-auto text-emerald-600" />
          <h3 className="text-base font-bold text-slate-900">
            No Examinations In Progress
          </h3>
          <p className="text-sm text-slate-500">
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