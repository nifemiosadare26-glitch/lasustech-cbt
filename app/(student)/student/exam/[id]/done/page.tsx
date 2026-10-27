"use client";

import Link from "next/link";
import { CheckCircle2, Copy, AlertTriangle, Loader2, Info, ArrowRight, ShieldCheck, Home } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { useApi } from "@/lib/useApi";
import { useUser } from "@/components/auth/user-context";
import { exitFullscreen, copyToClipboard } from "@/lib/browser";

function ExamDoneContent() {
  const router = useRouter();
  const params = useParams();
  const sittingId = params?.id as string;
  const searchParams = useSearchParams();

  const refParam = searchParams?.get("ref");
  const causeParam = searchParams?.get("cause") as "manual" | "auto" | "invigilator" | "cheat_logout" | null;
  const rawParam = searchParams?.get("raw");
  const maxParam = searchParams?.get("max");
  const pctParam = searchParams?.get("pct");

  const [time, setTime] = useState<string>("");
  const [countdown, setCountdown] = useState(60);
  const [copied, setCopied] = useState(false);

  // Fetch live sitting & candidate profile
  const { data } = useApi<{
    sitting: {
      courseCode: string;
      courseTitle: string;
      questionCount: number;
    };
    candidate: {
      names: string;
      matricNo: string;
    };
  }>(sittingId ? `/student/sittings/${sittingId}` : null);

  const user = useUser();
  const refCode = refParam || `LASU-${sittingId ? sittingId.slice(0, 4).toUpperCase() : "EXAM"}-${sittingId ? sittingId.slice(-4).toUpperCase() : "DONE"}`;
  const studentName = data?.candidate.names || user?.me?.names || "Candidate";
  const matric = data?.candidate.matricNo || user?.me?.matricNo || "—";
  const courseCode = data?.sitting.courseCode || "CBT Examination";
  const courseTitle = data?.sitting.courseTitle || "Completed Examination";

  // Fullscreen exit & Time initialization
  useEffect(() => {
    exitFullscreen();

    // Replace history to prevent back navigation
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.href);
    }

    // Format time in Africa/Lagos
    setTime(
      new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }).format(new Date())
    );
  }, []);

  // Sign out / return countdown
  useEffect(() => {
    const int = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(int);
          router.push("/student");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(int);
  }, [router]);

  const handleCopy = async () => {
    const ok = await copyToClipboard(refCode);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 select-none">
      <div className="max-w-lg w-full space-y-6">
        {/* Cause Banner */}
        {causeParam === "auto" && (
          <div className="bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 px-4 py-3 rounded-2xl border border-blue-200 dark:border-blue-800 flex items-start gap-3 text-sm font-medium">
            <Info size={18} className="shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <p>Allocated duration elapsed. Your recorded answers have been automatically saved and submitted.</p>
          </div>
        )}
        {causeParam === "invigilator" && (
          <div className="bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 px-4 py-3 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-start gap-3 text-sm font-medium">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <p>The hall invigilator concluded the test session. Your paper has been submitted.</p>
          </div>
        )}
        {causeParam === "cheat_logout" && (
          <div className="bg-rose-50 dark:bg-rose-950/50 text-rose-900 dark:text-rose-200 px-4 py-3 rounded-2xl border border-rose-200 dark:border-rose-800 flex items-start gap-3 text-sm font-medium">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
            <p>Your session was automatically submitted due to multiple window/tab navigation infractions.</p>
          </div>
        )}

        {/* Card */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-9 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center relative overflow-hidden">
          {/* Top Decorative accent */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-linear-to-r from-blue-600 via-indigo-600 to-emerald-500" />

          {/* Icon */}
          <div className="relative inline-flex items-center justify-center mx-auto mb-5">
            <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
              <CheckCircle2 size={44} className="stroke-[2.2]" />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white rounded-full p-1 shadow-xs">
              <ShieldCheck size={14} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Examination Submitted
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm max-w-sm mx-auto leading-relaxed">
            Your answers have been validated and securely recorded on the LASUSTECH CBT server.
          </p>

          {/* Submission Details Box */}
          <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-5 text-sm text-slate-700 dark:text-slate-300 text-left space-y-3.5 my-7">
            <div className="pb-3 border-b border-slate-200 dark:border-slate-700">
              <p className="font-bold text-slate-900 dark:text-slate-100 text-base">{studentName}</p>
              <p className="font-mono text-slate-500 dark:text-slate-400 text-xs mt-0.5">Matric No: {matric}</p>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Course</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{courseCode} — {courseTitle}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Submission Timestamp</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">{time || "--:--"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Status</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 text-xs bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                  <CheckCircle2 size={12} /> Received & Locked
                </span>
              </div>

              {rawParam && maxParam && (
                <div className="flex justify-between items-center py-2 px-3 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800">
                  <span className="text-blue-900 dark:text-blue-300 font-bold text-xs uppercase tracking-wider">
                    Score / Total Allotted
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-blue-950 dark:text-white text-sm tabular-nums">
                      {rawParam} / {maxParam}
                    </span>
                    {pctParam && (
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 tabular-nums">
                        ({Math.round(Number(pctParam))}%)
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-200 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400 font-medium">Reference Code</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold tracking-wider text-slate-900 dark:text-slate-100 bg-slate-200 dark:bg-slate-700 px-2.5 py-1 rounded-md text-xs select-all">
                    {refCode}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors focus:outline-none cursor-pointer"
                    aria-label="Copy reference code"
                    title="Copy reference code"
                  >
                    {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action CTAs (No print slip) */}
          <div className="space-y-3">
            <Link
              href="/student"
              className="flex items-center justify-center gap-2 w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Home size={18} /> Return to Student Dashboard
            </Link>

            <Link
              href="/student/results"
              className="flex items-center justify-center gap-2 w-full h-11 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-xs transition-colors cursor-pointer"
            >
              View Examination Results <ArrowRight size={14} />
            </Link>
          </div>

          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-4 font-medium">
            Redirecting to student dashboard in <strong className="text-slate-700 dark:text-slate-300 font-bold">{countdown}s</strong>
          </p>
        </div>

        {/* Registry Footer note */}
        <div className="text-center px-4 space-y-1">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official examination marks pass through administrative verification prior to publication.
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            LASUSTECH Directorate of Information & Communication Technology
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ExamDonePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      }
    >
      <ExamDoneContent />
    </Suspense>
  );
}
