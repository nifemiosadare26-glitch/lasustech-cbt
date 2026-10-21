/**
 * Role keys exactly as the API names them (`RoleKey` in apps/api/src/modules/auth/tokens.ts),
 * plus where each role lands after signing in.
 *
 * The institution has exactly three roles at every layer. Exam-office and
 * invigilation duties are capabilities of ADMIN/LECTURER, not separate
 * identities.
 *
 * `ROLE_KEYS` is ordered to mirror the API's `ROLE_PRIORITY`, which is what
 * decides the dashboard for someone holding more than one role. Keep the two
 * in step.
 */

export const ROLE_KEYS = ["ADMIN", "LECTURER", "STUDENT"] as const;

export type RoleKey = (typeof ROLE_KEYS)[number];

/** Lowercase role names the sidebar and theme provider are keyed on. */
export type UiRole = "admin" | "lecturer" | "student";

const UI_ROLE: Record<RoleKey, UiRole> = {
  ADMIN: "admin",
  LECTURER: "lecturer",
  STUDENT: "student",
};

const HOME: Record<RoleKey, string> = {
  ADMIN: "/admin",
  LECTURER: "/lecturer",
  STUDENT: "/student",
};

/** Human labels, matching the `name` on each Role row in the seed. */
const LABEL: Record<RoleKey, string> = {
  ADMIN: "System Administrator",
  LECTURER: "Lecturer",
  STUDENT: "Student",
};

const asKey = (role: string | null | undefined) =>
  ROLE_KEYS.find((k) => k === (role ?? "").toUpperCase());

export function roleLabel(role: string | null | undefined): string {
  const key = asKey(role);
  return key ? LABEL[key] : "Unknown role";
}

/** Highest-priority role held, matching the API's own precedence. */
export function primaryRole(roles: string[]): RoleKey | null {
  return ROLE_KEYS.find((k) => roles.includes(k)) ?? null;
}

export function homeForRole(role: string | null | undefined): string {
  const key = asKey(role);
  return key ? HOME[key] : "/login";
}

export function toUiRole(role: string | null | undefined): UiRole | null {
  const key = asKey(role);
  return key ? UI_ROLE[key] : null;
}

/**
 * The three sign-in entrances. `/login?portal=…` sends the portal to the API,
 * which refuses an account that does not hold the matching role.
 */
export type Portal = "admin" | "lecturer" | "student";

const PORTAL_ROLE: Record<Portal, RoleKey> = {
  admin: "ADMIN",
  lecturer: "LECTURER",
  student: "STUDENT",
};

export function isPortal(value: string | null | undefined): value is Portal {
  return value === "admin" || value === "lecturer" || value === "student";
}

export function roleForPortal(portal: Portal): RoleKey {
  return PORTAL_ROLE[portal];
}

/**
 * The roles allowed into each area, for RoleGuard.
 *
 * These mirror what the API actually authorises: adminRouter mounts
 * `requireRole('ADMIN')` and lecturerRouter `requireRole('LECTURER')`. Keep this
 * constant widened only together with the backend routes.
 */
export const AREA_ROLES = {
  admin: ["ADMIN"],
  lecturer: ["LECTURER"],
  student: ["STUDENT"],
} as const;
