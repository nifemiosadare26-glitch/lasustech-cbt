"use client";

import * as React from "react";
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ShieldCheck,
  History,
  AlertTriangle,
  Edit3,
  Loader2,
  FileText,
  Clock,
  User,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal, errMessage, useToast } from "@/components/admin/ui";
import { apiClient } from "@/lib/apiClient";
import { fmtDateTime } from "@/lib/format";

export interface AttemptScriptPayload {
  attemptId: string;
  student: {
    id: string;
    names: string;
    matricNo: string;
    email: string;
    department: string;
  };
  exam: {
    id: string;
    title: string;
    code: string;
    courseTitle: string;
  };
  attempt: {
    status: string;
    startedAt: string | null;
    submittedAt: string | null;
    durationMin: number | null;
    ipStart: string | null;
    deviceHash: string | null;
  };
  result: {
    id: string;
    scoreVersion: number;
    rawScore: number;
    maxScore: number;
    percent: number;
    grade: string;
    status: string;
    scoredAt: string;
    scoreChanges: Array<{
      id: string;
      oldScore: number;
      newScore: number;
      reason: string;
      changedBy: string;
      changedAt: string;
    }>;
  } | null;
  flags: Array<{
    id: string;
    ruleKey: string;
    severity: string;
    createdAt: string;
  }>;
  questions: Array<{
    questionNo: number;
    questionId: string;
    versionId: string;
    stem: string;
    topicName: string;
    difficulty: string;
    weightedMarks: number;
    marksAwarded: number;
    isCorrect: boolean;
    isAnswered: boolean;
    explanation?: string | null;
    options: Array<{
      id: string;
      position: number;
      text: string;
      isCorrect: boolean;
      isSelected: boolean;
    }>;
  }>;
}

interface CandidateScriptModalProps {
  attemptId: string;
  role: "ADMIN" | "LECTURER" | "STUDENT";
  onClose: () => void;
  onScoreUpdated?: () => void;
}

type QuestionFilter = "ALL" | "CORRECT" | "INCORRECT" | "UNANSWERED";

