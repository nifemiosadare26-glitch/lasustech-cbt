"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useRoleTheme } from "@/components/role-theme";
import { cn } from "@/lib/utils";

/**
 * Icon button that flips the surrounding scope between light and dark.
 *
 * Which icon shows is decided by CSS (`dark:hidden` / `hidden dark:block`) rather
 * than by React state, so the correct one is painted by the boot script's class
 * before hydration instead of snapping over afterwards.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useRoleTheme();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "text-gray-500 hover:text-gray-900 transition-colors cursor-pointer p-1 rounded-md",
        className,
      )}
    >
      {/* Sun = the mode you are in; Moon = the mode you would switch to. */}
      <Sun size={20} className="hidden dark:block" aria-hidden />
      <Moon size={20} className="block dark:hidden" aria-hidden />
    </button>
  );
}
