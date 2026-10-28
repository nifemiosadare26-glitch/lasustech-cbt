"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Home } from "lucide-react";
import { ErrorPageLayout } from "@/components/public/error-page-layout";

export default function NotFoundPage() {
  const router = useRouter();

  const handleBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <ErrorPageLayout
      code="404"
      title="Page Not Found"
      description="The page you're looking for doesn't exist or may have been moved."
      primaryAction={{
        label: "Go to Home",
        href: "/",
        icon: <Home size={16} />,
      }}
      secondaryAction={{
        label: "Go Back",
        onClick: handleBack,
        icon: <ArrowLeft size={16} />,
      }}
      illustrationSrc="/illustrations/404-art.png"
      illustrationAlt="404 Page Not Found Illustration"
    />
  );
}
