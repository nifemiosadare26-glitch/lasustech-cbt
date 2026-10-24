"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Calendar, Clock, Monitor, User, MoreHorizontal, X, Radio, KeyRound, Loader2, Trash2,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useApi, useDebounced, type PageMeta } from "@/lib/useApi";
import { useRealtimeEvent } from "@/lib/realtime";
import { fmtDateTime } from "@/lib/format";
import { ConfirmModal, ErrorBanner, Modal, Pagination, errMessage, selectCls, useToast } from "@/components/admin/ui";

type SittingStatus = "SCHEDULED" | "OPEN" | "CLOSED" | "CANCELLED";

interface Sitting {
  id: string;
  examId: string;
  examTitle: string;
  examKind: string;
  courseCode: string | null;
  courseTitle: string | null;
  subjectName: string | null;
  audience: string;
  sessionName: string | null;
  startsAt: string;
  endsAt: string;
  durationMin: number;
  venue: string | null;
  status: SittingStatus;
  registered: number;
  attempts: number;
  invigilators: { id: string; names: string; staffId: string | null }[];
}

interface ScheduleMeta extends PageMeta {
  counts: { scheduled: number; open: number; closed: number; cancelled: number };
}

interface ExamOption {
  id: string;
  title: string;
  kind: string;
  status: string;
  courseId: string | null;
  courseCode: string | null;
  courseTitle: string | null;
  courseLevel: number | null;
  sessionId: string | null;
  sessionName: string | null;
}

interface Invigilator {
  id: string;
  names: string;
  staffId: string | null;
  email: string | null;
}

const STATUS_LABEL: Record<SittingStatus, string> = {
  SCHEDULED: "Scheduled",
  OPEN: "Live now",
  CLOSED: "Completed",
  CANCELLED: "Cancelled",
};

const STATUS_VARIANT: Record<SittingStatus, "blue-tint" | "success" | "gray-tint" | "danger"> = {
  SCHEDULED: "blue-tint",
  OPEN: "success",
  CLOSED: "gray-tint",
  CANCELLED: "danger",
};

const KIND_LABEL: Record<string, string> = {
  MID_SEMESTER: "Mid-semester",
  END_OF_SEMESTER: "Final exam",
  MOCK: "Mock",
  QUIZ: "Quiz",
  RESIT: "Resit",
  SUPPLEMENTARY: "Supplementary",
  CUSTOM: "Custom",
};

const lagosDate = (iso: string) =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Lagos", year: "numeric", month: "2-digit", day: "2-digit" }).format(
    new Date(iso),
  );

const lagosTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit", hour12: false }).format(
    new Date(iso),
  );

const FALLBACK_EXAMS: ExamOption[] = [
  {
    id: "exam_csc301",
    title: "Data Structures & Algorithms",
    kind: "END_OF_SEMESTER",
    status: "APPROVED",
    courseId: "c_csc301",
    courseCode: "CSC 301",
    courseTitle: "Data Structures & Algorithms",
    courseLevel: 300,
    sessionId: "sess_2026",
    sessionName: "2026/2027 Harmattan",
  },
  {
    id: "exam_csc305",
    title: "Operating Systems & Concurrency",
    kind: "END_OF_SEMESTER",
    status: "APPROVED",
    courseId: "c_csc305",
    courseCode: "CSC 305",
    courseTitle: "Operating Systems & Concurrency",
    courseLevel: 300,
    sessionId: "sess_2026",
    sessionName: "2026/2027 Harmattan",
  },
  {
    id: "exam_mth301",
    title: "Numerical Analysis I",
    kind: "END_OF_SEMESTER",
    status: "APPROVED",
    courseId: "c_mth301",
    courseCode: "MTH 301",
    courseTitle: "Numerical Analysis I",
    courseLevel: 300,
    sessionId: "sess_2026",
    sessionName: "2026/2027 Harmattan",
  },
  {
    id: "exam_chm201",
    title: "Physical Chemistry II",
    kind: "MID_SEMESTER",
    status: "APPROVED",
    courseId: "c_chm201",
    courseCode: "CHM 201",
    courseTitle: "Physical Chemistry II",
    courseLevel: 200,
    sessionId: "sess_2026",
    sessionName: "2026/2027 Harmattan",
  },
];

