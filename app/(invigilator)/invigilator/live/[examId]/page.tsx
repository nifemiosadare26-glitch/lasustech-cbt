"use client";

import * as React from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Wifi, WifiOff, Flag, CheckCircle2, MoreHorizontal, Video } from "lucide-react";

const students = [
  { id: "1", name: "Ada O.", matric: "CSC/22/101", status: "In progress", progress: 72, state: "online", flags: 0 },
  { id: "2", name: "Tunde B.", matric: "CSC/22/117", status: "Flagged: 2 tab switches", progress: 45, state: "flagged", flags: 2 },
  { id: "3", name: "Ife A.", matric: "CSC/22/122", status: "Offline 40 s", progress: 60, state: "offline", flags: 0 },
  { id: "4", name: "Zainab K.", matric: "CSC/22/130", status: "Submitted", progress: 100, state: "submitted", flags: 0 },
  { id: "5", name: "Chinedu M.", matric: "CSC/22/045", status: "In progress", progress: 15, state: "online", flags: 0 },
  { id: "6", name: "Sarah J.", matric: "CSC/22/089", status: "Not started", progress: 0, state: "not_started", flags: 0 },
];

export default function LiveMonitorPage({ params }: { params: { examId: string } }) {
  const [selectedStudent, setSelectedStudent] = React.useState<string | null>(null);

  return (
    <div className="flex flex-col h-full overflow-hidden relative">
      
      {/* 1. Exam header */}
      <div className="bg-white p-4 border-b border-gray-200 shrink-0 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-[18px] font-bold text-gray-900 tracking-tight">CSC 301 Mid-semester</h2>
          <Badge variant="blue-solid" className="animate-pulse">LIVE</Badge>
          <div className="text-[14px] font-mono font-medium text-gray-700 bg-gray-50 px-2 py-1 rounded border border-gray-200">
            Time left 00:42:10
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-[13px] font-medium">
          <div className="flex items-center gap-1.5"><span className="text-gray-500">Present</span> <span className="text-gray-900 font-bold">112/118</span></div>
          <div className="flex items-center gap-1.5"><span className="text-gray-500">Online</span> <span className="text-blue-600 font-bold">109</span></div>
          <div className="flex items-center gap-1.5"><span className="text-gray-500">Flagged</span> <span className="text-warning font-bold">4</span></div>
          <div className="flex items-center gap-1.5"><span className="text-gray-500">Offline</span> <span className="text-gray-900 font-bold">3</span></div>
        </div>
      </div>

      {/* 2. Filters */}
      <div className="p-4 bg-gray-50 shrink-0 flex flex-col sm:flex-row gap-4 items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0">
          <button className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-blue-100 text-blue-900 whitespace-nowrap">All</button>
          <button className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">Flagged</button>
          <button className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">Offline</button>
          <button className="px-3 py-1.5 rounded-full text-[13px] font-medium bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 whitespace-nowrap">Not started</button>
        </div>
        <div className="relative w-full sm:w-64 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <Input placeholder="Search name or matric..." className="pl-9 h-9 text-[13px]" />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* 3. Student tiles grid */}
        <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 content-start min-h-0">
            {students.map(s => {
              // Tile states based on Figure 5
              const isFlagged = s.state === 'flagged';
              const isOffline = s.state === 'offline';
              const isSubmitted = s.state === 'submitted';
              
              const borderClass = isFlagged ? "border-warning ring-1 ring-warning" 
                               : isOffline ? "border-gray-300 opacity-60" 
                               : isSubmitted ? "border-success bg-success-tint/10" 
                               : "border-gray-200 hover:border-blue-300";
              
              const indicatorColor = isFlagged ? "bg-warning" : isOffline ? "bg-gray-400" : isSubmitted ? "bg-success" : "bg-blue-500";

              return (
                <div 
                  key={s.id}
                  onClick={() => setSelectedStudent(s.id)}
                  className={`bg-white border rounded-xl p-4 flex flex-col cursor-pointer transition-all min-h-[140px] relative ${borderClass}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${indicatorColor}`}></div>
                      <h3 className="font-bold text-[14px] text-gray-900 truncate">{s.name}</h3>
                    </div>
                    {isFlagged && <Flag size={14} className="text-warning fill-warning" />}
                    {isOffline && <WifiOff size={14} className="text-gray-400" />}
                    {isSubmitted && <CheckCircle2 size={14} className="text-success" />}
                  </div>
                  
                  <div className="text-[12px] font-mono text-gray-500 mb-auto">{s.matric}</div>
                  
                  {/* Webcam placeholder */}
                  <div className="w-full h-16 bg-gray-100 rounded-md my-3 flex items-center justify-center text-gray-400 overflow-hidden relative">
                    <Video size={16} className="opacity-30" />
                    <span className="text-[10px] font-medium ml-1 opacity-50">webcam</span>
                  </div>

                  <div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1.5">
                      <div className={`h-full ${isSubmitted ? 'bg-success' : 'bg-blue-600'}`} style={{ width: `${s.progress}%` }}></div>
                    </div>
                    <div className={`text-[11px] font-medium truncate ${isFlagged ? 'text-warning-ink' : 'text-gray-500'}`}>
                      {s.status}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. Student panel (drawer) */}
        {selectedStudent && (
          <div className="w-[320px] bg-white border-l border-gray-200 flex flex-col shrink-0 overflow-y-auto shadow-[-8px_0_24px_rgba(0,0,0,0.02)] z-10">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="font-semibold text-gray-900 text-[15px]">Student detail</h3>
              <button onClick={() => setSelectedStudent(null)} className="p-1 rounded-md text-gray-400 hover:text-gray-900 hover:bg-gray-100">
                <XIcon />
              </button>
            </div>
            
            <div className="p-5 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center text-lg">
                  TB
                </div>
                <div>
                  <h4 className="font-bold text-[16px] text-gray-900 leading-tight">Tunde B.</h4>
                  <p className="text-[13px] font-mono text-gray-500 mt-0.5">CSC/22/117</p>
                </div>
              </div>

              {/* Webcam */}
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden relative flex items-center justify-center group">
                <Video size={24} className="text-gray-600" />
                <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-black/60 rounded text-[10px] text-white font-medium">Live</div>
              </div>

              {/* Flags */}
              <div className="space-y-2">
                <h5 className="text-[12px] font-bold text-gray-400 uppercase tracking-wider">Active Flags</h5>
                <div className="p-3 bg-warning-tint/30 border border-warning-tint rounded-lg flex gap-3">
                  <Flag className="text-warning shrink-0 mt-0.5" size={16} />
                  <div>
                    <p className="text-[13px] font-semibold text-gray-900">Tab switch detected</p>
                    <p className="text-[12px] text-gray-600 mt-1">10:12 AM and 10:14 AM</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                  Pause exam
                </button>
                <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                  Add extra time
                </button>
                <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                  Send message
                </button>
                <button className="w-full text-left px-3 py-2 text-[13px] font-medium text-danger hover:bg-danger-tint/30 rounded-md transition-colors mt-2">
                  End exam for student
                </button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
