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
  Monitor,
  Download,
  ShieldAlert,
  ArrowRight,
  Filter,
  Check,
  X,
  RefreshCw,
  Power,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

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
}

const initialSessions: ExamSession[] = [
  {
    id: "1",
    courseCode: "CSC 301",
    courseTitle: "Data Structures & Algorithms",
    hall: "Hall A (Terminals 01–120)",
    building: "CBT Centre 1",
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
  },
  {
    id: "2",
    courseCode: "MTH 201",
    courseTitle: "Mathematical Methods I",
    hall: "Hall B (Terminals 121–250)",
    building: "CBT Centre 1",
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
    coInvigilators: ["Dr. (Mrs.) B. A. Adebayo"],
    totalTerminals: 130,
  },
  {
    id: "3",
    courseCode: "GST 101",
    courseTitle: "Use of English",
    hall: "Hall C (Terminals 01–200)",
    building: "CBT Centre 2",
    slot: "08:00 AM – 09:30 AM",
    startTime: "08:00 AM",
    endTime: "09:30 AM",
    status: "completed",
    candidatesCount: 195,
    checkedInCount: 192,
    onlineCount: 0,
    flaggedCount: 2,
    offlineCount: 0,
    submittedCount: 192,
    leadInvigilator: "Dr. F. O. Sanusi",
    coInvigilators: ["Mrs. T. A. Bello"],
    totalTerminals: 200,
  },
];

export default function AdminLiveInvigilation() {
  const router = useRouter();
  const [sessions, setSessions] = React.useState<ExamSession[]>(initialSessions);
  const [selectedFilter, setSelectedFilter] = React.useState<string>("all");
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredSessions = sessions.filter((s) => {
    const matchesFilter = selectedFilter === "all" || s.status === selectedFilter;
    const matchesSearch =
      s.courseCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.courseTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.building.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const liveSession = sessions.find((s) => s.status === "live");

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
            </span>
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Live Invigilation Console
            </span>
          </div>
          <h2 className="text-[26px] font-bold text-gray-900 tracking-tight">
            Today&apos;s Examinations & Live Sessions
          </h2>
          <p className="text-[14px] text-gray-500">
            Real-time terminal supervision, candidate verification, and emergency exam controls.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/incidents">
            <Button variant="outline" className="text-rose-600 border-rose-200 hover:bg-rose-50">
              <ShieldAlert className="mr-2" size={16} /> Incident Reports
            </Button>
          </Link>
          {liveSession && (
            <Link href={`/admin/live/${liveSession.id}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-2xs">
                <Radio className="mr-2" size={16} /> Open Terminal Grid
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Real-time KPI Stats Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Active Candidates</span>
            <Users size={16} className="text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {liveSession ? liveSession.onlineCount : 0}
            <span className="text-xs text-gray-400 font-normal ml-1.5">
              / {liveSession ? liveSession.candidatesCount : 0}
            </span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium">94% Check-in rate</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Submitted Papers</span>
            <CheckCircle2 size={16} className="text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-gray-900">
            {liveSession ? liveSession.submittedCount : 0}
          </div>
          <span className="text-[11px] text-gray-500 font-medium">Verified by server</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Flagged Terminals</span>
            <AlertTriangle size={16} className="text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {liveSession ? liveSession.flaggedCount : 0}
          </div>
          <span className="text-[11px] text-amber-600 font-medium">Focus loss or tab switches</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-2xs">
          <div className="flex items-center justify-between text-gray-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Offline Terminals</span>
            <Power size={16} className="text-rose-600" />
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {liveSession ? liveSession.offlineCount : 0}
          </div>
          <span className="text-[11px] text-rose-600 font-medium">Auto-cache backup enabled</span>
        </div>
      </div>

      {/* Filter and Session List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search by course code, title, or hall..."
              className="pl-9 h-9 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-1.5">
            {["all", "live", "upcoming", "completed"].map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedFilter(tab)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-colors ${
                  selectedFilter === tab
                    ? "bg-slate-900 text-white"
                    : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredSessions.map((session) => (
            <div key={session.id} className="p-6 hover:bg-gray-50/60 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-sm bg-blue-100 text-blue-900 px-2.5 py-0.5 rounded">
                      {session.courseCode}
                    </span>
                    <Badge
                      variant={
                        session.status === "live"
                          ? "success-solid"
                          : session.status === "upcoming"
                          ? "blue-outline"
                          : "gray-solid"
                      }
                      className="capitalize font-semibold text-xs"
                    >
                      {session.status}
                    </Badge>
                    <span className="text-xs text-gray-500 font-medium">{session.slot}</span>
                  </div>

                  <h3 className="text-lg font-bold text-gray-900">{session.courseTitle}</h3>

                  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-gray-600 font-medium">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-gray-400" />
                      {session.building} • {session.hall}
                    </span>
                    <span>•</span>
                    <span>Lead Invigilator: <strong>{session.leadInvigilator}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-6 shrink-0">
                  <div className="grid grid-cols-3 gap-3 text-center border-l border-gray-200 pl-6 hidden sm:grid">
                    <div>
                      <span className="text-[11px] text-gray-400 block font-medium">Registered</span>
                      <span className="text-base font-bold text-gray-900">{session.candidatesCount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block font-medium">Active</span>
                      <span className="text-base font-bold text-blue-600">{session.onlineCount}</span>
                    </div>
                    <div>
                      <span className="text-[11px] text-gray-400 block font-medium">Flagged</span>
                      <span className="text-base font-bold text-amber-600">{session.flaggedCount}</span>
                    </div>
                  </div>

                  <Link href={`/admin/live/${session.id}`}>
                    <Button
                      variant={session.status === "live" ? "default" : "secondary"}
                      className={session.status === "live" ? "bg-blue-600 hover:bg-blue-700 text-white" : ""}
                    >
                      <Radio size={14} className="mr-1.5" />
                      {session.status === "live" ? "Live Monitor" : "View Terminals"}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