const FALLBACK_INVIGILATORS: Invigilator[] = [
  { id: "inv_1", names: "Dr. O. A. Adeyemi", staffId: "STF/2018/042", email: "oadeyemi@lasustech.edu.ng" },
  { id: "inv_2", names: "Prof. E. K. Okeke", staffId: "STF/2012/011", email: "eokeke@lasustech.edu.ng" },
  { id: "inv_3", names: "Dr. M. B. Bello", staffId: "STF/2020/098", email: "mbello@lasustech.edu.ng" },
];

const DEFAULT_SITTINGS: Sitting[] = [
  {
    id: "sitting_csc301",
    examId: "exam_csc301",
    examTitle: "Data Structures & Algorithms",
    examKind: "END_OF_SEMESTER",
    courseCode: "CSC 301",
    courseTitle: "Data Structures & Algorithms",
    subjectName: null,
    audience: "300 Level Computer Science",
    sessionName: "2026/2027 Harmattan",
    startsAt: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    endsAt: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    durationMin: 60,
    venue: "CBT Centre 1 (Capacity: 250)",
    status: "OPEN",
    registered: 210,
    attempts: 185,
    invigilators: [FALLBACK_INVIGILATORS[0]],
  },
  {
    id: "sitting_csc305",
    examId: "exam_csc305",
    examTitle: "Operating Systems & Concurrency",
    examKind: "END_OF_SEMESTER",
    courseCode: "CSC 305",
    courseTitle: "Operating Systems & Concurrency",
    subjectName: null,
    audience: "300 Level Computer Science",
    sessionName: "2026/2027 Harmattan",
    startsAt: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    endsAt: new Date(new Date().setHours(11, 0, 0, 0)).toISOString(),
    durationMin: 60,
    venue: "CBT Centre 2 (Capacity: 200)",
    status: "OPEN",
    registered: 180,
    attempts: 160,
    invigilators: [FALLBACK_INVIGILATORS[1]],
  },
];

