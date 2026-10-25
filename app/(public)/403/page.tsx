import type { Metadata } from "next";
import Link from "next/link";
import { ShieldAlert, LogIn } from "lucide-react";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { GoBackButton } from "./go-back-button";
import { homeForRole } from "@/lib/roles";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Access Denied | LASUSTECH CBT",
  robots: { index: false, follow: false },
};

async function getRole(): Promise<string | null> {
  const store = await cookies();
  return store.get("role")?.value ?? null;
}

export default async function ForbiddenPage() {
  const role = await getRole();
  const homeHref = role ? homeForRole(role) : undefined;

  return (
    <main
      className={`${inter.className} min-h-dvh relative flex items-center justify-center bg-slate-950 overflow-hidden px-4 py-12 text-center selection:bg-amber-500 selection:text-black`}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_rgba(217,119,6,0.2)_0%,_rgba(2,6,23,0.95)_75%)]"
      />

      <div className="relative z-10 w-full max-w-[500px]">
        <div className="rounded-3xl border-2 border-slate-700 bg-slate-900/95 p-8 sm:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400">
              LASUSTECH CBT Portal
            </span>
          </div>

          <div className="mx-auto mb-6 flex h-24 w-24 sm:h-28 sm:w-28 items-center justify-center rounded-3xl bg-amber-500/15 border-2 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.35)]">
            <ShieldAlert className="h-12 w-12 sm:h-14 sm:w-14 text-amber-300 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]" />
          </div>

          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/40 bg-amber-950/60 px-3.5 py-1 text-xs font-bold text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            Security Notice (403)
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-3 text-balance">
            Access Restricted
          </h1>

          <p className="text-base sm:text-lg font-medium text-slate-200 mb-6 leading-relaxed">
            You do not have the necessary institutional credentials or role permissions to view this resource.
          </p>

          <div className="flex flex-col-reverse sm:flex-row items-stretch justify-center gap-3">
            <GoBackButton fallbackHref={homeHref ?? "/login"} />

            <Link
              href={homeHref ?? "/login"}
              className="inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-bold px-6 text-sm shadow-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
            >
              <LogIn size={17} aria-hidden="true" />
              {homeHref ? "Go to Dashboard" : "Sign In to Portal"}
            </Link>
          </div>
        </div>

        <p className="mt-6 text-xs font-medium text-slate-500">
          Need access to an examination?{" "}
          <Link href="/support" className="text-blue-400 hover:text-blue-300 underline font-semibold">
            Contact ICT Support Desk
          </Link>
        </p>
      </div>
    </main>
  );
}
