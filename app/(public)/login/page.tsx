"use client";

import Image from "next/image";
import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Loader2, AlertCircle, Shield, GraduationCap, User, ArrowRight, Lock, Mail } from "lucide-react";
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
  const [error, setError] = useState<string | null>(null);
  const [portal, setPortal] = useState<Portal | undefined>(fixedPortal);
  const [roleModalOpen, setRoleModalOpen] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userName, setUserName] = useState("");

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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
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
        body: JSON.stringify({ identifier: identifier.trim(), password }),
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
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError?.code === "MAINTENANCE_MODE" || apiError?.message?.toLowerCase().includes("maintenance")) {
        window.location.replace("/maintenance");
        return;
      }
      let errorMsg = apiError?.message ?? "We couldn't sign you in. Check your details and try again.";
      if (
        apiError?.code === "AUTH_INVALID_CREDENTIALS" ||
        errorMsg.toLowerCase().includes("identifier") ||
        errorMsg.toLowerCase().includes("credentials") ||
        errorMsg.toLowerCase().includes("wrong identifier")
      ) {
        errorMsg = "Wrong email or password. Please verify your credentials and try again.";
      }
      setError(errorMsg);
      setIsLoading(false);
    }
  };

  const chooseRole = (r: string) => {
    window.location.assign(homeForRole(r));
  };

  const describedBy =
    [error ? "login-error" : "", capsLock ? "caps-warning" : ""].join(" ").trim() || undefined;

  return (
    <main
      className={`${inter.className} min-h-screen relative flex flex-col items-center justify-center w-full bg-[#060d1f] overflow-x-hidden px-4 py-8 selection:bg-blue-500 selection:text-white`}
    >
      {/* Background ambient lighting */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(37,99,235,0.22),rgba(6,13,31,0))]"
      />
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_60%_40%_at_50%_100%,rgba(14,165,233,0.1),rgba(6,13,31,0))]"
      />

      <div className="relative z-10 w-full max-w-[420px] mx-auto flex flex-col items-center">
        {/* BRAND HEADER */}
        <header className="flex flex-col items-center text-center mb-6 w-full">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl scale-125" />
            <Image
              src="/lasustech-logo.png"
              alt={`${SCHOOL_NAME} logo`}
              width={84}
              height={84}
              priority
              className="relative w-18 h-18 md:w-20 md:h-20 object-contain drop-shadow-md"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </div>

          <h1 className="font-bold text-white tracking-tight text-xl md:text-2xl leading-tight text-balance">
            {SCHOOL_NAME}
          </h1>

          <p className="text-blue-400 mt-1.5 text-xs md:text-sm font-medium tracking-wide">
            Computer Based Test System
          </p>
        </header>

        {/* FORM CARD */}
        <div className="w-full rounded-2xl border border-white/10 bg-[#0d1a38]/85 backdrop-blur-xl p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {portal && (
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-300 border border-blue-400/20">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              {PORTAL_LABEL[portal]}
            </div>
          )}

          <form onSubmit={handleLogin} className="w-full text-left space-y-4">
            {/* Identifier */}
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="text-xs font-semibold text-slate-200 block uppercase tracking-wider">
                Matric Number or Staff Email <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="identifier"
                  name="username"
                  type="text"
                  placeholder="e.g. CSC/2022/305 or name@lasustech.edu.ng"
                  required
                  inputMode="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck={false}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  autoComplete="username"
                  aria-invalid={!!error}
                  aria-describedby={error ? "login-error" : undefined}
                  className="w-full h-11 px-3.5 pl-10 rounded-lg bg-[#071129] border border-slate-700/80 text-white placeholder:text-slate-500 text-sm font-normal focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-xs font-semibold text-slate-200 block uppercase tracking-wider">
                Password <span className="text-rose-400" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
                  onBlur={() => setCapsLock(false)}
                  autoComplete="current-password"
                  aria-invalid={!!error}
                  aria-describedby={describedBy}
                  className="w-full h-11 px-3.5 pl-10 pr-10 rounded-lg bg-[#071129] border border-slate-700/80 text-white placeholder:text-slate-500 text-sm font-normal focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <button
                  type="button"
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-200 transition-colors rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {capsLock && (
                <p id="caps-warning" className="text-xs text-amber-300 flex items-center gap-1.5 pt-0.5 font-medium">
                  <AlertCircle size={13} className="shrink-0" aria-hidden="true" />
                  Caps Lock is ON
                </p>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div
                id="login-error"
                role="alert"
                className="flex items-start gap-2.5 rounded-lg border border-rose-500/30 bg-rose-950/40 px-3.5 py-2.5 text-xs text-rose-200 leading-relaxed animate-in fade-in duration-150"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-rose-400" aria-hidden="true" />
                <span>{error}</span>
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
                  className="h-4 w-4 rounded border-slate-600 bg-[#071129] text-blue-600 focus:ring-1 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs font-medium text-slate-300 group-hover:text-white transition-colors">
                  Keep me signed in
                </span>
              </label>

              <Link
                href="/reset"
                className="text-xs font-medium text-blue-400 hover:text-blue-300 hover:underline underline-offset-2 transition-colors"
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
                className="w-full h-11 text-sm font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-600/30 hover:shadow-blue-600/40 transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2" role="status">
                    <Loader2 size={16} className="animate-spin" aria-hidden="true" />
                    Signing in…
                  </span>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <footer className="mt-5 text-center text-xs text-slate-400">
          <span>Authorized users only. </span>
          <Link
            href="/support"
            className="text-blue-400 hover:text-blue-300 font-medium underline underline-offset-2 transition-colors ml-0.5"
          >
            Need help? Contact ICT Support
          </Link>
        </footer>
      </div>

      {/* Role Selection Modal for accounts with multiple roles */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-[#0d1a38] border border-white/20 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
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
                    className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-blue-400/60 transition-all flex items-start gap-3.5 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            <div className="pt-2 border-t border-white/10 flex justify-end">
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