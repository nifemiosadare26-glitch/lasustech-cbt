"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, MessageSquareWarning, XCircle, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { apiClient } from "@/lib/apiClient";
import { useApi, useDebounced, type PageMeta } from "@/lib/useApi";
import { fmtDateTime } from "@/lib/format";
import { ConfirmModal, ErrorBanner, Modal, Pagination, errMessage, selectCls, useToast } from "@/components/admin/ui";

type AppealStatus = "NEW" | "UNDER_REVIEW" | "RESOLVED";
type Outcome = "KEEP" | "CHANGE_SCORE" | "FIX_KEY";

interface Appeal {
  id: string;
  studentId: string;
  studentName: string;
  matricNo: string | null;
  courseCode: string | null;
  courseTitle: string | null;
  examTitle: string | null;
  sittingId: string | null;
  attemptId: string;
  reason: string;
  status: AppealStatus;
  outcome: Outcome | null;
  resolutionNote: string | null;
  assigneeId: string | null;
  assigneeName: string | null;
  createdAt: string;
  resultId: string;
  rawScore: number;
  maxScore: number;
  percent: number;
  grade: string;
  resultStatus: string;
}

interface AppealMeta extends PageMeta {
  counts: { open: number; underReview: number; resolved: number };
}

const STATUS_LABEL: Record<AppealStatus, string> = {
  NEW: "New",
  UNDER_REVIEW: "Under review",
  RESOLVED: "Resolved",
};

