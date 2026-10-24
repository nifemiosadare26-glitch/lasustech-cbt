"use client";

import * as React from "react";
import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  Flag,
  Calculator,
  CheckCircle2,
  Camera,
  Video,
  VideoOff,
  X,
  AlertCircle,
  Loader2,
  Send,
  HelpCircle,
  ShieldAlert,
  Lock,
  Clock,
  Megaphone,
  RotateCcw,
  Minimize2,
  Maximize2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { apiClient, mediaSrc } from "@/lib/apiClient";
import { getRealtimeSocket } from "@/lib/realtime";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { DiagramRenderer } from "@/components/question/diagram-renderer";
import { MathText } from "@/components/question/math-text";

type QuestionOption = {
  id: string; // "A", "B", "C", "D"
  position: number;
  text: string;
  mediaUrl: string | null;
};

type QuestionItem = {
  position: number;
  questionVersionId: string;
  sectionId: string;
  text: string;
  marks: number;
  hasMath: boolean;
  stemMediaUrl: string | null;
  answerFormat: "MCQ_SINGLE" | "MCQ_MULTI";
  options: QuestionOption[];
  selectedPositions: number[];
  isFlagged: boolean;
};

type PaperPayload = {
  attemptId: string;
  sittingId: string;
  studentId?: string | null;
  matricNo?: string | null;
  studentName?: string | null;
  status: string;
  startedAt: string;
  deadlineAt: string;
  endsAt: string | null;
  antiCheatEnabled?: boolean;
  tabSwitchLimit?: number;
  autosaveSeconds?: number;
  heartbeatSeconds?: number;
  courseCode?: string;
  courseTitle?: string;
  instructions?: Record<string, any> | null;
  remainingSec: number;
  totalQuestions: number;
  questions: QuestionItem[];
};

