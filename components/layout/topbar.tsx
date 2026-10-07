"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Menu, X, MapPin, ChevronDown, Check, Calendar, ArrowRight } from "lucide-react";

export function Topbar({ title = "Dashboard", role = "student" }: { title?: string; role?: string }) {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [sessionDropdownOpen, setSessionDropdownOpen] = React.useState(false);
  const [currentSession, setCurrentSession] = React.useState("Session 2026/2027");

  const sessions = [
    { id: "s_2026", name: "Session 2026/2027", tag: "Current", sem: "1st Semester (Harmattan)" },
    { id: "s_2027", name: "Session 2027/2028", tag: "Upcoming", sem: "Planning phase" },
    { id: "s_2025", name: "Session 2025/2026", tag: "Archived", sem: "Harmattan & Rain completed" },
  ];

  return (
    <>
      <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <button className="sm:hidden text-gray-500 hover:text-gray-900">
            <Menu size={20} />
          </button>
          <h1 className="text-[17px] font-semibold text-gray-900 hidden sm:block">{title}</h1>
        </div>
        
        <div className="flex items-center gap-4 text-[14px]">
          {/* Interactive Session Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setSessionDropdownOpen(!sessionDropdownOpen)}
              className="hidden md:flex items-center gap-1.5 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 hover:border-blue-400 hover:text-blue-900 transition-all cursor-pointer shadow-2xs"
            >
              <Calendar size={14} className="text-blue-600" />
              <span className="font-semibold text-[13.5px]">{currentSession}</span>
              <ChevronDown
                size={14}
                className={`text-gray-500 ml-0.5 transition-transform duration-200 ${
                  sessionDropdownOpen ? "rotate-180 text-blue-600" : ""
                }`}
              />
            </button>

            {/* Session Dropdown Menu */}
            {sessionDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setSessionDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-40 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3.5 py-2 border-b border-gray-100">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                      Switch Academic Session
                    </span>
                  </div>

                  <div className="p-1 space-y-0.5">
                    {sessions.map((s) => {
                      const isSelected = currentSession === s.name;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setCurrentSession(s.name);
                            setSessionDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2.5 rounded-lg flex items-start justify-between gap-2 transition-colors cursor-pointer ${
                            isSelected
                              ? "bg-blue-50 text-blue-950 font-medium"
                              : "hover:bg-gray-50 text-gray-800"
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[13.5px] font-semibold">{s.name}</span>
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                  s.tag === "Current"
                                    ? "bg-blue-600 text-white"
                                    : s.tag === "Upcoming"
                                    ? "bg-indigo-100 text-indigo-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                {s.tag}
                              </span>
                            </div>
                            <div className="text-[12px] text-gray-500 mt-0.5">{s.sem}</div>
                          </div>

                          {isSelected && (
                            <Check size={16} className="text-blue-600 shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-1.5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                    <Link
                      href="/admin/sessions"
                      onClick={() => setSessionDropdownOpen(false)}
                      className="flex items-center justify-between px-3 py-2 text-[12.5px] font-semibold text-blue-700 hover:text-blue-900 rounded-md hover:bg-blue-50 transition-colors"
                    >
                      <span>Manage all sessions & semesters</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="h-4 w-px bg-gray-300 hidden sm:block"></div>
          
          <button 
            className="relative text-gray-500 hover:text-gray-900 transition-colors ml-2 cursor-pointer"
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
                    className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 cursor-pointer"
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
