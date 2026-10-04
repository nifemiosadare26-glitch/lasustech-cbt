"use client";

import * as React from "react";
import { StatCard, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, UserSquare, MessageSquareWarning, CheckCircle2, TrendingUp, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function OfficerDashboard() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Exam Officer Dashboard</h2>
        <p className="text-[14px] text-gray-500 mt-1">Overview of schedules, results, and student appeals.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Upcoming Exams" value="12" icon={CalendarClock} trend={{ value: 4, label: "this week", isPositive: true }} />
        <StatCard title="Cleared Students" value="4,120" icon={UserSquare} trend={{ value: 85, label: "cleared rate", isPositive: true }} />
        <StatCard title="Open Appeals" value="28" icon={MessageSquareWarning} trend={{ value: 5, label: "new today", isPositive: false }} />
        <StatCard title="Results Published" value="8" icon={CheckCircle2} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card title="Today's Schedule" noPadding>
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input placeholder="Search scheduled exams..." className="pl-9 h-9" />
              </div>
            </div>
            <div className="overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Time & Venue</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Invigilators</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[13px] text-gray-900">09:00 AM - 10:00 AM</div>
                      <div className="text-[12px] text-gray-500">CBT Centre 1</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[13px] font-medium text-blue-700">CSC 301</div>
                      <div className="text-[12px] text-gray-900">Data Structures</div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-600">A. Ibrahim, S. Yusuf</td>
                    <td className="px-6 py-4"><Badge variant="blue-solid" className="animate-pulse">In Progress</Badge></td>
                  </tr>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[13px] text-gray-900">11:00 AM - 12:30 PM</div>
                      <div className="text-[12px] text-gray-500">CBT Centre 2</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-mono text-[13px] font-medium text-gray-700">MTH 201</div>
                      <div className="text-[12px] text-gray-900">Mathematical Methods I</div>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-600">Pending Assignment</td>
                    <td className="px-6 py-4"><Badge variant="warning">Upcoming</Badge></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Recent Appeals">
            <div className="space-y-4 mt-2">
              <div className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                <MessageSquareWarning size={16} className="text-warning mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-900">Missing Script Request</h4>
                  <p className="text-[12px] text-gray-500 mt-1">Student: Tunde B. (CSC/22/117)</p>
                  <p className="text-[12px] text-gray-500">Course: PHY 101</p>
                  <Button variant="tertiary" size="sm" className="mt-2 h-7 px-2">Review Appeal</Button>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg bg-gray-50">
                <MessageSquareWarning size={16} className="text-warning mt-0.5" />
                <div>
                  <h4 className="text-[13px] font-semibold text-gray-900">Result Remarking</h4>
                  <p className="text-[12px] text-gray-500 mt-1">Student: Sarah J. (CSC/22/089)</p>
                  <p className="text-[12px] text-gray-500">Course: CSC 201</p>
                  <Button variant="tertiary" size="sm" className="mt-2 h-7 px-2">Review Appeal</Button>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
