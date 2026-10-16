"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Download,
  Search,
  Lock,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Users,
  Award,
  Filter
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

interface StudentResult {
  matric: string;
  name: string;
  score: number;
  grade: "A" | "B" | "C" | "D" | "E" | "F";
  time: string;
  status: "Passed" | "Failed";
}

interface ExamResultsData {
  id: string;
  code: string;
  title: string;
  date: string;
  totalStudents: number;
  averageScore: number;
  passRate: number;
  highestScore: number;
  scoreDistribution: { range: string; count: number; label: string }[];
  students: StudentResult[];
}

const COURSES_DATA: Record<string, ExamResultsData> = {
  "CSC 301": {
    id: "csc301",
    code: "CSC 301",
    title: "Data Structures & Algorithms",
    date: "Oct 15, 2026",
    totalStudents: 130,
    averageScore: 58.4,
    passRate: 90.7,
    highestScore: 94,
    scoreDistribution: [
      { range: "0-39", count: 12, label: "F" },
      { range: "40-44", count: 8, label: "E" },
      { range: "45-49", count: 15, label: "D" },
      { range: "50-59", count: 45, label: "C" },
      { range: "60-69", count: 32, label: "B" },
      { range: "70-100", count: 18, label: "A" }
    ],
    students: [
      { matric: "CSC/22/101", name: "Ada O.", score: 85, grade: "A", time: "55m 20s", status: "Passed" },
      { matric: "CSC/22/117", name: "Tunde B.", score: 62, grade: "B", time: "59m 10s", status: "Passed" },
      { matric: "CSC/22/045", name: "Chinedu M.", score: 48, grade: "D", time: "60m 00s", status: "Passed" },
      { matric: "CSC/22/130", name: "Zainab K.", score: 74, grade: "A", time: "42m 15s", status: "Passed" },
      { matric: "CSC/22/089", name: "Sarah J.", score: 35, grade: "F", time: "60m 00s", status: "Failed" },
      { matric: "CSC/22/012", name: "Femi A.", score: 91, grade: "A", time: "38m 40s", status: "Passed" },
      { matric: "CSC/22/034", name: "Bisi O.", score: 54, grade: "C", time: "52m 10s", status: "Passed" },
      { matric: "CSC/22/078", name: "Musa K.", score: 68, grade: "B", time: "49m 30s", status: "Passed" },
      { matric: "CSC/22/095", name: "Emeka U.", score: 42, grade: "E", time: "60m 00s", status: "Passed" },
      { matric: "CSC/22/144", name: "Grace T.", score: 79, grade: "A", time: "45m 12s", status: "Passed" }
    ]
  },
  "CSC 305": {
    id: "csc305",
    code: "CSC 305",
    title: "Operating Systems",
    date: "Oct 12, 2026",
    totalStudents: 118,
    averageScore: 61.2,
    passRate: 93.2,
    highestScore: 96,
    scoreDistribution: [
      { range: "0-39", count: 8, label: "F" },
      { range: "40-44", count: 6, label: "E" },
      { range: "45-49", count: 12, label: "D" },
      { range: "50-59", count: 38, label: "C" },
      { range: "60-69", count: 35, label: "B" },
      { range: "70-100", count: 19, label: "A" }
    ],
    students: [
      { matric: "CSC/22/101", name: "Ada O.", score: 78, grade: "A", time: "52m 10s", status: "Passed" },
      { matric: "CSC/22/117", name: "Tunde B.", score: 69, grade: "B", time: "58m 00s", status: "Passed" },
      { matric: "CSC/22/045", name: "Chinedu M.", score: 55, grade: "C", time: "60m 00s", status: "Passed" },
      { matric: "CSC/22/130", name: "Zainab K.", score: 88, grade: "A", time: "44m 30s", status: "Passed" },
      { matric: "CSC/22/089", name: "Sarah J.", score: 38, grade: "F", time: "60m 00s", status: "Failed" }
    ]
  },
  "CSC 411": {
    id: "csc411",
    code: "CSC 411",
    title: "Artificial Intelligence",
    date: "Oct 10, 2026",
    totalStudents: 92,
    averageScore: 64.8,
    passRate: 95.6,
    highestScore: 98,
    scoreDistribution: [
      { range: "0-39", count: 4, label: "F" },
      { range: "40-44", count: 5, label: "E" },
      { range: "45-49", count: 9, label: "D" },
      { range: "50-59", count: 28, label: "C" },
      { range: "60-69", count: 30, label: "B" },
      { range: "70-100", count: 16, label: "A" }
    ],
    students: [
      { matric: "CSC/21/005", name: "Ibrahim K.", score: 92, grade: "A", time: "40m 10s", status: "Passed" },
      { matric: "CSC/21/022", name: "Khadija S.", score: 81, grade: "A", time: "46m 25s", status: "Passed" },
      { matric: "CSC/21/049", name: "Oluwaseun D.", score: 65, grade: "B", time: "55m 00s", status: "Passed" },
      { matric: "CSC/21/088", name: "Blessing N.", score: 58, grade: "C", time: "58m 40s", status: "Passed" }
    ]
  }
};

const getGradeBadge = (grade: string) => {
  switch (grade) {
    case "A":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "B":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "C":
      return "bg-cyan-100 text-cyan-800 border-cyan-200";
    case "D":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "E":
      return "bg-orange-100 text-orange-800 border-orange-200";
    default:
      return "bg-red-100 text-red-800 border-red-200";
  }
};

