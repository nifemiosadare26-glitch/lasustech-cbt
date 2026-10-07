"use client";

import * as React from "react";
import { Bell, Menu, X, MapPin, ChevronDown } from "lucide-react";

export function Topbar({ title = "Dashboard", role = "student" }: { title?: string; role?: string }) {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  return (
    <>
      <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
        <div className="flex items-center gap-4">
          <button className="sm:hidden text-gray-500 hover:text-gray-900">
            <Menu size={20} />
          </button>
          <h1 className="text-[17px] font-semibold text-gray-900 hidden sm:block">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4 text-[14px]">
          <button className="hidden md:flex items-center gap-1 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 transition-colors">
            <span className="font-medium">Session 2026/2027</span>
            <ChevronDown size={14} className="text-gray-500 ml-1" />
          </button>
          
          <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
          

          
          <button 
            className="relative text-gray-500 hover:text-gray-900 transition-colors ml-2"
            onClick={() => setNotificationsOpen(true)}
          >
            <Bell size={20} />
            <span className="absolute 0 right-0.5 w-2 h-2 bg-danger rounded-full border-[1.5px] border-white"></span>
          </button>
        </div>
      </header>

      {/* Notifications Side Panel */}
      {notificationsOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div 
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity" 
            onClick={() => setNotificationsOpen(false)}
            aria-hidden="true"
          />
          <section className="absolute inset-y-0 right-0 flex max-w-full pl-10">
            <div className="w-screen max-w-sm transform bg-white shadow-xl ring-1 ring-slate-900/5 transition-all">
              <div className="flex h-full flex-col overflow-y-scroll">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
                  <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                  <button
                    type="button"
                    className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
                    onClick={() => setNotificationsOpen(false)}
                  >
                    <span className="sr-only">Close panel</span>
                    <X size={20} aria-hidden="true" />
                  </button>
                </div>
                <div className="relative flex-1 p-4 sm:p-6">
                  
                  {/* Notification List */}
                  <ul className="space-y-4">
                    <li className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
                      <div className="mt-0.5 shrink-0 rounded-full bg-blue-600 p-1">
                        <MapPin size={14} className="text-white" aria-hidden />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-blue-900">Venue updated</h3>
                        <p className="text-sm font-medium text-blue-800 mt-0.5">
                          Your exam <strong>MTH 201</strong> tomorrow has been moved to <strong>CBT Centre 3</strong>.
                        </p>
                        <p className="text-xs text-blue-600 mt-1">2 hours ago</p>
                      </div>
                    </li>
                  </ul>
                  
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
