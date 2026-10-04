"use client";

import Link from "next/link";
import { LogOut, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SessionEndedPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <LogOut size={32} />
        </div>
        <h1 className="text-[24px] font-bold text-gray-900 mb-2">Session Ended</h1>
        <p className="text-[15px] text-gray-600 mb-8">
          You have been securely logged out of the LASUSTECH CBT platform. For your security, please close your browser if you're on a public device.
        </p>
        <Link href="/login">
          <Button className="w-full h-12 text-[16px]">
            <LogIn className="mr-2" size={18} /> Log in again
          </Button>
        </Link>
      </div>
    </div>
  );
}
