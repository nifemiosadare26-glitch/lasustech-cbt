"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, Clock, X, AlertTriangle } from "lucide-react";

export default function ExamReports() {
  const [isLiveLogOpen, setIsLiveLogOpen] = React.useState(false);
  const [downloading, setDownloading] = React.useState<string | null>(null);

  const handleDownload = (id: string, filename: string, content: string) => {
    setDownloading(id);
    setTimeout(() => {
      const blob = new Blob([content], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloading(null);
    }, 1500);
  };

  return (
    <>
      <div className="space-y-6 pb-12 flex flex-col h-full relative max-w-5xl mx-auto">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Reports & Broadsheets</h2>
          <p className="text-[14px] text-gray-500 mt-1">Generate official Senate-formatted documents and statistical analyses.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Senate Format */}
          <Card className="flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">Senate Format Broadsheet</h3>
                <p className="text-[13px] text-gray-500 mt-1">Official comprehensive score sheet containing continuous assessments and exam scores for final approval.</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-auto border-t border-gray-100 pt-4">
              <div>
                <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Department</label>
                <select className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700">
                  <option>Computer Science</option>
                  <option>Mathematics</option>
                </select>
              </div>
              <div>
                <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Level</label>
                <select className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700">
                  <option>300 Level</option>
                  <option>400 Level</option>
                </select>
              </div>
              <Button 
                className="w-full" 
                isLoading={downloading === 'senate'}
                onClick={() => handleDownload('senate', 'Senate_Broadsheet_CSC_300L.pdf', 'MOCK PDF DATA')}
              >
                {!downloading && <Download size={16} className="mr-2"/>}
                {downloading === 'senate' ? 'Generating...' : 'Generate PDF'}
              </Button>
            </div>
          </Card>

          {/* Statistical Analysis */}
          <Card className="flex flex-col">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-success-tint/20 text-success flex items-center justify-center shrink-0">
                <BarChart3 size={24} />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">Course Performance Analytics</h3>
                <p className="text-[13px] text-gray-500 mt-1">Detailed breakdown of pass/fail ratios, grade distributions, and item difficulty analysis.</p>
              </div>
            </div>
            
            <div className="space-y-4 mt-auto border-t border-gray-100 pt-4">
              <div>
                <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Course</label>
                <select className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700">
                  <option>CSC 301 - Data Structures</option>
                  <option>CSC 305 - Algorithms</option>
                </select>
              </div>
              <Button 
                variant="secondary" 
                className="w-full"
                isLoading={downloading === 'analytics'}
                onClick={() => handleDownload('analytics', 'Performance_Analytics_CSC301.csv', 'Matric,Score,Grade\nCSC/22/101,85,A\nCSC/22/117,72,B')}
              >
                {!downloading && <Download size={16} className="mr-2"/>}
                {downloading === 'analytics' ? 'Exporting...' : 'Export Excel Analytics'}
              </Button>
            </div>
          </Card>

          {/* Malpractice */}
          <Card className="flex flex-col md:col-span-2">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-warning-tint/20 text-warning-ink flex items-center justify-center shrink-0">
                <ShieldAlertIcon />
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-gray-900">Malpractice & Incident Log</h3>
                <p className="text-[13px] text-gray-500 mt-1">Comprehensive log of all flagged activities, network drops, and invigilator interventions for the current session.</p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-4 border-t border-gray-100 pt-4">
              <Button variant="secondary" className="flex-1" onClick={() => setIsLiveLogOpen(true)}>
                <Clock size={16} className="mr-2"/> View Live Log
              </Button>
              <Button 
                variant="secondary" 
                className="flex-1"
                isLoading={downloading === 'incidents'}
                onClick={() => handleDownload('incidents', 'Incident_Log_Session_2026.txt', '[09:42 AM] - Connection dropped for CSC/22/117\n[10:15 AM] - Tab switch detected for CSC/22/089')}
              >
                {!downloading && <Download size={16} className="mr-2"/>}
                {downloading === 'incidents' ? 'Downloading...' : 'Download Complete Report'}
              </Button>
            </div>
          </Card>
        </div>
      </div>

      {/* Slide-over Panel for Live Log */}
      {isLiveLogOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsLiveLogOpen(false)}
            aria-hidden="true"
          />
          <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white shadow-xl ring-1 ring-slate-900/5 flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0 bg-white">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><AlertTriangle size={18} className="text-warning-ink"/> Live Incident Log</h2>
                  <p className="text-sm text-slate-500">Real-time system flags and interventions.</p>
                </div>
                <button
                  type="button"
                  className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  onClick={() => setIsLiveLogOpen(false)}
                >
                  <span className="sr-only">Close panel</span>
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-900 p-4 font-mono text-sm">
                <div className="space-y-3">
                  <div className="text-blue-400">[SYSTEM] Live monitoring started for Session 2026/2027.</div>
                  <div className="text-gray-300"><span className="text-gray-500">[09:05:12 AM]</span> <span className="text-green-400">SUCCESS</span>: CSC/22/117 logged in successfully from IP 192.168.1.45</div>
                  <div className="text-gray-300"><span className="text-gray-500">[09:15:00 AM]</span> <span className="text-green-400">SUCCESS</span>: CSC/22/089 logged in successfully from IP 192.168.1.46</div>
                  <div className="text-gray-300"><span className="text-gray-500">[09:22:15 AM]</span> <span className="text-yellow-400">WARNING</span>: CSC/22/089 tab visibility lost for 4 seconds.</div>
                  <div className="text-gray-300"><span className="text-gray-500">[09:42:01 AM]</span> <span className="text-red-400">ERROR</span>: Connection dropped for CSC/22/117. Heartbeat timeout.</div>
                  <div className="text-gray-300"><span className="text-gray-500">[10:02:18 AM]</span> <span className="text-green-400">SUCCESS</span>: CSC/22/089 submitted exam PHY 101.</div>
                  <div className="flex items-center gap-2 text-gray-500 mt-4 animate-pulse">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div> Awaiting new events...
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

function ShieldAlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
