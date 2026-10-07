"use client";

import Link from "next/link";
import Image from "next/image";
import { RefreshCw } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function ServerErrorPage() {
  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-[#081229] overflow-hidden px-4 py-8 text-center`}
    >
      {/* Same blue glow as login, 403 and 404 */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#14285a_0%,_#081229_60%)]"
      />

      {/* Decorative ghost number, hidden from screen readers */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 select-none pointer-events-none font-extrabold tracking-tighter leading-none text-[11rem] sm:text-[17rem] md:text-[22rem] text-white/[0.04]"
      >
        500
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Illustration on plain navy (no tile). File location: public/info3.png.
            Soft rose glow signals "something broke" without changing the page theme.
            alt="" because the text below says it all. */}
        <Image
          src="/info3.png"
          alt=""
          width={288}
          height={288}
          priority
          className="mx-auto mb-4 h-auto w-52 sm:w-64 md:w-72 drop-shadow-[0_0_28px_rgba(251,113,133,0.4)]"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
          Something went wrong
        </h1>

        {/* Only promise what is true. Add "our team has been notified"
            only if you really have error logging/alerts set up. */}
        <p className="mx-auto max-w-[400px] text-base sm:text-lg text-slate-300 mb-9 leading-relaxed text-pretty">
          We hit an unexpected problem on our side. Please try again in a moment.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex items-center justify-center gap-2 min-h-12 rounded-full bg-white px-7 text-base font-semibold text-[#081229] shadow-[0_6px_20px_rgba(255,255,255,0.15)] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            <RefreshCw size={18} aria-hidden="true" />
            Try again
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-12 rounded-full border border-white/30 bg-white/5 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            Back to homepage
          </Link>
        </div>

        <p className="mt-8 text-sm text-slate-300">
          Still happening?{" "}
          <Link
            href="/support"
            className="text-sky-300 underline underline-offset-4 hover:text-white rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            Contact ICT Support
          </Link>
        </p>
      </div>
    </main>
  );
}