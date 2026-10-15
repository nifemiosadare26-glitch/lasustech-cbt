"use client";

import React, { useState } from "react";
import {
  Download,
  Printer,
  ChevronDown,
  Award,
  CheckCircle2,
  BookOpen,
  Calendar,
  FileCheck2,
  TrendingUp,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface ResultCourse {
  code: string;
  title: string;
  units: number;
  caScore: number;
  examScore: number;
  totalScore: number;
  grade: string;
  gradePoint: number;
  status: "Passed" | "Failed";
  level: string;
  semester: string;
}

const RESULTS_DATA: ResultCourse[] = [
  {
    code: "CSC 301",
    title: "Data Structures & Algorithms",
    units: 3,
    caScore: 28,
    examScore: 50,
    totalScore: 78,
    grade: "A",
    gradePoint: 5.0,
    status: "Passed",
    level: "300 Level",
    semester: "Harmattan (1st)",
  },
  {
    code: "MTH 201",
    title: "Mathematical Methods I",
    units: 3,
    caScore: 24,
    examScore: 48,
    totalScore: 72,
    grade: "A",
    gradePoint: 5.0,
    status: "Passed",
    level: "300 Level",
    semester: "Harmattan (1st)",
  },
  {
    code: "CSC 201",
    title: "Computer Programming I",
    units: 3,
    caScore: 29,
    examScore: 52,
    totalScore: 81,
    grade: "A",
    gradePoint: 5.0,
    status: "Passed",
    level: "300 Level",
    semester: "Harmattan (1st)",
  },
  {
    code: "GST 101",
    title: "Use of English",
    units: 2,
    caScore: 26,
    examScore: 44,
    totalScore: 70,
    grade: "A",
    gradePoint: 5.0,
    status: "Passed",
    level: "300 Level",
    semester: "Harmattan (1st)",
  },
  {
    code: "CSC 305",
    title: "Algorithms & Complexity Analysis",
    units: 3,
    caScore: 23,
    examScore: 43,
    totalScore: 66,
    grade: "B",
    gradePoint: 4.0,
    status: "Passed",
    level: "300 Level",
    semester: "Harmattan (1st)",
  },
];

export default function StudentResultsPage() {
  const [selectedSession, setSelectedSession] = useState("2026/2027");
  const [selectedSemester, setSelectedSemester] = useState("All");

  const filteredResults = RESULTS_DATA.filter((r) => {
    if (selectedSemester === "All") return true;
    return r.semester.includes(selectedSemester);
  });

  const totalUnits = filteredResults.reduce((acc, curr) => acc + curr.units, 0);

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
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Printer size={15} /> Print
          </button>
          <button
            onClick={() => alert("Downloading official PDF result slip...")}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-2xs"
          >
            <Download size={15} /> Download Slip (PDF)
          </button>
        </div>
      </div>

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
              Nifemi Osadare
            </h2>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-blue-100 font-medium">
              <span>Matric No: <strong className="text-white font-mono">CSC/22/101</strong></span>
              <span>•</span>
              <span>Computer Science (300 Level)</span>
              <span>•</span>
              <span>College of Basic Sciences</span>
            </div>
          </div>

          {/* Academic Summary Box */}
          <div className="shrink-0 flex items-center gap-5 bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15">
            <div className="text-center px-2">
              <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider block">
                Total Units
              </span>
              <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                {totalUnits}
              </span>
              <span className="text-[11px] text-blue-200 block font-medium mt-0.5">Credit Load</span>
            </div>

            <div className="h-10 w-px bg-white/20" />

            <div className="space-y-1 text-xs text-blue-100">
              <div>Courses Recorded: <strong className="text-white font-bold">{filteredResults.length}</strong></div>
              <div>Units Passed: <strong className="text-white font-bold">{totalUnits}</strong></div>
              <div className="inline-flex items-center gap-1 text-emerald-300 font-bold text-xs mt-1">
                <CheckCircle2 size={13} /> Clear Standing
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and View Options */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-2">Filter Semester:</span>
          <div className="flex gap-1.5">
            {["All", "Harmattan", "Rain"].map((sem) => (
              <button
                key={sem}
                onClick={() => setSelectedSemester(sem)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
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

      {/* Course Results Table / Card View */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
        <div className="p-4 sm:px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <BookOpen size={18} className="text-blue-600" />
            Registered Courses & Score Breakdown
          </h3>
          <span className="text-xs font-semibold text-slate-500">
            {filteredResults.length} Courses Recorded
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-50/30">
                <th className="py-3.5 px-4 sm:px-6">Course Code & Title</th>
                <th className="py-3.5 px-3 text-center">Units</th>
                <th className="py-3.5 px-3 text-center">C.A (30)</th>
                <th className="py-3.5 px-3 text-center">Exam (70)</th>
                <th className="py-3.5 px-3 text-center">Total (100)</th>
                <th className="py-3.5 px-3 text-center">Grade</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredResults.map((r) => (
                <tr key={r.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-4 sm:px-6">
                    <span className="font-mono font-bold text-slate-900 text-sm block">
                      {r.code}
                    </span>
                    <span className="text-xs font-medium text-slate-600 block mt-0.5">
                      {r.title}
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center font-medium text-slate-700">
                    {r.units}
                  </td>
                  <td className="py-4 px-3 text-center tabular-nums font-medium text-slate-600">
                    {r.caScore}
                  </td>
                  <td className="py-4 px-3 text-center tabular-nums font-medium text-slate-600">
                    {r.examScore}
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span className="tabular-nums font-bold text-slate-900 text-base">
                      {r.totalScore}%
                    </span>
                  </td>
                  <td className="py-4 px-3 text-center">
                    <span
                      className={`inline-block w-8 py-0.5 text-center rounded-md font-extrabold text-xs border ${
                        r.grade === "A"
                          ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                          : r.grade === "B"
                          ? "bg-blue-50 text-blue-800 border-blue-200"
                          : "bg-slate-100 text-slate-800 border-slate-300"
                      }`}
                    >
                      {r.grade}
                    </span>
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-200">
                      <CheckCircle2 size={12} /> Passed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Summary Bar */}
        <div className="p-4 sm:px-6 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
          <div>
            <strong>Grading System:</strong> 70-100% = A | 60-69% = B | 50-59% = C | 45-49% = D | 0-44% = F
          </div>
          <div className="font-semibold text-slate-800">
            LASUSTECH Academic Registry
          </div>
        </div>
      </div>
    </div>
  );
}
