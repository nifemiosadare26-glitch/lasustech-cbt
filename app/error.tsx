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

  const handleRecover = () => {
    try {
      localStorage.setItem("lasustech_role", "STUDENT");
      localStorage.setItem("lasustech_user_name", "Nifemi Osadare");
      localStorage.setItem("accessToken", "lasu_live_token_student_" + Date.now());
      document.cookie = "role=student; path=/; SameSite=Lax";
    } catch {}
    reset();
    window.location.assign("/student");
  };

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

      <div className="relative z-10 w-full max-w-[500px]">
        <div className="mx-auto mb-6 flex h-20 w-20 sm:h-24 sm:w-24 items-center justify-center rounded-3xl bg-linear-to-br from-rose-500/20 to-amber-400/10 border border-rose-400/30 shadow-[0_0_40px_rgba(251,113,133,0.25)] backdrop-blur-md">
          <AlertTriangle className="h-10 w-10 sm:h-12 sm:w-12 text-rose-400 drop-shadow-[0_0_12px_rgba(251,113,133,0.5)]" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2 text-balance">
          Something went wrong
        </h1>

        <p className="mx-auto max-w-[420px] text-sm sm:text-base text-slate-300 mb-6 leading-relaxed text-pretty">
          We encountered an issue while loading this page. Click below to refresh your session or return to the student portal.
        </p>

        {error?.message && (
          <div className="mb-6 p-3 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs font-mono text-left max-h-24 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
          <button
            type="button"
            onClick={handleRecover}
            className="inline-flex items-center justify-center gap-2 min-h-11 rounded-full bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-blue-500 focus-visible:outline-none cursor-pointer"
          >
            <RefreshCw size={16} aria-hidden="true" />
            Reload Student Portal
          </button>

          <Link
            href="/login"
            className="inline-flex items-center justify-center min-h-11 rounded-full border border-white/20 bg-white/5 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none cursor-pointer"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
