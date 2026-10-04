"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, BarChart3, Clock, CheckCircle2 } from "lucide-react";

export default function ExamReports() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative max-w-5xl mx-auto">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Reports & Broadsheets</h2>
        <p className="text-[14px] text-gray-500 mt-1">Generate official Senate-formatted documents and statistical analyses.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Senate Format */}
        <Card className="flex flex-col">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
              <FileText size={24} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">Senate Format Broadsheet</h3>
              <p className="text-[13px] text-gray-500 mt-1">Official comprehensive score sheet containing continuous assessments and exam scores for final approval.</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-auto border-t border-gray-100 pt-4">
            <div>
              <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Department</label>
              <select className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700">
                <option>Computer Science</option>
                <option>Mathematics</option>
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Level</label>
              <select className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700">
                <option>300 Level</option>
                <option>400 Level</option>
              </select>
            </div>
            <Button className="w-full"><Download size={16} className="mr-2"/> Generate PDF</Button>
          </div>
        </Card>

        {/* Statistical Analysis */}
        <Card className="flex flex-col">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-success-tint/20 text-success flex items-center justify-center shrink-0">
              <BarChart3 size={24} />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">Course Performance Analytics</h3>
              <p className="text-[13px] text-gray-500 mt-1">Detailed breakdown of pass/fail ratios, grade distributions, and item difficulty analysis.</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-auto border-t border-gray-100 pt-4">
            <div>
              <label className="text-[12px] font-semibold text-gray-900 block mb-1">Select Course</label>
              <select className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-700">
                <option>CSC 301 - Data Structures</option>
                <option>CSC 305 - Algorithms</option>
              </select>
            </div>
            <Button variant="secondary" className="w-full"><Download size={16} className="mr-2"/> Export Excel Analytics</Button>
          </div>
        </Card>

        {/* Malpractice */}
        <Card className="flex flex-col md:col-span-2">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-lg bg-warning-tint/20 text-warning-ink flex items-center justify-center shrink-0">
              <ShieldAlertIcon />
            </div>
            <div>
              <h3 className="text-[18px] font-bold text-gray-900">Malpractice & Incident Log</h3>
              <p className="text-[13px] text-gray-500 mt-1">Comprehensive log of all flagged activities, network drops, and invigilator interventions for the current session.</p>
            </div>
          </div>
          
          <div className="flex gap-3 mt-4 border-t border-gray-100 pt-4">
            <Button variant="secondary" className="flex-1"><Clock size={16} className="mr-2"/> View Live Log</Button>
            <Button variant="secondary" className="flex-1"><Download size={16} className="mr-2"/> Download Complete Report</Button>
          </div>
        </Card>

      </div>
    </div>
  );
}

function ShieldAlertIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  );
}
