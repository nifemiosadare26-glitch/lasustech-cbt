"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Clock,
  BookOpen,
  User,
  Lock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ExamStartPage() {
  const router = useRouter();
  const params = useParams();
  const examId = (params?.id as string) || "csc301";
  const [accessCode, setAccessCode] = useState("CBT101");
  const [error, setError] = useState<string | null>(null);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode.trim()) {
      setError("Please enter the 6-character access code provided by your invigilator.");
      return;
    }
    router.push(`/student/exam/${examId}/attempt`);
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
      {/* Back button */}
      <Link
        href="/student"
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft size={16} /> Back to My Exams
      </Link>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono font-bold text-sm bg-blue-600 px-3 py-1 rounded-md text-white">
              CSC 301
            </span>
            <span className="text-xs font-semibold text-blue-200">
              Harmattan Semester 2026/2027
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mt-3">
            Data Structures & Algorithms
          </h1>
          <p className="text-sm text-slate-300 mt-1">
            Department of Computer Science • College of Basic Sciences
          </p>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-400 block font-medium">Duration</span>
              <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <Clock size={16} className="text-blue-400" /> 60 Minutes
              </span>
            </div>
            <div>
              <span className="text-xs text-slate-400 block font-medium">Questions</span>
              <span className="text-base font-bold text-white flex items-center gap-1.5 mt-0.5">
                <BookOpen size={16} className="text-blue-400" /> 40 Questions
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Candidate Profile Box */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0">
              NO
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 text-base truncate">Nifemi Osadare</p>
              <p className="text-xs font-mono text-slate-600">Matric No: CSC/22/101</p>
            </div>
            <div className="shrink-0 text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                <CheckCircle2 size={12} /> Candidate Verified
              </span>
            </div>
          </div>

          {/* Exam Instructions */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
              Examination Instructions
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  Your answers are automatically saved as you navigate through each question.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  You may flag questions and return to review them at any time before final submission.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2 shrink-0" />
                <span>
                  The timer begins the moment you click <strong>Start Exam</strong> and cannot be paused.
                </span>
              </li>
            </ul>
          </div>

          {/* Form / Start Bar */}
          <form onSubmit={handleStart} className="space-y-4 pt-4 border-t border-slate-100">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                {error}
              </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="relative">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Access Code
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    maxLength={10}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                    placeholder="ENTER CODE"
                    className="w-full sm:w-48 pl-9 pr-3 py-2.5 font-mono text-base font-bold uppercase border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-auto">
                <Link
                  href="/student"
                  className="px-5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-7 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                >
                  Start Exam
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
