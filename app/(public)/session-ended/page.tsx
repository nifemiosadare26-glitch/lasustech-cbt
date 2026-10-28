import type { Metadata } from "next";
import { Home, LogIn } from "lucide-react";
import { ErrorPageLayout } from "@/components/public/error-page-layout";

export const metadata: Metadata = {
  title: "Session Ended | LASUSTECH CBT",
  robots: { index: false, follow: false },
};

export default function SessionEndedPage() {
  return (
    <ErrorPageLayout
      title="Your Session Has Ended"
      description="For your security, your session has expired. Please sign in again to continue."
      primaryAction={{
        label: "Sign In Again",
        href: "/login",
        icon: <LogIn size={16} />,
      }}
      secondaryAction={{
        label: "Go to Home",
        href: "/",
        icon: <Home size={16} />,
      }}
      illustrationSrc="/illustrations/session-ended-art.png"
      illustrationAlt="Your Session Has Ended Illustration"
    />
  );
}
