"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload, FileText, CheckCircle2, AlertCircle, Download, Loader2, PartyPopper, Image as ImageIcon, Sparkles,
} from "lucide-react";
import { apiClient } from "@/lib/apiClient";
import { useApi } from "@/lib/useApi";
import { ErrorBanner, errMessage, selectCls } from "@/components/admin/ui";

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

interface ImportCounts {
  imported?: number;
  approved?: number;
  sourceAnswered?: number;
  aiAnswered?: number;
  aiGenerated?: number;
  unanswered?: number;
  skipped?: number;
  imagesImported?: number;
  imagesSkipped?: number;
  provider?: string;
  model?: string;
}

interface ImportJob {
  id: string;
  status: "QUEUED" | "PROCESSING" | "COMPLETED" | "FAILED";
  fileName: string;
  counts: ImportCounts | null;
  errors: { message?: string } | null;
}

const ACCEPT =
  ".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.rtf,.jpg,.jpeg,.png,.webp";
const MAX_BYTES = 50 * 1024 * 1024;

const TEMPLATE = `What is the time complexity of searching in a balanced binary search tree?
A. O(1)
B. O(n)
C. O(log n)
D. O(n log n)
ANSWER: C

Which data structure operates on a Last In First Out (LIFO) principle?
A. Queue
B. Stack
C. Linked List
D. Tree
ANSWER: B`;

