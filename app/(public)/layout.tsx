"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSupport = pathname?.startsWith("/support");

  if (isSupport) {
    return <div className="min-h-screen">{children}</div>;
  }

  return (
    <div className="force-light min-h-screen bg-white text-gray-900">
      {children}
    </div>
  );
}
