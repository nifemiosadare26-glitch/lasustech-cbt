"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Download,
  Calendar,
  X,
  CheckCircle2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Shield,
  Clock,
  Terminal,
  Activity,
  User,
  Globe
} from "lucide-react";

interface AuditLogItem {
  id: string;
  time: string;
  isoTime: string;
  user: string;
  role: "Admin" | "Lecturer" | "Exam officer" | "Invigilator" | "System";
  action: string;
  actionType: "Create" | "Edit" | "Delete" | "Login" | "Intervention" | "Automated";
  target: string;
  ip: string;
  device: string;
  details?: Record<string, string | number | boolean>;
}

const initialLogs: AuditLogItem[] = [
  {
    id: "req_9f8a",
    time: "Oct 04, 10:42:15 AM",
    isoTime: "2026-10-04T10:42:15+01:00",
    user: "N. Osadare",
    role: "Admin",
    action: "Create session",
    actionType: "Create",
    target: "Session 2026/2027",
    ip: "192.168.1.45",
    device: "Chrome 128 / Windows 11",
    details: {
      sessionName: "2026/2027 Session",
      startDate: "2026-10-01",
      endDate: "2027-07-30",
      status: "Active"
    }
  },
  {
    id: "req_8b3c",
    time: "Oct 04, 09:15:22 AM",
    isoTime: "2026-10-04T09:15:22+01:00",
    user: "T. Bello",
    role: "Lecturer",
    action: "Approve exam",
    actionType: "Edit",
    target: "CSC 301 Mid-semester",
    ip: "10.0.2.15",
    device: "Safari 18 / macOS 15",
    details: {
      examCode: "CSC 301",
      questionsCount: 50,
      moderatorApproved: true
    }
  },
  {
    id: "req_7d1e",
    time: "Oct 04, 08:50:00 AM",
    isoTime: "2026-10-04T08:50:00+01:00",
    user: "System",
    role: "System",
    action: "Automated backup",
    actionType: "Automated",
    target: "PostgreSQL Database",
    ip: "127.0.0.1",
    device: "Backup-Worker-Daemon",
    details: {
      backupSizeMB: 842.5,
      checksum: "sha256:d894fbc87...",
      status: "Success"
    }
  },
  {
    id: "req_6c9f",
    time: "Oct 03, 14:20:11 PM",
    isoTime: "2026-10-03T14:20:11+01:00",
    user: "A. Ibrahim",
    role: "Invigilator",
    action: "Pause exam",
    actionType: "Intervention",
    target: "Attempt ID 8492 (CSC/22/101)",
    ip: "192.168.1.112",
    device: "Chrome / Android Tablet",
    details: {
      candidateMatric: "CSC/22/101",
      pauseDurationSec: 300,
      reason: "Temporary network disconnection"
    }
  },
  {
    id: "req_5e4d",
    time: "Oct 03, 11:05:34 AM",
    isoTime: "2026-10-03T11:05:34+01:00",
    user: "N. Osadare",
    role: "Admin",
    action: "Update settings",
    actionType: "Edit",
    target: "Security rules (MFA policy)",
    ip: "192.168.1.45",
    device: "Chrome 128 / Windows 11",
    details: {
      mfaRequired: true,
      sessionTimeoutMinutes: 30
    }
  },
  {
    id: "req_4a2b",
    time: "Oct 03, 09:00:01 AM",
    isoTime: "2026-10-03T09:00:01+01:00",
    user: "System",
    role: "System",
    action: "Status update",
    actionType: "Automated",
    target: "Realtime Socket Sync",
    ip: "127.0.0.1",
    device: "WebSocket-Server-01",
    details: {
      activeConnections: 1284,
      latencyMs: 18
    }
  },
  {
    id: "req_3f1c",
    time: "Oct 02, 16:45:00 PM",
    isoTime: "2026-10-02T16:45:00+01:00",
    user: "T. Bello",
    role: "Lecturer",
    action: "Import CSV",
    actionType: "Create",
    target: "CSC 305 Question Bank",
    ip: "10.0.2.15",
    device: "Safari 18 / macOS 15",
    details: {
      filename: "csc305_midterm_pool.csv",
      importedQuestions: 64
    }
  },
  {
    id: "req_2d5e",
    time: "Oct 02, 15:30:22 PM",
    isoTime: "2026-10-02T15:30:22+01:00",
    user: "Mr. Tunde",
    role: "Exam officer",
    action: "Schedule exam",
    actionType: "Create",
    target: "CSC 305 Test 2",
    ip: "192.168.1.88",
    device: "Firefox 130 / Windows 11",
    details: {
      venue: "CBT Hall 1",
      scheduledStart: "2026-10-10T09:00:00",
      totalCandidates: 180
    }
  },
  {
    id: "req_1a7b",
    time: "Oct 02, 11:10:05 AM",
    isoTime: "2026-10-02T11:10:05+01:00",
    user: "Dr. Adeyemi",
    role: "Admin",
    action: "Delete draft",
    actionType: "Delete",
    target: "Draft Exam Paper #104",
    ip: "192.168.1.20",
    device: "Chrome / Windows 11",
    details: {
      itemType: "ExamDraft",
      deletedBy: "HOD Computer Science"
    }
  },
  {
    id: "req_0b9c",
    time: "Oct 01, 08:30:00 AM",
    isoTime: "2026-10-01T08:30:00+01:00",
    user: "N. Osadare",
    role: "Admin",
    action: "User login",
    actionType: "Login",
    target: "Admin Portal Session",
    ip: "192.168.1.45",
    device: "Chrome 128 / Windows 11",
    details: {
      authMethod: "Password + Authenticator App",
      success: true
    }
  }
];

