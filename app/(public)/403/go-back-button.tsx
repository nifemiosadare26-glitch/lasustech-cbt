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
      className="inline-flex items-center justify-center gap-2 min-h-12 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold border-2 border-slate-600 px-6 text-sm transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
    >
      <ArrowLeft size={17} aria-hidden="true" />
      Go Back
    </button>
  );
}
