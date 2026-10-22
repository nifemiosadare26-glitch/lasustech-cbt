import { RoleKey } from "./roles";
import { apiClient } from "./apiClient";

export type Me = {
  id: string;
  names: string;
  email: string | null;
  identifier: string;
  primaryRole: RoleKey;
  roles: RoleKey[];
};

let cachedMe: Promise<Me> | null = null;

export function getMe(): Promise<Me> {
  if (cachedMe) return cachedMe;
  const promise = apiClient("/me").then((r) => r.data as Me);
  cachedMe = promise.catch((err) => {
    cachedMe = null;
    throw err;
  });
  return cachedMe;
}

export function clearMe(): void {
  cachedMe = null;
}

/**
 * End the current user's session cleanly.
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
    localStorage.removeItem("refreshToken");
  } catch {
    /* Storage blocked; nothing to clear. */
  }

  clearMe();
  // Matches the hint RoleGuard sets, so /403 stops offering a stale dashboard.
  document.cookie = "role=; path=/; Max-Age=0; SameSite=Lax";
}