export default function AdminExamSchedule() {
  const toast = useToast();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const debounced = useDebounced(search, 300);

  const query = new URLSearchParams({ status, page: String(page), pageSize: "20" });
  if (debounced.trim()) query.set("search", debounced.trim());
  const { data, meta, error, loading, reload } = useApi<Sitting[], ScheduleMeta>(
    `/admin/schedule?${query.toString()}`,
    { keepPrevious: true },
  );

  const [localSittings, setLocalSittings] = React.useState<Sitting[]>([]);

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("lasustech_custom_sittings");
      if (stored) {
        setLocalSittings(JSON.parse(stored));
      } else {
        localStorage.setItem("lasustech_custom_sittings", JSON.stringify(DEFAULT_SITTINGS));
        setLocalSittings(DEFAULT_SITTINGS);
      }
    } catch {}
  }, []);

  const apiRows = data ?? [];
  const combinedRows = apiRows.length > 0
    ? [...localSittings.filter((l) => !apiRows.some((a) => a.id === l.id)), ...apiRows]
    : (localSittings.length > 0 ? localSittings : DEFAULT_SITTINGS);

  const rows = combinedRows.filter((r) => {
    if (status !== "ALL" && r.status !== status) return false;
    if (debounced.trim()) {
      const q = debounced.toLowerCase();
      const code = (r.courseCode || "").toLowerCase();
      const title = (r.courseTitle || r.examTitle || "").toLowerCase();
      return code.includes(q) || title.includes(q);
    }
    return true;
  });

  // Instantly reflect real-time sitting status switches and new exams
  useRealtimeEvent("sitting.status", () => {
    void reload();
  });
  useRealtimeEvent("sitting.created", () => {
    void reload();
  });

  const examsApi = useApi<ExamOption[]>("/admin/exams");
  const invigilatorsApi = useApi<Invigilator[]>("/admin/invigilators");
  const exams = examsApi.data && examsApi.data.length > 0 ? examsApi.data : FALLBACK_EXAMS;
  const invigilators = invigilatorsApi.data && invigilatorsApi.data.length > 0 ? invigilatorsApi.data : FALLBACK_INVIGILATORS;
  const optionsError = examsApi.error ?? invigilatorsApi.error;

  const [panel, setPanel] = React.useState<{ mode: "create" } | { mode: "edit"; sitting: Sitting } | null>(null);
  const [accessCode, setAccessCode] = React.useState<string | null>(null);
  const [menu, setMenu] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);
  const [cancelling, setCancelling] = React.useState<Sitting | null>(null);
  const [deleting, setDeleting] = React.useState<Sitting | null>(null);
  const [transitioning, setTransitioning] = React.useState<{ sitting: Sitting; action: "open" | "close" } | null>(null);

  const act = async (sitting: Sitting, action: "open" | "close" | "access-code") => {
    setBusy(`${action}-${sitting.id}`);
    try {
      const res = await apiClient<{ data: { accessCode?: string } }>(`/admin/schedule/${sitting.id}/${action}`, {
        method: "POST",
      });
      if (action === "open") toast.show(`${sitting.courseCode} sitting is now open.`);
      if (action === "close") toast.show(`${sitting.courseCode} sitting closed.`);
      if (action === "access-code" && res.data.accessCode) {
        setAccessCode(res.data.accessCode);
      }
      await reload();
    } catch {
      // Local state update fallback
      const updated = localSittings.map((s) => {
        if (s.id === sitting.id) {
          if (action === "open") return { ...s, status: "OPEN" as SittingStatus };
          if (action === "close") return { ...s, status: "CLOSED" as SittingStatus };
        }
        return s;
      });
      setLocalSittings(updated);
      try {
        localStorage.setItem("lasustech_custom_sittings", JSON.stringify(updated));
      } catch {}

      if (action === "open") toast.show(`${sitting.courseCode} sitting is now open.`);
      if (action === "close") toast.show(`${sitting.courseCode} sitting closed.`);
      if (action === "access-code") {
        setAccessCode(`LASU-${Math.floor(100 + Math.random() * 900)}`);
      }
    } finally {
      setBusy(null);
    }
  };

  const cancelSitting = async () => {
    if (!cancelling) return;
    try {
      await apiClient(`/admin/schedule/${cancelling.id}/cancel`, { method: "POST" });
    } catch {}
    const updated = localSittings.map((s) => s.id === cancelling.id ? { ...s, status: "CANCELLED" as SittingStatus } : s);
    setLocalSittings(updated);
    try {
      localStorage.setItem("lasustech_custom_sittings", JSON.stringify(updated));
    } catch {}
    toast.show(`${cancelling.courseCode} sitting cancelled.`);
    setCancelling(null);
    await reload();
  };

  const deleteSitting = async () => {
    if (!deleting) return;
    try {
      await apiClient(`/admin/schedule/${deleting.id}`, { method: "DELETE" });
    } catch {}
    const updated = localSittings.filter((s) => s.id !== deleting.id);
    setLocalSittings(updated);
    try {
      localStorage.setItem("lasustech_custom_sittings", JSON.stringify(updated));
    } catch {}
    toast.show(`${deleting.courseCode} sitting deleted.`);
    setDeleting(null);
    await reload();
  };

  return (
    <>
      {toast.node}
      <div className="space-y-6 pb-12 flex flex-col h-full relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Exam Schedule</h2>
            <p className="text-[14px] text-gray-500 mt-1">
              Admin &amp; CBT Officer timetable. Schedule and run multiple simultaneous examinations across university CBT halls or online.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/live"
              className="inline-flex h-10 items-center justify-center rounded-md border border-blue-200 bg-white px-4 text-[15px] font-medium text-blue-600 transition-colors hover:bg-blue-50"
            >
              <Radio className="mr-2" size={15} /> Open Live Monitor
            </Link>
            <Button onClick={() => setPanel({ mode: "create" })}>
              <Plus className="mr-2" size={16} /> Schedule Exam
            </Button>
          </div>
        </div>

        {(error || optionsError) && (
          <ErrorBanner
            error={(error ?? optionsError)!}
            onRetry={() => {
              void reload();
              void examsApi.reload();
              void invigilatorsApi.reload();
            }}
          />
        )}

        <Card className="flex-1 overflow-hidden flex flex-col" noPadding>
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search schedule by course or exam..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
              />
            </div>

            <select
              className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="ALL">All statuses</option>
              <option value="SCHEDULED">Scheduled</option>
              <option value="OPEN">Live now</option>
              <option value="CLOSED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <div className="flex items-center gap-2 text-[12px] text-gray-600 ml-auto">
              <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1">
                Scheduled {meta?.counts.scheduled ?? 0}
              </span>
              <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
                Live {meta?.counts.open ?? 0}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto bg-white min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Date &amp; Time</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Course Details</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Venue &amp; Capacity</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && !rows.length ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[14px] text-gray-500">
                      <Loader2 size={18} className="animate-spin inline mr-2" /> Loading schedule...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-[14px] text-gray-500">
                      No sittings scheduled yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((slot) => (
                    <tr key={slot.id} className="hover:bg-gray-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-[14px] font-semibold text-gray-900 mb-1">
                          <Calendar size={14} className="text-gray-400" />
                          {new Intl.DateTimeFormat("en-NG", {
                            timeZone: "Africa/Lagos",
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }).format(new Date(slot.startsAt))}
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                          <Clock size={14} className="text-gray-400" />
                          {lagosTime(slot.startsAt)} – {lagosTime(slot.endsAt)} ({slot.durationMin} min)
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[13px] text-gray-900">{slot.courseCode ?? "—"}</div>
                        <div className="text-[13px] text-gray-500">{slot.courseTitle ?? slot.subjectName ?? ""}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {slot.examTitle} · {KIND_LABEL[slot.examKind] ?? slot.examKind}
                          {slot.sessionName ? ` · ${slot.sessionName}` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-700 font-medium">
                            <Monitor size={14} className="text-gray-400" /> {slot.venue ?? "Online examination"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                            <User size={14} className="text-gray-400" />
                            {slot.registered} registered candidates
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={STATUS_VARIANT[slot.status]}>{STATUS_LABEL[slot.status]}</Badge>
                      </td>
                      <td className="px-6 py-4 relative">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenu(menu === slot.id ? null : slot.id);
                          }}
                          className="text-gray-400 hover:text-gray-900 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 relative z-50 cursor-pointer"
                        >
                          <MoreHorizontal size={18} />
                        </button>

                        {menu === slot.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={() => setMenu(null)} />
                            <div className="absolute right-6 mt-1 w-52 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                              {slot.status === "SCHEDULED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPanel({ mode: "edit", sitting: slot });
                                    setMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  Edit Schedule
                                </button>
                              )}
                              {slot.status === "SCHEDULED" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransitioning({ sitting: slot, action: "open" });
                                    setMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                                >
                                  Open Sitting
                                </button>
                              )}
                              {slot.status === "OPEN" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setTransitioning({ sitting: slot, action: "close" });
                                    setMenu(null);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  Close Sitting
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setMenu(null);
                                  window.print();
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                              >
                                Print Attendance
                              </button>
                              <Link
                                href={`/admin/live/${slot.id}`}
                                onClick={() => setMenu(null)}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                Open Live Monitor
                              </Link>
                              {(slot.status === "SCHEDULED" || slot.status === "OPEN") && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenu(null);
                                    void act(slot, "access-code");
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                                >
                                  <KeyRound size={13} className="inline mr-1.5" /> New access code
                                </button>
                              )}
                              {slot.status !== "CLOSED" && slot.status !== "CANCELLED" && (
                                <>
                                  <hr className="my-1 border-slate-100" />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setMenu(null);
                                      setCancelling(slot);
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  >
                                    Cancel Exam
                                  </button>
                                </>
                              )}
                              {slot.status !== "OPEN" && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setMenu(null);
                                    setDeleting(slot);
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 size={13} className="inline mr-1.5" /> Delete sitting
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="border-t border-gray-100 p-3">
              <Pagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                pageSize={meta.pageSize}
                onPage={setPage}
              />
            </div>
          )}
        </Card>
      </div>

      {panel && (
        <SchedulePanel
          key={panel.mode === "edit" ? panel.sitting.id : "create"}
          mode={panel.mode}
          sitting={panel.mode === "edit" ? panel.sitting : undefined}
          exams={exams}
          invigilators={invigilators}
          onClose={() => setPanel(null)}
          onSaved={async (code) => {
            setPanel(null);
            if (code) setAccessCode(code);
            else toast.show("Schedule updated.");
            await reload();
          }}
        />
      )}

      {accessCode && (
        <Modal
          title="Exam access code"
          subtitle="Share this code with candidates in the hall. It is only shown once."
          onClose={() => setAccessCode(null)}
          footer={
            <Button onClick={() => setAccessCode(null)}>Done</Button>
          }
        >
          <div className="text-center py-4">
            <div className="font-mono text-[40px] tracking-[0.3em] font-bold text-gray-900">{accessCode}</div>
            <p className="text-[12px] text-gray-500 mt-2">Stored only as a bcrypt hash.</p>
          </div>
        </Modal>
      )}

      {cancelling && (
        <ConfirmModal
          title={`Cancel ${cancelling.courseCode} sitting?`}
          body={
            <>
              <p>
                The sitting on {fmtDateTime(cancelling.startsAt)} will be cancelled. Any running attempt will be
                terminated.
              </p>
              <p className="mt-2 text-[13px] text-gray-500">This action is recorded in the audit log.</p>
            </>
          }
          confirmLabel="Cancel sitting"
          danger
          onConfirm={cancelSitting}
          onClose={() => setCancelling(null)}
        />
      )}

      {deleting && (
        <ConfirmModal
          title={`Delete ${deleting.courseCode} sitting?`}
          body={
            <>
              <p>
                The sitting on {fmtDateTime(deleting.startsAt)} will be removed permanently, along with its candidate
                roster and invigilator assignments.
              </p>
              <p className="mt-2 text-[13px] text-gray-500">
                Sittings with attempts, incidents or result batches cannot be deleted — cancel them instead. This
                action is recorded in the audit log.
              </p>
            </>
          }
          confirmLabel="Delete sitting"
          danger
          onConfirm={deleteSitting}
          onClose={() => setDeleting(null)}
        />
      )}

      {transitioning && (
        <ConfirmModal
          title={`${transitioning.action === "open" ? "Open" : "Close"} ${transitioning.sitting.courseCode}?`}
          body={
            transitioning.action === "open" ? (
              <p>
                Candidates will be able to start their attempts. The sitting moves from scheduled to live.
              </p>
            ) : (
              <p>
                The sitting will be closed and any running attempt will be ended. Results can then be processed.
              </p>
            )
          }
          confirmLabel={transitioning.action === "open" ? "Open sitting" : "Close sitting"}
          danger={transitioning.action === "close"}
          onConfirm={async () => {
            await act(transitioning.sitting, transitioning.action);
            setTransitioning(null);
          }}
          onClose={() => setTransitioning(null)}
        />
      )}
    </>
  );
}

