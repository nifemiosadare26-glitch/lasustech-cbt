"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CalendarRange,
  Radio,
  Users,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  Search,
  Plus,
  Megaphone,
  Monitor,
  Download,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  X,
  RefreshCw,
  Laptop,
  UserCheck,
  ChevronRight,
  Info,
  Sparkles,
  ExternalLink,
  Power,
  RotateCcw,
  FileText
} from "lucide-react";

interface ExamSession {
  id: string;
  courseCode: string;
  courseTitle: string;
  hall: string;
  building: string;
  slot: string;
  startTime: string;
  endTime: string;
  status: "live" | "upcoming" | "completed";
  candidatesCount: number;
  checkedInCount: number;
  onlineCount: number;
  flaggedCount: number;
  offlineCount: number;
  submittedCount: number;
  leadInvigilator: string;
  coInvigilators: string[];
  totalTerminals: number;
  standbyTerminals: number;
}

const initialSessions: ExamSession[] = [
  {
    id: "1",
    courseCode: "CSC 301",
    courseTitle: "Data Structures & Algorithms",
    hall: "Hall A (Terminals 01–120)",
    building: "CBT Centre 1 (Academic Complex)",
    slot: "09:00 AM – 10:30 AM",
    startTime: "09:00 AM",
    endTime: "10:30 AM",
    status: "live",
    candidatesCount: 118,
    checkedInCount: 112,
    onlineCount: 105,
    flaggedCount: 4,
    offlineCount: 3,
    submittedCount: 8,
    leadInvigilator: "Dr. (Mrs.) B. A. Adebayo",
    coInvigilators: ["Mr. K. O. Fashola", "Engr. T. S. Balogun"],
    totalTerminals: 120,
    standbyTerminals: 6
  },
  {
    id: "2",
    courseCode: "MTH 201",
    courseTitle: "Mathematical Methods I",
    hall: "Hall B (Terminals 121–250)",
    building: "CBT Centre 1 (Academic Complex)",
    slot: "11:30 AM – 01:00 PM",
    startTime: "11:30 AM",
    endTime: "01:00 PM",
    status: "upcoming",
    candidatesCount: 142,
    checkedInCount: 45,
    onlineCount: 0,
    flaggedCount: 0,
    offlineCount: 0,
    submittedCount: 0,
    leadInvigilator: "Prof. S. N. Okeke",
    coInvigilators: ["Dr. (Mrs.) B. A. Adebayo", "Mrs. A. M. Adeleke"],
    totalTerminals: 130,
    standbyTerminals: 8
  },
  {
    id: "3",
    courseCode: "GST 111",
    courseTitle: "Communication in English",
    hall: "Mega Hall 1 (Terminals 01–220)",
    building: "Engineering CBT Wing",
    slot: "02:00 PM – 03:30 PM",
    startTime: "02:00 PM",
    endTime: "03:30 PM",
    status: "upcoming",
    candidatesCount: 220,
    checkedInCount: 0,
    onlineCount: 0,
    flaggedCount: 0,
    offlineCount: 0,
    submittedCount: 0,
    leadInvigilator: "Dr. A. O. Williams",
    coInvigilators: ["Dr. (Mrs.) B. A. Adebayo", "Mr. D. I. Adeleke", "Mrs. O. P. George"],
    totalTerminals: 220,
    standbyTerminals: 10
  },
  {
    id: "4",
    courseCode: "PHY 101",
    courseTitle: "General Physics I",
    hall: "Hall A (Terminals 01–120)",
    building: "CBT Centre 1 (Academic Complex)",
    slot: "07:30 AM – 08:45 AM",
    startTime: "07:30 AM",
    endTime: "08:45 AM",
    status: "completed",
    candidatesCount: 115,
    checkedInCount: 115,
    onlineCount: 0,
    flaggedCount: 1,
    offlineCount: 0,
    submittedCount: 115,
    leadInvigilator: "Dr. (Mrs.) B. A. Adebayo",
    coInvigilators: ["Mr. K. O. Fashola"],
    totalTerminals: 120,
    standbyTerminals: 6
  }
];

interface CandidateCheckin {
  id: string;
  name: string;
  matric: string;
  terminal: string;
  docketNumber: string;
  checkedIn: boolean;
  biometricStatus: "verified" | "manual" | "pending";
  photoUrl: string;
}

