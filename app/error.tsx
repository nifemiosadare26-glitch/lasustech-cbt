"use client";

import * as React from "react";
import Link from "next/link";
import { RefreshCw, AlertTriangle } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Application error boundary caught:", error);
  }, [error]);

  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-[#081229] overflow-hidden px-4 py-8 text-center`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#14285a_0%,_#081229_60%)]"
      />

      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 select-none pointer-events-none font-extrabold tracking-tighter leading-none text-[11rem] sm:text-[17rem] md:text-[22rem] text-white/[0.04]"
      >
        500
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        <div className="mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500/20 to-amber-400/10 border border-rose-400/30 shadow-[0_0_40px_rgba(251,113,133,0.25)] backdrop-blur-md">
          <AlertTriangle className="h-12 w-12 sm:h-14 sm:w-14 text-rose-400 drop-shadow-[0_0_12px_rgba(251,113,133,0.5)]" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
          Something went wrong
        </h1>

        <p className="mx-auto max-w-[400px] text-base sm:text-lg text-slate-300 mb-9 leading-relaxed text-pretty">
          We encountered an unexpected issue while loading this page. Please try again or return to the main portal.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 min-h-12 rounded-full bg-white px-7 text-base font-semibold text-[#081229] shadow-[0_6px_20px_rgba(255,255,255,0.15)] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Try again
          </button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center min-h-12 rounded-full border border-white/30 bg-white/5 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
