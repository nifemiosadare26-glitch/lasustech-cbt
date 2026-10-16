"use client";

import * as React from "react";
import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

type Role = "admin" | "lecturer" | "officer" | "invigilator" | "student";

interface AppShellProps {
  children: React.ReactNode;
  role: Role;
  title?: string;
  hideSidebar?: boolean;
}

export function AppShell({ children, role, title, hideSidebar = false }: AppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex overflow-hidden">
      {!hideSidebar && (
        <Sidebar 
          role={role} 
          mobileOpen={mobileOpen} 
          onCloseMobile={() => setMobileOpen(false)} 
        />
      )}
      
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        <Topbar 
          title={title || "Dashboard"} 
          role={role} 
          onToggleMobileMenu={() => setMobileOpen(!mobileOpen)} 
        />
        <main className="flex-1 p-4 sm:p-6 max-w-[1280px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
