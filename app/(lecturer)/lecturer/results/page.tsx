"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, FileCheck, Globe, Building2, Loader2, Search, Users } from "lucide-react";
import { useApi } from "@/lib/useApi";
import { ErrorBanner } from "@/components/admin/ui";

type Audience = "INSTITUTIONAL" | "PUBLIC";

interface ExamRow {
  id: string;
  title: string;
  kind: string;
  kindLabel: string | null;
  audience: Audience;
  status: string;
  ownerLabel: string;
  publishedAt: string | null;
  questionCount: number;
  attemptCount: number;
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

const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(iso))
    : "—";

/**
 * The results landing page the sidebar has always linked to. Each paper's own
 * results page lives at /lecturer/exams/[id]/results; this is the index that
 * makes it reachable without opening every exam first.
 */
export default function LecturerResultsIndex() {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data, error, loading, reload } = useApi<ExamRow[]>("/lecturer/exams", {
    keepPrevious: true,
  });

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (data ?? [])
      .filter((exam) => {
        if (!term) return true;
        return (
          exam.title.toLowerCase().includes(term) ||
          exam.ownerLabel.toLowerCase().includes(term)
        );
      })
      // Papers people have actually sat are the ones a lecturer opens; the rest
      // stay below in publication order.
      .sort((a, b) => {
        if (b.attemptCount !== a.attemptCount) return b.attemptCount - a.attemptCount;
        return (b.publishedAt ?? "").localeCompare(a.publishedAt ?? "");
      });
  }, [data, search]);

  const papersWithSittings = (data ?? []).filter((exam) => exam.attemptCount > 0).length;
  const totalCandidates = (data ?? []).reduce((sum, exam) => sum + exam.attemptCount, 0);

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Results</h2>
          <p className="text-[14px] text-gray-500">
            {data
              ? `${totalCandidates} candidate${totalCandidates === 1 ? "" : "s"} across ${papersWithSittings} paper${
                  papersWithSittings === 1 ? "" : "s"
                }. Open a paper for its full breakdown and CSV export.`
              : "Loading your papers…"}
          </p>
        </div>
      </div>

      {error && <ErrorBanner error={error} onRetry={() => void reload()} />}

      <Card className="flex-1 overflow-hidden flex flex-col relative" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search by paper title, course or subject..."
              className="pl-9 h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Paper</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Audience</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Questions</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Candidates</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Published</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !rows.length ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-[14px] text-gray-500">
                    <Loader2 size={18} className="animate-spin inline mr-2" /> Loading results...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-[14px] text-gray-500">
                      {data?.length
                        ? "No papers match your search."
                        : "You have not created any papers yet, so there are no results."}
                    </p>
                  </td>
                </tr>
              ) : (
                rows.map((exam) => (
                  <tr
                    key={exam.id}
                    onClick={() => router.push(`/lecturer/exams/${exam.id}/results`)}
                    className="hover:bg-gray-50 transition-colors group cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                          <FileCheck size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-[14px] text-gray-900 truncate">
                            {exam.title}
                          </div>
                          <div className="text-[12px] text-gray-500 mt-0.5 truncate">
                            {exam.ownerLabel} • {KIND_LABEL[exam.kind] ?? exam.kindLabel ?? exam.kind}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {exam.audience === "PUBLIC" ? (
                        <Badge variant="blue-tint" className="gap-1.5">
                          <Globe size={12} /> Public
                        </Badge>
                      ) : (
                        <Badge variant="gray-tint" className="gap-1.5">
                          <Building2 size={12} /> School
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-700">{exam.questionCount}</td>
                    <td className="px-6 py-4">
                      {exam.attemptCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 text-[13px] font-medium text-gray-900">
                          <Users size={14} className="text-gray-400" />
                          {exam.attemptCount}
                        </span>
                      ) : (
                        <span className="text-[13px] text-gray-400">No candidates yet</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">
                      {fmtDate(exam.publishedAt)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <ChevronRight
                        size={18}
                        className="inline text-gray-400 group-hover:text-gray-900 transition-colors"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