export default function LecturerResultsHub() {
  const [selectedCourse, setSelectedCourse] = useState("CSC 301");
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");

  const currentData = COURSES_DATA[selectedCourse] || COURSES_DATA["CSC 301"];

  const filteredStudents = useMemo(() => {
    return currentData.students.filter((s) => {
      const matchQuery =
        s.matric.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchGrade = gradeFilter === "All" || s.grade === gradeFilter;
      return matchQuery && matchGrade;
    });
  }, [currentData, searchQuery, gradeFilter]);

  const handleDownload = (format: "csv" | "pdf") => {
    const filename = `${currentData.code.replace(/\s+/g, "_")}_Official_Results.${format}`;
    const content =
      format === "csv"
        ? "Matric No,Student Name,Score (%),Grade,Status,Time Taken\n" +
          currentData.students
            .map(
              (s) =>
                `"${s.matric}","${s.name}",${s.score},${s.grade},${s.status},"${s.time}"`
            )
            .join("\n")
        : `LASUSTECH CBT Official Results - ${currentData.code} (${currentData.title})\nVerified Records`;

    const blob = new Blob([content], {
      type: format === "csv" ? "text/csv" : "application/pdf"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              Course Examination Results
            </h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-700 border border-slate-200">
              <Lock size={12} className="text-slate-500" /> View Only
            </span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Official validated examination assessment records for Lagos State University of Science and Technology.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button variant="secondary" onClick={() => handleDownload("csv")}>
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
          <Button onClick={() => handleDownload("pdf")}>
            <Download size={16} className="mr-2" /> Download PDF Slip
          </Button>
        </div>
      </div>

      {/* Official Read-Only Compliance Banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs sm:text-sm">
        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
          <FileCheck2 size={18} />
        </div>
        <div className="flex-1">
          <strong>Official Examination Board Record:</strong> Results are locked for integrity verification. Lecturers have full viewing and export privileges, but cannot edit student scores or alter grades directly.
        </div>
      </div>

      {/* Course Selector Strip */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 pl-2">
          Select Course:
        </span>
        {Object.keys(COURSES_DATA).map((courseCode) => (
          <button
            key={courseCode}
            onClick={() => {
              setSelectedCourse(courseCode);
              setSearchQuery("");
              setGradeFilter("All");
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedCourse === courseCode
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {courseCode} – {COURSES_DATA[courseCode].title}
          </button>
        ))}
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Candidates"
          value={currentData.totalStudents.toString()}
          delta="Completed exam"
          trendType="neutral"
        />
        <StatCard
          label="Class Average"
          value={`${currentData.averageScore}%`}
          delta="Harmattan Session"
          trendType="up"
        />
        <StatCard
          label="Overall Pass Rate"
          value={`${currentData.passRate}%`}
          delta="Score >= 40%"
          trendType="up"
        />
        <StatCard
          label="Highest Score"
          value={`${currentData.highestScore}%`}
          delta="Top performance"
          trendType="up"
        />
      </div>

      {/* Main Content: Breakdown & Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Students Result Breakdown */}
        <div className="lg:col-span-2 flex flex-col min-h-[460px]">
          <Card className="flex-1 flex flex-col overflow-hidden" noPadding>
            {/* Table Search & Filter Toolbar */}
            <div className="p-4 border-b border-gray-100 flex flex-wrap items-center gap-3 bg-gray-50/70">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search matric number or student name..."
                  className="pl-9 h-9 bg-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">Grade:</span>
                <select
                  value={gradeFilter}
                  onChange={(e) => setGradeFilter(e.target.value)}
                  className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="All">All Grades</option>
                  <option value="A">Grade A (70-100%)</option>
                  <option value="B">Grade B (60-69%)</option>
                  <option value="C">Grade C (50-59%)</option>
                  <option value="D">Grade D (45-49%)</option>
                  <option value="E">Grade E (40-44%)</option>
                  <option value="F">Grade F (0-39%)</option>
                </select>
              </div>
            </div>

            {/* Read-Only Table */}
            <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-0 border-b border-gray-200 shadow-2xs">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Matric & Name
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                      Score
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                      Grade
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                      Time Taken
                    </th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-12 text-center text-gray-400 text-sm"
                      >
                        No student results found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.matric} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-3.5">
                          <div className="font-mono text-sm font-semibold text-gray-900">
                            {s.matric}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{s.name}</div>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="font-semibold text-base text-gray-900 tabular-nums">
                            {s.score}%
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getGradeBadge(
                              s.grade
                            )}`}
                          >
                            {s.grade}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-center text-xs text-gray-500 font-mono">
                          {s.time}
                        </td>
                        <td className="px-6 py-3.5 text-right">
                          <span
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                              s.status === "Passed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-red-50 text-red-700 border-red-200"
                            }`}
                          >
                            {s.status === "Passed" ? (
                              <CheckCircle2 size={12} />
                            ) : (
                              <AlertCircle size={12} />
                            )}
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Table Footer with Summary */}
            <div className="p-3.5 px-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <span>Showing {filteredStudents.length} candidate results</span>
              <span className="font-medium text-gray-700">Official Exam Record • Locked</span>
            </div>
          </Card>
        </div>

        {/* Right: Score Distribution Chart */}
        <div className="space-y-6">
          <Card className="h-[460px] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
              <div>
                <h3 className="font-semibold text-base text-gray-900 tracking-tight">
                  Score Distribution
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Grade curve analysis</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                  Pass
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  Fail
                </div>
              </div>
            </div>

            <div className="flex-1 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={currentData.scoreDistribution}
                  margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
                >
                  <XAxis
                    dataKey="range"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-gray-500, #6b7280)" }}
                    dy={8}
                    interval={0}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fontSize: 11, fill: "var(--color-gray-500, #6b7280)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "var(--color-gray-50, #f9fafb)" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                    }}
                    formatter={(value: any, name: any, props: any) => [
                      `${value} students`,
                      `Grade ${props.payload.label}`
                    ]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {currentData.scoreDistribution.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.label.includes("F")
                            ? "#ef4444"
                            : "#2563eb"
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
