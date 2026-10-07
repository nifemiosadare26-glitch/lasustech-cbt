"use client";

import React from "react";
import { ChevronDown, Download, MessageSquareWarning } from "lucide-react";

export default function StudentResultsPage() {
  return (
    <div className="max-w-4xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Results</h1>
        <button className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors">
          Session 2026/2027
          <ChevronDown size={16} className="text-slate-500" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* CSC 301 Result */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-6">CSC 301</h2>
            
            {/* Score Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="none" />
                <circle 
                  cx="50" cy="50" r="42" 
                  className="text-blue-600" 
                  strokeWidth="10" 
                  strokeDasharray="263.89" 
                  strokeDashoffset={263.89 - (263.89 * 0.78)} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="none" 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">78%</span>
                <span className="text-sm font-semibold text-slate-600 mt-1">Grade A</span>
              </div>
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
              Passed
            </span>
          </div>
          
          <div className="border-t border-slate-100 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Detail: sections and scores</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex justify-between items-center">
                <span>Section A</span>
                <span className="font-semibold text-slate-900">30 / 40</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Section B</span>
                <span className="font-semibold text-slate-900">18 / 20</span>
              </div>
            </div>
            
            {/* Class Average Bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>You</span>
                <span>Class average 62%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                 <div className="absolute top-0 left-0 h-full bg-slate-400 w-[62%] rounded-full opacity-50" />
                 <div className="absolute top-0 left-0 h-full bg-blue-600 w-[78%] rounded-full" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                <Download size={16} /> PDF
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                <MessageSquareWarning size={16} /> Request remark
              </button>
            </div>
          </div>
        </div>

        {/* MTH 201 Result */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <h2 className="text-xl font-bold text-slate-900 mb-6">MTH 201</h2>
            
            <div className="relative w-36 h-36 flex items-center justify-center mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" className="text-slate-100" strokeWidth="10" stroke="currentColor" fill="none" />
                <circle 
                  cx="50" cy="50" r="42" 
                  className="text-blue-600" 
                  strokeWidth="10" 
                  strokeDasharray="263.89" 
                  strokeDashoffset={263.89 - (263.89 * 0.61)} 
                  strokeLinecap="round" 
                  stroke="currentColor" 
                  fill="none" 
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900">61%</span>
                <span className="text-sm font-semibold text-slate-600 mt-1">Grade B</span>
              </div>
            </div>

            <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-sm">
              Passed
            </span>
          </div>
          
          <div className="border-t border-slate-100 bg-slate-50 p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Detail: sections and scores</h3>
            <div className="space-y-3 text-sm text-slate-700">
              <div className="flex justify-between items-center">
                <span>Section A</span>
                <span className="font-semibold text-slate-900">40 / 50</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Section B</span>
                <span className="font-semibold text-slate-900">21 / 50</span>
              </div>
            </div>
            
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between text-xs font-medium text-slate-500">
                <span>You</span>
                <span>Class average 54%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden relative">
                 <div className="absolute top-0 left-0 h-full bg-slate-400 w-[54%] rounded-full opacity-50" />
                 <div className="absolute top-0 left-0 h-full bg-blue-600 w-[61%] rounded-full" />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-3">
              <button className="flex-1 inline-flex items-center justify-center gap-2 h-10 rounded-lg bg-white border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">
                <Download size={16} /> PDF
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
