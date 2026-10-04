"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Search, Eye, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

const mockQueue = [
  { id: "M1", type: "Exam", title: "CSC 301 Mid-semester", author: "Dr. Adeyemi", submitted: "2 hours ago", status: "Pending" },
  { id: "M2", type: "Question batch", title: "CSC 305 Chapter 1-3", author: "Dr. Bello", submitted: "5 hours ago", status: "Pending" },
  { id: "M3", type: "Exam", title: "MTH 201 Final", author: "Prof. Salami", submitted: "Yesterday", status: "Approved" },
];

export default function ModerationQueue() {
  const [tab, setTab] = useState<"review" | "submissions">("review");

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Moderation Queue</h2>
        <p className="text-[14px] text-gray-500 mt-1">Review peer submissions before they go live.</p>
      </div>

      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setTab("review")}
          className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${tab === 'review' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          Needs my review (2)
        </button>
        <button 
          onClick={() => setTab("submissions")}
          className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${tab === 'submissions' ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
        >
          My submissions
        </button>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search submissions..." className="pl-9 h-9" />
          </div>
          <Button variant="secondary" className="h-9"><Filter size={16} className="mr-2"/> Filter</Button>
        </div>

        <div className="flex-1 overflow-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Type & Title</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Submitted by</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockQueue.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[14px] text-gray-900">{item.title}</div>
                    <div className="text-[12px] text-gray-500 mt-0.5">{item.type}</div>
                  </td>
                  <td className="px-6 py-4 text-[14px] text-gray-700">{item.author}</td>
                  <td className="px-6 py-4 text-[13px] text-gray-500">{item.submitted}</td>
                  <td className="px-6 py-4">
                    <Badge variant={item.status === 'Approved' ? 'success' : 'warning'}>{item.status}</Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === 'Pending' ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="secondary" size="sm" className="h-8 text-gray-600"><Eye size={14} className="mr-1.5"/> Review</Button>
                        <Button variant="secondary" size="sm" className="h-8 text-success hover:bg-success-tint/20 border-success/30"><CheckCircle2 size={14}/></Button>
                        <Button variant="secondary" size="sm" className="h-8 text-danger hover:bg-danger-tint/20 border-danger/30"><XCircle size={14}/></Button>
                      </div>
                    ) : (
                      <Button variant="secondary" size="sm" className="h-8"><Eye size={14} className="mr-1.5"/> View</Button>
                    )}
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
