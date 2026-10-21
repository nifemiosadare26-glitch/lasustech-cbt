"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, MoreHorizontal, Image as ImageIcon, CheckCircle2, Loader2, Sparkles, X,
} from "lucide-react";
import { useApi, useDebounced, type PageMeta } from "@/lib/useApi";
import { mediaSrc, apiClient } from "@/lib/apiClient";
import { ErrorBanner, Pagination, selectCls, useToast } from "@/components/admin/ui";
import { MathText, cleanQuestionStem } from "@/components/question/math-text";

interface Course {
  id: string;
  code: string;
  title: string;
}

interface Subject {
  id: string;
  name: string;
  level: string | null;
  institution: string | null;
}

interface MediaView {
  id: string;
  url: string;
  mime: string;
  altText: string;
}

interface QuestionVersion {
  id: string;
  stem: { text?: string } | null;
  stemMedia: MediaView | null;
  stemMediaUrl: string | null;
  difficulty: string;
  marks: string;
  status: string;
  answerSource: string;
  explanation: string | null;
  topic: { id: string; name: string } | null;
  options: { id: string; position: number; isCorrect: boolean }[];
}

interface QuestionRow {
  id: string;
  courseId: string | null;
  subjectId: string | null;
  course: { id: string; code: string; title: string } | null;
  subject: { id: string; name: string; level: string | null } | null;
  ownerLabel: string;
  answerFormat: string;
  version: QuestionVersion | null;
}

