"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Calendar, Clock, Edit2, ArrowRight } from "lucide-react";

export default function SessionsAndSemesters() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Sessions & Semesters</h2>
          <p className="text-[14px] text-gray-500 mt-1">Define academic sessions. Exams and results belong to one session.</p>
        </div>
        <Button><Plus className="mr-2" size={16} /> Create session</Button>
      </div>

      <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[28px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
        
        {/* Next Session */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-gray-50 bg-white text-gray-400 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <Calendar size={24} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-2">
            <Card className="hover:border-blue-300 transition-colors border-dashed bg-gray-50/50">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-[18px] font-bold text-gray-900">2027/2028 Session</h3>
                  <p className="text-[13px] text-gray-500 mt-1">Starts Oct 2027</p>
                </div>
                <Badge variant="default">Next</Badge>
              </div>
              <Button variant="secondary" size="sm" className="w-full">Setup semesters</Button>
            </Card>
          </div>
        </div>

        {/* Current Session */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-blue-50 bg-blue-600 text-white shadow-md shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <Clock size={24} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-2">
            <Card className="border-2 border-blue-500 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-10 -mt-10"></div>
              
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="text-[20px] font-bold text-gray-900">2026/2027 Session</h3>
                  <p className="text-[14px] text-gray-500 mt-1">Oct 1, 2026 – Jul 30, 2027</p>
                </div>
                <Badge variant="blue-solid" className="shadow-sm">Current</Badge>
              </div>

              <div className="space-y-3 relative z-10">
                <div className="p-3 rounded-lg border border-blue-100 bg-blue-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-blue-900 text-[14px]">1st Semester</span>
                    <span className="text-[12px] text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-100">Active</span>
                  </div>
                  <div className="text-[13px] text-gray-600 flex justify-between">
                    <span>Oct 1, 2026 – Feb 28, 2027</span>
                    <span className="font-medium text-gray-900">42 exams</span>
                  </div>
                </div>
                
                <div className="p-3 rounded-lg border border-gray-200 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold text-gray-700 text-[14px]">2nd Semester</span>
                    <span className="text-[12px] text-gray-500 bg-white px-2 py-0.5 rounded border border-gray-200">Upcoming</span>
                  </div>
                  <div className="text-[13px] text-gray-500 flex justify-between">
                    <span>Mar 15, 2027 – Jul 30, 2027</span>
                    <span>0 exams</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2 relative z-10">
                <Button variant="secondary" size="sm" className="flex-1"><Edit2 size={14} className="mr-2" /> Edit dates</Button>
                <Button variant="secondary" size="sm" className="flex-1">Close session</Button>
              </div>
            </Card>
          </div>
        </div>

        {/* Past Session */}
        <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          <div className="flex items-center justify-center w-14 h-14 rounded-full border-4 border-gray-50 bg-white text-gray-400 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            <Calendar size={24} />
          </div>
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-3rem)] p-2">
            <Card className="opacity-70 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-[18px] font-bold text-gray-900">2025/2026 Session</h3>
                  <p className="text-[13px] text-gray-500 mt-1">Oct 1, 2025 – Jul 30, 2026</p>
                </div>
                <Badge variant="gray-solid">Closed</Badge>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[13px] border-b border-gray-100 pb-2">
                  <span className="text-gray-600 font-medium">1st Semester</span>
                  <span className="text-gray-500">214 exams</span>
                </div>
                <div className="flex justify-between text-[13px] pt-1">
                  <span className="text-gray-600 font-medium">2nd Semester</span>
                  <span className="text-gray-500">198 exams</span>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-gray-100">
                <Button variant="tertiary" size="sm" className="w-full text-blue-700">View archive <ArrowRight size={14} className="ml-1" /></Button>
              </div>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