export default function BulkImport() {
  const [scope, setScope] = React.useState("");
  const [topicId, setTopicId] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const [dragOver, setDragOver] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [job, setJob] = React.useState<ImportJob | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

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

  const targetLabel = scopeType
    ? scopeType === "course"
      ? (() => {
          const course = courses.data?.find((c) => c.id === scopeId);
          return course ? `${course.code} — ${course.title}` : "course";
        })()
      : (() => {
          const subject = subjects.data?.find((s) => s.id === scopeId);
          return subject ? subject.name : "subject";
        })()
    : "your question bank";

  const pickFile = (next: File | null) => {
    setError(null);
    if (!next) return;
    const extension = `.${next.name.toLowerCase().split(".").pop() ?? ""}`;
    if (!ACCEPT.split(",").includes(extension)) {
      setError(`Unsupported file type. Use one of: ${ACCEPT}.`);
      return;
    }
    if (next.size > MAX_BYTES) {
      setError("That file is larger than 50 MB.");
      return;
    }
    setFile(next);
    setJob(null);
  };

  const downloadTemplate = () => {
    const blob = new Blob([TEMPLATE], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "questions_template.txt";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const startImport = async () => {
    setError(null);
    if (!scopeId || !scopeType) {
      setError("Choose a course or subject first.");
      return;
    }
    if (!file) {
      setError("Choose a document or photo to import.");
      return;
    }

    setSubmitting(true);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append(scopeType === "course" ? "courseId" : "subjectId", scopeId);
      if (topicId) form.append("topicId", topicId);

      const res = await apiClient<{ data: { jobId: string } }>("/lecturer/questions/import", {
        method: "POST",
        body: form,
      });
      setJob({
        id: res.data.jobId,
        status: "QUEUED",
        fileName: file.name,
        counts: null,
        errors: null,
      });
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  // Poll the job every 2 s until the worker finishes.
  const jobId = job?.id;
  const jobStatus = job?.status;
  React.useEffect(() => {
    if (!jobId || (jobStatus !== "QUEUED" && jobStatus !== "PROCESSING")) return;
    let active = true;
    const timer = setInterval(async () => {
      try {
        const res = await apiClient<{ data: ImportJob }>(`/lecturer/questions/import/${jobId}`);
        if (active) setJob(res.data);
      } catch {
        // Transient polling failure — keep the last known state and retry.
      }
    }, 2000);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [jobId, jobStatus]);

  const reset = () => {
    setFile(null);
    setJob(null);
    setError(null);
    setTopicId("");
  };

  const counts = job?.counts;

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Bulk import questions</h2>
        <p className="text-[14px] text-gray-500 mt-1">
          PDF, Word, Excel, CSV, text or a photo of the paper. AI extracts questions, answers ones without a key, and
          maps figures into the question bank.
        </p>
      </div>

      {(courses.error || subjects.error) && (
        <ErrorBanner
          error={(courses.error ?? subjects.error)!}
          onRetry={() => {
            void courses.reload();
            void subjects.reload();
          }}
        />
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {!job && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div>
              <label htmlFor="import-scope" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Import into <span className="text-red-500">*</span>
              </label>
              <select
                id="import-scope"
                className={selectCls}
                value={scope}
                onChange={(e) => {
                  setScope(e.target.value);
                  setTopicId("");
                }}
              >
                <option value="">Select a course or subject...</option>
                {!!courses.data?.length && (
                  <optgroup label="University courses">
                    {courses.data.map((course) => (
                      <option key={course.id} value={`course:${course.id}`}>
                        {course.code} — {course.title}
                      </option>
                    ))}
                  </optgroup>
                )}
                {!!subjects.data?.length && (
                  <optgroup label="My subjects (school / external)">
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
              {!subjects.data?.length && (
                <p className="text-[12px] text-gray-500 mt-1">
                  Teaching outside the university? Create a subject from the exam builder to import into it.
                </p>
              )}
            </div>

            {scopeType && (
              <div>
                <label htmlFor="import-topic" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Topic (optional)
                </label>
                <select
                  id="import-topic"
                  className={selectCls}
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                >
                  <option value="">Imported Questions</option>
                  {(topics.data ?? []).map((topic) => (
                    <option key={topic.id} value={topic.id}>
                      {topic.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <input
              ref={inputRef}
              type="file"
              accept={ACCEPT}
              className="hidden"
              onChange={(e) => {
                pickFile(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />

            <div
              role="button"
              tabIndex={0}
              aria-label="Upload file drop zone"
              onClick={() => inputRef.current?.click()}
              onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                pickFile(e.dataTransfer.files?.[0] ?? null);
              }}
              className={`flex flex-col items-center justify-center text-center rounded-xl border-2 border-dashed p-12 transition-all cursor-pointer ${
                dragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50/50 hover:border-blue-300 hover:bg-gray-50"
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center mb-4 shadow-sm">
                {file ? <FileText size={24} className="text-blue-600" /> : <Upload size={24} className="text-blue-500" />}
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-1">
                {file ? file.name : "Click to upload or drag and drop"}
              </h3>
              <p className="text-[13px] text-gray-500 max-w-sm">
                {file
                  ? `${(file.size / 1024 / 1024).toFixed(1)} MB · ready to import`
                  : "PDF, DOCX, DOC, XLSX, XLS, CSV, TXT, MD, RTF — or a JPG/PNG photo of the paper. Up to 50 MB."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button onClick={() => void startImport()} isLoading={submitting} disabled={!file || !scope}>
                Import questions
              </Button>
              {file && (
                <Button variant="secondary" onClick={reset}>
                  Clear
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <div className="p-5 space-y-4">
                <h3 className="text-[14px] font-semibold text-gray-900">How it works</h3>
                <ul className="text-[13px] text-gray-600 space-y-2 list-disc list-inside">
                  <li>Spreadsheets must have a question, options and an answer column.</li>
                  <li>PDFs and Word files are read by AI; figures in DOCX are stored as question photos.</li>
                  <li>
                    Questions without an answer key are solved by AI and marked{" "}
                    <span className="font-medium">AI suggested</span> so you can review them.
                  </li>
                  <li>A photo or screenshot of a paper is read by a vision model.</li>
                </ul>
                <Button variant="secondary" className="w-full gap-2" onClick={downloadTemplate}>
                  <Download size={15} /> Download text template
                </Button>
              </div>
            </Card>

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
              <Sparkles className="text-blue-600 shrink-0 mt-0.5" size={18} />
              <p className="text-[12px] text-blue-900 leading-relaxed">
                AI answers are advisory. Check <strong>AI suggested</strong> questions in the question bank before they
                are used in a live exam.
              </p>
            </div>
          </div>
        </div>
      )}

      {job && (
        <Card>
          <div className="p-6 space-y-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold text-gray-900">{job.fileName}</h3>
                  <p className="text-[12px] text-gray-500">
                    Importing into {targetLabel}
                    {topicId ? ` · topic selected` : ""}
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  job.status === "COMPLETED"
                    ? "success"
                    : job.status === "FAILED"
                      ? "danger"
                      : "blue-tint"
                }
              >
                {job.status.toLowerCase()}
              </Badge>
            </div>

            {(job.status === "QUEUED" || job.status === "PROCESSING") && (
              <div className="flex items-center gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <Loader2 size={18} className="animate-spin text-blue-600" />
                <div>
                  <p className="text-[13px] font-medium text-blue-900">
                    {job.status === "QUEUED" ? "Waiting for the worker..." : "Reading the document and asking AI..."}
                  </p>
                  <p className="text-[12px] text-blue-700">
                    This can take a minute for long PDFs. The page updates automatically.
                  </p>
                </div>
              </div>
            )}

            {job.status === "FAILED" && (
              <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-800">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">The import failed.</p>
                  <p>{job.errors?.message ?? "The worker could not read this document."}</p>
                  <p className="mt-1 text-[12px] text-red-700">
                    Check that Redis and the worker are running, then try again with a cleaner PDF or DOCX.
                  </p>
                </div>
              </div>
            )}

            {job.status === "COMPLETED" && (
              <>
                <div className="flex items-center gap-2 text-[14px] font-medium text-emerald-700">
                  <PartyPopper size={18} /> Import complete
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat value={counts?.imported ?? 0} label="Questions added" tone="success" />
                  <Stat value={counts?.approved ?? 0} label="Ready to use" />
                  <Stat value={counts?.aiAnswered ?? 0} label="Answered by AI" tone="blue" />
                  <Stat value={counts?.unanswered ?? 0} label="Still need a key" tone={(counts?.unanswered ?? 0) > 0 ? "warn" : undefined} />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <Stat value={counts?.sourceAnswered ?? 0} label="Keys from source" />
                  <Stat value={counts?.aiGenerated ?? 0} label="AI-generated" />
                  <Stat value={counts?.skipped ?? 0} label="Skipped" tone={(counts?.skipped ?? 0) > 0 ? "warn" : undefined} />
                  <Stat
                    value={counts?.imagesImported ?? 0}
                    label="Photos saved"
                    icon={<ImageIcon size={13} />}
                  />
                </div>

                {!!counts?.imagesSkipped && (
                  <p className="text-[12px] text-amber-700">
                    {counts.imagesSkipped} figure(s) could not be extracted. Add them with the photo upload in the
                    question editor.
                  </p>
                )}

                {(counts?.provider || counts?.model) && (
                  <p className="text-[12px] text-gray-500">
                    AI provider: {counts.provider ?? "unknown"}
                    {counts.model ? ` · ${counts.model}` : ""}
                  </p>
                )}

                {!!counts?.unanswered && (
                  <p className="text-[12px] text-gray-600">
                    {counts.unanswered} question(s) have no key yet and stay as drafts. Open them in the question bank
                    to choose the correct option.
                  </p>
                )}

                <div className="flex flex-wrap gap-3">
                  <Button onClick={reset}>Import another file</Button>
                  <Button variant="secondary" onClick={() => window.location.assign("/lecturer/questions")}>
                    View question bank
                  </Button>
                </div>
              </>
            )}

            {job.status !== "COMPLETED" && (
              <Button variant="secondary" onClick={reset}>
                Start over
              </Button>
            )}
          </div>
        </Card>
      )}

      <div className="flex items-start gap-2 text-[12px] text-gray-500">
        <CheckCircle2 size={14} className="mt-0.5 shrink-0" />
        <span>
          Imports run in a background worker. Questions are saved to the selected course or subject and can be used in
          an exam immediately.
        </span>
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  tone,
  icon,
}: {
  value: number;
  label: string;
  tone?: "success" | "blue" | "warn";
  icon?: React.ReactNode;
}) {
  const color =
    tone === "success"
      ? "text-emerald-700"
      : tone === "blue"
        ? "text-blue-700"
        : tone === "warn"
          ? "text-amber-700"
          : "text-gray-900";
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className={`text-[20px] font-bold ${color} flex items-center gap-1.5`}>
        {icon}
        {value}
      </div>
      <div className="text-[11px] text-gray-500 uppercase font-semibold tracking-wider">{label}</div>
    </div>
  );
}
