"use client";

import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Calculator, Ruler, Circle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ExamAttemptPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState<string | null>("B");
  const [isFlagged, setIsFlagged] = useState(false);
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const options = [
    { id: "A", text: "Stack" },
    { id: "B", text: "Queue" },
    { id: "C", text: "Binary tree" },
    { id: "D", text: "Graph" },
  ];

  // Palette generation
  const palette = Array.from({ length: 40 }, (_, i) => {
    const num = i + 1;
    let status = "unanswered";
    if (num <= 11) status = "answered";
    if (num === 12) status = "current";
    if (num === 14) status = "flagged";
    if (num === 15) status = "flagged-answered";
    return { num, status };
  });

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      
      {/* 1. Top bar */}
      <header className="h-12 bg-blue-900 text-white px-4 flex items-center justify-between shrink-0 shadow-sm z-20">
        <div className="font-bold text-[15px] truncate max-w-[30%]">CSC 301 | Section A</div>
        
        {/* 2. Tools dock */}
        <div className="hidden sm:flex items-center gap-2">
          <button 
            className={cn("h-8 px-3 rounded text-[13px] font-medium transition-colors flex items-center gap-2", activeTool === 'calc' ? 'bg-blue-600 border-b-2 border-white' : 'bg-blue-800 hover:bg-blue-700')}
            onClick={() => setActiveTool(activeTool === 'calc' ? null : 'calc')}
          >
            <Calculator size={16} /> Calculator
          </button>
          <button 
            className={cn("h-8 px-3 rounded text-[13px] font-medium transition-colors flex items-center gap-2", activeTool === 'prot' ? 'bg-blue-600 border-b-2 border-white' : 'bg-blue-800 hover:bg-blue-700')}
            onClick={() => setActiveTool(activeTool === 'prot' ? null : 'prot')}
          >
            <Ruler size={16} /> Protractor
          </button>
        </div>
        
        {/* 3 & 4. Save indicator & Timer */}
        <div className="flex items-center gap-4">
          <span className="text-[13px] text-blue-200 hidden md:inline">Saved 3 s ago</span>
          <div className="bg-white text-blue-900 font-mono font-bold text-[18px] px-3 py-1 rounded shadow-sm leading-none flex items-center h-8">
            01:24:18
          </div>
        </div>
      </header>

      {/* 5. Banner area */}
      {/* <div className="bg-warning-tint text-warning-ink px-4 py-2 text-[14px] font-medium text-center">
        Connection lost. Your answers are saved on this device. Reconnecting...
      </div> */}

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left: Question Area */}
        <main className="flex-1 flex flex-col items-center p-4 sm:p-8 overflow-y-auto w-full relative">
          <div className="w-full max-w-[720px] flex flex-col h-full">
            
            {/* 6. Question header */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
              <h2 className="text-[20px] font-bold text-gray-900 flex items-center gap-2">
                Question 12 of 40
                {isFlagged && <Flag size={18} className="text-warning fill-warning" />}
              </h2>
              <span className="text-[15px] font-medium text-gray-500">2 marks</span>
            </div>
            
            {/* Question Text */}
            <div className="text-[16px] md:text-[18px] text-gray-900 mb-8 leading-relaxed">
              Which data structure uses first-in, first-out ordering?
            </div>
            
            {/* 7. Options */}
            <div className="space-y-3 mb-12">
              {options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <label 
                    key={opt.id}
                    className={cn(
                      "flex items-center p-4 rounded-[8px] border-2 cursor-pointer transition-all min-h-[56px]",
                      isSelected 
                        ? "border-blue-600 bg-blue-100" 
                        : "border-gray-300 bg-white hover:border-gray-400"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 shrink-0",
                      isSelected ? "border-blue-600" : "border-gray-400"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <span className="font-medium text-gray-700 w-8 shrink-0">{opt.id}.</span>
                    <span className="text-[16px] text-gray-900">{opt.text}</span>
                  </label>
                );
              })}
            </div>
            
            {/* 8. Navigation bar */}
            <div className="mt-auto pt-6 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between sticky bottom-0 bg-gray-50 pb-4">
              <Button variant="secondary" className="px-6">Previous</Button>
              
              <div className="flex items-center gap-3 ml-auto sm:ml-0">
                <Button 
                  variant="tertiary" 
                  className={cn("text-gray-600", isFlagged && "text-warning bg-warning-tint/30 hover:bg-warning-tint/50")}
                  onClick={() => setIsFlagged(!isFlagged)}
                >
                  <Flag className={cn("mr-2", isFlagged && "fill-warning")} size={18} /> 
                  <span className="hidden sm:inline">{isFlagged ? "Flagged" : "Flag for review"}</span>
                </Button>
                <Button className="px-8" onClick={() => router.push(`/student/exam/${params.id}/done`)}>
                  Save and next
                </Button>
              </div>
            </div>

          </div>
        </main>
        
        {/* Right: Palette */}
        <aside className="w-[320px] shrink-0 border-l border-gray-200 bg-white p-6 flex flex-col overflow-y-auto hidden lg:flex shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[15px] text-gray-900">Question palette</h3>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-8">
            {palette.map((p) => {
              const bg = 
                p.status === "current" ? "bg-white border-[2.5px] border-blue-900 text-blue-900 font-bold" :
                p.status.includes("answered") ? "bg-blue-600 border border-blue-600 text-white" : 
                "bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200";
              
              const isFlagged = p.status.includes("flagged");

              return (
                <button 
                  key={p.num} 
                  className={cn("h-10 rounded-[6px] text-[14px] font-medium transition-colors relative flex items-center justify-center", bg)}
                >
                  {p.num}
                  {isFlagged && (
                    <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                      <Flag size={10} className="text-warning fill-warning" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-[12px] text-gray-600 mb-6">
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-blue-600 rounded-sm"></div> Answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded-sm"></div> Not answered</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded-sm relative"><Flag size={8} className="absolute -top-1 -right-1 text-warning fill-warning"/></div> Flagged</div>
              <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border-2 border-blue-900 rounded-sm"></div> Current</div>
            </div>
            <Link href={`/student/exam/${params.id}/done`}>
              <Button variant="primary" className="w-full h-12 text-[15px]">
                Submit exam
              </Button>
            </Link>
          </div>
        </aside>

      </div>
    </div>
  );
}
