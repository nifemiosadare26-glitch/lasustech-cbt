"use client";

import * as React from "react";
import { useState, useRef, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Download,
  ChevronLeft,
  PartyPopper,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Step = "upload" | "review" | "importing" | "success";

interface ParsedQuestion {
  line: number;
  question: string;
  options: number;
  answer: string;
  status: "ok" | "warning";
  warning?: string;
}

// ---------------------------------------------------------------------------
// Realistic sample preview rows (shown in review step)
// ---------------------------------------------------------------------------
const PREVIEW_ROWS: ParsedQuestion[] = [
  {
    line: 1,
    question: "Which data structure uses First-In, First-Out (FIFO) ordering?",
    options: 4,
    answer: "B",
    status: "ok",
  },
  {
    line: 7,
    question:
      "What is the time complexity of binary search on a sorted array of n elements?",
    options: 4,
    answer: "C",
    status: "ok",
  },
  {
    line: 13,
    question:
      "In a relational database, a foreign key is used to establish a link between two tables. True or False?",
    options: 2,
    answer: "A",
    status: "ok",
  },
  {
    line: 19,
    question:
      "Which OSI layer is responsible for end-to-end error recovery and flow control?",
    options: 4,
    answer: "D",
    status: "ok",
  },
  {
    line: 25,
    question: "What does CPU stand for?",
    options: 2,
    answer: "?",
    status: "warning",
    warning: "Only 2 options found — expected 4",
  },
  {
    line: 31,
    question:
      "Which sorting algorithm has an average time complexity of O(n log n)?",
    options: 4,
    answer: "B",
    status: "ok",
  },
  {
    line: 37,
    question:
      "In object-oriented programming, encapsulation refers to bundling data and methods within a class.",
    options: 4,
    answer: "A",
    status: "ok",
  },
  {
    line: 43,
    question: "Which protocol is used to assign IP addresses dynamically?",
    options: 4,
    answer: "C",
    status: "ok",
  },
  {
    line: 49,
    question: "What is the output of 2 ** 10 in Python?",
    options: 4,
    answer: "D",
    status: "ok",
  },
  {
    line: 55,
    question: "A linked list allows O(1) random access to elements.",
    options: 0,
    answer: "?",
    status: "warning",
    warning: "No options detected — ANSWER line missing",
  },
];

const GOOD_COUNT = PREVIEW_ROWS.filter((r) => r.status === "ok").length;
const WARN_COUNT = PREVIEW_ROWS.filter((r) => r.status === "warning").length;

// ---------------------------------------------------------------------------
// Aiken template content to download
// ---------------------------------------------------------------------------
const AIKEN_TEMPLATE = `Which data structure uses First-In, First-Out (FIFO) ordering?
A. Stack
B. Queue
C. Tree
D. Graph
ANSWER: B

What is the time complexity of binary search on a sorted array of n elements?
A. O(n)
B. O(n^2)
C. O(log n)
D. O(1)
ANSWER: C

Which OSI layer is responsible for end-to-end error recovery and flow control?
A. Network
B. Data Link
C. Session
D. Transport
ANSWER: D

Which sorting algorithm has an average time complexity of O(n log n)?
A. Bubble Sort
B. Merge Sort
C. Insertion Sort
D. Selection Sort
ANSWER: B
`;

// ---------------------------------------------------------------------------
// Course options
// ---------------------------------------------------------------------------
const COURSES = [
  { value: "", label: "— Select a course —" },
  { value: "CSC301", label: "CSC 301 – Data Structures & Algorithms" },
  { value: "CSC305", label: "CSC 305 – Operating Systems" },
  { value: "CSC307", label: "CSC 307 – Computer Networks" },
  { value: "CSC311", label: "CSC 311 – Database Management Systems" },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function BulkImport() {
  const [step, setStep] = useState<Step>("upload");
  const [course, setCourse] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── file handling ──────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    setStep("review");
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
    // reset so same file can be re-selected
    e.target.value = "";
  };

  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  // ── drag-and-drop handlers ─────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) handleFile(file);
  };

  // ── import with progress bar ───────────────────────────────────────────────

  const handleImport = () => {
    setStep("importing");
    setProgress(0);

    const DURATION = 2000; // ms
    const INTERVAL = 50; // ms
    const STEPS = DURATION / INTERVAL;
    let tick = 0;

    const timer = setInterval(() => {
      tick++;
      const next = Math.min(Math.round((tick / STEPS) * 100), 100);
      setProgress(next);
      if (next >= 100) {
        clearInterval(timer);
        // small delay so user sees 100% before success
        setTimeout(() => setStep("success"), 300);
      }
    }, INTERVAL);
  };

  // ── download template ──────────────────────────────────────────────────────

  const handleDownloadTemplate = () => {
    const blob = new Blob([AIKEN_TEMPLATE], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "aiken_template.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── reset ──────────────────────────────────────────────────────────────────

  const handleReset = () => {
    setStep("upload");
    setFileName("");
    setProgress(0);
    setCourse("");
  };

  // ── derived display label ──────────────────────────────────────────────────

  const displayName = fileName || "sample_questions.txt";

  // =========================================================================
  // RENDER
  // =========================================================================
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto">
      {/* Page Header */}
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">
          Bulk Import Questions
        </h2>
        <p className="text-[14px] text-gray-500 mt-1">
          Upload questions via Aiken (.txt) or CSV format.
        </p>
      </div>

      {/* ================================================================== */}
      {/* STEP: UPLOAD                                                        */}
      {/* ================================================================== */}
      {step === "upload" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Left — upload zone */}
          <div className="md:col-span-2 space-y-4">
            {/* Course selector */}
            <div>
              <label
                htmlFor="course-select"
                className="block text-[13px] font-medium text-gray-700 mb-1.5"
              >
                Import into course{" "}
                <span className="text-red-500 ml-0.5">*</span>
              </label>
              <select
                id="course-select"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[14px] text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {COURSES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.csv"
              className="hidden"
              onChange={handleInputChange}
            />

            {/* Drop zone */}
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload file drop zone"
              onClick={openFilePicker}
              onKeyDown={(e) => e.key === "Enter" && openFilePicker()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={[
                "flex flex-col items-center justify-center text-center",
                "rounded-xl border-2 border-dashed p-12 transition-all duration-200 cursor-pointer",
                isDragOver
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 bg-gray-50/50 hover:border-blue-300 hover:bg-gray-50",
              ].join(" ")}
            >
              <div
                className={[
                  "w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-sm transition-colors",
                  isDragOver
                    ? "bg-blue-100 border border-blue-300"
                    : "bg-white border border-gray-200",
                ].join(" ")}
              >
                <Upload
                  size={24}
                  className={isDragOver ? "text-blue-600" : "text-blue-500"}
                />
              </div>

              {isDragOver ? (
                <h3 className="text-[16px] font-semibold text-blue-700 mb-1">
                  Drop your file here
                </h3>
              ) : (
                <h3 className="text-[16px] font-semibold text-gray-900 mb-1">
                  Click to upload or drag and drop
                </h3>
              )}

              <p className="text-[13px] text-gray-500 max-w-xs mb-6">
                Supports <strong>.txt</strong> (Aiken format) and{" "}
                <strong>.csv</strong>. Maximum file size 5 MB.
              </p>

              <Button
                variant="secondary"
                onClick={(e) => {
                  e.stopPropagation();
                  openFilePicker();
                }}
              >
                Browse files
              </Button>
            </div>
          </div>

          {/* Right — format guide */}
          <div className="space-y-6">
            <Card>
              <div className="p-5 space-y-4">
                <h3 className="text-[14px] font-semibold text-gray-900">
                  Aiken Format Guide
                </h3>
                <p className="text-[13px] text-gray-600">
                  Each question is followed by lettered options and an{" "}
                  <code className="bg-gray-100 px-1 py-0.5 rounded text-[12px]">
                    ANSWER:
                  </code>{" "}
                  line.
                </p>
                <pre className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-x-auto whitespace-pre-wrap">
                  {`What is the capital of Nigeria?\nA. Lagos\nB. Abuja\nC. Kano\nD. Ibadan\nANSWER: B`}
                </pre>
                <Button
                  variant="secondary"
                  className="w-full gap-2"
                  onClick={handleDownloadTemplate}
                >
                  <Download size={15} />
                  Download Template
                </Button>
              </div>
            </Card>

            <Card>
              <div className="p-5 space-y-2">
                <h3 className="text-[14px] font-semibold text-gray-900">
                  Tips
                </h3>
                <ul className="text-[13px] text-gray-600 space-y-1.5 list-disc list-inside">
                  <li>Use uppercase letters for options (A, B, C, D)</li>
                  <li>Separate each question with a blank line</li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded text-[11px]">
                      ANSWER:
                    </code>{" "}
                    must be uppercase
                  </li>
                  <li>Save file as UTF-8 encoding</li>
                </ul>
              </div>
            </Card>
          </div>
        </div>
      )}

      {/* ================================================================== */}
      {/* STEP: REVIEW                                                        */}
      {/* ================================================================== */}
      {step === "review" && (
        <Card className="flex flex-col overflow-hidden" noPadding>
          {/* Header bar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900 leading-tight">
                  {displayName}
                </h3>
                <p className="text-[12px] text-gray-500 mt-0.5">
                  {GOOD_COUNT + WARN_COUNT} questions parsed &bull;{" "}
                  <span className="text-amber-600 font-medium">
                    {WARN_COUNT} warning{WARN_COUNT !== 1 ? "s" : ""}
                  </span>
                  {course && (
                    <>
                      {" "}
                      &bull; importing into{" "}
                      <span className="text-blue-600 font-medium">
                        {COURSES.find((c) => c.value === course)?.label ??
                          course}
                      </span>
                    </>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("upload")}>
                <ChevronLeft size={15} className="mr-1" />
                Back
              </Button>
              <Button onClick={handleImport}>
                Import {GOOD_COUNT} questions
              </Button>
            </div>
          </div>

          {/* Warning banner */}
          {WARN_COUNT > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 border-b border-amber-100 px-5 py-3">
              <AlertCircle
                size={16}
                className="text-amber-500 shrink-0 mt-0.5"
              />
              <p className="text-[13px] text-amber-800">
                <strong>{WARN_COUNT} question{WARN_COUNT !== 1 ? "s" : ""}</strong>{" "}
                had parsing issues and will be skipped. Review highlighted rows
                below.
              </p>
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-y-auto" style={{ maxHeight: 480 }}>
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 shadow-sm">
                <tr>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider w-10">
                    #
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Question Preview
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Options
                  </th>
                  <th className="px-4 py-3 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                    Answer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {PREVIEW_ROWS.map((row, idx) =>
                  row.status === "ok" ? (
                    <tr key={row.line} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-[12px] text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <CheckCircle2 size={17} className="text-green-500" />
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-900 max-w-sm">
                        <p className="truncate">{row.question}</p>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-500">
                        {row.options} options
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="blue-tint">{row.answer}</Badge>
                      </td>
                    </tr>
                  ) : (
                    <tr key={row.line} className="bg-amber-50 hover:bg-amber-100/60">
                      <td className="px-4 py-3 text-[12px] text-gray-400">
                        {idx + 1}
                      </td>
                      <td className="px-4 py-3">
                        <AlertCircle size={17} className="text-amber-500" />
                      </td>
                      <td className="px-4 py-3 text-[13px] text-gray-900 max-w-sm">
                        <p className="truncate">{row.question}</p>
                        <p className="text-[12px] text-amber-600 mt-0.5 font-medium">
                          {row.warning}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-[13px] text-amber-600 font-medium">
                        {row.options > 0 ? `${row.options} found` : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="warning">?</Badge>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ================================================================== */}
      {/* STEP: IMPORTING (progress bar)                                      */}
      {/* ================================================================== */}
      {step === "importing" && (
        <Card>
          <div className="p-10 flex flex-col items-center justify-center text-center space-y-6">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center">
              <Upload size={26} className="text-blue-600 animate-bounce" />
            </div>
            <div>
              <h3 className="text-[17px] font-semibold text-gray-900">
                Importing questions…
              </h3>
              <p className="text-[13px] text-gray-500 mt-1">
                Please wait while we process{" "}
                <strong>{GOOD_COUNT} questions</strong> from{" "}
                <strong>{displayName}</strong>.
              </p>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md space-y-2">
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[13px] text-gray-500 text-right">
                {progress}%
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* ================================================================== */}
      {/* STEP: SUCCESS                                                       */}
      {/* ================================================================== */}
      {step === "success" && (
        <Card>
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
              <PartyPopper size={30} className="text-green-600" />
            </div>
            <div>
              <h3 className="text-[20px] font-semibold text-gray-900">
                Import successful!
              </h3>
              <p className="text-[14px] text-gray-500 mt-1 max-w-sm">
                <strong>{GOOD_COUNT} questions</strong> were added to{" "}
                <strong>
                  {course
                    ? (COURSES.find((c) => c.value === course)?.label ?? course)
                    : "your question bank"}
                </strong>
                .{" "}
                {WARN_COUNT > 0 && (
                  <>
                    <span className="text-amber-600">
                      {WARN_COUNT} question{WARN_COUNT !== 1 ? "s" : ""} were
                      skipped
                    </span>{" "}
                    due to parsing errors.
                  </>
                )}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="secondary" onClick={handleReset}>
                Import another file
              </Button>
              <Button onClick={handleReset}>View question bank</Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
