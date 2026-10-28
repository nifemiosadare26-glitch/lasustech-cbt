"use client";

import { Clock, RefreshCw } from "lucide-react";
import { ErrorPageLayout } from "@/components/public/error-page-layout";

export default function MaintenancePage() {
  const handleReload = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <ErrorPageLayout
      title="We're Improving Your Examination Experience"
      description="The LASUSTECH CBT Portal is temporarily unavailable while we perform scheduled maintenance. Please check back soon."
      badge={
        <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#091533] border border-blue-500/30 text-slate-200 max-w-md shadow-md">
          <Clock className="w-5 h-5 text-blue-400 shrink-0" aria-hidden="true" />
          <div>
            <span className="text-slate-400 text-xs block">Expected return time:</span>
            <span className="font-bold text-white text-sm">Today, 6:00 PM (WAT)</span>
          </div>
        </div>
      }
      primaryAction={{
        label: "Check Again",
        onClick: handleReload,
        icon: <RefreshCw size={16} />,
      }}
      illustrationSrc="/illustrations/maintenance-art.png"
      illustrationAlt="System Maintenance Illustration"
    />
  );
}
