"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Check,
  Building2,
  Calendar,
  Award,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { publicApi, publicErrorMessage } from "@/lib/publicExamClient";

interface PublicResultData {
  attemptId: string;
  status: string;
  candidateName: string;
  examTitle: string;
  submittedAt: string | null;
  rawScore: number | null;
  maxScore: number | null;
  percent: number | null;
  grade: string | null;
  passed: boolean | null;
}

export default function PublicExamResultPage() {
  const params = useParams<{ slug: string; attemptId: string }>();
  const slug = params?.slug ?? "";
  const attemptId = params?.attemptId ?? "";
  const router = useRouter();

  const [data, setData] = React.useState<PublicResultData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!attemptId) return;
    let active = true;
    setLoading(true);

    publicApi<{ data: PublicResultData }>(`/public/attempts/${encodeURIComponent(attemptId)}/result`)
      .then((res) => {
        if (!active) return;
        setData(res.data);
      })
      .catch((err) => {
        if (!active) return;
        setError(publicErrorMessage(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [attemptId]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <Loader2 className="animate-spin text-blue-600 mb-3" size={36} />
        <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">
          Retrieving official examination result slip...
        </p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl border border-gray-200 dark:border-slate-800 p-8 shadow-sm space-y-4 text-center">
          <AlertCircle className="mx-auto text-rose-600" size={40} />
          <h2 className="text-xl font-bold text-gray-900 dark:text-slate-100">Result Not Available</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {error || "We could not find the result slip for this examination reference."}
          </p>
          <Link
            href={`/exam/${slug}`}
            className="inline-block px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors shadow-2xs"
          >
            Go to Examination Portal
          </Link>
        </div>
      </div>
    );
  }

  const passed = data.passed;
  const showScore = data.percent != null;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-950 py-10 px-4 sm:px-6 print:p-0 print:bg-white text-slate-900 dark:text-slate-100">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Navigation & Action Bar (Hidden when printing) */}
        <div className="flex items-center justify-between print:hidden">
          <button
            type="button"
            onClick={() => router.push(`/exam/${slug}`)}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} /> Examination Information
          </button>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              <span>{copied ? "Link Copied!" : "Copy Link"}</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <Printer size={14} /> Print Slip
            </button>
          </div>
        </div>

        {/* Official Result Slip Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 shadow-xl print:shadow-none print:border-none print:p-0">
          {/* Institution Header */}
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex justify-center">
              <Image
                src="/lasustech-logo.png"
                alt="LASUSTECH Crest"
                width={64}
                height={64}
                className="h-16 w-16 object-contain"
              />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Lagos State University of Science and Technology
              </h1>
              <p className="text-xs uppercase font-bold tracking-widest text-blue-600 dark:text-blue-400 mt-0.5">
                Computer-Based Testing Assessment Portal
              </p>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">
                Official Examination Result Slip
              </p>
            </div>
          </div>

          {/* Candidate & Exam Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6 p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Candidate Name
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {data.candidateName}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Examination Paper
              </span>
              <span className="text-sm font-bold text-slate-900 dark:text-white">
                {data.examTitle}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Reference ID
              </span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {data.attemptId.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase tracking-wider text-[10px]">
                Submission Date & Time
              </span>
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {data.submittedAt ? new Date(data.submittedAt).toLocaleString("en-NG") : "Recorded"}
              </span>
            </div>
          </div>

          {/* Score & Evaluation Panel */}
          {showScore ? (
            <div className="my-8 text-center p-8 rounded-3xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 space-y-3">
              <span className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-400 block">
                Total Score Awarded
              </span>
              <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight tabular-nums">
                {data.rawScore != null && data.maxScore != null ? (
                  <>
                    {data.rawScore} <span className="text-2xl text-slate-400 font-bold">/ {data.maxScore}</span>
                  </>
                ) : (
                  `${data.percent}%`
                )}
              </div>
              <div className="text-base font-bold text-blue-600 dark:text-blue-400">
                Overall Percentage: {data.percent}%
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                {data.grade && (
                  <span className="px-3.5 py-1 rounded-full bg-blue-600 text-white text-xs font-black shadow-xs">
                    Grade {data.grade}
                  </span>
                )}
                {passed != null && (
                  <span
                    className={cn(
                      "px-3.5 py-1 rounded-full text-xs font-black shadow-xs",
                      passed
                        ? "bg-emerald-600 text-white"
                        : "bg-rose-600 text-white"
                    )}
                  >
                    {passed ? "PASSED" : "FAILED"}
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div className="my-8 p-6 rounded-2xl bg-slate-50 dark:bg-slate-800 text-center text-sm font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Examination script recorded successfully.
            </div>
          )}

          {/* Verification Footer */}
          <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 gap-2">
            <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 size={15} /> System Verified Assessment
            </span>
            <span className="font-mono text-[10px]">
              LASUSTECH CBT v2.4 • Verification Ref: {data.attemptId.slice(0, 12)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}