"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, FileCheck, CheckCircle2, Edit3, Send, AlertTriangle } from "lucide-react";

const mockExamData = {
  id: "E1",
  code: "CSC 301",
  title: "Data Structures Mid-semester",
  duration: "60 mins",
  status: "Draft",
  questionsCount: 40,
  passingScore: "50%",
  instructions: "Answer all questions. No calculators allowed. Each question carries equal marks.",
  sections: [
    {
      title: "Section A: Core Concepts",
      questions: [
        {
          id: "Q1",
          text: "What is the time complexity of searching in a balanced binary search tree?",
          type: "Multiple Choice",
          options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"],
          correctAnswer: "O(log n)"
        },
        {
          id: "Q2",
          text: "Which data structure operates on a Last In First Out (LIFO) principle?",
          type: "Multiple Choice",
          options: ["Queue", "Stack", "Linked List", "Tree"],
          correctAnswer: "Stack"
        }
      ]
    },
    {
      title: "Section B: Implementation",
      questions: [
        {
          id: "Q3",
          text: "A graph is said to be completely connected if there is an edge between every pair of vertices.",
          type: "True/False",
          options: ["True", "False"],
          correctAnswer: "True"
        }
      ]
    }
  ]
};

export default function ExamPreview() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);

  const handleSubmitForModeration = () => {
    setSubmitted(true);
    setTimeout(() => {
      router.push("/lecturer/exams");
    }, 1500);
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="secondary" className="px-2 h-9" onClick={() => router.back()}>
            <ArrowLeft size={18} />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight">{mockExamData.title}</h2>
              <Badge variant={mockExamData.status === 'Approved' ? 'success' : 'gray-solid'}>{mockExamData.status}</Badge>
            </div>
            <p className="text-[13px] text-gray-500 mt-1">{mockExamData.code} • {mockExamData.questionsCount} questions • {mockExamData.duration}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => router.push("/lecturer/exams/1/edit")}>
            <Edit3 size={16} className="mr-2"/>Edit Exam
          </Button>
          <Button
            onClick={handleSubmitForModeration}
            disabled={submitted}
            className={submitted ? "opacity-70 cursor-not-allowed" : ""}
          >
            {submitted ? (
              <span className="flex items-center gap-2"><CheckCircle2 size={16}/>Submitted!</span>
            ) : (
              <span className="flex items-center gap-2"><Send size={16}/>Submit for Moderation</span>
            )}
          </Button>
        </div>
      </div>

      {/* Warning if still draft */}
      {mockExamData.status === 'Draft' && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[13px] text-amber-800 font-medium">
            This exam is still a <strong>Draft</strong>. Review all questions below before submitting for moderation.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {mockExamData.sections.map((section, idx) => (
            <div key={idx} className="space-y-4">
              <h3 className="font-semibold text-gray-900 text-[15px] border-b border-gray-100 pb-2">{section.title}</h3>
              {section.questions.map((q, qIdx) => (
                <Card key={q.id} className="p-5">
                  <div className="flex justify-between items-start gap-4 mb-4">
                    <div className="flex gap-3">
                      <span className="font-semibold text-gray-400 mt-0.5 text-[13px] shrink-0">Q{qIdx + 1}</span>
                      <div className="text-[14px] text-gray-900 leading-relaxed font-medium">
                        {q.text}
                      </div>
                    </div>
                    <Badge variant="blue-tint" className="shrink-0">{q.type}</Badge>
                  </div>
                  
                  <div className="ml-8 space-y-2">
                    {q.options.map((opt, oIdx) => {
                      const isCorrect = opt === q.correctAnswer;
                      return (
                        <div 
                          key={oIdx} 
                          className={`flex items-center gap-3 p-3 rounded-lg border text-[13px] ${
                            isCorrect ? 'border-green-200 bg-green-50 text-green-900' : 'border-gray-200 bg-white text-gray-700'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isCorrect ? 'border-green-600 bg-green-600 text-white' : 'border-gray-300'
                          }`}>
                            {isCorrect && <CheckCircle2 size={12} />}
                          </div>
                          <span className={`font-semibold mr-1 ${isCorrect ? 'text-green-700' : 'text-gray-500'}`}>
                            {String.fromCharCode(65 + oIdx)}.
                          </span>
                          <span className={isCorrect ? 'font-medium' : ''}>{opt}</span>
                          {isCorrect && <span className="ml-auto text-[11px] font-bold text-green-700 bg-green-200 px-2 py-0.5 rounded-full">ANSWER</span>}
                        </div>
                      )
                    })}
                  </div>
                </Card>
              ))}
            </div>
          ))}
        </div>

        <div className="space-y-6">
          <Card title="Exam Settings">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="text-gray-400 mt-0.5 shrink-0" size={16} />
                <div>
                  <div className="text-[13px] font-medium text-gray-900">Duration</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{mockExamData.duration}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileCheck className="text-gray-400 mt-0.5 shrink-0" size={16} />
                <div>
                  <div className="text-[13px] font-medium text-gray-900">Passing Score</div>
                  <div className="text-[13px] text-gray-500 mt-0.5">{mockExamData.passingScore}</div>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Instructions">
            <p className="text-[13px] text-gray-600 leading-relaxed">
              {mockExamData.instructions}
            </p>
          </Card>

          <Card title="Question Breakdown">
            <div className="space-y-2 text-[13px]">
              {mockExamData.sections.map((sec, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                  <span className="text-gray-600 truncate pr-2">{sec.title}</span>
                  <span className="font-semibold text-gray-900 shrink-0">{sec.questions.length} Qs</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 font-semibold">
                <span className="text-gray-900">Total</span>
                <span className="text-blue-700">{mockExamData.questionsCount} questions</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
