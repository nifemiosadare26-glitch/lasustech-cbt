"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, MoreHorizontal, FileCheck, Calendar, Filter } from "lucide-react";

const mockExams = [
  { id: "E1", code: "CSC 301", title: "Data Structures Mid-semester", questions: 40, duration: "60 mins", status: "Approved", date: "Oct 15, 2026" },
  { id: "E2", code: "CSC 305", title: "Algorithms Final Exam", questions: 60, duration: "120 mins", status: "Draft", date: "Unscheduled" },
  { id: "E3", code: "CSC 411", title: "Artificial Intelligence", questions: 50, duration: "90 mins", status: "In Moderation", date: "Unscheduled" },
  { id: "E4", code: "CSC 201", title: "Intro to Programming", questions: 30, duration: "45 mins", status: "Scheduled", date: "Oct 20, 2026" },
];

export default function ExamManagementList() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Exams</h2>
          <p className="text-[14px] text-gray-500">Create, manage, and track your exams.</p>
        </div>
        <Link href="/lecturer/exams/new">
          <Button><Plus className="mr-2" size={16} /> Create exam</Button>
        </Link>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col relative" noPadding>
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search exams by code or title..." className="pl-9 h-9" />
          </div>
          
          <div className="flex gap-2">
            <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>All Statuses</option>
              <option>Draft</option>
              <option>In Moderation</option>
              <option>Approved</option>
              <option>Scheduled</option>
            </select>
          </div>
        </div>

        {/* Exams Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Course & Title</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Details</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockExams.map((exam) => (
                <tr key={exam.id} className="hover:bg-gray-50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shrink-0">
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-gray-900">{exam.title}</div>
                        <div className="font-mono text-[12px] text-gray-500 mt-0.5">{exam.code}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[13px] text-gray-700">{exam.questions} questions</div>
                    <div className="text-[12px] text-gray-500">{exam.duration}</div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      exam.status === 'Approved' ? 'success' :
                      exam.status === 'Draft' ? 'gray-solid' :
                      exam.status === 'In Moderation' ? 'warning' : 'blue-solid'
                    }>{exam.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={14} className="text-gray-400" />
                      {exam.date}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-900 rounded p-1 transition-colors">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
