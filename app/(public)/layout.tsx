"use client";

import * as React from "react";
import { RoleThemeProvider } from "@/components/role-theme";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RoleThemeProvider role="student" className="min-h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors font-sans">
      {children}
    </RoleThemeProvider>
  );
}
