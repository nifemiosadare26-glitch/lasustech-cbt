"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GraduationCap, Download, History } from "lucide-react";
import { Button } from "@/components/ui/button";

const mockResults = [
  { course: "MTH 201", title: "Mathematical Methods I", unit: 3, score: 68, grade: "B", status: "Published" },
  { course: "CSC 201", title: "Intro to Programming", unit: 3, score: 74, grade: "A", status: "Published" },
  { course: "PHY 101", title: "General Physics", unit: 2, score: 45, grade: "D", status: "Published" },
  { course: "GST 111", title: "Communication in English", unit: 2, score: null, grade: "-", status: "Pending" },
  { course: "CSC 301", title: "Data Structures", unit: 3, score: null, grade: "-", status: "Pending" },
];

export default function StudentResults() {
  const publishedResults = mockResults.filter(r => r.status === 'Published');
  
  // Calculate GPA mock
  const totalUnits = publishedResults.reduce((acc, curr) => acc + curr.unit, 0);
  const gradePoints: Record<string, number> = { "A": 5, "B": 4, "C": 3, "D": 2, "E": 1, "F": 0 };
  const totalPoints = publishedResults.reduce((acc, curr) => acc + (gradePoints[curr.grade] * curr.unit), 0);
  const cgpa = (totalPoints / totalUnits).toFixed(2);

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">My Results</h2>
          <p className="text-[14px] text-gray-500 mt-1">2025/2026 First Semester Examination</p>
        </div>
        <Button variant="secondary"><Download size={16} className="mr-2"/> Download Statement</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card className="bg-blue-900 text-[#ffffff] border-none shadow-md overflow-hidden relative">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
              <GraduationCap size={120} className="-mr-6 -mt-6" />
            </div>
            <div className="relative z-10 p-2">
              <p className="text-[14px] text-blue-200 font-medium mb-1">Current CGPA</p>
              <h3 className="text-[42px] font-bold tracking-tight">{cgpa}</h3>
              <p className="text-[13px] text-blue-200 mt-2">Based on {totalUnits} credited units</p>
            </div>
          </Card>

          <Card title="Grading System">
            <div className="space-y-2 mt-2">
              {[
                { grade: 'A', range: '70-100', pt: '5.0' },
                { grade: 'B', range: '60-69', pt: '4.0' },
                { grade: 'C', range: '50-59', pt: '3.0' },
                { grade: 'D', range: '45-49', pt: '2.0' },
                { grade: 'E', range: '40-44', pt: '1.0' },
                { grade: 'F', range: '0-39', pt: '0.0' },
              ].map(g => (
                <div key={g.grade} className="flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 w-4">{g.grade}</span>
                    <span className="text-gray-500">({g.range})</span>
                  </div>
                  <span className="font-mono text-gray-700">{g.pt} pt</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card className="h-full flex flex-col" noPadding>
            <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gray-50/50">
              <History size={18} className="text-gray-400" />
              <h3 className="font-semibold text-[15px] text-gray-900">Transcript Preview</h3>
            </div>
            
            <div className="flex-1 overflow-x-auto bg-white">
              <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Course</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Unit</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Score</th>
                    <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Grade</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {mockResults.map(res => (
                    <tr key={res.course} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="font-mono text-[13px] font-medium text-gray-900">{res.course}</div>
                        <div className="text-[12px] text-gray-500 mt-0.5">{res.title}</div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-gray-700">{res.unit}</td>
                      <td className="px-6 py-4">
                        {res.score !== null ? (
                          <span className="text-[14px] font-semibold text-gray-900">{res.score}%</span>
                        ) : (
                          <Badge variant="gray-solid">Processing</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {res.status === 'Published' ? (
                          <Badge variant={res.grade === 'A' ? 'success' : res.grade === 'F' ? 'danger' : 'blue-tint'}>
                            {res.grade}
                          </Badge>
                        ) : (
                          <span className="text-gray-400 font-mono">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
