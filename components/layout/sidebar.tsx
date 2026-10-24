"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, Network, Users, CalendarRange, ScrollText, Settings,
  Library, Upload, FileCheck, BarChart3, CalendarClock,
  Radio, LogOut, Loader2, Headphones,
  PanelLeftClose, PanelLeftOpen, ShieldAlert, X, ShieldCheck, AlertCircle
} from "lucide-react";
import { initialsOf, useUser } from "@/components/auth/user-context";
import { roleLabel, type UiRole } from "@/lib/roles";
import { signOut } from "@/lib/me";

const roleMenus = {
  admin: [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Exam schedule", href: "/admin/schedule", icon: CalendarClock },
    { name: "Live invigilation", href: "/admin/live", icon: Radio },
    { name: "Incident reports", href: "/admin/incidents", icon: ShieldAlert },
    { name: "Support desk", href: "/admin/support", icon: Headphones },
    { name: "Colleges & Depts", href: "/admin/structure", icon: Network },
    { name: "Users and roles", href: "/admin/users", icon: Users },
    { name: "Results", href: "/admin/results", icon: BarChart3 },
    { name: "Sessions", href: "/admin/sessions", icon: CalendarRange },
    { name: "Audit logs", href: "/admin/audit", icon: ScrollText },
    { name: "Settings", href: "/admin/settings", icon: Settings },
  ],
  lecturer: [
    { name: "Dashboard", href: "/lecturer", icon: LayoutDashboard },
    { name: "Question bank", href: "/lecturer/questions", icon: Library },
    { name: "Moderation", href: "/lecturer/moderation", icon: ShieldCheck },
    { name: "Import", href: "/lecturer/import", icon: Upload },
    { name: "Exams", href: "/lecturer/exams", icon: FileCheck },
    { name: "Results", href: "/lecturer/results", icon: BarChart3 },
    { name: "Settings", href: "/lecturer/settings", icon: Settings },
  ],
  student: [
    { name: "My exams", href: "/student", icon: FileCheck },
    { name: "Results", href: "/student/results", icon: BarChart3 },
    { name: "Help & Support", href: "/support", icon: Headphones },
  ]
};

