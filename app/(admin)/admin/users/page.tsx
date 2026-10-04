"use client";

import * as React from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Plus, Upload, Download, MoreHorizontal, UserSquare, Shield, Clock } from "lucide-react";

const mockUsers = [
  { id: "U1", name: "Dr. Adeyemi", staffId: "STAFF/001", roles: ["Admin", "Lecturer"], dept: "Computer Science", status: "Active", lastLogin: "Today, 09:12 AM" },
  { id: "U2", name: "Dr. Bello", staffId: "STAFF/042", roles: ["Lecturer"], dept: "Computer Science", status: "Active", lastLogin: "Today, 08:30 AM" },
  { id: "U3", name: "Mr. Tunde", staffId: "STAFF/112", roles: ["Exam officer", "Invigilator"], dept: "Registry", status: "Active", lastLogin: "Yesterday" },
  { id: "U4", name: "Nifemi Osadare", staffId: "CSC/2022/305", roles: ["Student"], dept: "Computer Science", status: "Active", lastLogin: "Today, 11:45 AM" },
  { id: "U5", name: "John Doe", staffId: "CSC/2022/110", roles: ["Student"], dept: "Computer Science", status: "Deactivated", lastLogin: "Oct 01, 2026" },
];

export default function UsersAndRoles() {
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedUsers.size === mockUsers.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(mockUsers.map(u => u.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedUsers);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedUsers(newSet);
  };

  return (
    <div className="space-y-6 pb-12 flex flex-col h-full relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Users and roles</h2>
          <p className="text-[14px] text-gray-500">Manage people, roles, and access control.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="secondary"><Download className="mr-2" size={16} /> Export</Button>
          <Button variant="secondary"><Upload className="mr-2" size={16} /> Import CSV</Button>
          <Button><Plus className="mr-2" size={16} /> Add user</Button>
        </div>
      </div>

      <Card className="flex-1 overflow-hidden flex flex-col relative">
        {/* Toolbar */}
        <div className="p-4 border-b border-gray-100 flex flex-wrap gap-3 bg-gray-50/50">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <Input placeholder="Search name, matric or email..." className="pl-9 h-9" />
          </div>
          
          <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All roles</option>
            <option>Admin</option>
            <option>Lecturer</option>
            <option>Exam officer</option>
            <option>Invigilator</option>
            <option>Student</option>
          </select>

          <select className="h-9 rounded-[6px] border border-gray-300 bg-white px-3 py-1.5 text-[13px] font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>All statuses</option>
            <option>Active</option>
            <option>Deactivated</option>
          </select>
        </div>

        {/* Bulk Bar (Floating) */}
        {selectedUsers.size > 0 && (
          <div className="absolute top-[65px] left-0 right-0 mx-4 z-10 bg-blue-900 text-white rounded-lg shadow-float p-3 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
            <div className="flex items-center gap-4 text-[14px] font-medium">
              <span className="px-2 py-0.5 bg-blue-800 rounded">{selectedUsers.size} selected</span>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white border-none">Change role</Button>
              <Button variant="secondary" size="sm" className="bg-white/10 text-white border-white/20 hover:bg-white/20 hover:text-white border-none">Reset password</Button>
              <Button variant="danger" size="sm">Deactivate</Button>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-white z-0 outline outline-1 outline-gray-200 shadow-sm">
              <tr>
                <th className="px-6 py-3 w-12">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.size === mockUsers.length && mockUsers.length > 0}
                    onChange={toggleSelectAll}
                    className="rounded-[4px] border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" 
                  />
                </th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Name & ID</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Roles</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Department</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Status</th>
                <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Last login</th>
                <th className="px-6 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mockUsers.map((u) => {
                const isSelected = selectedUsers.has(u.id);
                return (
                  <tr 
                    key={u.id} 
                    className={`hover:bg-blue-50 transition-colors group cursor-pointer ${isSelected ? 'bg-blue-100 border-l-2 border-l-blue-600' : ''}`}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                        // Open drawer simulation
                        console.log("Open user drawer", u.id);
                      }
                    }}
                  >
                    <td className="px-6 py-3 border-l-2 border-l-transparent" onClick={e => e.stopPropagation()}>
                      <input 
                        type="checkbox" 
                        checked={isSelected}
                        onChange={() => toggleSelect(u.id)}
                        className="rounded-[4px] border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4" 
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[13px]">
                          {u.name.charAt(0)}{u.name.split(' ')[1]?.[0]}
                        </div>
                        <div>
                          <div className={`font-semibold text-[14px] ${u.status === 'Deactivated' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>{u.name}</div>
                          <div className="font-mono text-[12px] text-gray-500">{u.staffId}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1.5 flex-wrap max-w-[200px]">
                        {u.roles.map(role => (
                          <span key={role} className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[11px] font-semibold tracking-wide">
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-[14px] text-gray-700">{u.dept}</td>
                    <td className="px-6 py-4">
                      <Badge variant={u.status === 'Active' ? 'success' : 'gray-solid'}>{u.status}</Badge>
                    </td>
                    <td className="px-6 py-4 text-[13px] text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} className="text-gray-400" />
                        {u.lastLogin}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button className="text-gray-400 hover:text-gray-900 rounded p-1 transition-colors" onClick={e => e.stopPropagation()}>
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500 bg-white shrink-0">
          <span>Showing 1 to 5 of 1,284 users</span>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" className="h-8">Previous</Button>
            <Button variant="secondary" size="sm" className="h-8">Next</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