const mockCandidates: CandidateCheckin[] = [
  { id: "1", name: "Adaeze O. Obi", matric: "CSC/22/101", terminal: "PC-01", docketNumber: "DOC-2026-901", checkedIn: true, biometricStatus: "verified", photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" },
  { id: "2", name: "Tunde Babatunde", matric: "CSC/22/117", terminal: "PC-14", docketNumber: "DOC-2026-914", checkedIn: true, biometricStatus: "verified", photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop" },
  { id: "3", name: "Ifeoma Adeleke", matric: "CSC/22/122", terminal: "PC-22", docketNumber: "DOC-2026-922", checkedIn: true, biometricStatus: "verified", photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" },
  { id: "4", name: "Zainab Kano", matric: "CSC/22/130", terminal: "PC-35", docketNumber: "DOC-2026-935", checkedIn: true, biometricStatus: "verified", photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop" },
  { id: "5", name: "Chinedu Madu", matric: "CSC/22/045", terminal: "PC-48", docketNumber: "DOC-2026-948", checkedIn: true, biometricStatus: "verified", photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop" },
  { id: "6", name: "Sarah John", matric: "CSC/22/089", terminal: "PC-61", docketNumber: "DOC-2026-961", checkedIn: false, biometricStatus: "pending", photoUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop" },
  { id: "7", name: "Olamide Bakare", matric: "CSC/22/155", terminal: "PC-70", docketNumber: "DOC-2026-970", checkedIn: false, biometricStatus: "pending", photoUrl: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&h=100&fit=crop" },
  { id: "8", name: "Fatima Aliyu", matric: "CSC/22/201", terminal: "PC-88", docketNumber: "DOC-2026-988", checkedIn: true, biometricStatus: "manual", photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop" },
];

export default function InvigilatorPage() {
  const router = useRouter();
  const [sessions, setSessions] = React.useState<ExamSession[]>(initialSessions);
  const [selectedFilter, setSelectedFilter] = React.useState<"all" | "live" | "upcoming" | "completed">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Countdown timer for active exam
  const [timeLeft, setTimeLeft] = React.useState(2478); // seconds (41m 18s)

  // Modals state
  const [isIncidentModalOpen, setIsIncidentModalOpen] = React.useState(false);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = React.useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = React.useState(false);
  const [isTerminalModalOpen, setIsTerminalModalOpen] = React.useState(false);
  const [isSessionSummaryModalOpen, setIsSessionSummaryModalOpen] = React.useState(false);
  const [isPreCheckModalOpen, setIsPreCheckModalOpen] = React.useState(false);
  const [selectedSessionForModal, setSelectedSessionForModal] = React.useState<ExamSession>(initialSessions[0]);

  // Incident form state
  const [incidentSession, setIncidentSession] = React.useState("CSC 301");
  const [incidentCategory, setIncidentCategory] = React.useState("Malpractice & Whispering");
  const [incidentCandidate, setIncidentCandidate] = React.useState("");
  const [incidentTerminal, setIncidentTerminal] = React.useState("");
  const [incidentSeverity, setIncidentSeverity] = React.useState("Medium");
  const [incidentDescription, setIncidentDescription] = React.useState("");
  const [incidentActionTaken, setIncidentActionTaken] = React.useState("Verbal warning issued & logged on console");

  // Broadcast form state
  const [broadcastTarget, setBroadcastTarget] = React.useState("All Hall Terminals");
  const [broadcastPriority, setBroadcastPriority] = React.useState("Information");
  const [broadcastMessage, setBroadcastMessage] = React.useState("");

  // Checkin state
  const [candidatesList, setCandidatesList] = React.useState<CandidateCheckin[]>(mockCandidates);
  const [checkinSearch, setCheckinSearch] = React.useState("");
  const [checkinFilter, setCheckinFilter] = React.useState<"all" | "checked_in" | "pending">("all");
  const [standbySelected, setStandbySelected] = React.useState("PC-115");

  // Terminal health inspect state
  const [selectedTerminalInspect, setSelectedTerminalInspect] = React.useState<string | null>(null);

  // Countdown effect
  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesFilter = selectedFilter === "all" || session.status === selectedFilter;
    const matchesSearch =
      session.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.hall.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const activeSession = sessions.find(s => s.status === "live") || sessions[0];

  // Export Attendance CSV handler
  const handleExportAttendance = (session: ExamSession) => {
    const headers = "Candidate Name,Matric Number,Docket Number,Terminal ID,Status,Biometric Verified,Timestamp\n";
    const rows = candidatesList
      .map(
        c =>
          `"${c.name}","${c.matric}","${c.docketNumber}","${c.terminal}","${c.checkedIn ? "Present" : "Absent"}","${
            c.biometricStatus
          }","2026-10-07 09:05:00"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${session.courseCode.replace(/\s+/g, "_")}_Attendance_Docket_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Official attendance docket for ${session.courseCode} exported successfully.`);
  };

  // Submit incident
  const handleSaveIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!incidentDescription.trim()) {
      showToast("Please enter detailed incident notes.");
      return;
    }
    setIsIncidentModalOpen(false);
    showToast(`Incident report successfully logged for ${incidentCandidate || "General Hall"} (${incidentCategory}). Chief Exam Officer notified.`);
    setIncidentDescription("");
    setIncidentCandidate("");
    setIncidentTerminal("");
  };

  // Submit broadcast
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastMessage.trim()) {
      showToast("Please enter an announcement message.");
      return;
    }
    setIsBroadcastModalOpen(false);
    showToast(`Broadcast transmitted to ${broadcastTarget}: "${broadcastMessage.slice(0, 40)}..."`);
    setBroadcastMessage("");
  };

  // Toggle checkin
  const toggleCandidateCheckin = (id: string) => {
    setCandidatesList(prev =>
      prev.map(c => {
        if (c.id === id) {
          const nextState = !c.checkedIn;
          showToast(nextState ? `Checked in ${c.name} at ${c.terminal}` : `Marked ${c.name} as pending`);
          return {
            ...c,
            checkedIn: nextState,
            biometricStatus: nextState ? (c.biometricStatus === "pending" ? "verified" : c.biometricStatus) : "pending"
          };
        }
        return c;
      })
    );
  };

  // Reassign terminal
  const handleReassignTerminal = (candidateId: string, targetPC: string) => {
    setCandidatesList(prev =>
      prev.map(c => {
        if (c.id === candidateId) {
          showToast(`Transferred ${c.name} to hot-standby workstation ${targetPC}. Terminal sync active.`);
          return { ...c, terminal: targetPC };
        }
        return c;
      })
    );
  };

  // Filtered candidate checkin list
  const filteredCandidates = candidatesList
    .filter(c => {
      if (checkinFilter === "checked_in") return c.checkedIn;
      if (checkinFilter === "pending") return !c.checkedIn;
      return true;
    })
    .filter(
      c =>
        c.name.toLowerCase().includes(checkinSearch.toLowerCase()) ||
        c.matric.toLowerCase().includes(checkinSearch.toLowerCase()) ||
        c.terminal.toLowerCase().includes(checkinSearch.toLowerCase())
    );

  return (
    <div className="space-y-6 pb-12">
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

      {/* 1. Header & Duty Shift Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2.5 mb-2">
            <span className="text-[12px] font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-200">
              Invigilator Command Centre
            </span>
            <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              On Active Duty • Morning Shift
            </span>
            <span className="text-[12px] text-gray-500 font-medium">Shift: 08:00 AM – 02:00 PM</span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            Welcome, Dr. (Mrs.) B. A. Adebayo
          </h1>
          <p className="text-[14px] text-gray-600 mt-1 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-1.5 text-gray-700">
              <MapPin size={15} className="text-gray-400" />
              <strong>Station:</strong> LASUSTECH CBT Centre 1 (Halls A & B)
            </span>
            <span className="text-gray-400">•</span>
            <span>
              <strong>Staff ID:</strong> INV-2026-042
            </span>
            <span className="text-gray-400">•</span>
            <span>
              <strong>Exam Date:</strong> Wednesday, 7th October 2026
            </span>
          </p>
        </div>

        {/* Global Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            onClick={() => {
              setSelectedSessionForModal(activeSession);
              setIsCheckinModalOpen(true);
            }}
            className="flex items-center gap-2 h-10 text-[13px] font-semibold cursor-pointer"
          >
            <UserCheck size={16} className="text-blue-600" />
            Hall Check-In
          </Button>

          <Button
            variant="secondary"
            onClick={() => {
              setSelectedSessionForModal(activeSession);
              setIsBroadcastModalOpen(true);
            }}
            className="flex items-center gap-2 h-10 text-[13px] font-semibold cursor-pointer"
          >
            <Megaphone size={16} className="text-amber-600" />
            Announcement
          </Button>

          <Button
            variant="secondary"
            onClick={() => setIsTerminalModalOpen(true)}
            className="flex items-center gap-2 h-10 text-[13px] font-semibold cursor-pointer"
          >
            <Monitor size={16} className="text-purple-600" />
            Terminal Health
          </Button>

          <Button
            variant="primary"
            onClick={() => {
              setSelectedSessionForModal(activeSession);
              setIsIncidentModalOpen(true);
            }}
            className="flex items-center gap-2 h-10 text-[13px] font-semibold shadow-xs cursor-pointer"
          >
            <ShieldAlert size={16} />
            Log Incident
          </Button>
        </div>
      </div>

      {/* 2. Stat KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Assigned Sessions Today</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <CalendarRange size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">4</span>
            <span className="text-[12px] font-semibold text-emerald-600">1 Live • 2 Upcoming</span>
          </div>
          <p className="text-[12px] text-gray-500 mt-1">Total assigned slots for your shift</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-blue-300 transition-colors">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Current Session Seated</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {activeSession.checkedInCount} / {activeSession.candidatesCount}
            </span>
            <span className="text-[12px] font-bold text-emerald-600">94.9%</span>
          </div>
          <div className="w-full bg-gray-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${(activeSession.checkedInCount / activeSession.candidatesCount) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Active Proctoring Flags</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">4</span>
            <span className="text-[12px] font-semibold text-gray-500">Require inspection</span>
          </div>
          <p className="text-[12px] text-amber-700 font-medium mt-1">2 tab switches • 1 offline • 1 gaze away</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Hot-Standby Terminals</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Laptop size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">6 / 6 Ready</span>
            <span className="text-[12px] font-semibold text-purple-600">Halls A & B</span>
          </div>
          <p className="text-[12px] text-gray-500 mt-1">Instant hot-swap machines pre-synced</p>
        </div>
      </div>

      {/* 3. Hero Active Exam Spotlight (Live Now) */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 sm:p-7 shadow-lg relative overflow-hidden border border-blue-800">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-bold bg-emerald-500 text-white shadow-xs animate-pulse">
                <span className="w-2 h-2 rounded-full bg-white" />
                LIVE IN PROGRESS
              </span>
              <span className="text-[13px] font-mono font-semibold bg-white/10 px-3 py-1 rounded-full text-blue-200 border border-white/10">
                Slot: {activeSession.slot}
              </span>
              <span className="text-[13px] text-slate-300 flex items-center gap-1">
                <MapPin size={14} className="text-blue-300" />
                {activeSession.building} • {activeSession.hall}
              </span>
            </div>

            <div>
              <div className="flex items-baseline gap-3">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                  {activeSession.courseCode}: {activeSession.courseTitle}
                </h2>
              </div>
              <p className="text-blue-100 text-[14px] mt-1">
                Lead Proctors: <span className="font-semibold">{activeSession.leadInvigilator}</span>, co-assigned with{" "}
                {activeSession.coInvigilators.join(", ")}.
              </p>
            </div>

            {/* Real-time Telemetry Mini Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-blue-200 uppercase font-semibold">Active Online</span>
                <p className="text-xl font-bold text-white mt-0.5">{activeSession.onlineCount} Candidates</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-amber-200 uppercase font-semibold">Flagged Alerts</span>
                <p className="text-xl font-bold text-amber-300 mt-0.5">{activeSession.flaggedCount} Flags</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-rose-200 uppercase font-semibold">Offline Disconnects</span>
                <p className="text-xl font-bold text-rose-300 mt-0.5">{activeSession.offlineCount} Terminals</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <span className="text-[11px] text-emerald-200 uppercase font-semibold">Submitted</span>
                <p className="text-xl font-bold text-emerald-300 mt-0.5">{activeSession.submittedCount} Completed</p>
              </div>
            </div>
          </div>

          {/* Countdown & Action Launch Button */}
          <div className="flex flex-col sm:flex-row lg:flex-col items-center lg:items-end gap-4 shrink-0 bg-white/5 lg:bg-transparent p-4 lg:p-0 rounded-xl border border-white/10 lg:border-none">
            <div className="text-center lg:text-right">
              <span className="text-[12px] font-semibold text-blue-200 uppercase tracking-wider block">Remaining Time</span>
              <div className="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-0.5 flex items-center justify-center lg:justify-end gap-2">
                <Clock className="text-blue-400" size={26} />
                {formatTime(timeLeft)}
              </div>
              <span className="text-[11px] text-blue-300 block mt-1">Closing prompt at 10:30 AM prompt</span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
              <Button
                onClick={() => router.push(`/invigilator/live/${activeSession.id}`)}
                className="w-full sm:w-auto bg-blue-500 hover:bg-blue-400 text-white font-bold h-11 px-5 shadow-lg flex items-center justify-center gap-2 text-[14px] cursor-pointer"
              >
                <Radio size={18} className="animate-pulse text-white" />
                Launch Live Monitor
                <ArrowRight size={16} />
              </Button>

              <Button
                variant="secondary"
                onClick={() => handleExportAttendance(activeSession)}
                className="w-full sm:w-auto bg-white/15 hover:bg-white/25 text-white border-white/20 h-11 px-4 text-[13px] font-medium cursor-pointer"
              >
                <Download size={16} className="mr-1.5" />
                Attendance CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Schedule Tabs & Search */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Today's Examination Schedule</h3>
            <p className="text-[13px] text-gray-500">Review all active, upcoming, and past sessions under your invigilation.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search course, code, hall..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-[13px]"
              />
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedFilter("all")}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === "all" ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Sessions ({sessions.length})
          </button>
          <button
            onClick={() => setSelectedFilter("live")}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              selectedFilter === "live" ? "bg-emerald-600 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Live Now ({sessions.filter(s => s.status === "live").length})
          </button>
          <button
            onClick={() => setSelectedFilter("upcoming")}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === "upcoming" ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Upcoming ({sessions.filter(s => s.status === "upcoming").length})
          </button>
          <button
            onClick={() => setSelectedFilter("completed")}
            className={`px-3.5 py-1.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
              selectedFilter === "completed" ? "bg-blue-600 text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Completed ({sessions.filter(s => s.status === "completed").length})
          </button>
        </div>

        {/* Sessions Grid */}
        <div className="space-y-4">
          {filteredSessions.map(session => {
            const isLive = session.status === "live";
            const isUpcoming = session.status === "upcoming";
            const isCompleted = session.status === "completed";

            return (
              <div
                key={session.id}
                className={`border rounded-xl p-5 transition-all ${
                  isLive
                    ? "border-blue-400 bg-blue-50/20 ring-1 ring-blue-300 shadow-xs"
                    : isUpcoming
                    ? "border-gray-200 bg-white hover:border-gray-300"
                    : "border-gray-200 bg-gray-50/50 opacity-90"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-base font-bold text-gray-900 bg-gray-100 px-2.5 py-0.5 rounded-md border border-gray-200">
                        {session.courseCode}
                      </span>
                      <h4 className="text-base font-bold text-gray-900">{session.courseTitle}</h4>
                      {isLive && (
                        <Badge variant="success" className="animate-pulse">
                          ● IN PROGRESS
                        </Badge>
                      )}
                      {isUpcoming && <Badge variant="blue-tint">UPCOMING</Badge>}
                      {isCompleted && <Badge variant="gray-tint">COMPLETED</Badge>}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[13px] text-gray-600">
                      <span className="flex items-center gap-1.5">
                        <Clock size={15} className="text-gray-400" />
                        <strong>Time:</strong> {session.slot}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={15} className="text-gray-400" />
                        <strong>Venue:</strong> {session.hall} ({session.building})
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Users size={15} className="text-gray-400" />
                        <strong>Candidates:</strong> {session.checkedInCount} / {session.candidatesCount} seated
                      </span>
                    </div>

                    <div className="text-[12px] text-gray-500">
                      Lead Invigilator: <span className="text-gray-800 font-semibold">{session.leadInvigilator}</span>
                      {session.coInvigilators.length > 0 && <span> • Assistants: {session.coInvigilators.join(", ")}</span>}
                    </div>
                  </div>

                  {/* Actions for this session */}
                  <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-gray-100">
                    {isLive && (
                      <Button
                        onClick={() => router.push(`/invigilator/live/${session.id}`)}
                        className="h-9 px-4 text-[13px] font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Radio size={14} className="animate-pulse" />
                        Live Monitor
                      </Button>
                    )}

                    {isUpcoming && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setSelectedSessionForModal(session);
                          setIsPreCheckModalOpen(true);
                        }}
                        className="h-9 px-3.5 text-[13px] font-semibold cursor-pointer"
                      >
                        <CheckCircle2 size={14} className="mr-1.5" />
                        Pre-Check Session
                      </Button>
                    )}

                    {isCompleted && (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setSelectedSessionForModal(session);
                          setIsSessionSummaryModalOpen(true);
                        }}
                        className="h-9 px-3.5 text-[13px] font-semibold cursor-pointer"
                      >
                        <FileText size={14} className="mr-1.5 text-blue-600" />
                        Session Summary
                      </Button>
                    )}

                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedSessionForModal(session);
                        setIsCheckinModalOpen(true);
                      }}
                      className="h-9 px-3.5 text-[13px] font-semibold cursor-pointer"
                    >
                      <UserCheck size={14} className="mr-1.5 text-blue-600" />
                      Candidate List
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedSessionForModal(session);
                        setIsBroadcastModalOpen(true);
                      }}
                      className="h-9 px-3.5 text-[13px] font-semibold cursor-pointer"
                    >
                      <Megaphone size={14} className="mr-1.5 text-amber-600" />
                      Broadcast
                    </Button>

                    <Button
                      variant="secondary"
                      onClick={() => handleExportAttendance(session)}
                      className="h-9 px-3.5 text-[13px] font-semibold cursor-pointer"
                      title="Export Attendance Sheet as CSV"
                    >
                      <Download size={14} className="mr-1 text-gray-600" />
                      CSV
                    </Button>

                    <Button
                      variant="tertiary"
                      onClick={() => {
                        setSelectedSessionForModal(session);
                        setIncidentSession(session.courseCode);
                        setIsIncidentModalOpen(true);
                      }}
                      className="h-9 px-3 text-[13px] text-rose-600 hover:bg-rose-50 hover:text-rose-700 font-semibold cursor-pointer"
                    >
                      <ShieldAlert size={14} className="mr-1" />
                      Incident
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <CalendarRange className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-[14px] font-medium text-gray-900">No sessions match your filter criteria.</p>
              <p className="text-[12px] text-gray-500 mt-0.5">Try clearing your search query or switching filters.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSelectedFilter("all");
                  setSearchQuery("");
                }}
                className="mt-3 cursor-pointer"
              >
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 5. MODAL: Candidate Check-in & Biometrics */}
      {isCheckinModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserCheck className="text-blue-600" size={20} />
                  Candidate Seating & Biometric Check-In
                </h3>
                <p className="text-[13px] text-gray-500">
                  {selectedSessionForModal.courseCode} ({selectedSessionForModal.hall}) • Verify identity dockets and admit to terminals.
                </p>
              </div>
              <button
                onClick={() => setIsCheckinModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Checkin Search, Filter Tabs & Standby PC selector */}
            <div className="py-4 space-y-3">
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                  <Input
                    placeholder="Search candidate name, matric, or PC..."
                    value={checkinSearch}
                    onChange={e => setCheckinSearch(e.target.value)}
                    className="pl-9 h-9 text-[13px]"
                  />
                </div>

                <div className="flex flex-wrap items-center gap-2 text-[12px] font-semibold">
                  {/* Filter tabs */}
                  <div className="flex rounded-lg border border-gray-200 p-0.5 bg-gray-50">
                    <button
                      type="button"
                      onClick={() => setCheckinFilter("all")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                        checkinFilter === "all" ? "bg-white text-blue-700 shadow-xs" : "text-gray-600"
                      }`}
                    >
                      All ({candidatesList.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckinFilter("checked_in")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                        checkinFilter === "checked_in" ? "bg-white text-emerald-700 shadow-xs" : "text-gray-600"
                      }`}
                    >
                      Admitted ({candidatesList.filter(c => c.checkedIn).length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckinFilter("pending")}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold cursor-pointer ${
                        checkinFilter === "pending" ? "bg-white text-amber-700 shadow-xs" : "text-gray-600"
                      }`}
                    >
                      Pending ({candidatesList.filter(c => !c.checkedIn).length})
                    </button>
                  </div>

                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => {
                      setCandidatesList(prev => prev.map(c => ({ ...c, checkedIn: true, biometricStatus: "verified" })));
                      showToast("All eligible candidates marked as checked in.");
                    }}
                    className="h-8 text-[12px] cursor-pointer"
                  >
                    Admit All
                  </Button>
                </div>
              </div>

              {/* Standby PC selector bar */}
              <div className="flex items-center gap-2 p-2.5 bg-purple-50 border border-purple-200 rounded-xl text-[12px]">
                <Laptop size={15} className="text-purple-700 shrink-0" />
                <span className="font-semibold text-purple-900">Target Hot-Standby PC for Swaps:</span>
                <select
                  value={standbySelected}
                  onChange={e => setStandbySelected(e.target.value)}
                  className="bg-white border border-purple-300 rounded px-2 py-1 text-purple-900 font-bold focus:outline-blue-600"
                >
                  <option value="PC-115">PC-115 (Standby Spare 1)</option>
                  <option value="PC-116">PC-116 (Standby Spare 2)</option>
                  <option value="PC-117">PC-117 (Standby Spare 3)</option>
                  <option value="PC-118">PC-118 (Standby Spare 4)</option>
                  <option value="PC-119">PC-119 (Standby Spare 5)</option>
                  <option value="PC-120">PC-120 (Standby Spare 6)</option>
                </select>
                <span className="text-purple-700 text-[11px] ml-auto hidden sm:inline">
                  Click "Hot-Swap PC" on candidate row to transfer
                </span>
              </div>
            </div>

            {/* Candidate List Scrollable */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 border border-gray-200 rounded-xl pr-1">
              {filteredCandidates.map(candidate => (
                <div key={candidate.id} className="p-3.5 flex items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 border border-blue-200">
                      {candidate.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-[14px] font-bold text-gray-900">{candidate.name}</h4>
                        <span className="font-mono text-[12px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-semibold">
                          {candidate.matric}
                        </span>
                      </div>
                      <p className="text-[12px] text-gray-500 mt-0.5">
                        Assigned Seat: <strong className="text-gray-900">{candidate.terminal}</strong> • Docket: {candidate.docketNumber}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    {candidate.checkedIn ? (
                      <span className="inline-flex items-center gap-1 text-[12px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Admitted
                      </span>
                    ) : (
                      <span className="text-[12px] font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                        Pending
                      </span>
                    )}

                    <Button
                      size="sm"
                      variant={candidate.checkedIn ? "secondary" : "primary"}
                      onClick={() => toggleCandidateCheckin(candidate.id)}
                      className="h-8 text-[12px] font-semibold cursor-pointer"
                    >
                      {candidate.checkedIn ? "Undo" : "Admit & Verify"}
                    </Button>

                    <Button
                      size="sm"
                      variant="tertiary"
                      onClick={() => handleReassignTerminal(candidate.id, standbySelected)}
                      className="h-8 text-[12px] text-purple-700 hover:bg-purple-50 font-bold cursor-pointer"
                      title={`Reassign to ${standbySelected}`}
                    >
                      Hot-Swap to {standbySelected}
                    </Button>
                  </div>
                </div>
              ))}

              {filteredCandidates.length === 0 && (
                <div className="text-center py-8 text-gray-500 text-[13px]">
                  No candidates match your search or filter.
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-gray-200 flex justify-between items-center">
              <span className="text-[12px] text-gray-500">
                Official docket verification conforms to LASUSTECH Examination Regulations.
              </span>
              <Button variant="secondary" onClick={() => setIsCheckinModalOpen(false)} className="cursor-pointer">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL: Log Incident & Malpractice */}
      {isIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ShieldAlert className="text-rose-600" size={20} />
                  Log Hall Incident & Malpractice
                </h3>
                <p className="text-[13px] text-gray-500">Official log sent directly to Chief Exam Officer & Academic Disciplinary Committee.</p>
              </div>
              <button
                onClick={() => setIsIncidentModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveIncident} className="space-y-4 py-4 overflow-y-auto flex-1">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Session / Course</label>
                <select
                  value={incidentSession}
                  onChange={e => setIncidentSession(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[14px] bg-white focus:outline-blue-600"
                >
                  {sessions.map(s => (
                    <option key={s.id} value={s.courseCode}>
                      {s.courseCode} - {s.courseTitle} ({s.hall})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Incident Category</label>
                <select
                  value={incidentCategory}
                  onChange={e => setIncidentCategory(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[14px] bg-white focus:outline-blue-600"
                >
                  <option>Malpractice: Whispering / Collaboration</option>
                  <option>Malpractice: Unauthorized Device / Phone / Smartwatch</option>
                  <option>Malpractice: Unauthorized Paper / External Notes</option>
                  <option>Proctoring Alert: Persistent Tab Switching & Screen Breach</option>
                  <option>Technical: Workstation Freeze / Hardware Replacement</option>
                  <option>Infrastructure: NEPA Power Blink / UPS Switch Delay</option>
                  <option>Identity Discrepancy: Missing Docket / Biometric Failure</option>
                  <option>Disciplinary: Disobedience to Invigilator Instructions</option>
                  <option>Medical Emergency in Hall</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Candidate Name / Matric (Optional)</label>
                  <Input
                    placeholder="e.g. Tunde Balogun (CSC/22/117)"
                    value={incidentCandidate}
                    onChange={e => setIncidentCandidate(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Terminal ID</label>
                  <Input
                    placeholder="e.g. PC-14 (CBT Centre 1)"
                    value={incidentTerminal}
                    onChange={e => setIncidentTerminal(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Severity Level</label>
                <div className="flex gap-2">
                  {["Low", "Medium", "High", "Critical"].map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setIncidentSeverity(sev)}
                      className={`flex-1 py-2 text-[13px] font-bold rounded-lg border transition-all cursor-pointer ${
                        incidentSeverity === sev
                          ? sev === "Critical"
                            ? "bg-rose-600 text-white border-rose-600"
                            : sev === "High"
                            ? "bg-amber-600 text-white border-amber-600"
                            : "bg-blue-600 text-white border-blue-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Detailed Incident Observation</label>
                <textarea
                  rows={3}
                  value={incidentDescription}
                  onChange={e => setIncidentDescription(e.target.value)}
                  placeholder="Describe exact sequence of events, items confiscated (if any), and candidate response..."
                  className="w-full p-3 rounded-lg border border-gray-300 text-[13px] focus:outline-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Immediate Action Taken</label>
                <select
                  value={incidentActionTaken}
                  onChange={e => setIncidentActionTaken(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] bg-white focus:outline-blue-600"
                >
                  <option>Verbal warning issued & logged on console</option>
                  <option>Candidate reseated to frontline proctor desk</option>
                  <option>Candidate moved to Standby PC due to hardware fault</option>
                  <option>Session paused pending Lead Invigilator review</option>
                  <option>Unauthorized materials confiscated & form signed</option>
                  <option>Exam immediately terminated & student escorted to officer</option>
                </select>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[12px] text-amber-800">
                Logged reports are cryptographically timestamped and attached to the session audit trail.
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsIncidentModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="danger" className="cursor-pointer">
                  Submit Official Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. MODAL: Emergency Hall Broadcast */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Megaphone className="text-amber-600" size={20} />
                  Emergency Hall Broadcast
                </h3>
                <p className="text-[13px] text-gray-500">Transmits real-time banner alert across student exam monitors.</p>
              </div>
              <button
                onClick={() => setIsBroadcastModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-4 py-4">
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Target Terminals</label>
                <select
                  value={broadcastTarget}
                  onChange={e => setBroadcastTarget(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[14px] bg-white focus:outline-blue-600"
                >
                  <option>All Hall Terminals ({selectedSessionForModal.hall})</option>
                  <option>Flagged Candidates Only (4 Terminals)</option>
                  <option>Terminals 01 – 60 (Front Section)</option>
                  <option>Terminals 61 – 120 (Rear Section)</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Message Priority</label>
                <div className="flex gap-2">
                  {["Information", "Warning Alert", "Critical / Action Required"].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setBroadcastPriority(p)}
                      className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg border transition-all cursor-pointer ${
                        broadcastPriority === p
                          ? "bg-amber-600 text-white border-amber-600"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Quick Preset Announcements</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {[
                    "15 Minutes Remaining: Review all unanswered questions.",
                    "Reminder: Do not minimize screen or touch keyboard shortcuts.",
                    "Ensure rough calculation paper is signed by proctor.",
                    "Power switchover complete: Your answers are saved, continue calmly."
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setBroadcastMessage(preset)}
                      className="text-[11px] bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1 rounded-md font-medium text-left cursor-pointer"
                    >
                      {preset.slice(0, 38)}...
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Broadcast Message Body</label>
                <textarea
                  rows={3}
                  value={broadcastMessage}
                  onChange={e => setBroadcastMessage(e.target.value)}
                  placeholder="Type broadcast text displayed on students' monitors..."
                  className="w-full p-3 rounded-lg border border-gray-300 text-[13px] focus:outline-blue-600"
                  required
                />
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsBroadcastModalOpen(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button type="submit" variant="primary" className="cursor-pointer">
                  Transmit Broadcast Now
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL: Terminal Workstation Health & Readiness */}
      {isTerminalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Monitor className="text-purple-600" size={20} />
                  Hall Workstation Fleet & Hot-Standby Health
                </h3>
                <p className="text-[13px] text-gray-500">CBT Centre 1 (120 Total Terminals • 6 Dedicated Hot-Spares)</p>
              </div>
              <button
                onClick={() => setIsTerminalModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-4 gap-3">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-center">
                  <span className="text-[11px] text-emerald-800 font-bold uppercase">Online & Engaged</span>
                  <p className="text-xl font-bold text-emerald-700">105 PCs</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-center">
                  <span className="text-[11px] text-amber-800 font-bold uppercase">Proctor Alert</span>
                  <p className="text-xl font-bold text-amber-700">4 PCs</p>
                </div>
                <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-center">
                  <span className="text-[11px] text-rose-800 font-bold uppercase">Offline / Reconnecting</span>
                  <p className="text-xl font-bold text-rose-700">3 PCs</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-center">
                  <span className="text-[11px] text-purple-800 font-bold uppercase">Hot-Standby</span>
                  <p className="text-xl font-bold text-purple-700">6 PCs Ready</p>
                </div>
              </div>

              <div>
                <h4 className="text-[13px] font-bold text-gray-900 mb-2">Click any Hot-Standby Machine to Test / Ping:</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[12px]">
                  {[
                    { id: "PC-115", loc: "Lab A Front", ip: "192.168.1.215" },
                    { id: "PC-116", loc: "Lab A Front", ip: "192.168.1.216" },
                    { id: "PC-117", loc: "Lab A Mid", ip: "192.168.1.217" },
                    { id: "PC-118", loc: "Lab A Mid", ip: "192.168.1.218" },
                    { id: "PC-119", loc: "Lab A Back", ip: "192.168.1.219" },
                    { id: "PC-120", loc: "Lab A Back", ip: "192.168.1.220" }
                  ].map(spare => (
                    <div
                      key={spare.id}
                      onClick={() => {
                        setSelectedTerminalInspect(spare.id);
                        showToast(`Workstation ${spare.id} ping successful (14ms latency). Ready for hot-swap.`);
                      }}
                      className="p-3 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-xl flex items-center justify-between cursor-pointer transition-all shadow-2xs"
                    >
                      <div>
                        <span className="font-bold text-purple-900 block">{spare.id}</span>
                        <span className="text-[11px] text-purple-700">{spare.loc}</span>
                      </div>
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
                <h4 className="text-[13px] font-bold text-gray-900">Workstation Hot-Swap Procedure:</h4>
                <p className="text-[12px] text-gray-600">
                  If any student encounters a mouse, keyboard, or monitor freeze, do not restart during active testing. Walk the student to an adjacent hot-standby machine, click <strong>"Hot-Swap PC"</strong> in the candidate list, and enter their matric. The CBT engine transfers their exact question state in under 5 seconds.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => showToast("Diagnostic ping sent to all 120 workstations. All switches healthy.")}
                className="cursor-pointer"
              >
                <RefreshCw size={14} className="mr-1.5" />
                Ping All 120 Workstations
              </Button>
              <Button variant="secondary" onClick={() => setIsTerminalModalOpen(false)} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 9. MODAL: Session Summary (For Completed Sessions) */}
      {isSessionSummaryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                  Session Concluded: {selectedSessionForModal.courseCode}
                </h3>
                <p className="text-[13px] text-gray-500">{selectedSessionForModal.courseTitle} • {selectedSessionForModal.slot}</p>
              </div>
              <button
                onClick={() => setIsSessionSummaryModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-[13px]">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase">Total Seated</span>
                  <p className="text-xl font-bold text-gray-900 mt-0.5">
                    {selectedSessionForModal.checkedInCount} / {selectedSessionForModal.candidatesCount}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase">Submissions</span>
                  <p className="text-xl font-bold text-emerald-700 mt-0.5">100% Completed</p>
                </div>
              </div>

              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200 text-blue-900 space-y-1">
                <p className="font-bold">Lead Invigilator Sign-Off</p>
                <p className="text-[12px]">Signed by: {selectedSessionForModal.leadInvigilator} at 08:48 AM</p>
                <p className="text-[12px] text-blue-700">Audit hash: SHA256-PHY101-LASUSTECH-20261007</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleExportAttendance(selectedSessionForModal)}
                className="cursor-pointer"
              >
                <Download size={14} className="mr-1.5" />
                Download Final Docket CSV
              </Button>
              <Button variant="secondary" onClick={() => setIsSessionSummaryModalOpen(false)} className="cursor-pointer">
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 10. MODAL: Pre-Check Session (For Upcoming Sessions) */}
      {isPreCheckModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 className="text-blue-600" size={20} />
                  Pre-Check Session: {selectedSessionForModal.courseCode}
                </h3>
                <p className="text-[13px] text-gray-500">{selectedSessionForModal.courseTitle} • Starts at {selectedSessionForModal.startTime}</p>
              </div>
              <button
                onClick={() => setIsPreCheckModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-[13px]">
              <div className="space-y-2">
                {[
                  "All workstation screens cleared and locked to LASUSTECH Kiosk",
                  "Rough sheets stamped with official CBT Centre date stamp",
                  "Backup power generator online and synchronization verified",
                  "Local offline cache server synced with questions and answer keys"
                ].map((item, idx) => (
                  <label key={idx} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-lg border border-gray-200 cursor-pointer">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600" />
                    <span className="text-gray-800 font-medium text-[12px]">{item}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  showToast(`Workstation diagnostic run for ${selectedSessionForModal.courseCode}. All ${selectedSessionForModal.totalTerminals} terminals ready.`);
                }}
                className="cursor-pointer"
              >
                <RefreshCw size={14} className="mr-1.5" />
                Run Terminal Self-Test
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  showToast(`Pre-flight checks verified for ${selectedSessionForModal.courseCode}. Ready for candidate admission.`);
                  setIsPreCheckModalOpen(false);
                }}
                className="cursor-pointer"
              >
                Approve & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
