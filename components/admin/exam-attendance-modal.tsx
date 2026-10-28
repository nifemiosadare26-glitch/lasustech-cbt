"use client";

import * as React from "react";
import { Printer, X, Loader2, CheckCircle2, UserCheck, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiClient } from "@/lib/apiClient";
import { fmtDateTime } from "@/lib/format";

interface AttendanceRecord {
  sitting: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: string;
    venue: string;
    courseCode: string;
    courseTitle: string;
    session: string;
    lecturer: string;
    invigilators: string[];
  };
  summary: {
    totalRegistered: number;
    presentCount: number;
    absentCount: number;
    inProgressCount: number;
    completedCount: number;
  };
  candidates: {
    sn: number;
    studentId: string;
    matricNo: string;
    names: string;
    department: string;
    seatNumber?: string;
    status: "PRESENT" | "ABSENT";
    startedAt: string | null;
    submittedAt: string | null;
    ipAddress?: string;
  }[];
}

interface ExamAttendanceModalProps {
  sittingId: string;
  onClose: () => void;
}

export function ExamAttendanceModal({ sittingId, onClose }: ExamAttendanceModalProps) {
  const [data, setData] = React.useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    apiClient<any>(`/admin/schedule/${sittingId}/attendance`)
      .then((res: any) => {
        if (!active) return;
        const raw = res?.data || res;
        if (!raw) {
          setError("No attendance data returned from server");
          return;
        }

        const sitting = raw.sitting || {
          id: raw.sittingId || sittingId,
          startsAt: raw.startsAt || new Date().toISOString(),
          endsAt: raw.endsAt || new Date().toISOString(),
          status: raw.status || "SCHEDULED",
          venue: raw.venue || "CBT Centre",
          courseCode: raw.courseCode || "EXAM",
          courseTitle: raw.courseTitle || raw.examTitle || "Examination",
          session: raw.sessionName || raw.session || "Current Academic Session",
          lecturer: raw.lecturer || "Faculty Coordinator",
          invigilators: Array.isArray(raw.invigilators)
            ? raw.invigilators.map((i: any) => (typeof i === "string" ? i : i.names || i.id || ""))
            : [],
        };

        const summary = raw.summary || {
          totalRegistered: raw.totalRegistered || (raw.attendees || []).length,
          presentCount: raw.presentCount || (raw.attendees || []).filter((a: any) => a.isPresent).length,
          absentCount: raw.absentCount || Math.max(0, (raw.attendees || []).length - ((raw.attendees || []).filter((a: any) => a.isPresent).length)),
          inProgressCount: (raw.attendees || []).filter((a: any) => a.attemptStatus === "IN_PROGRESS").length,
          completedCount: (raw.attendees || []).filter((a: any) => a.attemptStatus === "SUBMITTED" || a.attemptStatus === "COMPLETED").length,
        };

        const candidates = raw.candidates || (raw.attendees || []).map((a: any, idx: number) => ({
          sn: a.sn || idx + 1,
          studentId: a.studentId,
          matricNo: a.matricNo || "—",
          names: a.names,
          department: a.department || "—",
          seatNumber: a.seatLabel || a.seatNumber,
          status: a.isPresent ? "PRESENT" : "ABSENT",
          startedAt: a.startedAt,
          submittedAt: a.submittedAt,
          ipAddress: a.ipAddress,
        }));

        setData({ sitting, summary, candidates });
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err.message || "Failed to load examination attendance data");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sittingId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto print:p-0 print:bg-white print:static print:overflow-visible">
      <style>{`
        @media print {
          body {
            background: white !important;
            color: black !important;
          }
          /* Hide all page content except the printable attendance register */
          body * {
            visibility: hidden;
          }
          #printable-attendance-register,
          #printable-attendance-register * {
            visibility: visible;
          }
          #printable-attendance-register {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 16px !important;
            box-sizing: border-box !important;
          }
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
        }
      `}</style>
      <div className="relative w-full max-w-5xl rounded-xl bg-white shadow-2xl border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:border-none print:rounded-none">
        {/* Header - Screen only */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4 bg-transparent print:hidden">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Official Examination Attendance Sheet</h2>
            <p className="text-xs text-gray-500">
              Printable candidate verification register & sign-in docket
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePrint}
              disabled={loading || !data}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2"
            >
              <Printer size={16} />
              Print Attendance Sheet
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto p-6 print:p-0 print:overflow-visible flex-1 bg-white text-gray-900">
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 size={36} className="animate-spin text-blue-600 mb-3" />
              <p className="text-sm font-medium">Generating examination attendance register...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <AlertCircle size={40} className="text-red-500 mb-3" />
              <p className="text-sm font-semibold text-red-700 mb-1">Failed to load attendance</p>
              <p className="text-xs text-gray-500 max-w-md mb-4">{error}</p>
              <Button variant="outline" size="sm" onClick={() => location.reload()}>
                Retry
              </Button>
            </div>
          )}

          {data && (
            <div id="printable-attendance-register" className="print:w-full space-y-6">
              {/* Institutional Header */}
              <div className="text-center border-b-2 border-gray-900 pb-4">
                <div className="flex items-center justify-center gap-3 mb-1">
                  <div className="h-12 w-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-xl border-2 border-amber-500">
                    L
                  </div>
                  <div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-gray-900">
                      Lagos State University of Science and Technology
                    </h1>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-700">
                      Ikorodu, Lagos State, Nigeria • Directorate of Academic Affairs & ICT
                    </p>
                  </div>
                </div>
                <div className="inline-block bg-gray-900 text-white px-4 py-1 rounded text-sm font-bold tracking-wide uppercase mt-2">
                  Official Examination Attendance & Verification Register
                </div>
              </div>

              {/* Exam Metadata Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50/50 dark:bg-slate-800/40 p-4 rounded-lg border border-gray-200 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-gray-500 block font-medium">Course Code & Title:</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {data.sitting.courseCode} - {data.sitting.courseTitle}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block font-medium">Academic Session:</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {data.sitting.session}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block font-medium">Examination Venue:</span>
                  <span className="font-bold text-gray-900 text-sm">
                    {data.sitting.venue}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block font-medium">Exam Window:</span>
                  <span className="font-bold text-gray-900">
                    {fmtDateTime(data.sitting.startsAt)}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block font-medium">Chief Examiner / Lecturer:</span>
                  <span className="font-semibold text-gray-900">{data.sitting.lecturer}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 block font-medium">Invigilators:</span>
                  <span className="font-semibold text-gray-900">
                    {data.sitting.invigilators.length > 0
                      ? data.sitting.invigilators.join(", ")
                      : "Assigned Center Invigilators"}
                  </span>
                </div>
              </div>

              {/* Statistics Summary Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-medium text-blue-900">
                <div className="flex items-center gap-6">
                  <span>
                    Total Registered: <strong className="text-blue-950 font-bold">{data.summary.totalRegistered}</strong>
                  </span>
                  <span>
                    Present: <strong className="text-emerald-700 font-bold">{data.summary.presentCount}</strong>
                  </span>
                  <span>
                    Absent: <strong className="text-red-700 font-bold">{data.summary.absentCount}</strong>
                  </span>
                  <span>
                    Completed: <strong className="text-gray-900 font-bold">{data.summary.completedCount}</strong>
                  </span>
                </div>
                <div className="text-gray-500 italic print:hidden">
                  Candidates must physically sign this sheet upon arrival and departure.
                </div>
              </div>

              {/* Candidates Register Table */}
              <div className="border border-gray-400 rounded-sm overflow-hidden">
                <table className="w-full border-collapse text-left text-xs">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-400 text-gray-800 font-bold uppercase text-[11px]">
                      <th className="py-2.5 px-2 border-r border-gray-300 w-10 text-center">S/N</th>
                      <th className="py-2.5 px-3 border-r border-gray-300 w-32">Matric / Reg No</th>
                      <th className="py-2.5 px-3 border-r border-gray-300">Candidate Full Name</th>
                      <th className="py-2.5 px-3 border-r border-gray-300 w-36">Department</th>
                      <th className="py-2.5 px-2 border-r border-gray-300 w-20 text-center">Terminal</th>
                      <th className="py-2.5 px-2 border-r border-gray-300 w-20 text-center">Time In</th>
                      <th className="py-2.5 px-2 border-r border-gray-300 w-20 text-center">Time Out</th>
                      <th className="py-2.5 px-4 w-40 text-center">Candidate Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-300">
                    {data.candidates.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-gray-500 italic">
                          No candidates enrolled in this sitting.
                        </td>
                      </tr>
                    ) : (
                      data.candidates.map((c) => {
                        const timeInStr = c.startedAt
                          ? new Date(c.startedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—";
                        const timeOutStr = c.submittedAt
                          ? new Date(c.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                          : "—";

                        return (
                          <tr key={c.studentId} className="hover:bg-black/5 dark:hover:bg-white/5 transition-colors print:hover:bg-transparent">
                            <td className="py-2 px-2 border-r border-gray-300 text-center font-medium text-gray-600">
                              {c.sn}
                            </td>
                            <td className="py-2 px-3 border-r border-gray-300 font-mono font-bold text-gray-900">
                              {c.matricNo}
                            </td>
                            <td className="py-2 px-3 border-r border-gray-300 font-semibold text-gray-900">
                              {c.names}
                            </td>
                            <td className="py-2 px-3 border-r border-gray-300 text-gray-700 truncate">
                              {c.department || "General"}
                            </td>
                            <td className="py-2 px-2 border-r border-gray-300 text-center font-mono text-gray-700">
                              {c.seatNumber || `T-${String(c.sn).padStart(3, "0")}`}
                            </td>
                            <td className="py-2 px-2 border-r border-gray-300 text-center font-mono text-gray-700">
                              {timeInStr}
                            </td>
                            <td className="py-2 px-2 border-r border-gray-300 text-center font-mono text-gray-700">
                              {timeOutStr}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <div className="h-6 border-b border-dashed border-gray-400 w-full"></div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invigilation Certification Docket */}
              <div className="border border-gray-300 dark:border-slate-800 rounded-sm p-4 bg-gray-50/50 dark:bg-slate-800/40 print:bg-transparent text-xs space-y-4 break-inside-avoid">
                <div className="font-bold uppercase tracking-wider text-gray-900 border-b border-gray-300 pb-1">
                  Invigilator Certification & Handover
                </div>
                <p className="text-gray-700 leading-relaxed italic">
                  I/We hereby certify that the candidates listed above were present/absent as indicated, their identity was
                  verified before entry, and the examination was conducted strictly in compliance with LASUSTECH Examination
                  Codes and Academic Regulations.
                </p>
                <div className="grid grid-cols-2 gap-8 pt-4">
                  <div className="border-t border-gray-800 pt-2">
                    <span className="block font-bold text-gray-900">Chief Invigilator Signature & Date</span>
                    <span className="block text-gray-500 text-[11px] mt-1">Name: _____________________________________</span>
                  </div>
                  <div className="border-t border-gray-800 pt-2">
                    <span className="block font-bold text-gray-900">Faculty Exam Officer / Rep Signature & Date</span>
                    <span className="block text-gray-500 text-[11px] mt-1">Name: _____________________________________</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
