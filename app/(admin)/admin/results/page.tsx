"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileCheck, Send, CheckCircle2, ShieldAlert, Loader2, Download, Eye, X, FileText } from "lucide-react";
import { apiClient, apiDownload } from "@/lib/apiClient";
import { useApi, useDebounced, type PageMeta } from "@/lib/useApi";
import { fmtDateTime } from "@/lib/format";
import { ConfirmModal, ErrorBanner, Modal, Pagination, errMessage, useToast } from "@/components/admin/ui";
import { CandidateScriptModal } from "@/components/exam/candidate-script-modal";

type ResultStatus = "PENDING" | "SUBMITTED" | "APPROVED" | "RELEASED";

interface CandidateScore {
  id: string;
  attemptId: string;
  studentId: string;
  studentName: string;
  matricNo: string;
  rawScore: number;
  maxScore: number;
  percent: number;
  grade: string;
  status: string;
  flagsCount: number;
  flags: Array<{ id: string; flagType: string; reason?: string }>;
  timeSpent: string;
}

interface SittingDetailsPayload {
  sitting: {
    id: string;
    examTitle: string;
    courseCode: string;
    courseTitle: string;
    startsAt: string;
    endsAt: string;
    status: string;
  };
  stats: {
    total: number;
    average: number;
    passed: number;
    failed: number;
    flags: number;
  };
  candidates: CandidateScore[];
}

interface ResultRow {
  id: string;
  batchId: string | null;
  courseCode: string;
  courseTitle: string;
  examTitle: string;
  startsAt: string;
  endsAt: string;
  sittingStatus: string;
  scripts: number;
  flags: number;
  status: ResultStatus;
  submittedAt: string | null;
  approvedAt: string | null;
  releasedAt: string | null;
}

interface ResultMeta extends PageMeta {
  counts: { pending: number; approved: number; released: number; flagged: number };
}

const STATUS_LABEL: Record<ResultStatus, string> = {
  PENDING: "Pending approval",
  SUBMITTED: "Submitted",
  APPROVED: "Approved",
  RELEASED: "Published",
};

