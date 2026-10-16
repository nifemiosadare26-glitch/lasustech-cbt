"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Bold, Italic, Type, Image as ImageIcon, Link2 } from "lucide-react";

export default function QuestionEditor() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isNew = id === "new";

  return (
    <div className="space-y-6 pb-24 flex flex-col h-full max-w-4xl mx-auto relative">
      <div className="flex items-center gap-4">
        <Button variant="secondary" className="px-2 h-9" onClick={() => router.push("/lecturer/questions")}>
          <ArrowLeft size={18} />
        </Button>
        <div>
          <h2 className="text-[20px] font-semibold text-gray-900 tracking-tight flex items-center gap-3">
            {isNew ? "Create Question" : "Edit Question"}
            {!isNew && <Badge variant="warning">Draft</Badge>}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <Card title="Question text">
            {/* Rich text toolbar mock */}
            <div className="flex items-center gap-1 p-1 border-b border-gray-100 bg-gray-50/50 rounded-t-lg -mx-6 -mt-2 mb-4 px-4">
              <button type="button" className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"><Bold size={16} /></button>
              <button type="button" className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"><Italic size={16} /></button>
              <div className="w-px h-4 bg-gray-300 mx-1"></div>
              <button type="button" className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"><Type size={16} /></button>
              <button type="button" className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"><ImageIcon size={16} /></button>
              <button type="button" className="p-1.5 text-gray-600 hover:bg-gray-200 rounded"><Link2 size={16} /></button>
            </div>

            <textarea
              className="w-full h-32 resize-none text-[15px] text-gray-900 placeholder:text-gray-400 focus:outline-none"
              placeholder="Type your question here..."
              defaultValue={!isNew ? "Which data structure uses first-in, first-out ordering?" : ""}
            ></textarea>
          </Card>

          <Card title="Options">
            <p className="text-[13px] text-gray-500 mb-4">Select the radio button next to the correct answer.</p>

            <div className="space-y-3">
              {[
                { id: "A", text: !isNew ? "Stack" : "" },
                { id: "B", text: !isNew ? "Queue" : "", correct: !isNew },
                { id: "C", text: !isNew ? "Binary tree" : "" },
                { id: "D", text: !isNew ? "Graph" : "" },
              ].map((opt) => (
                <div
                  key={opt.id}
                  className={`flex items-center p-3 border rounded-lg transition-colors ${
                    opt.correct ? "border-success bg-success-tint/10" : "border-gray-200 bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="correct_answer"
                    defaultChecked={opt.correct}
                    className="w-4 h-4 text-success border-gray-300 focus:ring-success mt-0.5"
                  />
                  <div className="font-semibold text-gray-700 w-8 text-center">{opt.id}.</div>
                  <Input
                    defaultValue={opt.text}
                    placeholder={`Option ${opt.id}`}
                    className="flex-1 h-9 border-transparent hover:border-gray-300 bg-transparent focus:bg-white"
                  />
                </div>
              ))}
            </div>
            <Button
              variant="tertiary"
              className="mt-4 text-blue-700 w-full border border-dashed border-blue-200"
              onClick={() => {}}
            >
              Add option
            </Button>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Settings">
            <div className="space-y-4">
              <div>
                <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Course code</label>
                <select className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-900 focus:ring-2 focus:ring-blue-500">
                  <option>CSC 301</option>
                  <option>CSC 305</option>
                </select>
              </div>

              <div>
                <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Topic</label>
                <Input defaultValue="Data Structures" className="h-9 text-[13px]" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Marks</label>
                  <Input type="number" defaultValue="2" className="h-9 text-[13px]" />
                </div>
                <div>
                  <label className="text-[13px] font-semibold text-gray-900 block mb-1.5">Difficulty</label>
                  <select className="w-full h-9 rounded-[6px] border border-gray-300 bg-white px-3 text-[13px] text-gray-900 focus:ring-2 focus:ring-blue-500">
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Status">
            <div className="space-y-2 text-[13px] text-gray-600">
              <div className="flex justify-between">
                <span>Current status</span>
                <Badge variant={isNew ? "gray-solid" : "warning"}>{isNew ? "Unsaved" : "Draft"}</Badge>
              </div>
              <div className="flex justify-between">
                <span>Last saved</span>
                <span className="text-gray-400">{isNew ? "—" : "Oct 2, 2026"}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto bg-white border-t border-gray-200 shadow-float p-4 flex items-center justify-between z-50 sm:rounded-t-none">
        <Button
          variant="secondary"
          className="text-danger hover:bg-danger-tint/10 border-transparent"
          onClick={() => router.push("/lecturer/questions")}
        >
          Discard
        </Button>
        <div className="flex gap-3 items-center">
          <Button variant="secondary" onClick={() => {}}>Save as draft</Button>
          <Button onClick={() => {}}>Submit for moderation</Button>
        </div>
      </div>
    </div>
  );
}
