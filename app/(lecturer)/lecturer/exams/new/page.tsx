"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Trash2, School, Globe, Loader2, CheckCircle2, Copy, ExternalLink, AlertCircle, Info,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useApi } from "@/lib/useApi";
import { ErrorBanner, FormModal, Modal, errMessage, selectCls, useToast } from "@/components/admin/ui";

interface Course {
  id: string;
  code: string;
  title: string;
  level: number;
}

interface Subject {
  id: string;
  name: string;
  code: string | null;
  level: string | null;
  institution: string | null;
  category: string | null;
  questionCount: number;
}

interface Topic {
  id: string;
  name: string;
}

interface PoolRow {
  topicId: string | null;
  difficulty: string | null;
  _count: { id: number };
}

type Audience = "INSTITUTIONAL" | "PUBLIC";
type Difficulty = "" | "EASY" | "MEDIUM" | "HARD";

interface RuleForm {
  id: string;
  difficulty: Difficulty;
  topicId: string;
  count: number;
  marks: number;
}

interface SectionForm {
  id: string;
  title: string;
  minutes: number;
  weight: number;
  rules: RuleForm[];
}

interface CreatedExam {
  id: string;
  title: string;
  publicUrl: string | null;
}

const uid = () => Math.random().toString(36).slice(2, 10);

const newRule = (defaultCount = 5): RuleForm => ({ id: uid(), difficulty: "", topicId: "", count: defaultCount, marks: 1 });

const newSection = (index: number): SectionForm => ({
  id: uid(),
  title: `Section ${String.fromCharCode(65 + index)}`,
  minutes: 30,
  weight: 1,
  rules: [newRule(5)],
});

const KINDS: { value: string; label: string }[] = [
  { value: "MID_SEMESTER", label: "Mid-semester examination" },
  { value: "END_OF_SEMESTER", label: "End of semester / final examination" },
  { value: "QUIZ", label: "Continuous assessment / quiz" },
  { value: "MOCK", label: "Mock examination" },
  { value: "RESIT", label: "Resit examination" },
  { value: "SUPPLEMENTARY", label: "Supplementary examination" },
  { value: "CUSTOM", label: "Custom examination" },
];

const STEPS = ["Details", "Sections", "Rules", "Settings", "Review"];

const toIso = (local: string) => (local ? new Date(local).toISOString() : undefined);

