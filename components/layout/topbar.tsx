"use client";

import * as React from "react";
import { Bell, Search, Menu } from "lucide-react";

export function Topbar({ title = "Dashboard" }: { title?: string }) {
  return (
    <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
      <div className="flex items-center gap-4">
        <button className="sm:hidden text-gray-500 hover:text-gray-900">
          <Menu size={20} />
        </button>
        <h1 className="text-[17px] font-semibold text-gray-900 hidden sm:block">{title}</h1>
      </div>
      
      <div className="flex items-center gap-4 text-[14px]">
        <div className="hidden md:flex items-center text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200">
          <span className="font-medium">Session 2026/2027</span>
        </div>
        
        <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
        
        <button className="flex items-center text-gray-500 hover:text-gray-900 transition-colors">
          <Search size={18} className="sm:mr-2" />
          <span className="hidden sm:inline font-medium">Search</span>
          <kbd className="hidden sm:inline-flex ml-2 items-center gap-1 rounded border border-gray-200 bg-gray-50 px-1.5 font-mono text-[10px] font-medium text-gray-500">
            <span>Ctrl</span>K
          </kbd>
        </button>
        
        <button className="relative text-gray-500 hover:text-gray-900 transition-colors ml-2">
          <Bell size={20} />
          <span className="absolute 0 right-0.5 w-2 h-2 bg-danger rounded-full border-[1.5px] border-white"></span>
        </button>
        
        <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-sm ml-2 cursor-pointer hover:bg-blue-200 transition-colors border border-blue-200">
          NO
        </div>
      </div>
    </header>
  );
}
