"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, Clock, BookOpen, AlertTriangle } from "lucide-react";

export default function MockExamLanding() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative max-w-4xl mx-auto">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Practice Mock Exam</h2>
        <p className="text-[14px] text-gray-500 mt-1">Familiarize yourself with the computer-based testing interface.</p>
      </div>

      <Card className="border-t-4 border-t-blue-600">
        <div className="p-2 sm:p-4 text-center pb-8 border-b border-gray-100">
          <div className="mx-auto w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6 border border-blue-100">
            <BookOpen size={28} />
          </div>
          <h3 className="text-[22px] font-bold text-gray-900">General Studies Mock Test</h3>
          <p className="text-[14px] text-gray-600 max-w-xl mx-auto mt-2">
            This is a 10-minute diagnostic test with 10 questions. The score from this mock exam does not count towards your GPA. It is strictly for familiarization purposes.
          </p>
        </div>

        <div className="p-4 sm:p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <Clock size={24} className="text-gray-400 shrink-0" />
              <div>
                <h4 className="text-[14px] font-semibold text-gray-900">Strict Timing</h4>
                <p className="text-[13px] text-gray-600 mt-1">The timer starts immediately after clicking start. The system will auto-submit when the time expires.</p>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
              <AlertTriangle size={24} className="text-gray-400 shrink-0" />
              <div>
                <h4 className="text-[14px] font-semibold text-gray-900">Anti-Malpractice</h4>
                <p className="text-[13px] text-gray-600 mt-1">Opening a new tab, minimizing the browser, or losing focus will be logged as an infraction.</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50/50 p-6 rounded-xl border border-blue-100 text-center space-y-4">
            <p className="text-[14px] font-medium text-gray-800">Ensure you have a stable internet connection before proceeding.</p>
            <Link href="/student/exam/mock" className="inline-block">
              <Button className="h-12 px-8 text-[16px]"><PlayCircle className="mr-2" size={20} /> Start Mock Exam Now</Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
