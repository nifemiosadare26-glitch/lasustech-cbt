"use client";

import Link from "next/link";
import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

/*
 * OPTIONAL: set this when you know the real time, e.g. "Saturday, 10 Oct, 6:00 PM".
 * Leave it empty and the page shows no time (never promise a time you can't keep).
 */
const EXPECTED_BACK = "";

export default function MaintenancePage() {
  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-[#081229] overflow-hidden px-4 py-8 text-center`}
    >
      {/* Same blue glow as login, 403, 404 and 500 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#14285a_0%,_#081229_60%)]"
      />

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Illustration on plain navy (no tile). File location: public/info5.png.
            alt="" because the text below says it all. */}
        <Image
          src="/info5.png"
          alt=""
          width={288}
          height={288}
          priority
          className="mx-auto mb-4 h-auto w-52 sm:w-64 md:w-72 drop-shadow-[0_0_28px_rgba(125,211,252,0.45)]"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        {/* Amber badge: planned work, not a failure */}
        <p className="inline-flex items-center rounded-full border border-amber-300/30 bg-amber-400/10 px-3 py-1 text-sm font-medium text-amber-200 mb-4">
          Scheduled maintenance
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
          We&apos;ll be back soon
        </h1>

        <p className="mx-auto max-w-[400px] text-base sm:text-lg text-slate-300 mb-4 leading-relaxed text-pretty">
          The LASUSTECH CBT platform is down for maintenance and improvements. Thank you for your
          patience.
        </p>

        {EXPECTED_BACK && (
          <p className="mx-auto max-w-[400px] text-base text-sky-200 mb-4">
            Expected back: <span className="font-semibold text-white">{EXPECTED_BACK}</span>
          </p>
        )}

        <p className="mx-auto max-w-[400px] text-sm sm:text-base text-slate-300 mb-9">
          Have an exam scheduled? Contact ICT Support so they can guide you.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 min-h-12 rounded-full bg-white px-7 text-base font-semibold text-[#081229] shadow-[0_6px_20px_rgba(255,255,255,0.15)] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Check again
          </button>

          <Link
            href="/support"
            className="inline-flex items-center justify-center min-h-12 rounded-full border border-white/30 bg-white/5 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            Contact ICT Support
          </Link>
        </div>
      </div>
    </main>
  );
}