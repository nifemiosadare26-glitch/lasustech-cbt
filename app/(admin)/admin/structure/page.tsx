"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, ChevronDown, FolderOpen, Folder, Plus, Edit2, Book } from "lucide-react";

export default function AcademicStructure() {
  return (
    <div className="space-y-6 pb-12 flex flex-col h-full overflow-hidden">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Academic structure</h2>
        <p className="text-[14px] text-gray-500">Manage faculties, departments, programmes, and courses.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        
        {/* Left: Tree */}
        <Card className="w-full lg:w-[320px] flex-shrink-0 flex flex-col h-[600px] overflow-hidden">
          <div className="p-3 border-b border-gray-100 bg-gray-50">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <Input placeholder="Search structure..." className="pl-9 h-9 text-[13px]" />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1 text-[14px]">
            {/* Tree Mock */}
            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-gray-900">
              <ChevronDown size={16} className="text-gray-400" />
              <FolderOpen size={16} className="text-blue-500" />
              <span className="font-medium">Faculty of Science</span>
            </div>
            
            <div className="pl-6 space-y-1">
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-blue-100 text-blue-900 cursor-pointer">
                <ChevronDown size={16} className="text-blue-500" />
                <FolderOpen size={16} className="text-blue-500" />
                <span className="font-medium">Dept. Computer Science</span>
              </div>
              
              <div className="pl-6 space-y-1">
                <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-gray-700">
                  <ChevronDown size={16} className="text-gray-400" />
                  <Folder size={16} className="text-gray-400" />
                  <span>B.Sc. Computer Science</span>
                </div>
                
                <div className="pl-6 space-y-1">
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-gray-600">
                    <span className="w-4"></span>
                    <Book size={14} className="text-gray-400" />
                    <span>100 level</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-gray-600">
                    <span className="w-4"></span>
                    <Book size={14} className="text-gray-400" />
                    <span>200 level</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-gray-600">
                    <span className="w-4"></span>
                    <Book size={14} className="text-gray-400" />
                    <span>300 level</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-gray-700">
                <ChevronRight size={16} className="text-gray-400" />
                <Folder size={16} className="text-gray-400" />
                <span>Dept. Mathematics</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-gray-50 cursor-pointer text-gray-900 mt-2">
              <ChevronRight size={16} className="text-gray-400" />
              <Folder size={16} className="text-blue-500" />
              <span className="font-medium">Faculty of Engineering</span>
            </div>
          </div>
          
          <div className="p-3 border-t border-gray-100 bg-gray-50">
            <Button variant="tertiary" className="w-full text-blue-700 h-9">
              <Plus size={16} className="mr-2" /> Add faculty
            </Button>
          </div>
        </Card>

        {/* Right: Content */}
        <Card className="flex-1 flex flex-col h-[600px] overflow-hidden">
          {/* Detail header */}
          <div className="p-6 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[13px] text-gray-500 font-medium mb-1 flex items-center gap-2">
                  <span>Faculty of Science</span> <ChevronRight size={12} /> <span className="text-blue-700">Dept. Computer Science</span>
                </div>
                <h3 className="text-[20px] font-bold text-gray-900">Department of Computer Science</h3>
                <p className="text-[14px] text-gray-500 mt-1">Code: CSC • Head: Dr. Adeyemi • 2 Programmes</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button variant="secondary"><Edit2 size={16} className="mr-2" /> Edit</Button>
                <Button><Plus size={16} className="mr-2" /> Add programme</Button>
              </div>
            </div>
          </div>
          
          {/* Courses table */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
              <h4 className="font-semibold text-gray-900 text-[15px]">Department courses</h4>
              <Button variant="secondary" size="sm">Add course</Button>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200">
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Code</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Title</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Level</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Sem</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Lecturers</th>
                  <th className="px-6 py-3 text-[13px] font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr className="hover:bg-blue-50 cursor-pointer">
                  <td className="px-6 py-3 font-mono text-[13px] text-blue-700 font-medium">CSC 301</td>
                  <td className="px-6 py-3 text-[14px] font-medium text-gray-900">Data Structures</td>
                  <td className="px-6 py-3 text-[14px] text-gray-500">300</td>
                  <td className="px-6 py-3 text-[14px] text-gray-500">1st</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[12px] font-medium mr-1">Dr. Bello</span>
                  </td>
                  <td className="px-6 py-3"><Badge variant="success">Active</Badge></td>
                </tr>
                <tr className="hover:bg-blue-50 cursor-pointer">
                  <td className="px-6 py-3 font-mono text-[13px] text-blue-700 font-medium">CSC 305</td>
                  <td className="px-6 py-3 text-[14px] font-medium text-gray-900">Algorithms</td>
                  <td className="px-6 py-3 text-[14px] text-gray-500">300</td>
                  <td className="px-6 py-3 text-[14px] text-gray-500">1st</td>
                  <td className="px-6 py-3">
                    <span className="inline-flex px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[12px] font-medium mr-1">Dr. Bello</span>
                    <span className="inline-flex px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-[12px] font-medium">+1</span>
                  </td>
                  <td className="px-6 py-3"><Badge variant="success">Active</Badge></td>
                </tr>
                <tr className="hover:bg-blue-50 cursor-pointer opacity-70">
                  <td className="px-6 py-3 font-mono text-[13px] text-gray-500 font-medium">CSC 101</td>
                  <td className="px-6 py-3 text-[14px] font-medium text-gray-900">Intro to Computing</td>
                  <td className="px-6 py-3 text-[14px] text-gray-500">100</td>
                  <td className="px-6 py-3 text-[14px] text-gray-500">1st</td>
                  <td className="px-6 py-3 text-[13px] text-gray-400">None assigned</td>
                  <td className="px-6 py-3"><Badge variant="default">Archived</Badge></td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>

      </div>
    </div>
  );
}