export function Sidebar({
  role,
  mobileOpen = false,
  onCloseMobile
}: {
  role: UiRole;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const menu = roleMenus[role] || roleMenus.admin;
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  // Find the most specific match to prevent multiple active buttons
  const bestMatch = React.useMemo(() => {
    return [...menu]
      .sort((a, b) => b.href.length - a.href.length)
      .find(item => pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href + "/")));
  }, [pathname, menu]);

  const user = useUser();
  const userName = user?.me.names ?? "Signed in";
  // The account may hold several roles; show the one that chose this dashboard.
  const userRoleDisplay = roleLabel(role.toUpperCase());
  const userInitials = initialsOf(userName);

  const [signingOut, setSigningOut] = React.useState(false);
  const handleSignOut = async (isDrawer: boolean) => {
    if (signingOut) return;
    setSigningOut(true);
    // A full navigation, not router.push: it discards every cached server
    // component, so no dashboard data survives into the next session.
    if (isDrawer) onCloseMobile?.();
    await signOut();
    window.location.assign("/login");
  };

  const renderNavLinks = (isDrawer = false) => (
    <nav className="flex-1 py-4 px-3 space-y-1 overflow-x-hidden">
      {menu.map((item) => {
        const Icon = item.icon;
        const isActive = bestMatch?.href === item.href;
        
        return (
          <Link 
            key={item.href} 
            href={item.href}
            onClick={() => isDrawer && onCloseMobile?.()}
            title={!isDrawer && isCollapsed ? item.name : undefined}
            className={cn(
              "flex items-center h-10 rounded-md text-[14px] font-medium transition-colors",
              !isDrawer && isCollapsed ? "justify-center px-0" : "px-3",
              isActive 
                ? "bg-blue-600 text-[#ffffff]" 
                : "text-blue-100/80 hover:bg-blue-800 hover:text-[#ffffff]"
            )}
          >
            <Icon className={cn("shrink-0 h-4.5 w-4.5", isActive ? "text-[#ffffff]" : "text-blue-100/70", (isDrawer || !isCollapsed) && "mr-3")} />
            {(isDrawer || !isCollapsed) && <span className="truncate">{item.name}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const renderUserSection = (isDrawer = false) => (
    <div className={cn("border-t border-blue-800/50 flex flex-col pb-8", !isDrawer && isCollapsed ? "p-3 items-center" : "p-4")}>
      <div className={cn("flex items-center rounded-md text-left group", !isDrawer && isCollapsed ? "p-1 justify-center" : "p-2 -mx-2 w-full")}>
        <div className="w-9 h-9 rounded-full bg-blue-800 flex items-center justify-center text-[#ffffff] font-bold text-xs shrink-0">
          {userInitials}
        </div>
        {(isDrawer || !isCollapsed) && (
          <div className="ml-3 overflow-hidden flex-1">
            <p className="text-[13.5px] font-semibold text-[#ffffff] truncate">{userName}</p>
            <p className="text-[11.5px] text-blue-200 truncate">{userRoleDisplay}</p>
          </div>
        )}
      </div>

      {user?.me.roles && user.me.roles.length > 1 && (
        <div className={cn("mt-2 pt-2 border-t border-blue-800/40 space-y-1", !isDrawer && isCollapsed ? "w-full" : "")}>
          {user.me.roles
            .filter((r) => r.toLowerCase() !== role)
            .map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  if (isDrawer) onCloseMobile?.();
                  window.location.assign(
                    r === "ADMIN" ? "/admin" : r === "LECTURER" ? "/lecturer" : "/student"
                  );
                }}
                className={cn(
                  "flex items-center text-[11.5px] text-sky-200 hover:text-white hover:bg-blue-800/80 rounded px-2 py-1 transition-colors w-full cursor-pointer",
                  !isDrawer && isCollapsed ? "justify-center px-0 text-[10px]" : ""
                )}
                title={`Switch to ${roleLabel(r)}`}
              >
                {!isDrawer && isCollapsed
                  ? r.slice(0, 3)
                  : `Switch to ${r === "ADMIN" ? "Admin" : r === "LECTURER" ? "Lecturer" : "Student"}`}
              </button>
            ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => handleSignOut(isDrawer)}
        disabled={signingOut}
        title={!isDrawer && isCollapsed ? "Sign out" : undefined}
        className={cn(
          "mt-3 flex items-center h-8 text-[13px] text-blue-200 hover:text-[#ffffff] hover:bg-blue-800 rounded-md transition-colors cursor-pointer disabled:opacity-60",
          !isDrawer && isCollapsed ? "justify-center w-10 px-0" : "px-2 -mx-2 w-full"
        )}
      >
        {signingOut ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
        ) : (
          <LogOut className={cn("h-4 w-4 shrink-0", (isDrawer || !isCollapsed) && "mr-2")} />
        )}
        {(isDrawer || !isCollapsed) && (signingOut ? "Signing out…" : "Sign out")}
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex sm:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
            onClick={onCloseMobile} 
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-blue-900 text-[#ffffff] shadow-2xl z-10">
            <div className="h-[56px] flex items-center justify-between px-6 border-b border-blue-800/50">
              <div className="flex items-center">
                {/* Literal white, not `bg-white`: that token is the card surface and
                    goes navy in dark mode, which would sink this plate into the rail
                    it exists to contrast against. Same reason the rail hardcodes
                    `text-[#ffffff]`. */}
                <div className="bg-[#ffffff] p-0.5 rounded-sm shrink-0">
                  <Image src="/lasustech-logo.png" alt="Logo" width={20} height={20} className="w-5 h-5 object-contain" />
                </div>
                <span className="font-bold text-[16px] tracking-tight ml-3 truncate">LASUSTECH CBT</span>
              </div>
              <button 
                onClick={onCloseMobile} 
                className="text-blue-200 hover:text-white p-1 rounded-md"
                aria-label="Close sidebar"
              >
                <X size={20} />
              </button>
            </div>

            {renderNavLinks(true)}
            {renderUserSection(true)}
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "flex-shrink-0 bg-blue-900 text-[#ffffff] flex flex-col hidden sm:flex h-screen sticky top-0 overflow-y-auto transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-[240px]"
        )}
      >
        {/* Brand */}
        <div className={cn("h-[56px] flex items-center border-b border-blue-800/50 relative", isCollapsed ? "justify-center" : "px-6")}>
          {/* Literal white; see the mobile drawer's plate above. */}
          <div className="bg-[#ffffff] p-0.5 rounded-sm shrink-0">
            <Image src="/lasustech-logo.png" alt="Logo" width={20} height={20} className="w-5 h-5 object-contain" />
          </div>
          {!isCollapsed && <span className="font-bold text-[16px] tracking-tight ml-3 truncate">LASUSTECH CBT</span>}
          
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={cn(
              "text-blue-300 hover:text-white transition-colors absolute cursor-pointer",
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
            className="w-full flex justify-center py-3 text-blue-300 hover:text-white cursor-pointer"
            title="Expand sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        )}

        {/* Navigation */}
        {renderNavLinks(false)}

        {/* User Card */}
        {renderUserSection(false)}
      </aside>
    </>
  );
}