export function CandidateScriptModal({
  attemptId,
  role,
  onClose,
  onScoreUpdated,
}: CandidateScriptModalProps) {
  const toast = useToast();
  const [loading, setLoading] = React.useState(true);
  const [data, setData] = React.useState<AttemptScriptPayload | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [filter, setFilter] = React.useState<QuestionFilter>("ALL");

  // Admin Override Modal State
  const [isOverrideOpen, setIsOverrideOpen] = React.useState(false);
  const [newRawScore, setNewRawScore] = React.useState<string>("");
  const [reason, setReason] = React.useState<string>("");
  const [isSubmittingOverride, setIsSubmittingOverride] = React.useState(false);
  const [overrideError, setOverrideError] = React.useState<string | null>(null);

  const fetchScript = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const endpoint =
        role === "ADMIN"
          ? `/admin/results/attempts/${attemptId}/script`
          : role === "LECTURER"
          ? `/lecturer/results/attempts/${attemptId}/script`
          : `/student/attempts/${attemptId}/script`;

      const res = await apiClient<{ data: AttemptScriptPayload }>(endpoint);
      setData(res.data);
      if (res.data.result) {
        setNewRawScore(String(res.data.result.rawScore));
      }
    } catch (err) {
      setError(errMessage(err, "Failed to load candidate script slip."));
    } finally {
      setLoading(false);
    }
  }, [attemptId, role]);

  React.useEffect(() => {
    fetchScript();
  }, [fetchScript]);

  const handleScoreOverrideSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data?.result) return;

    const parsedScore = parseFloat(newRawScore);
    if (isNaN(parsedScore) || parsedScore < 0) {
      setOverrideError("Please enter a valid positive number for score.");
      return;
    }
    if (parsedScore > data.result.maxScore) {
      setOverrideError(
        `New score cannot exceed total exam marks (${data.result.maxScore}).`
      );
      return;
    }
    setIsSubmittingOverride(true);
    setOverrideError(null);

    try {
      await apiClient(`/admin/results/${data.result.id}/override`, {
        method: "POST",
        body: JSON.stringify({
          newRawScore: parsedScore,
          reason: reason.trim() || undefined,
        }),
      });

      toast.show("Score successfully adjusted.");
      setIsOverrideOpen(false);
      setReason("");
      await fetchScript();
      if (onScoreUpdated) onScoreUpdated();
    } catch (err) {
      setOverrideError(errMessage(err, "Failed to update score."));
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const questions = data?.questions ?? [];
  const correctCount = questions.filter((q) => q.isCorrect).length;
  const incorrectCount = questions.filter((q) => q.isAnswered && !q.isCorrect).length;
  const unansweredCount = questions.filter((q) => !q.isAnswered).length;

  const filteredQuestions = React.useMemo(() => {
    if (filter === "CORRECT") return questions.filter((q) => q.isCorrect);
    if (filter === "INCORRECT") return questions.filter((q) => q.isAnswered && !q.isCorrect);
    if (filter === "UNANSWERED") return questions.filter((q) => !q.isAnswered);
    return questions;
  }, [questions, filter]);

  const optionLetters = ["A", "B", "C", "D", "E", "F", "G", "H"];

  return (
    <>
      {toast.node}
      <Modal
        title={
          data
            ? `${data.student.names} — ${data.exam.code} Script Slip`
            : "Candidate Script Inspection"
        }
        subtitle={
          data
            ? `Matric No: ${data.student.matricNo} · ${data.student.department} · Exam: ${data.exam.title}`
            : "Review question-by-question responses and grading breakdown."
        }
        onClose={onClose}
        width="max-w-4xl"
      >
        <div className="space-y-4 pt-1 max-h-[80vh] flex flex-col">
          {loading ? (
            <div className="py-16 flex flex-col items-center justify-center text-gray-500 space-y-3">
              <Loader2 className="animate-spin text-blue-600" size={32} />
              <p className="text-[14px]">Retrieving student answers and marking key...</p>
            </div>
          ) : error || !data ? (
            <div className="py-12 text-center space-y-3">
              <div className="text-rose-600 font-medium text-[14px]">
                {error || "Candidate script could not be located."}
              </div>
              <Button size="sm" variant="secondary" onClick={fetchScript}>
                Retry Loading
              </Button>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-1">
              {/* Top Banner / Summary Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                      <User size={15} className="text-gray-400" />
                      <span className="font-semibold">{data.student.names}</span>
                      <span className="font-mono text-gray-500">
                        ({data.student.matricNo})
                      </span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                      <Clock size={15} className="text-gray-400" />
                      <span>
                        Time:{" "}
                        <strong>
                          {data.attempt.durationMin != null
                            ? `${data.attempt.durationMin} mins`
                            : "N/A"}
                        </strong>
                      </span>
                    </div>
                    <span className="text-gray-300">|</span>
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                      <BookOpen size={15} className="text-gray-400" />
                      <span>
                        Submitted:{" "}
                        {data.attempt.submittedAt
                          ? fmtDateTime(data.attempt.submittedAt)
                          : "In progress"}
                      </span>
                    </div>
                  </div>

                  {/* Role Specific Action */}
                  {role === "ADMIN" && data.result && (
                    <Button
                      size="sm"
                      onClick={() => setIsOverrideOpen(true)}
                      className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white text-[12px] h-8"
                    >
                      <Edit3 size={13} className="mr-1.5" /> Adjust Score
                    </Button>
                  )}
                </div>

                {/* Score and Stats Pill Row */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray-200/80">
                  <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[13px]">
                    <span className="text-gray-500">Raw Score: </span>
                    <strong className="text-gray-900 font-mono text-[14px]">
                      {data.result ? `${data.result.rawScore} / ${data.result.maxScore}` : "N/A"}
                    </strong>
                  </div>
                  <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[13px]">
                    <span className="text-gray-500">Percentage: </span>
                    <strong className="text-blue-700 font-mono text-[14px]">
                      {data.result ? `${data.result.percent}%` : "N/A"}
                    </strong>
                  </div>
                  <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-[13px]">
                    <span className="text-gray-500">Grade: </span>
                    <strong className="text-emerald-700 font-bold text-[14px]">
                      {data.result ? data.result.grade : "N/A"}
                    </strong>
                  </div>
                  {data.result?.status === "AMENDED" && (
                    <Badge variant="warning" className="text-[11px] font-semibold">
                      Amended (v{data.result.scoreVersion})
                    </Badge>
                  )}
                  {data.flags.length > 0 && (
                    <Badge variant="danger" className="text-[11px] flex items-center gap-1">
                      <AlertTriangle size={11} /> {data.flags.length} Flag(s)
                    </Badge>
                  )}
                </div>

                {/* Role Specific Guidance Banner */}
                {role === "LECTURER" ? (
                  <div className="rounded-lg bg-blue-50/70 border border-blue-200 p-2.5 text-[12px] text-blue-900 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Read-Only Academic Slip Review:</strong> Lecturers can inspect
                      the candidate&apos;s submitted choices against the answer key. To comply
                      with university examination integrity regulations, direct score overrides
                      are restricted to CBT Examination Administrators. If an
                      error in keying was found, submit an adjustment request to the admin.
                    </div>
                  </div>
                ) : role === "STUDENT" ? (
                  <div className="rounded-lg bg-indigo-50/70 border border-indigo-200 p-2.5 text-[12px] text-indigo-900 flex items-start gap-2">
                    <BookOpen size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Official Candidate Examination Script:</strong> Review your
                      submitted responses, correct answers, and question solutions for this examination.
                    </div>
                  </div>
                ) : (
                  <div className="rounded-lg bg-emerald-50/70 border border-emerald-200 p-2.5 text-[12px] text-emerald-900 flex items-start gap-2">
                    <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Administrator Authority:</strong> You have authorization to
                      override the candidate&apos;s final score if a dispute or system grading
                      error occurred. Every score alteration is permanently preserved in the
                      institutional audit trail with timestamp, previous score, and your
                      justification.
                    </div>
                  </div>
                )}
              </div>

              {/* Audit Trail: Score History (If Any) */}
              {data.result?.scoreChanges && data.result.scoreChanges.length > 0 && (
                <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center gap-2 text-amber-900 font-semibold text-[13px]">
                    <History size={15} className="text-amber-700" />
                    <span>Score Adjustment Audit History ({data.result.scoreChanges.length})</span>
                  </div>
                  <div className="divide-y divide-amber-200/60">
                    {data.result.scoreChanges.map((sc) => (
                      <div key={sc.id} className="pt-2 pb-1.5 first:pt-0 text-[12px] text-amber-950">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <span className="font-semibold text-gray-900">{sc.changedBy}</span>
                            <span className="text-amber-800"> changed score from </span>
                            <span className="font-mono font-bold line-through text-rose-700">
                              {sc.oldScore}
                            </span>
                            <span className="text-amber-800"> to </span>
                            <span className="font-mono font-bold text-emerald-700">
                              {sc.newScore}
                            </span>
                          </div>
                          <span className="text-gray-500 text-[11px]">
                            {fmtDateTime(sc.changedAt)}
                          </span>
                        </div>
                        <p className="mt-1 text-gray-700 italic bg-white/70 rounded p-1.5 border border-amber-100">
                          &ldquo;{sc.reason}&rdquo;
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-200 pb-2">
                <div className="flex flex-wrap items-center gap-1.5 text-[12px]">
                  <button
                    type="button"
                    onClick={() => setFilter("ALL")}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      filter === "ALL"
                        ? "bg-blue-600 text-white"
                        : "border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
                    }`}
                  >
                    All Questions ({questions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("CORRECT")}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      filter === "CORRECT"
                        ? "bg-emerald-600 text-white"
                        : "border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/30"
                    }`}
                  >
                    Correct ({correctCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter("INCORRECT")}
                    className={`px-2.5 py-1 rounded-md font-medium transition ${
                      filter === "INCORRECT"
                        ? "bg-rose-600 text-white"
                        : "border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/30"
                    }`}
                  >
                    Incorrect ({incorrectCount})
                  </button>
                  {unansweredCount > 0 && (
                    <button
                      type="button"
                      onClick={() => setFilter("UNANSWERED")}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        filter === "UNANSWERED"
                          ? "bg-gray-700 text-white"
                          : "border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/5"
                      }`}
                    >
                      Unanswered ({unansweredCount})
                    </button>
                  )}
                </div>
                <span className="text-[12px] text-gray-500 font-mono">
                  Showing {filteredQuestions.length} of {questions.length} questions
                </span>
              </div>

              {/* Questions List */}
              <div className="space-y-4">
                {filteredQuestions.length === 0 ? (
                  <div className="py-8 text-center text-gray-500 text-[13px]">
                    No questions match the current filter.
                  </div>
                ) : (
                  filteredQuestions.map((q) => {
                    return (
                      <div
                        key={q.versionId}
                        className={`rounded-xl border p-4 space-y-3 transition ${
                          q.isCorrect
                            ? "bg-white border-emerald-200"
                            : !q.isAnswered
                              ? "bg-gray-50/70 border-gray-200"
                              : "bg-white border-rose-200"
                        }`}
                      >
                        {/* Question Header */}
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[13px] font-bold text-gray-900">
                              Question #{q.questionNo}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-[12px] text-gray-500">
                              Topic: {q.topicName}
                            </span>
                            <span className="text-gray-300">·</span>
                            <span className="text-[11px] uppercase font-semibold text-gray-400">
                              {q.difficulty}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[12px] font-mono text-gray-600">
                              Awarded: <strong>{q.marksAwarded}</strong> / {q.weightedMarks} mark(s)
                            </span>
                            {q.isCorrect ? (
                              <Badge variant="success" className="text-[11px] flex items-center gap-1">
                                <CheckCircle2 size={12} /> Correct
                              </Badge>
                            ) : !q.isAnswered ? (
                              <Badge variant="outline" className="text-[11px] flex items-center gap-1 text-gray-500 border-gray-300">
                                <HelpCircle size={12} /> Unanswered
                              </Badge>
                            ) : (
                              <Badge variant="danger" className="text-[11px] flex items-center gap-1">
                                <XCircle size={12} /> Incorrect
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Question Stem */}
                        <div className="text-[14px] text-gray-900 font-medium whitespace-pre-wrap leading-relaxed">
                          {q.stem}
                        </div>

                        {/* Options List */}
                        <div className="space-y-2 pt-1">
                          {q.options.map((opt, optIdx) => {
                            const letter = optionLetters[optIdx] ?? String(optIdx + 1);

                            // Determine highlight color
                            let optCls = "bg-white border-gray-200 text-gray-700";
                            if (opt.isSelected && opt.isCorrect) {
                              optCls =
                                "bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500";
                            } else if (opt.isSelected && !opt.isCorrect) {
                              optCls =
                                "bg-rose-50 border-rose-500 text-rose-950 ring-1 ring-rose-500";
                            } else if (!opt.isSelected && opt.isCorrect) {
                              optCls =
                                "bg-emerald-50/50 border-emerald-400 border-dashed text-emerald-900";
                            }

                            return (
                              <div
                                key={opt.id}
                                className={`flex items-start justify-between gap-3 p-3 rounded-lg border text-[13px] ${optCls}`}
                              >
                                <div className="flex items-start gap-2.5 flex-1">
                                  <span className="font-mono font-bold shrink-0 mt-0.5">
                                    {letter}.
                                  </span>
                                  <span className="whitespace-pre-wrap">{opt.text}</span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  {opt.isSelected && (
                                    <span
                                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                                        opt.isCorrect
                                          ? "bg-emerald-200 text-emerald-900"
                                          : "bg-rose-200 text-rose-900"
                                      }`}
                                    >
                                      Candidate Selected
                                    </span>
                                  )}
                                  {opt.isCorrect && (
                                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1">
                                      <CheckCircle2 size={11} /> Correct Answer
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation Note */}
                        {q.explanation && (
                          <div className="rounded-lg bg-gray-50/50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 p-2.5 text-[12px] text-gray-700 dark:text-slate-300 space-y-1">
                            <span className="font-semibold text-gray-900 flex items-center gap-1">
                              <FileText size={12} className="text-gray-500" />
                              Explanation / Key Reference:
                            </span>
                            <p className="italic text-gray-600">{q.explanation}</p>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Admin Score Adjustment Sub-Modal */}
      {isOverrideOpen && data?.result && (
        <Modal
          title="Adjust Candidate Score"
          subtitle={`Manually override result score for ${data.student.names} (${data.student.matricNo}).`}
          onClose={() => {
            if (!isSubmittingOverride) setIsOverrideOpen(false);
          }}
          width="max-w-md"
          lockDismiss={isSubmittingOverride}
        >
          <form onSubmit={handleScoreOverrideSubmit} className="space-y-4 pt-1">
            {overrideError && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-[13px] text-rose-700">
                {overrideError}
              </div>
            )}

            <div className="bg-gray-50/50 dark:bg-slate-800/40 border border-gray-200 dark:border-slate-800 rounded-lg p-3 text-[13px] space-y-1">
              <div>
                <span className="text-gray-500">Exam: </span>
                <span className="font-semibold text-gray-900">{data.exam.title}</span>
              </div>
              <div>
                <span className="text-gray-500">Current Score: </span>
                <span className="font-mono font-bold text-gray-900">
                  {data.result.rawScore} / {data.result.maxScore}
                </span>{" "}
                <span className="text-gray-500">({data.result.percent}%, Grade {data.result.grade})</span>
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">
                New Raw Score (Max: {data.result.maxScore}) *
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max={data.result.maxScore}
                value={newRawScore}
                onChange={(e) => setNewRawScore(e.target.value)}
                required
                className="font-mono text-[14px]"
              />
              <span className="text-[11px] text-gray-500 mt-1 block">
                Percentage and letter grade will be automatically recalculated according to institutional grade bands.
              </span>
            </div>

            <div>
              <label className="block text-[13px] font-semibold text-gray-700 mb-1">
                Remarks / Notes (Optional)
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Optional notes or remarks on this score adjustment."
                className="w-full rounded-md border border-gray-300 p-2.5 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
              <Button
                type="button"
                variant="secondary"
                disabled={isSubmittingOverride}
                onClick={() => setIsOverrideOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmittingOverride}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Commit Score Change
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
