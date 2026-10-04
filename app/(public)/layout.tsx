"use client";

import * as React from "react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="force-light min-h-screen bg-white text-gray-900">
      {children}
    </div>
  );
}