export default function ExamAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const sittingId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [courseCode, setCourseCode] = useState<string>("");
  const [courseTitle, setCourseTitle] = useState<string>("CBT Examination");
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(1);

  // answers: key = question position (1..N), value = array of selected option positions
  const [answers, setAnswers] = useState<Record<number, number[]>>({});
  const [flags, setFlags] = useState<Set<number>>(new Set());
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "error">("saved");
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [endsAt, setEndsAt] = useState<Date | null>(null);
  const [remainingSec, setRemainingSec] = useState<number>(3600);
  const [antiCheatEnabled, setAntiCheatEnabled] = useState<boolean>(true);

  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Interactive Calculator State
  const [calcExpr, setCalcExpr] = useState<string>("");
  const [calcResult, setCalcResult] = useState<string>("0");

  // Camera & Live Proctor Stream State
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [showCamPreview, setShowCamPreview] = useState<boolean>(false);
  const [isCamCollapsed, setIsCamCollapsed] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingSaveTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());
  const [candidateMatric, setCandidateMatric] = useState<string>("");
  const [candidateName, setCandidateName] = useState<string>("");
  const [candidateStudentId, setCandidateStudentId] = useState<string>("");

  // Tab Switch Anti-Cheat State
  const [tabSwitches, setTabSwitches] = useState<number>(0);
  const [tabWarningModal, setTabWarningModal] = useState<number | null>(null);

  // Live Proctor Monitoring State
  const [isPausedByProctor, setIsPausedByProctor] = useState<boolean>(false);
  const [proctorMessage, setProctorMessage] = useState<string | null>(null);
  const [tabSwitchLimit, setTabSwitchLimit] = useState<number>(2);

  // 1. Initial Load: Start or resume attempt for this sitting
  useEffect(() => {
    if (!sittingId) return;

    let active = true;

    async function initSession() {
      try {
        setLoading(true);
        const res = await apiClient<{ data: PaperPayload }>(
          `/student/sittings/${sittingId}/start`,
          {
            method: "POST",
          }
        );

        if (!active) return;
        const paper = res.data;

        if (paper.status === "SUBMITTED" || paper.status === "AUTO_SUBMITTED") {
          router.replace(`/student/exam/${sittingId}/done`);
          return;
        }

        setAttemptId(paper.attemptId);
        if (paper.studentId) setCandidateStudentId(paper.studentId);
        if (paper.matricNo) setCandidateMatric(paper.matricNo);
        if (paper.studentName) setCandidateName(paper.studentName);
        if (paper.courseCode) setCourseCode(paper.courseCode);
        if (paper.courseTitle) setCourseTitle(paper.courseTitle);
        if (typeof paper.antiCheatEnabled === "boolean") {
          setAntiCheatEnabled(paper.antiCheatEnabled);
        }
        if (typeof paper.tabSwitchLimit === "number") {
          setTabSwitchLimit(paper.tabSwitchLimit);
        }
        if (paper.endsAt) {
          setEndsAt(new Date(paper.endsAt));
        }

        setQuestions(paper.questions);

        // Initialise answers and flags from server
        const initialAnswers: Record<number, number[]> = {};
        const initialFlags = new Set<number>();

        paper.questions.forEach((q) => {
          if (q.selectedPositions?.length) {
            initialAnswers[q.position] = q.selectedPositions;
          }
          if (q.isFlagged) {
            initialFlags.add(q.position);
          }
        });

        setAnswers(initialAnswers);
        setFlags(initialFlags);

        if (paper.deadlineAt) {
          const dl = new Date(paper.deadlineAt);
          setDeadline(dl);
          setRemainingSec(Math.max(0, Math.floor((dl.getTime() - Date.now()) / 1000)));
        } else {
          setRemainingSec(paper.remainingSec || 3600);
        }
      } catch (err: any) {
        if (!active) return;
        // If an access code is needed to unlock or sitting has not been started, redirect to official start briefing
        if (
          err?.code === "ACCESS_CODE_REQUIRED" ||
          err?.code === "INVALID_ACCESS_CODE" ||
          err?.message?.toLowerCase().includes("access code")
        ) {
          router.replace(`/student/exam/${sittingId}/start`);
          return;
        }
        setLoadError(err?.message || "Failed to load examination paper.");
      } finally {
        if (active) setLoading(false);
      }
    }

    initSession();

    return () => {
      active = false;
    };
  }, [sittingId, router]);

  // 2. Countdown Timer
  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const secLeft = Math.max(0, Math.floor((deadline.getTime() - Date.now()) / 1000));
      setRemainingSec(secLeft);

      if (secLeft <= 0) {
        clearInterval(interval);
        handleAutoSubmit();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [deadline]);

  // 3. Tab-switch Anti-cheat Monitor (configured limit auto-submits & logs out)
  useEffect(() => {
    if (!antiCheatEnabled || isSubmitting || loading) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitches((prev) => {
          const nextCount = prev + 1;

          // Report event to backend so live proctor monitoring console flags it immediately
          if (attemptId) {
            void apiClient(`/student/attempts/${attemptId}/events`, {
              method: "POST",
              body: JSON.stringify({ type: "TAB_SWITCH", count: nextCount }),
            }).catch(() => {});
          }

          if (nextCount < tabSwitchLimit) {
            setTabWarningModal(nextCount);
          } else {
            setTabWarningModal(tabSwitchLimit);
            // Limit reached automatically submits and logs the student out
            setTimeout(() => {
              handleAutoSubmitAndLogout();
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
  }, [antiCheatEnabled, isSubmitting, loading, attemptId, tabSwitchLimit]);

  // 4. Real-time Proctor Heartbeat & Monitoring Sync (every 15 seconds)
  useEffect(() => {
    if (!attemptId || isSubmitting || loading) return;

    const sendHeartbeat = async () => {
      try {
        const res = await apiClient<{
          data: {
            status: string;
            deadlineAt: string | null;
            extraMinutes: number;
            isPaused: boolean;
            message: { id: string; text: string; sentAt: string } | null;
          };
        }>(`/student/attempts/${attemptId}/heartbeat`, { method: "POST" });

        if (res?.data) {
          if (res.data.status === "PAUSED") {
            setIsPausedByProctor(true);
          } else if (res.data.status === "SUBMITTED" || res.data.status === "AUTO_SUBMITTED") {
            router.replace(`/student/exam/${sittingId}/done`);
          } else {
            setIsPausedByProctor(false);
          }

          if (res.data.deadlineAt) {
            const dl = new Date(res.data.deadlineAt);
            setDeadline(dl);
          }

          if (res.data.message?.text) {
            setProctorMessage(res.data.message.text);
          }
        }
      } catch {
        // Silent heartbeat error to avoid disturbing candidate
      }
    };

    void sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [attemptId, isSubmitting, loading, router, sittingId]);

  // Camera Acquisition & Stream Setup
  useEffect(() => {
    let mounted = true;
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 320 }, height: { ideal: 240 }, frameRate: { ideal: 15 } },
          audio: false,
        });
        if (!mounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(() => {});
        }
        setCameraActive(true);
      } catch (err: any) {
        console.warn("[Proctor Camera] Webcam permission denied or unavailable:", err?.message);
        setCameraError(err?.message || "Camera unavailable");
      }
    }

    void setupCamera();

    return () => {
      mounted = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  // Periodic Frame Capture & Stream to Invigilator Room
  useEffect(() => {
    if (!cameraActive || !sittingId || !attemptId) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    const captureInterval = setInterval(() => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) return;

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = 160;
      canvas.height = 120;
      ctx.drawImage(video, 0, 0, 160, 120);

      try {
        const frame = canvas.toDataURL("image/jpeg", 0.5);
        socket.emit("camera_frame", {
          sittingId,
          studentId: candidateStudentId || attemptId,
          attemptId,
          matricNo: candidateMatric,
          frame,
        });
      } catch {
        // Frame capture safe fail
      }
    }, 3500);

    return () => clearInterval(captureInterval);
  }, [cameraActive, sittingId, attemptId, candidateStudentId, candidateMatric]);

  // Real-Time Socket Connection & WebRTC Signaling
  useEffect(() => {
    if (!sittingId) return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    socket.emit("join_sitting", sittingId);

    // WebRTC Live Stream Request from Invigilator
    const handleLiveFeedRequest = async (data: { invigilatorSocketId: string }) => {
      if (!streamRef.current) return;
      try {
        const pc = new RTCPeerConnection({
          iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
        });
        peerConnectionsRef.current.set(data.invigilatorSocketId, pc);

        streamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, streamRef.current!);
        });

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socket.emit("webrtc_signal", {
              sittingId,
              targetSocketId: data.invigilatorSocketId,
              signal: { candidate: event.candidate },
              kind: "camera",
            });
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("webrtc_signal", {
          sittingId,
          targetSocketId: data.invigilatorSocketId,
          signal: { sdp: pc.localDescription },
          kind: "camera",
        });
      } catch (e) {
        console.warn("[WebRTC] Peer connection offer failed:", e);
      }
    };

    const handleWebRTCSignal = async (data: { senderSocketId: string; signal: any }) => {
      const pc = peerConnectionsRef.current.get(data.senderSocketId);
      if (!pc) return;
      try {
        if (data.signal?.sdp) {
          await pc.setRemoteDescription(new RTCSessionDescription(data.signal.sdp));
        } else if (data.signal?.candidate) {
          await pc.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
        }
      } catch (e) {
        console.warn("[WebRTC] Remote signal error:", e);
      }
    };

    // Instant Interventions from Invigilator
    const handleIntervene = (data: any) => {
      if (data.attemptId && attemptId && data.attemptId !== attemptId) return;

      if (data.action === "MESSAGE") {
        setProctorMessage(data.message || data.reason || "Invigilator message");
      } else if (data.action === "EXTEND") {
        if (typeof data.extraMinutes === "number") {
          setRemainingSec((prev) => prev + data.extraMinutes * 60);
          if (data.deadlineAt) setDeadline(new Date(data.deadlineAt));
          setProctorMessage(`Extra time granted: +${data.extraMinutes} minutes added to your examination timer.`);
        }
      } else if (data.action === "PAUSE") {
        setIsPausedByProctor(true);
      } else if (data.action === "RESUME") {
        setIsPausedByProctor(false);
      } else if (data.action === "END") {
        setProctorMessage("Your examination has been concluded by the invigilator. Redirecting to summary...");
        setTimeout(() => {
          router.replace(`/student/exam/${sittingId}/done?cause=invigilator_ended`);
        }, 1200);
      } else if (data.action === "RESET_SESSION") {
        setProctorMessage("Your session has been released by the invigilator. Please log in on your replacement workstation.");
        setTimeout(() => {
          router.replace("/login");
        }, 1500);
      }
    };

    const handleBroadcast = (data: any) => {
      if (data.message) {
        setProctorMessage(data.message);
      }
    };

    const handleExtendAll = (data: any) => {
      if (typeof data.minutes === "number") {
        setRemainingSec((prev) => prev + data.minutes * 60);
        setProctorMessage(`Hall announcement: All candidates have been granted +${data.minutes} extra minutes.`);
      }
    };

    socket.on("request_live_feed", handleLiveFeedRequest);
    socket.on("webrtc_signal", handleWebRTCSignal);
    socket.on("attempt.intervene", handleIntervene);
    socket.on("sitting.broadcast", handleBroadcast);
    socket.on("sitting.extend_all", handleExtendAll);

    return () => {
      socket.off("request_live_feed", handleLiveFeedRequest);
      socket.off("webrtc_signal", handleWebRTCSignal);
      socket.off("attempt.intervene", handleIntervene);
      socket.off("sitting.broadcast", handleBroadcast);
      socket.off("sitting.extend_all", handleExtendAll);
      socket.emit("leave_sitting", sittingId);
    };
  }, [sittingId, attemptId, router]);

  // Global window live condition: an exam is only live while now <= sitting.endsAt and remainingSec > 0
  const isWindowLive = useMemo(() => {
    if (remainingSec <= 0) return false;
    if (!endsAt) return true;
    return Date.now() <= endsAt.getTime();
  }, [remainingSec, endsAt]);

  // Timer format (HH:MM:SS or MM:SS)
  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, "0");
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  // Calculator Logic
  const handleCalcInput = (btn: string) => {
    if (btn === "AC") {
      setCalcExpr("");
      setCalcResult("0");
      return;
    }
    if (btn === "DEL") {
      setCalcExpr((prev) => prev.slice(0, -1));
      return;
    }
    if (btn === "=") {
      handleCalcEval();
      return;
    }
    if (btn === "π") {
      setCalcExpr((prev) => prev + "3.14159");
      return;
    }
    if (btn === "e") {
      setCalcExpr((prev) => prev + "2.71828");
      return;
    }
    if (btn === "Ans") {
      if (calcResult && calcResult !== "Error") {
        setCalcExpr((prev) => prev + calcResult);
      }
      return;
    }
    if (btn === "±") {
      if (calcExpr.startsWith("-")) {
        setCalcExpr((prev) => prev.slice(1));
      } else {
        setCalcExpr((prev) => "-" + prev);
      }
      return;
    }
    if (btn === "%") {
      setCalcExpr((prev) => prev + "/100");
      return;
    }
    if (btn === "√") {
      try {
        const val = calcResult !== "0" && calcResult !== "Error" ? Number(calcResult) : Number(calcExpr || "0");
        const res = Math.sqrt(val);
        setCalcResult(String(Math.round(res * 100000) / 100000));
        setCalcExpr(`√(${val})`);
      } catch {
        setCalcResult("Error");
      }
      return;
    }
    if (btn === "x²") {
      try {
        const val = calcResult !== "0" && calcResult !== "Error" ? Number(calcResult) : Number(calcExpr || "0");
        const res = val * val;
        setCalcResult(String(Math.round(res * 100000) / 100000));
        setCalcExpr(`(${val})²`);
      } catch {
        setCalcResult("Error");
      }
      return;
    }
    if (btn === "log") {
      try {
        const val = calcResult !== "0" && calcResult !== "Error" ? Number(calcResult) : Number(calcExpr || "0");
        const res = Math.log10(val);
        setCalcResult(String(Math.round(res * 100000) / 100000));
        setCalcExpr(`log(${val})`);
      } catch {
        setCalcResult("Error");
      }
      return;
    }
    if (btn === "ln") {
      try {
        const val = calcResult !== "0" && calcResult !== "Error" ? Number(calcResult) : Number(calcExpr || "0");
        const res = Math.log(val);
        setCalcResult(String(Math.round(res * 100000) / 100000));
        setCalcExpr(`ln(${val})`);
      } catch {
        setCalcResult("Error");
      }
      return;
    }
    if (btn === "sin" || btn === "cos" || btn === "tan") {
      try {
        const val = calcResult !== "0" && calcResult !== "Error" ? Number(calcResult) : Number(calcExpr || "0");
        const rad = (val * Math.PI) / 180;
        let res = 0;
        if (btn === "sin") res = Math.sin(rad);
        if (btn === "cos") res = Math.cos(rad);
        if (btn === "tan") res = Math.tan(rad);
        const formatted = String(Math.round(res * 100000) / 100000);
        setCalcResult(formatted);
        setCalcExpr(`${btn}(${val}°)`);
      } catch {
        setCalcResult("Error");
      }
      return;
    }

    setCalcExpr((prev) => prev + btn);
  };

  const handleCalcEval = () => {
    if (!calcExpr) return;
    try {
      const sanitized = calcExpr
        .replace(/×/g, "*")
        .replace(/÷/g, "/")
        .replace(/\^/g, "**");
      // Safe math evaluation
      const computed = Function(`"use strict"; return (${sanitized})`)();
      if (typeof computed === "number" && !isNaN(computed) && isFinite(computed)) {
        setCalcResult(String(Math.round(computed * 10000) / 10000));
      } else {
        setCalcResult("Error");
      }
    } catch {
      setCalcResult("Error");
    }
  };

  // Save answer to server with debounced coalescing for high concurrency
  const saveAnswerToServer = useCallback(
    (qPos: number, newSelected: number[], isFlag: boolean) => {
      if (!attemptId) return;

      const targetQ = questions[qPos - 1];
      if (!targetQ) return;

      setSaveStatus("saving");

      // Clear any pending timer for this question to avoid sending rapid multi-clicks
      const existingTimer = pendingSaveTimers.current.get(qPos);
      if (existingTimer) clearTimeout(existingTimer);

      const timer = setTimeout(async () => {
        try {
          await apiClient(`/student/attempts/${attemptId}/answer`, {
            method: "POST",
            body: JSON.stringify({
              questionVersionId: targetQ.questionVersionId,
              selectedPositions: newSelected,
              flagged: isFlag,
            }),
          });
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
        } finally {
          pendingSaveTimers.current.delete(qPos);
        }
      }, 200);

      pendingSaveTimers.current.set(qPos, timer);
    },
    [attemptId, questions]
  );

  const handleSelectOption = (pos: number) => {
    const qObj = questions[currentQuestion - 1];
    if (!qObj) return;

    let newSelected: number[];
    const current = answers[currentQuestion] || [];

    if (qObj.answerFormat === "MCQ_MULTI") {
      newSelected = current.includes(pos)
        ? current.filter((p) => p !== pos)
        : [...current, pos].sort((a, b) => a - b);
    } else {
      newSelected = [pos];
    }

    setAnswers((prev) => {
      const next = { ...prev, [currentQuestion]: newSelected };
      try {
        if (attemptId) {
          localStorage.setItem(`cbt_attempt_${attemptId}`, JSON.stringify(next));
        }
      } catch {}
      return next;
    });
    saveAnswerToServer(currentQuestion, newSelected, flags.has(currentQuestion));
  };

  const handleToggleFlag = () => {
    const isNowFlagged = !flags.has(currentQuestion);
    setFlags((prev) => {
      const next = new Set(prev);
      if (isNowFlagged) next.add(currentQuestion);
      else next.delete(currentQuestion);
      return next;
    });

    const currentSelected = answers[currentQuestion] || [];
    saveAnswerToServer(currentQuestion, currentSelected, isNowFlagged);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setShowSubmitModal(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  // Submission handlers
  const handleFinalSubmit = async () => {
    if (!attemptId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient<{
        data: {
          refCode: string;
          score?: { rawScore?: number; maxScore?: number; percent?: number };
        };
      }>(
        `/student/attempts/${attemptId}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ endedReason: "STUDENT_SUBMIT" }),
        }
      );

      const refCode = res.data?.refCode || "";
      const raw = res.data?.score?.rawScore != null ? String(res.data.score.rawScore) : "";
      const max = res.data?.score?.maxScore != null ? String(res.data.score.maxScore) : "";
      const pct = res.data?.score?.percent != null ? String(res.data.score.percent) : "";
      const scoreQuery = raw && max ? `&raw=${encodeURIComponent(raw)}&max=${encodeURIComponent(max)}&pct=${encodeURIComponent(pct)}` : "";

      router.push(`/student/exam/${sittingId}/done?cause=manual&ref=${encodeURIComponent(refCode)}${scoreQuery}`);
    } catch (err: any) {
      setProctorMessage(err?.message || "Failed to submit exam. Please try again or inform your invigilator.");
      setIsSubmitting(false);
    }
  };

  const handleAutoSubmit = async () => {
    if (!attemptId || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await apiClient<{
        data: {
          refCode: string;
          score?: { rawScore?: number; maxScore?: number; percent?: number };
        };
      }>(
        `/student/attempts/${attemptId}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ endedReason: "AUTO_SUBMIT" }),
        }
      );
      const refCode = res.data?.refCode || "";
      const raw = res.data?.score?.rawScore != null ? String(res.data.score.rawScore) : "";
      const max = res.data?.score?.maxScore != null ? String(res.data.score.maxScore) : "";
      const pct = res.data?.score?.percent != null ? String(res.data.score.percent) : "";
      const scoreQuery = raw && max ? `&raw=${encodeURIComponent(raw)}&max=${encodeURIComponent(max)}&pct=${encodeURIComponent(pct)}` : "";

      router.push(`/student/exam/${sittingId}/done?cause=auto&ref=${encodeURIComponent(refCode)}${scoreQuery}`);
    } catch {
      router.push(`/student/exam/${sittingId}/done?cause=auto`);
    }
  };

  const handleAutoSubmitAndLogout = async () => {
    if (!attemptId) return;
    try {
      setIsSubmitting(true);
      await apiClient(`/student/attempts/${attemptId}/submit`, {
        method: "POST",
        body: JSON.stringify({ endedReason: "AUTO_SUBMIT" }),
      }).catch(() => {});
      // Clear authentication session
      await apiClient(`/auth/logout`, { method: "POST" }).catch(() => {});
      if (typeof window !== "undefined") {
        localStorage.removeItem("lasustech_auth_token");
        sessionStorage.clear();
      }
      router.push(`/login?reason=tab_switch_terminated`);
    } catch {
      router.push(`/login?reason=tab_switch_terminated`);
    }
  };

  // Palette metrics
  const palette = useMemo(() => {
    return questions.map((q) => {
      const num = q.position;
      const isAnswered = (answers[num] || []).length > 0;
      const isCurrent = num === currentQuestion;
      const isFlagged = flags.has(num);

      let status = "unanswered";
      if (isAnswered) status = "answered";
      if (isCurrent) status = "current";
      if (isFlagged) {
        status = isAnswered ? "flagged-answered" : "flagged";
        if (isCurrent) status += "-current";
      }
      return { num, status, isAnswered, isFlagged };
    });
  }, [questions, currentQuestion, answers, flags]);

  const answeredCount = Object.values(answers).filter((a) => a.length > 0).length;
  const unansweredCount = questions.length - answeredCount;
  const flaggedCount = flags.size;

  if (loading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={36} />
        <p className="text-sm font-semibold text-gray-600 dark:text-slate-300">Starting secure CBT examination session...</p>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-gray-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200 dark:border-slate-800 p-6 shadow-sm space-y-4 text-center">
          <AlertCircle className="mx-auto text-rose-600" size={36} />
          <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Unable to Load Examination</h2>
          <p className="text-sm text-gray-600 dark:text-slate-400">
            {loadError || "This examination has no active questions."}
          </p>
          <Link
            href="/student"
            className="inline-block px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition-colors"
          >
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const q = questions[currentQuestion - 1];
  const selectedPositions = answers[currentQuestion] || [];
  const isFlagged = flags.has(currentQuestion);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 dark:bg-slate-950 select-none">
      {/* 1. Top bar */}
      <header className="h-[56px] bg-blue-900 dark:bg-slate-950 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm z-30 relative border-b border-blue-950/40 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="font-bold text-[15px]">{courseCode} | Section A</div>

          {/* LIVE status indicator - turns off when global sitting window ends unless invigilator adds time */}
          {isWindowLive ? (
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-red-500/20 rounded text-red-100 text-xs font-bold tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              LIVE
            </div>
          ) : (
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 border border-slate-700 rounded text-slate-300 text-xs font-semibold">
              <Lock size={12} className="text-amber-400" />
              WINDOW CLOSED
            </div>
          )}

          {/* Prominent Camera Monitored Indicator */}
          <div
            className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all shadow-xs",
              cameraActive
                ? "bg-emerald-950/60 border-emerald-500/80 text-emerald-300 ring-1 ring-emerald-500/30"
                : "bg-amber-950/60 border-amber-500/80 text-amber-300 ring-1 ring-amber-500/30"
            )}
            title={cameraActive ? "Webcam and screen monitored live by invigilator" : "Connecting webcam..."}
          >
            <span className="relative flex h-2.5 w-2.5">
              {cameraActive ? (
                <>
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </>
              ) : (
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              )}
            </span>
            <Camera size={14} className={cameraActive ? "text-emerald-400" : "text-amber-400"} />
            <span>{cameraActive ? "Camera Monitored (Live)" : "Activating Camera..."}</span>
          </div>
        </div>

        {/* 2. Tools dock */}
        <div className="hidden md:flex items-center gap-2">
          {/* Instructions Button */}
          <button
            onClick={() => setShowInstructionsModal(true)}
            className="h-9 px-3.5 rounded-md text-[14px] font-medium bg-blue-800 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-blue-100"
          >
            <HelpCircle size={16} /> Instructions
          </button>

          {/* Large Scientific Calculator Tool */}
          <div className="relative">
            <button
              className={cn(
                "h-9 px-4 rounded-md text-[14px] font-medium transition-colors flex items-center gap-2",
                activeTool === "calc"
                  ? "bg-blue-600 shadow-inner ring-2 ring-white/20"
                  : "bg-blue-800 hover:bg-blue-700 dark:bg-slate-800 dark:hover:bg-slate-700"
              )}
              onClick={() => setActiveTool(activeTool === "calc" ? null : "calc")}
            >
              <Calculator size={18} /> Calculator
            </button>
            {activeTool === "calc" && (
              <div className="absolute top-[48px] left-1/2 -translate-x-1/2 w-[380px] sm:w-[440px] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 overflow-hidden z-50">
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-gray-200 dark:border-slate-700 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Calculator size={16} className="text-blue-600 dark:text-blue-400" />
                    <span className="font-bold text-[14px] text-slate-800 dark:text-slate-100">Scientific Calculator</span>
                  </div>
                  <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-gray-700 dark:hover:text-white p-1 rounded-lg">
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  {/* Dual-line Display */}
                  <div className="bg-gray-50 dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-xl p-3 flex flex-col items-end justify-center font-mono min-h-[72px]">
                    <span className="text-xs text-gray-500 dark:text-slate-400 h-5 truncate max-w-full">{calcExpr || "0"}</span>
                    <span className="text-2xl font-bold text-gray-900 dark:text-white truncate max-w-full">{calcResult}</span>
                  </div>

                  {/* Scientific 5-Column Button Grid */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { label: "sin", type: "fn" }, { label: "cos", type: "fn" }, { label: "tan", type: "fn" }, { label: "log", type: "fn" }, { label: "ln", type: "fn" },
                      { label: "√", type: "fn" }, { label: "x²", type: "fn" }, { label: "^", type: "op" }, { label: "(", type: "op" }, { label: ")", type: "op" },
                      { label: "π", type: "const" }, { label: "e", type: "const" }, { label: "DEL", type: "del" }, { label: "AC", type: "clear" }, { label: "÷", type: "op" },
                      { label: "7", type: "num" }, { label: "8", type: "num" }, { label: "9", type: "num" }, { label: "×", type: "op" }, { label: "%", type: "op" },
                      { label: "4", type: "num" }, { label: "5", type: "num" }, { label: "6", type: "num" }, { label: "-", type: "op" }, { label: "±", type: "fn" },
                      { label: "1", type: "num" }, { label: "2", type: "num" }, { label: "3", type: "num" }, { label: "+", type: "op" }, { label: "Ans", type: "fn" },
                    ].map((item, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => handleCalcInput(item.label)}
                        className={cn(
                          "h-10 rounded-lg text-sm font-semibold transition-all border cursor-pointer active:scale-95",
                          item.type === "clear"
                            ? "bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900 hover:bg-rose-100"
                            : item.type === "del"
                            ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900 hover:bg-amber-100"
                            : item.type === "op"
                            ? "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 hover:bg-slate-200 font-bold"
                            : item.type === "fn" || item.type === "const"
                            ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900 hover:bg-blue-100"
                            : "bg-white text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 hover:bg-gray-50 shadow-2xs font-bold"
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                    {/* Bottom Row */}
                    <button
                      type="button"
                      onClick={() => handleCalcInput("0")}
                      className="col-span-2 h-10 rounded-lg text-sm font-bold bg-white text-gray-800 border border-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 hover:bg-gray-50 shadow-2xs cursor-pointer active:scale-95"
                    >
                      0
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCalcInput(".")}
                      className="h-10 rounded-lg text-sm font-bold bg-white text-gray-800 border border-gray-200 dark:bg-slate-800 dark:text-slate-100 dark:border-slate-700 hover:bg-gray-50 shadow-2xs cursor-pointer active:scale-95"
                    >
                      .
                    </button>
                    <button
                      type="button"
                      onClick={() => handleCalcInput("=")}
                      className="col-span-2 h-10 rounded-lg text-sm font-bold bg-blue-600 text-white border border-blue-700 hover:bg-blue-700 shadow-md cursor-pointer active:scale-95"
                    >
                      =
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3 & 4. Save indicator & Timer */}
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-medium text-blue-200 hidden md:inline">
            {saveStatus === "saving" && (
              <span className="flex items-center gap-1.5 text-blue-200">
                <Loader2 size={13} className="animate-spin" /> Saving...
              </span>
            )}
            {saveStatus === "saved" && (
              <span className="flex items-center gap-1 text-emerald-300">
                <CheckCircle2 size={13} /> Saved
              </span>
            )}
            {saveStatus === "error" && (
              <span className="flex items-center gap-1 text-rose-300">
                <AlertCircle size={13} /> Connection issue
              </span>
            )}
          </span>

          <ThemeToggle className="text-white hover:text-blue-200 p-1.5 rounded-lg bg-blue-800/60 dark:bg-slate-800 border border-blue-700/50 dark:border-slate-700" />

          <div
            className={cn(
              "font-mono font-bold text-[18px] sm:text-[20px] px-3.5 py-1.5 rounded-md shadow-sm leading-none flex items-center transition-colors",
              remainingSec <= 300
                ? "bg-rose-600 text-white animate-pulse"
                : remainingSec <= 600
                ? "bg-amber-100 text-amber-900"
                : "bg-white text-blue-900"
            )}
          >
            {formatTimer(remainingSec)}
          </div>
        </div>
      </header>

      {/* Proctor Message Announcement Banner */}
      {proctorMessage && (
        <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between text-xs sm:text-sm font-medium z-30 shadow-md">
          <div className="flex items-center gap-2 max-w-4xl mx-auto flex-1">
            <Megaphone size={16} className="shrink-0 animate-pulse text-amber-300" />
            <span><strong>Invigilator Announcement:</strong> {proctorMessage}</span>
          </div>
          <button
            onClick={() => setProctorMessage(null)}
            className="text-blue-200 hover:text-white text-xs px-2.5 py-1 rounded border border-blue-400 hover:border-white transition-colors cursor-pointer ml-3"
          >
            Dismiss
          </button>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Question Area */}
        <main className="flex-1 flex flex-col items-center p-4 sm:p-8 overflow-y-auto w-full relative bg-gray-50 dark:bg-slate-950">
          <div className="w-full max-w-[760px] flex flex-col h-full">
            {/* Dark Mode Optimized Instruction Bar */}
            <div className="mb-4 p-3.5 rounded-xl bg-blue-50/90 dark:bg-slate-900 border border-blue-200 dark:border-slate-800 text-blue-950 dark:text-slate-100 flex items-center justify-between text-xs font-medium shadow-2xs">
              <div className="flex items-center gap-2">
                <HelpCircle size={15} className="text-blue-600 dark:text-blue-400 shrink-0" />
                <span>Answers auto-save immediately. Do not switch tabs or minimize this window.</span>
              </div>
              <button
                onClick={() => setShowInstructionsModal(true)}
                className="underline hover:text-blue-600 dark:hover:text-blue-400 shrink-0 ml-2 font-bold cursor-pointer"
              >
                View Rules
              </button>
            </div>

            {/* Question header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200 dark:border-slate-800">
              <h2 className="text-[20px] sm:text-[22px] font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
                Question {currentQuestion} of {questions.length}
                {isFlagged && <Flag size={20} className="text-amber-600 fill-amber-600" />}
              </h2>
              <span className="text-[14px] sm:text-[15px] font-medium text-gray-500 dark:text-slate-400">
                {q.marks} {q.marks === 1 ? "mark" : "marks"}
              </span>
            </div>

            {/* Question Text & Diagram */}
            <DiagramRenderer
              text={q.text}
              mediaUrl={q.stemMediaUrl}
              className="text-[16px] md:text-[18px] text-gray-900 dark:text-slate-100 mb-6 font-medium"
            />

            {/* Options */}
            <div className="space-y-3.5 mb-12">
              {q.options.map((opt) => {
                const isSelected = selectedPositions.includes(opt.position);
                return (
                  <label
                    key={opt.id}
                    onClick={() => handleSelectOption(opt.position)}
                    className={cn(
                      "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[64px]",
                      isSelected
                        ? "border-blue-600 bg-blue-50 dark:bg-blue-950/40 ring-1 ring-blue-600/10 dark:border-blue-500"
                        : "border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-700"
                    )}
                  >
                    <input
                      type={q.answerFormat === "MCQ_MULTI" ? "checkbox" : "radio"}
                      name={`question_${q.position}`}
                      className="sr-only"
                      checked={isSelected}
                      onChange={() => {}}
                    />
                    <div
                      className={cn(
                        "w-5 h-5 flex items-center justify-center mr-4 shrink-0 transition-colors border-2",
                        q.answerFormat === "MCQ_MULTI" ? "rounded-md" : "rounded-full",
                        isSelected ? "border-blue-600 bg-blue-600" : "border-gray-400 dark:border-slate-600"
                      )}
                    >
                      {isSelected && (
                        <div
                          className={cn(
                            "bg-white",
                            q.answerFormat === "MCQ_MULTI" ? "w-2.5 h-2.5 rounded-xs" : "w-2 h-2 rounded-full"
                          )}
                        />
                      )}
                    </div>
                    <span className="font-semibold text-gray-700 dark:text-slate-300 w-8 shrink-0">{opt.id}.</span>
                    <span className="text-[15px] sm:text-[16px] text-gray-900 dark:text-slate-100 flex-1">
                      <MathText text={opt.text} />
                    </span>
                  </label>
                );
              })}
            </div>

            {/* Navigation bar */}
            <div className="mt-auto pt-6 border-t border-gray-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between sticky bottom-0 bg-gray-50 dark:bg-slate-950 pb-4 z-10">
              <button
                className="px-6 h-12 rounded-lg font-semibold text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
              >
                Previous
              </button>

              <div className="flex items-center gap-3 ml-auto sm:ml-0">
                <button
                  className={cn(
                    "px-5 sm:px-6 h-12 rounded-lg font-semibold border transition-colors flex items-center gap-2 cursor-pointer",
                    isFlagged
                      ? "text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800 hover:bg-amber-200"
                      : "text-gray-700 dark:text-slate-300 bg-white dark:bg-slate-900 border-gray-300 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800"
                  )}
                  onClick={handleToggleFlag}
                >
                  <Flag className={cn("shrink-0", isFlagged && "fill-amber-700")} size={18} />
                  <span className="hidden sm:inline">{isFlagged ? "Flagged" : "Flag for review"}</span>
                </button>
                <button
                  className="px-7 sm:px-8 h-12 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
                  onClick={handleNext}
                >
                  {currentQuestion === questions.length ? "Review and Submit" : "Save and Next"}
                </button>
              </div>
            </div>
          </div>
        </main>

        {/* Right: Palette */}
        <aside className="w-[320px] shrink-0 border-l border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col overflow-y-auto hidden lg:flex shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[16px] text-gray-900 dark:text-slate-100">Question Palette</h3>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              {answeredCount}/{questions.length} answered
            </span>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-8">
            {palette.map((p) => {
              const isCurrent = p.num === currentQuestion;

              let bg = "bg-gray-100 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-200 dark:hover:bg-slate-700";
              if (isCurrent) {
                bg = "bg-white dark:bg-slate-900 border-blue-900 dark:border-blue-500 text-blue-900 dark:text-blue-400 font-bold ring-2 ring-blue-900 dark:ring-blue-500 ring-inset";
              } else if (p.isAnswered) {
                bg = "bg-blue-600 border-blue-600 text-white hover:bg-blue-700";
              }

              return (
                <button
                  key={p.num}
                  onClick={() => setCurrentQuestion(p.num)}
                  className={cn(
                    "h-11 rounded-lg text-[14px] font-semibold transition-all relative flex items-center justify-center border cursor-pointer",
                    bg
                  )}
                >
                  {p.num}
                  {p.isFlagged && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-xs border border-gray-100 dark:border-slate-700">
                      <Flag size={9} className="text-amber-600 fill-amber-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100 dark:border-slate-800">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px] font-medium text-gray-600 dark:text-slate-400 mb-8">
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-blue-600 rounded"></div> Answered
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded"></div> Not answered
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded relative">
                  <Flag size={10} className="absolute -top-1 -right-1 text-amber-600 fill-amber-600" />
                </div>{" "}
                Flagged
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-4 h-4 bg-white dark:bg-slate-900 border-[2.5px] border-blue-900 dark:border-blue-400 rounded"></div> Current
              </div>
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className="w-full h-12 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer shadow-2xs"
            >
              Submit Exam
            </button>
          </div>
        </aside>
      </div>

      {/* Instructions Modal (Dark mode optimized) */}
      {showInstructionsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6 text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <HelpCircle size={20} className="text-blue-600 dark:text-blue-400" />
                Examination Instructions
              </h3>
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                <span>
                  Answers are automatically synced and persisted on the CBT server.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                <span>
                  Switching browser tabs or minimizing the test window triggers anti-cheat warnings. On the 3rd infraction, your examination will automatically submit and log you out.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400 mt-2 shrink-0" />
                <span>
                  The timer runs continuously. When the countdown reaches 00:00, remaining answers will be submitted automatically.
                </span>
              </li>
            </ul>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Close Instructions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Switch Warning Modal (Infractions 1, 2, and 3) */}
      {tabWarningModal !== null && (
        <div className="fixed inset-0 z-50 bg-rose-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border-2 border-rose-600 text-slate-900 dark:text-slate-100 space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert size={32} />
            </div>

            <div className="text-center space-y-2">
              <h3 className="text-xl font-black text-rose-600">
                {tabWarningModal === 3
                  ? "Exam Terminated (Infraction 3 of 3)"
                  : `Tab Switch Warning (${tabWarningModal} of 3)`}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {tabWarningModal === 1 && (
                  <>
                    Leaving the examination window or switching tabs is strictly prohibited. Your action has been logged by the invigilator system.
                  </>
                )}
                {tabWarningModal === 2 && (
                  <>
                    <strong className="text-rose-600 font-bold">Final Warning:</strong> You have navigated away from the exam twice. Switching tabs one more time will automatically submit your exam and log you out immediately.
                  </>
                )}
                {tabWarningModal >= 3 && (
                  <>
                    You have exceeded the maximum tab-switch allowance (3 infractions). Your examination is being automatically submitted and you are being logged out now.
                  </>
                )}
              </p>
            </div>

            {tabWarningModal < 3 ? (
              <button
                type="button"
                onClick={() => setTabWarningModal(null)}
                className="w-full py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 transition-colors shadow-md cursor-pointer"
              >
                I Understand — Return to Exam
              </button>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-rose-600">
                <Loader2 size={16} className="animate-spin" /> Logging out securely...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900 text-blue-600 flex items-center justify-center">
                <Send size={22} />
              </div>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Confirm Exam Submission</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Are you sure you want to finish and submit your examination? Once submitted, you cannot alter your answers.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-center">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Answered</span>
                <span className="text-lg font-extrabold text-blue-600 dark:text-blue-400">{answeredCount}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Unanswered</span>
                <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400">{unansweredCount}</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Flagged</span>
                <span className="text-lg font-extrabold text-amber-600 dark:text-amber-400">{flaggedCount}</span>
              </div>
            </div>

            {unansweredCount > 0 && (
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs font-semibold text-amber-800 dark:text-amber-300">
                <AlertCircle size={16} className="shrink-0 text-amber-600" />
                <span>You have {unansweredCount} unanswered questions remaining.</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Return to Paper
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Submitting...
                  </>
                ) : (
                  "Yes, Submit Now"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Proctor Paused Overlay */}
      {isPausedByProctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-amber-300 dark:border-amber-700 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center mx-auto">
              <Clock size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              Examination Paused
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              Your exam session has been temporarily paused by the invigilator. Please stay at your workstation.
              Your answers are securely saved and your time will resume once the invigilator unpauses your session.
            </p>
          </div>
        </div>
      )}

      {/* In-viewport lightweight Video & Canvas for Periodic Candidate Frame Snapshots */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="fixed bottom-0 right-0 w-1 h-1 opacity-[0.01] pointer-events-none z-[-1]"
      />
      <canvas
        ref={canvasRef}
        className="fixed bottom-0 right-0 w-1 h-1 opacity-[0.01] pointer-events-none z-[-1]"
      />

      {/* Floating Picture-in-Picture Candidate Webcam Preview */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end pointer-events-auto select-none">
        {isCamCollapsed ? (
          <button
            type="button"
            onClick={() => setIsCamCollapsed(false)}
            title="Expand webcam preview"
            className="flex items-center gap-2 bg-slate-900/95 hover:bg-slate-800 text-white border-2 border-emerald-500/80 rounded-full px-3.5 py-1.5 shadow-2xl backdrop-blur-md transition-all cursor-pointer group hover:scale-105"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <Camera size={14} className="text-emerald-400" />
            <span className="text-xs font-bold text-slate-100">Live Monitored</span>
            <Maximize2 size={13} className="text-slate-400 group-hover:text-white ml-0.5" />
          </button>
        ) : (
          <div className="relative bg-slate-900 border-2 border-emerald-500/90 rounded-2xl overflow-hidden shadow-2xl w-48 h-36 bg-black flex flex-col group transition-all">
            {cameraActive ? (
              <video
                ref={(el) => {
                  if (el && streamRef.current && el.srcObject !== streamRef.current) {
                    el.srcObject = streamRef.current;
                    el.play().catch(() => {});
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-3 text-center text-slate-400 bg-slate-950">
                <Camera size={26} className="text-amber-400 mb-1.5 animate-pulse" />
                <span className="text-[11px] font-semibold text-slate-200">Starting Camera...</span>
                <span className="text-[9px] text-slate-400 mt-0.5">Please allow camera access</span>
              </div>
            )}

            {/* Overlay badges */}
            <div className="absolute top-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              LIVE PROCTOR
            </div>

            {/* Minimize / Collapse Button */}
            <button
              type="button"
              onClick={() => setIsCamCollapsed(true)}
              title="Minimize camera preview"
              className="absolute top-1.5 right-1.5 p-1 rounded-md bg-black/70 hover:bg-black text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              <Minimize2 size={13} />
            </button>

            <div className="absolute bottom-1.5 right-2 text-[9px] text-white/90 font-mono bg-black/70 px-1.5 py-0.5 rounded backdrop-blur-xs">
              {candidateMatric || "STUDENT"}
            </div>
          </div>
        )}
        <div className="text-[10px] text-slate-600 dark:text-slate-400 mt-1 font-semibold flex items-center gap-1">
          <ShieldAlert size={12} className="text-emerald-500" /> Invigilator live feed active
        </div>
      </div>
    </div>
  );
}