const FILTERS: { value: string; label: string }[] = [
  { value: "ALL", label: "All results" },
  { value: "PENDING", label: "Pending approval" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED", label: "Approved" },
  { value: "RELEASED", label: "Published" },
  { value: "UNDER_REVIEW", label: "With open flags" },
];

export default function ResultsProcessing() {
  const toast = useToast();
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState("ALL");
  const [page, setPage] = React.useState(1);
  const debounced = useDebounced(search, 300);

  const query = new URLSearchParams({ status, page: String(page), pageSize: "20" });
  if (debounced.trim()) query.set("search", debounced.trim());
  const { data, meta, error, loading, reload } = useApi<ResultRow[], ResultMeta>(
    `/admin/results?${query.toString()}`,
    { keepPrevious: true },
  );
  const rows = data ?? [];

  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [releasing, setReleasing] = React.useState<ResultRow | null>(null);
  const [resolving, setResolving] = React.useState<ResultRow | null>(null);
  const [inspectingSitting, setInspectingSitting] = React.useState<ResultRow | null>(null);
  const [candidateFilter, setCandidateFilter] = React.useState("");
  const [inspectingData, setInspectingData] = React.useState<SittingDetailsPayload | null>(null);
  const [loadingDetails, setLoadingDetails] = React.useState(false);
  const [exporting, setExporting] = React.useState(false);
  const [selectedAttemptId, setSelectedAttemptId] = React.useState<string | null>(null);

  const viewDetails = async (row: ResultRow) => {
    setInspectingSitting(row);
    setInspectingData(null);
    setCandidateFilter("");
    setLoadingDetails(true);
    try {
      const res = await apiClient<{ data: SittingDetailsPayload }>(`/admin/results/${row.id}`);
      setInspectingData(res.data);
    } catch (e) {
      toast.show(errMessage(e), "err");
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleExport = async () => {
    if (!inspectingSitting) return;
    setExporting(true);
    try {
      await apiDownload(`/admin/results/${inspectingSitting.id}/export`, `${inspectingSitting.courseCode}_Results.csv`);
      toast.show("Broadsheet downloaded.");
    } catch (e) {
      toast.show(errMessage(e), "err");
    } finally {
      setExporting(false);
    }
  };

  const approve = async (row: ResultRow) => {
    setBusyId(row.id);
    try {
      await apiClient(`/admin/results/${row.id}/approve`, { method: "POST" });
      toast.show(`Results for ${row.courseCode} approved. Publish when ready.`);
      await reload();
    } catch (e) {
      toast.show(errMessage(e), "err");
    } finally {
      setBusyId(null);
    }
  };

  const release = async () => {
    if (!releasing) return;
    await apiClient(`/admin/results/${releasing.id}/release`, { method: "POST" });
    toast.show(`Results for ${releasing.courseCode} published to student portals.`);
    setReleasing(null);
    await reload();
  };

  const resolveFlags = async () => {
    if (!resolving) return;
    await apiClient(`/admin/results/${resolving.id}/resolve-flags`, { method: "POST" });
    toast.show(`Open flags for ${resolving.courseCode} marked reviewed.`);
    setResolving(null);
    await reload();
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      {toast.node}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Results Processing</h2>
          <p className="text-[14px] text-gray-500 mt-1">
            Approve finalized scores, resolve proctoring flags and publish to student portals.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[12px] text-gray-600">
          <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-1">
            Pending {meta?.counts.pending ?? 0}
          </span>
          <span className="rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1">
            Approved {meta?.counts.approved ?? 0}
          </span>
          <span className="rounded-full bg-gray-50 border border-gray-200 px-3 py-1">
            Published {meta?.counts.released ?? 0}
          </span>
          <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1">
            Flagged {meta?.counts.flagged ?? 0}
          </span>
        </div>
      </div>

      {error && <ErrorBanner error={error} onRetry={reload} />}

      <Card className="flex-1 overflow-hidden flex flex-col" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search course code or title..."
              className="pl-9 h-9"
            />
          </div>
          <select
            className="h-9 rounded-md border border-gray-300 bg-white px-3 text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Course</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Scripts Processed</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Malpractice Flags</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !rows.length ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[14px] text-gray-500">
                    <Loader2 size={18} className="animate-spin inline mr-2" /> Loading results...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-[14px] text-gray-500">
                    No results match this filter.
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                          <FileCheck size={18} />
                        </div>
                        <div>
                          <div className="font-mono text-[13px] font-medium text-blue-700">{row.courseCode}</div>
                          <div className="text-[13px] text-gray-900">{row.courseTitle}</div>
                          <div className="text-[11px] text-gray-500">
                            {row.examTitle} · sat {fmtDateTime(row.startsAt)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] font-semibold text-gray-900">{row.scripts}</td>
                    <td className="px-6 py-4">
                      {row.flags > 0 ? (
                        <span className="inline-flex items-center text-[13px] font-medium text-warning-ink gap-1.5">
                          <ShieldAlert size={16} /> {row.flags} flagged
                        </span>
                      ) : (
                        <span className="text-[13px] text-gray-500">None</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          row.status === "RELEASED"
                            ? "success"
                            : row.status === "APPROVED"
                              ? "blue-tint"
                              : row.status === "SUBMITTED"
                                ? "warning"
                                : "gray-solid"
                        }
                      >
                        {STATUS_LABEL[row.status] ?? row.status}
                      </Badge>
                      {row.flags > 0 && row.status !== "RELEASED" && (
                        <div className="text-[11px] text-amber-700 mt-1">Resolve flags before publishing</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="h-8 text-gray-700 hover:text-blue-700"
                          onClick={() => void viewDetails(row)}
                        >
                          <Eye size={14} className="mr-1.5" /> View
                        </Button>
                        {row.flags > 0 && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8"
                            onClick={() => setResolving(row)}
                          >
                            Resolve flags
                          </Button>
                        )}
                        {row.status === "PENDING" || row.status === "SUBMITTED" ? (
                          <Button
                            size="sm"
                            className="h-8"
                            isLoading={busyId === row.id}
                            disabled={row.flags > 0}
                            onClick={() => approve(row)}
                            title={row.flags > 0 ? "Resolve open flags first" : undefined}
                          >
                            <CheckCircle2 size={14} className="mr-2" /> Approve
                          </Button>
                        ) : row.status === "APPROVED" ? (
                          <Button size="sm" className="h-8" onClick={() => setReleasing(row)}>
                            <Send size={14} className="mr-2" /> Publish
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-8 text-success border-success/30 bg-success-tint/10"
                            disabled
                          >
                            <CheckCircle2 size={14} className="mr-2" /> Published
                          </Button>
                        )}
                      </div>
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

      {releasing && (
        <ConfirmModal
          title={`Publish ${releasing.courseCode} results?`}
          body={
            <>
              <p>
                This releases <strong>{releasing.scripts}</strong> scripts to student portals. Students will be able to
                view their scores immediately.
              </p>
              {releasing.flags > 0 && (
                <p className="mt-2 text-amber-700 text-[13px]">
                  {releasing.flags} malpractice flag(s) are still attached to this sitting.
                </p>
              )}
            </>
          }
          confirmLabel="Publish results"
          onConfirm={release}
          onClose={() => setReleasing(null)}
        />
      )}

      {resolving && (
        <ConfirmModal
          title={`Resolve flags for ${resolving.courseCode}?`}
          body={
            <p>
              All <strong>{resolving.flags}</strong> open proctoring flag(s) for this sitting will be marked reviewed.
              This does not change any candidate&apos;s score.
            </p>
          }
          confirmLabel="Mark reviewed"
          onConfirm={resolveFlags}
          onClose={() => setResolving(null)}
        />
      )}

      {inspectingSitting && (
        <Modal
          title={`Results: ${inspectingSitting.courseCode} — ${inspectingSitting.examTitle}`}
          subtitle={`Sitting conducted on ${fmtDateTime(inspectingSitting.startsAt)}. Review candidate score records and export broadsheet.`}
          onClose={() => setInspectingSitting(null)}
          width="max-w-4xl"
        >
          <div className="space-y-4 pt-1">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-[13px] text-gray-700">
                  Total: <strong>{inspectingData?.stats.total ?? inspectingSitting.scripts}</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-[13px] text-gray-700">
                  Avg: <strong>{inspectingData?.stats.average ?? 0}%</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-[13px] text-emerald-700">
                  Passed: <strong>{inspectingData?.stats.passed ?? 0}</strong>
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-[13px] text-rose-700">
                  Failed: <strong>{inspectingData?.stats.failed ?? 0}</strong>
                </span>
                {Boolean(inspectingData?.stats.flags) && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-[13px] text-amber-700 font-medium">
                      Flags: <strong>{inspectingData?.stats.flags}</strong>
                    </span>
                  </>
                )}
              </div>

              <Button
                size="sm"
                variant="secondary"
                onClick={handleExport}
                isLoading={exporting}
                className="shrink-0 text-[12px] bg-white hover:bg-gray-100"
              >
                <Download size={14} className="mr-1.5" /> Export Broadsheet (CSV)
              </Button>
            </div>

            {/* Candidate Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
              <Input
                placeholder="Search candidates by matric number or name..."
                className="pl-9 h-9 text-[13px]"
                value={candidateFilter}
                onChange={(e) => setCandidateFilter(e.target.value)}
              />
            </div>

            {/* Candidates Table */}
            {loadingDetails ? (
              <div className="py-12 flex flex-col items-center justify-center text-gray-500 space-y-2">
                <Loader2 className="animate-spin text-blue-600" size={24} />
                <p className="text-[13px]">Retrieving student scores...</p>
              </div>
            ) : inspectingData?.candidates.length === 0 ? (
              <div className="py-8 text-center text-gray-500 text-[13px]">
                No student attempts recorded for this sitting.
              </div>
            ) : (
              <div className="max-h-[380px] overflow-y-auto border border-gray-200 rounded-lg">
                <table className="w-full text-left text-[13px]">
                  <thead className="bg-gray-50 sticky top-0 border-b border-gray-200 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    <tr>
                      <th className="px-3 py-2">Matric No</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2 text-right">Raw Score</th>
                      <th className="px-3 py-2 text-right">Percent</th>
                      <th className="px-3 py-2 text-center">Grade</th>
                      <th className="px-3 py-2 text-right">Time</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {inspectingData?.candidates
                      .filter(
                        (c) =>
                          !candidateFilter.trim() ||
                          c.matricNo.toLowerCase().includes(candidateFilter.toLowerCase()) ||
                          c.studentName.toLowerCase().includes(candidateFilter.toLowerCase())
                      )
                      .map((c) => (
                        <tr key={c.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2 font-mono font-medium text-blue-700">
                            {c.matricNo}
                          </td>
                          <td className="px-3 py-2 text-gray-900 font-medium">
                            {c.studentName}
                          </td>
                          <td className="px-3 py-2 text-right text-gray-600">
                            {c.rawScore} / {c.maxScore}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-gray-900">
                            {c.percent}%
                          </td>
                          <td className="px-3 py-2 text-center font-bold">
                            <span
                              className={
                                c.percent >= 70
                                  ? "text-emerald-700"
                                  : c.percent >= 50
                                    ? "text-blue-700"
                                    : c.percent >= 40
                                      ? "text-amber-700"
                                      : "text-rose-700"
                              }
                            >
                              {c.grade}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-gray-500">
                            {c.timeSpent}
                          </td>
                          <td className="px-3 py-2">
                            {c.flagsCount > 0 ? (
                              <Badge variant="warning" className="text-[11px]">
                                {c.flagsCount} flag(s)
                              </Badge>
                            ) : (
                              <Badge variant="success" className="text-[11px]">
                                Normal
                              </Badge>
                            )}
                          </td>
                          <td className="px-3 py-2 text-right">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => setSelectedAttemptId(c.attemptId)}
                              className="h-7 px-2 text-[11px] bg-white hover:bg-gray-100 border border-gray-300"
                            >
                              <FileText size={12} className="mr-1 text-blue-600" /> Review Script
                            </Button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}

      {selectedAttemptId && (
        <CandidateScriptModal
          attemptId={selectedAttemptId}
          role="ADMIN"
          onClose={() => setSelectedAttemptId(null)}
          onScoreUpdated={async () => {
            if (inspectingSitting) {
              await viewDetails(inspectingSitting);
            }
            await reload();
          }}
        />
      )}
    </div>
  );
}
