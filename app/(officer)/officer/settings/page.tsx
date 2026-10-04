"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Settings, Bell, User, Sun, Moon, Monitor, Printer } from "lucide-react";

export default function OfficerSettings() {
  const [activeTab, setActiveTab] = useState("general");
  const [hasChanges, setHasChanges] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  const tabs = [
    { id: "general", label: "Appearance & General", icon: Settings },
    { id: "profile", label: "My Profile", icon: User },
    { id: "printing", label: "Printing Defaults", icon: Printer },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const triggerChange = () => setHasChanges(true);

  return (
    <div className="space-y-6 pb-24 flex flex-col h-full max-w-5xl mx-auto relative">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 tracking-tight">Officer Settings</h2>
        <p className="text-[14px] text-gray-500 mt-1">Manage appearance, printing formats, and notifications.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        <Card className="w-full md:w-[240px] shrink-0 p-2 border-gray-200" noPadding>
          <nav className="flex flex-col space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-colors text-left ${isActive ? 'bg-blue-100 text-blue-900' : 'text-gray-700 hover:bg-gray-100'}`}
                >
                  <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400'} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </Card>

        <div className="flex-1 w-full space-y-6">
          {activeTab === "general" && (
            <Card title="Appearance">
              <div className="space-y-6 mt-2">
                <div className="space-y-3 pb-6 border-b border-gray-100">
                  <label className="text-[15px] font-semibold text-gray-900">Interface Theme</label>
                  <p className="text-[13px] text-gray-500">Customize the appearance of the dashboard. Your preference is automatically saved.</p>
                  
                  {mounted && (
                    <div className="flex flex-wrap gap-4 mt-4">
                      <button 
                        onClick={() => setTheme("light")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all w-[120px] ${theme === 'light' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                      >
                        <Sun size={28} className={theme === 'light' ? 'text-blue-600' : 'text-gray-400'} />
                        <span className={`mt-3 text-[13px] font-medium ${theme === 'light' ? 'text-blue-900' : 'text-gray-600'}`}>Light</span>
                      </button>
                      
                      <button 
                        onClick={() => setTheme("dark")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all w-[120px] ${theme === 'dark' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                      >
                        <Moon size={28} className={theme === 'dark' ? 'text-blue-600' : 'text-gray-400'} />
                        <span className={`mt-3 text-[13px] font-medium ${theme === 'dark' ? 'text-blue-900' : 'text-gray-600'}`}>Dark</span>
                      </button>
                      
                      <button 
                        onClick={() => setTheme("system")}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all w-[120px] ${theme === 'system' ? 'border-blue-600 bg-blue-50/50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                      >
                        <Monitor size={28} className={theme === 'system' ? 'text-blue-600' : 'text-gray-400'} />
                        <span className={`mt-3 text-[13px] font-medium ${theme === 'system' ? 'text-blue-900' : 'text-gray-600'}`}>System</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {activeTab === "printing" && (
            <Card title="Printing Defaults">
              <div className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-gray-700">Broadsheet Layout</label>
                  <select onChange={triggerChange} className="w-full sm:w-64 h-10 rounded-[6px] border border-gray-300 bg-white px-3 text-[14px] text-gray-900 focus:ring-2 focus:ring-blue-500">
                    <option>Landscape (A3)</option>
                    <option>Landscape (A4)</option>
                    <option>Portrait (A4)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[14px] font-medium text-gray-700">Header Signature Block</label>
                  <Input defaultValue="Chief Examiner, HOD, Dean" className="w-full sm:w-64 h-10" onChange={triggerChange} />
                </div>
              </div>
            </Card>
          )}
          
          {activeTab === "profile" && <Card title="My Profile"><div className="p-12 text-center text-gray-500">Profile placeholder</div></Card>}
          {activeTab === "notifications" && <Card title="Notifications"><div className="p-12 text-center text-gray-500">Notifications placeholder</div></Card>}
        </div>
      </div>

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 sm:left-auto sm:right-auto sm:bottom-6 sm:w-[calc(100vw-300px)] max-w-4xl mx-auto bg-blue-900 text-[#ffffff] rounded-t-xl sm:rounded-xl shadow-float p-4 flex items-center justify-between z-50 animate-in slide-in-from-bottom-10">
          <span className="font-medium text-[14px]">Unsaved changes</span>
          <div className="flex gap-3 items-center">
            <button className="text-[13px] text-blue-200 hover:text-[#ffffff] hover:underline transition-colors" onClick={() => setHasChanges(false)}>Discard</button>
            <Button className="bg-white text-blue-900 hover:bg-blue-50 border-none shadow-sm" onClick={() => setHasChanges(false)}>Save changes</Button>
          </div>
        </div>
      )}
    </div>
  );
}
