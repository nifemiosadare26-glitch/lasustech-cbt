"use client";

import { AppShell } from "@/components/layout/app-shell";
import { usePathname } from "next/navigation";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isExam = pathname.includes("/exam/");

  if (isExam) {
    // html/body are overflow:hidden globally, so this wrapper is the exam page's scroller
    return (
      <div className="page-scroll flex flex-col bg-gray-50 font-sans">{children}</div>
    );
  }

  return (
    <AppShell role="student" title="Student Dashboard">
      {children}
    </AppShell>
  );
}