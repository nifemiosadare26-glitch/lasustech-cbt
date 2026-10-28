"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Calendar, Clock, Monitor, User, MoreHorizontal, X, Radio, KeyRound, Loader2, Trash2, Video, VideoOff, ShieldCheck, Lock, Printer, Globe, Link2, Copy,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/apiClient";
import { useApi, useDebounced, type PageMeta } from "@/lib/useApi";
import { useRealtimeEvent } from "@/lib/realtime";
import { fmtDateTime } from "@/lib/format";
import { copyToClipboard } from "@/lib/browser";
import { ConfirmModal, ErrorBanner, Modal, Pagination, errMessage, selectCls, useToast } from "@/components/admin/ui";
import { ExamAttendanceModal } from "@/components/admin/exam-attendance-modal";

type SittingStatus = "SCHEDULED" | "OPEN" | "CLOSED" | "CANCELLED";

interface Sitting {
  id: string;
  examId: string;
  examTitle: string;
  examKind: string;
  examSlug?: string | null;
  publicLink?: string | null;
  isPublic?: boolean;
  courseCode: string | null;
  courseTitle: string | null;
  subjectName: string | null;
  audience: string;
  sessionName: string | null;
  startsAt: string;
  endsAt: string;
  durationMin: number;
  venue: string | null;
  requireWebcam: boolean;
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
  audience: string;
  durationMin?: number | null;
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
  const rows = data ?? [];

  // Instantly reflect real-time sitting status switches and new exams
  useRealtimeEvent("sitting.status", () => {
    void reload();
  });
  useRealtimeEvent("sitting.created", () => {
    void reload();
  });

  const exams = useApi<ExamOption[]>("/admin/exams");
  const invigilators = useApi<Invigilator[]>("/admin/invigilators");
  const optionsError = exams.error ?? invigilators.error;

