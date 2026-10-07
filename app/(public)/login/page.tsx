"use client";

import Image from "next/image";
import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SCHOOL_NAME = "Lagos State University of Science and Technology";

const inputClass = [
  "h-12 rounded-lg text-base",
  "!bg-[#0f1d3d] border border-white/30 text-white placeholder:text-slate-400",
  "focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400",
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0f1d3d]",
  "[&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]",
  "[&:-webkit-autofill]:caret-white",
].join(" ");

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [capsLock, setCapsLock] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      // Backend connection template
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password, rememberMe }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials");
      }

      // Route based on role returned from the backend
      const role = data.role?.toLowerCase();
      if (role === "admin") router.push("/admin");
      else if (role === "lecturer" || role === "staff") router.push("/lecturer");
      else if (role === "officer") router.push("/officer");
      else if (role === "invigilator") router.push("/invigilator");
      else router.push("/student");

    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during login.");
      }
    } finally {
      setIsLoading(false);
    }
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
    </main>
  );
}