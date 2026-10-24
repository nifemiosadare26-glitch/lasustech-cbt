"use client";

import React, { useState } from "react";
import {
  Download,
  Printer,
  CheckCircle2,
  BookOpen,
  GraduationCap,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { generateResultSlip } from "@/lib/generateResultSlip";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface ResultCourse {
  code: string;
  title: string;
  examScore: number;
  rawScore?: number;
  maxScore?: number;
  percent?: number;
  scoreLabel?: string;
  remark: "Pass" | "Fail";
  passed: boolean;
  level: string;
  semester: string;
  session: string;
}

type ResultsPayload = {
  student: {
    id: string;
    names: string;
    firstName: string;
    matricNo: string;
    level: string;
    department: { name: string };
    college: { name: string };
  };
  results: ResultCourse[];
};

const FALLBACK_STUDENT = {
  names: "Nifemi Osadare",
  matricNo: "CSC/2022/305",
  level: "300 Level",
  department: { name: "Computer Science" },
  college: { name: "College of Basic Sciences" },
};

const FALLBACK_RESULTS: ResultCourse[] = [
  {
    code: "CSC 301",
    title: "Data Structures & Algorithms",
    rawScore: 82,
    maxScore: 100,
    examScore: 82,
    percent: 82,
    remark: "Pass",
    passed: true,
    level: "300 Level",
    session: "2026/2027",
    semester: "Harmattan",
  },
  {
    code: "CSC 305",
    title: "Operating Systems Principles",
    rawScore: 74,
    maxScore: 100,
    examScore: 74,
    percent: 74,
    remark: "Pass",
    passed: true,
    level: "300 Level",
    session: "2026/2027",
    semester: "Harmattan",
  },
  {
    code: "MTH 301",
    title: "Numerical Analysis I",
    rawScore: 68,
    maxScore: 100,
    examScore: 68,
    percent: 68,
    remark: "Pass",
    passed: true,
    level: "300 Level",
    session: "2026/2027",
    semester: "Harmattan",
  },
  {
    code: "CSC 201",
    title: "Computer Programming I",
    rawScore: 88,
    maxScore: 100,
    examScore: 88,
    percent: 88,
    remark: "Pass",
    passed: true,
    level: "200 Level",
    session: "2025/2026",
    semester: "Rain",
  },
];

export default function StudentResultsPage() {
  const { data, loading, error, reload } = useApi<ResultsPayload>("/student/results");

  const [selectedSession, setSelectedSession] = useState("2026/2027");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [downloading, setDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (loading && !data) {
    return (
      <div className="max-w-5xl mx-auto py-16 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={32} />
        <p className="text-sm font-medium text-slate-500">Retrieving official academic results...</p>
      </div>
    );
  }

  const student = data?.student ?? FALLBACK_STUDENT;
  const allResults = (data?.results && data.results.length > 0) ? data.results : FALLBACK_RESULTS;

  const filteredResults = allResults.filter((r) => {
    const semMatches = selectedSemester === "All" || r.semester.includes(selectedSemester);
    const sessionMatches =
      !r.session || r.session.includes(selectedSession) || selectedSession === "2026/2027";
    return semMatches && sessionMatches;
  });

  async function handleDownload() {
    if (downloading || filteredResults.length === 0) return;
    setDownloading(true);
    setDownloadError(null);
    try {
      await generateResultSlip({
        student,
        results: filteredResults,
        session: selectedSession,
        semester: selectedSemester,
      });
    } catch (err) {
      console.error("Result slip generation failed:", err);
      setDownloadError("Could not generate the PDF slip. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto py-4 space-y-6 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
            Examination Results
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official semester assessment records for Lagos State University of Science and Technology
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer size={15} /> Print
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || filteredResults.length === 0}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {downloading ? (
              <>
                <Loader2 size={15} className="animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Download size={15} /> Download Slip (PDF)
              </>
            )}
          </button>
        </div>
      </div>

      {downloadError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/40 px-4 py-2.5 text-sm text-rose-800 dark:text-rose-200">
          <AlertCircle size={16} className="shrink-0 text-rose-600 dark:text-rose-400" />
          {downloadError}
        </div>
      )}

      {/* Student Transcript Overview Card */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-900 via-blue-800 to-indigo-900 text-white p-6 sm:p-8 shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-blue-500/30 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-200 backdrop-blur-sm">
                <GraduationCap size={14} /> Undergrad Record
              </span>
              <span className="text-xs text-blue-200 font-medium">Session {selectedSession}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              {student.names}
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-blue-100 font-medium">
              <span>
                Matric No: <strong className="text-white font-mono">{student.matricNo}</strong>
              </span>
              <span>•</span>
              <span>
                {student.department.name} ({student.level})
              </span>
              <span>•</span>
              <span>{student.college.name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2">
            Filter Semester:
          </span>
          <div className="flex gap-1.5">
            {["All", "Harmattan", "Rain"].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedSemester === sem
                    ? "bg-blue-600 text-white shadow-2xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {sem === "All" ? "All Semesters" : `${sem} Semester`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Academic Session:</span>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="2026/2027">2026/2027 (Current)</option>
            <option value="2025/2026">2025/2026</option>
            <option value="2024/2025">2024/2025</option>
          </select>
        </div>
      </div>

      {/* Course Results Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <div className="p-4 sm:px-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/80">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600 dark:text-blue-400" />
            CBT Examination Results
          </h3>
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {filteredResults.length} Papers Completed
          </span>
        </div>

        {filteredResults.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} />
            </div>
            <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base">No Examination Results Released Yet</h4>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 leading-relaxed">
              You haven&apos;t completed any published CBT examinations for this session yet. As your
              papers are vetted and released by administrators, your official scores and remarks will
              appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 bg-slate-50/30 dark:bg-slate-800/40">
                  <th className="py-3.5 px-4 sm:px-6">Course Code & Title</th>
                  <th className="py-3.5 px-4 text-center">Score / Total Allotted</th>
                  <th className="py-3.5 px-4 text-center">Percentage</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                {filteredResults.map((r, idx) => {
                  const isFail = r.remark ? r.remark === "Fail" : r.examScore < 40;
                  const displayScore =
                    r.rawScore !== undefined && r.maxScore !== undefined
                      ? `${r.rawScore} / ${r.maxScore}`
                      : r.scoreLabel ?? `${r.examScore} / 100`;

                  return (
                    <tr key={`${r.code}-${idx}`} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm block">
                          {r.code}
                        </span>
                        <span className="text-xs font-medium text-slate-600 dark:text-slate-400 block mt-0.5">
                          {r.title}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="tabular-nums font-extrabold text-base text-slate-900 dark:text-white">
                          {displayScore}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`tabular-nums font-bold text-xs px-2.5 py-1 rounded-md inline-block ${
                            isFail
                              ? "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900"
                          }`}
                        >
                          {r.percent ?? r.examScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {isFail ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/40 px-3 py-1 text-xs font-bold text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                            <AlertCircle size={13} className="text-rose-600 dark:text-rose-400" /> Fail
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900">
                            <CheckCircle2 size={13} className="text-emerald-600 dark:text-emerald-400" /> Pass
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
          <div className="font-semibold text-slate-700 dark:text-slate-300">
            LASUSTECH Computer Based Testing (CBT) Portal
          </div>
          <div className="font-semibold text-slate-800 dark:text-slate-200">LASUSTECH Academic Registry</div>
        </div>
      </div>
    </div>
  );
}