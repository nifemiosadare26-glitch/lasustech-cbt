"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, Users, TrendingUp, Award, Search, MoreHorizontal } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Input } from "@/components/ui/input";

const scoreData = [
  { range: "0-39", count: 12, label: "F" },
  { range: "40-44", count: 8, label: "E" },
  { range: "45-49", count: 15, label: "D" },
  { range: "50-59", count: 45, label: "C" },
  { range: "60-69", count: 32, label: "B" },
  { range: "70-100", count: 18, label: "A" },
];

const mockStudents = [
  { matric: "CSC/22/101", name: "Ada O.", score: 85, grade: "A", time: "55m 20s" },
  { matric: "CSC/22/117", name: "Tunde B.", score: 62, grade: "B", time: "59m 10s" },
  { matric: "CSC/22/045", name: "Chinedu M.", score: 48, grade: "D", time: "60m 00s" },
  { matric: "CSC/22/130", name: "Zainab K.", score: 74, grade: "A", time: "42m 15s" },
  { matric: "CSC/22/089", name: "Sarah J.", score: 35, grade: "F", time: "60m 00s" },
];

const getGradeColor = (grade: string) => {
  if (grade === "A" || grade === "B") return "bg-green-100 text-green-800";
  if (grade === "C") return "bg-blue-100 text-blue-800";
  if (grade === "D" || grade === "E") return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

export default function ExamResults() {
  const router = useRouter();

  const handleDownload = (format: "csv" | "pdf") => {
    const filename = `CSC_301_Results.${format}`;
    const content = format === "csv" 
      ? "Matric,Name,Score,Grade,Time\n" + mockStudents.map(s => `${s.matric},${s.name},${s.score},${s.grade},${s.time}`).join("\n")
      : "PDF document mock content";
      
    const blob = new Blob([content], { type: format === 'csv' ? 'text/csv' : 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="px-2 h-9" onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">CSC 301 Mid-semester Results</h2>
            <p className="text-[13px] text-gray-500">Exam completed Oct 15, 2026</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => handleDownload("csv")}><Download size={16} className="mr-2"/> Export CSV</Button>
          <Button onClick={() => handleDownload("pdf")}><Download size={16} className="mr-2"/> Download PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total Students" value="130" delta="+4% vs last year" trendType="up" />
        <StatCard label="Average Score" value="58.4%" delta="-2.1% vs last year" trendType="down" />
        <StatCard label="Pass Rate" value="90.7%" delta="+5.2% vs last year" trendType="up" />
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
                        <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-bold ${getGradeColor(s.grade)}`}>
                          {s.grade}
                        </div>
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
          <Card className="h-[400px] flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-white">
              <h3 className="font-semibold text-[17px] text-gray-900 tracking-tight">Score Distribution</h3>
              <div className="flex items-center gap-3 text-[12px] font-medium text-gray-500">
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>Pass</div>
                <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>Fail</div>
              </div>
            </div>
            <div className="flex-1 p-4 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="range" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-gray-500)" }} dy={10} interval={0} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "var(--color-gray-500)" }} />
                  <Tooltip 
                    cursor={{ fill: 'var(--color-gray-50)' }}
                    contentStyle={{ borderRadius: '8px', border: '1px solid var(--color-gray-200)', boxShadow: 'var(--shadow-float)' }}
                    formatter={(value: any, name: any, props: any) => [value, props.payload.label]}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {scoreData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.label.includes('F') ? 'var(--color-danger, #ef4444)' : 'var(--color-blue-600, #2563eb)'} />
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
