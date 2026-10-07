"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, Network, Users, CalendarRange, ScrollText, Settings,
  Library, Upload, CheckSquare, FileCheck, BarChart3, CalendarClock,
  UserSquare, MessageSquareWarning, Radio, GraduationCap, LogOut, FlaskConical,
  PanelLeftClose, PanelLeftOpen
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
    { name: "Moderation (Approver)", href: "/lecturer/moderation", icon: CheckSquare },
    { name: "Exams", href: "/lecturer/exams", icon: FileCheck },
    { name: "Results", href: "/lecturer/exams/1/results", icon: BarChart3 }, 
  ],
  officer: [
    { name: "Dashboard", href: "/officer", icon: LayoutDashboard },
    { name: "Schedule", href: "/officer/schedule", icon: CalendarClock },
    { name: "Student profiles", href: "/officer/profiles", icon: UserSquare },
    { name: "Results", href: "/officer/results", icon: BarChart3 },
    { name: "Appeals", href: "/officer/appeals", icon: MessageSquareWarning },
    { name: "Reports", href: "/officer/reports", icon: ScrollText },
  ],
  invigilator: [
    { name: "Today's exams", href: "/invigilator", icon: CalendarRange },
    { name: "Live monitor", href: "/invigilator/live/1", icon: Radio }, 
  ],
  student: [
    { name: "My exams", href: "/student", icon: FileCheck },
    { name: "Mock exam", href: "/student/mock", icon: FlaskConical },
    { name: "Results", href: "/student/results", icon: BarChart3 },
  ]
};

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  const menu = roleMenus[role];
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Find the most specific match to prevent multiple active buttons
  const bestMatch = React.useMemo(() => {
    return [...menu]
      .sort((a, b) => b.href.length - a.href.length)
      .find(item => pathname === item.href || pathname.startsWith(item.href + "/"));
  }, [pathname, menu]);

  const userName = role === "student" ? "Nifemi Osadare" : role === "officer" ? "Mrs. Adeyemi" : role === "lecturer" ? "Dr. Bello" : "System Admin";
  const userInitials = role === "student" ? "NO" : role === "officer" ? "MA" : role === "lecturer" ? "DB" : "SA";

  return (
    <aside 
      className={cn(
        "flex-shrink-0 bg-blue-900 text-[#ffffff] flex flex-col hidden sm:flex h-screen sticky top-0 overflow-y-auto transition-all duration-300",
        isCollapsed ? "w-[72px]" : "w-[240px]"
      )}
    >
      {/* Brand */}
      <div className={cn("h-[56px] flex items-center border-b border-blue-800/50 relative", isCollapsed ? "justify-center" : "px-6")}>
        <div className="bg-white p-0.5 rounded-sm shrink-0">
          <Image src="/lasustech-logo.png" alt="Logo" width={20} height={20} className="w-5 h-5 object-contain" />
        </div>
        {!isCollapsed && <span className="font-bold text-[16px] tracking-tight ml-3 truncate">LASUSTECH CBT</span>}
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={cn(
            "text-blue-300 hover:text-white transition-colors absolute",
            isCollapsed ? "-right-[-24px] z-50 bg-blue-800 p-1.5 rounded-r-md hidden" : "right-4"
          )}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? null : <PanelLeftClose size={18} />}
        </button>
      </div>

      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(false)}
          className="w-full flex justify-center py-3 text-blue-300 hover:text-white"
          title="Expand sidebar"
        >
          <PanelLeftOpen size={18} />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-x-hidden">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = bestMatch?.href === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center h-10 rounded-md text-[15px] font-medium transition-colors",
                isCollapsed ? "justify-center px-0" : "px-3",
                isActive 
                  ? "bg-blue-600 text-[#ffffff]" 
                  : "text-blue-100/80 hover:bg-blue-800 hover:text-[#ffffff]"
              )}
            >
              <Icon className={cn("shrink-0 h-5 w-5", isActive ? "text-[#ffffff]" : "text-blue-100/70", !isCollapsed && "mr-3")} />
              {!isCollapsed && <span className="truncate">{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Card */}
      <div className={cn("border-t border-blue-800/50 flex flex-col pb-28", isCollapsed ? "p-3 items-center" : "p-4")}>
        <button className={cn("flex items-center hover:bg-blue-800 rounded-md transition-colors text-left group", isCollapsed ? "p-1 justify-center" : "p-2 -mx-2 w-full")}>
          <div className="w-10 h-10 rounded-full bg-blue-800 group-hover:bg-blue-700 flex items-center justify-center text-[#ffffff] font-bold text-sm shrink-0 transition-colors">
            {userInitials}
          </div>
          {!isCollapsed && (
            <div className="ml-3 overflow-hidden flex-1">
              <p className="text-[14px] font-semibold text-[#ffffff] truncate">{userName}</p>
              <p className="text-[12px] text-blue-200 truncate capitalize">{role === "officer" ? "Exam Officer" : role}</p>
            </div>
          )}
        </button>
        <Link 
          href="/login" 
          title={isCollapsed ? "Sign out" : undefined}
          className={cn(
            "mt-4 flex items-center h-8 text-[13px] text-blue-200 hover:text-[#ffffff] hover:bg-blue-800 rounded-md transition-colors",
            isCollapsed ? "justify-center w-10 px-0" : "px-2 -mx-2 w-full"
          )}
        >
          <LogOut className={cn("h-4 w-4 shrink-0", !isCollapsed && "mr-2")} />
          {!isCollapsed && "Sign out"}
        </Link>
      </div>
    </aside>
  );
}
