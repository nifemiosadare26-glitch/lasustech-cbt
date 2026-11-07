"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Upload,
  Library,
  FileCheck,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ClipboardList,
  FileText,
  Globe,
  Building2,
  KeyRound,
  Copy,
  Eye,
  EyeOff,
  ExternalLink,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { useApi } from "@/lib/useApi";
import { copyToClipboard } from "@/lib/browser";
import { useToast } from "@/components/admin/ui";
import {
  CandidateParticipationModal,
  type CandidateParticipationExam,
} from "@/components/exam/candidate-participation-modal";

type Me = { names?: string };
type Summary = { courses: number; subjects: number; questions: number; exams: number };
type Course = { id: string; code: string; title: string; level: string | null };
type Subject = {
  id: string;
  name: string;
  code: string | null;
  level: string | null;
  institution: string | null;
  questionCount: number;
  examCount: number;
};
type Difficulty = { total: number; EASY: number; MEDIUM: number; HARD: number };
type ExamRow = {
  id: string;
  title: string;
  kind: string;
  kindLabel: string | null;
  audience: "INSTITUTIONAL" | "PUBLIC";
  ownerLabel: string;
  questionCount: number;
  durationMin: number | null;
  passMark: number | string | null;
  publishedAt: string | null;
  publicSlug: string | null;
  publicLink: string | null;
  publicUrl: string | null;
  accessCode: string | null;
  status: string;
  sitting?: {
    id: string;
    startsAt: string;
    endsAt: string;
    status: string;
    venue: string | null;
    requireWebcam: boolean;
  } | null;
};

const KIND_LABEL: Record<string, string> = {
  MID_SEMESTER: "Mid-semester",
  END_OF_SEMESTER: "Final exam",
  MOCK: "Mock",
  QUIZ: "Quiz",
  RESIT: "Resit",
  SUPPLEMENTARY: "Supplementary",
  CUSTOM: "Custom",
};

function StatCard({
  href,
  label,
  value,
  hint,
  icon,
}: {
  href: string;
  label: string;
  value: number | undefined;
  hint: string;
  icon: ReactNode;
}) {
  return (
    <Link href={href} className="block group">
      <Card className="h-full flex flex-col justify-between hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[13px] font-medium text-gray-600">{label}</p>
            <p className="mt-2 text-[28px] font-semibold text-gray-900 leading-none">
              {value ?? "—"}
            </p>
          </div>
          <div className="p-2 rounded-md bg-blue-50 text-blue-700">{icon}</div>
        </div>
        <p className="mt-3 text-[12px] text-gray-500">{hint}</p>
      </Card>
    </Link>
  );
}