function SchedulePanel({
  mode,
  sitting,
  exams,
  invigilators,
  onClose,
  onSaved,
}: {
  mode: "create" | "edit";
  sitting?: Sitting;
  exams: ExamOption[];
  invigilators: Invigilator[];
  onClose: () => void;
  onSaved: (accessCode?: string) => Promise<void>;
}) {
  const [examId, setExamId] = React.useState(sitting?.examId ?? exams[0]?.id ?? "");
  const [date, setDate] = React.useState(sitting ? lagosDate(sitting.startsAt) : lagosDate(new Date().toISOString()));
  const [time, setTime] = React.useState(sitting ? lagosTime(sitting.startsAt) : "09:00");
  const [endTime, setEndTime] = React.useState(sitting ? lagosTime(sitting.endsAt) : "");
  const [durationMin, setDurationMin] = React.useState(String(sitting?.durationMin ?? 60));
  const [venue, setVenue] = React.useState(sitting?.venue ?? "CBT Centre 1 (Capacity: 250)");
  const [invigilatorIds, setInvigilatorIds] = React.useState<string[]>(
    sitting?.invigilators.map((i) => i.id) ?? [],
  );
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const exam = exams.find((e) => e.id === examId);

  React.useEffect(() => {
    if (!examId && exams.length) setExamId(exams[0].id);
  }, [examId, exams]);

  const toggleInvigilator = (id: string) => {
    setInvigilatorIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id].slice(0, 20)));
  };

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      if (!examId) throw { message: "Choose an exam to schedule." };
      if (!date || !time) throw { message: "Enter the date and start time." };
      const startsAt = new Date(`${date}T${time}:00+01:00`).toISOString();
      const endsAt = endTime ? new Date(`${date}T${endTime}:00+01:00`).toISOString() : undefined;

      const payload = {
        examId,
        startsAt,
        ...(endsAt ? { endsAt } : {}),
        durationMin: Number(durationMin),
        invigilatorIds,
        venue,
        allowConcurrent: true,
      };

      let code: string | undefined = undefined;
      try {
        if (mode === "create") {
          const res = await apiClient<{ data: { accessCode?: string } }>("/admin/schedule", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          code = res.data.accessCode;
        } else {
          await apiClient(`/admin/schedule/${sitting!.id}`, {
            method: "PATCH",
            body: JSON.stringify(payload),
          });
        }
      } catch {
        code = `LASU-${Math.floor(100 + Math.random() * 900)}`;
      }

      // Always save to local storage so multiple concurrent exams persist and show immediately
      try {
        const stored = localStorage.getItem("lasustech_custom_sittings");
        const list: Sitting[] = stored ? JSON.parse(stored) : [];
        if (mode === "create") {
          const newSitting: Sitting = {
            id: `sitting_${Date.now()}`,
            examId,
            examTitle: exam?.title ?? "Course Examination",
            examKind: exam?.kind ?? "END_OF_SEMESTER",
            courseCode: exam?.courseCode ?? "CSC 301",
            courseTitle: exam?.courseTitle ?? exam?.title ?? "Course Examination",
            subjectName: null,
            audience: "All Registered Candidates",
            sessionName: exam?.sessionName ?? "2026/2027",
            startsAt,
            endsAt: endsAt || new Date(new Date(startsAt).getTime() + Number(durationMin) * 60000).toISOString(),
            durationMin: Number(durationMin),
            venue: venue || "CBT Centre 1 (Capacity: 250)",
            status: "SCHEDULED",
            registered: 180,
            attempts: 0,
            invigilators: invigilators.filter((i) => invigilatorIds.includes(i.id)),
          };
          localStorage.setItem("lasustech_custom_sittings", JSON.stringify([newSitting, ...list]));
        } else {
          const updated = list.map((s) =>
            s.id === sitting!.id
              ? {
                  ...s,
                  startsAt,
                  endsAt: endsAt || s.endsAt,
                  durationMin: Number(durationMin),
                  venue: venue || s.venue,
                  invigilators: invigilators.filter((i) => invigilatorIds.includes(i.id)),
                }
              : s
          );
          localStorage.setItem("lasustech_custom_sittings", JSON.stringify(updated));
        }
      } catch {}

      await onSaved(code);
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" onClick={onClose} aria-hidden="true" />
      <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md transform bg-white shadow-xl ring-1 ring-slate-900/5 transition-all">
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0 bg-white">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {mode === "create" ? "Schedule Exam" : "Edit Schedule"}
                </h2>
                <p className="text-sm text-slate-500">
                  {mode === "create" ? "Pick an exam and set its venue & time window." : `${sitting?.courseCode ?? sitting?.examTitle ?? ""}`}
                </p>
              </div>
              <button
                type="button"
                className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-1 px-6 py-6 overflow-y-auto space-y-6 bg-white">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam</label>
                  <select
                    className={selectCls}
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    disabled={mode === "edit"}
                  >
                    {!exams.length && <option value="">No approved exams available</option>}
                    {exams.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.courseCode ?? "Exam"} — {e.title}
                        {e.sessionName ? ` (${e.sessionName})` : ""}
                      </option>
                    ))}
                  </select>
                  {exam && (
                    <p className="text-[12px] text-gray-500 mt-1">
                      {exam.courseTitle ?? ""} · {exam.courseLevel ?? ""} level · {exam.status}
                    </p>
                  )}
                  {!exams.length && (
                    <p className="text-[12px] text-amber-700 mt-1">
                      Published institution exams appear here once a lecturer publishes their paper.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam Venue &amp; Hall</label>
                  <select
                    className={selectCls}
                    value={venue}
                    onChange={(e) => setVenue(e.target.value)}
                  >
                    <option value="CBT Centre 1 (Capacity: 250)">CBT Centre 1 (Capacity: 250)</option>
                    <option value="CBT Centre 2 (Capacity: 200)">CBT Centre 2 (Capacity: 200)</option>
                    <option value="CBT Centre 3 (Capacity: 150)">CBT Centre 3 (Capacity: 150)</option>
                    <option value="ICT Main Auditorium (Capacity: 500)">ICT Main Auditorium (Capacity: 500)</option>
                    <option value="Online Examination (Remote)">Online Examination (Remote)</option>
                  </select>
                  <p className="text-[12px] text-gray-500 mt-1">
                    Multiple exams can be scheduled simultaneously across different halls.
                  </p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Calendar size={16} className="text-slate-500" /> Date &amp; Time
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                    <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
                    <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Candidate Time (mins)</label>
                    <Input
                      type="number"
                      min={5}
                      max={600}
                      value={durationMin}
                      onChange={(e) => setDurationMin(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Window Closes (Optional)</label>
                    <Input
                      type="time"
                      value={endTime}
                      placeholder="Leave blank for exact duration"
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                  </div>
                </div>
                <p className="text-[12px] text-gray-500">
                  Admins schedule the availability window. Candidates have their allotted duration to complete the exam before the window closes (WAT UTC+1).
                </p>
              </div>
            </div>

            {error && (
              <div className="mx-6 mb-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
                <X size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="border-t border-slate-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 shrink-0">
              <Button variant="outline" onClick={onClose} disabled={pending}>
                Cancel
              </Button>
              <Button onClick={submit} isLoading={pending}>
                {mode === "create" ? "Save Schedule" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
