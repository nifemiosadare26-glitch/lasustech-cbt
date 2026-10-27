"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useApi } from "@/lib/useApi";
import { useAction } from "@/lib/useAction";
import { apiClient } from "@/lib/apiClient";
import { fmtDay, downloadText, toCsv } from "@/lib/format";
import {
  Plus,
  Calendar,
  Clock,
  Edit2,
  ArrowRight,
  X,
  CalendarPlus,
  Archive,
  Download,
  AlertTriangle,
  Layers,
  Loader2,
  Trash2,
  CheckCircle2,
} from "lucide-react";

type SessionStatus = "CLOSED" | "CURRENT" | "ENDED" | "UPCOMING";
type SemesterStatus = "ACTIVE" | "COMPLETED" | "UPCOMING";

interface SemesterInfo {
  name: "FIRST" | "SECOND";
  configured: boolean;
  startsOn: string | null;
  endsOn: string | null;
  status: SemesterStatus;
  examCount: number;
}

interface AcademicSessionItem {
  id: string;
  name: string;
  startsOn: string;
  endsOn: string;
  isCurrent: boolean;
  closedAt: string | null;
  status: SessionStatus;
  examCount: number;
  semesters: SemesterInfo[];
}

interface SessionSummary {
  exams: number;
  sittings: number;
  attempts: number;
  results: number;
  avgPercent: number | null;
}

const semLabel = (name: "FIRST" | "SECOND") =>
  name === "FIRST" ? "1st Semester (Harmattan)" : "2nd Semester (Rain)";

const semStatusLabel: Record<SemesterStatus, string> = {
  ACTIVE: "Active",
  COMPLETED: "Completed",
  UPCOMING: "Upcoming",
};

const tagOf = (s: AcademicSessionItem) =>
  s.status === "CURRENT" ? "Current" : s.status === "UPCOMING" ? "Next" : "Closed";

type DateForm = {
  startsOn: string;
  endsOn: string;
  firstStartsOn: string;
  firstEndsOn: string;
  secondStartsOn: string;
  secondEndsOn: string;
};

const emptyDates: DateForm = {
  startsOn: "",
  endsOn: "",
  firstStartsOn: "",
  firstEndsOn: "",
  secondStartsOn: "",
  secondEndsOn: "",
};

const datesFrom = (s: AcademicSessionItem): DateForm => {
  const first = s.semesters.find((x) => x.name === "FIRST");
  const second = s.semesters.find((x) => x.name === "SECOND");
  return {
    startsOn: s.startsOn,
    endsOn: s.endsOn,
    firstStartsOn: first?.startsOn ?? "",
    firstEndsOn: first?.endsOn ?? "",
    secondStartsOn: second?.startsOn ?? "",
    secondEndsOn: second?.endsOn ?? "",
  };
};

