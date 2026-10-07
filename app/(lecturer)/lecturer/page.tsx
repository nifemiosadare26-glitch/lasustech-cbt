"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Upload, AlertCircle, FileClock, CalendarClock, ArrowRight, X } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, LabelList } from 'recharts';
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { Input } from "@/components/ui/input";

const courseProgress = [
  { name: 'Approved', value: 102 },
  { name: 'Pending', value: 18 }
];
const COLORS = ['#3B7BEA', '#E1E5EB'];

const difficultyMix = [
  { course: 'CSC 301', Easy: 40, Medium: 55, Hard: 25 },
  { course: 'CSC 305', Easy: 20, Medium: 30, Hard: 14 }
];

export default function LecturerDashboard() {
  const [greeting, setGreeting] = useState("Good morning");
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const hour = parseInt(new Date().toLocaleString("en-US", { timeZone: "Africa/Lagos", hour: "numeric", hour12: false }), 10);
    if (hour < 12) setGreeting("Good morning");
    else if (hour < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      alert(`Imported ${e.target.files[0].name} successfully!`);
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <>
      <div className="space-y-6 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[32px] font-semibold text-gray-900 tracking-tight">{greeting}, Dr. Bello</h2>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept=".csv, .pdf, .doc, .docx" 
              onChange={handleFileChange} 
            />
            <Button variant="secondary" className="bg-white" onClick={handleImportClick}>
              <Upload size={16} className="mr-2" />
              Import
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddQuestionOpen(true)}>
              <Plus size={16} className="mr-2" />
              Add question
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          
          {/* Course Card 1 */}
          <Link href="/lecturer/questions?course=csc301" className="block group">
            <Card className="h-full flex flex-col justify-between hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[17px] font-bold text-gray-900">CSC 301</h3>
                    <p className="text-[13px] text-gray-700 font-medium">Data Structures</p>
                  </div>
                  <Badge variant="blue-solid">Live</Badge>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="w-16 h-16 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={courseProgress}
                          innerRadius={22}
                          outerRadius={30}
                          paddingAngle={2}
                          dataKey="value"
                          stroke="none"
                        >
                          {courseProgress.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pt-0.5">
                      <span className="text-[13px] font-bold text-blue-900 leading-none">85%</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[24px] font-semibold text-gray-900 leading-none">120</div>
                    <div className="text-[12px] text-gray-700 mt-1 font-medium">questions</div>
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-gray-500 font-medium">102 of 120 approved</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-[13px] text-blue-700 font-medium">
                View bank &rarr;
              </div>
            </Card>
          </Link>

          {/* Course Card 2 */}
          <Link href="/lecturer/questions?course=csc305" className="block group">
            <Card className="h-full flex flex-col justify-between hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-[17px] font-bold text-gray-900">CSC 305</h3>
                    <p className="text-[13px] text-gray-700 font-medium">Algorithms</p>
                  </div>
                  <Badge variant="blue-outline">Draft</Badge>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <div className="w-16 h-16 relative flex items-center justify-center bg-gray-50 rounded-full">
                    <span className="text-gray-400 text-[13px] font-bold">0%</span>
                  </div>
                  <div className="text-right">
                    <div className="text-[24px] font-semibold text-gray-900 leading-none">64</div>
                    <div className="text-[12px] text-gray-700 mt-1 font-medium">questions</div>
                  </div>
                </div>
                <div className="mt-1 text-[11px] text-warning-ink font-medium">0 of 64 approved</div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 text-[13px] text-blue-700 font-medium">
                Submit 64 drafts for moderation &rarr;
              </div>
            </Card>
          </Link>

          {/* Needs Attention */}
          <Card className="col-span-1 lg:col-span-2 bg-blue-50/50 border-blue-100 h-full flex flex-col justify-between">
            <h3 className="font-semibold text-[17px] text-gray-900 mb-4">Needs attention</h3>
            <div className="space-y-3">
              <Link href="/lecturer/questions?status=returned" className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-danger-tint/20 rounded-md text-danger-ink">
                    <AlertCircle size={18} />
                  </div>
                  <div>
                    <span className="text-[14px] font-medium text-gray-900 block">CSC 301: 3 returned questions</span>
                    <span className="text-[12px] text-gray-500">Returned 2 days ago</span>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={16} />
              </Link>
              <Link href="/lecturer/exams" className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-warning-tint/30 rounded-md text-warning-ink">
                    <FileClock size={18} />
                  </div>
                  <div>
                    <span className="text-[14px] font-medium text-gray-900 block">CSC 305: 1 exam awaiting approval</span>
                    <span className="text-[12px] text-gray-500">Submitted yesterday</span>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={16} />
              </Link>
              <Link href="/lecturer/exams" className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-md text-blue-700">
                    <CalendarClock size={18} />
                  </div>
                  <div>
                    <span className="text-[14px] font-medium text-gray-900 block">CSC 301 starts in 5 days</span>
                    <span className="text-[12px] text-gray-500">12 Oct 2026</span>
                  </div>
                </div>
                <ArrowRight className="text-gray-400" size={16} />
              </Link>
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
          
          {/* Upcoming exams */}
          <Card title="Upcoming exams" className="h-full flex flex-col">
            <div className="space-y-4 mt-2 flex-1">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-lg flex flex-col items-center justify-center font-bold">
                    <span className="text-[12px] leading-none mb-1 capitalize font-medium">Oct</span>
                    <span className="text-[18px] leading-none">12</span>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900">CSC 301 Mid-semester</h4>
                    <p className="text-[13px] text-gray-600 flex items-center gap-1 mt-0.5 font-medium">
                      <CalendarClock size={14} className="text-gray-400"/> 09:00 AM • 45 mins
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="blue-solid">Scheduled</Badge>
                  <span className="text-[11px] text-success font-medium flex items-center"><CheckCircle2 size={12} className="mr-1"/> Paper locked</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between pb-2">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-lg flex flex-col items-center justify-center font-bold">
                    <span className="text-[12px] leading-none mb-1 capitalize font-medium">Oct</span>
                    <span className="text-[18px] leading-none">15</span>
                  </div>
                  <div>
                    <h4 className="text-[15px] font-bold text-gray-900">CSC 305 Test 2</h4>
                    <p className="text-[13px] text-gray-600 flex items-center gap-1 mt-0.5 font-medium">
                      <CalendarClock size={14} className="text-gray-400"/> 11:00 AM • 30 mins
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <Badge variant="warning">Needs moderation</Badge>
                  <span className="text-[11px] text-danger-ink font-medium flex items-center"><AlertCircle size={12} className="mr-1"/> 0% approved</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Difficulty Mix */}
          <Card title="Difficulty mix" className="h-full flex flex-col">
            <p className="text-[13px] text-gray-500 mb-2">Percentage breakdown of approved questions.</p>
            <div className="h-[200px] w-full mt-2 flex-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyMix} layout="vertical" margin={{ top: 0, right: 20, left: 0, bottom: 0 }} stackOffset="expand">
                  <XAxis type="number" hide />
                  <YAxis dataKey="course" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#3D4757', fontWeight: 600 }} width={65} />
                  <Tooltip cursor={{ fill: '#F7F8FA' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E1E5EB' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Bar dataKey="Easy" stackId="a" fill="#DCE8FB" radius={[4, 0, 0, 4]}>
                    <LabelList dataKey="Easy" position="center" fill="#3B7BEA" fontSize={11} fontWeight={600} />
                  </Bar>
                  <Bar dataKey="Medium" stackId="a" fill="#3B7BEA">
                    <LabelList dataKey="Medium" position="center" fill="#ffffff" fontSize={11} fontWeight={600} />
                  </Bar>
                  <Bar dataKey="Hard" stackId="a" fill="#0B2A5B" radius={[0, 4, 4, 0]}>
                    <LabelList dataKey="Hard" position="center" fill="#ffffff" fontSize={11} fontWeight={600} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

        </div>
      </div>

      {/* Slide-over Panel for Adding Question */}
      {isAddQuestionOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setIsAddQuestionOpen(false)}
            aria-hidden="true"
          />
          <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white shadow-xl ring-1 ring-slate-900/5 flex flex-col h-full">
              <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0 bg-white">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2"><Plus size={18} className="text-blue-600"/> Add New Question</h2>
                  <p className="text-sm text-slate-500">Draft a new question manually.</p>
                </div>
                <button
                  type="button"
                  className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                  onClick={() => setIsAddQuestionOpen(false)}
                >
                  <span className="sr-only">Close panel</span>
                  <X size={20} />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto bg-slate-50 p-6 font-sans text-sm space-y-6">
                <div>
                  <label className="text-[13px] font-semibold text-slate-900 block mb-1">Course</label>
                  <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3">
                    <option>CSC 301 - Data Structures</option>
                    <option>CSC 305 - Algorithms</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[13px] font-semibold text-slate-900 block mb-1">Question Text</label>
                  <textarea className="w-full min-h-[120px] rounded-md border border-slate-300 bg-white p-3 resize-y" placeholder="Type your question here..."></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[13px] font-semibold text-slate-900 block mb-1">Type</label>
                    <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3">
                      <option>Multiple Choice</option>
                      <option>True/False</option>
                      <option>Fill in the Blank</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[13px] font-semibold text-slate-900 block mb-1">Difficulty</label>
                    <select className="w-full h-10 rounded-md border border-slate-300 bg-white px-3">
                      <option>Easy</option>
                      <option>Medium</option>
                      <option>Hard</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[13px] font-semibold text-slate-900 block mb-1">Options</label>
                  <div className="space-y-2">
                    <div className="flex gap-2 items-center">
                      <input type="radio" name="correct" />
                      <Input placeholder="Option A" />
                    </div>
                    <div className="flex gap-2 items-center">
                      <input type="radio" name="correct" />
                      <Input placeholder="Option B" />
                    </div>
                    <Button variant="tertiary" className="h-8 px-2 text-blue-600 hover:bg-blue-50 mt-2"><Plus size={14} className="mr-1"/> Add Option</Button>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0">
                <Button variant="secondary" onClick={() => setIsAddQuestionOpen(false)}>Cancel</Button>
                <Button onClick={() => setIsAddQuestionOpen(false)}>Save Draft</Button>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}

// Needed because CheckCircle2 isn't imported at top
function CheckCircle2({ className, size }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
