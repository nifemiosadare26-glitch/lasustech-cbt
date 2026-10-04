"use client";

import * as React from "react";
import Link from "next/link";
import { UserCog, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccountSetupPage() {
  const [step, setStep] = React.useState(1);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <UserCog size={32} />
        </div>
        
        <h1 className="text-[24px] font-bold text-gray-900 mb-2">Account Setup</h1>
        
        {step === 1 ? (
          <>
            <p className="text-[15px] text-gray-600 mb-8">
              Welcome to the LASUSTECH CBT platform. Please verify your identity using your admission or staff clearance code.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setStep(2); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-gray-900">Clearance Code</label>
                <Input required placeholder="e.g. LST-2026-XYZ" className="h-12 font-mono uppercase" />
              </div>
              <Button type="submit" className="w-full h-12 text-[16px]">
                Verify Code <ArrowRight className="ml-2" size={16} />
              </Button>
            </form>
          </>
        ) : (
          <>
            <div className="bg-success-tint/20 text-success p-4 rounded-lg flex items-center gap-3 mb-6">
              <CheckCircle2 size={24} />
              <div>
                <p className="text-[14px] font-bold text-gray-900">Code Verified Successfully</p>
                <p className="text-[12px] text-gray-700">Account bound to your profile.</p>
              </div>
            </div>
            <p className="text-[15px] text-gray-600 mb-8">
              Your account has been activated. Please proceed to the login page to access your dashboard.
            </p>
            <Link href="/login">
              <Button className="w-full h-12 text-[16px]">Continue to Login</Button>
            </Link>
          </>
        )}

      </div>
    </div>
  );
}
