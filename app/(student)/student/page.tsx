"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlayCircle, Calendar, Clock, MapPin, CheckCircle2, AlertCircle } from "lucide-react";

export default function StudentDashboard() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto relative">
      
      {/* Welcome Banner */}
      <div className="bg-blue-900 rounded-2xl p-6 sm:p-8 text-[#ffffff] shadow-sm relative overflow-hidden flex flex-col justify-center min-h-[160px]">
        <div className="relative z-10">
          <h2 className="text-[28px] font-bold tracking-tight mb-2">Welcome, Nifemi! 👋</h2>
          <p className="text-blue-200 text-[15px] max-w-xl">
            You are successfully cleared for the 2025/2026 First Semester Examinations. Good luck with your upcoming papers.
          </p>
        </div>
        {/* Decorative background element */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-600/40 to-transparent pointer-events-none"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Upcoming Exams Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-[18px] font-semibold text-gray-900">Upcoming Exams</h3>
            <Badge variant="blue-tint">3 scheduled</Badge>
          </div>

          {/* Active Exam Card (Ready to take) */}
          <Card className="border-blue-200 shadow-md ring-1 ring-blue-600/10 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-600"></div>
            <div className="p-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Badge variant="warning" className="mb-2 animate-pulse"><div className="w-1.5 h-1.5 bg-warning-ink rounded-full mr-1.5"></div> Live Now</Badge>
                  <h4 className="text-[18px] font-bold text-gray-900">CSC 301</h4>
                  <p className="text-[14px] text-gray-600">Data Structures</p>
                </div>
                <div className="text-right">
                  <div className="text-[14px] font-semibold text-gray-900">09:00 AM</div>
                  <div className="text-[12px] text-gray-500">60 Minutes</div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4 mt-6 p-3 bg-blue-50/50 rounded-lg border border-blue-100/50 text-[13px] text-gray-700">
                <div className="flex items-center gap-1.5"><Calendar size={15} className="text-blue-600"/> Today</div>
                <div className="flex items-center gap-1.5"><MapPin size={15} className="text-blue-600"/> CBT Centre 1, Seat 42</div>
                <div className="flex items-center gap-1.5 text-success font-medium"><CheckCircle2 size={15} /> Biometric Verified</div>
              </div>

              <Link href="/student/exam/csc301" className="block mt-4">
                <Button className="w-full text-[15px] h-11"><PlayCircle size={18} className="mr-2"/> Start Exam</Button>
              </Link>
            </div>
          </Card>

          {/* Future Exams */}
          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge variant="gray-solid" className="mb-2">Upcoming</Badge>
                <h4 className="text-[16px] font-bold text-gray-900">MTH 201</h4>
                <p className="text-[13px] text-gray-600">Mathematical Methods I</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-[13px] text-gray-600">
              <div className="flex items-center gap-1.5"><Calendar size={15} className="text-gray-400"/> Tomorrow, Oct 21</div>
              <div className="flex items-center gap-1.5"><Clock size={15} className="text-gray-400"/> 11:30 AM (90 mins)</div>
              <div className="flex items-center gap-1.5"><MapPin size={15} className="text-gray-400"/> CBT Centre 3</div>
            </div>
          </Card>

          <Card>
            <div className="flex justify-between items-start mb-4">
              <div>
                <Badge variant="gray-solid" className="mb-2">Upcoming</Badge>
                <h4 className="text-[16px] font-bold text-gray-900">PHY 101</h4>
                <p className="text-[13px] text-gray-600">General Physics</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-4 text-[13px] text-gray-600">
              <div className="flex items-center gap-1.5"><Calendar size={15} className="text-gray-400"/> Thursday, Oct 23</div>
              <div className="flex items-center gap-1.5"><Clock size={15} className="text-gray-400"/> 09:00 AM (120 mins)</div>
              <div className="flex items-center gap-1.5"><MapPin size={15} className="text-gray-400"/> Venue TBD</div>
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card title="Quick Actions">
            <div className="space-y-3 mt-2">
              <Link href="/student/mock" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors group">
                <div>
                  <h4 className="text-[14px] font-semibold text-gray-900 group-hover:text-blue-700">Practice Mock Exam</h4>
                  <p className="text-[12px] text-gray-500">Familiarize with the CBT interface</p>
                </div>
                <PlayCircle size={20} className="text-gray-400 group-hover:text-blue-600" />
              </Link>
              
              <Link href="/student/results" className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50/50 transition-colors group">
                <div>
                  <h4 className="text-[14px] font-semibold text-gray-900 group-hover:text-blue-700">View Results</h4>
                  <p className="text-[12px] text-gray-500">Check published grades</p>
                </div>
                <CheckCircle2 size={20} className="text-gray-400 group-hover:text-blue-600" />
              </Link>
            </div>
          </Card>

          <Card className="bg-gray-50/80 border-gray-200" title="Important Rules">
            <ul className="space-y-3 mt-3 text-[13px] text-gray-700">
              <li className="flex items-start gap-2">
                <AlertCircle size={14} className="text-warning-ink mt-0.5 shrink-0" />
                <span>You must be seated 30 minutes before the exam begins.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle size={14} className="text-warning-ink mt-0.5 shrink-0" />
                <span>Navigating away from the exam screen will automatically trigger a malpractice alert.</span>
              </li>
              <li className="flex items-start gap-2">
                <AlertCircle size={14} className="text-warning-ink mt-0.5 shrink-0" />
                <span>No calculators or mobile devices allowed in the centre.</span>
              </li>
            </ul>
          </Card>
        </div>
        
      </div>
    </div>
  );
}
