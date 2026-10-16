"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, Clock, MapPin, User, MoreHorizontal, X, Radio } from "lucide-react";
import Link from "next/link";

const mockSchedule = [
  { id: "S1", date: "Oct 20, 2026", time: "09:00 AM - 10:00 AM", course: "CSC 301", title: "Data Structures & Algorithms", rooms: ["CBT Centre 1", "CBT Centre 2"], invigilators: 4, status: "Scheduled" },
  { id: "S2", date: "Oct 20, 2026", time: "11:30 AM - 01:00 PM", course: "MTH 201", title: "Mathematical Methods I", rooms: ["CBT Centre 3"], invigilators: 2, status: "Scheduled" },
  { id: "S3", date: "Oct 21, 2026", time: "09:00 AM - 11:00 AM", course: "PHY 101", title: "General Physics", rooms: ["CBT Centre 2"], invigilators: 3, status: "Scheduled" },
  { id: "S4", date: "Oct 22, 2026", time: "02:00 PM - 03:00 PM", course: "GST 111", title: "Communication in English", rooms: ["Main Hall", "CBT Centre 1", "CBT Centre 2"], invigilators: 8, status: "Scheduled" },
];

export default function AdminExamSchedule() {
  const [schedules, setSchedules] = React.useState(mockSchedule);
  const [scheduleOpen, setScheduleOpen] = React.useState(false);
  const [activeDropdown, setActiveDropdown] = React.useState<string | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filtered = schedules.filter(
    (s) =>
      s.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="space-y-6 pb-12 flex flex-col h-full relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Exam Schedule</h2>
            <p className="text-[14px] text-gray-500 mt-1">
              Admin & CBT Officer timetable: configure venues, time windows, and invigilator rosters.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/live">
              <Button variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                <Radio className="mr-2" size={15} /> Open Live Monitor
              </Button>
            </Link>
            <Button onClick={() => setScheduleOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="mr-2" size={16} /> Schedule Exam
            </Button>
          </div>
        </div>

        <Card className="flex-1 overflow-hidden flex flex-col" noPadding>
          <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input
                placeholder="Search schedule by course or date..."
                className="pl-9 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700">
              <option>All Statuses</option>
              <option>Scheduled</option>
              <option>Completed</option>
            </select>
          </div>

          <div className="flex-1 overflow-x-auto overflow-y-auto bg-white min-h-[400px]">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
                <tr>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Course Details</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Venue Allocation</th>
                  <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-[14px] font-semibold text-gray-900 mb-1">
                        <Calendar size={14} className="text-gray-400" /> {slot.date}
                      </div>
                      <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                        <Clock size={14} className="text-gray-400" /> {slot.time}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-[13px] text-gray-900 hover:text-blue-700 cursor-pointer">{slot.course}</div>
                      <div className="text-[13px] text-gray-500">{slot.title}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-700 font-medium">
                          <MapPin size={14} className="text-gray-400" /> 
                          {slot.rooms.join(', ')}
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                          <User size={14} className="text-gray-400" /> 
                          {slot.invigilators} invigilators assigned
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 font-medium">
                        {slot.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 relative">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveDropdown(activeDropdown === slot.id ? null : slot.id);
                        }}
                        className="text-gray-400 hover:text-gray-900 rounded p-1 focus:outline-none focus:ring-2 focus:ring-blue-600 relative z-50 cursor-pointer"
                      >
                        <MoreHorizontal size={18} />
                      </button>
                      
                      {activeDropdown === slot.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveDropdown(null)} />
                          <div className="absolute right-6 mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
                            <button 
                              type="button"
                              onClick={() => {
                                setScheduleOpen(true);
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              Edit Schedule
                            </button>
                            <button 
                              type="button"
                              onClick={() => {
                                setActiveDropdown(null);
                                window.print();
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              Print Attendance
                            </button>
                            <Link 
                              href="/admin/live" 
                              onClick={() => setActiveDropdown(null)}
                              className="block w-full text-left px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                            >
                              Open Live Monitor
                            </Link>
                            <hr className="my-1 border-slate-100" />
                            <button 
                              type="button"
                              onClick={() => {
                                setSchedules(prev => prev.map(s => s.id === slot.id ? { ...s, status: "Cancelled" } : s));
                                setActiveDropdown(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            >
                              Cancel Exam
                            </button>
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Slide-over Panel for Schedule Exam */}
      {scheduleOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setScheduleOpen(false)}
            aria-hidden="true"
          />
          <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-md transform bg-white shadow-xl ring-1 ring-slate-900/5 transition-all">
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 shrink-0 bg-white">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Schedule Exam</h2>
                    <p className="text-sm text-slate-500">Create a new CBT session</p>
                  </div>
                  <button
                    type="button"
                    className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
                    onClick={() => setScheduleOpen(false)}
                  >
                    <X size={20} />
                  </button>
                </div>
                
                <div className="relative flex-1 px-6 py-6 overflow-y-auto space-y-6 bg-white">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Code</label>
                      <Input placeholder="e.g. CSC 301" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam Type</label>
                      <select className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600">
                        <option>Mid-semester Test</option>
                        <option>Final Examination</option>
                        <option>Make-up Exam</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <Calendar size={16} className="text-slate-500"/> Date & Time
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Date</label>
                      <Input type="date" defaultValue="2026-10-20" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
                        <Input type="time" defaultValue="09:00" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration (mins)</label>
                        <Input type="number" defaultValue={60} />
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                      <MapPin size={16} className="text-slate-500"/> Venue & Invigilation
                    </h3>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Primary Venue</label>
                      <select className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600">
                        <option>CBT Centre 1 (Capacity: 250)</option>
                        <option>CBT Centre 2 (Capacity: 200)</option>
                        <option>CBT Centre 3 (Capacity: 150)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Invigilators</label>
                      <Input placeholder="e.g. Dr. Adeyemi, Prof. Okeke" defaultValue="Dr. Adeyemi, Prof. Okeke" />
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-slate-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 shrink-0">
                  <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={() => setScheduleOpen(false)}>
                    Save Schedule
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
