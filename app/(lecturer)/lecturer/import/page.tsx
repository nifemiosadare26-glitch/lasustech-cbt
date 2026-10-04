"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function BulkImport() {
  const [step, setStep] = useState<"upload" | "review">("upload");

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full max-w-5xl mx-auto">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Bulk Import Questions</h2>
        <p className="text-[14px] text-gray-500 mt-1">Upload questions via Aiken or CSV format.</p>
      </div>

      {step === "upload" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="p-12 border-2 border-dashed border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center text-center hover:bg-gray-50 hover:border-blue-300 transition-colors cursor-pointer">
              <div className="w-16 h-16 bg-white border border-gray-200 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Upload size={24} className="text-blue-600" />
              </div>
              <h3 className="text-[16px] font-semibold text-gray-900 mb-1">Click to upload or drag and drop</h3>
              <p className="text-[13px] text-gray-500 max-w-xs">
                Supports .txt (Aiken format) and .csv. Maximum file size 5MB.
              </p>
              
              <Button 
                variant="secondary" 
                className="mt-6"
                onClick={() => setStep("review")}
              >
                Simulate Upload
              </Button>
            </Card>
          </div>

          <div className="space-y-6">
            <Card title="Aiken Format Guide">
              <div className="mt-2 text-[13px] text-gray-600 space-y-4">
                <p>The Aiken format is a very simple way of creating multiple choice questions using a clear human-readable format.</p>
                <div className="bg-gray-900 text-gray-50 rounded-lg p-4 font-mono text-[12px] leading-relaxed overflow-x-auto">
                  What is the capital of Nigeria?<br/>
                  A. Lagos<br/>
                  B. Abuja<br/>
                  C. Kano<br/>
                  D. Ibadan<br/>
                  ANSWER: B
                </div>
                <Button variant="tertiary" className="w-full text-blue-700">Download Template</Button>
              </div>
            </Card>
          </div>
        </div>
      )}

      {step === "review" && (
        <Card className="flex flex-col h-[600px] overflow-hidden" noPadding>
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-blue-100 text-blue-700 flex items-center justify-center">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-[15px] font-semibold text-gray-900">csc301_questions.txt</h3>
                <p className="text-[12px] text-gray-500">45 questions parsed • 2 warnings</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setStep("upload")}>Cancel</Button>
              <Button>Import 45 questions</Button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-0">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-10 outline outline-1 outline-gray-200">
                <tr>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Question Preview</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Options</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Answer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 w-12"><CheckCircle2 size={18} className="text-success" /></td>
                    <td className="px-6 py-4 text-[14px] text-gray-900 font-medium max-w-md truncate">
                      Which data structure uses first-in, first-out ordering?
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">4 options</td>
                    <td className="px-6 py-4"><Badge variant="blue-tint">B</Badge></td>
                  </tr>
                ))}
                <tr className="bg-warning-tint/10 hover:bg-warning-tint/20">
                  <td className="px-6 py-4 w-12"><AlertCircle size={18} className="text-warning" /></td>
                  <td className="px-6 py-4 text-[14px] text-gray-900 font-medium max-w-md truncate">
                    What is the time complexity of binary search?
                  </td>
                  <td className="px-6 py-4 text-[13px] text-warning-ink font-medium">Missing options (Found 2)</td>
                  <td className="px-6 py-4"><Badge variant="warning">?</Badge></td>
                </tr>
                {[4, 5, 6].map((i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-6 py-4 w-12"><CheckCircle2 size={18} className="text-success" /></td>
                    <td className="px-6 py-4 text-[14px] text-gray-900 font-medium max-w-md truncate">
                      In a relational database, what is a foreign key?
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">4 options</td>
                    <td className="px-6 py-4"><Badge variant="blue-tint">D</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
