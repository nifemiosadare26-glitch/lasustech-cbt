"use client";

import { usePathname } from "next/navigation";
import { RoleArea } from "@/components/layout/role-area";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const isExam = pathname.includes("/exam/");

  if (isExam) {
    // html/body are overflow:hidden globally, so this wrapper is the exam page's
    // scroller. The provider *is* the wrapper here, so it takes these exact
    // classes — `contents` would remove the scroller box this branch relies on.
    return (
      <RoleArea
        area="student"
        title="Exam"
        bare
        bareClassName="page-scroll flex flex-col bg-gray-50 font-sans"
      >
        {children}
      </RoleArea>
    );
  }

  return (
    <RoleArea area="student" title="Student Dashboard">
      {children}
    </RoleArea>
  );
}
