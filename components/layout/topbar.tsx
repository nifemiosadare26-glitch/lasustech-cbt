"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  Menu,
  X,
  ChevronDown,
  Check,
  Calendar,
  ArrowRight,
  Loader2,
  Info,
  CalendarClock,
  WifiOff,
  UserCheck,
  HeartPulse,
  ClipboardCheck,
  CheckCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useApi } from "@/lib/useApi";
import { timeAgo } from "@/lib/format";
import {
  useNotifications,
  type NotificationItem,
  type NotificationType,
} from "@/lib/useNotifications";

/** Shape returned by GET /sessions (`listSessionsPublic`). */
type PublicSession = {
  id: string;
  name: string;
  status: "CURRENT" | "CLOSED" | "ENDED" | "UPCOMING";
  isCurrent: boolean;
  label: string;
  today: string;
};

const STATUS_BADGE: Record<PublicSession["status"], { text: string; className: string }> = {
  CURRENT: { text: "Current", className: "bg-blue-600 text-white" },
  UPCOMING: { text: "Upcoming", className: "bg-indigo-100 text-indigo-800" },
  CLOSED: { text: "Closed", className: "bg-gray-100 text-gray-600" },
  ENDED: { text: "Ended", className: "bg-gray-100 text-gray-600" },
};

/** Icon and tint per notification type; SYSTEM is the fallback. */
const NOTIFICATION_STYLE: Record<
  NotificationType,
  { icon: typeof Info; tint: string; ink: string }
> = {
  SYSTEM: { icon: Info, tint: "bg-slate-100", ink: "text-slate-600" },
  EXAM_REMINDER: { icon: CalendarClock, tint: "bg-blue-100", ink: "text-blue-700" },
  STUDENT_DISCONNECT: { icon: WifiOff, tint: "bg-amber-100", ink: "text-amber-700" },
  OFFICER_APPROVAL: { icon: UserCheck, tint: "bg-indigo-100", ink: "text-indigo-700" },
  HEALTH_ALERT: { icon: HeartPulse, tint: "bg-rose-100", ink: "text-rose-700" },
  RESULT_RELEASED: { icon: ClipboardCheck, tint: "bg-emerald-100", ink: "text-emerald-700" },
};

