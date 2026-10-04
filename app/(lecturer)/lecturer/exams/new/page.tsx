"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Settings2, Info } from "lucide-react";

export default function ExamBuilder() {
  const [step, setStep] = useState(3); // Starting at Rules step based on wireframe

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Create exam</h2>
        </div>
      </div>

      {/* 1. Stepper */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-1 overflow-x-auto">
        <div className="flex items-center min-w-max">
          {[
            { num: 1, label: "Details" },
            { num: 2, label: "Sections" },
            { num: 3, label: "Rules" },
            { num: 4, label: "Settings" },
            { num: 5, label: "Preview" },
          ].map((s, i) => (
            <React.Fragment key={s.num}>
              <button 
                onClick={() => setStep(s.num)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-colors ${step === s.num ? 'bg-blue-900 text-white' : step > s.num ? 'text-blue-700 hover:bg-blue-100' : 'text-gray-500 hover:bg-white'}`}
              >
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] ${step === s.num ? 'bg-white/20' : step > s.num ? 'bg-blue-200 text-blue-800' : 'bg-gray-200'}`}>
                  {s.num}
                </div>
                {s.label}
              </button>
              {i < 4 && <div className="w-4 h-[1px] bg-blue-200 mx-2"></div>}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* 2. Step content */}
        <div className="flex-1 w-full space-y-6">
          <Card title="Section A: MCQ">
            <div className="flex items-center gap-4 mb-6 text-[13px] text-gray-500">
              <span>Time: 60 min</span>
              <span>Weight: x1</span>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <Badge variant="success">Easy</Badge>
                  <span className="text-[14px] font-medium text-gray-900">[10] questions</span>
                  <span className="text-[13px] text-gray-500">from 40 available</span>
                </div>
                <button className="text-gray-400 hover:text-danger"><Trash2 size={16}/></button>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <Badge variant="blue-tint">Medium</Badge>
                  <span className="text-[14px] font-medium text-gray-900">[20] questions</span>
                  <span className="text-[13px] text-gray-500">from 55 available</span>
                </div>
                <button className="text-gray-400 hover:text-danger"><Trash2 size={16}/></button>
              </div>
              
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <div className="flex items-center gap-4">
                  <Badge variant="danger">Hard</Badge>
                  <span className="text-[14px] font-medium text-gray-900">[10] questions</span>
                  <span className="text-[13px] text-gray-500">from 25 available</span>
                </div>
                <button className="text-gray-400 hover:text-danger"><Trash2 size={16}/></button>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 text-[13px] text-gray-500 flex items-center gap-2">
              <FilterIcon /> Topic filter: All topics
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="secondary" size="sm"><Plus size={16} className="mr-2"/> Add rule</Button>
            </div>
          </Card>
          
          <Button variant="tertiary" className="text-blue-700 w-full border border-dashed border-blue-200 bg-blue-50/50 h-12">
            <Plus size={18} className="mr-2"/> Add section
          </Button>
        </div>

        {/* 3. Live summary */}
        <div className="w-full lg:w-[320px] shrink-0 space-y-4">
          <Card title="Live summary">
            <div className="space-y-3 mt-2 text-[14px]">
              <div className="flex justify-between"><span className="text-gray-500">Questions:</span> <span className="font-semibold text-gray-900">40</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total marks:</span> <span className="font-semibold text-gray-900">40</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Duration:</span> <span className="font-semibold text-gray-900">60 min</span></div>
              
              <div className="pt-4 mt-2 border-t border-gray-100">
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-gray-200 mb-2">
                  <div className="bg-blue-100 w-[25%]" title="Easy 10"></div>
                  <div className="bg-blue-500 w-[50%]" title="Medium 20"></div>
                  <div className="bg-blue-900 w-[25%]" title="Hard 10"></div>
                </div>
                <div className="flex justify-between text-[11px] text-gray-500 font-medium">
                  <span>Easy: 10</span>
                  <span>Med: 20</span>
                  <span>Hard: 10</span>
                </div>
              </div>
            </div>
          </Card>
          
          {/* 4. Tools notice */}
          <div className="bg-warning-tint/50 border border-warning-tint rounded-[12px] p-4 flex gap-3">
            <Info className="text-warning-ink shrink-0" size={18} />
            <p className="text-[13px] text-warning-ink leading-relaxed">
              Calculator and protractor are always available to students. (Locked, not editable)
            </p>
          </div>
        </div>
      </div>

      {/* 5. Footer bar */}
      <div className="fixed sm:sticky bottom-0 left-0 right-0 sm:left-auto sm:right-auto bg-white border-t border-gray-200 p-4 mt-auto flex items-center justify-between z-20">
        <Button variant="secondary">Back</Button>
        <div className="flex gap-3">
          <Button variant="tertiary">Save draft</Button>
          <Button variant="secondary">Preview</Button>
          <Button variant="primary">Send to moderation</Button>
        </div>
      </div>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  );
}
