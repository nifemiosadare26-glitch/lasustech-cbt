"use client";

import * as React from "react";
import type { Me } from "@/lib/me";
import type { UiRole } from "@/lib/roles";

/**
 * The signed-in user, published by RoleGuard once /me has answered and the role
 * check has passed. Layouts gate on this, and the shell reads it, so the account
 * is fetched exactly once per page rather than once per consumer.
 */
export type SessionUser = { me: Me; uiRole: UiRole };

const UserContext = React.createContext<SessionUser | null>(null);

export const UserContextProvider = UserContext.Provider;

/**
 * `null` outside a guarded area. The shell is also used by public-ish screens
 * (403, session-ended) that legitimately have no user, so callers must handle it
 * rather than throwing.
 */
export function useUser(): SessionUser | null {
  return React.useContext(UserContext);
}

/** Two-letter monogram for the avatar, e.g. "Nifemi Osadare" -> "NO". */
export function initialsOf(names: string): string {
  const parts = names.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}
