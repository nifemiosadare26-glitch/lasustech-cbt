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
  Camera,
  Video,
  VideoOff,
  ShieldAlert,
  Maximize2,
  Minimize2,
  RotateCcw,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaSrc } from "@/lib/apiClient";
import { getRealtimeSocket } from "@/lib/realtime";
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
import { isFullscreen as getIsFullscreen, requestFullscreen, exitFullscreen, onFullscreenChange } from "@/lib/browser";

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

const CALC_BUTTONS = [
  ["sin", "cos", "tan", "(", ")"],
  ["log", "ln", "√", "^", "AC"],
  ["7", "8", "9", "÷", "DEL"],
  ["4", "5", "6", "×", "π"],
  ["1", "2", "3", "-", "e"],
  ["0", ".", "=", "+", "±"],
];

export default function PublicExamAttempt() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const router = useRouter();

  const [attempt, setAttempt] = React.useState<PublicAttempt | null>(null);
  const [session, setSession] = React.useState<{ attemptId: string; token: string; name?: string } | null>(null);
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

  // Camera & Live Proctor Stream State
  const [cameraActive, setCameraActive] = React.useState<boolean>(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const videoRef = React.useRef<HTMLVideoElement | null>(null);
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  // Anti-cheat tab switch monitoring state
  const [tabSwitches, setTabSwitches] = React.useState(0);
  const [tabWarningModal, setTabWarningModal] = React.useState<number | null>(null);
  const tabSwitchLimit = 3;
  const [isFullscreen, setIsFullscreen] = React.useState(false);

  // Tools state (Scientific Calculator)
  const [activeTool, setActiveTool] = React.useState<"calc" | "prot" | null>(null);
  const [calcExpr, setCalcExpr] = React.useState("");
  const [calcResult, setCalcResult] = React.useState("0");

  const chains = React.useRef(new Map<string, Promise<void>>());
  const submittingRef = React.useRef(false);

  const handleCalcEval = () => {
    if (!calcExpr) return;
    try {
      let s = calcExpr.trim();
      s = s.replace(/×/g, "*").replace(/÷/g, "/").replace(/\^/g, "**");
      s = s.replace(/π/g, `(${Math.PI})`).replace(/\be\b/g, `(${Math.E})`);

      const opens = (s.match(/\(/g) || []).length;
      const closes = (s.match(/\)/g) || []).length;
      if (opens > closes) {
        s += ")".repeat(opens - closes);
      }

      s = s.replace(/sin\(([^)]+)\)/g, "Math.sin((($1) * Math.PI) / 180)");
      s = s.replace(/cos\(([^)]+)\)/g, "Math.cos((($1) * Math.PI) / 180)");
      s = s.replace(/tan\(([^)]+)\)/g, "Math.tan((($1) * Math.PI) / 180)");
      s = s.replace(/log\(([^)]+)\)/g, "Math.log10($1)");
      s = s.replace(/ln\(([^)]+)\)/g, "Math.log($1)");
      s = s.replace(/√\(([^)]+)\)/g, "Math.sqrt($1)");
      s = s.replace(/√([0-9.]+)/g, "Math.sqrt($1)");

      const res = Function(`"use strict"; return (${s})`)();
      if (typeof res === "number" && !isNaN(res) && isFinite(res)) {
        setCalcResult(String(Math.round(res * 100000) / 100000));
      } else {
        setCalcResult("Error");
      }
    } catch {
      setCalcResult("Error");
    }
  };

  const handleCalcInput = (btn: string) => {
    if (btn === "AC") {
      setCalcExpr("");
      setCalcResult("0");
    } else if (btn === "DEL") {
      setCalcExpr((prev) => prev.slice(0, -1));
    } else if (btn === "=") {
      handleCalcEval();
    } else if (btn === "±") {
      setCalcExpr((prev) => {
        if (!prev) return "-";
        if (prev.startsWith("-")) return prev.slice(1);
        return `-${prev}`;
      });
    } else if (["sin", "cos", "tan", "log", "ln", "√"].includes(btn)) {
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
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
      setResult(res.data);
    } catch (error) {
      setNotice(publicErrorMessage(error));
      setSubmitting(false);
      submittingRef.current = false;
    }
  };

  // --- Camera Acquisition & Stream Setup ------------------------------------
  React.useEffect(() => {
    if (!attempt || !attempt.requireWebcam || result) return;

    let unmounted = false;

    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
          audio: false,
        });
        if (unmounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
        setCameraError(null);
      } catch (err: any) {
        console.warn("[Public Proctor Camera] Webcam permission denied or unavailable:", err?.message);
        setCameraError(err?.message || "Webcam access required for proctored examination");
      }
    }

    void setupCamera();

    return () => {
      unmounted = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      setCameraActive(false);
    };
  }, [attempt?.requireWebcam, result]);

  // --- Real-time Proctor WebSocket & Periodic Snapshot Frames ---------------
  React.useEffect(() => {
    if (!attempt?.sittingId || !cameraActive || !session || result) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    socket.emit("join_sitting", attempt.sittingId);

    const frameInterval = setInterval(() => {
      if (!videoRef.current || !canvasRef.current) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.videoWidth === 0 || video.videoHeight === 0) return;

      canvas.width = 160;
      canvas.height = 120;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 160, 120);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.5);

      socket.emit("camera_frame", {
        sittingId: attempt.sittingId,
        attemptId: session.attemptId,
        studentId: session.name || "Guest Candidate",
        studentName: session.name || "Guest Candidate",
        matricNo: "EXT-" + session.attemptId.slice(0, 6).toUpperCase(),
        image: dataUrl,
      });
    }, 15000);

    return () => {
      clearInterval(frameInterval);
      socket.emit("leave_sitting", attempt.sittingId);
    };
  }, [attempt?.sittingId, cameraActive, session, result]);

  // --- Anti-cheat Tab Switch Detection & Violation Reporting ----------------
  React.useEffect(() => {
    if (!attempt || !attempt.antiCheatEnabled || submitting || result || loading) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const nextCount = prev + 1;

          if (session) {
            void publicApi(`/public/attempts/${session.attemptId}/events`, {
              method: "POST",
              token: session.token,
              body: JSON.stringify({ type: "TAB_SWITCH", count: nextCount }),
            }).catch(() => {});
          }

          if (nextCount < tabSwitchLimit) {
            setTabWarningModal(nextCount);
          } else {
            setTabWarningModal(tabSwitchLimit);
            setTimeout(() => {
              void submit(true);
            }, 1800);
          }
          return nextCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [attempt?.antiCheatEnabled, submitting, result, loading, session]);

  // --- Security: Block contextmenu, copy/paste, cut, and devtools combos ----
  React.useEffect(() => {
    if (result) return;

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopyCutPaste = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleSecurityKeys = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        ((e.ctrlKey || e.metaKey) && ["u", "U", "s", "S", "p", "P"].includes(e.key)) ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && ["I", "i", "J", "j", "C", "c"].includes(e.key))
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("copy", handleCopyCutPaste);
    document.addEventListener("cut", handleCopyCutPaste);
    document.addEventListener("paste", handleCopyCutPaste);
    document.addEventListener("keydown", handleSecurityKeys);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("copy", handleCopyCutPaste);
      document.removeEventListener("cut", handleCopyCutPaste);
      document.removeEventListener("paste", handleCopyCutPaste);
      document.removeEventListener("keydown", handleSecurityKeys);
    };
  }, [result]);

  // --- Fullscreen Toggle & Multi-Vendor Listener ----------------------------
  const toggleFullscreen = () => {
    if (!getIsFullscreen()) {
      requestFullscreen();
      setIsFullscreen(true);
    } else {
      exitFullscreen();
      setIsFullscreen(false);
    }
  };

  React.useEffect(() => {
    setIsFullscreen(getIsFullscreen());
    return onFullscreenChange((fsActive) => {
      setIsFullscreen(fsActive);
    });
  }, []);

  // --- Physical Keyboard listener: Calculator + Exam Navigation -------------
  React.useEffect(() => {
    if (result) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Alt+C toggles calculator
      if (e.altKey && (e.key === "c" || e.key === "C")) {
        e.preventDefault();
        setActiveTool((prev) => (prev === "calc" ? null : "calc"));
        return;
      }

      // If calculator is active, route keyboard input to calculator
      if (activeTool === "calc") {
        if (e.key >= "0" && e.key <= "9") {
          e.preventDefault();
          handleCalcInput(e.key);
        } else if (e.key === "+" || e.key === "-" || e.key === "(" || e.key === ")" || e.key === "." || e.key === "^") {
          e.preventDefault();
          handleCalcInput(e.key);
        } else if (e.key === "*") {
          e.preventDefault();
          handleCalcInput("×");
        } else if (e.key === "/") {
          e.preventDefault();
          handleCalcInput("÷");
        } else if (e.key === "Enter" || e.key === "=") {
          e.preventDefault();
          handleCalcEval();
        } else if (e.key === "Backspace") {
          e.preventDefault();
          handleCalcInput("DEL");
        } else if (e.key === "Escape") {
          e.preventDefault();
          setActiveTool(null);
        } else if (e.key === "s" || e.key === "S") {
          e.preventDefault();
          handleCalcInput("sin");
        } else if (e.key === "c" || e.key === "C") {
          e.preventDefault();
          handleCalcInput("cos");
        } else if (e.key === "t" || e.key === "T") {
          e.preventDefault();
          handleCalcInput("tan");
        } else if (e.key === "l" || e.key === "L") {
          e.preventDefault();
          handleCalcInput("log");
        } else if (e.key === "r" || e.key === "R") {
          e.preventDefault();
          handleCalcInput("√");
        }
        return;
      }

      // When calculator is closed: navigate and answer questions
      if (!attempt || !attempt.questions.length) return;
      const q = attempt.questions[current];

      if (e.key === "ArrowLeft" || e.key === "p" || e.key === "P") {
        e.preventDefault();
        setCurrent((prev) => Math.max(0, prev - 1));
      } else if (e.key === "ArrowRight" || e.key === "n" || e.key === "N") {
        e.preventDefault();
        setCurrent((prev) => Math.min(attempt.questions.length - 1, prev + 1));
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        if (q) toggleFlag(q);
      } else if (q && q.options) {
        const optionKeys = ["a", "b", "c", "d", "e", "1", "2", "3", "4", "5"];
        const keyLower = e.key.toLowerCase();
        const keyIndex = optionKeys.indexOf(keyLower);
        if (keyIndex !== -1) {
          const targetIndex = keyIndex >= 5 ? keyIndex - 5 : keyIndex;
          if (targetIndex < q.options.length) {
            e.preventDefault();
            choose(q, q.options[targetIndex].position);
          }
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeTool, attempt, current, result, calcExpr]);

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
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="font-bold text-[15px] truncate max-w-[180px] sm:max-w-xs md:max-w-md">
              {attempt.exam.title}
            </div>

            {/* LIVE badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-red-500/20 rounded text-red-100 text-xs font-bold tracking-wider border border-red-500/30">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
              LIVE
            </div>

            {/* Live Proctor Monitored Indicator Badge */}
            {attempt.requireWebcam ? (
              <div
                className={cn(
                  "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold tracking-wide border shadow-2xs transition-colors",
                  cameraActive
                    ? "bg-emerald-500/20 text-emerald-200 border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-200 border-amber-500/40"
                )}
                title={cameraActive ? "Webcam monitored live by invigilator" : "Connecting candidate camera..."}
              >
                <span className="relative flex h-2 w-2">
                  <span className={cn("absolute inline-flex h-full w-full rounded-full opacity-75", cameraActive ? "animate-ping bg-emerald-400" : "bg-amber-400")} />
                  <span className={cn("relative inline-flex rounded-full h-2 w-2", cameraActive ? "bg-emerald-400" : "bg-amber-400")} />
                </span>
                <Camera size={13} className={cameraActive ? "text-emerald-300" : "text-amber-300"} />
                <span>{cameraActive ? "Camera Monitored (Live)" : "Activating Camera..."}</span>
              </div>
            ) : (
              <div className="hidden xl:flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800/60 text-slate-300 border border-slate-700">
                <VideoOff size={12} /> Unproctored
              </div>
            )}

            {/* Tools (Scientific Calculator & Fullscreen) */}
            <div className="flex items-center gap-2">
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
                  title="Toggle Scientific Calculator (Alt+C)"
                >
                  <Calculator size={16} />
                  <span className="hidden sm:inline">Calculator</span>
                </button>

                {activeTool === "calc" && (
                  <div className="absolute top-[48px] left-0 w-[340px] sm:w-[410px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Calculator size={16} className="text-blue-600 dark:text-blue-400" />
                        <span className="font-bold text-[13px] text-slate-800 dark:text-slate-100">Scientific Calculator</span>
                        <span className="text-[10px] text-slate-500 hidden sm:inline">(Keyboard enabled)</span>
                      </div>
                      <button
                        onClick={() => setActiveTool(null)}
                        className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    <div className="p-3.5 space-y-2.5">
                      {/* LCD Display */}
                      <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-end justify-center font-mono min-h-[64px]">
                        <span className="text-xs text-gray-500 dark:text-slate-400 h-5 truncate max-w-full">{calcExpr || "0"}</span>
                        <span className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-full">{calcResult}</span>
                      </div>

                      {/* 5-Column Button Grid */}
                      <div className="grid grid-cols-5 gap-1.5 text-xs">
                        {CALC_BUTTONS.flat().map((btn, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => handleCalcInput(btn)}
                            className={cn(
                              "h-9 rounded-lg font-bold transition-all border cursor-pointer active:scale-95 text-[12px]",
                              btn === "AC"
                                ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 hover:bg-rose-100"
                                : btn === "DEL"
                                ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900 hover:bg-amber-100"
                                : btn === "="
                                ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700 font-extrabold"
                                : ["sin", "cos", "tan", "log", "ln", "√"].includes(btn)
                                ? "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 hover:bg-blue-100"
                                : ["÷", "×", "-", "+", "^"].includes(btn)
                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900 hover:bg-indigo-100"
                                : ["(", ")", "π", "e", "±"].includes(btn)
                                ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 hover:bg-slate-200"
                                : "bg-white text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 hover:bg-gray-50 shadow-2xs"
                            )}
                          >
                            {btn}
                          </button>
                        ))}
                      </div>

                      <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-200 dark:border-slate-800">
                        Type numbers (0-9), operators (+, -, *, /), or trig (s, c, t). Enter to compute.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fullscreen Button */}
              <button
                type="button"
                onClick={toggleFullscreen}
                className="hidden sm:flex items-center gap-1.5 h-9 px-2.5 rounded-md text-[13px] font-medium bg-blue-800 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors text-white cursor-pointer"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen Mode"}
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                <span className="hidden lg:inline">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
              </button>
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
                  ? "bg-amber-100 text-amber-900"
                  : "bg-white text-blue-900"
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
                className="px-5 py-2.5 rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-gray-700 dark:text-slate-200 font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
          <div className="w-80 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 h-full overflow-hidden">
            {/* Candidate Live Proctor Camera Feed (Docked cleanly in sidebar - NEVER overlaps Submit Exam) */}
            {attempt.requireWebcam && (
              <div className="p-3 border-b border-gray-100 dark:border-slate-800 bg-slate-900 shrink-0">
                <div className="relative w-full h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-700/80 shadow-inner flex items-center justify-center">
                  {cameraActive ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-3 text-center">
                      <Camera size={26} className="text-amber-400 mb-1.5 animate-pulse" />
                      <span className="text-[11px] font-semibold text-slate-200">
                        {cameraError ? "Camera Error: " + cameraError : "Connecting Camera..."}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">Please allow webcam access</span>
                    </div>
                  )}
                  {/* Live Proctor Indicator Overlay */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] font-bold text-white border border-white/10">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                    </span>
                    <span className="tracking-wider">LIVE PROCTOR</span>
                  </div>
                  {/* Candidate Name Badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/75 backdrop-blur-xs text-[10px] text-slate-300 font-mono">
                    {session?.name || "Candidate"}
                  </div>
                  {/* Hidden snapshot canvas */}
                  <canvas ref={canvasRef} className="hidden" />
                </div>
              </div>
            )}

            <div className="p-4 border-b border-gray-100 dark:border-slate-800 shrink-0">
              <h3 className="font-bold text-sm text-gray-900 dark:text-slate-100 mb-1.5">
                Question Palette
              </h3>
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-slate-400 mb-1.5 font-medium">
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

            {/* Numbers Palette Grid (Scrollable) */}
            <div className="p-4 flex-1 overflow-y-auto min-h-0">
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
                          : "bg-gray-100 dark:bg-slate-800/80 text-gray-700 dark:text-slate-300 hover:bg-gray-200"
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
            <div className="p-3 border-t border-gray-100 dark:border-slate-800 space-y-1.5 text-xs text-gray-500 dark:text-slate-400 shrink-0">
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

            {/* Quick Submit CTA (Pinned cleanly at the bottom - NEVER overlaps webcam feed) */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
              <button
                type="button"
                onClick={() => setConfirmOpen(true)}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-sm"
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

        {/* 4. Tab Switch Warning Modal (Infractions 1, 2, and 3) */}
        {tabWarningModal !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 select-none">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border-2 border-red-500 space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/80 border border-red-300 dark:border-red-800 text-red-600 flex items-center justify-center shrink-0">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h3 className="font-bold text-base text-gray-900 dark:text-slate-100">
                    {tabWarningModal >= tabSwitchLimit
                      ? "Exam Terminated (Infraction 3 of 3)"
                      : tabWarningModal === 2
                      ? "Final Warning (Infraction 2 of 3)"
                      : "Tab Switch Warning (Infraction 1 of 3)"}
                  </h3>
                  <p className="text-xs text-red-600 dark:text-red-400 font-semibold mt-0.5">
                    Anti-Cheat Focus Violation Detected
                  </p>
                </div>
              </div>

              <div className="bg-red-50 dark:bg-red-950/40 p-4 rounded-2xl border border-red-200 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 leading-relaxed">
                {tabWarningModal >= tabSwitchLimit ? (
                  <p>
                    You have exceeded the maximum tab-switch allowance (3 infractions). Your examination has been automatically submitted for grading and your session has ended.
                  </p>
                ) : tabWarningModal === 2 ? (
                  <p>
                    <strong>FINAL WARNING:</strong> You navigated away from the exam window. On your next infraction (3 of 3), your examination will be <strong>immediately terminated and submitted</strong>.
                  </p>
                ) : (
                  <p>
                    You have navigated away from the examination window or switched browser tabs. This incident has been logged and transmitted to the invigilation team.
                  </p>
                )}
              </div>

              <div className="flex justify-end pt-1">
                {tabWarningModal < tabSwitchLimit ? (
                  <button
                    type="button"
                    onClick={() => setTabWarningModal(null)}
                    className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                  >
                    I Understand, Resume Exam
                  </button>
                ) : (
                  <div className="text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <Loader2 size={15} className="animate-spin" /> Submitting examination...
                  </div>
                )}
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
