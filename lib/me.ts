
import { apiClient } from "./apiClient";

export interface Me {
  id: string;
  names: string;
  roles: string[];
  primaryRole: string;
  email: string | null;
  matricNo: string | null;
  staffId: string | null;
}

let cache: { at: number; promise: Promise<Me> } | null = null;

export function getMe(force = false): Promise<Me> {
  if (!force && cache && Date.now() - cache.at < 60_000) return cache.promise;
  const promise = apiClient("/me").then((r) => r.data as Me);
  cache = { at: Date.now(), promise };
  promise.catch(() => { if (cache?.promise === promise) cache = null; });
  return promise;
}

export const clearMe = () => { cache = null; };

/**
 * Ends the session everywhere it is recorded on this device.
 *
 * The API call comes first because it revokes the refresh-token session in the
 * database — that is the part that actually stops the account being usable. If it
 * fails (offline, or the token already expired) we still drop the local copy:
 * refusing to sign someone out because the network is down would be worse.
 */
export async function signOut(): Promise<void> {
  try {
    await apiClient("/auth/logout", { method: "POST" });
  } catch {
    /* Local state is cleared below regardless. */
  }

  try {
    localStorage.removeItem("accessToken");
  } catch {
    /* Storage blocked; nothing to clear. */
  }

  clearMe();
  // Matches the hint RoleGuard sets, so /403 stops offering a stale dashboard.
  document.cookie = "role=; path=/; Max-Age=0; SameSite=Lax";
}