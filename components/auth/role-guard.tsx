"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getMe } from "@/lib/me";
import type { ApiError } from "@/lib/apiClient";
import { toUiRole } from "@/lib/roles";
import { UserContextProvider, type SessionUser } from "./user-context";

/**
 * Gates a route group on the roles the API actually grants, then publishes the
 * account to its children.
 *
 * The check is a convenience, not the security boundary: every endpoint behind
 * this re-checks the role server-side, so a forged client-side pass still gets a
 * 403 from the API.
 */
export function RoleGuard({ allow, children }: { allow: readonly string[]; children: React.ReactNode }) {
  const router = useRouter();
  // Stable dependency: the array literal is rebuilt on every render.
  const key = allow.join(",");
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [failure, setFailure] = React.useState<string | null>(null);

  React.useEffect(() => {
    let alive = true;
    getMe()
      .then((me) => {
        if (!alive) return;

        const granted = key.split(",").filter(Boolean);
        if (!me.roles.some((r) => granted.includes(r))) {
          router.replace("/403");
          return;
        }

        const uiRole = toUiRole(me.primaryRole);
        if (!uiRole) {
          // A role the shell has no menu for. Better to say so than to render
          // the wrong navigation.
          setFailure("Your account has a role this portal doesn't recognise.");
          return;
        }

        // Non-sensitive hint so /403 can offer the right "go to my dashboard"
        // link without needing an authenticated call of its own.
        document.cookie = `role=${me.primaryRole.toLowerCase()}; path=/; SameSite=Lax`;
        setUser({ me, uiRole });
      })
      .catch((e: ApiError) => {
        if (!alive) return;
        if (e.code === "MAINTENANCE") router.replace("/maintenance");
        else if (e.status === 401) router.replace("/login");
        else setFailure(e.message ?? "Could not reach the server.");
      });
    return () => { alive = false; };
  }, [key, router]);

  if (failure) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
        <p className="text-[15px] font-semibold text-gray-900">We couldn&apos;t load your account.</p>
        <p className="text-[13px] text-gray-500">{failure}</p>
        <button className="text-blue-700 underline text-[14px]" onClick={() => window.location.reload()}>Try again</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return <UserContextProvider value={user}>{children}</UserContextProvider>;
}
