"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Clock, FileCheck, CheckCircle2, Link2, Loader2, Globe, Building2, CalendarDays, ShieldCheck,
} from "lucide-react";
import { useApi } from "@/lib/useApi";
import { mediaSrc } from "@/lib/apiClient";
import { ErrorBanner, useToast } from "@/components/admin/ui";
import { DiagramRenderer } from "@/components/question/diagram-renderer";
import { copyToClipboard } from "@/lib/browser";

interface MediaView {
  id: string;
  url: string;
  mime: string;
  bytes: number;
  width: number | null;
  height: number | null;
  altText: string;
}

interface OptionRow {
  id: string;
  position: number;
  body: { text?: string } | null;
  isCorrect: boolean;
  media: MediaView | null;
  mediaUrl: string | null;
}

interface QuestionRow {
  position: number;
  questionVersionId: string;
  id: string;
  stem: { text?: string } | null;
  stemMedia: MediaView | null;
  stemMediaUrl: string | null;
  explanation: string | null;
  difficulty: string;
  marks: string;
  status: string;
  answerSource: string;
  aiModel: string | null;
  topic: { id: string; name: string } | null;
  options: OptionRow[];
}

interface SectionRow {
  id: string;
  position: number;
  title: string;
  timerMode: string;
  minutes: number | null;
  weight: string;
  questions: QuestionRow[];
}

interface ExamDetail {
  id: string;
  title: string;
  kind: string;
  kindLabel: string | null;
  audience: "INSTITUTIONAL" | "PUBLIC";
  status: string;
  ownerLabel: string;
  institutionName: string | null;
  levelLabel: string | null;
  examBoard: string | null;
  instructions: { text?: string } | string | null;
  durationMin: number | null;
  passMark: string | null;
  settings: Record<string, unknown> | null;
  publicSlug: string | null;
  publicUrl: string | null;
  requiresCode: boolean;
  publicOpensAt: string | null;
  publicClosesAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  sittings: { id: string; startsAt: string; endsAt: string; status: string }[];
  sections: SectionRow[];
}

const ANSWER_SOURCE: Record<string, string> = {
  SOURCE: "From source",
  LECTURER: "Lecturer key",
  AI_SUGGESTED: "AI suggested",
  AI_GENERATED: "AI generated",
};

const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : "—";

