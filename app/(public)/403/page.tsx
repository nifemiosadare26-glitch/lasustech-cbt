import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert } from "lucide-react";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { GoBackButton } from "./go-back-button";
import { homeForRole } from "@/lib/roles";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Server component, so the browser tab gets a real title.
export const metadata: Metadata = {
  title: "Access denied | LASUSTECH CBT",
  robots: { index: false, follow: false },
};

// The `role` cookie is the non-sensitive hint RoleGuard sets on a successful
// check. The dashboard it maps to comes from lib/roles.ts, so this page and the
// sign-in redirect can never disagree — the previous local map pointed officers
// and invigilators at /officer and /invigilator, neither of which exists.
async function getRole(): Promise<string | null> {
  const store = await cookies();
  return store.get("role")?.value ?? null;
}

export default async function ForbiddenPage() {
  const role = await getRole();
  const homeHref = role ? homeForRole(role) : undefined;

  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-[#081229] overflow-hidden px-4 py-8 text-center`}
    >
      {/* Same blue glow as the login and 404 pages */}
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_#14285a_0%,_#081229_60%)]"
      />

      {/* Decorative ghost number, hidden from screen readers */}
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 select-none pointer-events-none font-extrabold tracking-tighter leading-none text-[11rem] sm:text-[17rem] md:text-[22rem] text-white/[0.04]"
      >
        403
      </div>

      <div className="relative z-10 w-full max-w-[460px]">
        {/* Institutional emblem */}
        <div className="mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/20 to-rose-400/10 border border-amber-400/30 shadow-[0_0_40px_rgba(245,158,11,0.25)] backdrop-blur-md">
          <ShieldAlert className="h-12 w-12 sm:h-14 sm:w-14 text-amber-400 drop-shadow-[0_0_12px_rgba(245,158,11,0.5)]" />
        </div>

        

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-3 text-balance">
          Access denied
        </h1>

        <p className="mx-auto max-w-[400px] text-base sm:text-lg text-slate-300 mb-9 leading-relaxed text-pretty">
          You don&apos;t have permission to view this page. If you think this is a mistake,{" "}
          <Link
            href="/support"
            className="text-sky-300 underline underline-offset-4 hover:text-white rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
          >
            contact ICT Support
          </Link>
          .
        </p>

        <div className="flex flex-col-reverse sm:flex-row items-stretch justify-center gap-3">
          <GoBackButton fallbackHref={homeHref ?? "/login"} />

          <Link
            href={homeHref ?? "/login"}
            className="inline-flex items-center justify-center min-h-12 rounded-full bg-white px-7 text-base font-semibold text-[#081229] shadow-[0_6px_20px_rgba(255,255,255,0.15)] transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
          >
            {homeHref ? "Go to my dashboard" : "Back to sign in"}
          </Link>
        </div>
      </div>
    </main>
  );
}