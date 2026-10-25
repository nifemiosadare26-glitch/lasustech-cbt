"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  Search,
  Plus,
  Download,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  XCircle,
  FileText,
  Loader2,
} from "lucide-react";
import { apiClient, apiDownload } from "@/lib/apiClient";
import { getRealtimeSocket } from "@/lib/realtime";
import { useApi, useDebounced, type PageMeta } from "@/lib/useApi";
import { fmtDateTime } from "@/lib/format";
import {
  ErrorBanner,
  Modal,
  Pagination,
  errMessage,
  selectCls,
  useToast,
} from "@/components/admin/ui";

type Category = "MALPRACTICE" | "TECHNICAL" | "INFRASTRUCTURE" | "MEDICAL" | "CONDUCT";
type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
type IncidentStatus = "UNDER_REVIEW" | "ESCALATED" | "RESOLVED";

interface Incident {
  id: string;
  referenceNo: string;
  category: Category;
  severity: Severity;
  status: IncidentStatus;
  candidateName: string | null;
  matricNo: string | null;
  seatLabel: string | null;
  hall: string | null;
  description: string;
  actionTaken: string | null;
  docketConfiscated: boolean;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  reportedBy: string;
  reporterName: string;
  sittingId: string | null;
  attemptId: string | null;
  venue: string | null;
  sittingStartsAt: string | null;
  courseCode: string | null;
  courseTitle: string | null;
  examTitle: string | null;
}

interface IncidentMeta extends PageMeta {
  counts: { open: number; escalated: number; resolved: number; critical: number };
}

interface LiveSittingOption {
  id: string;
  courseCode: string;
  courseTitle: string;
  venue: string;
  startsAt: string;
  status: string;
}

const CATEGORY_LABEL: Record<Category, string> = {
  MALPRACTICE: "Malpractice & Collusion",
  TECHNICAL: "Technical & Workstation",
  INFRASTRUCTURE: "Infrastructure & Power",
  MEDICAL: "Medical Emergency",
  CONDUCT: "Candidate Conduct",
};

const SHORT_CATEGORY: Record<Category, string> = {
  MALPRACTICE: "Malpractice",
  TECHNICAL: "Technical",
  INFRASTRUCTURE: "Infrastructure",
  MEDICAL: "Medical",
  CONDUCT: "Conduct",
};

const SEVERITY_LABEL: Record<Severity, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

const STATUS_LABEL: Record<IncidentStatus, string> = {
  UNDER_REVIEW: "Under review",
  ESCALATED: "Escalated",
  RESOLVED: "Resolved",
};

const FILTER_STATUS: { value: string; label: string }[] = [
  { value: "ALL", label: "All statuses" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "ESCALATED", label: "Escalated" },
  { value: "RESOLVED", label: "Resolved" },
];

const FILTER_SEVERITY: { value: string; label: string }[] = [
  { value: "ALL", label: "All severities" },
  { value: "CRITICAL", label: "Critical" },
  { value: "HIGH", label: "High" },
  { value: "MEDIUM", label: "Medium" },
  { value: "LOW", label: "Low" },
];

const filterCls =
  "h-9 px-3 rounded-lg border border-gray-300 text-[13px] bg-white text-gray-700 font-medium focus:outline-blue-600";

