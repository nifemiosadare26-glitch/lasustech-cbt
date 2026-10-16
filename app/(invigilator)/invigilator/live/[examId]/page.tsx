"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  Wifi,
  WifiOff,
  Flag,
  CheckCircle2,
  Video,
  Radio,
  Clock,
  AlertTriangle,
  Play,
  Pause,
  Plus,
  Send,
  Laptop,
  ShieldAlert,
  ArrowLeft,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  Download,
  Megaphone,
  UserCheck,
  MapPin,
  ExternalLink,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  Camera,
  RotateCcw,
  Sparkles,
  Info,
  Monitor,
  Check
} from "lucide-react";

interface Student {
  id: string;
  name: string;
  matric: string;
  seat: string;
  status: string;
  progress: number;
  totalQuestions: number;
  answeredQuestions: number;
  state: "online" | "flagged" | "offline" | "submitted" | "not_started";
  flags: number;
  flagDetails: { type: string; timestamp: string; detail: string }[];
  offlineSeconds?: number;
  ipAddress: string;
  browserLocked: boolean;
  isPaused: boolean;
  extraTimeMinutes: number;
  photoUrl: string;
}

const initialStudents: Student[] = [
  {
    id: "1",
    name: "Adaeze O. Obi",
    matric: "CSC/22/101",
    seat: "PC-01",
    status: "Answering Q29 / 40",
    progress: 72,
    totalQuestions: 40,
    answeredQuestions: 29,
    state: "online",
    flags: 0,
    flagDetails: [],
    ipAddress: "192.168.1.101",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop"
  },
  {
    id: "2",
    name: "Tunde Babatunde",
    matric: "CSC/22/117",
    seat: "PC-14",
    status: "Flagged: 2 tab switches",
    progress: 45,
    totalQuestions: 40,
    answeredQuestions: 18,
    state: "flagged",
    flags: 2,
    flagDetails: [
      { type: "Alt+Tab Detected", timestamp: "09:14:22 AM", detail: "Switched focus away from exam kiosk to external app" },
      { type: "Fullscreen Exit", timestamp: "09:28:10 AM", detail: "Exited locked fullscreen viewport for 6 seconds" }
    ],
    ipAddress: "192.168.1.114",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  },
  {
    id: "3",
    name: "Ifeoma Adeleke",
    matric: "CSC/22/122",
    seat: "PC-22",
    status: "Offline 42s (Reconnecting)",
    progress: 60,
    totalQuestions: 40,
    answeredQuestions: 24,
    state: "offline",
    flags: 0,
    flagDetails: [],
    offlineSeconds: 42,
    ipAddress: "192.168.1.122",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop"
  },
  {
    id: "4",
    name: "Zainab Kano",
    matric: "CSC/22/130",
    seat: "PC-35",
    status: "Submitted (Score saved)",
    progress: 100,
    totalQuestions: 40,
    answeredQuestions: 40,
    state: "submitted",
    flags: 0,
    flagDetails: [],
    ipAddress: "192.168.1.135",
    browserLocked: false,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop"
  },
  {
    id: "5",
    name: "Chinedu Madu",
    matric: "CSC/22/045",
    seat: "PC-48",
    status: "Answering Q12 / 40",
    progress: 30,
    totalQuestions: 40,
    answeredQuestions: 12,
    state: "online",
    flags: 0,
    flagDetails: [],
    ipAddress: "192.168.1.148",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop"
  },
  {
    id: "6",
    name: "Sarah John",
    matric: "CSC/22/089",
    seat: "PC-61",
    status: "Not started (Checked-in)",
    progress: 0,
    totalQuestions: 40,
    answeredQuestions: 0,
    state: "not_started",
    flags: 0,
    flagDetails: [],
    ipAddress: "192.168.1.161",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop"
  },
  {
    id: "7",
    name: "Olamide Bakare",
    matric: "CSC/22/155",
    seat: "PC-70",
    status: "Flagged: Multiple face alerts",
    progress: 68,
    totalQuestions: 40,
    answeredQuestions: 27,
    state: "flagged",
    flags: 1,
    flagDetails: [
      { type: "Camera Obstruction", timestamp: "09:32:05 AM", detail: "Face obscured from webcam stream for >15 seconds" }
    ],
    ipAddress: "192.168.1.170",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop"
  },
  {
    id: "8",
    name: "Fatima Aliyu",
    matric: "CSC/22/201",
    seat: "PC-88",
    status: "Answering Q35 / 40",
    progress: 88,
    totalQuestions: 40,
    answeredQuestions: 35,
    state: "online",
    flags: 0,
    flagDetails: [],
    ipAddress: "192.168.1.188",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop"
  },
  {
    id: "9",
    name: "Emmanuel Chukwu",
    matric: "CSC/22/012",
    seat: "PC-04",
    status: "Answering Q22 / 40",
    progress: 55,
    totalQuestions: 40,
    answeredQuestions: 22,
    state: "online",
    flags: 0,
    flagDetails: [],
    ipAddress: "192.168.1.104",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop"
  },
  {
    id: "10",
    name: "Blessing Okafor",
    matric: "CSC/22/078",
    seat: "PC-19",
    status: "Flagged: Shortcut attempt",
    progress: 40,
    totalQuestions: 40,
    answeredQuestions: 16,
    state: "flagged",
    flags: 1,
    flagDetails: [
      { type: "Keyboard Shortcut Attempt", timestamp: "09:21:40 AM", detail: "Blocked Ctrl+C / Ctrl+V shortcut attempt" }
    ],
    ipAddress: "192.168.1.119",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop"
  },
  {
    id: "11",
    name: "Kayode Ajayi",
    matric: "CSC/22/190",
    seat: "PC-31",
    status: "Offline 15s (Network switch)",
    progress: 50,
    totalQuestions: 40,
    answeredQuestions: 20,
    state: "offline",
    flags: 0,
    flagDetails: [],
    offlineSeconds: 15,
    ipAddress: "192.168.1.131",
    browserLocked: true,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop"
  },
  {
    id: "12",
    name: "Mariam Danjuma",
    matric: "CSC/22/210",
    seat: "PC-54",
    status: "Submitted (Score saved)",
    progress: 100,
    totalQuestions: 40,
    answeredQuestions: 40,
    state: "submitted",
    flags: 0,
    flagDetails: [],
    ipAddress: "192.168.1.154",
    browserLocked: false,
    isPaused: false,
    extraTimeMinutes: 0,
    photoUrl: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&h=150&fit=crop"
  }
];

