"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  Flag,
  Hourglass,
  Loader2,
  Send,
  XCircle,
  Calculator,
  X,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaSrc } from "@/lib/apiClient";
import {
  clearAttemptSession,
  publicApi,
  publicErrorMessage,
  readAttemptSession,
  type PublicAttempt,
  type PublicQuestion,
} from "@/lib/publicExamClient";
import { RoleThemeProvider } from "@/components/role-theme";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DiagramRenderer } from "@/components/question/diagram-renderer";
import { MathText } from "@/components/question/math-text";

interface SubmitResult {
  submitted: boolean;
  autoSubmitted?: boolean;
  alreadySubmitted?: boolean;
  showResults?: boolean;
  rawScore?: number | null;
  maxScore?: number | null;
  percent?: number | null;
  grade?: string | null;
  gradeLabel?: string | null;
  passed?: boolean | null;
}

type SaveState = "saving" | "saved" | "error";

const isClosed = (status: string) => !["IN_PROGRESS", "PAUSED"].includes(status);

function clock(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

export default function PublicExamAttempt() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const router = useRouter();

  const [attempt, setAttempt] = React.useState<PublicAttempt | null>(null);
  const [session, setSession] = React.useState<{ attemptId: string; token: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const [answers, setAnswers] = React.useState<Record<string, number[]>>({});
  const [flagged, setFlagged] = React.useState<Record<string, boolean>>({});
  const [saveState, setSaveState] = React.useState<Record<string, SaveState>>({});
  const [current, setCurrent] = React.useState(0);
  const [remaining, setRemaining] = React.useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<SubmitResult | null>(null);
  const [notice, setNotice] = React.useState<string | null>(null);

  // Tools state (Calculator & Protractor)
  const [activeTool, setActiveTool] = React.useState<"calc" | "prot" | null>(null);
  const [calcExpr, setCalcExpr] = React.useState("");
  const [calcResult, setCalcResult] = React.useState("0");

  const chains = React.useRef(new Map<string, Promise<void>>());
  const submittingRef = React.useRef(false);

  const handleCalcInput = (btn: string) => {
    if (btn === "AC") {
      setCalcExpr("");
      setCalcResult("0");
    } else if (btn === "=") {
      try {
        let sanitized = calcExpr.replace(/×/g, "*").replace(/÷/g, "/");
        sanitized = sanitized.replace(/sin\(([^)]+)\)/g, "Math.sin(($1) * Math.PI / 180)");
        sanitized = sanitized.replace(/cos\(([^)]+)\)/g, "Math.cos(($1) * Math.PI / 180)");
        sanitized = sanitized.replace(/tan\(([^)]+)\)/g, "Math.tan(($1) * Math.PI / 180)");
        const openCount = (sanitized.match(/\(/g) || []).length;
        const closeCount = (sanitized.match(/\)/g) || []).length;
        if (openCount > closeCount) sanitized += ")".repeat(openCount - closeCount);
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict"; return (${sanitized})`)();
        setCalcResult(String(Math.round(res * 10000) / 10000));
      } catch {
        setCalcResult("Error");
      }
    } else if (["sin", "cos", "tan"].includes(btn)) {
      setCalcExpr((prev) => prev + `${btn}(`);
    } else {
      setCalcExpr((prev) => prev + btn);
    }
  };

  // --- Load the paper -------------------------------------------------------
  React.useEffect(() => {
    if (!slug) return;
    const stored = readAttemptSession(slug);
    if (!stored) {
      router.replace(`/exam/${slug}`);
      return;
    }
    setSession(stored);

    let active = true;
    publicApi<{ data: PublicAttempt }>(`/public/attempts/${stored.attemptId}`, { token: stored.token })
      .then((res) => {
        if (!active) return;
        hydrate(res.data);
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(publicErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [slug, router]);

  const hydrate = (data: PublicAttempt) => {
    setAttempt(data);
    setRemaining(data.remainingSec);

    const initialAnswers: Record<string, number[]> = {};
    const initialFlags: Record<string, boolean> = {};
    const initialSaves: Record<string, SaveState> = {};

    for (const q of data.questions) {
      const positions = q.saved?.positions ?? [];
      const isFlagged = q.saved?.flagged ?? false;
      initialAnswers[q.questionVersionId] = positions;
      initialFlags[q.questionVersionId] = isFlagged;
      if (positions.length > 0) {
        initialSaves[q.questionVersionId] = "saved";
      }
    }

    setAnswers(initialAnswers);
    setFlagged(initialFlags);
    setSaveState(initialSaves);

    if (data.result) {
      setResult({
        submitted: true,
        alreadySubmitted: true,
        showResults: true,
        rawScore: data.result.rawScore,
        maxScore: data.result.maxScore,
        percent: data.result.percent,
        grade: data.result.grade,
      });
    } else if (isClosed(data.status)) {
      setResult({ submitted: true, autoSubmitted: true });
    }
  };

  // --- Countdown timer ------------------------------------------------------
  React.useEffect(() => {
    if (remaining === null || remaining <= 0 || result) return;
    const interval = setInterval(() => {
      setRemaining((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          clearInterval(interval);
          void submit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [remaining, result]);

  // --- Heartbeat ------------------------------------------------------------
  React.useEffect(() => {
    if (!session || result) return;
    const interval = setInterval(() => {
      publicApi<{ data: { status: string; remainingSec: number } }>(
        `/public/attempts/${session.attemptId}/heartbeat`,
        { method: "POST", token: session.token },
      )
        .then((res) => {
          if (isClosed(res.data.status)) {
            void submit(true);
          } else if (typeof res.data.remainingSec === "number") {
            setRemaining((prev) => (prev === null ? res.data.remainingSec : Math.min(prev, res.data.remainingSec)));
          }
        })
        .catch(() => {});
    }, 30000);

    return () => clearInterval(interval);
  }, [session, result]);

  // --- Answer saving --------------------------------------------------------
  const enqueueSave = (questionVersionId: string, positions: number[]) => {
    if (!session) return;
    setSaveState((prev) => ({ ...prev, [questionVersionId]: "saving" }));

    const previous = chains.current.get(questionVersionId) ?? Promise.resolve();
    const next = previous
      .then(async () => {
        await publicApi(`/public/attempts/${session.attemptId}/answers`, {
          method: "POST",
          token: session.token,
          body: JSON.stringify({ questionVersionId, selectedPositions: positions }),
        });
        setSaveState((prev) => ({ ...prev, [questionVersionId]: "saved" }));
      })
      .catch((error) => {
        setSaveState((prev) => ({ ...prev, [questionVersionId]: "error" }));
        setNotice(publicErrorMessage(error));
      });

    chains.current.set(questionVersionId, next);
  };

  const choose = (q: PublicQuestion, position: number) => {
    if (result) return;
    const currentList = answers[q.questionVersionId] ?? [];
    let next: number[];

    if (q.answerFormat === "MCQ_MULTI") {
      next = currentList.includes(position)
        ? currentList.filter((p) => p !== position)
        : [...currentList, position].sort((a, b) => a - b);
    } else {
      next = [position];
    }

    setAnswers((prev) => ({ ...prev, [q.questionVersionId]: next }));
    enqueueSave(q.questionVersionId, next);
  };

  const toggleFlag = (q: PublicQuestion) => {
    if (!session || result) return;
    const nextValue = !flagged[q.questionVersionId];
    setFlagged((prev) => ({ ...prev, [q.questionVersionId]: nextValue }));
    publicApi(`/public/attempts/${session.attemptId}/flag`, {
      method: "POST",
      token: session.token,
      body: JSON.stringify({ questionVersionId: q.questionVersionId, isFlagged: nextValue }),
    }).catch(() => {});
  };

  const submit = async (auto = false) => {
    if (!session || submittingRef.current) return;
    submittingRef.current = true;
    setSubmitting(true);
    setNotice(null);

    try {
      await Promise.all(Array.from(chains.current.values()));
    } catch {}

    try {
      const res = await publicApi<{ data: SubmitResult }>(`/public/attempts/${session.attemptId}/submit`, {
        method: "POST",
        token: session.token,
        body: JSON.stringify({ autoSubmitted: auto }),
      });
      clearAttemptSession(slug);
      setResult(res.data);
    } catch (error) {
      setNotice(publicErrorMessage(error));
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">
          Loading secure CBT examination session...
        </p>
      </div>
    );
  }

  if (loadError || !attempt) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-center">
          <AlertCircle className="mx-auto text-rose-600" size={36} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Unable to Open Exam</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {loadError ?? "This examination is not available."}
          </p>
          <Link
            href={`/exam/${slug}`}
            className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Return to Exam Info
          </Link>
        </div>
      </div>
    );
  }

  if (result) {
    return <ResultView exam={attempt.exam} result={result} slug={slug} />;
  }

  const questions = attempt.questions;
  const question = questions[current];
  const answeredCount = questions.filter((q) => (answers[q.questionVersionId] ?? []).length > 0).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = questions.filter((q) => flagged[q.questionVersionId]).length;
  const isCurrentFlagged = question ? flagged[question.questionVersionId] : false;
  const currentSelected = question ? answers[question.questionVersionId] ?? [] : [];
  const currentSaveStatus = question ? saveState[question.questionVersionId] : undefined;

  return (
    <RoleThemeProvider role="student" className="h-full">
      <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 select-none">
        {/* 1. Header Bar matching internal exam layout */}
        <header className="h-[56px] bg-blue-900 dark:bg-slate-950 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm z-30 relative border-b border-blue-950/40 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <div className="font-bold text-[15px] truncate max-w-[280px] sm:max-w-md">
              {attempt.exam.title}
            </div>

            {/* LIVE badge */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-red-500/20 rounded text-red-100 text-xs font-bold tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              LIVE
            </div>

            {/* Tools (Calculator & Protractor) */}
            <div className="hidden md:flex items-center gap-2">
              <div className="relative">
                <button
                  type="button"
                  className={cn(
                    "h-9 px-3 rounded-md text-[13px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer",
                    activeTool === "calc"
                      ? "bg-blue-600 shadow-inner ring-2 ring-white/20"
                      : "bg-blue-800 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700"
                  )}
                  onClick={() => setActiveTool(activeTool === "calc" ? null : "calc")}
                >
                  <Calculator size={16} /> Calculator
                </button>

                {activeTool === "calc" && (
                  <div className="absolute top-[48px] left-0 w-[360px] sm:w-[420px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 overflow-hidden z-50">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calculator size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-[13px] text-slate-800 dark:text-slate-100">Scientific Calculator</span>
                      </div>
                      <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg">
                        <X size={16} />
                      </button>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-end justify-center font-mono min-h-[68px]">
                        <span className="text-xs text-gray-500 dark:text-slate-400 h-5 truncate max-w-full">{calcExpr || "0"}</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-full">{calcResult}</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 text-xs">
                        {["sin", "cos", "tan", "AC", "7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "-", "0", ".", "=", "+"].map((btn, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleCalcInput(btn)}
                            className={cn(
                              "h-9 rounded-lg font-bold transition-all border cursor-pointer active:scale-95",
                              btn === "AC"
                                ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 hover:bg-rose-100"
                                : btn === "="
                                ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700"
                                : ["÷", "×", "-", "+"].includes(btn)
                                ? "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 hover:bg-gray-200"
                                : "bg-white text-gray-900 border-gray-200 dark:bg-slate-800 dark:text-white dark:border-slate-700 hover:bg-gray-50 shadow-2xs"
                            )}
                          >
                            {btn}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Header: ThemeToggle, Save indicator & Timer */}
          <div className="flex items-center gap-3 sm:gap-4">
            <span className="text-[12px] font-medium text-blue-200 hidden md:inline">
              {currentSaveStatus === "saving" && (
                <span className="flex items-center gap-1.5 text-blue-200">
                  <Loader2 size={13} className="animate-spin" /> Saving...
                </span>
              )}
              {currentSaveStatus === "saved" && (
                <span className="flex items-center gap-1 text-emerald-300">
                  <CheckCircle2 size={13} /> Saved
                </span>
              )}
              {currentSaveStatus === "error" && (
                <span className="flex items-center gap-1 text-rose-300">
                  <AlertCircle size={13} /> Connection issue
                </span>
              )}
            </span>

            <ThemeToggle className="text-white hover:text-blue-200 p-1.5 rounded-lg bg-blue-800/60 dark:bg-slate-800 border border-blue-700/50 dark:border-slate-700" />

            <div
              className={cn(
                "font-mono font-bold text-[17px] sm:text-[19px] px-3.5 py-1.5 rounded-md shadow-sm leading-none flex items-center transition-colors",
                remaining !== null && remaining <= 300
                  ? "bg-rose-600 text-white animate-pulse"
                  : remaining !== null && remaining <= 600
                  ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-700"
                  : "bg-white dark:bg-slate-800 text-blue-950 dark:text-white border border-slate-200 dark:border-slate-700"
              )}
            >
              {remaining === null ? "--:--" : clock(remaining)}
            </div>
          </div>
        </header>

        {notice && (
          <div className="bg-rose-600 text-white px-4 py-2 text-xs sm:text-sm font-medium text-center z-30 shadow-md">
            {notice}
          </div>
        )}

        {/* 2. Main Work Area (Left Question Panel, Right Navigation Palette) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column: Active Question Workspace */}
          <div className="flex-1 flex flex-col justify-between overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-slate-950">
            <div className="max-w-3xl mx-auto w-full">
              {!question ? (
                <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-gray-200 dark:border-slate-800 text-center text-gray-500">
                  No active question.
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between border-b border-gray-200 dark:border-slate-800 pb-4 mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-2">
                      Question {current + 1} of {questions.length}
                      {isCurrentFlagged && <Flag size={20} className="text-amber-600 fill-amber-600" />}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className="text-xs sm:text-sm font-semibold text-gray-500 dark:text-slate-400">
                        {question.marks} mark{Number(question.marks) === 1 ? "" : "s"}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFlag(question)}
                        className={cn(
                          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors cursor-pointer",
                          isCurrentFlagged
                            ? "bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-200"
                            : "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-gray-600 dark:text-slate-300 hover:bg-gray-50"
                        )}
                      >
                        <Flag size={13} />
                        {isCurrentFlagged ? "Flagged" : "Flag"}
                      </button>
                    </div>
                  </div>

                  {/* Question Stem Text and Diagrams */}
                  <DiagramRenderer
                    text={question.stem?.text ?? ""}
                    mediaUrl={question.stemMediaUrl}
                    className="text-[16px] md:text-[18px] text-gray-900 dark:text-slate-100 mb-6 font-medium"
                  />

                  {/* Options */}
                  <div className="space-y-3.5 mb-8">
                    {question.options.map((option, idx) => {
                      const isSelected = currentSelected.includes(option.position);
                      return (
                        <label
                          key={option.id}
                          onClick={() => choose(question, option.position)}
                          className={cn(
                            "flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer select-none",
                            isSelected
                              ? "border-blue-600 bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 shadow-2xs"
                              : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:border-gray-300 dark:hover:border-slate-700 text-gray-800 dark:text-slate-200"
                          )}
                        >
                          <div
                            className={cn(
                              "w-7 h-7 rounded-full flex items-center justify-center font-bold text-[13px] shrink-0 mt-0.5 border transition-colors",
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400"
                            )}
                          >
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <div className="flex-1 text-[15px] sm:text-[16px] leading-relaxed pt-0.5">
                            <MathText text={option.body?.text ?? ""} />
                            {option.mediaUrl && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={mediaSrc(option.mediaUrl) ?? ""}
                                alt="Option illustration"
                                className="mt-2 max-h-48 rounded border border-gray-200 dark:border-slate-700 object-contain bg-white dark:bg-slate-900 p-2"
                              />
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Actions Bar */}
            <div className="max-w-3xl mx-auto w-full flex items-center justify-between border-t border-gray-200 dark:border-slate-800 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setCurrent((prev) => Math.max(0, prev - 1))}
                disabled={current === 0}
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-800 dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                Previous
              </button>

              <div className="flex items-center gap-3">
                {current < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrent((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer"
                  >
                    Next Question
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmOpen(true)}
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1.5"
                  >
                    <Send size={15} /> Submit Exam
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Question Palette Sidebar matching Student CBT */}
          <div className="w-80 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-5 border-b border-gray-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white mb-2">
                Question Palette
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-2 font-medium">
                <span>Progress</span>
                <span>{answeredCount} of {questions.length} Answered</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all"
                  style={{ width: `${questions.length ? (answeredCount / questions.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Numbers Palette Grid */}
            <div className="p-4 flex-1">
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const isAns = (answers[q.questionVersionId] ?? []).length > 0;
                  const isFlg = flagged[q.questionVersionId];
                  const isCur = idx === current;

                  return (
                    <button
                      key={q.questionVersionId}
                      type="button"
                      onClick={() => setCurrent(idx)}
                      className={cn(
                        "h-10 rounded-xl text-xs font-bold transition-all flex items-center justify-center relative cursor-pointer",
                        isCur
                          ? "ring-2 ring-blue-600 bg-blue-600 text-white shadow-sm"
                          : isAns
                          ? "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900"
                          : "bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-slate-700"
                      )}
                    >
                      {idx + 1}
                      {isFlg && (
                        <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-500" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Palette Legend */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2 text-xs text-gray-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-blue-50 dark:bg-blue-950/60 border border-blue-300 dark:border-blue-800" />
                  Answered
                </span>
                <span className="font-semibold">{answeredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-gray-100 dark:bg-slate-800 border border-gray-300 dark:border-slate-700" />
                  Unanswered
                </span>
                <span className="font-semibold">{unansweredCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded bg-amber-500" />
                  Flagged
                </span>
                <span className="font-semibold">{flaggedCount}</span>
              </div>
            </div>

            {/* Quick Submit CTA */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send size={14} /> Submit Final Script
              </button>
            </div>
          </div>
        </div>

        {/* 3. Submit Confirmation Modal */}
        {confirmOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-gray-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-600 flex items-center justify-center shrink-0">
                  <Hourglass size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-slate-100">
                    Submit Examination?
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">
                    Review your progress before final submission.
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-gray-200 dark:border-slate-700/60 space-y-2 text-xs">
                <div className="flex justify-between items-center text-gray-700 dark:text-slate-300">
                  <span>Questions Answered</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">{answeredCount} of {questions.length}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-slate-300">
                  <span>Unanswered Questions</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">{unansweredCount}</span>
                </div>
                <div className="flex justify-between items-center text-gray-700 dark:text-slate-300">
                  <span>Flagged for Review</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{flaggedCount}</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed">
                Once submitted, your answers will be recorded and you will not be able to resume this session.
              </p>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmOpen(false)}
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Return to Exam
                </button>
                <button
                  type="button"
                  onClick={() => void submit(false)}
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  Confirm Submission
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleThemeProvider>
  );
}

function ResultView({
  exam,
  result,
  slug,
}: {
  exam: PublicAttempt["exam"];
  result: SubmitResult;
  slug: string;
}) {
  const showScore = result.showResults !== false && result.percent != null;
  const passed = result.passed ?? (result.percent != null ? result.percent >= (exam.passMark ?? 50) : null);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex items-center justify-center px-4 py-12 select-none">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-3xl p-6 sm:p-9 text-center shadow-xl">
        <div
          className={cn(
            "mx-auto h-16 w-16 rounded-full flex items-center justify-center shadow-sm",
            showScore && passed === false
              ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
              : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
          )}
        >
          {showScore && passed === false ? <XCircle size={32} /> : <CheckCircle2 size={32} />}
        </div>

        <h1 className="mt-4 text-2xl font-extrabold text-gray-900 dark:text-slate-100">
          {result.autoSubmitted ? "Time Elapsed — Exam Submitted" : "Examination Submitted"}
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
          {exam.title}
          {result.alreadySubmitted ? " • (Session Concluded)" : ""}
        </p>

        {showScore ? (
          <div className="mt-6 rounded-2xl border border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/60 p-6">
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block mb-1">
              Score Obtained
            </span>
            <div className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-slate-100 leading-none tabular-nums">
              {result.rawScore != null && result.maxScore != null
                ? `${result.rawScore} / ${result.maxScore}`
                : `${result.percent}%`}
            </div>
            <div className="mt-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
              {result.percent}%
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {result.grade && (
                <span className="rounded-full bg-blue-100 dark:bg-blue-950/60 px-3 py-1 text-xs font-bold text-blue-800 dark:text-blue-300">
                  Grade {result.grade}
                </span>
              )}
              {passed != null && (
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-bold",
                    passed
                      ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                      : "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                  )}
                >
                  {passed ? "Passed" : "Not Passed"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-6 p-5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-800 dark:text-blue-200 leading-relaxed font-medium">
            Your answers have been recorded successfully. Official results are subject to administrative vetting and will be published upon release.
          </div>
        )}

        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-200 text-xs font-semibold hover:bg-gray-50 cursor-pointer"
          >
            Exit Exam
          </button>
          {exam.allowRetake && (
            <button
              type="button"
              onClick={() => router.push(`/exam/${slug}`)}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Take Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