export default function ExamPreview() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const router = useRouter();
  const toast = useToast();

  const { data: exam, error, loading, reload } = useApi<ExamDetail>(id ? `/lecturer/exams/${id}` : null);

  const copy = async () => {
    if (!exam?.publicUrl) return;
    const ok = await copyToClipboard(exam.publicUrl);
    if (ok) {
      toast.show("Public exam link copied.");
    } else {
      toast.show("Could not copy the link.", "err");
    }
  };

  if (loading && !exam) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading exam...
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <ErrorBanner error={error} onRetry={() => void reload()} />
        <Button variant="secondary" onClick={() => router.push("/lecturer/exams")}>
          <ArrowLeft size={16} className="mr-2" /> Back to exams
        </Button>
      </div>
    );
  }

  if (!exam) return null;

  const settings = (exam.settings ?? {}) as Record<string, unknown>;
  const questionCount = exam.sections.reduce((sum, section) => sum + section.questions.length, 0);
  const totalMarks = exam.sections.reduce(
    (sum, section) => sum + section.questions.reduce((s, q) => s + Number(q.marks || 1), 0),
    0,
  );
  const passMark = exam.passMark ?? (settings.passMark as string | number | undefined) ?? null;
  const instructionsText =
    typeof exam.instructions === "string" ? exam.instructions : (exam.instructions?.text ?? "");

  return (
    <>
      {toast.node}
      <div className="space-y-6 pb-12 flex flex-col h-full relative">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <Button variant="secondary" className="px-2 h-9" onClick={() => router.push("/lecturer/exams")}>
              <ArrowLeft size={18} />
            </Button>
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">{exam.title}</h2>
                <Badge variant={exam.status === "APPROVED" || exam.status === "LOCKED" ? "success" : "gray-tint"}>
                  {exam.status === "APPROVED" ? "Active" : exam.status.replace(/_/g, " ").toLowerCase()}
                </Badge>
                {exam.audience === "PUBLIC" ? (
                  <Badge variant="blue-tint" className="gap-1.5">
                    <Globe size={12} /> Public exam
                  </Badge>
                ) : (
                  <Badge variant="gray-tint" className="gap-1.5">
                    <Building2 size={12} /> Internal (LASUSTECH)
                  </Badge>
                )}
              </div>
              <p className="text-[13px] text-gray-500 mt-1">
                {exam.ownerLabel} • {questionCount} questions • {exam.durationMin ?? "—"} mins •{" "}
                {exam.kindLabel ?? exam.kind}
              </p>
              {(exam.institutionName || exam.levelLabel || exam.examBoard) && (
                <p className="text-[12px] text-gray-400 mt-0.5">
                  {[exam.institutionName, exam.levelLabel, exam.examBoard].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {exam.audience === "PUBLIC" && exam.publicUrl && (
              <>
                <Button variant="secondary" onClick={() => void copy()}>
                  <Link2 size={16} className="mr-2" /> Copy public link
                </Button>
                <Button variant="secondary" onClick={() => window.open(exam.publicUrl!, "_blank", "noopener")}>
                  Open exam page
                </Button>
              </>
            )}
            <Button onClick={() => router.push(`/lecturer/exams/${exam.id}/results`)}>Results</Button>
          </div>
        </div>

        {exam.audience === "PUBLIC" && exam.publicUrl && (
          <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <Link2 size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[13px] text-blue-900 font-medium">Anyone with this link can take the exam.</p>
              <p className="text-[12px] text-blue-700 break-all mt-1">{exam.publicUrl}</p>
              <p className="text-[12px] text-blue-700 mt-1">
                {exam.requiresCode ? "Candidates need the access code to start." : "No access code is required."}
              </p>
            </div>
          </div>
        )}

        {exam.audience === "INSTITUTIONAL" && (
          <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <CalendarDays size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <p className="text-[13px] text-amber-800 font-medium">
              This exam is published and active. It is immediately available on the timetable for Administrator scheduling.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {exam.sections.length === 0 && (
              <Card className="p-6 text-[13px] text-gray-500">This exam has no sections yet.</Card>
            )}
            {exam.sections.map((section) => (
              <div key={section.id} className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="font-semibold text-gray-900 text-[15px]">{section.title}</h3>
                  <span className="text-[12px] text-gray-500">
                    {section.questions.length} questions
                    {section.minutes ? ` · ${section.minutes} mins` : ""}
                    {section.weight && Number(section.weight) !== 1 ? ` · weight ${section.weight}` : ""}
                  </span>
                </div>

                {section.questions.map((q, qIdx) => (
                  <Card key={q.questionVersionId} className="p-5">
                    <div className="flex justify-between items-start gap-4 mb-4">
                      <div className="flex gap-3 min-w-0">
                        <span className="font-semibold text-gray-400 mt-0.5 text-[13px] shrink-0">
                          Q{qIdx + 1}
                        </span>
                        <div className="min-w-0">
                          <DiagramRenderer
                            text={q.stem?.text ?? ""}
                            mediaUrl={q.stemMediaUrl}
                            className="text-[14px] text-gray-900 leading-relaxed font-medium"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        <Badge variant="blue-tint">{q.difficulty?.toLowerCase() ?? "medium"}</Badge>
                        <span className="text-[11px] text-gray-400">{q.marks} mark(s)</span>
                        {q.answerSource && q.answerSource !== "SOURCE" && (
                          <span className="text-[11px] text-gray-500 inline-flex items-center gap-1">
                            <ShieldCheck size={11} />
                            {ANSWER_SOURCE[q.answerSource] ?? q.answerSource}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-8 space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div
                          key={opt.id}
                          className={`flex items-start gap-3 p-3 rounded-lg border text-[13px] ${
                            opt.isCorrect
                              ? "border-green-200 bg-green-50 text-green-900"
                              : "border-gray-200 bg-white text-gray-700"
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                              opt.isCorrect ? "border-green-600 bg-green-600 text-white" : "border-gray-300"
                            }`}
                          >
                            {opt.isCorrect && <CheckCircle2 size={12} />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <span className={`font-semibold mr-1 ${opt.isCorrect ? "text-green-700" : "text-gray-500"}`}>
                                {String.fromCharCode(65 + oIdx)}.
                              </span>
                              <span className={opt.isCorrect ? "font-medium" : ""}>{opt.body?.text ?? ""}</span>
                            </div>
                            {opt.mediaUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={mediaSrc(opt.mediaUrl) ?? ""}
                                alt={opt.media?.altText ?? "Option figure"}
                                className="mt-2 max-h-40 rounded border border-gray-200 object-contain bg-gray-50"
                              />
                            )}
                          </div>
                          {opt.isCorrect && (
                            <span className="ml-auto text-[11px] font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">
                              ANSWER
                            </span>
                          )}
                        </div>
                      ))}
                      {q.options.length < 2 && (
                        <p className="text-[12px] text-amber-700">This question has fewer than two options.</p>
                      )}
                    </div>

                    {q.explanation && (
                      <div className="ml-8 mt-3 rounded-lg bg-gray-50 border border-gray-200 p-3">
                        <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">Explanation</p>
                        <p className="text-[12px] text-gray-700 whitespace-pre-wrap">{q.explanation}</p>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            ))}
          </div>

          <div className="space-y-6">
            <Card title="Exam settings">
              <div className="space-y-4">
                <Row icon={<Clock size={16} />} label="Duration" value={exam.durationMin ? `${exam.durationMin} minutes` : "Not set"} />
                <Row icon={<FileCheck size={16} />} label="Pass mark" value={passMark ? `${passMark}%` : "Not set"} />
                <Row icon={<FileCheck size={16} />} label="Questions" value={`${questionCount} · ${totalMarks} marks`} />
                <Row
                  icon={<ShieldCheck size={16} />}
                  label="Shuffle"
                  value={[
                    settings.shuffleQuestions ? "questions" : null,
                    settings.shuffleOptions ? "options" : null,
                  ]
                    .filter(Boolean)
                    .join(" + ") || "Off"}
                />
                <Row
                  icon={<Globe size={16} />}
                  label="Results"
                  value={settings.showResults === false ? "Hidden from candidates" : "Shown on submit"}
                />
                {exam.audience === "PUBLIC" && (
                  <Row
                    icon={<CalendarDays size={16} />}
                    label="Window"
                    value={`${fmtDate(exam.publicOpensAt)} → ${fmtDate(exam.publicClosesAt)}`}
                  />
                )}
              </div>
            </Card>

            <Card title="Instructions">
              <p className="text-[13px] text-gray-600 leading-relaxed whitespace-pre-wrap">
                {instructionsText?.trim() || "No instructions were added to this exam."}
              </p>
            </Card>

            <Card title="Question breakdown">
              <div className="space-y-2 text-[13px]">
                {exam.sections.map((section) => (
                  <div
                    key={section.id}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                  >
                    <span className="text-gray-600 truncate pr-2">{section.title}</span>
                    <span className="font-semibold text-gray-900 shrink-0">{section.questions.length} Qs</span>
                  </div>
                ))}
                <div className="flex justify-between items-center pt-2 font-semibold">
                  <span className="text-gray-900">Total</span>
                  <span className="text-blue-700">{questionCount} questions</span>
                </div>
              </div>
            </Card>

            {exam.sittings.length > 0 && (
              <Card title="Timetabled sittings">
                <div className="space-y-2 text-[13px]">
                  {exam.sittings.map((sitting) => (
                    <div key={sitting.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="text-gray-600">{fmtDate(sitting.startsAt)}</span>
                      <Badge variant="gray-tint">{sitting.status.toLowerCase()}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-400 mt-0.5 shrink-0">{icon}</div>
      <div>
        <div className="text-[13px] font-medium text-gray-900">{label}</div>
        <div className="text-[13px] text-gray-500 mt-0.5">{value}</div>
      </div>
    </div>
  );
}
