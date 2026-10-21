"use client";

import * as React from "react";
import { AppShell } from "./app-shell";
import { RoleThemeProvider, type ThemeRole } from "@/components/role-theme";
import { RoleGuard } from "@/components/auth/role-guard";
import { useUser } from "@/components/auth/user-context";
import { ToastProvider } from "@/components/ui/toast";
import { AREA_ROLES, type UiRole } from "@/lib/roles";

/**
 * Theme scopes are keyed by the three institution roles. Exam-office and
 * invigilation screens live inside the admin area, so those capabilities share
 * its `admin` scope.
 */
const THEME_ROLE: Record<UiRole, ThemeRole> = {
  admin: "admin",
  lecturer: "lecturer",
  student: "student",
};

type Area = keyof typeof AREA_ROLES;

/**
 * The chrome inside the guard, where the account is guaranteed to be resolved.
 * The role comes from the user rather than the area so the signed-in person's
 * own menu is shown.
 */
function Chrome({
  area,
  title,
  bare,
  bareClassName,
  children,
}: {
  area: Area;
  title: string;
  bare: boolean;
  bareClassName?: string;
  children: React.ReactNode;
}) {
  // Non-null: RoleGuard only renders children once it has a user.
  const user = useUser();
  const uiRole: UiRole = (area === "admin" || area === "lecturer" || area === "student")
    ? area
    : (user?.uiRole ?? "student");

  if (bare) {
    return (
      <RoleThemeProvider role={THEME_ROLE[uiRole]} className={bareClassName}>
        <ToastProvider>{children}</ToastProvider>
      </RoleThemeProvider>
    );
  }

  return (
    <RoleThemeProvider role={THEME_ROLE[uiRole]}>
      <ToastProvider>
        <AppShell role={uiRole} title={title}>
          {children}
        </AppShell>
      </ToastProvider>
    </RoleThemeProvider>
  );
}

/**
 * Guards a route group on the roles allowed into it, then renders the shell.
 *
 * `bare` drops the sidebar and topbar for screens that own the whole viewport —
 * a student sitting an exam must not be able to navigate away mid-paper.
 */
export function RoleArea({
  area,
  title,
  bare = false,
  bareClassName,
  children,
}: {
  area: Area;
  title: string;
  bare?: boolean;
  bareClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <RoleGuard allow={AREA_ROLES[area]}>
      <Chrome area={area} title={title} bare={bare} bareClassName={bareClassName}>
        {children}
      </Chrome>
    </RoleGuard>
  );
}