export default function AuditLogs() {
  const [logs] = useState<AuditLogItem[]>(initialLogs);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("All roles");
  const [actionFilter, setActionFilter] = useState("All action types");
  const [dateFilter, setDateFilter] = useState("Oct 1 - Oct 4, 2026");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Selected event for modal inspector
  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        log.id.toLowerCase().includes(q) ||
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.ip.includes(q) ||
        log.device.toLowerCase().includes(q);

      const matchesRole = roleFilter === "All roles" || log.role === roleFilter;

      const matchesAction =
        actionFilter === "All action types" || log.actionType === actionFilter;

      return matchesSearch && matchesRole && matchesAction;
    });
  }, [logs, searchQuery, roleFilter, actionFilter]);

  // Paginated view
  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLogs.slice(start, start + pageSize);
  }, [filteredLogs, currentPage, pageSize]);

  // Handle Export CSV
  const handleExportCSV = () => {
    const headers = "Request ID,Time (Lagos),User,Role,Action,Target,IP Address,Device\n";
    const rows = filteredLogs
      .map(
        (l) =>
          `"${l.id}","${l.time}","${l.user}","${l.role}","${l.action}","${l.target}","${l.ip}","${l.device}"`
      )
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `LASUSTECH_Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast(`Exported ${filteredLogs.length} audit logs to CSV!`);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast("Request ID copied to clipboard!");
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="text-emerald-400 shrink-0" size={18} />
          <span className="text-[14px] font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Audit logs</h2>
          <p className="text-[14px] text-gray-500">Read-only, searchable record of every action in the system.</p>
        </div>
        {/* Export CSV Button - Clickable */}
        <Button
          type="button"
          variant="secondary"
          onClick={handleExportCSV}
          className="hover:border-blue-500 hover:text-blue-700 cursor-pointer shadow-2xs"
        >
          <Download className="mr-2" size={16} /> Export CSV
        </Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/60 items-center">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[200px] max-w-[320px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input
              placeholder="Search user, action, target..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="pl-9 h-9.5 text-[13px] bg-white"
            />
          </div>

          {/* Date Range Selector Pill */}
          <div className="relative">
            <select
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value);
                setCurrentPage(1);
                showToast(`Filter applied: ${e.target.value}`);
              }}
              className="h-9.5 rounded-[6px] border border-gray-300 bg-white pl-8 pr-3 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Oct 1 - Oct 4, 2026">Oct 1 - Oct 4, 2026</option>
              <option value="Today">Today (Oct 04)</option>
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="All Time">All Time</option>
            </select>
            <Calendar size={14} className="text-gray-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9.5 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option>All roles</option>
            <option>Admin</option>
            <option>Lecturer</option>
            <option>Exam officer</option>
            <option>Invigilator</option>
            <option>System</option>
          </select>

          {/* Action Type Filter */}
          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="h-9.5 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option>All action types</option>
            <option>Create</option>
            <option>Edit</option>
            <option>Delete</option>
            <option>Login</option>
            <option>Intervention</option>
            <option>Automated</option>
          </select>

          {(searchQuery || roleFilter !== "All roles" || actionFilter !== "All action types") && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("All roles");
                setActionFilter("All action types");
                setCurrentPage(1);
              }}
              className="text-[12.5px] text-blue-600 hover:underline font-medium ml-1"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* Log Table - Clickable Rows */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-white z-10 border-b border-gray-200 shadow-2xs">
              <tr>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Request ID</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Time (Africa/Lagos)</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">User & Role</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Action</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">Target</th>
                <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900">IP & Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-[14px]">
                    No audit records match your search criteria.
                  </td>
                </tr>
              ) : (
                paginatedLogs.map((log) => (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-blue-50/70 transition-colors cursor-pointer group"
                    title="Click to view complete event telemetry"
                  >
                    <td className="px-6 py-3.5 font-mono text-[12px] text-gray-500 group-hover:text-blue-700 font-medium">
                      {log.id}
                    </td>
                    <td className="px-6 py-3.5 text-[13px] text-gray-700">{log.time}</td>
                    <td className="px-6 py-3.5">
                      <div className="text-[13.5px] font-semibold text-gray-900">{log.user}</div>
                      <div className="text-[12px] text-gray-500">{log.role}</div>
                    </td>
                    <td className="px-6 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-medium border ${
                          log.actionType === "Create"
                            ? "bg-blue-50 text-blue-800 border-blue-200"
                            : log.actionType === "Delete"
                            ? "bg-red-50 text-red-800 border-red-200"
                            : log.actionType === "Intervention"
                            ? "bg-amber-50 text-amber-800 border-amber-200"
                            : log.actionType === "Automated"
                            ? "bg-slate-100 text-slate-800 border-slate-200"
                            : "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-[13.5px] text-gray-800 font-medium">{log.target}</td>
                    <td className="px-6 py-3.5">
                      <div className="font-mono text-[12px] text-gray-600">{log.ip}</div>
                      <div className="text-[12px] text-gray-400 truncate max-w-[200px]">{log.device}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500 bg-white shrink-0">
          <span>
            Showing <strong className="text-gray-900">{filteredLogs.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}</strong> to{" "}
            <strong className="text-gray-900">{Math.min(currentPage * pageSize, filteredLogs.length)}</strong> of{" "}
            <strong className="text-gray-900">{filteredLogs.length}</strong> events (45,201 total indexed)
          </span>
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-gray-400 mr-2">Page {currentPage} of {totalPages}</span>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="h-8 px-3 cursor-pointer"
            >
              <ChevronLeft size={14} className="mr-1" /> Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="h-8 px-3 cursor-pointer"
            >
              Next <ChevronRight size={14} className="ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      {/* MODAL: EVENT INSPECTOR */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-xl shadow-2xl border border-gray-200 max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Terminal size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-[17px] font-semibold text-gray-900 font-mono">
                      {selectedLog.id}
                    </h3>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(selectedLog.id)}
                      className="text-gray-400 hover:text-blue-600 p-1"
                      title="Copy Request ID"
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <p className="text-[12px] text-gray-500">Security event verification detail</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-md cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-[13px]">
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Actor</span>
                  <span className="font-bold text-gray-900 text-[14px]">{selectedLog.user}</span>
                  <span className="text-gray-500 block text-[12px]">{selectedLog.role}</span>
                </div>
                <div className="p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider block">Timestamp</span>
                  <span className="font-semibold text-gray-900 text-[13px]">{selectedLog.time}</span>
                  <span className="text-gray-400 font-mono text-[11px] block">{selectedLog.isoTime}</span>
                </div>
              </div>

              <div className="space-y-2 text-[13px] border border-gray-100 rounded-lg p-3.5">
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Action</span>
                  <span className="font-semibold text-gray-900">{selectedLog.action}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Category</span>
                  <span className="font-semibold text-blue-700">{selectedLog.actionType}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">Target Resource</span>
                  <span className="font-semibold text-gray-900">{selectedLog.target}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-gray-100">
                  <span className="text-gray-500 font-medium">IP Address</span>
                  <span className="font-mono text-gray-900 font-semibold">{selectedLog.ip}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-gray-500 font-medium">Client Agent</span>
                  <span className="text-gray-700">{selectedLog.device}</span>
                </div>
              </div>

              {selectedLog.details && (
                <div>
                  <span className="text-[12px] font-semibold text-gray-700 uppercase tracking-wider block mb-1.5">
                    Payload Metadata (JSON)
                  </span>
                  <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg text-[12px] font-mono overflow-x-auto leading-relaxed">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedLog(null)}
                className="cursor-pointer"
              >
                Close inspector
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