  const [panel, setPanel] = React.useState<{ mode: "create" } | { mode: "edit"; sitting: Sitting } | null>(null);
  const [accessCode, setAccessCode] = React.useState<string | null>(null);
  const [attendanceSittingId, setAttendanceSittingId] = React.useState<string | null>(null);
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
    } catch (e) {
      toast.show(errMessage(e), "err");
    } finally {
      setBusy(null);
    }
  };

  const cancelSitting = async () => {
    if (!cancelling) return;
    await apiClient(`/admin/schedule/${cancelling.id}/cancel`, { method: "POST" });
    toast.show(`${cancelling.courseCode} sitting cancelled.`);
    setCancelling(null);
    await reload();
  };

  const deleteSitting = async () => {
    if (!deleting) return;
    await apiClient(`/admin/schedule/${deleting.id}`, { method: "DELETE" });
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
              Admin &amp; CBT Officer timetable. Only one school sitting can run at a time — exams are taken online, so
              no venue is allocated.
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
              void exams.reload();
              void invigilators.reload();
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
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-[13px] text-gray-900">{slot.courseCode ?? "—"}</span>
                          {(slot.audience === "PUBLIC" || slot.isPublic) && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                              <Globe size={10} /> Public
                            </span>
                          )}
                        </div>
                        <div className="text-[13px] text-gray-500">{slot.courseTitle ?? slot.subjectName ?? ""}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">
                          {slot.examTitle} · {KIND_LABEL[slot.examKind] ?? slot.examKind}
                          {slot.sessionName ? ` · ${slot.sessionName}` : ""}
                        </div>
                        {slot.publicLink && (
                          <div className="mt-1 flex items-center gap-1.5">
                            <a
                              href={slot.publicLink}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-mono"
                            >
                              <Link2 size={11} /> {slot.publicLink}
                            </a>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-700 font-medium">
                            <Monitor size={14} className="text-gray-400" /> {slot.venue ?? "Online examination"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                            <User size={14} className="text-gray-400" />
                            {slot.registered} registered candidates
                          </div>
                          <div className="pt-0.5">
                            {slot.requireWebcam ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <Video size={11} /> Proctored (Webcam)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                <VideoOff size={11} /> Unproctored
                              </span>
                            )}
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
                                  setAttendanceSittingId(slot.id);
                                }}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <Printer size={13} className="text-slate-500" /> Print Attendance
                              </button>
                              <Link
                                href={`/admin/live/${slot.id}`}
                                onClick={() => setMenu(null)}
                                className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                              >
                                Open Live Monitor
                              </Link>
                              {slot.publicLink && (
                                <button
                                  type="button"
                                  onClick={async () => {
                                    setMenu(null);
                                    await copyToClipboard(`${window.location.origin}${slot.publicLink}`);
                                    toast.show("Public exam link copied to clipboard.");
                                  }}
                                  className="w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer flex items-center gap-1.5"
                                >
                                  <Link2 size={13} /> Copy Public Link
                                </button>
                              )}
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
          exams={exams.data ?? []}
          invigilators={invigilators.data ?? []}
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
          title="Exam Access Code & Schedule Dispatch"
          subtitle="This access code has been dispatched to candidates, invigilators, and the course lecturer."
          onClose={() => setAccessCode(null)}
          footer={
            <Button onClick={() => setAccessCode(null)}>Done</Button>
          }
        >
          <div className="text-center py-4 space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Exam Access Unlock Code</span>
              <div className="font-mono text-[42px] tracking-[0.25em] font-bold text-blue-600 mt-1 select-all">{accessCode}</div>
              <p className="text-[12px] text-slate-500 mt-2">
                Candidates use this code to unlock the examination attempt.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await copyToClipboard(accessCode);
                toast.show("Access code copied to clipboard.");
              }}
            >
              <Copy size={14} className="mr-1.5" /> Copy Code
            </Button>
          </div>
        </Modal>
      )}

      {attendanceSittingId && (
        <ExamAttendanceModal
          sittingId={attendanceSittingId}
          onClose={() => setAttendanceSittingId(null)}
        />
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
  const [requireWebcam, setRequireWebcam] = React.useState(sitting?.requireWebcam ?? true);
  const [invigilatorIds, setInvigilatorIds] = React.useState<string[]>(
    sitting?.invigilators.map((i) => i.id) ?? [],
  );
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const exam = exams.find((e) => e.id === examId);
  const candidateDuration = exam?.durationMin ?? sitting?.durationMin ?? 60;

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

      if (mode === "create") {
        const res = await apiClient<{ data: { accessCode?: string } }>("/admin/schedule", {
          method: "POST",
          body: JSON.stringify({
            examId,
            startsAt,
            ...(endsAt ? { endsAt } : {}),
            durationMin: Number(candidateDuration),
            requireWebcam,
            invigilatorIds,
          }),
        });
        await onSaved(res.data.accessCode);
      } else {
        await apiClient(`/admin/schedule/${sitting!.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            startsAt,
            ...(endsAt ? { endsAt } : {}),
            durationMin: Number(candidateDuration),
            requireWebcam,
            invigilatorIds,
          }),
        });
        await onSaved();
      }
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
                  {mode === "create" ? "Pick an exam and set its time window." : `${sitting?.courseCode ?? sitting?.examTitle ?? ""}`}
                </p>
              </div>
              <button
                type="button"
                className="rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-black/5 dark:hover:bg-white/10 transition-colors focus:outline-none"
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
                    <label className="block text-sm font-medium text-slate-700 mb-1.5 flex items-center justify-between">
                      <span>Candidate Time</span>
                      <span className="text-[11px] font-medium text-amber-700 flex items-center gap-1">
                        <Lock size={11} /> Lecturer Fixed
                      </span>
                    </label>
                    <Input
                      type="number"
                      value={candidateDuration}
                      disabled
                      className="bg-slate-100 text-slate-700 cursor-not-allowed font-semibold"
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Duration is fixed by lecturer at {candidateDuration} mins.
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Window Closes (Optional)</label>
                    <Input
                      type="time"
                      value={endTime}
                      placeholder="Leave blank for exact duration"
                      onChange={(e) => setEndTime(e.target.value)}
                    />
                    <p className="text-[11px] text-slate-500 mt-1">
                      Exam window end time (WAT UTC+1).
                    </p>
                  </div>
                </div>

                {/* Proctoring ON/OFF Decision for Internal & External Exams */}
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="pr-3">
                      <div className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                        <ShieldCheck size={16} className={requireWebcam ? "text-emerald-600" : "text-slate-400"} />
                        Live Webcam Proctoring &amp; Anti-Cheat
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Controls webcam camera feed, periodic frame captures, and 3-strike tab switch auto-submission for internal and public exams.
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={requireWebcam}
                        onChange={(e) => setRequireWebcam(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="text-[11px] font-medium pt-1.5 border-t border-slate-200/70 flex items-center justify-between">
                    <span className="text-slate-500">Security Mode:</span>
                    {requireWebcam ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <Video size={12} /> Proctoring ON (Webcam &amp; Strict Anti-Cheat)
                      </span>
                    ) : (
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <VideoOff size={12} /> Proctoring OFF (Unproctored)
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[12px] text-gray-500">
                  Admins schedule the availability window and proctoring policy. The lecturer sets the question paper and duration.
                </p>
              </div>
            </div>

            {error && (
              <div className="mx-6 mb-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
                <X size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div data-modal-footer className="border-t border-slate-200 dark:border-slate-800 px-6 py-4 bg-transparent flex justify-end gap-3 shrink-0">
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
