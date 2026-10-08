"use client";

import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldAlert,
  Search,
  Plus,
  Download,
  Printer,
  CalendarRange,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  X,
  FileText,
  User,
  Monitor,
  ExternalLink,
  ChevronRight,
  Filter,
  Eye,
  Check
} from "lucide-react";

interface Incident {
  id: string;
  referenceNo: string;
  timestamp: string;
  sessionCode: string;
  sessionTitle: string;
  candidateName: string;
  matricNumber: string;
  seatId: string;
  hall: string;
  category: "Malpractice" | "Technical" | "Infrastructure" | "Medical" | "Conduct";
  severity: "Low" | "Medium" | "High" | "Critical";
  status: "Under Review" | "Escalated to Officer" | "Resolved";
  invigilatorName: string;
  description: string;
  actionTaken: string;
  docketConfiscated: boolean;
}

const initialIncidents: Incident[] = [
  {
    id: "1",
    referenceNo: "INC-2026-081",
    timestamp: "09:28 AM",
    sessionCode: "CSC 301",
    sessionTitle: "Data Structures & Algorithms",
    candidateName: "Tunde Babatunde",
    matricNumber: "CSC/22/117",
    seatId: "PC-14",
    hall: "Hall A (CBT Centre 1)",
    category: "Malpractice",
    severity: "Critical",
    status: "Under Review",
    invigilatorName: "Dr. (Mrs.) B. A. Adebayo",
    description: "Candidate repeatedly attempted to toggle out of the secure fullscreen kiosk browser. Proctoring console registered two Alt+Tab window switch events to Notepad.",
    actionTaken: "Terminal paused by proctor; candidate docket and scrap sheets marked with red ink. Incident submitted for disciplinary committee review.",
    docketConfiscated: true
  },
  {
    id: "2",
    referenceNo: "INC-2026-082",
    timestamp: "09:32 AM",
    sessionCode: "CSC 301",
    sessionTitle: "Data Structures & Algorithms",
    candidateName: "Olamide Bakare",
    matricNumber: "CSC/22/155",
    seatId: "PC-70",
    hall: "Hall A (CBT Centre 1)",
    category: "Malpractice",
    severity: "Medium",
    status: "Under Review",
    invigilatorName: "Dr. (Mrs.) B. A. Adebayo",
    description: "Webcam video feed reported facial obstruction. Candidate was observed looking sideways towards workstation PC-71.",
    actionTaken: "Verbal warning issued; proctor moved candidate to frontline observation workstation.",
    docketConfiscated: false
  },
  {
    id: "3",
    referenceNo: "INC-2026-083",
    timestamp: "09:12 AM",
    sessionCode: "CSC 301",
    sessionTitle: "Data Structures & Algorithms",
    candidateName: "Chinedu Madu",
    matricNumber: "CSC/22/045",
    seatId: "PC-48",
    hall: "Hall A (CBT Centre 1)",
    category: "Technical",
    severity: "Low",
    status: "Resolved",
    invigilatorName: "Mr. K. O. Fashola",
    description: "Optical mouse sensor malfunctioned on PC-48, causing pointer freezing during question review.",
    actionTaken: "Candidate transferred to hot-standby workstation PC-115. Session resumed seamlessly in 18 seconds without loss of answers.",
    docketConfiscated: false
  },
  {
    id: "4",
    referenceNo: "INC-2026-084",
    timestamp: "09:05 AM",
    sessionCode: "CSC 301",
    sessionTitle: "Data Structures & Algorithms",
    candidateName: "Hall-Wide (Section B)",
    matricNumber: "N/A",
    seatId: "Switch B2",
    hall: "Hall A (CBT Centre 1)",
    category: "Infrastructure",
    severity: "Medium",
    status: "Resolved",
    invigilatorName: "Dr. (Mrs.) B. A. Adebayo",
    description: "Mains power trip triggered university diesel generator switchover. 14 terminals flickered momentarily on local UPS.",
    actionTaken: "All candidates reassured. CBT engine 3-second server autosave preserved 100% of candidate answers. No candidate lost time.",
    docketConfiscated: false
  },
  {
    id: "5",
    referenceNo: "INC-2026-085",
    timestamp: "09:21 AM",
    sessionCode: "CSC 301",
    sessionTitle: "Data Structures & Algorithms",
    candidateName: "Blessing Okafor",
    matricNumber: "CSC/22/078",
    seatId: "PC-19",
    hall: "Hall A (CBT Centre 1)",
    category: "Conduct",
    severity: "Low",
    status: "Resolved",
    invigilatorName: "Engr. T. S. Balogun",
    description: "Candidate attempted keyboard shortcut Ctrl+C / Ctrl+V in numeric entry box. Browser security layer blocked keypress and signaled invigilator.",
    actionTaken: "Candidate reminded of strict keyboard policy. No physical materials found. Terminal unflagged.",
    docketConfiscated: false
  }
];

