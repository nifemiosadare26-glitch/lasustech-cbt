"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, CheckCircle2, Loader2, Plus, Trash2, Sparkles, AlertCircle,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useApi } from "@/lib/useApi";
import { ErrorBanner, errMessage, selectCls, useToast } from "@/components/admin/ui";
import { MediaUpload, type MediaRef } from "@/components/lecturer/media-upload";
import { DiagramRenderer } from "@/components/question/diagram-renderer";
import { MathText } from "@/components/question/math-text";

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

interface Topic {
  id: string;
  name: string;
}

interface OptionForm {
  key: string;
  text: string;
  correct: boolean;
  media: MediaRef | null;
}

interface LoadedQuestion {
  id: string;
  courseId: string | null;
  subjectId: string | null;
  answerFormat: "MCQ_SINGLE" | "MCQ_MULTI" | "MATCHING";
  version: {
    stem: { text?: string } | null;
    stemMedia: MediaRef | null;
    explanation: string | null;
    difficulty: string;
    marks: string;
    status: string;
    answerSource: string;
    topic: { id: string; name: string } | null;
    options: {
      id: string;
      position: number;
      body: { text?: string } | null;
      mediaId: string | null;
      media: MediaRef | null;
      isCorrect: boolean;
    }[];
  };
}

const uid = () => Math.random().toString(36).slice(2, 10);

const blankOption = (): OptionForm => ({ key: uid(), text: "", correct: false, media: null });

