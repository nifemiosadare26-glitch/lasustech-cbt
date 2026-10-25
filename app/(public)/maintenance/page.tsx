"use client";

import Link from "next/link";
import { Wrench, RefreshCw, LifeBuoy } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function MaintenancePage() {
  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-slate-950 overflow-hidden px-4 py-12 text-center selection:bg-amber-500 selection:text-black`}
    >
      {/* High-contrast ambient background glow */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(30,58,138,0.35)_0%,_rgba(2,6,23,0.95)_75%)]"
      />

      <div className="relative z-10 w-full max-w-[500px]">
        {/* High-contrast card container */}
        <div className="rounded-3xl border-2 border-slate-700 bg-slate-900/95 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          {/* Institution Header Tag */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              LASUSTECH CBT Portal
            </span>
          </div>

          {/* Institutional Maintenance Emblem */}
          <div className="mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-amber-500/15 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)]">
            <Wrench className="h-12 w-12 sm:h-14 sm:w-14 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]" />
          </div>

          {/* Status Badge */}
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-950/60 px-3.5 py-1 text-xs font-bold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            System Maintenance in Progress
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 text-balance">
            We&apos;ll be back shortly
          </h1>

          {/* Description with crisp contrast */}
          <p className="text-base sm:text-lg font-medium text-slate-200 mb-4 leading-relaxed">
            The Computer-Based Testing portal is temporarily offline for scheduled system optimization and upgrades.
          </p>

          <p className="text-sm font-medium text-slate-400 mb-8">
            All submitted candidate answers and exam records are securely preserved.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 text-sm shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <RefreshCw size={17} className="stroke-[2.5]" aria-hidden="true" />
              Check Status Again
            </button>

            <Link
              href="/support"
              className="inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold border-2 border-slate-600 px-6 text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <LifeBuoy size={17} aria-hidden="true" />
              Contact ICT Support
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs font-medium text-slate-500">
          Lagos State University of Science and Technology • Academic Computing Services
        </p>
      </div>
    </main>
  );
}
