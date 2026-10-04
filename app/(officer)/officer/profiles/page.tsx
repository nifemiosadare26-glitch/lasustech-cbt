"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, UserCheck, ShieldAlert, Fingerprint, Upload, Download, MoreHorizontal } from "lucide-react";

const mockStudents = [
  { id: "ST1", matric: "CSC/22/101", name: "Ada Osadare", level: "300L", prog: "Computer Science", biometric: true, clearance: "Cleared" },
  { id: "ST2", matric: "CSC/22/117", name: "Tunde Bakare", level: "300L", prog: "Computer Science", biometric: true, clearance: "Cleared" },
  { id: "ST3", matric: "CSC/22/045", name: "Chinedu Mba", level: "300L", prog: "Computer Science", biometric: false, clearance: "Pending Biometrics" },
  { id: "ST4", matric: "CSC/22/130", name: "Zainab Kazeem", level: "300L", prog: "Computer Science", biometric: true, clearance: "Fees Outstanding" },
];

export default function StudentProfiles() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Student Profiles</h2>
          <p className="text-[14px] text-gray-500 mt-1">Manage exam clearance and biometric enrolment.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Upload size={16} className="mr-2" /> Sync Records</Button>
          <Button variant="secondary"><Download size={16} className="mr-2" /> Export</Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col" noPadding>
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search by matric number or name..." className="pl-9 h-9" />
          </div>
          
          <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700">
            <option>All Clearance Status</option>
            <option>Cleared</option>
            <option>Pending Biometrics</option>
            <option>Fees Outstanding</option>
          </select>
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto bg-white">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Programme</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Biometric</th>
                <th className="px-6 py-3 text-[12px] font-semibold text-gray-500 uppercase">Clearance Status</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockStudents.map((st) => (
                <tr key={st.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[14px]">
                        {st.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-[14px] text-gray-900">{st.name}</div>
                        <div className="font-mono text-[12px] text-gray-500 mt-0.5">{st.matric}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-[14px] text-gray-900">{st.prog}</div>
                    <div className="text-[12px] text-gray-500">{st.level}</div>
                  </td>
                  <td className="px-6 py-4">
                    {st.biometric ? (
                      <span className="inline-flex items-center text-[13px] font-medium text-success gap-1.5"><Fingerprint size={16}/> Enrolled</span>
                    ) : (
                      <span className="inline-flex items-center text-[13px] font-medium text-warning-ink gap-1.5"><Fingerprint size={16}/> Missing</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      st.clearance === 'Cleared' ? 'success' : 
                      st.clearance === 'Fees Outstanding' ? 'danger' : 'warning'
                    }>
                      {st.clearance === 'Cleared' && <UserCheck size={12} className="mr-1"/>}
                      {st.clearance === 'Fees Outstanding' && <ShieldAlert size={12} className="mr-1"/>}
                      {st.clearance}
                    </Badge>
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