export default function QuestionEditor() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const isNew = !id || id === "new";
  const router = useRouter();
  const toast = useToast();

  const { data: existing, error: loadError, loading } = useApi<LoadedQuestion>(
    isNew ? null : `/lecturer/questions/${id}`,
  );
  const courses = useApi<Course[]>("/lecturer/courses");
  const subjects = useApi<Subject[]>("/lecturer/subjects");

  const [scope, setScope] = React.useState("");
  const [topicId, setTopicId] = React.useState("");
  const [stemText, setStemText] = React.useState("");
  const [stemMedia, setStemMedia] = React.useState<MediaRef | null>(null);
  const [answerFormat, setAnswerFormat] = React.useState<"MCQ_SINGLE" | "MCQ_MULTI">("MCQ_SINGLE");
  const [difficulty, setDifficulty] = React.useState("MEDIUM");
  const [marks, setMarks] = React.useState("1");
  const [explanation, setExplanation] = React.useState("");
  const [options, setOptions] = React.useState<OptionForm[]>([blankOption(), blankOption()]);
  const [error, setError] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState<"draft" | "save" | null>(null);
  const [hydrated, setHydrated] = React.useState(false);

  // Populate from the API once.
  React.useEffect(() => {
    if (!existing) return;
    setScope(
      existing.courseId ? `course:${existing.courseId}` : existing.subjectId ? `subject:${existing.subjectId}` : "",
    );
    setTopicId(existing.version.topic?.id ?? "");
    setStemText(existing.version.stem?.text ?? "");
    setStemMedia(existing.version.stemMedia ?? null);
    setAnswerFormat(existing.answerFormat === "MCQ_MULTI" ? "MCQ_MULTI" : "MCQ_SINGLE");
    setDifficulty(existing.version.difficulty ?? "MEDIUM");
    setMarks(String(existing.version.marks ?? "1"));
    setExplanation(existing.version.explanation ?? "");
    setOptions(
      existing.version.options.length
        ? existing.version.options.map((option) => ({
            key: uid(),
            text: option.body?.text ?? "",
            correct: option.isCorrect,
            media: option.media ?? null,
          }))
        : [blankOption(), blankOption()],
    );
    setHydrated(true);
  }, [existing]);

  // Default the scope for a new question.
  React.useEffect(() => {
    if (!isNew || hydrated) return;
    if (!scope && courses.data?.length) setScope(`course:${courses.data[0].id}`);
  }, [isNew, hydrated, scope, courses.data]);

  const scopeType = scope.startsWith("course:")
    ? "course"
    : scope.startsWith("subject:")
      ? "subject"
      : null;
  const scopeId = scope.split(":")[1] ?? "";
  const topics = useApi<Topic[]>(
    scopeId && scopeType ? `/lecturer/topics?${scopeType}Id=${scopeId}` : null,
  );

  React.useEffect(() => {
    // Drop a topic that belongs to a different course/subject.
    if (!topicId) return;
    if (topics.data && !topics.data.some((topic) => topic.id === topicId)) setTopicId("");
  }, [topics.data, topicId]);

  const setCorrect = (key: string) => {
    setOptions((prev) =>
      prev.map((option) => {
        if (answerFormat === "MCQ_SINGLE") return { ...option, correct: option.key === key };
        return option.key === key ? { ...option, correct: !option.correct } : option;
      }),
    );
  };

  const addOption = () => {
    if (options.length >= 10) return;
    setOptions((prev) => [...prev, blankOption()]);
  };

  const removeOption = (key: string) => {
    if (options.length <= 2) return;
    setOptions((prev) => prev.filter((option) => option.key !== key));
  };

  const save = async (status: "DRAFT" | "APPROVED") => {
    setError(null);
    if (!scopeId || !scopeType) {
      setError("Choose a course or subject.");
      return;
    }
    if (!stemText.trim() && !stemMedia) {
      setError("Enter the question text or add a photo.");
      return;
    }
    const usable = options.filter((option) => option.text.trim() || option.media);
    if (usable.length < 2) {
      setError("Add at least two answer options (text or photo).");
      return;
    }
    const correctCount = usable.filter((option) => option.correct).length;
    if (answerFormat === "MCQ_SINGLE" && correctCount !== 1) {
      setError("Single-choice questions need exactly one correct answer.");
      return;
    }
    if (answerFormat === "MCQ_MULTI" && correctCount < 1) {
      setError("Select at least one correct answer.");
      return;
    }

    setSaving(status === "DRAFT" ? "draft" : "save");
    try {
      const payload = {
        ...(scopeType === "course" ? { courseId: scopeId } : { subjectId: scopeId }),
        topicId: topicId || undefined,
        answerFormat,
        difficulty,
        marks: Number(marks) || 1,
        stem: { text: stemText.trim() },
        stemMediaId: stemMedia?.id ?? null,
        explanation: explanation.trim() || undefined,
        hasMath: false,
        options: usable.map((option, index) => ({
          position: index,
          body: { text: option.text.trim() },
          isCorrect: option.correct,
          mediaId: option.media?.id ?? null,
        })),
        status,
      };

      if (isNew) {
        await apiClient("/lecturer/questions", { method: "POST", body: JSON.stringify(payload) });
      } else {
        await apiClient(`/lecturer/questions/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
      }

      toast.show(status === "DRAFT" ? "Saved as draft." : "Question saved.");
      router.push("/lecturer/questions");
    } catch (e) {
      setError(errMessage(e));
      setSaving(null);
    }
  };

  if (!isNew && loading && !existing) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-500">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading question...
      </div>
    );
  }

  if (!isNew && loadError) {
    return (
      <div className="space-y-4">
        <ErrorBanner error={loadError} />
        <Button variant="secondary" onClick={() => router.push("/lecturer/questions")}>
          <ArrowLeft size={16} className="mr-2" /> Back to question bank
        </Button>
      </div>
    );
  }

  const sourceLabel = existing?.version.answerSource;

  return (
    <>
      {toast.node}
      <div className="space-y-6 pb-24 flex flex-col h-full max-w-4xl mx-auto relative">
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="px-2 h-9" onClick={() => router.push("/lecturer/questions")}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight flex flex-wrap items-center gap-3">
              {isNew ? "Create question" : "Edit question"}
              {!isNew && existing && (
                <Badge variant={existing.version.status === "APPROVED" ? "success" : "gray-tint"}>
                  {existing.version.status.toLowerCase()}
                </Badge>
              )}
              {sourceLabel && sourceLabel !== "LECTURER" && sourceLabel !== "SOURCE" && (
                <span className="text-[12px] font-normal text-gray-500 inline-flex items-center gap-1">
                  <Sparkles size={13} />
                  {sourceLabel === "AI_SUGGESTED" ? "AI-suggested answer" : "AI-generated"}
                </span>
              )}
            </h2>
            <p className="text-[13px] text-gray-500 mt-0.5">
              Saving an edit to an approved question creates a new version.
            </p>
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card title="Question">
              <div className="space-y-4">
                <textarea
                  className="w-full h-32 resize-none rounded-md border border-gray-300 p-3 text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type the question here..."
                  value={stemText}
                  onChange={(e) => setStemText(e.target.value)}
                />
                {(/<svg[\s\S]*?<\/svg>/i.test(stemText) || /\$|\\\(|\\\[/.test(stemText)) && (
                  <div className="rounded-lg border border-blue-100 bg-blue-50/30 p-3">
                    <p className="text-[12px] font-semibold text-blue-900 mb-2">Math & Diagram Live Preview:</p>
                    <DiagramRenderer text={stemText} />
                  </div>
                )}
                <MediaUpload
                  value={stemMedia}
                  onChange={setStemMedia}
                  label="Add a photo to the question"
                  hint="Shown with the question text · PNG, JPEG, WebP or GIF · up to 10 MB"
                />
              </div>
            </Card>

            <Card title="Answer options">
              <p className="text-[13px] text-gray-500 mb-4">
                {answerFormat === "MCQ_SINGLE"
                  ? "Select the radio button next to the correct answer."
                  : "Tick every correct answer."}{" "}
                Each option can have its own photo.
              </p>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div
                    key={option.key}
                    className={`rounded-lg border p-3 transition-colors ${
                      option.correct ? "border-emerald-300 bg-emerald-50/60" : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type={answerFormat === "MCQ_SINGLE" ? "radio" : "checkbox"}
                        name="correct_answer"
                        checked={option.correct}
                        onChange={() => setCorrect(option.key)}
                        className="w-4 h-4 mt-2.5 text-blue-600 border-gray-300 focus:ring-blue-500 cursor-pointer"
                      />
                      <div className="font-semibold text-gray-700 w-6 text-center mt-1.5">
                        {String.fromCharCode(65 + index)}.
                      </div>
                      <div className="flex-1 min-w-0 space-y-2">
                        <Input
                          value={option.text}
                          placeholder={`Option ${String.fromCharCode(65 + index)}`}
                          onChange={(e) =>
                            setOptions((prev) =>
                              prev.map((item) =>
                                item.key === option.key ? { ...item, text: e.target.value } : item,
                              ),
                            )
                          }
                        />
                        {Boolean(option.text && (/\$|\\\(|\\\[/.test(option.text) || /<svg/i.test(option.text))) && (
                          <div className="text-[13px] text-gray-800 bg-gray-50 border border-gray-200 rounded px-2.5 py-1 flex items-center gap-2">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Preview:</span>
                            <MathText text={option.text} />
                          </div>
                        )}
                        <MediaUpload
                          value={option.media}
                          onChange={(media) =>
                            setOptions((prev) =>
                              prev.map((item) => (item.key === option.key ? { ...item, media } : item)),
                            )
                          }
                          label="Add option photo"
                          compact
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(option.key)}
                        disabled={options.length <= 2}
                        className="mt-2 text-gray-400 hover:text-red-600 disabled:opacity-30 disabled:hover:text-gray-400"
                        title={options.length <= 2 ? "A question needs at least two options" : "Remove option"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="tertiary"
                className="mt-4 text-blue-700 w-full border border-dashed border-blue-200 cursor-pointer"
                onClick={addOption}
                disabled={options.length >= 10}
              >
                <Plus size={16} className="mr-2" /> Add option
              </Button>
            </Card>

            <Card title="Explanation (optional)">
              <textarea
                className="w-full h-24 resize-none rounded-md border border-gray-300 p-3 text-[14px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Shown with the answer after the exam, or used for AI-suggested answers."
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
              />
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Settings">
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Course / subject</label>
                  <select
                    className={selectCls}
                    value={scope}
                    onChange={(e) => {
                      setScope(e.target.value);
                      setTopicId("");
                    }}
                  >
                    <option value="">Select...</option>
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
                  {!subjects.data?.length && (
                    <p className="text-[12px] text-gray-500 mt-1">
                      Need a school/external subject? Create one from the exam builder.
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Topic</label>
                  <select
                    className={selectCls}
                    value={topicId}
                    onChange={(e) => setTopicId(e.target.value)}
                  >
                    <option value="">General</option>
                    {(topics.data ?? []).map((topic) => (
                      <option key={topic.id} value={topic.id}>
                        {topic.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Answer format</label>
                  <select
                    className={selectCls}
                    value={answerFormat}
                    onChange={(e) => {
                      const next = e.target.value as "MCQ_SINGLE" | "MCQ_MULTI";
                      setAnswerFormat(next);
                      if (next === "MCQ_SINGLE") {
                        setOptions((prev) => {
                          const firstCorrect = prev.findIndex((option) => option.correct);
                          return prev.map((option, index) => ({
                            ...option,
                            correct: firstCorrect === -1 ? index === 0 : index === firstCorrect,
                          }));
                        });
                      }
                    }}
                  >
                    <option value="MCQ_SINGLE">Single answer</option>
                    <option value="MCQ_MULTI">Multiple answers</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Marks</label>
                    <Input
                      type="number"
                      min={0.5}
                      step={0.5}
                      value={marks}
                      onChange={(e) => setMarks(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Difficulty</label>
                    <select
                      className={selectCls}
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Status">
              <div className="space-y-2 text-[13px] text-gray-600">
                <div className="flex justify-between">
                  <span>Current status</span>
                  <Badge variant={isNew ? "gray-solid" : existing?.version.status === "APPROVED" ? "success" : "gray-tint"}>
                    {isNew ? "Unsaved" : (existing?.version.status ?? "—").toLowerCase()}
                  </Badge>
                </div>
                <p className="text-[12px] text-gray-500">
                  Approved questions are usable in exams immediately. Drafts stay out of the paper builder.
                </p>
              </div>
            </Card>
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto bg-white border-t border-gray-200 shadow-float p-4 flex items-center justify-between z-50 sm:rounded-t-none">
          <Button
            variant="secondary"
            className="text-danger hover:bg-danger-tint/10 border-transparent"
            onClick={() => router.push("/lecturer/questions")}
          >
            Discard
          </Button>
          <div className="flex gap-3 items-center">
            <Button
              variant="secondary"
              className="cursor-pointer"
              onClick={() => void save("DRAFT")}
              isLoading={saving === "draft"}
              disabled={!!saving}
            >
              Save as draft
            </Button>
            <Button
              className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => void save("APPROVED")}
              isLoading={saving === "save"}
              disabled={!!saving}
            >
              <CheckCircle2 size={16} className="mr-2" /> Save question
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