export default function LiveMonitorPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params?.examId ? String(params.examId) : "1";

  const [students, setStudents] = React.useState<Student[]>(initialStudents);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string | null>("2"); // default select flagged student
  const [activeFilter, setActiveFilter] = React.useState<"all" | "online" | "flagged" | "offline" | "submitted" | "not_started">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [viewMode, setViewMode] = React.useState<"grid" | "table">("grid");
  const [sortBy, setSortBy] = React.useState<"flags" | "seat" | "progress" | "name">("flags");
  const [streamViewMode, setStreamViewMode] = React.useState<"camera" | "screen">("camera");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Live timer countdown
  const [timeLeft, setTimeLeft] = React.useState(2465); // ~41m 05s
  const [isExamPaused, setIsExamPaused] = React.useState(false);

  // Modals state
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = React.useState(false);
  const [isGlobalTimeModalOpen, setIsGlobalTimeModalOpen] = React.useState(false);
  const [isIndividualTimeModalOpen, setIsIndividualTimeModalOpen] = React.useState(false);
  const [isSendMessageModalOpen, setIsSendMessageModalOpen] = React.useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = React.useState(false);
  const [isMalpracticeModalOpen, setIsMalpracticeModalOpen] = React.useState(false);
  const [isEndExamConfirmOpen, setIsEndExamConfirmOpen] = React.useState(false);

  // Modal form states
  const [broadcastMessage, setBroadcastMessage] = React.useState("");
  const [studentMessage, setStudentMessage] = React.useState("");
  const [extraTimeMinutes, setExtraTimeMinutes] = React.useState(5);
  const [extraTimeReason, setExtraTimeReason] = React.useState("Workstation input lag / mouse swap");
  const [customGlobalMinutes, setCustomGlobalMinutes] = React.useState("5");
  const [targetStandbyPC, setTargetStandbyPC] = React.useState("PC-115 (Standby Spare 1)");
  const [malpracticeCategory, setMalpracticeCategory] = React.useState("Possession of unauthorized electronic device / phone");
  const [malpracticeNote, setMalpracticeNote] = React.useState("");
  const [docketConfiscateCheck, setDocketConfiscateCheck] = React.useState(true);

  // Countdown effect
  React.useEffect(() => {
    if (isExamPaused) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isExamPaused]);

  const formatTimer = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;

  // Exact counts matching filters
  const countOnline = students.filter(s => s.state === "online").length;
  const countFlagged = students.filter(s => s.state === "flagged").length;
  const countOffline = students.filter(s => s.state === "offline").length;
  const countSubmitted = students.filter(s => s.state === "submitted").length;
  const countNotStarted = students.filter(s => s.state === "not_started").length;

  // Filter students with 1:1 precision
  const filteredStudents = students
    .filter(s => {
      if (activeFilter === "online") return s.state === "online";
      if (activeFilter === "flagged") return s.state === "flagged";
      if (activeFilter === "offline") return s.state === "offline";
      if (activeFilter === "submitted") return s.state === "submitted";
      if (activeFilter === "not_started") return s.state === "not_started";
      return true;
    })
    .filter(s => {
      const q = searchQuery.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.matric.toLowerCase().includes(q) || s.seat.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (sortBy === "flags") return b.flags - a.flags;
      if (sortBy === "seat") return a.seat.localeCompare(b.seat, undefined, { numeric: true });
      if (sortBy === "progress") return b.progress - a.progress;
      return a.name.localeCompare(b.name);
    });

  // Action handlers
  const handleTogglePauseStudent = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          if (s.state === "submitted") {
            showToast("Cannot pause an exam that is already submitted.");
            return s;
          }
          const nextPaused = !s.isPaused;
          showToast(nextPaused ? `Paused terminal for ${s.name} (${s.seat})` : `Resumed exam for ${s.name} (${s.seat})`);
          return {
            ...s,
            isPaused: nextPaused,
            status: nextPaused ? "Paused by Invigilator" : `Answering Q${s.answeredQuestions} / ${s.totalQuestions}`
          };
        }
        return s;
      })
    );
  };

  const handleAddExtraTime = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const minsToAdd = Number(extraTimeMinutes);
    if (isNaN(minsToAdd) || minsToAdd <= 0) {
      showToast("Please select valid extra minutes.");
      return;
    }

    setStudents(prev =>
      prev.map(s => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            extraTimeMinutes: s.extraTimeMinutes + minsToAdd,
            flagDetails: [
              {
                type: "Extra Time Granted",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                detail: `+${minsToAdd} minutes added: ${extraTimeReason}`
              },
              ...s.flagDetails
            ]
          };
        }
        return s;
      })
    );
    showToast(`Added +${minsToAdd} mins to ${selectedStudent.name}'s terminal.`);
    setIsIndividualTimeModalOpen(false);
  };

  const handleSendStudentMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !studentMessage.trim()) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            flagDetails: [
              {
                type: "Invigilator Warning Banner",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                detail: `Alert sent to candidate monitor: "${studentMessage}"`
              },
              ...s.flagDetails
            ]
          };
        }
        return s;
      })
    );

    showToast(`Banner sent to ${selectedStudent.name}'s monitor: "${studentMessage}"`);
    setStudentMessage("");
    setIsSendMessageModalOpen(false);
  };

  const handleHotSwapTerminal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const newSeat = targetStandbyPC.split(" ")[0];

    setStudents(prev =>
      prev.map(s => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            seat: newSeat,
            status: `Transferred to ${newSeat} (Session synced)`,
            flagDetails: [
              {
                type: "Hot-Standby Transfer",
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                detail: `Migrated from ${s.seat} to ${newSeat} due to hardware check.`
              },
              ...s.flagDetails
            ]
          };
        }
        return s;
      })
    );
    showToast(`Candidate ${selectedStudent.name} moved to ${newSeat}. Progress synced.`);
    setIsTransferModalOpen(false);
  };

  const handleLogMalpractice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    setStudents(prev =>
      prev.map(s => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            state: "flagged",
            flags: s.flags + 1,
            flagDetails: [
              {
                type: `Malpractice: ${malpracticeCategory}`,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                detail: malpracticeNote || "Formal disciplinary docket filed by lead invigilator."
              },
              ...s.flagDetails
            ]
          };
        }
        return s;
      })
    );

    showToast(`Formal malpractice report recorded for ${selectedStudent.name} (${selectedStudent.matric}).`);
    setIsMalpracticeModalOpen(false);
    setMalpracticeNote("");
  };

  const handleForceEndExam = () => {
    if (!selectedStudent) return;
    setStudents(prev =>
      prev.map(s => {
        if (s.id === selectedStudent.id) {
          return {
            ...s,
            state: "submitted",
            progress: 100,
            status: "Terminated & Submitted by Invigilator"
          };
        }
        return s;
      })
    );
    showToast(`Exam force-ended for ${selectedStudent.name}. All saved answers recorded.`);
    setIsEndExamConfirmOpen(false);
  };

  const handleClearFlags = (studentId: string) => {
    setStudents(prev =>
      prev.map(s => {
        if (s.id === studentId) {
          return {
            ...s,
            flags: 0,
            flagDetails: [],
            state: "online",
            status: `Answering Q${s.answeredQuestions} / ${s.totalQuestions}`
          };
        }
        return s;
      })
    );
    showToast(`Flags cleared for ${selectedStudent?.name}. Terminal marked verified.`);
  };

  const handleGlobalExtraTime = (mins: number) => {
    setTimeLeft(prev => prev + mins * 60);
    showToast(`Universal +${mins} minutes applied to all candidates in Hall A.`);
    setIsGlobalTimeModalOpen(false);
  };

  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) return;
    showToast(`Hall announcement broadcasted: "${broadcastMessage}"`);
    setBroadcastMessage("");
    setIsBroadcastModalOpen(false);
  };

  const handleExportProctorLog = () => {
    const headers = "Seat,Matric,Name,Status,Progress,Flags,IP,ExtraTime\n";
    const rows = students
      .map(s => `"${s.seat}","${s.matric}","${s.name}","${s.state}","${s.progress}%","${s.flags}","${s.ipAddress}","+${s.extraTimeMinutes}m"`)
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `CSC301_Proctoring_Audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Live proctoring audit log exported.");
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] overflow-hidden relative bg-slate-50 rounded-2xl border border-gray-200 shadow-xs">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[14px] font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white cursor-pointer">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Header Bar: Exam info & Realtime Metrics */}
      <div className="bg-white border-b border-gray-200 px-5 py-3.5 shrink-0 flex flex-wrap items-center justify-between gap-4 shadow-2xs">
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => router.push("/invigilator")}
            className="flex items-center gap-1.5 text-[13px] font-semibold h-8 cursor-pointer"
          >
            <ArrowLeft size={15} />
            Today's Exams
          </Button>
          <div className="h-4 w-[1px] bg-gray-200 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-[17px] font-bold text-gray-900 tracking-tight">CSC 301: Data Structures & Algorithms</h2>
              <Badge variant="blue-solid" className="animate-pulse flex items-center gap-1 text-[11px]">
                <Radio size={12} />
                LIVE PROCTORING
              </Badge>
            </div>
            <p className="text-[12px] text-gray-500 flex items-center gap-1.5 mt-0.5">
              <MapPin size={13} className="text-gray-400" />
              LASUSTECH CBT Centre 1 • Hall A (Workstations 01–120)
            </p>
          </div>
        </div>

        {/* Dynamic Countdown & Hall Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-xl border border-slate-700 font-mono shadow-2xs">
            <Clock size={16} className="text-blue-400 animate-pulse" />
            <span className="text-[14px] font-bold tracking-wider">{formatTimer(timeLeft)}</span>
            <span className="text-[11px] text-slate-400 uppercase font-sans">Left</span>
          </div>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="h-9 text-[12px] font-bold gap-1.5 cursor-pointer"
          >
            <Megaphone size={14} className="text-amber-600" />
            Hall Announcement
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => setIsGlobalTimeModalOpen(true)}
            className="h-9 text-[12px] font-bold gap-1.5 cursor-pointer"
          >
            <Plus size={14} className="text-blue-600" />
            Global +5m
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={handleExportProctorLog}
            className="h-9 text-[12px] font-bold gap-1.5 cursor-pointer"
            title="Download proctoring telemetry audit log"
          >
            <Download size={14} className="text-gray-600" />
            Export Log
          </Button>
        </div>
      </div>

      {/* 2. Telemetry Metrics Ribbon & Quick Filter Tabs */}
      <div className="bg-white border-b border-gray-200 px-5 py-2.5 shrink-0 flex flex-wrap items-center justify-between gap-3 text-[13px]">
        {/* Clickable Telemetry Counters with 1:1 Precision */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "all" ? "bg-slate-900 text-white shadow-2xs" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <span>All Seated</span>
            <span className="font-bold">{students.length}</span>
          </button>

          <button
            onClick={() => setActiveFilter("online")}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "online"
                ? "bg-blue-600 text-white shadow-2xs"
                : "bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            <span>Online</span>
            <span className="font-bold">{countOnline}</span>
          </button>

          <button
            onClick={() => setActiveFilter("flagged")}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "flagged"
                ? "bg-amber-600 text-white shadow-2xs"
                : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
            }`}
          >
            <Flag size={13} className="text-amber-600 fill-amber-600" />
            <span>Flagged Alerts</span>
            <span className="font-bold bg-amber-200/60 px-1.5 rounded">{countFlagged}</span>
          </button>

          <button
            onClick={() => setActiveFilter("offline")}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "offline"
                ? "bg-rose-600 text-white shadow-2xs"
                : "bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200"
            }`}
          >
            <WifiOff size={13} className="text-rose-600" />
            <span>Offline Drops</span>
            <span className="font-bold">{countOffline}</span>
          </button>

          <button
            onClick={() => setActiveFilter("submitted")}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "submitted"
                ? "bg-emerald-600 text-white shadow-2xs"
                : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
            }`}
          >
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>Submitted</span>
            <span className="font-bold">{countSubmitted}</span>
          </button>

          <button
            onClick={() => setActiveFilter("not_started")}
            className={`px-3 py-1 rounded-lg font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "not_started"
                ? "bg-gray-700 text-white shadow-2xs"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
            }`}
          >
            <span>Not Started</span>
            <span className="font-bold">{countNotStarted}</span>
          </button>
        </div>

        {/* View Switcher & Search */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <Input
              placeholder="Search candidate, matric, PC..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-[12px] bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Sort dropdown */}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="h-8 px-2.5 rounded-md border border-gray-300 text-[12px] bg-white text-gray-700 font-medium focus:outline-blue-600"
          >
            <option value="flags">Sort: Highest Flags First</option>
            <option value="seat">Sort: Seat Order (PC-01...)</option>
            <option value="progress">Sort: Lowest Progress</option>
            <option value="name">Sort: Candidate Name</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center border border-gray-200 rounded-lg p-0.5 bg-gray-100">
            <button
              onClick={() => setViewMode("grid")}
              title="Tile Grid View"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "grid" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode("table")}
              title="Dense Table View"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === "table" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <List size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Live Telemetry Workspace */}
      <div className="flex-1 flex overflow-hidden min-h-[500px]">
        {/* Left: Candidates Grid / Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3.5 content-start">
              {filteredStudents.map(student => {
                const isSelected = selectedStudentId === student.id;
                const isFlagged = student.state === "flagged";
                const isOffline = student.state === "offline";
                const isSubmitted = student.state === "submitted";
                const isNotStarted = student.state === "not_started";

                let borderStyle = "border-gray-200 hover:border-blue-400 bg-white";
                if (isSelected) borderStyle = "border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20 shadow-md";
                else if (isFlagged) borderStyle = "border-amber-400 ring-1 ring-amber-400/40 bg-amber-50/30 shadow-2xs";
                else if (isOffline) borderStyle = "border-rose-300 bg-rose-50/20 opacity-85";
                else if (isSubmitted) borderStyle = "border-emerald-300 bg-emerald-50/20";

                const indicatorColor = isFlagged
                  ? "bg-amber-500"
                  : isOffline
                  ? "bg-rose-500"
                  : isSubmitted
                  ? "bg-emerald-500"
                  : isNotStarted
                  ? "bg-gray-400"
                  : "bg-blue-600";

                return (
                  <div
                    key={student.id}
                    onClick={() => setSelectedStudentId(student.id)}
                    className={`border rounded-xl p-3.5 flex flex-col cursor-pointer transition-all relative ${borderStyle}`}
                  >
                    {/* Top Row: Seat & Status Icons */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[11px] font-bold bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                          {student.seat}
                        </span>
                        <div className={`w-2 h-2 rounded-full ${indicatorColor} ${isFlagged ? "animate-ping" : ""}`} />
                      </div>

                      <div className="flex items-center gap-1">
                        {student.extraTimeMinutes > 0 && (
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">
                            +{student.extraTimeMinutes}m
                          </span>
                        )}
                        {student.isPaused && (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">
                            PAUSED
                          </span>
                        )}
                        {isFlagged && <Flag size={14} className="text-amber-600 fill-amber-500" />}
                        {isOffline && <WifiOff size={14} className="text-rose-600" />}
                        {isSubmitted && <CheckCircle2 size={14} className="text-emerald-600" />}
                      </div>
                    </div>

                    {/* Candidate Identity */}
                    <div className="mb-2">
                      <h4 className="font-bold text-[13px] text-gray-900 truncate leading-tight">{student.name}</h4>
                      <p className="font-mono text-[11px] text-gray-500">{student.matric}</p>
                    </div>

                    {/* Webcam Preview Window */}
                    <div className="w-full h-24 bg-slate-900 rounded-lg mb-2 relative overflow-hidden flex items-center justify-center group">
                      {isOffline ? (
                        <div className="text-center p-2">
                          <WifiOff size={18} className="text-rose-400 mx-auto mb-1 animate-pulse" />
                          <span className="text-[10px] font-semibold text-rose-300 block">Feed Dropped</span>
                          <span className="text-[9px] text-gray-400 font-mono">({student.offlineSeconds}s ago)</span>
                        </div>
                      ) : isSubmitted ? (
                        <div className="text-center p-2">
                          <CheckCircle2 size={20} className="text-emerald-400 mx-auto mb-1" />
                          <span className="text-[10px] font-semibold text-emerald-300">Exam Concluded</span>
                        </div>
                      ) : (
                        <>
                          {/* Simulated Live Camera Stream */}
                          <img
                            src={student.photoUrl}
                            alt={student.name}
                            className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-1.5 left-1.5 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] text-white font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            Live
                          </div>

                          {isFlagged && (
                            <div className="absolute inset-0 border-2 border-amber-500/80 pointer-events-none flex items-end p-1 bg-amber-500/10">
                              <span className="text-[9px] font-bold text-amber-200 bg-amber-950/80 px-1 rounded truncate">
                                ⚠ {student.flags} Violation Alert
                              </span>
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Progress Bar & Status Text */}
                    <div className="mt-auto pt-1">
                      <div className="flex justify-between items-center text-[11px] mb-1">
                        <span className="text-gray-500 font-medium">Progress</span>
                        <span className="font-bold text-gray-900">{student.progress}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            isSubmitted ? "bg-emerald-500" : isFlagged ? "bg-amber-500" : isOffline ? "bg-rose-500" : "bg-blue-600"
                          }`}
                          style={{ width: `${student.progress}%` }}
                        />
                      </div>
                      <p className="text-[11px] text-gray-500 truncate mt-1.5 font-medium">{student.status}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Dense Table View */
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 text-[12px] font-bold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Seat</th>
                    <th className="py-3 px-4">Candidate Name</th>
                    <th className="py-3 px-4">Matric No</th>
                    <th className="py-3 px-4">Status & Telemetry</th>
                    <th className="py-3 px-4">Progress</th>
                    <th className="py-3 px-4">Flags</th>
                    <th className="py-3 px-4">IP Address</th>
                    <th className="py-3 px-4 text-right">Quick Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {filteredStudents.map(student => (
                    <tr
                      key={student.id}
                      onClick={() => setSelectedStudentId(student.id)}
                      className={`cursor-pointer transition-colors ${
                        selectedStudentId === student.id
                          ? "bg-blue-50/60"
                          : student.state === "flagged"
                          ? "bg-amber-50/30 hover:bg-amber-50/60"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{student.seat}</td>
                      <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-100 shrink-0">
                          <img src={student.photoUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        {student.name}
                      </td>
                      <td className="py-3 px-4 font-mono text-gray-600">{student.matric}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          {student.state === "online" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
                              Online
                            </span>
                          )}
                          {student.state === "flagged" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                              <Flag size={12} className="text-amber-600" />
                              {student.flags} Flags
                            </span>
                          )}
                          {student.state === "offline" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-100 px-2 py-0.5 rounded">
                              <WifiOff size={12} />
                              Offline
                            </span>
                          )}
                          {student.state === "submitted" && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                              <CheckCircle2 size={12} />
                              Submitted
                            </span>
                          )}
                          <span className="text-[12px] text-gray-500 ml-1">{student.status}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-100 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${student.progress}%` }} />
                          </div>
                          <span className="text-[12px] text-gray-700">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-amber-600">
                        {student.flags > 0 ? `${student.flags} alerts` : "—"}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-gray-500">{student.ipAddress}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5" onClick={e => e.stopPropagation()}>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleTogglePauseStudent(student.id)}
                            disabled={student.state === "submitted"}
                            className="h-7 w-7 p-0 cursor-pointer"
                            title={student.isPaused ? "Resume Exam" : "Pause Exam"}
                          >
                            {student.isPaused ? <Play size={12} /> : <Pause size={12} />}
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setIsIndividualTimeModalOpen(true);
                            }}
                            disabled={student.state === "submitted"}
                            className="h-7 w-7 p-0 text-blue-600 cursor-pointer"
                            title="Add Extra Time"
                          >
                            <Plus size={13} />
                          </Button>

                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => {
                              setSelectedStudentId(student.id);
                              setIsSendMessageModalOpen(true);
                            }}
                            className="h-7 w-7 p-0 text-amber-600 cursor-pointer"
                            title="Send Direct Message"
                          >
                            <Send size={12} />
                          </Button>

                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => setSelectedStudentId(student.id)}
                            className="h-7 text-[11px] px-2.5 font-bold cursor-pointer"
                          >
                            Inspect
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {filteredStudents.length === 0 && (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-200">
              <UserCheck className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-[14px] font-medium text-gray-900">No candidates match your current filter.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setActiveFilter("all");
                  setSearchQuery("");
                }}
                className="mt-3 cursor-pointer"
              >
                Clear Search & Filter
              </Button>
            </div>
          )}
        </div>

        {/* Right: Slide-Over Candidate Telemetry Inspector Panel */}
        {selectedStudent && (
          <div className="w-[360px] lg:w-[410px] bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto shadow-xl z-20 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="font-bold text-gray-900 text-[15px] flex items-center gap-1.5">
                  <span>Candidate Telemetry</span>
                  <span className="font-mono text-[12px] bg-slate-900 text-white px-2 py-0.5 rounded">
                    {selectedStudent.seat}
                  </span>
                </h3>
                <p className="text-[11px] text-gray-500">Live Workstation Telemetry & Control</p>
              </div>

              <button
                onClick={() => setSelectedStudentId(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-5 flex-1">
              {/* Profile Card */}
              <div className="flex items-center gap-3.5 bg-gray-50 p-3.5 rounded-xl border border-gray-200">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-2xs shrink-0">
                  <img src={selectedStudent.photoUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-bold text-[15px] text-gray-900 leading-tight">{selectedStudent.name}</h4>
                  <p className="font-mono text-[12px] text-gray-600 mt-0.5 font-semibold">{selectedStudent.matric}</p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                    <span>Terminal: {selectedStudent.seat}</span>
                    <span>•</span>
                    <span>IP: {selectedStudent.ipAddress}</span>
                  </div>
                </div>
              </div>

              {/* Live Video Feed Player with Screen/Camera Toggle */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[12px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Video size={14} className="text-blue-600" />
                    Proctoring Stream
                  </span>

                  <div className="flex rounded-md border border-gray-200 p-0.5 bg-gray-100 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setStreamViewMode("camera")}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                        streamViewMode === "camera" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-500"
                      }`}
                    >
                      Webcam
                    </button>
                    <button
                      type="button"
                      onClick={() => setStreamViewMode("screen")}
                      className={`px-2 py-0.5 rounded font-bold cursor-pointer ${
                        streamViewMode === "screen" ? "bg-white text-blue-600 shadow-2xs" : "text-gray-500"
                      }`}
                    >
                      Screen Kiosk
                    </button>
                  </div>
                </div>

                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative border border-slate-800 shadow-inner group">
                  {streamViewMode === "camera" ? (
                    <img src={selectedStudent.photoUrl} alt="" className="w-full h-full object-cover opacity-90" />
                  ) : (
                    /* Simulated screen kiosk view */
                    <div className="w-full h-full bg-slate-950 p-3 text-white flex flex-col justify-between font-mono text-[10px]">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                        <span className="text-blue-400">LASUSTECH CBT KIOSK — FULLSCREEN</span>
                        <span className="text-emerald-400">LOCKED</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-slate-300">Question 29: What is the time complexity of QuickSort?</p>
                        <div className="text-[9px] text-slate-400 space-y-0.5 pl-2">
                          <p>○ A) O(n)</p>
                          <p className="text-blue-300 font-bold">● B) O(n log n) [Selected]</p>
                          <p>○ C) O(n²)</p>
                          <p>○ D) O(1)</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center text-[9px] text-slate-500 pt-1 border-t border-slate-800">
                        <span>Autosaved: 3s ago</span>
                        <span>Terminal: {selectedStudent.seat}</span>
                      </div>
                    </div>
                  )}

                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white font-mono">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    {streamViewMode === "camera" ? "LIVE WEBCAM" : "LIVE SCREEN"}
                  </div>

                  <button
                    type="button"
                    onClick={() => showToast(`Snapshot captured for ${selectedStudent.name} (${selectedStudent.seat}) and stored in session audit.`)}
                    className="absolute bottom-2 left-2 bg-black/70 hover:bg-black/90 text-white px-2 py-1 rounded text-[10px] flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Camera size={12} />
                    Snapshot
                  </button>

                  <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-black/70 px-2 py-0.5 rounded text-[10px] text-white">
                    <Eye size={12} className="text-blue-400" />
                    Gaze Centered
                  </div>
                </div>
              </div>

              {/* Progress & Live Time Breakdown */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 space-y-2.5">
                <div className="flex justify-between items-center text-[12px]">
                  <span className="font-semibold text-gray-600">Answered Questions:</span>
                  <span className="font-bold text-gray-900">
                    {selectedStudent.answeredQuestions} / {selectedStudent.totalQuestions} ({selectedStudent.progress}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${selectedStudent.progress}%` }} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-gray-200 text-gray-600">
                  <div>
                    <span>Extra Time:</span>{" "}
                    <strong className="text-blue-700 font-bold">+{selectedStudent.extraTimeMinutes} mins</strong>
                  </div>
                  <div>
                    <span>Kiosk Security:</span>{" "}
                    <strong className="text-emerald-700 font-bold">
                      {selectedStudent.browserLocked ? "Compliant" : "Unlocked"}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Violations & Security Flags */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h5 className="text-[12px] font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1">
                    <Flag size={14} className="text-amber-600" />
                    Proctoring Flags ({selectedStudent.flags})
                  </h5>
                  {selectedStudent.flags > 0 && (
                    <button
                      onClick={() => handleClearFlags(selectedStudent.id)}
                      className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Clear Flags
                    </button>
                  )}
                </div>

                {selectedStudent.flags > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.flagDetails.map((f, i) => (
                      <div key={i} className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] font-bold text-amber-900">{f.type}</span>
                          <span className="text-[10px] font-mono text-amber-700 font-semibold">{f.timestamp}</span>
                        </div>
                        <p className="text-[11px] text-amber-800">{f.detail}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[12px] text-emerald-800 flex items-center gap-2 font-medium">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    No active security flags or violations recorded.
                  </div>
                )}
              </div>

              {/* INTERACTIVE ACTIONS SECTION (100% FUNCTIONAL) */}
              <div className="space-y-2.5 pt-3 border-t border-gray-200">
                <h5 className="text-[12px] font-bold text-gray-700 uppercase tracking-wider">
                  Proctor Interventions
                </h5>

                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant={selectedStudent.isPaused ? "primary" : "secondary"}
                    onClick={() => handleTogglePauseStudent(selectedStudent.id)}
                    disabled={selectedStudent.state === "submitted"}
                    className="w-full text-[12px] font-semibold h-9 gap-1.5 cursor-pointer"
                  >
                    {selectedStudent.isPaused ? <Play size={14} /> : <Pause size={14} />}
                    {selectedStudent.isPaused ? "Resume Exam" : "Pause Exam"}
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={() => setIsIndividualTimeModalOpen(true)}
                    disabled={selectedStudent.state === "submitted"}
                    className="w-full text-[12px] font-semibold h-9 gap-1.5 cursor-pointer"
                  >
                    <Plus size={14} className="text-blue-600" />
                    Add Extra Time
                  </Button>
                </div>

                <Button
                  variant="secondary"
                  onClick={() => setIsSendMessageModalOpen(true)}
                  disabled={selectedStudent.state === "submitted"}
                  className="w-full text-[12px] font-semibold h-9 justify-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} className="text-amber-600" />
                  Send Targeted Message
                </Button>

                <Button
                  variant="secondary"
                  onClick={() => setIsTransferModalOpen(true)}
                  disabled={selectedStudent.state === "submitted"}
                  className="w-full text-[12px] font-semibold h-9 justify-center gap-1.5 cursor-pointer"
                >
                  <Laptop size={14} className="text-purple-600" />
                  Hot-Swap to Standby PC
                </Button>

                <div className="pt-2 flex gap-2">
                  <Button
                    variant="danger-outline"
                    onClick={() => setIsMalpracticeModalOpen(true)}
                    className="flex-1 text-[12px] font-bold h-9 gap-1.5 cursor-pointer"
                  >
                    <ShieldAlert size={14} />
                    Log Malpractice
                  </Button>

                  <Button
                    variant="danger"
                    onClick={() => setIsEndExamConfirmOpen(true)}
                    disabled={selectedStudent.state === "submitted"}
                    className="flex-1 text-[12px] font-bold h-9 gap-1.5 cursor-pointer"
                  >
                    Force Submit
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. MODALS */}

      {/* A. Hall Announcement Broadcast Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Megaphone className="text-amber-600" size={20} />
                Broadcast to Hall A (All Terminals)
              </h3>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 py-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Pre-configured Announcement</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "10 Minutes Remaining: Final review time.",
                    "Reminder: Do not use keyboard shortcuts.",
                    "Ensure rough calculation paper is signed by proctor.",
                    "Power switchover complete: Your answers are safe, continue."
                  ].map((msg, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setBroadcastMessage(msg)}
                      className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded font-medium text-left cursor-pointer"
                    >
                      {msg.slice(0, 32)}...
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Message Text</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Enter message displayed on all student screens..."
                  className="w-full p-3 rounded-lg border border-gray-300 text-[13px] focus:outline-blue-600"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsBroadcastModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="cursor-pointer">
                  Send Broadcast
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* B. Universal Hall Extra Time Modal */}
      {isGlobalTimeModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="text-blue-600" size={20} />
                Universal Hall Extra Time
              </h3>
              <button
                onClick={() => setIsGlobalTimeModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 py-4">
              <p className="text-[13px] text-gray-600">
                Extend exam duration across all active workstations in Hall A (e.g., due to university generator switchover or network lag).
              </p>

              <div className="grid grid-cols-3 gap-2.5">
                {[5, 10, 15].map(mins => (
                  <Button
                    key={mins}
                    variant="secondary"
                    onClick={() => handleGlobalExtraTime(mins)}
                    className="h-12 flex flex-col items-center justify-center font-bold text-blue-600 hover:bg-blue-50 hover:border-blue-300 cursor-pointer"
                  >
                    <span className="text-[15px]">+{mins} min</span>
                    <span className="text-[10px] text-gray-500 font-normal">All candidates</span>
                  </Button>
                ))}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Or Enter Custom Minutes</label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="60"
                    value={customGlobalMinutes}
                    onChange={e => setCustomGlobalMinutes(e.target.value)}
                    className="h-10 text-[14px]"
                    placeholder="e.g. 8"
                  />
                  <Button
                    variant="primary"
                    onClick={() => {
                      const mins = parseInt(customGlobalMinutes, 10);
                      if (mins > 0) handleGlobalExtraTime(mins);
                    }}
                    className="h-10 cursor-pointer"
                  >
                    Apply
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end">
              <Button variant="secondary" onClick={() => setIsGlobalTimeModalOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* C. Individual Extra Time Modal */}
      {isIndividualTimeModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Plus className="text-blue-600" size={20} />
                Add Extra Time: {selectedStudent.name}
              </h3>
              <button
                onClick={() => setIsIndividualTimeModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddExtraTime} className="space-y-4 py-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Time Extension (Minutes)</label>
                <div className="flex gap-2">
                  {[3, 5, 10, 15].map(mins => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setExtraTimeMinutes(mins)}
                      className={`flex-1 py-2 text-[13px] font-bold rounded-lg border transition-all cursor-pointer ${
                        extraTimeMinutes === mins
                          ? "bg-blue-600 text-white border-blue-600 shadow-2xs"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      +{mins}m
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Official Reason for Extension</label>
                <select
                  value={extraTimeReason}
                  onChange={e => setExtraTimeReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] bg-white focus:outline-blue-600"
                >
                  <option>Workstation keyboard or mouse replacement</option>
                  <option>Terminal reboot / hot-swap to standby machine</option>
                  <option>Network disconnect recovery lag</option>
                  <option>Proctor docket clarification / verification pause</option>
                  <option>Medical break granted by Chief Invigilator</option>
                </select>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsIndividualTimeModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="cursor-pointer">
                  Confirm Extension
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* D. Send Direct Candidate Message Modal */}
      {isSendMessageModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Send className="text-amber-600" size={20} />
                Targeted Alert: {selectedStudent.name}
              </h3>
              <button
                onClick={() => setIsSendMessageModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendStudentMessage} className="space-y-4 py-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Preset Proctor Warnings</label>
                <div className="flex flex-col gap-1.5 mb-2">
                  {[
                    "Please keep your face positioned directly towards the webcam.",
                    "Warning: Stop glancing sideways. Keep eyes on your screen.",
                    "Raise your hand if your terminal mouse or keyboard is stuck.",
                    "Do not touch USB ports or keyboard shortcut keys."
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setStudentMessage(preset)}
                      className="text-[12px] bg-gray-100 hover:bg-gray-200 text-gray-800 p-2 rounded text-left font-medium cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Message Text</label>
                <textarea
                  rows={2}
                  value={studentMessage}
                  onChange={e => setStudentMessage(e.target.value)}
                  placeholder="Type targeted message shown as top banner on student screen..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-[13px] focus:outline-blue-600"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsSendMessageModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="cursor-pointer">
                  Send To Terminal
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* E. Hot-Standby PC Transfer Modal */}
      {isTransferModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Laptop className="text-purple-600" size={20} />
                Hot-Swap Workstation
              </h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleHotSwapTerminal} className="space-y-4 py-4">
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-[12px] text-purple-900 space-y-1">
                <p className="font-bold">Seamless Candidate Migration</p>
                <p>
                  Transferring candidate <strong>{selectedStudent.name}</strong> from faulty terminal{" "}
                  <strong>{selectedStudent.seat}</strong> to a pre-booted hot-standby machine without loss of answered questions.
                </p>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Select Hot-Standby Terminal</label>
                <select
                  value={targetStandbyPC}
                  onChange={e => setTargetStandbyPC(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] bg-white focus:outline-blue-600"
                >
                  <option value="PC-115">PC-115 (Standby Spare 1 • Lab A Front)</option>
                  <option value="PC-116">PC-116 (Standby Spare 2 • Lab A Front)</option>
                  <option value="PC-117">PC-117 (Standby Spare 3 • Lab A Middle)</option>
                  <option value="PC-118">PC-118 (Standby Spare 4 • Lab A Middle)</option>
                  <option value="PC-119">PC-119 (Standby Spare 5 • Lab A Rear)</option>
                  <option value="PC-120">PC-120 (Standby Spare 6 • Lab A Rear)</option>
                </select>
              </div>

              <p className="text-[11px] text-gray-500">
                Upon transfer, the candidate logs in on the new workstation with their matric number. The session resumes from the exact millisecond.
              </p>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsTransferModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="cursor-pointer">
                  Transfer Workstation Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* F. Malpractice Disciplinary Modal */}
      {isMalpracticeModalOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="text-rose-600" size={20} />
                Official Examination Malpractice Report
              </h3>
              <button
                onClick={() => setIsMalpracticeModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogMalpractice} className="space-y-4 py-4">
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-[12px] text-rose-900">
                <strong>Candidate:</strong> {selectedStudent.name} ({selectedStudent.matric}) •{" "}
                <strong>Terminal:</strong> {selectedStudent.seat}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Violation Category</label>
                <select
                  value={malpracticeCategory}
                  onChange={e => setMalpracticeCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] bg-white focus:outline-blue-600"
                >
                  <option value="Possession of unauthorized electronic device / phone">Possession of unauthorized electronic device / phone</option>
                  <option value="Collusion / Whispering with neighboring candidate">Collusion / Whispering with neighboring candidate</option>
                  <option value="Unauthorized paper / crib notes">Unauthorized paper / crib notes</option>
                  <option value="Willful circumvention of fullscreen kiosk lock">Willful circumvention of fullscreen kiosk lock</option>
                  <option value="Impersonation suspect">Impersonation suspect</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Invigilator Observations & Evidence</label>
                <textarea
                  rows={3}
                  value={malpracticeNote}
                  onChange={e => setMalpracticeNote(e.target.value)}
                  placeholder="Record exact details, time observed, witness co-invigilators, and items confiscated..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-[13px] focus:outline-blue-600"
                  required
                />
              </div>

              <div className="flex items-center gap-2 text-[12px] text-gray-700">
                <input
                  type="checkbox"
                  id="docketConfiscate"
                  checked={docketConfiscateCheck}
                  onChange={e => setDocketConfiscateCheck(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="docketConfiscate">Examination docket and rough sheets confiscated by lead invigilator</label>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsMalpracticeModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="danger" className="cursor-pointer">
                  File Formal Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* G. Force End Exam Confirm Dialog */}
      {isEndExamConfirmOpen && selectedStudent && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <AlertTriangle className="text-rose-600" size={20} />
                Confirm Force Termination
              </h3>
              <button
                onClick={() => setIsEndExamConfirmOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <p className="text-[14px] text-gray-700">
                Are you sure you want to forcibly submit and terminate the exam for{" "}
                <strong>{selectedStudent.name}</strong> ({selectedStudent.matric})?
              </p>
              <p className="text-[12px] text-gray-500">
                All currently selected answers ({selectedStudent.answeredQuestions} / {selectedStudent.totalQuestions}) will be immediately submitted to the central database and the student terminal will be locked.
              </p>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setIsEndExamConfirmOpen(false)} className="cursor-pointer">
                Cancel
              </Button>
              <Button type="button" variant="danger" onClick={handleForceEndExam} className="cursor-pointer">
                Yes, Force Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
