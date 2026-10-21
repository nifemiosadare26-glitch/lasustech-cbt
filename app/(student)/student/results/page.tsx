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

  if (error && !data) {
    return (
      <div className="max-w-5xl mx-auto py-12 px-4">
        <div className="p-6 rounded-3xl border border-rose-200 bg-rose-50 text-rose-800 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <AlertCircle size={20} className="text-rose-600" />
            Unable to load examination results
          </div>
          <p className="text-sm">{error.message || "Failed to load grade transcript."}</p>
          <button
            onClick={() => reload()}
            className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const student = data?.student ?? FALLBACK_STUDENT;
  const allResults = data?.results ?? [];

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
          <ThemeToggle className="p-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-xl" />
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
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
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-800">
          <AlertCircle size={16} className="shrink-0 text-rose-600" />
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

          {/* CBT Assessment Badge */}
          <div className="shrink-0 flex items-center gap-3 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="text-left">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                CBT Portal Assessment
              </span>
              <span className="text-sm font-semibold text-white block mt-0.5">
                Official Examination Records
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
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
                    ? "bg-slate-900 text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {sem === "All" ? "All Semesters" : `${sem} Semester`}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <span className="text-xs text-slate-500 font-medium">Academic Session:</span>
          <select
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
            className="text-xs font-semibold rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="2026/2027">2026/2027 (Current)</option>
            <option value="2025/2026">2025/2026</option>
            <option value="2024/2025">2024/2025</option>
          </select>
        </div>
      </div>

      {/* Course Results Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            CBT Examination Results
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {filteredResults.length} Papers Completed
          </span>
        </div>

        {filteredResults.length === 0 ? (
          <div className="py-16 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              <BookOpen size={24} />
            </div>
            <h4 className="font-bold text-slate-800 text-base">No Examination Results Released Yet</h4>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
              You haven&apos;t completed any published CBT examinations for this session yet. As your
              papers are vetted and released by administrators, your official scores and remarks will
              appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/30">
                  <th className="py-3.5 px-4 sm:px-6">Course Code & Title</th>
                  <th className="py-3.5 px-4 text-center">Score / Total Allotted</th>
                  <th className="py-3.5 px-4 text-center">Percentage</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Remark</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredResults.map((r, idx) => {
                  const isFail = r.remark ? r.remark === "Fail" : r.examScore <= 30;
                  const displayScore =
                    r.rawScore !== undefined && r.maxScore !== undefined
                      ? `${r.rawScore} / ${r.maxScore}`
                      : r.scoreLabel ?? `${r.examScore} / 100`;

                  return (
                    <tr key={`${r.code}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 sm:px-6">
                        <span className="font-mono font-bold text-slate-900 text-sm block">
                          {r.code}
                        </span>
                        <span className="text-xs font-medium text-slate-600 block mt-0.5">
                          {r.title}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="tabular-nums font-extrabold text-base text-slate-900">
                          {displayScore}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`tabular-nums font-bold text-xs px-2.5 py-1 rounded-md inline-block ${
                            isFail
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {r.percent ?? r.examScore}%
                        </span>
                      </td>
                      <td className="py-4 px-4 sm:px-6 text-right">
                        {isFail ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-bold text-rose-700 border border-rose-200">
                            <AlertCircle size={13} className="text-rose-600" /> Fail
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                            <CheckCircle2 size={13} className="text-emerald-600" /> Pass
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
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div className="font-semibold text-slate-700">
            LASUSTECH Computer Based Testing (CBT) Portal
          </div>
          <div className="font-semibold text-slate-800">LASUSTECH Academic Registry</div>
        </div>
      </div>
    </div>
  );
}