export default function IncidentsPage() {
  const toast = useToast();
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("ALL");
  const [severity, setSeverity] = React.useState("ALL");
  const [status, setStatus] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const debounced = useDebounced(search, 300);

  const query = new URLSearchParams({
    status,
    category,
    severity,
    page: String(page),
    pageSize: "20",
  });
  if (debounced.trim()) query.set("search", debounced.trim());

  const { data, meta, error, loading, reload } = useApi<Incident[], IncidentMeta>(
    `/admin/incidents?${query.toString()}`,
    { keepPrevious: true },
  );
  const incidents = data ?? [];

  // Instant update via WebSocket event whenever an incident is reported
  React.useEffect(() => {
    const socket = getRealtimeSocket();
    if (!socket) return;
    const handleIncident = () => {
      void reload();
    };
    socket.on("incident.created", handleIncident);
    socket.on("event", (ev: any) => {
      if (ev?.type === "incident.created") void reload();
    });
    return () => {
      socket.off("incident.created", handleIncident);
    };
  }, [reload]);

  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  const selected = incidents.find((i) => i.id === selectedId) ?? null;
  const [creating, setCreating] = React.useState(false);
  const [resolving, setResolving] = React.useState<Incident | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [exporting, setExporting] = React.useState(false);

  const resetFilters = () => {
    setSearch("");
    setCategory("ALL");
    setSeverity("ALL");
    setStatus("ALL");
    setPage(1);
  };

  const exportCsv = async () => {
    setExporting(true);
    try {
      const qs = new URLSearchParams({ status, category, severity, page: "1", pageSize: "100" });
      if (debounced.trim()) qs.set("search", debounced.trim());
      await apiDownload(`/admin/incidents/export?${qs.toString()}`, `incidents-${new Date().toISOString().slice(0, 10)}.csv`);
      toast.show("Incident log exported.");
    } catch (e) {
      toast.show(errMessage(e, "Could not export the incident log."), "err");
    } finally {
      setExporting(false);
    }
  };

  const moveStatus = async (incident: Incident, next: IncidentStatus) => {
    setBusyId(incident.id);
    try {
      await apiClient(`/admin/incidents/${incident.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: next }),
      });
      toast.show(`${incident.referenceNo} marked ${STATUS_LABEL[next].toLowerCase()}.`);
      await reload();
    } catch (e) {
      toast.show(errMessage(e), "err");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {toast.node}

      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/live"
              className="text-[12px] font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Back to Today&apos;s Exams
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-[12px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Disciplinary &amp; Technical Dossier
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-rose-600" size={26} />
            Hall Incident Reports &amp; Malpractice Logs
          </h1>
          <p className="text-[14px] text-gray-600 mt-1">
            Official chronological record of candidate infractions, hardware replacements, and invigilator hall
            interventions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button variant="secondary" onClick={exportCsv} isLoading={exporting} className="h-10 text-[13px] font-semibold gap-1.5">
            {!exporting && <Download size={15} />}
            Export Log (CSV)
          </Button>
          <Button variant="danger" onClick={() => setCreating(true)} className="h-10 text-[13px] font-bold gap-1.5 shadow-sm">
            <Plus size={16} />
            Log New Incident
          </Button>
        </div>
      </div>

      {error && <ErrorBanner error={error} onRetry={reload} />}

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Open Dockets</span>
            <FileText size={18} className="text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{meta?.counts.open ?? 0}</span>
          <p className="text-[12px] text-gray-500 mt-1">Under review or escalated</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Critical Cases</span>
            <ShieldAlert size={18} className="text-rose-600" />
          </div>
          <span className="text-2xl font-bold text-rose-600">{meta?.counts.critical ?? 0}</span>
          <p className="text-[12px] text-rose-700 font-medium mt-1">Unresolved critical severity</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Escalated to Officer</span>
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <span className="text-2xl font-bold text-amber-700">{meta?.counts.escalated ?? 0}</span>
          <p className="text-[12px] text-amber-700 font-medium mt-1">Awaiting chief examiner decision</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Resolved Cases</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{meta?.counts.resolved ?? 0}</span>
          <p className="text-[12px] text-emerald-700 font-medium mt-1">Cleared with invigilator sign-off</p>
        </div>
      </div>

      {/* Filters + table */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <Input
                placeholder="Search reference, candidate, PC, course..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="pl-9 h-9 text-[13px]"
              />
            </div>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className={filterCls}
            >
              <option value="ALL">All categories</option>
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>

            <select
              value={severity}
              onChange={(e) => {
                setSeverity(e.target.value);
                setPage(1);
              }}
              className={filterCls}
            >
              {FILTER_SEVERITY.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className={filterCls}
            >
              {FILTER_STATUS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <span className="text-[13px] text-gray-500 font-medium">
            Showing <strong>{incidents.length}</strong> of {meta?.total ?? incidents.length} dockets
          </span>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-x-auto shadow-xs">
          <table className="w-full text-left text-[13px] min-w-[900px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 text-[12px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref No.</th>
                <th className="py-3 px-4">Time &amp; Course</th>
                <th className="py-3 px-4">Candidate &amp; Seat</th>
                <th className="py-3 px-4">Category &amp; Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Docket Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading && !incidents.length ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <Loader2 size={18} className="animate-spin inline mr-2" /> Loading incident dockets...
                  </td>
                </tr>
              ) : incidents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No incident logs match your filters.
                    <button onClick={resetFilters} className="ml-2 text-blue-600 hover:underline">
                      Clear filters
                    </button>
                  </td>
                </tr>
              ) : (
                incidents.map((incident) => (
                  <tr
                    key={incident.id}
                    onClick={() => setSelectedId(incident.id)}
                    className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{incident.referenceNo}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">
                        {incident.courseCode ?? "General"}
                        {incident.courseTitle ? <span className="font-normal text-gray-500"> · {incident.courseTitle}</span> : null}
                      </div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {fmtDateTime(incident.createdAt)}
                        {incident.hall ? ` • ${incident.hall}` : ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{incident.candidateName ?? "Hall-wide"}</div>
                      <div className="font-mono text-[11px] text-gray-500">
                        {incident.matricNo ?? "N/A"} •{" "}
                        <strong className="text-gray-900">{incident.seatLabel ?? "—"}</strong>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-gray-800">{SHORT_CATEGORY[incident.category]}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            incident.severity === "CRITICAL"
                              ? "bg-rose-100 text-rose-800"
                              : incident.severity === "HIGH"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {SEVERITY_LABEL[incident.severity]}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <IncidentStatusChip status={incident.status} />
                    </td>
                    <td className="py-3.5 px-4">
                      {incident.docketConfiscated ? (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          Confiscated
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-500">Retained</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedId(incident.id);
                        }}
                        className="h-8 text-[12px] font-semibold"
                      >
                        Inspect Dossier
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.totalPages > 1 && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={meta.pageSize}
            onPage={setPage}
          />
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <IncidentDetail
          incident={selected}
          busy={busyId === selected.id}
          onClose={() => setSelectedId(null)}
          onStatus={(next) => {
            if (next === "RESOLVED") {
              setResolving(selected);
            } else {
              void moveStatus(selected, next);
            }
          }}
          onResolve={() => setResolving(selected)}
        />
      )}

      {resolving && (
        <ResolveIncidentModal
          incident={resolving}
          onClose={() => setResolving(null)}
          onDone={async () => {
            setResolving(null);
            toast.show("Incident docket resolved.");
            await reload();
          }}
        />
      )}

      {creating && (
        <CreateIncidentModal
          onClose={() => setCreating(false)}
          onDone={async () => {
            setCreating(false);
            toast.show("Incident docket registered.");
            await reload();
          }}
        />
      )}
    </div>
  );
}

function IncidentStatusChip({ status }: { status: IncidentStatus }) {
  if (status === "UNDER_REVIEW") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
        <AlertTriangle size={12} className="text-amber-600" />
        Under Review
      </span>
    );
  }
  if (status === "ESCALATED") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
        <ShieldAlert size={12} className="text-rose-600" />
        Escalated
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
      <CheckCircle2 size={12} className="text-emerald-600" />
      Resolved
    </span>
  );
}

function IncidentDetail({
  incident,
  busy,
  onClose,
  onStatus,
  onResolve,
}: {
  incident: Incident;
  busy: boolean;
  onClose: () => void;
  onStatus: (next: IncidentStatus) => void;
  onResolve: () => void;
}) {
  return (
    <Modal
      title={incident.referenceNo}
      subtitle={`${CATEGORY_LABEL[incident.category]} · ${incident.courseCode ?? "General incident"}`}
      onClose={onClose}
      width="max-w-2xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          {incident.status === "RESOLVED" ? (
            <Button variant="secondary" disabled>
              <CheckCircle2 size={16} className="mr-2" /> Resolved
            </Button>
          ) : (
            <Button onClick={onResolve}>
              <CheckCircle2 size={16} className="mr-2" /> Resolve docket
            </Button>
          )}
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 flex-wrap">
          <IncidentStatusChip status={incident.status} />
          <Badge
            variant={
              incident.severity === "CRITICAL" ? "danger" : incident.severity === "HIGH" ? "warning" : "default"
            }
          >
            {SEVERITY_LABEL[incident.severity]} severity
          </Badge>
          <span className="text-[12px] text-gray-500">{fmtDateTime(incident.createdAt)}</span>
        </div>

        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px]">
          <Detail label="Candidate" value={incident.candidateName ?? "Hall-wide"} />
          <Detail label="Matriculation" value={incident.matricNo ?? "N/A"} mono />
          <Detail label="Workstation" value={incident.seatLabel ?? "—"} strong />
          <Detail label="Hall & Venue" value={incident.hall ?? incident.venue ?? "—"} />
          <Detail label="Course" value={incident.courseCode ?? "—"} />
          <Detail label="Reporting Proctor" value={incident.reporterName} />
        </div>

        <div>
          <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1">Incident Narrative</h4>
          <div className="p-3.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-800 leading-relaxed whitespace-pre-wrap">
            {incident.description}
          </div>
        </div>

        <div>
          <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1">Action Enforced</h4>
          <div className="p-3.5 bg-blue-50/40 border border-blue-200 rounded-xl text-[13px] text-blue-950 font-medium whitespace-pre-wrap">
            {incident.actionTaken ?? "No action recorded yet."}
          </div>
        </div>

        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-[13px]">
          <span className="font-semibold text-gray-700">Docket &amp; Material Evidence</span>
          {incident.docketConfiscated ? (
            <span className="font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md">
              Confiscated · submitted to Exam Office
            </span>
          ) : (
            <span className="font-semibold text-gray-600 bg-gray-200 px-2.5 py-1 rounded-md">No material confiscated</span>
          )}
        </div>

        {incident.status === "RESOLVED" && (
          <div>
            <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1">Resolution</h4>
            <div className="p-3.5 bg-emerald-50/60 border border-emerald-200 rounded-xl text-[13px] text-emerald-950 whitespace-pre-wrap">
              {incident.resolutionNote ?? "No note recorded."}
              {incident.resolvedAt && (
                <p className="text-[11px] text-emerald-800 mt-1">Closed {fmtDateTime(incident.resolvedAt)}</p>
              )}
            </div>
          </div>
        )}

        {incident.status !== "RESOLVED" && (
          <div className="pt-2">
            <h4 className="text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-2">Immediate Decision</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant={incident.status === "UNDER_REVIEW" ? "primary" : "secondary"}
                disabled={busy || incident.status === "UNDER_REVIEW"}
                onClick={() => onStatus("UNDER_REVIEW")}
                className="text-[12px]"
              >
                Under review
              </Button>
              <Button
                size="sm"
                variant="danger"
                disabled={busy}
                onClick={onResolve}
                className="text-[12px]"
              >
                <ShieldAlert size={14} className="mr-1.5" /> Make Decision &amp; Resolve
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

function Detail({ label, value, mono, strong }: { label: string; value: string; mono?: boolean; strong?: boolean }) {
  return (
    <div>
      <span className="text-gray-500 block text-[11px] font-semibold uppercase">{label}</span>
      <span className={`${mono ? "font-mono" : ""} ${strong ? "font-bold" : "font-semibold"} text-gray-900`}>{value}</span>
    </div>
  );
}

function ResolveIncidentModal({
  incident,
  onClose,
  onDone,
}: {
  incident: Incident;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [note, setNote] = React.useState("");
  const [actionTaken, setActionTaken] = React.useState(incident.actionTaken ?? "");
  const [decision, setDecision] = React.useState<"EXONERATE" | "HOLD_MALPRACTICE" | "CANCEL_ATTEMPT">(
    incident.category === "MALPRACTICE" ? "HOLD_MALPRACTICE" : "EXONERATE"
  );
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      const holdResult = decision === "HOLD_MALPRACTICE";
      await apiClient(`/admin/incidents/${incident.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          status: "RESOLVED",
          resolutionNote: `[${
            decision === "HOLD_MALPRACTICE"
              ? "MALPRACTICE CONFIRMED — RESULT WITHHELD"
              : decision === "CANCEL_ATTEMPT"
                ? "ATTEMPT VOIDED"
                : "EXONERATED / CLEARED"
          }] ${note.trim()}`,
          holdResult,
          ...(actionTaken.trim() ? { actionTaken: actionTaken.trim() } : {}),
        }),
      });
      await onDone();
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal
      title={`Resolve ${incident.referenceNo}`}
      subtitle={`${incident.candidateName ?? "Hall-wide"} · ${SHORT_CATEGORY[incident.category]}`}
      onClose={onClose}
      lockDismiss={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            variant={decision === "HOLD_MALPRACTICE" ? "danger" : "primary"}
            onClick={submit}
            isLoading={pending}
            disabled={note.trim().length < 3}
          >
            {decision === "HOLD_MALPRACTICE" ? "Hold Result & Close" : "Save Decision"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Single Reviewer Decision Selector */}
        <div>
          <label className="text-[13px] font-bold text-gray-800 block mb-2">
            Examiner Final Decision
          </label>
          <div className="grid grid-cols-1 gap-2">
            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                decision === "HOLD_MALPRACTICE"
                  ? "border-rose-400 bg-rose-50/70"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="decision"
                checked={decision === "HOLD_MALPRACTICE"}
                onChange={() => setDecision("HOLD_MALPRACTICE")}
                className="mt-1 text-rose-600 focus:ring-rose-500"
              />
              <div>
                <span className="text-xs font-bold text-rose-950 block">
                  Hold Result (Malpractice Confirmed)
                </span>
                <span className="text-[11px] text-rose-800">
                  Immediately withholds the student&apos;s result on the student portal and locks script review.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                decision === "EXONERATE"
                  ? "border-emerald-400 bg-emerald-50/70"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="decision"
                checked={decision === "EXONERATE"}
                onChange={() => setDecision("EXONERATE")}
                className="mt-1 text-emerald-600 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-emerald-950 block">
                  Exonerate / Clear (Result Valid)
                </span>
                <span className="text-[11px] text-emerald-800">
                  Candidate cleared of infraction; result remains valid and accessible according to institutional release rules.
                </span>
              </div>
            </label>

            <label
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                decision === "CANCEL_ATTEMPT"
                  ? "border-amber-400 bg-amber-50/70"
                  : "border-gray-200 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="decision"
                checked={decision === "CANCEL_ATTEMPT"}
                onChange={() => setDecision("CANCEL_ATTEMPT")}
                className="mt-1 text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-amber-950 block">
                  Void Attempt (Technical or Procedural)
                </span>
                <span className="text-[11px] text-amber-800">
                  Candidate attempt is voided without malpractice prejudice.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Action enforced</label>
          <textarea
            className="w-full min-h-20 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            placeholder="What was done at the workstation or hall?"
          />
        </div>
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Decision reasoning / note</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Document examiner findings and justification..."
          />
        </div>
        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
            <XCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}

function CreateIncidentModal({
  onClose,
  onDone,
}: {
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [sittingId, setSittingId] = React.useState("");
  const [category, setCategory] = React.useState<Category>("MALPRACTICE");
  const [severity, setSeverity] = React.useState<Severity>("MEDIUM");
  const [candidateName, setCandidateName] = React.useState("");
  const [matricNo, setMatricNo] = React.useState("");
  const [seatLabel, setSeatLabel] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [actionTaken, setActionTaken] = React.useState("");
  const [docketConfiscated, setDocketConfiscated] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sittings = useApi<LiveSittingOption[]>(`/admin/live?status=ALL`);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      await apiClient("/admin/incidents", {
        method: "POST",
        body: JSON.stringify({
          ...(sittingId ? { sittingId } : {}),
          category,
          severity,
          ...(candidateName.trim() ? { candidateName: candidateName.trim() } : {}),
          ...(matricNo.trim() ? { matricNo: matricNo.trim() } : {}),
          ...(seatLabel.trim() ? { seatLabel: seatLabel.trim() } : {}),
          description: description.trim(),
          ...(actionTaken.trim() ? { actionTaken: actionTaken.trim() } : {}),
          docketConfiscated,
        }),
      });
      await onDone();
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal
      title="Register new hall incident"
      subtitle="Filed against today's sitting"
      onClose={onClose}
      lockDismiss={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button variant="danger" onClick={submit} isLoading={pending} disabled={description.trim().length < 5}>
            Register report
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Sitting (optional)</label>
          <select className={selectCls} value={sittingId} onChange={(e) => setSittingId(e.target.value)}>
            <option value="">General / not tied to a sitting</option>
            {(sittings.data ?? []).map((s) => (
              <option key={s.id} value={s.id}>
                {s.courseCode} · {s.venue} · {new Date(s.startsAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" })}
              </option>
            ))}
          </select>
          {sittings.loading && <p className="text-[12px] text-gray-500 mt-1">Loading today&apos;s sittings...</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1">Category</label>
            <select className={selectCls} value={category} onChange={(e) => setCategory(e.target.value as Category)}>
              {(Object.keys(CATEGORY_LABEL) as Category[]).map((c) => (
                <option key={c} value={c}>
                  {CATEGORY_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1">Severity</label>
            <select className={selectCls} value={severity} onChange={(e) => setSeverity(e.target.value as Severity)}>
              {(Object.keys(SEVERITY_LABEL) as Severity[]).map((s) => (
                <option key={s} value={s}>
                  {SEVERITY_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <label className="text-[13px] font-medium text-gray-700 block mb-1">Candidate (optional)</label>
            <Input value={candidateName} onChange={(e) => setCandidateName(e.target.value)} placeholder="Full name" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1">Matric No.</label>
            <Input value={matricNo} onChange={(e) => setMatricNo(e.target.value)} placeholder="CSC/22/117" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1">Seat / Workstation</label>
            <Input value={seatLabel} onChange={(e) => setSeatLabel(e.target.value)} placeholder="SEAT-14" />
          </div>
        </div>

        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Detailed observation</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="State exact facts, evidence observed, witness proctors..."
          />
        </div>

        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Action enforced (optional)</label>
          <textarea
            className="w-full min-h-16 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={actionTaken}
            onChange={(e) => setActionTaken(e.target.value)}
            placeholder="e.g. Verbal warning issued and logged; docket marked."
          />
        </div>

        <label className="flex items-center gap-2 text-[13px] text-gray-700">
          <input
            type="checkbox"
            checked={docketConfiscated}
            onChange={(e) => setDocketConfiscated(e.target.checked)}
            className="rounded text-blue-600"
          />
          Confiscate examination docket / rough sheets as physical exhibit
        </label>

        {error && (
          <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800">
            <XCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>
    </Modal>
  );
}
