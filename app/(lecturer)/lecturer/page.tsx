"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Upload, AlertCircle, FileClock, CalendarClock } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Link from "next/link";

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
  return (
    <div className="space-y-6 pb-12">
      <div>
        <h2 className="text-[32px] font-semibold text-gray-900 tracking-tight">Good morning, Dr. Bello</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        
        {/* Course Card 1 */}
        <Link href="/lecturer/questions?course=csc301" className="block group">
          <Card className="h-full flex flex-col justify-between hover:border-blue-500 hover:shadow-sm transition-all cursor-pointer">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-[17px] font-bold text-gray-900">CSC 301</h3>
                  <p className="text-[13px] text-gray-500">Data Structures</p>
                </div>
                <Badge variant="blue-solid">Active</Badge>
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
                  <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-blue-900">
                    85%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[24px] font-semibold text-gray-900 leading-none">120</div>
                  <div className="text-[12px] text-gray-500 mt-1">questions</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-[13px] text-blue-700 font-medium group-hover:underline">
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
                  <p className="text-[13px] text-gray-500">Algorithms</p>
                </div>
                <Badge variant="warning">Setup</Badge>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <div className="w-16 h-16 relative flex items-center justify-center bg-gray-50 rounded-full">
                  <span className="text-gray-400 text-xs font-medium">0%</span>
                </div>
                <div className="text-right">
                  <div className="text-[24px] font-semibold text-gray-900 leading-none">64</div>
                  <div className="text-[12px] text-gray-500 mt-1">questions</div>
                </div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-[13px] text-blue-700 font-medium group-hover:underline">
              View bank &rarr;
            </div>
          </Card>
        </Link>

        {/* Needs Attention */}
        <Card className="col-span-1 lg:col-span-2 bg-warning-tint/30 border-warning-tint">
          <h3 className="font-semibold text-[17px] text-gray-900 mb-4">Needs attention</h3>
          <div className="space-y-3">
            <Link href="/lecturer/questions?status=returned" className="flex items-center justify-between p-3 bg-white rounded-lg border border-warning-tint hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-danger-tint rounded-md text-danger-ink">
                  <AlertCircle size={18} />
                </div>
                <span className="text-[14px] font-medium text-gray-900">3 returned questions</span>
              </div>
              <ArrowRight className="text-gray-400" size={16} />
            </Link>
            <Link href="/lecturer/exams" className="flex items-center justify-between p-3 bg-white rounded-lg border border-warning-tint hover:shadow-sm transition-all">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-warning-tint rounded-md text-warning-ink">
                  <FileClock size={18} />
                </div>
                <span className="text-[14px] font-medium text-gray-900">1 exam awaiting approval</span>
              </div>
              <ArrowRight className="text-gray-400" size={16} />
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Upcoming exams */}
        <Card title="Upcoming exams">
          <div className="space-y-4 mt-2">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-lg flex flex-col items-center justify-center font-bold">
                  <span className="text-[11px] uppercase tracking-wider leading-none mb-1">Oct</span>
                  <span className="text-[18px] leading-none">12</span>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900">CSC 301 Mid-semester</h4>
                  <p className="text-[13px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <CalendarClock size={14} /> 09:00 AM • 45 mins
                  </p>
                </div>
              </div>
              <Badge variant="blue-solid">Scheduled</Badge>
            </div>
            
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-100 text-gray-500 rounded-lg flex flex-col items-center justify-center font-bold">
                  <span className="text-[11px] uppercase tracking-wider leading-none mb-1">Oct</span>
                  <span className="text-[18px] leading-none">15</span>
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-gray-900">CSC 305 Test 2</h4>
                  <p className="text-[13px] text-gray-500 flex items-center gap-1 mt-0.5">
                    <CalendarClock size={14} /> 11:00 AM • 30 mins
                  </p>
                </div>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
          </div>
        </Card>

        {/* Difficulty Mix */}
        <Card title="Difficulty mix">
          <div className="h-[200px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyMix} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="course" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 13, fill: '#3D4757', fontWeight: 500 }} width={70} />
                <Tooltip cursor={{ fill: '#F7F8FA' }} contentStyle={{ borderRadius: '8px', border: '1px solid #E1E5EB' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Easy" stackId="a" fill="#DCE8FB" radius={[4, 0, 0, 4]} />
                <Bar dataKey="Medium" stackId="a" fill="#3B7BEA" />
                <Bar dataKey="Hard" stackId="a" fill="#0B2A5B" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-3 mt-6">
            <Button variant="secondary" className="flex-1">
              <Plus size={16} className="mr-2" />
              Add question
            </Button>
            <Button variant="secondary" className="flex-1">
              <Upload size={16} className="mr-2" />
              Import CSV
            </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}

// Needed because ArrowRight isn't imported at top
function ArrowRight({ className, size }: { className?: string; size?: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}
