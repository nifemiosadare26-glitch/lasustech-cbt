"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Network, Users, CalendarRange, ScrollText, Settings,
  Library, Upload, CheckSquare, FileCheck, BarChart3, CalendarClock,
  UserSquare, MessageSquareWarning, Radio, GraduationCap, LogOut
} from "lucide-react";

type Role = "admin" | "lecturer" | "officer" | "invigilator" | "student";

const roleMenus = {
  admin: [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Structure", href: "/admin/structure", icon: Network },
    { name: "Users and roles", href: "/admin/users", icon: Users },
    { name: "Sessions", href: "/admin/sessions", icon: CalendarRange },
    { name: "Audit logs", href: "/admin/audit", icon: ScrollText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
  lecturer: [
    { name: "Dashboard", href: "/lecturer", icon: LayoutDashboard },
    { name: "Question bank", href: "/lecturer/questions", icon: Library },
    { name: "Import", href: "/lecturer/import", icon: Upload },
    { name: "Moderation", href: "/lecturer/moderation", icon: CheckSquare },
    { name: "Exams", href: "/lecturer/exams", icon: FileCheck },
    { name: "Results", href: "/lecturer/exams/1/results", icon: BarChart3 }, 
    { name: "Settings", href: "/lecturer/settings", icon: Settings },
  ],
  officer: [
    { name: "Dashboard", href: "/officer", icon: LayoutDashboard },
    { name: "Schedule", href: "/officer/schedule", icon: CalendarClock },
    { name: "Student profiles", href: "/officer/profiles", icon: UserSquare },
    { name: "Results", href: "/officer/results", icon: BarChart3 },
    { name: "Appeals", href: "/officer/appeals", icon: MessageSquareWarning },
    { name: "Reports", href: "/officer/reports", icon: ScrollText },
    { name: "Settings", href: "/officer/settings", icon: Settings },
  ],
  invigilator: [
    { name: "Today's exams", href: "/invigilator", icon: CalendarRange },
    { name: "Live monitor", href: "/invigilator/live/1", icon: Radio }, 
  ],
  student: [
    { name: "My exams", href: "/student", icon: FileCheck },
    { name: "Mock exam", href: "/student/mock", icon: Radio },
    { name: "Results", href: "/student/results", icon: BarChart3 },
  ]
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const menu = roleMenus[role];

  return (
    <aside className="w-[240px] flex-shrink-0 bg-blue-900 text-[#ffffff] flex flex-col hidden sm:flex h-screen sticky top-0 overflow-y-auto">
      {/* Brand */}
      <div className="h-[56px] flex items-center px-6 border-b border-blue-800/50">
        <GraduationCap className="text-[#ffffff] mr-3" size={24} />
        <span className="font-bold text-[16px] tracking-tight">LASUSTECH CBT</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center h-10 px-3 rounded-md text-[15px] font-medium transition-colors",
                isActive 
                  ? "bg-blue-600 text-[#ffffff]" 
                  : "text-blue-100/80 hover:bg-blue-800 hover:text-[#ffffff]"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-[#ffffff]" : "text-blue-100/70")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className="p-4 border-t border-blue-800/50">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-800 flex items-center justify-center text-[#ffffff] font-bold text-sm">
            EO
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="text-[14px] font-semibold text-[#ffffff] truncate">Exam Officer</p>
            <p className="text-[12px] text-blue-200 truncate capitalize">{role}</p>
          </div>
        </div>
        <Link 
          href="/login" 
          className="mt-4 flex items-center h-8 px-2 text-[13px] text-blue-200 hover:text-[#ffffff] hover:bg-blue-800 rounded-md transition-colors w-full"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Link>
      </div>
    </aside>
  );
}
