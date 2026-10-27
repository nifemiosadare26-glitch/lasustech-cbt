"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, MoreHorizontal, FileCheck, Calendar, Link2, Loader2, Globe, Building2,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { useRealtimeEvent } from "@/lib/realtime";
import { ErrorBanner, selectCls, useToast } from "@/components/admin/ui";
import { copyToClipboard } from "@/lib/browser";

type Audience = "INSTITUTIONAL" | "PUBLIC";

interface ExamRow {
  id: string;
  title: string;
  kind: string;
  kindLabel: string | null;
  audience: Audience;
  status: string;
  ownerLabel: string;
  institutionName: string | null;
  levelLabel: string | null;
  examBoard: string | null;
  durationMin: number | null;
  passMark: string | null;
  publicSlug: string | null;
  publicUrl: string | null;
  publicOpensAt: string | null;
  publicClosesAt: string | null;
  publishedAt: string | null;
  questionCount: number;
  sectionCount: number;
  sittingCount: number;
  createdAt: string;
}

const KIND_LABEL: Record<string, string> = {
  MID_SEMESTER: "Mid-semester",
  END_OF_SEMESTER: "Final exam",
  MOCK: "Mock",
  QUIZ: "Quiz",
  RESIT: "Resit",
  SUPPLEMENTARY: "Supplementary",
  CUSTOM: "Custom",
};

const STATUS_VARIANT: Record<string, "success" | "warning" | "gray-tint" | "danger"> = {
  APPROVED: "success",
  LOCKED: "success",
  DRAFT: "gray-tint",
  IN_MODERATION: "warning",
  ARCHIVED: "gray-tint",
};

const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(iso))
    : "—";

export default function ExamManagementList() {
  const router = useRouter();
  const toast = useToast();
  const [search, setSearch] = React.useState("");
  const [audience, setAudience] = React.useState("ALL");
  const [status, setStatus] = React.useState("ALL");

  const query = new URLSearchParams();
  if (audience !== "ALL") query.set("audience", audience);
  if (status !== "ALL") query.set("status", status);
  const qs = query.toString();

  const { data, error, loading, reload } = useApi<ExamRow[]>(
    `/lecturer/exams${qs ? `?${qs}` : ""}`,
    { keepPrevious: true },
  );

  // Instantly refresh when sittings or exams are updated
  useRealtimeEvent("sitting.created", () => {
    void reload();
  });
  useRealtimeEvent("sitting.status", () => {
    void reload();
  });

  const rows = (data ?? []).filter((exam) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      exam.title.toLowerCase().includes(term) ||
      exam.ownerLabel.toLowerCase().includes(term) ||
      (exam.kindLabel ?? exam.kind).toLowerCase().includes(term)
    );
  });

  const copyLink = async (exam: ExamRow) => {
    if (!exam.publicUrl) return;
    const ok = await copyToClipboard(exam.publicUrl);
    if (ok) {
      toast.show("Public exam link copied.");
    } else {
      toast.show("Could not copy the link — copy it from the exam preview.", "err");
    }
  };

  return (
    <>
      {toast.node}
      <div className="space-y-6 pb-12 flex flex-col h-full relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Exams</h2>
            <p className="text-[14px] text-gray-500">
              Build a paper and publish it — it becomes active immediately. Admin timetables school exams; public exams
              get a shareable link.
            </p>
          </div>
          <Button onClick={() => router.push("/lecturer/exams/new")}>
            <Plus className="mr-2" size={16} /> Create exam
          </Button>
        </div>

        {error && <ErrorBanner error={error} onRetry={() => void reload()} />}

        <Card className="flex-1 overflow-hidden flex flex-col relative" noPadding>
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search exams by title, course or subject..."
                className="pl-9 h-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select className={selectCls} value={audience} onChange={(e) => setAudience(e.target.value)}>
              <option value="ALL">All audiences</option>
              <option value="INSTITUTIONAL">Internal (LASUSTECH)</option>
              <option value="PUBLIC">Public / External</option>
            </select>

            <select className={selectCls} value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="ALL">All statuses</option>
              <option value="APPROVED">Active</option>
              <option value="DRAFT">Draft</option>
              <option value="ARCHIVED">Archived</option>
            </select>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Exam</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Details</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Audience</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Published</th>
                  <th className="px-6 py-3 w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && !rows.length ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-[14px] text-gray-500">
                      <Loader2 size={18} className="animate-spin inline mr-2" /> Loading exams...
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <p className="text-[14px] text-gray-500">
                        {data?.length ? "No exams match your filters." : "You have not created any exams yet."}
                      </p>
                      {!data?.length && (
                        <Button className="mt-4" onClick={() => router.push("/lecturer/exams/new")}>
                          <Plus className="mr-2" size={16} /> Create your first exam
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  rows.map((exam) => (
                    <tr
                      key={exam.id}
                      onClick={() => router.push(`/lecturer/exams/${exam.id}/preview`)}
                      className="hover:bg-gray-50 transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                            <FileCheck size={18} />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-[14px] text-gray-900 truncate">{exam.title}</div>
                            <div className="text-[12px] text-gray-500 mt-0.5 truncate">{exam.ownerLabel}</div>
                            {(exam.institutionName || exam.levelLabel || exam.examBoard) && (
                              <div className="text-[11px] text-gray-400 mt-0.5 truncate">
                                {[exam.institutionName, exam.levelLabel, exam.examBoard].filter(Boolean).join(" · ")}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-[13px] text-gray-700">{exam.questionCount} questions</div>
                        <div className="text-[12px] text-gray-500">
                          {KIND_LABEL[exam.kind] ?? exam.kindLabel ?? exam.kind}
                          {exam.durationMin ? ` · ${exam.durationMin} mins` : ""}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {exam.audience === "PUBLIC" ? (
                          <Badge variant="blue-tint" className="gap-1.5">
                            <Globe size={12} /> Public
                          </Badge>
                        ) : (
                          <Badge variant="gray-tint" className="gap-1.5">
                            <Building2 size={12} /> Internal
                          </Badge>
                        )}
                        {exam.audience === "PUBLIC" && exam.publicUrl && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void copyLink(exam);
                            }}
                            className="mt-1.5 flex items-center gap-1 text-[12px] text-blue-600 hover:text-blue-800 cursor-pointer"
                          >
                            <Link2 size={12} /> Copy link
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={STATUS_VARIANT[exam.status] ?? "gray-tint"}>
                          {exam.status === "APPROVED" ? "Active" : exam.status.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-gray-400" />
                          {fmtDate(exam.publishedAt ?? exam.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/lecturer/exams/${exam.id}/preview`);
                          }}
                          className="text-gray-400 hover:text-gray-900 rounded p-1 transition-colors cursor-pointer"
                          title="View exam details"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  );
}
