"use client";

import { AppShell } from "@/components/layout/app-shell";
import { usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isExam = pathname.includes("/exam/");

  if (isExam) {
    return <div className="min-h-screen bg-gray-50 flex flex-col font-sans">{children}</div>;
  }

  return <AppShell role="student" title="Student Dashboard">{children}</AppShell>;
}