export default function ExamBuilder() {
  const router = useRouter();
  const toast = useToast();

  const [step, setStep] = React.useState(1);
  const [audience, setAudience] = React.useState<Audience>("INSTITUTIONAL");
  const [scope, setScope] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [kind, setKind] = React.useState("MID_SEMESTER");
  const [kindLabel, setKindLabel] = React.useState("");
  const [institutionName, setInstitutionName] = React.useState("LASUSTECH");
  const [levelLabel, setLevelLabel] = React.useState("");
  const [examBoard, setExamBoard] = React.useState("University Examination Board");
  const [instructions, setInstructions] = React.useState("");
  const [sections, setSections] = React.useState<SectionForm[]>([newSection(0)]);

  const [durationMin, setDurationMin] = React.useState("60");
  const [passMark, setPassMark] = React.useState("50");
  const [shuffleQuestions, setShuffleQuestions] = React.useState(true);
  const [shuffleOptions, setShuffleOptions] = React.useState(true);
  const [showResults, setShowResults] = React.useState(true);
  const [allowRetake, setAllowRetake] = React.useState(false);
  const [maxAttempts, setMaxAttempts] = React.useState("1");
  const [customGrades, setCustomGrades] = React.useState(false);
  const [thresholds, setThresholds] = React.useState<Record<string, string>>({
    A: "70",
    B: "60",
    C: "50",
    D: "45",
    E: "40",
  });
  const [publicOpensAt, setPublicOpensAt] = React.useState("");
  const [publicClosesAt, setPublicClosesAt] = React.useState("");
  const [accessCode, setAccessCode] = React.useState("");

  const [subjectsOpen, setSubjectsOpen] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [created, setCreated] = React.useState<CreatedExam | null>(null);

  const courses = useApi<Course[]>("/lecturer/courses");
  const subjects = useApi<Subject[]>("/lecturer/subjects");

  const scopeType = scope.startsWith("course:")
    ? "course"
    : scope.startsWith("subject:")
      ? "subject"
      : null;
  const scopeId = scope.split(":")[1] ?? "";

  const topics = useApi<Topic[]>(
    scopeId && scopeType ? `/lecturer/topics?${scopeType}Id=${scopeId}` : null,
  );
  const pool = useApi<PoolRow[]>(
    scopeId && scopeType ? `/lecturer/questions/available?${scopeType}Id=${scopeId}` : null,
  );

  // School exams live in the institution timetable and must belong to a course.
  React.useEffect(() => {
    if (audience === "INSTITUTIONAL" && scope.startsWith("subject:")) setScope("");
  }, [audience, scope]);

  const selectedCourse = courses.data?.find((course) => `course:${course.id}` === scope);
  const selectedSubject = subjects.data?.find((subject) => `subject:${subject.id}` === scope);

  const availableFor = (rule: RuleForm) =>
    (pool.data ?? [])
      .filter(
        (row) =>
          (!rule.difficulty || row.difficulty === rule.difficulty) &&
          (!rule.topicId || row.topicId === rule.topicId),
      )
      .reduce((sum, row) => sum + row._count.id, 0);

  const plannedQuestions = sections.reduce(
    (sum, section) => sum + section.rules.reduce((s, rule) => s + (Number(rule.count) || 0), 0),
    0,
  );

  const updateSection = (id: string, patch: Partial<SectionForm>) =>
    setSections((prev) => prev.map((section) => (section.id === id ? { ...section, ...patch } : section)));

  const updateRule = (sectionId: string, ruleId: string, patch: Partial<RuleForm>) =>
    setSections((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? {
              ...section,
              rules: section.rules.map((rule) => (rule.id === ruleId ? { ...rule, ...patch } : rule)),
            }
          : section,
      ),
    );

  const validateStep = (current: number): string | null => {
    if (current === 1) {
      if (!scope) return audience === "PUBLIC" ? "Choose a course or subject." : "Choose a course.";
      if (!title.trim()) return "Enter an exam title.";
      return null;
    }
    if (current === 2) {
      if (!sections.length) return "Add at least one section.";
      for (const section of sections) {
        if (!section.title.trim()) return "Every section needs a title.";
        if (!section.rules.length) return `${section.title} needs at least one rule.`;
      }
      return null;
    }
    if (current === 3) {
      for (const section of sections) {
        for (const rule of section.rules) {
          if (!Number.isFinite(Number(rule.count)) || Number(rule.count) < 1) {
            return `Enter how many questions ${section.title} should draw.`;
          }
          if (!Number.isFinite(Number(rule.marks)) || Number(rule.marks) < 0.5) {
            return "Each question must be worth at least 0.5 marks.";
          }
        }
      }
      return null;
    }
    if (current === 4 && audience === "PUBLIC") {
      if (!Number(durationMin) || Number(durationMin) < 1) return "A public exam needs a duration.";
      if (publicOpensAt && publicClosesAt && new Date(publicClosesAt) <= new Date(publicOpensAt)) {
        return "The closing time must be after the opening time.";
      }
    }
    return null;
  };

  const next = () => {
    const problem = validateStep(step);
    if (problem) {
      setError(problem);
      return;
    }
    setError(null);
    setStep((s) => Math.min(STEPS.length, s + 1));
  };

  const buildGradeBands = () => {
    const ranks = ["A", "B", "C", "D", "E", "F"];
    const mins = ranks.map((rank) => (rank === "F" ? 0 : Number(thresholds[rank] ?? 0)));
    return ranks.map((rank, index) => ({
      grade: rank,
      minPercent: mins[index],
      maxPercent: index === 0 ? 100 : Math.max(mins[index], mins[index - 1] - 0.01),
    }));
  };

  const publish = async () => {
    setError(null);
    for (let s = 1; s <= 4; s += 1) {
      const problem = validateStep(s);
      if (problem) {
        setStep(s);
        setError(problem);
        return;
      }
    }

    setPublishing(true);
    try {
      const payload = {
        ...(scopeType === "course" ? { courseId: scopeId } : { subjectId: scopeId }),
        title: title.trim(),
        kind,
        kindLabel: kind === "CUSTOM" && kindLabel.trim() ? kindLabel.trim() : undefined,
        audience,
        institutionName: institutionName.trim() || undefined,
        levelLabel: levelLabel.trim() || undefined,
        examBoard: examBoard.trim() || undefined,
        instructions: instructions.trim() ? { text: instructions.trim() } : undefined,
        durationMin: durationMin ? Number(durationMin) : undefined,
        passMark: passMark === "" ? undefined : Number(passMark),
        settings: {
          shuffleQuestions,
          shuffleOptions,
          showResults,
          allowRetake,
          maxAttempts: allowRetake ? Math.max(1, Number(maxAttempts) || 1) : 1,
          ...(customGrades ? { gradeBands: buildGradeBands() } : {}),
        },
        sections: sections.map((section) => ({
          title: section.title.trim(),
          timerMode: "SHARED" as const,
          minutes: Number(section.minutes) || undefined,
          weight: Number(section.weight) || 1,
          rules: section.rules.map((rule) => ({
            mode: "BY_RULE" as const,
            ...(rule.difficulty ? { difficulty: rule.difficulty } : {}),
            ...(rule.topicId ? { topicId: rule.topicId } : {}),
            count: Number(rule.count),
            marks: Number(rule.marks),
          })),
        })),
        ...(audience === "PUBLIC"
          ? {
              publicOpensAt: toIso(publicOpensAt),
              publicClosesAt: toIso(publicClosesAt),
              accessCode: accessCode.trim() || undefined,
            }
          : {}),
      };

      const res = await apiClient<{ data: { exam: { id: string; title: string }; publicUrl: string | null } }>(
        "/lecturer/exams",
        { method: "POST", body: JSON.stringify(payload) },
      );

      const exam = res.data.exam;
      if (audience === "PUBLIC" && res.data.publicUrl) {
        setCreated({ id: exam.id, title: exam.title, publicUrl: res.data.publicUrl });
      } else {
        toast.show("Exam published. Admin can now timetable it.");
        router.push(`/lecturer/exams/${exam.id}/preview`);
      }
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setPublishing(false);
    }
  };

  const copyLink = async () => {
    if (!created?.publicUrl) return;
    try {
      await navigator.clipboard.writeText(created.publicUrl);
      toast.show("Public exam link copied.");
    } catch {
      toast.show("Could not copy the link.", "err");
    }
  };

  return (
    <>
      {toast.node}
      <div className="space-y-6 pb-20 flex flex-col h-full relative">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Create exam</h2>
          <p className="text-[14px] text-gray-500 mt-1">
            Publishing is immediate — no moderation. School exams are timetabled by admin; public exams get a
            shareable link.
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-lg p-1 overflow-x-auto">
          <div className="flex items-center min-w-max">
            {STEPS.map((label, index) => {
              const num = index + 1;
              return (
                <React.Fragment key={label}>
                  <button
                    type="button"
                    onClick={() => {
                      if (num < step) setStep(num);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${
                      step === num
                        ? "bg-blue-600 text-white"
                        : step > num
                          ? "text-blue-700 hover:bg-blue-100"
                          : "text-gray-500 hover:bg-white"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${
                        step === num
                          ? "bg-white/20"
                          : step > num
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-200"
                      }`}
                    >
                      {num}
                    </div>
                    {label}
                  </button>
                  {index < STEPS.length - 1 && <div className="w-4 h-[1px] bg-gray-300 mx-2" />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {error && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
        {(courses.error || subjects.error) && (
          <ErrorBanner
            error={(courses.error ?? subjects.error)!}
            onRetry={() => {
              void courses.reload();
              void subjects.reload();
            }}
          />
        )}

        <div className="flex flex-col lg:flex-row gap-6 items-start">
          <div className="flex-1 w-full space-y-6">
            {step === 1 && (
              <Card title="Exam details">
                <div className="space-y-5">
                  <div>
                    <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Exam type</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAudience("INSTITUTIONAL")}
                        className={`text-left rounded-lg border p-3 transition-colors ${
                          audience === "INSTITUTIONAL"
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <School size={18} className="text-blue-700" />
                        <div className="mt-2 text-[13px] font-semibold text-gray-900">Internal Exam (LASUSTECH)</div>
                        <div className="text-[12px] text-gray-500">
                          Course exam for LASUSTECH; automatically visible to admin for scheduling.
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAudience("PUBLIC")}
                        className={`text-left rounded-lg border p-3 transition-colors ${
                          audience === "PUBLIC"
                            ? "border-blue-500 bg-blue-50 ring-1 ring-blue-500"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <Globe size={18} className="text-blue-700" />
                        <div className="mt-2 text-[13px] font-semibold text-gray-900">Public / Open Exam</div>
                        <div className="text-[12px] text-gray-500">
                          Accessible by public link — Post-UTME screening, external, or certification exams.
                        </div>
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[13px] font-semibold text-gray-900">
                        {audience === "PUBLIC" ? "Course or subject" : "Course"}
                      </label>
                      <button
                        type="button"
                        onClick={() => setSubjectsOpen(true)}
                        className="text-[12px] font-medium text-blue-700 hover:text-blue-900 inline-flex items-center gap-1"
                      >
                        <Plus size={13} /> New subject
                      </button>
                    </div>
                    <select className={selectCls} value={scope} onChange={(e) => setScope(e.target.value)}>
                      <option value="">Select...</option>
                      {!!courses.data?.length && (
                        <optgroup label="LASUSTECH Courses">
                          {courses.data.map((course) => (
                            <option key={course.id} value={`course:${course.id}`}>
                              {course.code} — {course.title}
                            </option>
                          ))}
                        </optgroup>
                      )}
                      {audience === "PUBLIC" && !!subjects.data?.length && (
                        <optgroup label="Public Subjects (Post-UTME / External)">
                          {subjects.data.map((subject) => (
                            <option key={subject.id} value={`subject:${subject.id}`}>
                              {subject.name}
                              {subject.level ? ` (${subject.level})` : ""}
                              {subject.institution ? ` · ${subject.institution}` : ""}
                            </option>
                          ))}
                        </optgroup>
                      )}
                    </select>
                    <p className="text-[12px] text-gray-500 mt-1">
                      {audience === "PUBLIC"
                        ? "A public exam can be taken by any candidate without institutional enrollment."
                        : "Internal exams must use a course assigned to you."}
                    </p>
                    {selectedSubject && (
                      <p className="text-[12px] text-gray-500 mt-1">
                        {selectedSubject.institution ?? "LASUSTECH"} ·{" "}
                        {selectedSubject.questionCount} questions in the bank
                      </p>
                    )}
                    {selectedCourse && (
                      <p className="text-[12px] text-gray-500 mt-1">
                        Level {selectedCourse.level}00 ·{" "}
                        {[...(courses.data ?? [])].find((c) => c.id === selectedCourse.id)?.code}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Exam title</label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder={
                        audience === "PUBLIC"
                          ? "e.g. 2026/2027 Post-UTME General Screening Examination"
                          : "e.g. CSC 301 Mid-Semester Examination"
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Exam kind</label>
                      <select className={selectCls} value={kind} onChange={(e) => setKind(e.target.value)}>
                        {KINDS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {kind === "CUSTOM" && (
                      <div>
                        <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">
                          Custom label
                        </label>
                        <Input
                          value={kindLabel}
                          onChange={(e) => setKindLabel(e.target.value)}
                          placeholder="e.g. Continuous Assessment Test"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[13px] font-semibold text-gray-900 dark:text-gray-100 block mb-1.5">Instructions</label>
                    <textarea
                      className="w-full h-28 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-850 p-3 text-[14px] text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-2xs transition-colors"
                      value={instructions}
                      onChange={(e) => setInstructions(e.target.value)}
                      placeholder="Shown to candidates before they start."
                    />
                  </div>
                </div>
              </Card>
            )}

            {step === 2 && (
              <>
                {sections.map((section, index) => (
                  <Card key={section.id}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-semibold text-gray-500 uppercase tracking-wide">
                          Section {index + 1}
                        </span>
                        {sections.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setSections((prev) => prev.filter((s) => s.id !== section.id))}
                            className="text-gray-400 hover:text-red-600"
                            title="Remove section"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <div>
                        <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Title</label>
                        <Input
                          value={section.title}
                          onChange={(e) => updateSection(section.id, { title: e.target.value })}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">
                            Time (mins)
                          </label>
                          <Input
                            type="number"
                            min={1}
                            value={section.minutes}
                            onChange={(e) =>
                              updateSection(section.id, { minutes: Number(e.target.value) })
                            }
                          />
                        </div>
                        <div>
                          <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Weight</label>
                          <Input
                            type="number"
                            min={0.1}
                            step={0.1}
                            value={section.weight}
                            onChange={(e) => updateSection(section.id, { weight: Number(e.target.value) })}
                          />
                        </div>
                      </div>
                      <p className="text-[12px] text-gray-500">
                        {section.rules.length} rule{section.rules.length === 1 ? "" : "s"} ·{" "}
                        {section.rules.reduce((sum, rule) => sum + (Number(rule.count) || 0), 0)} questions
                      </p>
                    </div>
                  </Card>
                ))}
                <Button
                  variant="tertiary"
                  onClick={() => setSections((prev) => [...prev, newSection(prev.length)])}
                  className="text-blue-700 w-full border border-dashed border-blue-200 bg-blue-50/50 h-12"
                >
                  <Plus size={18} className="mr-2" /> Add section
                </Button>
              </>
            )}

            {step === 3 && (
              <>
                {sections.map((section) => (
                  <Card key={section.id} title={section.title}>
                    <div className="space-y-3">
                      {section.rules.map((rule) => {
                        const available = availableFor(rule);
                        const tooMany = Number(rule.count) > available;
                        return (
                          <div key={rule.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              <div className="col-span-2 sm:col-span-1">
                                <label className="text-[12px] font-medium text-gray-600 block mb-1">Difficulty</label>
                                <select
                                  className={selectCls}
                                  value={rule.difficulty}
                                  onChange={(e) =>
                                    updateRule(section.id, rule.id, {
                                      difficulty: e.target.value as Difficulty,
                                    })
                                  }
                                >
                                  <option value="">Any</option>
                                  <option value="EASY">Easy</option>
                                  <option value="MEDIUM">Medium</option>
                                  <option value="HARD">Hard</option>
                                </select>
                              </div>
                              <div className="col-span-2 sm:col-span-1">
                                <label className="text-[12px] font-medium text-gray-600 block mb-1">Topic</label>
                                <select
                                  className={selectCls}
                                  value={rule.topicId}
                                  onChange={(e) => updateRule(section.id, rule.id, { topicId: e.target.value })}
                                >
                                  <option value="">All topics</option>
                                  {(topics.data ?? []).map((topic) => (
                                    <option key={topic.id} value={topic.id}>
                                      {topic.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-[12px] font-medium text-gray-600 block mb-1">Count</label>
                                <Input
                                  type="number"
                                  min={1}
                                  value={rule.count}
                                  onChange={(e) =>
                                    updateRule(section.id, rule.id, { count: Number(e.target.value) })
                                  }
                                />
                              </div>
                              <div>
                                <label className="text-[12px] font-medium text-gray-600 block mb-1">Marks</label>
                                <Input
                                  type="number"
                                  min={0.5}
                                  step={0.5}
                                  value={rule.marks}
                                  onChange={(e) =>
                                    updateRule(section.id, rule.id, { marks: Number(e.target.value) })
                                  }
                                />
                              </div>
                            </div>
                            <div className="mt-2 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className={`text-[12px] ${tooMany ? "text-amber-700 font-medium" : "text-gray-500"}`}>
                                  {pool.loading
                                    ? "Checking the question bank..."
                                    : `${available} approved question${available === 1 ? "" : "s"} match this rule`}
                                  {tooMany ? " — not enough to materialise the paper" : ""}
                                </span>
                                {available > 0 && tooMany && (
                                  <button
                                    type="button"
                                    onClick={() => updateRule(section.id, rule.id, { count: available })}
                                    className="text-[11px] font-semibold text-blue-700 hover:underline cursor-pointer bg-blue-50 px-1.5 py-0.5 rounded"
                                  >
                                    Set count to {available}
                                  </button>
                                )}
                              </div>
                              {section.rules.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSections((prev) =>
                                      prev.map((s) =>
                                        s.id === section.id
                                          ? { ...s, rules: s.rules.filter((r) => r.id !== rule.id) }
                                          : s,
                                      ),
                                    )
                                  }
                                  className="text-gray-400 hover:text-red-600"
                                  title="Remove rule"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setSections((prev) =>
                            prev.map((s) =>
                              s.id === section.id ? { ...s, rules: [...s.rules, newRule()] } : s,
                            ),
                          )
                        }
                      >
                        <Plus size={16} className="mr-2" /> Add rule
                      </Button>
                      {topics.error && <ErrorBanner error={topics.error} onRetry={() => void topics.reload()} />}
                    </div>
                  </Card>
                ))}
                <p className="text-[12px] text-gray-500">
                  The paper is built from approved questions when you publish. If a rule matches fewer questions than
                  it asks for, publishing is rejected and nothing is created.
                </p>
              </>
            )}

            {step === 4 && (
              <Card title="Exam settings">
                <div className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">
                        Duration (mins)
                      </label>
                      <Input
                        type="number"
                        min={1}
                        max={600}
                        value={durationMin}
                        onChange={(e) => setDurationMin(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Pass mark (%)</label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={passMark}
                        onChange={(e) => setPassMark(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Attempts</label>
                      <select
                        className={selectCls}
                        value={allowRetake ? "multi" : "single"}
                        onChange={(e) => setAllowRetake(e.target.value === "multi")}
                      >
                        <option value="single">One attempt</option>
                        <option value="multi">Allow retakes</option>
                      </select>
                      {allowRetake && (
                        <Input
                          type="number"
                          min={1}
                          max={20}
                          className="mt-2"
                          value={maxAttempts}
                          onChange={(e) => setMaxAttempts(e.target.value)}
                        />
                      )}
                    </div>
                  </div>

                  <div className="divide-y divide-gray-100">
                    {[
                      {
                        label: "Shuffle questions",
                        hint: "Randomise question order for each candidate",
                        value: shuffleQuestions,
                        set: setShuffleQuestions,
                      },
                      {
                        label: "Shuffle options",
                        hint: "Randomise the order of answer options",
                        value: shuffleOptions,
                        set: setShuffleOptions,
                      },
                      {
                        label: "Show results on submit",
                        hint: "Candidates see their score and grade immediately",
                        value: showResults,
                        set: setShowResults,
                      },
                    ].map((row) => (
                      <label key={row.label} className="flex items-center justify-between gap-4 py-3 cursor-pointer">
                        <div>
                          <div className="text-[14px] font-medium text-gray-900">{row.label}</div>
                          <div className="text-[12px] text-gray-500">{row.hint}</div>
                        </div>
                        <input
                          type="checkbox"
                          checked={row.value}
                          onChange={(e) => row.set(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded"
                        />
                      </label>
                    ))}
                  </div>

                  {audience === "PUBLIC" && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-4 space-y-4">
                      <div className="flex items-start gap-2">
                        <Globe size={16} className="text-blue-700 mt-0.5 shrink-0" />
                        <p className="text-[12px] text-blue-900">
                          The exam is open from the start date until the close date. Leave both empty to keep it open
                          indefinitely.
                        </p>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Opens</label>
                          <Input
                            type="datetime-local"
                            value={publicOpensAt}
                            onChange={(e) => setPublicOpensAt(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Closes</label>
                          <Input
                            type="datetime-local"
                            value={publicClosesAt}
                            onChange={(e) => setPublicClosesAt(e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">
                          Access code (optional)
                        </label>
                        <Input
                          value={accessCode}
                          onChange={(e) => setAccessCode(e.target.value)}
                          placeholder="Leave empty for an open link"
                        />
                        <p className="text-[12px] text-gray-500 mt-1">
                          Stored as a bcrypt hash. Candidates must type it before starting.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )}

            {step === 5 && (
              <Card title="Review and publish">
                <div className="space-y-4">
                  <div className="rounded-lg bg-gray-50 border border-gray-200 p-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-gray-900 text-[16px]">{title || "Untitled exam"}</h3>
                      <Badge variant={audience === "PUBLIC" ? "blue-tint" : "gray-tint"}>
                        {audience === "PUBLIC" ? "Public exam" : "School exam"}
                      </Badge>
                    </div>
                    <p className="text-[13px] text-gray-600">
                      {selectedCourse
                        ? `${selectedCourse.code} — ${selectedCourse.title}`
                        : selectedSubject
                          ? `${selectedSubject.name}${selectedSubject.level ? ` (${selectedSubject.level})` : ""}`
                          : "No course or subject selected"}
                    </p>
                    <p className="text-[13px] text-gray-500">
                      {KINDS.find((k) => k.value === kind)?.label ?? kind}
                      {kindLabel ? ` · ${kindLabel}` : ""}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="text-[20px] font-bold text-gray-900">{plannedQuestions}</div>
                      <div className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">
                        Questions
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="text-[20px] font-bold text-gray-900">
                        {sections.reduce(
                          (sum, section) =>
                            sum + section.rules.reduce((s, rule) => s + Number(rule.marks) * Number(rule.count), 0),
                          0,
                        )}
                      </div>
                      <div className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">Marks</div>
                    </div>
                    <div className="rounded-lg border border-gray-200 p-3">
                      <div className="text-[20px] font-bold text-gray-900">{durationMin || "—"}m</div>
                      <div className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">
                        Duration
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-[13px]">
                    {sections.map((section) => (
                      <div
                        key={section.id}
                        className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2"
                      >
                        <span className="text-gray-700">{section.title}</span>
                        <span className="text-gray-500">
                          {section.rules.reduce((sum, rule) => sum + (Number(rule.count) || 0), 0)} questions ·{" "}
                          {section.minutes} mins
                        </span>
                      </div>
                    ))}
                  </div>

                  {audience === "INSTITUTIONAL" ? (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3">
                      <Info size={16} className="text-amber-600 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-amber-800">
                        Publishing makes the exam active immediately. Admin will place it on the timetable; only one
                        school sitting can run at a time.
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                      <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                      <p className="text-[12px] text-blue-800">
                        A shareable link is generated when you publish. Candidates give their name and an optional
                        email; the same email cannot take the exam twice.
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>

          <div className="w-full lg:w-[320px] shrink-0 space-y-4">
            <Card title="Live summary">
              <div className="space-y-3 mt-2 text-[14px]">
                <div className="flex justify-between">
                  <span className="text-gray-500">Sections:</span>
                  <span className="font-semibold text-gray-900">{sections.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Questions:</span>
                  <span className="font-semibold text-gray-900">{plannedQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Duration:</span>
                  <span className="font-semibold text-gray-900">{durationMin || "—"} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Audience:</span>
                  <span className="font-semibold text-gray-900">
                    {audience === "PUBLIC" ? "Anyone with the link" : "School timetable"}
                  </span>
                </div>
                {pool.loading && (
                  <div className="flex items-center gap-2 pt-2 text-[12px] text-gray-500">
                    <Loader2 size={13} className="animate-spin" /> Checking the question bank...
                  </div>
                )}
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-100 rounded-[12px] p-4 flex gap-3">
              <Info className="text-blue-600 shrink-0" size={18} />
              <p className="text-[12px] text-blue-900 leading-relaxed">
                Questions and options can carry photos. Add them from the question bank; imported DOCX figures are
                mapped automatically.
              </p>
            </div>
          </div>
        </div>

        <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:left-auto sm:right-auto bg-white border-t border-gray-200 p-4 mt-auto flex items-center justify-between z-20">
          <Button variant="secondary" onClick={() => setStep((s) => Math.max(1, s - 1))} disabled={step === 1}>
            Back
          </Button>
          <div className="flex gap-3">
            {step < STEPS.length ? (
              <Button variant="primary" onClick={next}>
                Next
              </Button>
            ) : (
              <Button variant="primary" onClick={() => void publish()} isLoading={publishing}>
                {audience === "PUBLIC" ? "Publish & create link" : "Publish exam"}
              </Button>
            )}
          </div>
        </div>
      </div>

      {subjectsOpen && (
        <FormModal
          title="New subject"
          subtitle="For open, external or entrance exams (e.g. Post-UTME) that do not belong to an internal LASUSTECH course."
          fields={[
            { key: "name", label: "Subject / Examination name", required: true, placeholder: "e.g. Post-UTME General Mathematics" },
            { key: "code", label: "Code (optional)", half: true, placeholder: "e.g. PUTME-MTH" },
            {
              key: "level",
              label: "Level / target group",
              half: true,
              placeholder: "e.g. 100 Level or General",
            },
            { key: "institution", label: "Institution / Board", placeholder: "e.g. LASUSTECH External Admissions" },
            {
              key: "category",
              label: "Category",
              type: "select",
              options: [
                { value: "ENTRANCE", label: "Entrance / Post-UTME" },
                { value: "UNIVERSITY", label: "University / Faculty" },
                { value: "PROFESSIONAL", label: "Professional certification" },
                { value: "OTHER", label: "General / Public assessment" },
              ],
            },
          ]}
          submitLabel="Create subject"
          onSubmit={async (values) => {
            const res = await apiClient<{ data: Subject }>("/lecturer/subjects", {
              method: "POST",
              body: JSON.stringify({
                name: values.name,
                code: values.code || undefined,
                level: values.level || undefined,
                institution: values.institution || undefined,
                category: values.category || "OTHER",
              }),
            });
            await subjects.reload();
            setScope(`subject:${res.data.id}`);
            setAudience("PUBLIC");
            setSubjectsOpen(false);
            toast.show("Subject created.");
          }}
          onClose={() => setSubjectsOpen(false)}
        />
      )}

      {created && (
        <Modal
          title="Exam published"
          subtitle="Share this link with candidates. It works without an account."
          onClose={() => router.push(`/lecturer/exams/${created.id}/preview`)}
          footer={
            <>
              <Button variant="secondary" onClick={() => void copyLink()}>
                <Copy size={15} className="mr-2" /> Copy link
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.open(created.publicUrl!, "_blank", "noopener")}
              >
                <ExternalLink size={15} className="mr-2" /> Open
              </Button>
              <Button onClick={() => router.push(`/lecturer/exams/${created.id}/preview`)}>
                <CheckCircle2 size={15} className="mr-2" /> Done
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[13px] text-emerald-700">
              <CheckCircle2 size={16} /> {created.title} is live.
            </div>
            <p className="break-all rounded-lg border border-gray-200 bg-gray-50 p-3 text-[13px] text-gray-700">
              {created.publicUrl}
            </p>
            <p className="text-[12px] text-gray-500">
              Candidates enter their name and an optional email. The question paper, photos and results are handled by
              the public exam page.
            </p>
          </div>
        </Modal>
      )}
    </>
  );
}
