"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Building,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { apiClient } from "@/lib/apiClient";

type SittingPayload = {
  sitting: {
    id: string;
    examId: string;
    title: string;
    courseCode: string;
    courseTitle: string;
    courseLevel: string;
    departmentName: string;
    collegeName: string;
    sessionName: string;
    durationMin: number;
    questionCount: number;
    venue: string;
    seatLabel: string | null;
    status: string;
    requiresAccessCode: boolean;
    instructions: Record<string, any> | null;
    isAlreadyTaken?: boolean;
    isGraceExpired?: boolean;
    isWindowClosed?: boolean;
    antiCheatEnabled?: boolean;
  };
  candidate: {
    id: string;
    names: string;
    matricNo: string;
    department: string;
    college: string;
    verified: boolean;
  };
  attempt: {
    id: string;
    status: string;
    startedAt: string;
    deadlineAt: string;
  } | null;
  isAlreadyTaken?: boolean;
  isGraceExpired?: boolean;
  isWindowClosed?: boolean;
  antiCheatEnabled?: boolean;
};

export default function ExamStartPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const sittingId = params?.id as string;
  const initialCode = searchParams?.get("code") || "";

  const { data, loading, error } = useApi<SittingPayload>(
    sittingId ? `/student/sittings/${sittingId}` : null
  );

  const [accessCode, setAccessCode] = useState(initialCode);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);

    const requiresCode = data?.sitting.requiresAccessCode;
    if (requiresCode && !accessCode.trim()) {
      setSubmitError("Please enter the access code provided by your invigilator.");
      return;
    }

    try {
      setSubmitting(true);
      const res = await apiClient<{ data: { attemptId: string } }>(
        `/student/sittings/${sittingId}/start`,
        {
          method: "POST",
          body: JSON.stringify({ accessCode: accessCode.trim() }),
        }
      );

      if (res.data?.attemptId) {
        router.push(`/student/exam/${sittingId}`);
      }
    } catch (err: any) {
      setSubmitError(
        err?.message || "Failed to start examination. Please verify the access code with your invigilator."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !data) {
    return (
      <div className="max-w-3xl mx-auto py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading examination details...</p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 space-y-4">
        <Link
          href="/student"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft size={16} /> Back to My Exams
        </Link>
        <div className="p-6 rounded-3xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-base">
            <AlertCircle size={20} className="text-rose-600 dark:text-rose-400" />
            Exam Unavailable
          </div>
          <p className="text-sm">{error.message || "This examination sitting could not be found or has ended."}</p>
        </div>
      </div>
    );
  }

  const sitting = data?.sitting || {
    courseCode: "CSC 301",
    courseTitle: "Data Structures & Algorithms",
    departmentName: "Computer Science",
    collegeName: "College of Basic Sciences",
    sessionName: "2026/2027 Academic Session",
    durationMin: 60,
    questionCount: 40,
    venue: "CBT Centre 1",
    seatLabel: "Seat 42",
    requiresAccessCode: true,
  };

  const candidate = data?.candidate || {
    names: "Nifemi Osadare",
    matricNo: "CSC/2022/305",
    department: "Computer Science",
  };

  const isAlreadyTaken =
    Boolean(data?.isAlreadyTaken) ||
    Boolean(data?.sitting?.isAlreadyTaken) ||
    data?.attempt?.status === "SUBMITTED" ||
    data?.attempt?.status === "AUTO_SUBMITTED";

  const isGraceExpired = Boolean(data?.isGraceExpired) || Boolean(data?.sitting?.isGraceExpired);
  const isWindowClosed =
    Boolean(data?.isWindowClosed) ||
    Boolean(data?.sitting?.isWindowClosed) ||
    data?.sitting?.status === "CLOSED";

  const initials = candidate.names
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const isResuming = data?.attempt && data.attempt.status === "IN_PROGRESS";

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Back button */}
      <Link
        href="/student"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={16} /> Back to My Exams
      </Link>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono font-bold text-sm bg-blue-600 px-3 py-1 rounded-md text-white">
              {sitting.courseCode}
            </span>
            <span className="text-xs font-semibold text-blue-200">
              {sitting.sessionName}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
            {sitting.courseTitle}
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Department of {sitting.departmentName} • {sitting.collegeName}
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Duration</span>
              <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Clock size={16} className="text-blue-400" /> {sitting.durationMin} Minutes
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Questions</span>
              <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <BookOpen size={16} className="text-blue-400" /> {sitting.questionCount} Questions
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Candidate Profile Box */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-base truncate">{candidate.names}</p>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">Matric No: {candidate.matricNo}</p>
              {sitting.venue && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1">
                  <Building size={12} /> {sitting.venue} {sitting.seatLabel ? `• ${sitting.seatLabel}` : ""}
                </p>
              )}
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                <CheckCircle2 size={12} /> Candidate Verified
              </span>
            </div>
          </div>

          {/* RETAKE PREVENTED ALERT */}
          {isAlreadyTaken && (
            <div className="p-5 rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-base">
                <AlertCircle size={20} className="text-amber-600 dark:text-amber-400" />
                Examination Already Taken
              </div>
              <p className="text-sm">
                Your examination has already been taken and submitted. Retakes are not permitted on this CBT platform.
              </p>
              <div className="pt-2">
                <Link
                  href="/student"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* GRACE PERIOD EXPIRED ALERT */}
          {!isAlreadyTaken && isGraceExpired && (
            <div className="p-5 rounded-2xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-base">
                <AlertCircle size={20} className="text-rose-600 dark:text-rose-400" />
                Late-Login Grace Period Expired
              </div>
              <p className="text-sm">
                The entry grace period after the examination schedule has expired. Examination entry has been locked by the administrator policy.
              </p>
              <div className="pt-2">
                <Link
                  href="/student"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* GLOBAL WINDOW CLOSED ALERT */}
          {!isAlreadyTaken && !isGraceExpired && isWindowClosed && (
            <div className="p-5 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-base">
                <Lock size={20} className="text-slate-600 dark:text-slate-400" />
                Examination Session Closed
              </div>
              <p className="text-sm">
                The scheduled time window for this examination has elapsed. The sitting is closed.
              </p>
              <div className="pt-2">
                <Link
                  href="/student"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                >
                  <ArrowLeft size={14} /> Back to Dashboard
                </Link>
              </div>
            </div>
          )}

          {/* Exam Instructions Bar - explicitly styled for dark mode clarity */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck size={16} className="text-blue-600 dark:text-blue-400" />
              Examination Instructions
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                <span>
                  Your answers are automatically saved to the LASUSTECH CBT server in real time as you navigate.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                <span>
                  You may flag questions and return to review them at any time using the question palette.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                <span>
                  Switching tabs or minimizing the window is monitored. Repeated infractions will terminate your exam.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                <span>
                  The timer runs continuously once started and will automatically submit when allotted time expires.
                </span>
              </li>
            </ul>
          </div>

          {/* Form / Start Bar (hidden if blocked) */}
          {!isAlreadyTaken && !isGraceExpired && !isWindowClosed && (
            <form onSubmit={handleStart} className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              {submitError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  {submitError}
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {sitting.requiresAccessCode && (
                  <div className="relative">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                      Invigilator Access Code
                    </label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        maxLength={10}
                        value={accessCode}
                        onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                        placeholder="ENTER CODE"
                        className="w-full sm:w-48 pl-9 pr-3 py-2.5 font-mono text-base font-bold uppercase border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                        disabled={submitting}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                      Check your student dashboard notifications or obtain from the hall invigilator.
                    </p>
                  </div>
                )}

                <div className="flex items-center gap-3 self-end sm:self-auto ml-auto">
                  <Link
                    href="/student"
                    className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" /> Starting...
                      </>
                    ) : isResuming ? (
                      <>
                        Resume Examination <ArrowRight size={16} />
                      </>
                    ) : (
                      <>
                        Start Examination <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
