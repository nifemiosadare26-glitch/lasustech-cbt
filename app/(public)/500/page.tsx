"use client";

import Link from "next/link";
import { ServerCrash, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ServerErrorPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-danger-tint/20 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
          <ServerCrash size={32} />
        </div>
        <h1 className="text-[24px] font-bold text-gray-900 mb-2">Server Error</h1>
        <p className="text-[15px] text-gray-600 mb-8">
          We're experiencing an unexpected technical issue. Our engineering team has been notified.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2" size={16} /> Try Again
          </Button>
          <Link href="/">
            <Button>
              <Home className="mr-2" size={16} /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
