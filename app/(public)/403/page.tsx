import type { Metadata } from "next";
import { LayoutDashboard, LogIn } from "lucide-react";
import { cookies } from "next/headers";
import { homeForRole } from "@/lib/roles";
import { ErrorPageLayout } from "@/components/public/error-page-layout";

export const metadata: Metadata = {
  title: "Access Restricted | LASUSTECH CBT",
  robots: { index: false, follow: false },
};

async function getRole(): Promise<string | null> {
  const store = await cookies();
  return store.get("role")?.value ?? null;
}

export default async function ForbiddenPage() {
  const role = await getRole();
  const homeHref = role ? homeForRole(role) : "/student";

  return (
    <ErrorPageLayout
      code="403"
      title="Access Restricted"
      description="You don't have permission to access this page. Please sign in with an authorized account."
      primaryAction={{
        label: "Go to Dashboard",
        href: homeHref,
        icon: <LayoutDashboard size={16} />,
      }}
      secondaryAction={{
        label: "Sign In",
        href: "/login",
        icon: <LogIn size={16} />,
      }}
      illustrationSrc="/illustrations/403-art.png"
      illustrationAlt="403 Access Restricted Illustration"
    />
  );
}
