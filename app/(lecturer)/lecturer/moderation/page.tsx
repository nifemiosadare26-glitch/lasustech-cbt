"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  AlertCircle,
  Loader2,
  Search,
  ArrowRight,
  ShieldCheck,
  Edit,
  Sparkles,
} from "lucide-react";
import { useApi, type PageMeta } from "@/lib/useApi";
import { apiClient } from "@/lib/apiClient";
import { ConfirmModal, ErrorBanner, Modal, Pagination, useToast } from "@/components/admin/ui";
import { MathText, cleanQuestionStem } from "@/components/question/math-text";

interface SubmissionOption {
  id: string;
  position: number;
  isCorrect: boolean;
  body?: { text?: string } | null;
}

interface QuestionSubmission {
  id: string;
  questionId: string;
  courseCode: string;
  answerFormat: string;
  versionNo: number;
  status: "PENDING" | "RETURNED" | "APPROVED";
  stem: { text?: string } | null;
  hasMath: boolean;
  options: SubmissionOption[];
  difficulty: "EASY" | "MEDIUM" | "HARD";
  marks: number;
  authorName: string;
  topicName: string;
  explanation: string | null;
  reviewComment: string | null;
  reviewerName: string | null;
}

const DIFFICULTY_VARIANT: Record<string, "danger" | "blue-tint" | "success" | "gray-tint"> = {
  HARD: "danger",
  MEDIUM: "blue-tint",
  EASY: "success",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "gray-tint" | "danger"> = {
  APPROVED: "success",
  PENDING: "warning",
  RETURNED: "danger",
};

export default function LecturerModerationPage() {
  const toast = useToast();
  const [tab, setTab] = React.useState<"needs_review" | "my_submissions">("needs_review");
  const [page, setPage] = React.useState(1);

  const query = new URLSearchParams({
    filter: tab,
    page: String(page),
    pageSize: "15",
  });

  const { data, meta, error, loading, reload } = useApi<QuestionSubmission[], PageMeta>(
    `/lecturer/moderation/submissions?${query.toString()}`,
  );

  const items = data ?? [];

  // Review action modal state
  const [returningItem, setReturningItem] = React.useState<QuestionSubmission | null>(null);
  const [feedbackComment, setFeedbackComment] = React.useState("");
  const [approvingItem, setApprovingItem] = React.useState<QuestionSubmission | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleApprove = async () => {
    if (!approvingItem) return;
    setIsSubmitting(true);
    try {
      await apiClient(`/lecturer/moderation/submissions/${approvingItem.id}/review`, {
        method: "POST",
        body: JSON.stringify({ decision: "APPROVED" }),
      });
      toast.show("Question submission approved.");
      setApprovingItem(null);
      await reload();
    } catch (e: any) {
      toast.show(e?.message ?? "Failed to approve submission.", "err");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReturn = async () => {
    if (!returningItem) return;
    if (!feedbackComment.trim()) {
      toast.show("Please enter review feedback explaining what needs revision.", "err");
      return;
    }
    setIsSubmitting(true);
    try {
      await apiClient(`/lecturer/moderation/submissions/${returningItem.id}/review`, {
        method: "POST",
        body: JSON.stringify({
          decision: "RETURNED",
          comment: feedbackComment.trim(),
        }),
      });
      toast.show("Question returned to author with feedback.");
      setReturningItem(null);
      setFeedbackComment("");
      await reload();
    } catch (e: any) {
      toast.show(e?.message ?? "Failed to return submission.", "err");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {toast.node}
      <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="text-blue-700" size={26} />
              Peer Moderation
            </h2>
            <p className="text-[14px] text-gray-500 mt-1">
              Review examination questions authored by department colleagues to ensure syllabus compliance and quality.
            </p>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-xl text-[13px] font-medium self-start sm:self-auto">
            <button
              type="button"
              onClick={() => {
                setTab("needs_review");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                tab === "needs_review"
                  ? "bg-white text-gray-900 shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Needs My Review
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("my_submissions");
                setPage(1);
              }}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                tab === "my_submissions"
                  ? "bg-white text-gray-900 shadow-2xs font-semibold"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              My Submissions
            </button>
          </div>
        </div>

        {error && <ErrorBanner error={error} />}

        {loading && !items.length ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 space-y-3">
            <Loader2 className="animate-spin text-blue-600" size={28} />
            <p className="text-[14px]">Loading moderation items...</p>
          </div>
        ) : items.length === 0 ? (
          <Card>
            <div className="text-center py-16 px-4 space-y-3">
              <CheckCircle2 className="mx-auto text-emerald-500" size={40} />
              <h3 className="text-[17px] font-semibold text-gray-900">
                {tab === "needs_review"
                  ? "Moderation queue is clear!"
                  : "No submissions recorded"}
              </h3>
              <p className="text-[13px] text-gray-500 max-w-md mx-auto">
                {tab === "needs_review"
                  ? "You have no pending question reviews from colleagues in your assigned courses."
                  : "You have not submitted questions for moderation yet, or all your questions are currently in Draft."}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const stem = item.stem?.text || "";
              return (
                <Card key={item.id} className="p-5 transition-shadow hover:shadow-xs">
                  <div className="space-y-4">
                    {/* Header bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-[13px] text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
                          {item.courseCode}
                        </span>
                        <span className="text-[12px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {item.topicName}
                        </span>
                        <Badge variant={DIFFICULTY_VARIANT[item.difficulty] ?? "gray-tint"}>
                          {item.difficulty.toLowerCase()}
                        </Badge>
                        <span className="text-[12px] text-gray-500">
                          {item.marks} {item.marks === 1 ? "mark" : "marks"}
                        </span>
                        <span className="text-[12px] text-gray-400">·</span>
                        <span className="text-[12px] text-gray-500 font-mono">
                          v{item.versionNo}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge variant={STATUS_VARIANT[item.status] ?? "gray-tint"}>
                          {item.status.toLowerCase()}
                        </Badge>
                        <span className="text-[12px] text-gray-500">
                          by <strong className="text-gray-800">{item.authorName}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Question Stem */}
                    <div className="text-[15px] font-medium text-gray-900 leading-relaxed">
                      <MathText text={cleanQuestionStem(stem) || "Untitled question"} />
                    </div>

                    {/* Options list */}
                    {item.options && item.options.length > 0 && (
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                          Options:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.options.map((opt, i) => (
                            <div
                              key={opt.id || i}
                              className={`flex items-start gap-2.5 px-3 py-2 rounded-lg border text-[13px] ${
                                opt.isCorrect
                                  ? "border-emerald-300 bg-emerald-50/70 text-emerald-950 font-medium"
                                  : "border-gray-200 bg-gray-50/50 text-gray-700"
                              }`}
                            >
                              <span className="font-bold text-[12px] text-gray-500 w-4 shrink-0">
                                {String.fromCharCode(65 + i)}.
                              </span>
                              <div className="flex-1">
                                <MathText text={opt.body?.text || ""} />
                              </div>
                              {opt.isCorrect && (
                                <span className="text-[11px] font-semibold text-emerald-700 uppercase shrink-0">
                                  Correct
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {item.explanation && (
                      <div className="text-[13px] bg-amber-50/60 border border-amber-200 text-amber-900 rounded-lg p-3">
                        <strong className="block text-[11px] font-bold uppercase tracking-wider text-amber-800 mb-0.5">
                          Author Explanation:
                        </strong>
                        <MathText text={item.explanation} />
                      </div>
                    )}

                    {/* Reviewer feedback box if returned or approved with comments */}
                    {item.reviewComment && (
                      <div className="text-[13px] bg-blue-50/70 border border-blue-200 text-blue-950 rounded-lg p-3 space-y-1">
                        <div className="flex items-center gap-1.5 font-bold text-[12px] text-blue-800">
                          <MessageSquare size={14} />
                          Feedback from {item.reviewerName || "Reviewer"}:
                        </div>
                        <p className="text-gray-700 leading-normal pl-5">
                          &ldquo;{item.reviewComment}&rdquo;
                        </p>
                      </div>
                    )}

                    {/* Action footer */}
                    {tab === "needs_review" ? (
                      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setReturningItem(item);
                            setFeedbackComment("");
                          }}
                          className="text-amber-800 border-amber-200 hover:bg-amber-50"
                        >
                          <XCircle size={15} className="mr-1.5" /> Return with Feedback
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setApprovingItem(item)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <CheckCircle2 size={15} className="mr-1.5" /> Approve Question
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                        <span className="text-[12px] text-gray-500">
                          {item.status === "PENDING"
                            ? "Awaiting review by course colleagues."
                            : item.status === "RETURNED"
                              ? "Revision requested by moderator."
                              : "Approved for examinations."}
                        </span>
                        <Link href={`/lecturer/questions/${item.questionId}`}>
                          <Button variant="secondary" size="sm" className="text-[12px]">
                            <Edit size={13} className="mr-1.5" /> Edit Question in Bank
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}

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
        )}

        {/* Approve confirmation modal */}
        {approvingItem && (
          <ConfirmModal
            title="Approve question for examinations"
            body={`Are you sure you want to approve this question for ${approvingItem.courseCode}? Once approved, it will be eligible for inclusion in upcoming computer-based examinations.`}
            confirmLabel="Approve Question"
            onConfirm={handleApprove}
            onClose={() => setApprovingItem(null)}
          />
        )}

        {/* Return with feedback modal */}
        {returningItem && (
          <Modal
            title="Return question for revision"
            subtitle="Provide clear, actionable feedback to help the author revise this question."
            onClose={() => {
              if (!isSubmitting) {
                setReturningItem(null);
                setFeedbackComment("");
              }
            }}
          >
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-[13px] font-medium text-gray-700 mb-1">
                Feedback & Notes <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                value={feedbackComment}
                onChange={(e) => setFeedbackComment(e.target.value)}
                placeholder="E.g., Option B seems to have a typo in the formula, or the question stem requires more context..."
                className="w-full rounded-lg border border-gray-300 p-2.5 text-[14px] text-gray-900 focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setReturningItem(null);
                  setFeedbackComment("");
                }}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={() => void handleReturn()}
                isLoading={isSubmitting}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                Send Feedback & Return
              </Button>
            </div>
          </div>
        </Modal>
      )}
      </div>
    </>
  );
}
