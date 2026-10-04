"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, Plus, MoreHorizontal, Filter, CheckSquare, 
  AlignLeft, Image as ImageIcon, CheckCircle2, Lock 
} from "lucide-react";
import Link from "next/link";

const questions = [
  { id: "q1", text: "Which data structure uses first-in, first-out ordering?", type: "MCQ", topic: "Data structures", diff: "Easy", marks: 2, status: "Approved", date: "24 Sep 2026" },
  { id: "q2", text: "Match the following sorting algorithms to their worst-case time complexities.", type: "Matching", topic: "Algorithms", diff: "Hard", marks: 4, status: "Approved", date: "25 Sep 2026" },
  { id: "q3", text: "Select all valid balanced binary trees from the list below.", type: "Multi-answer", topic: "Trees", diff: "Medium", marks: 3, status: "Pending", date: "01 Oct 2026" },
  { id: "q4", text: "Identify the missing node in this graph traversal.", type: "Image", topic: "Graphs", diff: "Medium", marks: 2, status: "Draft", date: "02 Oct 2026" },
  { id: "q5", text: "Solve the time complexity equation for Master's Theorem case 2.", type: "Equation", topic: "Algorithms", diff: "Hard", marks: 5, status: "Locked", date: "15 Sep 2026" },
  { id: "q6", text: "Explain the difference between a stack and a queue.", type: "MCQ", topic: "Data structures", diff: "Easy", marks: 2, status: "Returned", date: "03 Oct 2026" },
];

export default function QuestionBank() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Question bank</h2>
        </div>
        <Link href="/lecturer/questions/new">
          <Button>
            <Plus className="mr-2" size={18} />
            Add question
          </Button>
        </Link>
      </div>

      <Card className="flex flex-col">
        {/* Filters */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <select className="h-10 rounded-[6px] border border-gray-300 bg-white px-3 py-2 text-[14px] font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>CSC 301 - Data Structures</option>
            <option>CSC 305 - Algorithms</option>
          </select>
          
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <Input placeholder="Search questions..." className="pl-10" />
          </div>

          <Button variant="secondary" className="text-gray-700">
            <Filter className="mr-2 text-gray-500" size={18} />
            Filters
          </Button>
        </div>

        {/* Summary Strip */}
        <div className="px-4 py-3 border-b border-gray-100 bg-blue-50 flex items-center justify-between text-[13px]">
          <span className="font-semibold text-blue-900">Summary: 120 questions</span>
          <div className="flex items-center gap-2">
            <div className="flex h-2 w-[150px] rounded-full overflow-hidden bg-gray-200">
              <div className="bg-blue-100 w-[33%]" title="Easy 40"></div>
              <div className="bg-blue-500 w-[46%]" title="Medium 55"></div>
              <div className="bg-blue-900 w-[21%]" title="Hard 25"></div>
            </div>
            <span className="text-gray-500 hidden sm:inline">easy 40 / medium 55 / hard 25</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-gray-200">
                <th className="px-4 py-3 w-10">
                  <input type="checkbox" className="rounded-[4px] border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                </th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Question</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Type</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Topic</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Diff</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Marks</th>
                <th className="px-4 py-3 text-[13px] font-semibold text-gray-900">Status</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {questions.map((q) => (
                <tr key={q.id} className="hover:bg-blue-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <input type="checkbox" className="rounded-[4px] border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer" />
                  </td>
                  <td className="px-4 py-3 text-[14px] text-gray-900 max-w-xs truncate cursor-pointer group-hover:text-blue-700">
                    <Link href={`/lecturer/questions/${q.id}`}>{q.text}</Link>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-500">
                    <div className="flex items-center gap-1.5">
                      {q.type === 'MCQ' && <CheckCircle2 size={14} className="text-gray-400" />}
                      {q.type === 'Matching' && <AlignLeft size={14} className="text-gray-400" />}
                      {q.type === 'Multi-answer' && <CheckSquare size={14} className="text-gray-400" />}
                      {q.type === 'Image' && <ImageIcon size={14} className="text-gray-400" />}
                      {q.type}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[12px] font-medium truncate max-w-[120px]">
                      {q.topic}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={q.diff === 'Hard' ? 'danger' : q.diff === 'Medium' ? 'blue-tint' : 'success'}>
                      {q.diff}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-[13px] text-gray-700 font-mono">{q.marks}</td>
                  <td className="px-4 py-3">
                    <Badge variant={
                      q.status === 'Approved' ? 'blue-solid' :
                      q.status === 'Pending' ? 'warning' :
                      q.status === 'Locked' ? 'gray-solid' :
                      q.status === 'Returned' ? 'danger' : 'gray-tint'
                    }>
                      {q.status === 'Locked' && <Lock size={10} className="mr-1" />}
                      {q.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <button className="text-gray-400 hover:text-gray-900 rounded p-1">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500 bg-white">
          <span>Showing 1 to 25 of 120</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8">Previous</Button>
            <Button variant="secondary" size="sm" className="h-8">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
