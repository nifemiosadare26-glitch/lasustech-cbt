"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export default function NotFoundPage() {
  const router = useRouter();

  // history.back() does nothing if the page was opened directly (new tab, pasted link)
  const handleBack = () => {
    if (window.history.length > 1) router.back();
    else router.push("/");
  };

  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-[#081229] overflow-hidden px-4 py-8 text-center`}
    >
      {/* Same blue glow as the login page, so every screen feels like one product */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#14285a_0%,_#081229_60%)]"
      />

      {/* Decorative ghost number, hidden from screen readers */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 select-none pointer-events-none font-extrabold tracking-tighter leading-none text-[11rem] sm:text-[17rem] md:text-[22rem] text-white/[0.04]"
      >
        404
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Illustration on the plain navy background (no tile).
            The soft sky-blue drop-shadow outlines the dark artwork so it stays visible.
            File location: public/info1.png. alt="" because the text below says it all. */}
        <Image
          src="/info1.png"
          alt=""
          width={288}
          height={288}
          priority
          className="mx-auto mb-4 h-auto w-52 sm:w-64 md:w-72 drop-shadow-[0_0_28px_rgba(125,211,252,0.45)]"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
          Page not found
        </h1>

        <p className="mx-auto max-w-[380px] text-base sm:text-lg text-slate-300 mb-9 leading-relaxed text-pretty">
          We looked everywhere, but we couldn&apos;t find the page you are looking for.
        </p>

        <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center justify-center min-h-12 rounded-full bg-white px-7 text-base font-semibold text-[#081229] shadow-[0_6px_20px_rgba(255,255,255,0.15)] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            Back to homepage
          </Link>

          <button
            type="button"
            onClick={handleBack}
            className="inline-flex items-center justify-center gap-2 min-h-12 rounded-full border border-white/30 bg-white/5 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            <ArrowLeft size={18} aria-hidden="true" />
            Go back
          </button>
        </div>

        <p className="mt-8 text-sm text-slate-300">
          Still stuck?{" "}
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