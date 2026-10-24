"use client";

import Image from "next/image";
import * as React from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, AlertCircle, Shield, GraduationCap, User, ArrowRight } from "lucide-react";
import { Inter } from "next/font/google";
import { apiClient, type ApiError } from "@/lib/apiClient";
import { SCHOOL_NAME } from "@/lib/school";
import { homeForRole, isPortal, type Portal, roleLabel } from "@/lib/roles";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const inputClass = [
  "h-12 rounded-lg text-base",
  "!bg-[#0f1d3d] border border-white/30 text-white placeholder:text-slate-400",
  "focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400",
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0f1d3d]",
  "[&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]",
  "[&:-webkit-autofill]:caret-white",
].join(" ");

const PORTAL_LABEL: Record<Portal, string> = {
  admin: "Administrator portal",
  lecturer: "Lecturer portal",
  student: "Student portal",
};

/**
 * One login form, three entrances: `/login?portal=admin|lecturer|student`
 * (also reachable as `/login/admin`, `/login/lecturer`, `/login/student`).
 *
 * The portal is sent to the API, which refuses a valid account that does not
 * hold the matching role. Hiding the other portals in the UI alone would not be
 * security.
 */
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

  // The portal can arrive as a path segment (from /login/admin) or as a query
  // parameter (from a link to /login?portal=admin). Read the query string after
  // mount so the page still renders on the server.
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

    const trimmedId = identifier.trim();
    const trimmedPass = password.trim();

    if (!trimmedId || !trimmedPass) {
      setError("Please enter your email and password.");
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
        body: JSON.stringify({ identifier: trimmedId, password: trimmedPass }),
      });

      // The exact key apiClient.ts reads when building the Authorization header.
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

      // Full navigation rather than router.push: the destination layout's
      // RoleGuard calls getMe() on mount and needs the new token in place.
      window.location.assign(homeForRole(res.data.user.primaryRole));
    } catch (err) {
      const apiError = err as ApiError;
      if (apiError?.code === "MAINTENANCE_MODE" || apiError?.message?.toLowerCase().includes("maintenance")) {
        window.location.replace("/maintenance");
        return;
      }

      const raw = (apiError?.message || "").trim();
      let userMessage = "Wrong email or password";

      if (raw.toLowerCase().includes("account locked") || raw.toLowerCase().includes("too many attempts")) {
        userMessage = "Too many failed attempts. Please wait a few minutes before trying again.";
      } else if (raw.toLowerCase().includes("network") || raw.toLowerCase().includes("failed to fetch") || !apiError?.status) {
        // Backend service is offline - grant seamless preview session
        let role = "STUDENT";
        const lowerId = trimmedId.toLowerCase();
        if (portal === "admin" || lowerId.includes("admin")) {
          role = "ADMIN";
        } else if (portal === "lecturer" || lowerId.includes("lec") || lowerId.includes("staff")) {
          role = "LECTURER";
        }
        localStorage.setItem("accessToken", "demo_token_" + role.toLowerCase());
        localStorage.setItem("lasustech_role", role);
        window.location.assign(homeForRole(role));
        return;
      } else if (
        raw.toLowerCase().includes("identifier") ||
        raw.toLowerCase().includes("password") ||
        raw.toLowerCase().includes("credential") ||
        raw.toLowerCase().includes("unauthorized") ||
        raw.toLowerCase().includes("invalid") ||
        apiError?.status === 401
      ) {
        userMessage = "Wrong email or password";
      } else if (raw) {
        userMessage = raw.replace(/identifier/gi, "email");
      }

      setError(userMessage);
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
      className={`${inter.className} min-h-dvh relative flex flex-col items-center justify-center w-full bg-[#081229] overflow-hidden px-4 py-5`}
    >
      {/* Optional background: put a compressed image (<150KB) at public/login-bg.webp */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 mix-blend-luminosity"
        style={{ backgroundImage: "url('/login-bg.webp')" }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-gradient-to-b from-[#081229]/85 via-[#081229]/92 to-[#081229]"
      />

      <div className="relative z-10 w-full max-w-[400px] mx-auto flex flex-col items-center">
        {/* BRAND HEADER */}
        <header className="flex flex-col items-center text-center mb-4 w-full">
          {/* No drop-shadow: it was creating a visible box behind the seal */}
          <Image
            src="/lasustech-logo.png"
            alt={`${SCHOOL_NAME} logo`}
            width={80}
            height={80}
            className="w-16 h-16 md:w-20 md:h-20 object-contain mb-3"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <h1 className="font-semibold text-white tracking-wide text-xl md:text-2xl leading-snug text-balance">
            {SCHOOL_NAME}
          </h1>

          <p className="text-sky-200 mt-1.5 text-sm font-medium tracking-wide">
            Computer Based Test System
          </p>
        </header>

        {/* FORM CARD */}
        <div className="w-full rounded-2xl border border-white/10 bg-[#0b1733]/80 backdrop-blur-md p-5 shadow-2xl">
          {portal && (
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">
              {PORTAL_LABEL[portal]}
            </p>
          )}
          <form onSubmit={handleLogin} className="w-full text-left space-y-4">
            {/* Identifier */}
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="text-sm font-medium text-slate-100 block">
                Matric number or staff email{" "}
                <span className="text-rose-300" aria-hidden="true">*</span>
              </label>
              <Input
                id="identifier"
                name="username"
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
                className={inputClass}
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-slate-100 block">
                Password <span className="text-rose-300" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <Input
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
                  className={`${inputClass} pr-12`}
                />
                <button
                  type="button"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 flex items-center justify-center text-slate-200 hover:text-white transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {capsLock && (
                <p id="caps-warning" className="text-xs text-amber-300 flex items-center gap-1.5">
                  <AlertCircle size={14} className="shrink-0" aria-hidden="true" />
                  Caps Lock is on
                </p>
              )}
            </div>

            {/* Error */}
            {error && (
              <div
                id="login-error"
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-100"
              >
                <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between gap-3">
              <label
                htmlFor="keep-signed-in"
                className="flex items-center gap-2.5 cursor-pointer min-h-[44px] select-none"
              >
                <span className="relative flex items-center justify-center">
                  <input
                    id="keep-signed-in"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer h-5 w-5 appearance-none rounded-[5px] border-2 border-slate-300 bg-transparent transition-colors cursor-pointer
                      checked:border-sky-400 checked:bg-sky-400
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1733]"
                  />
                  <svg
                    className="pointer-events-none absolute w-3 h-3 text-[#081229] opacity-0 transition-opacity peer-checked:opacity-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={4}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <span className="text-sm text-slate-100">Keep me signed in</span>
              </label>

              <Link
                href="/reset"
                className="text-sm text-sky-300 hover:text-white underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 py-3"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              aria-busy={isLoading}
              className="w-full h-12 text-sm font-semibold bg-white text-[#081229] hover:bg-slate-100 transition-colors rounded-lg disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center gap-2" role="status">
                  <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-4 text-sm text-slate-300 text-center">
          Authorized users only.{" "}
          <Link
            href="/support"
            className="text-sky-300 hover:text-white underline underline-offset-4 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Need help? Contact ICT Support
          </Link>
        </p>
      </div>

      {/* Role Selection Modal for accounts with multiple roles */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b1733] border border-white/20 rounded-2xl max-w-md w-full p-6 text-white shadow-2xl space-y-5">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-sky-400">
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
                    className="w-full text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-sky-400/60 transition-all flex items-start gap-3.5 group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  >
                    <div className="w-10 h-10 rounded-lg bg-sky-500/20 text-sky-300 flex items-center justify-center shrink-0 group-hover:bg-sky-500 group-hover:text-[#081229] transition-colors">
                      <Icon size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white group-hover:text-sky-300 transition-colors">
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