"use client";

import * as React from "react";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Flag, Calculator, Ruler, CheckCircle2, Camera, X } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

// Mock questions
const mockQuestions = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  text: i === 11 ? "Which data structure uses first-in, first-out ordering?" : `Sample question ${i + 1} text?`,
  options: [
    { id: "A", text: i === 11 ? "Stack" : "Option A" },
    { id: "B", text: i === 11 ? "Queue" : "Option B" },
    { id: "C", text: i === 11 ? "Binary tree" : "Option C" },
    { id: "D", text: i === 11 ? "Graph" : "Option D" },
  ]
}));

export default function ExamAttemptPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params?.id as string;

  const [currentQuestion, setCurrentQuestion] = useState(12);
  
  // Initialize some mock answered state to match the screenshot
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    for (let i = 1; i <= 11; i++) init[i] = "A";
    init[12] = "B"; // Queue
    init[15] = "C";
    return init;
  });
  
  const [flags, setFlags] = useState<Set<number>>(new Set([14, 15]));
  const [activeTool, setActiveTool] = useState<string | null>(null);

  const q = mockQuestions[currentQuestion - 1];
  const selectedOption = answers[currentQuestion] || null;
  const isFlagged = flags.has(currentQuestion);

  const handleSelectOption = (optId: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: optId }));
  };

  const handleToggleFlag = () => {
    setFlags(prev => {
      const next = new Set(prev);
      if (next.has(currentQuestion)) next.delete(currentQuestion);
      else next.add(currentQuestion);
      return next;
    });
  };

  const handlePrevious = () => {
    if (currentQuestion > 1) setCurrentQuestion(prev => prev - 1);
  };

  const handleNext = () => {
    if (currentQuestion < 40) setCurrentQuestion(prev => prev + 1);
    else router.push(`/student/exam/${examId}/done`);
  };

  // Palette generation
  const palette = useMemo(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const num = i + 1;
      let status = "unanswered";
      if (answers[num]) status = "answered";
      if (num === currentQuestion) status = "current";
      if (flags.has(num)) {
        status = answers[num] ? "flagged-answered" : "flagged";
        // Ensure current question still looks current even if flagged
        if (num === currentQuestion) status += "-current";
      }
      return { num, status };
    });
  }, [currentQuestion, answers, flags]);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      
      {/* 1. Top bar */}
      <header className="h-[56px] bg-blue-900 text-white px-4 sm:px-6 flex items-center justify-between shrink-0 shadow-sm z-30 relative">
        <div className="flex items-center gap-4">
          <div className="font-bold text-[15px]">CSC 301 | Section A</div>
          
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 bg-red-500/20 rounded text-red-100 text-xs font-bold tracking-wider">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            LIVE
          </div>
          
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-blue-800/50 border border-blue-700/50 rounded text-blue-100 text-xs font-medium">
            <Camera size={14} className="text-emerald-400" />
            Proctoring active
          </div>
        </div>
        
        {/* 2. Tools dock */}
        <div className="hidden md:flex items-center gap-2">
          <div className="relative">
            <button 
              className={cn("h-9 px-4 rounded-md text-[14px] font-medium transition-colors flex items-center gap-2", activeTool === 'calc' ? 'bg-blue-600 shadow-inner ring-2 ring-white/20' : 'bg-blue-800 hover:bg-blue-700')}
              onClick={() => setActiveTool(activeTool === 'calc' ? null : 'calc')}
            >
              <Calculator size={18} /> Calculator
            </button>
            {activeTool === 'calc' && (
              <div className="absolute top-[48px] left-1/2 -translate-x-1/2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 text-slate-900 overflow-hidden z-50">
                <div className="bg-slate-100 p-2.5 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-[13px] text-slate-700">Scientific Calculator</span>
                  <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                </div>
                <div className="p-3">
                  <div className="bg-gray-50 border border-gray-200 h-14 rounded-lg mb-3 flex flex-col items-end justify-center px-3 font-mono">
                    <span className="text-[10px] text-gray-400">(12.5 x 4) / 5</span>
                    <span className="text-xl font-bold text-gray-800">10</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5">
                    {['sin','cos','tan','AC','7','8','9','÷','4','5','6','×','1','2','3','-','0','.','=','+'].map((btn, i) => (
                      <button key={i} className={cn(
                        "h-8 rounded text-[13px] font-semibold transition-colors border",
                        btn === 'AC' ? "bg-red-50 text-red-600 border-red-100 hover:bg-red-100" :
                        btn === '=' ? "bg-blue-600 text-white border-blue-700 hover:bg-blue-700" :
                        ['÷','×','-','+'].includes(btn) ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200" :
                        "bg-white text-gray-800 border-gray-200 hover:bg-gray-50 shadow-sm"
                      )}>
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button 
              className={cn("h-9 px-4 rounded-md text-[14px] font-medium transition-colors flex items-center gap-2", activeTool === 'prot' ? 'bg-blue-600 shadow-inner ring-2 ring-white/20' : 'bg-blue-800 hover:bg-blue-700')}
              onClick={() => setActiveTool(activeTool === 'prot' ? null : 'prot')}
            >
              <Ruler size={18} /> Protractor
            </button>
            {activeTool === 'prot' && (
              <div className="absolute top-[48px] right-0 w-72 bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border-2 border-blue-500 text-slate-900 overflow-hidden z-50">
                <div className="bg-slate-100/90 p-2.5 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-bold text-[13px] text-slate-700">Protractor</span>
                  <button onClick={() => setActiveTool(null)} className="text-gray-400 hover:text-gray-700"><X size={16} /></button>
                </div>
                <div className="p-6 flex flex-col items-center justify-center bg-blue-50/30">
                  <div className="w-48 h-24 rounded-t-full border-4 border-blue-600 border-b-0 relative flex items-end justify-center mb-4 bg-white/50 backdrop-blur-md">
                    <div className="absolute w-full border-t border-dashed border-gray-300 bottom-0 left-0"></div>
                    {/* Mock ticks */}
                    <div className="absolute -left-1 bottom-0 text-[10px] font-mono text-blue-900">180°</div>
                    <div className="absolute -right-1 bottom-0 text-[10px] font-mono text-blue-900">0°</div>
                    <div className="absolute top-0 text-[10px] font-mono text-blue-900 -mt-4">90°</div>
                    
                    {/* Pivot arm */}
                    <div className="w-0.5 h-24 bg-red-500 origin-bottom transform rotate-[52deg] relative z-10 shadow-sm"></div>
                    
                    {/* Base center */}
                    <div className="absolute -bottom-1.5 w-3 h-3 bg-blue-900 rounded-full z-20"></div>
                  </div>
                  <div className="bg-blue-900 text-white px-3 py-1 rounded text-sm font-bold shadow-md">
                    Angle: 52°
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* 3 & 4. Save indicator & Timer */}
        <div className="flex items-center gap-4">
          <span className="text-[14px] font-medium text-blue-200 hidden md:inline">Saved just now</span>
          <div className="bg-white text-blue-900 font-mono font-bold text-[20px] px-4 py-1.5 rounded-md shadow-sm leading-none flex items-center">
            01:24:18
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        
        {/* Left: Question Area */}
        <main className="flex-1 flex flex-col items-center p-4 sm:p-8 overflow-y-auto w-full relative">
          <div className="w-full max-w-[760px] flex flex-col h-full">
            
            {/* 6. Question header */}
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <h2 className="text-[22px] font-bold text-gray-900 flex items-center gap-3">
                Question {currentQuestion} of 40
                {isFlagged && <Flag size={20} className="text-amber-600 fill-amber-600" />}
              </h2>
              <span className="text-[15px] font-medium text-gray-500">2 marks</span>
            </div>
            
            {/* Question Text */}
            <div className="text-[16px] md:text-[18px] text-gray-900 mb-8 leading-relaxed">
              {q.text}
            </div>
            
            {/* 7. Options */}
            <div className="space-y-4 mb-12">
              {q.options.map((opt) => {
                const isSelected = selectedOption === opt.id;
                return (
                  <label 
                    key={opt.id}
                    className={cn(
                      "flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all min-h-[64px]",
                      isSelected 
                        ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600/10" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <input 
                      type="radio" 
                      name="option" 
                      className="sr-only" 
                      checked={isSelected}
                      onChange={() => handleSelectOption(opt.id)}
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center mr-4 shrink-0 transition-colors",
                      isSelected ? "border-blue-600" : "border-gray-400"
                    )}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                    </div>
                    <span className="font-semibold text-gray-700 w-8 shrink-0">{opt.id}.</span>
                    <span className="text-[16px] text-gray-900">{opt.text}</span>
                  </label>
                );
              })}
            </div>
            
            {/* 8. Navigation bar */}
            <div className="mt-auto pt-6 border-t border-gray-200 flex flex-wrap gap-4 items-center justify-between sticky bottom-0 bg-gray-50 pb-4 z-10">
              <button 
                className="px-6 h-12 rounded-lg font-semibold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                onClick={handlePrevious}
                disabled={currentQuestion === 1}
              >
                Previous
              </button>
              
              <div className="flex items-center gap-3 ml-auto sm:ml-0">
                <button 
                  className={cn(
                    "px-6 h-12 rounded-lg font-semibold border transition-colors flex items-center gap-2",
                    isFlagged 
                      ? "text-amber-800 bg-amber-100 border-amber-200 hover:bg-amber-200" 
                      : "text-gray-700 bg-white border-gray-300 hover:bg-gray-50"
                  )}
                  onClick={handleToggleFlag}
                >
                  <Flag className={cn("shrink-0", isFlagged && "fill-amber-700")} size={18} /> 
                  <span className="hidden sm:inline">{isFlagged ? "Flagged" : "Flag for review"}</span>
                </button>
                <button 
                  className="px-8 h-12 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                  onClick={handleNext}
                >
                  {currentQuestion === 40 ? "Review and submit" : "Save and next"}
                </button>
              </div>
            </div>

          </div>
        </main>
        
        {/* Right: Palette */}
        <aside className="w-[320px] shrink-0 border-l border-gray-200 bg-white p-6 flex flex-col overflow-y-auto hidden lg:flex shadow-[-4px_0_15px_rgba(0,0,0,0.03)] z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-[16px] text-gray-900">Question palette</h3>
          </div>
          
          <div className="grid grid-cols-5 gap-2 mb-8">
            {palette.map((p) => {
              const isCurrent = p.num === currentQuestion;
              const isAnswered = !!answers[p.num];
              const isFlagged = flags.has(p.num);
              
              let bg = "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200";
              if (isCurrent) {
                bg = "bg-white border-blue-900 text-blue-900 font-bold ring-2 ring-blue-900 ring-inset";
              } else if (isAnswered) {
                bg = "bg-blue-600 border-blue-600 text-white hover:bg-blue-700";
              }

              return (
                <button 
                  key={p.num} 
                  onClick={() => setCurrentQuestion(p.num)}
                  className={cn(
                    "h-11 rounded-lg text-[14px] font-semibold transition-all relative flex items-center justify-center border",
                    bg
                  )}
                >
                  {p.num}
                  {isFlagged && (
                    <div className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                      <Flag size={10} className="text-amber-600 fill-amber-600" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-auto pt-6 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-[13px] font-medium text-gray-600 mb-8">
              <div className="flex items-center gap-2.5"><div className="w-4 h-4 bg-blue-600 rounded"></div> Answered</div>
              <div className="flex items-center gap-2.5"><div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div> Not answered</div>
              <div className="flex items-center gap-2.5"><div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded relative"><Flag size={10} className="absolute -top-1 -right-1 text-amber-600 fill-amber-600"/></div> Flagged</div>
              <div className="flex items-center gap-2.5"><div className="w-4 h-4 bg-white border-[2.5px] border-blue-900 rounded"></div> Current</div>
            </div>
            <Link href={`/student/exam/${examId}/done`}>
              <button className="w-full h-12 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors">
                Submit exam
              </button>
            </Link>
          </div>
        </aside>

      </div>
    </div>
  );
}
