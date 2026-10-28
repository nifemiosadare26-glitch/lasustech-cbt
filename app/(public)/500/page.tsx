"use client";

import { Home, RefreshCw } from "lucide-react";
import { ErrorPageLayout } from "@/components/public/error-page-layout";

export default function ServerErrorPage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <ErrorPageLayout
      code="500"
      title="Something Went Wrong"
      description="We're experiencing an unexpected system error. Please try again shortly."
      primaryAction={{
        label: "Try Again",
        onClick: handleReload,
        icon: <RefreshCw size={16} />,
      }}
      secondaryAction={{
        label: "Go to Home",
        href: "/",
        icon: <Home size={16} />,
      }}
      illustrationSrc="/illustrations/500-art.png"
      illustrationAlt="500 Something Went Wrong Illustration"
    />
  );
}