const DIFFICULTY_VARIANT: Record<string, "danger" | "blue-tint" | "success" | "gray-tint"> = {
  HARD: "danger",
  MEDIUM: "blue-tint",
  EASY: "success",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "gray-tint" | "danger"> = {
  APPROVED: "success",
  LOCKED: "success",
  DRAFT: "gray-tint",
  PENDING: "warning",
  RETURNED: "warning",
  RETIRED: "danger",
};

const ANSWER_SOURCE: Record<string, string> = {
  SOURCE: "Source",
  LECTURER: "Lecturer",
  AI_SUGGESTED: "AI suggested",
  AI_GENERATED: "AI generated",
};

export default function QuestionBank() {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = React.useState("");
  const [scope, setScope] = React.useState("");
  const [difficulty, setDifficulty] = React.useState("");
  const [status, setStatus] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [approvingAll, setApprovingAll] = React.useState(false);
  const [togglingId, setTogglingId] = React.useState<string | null>(null);
  const debounced = useDebounced(search, 300);

  const courses = useApi<Course[]>("/lecturer/courses");
  const subjects = useApi<Subject[]>("/lecturer/subjects");

  const scopeType = scope.startsWith("course:")
    ? "course"
    : scope.startsWith("subject:")
      ? "subject"
      : null;
  const scopeId = scope.split(":")[1] ?? "";

  const query = new URLSearchParams({ page: String(page), pageSize: "15" });
  if (debounced.trim()) query.set("search", debounced.trim());
  if (scopeType && scopeId) query.set(scopeType === "course" ? "courseId" : "subjectId", scopeId);
  if (difficulty) query.set("difficulty", difficulty);
  if (status) query.set("status", status);

  const { data, meta, error, loading, reload } = useApi<QuestionRow[], PageMeta>(
    `/lecturer/questions?${query.toString()}`,
  );
  const rows = data ?? [];

  const hasFilters = !!(search || scope || difficulty || status);

  const handleBulkApprove = async () => {
    if (approvingAll) return;
    setApprovingAll(true);
    try {
      const payload: { courseId?: string; subjectId?: string } = {};
      if (scopeType === "course" && scopeId) payload.courseId = scopeId;
      if (scopeType === "subject" && scopeId) payload.subjectId = scopeId;

      const res = await apiClient<{ data: { count: number; message: string } }>(
        "/lecturer/questions/bulk-approve",
        {
          method: "POST",
          body: JSON.stringify(payload),
        }
      );
      toast.show(res.data.message || `Approved ${res.data.count} questions.`);
      await reload();
    } catch (e: any) {
      toast.show(e?.message ?? "Failed to approve questions.", "err");
    } finally {
      setApprovingAll(false);
    }
  };

  const handleToggleStatus = async (row: QuestionRow) => {
    if (togglingId) return;
    const currentStatus = row.version?.status;
    const nextStatus = currentStatus === "APPROVED" ? "DRAFT" : "APPROVED";
    setTogglingId(row.id);
    try {
      await apiClient(`/lecturer/questions/${row.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: nextStatus }),
      });
      toast.show(nextStatus === "APPROVED" ? "Question approved." : "Question saved as draft.");
      await reload();
    } catch (e: any) {
      toast.show(e?.message ?? "Failed to update question status.", "err");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <>
      {toast.node}
      <div className="space-y-6 pb-12 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Question bank</h2>
            <p className="text-[14px] text-gray-500 mt-1">
              Questions and photos you have added or imported. New questions are approved immediately.
            </p>
          </div>
          <div className="flex items-center gap-2.5">
            <Button
              variant="secondary"
              onClick={() => void handleBulkApprove()}
              disabled={approvingAll || loading}
              title="Approve all draft questions at once"
            >
              {approvingAll ? (
                <Loader2 className="mr-2 animate-spin" size={16} />
              ) : (
                <CheckCircle2 className="mr-2 text-emerald-600" size={16} />
              )}
              Approve all drafts
            </Button>
            <Button onClick={() => router.push("/lecturer/questions/new")}>
              <Plus className="mr-2" size={18} /> Add question
            </Button>
          </div>
        </div>

      {(error || courses.error || subjects.error) && (
        <ErrorBanner
          error={(error ?? courses.error ?? subjects.error)!}
          onRetry={() => {
            void reload();
            void courses.reload();
            void subjects.reload();
          }}
        />
      )}

      <Card className="flex flex-col">
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <select
            className={`${selectCls} !w-auto min-w-[220px] h-9 text-[13px]`}
            value={scope}
            onChange={(e) => {
              setScope(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All courses and subjects</option>
            {!!courses.data?.length && (
              <optgroup label="Courses">
                {courses.data.map((course) => (
                  <option key={course.id} value={`course:${course.id}`}>
                    {course.code} — {course.title}
                  </option>
                ))}
              </optgroup>
            )}
            {!!subjects.data?.length && (
              <optgroup label="Subjects">
                {subjects.data.map((subject) => (
                  <option key={subject.id} value={`subject:${subject.id}`}>
                    {subject.name}
                    {subject.level ? ` (${subject.level})` : ""}
                  </option>
                ))}
              </optgroup>
            )}
          </select>

          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search question text..."
              className="pl-10 h-9"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>

          <select
            className={`${selectCls} !w-auto h-9 text-[13px]`}
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All difficulties</option>
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>

          <select
            className={`${selectCls} !w-auto h-9 text-[13px]`}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">All statuses</option>
            <option value="APPROVED">Approved</option>
            <option value="DRAFT">Draft</option>
            <option value="RETIRED">Retired</option>
          </select>

          {hasFilters && (
            <button
              onClick={() => {
                setSearch("");
                setScope("");
                setDifficulty("");
                setStatus("");
                setPage(1);
              }}
              className="text-[13px] flex items-center text-blue-600 hover:text-blue-800 font-medium px-2 py-2"
            >
              Clear filters <X size={14} className="ml-1" />
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase w-14"></th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase">Question</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase">Course / subject</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase">Topic</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase">Difficulty</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase">Marks</th>
                <th className="px-4 py-3 text-[12px] font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !rows.length ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[14px] text-gray-500">
                    <Loader2 size={18} className="animate-spin inline mr-2" /> Loading questions...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <p className="text-[14px] text-gray-500">
                      {hasFilters ? "No questions match these filters." : "No questions yet."}
                    </p>
                    {!hasFilters && (
                      <div className="mt-4 flex justify-center gap-2">
                        <Button onClick={() => router.push("/lecturer/questions/new")}>
                          <Plus size={16} className="mr-2" /> Add question
                        </Button>
                        <Button variant="secondary" onClick={() => router.push("/lecturer/import")}>
                          Import a document
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const version = row.version;
                  const rawStem = version?.stem?.text ?? "";
                  const hasDiagram = /<svg[\s\S]*?<\/svg>/i.test(rawStem);
                  const stem = rawStem.replace(/<svg[\s\S]*?<\/svg>/gi, "").trim() || rawStem;
                  const thumb = version?.stemMediaUrl ?? null;
                  const hasOptions = (version?.options.length ?? 0) >= 2;
                  return (
                    <tr key={row.id} className="hover:bg-blue-50/50 transition-colors group">
                      <td className="px-4 py-3">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaSrc(thumb) ?? ""}
                            alt={version?.stemMedia?.altText ?? "Question figure"}
                            className="h-10 w-10 rounded border border-gray-200 bg-gray-50 object-cover"
                          />
                        ) : hasDiagram ? (
                          <div className="h-10 w-10 rounded border border-blue-200 bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-[10px]" title="Contains SVG diagram">
                            SVG
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded border border-gray-200 bg-gray-50 flex items-center justify-center text-gray-400">
                            <ImageIcon size={15} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[14px] text-gray-900 max-w-md">
                        <Link href={`/lecturer/questions/${row.id}`} className="group-hover:text-blue-700">
                          <span className="line-clamp-2">
                            <MathText text={cleanQuestionStem(stem) || "Untitled question"} />
                          </span>
                        </Link>
                        <div className="flex items-center gap-2 mt-1">
                          {hasDiagram && (
                            <span className="text-[11px] font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              Diagram
                            </span>
                          )}
                          {version?.answerSource && version.answerSource !== "LECTURER" && (
                            <span className="text-[11px] text-gray-500 inline-flex items-center gap-1">
                              <Sparkles size={11} />
                              {ANSWER_SOURCE[version.answerSource] ?? version.answerSource}
                            </span>
                          )}
                          {version && !hasOptions && (
                            <span className="text-[11px] text-amber-700">needs options</span>
                          )}
                          {version?.status === "DRAFT" && (
                            <span className="text-[11px] text-gray-500">not in exams yet</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-600 max-w-[180px] truncate">
                        {row.ownerLabel}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[12px] font-medium truncate max-w-[120px]">
                          {version?.topic?.name ?? "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={DIFFICULTY_VARIANT[version?.difficulty ?? ""] ?? "gray-tint"}>
                          {(version?.difficulty ?? "—").toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-700 font-mono">{version?.marks ?? "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Badge variant={STATUS_VARIANT[version?.status ?? ""] ?? "gray-tint"}>
                            {(version?.status ?? "—").toLowerCase()}
                          </Badge>
                          {version && (
                            <button
                              type="button"
                              onClick={() => void handleToggleStatus(row)}
                              disabled={togglingId === row.id}
                              className={`text-[11px] font-medium px-2 py-0.5 rounded transition-colors cursor-pointer border ${
                                version.status === "APPROVED"
                                  ? "border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100"
                                  : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                              } disabled:opacity-50`}
                              title={
                                version.status === "APPROVED"
                                  ? "Click to switch to Draft"
                                  : "Click to Approve"
                              }
                            >
                              {togglingId === row.id ? (
                                <Loader2 size={12} className="animate-spin inline" />
                              ) : version.status === "APPROVED" ? (
                                "Set to Draft"
                              ) : (
                                "Approve"
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => router.push(`/lecturer/questions/${row.id}`)}
                          className="text-gray-400 hover:text-gray-900 rounded p-1 cursor-pointer"
                          title="Edit question"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {meta && meta.total > 0 && (
          <Pagination
            page={meta.page}
            totalPages={meta.totalPages}
            total={meta.total}
            pageSize={meta.pageSize}
            onPage={setPage}
          />
        )}
      </Card>

      <div className="flex items-center gap-2 text-[12px] text-gray-500">
        <CheckCircle2 size={14} />
        <span>A question must have at least two options and one correct answer before it can be used in an exam.</span>
      </div>
    </div>
    </>
  );
}