export default function LecturerDashboard() {
  const [greeting, setGreeting] = useState("Good morning");
  const toast = useToast();
  const [selectedExam, setSelectedExam] = useState<CandidateParticipationExam | null>(null);
  const [maskedCodes, setMaskedCodes] = useState<Record<string, boolean>>({});
  const [revealedCodes, setRevealedCodes] = useState<Record<string, string>>({});

  const me = useApi<Me>("/me");
  const summary = useApi<Summary>("/lecturer/dashboard/summary");
  const courses = useApi<Course[]>("/lecturer/courses");
  const subjects = useApi<Subject[]>("/lecturer/subjects");
  const difficulty = useApi<Difficulty>("/lecturer/questions/summary");
  const exams = useApi<ExamRow[]>("/lecturer/exams");

  useEffect(() => {
    const hour = parseInt(
      new Date().toLocaleString("en-US", {
        timeZone: "Africa/Lagos",
        hour: "numeric",
        hour12: false,
      }),
      10,
    );
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const rawNames = (me.data?.names ?? "").trim();
  let displayName = "Lecturer";
  if (rawNames) {
    const parts = rawNames.split(/\s+/);
    const titles = ["dr.", "dr", "prof.", "prof", "mr.", "mr", "mrs.", "mrs", "ms.", "ms", "engr.", "engr"];
    if (parts.length > 1 && titles.includes(parts[0].toLowerCase())) {
      displayName = `${parts[0]} ${parts[1]}`;
    } else {
      displayName = parts[0];
    }
  }

  const courseList = courses.data ?? [];
  const subjectList = subjects.data ?? [];
  const recentExams = (exams.data ?? []).slice(0, 4);
  const mix = difficulty.data ?? { total: 0, EASY: 0, MEDIUM: 0, HARD: 0 };

  const mixRows = [
    { key: "EASY", label: "Easy", value: mix.EASY, colour: "bg-blue-200" },
    { key: "MEDIUM", label: "Medium", value: mix.MEDIUM, colour: "bg-blue-500" },
    { key: "HARD", label: "Hard", value: mix.HARD, colour: "bg-blue-700" },
  ];
  const maxMix = Math.max(1, mix.EASY, mix.MEDIUM, mix.HARD);

  return (
    <>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[32px] font-semibold text-gray-900 tracking-tight">
              {greeting}, {displayName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {summary.data
                ? `${summary.data.courses} course${summary.data.courses === 1 ? "" : "s"} • ${summary.data.subjects} subject${summary.data.subjects === 1 ? "" : "s"} • ${summary.data.questions} question${summary.data.questions === 1 ? "" : "s"} in your bank`
                : "Loading your workspace…"}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/lecturer/import">
              <Button variant="secondary" className="bg-white">
                <Upload size={16} className="mr-2" />
                Import
              </Button>
            </Link>
            <Link href="/lecturer/questions/new">
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus size={16} className="mr-2" />
                Add question
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <StatCard
            href="/lecturer/questions"
            label="Questions"
            value={summary.data?.questions}
            hint="Everything in your question bank"
            icon={<Library size={18} />}
          />
          <StatCard
            href="/lecturer/exams"
            label="Exams"
            value={summary.data?.exams}
            hint="Papers you have created"
            icon={<FileCheck size={18} />}
          />
          <StatCard
            href="/lecturer/questions"
            label="Courses"
            value={summary.data?.courses}
            hint="Institution courses assigned to you"
            icon={<GraduationCap size={18} />}
          />
          <StatCard
            href="/lecturer/questions"
            label="Subjects"
            value={summary.data?.subjects}
            hint="School, entrance or external subjects"
            icon={<BookOpen size={18} />}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Recent papers */}
          <Card className="lg:col-span-2 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-[17px] text-gray-900">Recent papers</h3>
              <Link
                href="/lecturer/exams"
                className="text-[13px] text-blue-700 font-medium hover:underline"
              >
                View all
              </Link>
            </div>

            {exams.loading ? (
              <p className="text-sm text-gray-500">Loading papers…</p>
            ) : recentExams.length === 0 ? (
              <div className="py-8 text-center">
                <ClipboardList className="mx-auto text-gray-300" size={28} />
                <p className="mt-2 text-sm text-gray-500">No papers yet.</p>
                <p className="text-[12px] text-gray-400">
                  Create one and it goes live immediately.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentExams.map((exam) => {
                  const effectiveCode = revealedCodes[exam.id] || exam.accessCode;
                  const isMasked = maskedCodes[exam.id] ?? false;

                  return (
                    <div
                      key={exam.id}
                      className="p-3.5 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-xs transition-all space-y-2.5"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <Link
                          href={`/lecturer/exams/${exam.id}/preview`}
                          className="flex items-center gap-3 min-w-0 group"
                        >
                          <div className="p-2 bg-blue-100 rounded-md text-blue-700 shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FileText size={18} />
                          </div>
                          <div className="min-w-0">
                            <span className="text-[14px] font-semibold text-gray-900 block truncate group-hover:text-blue-600 transition-colors">
                              {exam.title}
                            </span>
                            <span className="text-[12px] text-gray-500 block truncate">
                              {exam.ownerLabel} • {exam.kindLabel ?? KIND_LABEL[exam.kind] ?? exam.kind} •{" "}
                              {exam.questionCount} Qs {exam.durationMin ? `• ${exam.durationMin} mins` : ""}
                            </span>
                          </div>
                        </Link>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant={exam.audience === "PUBLIC" ? "blue-solid" : "default"}>
                            {exam.audience === "PUBLIC" ? "Public" : "School"}
                          </Badge>
                          <Link href={`/lecturer/exams/${exam.id}/preview`}>
                            <Button size="sm" variant="tertiary" className="h-7 px-2 text-[12px]">
                              Preview <ArrowRight className="ml-1" size={14} />
                            </Button>
                          </Link>
                        </div>
                      </div>

                      {/* Access code & Student Participation Controls */}
                      <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2 text-[12px]">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 font-medium flex items-center gap-1">
                            <KeyRound size={13} className="text-blue-600" /> Access Code:
                          </span>
                          {effectiveCode ? (
                            <div className="flex items-center gap-1">
                              <span className="font-mono text-[12px] font-bold text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                                {isMasked ? "••••••" : effectiveCode}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setMaskedCodes((prev) => ({ ...prev, [exam.id]: !isMasked }))
                                }
                                className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer"
                                title={isMasked ? "Show code" : "Hide code"}
                              >
                                {isMasked ? <Eye size={12} /> : <EyeOff size={12} />}
                              </button>
                              <button
                                type="button"
                                onClick={async () => {
                                  await copyToClipboard(effectiveCode);
                                  toast.show("Access code copied.");
                                }}
                                className="p-1 text-gray-400 hover:text-gray-700 rounded cursor-pointer"
                                title="Copy access code"
                              >
                                <Copy size={12} />
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic">Generated on schedule</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {exam.audience === "PUBLIC" && (exam.publicSlug || exam.publicUrl) && (
                            <Button
                              size="sm"
                              variant="tertiary"
                              className="h-7 px-2 text-[11px] text-blue-600 hover:text-blue-800"
                              onClick={async () => {
                                const url = exam.publicUrl || `/exam/${exam.publicSlug || exam.id}`;
                                await copyToClipboard(url);
                                toast.show("Public exam link copied.");
                              }}
                            >
                              <Copy size={12} className="mr-1" /> Copy Link
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="secondary"
                            className="h-7 px-2.5 text-[11px] font-medium"
                            onClick={() =>
                              setSelectedExam({
                                id: exam.id,
                                title: exam.title,
                                ownerLabel: exam.ownerLabel,
                                audience: exam.audience,
                                status: exam.status,
                                durationMin: exam.durationMin,
                                passMark: exam.passMark,
                                questionCount: exam.questionCount,
                                publicSlug: exam.publicSlug,
                                publicLink: exam.publicLink,
                                publicUrl: exam.publicUrl,
                                accessCode: effectiveCode,
                                startsAt: exam.sitting?.startsAt ?? null,
                                endsAt: exam.sitting?.endsAt ?? null,
                                venue: exam.sitting?.venue ?? null,
                                requireWebcam: exam.sitting?.requireWebcam ?? false,
                              })
                            }
                          >
                            <Share2 size={12} className="mr-1 text-blue-600" />
                            Share with Candidates
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Question difficulty */}
          <Card className="h-full flex flex-col">
            <h3 className="font-semibold text-[17px] text-gray-900 mb-4">Question difficulty</h3>
            {difficulty.loading ? (
              <p className="text-sm text-gray-500">Loading…</p>
            ) : mix.total === 0 ? (
              <div className="py-8 text-center">
                <Library className="mx-auto text-gray-300" size={28} />
                <p className="mt-2 text-sm text-gray-500">Your bank is empty.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {mixRows.map((row) => (
                  <div key={row.key}>
                    <div className="flex items-center justify-between text-[12px] font-medium text-gray-700">
                      <span>{row.label}</span>
                      <span>{row.value}</span>
                    </div>
                    <div className="mt-1.5 h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${row.colour}`}
                        style={{ width: `${Math.round((row.value / maxMix) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="pt-2 border-t border-gray-100 text-[12px] text-gray-500">
                  {mix.total} question{mix.total === 1 ? "" : "s"} in total
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* Workspaces */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[17px] text-gray-900">Your courses &amp; subjects</h3>
            <Link
              href="/lecturer/questions/new"
              className="text-[13px] text-blue-700 font-medium hover:underline"
            >
              Add a subject
            </Link>
          </div>

          {courses.loading || subjects.loading ? (
            <p className="text-sm text-gray-500">Loading…</p>
          ) : courseList.length === 0 && subjectList.length === 0 ? (
            <p className="py-6 text-sm text-gray-500">
              You have no courses or subjects yet. Ask an administrator to assign you a course, or
              create a subject for a school, entrance or external exam.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {courseList.map((course) => (
                <Link
                  key={`course-${course.id}`}
                  href="/lecturer/questions"
                  className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <span className="text-[14px] font-medium text-gray-900 block">
                    {course.code}
                  </span>
                  <span className="text-[12px] text-gray-500 block truncate">{course.title}</span>
                  <span className="mt-1 inline-block text-[11px] font-medium text-blue-700">
                    Course{course.level ? ` • ${course.level}` : ""}
                  </span>
                </Link>
              ))}
              {subjectList.map((subject) => (
                <Link
                  key={`subject-${subject.id}`}
                  href="/lecturer/questions"
                  className="p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
                >
                  <span className="text-[14px] font-medium text-gray-900 block">
                    {subject.name}
                  </span>
                  <span className="text-[12px] text-gray-500 block truncate">
                    {subject.institution ?? "Custom subject"}
                    {subject.level ? ` • ${subject.level}` : ""}
                  </span>
                  <span className="mt-1 inline-block text-[11px] font-medium text-blue-700">
                    Subject • {subject.questionCount} question
                    {subject.questionCount === 1 ? "" : "s"}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      {toast.node}

      {selectedExam && (
        <CandidateParticipationModal
          exam={selectedExam}
          role="LECTURER"
          onClose={() => setSelectedExam(null)}
          onCodeUpdated={(newCode) => {
            if (selectedExam) {
              setRevealedCodes((prev) => ({ ...prev, [selectedExam.id]: newCode }));
              setSelectedExam((prev) => (prev ? { ...prev, accessCode: newCode } : null));
            }
          }}
        />
      )}
    </>
  );
}
