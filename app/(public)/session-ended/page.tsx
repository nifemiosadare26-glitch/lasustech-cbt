import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { LogIn } from "lucide-react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Server component, so the browser tab gets a real title.
export const metadata: Metadata = {
  title: "Signed out | LASUSTECH CBT",
  robots: { index: false, follow: false },
};

export default function SessionEndedPage() {
  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-[#081229] overflow-hidden px-4 py-8 text-center`}
    >
      {/* Same blue glow as the other pages */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#14285a_0%,_#081229_60%)]"
      />

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Illustration on plain navy (no tile). File location: public/info7.png.
            alt="" because the text below says it all. */}
        <Image
          src="/info7.png"
          alt=""
          width={288}
          height={288}
          priority
          className="mx-auto mb-4 h-auto w-52 sm:w-64 md:w-72 drop-shadow-[0_0_28px_rgba(125,211,252,0.45)]"
        />

        <p className="inline-flex items-center rounded-full border border-sky-300/30 bg-sky-400/10 px-3 py-1 text-sm font-medium text-sky-200 mb-4">
          Signed out
        </p>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
          Your session has ended
        </h1>

        <p className="mx-auto max-w-[400px] text-base sm:text-lg text-slate-300 mb-9 leading-relaxed text-pretty">
          You&apos;ve been signed out securely. If you&apos;re on a shared or public computer, close
          this browser window before you leave.
        </p>

        <Link
          href="/login"
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 min-h-12 rounded-full bg-white px-8 text-base font-semibold text-[#081229] shadow-[0_6px_20px_rgba(255,255,255,0.15)] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
        >
          <LogIn size={18} aria-hidden="true" />
          Sign in again
        </Link>

        <p className="mt-8 text-sm text-slate-300">
          Didn&apos;t sign out yourself?{" "}
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