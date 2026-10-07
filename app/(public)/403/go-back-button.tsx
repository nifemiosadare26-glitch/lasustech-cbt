"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

/**
 * Goes back if there is history to go back to.
 * If the page was opened directly (new tab, pasted link), history.back()
 * does nothing, so we fall back to the given href instead.
 */
export function GoBackButton({ fallbackHref }: { fallbackHref: string }) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) router.back();
    else router.push(fallbackHref);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="inline-flex items-center justify-center gap-2 min-h-12 rounded-full border border-white/30 bg-white/5 px-7 text-base font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#081229]"
    >
      <ArrowLeft size={18} aria-hidden="true" />
      Go back
    </button>
  );
}