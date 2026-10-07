"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Inter } from "next/font/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const inter = Inter({ subsets: ["latin"], display: "swap" });

const SCHOOL_NAME = "Lagos State University of Science and Technology";

// One place to change the picture. File must be at public/info4.png
const SETUP_IMAGE = "/info4.png";

// Dark input that survives Chrome autofill (same as the login page)
const inputClass = [
  "h-12 rounded-lg text-base font-mono tracking-wider",
  "!bg-[#0f1d3d] border border-white/30 text-white placeholder:text-slate-400 placeholder:font-sans placeholder:tracking-normal",
  "focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:border-sky-400",
  "[&:-webkit-autofill]:shadow-[inset_0_0_0_1000px_#0f1d3d]",
  "[&:-webkit-autofill]:[-webkit-text-fill-color:#ffffff]",
  "[&:-webkit-autofill]:caret-white",
].join(" ");

export default function AccountSetupPage() {
  const [step, setStep] = React.useState<1 | 2>(1);
  const [code, setCode] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const headingRef = React.useRef<HTMLHeadingElement>(null);

  // Move focus to the heading when the step changes so keyboard/screen-reader users notice
  React.useEffect(() => {
    if (step === 2) headingRef.current?.focus();
  }, [step]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setError(null);
    setIsLoading(true);

    try {
      // Backend connection template
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "That code isn't valid or has already been used.");
      }

      setStep(2);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during verification.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={`${inter.className} min-h-dvh grid lg:grid-cols-2 bg-[#081229]`}>
      {/* LEFT: picture panel (desktop only) */}
      <section
        aria-hidden="true"
        className="relative hidden lg:flex flex-col items-center justify-center overflow-hidden px-6 py-10 text-center bg-[radial-gradient(ellipse_at_center,_#14285a_0%,_#081229_70%)]"
      >
        <Image
          src={SETUP_IMAGE}
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
            src={SETUP_IMAGE}
            alt=""
            width={256}
            height={256}
            priority
            className="mx-auto mb-4 h-auto w-36 sm:w-44 lg:hidden drop-shadow-[0_0_24px_rgba(125,211,252,0.45)]"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />

          <p className="inline-flex items-center rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-sm font-medium text-sky-200 mb-3">
            Step {step} of 2
          </p>

          <h1
            ref={headingRef}
            tabIndex={-1}
            className="text-3xl font-bold tracking-tight text-white mb-2 outline-none"
          >
            Account setup
          </h1>

          {step === 1 ? (
            <>
              <p className="text-base text-slate-300 mb-6 leading-relaxed">
                Welcome to the LASUSTECH CBT platform. Verify your identity with your admission or
                staff clearance code.
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="clearance-code" className="text-sm font-medium text-slate-100 block">
                    Clearance code{" "}
                    <span className="text-rose-300" aria-hidden="true">*</span>
                  </label>
                  <Input
                    id="clearance-code"
                    name="clearance-code"
                    required
                    placeholder="e.g. LST-2026-XYZ"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    autoComplete="off"
                    autoCapitalize="characters"
                    autoCorrect="off"
                    spellCheck={false}
                    aria-invalid={!!error}
                    aria-describedby={error ? "code-error" : "code-help"}
                    className={inputClass}
                  />
                  <p id="code-help" className="text-sm text-slate-300">
                    Can&apos;t find your code?{" "}
                    <Link
                      href="/support"
                      className="text-sky-300 underline underline-offset-4 hover:text-white rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                    >
                      Contact ICT Support
                    </Link>
                  </p>
                </div>

                {error && (
                  <div
                    id="code-error"
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
                      Verifying…
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      Verify code
                      <ArrowRight size={16} aria-hidden="true" />
                    </span>
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div aria-live="polite">
              <div className="flex items-center gap-3 rounded-lg border border-emerald-300/30 bg-emerald-400/10 p-4 my-5">
                <CheckCircle2 size={24} className="shrink-0 text-emerald-300" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-white">Code verified</p>
                  <p className="text-sm text-emerald-100">Your account is linked to your profile.</p>
                </div>
              </div>

              <p className="text-base text-slate-300 mb-6 leading-relaxed">
                Your account is activated. Continue to the login page to open your dashboard.
              </p>

              <Link
                href="/login"
                className="inline-flex w-full items-center justify-center min-h-12 rounded-lg bg-white px-6 text-sm font-semibold text-[#081229] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1733]"
              >
                Continue to login
              </Link>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}