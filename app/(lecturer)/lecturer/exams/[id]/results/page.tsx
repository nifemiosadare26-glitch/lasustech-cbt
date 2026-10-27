"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Download, Loader2, Search, FileText, BarChart3 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { useApi } from "@/lib/useApi";
import { apiDownload } from "@/lib/apiClient";
import { ErrorBanner, errMessage } from "@/components/admin/ui";
import { CandidateScriptModal } from "@/components/exam/candidate-script-modal";

interface ResultRow {
  id: string;
  attemptId?: string;
  matric: string;
  name: string;
  rawScore?: number;
  maxScore?: number;
  score: number;
  grade: string;
  time: string;
}

interface ResultsPayload {
  summary: { totalStudents: number; averageScore: string; passRate: string };
  distribution: { range: string; count: number; label: string }[];
  students: ResultRow[];
}

interface ExamDetail {
  id: string;
  title: string;
  status: string;
  ownerLabel: string;
  passMark: string | null;
  durationMin: number | null;
}

const gradeColor = (grade: string) => {
  if (grade === "A" || grade === "B") return "bg-green-100 text-green-800";
  if (grade === "C") return "bg-blue-100 text-blue-800";
  if (grade === "D" || grade === "E") return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

export default function ExamResults() {
  const params = useParams<{ id: string }>();
  const examId = params?.id ?? "";
  const router = useRouter();

  const [search, setSearch] = React.useState("");
  const [grade, setGrade] = React.useState("");
  const [exporting, setExporting] = React.useState(false);
  const [exportError, setExportError] = React.useState<string | null>(null);
  const [selectedAttemptId, setSelectedAttemptId] = React.useState<string | null>(null);

  const exam = useApi<ExamDetail>(examId ? `/lecturer/exams/${examId}` : null);
  const results = useApi<ResultsPayload>(examId ? `/lecturer/exams/${examId}/results` : null);

  const payload = results.data;

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const totalScoredCandidates = React.useMemo(() => {
    return (payload?.distribution ?? []).reduce((sum, item) => sum + (item.count || 0), 0);
  }, [payload?.distribution]);
  const students = React.useMemo(() => {
    const rows = payload?.students ?? [];
    const term = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (grade && row.grade !== grade) return false;
      if (!term) return true;
      return row.name.toLowerCase().includes(term) || row.matric.toLowerCase().includes(term);
    });
  }, [payload?.students, search, grade]);

  const exportCsv = async () => {
    if (!examId) return;
    setExporting(true);
    setExportError(null);
    try {
      const label = (exam.data?.title ?? "Exam").replace(/\s+/g, "_");
      await apiDownload(`/lecturer/exams/${examId}/results/export/csv`, `${label}_Results.csv`);
    } catch (error) {
      setExportError(errMessage(error));
    } finally {
      setExporting(false);
    }
  };

  const error = results.error ?? exam.error;

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="px-2 h-9" onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">
                {exam.data?.title ?? "Exam results"}
              </h2>
              {exam.data && (
                <Badge variant="outline" className="text-gray-600 bg-gray-50 text-[11px]">
                  {exam.data.status === "APPROVED" ? "Active" : exam.data.status.toLowerCase()}
                </Badge>
              )}
            </div>
            <p className="text-[13px] text-gray-500">
              {exam.data?.ownerLabel ? `${exam.data.ownerLabel} • ` : ""}
              {payload ? `${payload.summary.totalStudents} result(s)` : "Loading results..."}
              {exam.data?.passMark ? ` • pass mark ${exam.data.passMark}%` : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => void exportCsv()} isLoading={exporting}>
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
        </div>
      </div>

      {error && (
        <ErrorBanner
          error={error}
          onRetry={() => {
            void results.reload();
            void exam.reload();
          }}
        />
      )}

      {exportError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
          {exportError}
        </div>
      )}

      {results.loading && !payload ? (
        <div className="flex items-center justify-center py-24 text-gray-500">
          <Loader2 size={20} className="animate-spin mr-2" /> Loading results...
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Total candidates" value={payload?.summary.totalStudents ?? 0} />
            <StatCard label="Average score" value={`${payload?.summary.averageScore ?? "0.0"}%`} />
            <StatCard label="Pass rate" value={`${payload?.summary.passRate ?? "0.0"}%`} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col min-h-[400px]">
              <Card title="Candidate breakdown" className="flex-1 flex flex-col overflow-hidden" noPadding>
                <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                      placeholder="Search candidate name..."
                      className="pl-9 h-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <select
                    className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  >
                    <option value="">All grades</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                    <option value="E">E</option>
                    <option value="F">F</option>
                  </select>
                </div>

                <div className="flex-1 overflow-auto bg-white">
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
                      <tr>
                        <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Candidate</th>
                        <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase text-center">Score / Total</th>
                        <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase text-center">Percentage</th>
                        <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase text-center">Grade</th>
                        <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Time taken</th>
                        <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase text-right">Status</th>
                        <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-6 py-12 text-center text-[14px] text-gray-500">
                            {payload?.students.length
                              ? "No candidates match this filter."
                              : "No one has taken this exam yet."}
                          </td>
                        </tr>
                      ) : (
                        students.map((student) => {
                          const passed = student.grade !== "F";
                          const scoreDisplay =
                            student.rawScore !== undefined && student.maxScore !== undefined
                              ? `${student.rawScore} / ${student.maxScore}`
                              : `${student.score}`;

                          return (
                            <tr key={student.id} className="hover:bg-gray-50">
                              <td className="px-6 py-3">
                                <div className="text-[13px] text-gray-900 font-medium">{student.name}</div>
                                {student.matric !== "Unknown" && (
                                  <div className="font-mono text-[12px] text-gray-500">{student.matric}</div>
                                )}
                              </td>
                              <td className="px-6 py-3 text-center text-[14px] font-bold text-gray-900 tabular-nums">
                                {scoreDisplay}
                              </td>
                              <td className="px-6 py-3 text-center text-[13px] font-semibold text-gray-700 tabular-nums">
                                {student.score}%
                              </td>
                              <td className="px-6 py-3 text-center">
                                <div
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold ${gradeColor(student.grade)}`}
                                >
                                  {student.grade}
                                </div>
                              </td>
                              <td className="px-6 py-3 text-[13px] text-gray-500">{student.time}</td>
                              <td className="px-6 py-3 text-right">
                                <span
                                  className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                                    passed ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                  }`}
                                >
                                  {passed ? "Passed" : "Failed"}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-right">
                                {student.attemptId && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => setSelectedAttemptId(student.attemptId!)}
                                    className="h-7 px-2.5 text-[11px] bg-white hover:bg-gray-100 border border-gray-200"
                                  >
                                    <FileText size={12} className="mr-1 text-blue-600" /> Review Script
                                  </Button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Card noPadding className="flex flex-col overflow-hidden bg-white border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white shrink-0">
                  <div>
                    <h3 className="font-semibold text-[17px] text-gray-900 tracking-tight">Score distribution</h3>
                    <p className="text-[12px] text-gray-500 mt-0.5">
                      Performance spread across grading bands
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] font-medium text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>Pass
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>Fail
                    </div>
                  </div>
                </div>

                <div className="p-5 flex flex-col justify-between">
                  <div className="w-full h-[280px] min-h-[260px] relative">
                    {!mounted ? (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <Loader2 size={24} className="animate-spin mr-2 text-blue-600" />
                        <span className="text-xs">Loading chart...</span>
                      </div>
                    ) : totalScoredCandidates === 0 ? (
                      <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 border border-dashed border-gray-200 rounded-xl bg-gray-50/50">
                        <BarChart3 size={36} className="text-gray-300 mb-2" />
                        <p className="text-[14px] font-semibold text-gray-800">No scored attempts yet</p>
                        <p className="text-[12px] text-gray-500 mt-1 max-w-xs">
                          Score distribution will automatically visualize here once candidates submit this exam.
                        </p>
                      </div>
                    ) : (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={payload?.distribution ?? []}
                          margin={{ top: 15, right: 10, left: -20, bottom: 20 }}
                        >
                          <XAxis
                            dataKey="range"
                            axisLine={{ stroke: "#E2E8F0" }}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#64748B" }}
                            dy={10}
                            interval={0}
                          />
                          <YAxis
                            axisLine={{ stroke: "#E2E8F0" }}
                            tickLine={false}
                            tick={{ fontSize: 11, fill: "#64748B" }}
                            allowDecimals={false}
                          />
                          <Tooltip
                            cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
                            content={({ active, payload: tooltipPayload }) => {
                              if (active && tooltipPayload && tooltipPayload.length) {
                                const data = tooltipPayload[0].payload as { range: string; count: number; label: string };
                                const percentOfTotal = totalScoredCandidates
                                  ? ((data.count / totalScoredCandidates) * 100).toFixed(1)
                                  : "0";
                                return (
                                  <div className="bg-white border border-gray-200 p-3 rounded-xl shadow-xl text-xs space-y-1 z-50">
                                    <div className="flex items-center gap-2">
                                      <span className={`w-2 h-2 rounded-full ${data.label === "F" ? "bg-rose-500" : "bg-blue-600"}`} />
                                      <span className="font-bold text-gray-900">
                                        Grade {data.label} ({data.range}%)
                                      </span>
                                    </div>
                                    <p className="text-gray-600">
                                      <span className="font-semibold text-gray-900 text-sm">{data.count}</span> candidate{data.count === 1 ? "" : "s"} ({percentOfTotal}%)
                                    </p>
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                          <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                            {(payload?.distribution ?? []).map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={entry.label === "F" ? "#EF4444" : "#2563EB"}
                              />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    )}
                  </div>

                  {/* Grade Breakdown Cards */}
                  <div className="grid grid-cols-6 gap-2 mt-4 pt-4 border-t border-gray-100">
                    {(payload?.distribution ?? []).map((item) => {
                      const count = item.count || 0;
                      const pct = totalScoredCandidates ? Math.round((count / totalScoredCandidates) * 100) : 0;
                      return (
                        <div
                          key={item.label}
                          className="flex flex-col items-center justify-center p-2 rounded-lg bg-gray-50/80 border border-gray-200/60 text-center transition-colors hover:bg-gray-100/80"
                        >
                          <span className={`text-[12px] font-black ${item.label === "F" ? "text-rose-600" : "text-blue-600"}`}>
                            {item.label}
                          </span>
                          <span className="text-[15px] font-bold text-gray-900 tabular-nums my-0.5">
                            {count}
                          </span>
                          <span className="text-[10px] text-gray-400 tabular-nums">
                            {pct}%
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}

      {selectedAttemptId && (
        <CandidateScriptModal
          attemptId={selectedAttemptId}
          role="LECTURER"
          onClose={() => setSelectedAttemptId(null)}
        />
      )}
    </div>
  );
}
