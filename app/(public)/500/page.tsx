"use client";

import Link from "next/link";
import { RefreshCw, AlertTriangle, Home } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function ServerErrorPage() {
  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-slate-950 overflow-hidden px-4 py-12 text-center selection:bg-rose-500 selection:text-white`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(225,29,72,0.25)_0%,_rgba(2,6,23,0.95)_75%)]"
      />

      <div className="relative z-10 w-full max-w-[500px]">
        <div className="rounded-3xl border-2 border-slate-700 bg-slate-900/95 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              LASUSTECH CBT Portal
            </span>
          </div>

          <div className="mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-rose-500/15 border-2 border-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.35)]">
            <AlertTriangle className="h-12 w-12 sm:h-14 sm:w-14 text-rose-300 drop-shadow-[0_2px_8px_rgba(244,63,94,0.6)]" />
          </div>

          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-rose-400/40 bg-rose-950/60 px-3.5 py-1 text-xs font-bold text-rose-300">
            <span className="h-2 w-2 rounded-full bg-rose-400" />
            Server Error (500)
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 text-balance">
            Internal Server Error
          </h1>

          <p className="text-base sm:text-lg font-medium text-slate-200 mb-6 leading-relaxed">
            The server encountered a temporary issue while fulfilling your request. All user sessions and exam data are preserved.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 text-sm shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <RefreshCw size={17} className="stroke-[2.5]" aria-hidden="true" />
              Reload Page
            </button>

            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold border-2 border-slate-600 px-6 text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400"
            >
              <Home size={17} aria-hidden="true" />
              Back to Home
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs font-medium text-slate-500">
          Still encountering this issue?{" "}
          <Link href="/support" className="text-blue-400 hover:text-blue-300 underline font-semibold">
            Contact ICT Support Desk
          </Link>
        </p>
      </div>
    </main>
  );
}
