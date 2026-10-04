"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, CheckCircle2, MessageSquareWarning, ChevronRight, XCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const mockAppeals = [
  { id: "A1", student: "Tunde B.", matric: "CSC/22/117", type: "Missing Script", course: "PHY 101", date: "Today", status: "Open" },
  { id: "A2", student: "Sarah J.", matric: "CSC/22/089", type: "Remarking Request", course: "CSC 201", date: "Yesterday", status: "Open" },
  { id: "A3", student: "Chinedu M.", matric: "CSC/22/045", type: "Missing Script", course: "MTH 201", date: "Oct 1", status: "Resolved" },
];

export default function StudentAppeals() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Student Appeals</h2>
        <p className="text-[14px] text-gray-500 mt-1">Resolve missing scripts and remarking requests.</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button className="pb-3 text-[14px] font-medium border-b-2 border-blue-600 text-blue-700 transition-colors">
          Open Appeals (2)
        </button>
        <button className="pb-3 text-[14px] font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 transition-colors">
          Resolved
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="md:col-span-1 space-y-4 overflow-y-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search ticket..." className="pl-9 h-9" />
          </div>
          
          <div className="space-y-2">
            {mockAppeals.map(appeal => (
              <div key={appeal.id} className={`p-4 rounded-lg border cursor-pointer transition-colors ${appeal.status === 'Open' ? 'bg-white border-blue-200 shadow-sm' : 'bg-gray-50/50 border-gray-200 hover:bg-white'}`}>
                <div className="flex justify-between items-start mb-2">
                  <Badge variant={appeal.type === 'Missing Script' ? 'danger' : 'warning'}>{appeal.type}</Badge>
                  <span className="text-[11px] text-gray-500">{appeal.date}</span>
                </div>
                <h4 className="text-[14px] font-bold text-gray-900">{appeal.student} <span className="font-mono font-normal text-[12px] text-gray-500 ml-1">{appeal.matric}</span></h4>
                <p className="text-[13px] text-gray-600 mt-1">Course: {appeal.course}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex flex-col" noPadding>
            <div className="p-6 border-b border-gray-100 bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-[20px] font-bold text-gray-900">Missing Script #A1</h3>
                    <Badge variant="blue-tint">Open</Badge>
                  </div>
                  <p className="text-[14px] text-gray-600">Student <span className="font-semibold text-gray-900">Tunde B. (CSC/22/117)</span> claims they submitted <span className="font-mono text-blue-700">PHY 101</span> but it shows as absent.</p>
                </div>
              </div>
            </div>

            <div className="flex-1 p-6 bg-gray-50 overflow-y-auto space-y-6">
              {/* System trace timeline */}
              <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
                <div className="relative">
                  <div className="absolute -left-[31px] bg-gray-200 rounded-full p-1"><CheckCircle2 size={14} className="text-gray-500" /></div>
                  <p className="text-[13px] font-semibold text-gray-900">System Trace initiated</p>
                  <p className="text-[12px] text-gray-500">Auto-scanned logs for CSC/22/117 in PHY 101.</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-[31px] bg-warning-tint/20 rounded-full p-1"><MessageSquareWarning size={14} className="text-warning-ink" /></div>
                  <p className="text-[13px] font-semibold text-gray-900">Trace Result</p>
                  <p className="text-[12px] text-gray-700 mt-1">Student logged in at 09:05 AM. Attempt was started but disconnected at 09:42 AM. Final heartbeat received at Q18. No active submission trigger found.</p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-white flex justify-end gap-3">
              <Button variant="secondary" className="text-danger hover:bg-danger-tint/10 border-danger/30"><XCircle size={16} className="mr-2"/> Reject Appeal</Button>
              <Button><CheckCircle2 size={16} className="mr-2"/> Recover Script (Force Submit)</Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
