"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, CheckCircle2, Send, Loader2, AlertCircle } from "lucide-react";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SCHOOL_NAME = "Lagos State University of Science and Technology";

// One place to change the picture. File must be at public/info6.png
const RESET_IMAGE = "/info6.png";

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
      // Backend connection template
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "An error occurred. Please try again.");
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
      {/* LEFT: picture panel (desktop only, decorative) */}
      <section
        aria-hidden="true"
        className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden px-6 py-10 text-center bg-[radial-gradient(ellipse_at_center,_#14285a_0%,_#081229_70%)]"
      >
        <Image
          src={RESET_IMAGE}
          alt=""
          width={900}
          height={900}
          sizes="50vw"
          priority
          className="h-auto w-full max-w-[860px] max-h-[62dvh] object-contain drop-shadow-[0_0_48px_rgba(125,211,252,0.45)]"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />
        <p className="mt-6 text-2xl xl:text-3xl font-semibold text-white text-balance max-w-md">
          {SCHOOL_NAME}
        </p>
        <p className="mt-2 text-base text-sky-200">Computer Based Test System</p>
      </section>

      {/* RIGHT: form panel */}
      <section className="flex items-center justify-center px-4 py-8 sm:px-8 bg-[#0b1733] lg:border-l lg:border-white/10">
        <div className="w-full max-w-[400px]">
          {/* Small picture for phones and tablets, where the left panel is hidden */}
          <Image
            src={RESET_IMAGE}
            alt=""
            width={256}
            height={256}
            priority
            className="mx-auto mb-4 h-auto w-36 sm:w-44 lg:hidden drop-shadow-[0_0_24px_rgba(125,211,252,0.45)]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-bold tracking-tight text-white mb-2 outline-none"
          >
            {submitted ? "Check your email" : "Reset your password"}
          </h1>

          {!submitted ? (
            <>
              <p className="text-base text-slate-300 mb-6 leading-relaxed">
                Enter your matric number or staff email and we&apos;ll send you instructions to
                reset your password.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="identifier" className="text-sm font-medium text-slate-100 block">
                    Matric number or staff email{" "}
                    <span className="text-rose-300" aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="identifier"
                    name="username"
                    required
                    placeholder="e.g. CSC/2022/305 or name@lasustech.edu.ng"
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