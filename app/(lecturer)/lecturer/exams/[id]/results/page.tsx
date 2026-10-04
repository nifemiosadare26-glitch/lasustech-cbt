"use client";

import * as React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Users, TrendingUp, Award, Search, MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Input } from "@/components/ui/input";

const scoreData = [
  { range: "0-39", count: 12, label: "Fail (F)" },
  { range: "40-44", count: 8, label: "Pass (E)" },
  { range: "45-49", count: 15, label: "Fair (D)" },
  { range: "50-59", count: 45, label: "Good (C)" },
  { range: "60-69", count: 32, label: "V. Good (B)" },
  { range: "70-100", count: 18, label: "Excell. (A)" },
];

const mockStudents = [
  { matric: "CSC/22/101", name: "Ada O.", score: 85, grade: "A", time: "55m 20s" },
  { matric: "CSC/22/117", name: "Tunde B.", score: 62, grade: "B", time: "59m 10s" },
  { matric: "CSC/22/045", name: "Chinedu M.", score: 48, grade: "D", time: "60m 00s" },
  { matric: "CSC/22/130", name: "Zainab K.", score: 74, grade: "A", time: "42m 15s" },
  { matric: "CSC/22/089", name: "Sarah J.", score: 35, grade: "F", time: "60m 00s" },
];

export default function ExamResults({ params }: { params: { id: string } }) {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/lecturer/exams">
            <Button variant="secondary" className="px-2 h-9"><ArrowLeft size={18} /></Button>
          </Link>
          <div>
            <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">CSC 301 Mid-semester Results</h2>
            <p className="text-[13px] text-gray-500">Exam completed Oct 15, 2026</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Download size={16} className="mr-2"/> Export CSV</Button>
          <Button><Download size={16} className="mr-2"/> Download PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Students" value="130" icon={Users} trend={{ value: 100, label: "attendance", isPositive: true }} />
        <StatCard title="Average Score" value="58.4%" icon={TrendingUp} />
        <StatCard title="Pass Rate" value="90.7%" icon={Award} trend={{ value: 12, label: "failed", isPositive: false }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col min-h-[400px]">
          <Card title="Student Breakdown" className="flex-1 flex flex-col overflow-hidden" noPadding>
            <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                <Input placeholder="Search matric or name..." className="pl-9 h-9" />
              </div>
              <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700">
                <option>All Grades</option>
                <option>A (70-100)</option>
                <option>B (60-69)</option>
                <option>C (50-59)</option>
                <option>D (45-49)</option>
                <option>E (40-44)</option>
                <option>F (0-39)</option>
              </select>
            </div>
            
            <div className="flex-1 overflow-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Matric & Name</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Time taken</th>
                    <th className="px-6 py-3 w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockStudents.map(s => (
                    <tr key={s.matric} className="hover:bg-gray-50">
                      <td className="px-6 py-3">
                        <div className="font-mono text-[13px] text-gray-900 font-medium">{s.matric}</div>
                        <div className="text-[13px] text-gray-500">{s.name}</div>
                      </td>
                      <td className="px-6 py-3 text-[14px] font-semibold text-gray-900">{s.score}%</td>
                      <td className="px-6 py-3">
                        <Badge variant={s.grade === 'F' ? 'danger' : s.grade === 'A' ? 'success' : 'blue-tint'}>{s.grade}</Badge>
                      </td>
                      <td className="px-6 py-3 text-[13px] text-gray-500">{s.time}</td>
                      <td className="px-6 py-3">
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
        
        <div className="space-y-6">
          <Card title="Score Distribution" className="h-[400px]">
            <div className="h-[300px] mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-gray-500)" }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-gray-500)" }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-gray-50)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-gray-200)', boxShadow: 'var(--shadow-float)' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.label.includes('F') ? 'var(--color-danger)' : 'var(--color-blue-600)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