export default function SessionsAndSemesters() {
  const action = useAction();
  const { data: sessions = [], loading, error, reload } = useApi<AcademicSessionItem[]>(
    "/admin/sessions",
  );

  const [isCreateSessionOpen, setIsCreateSessionOpen] = useState(false);
  const [semesterTarget, setSemesterTarget] = useState<AcademicSessionItem | null>(null);
  const [datesTarget, setDatesTarget] = useState<AcademicSessionItem | null>(null);
  const [closeTarget, setCloseTarget] = useState<AcademicSessionItem | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<AcademicSessionItem | null>(null);
  const [archive, setArchive] = useState<SessionSummary | null>(null);
  const [archiveLoading, setArchiveLoading] = useState(false);

  const [createForm, setCreateForm] = useState({ name: "", startsOn: "", endsOn: "" });
  const [dateForm, setDateForm] = useState<DateForm>(emptyDates);

  const openSemesterSetup = (s: AcademicSessionItem) => {
    setSemesterTarget(s);
    setDateForm({ ...emptyDates, ...datesFrom(s) });
  };

  const openDateEdit = (s: AcademicSessionItem) => {
    setDatesTarget(s);
    setDateForm(datesFrom(s));
  };

  const handleCreateSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await action.run<AcademicSessionItem>("/admin/sessions", {
      method: "POST",
      body: JSON.stringify(createForm),
      success: `Session ${createForm.name} created`,
      onSuccess: () => {
        setIsCreateSessionOpen(false);
        setCreateForm({ name: "", startsOn: "", endsOn: "" });
        void reload();
      },
    });
  };

  const semesterPayload = () => ({
    semesters: {
      first: { startsOn: dateForm.firstStartsOn, endsOn: dateForm.firstEndsOn },
      second: { startsOn: dateForm.secondStartsOn, endsOn: dateForm.secondEndsOn },
    },
  });

  const handleSaveSemesters = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!semesterTarget) return;
    await action.run<AcademicSessionItem>(`/admin/sessions/${semesterTarget.id}`, {
      method: "PATCH",
      body: JSON.stringify(semesterPayload()),
      success: `Semesters configured for ${semesterTarget.name}`,
      onSuccess: () => {
        setSemesterTarget(null);
        void reload();
      },
    });
  };

  const handleSaveDates = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!datesTarget) return;
    await action.run<AcademicSessionItem>(`/admin/sessions/${datesTarget.id}`, {
      method: "PATCH",
      body: JSON.stringify({
        startsOn: dateForm.startsOn,
        endsOn: dateForm.endsOn,
        ...(dateForm.firstStartsOn && dateForm.firstEndsOn && dateForm.secondStartsOn && dateForm.secondEndsOn
          ? semesterPayload()
          : {}),
      }),
      success: "Session dates updated",
      onSuccess: () => {
        setDatesTarget(null);
        void reload();
      },
    });
  };

  const handleActivate = async (s: AcademicSessionItem) => {
    await action.run<AcademicSessionItem>(`/admin/sessions/${s.id}/activate`, {
      method: "POST",
      success: `${s.name} is now the current session`,
      onSuccess: () => void reload(),
    });
  };

  const handleConfirmClose = async () => {
    if (!closeTarget) return;
    await action.run<AcademicSessionItem, { promoted: { id: string; name: string } | null }>(
      `/admin/sessions/${closeTarget.id}/close`,
      {
        method: "POST",
        success: `Session ${closeTarget.name} closed`,
        onSuccess: (_data, meta) => {
          setCloseTarget(null);
          if (meta?.promoted) {
            // Toast through the action would already have fired; surface the promotion.
            console.info(`Promoted ${meta.promoted.name}`);
          }
          void reload();
        },
      },
    );
  };

  const handleDelete = async (s: AcademicSessionItem) => {
    await action.run<null>(`/admin/sessions/${s.id}`, {
      method: "DELETE",
      success: `${s.name} deleted`,
      onSuccess: () => void reload(),
    });
  };

  const openArchive = async (s: AcademicSessionItem) => {
    setArchiveTarget(s);
    setArchive(null);
    setArchiveLoading(true);
    try {
      const result = await apiClient<{ data: SessionSummary }>(`/admin/sessions/${s.id}/summary`);
      setArchive(result.data);
    } catch {
      setArchive(null);
    } finally {
      setArchiveLoading(false);
    }
  };

  const downloadArchive = () => {
    if (!archiveTarget || !archive) return;
    downloadText(
      `LASUSTECH_${archiveTarget.name.replace(/\W+/g, "_")}_Archive.csv`,
      toCsv([
        ["Session", "Starts", "Ends", "Exams", "Sittings", "Attempts", "Results", "Average %"],
        [
          archiveTarget.name,
          archiveTarget.startsOn,
          archiveTarget.endsOn,
          archive.exams,
          archive.sittings,
          archive.attempts,
          archive.results,
          archive.avgPercent == null ? "" : archive.avgPercent.toFixed(2),
        ],
        ...archiveTarget.semesters.map((s) => [
          semLabel(s.name),
          s.startsOn ?? "",
          s.endsOn ?? "",
          s.examCount,
          "",
          "",
          "",
          "",
        ]),
      ]),
    );
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto relative">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Sessions &amp; Semesters</h2>
          <p className="text-[14px] text-gray-500 mt-1">Define academic sessions. Exams and results belong to one session.</p>
        </div>
        <Button type="button" onClick={() => setIsCreateSessionOpen(true)} className="bg-blue-600 hover:bg-blue-700 shadow-xs cursor-pointer">
          <Plus className="mr-2" size={16} /> Create session
        </Button>
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex-1">
            <p className="text-[14px] font-semibold text-gray-900">Couldn&apos;t load sessions</p>
            <p className="mt-0.5 text-[13px] text-gray-600">{error.message ?? "The server did not respond."}</p>
          </div>
          <button type="button" onClick={() => void reload()} className="shrink-0 rounded-md border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 hover:bg-gray-50">Retry</button>
        </div>
      )}

      {loading && sessions.length === 0 && (
        <div className="text-center py-12 text-[14px] text-gray-500">
          <Loader2 size={18} className="inline animate-spin mr-2" /> Loading sessions…
        </div>
      )}

      {!loading && sessions.length === 0 && (
        <Card>
          <div className="text-center py-10">
            <Calendar size={28} className="mx-auto text-gray-300 mb-2" />
            <p className="text-[14px] font-medium text-gray-900">No academic sessions yet</p>
            <p className="text-[13px] text-gray-500 mt-1">Create the first session to start scheduling exams.</p>
          </div>
        </Card>
      )}

      {/* Timeline */}
      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[28px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        {sessions.map((sess) => {
          const tag = tagOf(sess);
          const isCurrent = tag === "Current";
          const isNext = tag === "Next";

          return (
            <div key={sess.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className={`flex items-center justify-center w-14 h-14 rounded-full border-4 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${isCurrent ? "border-blue-50 bg-blue-600 text-white shadow-md" : "border-gray-50 bg-white text-gray-400 shadow-sm"}`}>
                {isCurrent ? <Clock size={24} /> : <Calendar size={24} />}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-2">
                <Card
                  className={
                    isCurrent
                      ? "border-2 border-blue-500 shadow-sm relative overflow-hidden bg-white"
                      : isNext
                        ? "hover:border-blue-300 transition-colors border-dashed bg-gray-50/50"
                        : "opacity-80 hover:opacity-100 transition-opacity bg-white"
                  }
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className={isCurrent ? "text-[20px] font-bold text-gray-900" : "text-[18px] font-bold text-gray-900"}>{sess.name}</h3>
                      <p className="text-[13px] text-gray-500 mt-1">
                        {fmtDay(sess.startsOn)} – {fmtDay(sess.endsOn)}
                      </p>
                      {sess.closedAt && (
                        <p className="text-[12px] text-gray-400 mt-0.5">Closed {fmtDay(sess.closedAt.slice(0, 10))}</p>
                      )}
                    </div>
                    <Badge variant={isCurrent ? "blue-solid" : tag === "Closed" ? "gray-solid" : "default"} className="shadow-sm">
                      {tag}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    {sess.semesters.map((sem) => {
                      const active = sem.status === "ACTIVE";
                      return (
                        <div
                          key={sem.name}
                          className={`flex justify-between text-[13px] border-b border-gray-100 pb-2 last:border-none last:pb-0 ${active ? "text-blue-900 font-medium" : "text-gray-600"}`}
                        >
                          <span className="font-medium">{semLabel(sem.name)}</span>
                          <span className="text-gray-500 text-right">
                            {sem.startsOn && sem.endsOn
                              ? `${fmtDay(sem.startsOn)} – ${fmtDay(sem.endsOn)}`
                              : "Not configured"}
                            <span className="block text-[11px] text-gray-400">
                              {semStatusLabel[sem.status]} · {sem.examCount} exams
                            </span>
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    {isCurrent && (
                      <>
                        <Button type="button" variant="secondary" size="sm" onClick={() => openDateEdit(sess)} className="flex-1 hover:border-blue-500 hover:text-blue-700 cursor-pointer font-medium">
                          <Edit2 size={14} className="mr-2" /> Edit dates
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => setCloseTarget(sess)} className="flex-1 hover:border-amber-400 hover:text-amber-700 cursor-pointer font-medium">
                          Close session
                        </Button>
                      </>
                    )}
                    {isNext && (
                      <>
                        <Button type="button" variant="secondary" size="sm" onClick={() => openSemesterSetup(sess)} className="flex-1 hover:border-blue-500 hover:text-blue-700 cursor-pointer font-medium">
                          Setup semesters
                        </Button>
                        <Button type="button" variant="secondary" size="sm" onClick={() => void handleActivate(sess)} disabled={action.pending} className="flex-1 hover:border-emerald-500 hover:text-emerald-700 cursor-pointer font-medium">
                          <CheckCircle2 size={14} className="mr-2" /> Make current
                        </Button>
                      </>
                    )}
                    {tag === "Closed" && (
                      <Button type="button" variant="tertiary" size="sm" onClick={() => void openArchive(sess)} className="w-full text-blue-700 hover:bg-blue-50 font-medium cursor-pointer">
                        View archive <ArrowRight size={14} className="ml-1" />
                      </Button>
                    )}
                    {!isCurrent && (
                      <Button type="button" variant="tertiary" size="sm" onClick={() => void handleDelete(sess)} disabled={action.pending} className="text-red-600 hover:bg-red-50 font-medium cursor-pointer" title="Delete session">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL 1: CREATE SESSION */}
      {isCreateSessionOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><CalendarPlus size={18} /></div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">Create academic session</h3>
                  <p className="text-[12px] text-gray-500">Define year calendar and exam cycle</p>
                </div>
              </div>
              <button type="button" onClick={() => setIsCreateSessionOpen(false)} className="text-gray-400 hover:text-gray-700 hover:bg-black/5 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors"><X size={18} /></button>
            </div>

            <form onSubmit={handleCreateSession} className="p-5 space-y-4">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Session Name <span className="text-red-500">*</span></label>
                <Input required placeholder="e.g. 2028/2029 Session" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                {action.fieldErrors.name && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">Start Date</label>
                  <Input type="date" required value={createForm.startsOn} onChange={(e) => setCreateForm({ ...createForm, startsOn: e.target.value })} />
                  {action.fieldErrors.startsOn && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.startsOn}</p>}
                </div>
                <div>
                  <label className="text-[13px] font-medium text-gray-700 block mb-1">End Date</label>
                  <Input type="date" required value={createForm.endsOn} onChange={(e) => setCreateForm({ ...createForm, endsOn: e.target.value })} />
                  {action.fieldErrors.endsOn && <p className="mt-1 text-[12px] text-red-600">{action.fieldErrors.endsOn}</p>}
                </div>
              </div>
              <p className="text-[12px] text-gray-500">The first session you create becomes the current session. Semester dates can be configured next.</p>

              <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
                <Button type="button" variant="secondary" onClick={() => setIsCreateSessionOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={action.pending}>
                  {action.pending && <Loader2 size={14} className="mr-2 animate-spin" />} Create session
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: SETUP SEMESTERS */}
      {semesterTarget && (
        <SemesterModal
          title="Setup semesters"
          subtitle={`Configure semesters for ${semesterTarget.name}`}
          session={semesterTarget}
          form={dateForm}
          setForm={setDateForm}
          onClose={() => setSemesterTarget(null)}
          onSubmit={handleSaveSemesters}
          pending={action.pending}
          fieldErrors={action.fieldErrors}
        />
      )}

      {/* MODAL 3: EDIT DATES */}
      {datesTarget && (
        <SemesterModal
          title="Edit session dates"
          subtitle={`Update the calendar for ${datesTarget.name}`}
          session={datesTarget}
          form={dateForm}
          setForm={setDateForm}
          onClose={() => setDatesTarget(null)}
          onSubmit={handleSaveDates}
          pending={action.pending}
          fieldErrors={action.fieldErrors}
          includeSessionDates
        />
      )}

      {/* MODAL 4: CLOSE SESSION CONFIRMATION */}
      {closeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div className="p-5">
              <div className="w-11 h-11 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-3"><AlertTriangle size={22} /></div>
              <h3 className="text-[18px] font-semibold text-gray-900">Close {closeTarget.name}?</h3>
              <p className="text-[14px] text-gray-500 mt-2 leading-relaxed">
                Closing this session locks final grade submissions and transitions the active timeline.
                Historical results will remain viewable in archives. Open exam sittings must be closed first.
              </p>
            </div>

            <div data-modal-footer className="p-4 bg-transparent border-t border-gray-100 dark:border-slate-800 flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => setCloseTarget(null)}>Keep active</Button>
              <Button type="button" variant="danger" onClick={() => void handleConfirmClose()} disabled={action.pending}>
                {action.pending && <Loader2 size={14} className="mr-2 animate-spin" />} Confirm &amp; close session
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: ARCHIVE DETAILS */}
      {archiveTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-gray-100 text-gray-700"><Archive size={18} /></div>
                <div>
                  <h3 className="text-[17px] font-semibold text-gray-900">{archiveTarget.name} archive</h3>
                  <p className="text-[12px] text-gray-500">Historical summary of the session</p>
                </div>
              </div>
              <button type="button" onClick={() => setArchiveTarget(null)} className="text-gray-400 hover:text-gray-700 hover:bg-black/5 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4 text-[14px]">
              {archiveLoading ? (
                <p className="text-[13px] text-gray-500"><Loader2 size={14} className="inline animate-spin mr-2" /> Loading summary…</p>
              ) : archive ? (
                <>
                  <div className="grid grid-cols-2 gap-3 bg-gray-50/50 dark:bg-slate-800/40 p-3.5 rounded-lg border border-gray-200/60 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium uppercase block">Exams</span>
                      <span className="text-[18px] font-bold text-gray-900">{archive.exams}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-500 font-medium uppercase block">Average score</span>
                      <span className="text-[18px] font-bold text-emerald-600">{archive.avgPercent == null ? "—" : `${archive.avgPercent.toFixed(1)}%`}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-gray-600 text-[13px]">
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span>Sittings</span><span className="font-semibold text-gray-900">{archive.sittings}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-gray-100">
                      <span>Submitted attempts</span><span className="font-semibold text-gray-900">{archive.attempts}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>Published results</span><span className="font-semibold text-gray-900">{archive.results}</span>
                    </div>
                    {archiveTarget.semesters.map((s) => (
                      <div key={s.name} className="flex justify-between py-1 border-t border-gray-100">
                        <span>{semLabel(s.name)}</span><span className="font-semibold text-gray-900">{s.examCount} exams</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <Button type="button" variant="secondary" onClick={downloadArchive} className="w-full text-blue-700 hover:border-blue-500 font-medium">
                      <Download size={14} className="mr-1.5" /> Download archive summary
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-[13px] text-red-600">Could not load the session summary.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SemesterModal({
  title,
  subtitle,
  session,
  form,
  setForm,
  onClose,
  onSubmit,
  pending,
  fieldErrors,
  includeSessionDates = false,
}: {
  title: string;
  subtitle: string;
  session: AcademicSessionItem;
  form: DateForm;
  setForm: (f: DateForm) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  pending: boolean;
  fieldErrors: Record<string, string>;
  includeSessionDates?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-md w-full overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600"><Layers size={18} /></div>
            <div>
              <h3 className="text-[17px] font-semibold text-gray-900">{title}</h3>
              <p className="text-[12px] text-gray-500">{subtitle}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-700 hover:bg-black/5 dark:hover:bg-white/10 p-1.5 rounded-lg transition-colors"><X size={18} /></button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {includeSessionDates && (
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-gray-100">
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Session start</label>
                <Input type="date" required value={form.startsOn} onChange={(e) => setForm({ ...form, startsOn: e.target.value })} />
                {fieldErrors.startsOn && <p className="mt-1 text-[12px] text-red-600">{fieldErrors.startsOn}</p>}
              </div>
              <div>
                <label className="text-[13px] font-medium text-gray-700 block mb-1">Session end</label>
                <Input type="date" required value={form.endsOn} onChange={(e) => setForm({ ...form, endsOn: e.target.value })} />
                {fieldErrors.endsOn && <p className="mt-1 text-[12px] text-red-600">{fieldErrors.endsOn}</p>}
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[13px] font-medium text-gray-700 block mb-1">1st semester starts</label>
              <Input type="date" required value={form.firstStartsOn} onChange={(e) => setForm({ ...form, firstStartsOn: e.target.value })} />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700 block mb-1">1st semester ends</label>
              <Input type="date" required value={form.firstEndsOn} onChange={(e) => setForm({ ...form, firstEndsOn: e.target.value })} />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700 block mb-1">2nd semester starts</label>
              <Input type="date" required value={form.secondStartsOn} onChange={(e) => setForm({ ...form, secondStartsOn: e.target.value })} />
            </div>
            <div>
              <label className="text-[13px] font-medium text-gray-700 block mb-1">2nd semester ends</label>
              <Input type="date" required value={form.secondEndsOn} onChange={(e) => setForm({ ...form, secondEndsOn: e.target.value })} />
            </div>
          </div>
          <p className="text-[12px] text-gray-500">
            Semesters must sit inside {session.name} ({fmtDay(session.startsOn)} – {fmtDay(session.endsOn)}) and must not overlap.
          </p>
          {fieldErrors["semesters.first.endsOn"] && <p className="text-[12px] text-red-600">{fieldErrors["semesters.first.endsOn"]}</p>}
          {fieldErrors["semesters.second.endsOn"] && <p className="text-[12px] text-red-600">{fieldErrors["semesters.second.endsOn"]}</p>}

          <div className="pt-3 border-t border-gray-100 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={pending}>
              {pending && <Loader2 size={14} className="mr-2 animate-spin" />} Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
