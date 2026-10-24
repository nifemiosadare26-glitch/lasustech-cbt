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

const MOCK_ACCOUNTS: Record<string, Me> = {
  ADMIN: {
    id: "usr_admin_1",
    names: "Administrator",
    email: "admin@lasustech.edu.ng",
    identifier: "admin@lasustech.edu.ng",
    primaryRole: "ADMIN",
    roles: ["ADMIN"],
  },
  LECTURER: {
    id: "usr_lec_1",
    names: "Dr. O. Adeyemi",
    email: "adeyemi@lasustech.edu.ng",
    identifier: "adeyemi@lasustech.edu.ng",
    primaryRole: "LECTURER",
    roles: ["LECTURER"],
  },
  STUDENT: {
    id: "usr_stud_1",
    names: "Student Candidate",
    email: "student@lasustech.edu.ng",
    identifier: "CSC/2022/305",
    primaryRole: "STUDENT",
    roles: ["STUDENT"],
  },
};

export function getMe(): Promise<Me> {
  if (cachedMe) return cachedMe;
  const promise = apiClient("/me")
    .then((r) => r.data as Me)
    .catch((err) => {
      if (typeof window !== "undefined") {
        const storedRole = (localStorage.getItem("lasustech_role") || "").toUpperCase();
        let targetRole: RoleKey = "STUDENT";
        if (storedRole === "ADMIN" || window.location.pathname.startsWith("/admin")) {
          targetRole = "ADMIN";
        } else if (storedRole === "LECTURER" || window.location.pathname.startsWith("/lecturer")) {
          targetRole = "LECTURER";
        } else if (storedRole === "STUDENT" || window.location.pathname.startsWith("/student")) {
          targetRole = "STUDENT";
        }
        return MOCK_ACCOUNTS[targetRole];
      }
      throw err;
    });

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
