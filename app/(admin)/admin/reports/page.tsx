"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, Clock, X, AlertTriangle, Loader2, ShieldAlert } from "lucide-react";
import { apiDownload } from "@/lib/apiClient";
import { useApi } from "@/lib/useApi";
import { fmtDateTime } from "@/lib/format";
import { ErrorBanner, errMessage, useToast } from "@/components/admin/ui";
import { LASUSTECH_COLLEGES } from "@/lib/lasustech-structure";

interface Department {
  id: string;
  code: string;
  name: string;
}

interface College {
  id: string;
  code: string;
  name: string;
  departments: Department[];
}

interface Course {
  id: string;
  code: string;
  title: string;
  level: number;
  departmentId: string;
}

interface LogEntry {
  id: string;
  at: string;
  kind: "FLAG" | "INTERVENTION" | "INCIDENT";
  severity: string;
  title: string;
  detail: string;
  studentName: string | null;
  matricNo: string | null;
  courseCode: string | null;
  examTitle: string | null;
  actorName: string | null;
}

const LEVELS = [100, 200, 300, 400, 500, 600, 700];

export default function ExamReports() {
  const toast = useToast();
  const [isLiveLogOpen, setIsLiveLogOpen] = React.useState(false);
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const [departmentId, setDepartmentId] = React.useState("");
  const [level, setLevel] = React.useState("300");
  const [courseId, setCourseId] = React.useState("");

  const structure = useApi<College[]>("/admin/structure");
  const courses = useApi<Course[]>("/admin/courses");
  const departments = ((structure.data && structure.data.length > 0) ? structure.data : (LASUSTECH_COLLEGES as unknown as College[])).flatMap((c) => c.departments);

  React.useEffect(() => {
    if (!departmentId && departments.length) setDepartmentId(departments[0].id);
  }, [departmentId, departments]);

  React.useEffect(() => {
    if (!courseId && courses.data?.length) setCourseId(courses.data[0].id);
  }, [courseId, courses.data]);

  const liveLog = useApi<LogEntry[]>(
    isLiveLogOpen ? "/admin/reports/incidents?limit=100" : null,
  );

  const download = async (key: string, endpoint: string, filename: string) => {
    setDownloading(key);
    try {
      await apiDownload(endpoint, filename);
      toast.show("Download started.");
    } catch (e) {
      toast.show(errMessage(e, "Could not generate that report."), "err");
    } finally {
      setDownloading(null);
    }
  };

  const department = departments.find((d) => d.id === departmentId);
  const course = courses.data?.find((c) => c.id === courseId);

  return (
    <>
      {toast.node}
      <div className="space-y-6 pb-12 flex flex-col h-full relative max-w-5xl mx-auto">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Reports &amp; Broadsheets</h2>
          <p className="text-[14px] text-gray-500 mt-1">
            Generate official Senate-formatted documents and statistical analyses from the live database.
          </p>
        </div>

        {(structure.error || courses.error) && (
          <ErrorBanner
            error={(structure.error ?? courses.error)!}
            onRetry={() => {
              void structure.reload();
              void courses.reload();
            }}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Senate broadsheet */}
          <Card className="flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">Senate Format Broadsheet</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  Official comprehensive score sheet for the current session, one column pair per course.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-auto border-t border-gray-100 pt-4">
              <div>
                <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Department</label>
                <select
                  className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  disabled={structure.loading}
                >
                  <option value="">{structure.loading ? "Loading departments..." : "Select a department"}</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Level</label>
                <select
                  className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                >
                  {LEVELS.map((l) => (
                    <option key={l} value={String(l)}>
                      {l} Level
                    </option>
                  ))}
                </select>
              </div>
              <Button
                className="w-full"
                isLoading={downloading === "senate"}
                disabled={!departmentId}
                onClick={() =>
                  download(
                    "senate",
                    `/admin/reports/broadsheet?departmentId=${departmentId}&level=${level}`,
                    `Broadsheet_${department?.code ?? "dept"}_${level}L.csv`,
                  )
                }
              >
                {!downloading && <Download size={16} className="mr-2" />}
                {downloading === "senate" ? "Generating..." : "Generate Broadsheet"}
              </Button>
            </div>
          </Card>

          {/* Performance */}
          <Card className="flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-success-tint/20 text-success flex items-center justify-center shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">Course Performance Analytics</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  Pass/fail ratios, grade distribution and score spread for a course.
                </p>
              </div>
            </div>

            <div className="space-y-4 mt-auto border-t border-gray-100 pt-4">
              <div>
                <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Course</label>
                <select
                  className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700"
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  disabled={courses.loading}
                >
                  <option value="">{courses.loading ? "Loading courses..." : "Select a course"}</option>
                  {(courses.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.title}
                    </option>
                  ))}
                </select>
              </div>
              <Button
                variant="secondary"
                className="w-full"
                isLoading={downloading === "analytics"}
                disabled={!courseId}
                onClick={() =>
                  download(
                    "analytics",
                    `/admin/reports/performance?courseId=${courseId}`,
                    `Performance_${(course?.code ?? "course").replace(/\s+/g, "-")}.csv`,
                  )
                }
              >
                {!downloading && <Download size={16} className="mr-2" />}
                {downloading === "analytics" ? "Exporting..." : "Export Performance Analytics"}
              </Button>
            </div>
          </Card>

          {/* Incidents */}
          <Card className="flex flex-col md:col-span-2">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-warning-tint/20 text-warning-ink flex items-center justify-center shrink-0">
                <ShieldAlert size={24} />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">Malpractice &amp; Incident Log</h3>
                <p className="text-[13px] text-gray-500 mt-1">
                  System flags, invigilator interventions and filed incident dockets, newest first.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-4 border-t border-gray-100 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setIsLiveLogOpen(true)}>
                <Clock size={16} className="mr-2" /> View Live Log
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                isLoading={downloading === "incidents"}
                onClick={() =>
                  download(
                    "incidents",
                    "/admin/reports/incidents/export?limit=500",
                    `Incident_Log_${new Date().toISOString().slice(0, 10)}.csv`,
                  )
                }
              >
                {!downloading && <Download size={16} className="mr-2" />}
                {downloading === "incidents" ? "Downloading..." : "Download Complete Report"}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Live log slide-over */}
      {isLiveLogOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsLiveLogOpen(false)}
            aria-hidden="true"
          />
          <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white shadow-xl ring-1 ring-slate-900/5 flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0 bg-white">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                    <AlertTriangle size={18} className="text-warning-ink" /> Live Incident Log
                  </h2>
                  <p className="text-sm text-slate-500">Real-time system flags and interventions.</p>
                </div>
                <button
                  type="button"
                  className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  onClick={() => setIsLiveLogOpen(false)}
                >
                  <span className="sr-only">Close panel</span>
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto bg-slate-900 p-4 font-mono text-[12px]">
                {liveLog.loading && !liveLog.data ? (
                  <div className="flex items-center gap-2 text-gray-400">
                    <Loader2 size={14} className="animate-spin" /> Loading events...
                  </div>
                ) : liveLog.error ? (
                  <div className="text-red-400">{liveLog.error.message ?? "Could not load the log."}</div>
                ) : !liveLog.data?.length ? (
                  <div className="text-gray-500">No proctoring events recorded yet.</div>
                ) : (
                  <div className="space-y-3">
                    {liveLog.data.map((entry) => (
                      <div key={entry.id} className="text-gray-300">
                        <span className="text-gray-500">[{fmtDateTime(entry.at)}]</span>{" "}
                        <span
                          className={
                            entry.severity === "HIGH" || entry.severity === "CRITICAL"
                              ? "text-red-400"
                              : entry.severity === "WARNING" || entry.severity === "MEDIUM"
                                ? "text-yellow-400"
                                : "text-green-400"
                          }
                        >
                          {entry.kind}
                        </span>
                        : {entry.courseCode ? `${entry.courseCode} · ` : ""}
                        {entry.matricNo ? `${entry.matricNo} · ` : ""}
                        {entry.title} — {entry.detail}
                        {entry.actorName ? ` (${entry.actorName})` : ""}
                      </div>
                    ))}
                    <div className="flex items-center gap-2 text-gray-500 mt-4 animate-pulse">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div> Awaiting new events...
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