export function Topbar({
  title = "Dashboard",
  role = "student",
  onToggleMobileMenu
}: {
  title?: string;
  role?: string;
  onToggleMobileMenu?: () => void;
}) {
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);
  const [sessionDropdownOpen, setSessionDropdownOpen] = React.useState(false);
  const router = useRouter();

  const {
    items: notifications,
    unread,
    loading: notificationsLoading,
    error: notificationsError,
    reload: reloadNotifications,
    markRead,
    markAllRead,
  } = useNotifications();

  const { data: sessions, loading: sessionsLoading } = useApi<PublicSession[]>("/sessions");

  // Escape closes the notification panel.
  React.useEffect(() => {
    if (!notificationsOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setNotificationsOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [notificationsOpen]);

  // Support opening notifications from external triggers (e.g. sidebar menu)
  React.useEffect(() => {
    const handleOpen = () => {
      setNotificationsOpen(true);
      void reloadNotifications(true);
    };
    window.addEventListener("open-notifications", handleOpen);
    return () => window.removeEventListener("open-notifications", handleOpen);
  }, [reloadNotifications]);

  const openNotifications = () => {
    setNotificationsOpen(true);
    void reloadNotifications(true);
  };

  const openNotification = (n: NotificationItem) => {
    void markRead(n.id);
    const href = typeof n.meta?.href === "string" ? n.meta.href : null;
    if (href) {
      setNotificationsOpen(false);
      router.push(href);
    }
  };

  // The API decides which session is current; the pill can be pointed at another
  // one to review it, but that is a local view choice, not a server change.
  const [viewing, setViewing] = React.useState<string | null>(null);
  const current = React.useMemo(() => {
    if (!sessions?.length) return null;
    return sessions.find((s) => s.id === viewing)
      ?? sessions.find((s) => s.isCurrent)
      ?? sessions[0];
  }, [sessions, viewing]);

  return (
    <>
      <header className="h-[56px] bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0 z-20 sticky top-0">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="sm:hidden text-gray-500 hover:text-gray-900 p-1 rounded-md cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-[17px] font-semibold text-gray-900 hidden sm:block">{title}</h1>
        </div>

        <div className="flex items-center gap-4 text-[14px]">
          {/* Interactive Session Switcher Pill */}
          {role !== "student" && (
            <div className="relative">
            <button
              type="button"
              onClick={() => setSessionDropdownOpen(!sessionDropdownOpen)}
              disabled={sessionsLoading || !current}
              className="hidden md:flex items-center gap-1.5 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-md border border-gray-200 hover:bg-gray-100 hover:border-blue-400 hover:text-blue-900 transition-all cursor-pointer shadow-2xs disabled:opacity-60 disabled:cursor-default"
            >
              <Calendar size={14} className="text-blue-600" />
              <span className="font-semibold text-[13.5px]">
                {sessionsLoading ? "Loading session…" : current ? `Session ${current.name}` : "No session set"}
              </span>
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
                    {sessionsLoading && (
                      <div className="flex items-center gap-2 px-3 py-6 text-[13px] text-gray-500">
                        <Loader2 size={15} className="animate-spin" /> Loading sessions…
                      </div>
                    )}

                    {!sessionsLoading && !sessions?.length && (
                      <p className="px-3 py-6 text-[13px] text-gray-500">
                        No academic session has been set up yet.
                      </p>
                    )}

                    {sessions?.map((s) => {
                      const isSelected = current?.id === s.id;
                      const badge = STATUS_BADGE[s.status] ?? STATUS_BADGE.UPCOMING;
                      return (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => {
                            setViewing(s.id);
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
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${badge.className}`}>
                                {badge.text}
                              </span>
                            </div>
                            <div className="text-[12px] text-gray-500 mt-0.5">{s.label}</div>
                          </div>

                          {isSelected && (
                            <Check size={16} className="text-blue-600 shrink-0 mt-1" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {role === "admin" && (
                    <div className="p-1.5 border-t border-gray-100 bg-gray-50/50 rounded-b-xl">
                      <Link
                        href="/admin/sessions"
                        onClick={() => setSessionDropdownOpen(false)}
                        className="flex items-center justify-between px-3 py-2 text-[12.5px] font-semibold text-blue-700 hover:text-blue-900 rounded-md hover:bg-blue-50 transition-colors"
                      >
                        <span>Manage all sessions &amp; semesters</span>
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
          )}
          
          <div className="h-4 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block"></div>

          {/* Theme switcher: light & dark mode toggle for Admin, Student and Staff */}
          <ThemeToggle className="ml-2" />

          <button
            className="relative text-gray-500 hover:text-gray-900 transition-colors ml-2 cursor-pointer"
            onClick={openNotifications}
            aria-label={
              unread > 0 ? `Notifications (${unread} unread)` : "Notifications"
            }
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-danger text-white text-[10px] font-bold leading-4 flex items-center justify-center border-[1.5px] border-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
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
              <div className="flex h-full flex-col">
                <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-6">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">Notifications</h2>
                    <p className="text-[12px] text-slate-500 mt-0.5">
                      {unread > 0
                        ? `${unread} unread`
                        : notifications.length
                          ? "You're all caught up"
                          : "Nothing here yet"}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {unread > 0 && (
                      <button
                        type="button"
                        onClick={() => void markAllRead()}
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[12px] font-semibold text-blue-700 hover:bg-blue-50 hover:text-blue-900 cursor-pointer"
                      >
                        <CheckCheck size={14} /> Mark all read
                      </button>
                    )}
                    <button
                      type="button"
                      className="rounded-md text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 cursor-pointer p-1"
                      onClick={() => setNotificationsOpen(false)}
                    >
                      <span className="sr-only">Close panel</span>
                      <X size={20} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <div className="relative flex-1 overflow-y-auto p-4 sm:p-6">
                  {notificationsLoading && notifications.length === 0 ? (
                    <div className="flex items-center gap-2 text-[13px] text-slate-500">
                      <Loader2 size={15} className="animate-spin" /> Loading notifications…
                    </div>
                  ) : notificationsError ? (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                      <p className="text-[13px] text-red-700">
                        {notificationsError.message ?? "Could not load notifications."}
                      </p>
                      <button
                        type="button"
                        onClick={() => void reloadNotifications()}
                        className="mt-2 text-[12px] font-semibold text-red-700 hover:underline cursor-pointer"
                      >
                        Try again
                      </button>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <Bell size={28} className="text-slate-300" />
                      <p className="mt-3 text-[14px] font-semibold text-slate-700">
                        You&apos;re all caught up
                      </p>
                      <p className="mt-1 text-[12.5px] text-slate-500">
                        Exam updates and result releases will appear here.
                      </p>
                    </div>
                  ) : (
                    <ul className="space-y-3">
                      {notifications.map((n) => {
                        const style = NOTIFICATION_STYLE[n.type] ?? NOTIFICATION_STYLE.SYSTEM;
                        const Icon = style.icon;
                        const isUnread = !n.readAt;
                        return (
                          <li key={n.id}>
                            <button
                              type="button"
                              onClick={() => openNotification(n)}
                              className={`w-full text-left rounded-xl border p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                                isUnread
                                  ? "border-blue-200 bg-blue-50 hover:bg-blue-100/70"
                                  : "border-slate-200 bg-white hover:bg-slate-50"
                              }`}
                            >
                              <span
                                className={`mt-0.5 shrink-0 rounded-full p-1.5 ${style.tint} ${style.ink}`}
                              >
                                <Icon size={14} />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="flex items-center gap-2">
                                  <span
                                    className={`text-sm font-bold ${
                                      isUnread ? "text-blue-900" : "text-slate-800"
                                    }`}
                                  >
                                    {n.title}
                                  </span>
                                  {isUnread && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 shrink-0" />
                                  )}
                                </span>
                                <span
                                  className={`block text-[13px] mt-0.5 ${
                                    isUnread ? "text-blue-800" : "text-slate-600"
                                  }`}
                                >
                                  {n.body}
                                </span>
                                {n.meta && typeof (n.meta as Record<string, unknown>).accessCode === "string" && (
                                  <span className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded font-mono font-bold text-xs tracking-wider">
                                    🔑 Unlock Code: {String((n.meta as Record<string, unknown>).accessCode)}
                                  </span>
                                )}
                                <span
                                  className={`block text-[11px] mt-1 ${
                                    isUnread ? "text-blue-600" : "text-slate-400"
                                  }`}
                                >
                                  {timeAgo(n.createdAt)}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
