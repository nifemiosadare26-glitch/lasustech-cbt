"use client";

import Link from "next/link";
import { AlertTriangle, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-danger-tint/20 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle size={32} />
        </div>
        <h1 className="text-[24px] font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-[15px] text-gray-600 mb-8">
          You don't have permission to view this page. If you believe this is an error, please contact your administrator.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="secondary" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2" size={16} /> Go Back
          </Button>
          <Link href="/login">
            <Button>
              <Home className="mr-2" size={16} /> Return Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
