"use client";

import Image from "next/image";
import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  Shield,
  GraduationCap,
  User,
  ArrowRight,
  Lock,
  Mail,
  HelpCircle,
  X,
  CheckCircle2,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  Info,
  BookOpen,
} from "lucide-react";
import { Inter } from "next/font/google";
import { apiClient, type ApiError } from "@/lib/apiClient";
import { SCHOOL_NAME } from "@/lib/school";
import { homeForRole, isPortal, type Portal } from "@/lib/roles";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const PORTAL_LABEL: Record<Portal, string> = {
  admin: "Administrator Portal",
  lecturer: "Lecturer Portal",
  student: "Student Portal",
};

export default function LoginPage({ portal: fixedPortal }: { portal?: Portal }) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<{ message: string; isLocked?: boolean } | null>(null);
  const [portal, setPortal] = useState<Portal | undefined>(fixedPortal);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userName, setUserName] = useState("");
  const [tipsOpen, setTipsOpen] = useState(false);

  useEffect(() => {
    if (fixedPortal) return;
    const q = new URLSearchParams(window.location.search).get("portal");
    if (isPortal(q)) {
      setPortal(q);
      return;
    }

    // Check if platform is in maintenance mode
    const checkMaintenance = async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
        const res = await fetch(`${baseUrl}/system/status`);
        if (res.ok) {
          const body = await res.json();
          if (body.data?.maintenanceMode) {
            window.location.replace("/maintenance");
          }
        }
      } catch {}
    };
    checkMaintenance();
  }, [fixedPortal]);

  // Handle ESC key to dismiss side panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setTipsOpen(false);
        setRoleModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier || !password) {
      setError({ message: "Please enter both your matric number/email and password." });
      return;
    }

    setIsLoading(true);

    try {
      const res = await apiClient<{
        data: {
          accessToken: string;
          refreshToken?: string;
          user: { id: string; names: string; primaryRole: string; roles: string[] };
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ identifier: cleanIdentifier, password }),
      });

      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.refreshToken) {
        localStorage.setItem("refreshToken", res.data.refreshToken);
      }

      const roles = res.data.user.roles?.length ? res.data.user.roles : [res.data.user.primaryRole];

      // If user holds multiple roles (e.g. ADMIN + LECTURER), prompt them to pick which portal they want
      if (roles.length > 1) {
        setUserRoles(roles);
        setUserName(res.data.user.names || "User");
        setRoleModalOpen(true);
        setIsLoading(false);
        return;
      }

      window.location.assign(homeForRole(res.data.user.primaryRole));
    } catch (err: any) {
      const apiError = err as ApiError;
      if (apiError?.code === "MAINTENANCE_MODE" || apiError?.message?.toLowerCase().includes("maintenance")) {
        window.location.replace("/maintenance");
        return;
      }

      const msg = apiError?.message || "";
      const isLocked =
        apiError?.code === "AUTH_LOCKED" ||
        msg.toLowerCase().includes("locked") ||
        apiError?.code === "LOCKED";

      if (isLocked) {
        setError({
          message:
            "Your account is temporarily locked due to consecutive unsuccessful sign-in attempts. Please wait 15 minutes before retrying, or reset your password.",
          isLocked: true,
        });
      } else if (
        apiError?.code === "AUTH_INVALID_CREDENTIALS" ||
        msg.toLowerCase().includes("identifier") ||
        msg.toLowerCase().includes("credentials") ||
        msg.toLowerCase().includes("wrong")
      ) {
        setError({
          message: "Incorrect matric number/email or password. Please verify your credentials or view Login Tips.",
          isLocked: false,
        });
      } else if (msg.toLowerCase().includes("inactive") || msg.toLowerCase().includes("invited")) {
        setError({
          message: "Account not activated. Please contact your Departmental Course Advisor or ICT Room 104.",
          isLocked: false,
        });
      } else if (err.name === "TypeError" || msg.toLowerCase().includes("network") || msg.toLowerCase().includes("fetch")) {
        setError({
          message: "Cannot communicate with the CBT examination server. Please verify your network or LAN connection.",
          isLocked: false,
        });
      } else {
        setError({
          message: msg || "Sign-in failed. Please check your credentials and try again.",
          isLocked: false,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const chooseRole = (r: string) => {
    window.location.assign(homeForRole(r));
  };

  return (
    <main
      className={`${inter.className} min-h-screen relative flex flex-col items-center justify-center w-full bg-[#050b1a] overflow-x-hidden px-4 py-8 selection:bg-blue-600 selection:text-white`}
    >
      {/* Background ambient lighting & subtle grid */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.28),rgba(5,11,26,0))]"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(14,165,233,0.14),rgba(5,11,26,0))]"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem]"
      />

      {/* Top Floating Tips Trigger */}
      <button
        type="button"
        onClick={() => setTipsOpen(true)}
        className="fixed top-5 right-5 z-30 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900/90 text-slate-200 hover:text-white hover:bg-blue-600 border border-slate-700/80 hover:border-blue-400 transition-all cursor-pointer shadow-lg backdrop-blur-md"
      >
        <HelpCircle size={15} className="text-blue-400" />
        <span>Tips for Login</span>
      </button>

      <div className="relative z-10 w-full max-w-[430px] mx-auto flex flex-col items-center">
        {/* BRAND HEADER */}
        <header className="flex flex-col items-center text-center mb-6 w-full">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500/25 blur-xl scale-125" />
            <Image
              src="/lasustech-logo.png"
              alt={`${SCHOOL_NAME} logo`}
              width={88}
              height={88}
              priority
              className="relative w-18 h-18 md:w-22 md:h-22 object-contain drop-shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <h1 className="font-extrabold text-white tracking-tight text-xl md:text-2xl leading-tight drop-shadow-xs">
            {SCHOOL_NAME}
          </h1>

          <p className="text-blue-400 mt-1.5 text-xs md:text-sm font-semibold tracking-wide">
            Computer Based Test Examination Portal
          </p>
        </header>

        {/* FORM CARD - HIGH CONTRAST & SHARP EDGES */}
        <div className="w-full rounded-2xl border border-slate-700/90 bg-[#0a1329]/95 backdrop-blur-2xl p-6 sm:p-8 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-2 mb-5">
            {portal ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                {PORTAL_LABEL[portal]}
              </div>
            ) : (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Sign in to your account
              </span>
            )}

            <button
              type="button"
              onClick={() => setTipsOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-blue-300 hover:text-white bg-blue-500/10 hover:bg-blue-600/30 border border-blue-400/20 hover:border-blue-400/40 transition-colors cursor-pointer"
            >
              <HelpCircle size={13} />
              <span>Login Tips</span>
            </button>
          </div>

          <form onSubmit={handleLogin} className="w-full text-left space-y-4.5">
            {/* Identifier */}
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="text-xs font-bold text-slate-100 block uppercase tracking-wider">
                Matric Number or Staff Email <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  name="username"
                  type="text"
                  placeholder="e.g. LASU/CSC/2023/001 or email"
                  required
                  inputMode="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={identifier}
                  onChange={(e) => {
                    setIdentifier(e.target.value);
                    if (error) setError(null);
                  }}
                  autoComplete="username"
                  aria-invalid={!!error}
                  className={`w-full h-11 px-3.5 pl-10 rounded-xl bg-[#040817] border text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                    error ? "border-rose-500/90 focus:border-rose-500" : "border-slate-600 focus:border-blue-400"
                  }`}
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-slate-100 block uppercase tracking-wider">
                  Password <span className="text-rose-400" aria-hidden="true">*</span>
                </label>
                {capsLock && (
                  <span id="caps-warning" className="text-[11px] text-amber-300 font-semibold flex items-center gap-1">
                    <AlertCircle size={12} className="shrink-0" /> Caps Lock is ON
                  </span>
                )}
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your examination password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(null);
                  }}
                  onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                  onBlur={() => setCapsLock(false)}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  className={`w-full h-11 px-3.5 pl-10 pr-10 rounded-xl bg-[#040817] border text-white placeholder:text-slate-400 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all ${
                    error ? "border-rose-500/90 focus:border-rose-500" : "border-slate-600 focus:border-blue-400"
                  }`}
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors rounded-lg cursor-pointer"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* High Contrast Error Banner */}
            {error && (
              <div
                id="login-error"
                role="alert"
                className={`flex flex-col gap-2 rounded-xl p-3.5 text-xs leading-relaxed shadow-md border animate-in fade-in duration-150 ${
                  error.isLocked
                    ? "border-amber-500/50 bg-amber-950/60 text-amber-100"
                    : "border-rose-500/50 bg-rose-950/70 text-rose-100"
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {error.isLocked ? (
                    <ShieldAlert size={17} className="shrink-0 mt-0.5 text-amber-400" aria-hidden="true" />
                  ) : (
                    <AlertCircle size={17} className="shrink-0 mt-0.5 text-rose-400" aria-hidden="true" />
                  )}
                  <span className="font-semibold text-white">{error.message}</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-white/10 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setTipsOpen(true)}
                    className="text-blue-300 hover:text-white font-bold underline underline-offset-2 flex items-center gap-1 cursor-pointer"
                  >
                    <HelpCircle size={12} /> View Login Tips & Formats
                  </button>
                  <Link
                    href="/support"
                    className="text-slate-300 hover:text-white underline underline-offset-2 font-semibold"
                  >
                    Helpdesk Support &rarr;
                  </Link>
                </div>
              </div>
            )}

            {/* Remember Me + Forgot Password */}
            <div className="flex items-center justify-between gap-3 pt-1">
              <label
                htmlFor="keep-signed-in"
                className="flex items-center gap-2 cursor-pointer select-none group"
              >
                <input
                  id="keep-signed-in"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-500 bg-[#040817] text-blue-600 focus:ring-1 focus:ring-blue-500 cursor-pointer"
                />
                <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors">
                  Keep me signed in
                </span>
              </label>

              <Link
                href="/reset"
                className="text-xs font-bold text-blue-400 hover:text-blue-300 hover:underline underline-offset-2 transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                aria-busy={isLoading}
                className="w-full h-11.5 text-sm font-bold tracking-wide rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2" role="status">
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Authenticating…
                  </span>
                ) : (
                  "Sign In to Portal"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-5 text-center text-xs text-slate-300">
          <span>Official LASUSTECH CBT System &bull; </span>
          <Link
            href="/support"
            className="text-blue-400 hover:text-blue-300 font-bold underline underline-offset-2 transition-colors ml-0.5"
          >
            Technical Helpdesk
          </Link>
        </footer>
      </div>

      {/* SIDE PANEL: TIPS FOR LOGIN */}
      {tipsOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setTipsOpen(false)}
            aria-hidden="true"
          />

          {/* Slideover Panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="tips-title"
            className="relative z-10 w-full max-w-md bg-[#0a1329] border-l border-slate-700/90 shadow-2xl p-6 sm:p-7 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-250 text-white"
          >
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    <Info size={12} /> Candidate Assistance
                  </div>
                  <h2 id="tips-title" className="text-xl font-bold text-white tracking-tight">
                    Login Tips & Guidance
                  </h2>
                  <p className="text-xs text-slate-400">
                    Step-by-step instructions for seamless access to your CBT examination.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTipsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="Close tips panel"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Student Guide */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-300">
                  <GraduationCap size={18} className="text-blue-400" />
                  <span>Student Credentials Format</span>
                </div>
                <div className="text-xs text-slate-300 space-y-2">
                  <p>
                    Your <strong>Identifier</strong> is your university Matriculation Number or admission registration number:
                  </p>
                  <div className="p-2.5 rounded-lg bg-[#040817] border border-slate-800 font-mono text-[11px] text-blue-200 space-y-1">
                    <div>Format 1: <strong className="text-white">LASU/CSC/2023/001</strong></div>
                    <div>Format 2: <strong className="text-white">230591001</strong></div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    &bull; Letters are not case-sensitive (e.g. lowercase <code className="text-slate-300">lasu</code> is accepted).
                  </p>
                </div>
              </div>

              {/* Password Tips */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                  <KeyRound size={17} className="text-amber-400" />
                  <span>Password Rules & Advice</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside">
                  <li>
                    <strong>Case-Sensitive:</strong> Passwords must match exact uppercase/lowercase characters.
                  </li>
                  <li>
                    <strong>Caps Lock:</strong> Watch for the on-screen Caps Lock indicator above the password field.
                  </li>
                  <li>
                    <strong>Default Password:</strong> If this is your first test, use the default credential issued by your faculty or ICT coordinator.
                  </li>
                </ul>
              </div>

              {/* Troubleshooting */}
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
                  <ShieldAlert size={17} className="text-rose-400" />
                  <span>Troubleshooting Common Errors</span>
                </div>
                <div className="text-xs text-slate-300 space-y-2.5">
                  <div>
                    <strong className="text-white">Account Locked:</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      After 5 incorrect password attempts, accounts are locked for 15 minutes to prevent unauthorized access. You can reset your password immediately via the "Forgot Password" link.
                    </p>
                  </div>
                  <div>
                    <strong className="text-white">Exam Hall Disconnects:</strong>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      If your computer rebooted during an active test, re-enter your matric number and password immediately. The exam timer and your saved answers will resume seamlessly.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Links */}
              <div className="space-y-2 pt-1">
                <Link
                  href="/support"
                  onClick={() => setTipsOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-blue-500/40 bg-blue-600/20 hover:bg-blue-600 hover:text-white text-blue-300 text-xs font-bold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <HelpCircle size={14} /> Open Support / In-Hall Ticket
                  </span>
                  <ChevronRight size={14} />
                </Link>
                <Link
                  href="/reset"
                  onClick={() => setTipsOpen(false)}
                  className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <KeyRound size={14} /> Request Password Reset
                  </span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            {/* Bottom Dismiss */}
            <div className="pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTipsOpen(false)}
                className="w-full h-11 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-sm text-white transition-colors cursor-pointer"
              >
                Got It &bull; Back to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Selection Modal for accounts with multiple roles */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0a1329] border border-slate-700/90 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
                Multiple Roles Detected
              </span>
              <h2 className="text-xl font-bold mt-1 text-white">Choose your portal</h2>
              <p className="text-sm text-slate-300 mt-1">
                Welcome back, <strong className="text-white">{userName}</strong>. What portal would you like to enter as today?
              </p>
            </div>

            <div className="space-y-3">
              {userRoles.map((r) => {
                const isAdmin = r === "ADMIN";
                const isLecturer = r === "LECTURER";
                const Icon = isAdmin ? Shield : isLecturer ? GraduationCap : User;
                const label = isAdmin
                  ? "Administrator Portal"
                  : isLecturer
                  ? "Lecturer Portal"
                  : "Student Portal";
                const desc = isAdmin
                  ? "Schedule exams, live invigilation, manage courses & users"
                  : isLecturer
                  ? "Author questions, build exams, and view submissions"
                  : "Sit for scheduled examinations and view test scores";

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => chooseRole(r)}
                    className="w-full text-left p-4 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 hover:border-blue-400/60 transition-all flex items-start gap-3.5 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white group-hover:text-blue-300 transition-colors">
                          {label}
                        </span>
                        <ArrowRight
                          size={16}
                          className="text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all"
                        />
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5 line-clamp-2">{desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem("accessToken");
                  setRoleModalOpen(false);
                }}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel and sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
