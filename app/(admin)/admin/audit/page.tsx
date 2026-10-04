"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Filter, Download, Calendar, ArrowRightLeft } from "lucide-react";

const mockLogs = [
  { id: "req_9f8a", time: "Oct 04, 10:42:15 AM", user: "N. Osadare", role: "Admin", action: "Create session", target: "Session 2026/2027", ip: "192.168.1.45", device: "Chrome / Windows" },
  { id: "req_8b3c", time: "Oct 04, 09:15:22 AM", user: "T. Bello", role: "Lecturer", action: "Approve exam", target: "CSC 301 Mid-semester", ip: "10.0.2.15", device: "Safari / macOS" },
  { id: "req_7d1e", time: "Oct 04, 08:50:00 AM", user: "System", role: "System", action: "Automated backup", target: "Database", ip: "127.0.0.1", device: "Server" },
  { id: "req_6c9f", time: "Oct 03, 14:20:11 PM", user: "A. Ibrahim", role: "Invigilator", action: "Pause exam", target: "Attempt ID 8492 (CSC/22/101)", ip: "192.168.1.112", device: "Chrome / Android" },
  { id: "req_5e4d", time: "Oct 03, 11:05:34 AM", user: "N. Osadare", role: "Admin", action: "Update settings", target: "Security rules", ip: "192.168.1.45", device: "Chrome / Windows" },
  { id: "req_4a2b", time: "Oct 03, 09:00:01 AM", user: "System", role: "System", action: "Status update", target: "Realtime Sync", ip: "127.0.0.1", device: "Server" },
  { id: "req_3f1c", time: "Oct 02, 16:45:00 PM", user: "T. Bello", role: "Lecturer", action: "Import CSV", target: "CSC 305 Question Bank", ip: "10.0.2.15", device: "Safari / macOS" },
  { id: "req_2d5e", time: "Oct 02, 15:30:22 PM", user: "Mr. Tunde", role: "Exam officer", action: "Schedule exam", target: "CSC 305 Test 2", ip: "192.168.1.88", device: "Firefox / Windows" },
];

export default function AuditLogs() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Audit logs</h2>
          <p className="text-[14px] text-gray-500">Read-only, searchable record of every action in the system.</p>
        </div>
        <Button variant="secondary"><Download className="mr-2" size={16} /> Export CSV</Button>
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search user, action, target..." className="pl-9 h-9 text-[13px]" />
          </div>
          
          <div className="flex items-center gap-2 bg-white border border-gray-300 rounded-md px-3 h-9">
            <Calendar size={14} className="text-gray-500" />
            <span className="text-[13px] font-medium text-gray-700">Oct 1 - Oct 4, 2026</span>
          </div>

          <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All roles</option>
            <option>Admin</option>
            <option>Lecturer</option>
            <option>Exam officer</option>
            <option>Invigilator</option>
            <option>System</option>
          </select>

          <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All action types</option>
            <option>Create</option>
            <option>Edit</option>
            <option>Delete</option>
            <option>Login</option>
            <option>Intervention</option>
          </select>
        </div>

        {/* Log Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Request ID</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Time (Africa/Lagos)</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">User & Role</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Action</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Target</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">IP & Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockLogs.map((log) => (
                <tr key={log.id} className="hover:bg-blue-50 transition-colors cursor-pointer group">
                  <td className="px-6 py-3 font-mono text-[12px] text-gray-500 group-hover:text-blue-700">{log.id}</td>
                  <td className="px-6 py-3 text-[13px] text-gray-700">{log.time}</td>
                  <td className="px-6 py-3">
                    <div className="text-[13.5px] font-medium text-gray-900">{log.user}</div>
                    <div className="text-[12px] text-gray-500">{log.role}</div>
                  </td>
                  <td className="px-6 py-3">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 text-[12px] font-medium border border-gray-200">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-[13.5px] text-gray-800">{log.target}</td>
                  <td className="px-6 py-3">
                    <div className="font-mono text-[12px] text-gray-600">{log.ip}</div>
                    <div className="text-[12px] text-gray-400">{log.device}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500 bg-white shrink-0">
          <span>Showing 1 to 8 of 45,201 events</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8">Previous</Button>
            <Button variant="secondary" size="sm" className="h-8">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
