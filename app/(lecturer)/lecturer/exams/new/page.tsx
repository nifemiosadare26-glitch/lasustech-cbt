"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Settings2, Info } from "lucide-react";

export default function ExamBuilder() {
  const [step, setStep] = useState(5); // Starting at Preview step based on wireframe screenshot

  return (
    <div className="space-y-6 pb-20 flex flex-col h-full relative">
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
          {step === 1 && (
            <Card title="Exam Details">
              <div className="space-y-4">
                <div>
                  <label className="text-[13px] font-semibold text-gray-900 block mb-1">Course</label>
                  <select className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px]">
                    <option>CSC 301 - Data Structures</option>
                    <option>CSC 305 - Algorithms</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-gray-900 block mb-1">Exam Title</label>
                  <Input defaultValue="Mid-semester Exam" />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-gray-900 block mb-1">Instructions</label>
                  <textarea className="w-full h-24 rounded-md border border-gray-300 bg-white p-3 text-[14px] resize-none" defaultValue="Answer all questions in Section A and B."></textarea>
                </div>
              </div>
            </Card>
          )}

          {step === 2 && (
            <>
              <Card title="Section A: MCQ">
                <div className="space-y-4">
                  <Input defaultValue="Section A: MCQ" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[13px] font-semibold text-gray-900 block mb-1">Time Limit (mins)</label>
                      <Input type="number" defaultValue="60" />
                    </div>
                    <div>
                      <label className="text-[13px] font-semibold text-gray-900 block mb-1">Weight</label>
                      <Input type="number" defaultValue="1" />
                    </div>
                  </div>
                </div>
              </Card>
              <Button variant="tertiary" className="text-blue-700 w-full border border-dashed border-blue-200 bg-blue-50/50 h-12">
                <Plus size={18} className="mr-2"/> Add section
              </Button>
            </>
          )}

          {step === 3 && (
            <>
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
            </>
          )}

          {step === 4 && (
            <Card title="Exam Settings">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-[14px] font-medium text-gray-900">Shuffle questions</h4>
                    <p className="text-[13px] text-gray-500">Randomize question order for each student</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="text-[14px] font-medium text-gray-900">Proctoring mode</h4>
                    <p className="text-[13px] text-gray-500">Enable webcam and mic recording</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h4 className="text-[14px] font-medium text-gray-900">Strict mode</h4>
                    <p className="text-[13px] text-gray-500">Lock browser tab during exam</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded" />
                </div>
              </div>
            </Card>
          )}

          {step === 5 && (
            <Card title="Preview Summary">
              <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                <h3 className="font-semibold text-gray-900">CSC 301 - Mid-semester Exam</h3>
                <p className="text-[14px] text-gray-600">This paper contains 1 section generating 40 random questions per student.</p>
                <div className="bg-white p-4 rounded-md border border-gray-200 flex items-center justify-between">
                  <div className="text-center">
                    <div className="text-[20px] font-bold text-gray-900">40</div>
                    <div className="text-[12px] text-gray-500 uppercase font-semibold tracking-wider">Total Marks</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-[20px] font-bold text-gray-900">60m</div>
                    <div className="text-[12px] text-gray-500 uppercase font-semibold tracking-wider">Duration</div>
                  </div>
                  <div className="w-px h-10 bg-gray-200"></div>
                  <div className="text-center">
                    <div className="text-[20px] font-bold text-gray-900 text-success">Strict</div>
                    <div className="text-[12px] text-gray-500 uppercase font-semibold tracking-wider">Proctoring</div>
                  </div>
                </div>
              </div>
            </Card>
          )}

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
        <Button variant="secondary" onClick={() => setStep(Math.max(1, step - 1))} disabled={step === 1}>Back</Button>
        <div className="flex gap-3">
          <Button variant="tertiary">Save draft</Button>
          {step < 5 ? (
            <Button variant="primary" onClick={() => setStep(Math.min(5, step + 1))}>Next Step</Button>
          ) : (
            <>
              <Button variant="secondary">Preview paper</Button>
              <Button variant="primary">Send to moderation</Button>
            </>
          )}
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
