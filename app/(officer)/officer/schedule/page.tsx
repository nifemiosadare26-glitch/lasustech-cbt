"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Calendar, Clock, MapPin, User, MoreHorizontal, Filter } from "lucide-react";

const mockSchedule = [
  { id: "S1", date: "Oct 20, 2026", time: "09:00 AM - 10:00 AM", course: "CSC 301", title: "Data Structures", rooms: ["CBT Centre 1", "CBT Centre 2"], invigilators: 4, status: "Scheduled" },
  { id: "S2", date: "Oct 20, 2026", time: "11:30 AM - 01:00 PM", course: "MTH 201", title: "Mathematical Methods I", rooms: ["CBT Centre 3"], invigilators: 2, status: "Scheduled" },
  { id: "S3", date: "Oct 21, 2026", time: "09:00 AM - 11:00 AM", course: "PHY 101", title: "General Physics", rooms: [], invigilators: 0, status: "Pending Assignment" },
  { id: "S4", date: "Oct 22, 2026", time: "02:00 PM - 03:00 PM", course: "GST 111", title: "Communication in English", rooms: ["Main Hall", "CBT Centre 1", "CBT Centre 2"], invigilators: 8, status: "Scheduled" },
];

export default function ExamSchedule() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Exam Schedule</h2>
          <p className="text-[14px] text-gray-500 mt-1">Assign venues and invigilators to approved exams.</p>
        </div>
        <Button><Plus className="mr-2" size={16} /> Schedule Exam</Button>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search schedule by course or date..." className="pl-9 h-9" />
          </div>
          
          <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700">
            <option>All Statuses</option>
            <option>Scheduled</option>
            <option>Pending Assignment</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Course Details</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Venue Allocation</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockSchedule.map((slot) => (
                <tr key={slot.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-[14px] font-semibold text-gray-900 mb-1">
                      <Calendar size={14} className="text-gray-400" /> {slot.date}
                    </div>
                    <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                      <Clock size={14} className="text-gray-400" /> {slot.time}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-mono text-[13px] font-medium text-blue-700">{slot.course}</div>
                    <div className="text-[13px] text-gray-900">{slot.title}</div>
                  </td>
                  <td className="px-6 py-4">
                    {slot.rooms.length > 0 ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-700">
                          <MapPin size={14} className="text-gray-400" /> 
                          {slot.rooms.length} venues ({slot.rooms.join(', ')})
                        </div>
                        <div className="flex items-center gap-1.5 text-[13px] text-gray-500">
                          <User size={14} className="text-gray-400" /> 
                          {slot.invigilators} invigilators assigned
                        </div>
                      </div>
                    ) : (
                      <Button variant="secondary" size="sm" className="h-8 border-dashed border-gray-300 text-gray-500">
                        <MapPin size={14} className="mr-1.5" /> Assign Venue
                      </Button>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={slot.status === 'Scheduled' ? 'success' : 'warning'}>{slot.status}</Badge>
                  </td>
                  <td className="px-6 py-4">
                    <button className="text-gray-400 hover:text-gray-900 rounded p-1">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
