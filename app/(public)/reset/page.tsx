"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Send, Loader2, AlertCircle, ShieldAlert, KeyRound, ArrowRight } from "lucide-react";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SCHOOL_NAME } from "@/lib/school";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Dark input that survives Chrome autofill (same as the login page)
const inputClass = [
  "h-12 rounded-lg text-base",
  "!bg-[#0f1d3d] border border-white/30 text-white placeholder:text-slate-400",
  "focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400",
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0f1d3d]",
  "[&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]",
  "[&:-webkit-autofill]:caret-white",
].join(" ");

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [identifier, setIdentifier] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // Move focus to the heading when the result appears so screen-reader users notice
  React.useEffect(() => {
    if (submitted) headingRef.current?.focus();
  }, [submitted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || "An error occurred. Please try again.");
      }

      setSubmitted(true);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("A network error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSubmitted(false);
    setIdentifier("");
    setError(null);
  };

  return (
    <main className={`${inter.className} min-h-dvh grid lg:grid-cols-2 bg-[#081229]`}>
      {/* LEFT: institutional panel (desktop only) */}
      <section
        aria-hidden="true"
        className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden px-6 py-10 text-center bg-[radial-gradient(ellipse_at_center,_#14285a_0%,_#081229_70%)]"
      >
        <div className="flex h-36 w-36 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-500/20 to-sky-400/10 border border-sky-400/30 shadow-[0_0_50px_rgba(56,189,248,0.25)] backdrop-blur-md mb-6">
          <KeyRound className="h-16 w-16 text-sky-400 drop-shadow-[0_0_16px_rgba(56,189,248,0.5)]" />
        </div>
        <p className="mt-6 text-2xl xl:text-3xl font-semibold text-white text-balance max-w-md">
          {SCHOOL_NAME}
        </p>
        <p className="mt-2 text-base text-sky-200">Computer Based Test System</p>
      </section>

      {/* RIGHT: form panel */}
      <section className="flex items-center justify-center px-4 py-8 sm:px-8 bg-[#0b1733] lg:border-l lg:border-white/10">
        <div className="w-full max-w-[400px]">
          {/* Small emblem for mobile */}
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-sky-400/10 border border-sky-400/30 lg:hidden shadow-[0_0_24px_rgba(56,189,248,0.25)]">
            <KeyRound className="h-10 w-10 text-sky-400" />
          </div>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-bold tracking-tight text-white mb-2 outline-none"
          >
            {submitted ? "Check your email" : "Reset your password"}
          </h1>

          {!submitted ? (
            <>
              {/* Notice for Students */}
              <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3.5 text-xs text-amber-200 space-y-2 mb-5">
                <div className="flex items-center gap-1.5 font-bold text-amber-100">
                  <ShieldAlert size={14} className="text-amber-400 shrink-0" />
                  Examination Candidate Notice
                </div>
                <p className="leading-relaxed text-slate-300">
                  Per LASUSTECH examination security policy, student accounts cannot self-reset passwords online. Student credentials are maintained and reset solely by the ICT CBT Center.
                </p>
                <Link
                  href="/support"
                  className="inline-flex items-center gap-1 font-semibold text-amber-300 underline underline-offset-4 hover:text-white"
                >
                  Submit Official Support Request <ArrowRight size={12} />
                </Link>
              </div>

              <p className="text-sm text-slate-300 mb-5 leading-relaxed">
                Staff, lecturers, and administrators may enter their registered email address to receive reset instructions.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="identifier" className="text-sm font-medium text-slate-100 block">
                    Staff or Lecturer Email{" "}
                    <span className="text-rose-300" aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="identifier"
                    name="username"
                    required
                    placeholder="e.g. j.doe@lasustech.edu.ng"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    autoComplete="username"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-invalid={!!error}
                    aria-describedby={error ? "reset-error" : undefined}
                    className={inputClass}
                  />
                </div>

                {error && (
                  <div
                    id="reset-error"
                    role="alert"
                    className="flex items-start gap-2 rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2.5 text-sm text-rose-100"
                  >
                    <AlertCircle size={16} className="shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{error}</span>
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isLoading}
                  aria-busy={isLoading}
                  className="w-full h-12 text-sm font-semibold bg-white text-[#081229] hover:bg-slate-100 transition-colors rounded-lg disabled:opacity-80 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2" role="status">
                      <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
                      Sending…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Send reset link
                      <Send size={16} aria-hidden="true" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div aria-live="polite" className="mt-4">
              <div className="flex items-start gap-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-4 mb-5">
                <CheckCircle2 size={22} className="shrink-0 mt-0.5 text-emerald-300" aria-hidden="true" />
                <p className="text-base text-emerald-50 leading-relaxed">
                  If an account matches what you entered, we&apos;ve sent reset instructions to the
                  email linked to it.
                </p>
              </div>

              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Nothing yet? Check your spam folder and wait a few minutes. If you have no access to
                that email,{" "}
                <Link
                  href="/support"
                  className="text-sky-300 underline underline-offset-4 hover:text-white rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  contact ICT Support
                </Link>
                .
              </p>

              <button
                type="button"
                onClick={reset}
                className="inline-flex w-full items-center justify-center min-h-12 rounded-lg border border-white/30 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1733]"
              >
                Use a different matric number or email
              </button>
            </div>
          )}

          <div className="mt-8 pt-5 border-t border-white/10 text-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center min-h-11 text-sm font-medium text-sky-300 hover:text-white underline-offset-4 hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            >
              <ArrowLeft className="mr-2" size={16} aria-hidden="true" />
              Back to sign in
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}