"use client";

import * as React from "react";
import { useState } from "react";
import { StatCard, Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Radio, ChevronRight, X, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

// A simple local Input mock to avoid dependency issues if it's missing
function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      className={`flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 ${className || ''}`}
      {...props}
    />
  );
}

export default function OfficerDashboard() {
  const [scheduleOpen, setScheduleOpen] = useState(false);

  return (
    <>
      <div className="space-y-6 pb-12 flex flex-col h-full relative">
        
        {/* 1. Stat cards with proper labels */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Scheduled" value="12" delta="4 this week" href="/officer/schedule" />
          <StatCard label="Live now" value="1" href="/officer/schedule" />
          <StatCard label="Results awaiting approval" value="28" delta="5 new" href="/officer/results" />
          <StatCard label="Open appeals" value="8" href="/officer/appeals" />
        </div>

        {/* 2. Results Pipeline and Primary Action */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex flex-col">
            <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wider">Results Pipeline</span>
            <div className="flex items-center flex-wrap gap-2 sm:gap-4 mt-2 text-[13px]">
               <span className="text-gray-900 font-medium px-2 py-1 bg-gray-100 rounded-md">12 Marked</span>
               <span className="text-gray-300">→</span>
               <span className="text-amber-700 font-medium px-2 py-1 bg-amber-50 rounded-md">28 Awaiting Approval</span>
               <span className="text-gray-300">→</span>
               <span className="text-emerald-700 font-medium px-2 py-1 bg-emerald-50 rounded-md">4 Released</span>
            </div>
          </div>
          <Button 
            onClick={() => setScheduleOpen(true)}
            className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white shadow-sm h-10 w-full sm:w-auto"
          >
            <Plus size={18} className="mr-2" />
            Schedule exam
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Schedule Table */}
          <div className="xl:col-span-2 space-y-6">
            <Card title="Today's Schedule (WAT)" action={{ label: "View all", href: "/officer/schedule" }} noPadding>
              
              {/* Filter chips */}
              <div className="p-4 border-b border-gray-100 flex flex-wrap gap-2 bg-gray-50/50">
                <Badge variant="blue-solid" className="cursor-pointer shadow-sm">All</Badge>
                <Badge variant="outline" className="cursor-pointer bg-white hover:bg-gray-50">Live (1)</Badge>
                <Badge variant="outline" className="cursor-pointer bg-white hover:bg-gray-50">Upcoming (2)</Badge>
              </div>
              
              <div className="overflow-x-auto bg-white">
                <table className="w-full text-left border-collapse min-w-[600px]">
                  <thead className="bg-blue-50/50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900 capitalize">Time & Venue</th>
                      <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900 capitalize">Course</th>
                      <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900 capitalize">Invigilators</th>
                      <th className="px-6 py-3.5 text-[13px] font-semibold text-gray-900 capitalize">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    
                    {/* Live Exam */}
                    <tr className="hover:bg-blue-50/50 cursor-pointer transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[13px] text-gray-900">09:00 AM - 10:00 AM</div>
                        <div className="text-[12px] text-gray-500 mt-1 flex items-center">
                          CBT Centre 1 <span className="text-gray-300 mx-1.5">•</span> 112/118 present
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[13px] text-gray-900 group-hover:text-blue-700 transition-colors">CSC 301</div>
                        <div className="text-[12px] text-gray-500 mt-0.5">Data Structures</div>
                      </td>
                      <td className="px-6 py-4 text-[13px] text-gray-600 font-medium">
                        A. Ibrahim, S. Yusuf
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="blue-solid" className="animate-pulse shadow-sm flex items-center gap-1.5 px-2 py-0.5">
                            <Radio size={12} className="shrink-0" /> Live
                          </Badge>
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </td>
                    </tr>
                    
                    {/* Upcoming Exam */}
                    <tr className="hover:bg-gray-50 cursor-pointer transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[13px] text-gray-900">11:00 AM - 12:30 PM</div>
                        <div className="text-[12px] text-gray-500 mt-1 flex items-center">
                          CBT Centre 2 <span className="text-gray-300 mx-1.5">•</span> 250 capacity
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-[13px] text-gray-900 group-hover:text-blue-700 transition-colors">MTH 201</div>
                        <div className="text-[12px] text-gray-500 mt-0.5">Mathematical Methods I</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">No invigilator</Badge>
                          <Button variant="ghost" size="sm" className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 -ml-1">Assign</Button>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-between gap-2">
                          <Badge variant="outline" className="border-blue-200 text-blue-700 bg-blue-50 px-2 py-0.5">Scheduled</Badge>
                          <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                        </div>
                      </td>
                    </tr>
                    
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Appeals Card */}
          <div className="space-y-6">
            <Card title="Recent Appeals" action={{ label: "View all (8)", href: "/officer/appeals" }}>
              <div className="space-y-3 mt-1">
                
                <div className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-[10px] bg-red-50 text-red-700 border-red-200 px-1.5 py-0">New</Badge>
                    <span className="text-[11px] text-gray-500 font-medium">Submitted 2 days ago</span>
                  </div>
                  <h4 className="text-[14px] font-semibold text-gray-900 mb-1.5">Missing Script Request</h4>
                  <p className="text-[13px] text-gray-600 mb-0.5 flex items-center">
                    Tunde B. <span className="text-gray-300 mx-1.5">•</span> <span className="font-mono text-gray-500 text-[11px] tracking-tight">CSC/22/117</span>
                  </p>
                  <p className="text-[13px] text-gray-600">PHY 101</p>
                  <Button variant="outline" className="w-full mt-4 h-9 text-[13px] font-semibold border-gray-300 text-gray-700 hover:bg-gray-50">Review Appeal</Button>
                </div>
                
                <div className="p-3.5 border border-gray-200 rounded-xl bg-white hover:border-blue-300 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200 px-1.5 py-0">Under review</Badge>
                    <span className="text-[11px] text-gray-500 font-medium">Submitted 5 days ago</span>
                  </div>
                  <h4 className="text-[14px] font-semibold text-gray-900 mb-1.5">Result Remarking</h4>
                  <p className="text-[13px] text-gray-600 mb-0.5 flex items-center">
                    Sarah J. <span className="text-gray-300 mx-1.5">•</span> <span className="font-mono text-gray-500 text-[11px] tracking-tight">CSC/22/089</span>
                  </p>
                  <p className="text-[13px] text-gray-600">CSC 201</p>
                  <Button variant="outline" className="w-full mt-4 h-9 text-[13px] font-semibold border-gray-300 text-gray-700 hover:bg-gray-50">Continue Review</Button>
                </div>
                
              </div>
            </Card>
          </div>

        </div>
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
                    className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    onClick={() => setScheduleOpen(false)}
                  >
                    <span className="sr-only">Close panel</span>
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
                
                <div className="relative flex-1 px-6 py-6 overflow-y-auto space-y-8 bg-white">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Course Code</label>
                      <Input placeholder="e.g. CSC 301" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Exam Type</label>
                      <select className="flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:cursor-not-allowed disabled:opacity-50">
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
                      <Input type="date" />
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
                        <option>Library E-Centre (Capacity: 150)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Invigilators</label>
                      <button className="flex h-10 w-full items-center text-left rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 hover:bg-slate-50 transition-colors">
                        Click to assign invigilators...
                      </button>
                    </div>
                  </div>

                </div>
                
                <div className="border-t border-slate-200 px-6 py-4 bg-gray-50 flex justify-end gap-3 shrink-0">
                  <Button variant="outline" onClick={() => setScheduleOpen(false)}>Cancel</Button>
                  <Button className="bg-blue-600 text-white hover:bg-blue-700">Save Schedule</Button>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