export default function StudentAppeals() {
  const [activeTab, setActiveTab] = React.useState<"Open" | "Resolved">("Open");
  const [search, setSearch] = React.useState("");
  const [page, setPage] = React.useState(1);
  const debounced = useDebounced(search, 300);
  const toast = useToast();

  const query = new URLSearchParams({
    status: activeTab === "Open" ? "OPEN" : "RESOLVED",
    page: String(page),
    pageSize: "20",
  });
  if (debounced.trim()) query.set("search", debounced.trim());
  const { data, meta, error, loading, reload } = useApi<Appeal[], AppealMeta>(
    `/admin/appeals?${query.toString()}`,
    { keepPrevious: true },
  );

  const appeals = data ?? [];
  const [selectedId, setSelectedId] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!appeals.some((a) => a.id === selectedId)) setSelectedId(appeals[0]?.id ?? null);
  }, [appeals, selectedId]);
  const selected = appeals.find((a) => a.id === selectedId) ?? null;

  const [resolving, setResolving] = React.useState<Appeal | null>(null);
  const [claiming, setClaiming] = React.useState<Appeal | null>(null);
  const [busy, setBusy] = React.useState(false);

  const claim = async () => {
    if (!claiming) return;
    setBusy(true);
    try {
      await apiClient(`/admin/appeals/${claiming.id}/review`, { method: "PATCH" });
      toast.show("Appeal assigned to you.");
      setClaiming(null);
      await reload();
    } catch (e) {
      toast.show(errMessage(e), "err");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      {toast.node}
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Student Appeals</h2>
        <p className="text-[14px] text-gray-500 mt-1">Resolve missing scripts and remarking requests.</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab("Open");
            setPage(1);
          }}
          className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === "Open" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Open Appeals ({meta?.counts.open ?? 0})
        </button>
        <button
          onClick={() => {
            setActiveTab("Resolved");
            setPage(1);
          }}
          className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${activeTab === "Resolved" ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Resolved ({meta?.counts.resolved ?? 0})
        </button>
      </div>

      {error && <ErrorBanner error={error} onRetry={reload} />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 space-y-4 flex flex-col min-h-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search ticket, student or course..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <div className="space-y-2 overflow-y-auto flex-1">
            {loading && !appeals.length ? (
              <p className="flex items-center gap-2 text-sm text-gray-500 py-4 justify-center">
                <Loader2 size={16} className="animate-spin" /> Loading appeals...
              </p>
            ) : appeals.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">
                No {activeTab.toLowerCase()} appeals.
              </p>
            ) : (
              appeals.map((appeal) => {
                const isSelected = selectedId === appeal.id;
                return (
                  <div
                    key={appeal.id}
                    onClick={() => setSelectedId(appeal.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${isSelected ? "bg-white border-blue-400 ring-1 ring-blue-400 shadow-sm" : "bg-gray-50/50 border-gray-200 hover:bg-white"}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={appeal.status === "RESOLVED" ? "success" : appeal.status === "NEW" ? "danger" : "warning"}>
                        {STATUS_LABEL[appeal.status]}
                      </Badge>
                      <span className="text-[11px] text-gray-500">{fmtDateTime(appeal.createdAt)}</span>
                    </div>
                    <h4 className="text-[14px] font-bold text-gray-900">
                      {appeal.studentName}{" "}
                      <span className="font-mono font-normal text-[12px] text-gray-500 ml-1">{appeal.matricNo ?? "—"}</span>
                    </h4>
                    <p className="text-[13px] text-gray-600 mt-1">
                      Course: {appeal.courseCode ?? "—"} · {appeal.resultStatus}
                    </p>
                  </div>
                );
              })
            )}
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

        <div className="md:col-span-2 min-h-0">
          {selected ? (
            <Card className="h-full flex flex-col" noPadding>
              <div className="p-6 border-b border-gray-100 bg-white">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-[20px] font-bold text-gray-900">
                        {selected.courseCode ?? "Appeal"} · {selected.examTitle ?? "Exam"}
                      </h3>
                      <Badge variant={selected.status === "RESOLVED" ? "success" : "blue-tint"}>
                        {STATUS_LABEL[selected.status]}
                      </Badge>
                      {selected.assigneeName && (
                        <span className="text-[12px] text-gray-500">Assigned to {selected.assigneeName}</span>
                      )}
                    </div>
                    <p className="text-[14px] text-gray-600">
                      Student <span className="font-semibold text-gray-900">{selected.studentName}</span>{" "}
                      ({selected.matricNo ?? "no matric"}) scored{" "}
                      <span className="font-mono text-blue-700">{selected.percent.toFixed(2)}%</span> ({selected.grade})
                      on <span className="font-mono text-blue-700">{selected.courseCode ?? "this course"}</span>.
                    </p>
                  </div>
                  {selected.status === "NEW" && (
                    <Button variant="secondary" onClick={() => setClaiming(selected)}>
                      Mark under review
                    </Button>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 bg-gray-50 overflow-y-auto space-y-6">
                <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-gray-200 rounded-full p-1">
                      <CheckCircle2 size={14} className="text-gray-500" />
                    </div>
                    <p className="text-[13px] font-semibold text-gray-900">Student&apos;s reason</p>
                    <p className="text-[12px] text-gray-700 mt-1 whitespace-pre-wrap">{selected.reason}</p>
                    <p className="text-[11px] text-gray-500 mt-1">Filed {fmtDateTime(selected.createdAt)}</p>
                  </div>
                  <div className="relative">
                    <div className="absolute -left-[31px] bg-warning-tint/20 rounded-full p-1">
                      <MessageSquareWarning size={14} className="text-warning-ink" />
                    </div>
                    <p className="text-[13px] font-semibold text-gray-900">Current script</p>
                    <p className="text-[12px] text-gray-700 mt-1">
                      Raw score {selected.rawScore} / {selected.maxScore} · {selected.percent.toFixed(2)}% · Grade{" "}
                      {selected.grade} · {selected.resultStatus}
                    </p>
                  </div>
                  {selected.status === "RESOLVED" && (
                    <div className="relative">
                      <div className="absolute -left-[31px] bg-emerald-100 rounded-full p-1">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                      </div>
                      <p className="text-[13px] font-semibold text-gray-900">Resolution</p>
                      <p className="text-[12px] text-gray-700 mt-1 whitespace-pre-wrap">
                        {selected.resolutionNote ?? "No note recorded."}
                      </p>
                      {selected.outcome && (
                        <p className="text-[11px] text-gray-500 mt-1">Outcome: {selected.outcome.replace("_", " ")}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {selected.status !== "RESOLVED" ? (
                <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
                  <Button
                    variant="secondary"
                    className="text-danger hover:bg-danger-tint/10 border-danger/30"
                    onClick={() => setResolving(selected)}
                    disabled={busy}
                  >
                    <XCircle size={16} className="mr-2" /> Resolve appeal
                  </Button>
                </div>
              ) : (
                <div className="p-4 border-t border-gray-100 bg-white text-[12px] text-gray-500">
                  Resolved {selected.assigneeName ? `by ${selected.assigneeName}` : ""}. Score changes are versioned in the
                  audit trail.
                </div>
              )}
            </Card>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center bg-gray-50/50">
              <div className="text-center text-gray-500">
                <MessageSquareWarning size={32} className="mx-auto mb-3 text-gray-300" />
                <p>Select an appeal from the list to view details.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {claiming && (
        <ConfirmModal
          title="Review this appeal?"
          body={
            <>
              <p>
                The appeal will be assigned to you and moved to <strong>Under review</strong>. You can still resolve it
                afterwards.
              </p>
              <p className="mt-2 text-[13px] text-gray-500">
                {claiming.studentName} · {claiming.courseCode ?? "course"} · {claiming.percent.toFixed(2)}%
              </p>
            </>
          }
          confirmLabel="Mark under review"
          onConfirm={claim}
          onClose={() => setClaiming(null)}
        />
      )}

      {resolving && (
        <ResolveAppealModal
          appeal={resolving}
          onClose={() => setResolving(null)}
          onDone={async () => {
            setResolving(null);
            await reload();
          }}
        />
      )}
    </div>
  );
}

function ResolveAppealModal({
  appeal,
  onClose,
  onDone,
}: {
  appeal: Appeal;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [outcome, setOutcome] = React.useState<Outcome>("KEEP");
  const [newScore, setNewScore] = React.useState("");
  const [note, setNote] = React.useState("");
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const submit = async () => {
    setPending(true);
    setError(null);
    try {
      const body: Record<string, unknown> = { outcome, resolutionNote: note.trim() };
      if (outcome === "CHANGE_SCORE") body.newScore = Number(newScore);
      await apiClient(`/admin/appeals/${appeal.id}/resolve`, { method: "PATCH", body: JSON.stringify(body) });
      await onDone();
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal
      title="Resolve appeal"
      subtitle={`${appeal.studentName} · ${appeal.courseCode ?? "course"}`}
      onClose={onClose}
      lockDismiss={pending}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button
            onClick={submit}
            isLoading={pending}
            disabled={note.trim().length < 3 || (outcome === "CHANGE_SCORE" && newScore === "")}
          >
            Save resolution
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Outcome</label>
          <select className={selectCls} value={outcome} onChange={(e) => setOutcome(e.target.value as Outcome)}>
            <option value="KEEP">Uphold the score (KEEP)</option>
            <option value="CHANGE_SCORE">Correct the score (CHANGE_SCORE)</option>
            <option value="FIX_KEY">Fix answer key and re-score (FIX_KEY)</option>
          </select>
        </div>

        {outcome === "CHANGE_SCORE" && (
          <div>
            <label className="text-[13px] font-medium text-gray-700 block mb-1">Corrected raw score</label>
            <Input
              type="number"
              min={0}
              max={appeal.maxScore}
              step="0.5"
              value={newScore}
              onChange={(e) => setNewScore(e.target.value)}
            />
            <p className="text-[12px] text-gray-500 mt-1">
              Out of {appeal.maxScore}. A new result version is created and the batch returns to pending approval.
            </p>
          </div>
        )}

        <div>
          <label className="text-[13px] font-medium text-gray-700 block mb-1">Resolution note</label>
          <textarea
            className="w-full min-h-24 rounded-md border border-gray-300 bg-white px-3 py-2 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Explain the decision for the audit record..."
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
