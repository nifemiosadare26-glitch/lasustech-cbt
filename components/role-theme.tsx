"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export type ThemeRole = "admin" | "student" | "lecturer";
export type RoleTheme = "light" | "dark";

/**
 * A *scope* is who shares a preference, which is not the same question as who is
 * looking at the screen. The admin's choice governs the student portal too — one
 * institution-wide look — while the lecturer keeps a private one that the admin
 * cannot reach.
 */
export type ThemeScope = "site" | "student" | "lecturer";

const ROLE_SCOPE: Record<ThemeRole, ThemeScope> = {
  admin: "site",
  student: "student",
  lecturer: "lecturer",
};

/** Namespaced so it cannot collide with the `accessToken` key in lib/apiClient.ts. */
const STORAGE_PREFIX = "lasustech-theme:";

const STORAGE_KEYS: Record<ThemeScope, string[]> = {
  site: [STORAGE_PREFIX + "site", STORAGE_PREFIX + "admin"],
  student: [STORAGE_PREFIX + "student", STORAGE_PREFIX + "site", STORAGE_PREFIX + "admin"],
  lecturer: [STORAGE_PREFIX + "lecturer"],
};

/**
 * The device's own preference, consulted only when no key holds a value — and
 * also when storage is unreadable, since from here "cannot read a preference"
 * and "no preference stored" are the same situation.
 *
 * This is a *fallback*, never a setting. An explicit choice always wins, and the
 * admin's `site` scope still governs the student portal; this only decides the
 * case where nobody has chosen, so an unset portal follows the device instead of
 * forcing light on a visitor whose OS is dark. Because nothing offers it as a
 * choice, no picker needs a "System" option kept in sync — the resolved theme is
 * always "light" or "dark", which is what the pickers compare `aria-pressed`
 * against.
 *
 * Read once per mount, so an OS change mid-session lands on the next load; a
 * `matchMedia` change listener would be needed to follow it live.
 */
function preferredTheme(): RoleTheme {
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    /* No matchMedia — a very old browser. Light is the CSS default anyway. */
    return "light";
  }
}

/** The client-side half of BOOT_SCRIPT; the two must agree on every key. */
function readStoredTheme(keys: string[]): RoleTheme {
  try {
    for (const key of keys) {
      const value = window.localStorage.getItem(key);
      if (value === "dark") return "dark";
      if (value === "light") return "light";
    }
  } catch {
    /* Private mode or blocked storage. Nothing readable is the same as nothing
       set, so this falls through to the device rather than short-circuiting. */
  }
  return preferredTheme();
}

type RoleThemeContextValue = {
  /** `null` until mounted, so the server and the first client render agree. */
  theme: RoleTheme | null;
  setTheme: (theme: RoleTheme) => void;
};

const RoleThemeContext = React.createContext<RoleThemeContextValue>({
  theme: null,
  setTheme: () => {},
});

export function useRoleTheme() {
  return React.useContext(RoleThemeContext);
}

/**
 * Gives one *scope* a light/dark preference, scoped to this subtree.
 *
 * The theme class lands on the wrapper element rather than `<html>`, which is
 * what keeps a dark admin dashboard from bleeding onto the public login page and
 * what lets the lecturer sit on a private preference while the rest of the
 * portals share the admin's.
 */
export function RoleThemeProvider({
  role,
  children,
  className,
}: {
  role: ThemeRole;
  children: React.ReactNode;
  /**
   * Replaces the default `contents` wrapper classes. Pass the element's own
   * layout classes when the provider *is* the layout element — e.g. the student
   * exam branch, which renders outside AppShell and is its own scroller.
   */
  className?: string;
}) {
  const scope = ROLE_SCOPE[role];
  const keys = STORAGE_KEYS[scope];
  const [theme, setThemeState] = React.useState<RoleTheme | null>(null);

  React.useEffect(() => {
    const initialTheme = readStoredTheme(keys);
    setThemeState(initialTheme);

    // Synchronize HTML element class and color-scheme
    if (typeof document !== "undefined") {
      if (initialTheme === "dark") {
        document.documentElement.classList.add("dark");
        document.documentElement.style.colorScheme = "dark";
      } else {
        document.documentElement.classList.remove("dark");
        document.documentElement.style.colorScheme = "light";
      }
    }

    // When the same scope is open in another tab — the student portal beside the
    // admin dashboard — follow the change instead of waiting for a reload.
    const onStorage = (event: StorageEvent) => {
      if (!event.key || !keys.includes(event.key)) return;
      const nextTheme = readStoredTheme(keys);
      setThemeState(nextTheme);
      if (typeof document !== "undefined") {
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [keys]);

  const setTheme = React.useCallback(
    (next: RoleTheme) => {
      setThemeState(next);
      if (typeof document !== "undefined") {
        if (next === "dark") {
          document.documentElement.classList.add("dark");
          document.documentElement.style.colorScheme = "dark";
        } else {
          document.documentElement.classList.remove("dark");
          document.documentElement.style.colorScheme = "light";
        }
      }
      try {
        window.localStorage.setItem(keys[0], next);
      } catch {
        /* Private mode or blocked storage. The choice still applies for this
           page view; it just will not survive a reload. */
      }
    },
    [keys],
  );

  const value = React.useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return (
    <RoleThemeContext.Provider value={value}>
      <div
        data-role-theme={role}
        data-theme-scope={scope}
        suppressHydrationWarning
        className={cn(className ?? "contents", theme === "dark" && "dark")}
      >
        {children}
      </div>
    </RoleThemeContext.Provider>
  );
}