export default function IncidentsPage() {
  const [incidents, setIncidents] = React.useState<Incident[]>(initialIncidents);
  const [categoryFilter, setCategoryFilter] = React.useState<string>("All");
  const [statusFilter, setStatusFilter] = React.useState<string>("All");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [toastMessage, setToastMessage] = React.useState<string | null>(null);

  // Selected incident for drawer/modal
  const [selectedIncident, setSelectedIncident] = React.useState<Incident | null>(null);
  const [isNewIncidentModalOpen, setIsNewIncidentModalOpen] = React.useState(false);

  // New incident form state
  const [newSessionCode, setNewSessionCode] = React.useState("CSC 301");
  const [newCandidateName, setNewCandidateName] = React.useState("");
  const [newMatricNumber, setNewMatricNumber] = React.useState("");
  const [newSeatId, setNewSeatId] = React.useState("");
  const [newCategory, setNewCategory] = React.useState<"Malpractice" | "Technical" | "Infrastructure" | "Medical" | "Conduct">("Malpractice");
  const [newSeverity, setNewSeverity] = React.useState<"Low" | "Medium" | "High" | "Critical">("Medium");
  const [newDescription, setNewDescription] = React.useState("");
  const [newActionTaken, setNewActionTaken] = React.useState("Verbal warning issued & logged on console");
  const [newDocketConfiscated, setNewDocketConfiscated] = React.useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    const matchesCategory = categoryFilter === "All" || inc.category === categoryFilter;
    const matchesStatus = statusFilter === "All" || inc.status === statusFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      inc.referenceNo.toLowerCase().includes(q) ||
      inc.candidateName.toLowerCase().includes(q) ||
      inc.matricNumber.toLowerCase().includes(q) ||
      inc.seatId.toLowerCase().includes(q) ||
      inc.description.toLowerCase().includes(q);
    return matchesCategory && matchesStatus && matchesSearch;
  });

  // KPI calculations
  const countTotal = incidents.length;
  const countMalpractice = incidents.filter(i => i.category === "Malpractice").length;
  const countTechnical = incidents.filter(i => i.category === "Technical").length;
  const countResolved = incidents.filter(i => i.status === "Resolved").length;

  // Handle create incident
  const handleCreateIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDescription.trim()) {
      showToast("Please provide detailed observations.");
      return;
    }

    const newId = (incidents.length + 1).toString();
    const newRef = `INC-2026-${(80 + incidents.length + 1).toString().padStart(3, "0")}`;

    const created: Incident = {
      id: newId,
      referenceNo: newRef,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      sessionCode: newSessionCode,
      sessionTitle: newSessionCode === "CSC 301" ? "Data Structures & Algorithms" : "Examination Session",
      candidateName: newCandidateName.trim() || "General / Unassigned",
      matricNumber: newMatricNumber.trim() || "N/A",
      seatId: newSeatId.trim() || "PC-Hall",
      hall: "Hall A (CBT Centre 1)",
      category: newCategory,
      severity: newSeverity,
      status: "Under Review",
      invigilatorName: "Dr. (Mrs.) B. A. Adebayo",
      description: newDescription,
      actionTaken: newActionTaken,
      docketConfiscated: newDocketConfiscated
    };

    setIncidents([created, ...incidents]);
    setIsNewIncidentModalOpen(false);
    showToast(`Incident ${newRef} officially logged. Chief Exam Officer informed.`);

    // Reset form
    setNewCandidateName("");
    setNewMatricNumber("");
    setNewSeatId("");
    setNewDescription("");
  };

  // Export CSV
  const handleExportCSV = () => {
    const headers = "Reference,Timestamp,Session,Candidate,Matric,Seat,Hall,Category,Severity,Status,Invigilator,Confiscated,Description\n";
    const rows = incidents
      .map(
        i =>
          `"${i.referenceNo}","${i.timestamp}","${i.sessionCode}","${i.candidateName}","${i.matricNumber}","${i.seatId}","${
            i.hall
          }","${i.category}","${i.severity}","${i.status}","${i.invigilatorName}","${i.docketConfiscated ? "Yes" : "No"}","${
            i.description.replace(/"/g, '""')
          }"`
      )
      .join("\n");
    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `LASUSTECH_Hall_Incidents_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Official hall incidents CSV dossier exported.");
  };

  // Change incident status
  const handleUpdateStatus = (incidentId: string, nextStatus: "Under Review" | "Escalated to Officer" | "Resolved") => {
    setIncidents(prev =>
      prev.map(i => {
        if (i.id === incidentId) {
          return { ...i, status: nextStatus };
        }
        return i;
      })
    );
    if (selectedIncident && selectedIncident.id === incidentId) {
      setSelectedIncident(prev => (prev ? { ...prev, status: nextStatus } : null));
    }
    showToast(`Status updated to "${nextStatus}".`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-gray-700 animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[14px] font-medium">{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* 1. Header Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/invigilator"
              className="text-[12px] font-medium text-gray-500 hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft size={14} />
              Back to Today's Exams
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-[12px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              Disciplinary & Technical Dossier
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldAlert className="text-rose-600" size={26} />
            Hall Incident Reports & Malpractice Logs
          </h1>
          <p className="text-[14px] text-gray-600 mt-1">
            Official chronological record of candidate infractions, hardware replacements, and invigilator hall interventions.
          </p>
        </div>

        {/* Global Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <Button
            variant="secondary"
            onClick={handleExportCSV}
            className="h-10 text-[13px] font-semibold gap-1.5"
          >
            <Download size={15} />
            Export Log (CSV)
          </Button>

          <Button
            variant="secondary"
            onClick={() => window.print()}
            className="h-10 text-[13px] font-semibold gap-1.5"
          >
            <Printer size={15} />
            Print Daily Summary
          </Button>

          <Button
            variant="danger"
            onClick={() => setIsNewIncidentModalOpen(true)}
            className="h-10 text-[13px] font-bold gap-1.5 shadow-sm"
          >
            <Plus size={16} />
            Log New Incident
          </Button>
        </div>
      </div>

      {/* 2. KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Total Logged Today</span>
            <FileText size={18} className="text-blue-600" />
          </div>
          <span className="text-2xl font-bold text-gray-900">{countTotal} Reports</span>
          <p className="text-[12px] text-gray-500 mt-1">Recorded across Morning Shift</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Malpractice Inquiries</span>
            <ShieldAlert size={18} className="text-rose-600" />
          </div>
          <span className="text-2xl font-bold text-rose-600">{countMalpractice} Cases</span>
          <p className="text-[12px] text-rose-700 font-medium mt-1">Dockets & rough sheets filed</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Workstation Swaps</span>
            <Monitor size={18} className="text-purple-600" />
          </div>
          <span className="text-2xl font-bold text-purple-700">{countTechnical} Migrations</span>
          <p className="text-[12px] text-gray-500 mt-1">Standby machines deployed</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-gray-500 mb-2">
            <span className="text-[13px] font-medium">Resolved Cases</span>
            <CheckCircle2 size={18} className="text-emerald-600" />
          </div>
          <span className="text-2xl font-bold text-emerald-600">{countResolved} Closed</span>
          <p className="text-[12px] text-emerald-700 font-medium mt-1">Cleared with invigilator sign-off</p>
        </div>
      </div>

      {/* 3. Incidents Filter & Table Card */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-xs p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
              <Input
                placeholder="Search reference, candidate, PC..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 h-9 text-[13px]"
              />
            </div>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 text-[13px] bg-white text-gray-700 font-medium focus:outline-blue-600"
            >
              <option value="All">All Categories</option>
              <option value="Malpractice">Malpractice & Collusion</option>
              <option value="Technical">Technical & Workstation</option>
              <option value="Infrastructure">Infrastructure & Power</option>
              <option value="Conduct">Candidate Conduct</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="h-9 px-3 rounded-lg border border-gray-300 text-[13px] bg-white text-gray-700 font-medium focus:outline-blue-600"
            >
              <option value="All">All Statuses</option>
              <option value="Under Review">Under Review</option>
              <option value="Escalated to Officer">Escalated to Officer</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <span className="text-[13px] text-gray-500 font-medium">
            Showing <strong>{filteredIncidents.length}</strong> of {incidents.length} logged incidents
          </span>
        </div>

        {/* Incidents Table */}
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 text-[12px] font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref No.</th>
                <th className="py-3 px-4">Time & Course</th>
                <th className="py-3 px-4">Candidate & Terminal</th>
                <th className="py-3 px-4">Category & Severity</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Docket Action</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filteredIncidents.map(incident => {
                const isCritical = incident.severity === "Critical";
                const isHigh = incident.severity === "High";

                return (
                  <tr
                    key={incident.id}
                    onClick={() => setSelectedIncident(incident)}
                    className="hover:bg-gray-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{incident.referenceNo}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{incident.sessionCode}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5">
                        <Clock size={12} />
                        {incident.timestamp} • {incident.hall}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{incident.candidateName}</div>
                      <div className="font-mono text-[11px] text-gray-500">
                        {incident.matricNumber} • <strong className="text-gray-900">{incident.seatId}</strong>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-gray-800">{incident.category}</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            isCritical
                              ? "bg-rose-100 text-rose-800"
                              : isHigh
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {incident.severity}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {incident.status === "Under Review" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <AlertTriangle size={12} className="text-amber-600" />
                          Under Review
                        </span>
                      )}
                      {incident.status === "Escalated to Officer" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                          <ShieldAlert size={12} className="text-rose-600" />
                          Escalated
                        </span>
                      )}
                      {incident.status === "Resolved" && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          Resolved
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {incident.docketConfiscated ? (
                        <span className="text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                          Confiscated
                        </span>
                      ) : (
                        <span className="text-[11px] text-gray-500">Retained</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={e => {
                          e.stopPropagation();
                          setSelectedIncident(incident);
                        }}
                        className="h-8 text-[12px] font-semibold"
                      >
                        Inspect Dossier
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {filteredIncidents.length === 0 && (
            <div className="text-center py-16 bg-white">
              <ShieldAlert className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-[14px] font-medium text-gray-900">No incident logs match your filter criteria.</p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setCategoryFilter("All");
                  setStatusFilter("All");
                  setSearchQuery("");
                }}
                className="mt-3"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 4. MODAL: Incident Details Inspector */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold bg-slate-900 text-white px-2 py-0.5 rounded">
                    {selectedIncident.referenceNo}
                  </span>
                  <Badge
                    variant={
                      selectedIncident.severity === "Critical"
                        ? "danger"
                        : selectedIncident.severity === "High"
                        ? "warning"
                        : "default"
                    }
                  >
                    {selectedIncident.severity} Severity
                  </Badge>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mt-1">
                  {selectedIncident.category} Report • {selectedIncident.sessionCode}
                </h3>
              </div>

              <button
                onClick={() => setSelectedIncident(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              {/* Candidate Info Box */}
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 grid grid-cols-2 sm:grid-cols-3 gap-3 text-[13px]">
                <div>
                  <span className="text-gray-500 block text-[11px] font-semibold uppercase">Candidate</span>
                  <strong className="text-gray-900 font-bold">{selectedIncident.candidateName}</strong>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] font-semibold uppercase">Matriculation</span>
                  <span className="font-mono font-bold text-gray-800">{selectedIncident.matricNumber}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] font-semibold uppercase">Workstation</span>
                  <span className="font-bold text-gray-900">{selectedIncident.seatId}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] font-semibold uppercase">Hall & Venue</span>
                  <span className="text-gray-800">{selectedIncident.hall}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] font-semibold uppercase">Logged At</span>
                  <span className="text-gray-800">{selectedIncident.timestamp}</span>
                </div>
                <div>
                  <span className="text-gray-500 block text-[11px] font-semibold uppercase">Reporting Proctor</span>
                  <span className="text-gray-800 font-semibold">{selectedIncident.invigilatorName}</span>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1">
                  Invigilator Incident Narrative
                </h4>
                <div className="p-3.5 bg-white border border-gray-200 rounded-xl text-[13px] text-gray-800 leading-relaxed">
                  {selectedIncident.description}
                </div>
              </div>

              {/* Action Taken */}
              <div>
                <h4 className="text-[13px] font-bold text-gray-900 uppercase tracking-wider mb-1">Action Enforced</h4>
                <div className="p-3.5 bg-blue-50/40 border border-blue-200 rounded-xl text-[13px] text-blue-950 font-medium">
                  {selectedIncident.actionTaken}
                </div>
              </div>

              {/* Confiscation Badge */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200 text-[13px]">
                <span className="font-semibold text-gray-700">Docket & Material Evidence Confiscation:</span>
                {selectedIncident.docketConfiscated ? (
                  <span className="font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-md">
                    Confiscated and Submitted to Exam Office
                  </span>
                ) : (
                  <span className="font-semibold text-gray-600 bg-gray-200 px-2.5 py-1 rounded-md">
                    No physical materials confiscated
                  </span>
                )}
              </div>

              {/* Update Status Buttons */}
              <div className="pt-2">
                <h4 className="text-[12px] font-bold text-gray-700 uppercase tracking-wider mb-2">Update Incident Status</h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={selectedIncident.status === "Under Review" ? "primary" : "secondary"}
                    onClick={() => handleUpdateStatus(selectedIncident.id, "Under Review")}
                    className="text-[12px]"
                  >
                    Mark "Under Review"
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedIncident.status === "Escalated to Officer" ? "danger" : "secondary"}
                    onClick={() => handleUpdateStatus(selectedIncident.id, "Escalated to Officer")}
                    className="text-[12px]"
                  >
                    Escalate to Chief Exam Officer
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedIncident.status === "Resolved" ? "primary" : "secondary"}
                    onClick={() => handleUpdateStatus(selectedIncident.id, "Resolved")}
                    className="text-[12px] bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    Mark "Resolved / Cleared"
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex justify-between items-center">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  window.print();
                }}
              >
                <Printer size={14} className="mr-1.5" />
                Print Case Docket
              </Button>

              <Button variant="secondary" onClick={() => setSelectedIncident(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MODAL: Create New Incident */}
      {isNewIncidentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShieldAlert className="text-rose-600" size={20} />
                Register New Hall Incident
              </h3>
              <button
                onClick={() => setIsNewIncidentModalOpen(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-900 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4 py-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Session</label>
                  <select
                    value={newSessionCode}
                    onChange={e => setNewSessionCode(e.target.value)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] bg-white focus:outline-blue-600"
                  >
                    <option value="CSC 301">CSC 301 (Hall A)</option>
                    <option value="MTH 201">MTH 201 (Hall B)</option>
                    <option value="GST 111">GST 111 (Mega Hall)</option>
                    <option value="PHY 101">PHY 101 (Hall A)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-lg border border-gray-300 text-[13px] bg-white focus:outline-blue-600"
                  >
                    <option value="Malpractice">Malpractice & Cheating</option>
                    <option value="Technical">Workstation / Hardware</option>
                    <option value="Infrastructure">Power / Network Blink</option>
                    <option value="Conduct">Candidate Misconduct</option>
                    <option value="Medical">Medical Emergency</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Candidate Name (Optional)</label>
                  <Input
                    placeholder="e.g. Tunde Babatunde"
                    value={newCandidateName}
                    onChange={e => setNewCandidateName(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1">Terminal ID</label>
                  <Input
                    placeholder="e.g. PC-14"
                    value={newSeatId}
                    onChange={e => setNewSeatId(e.target.value)}
                    className="h-10 text-[13px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Matriculation No. (If candidate)</label>
                <Input
                  placeholder="e.g. CSC/22/117"
                  value={newMatricNumber}
                  onChange={e => setNewMatricNumber(e.target.value)}
                  className="h-10 text-[13px]"
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Severity</label>
                <div className="flex gap-2">
                  {(["Low", "Medium", "High", "Critical"] as const).map(sev => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setNewSeverity(sev)}
                      className={`flex-1 py-1.5 text-[12px] font-bold rounded-lg border transition-all ${
                        newSeverity === sev
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
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Detailed Observation Narrative</label>
                <textarea
                  rows={3}
                  value={newDescription}
                  onChange={e => setNewDescription(e.target.value)}
                  placeholder="State exact facts, evidence observed, witness proctors..."
                  className="w-full p-2.5 rounded-lg border border-gray-300 text-[13px] focus:outline-blue-600"
                  required
                />
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1">Action Enforced</label>
                <select
                  value={newActionTaken}
                  onChange={e => setNewActionTaken(e.target.value)}
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

              <div className="flex items-center gap-2 text-[12px] text-gray-700">
                <input
                  type="checkbox"
                  id="confiscateCheck"
                  checked={newDocketConfiscated}
                  onChange={e => setNewDocketConfiscated(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <label htmlFor="confiscateCheck">Confiscate examination docket / rough sheets as physical exhibit</label>
              </div>

              <div className="pt-3 border-t border-gray-200 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => setIsNewIncidentModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="danger">
                  Register Official Report
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
