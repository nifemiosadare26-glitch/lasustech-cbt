import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { Inter } from "next/font/google";
import { GoBackButton } from "./go-back-button";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Server component, so the browser tab gets a real title.
export const metadata: Metadata = {
  title: "Access denied | LASUSTECH CBT",
  robots: { index: false, follow: false },
};

const ROLE_HOME: Record<string, string> = {
  admin: "/admin",
  lecturer: "/lecturer",
  officer: "/officer",
  invigilator: "/invigilator",
  student: "/student",
};

// Backend connection template for getting role
async function getRole(): Promise<string | null> {
  const store = await cookies();
  return store.get("role")?.value ?? null;
}

export default async function ForbiddenPage() {
  const role = await getRole();
  const homeHref = role ? ROLE_HOME[role] : undefined;

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
        {/* Illustration on plain navy (no tile). File location: public/logo2.png.
            alt="" because the text below says it all. */}
        <Image
          src="/info2.png"
          alt=""
          width={288}
          height={288}
          priority
          className="mx-auto mb-4 h-auto w-52 sm:w-64 md:w-72 drop-shadow-[0_0_28px_rgba(125,211,252,0.45)]"
        />

        

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