"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-6">
          <KeyRound size={32} />
        </div>
        
        <h1 className="text-[24px] font-bold text-gray-900 mb-2">Reset Password</h1>
        
        {!submitted ? (
          <>
            <p className="text-[15px] text-gray-600 mb-8">
              Enter your matric number or staff email address, and we'll send you instructions to reset your password.
            </p>
            <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[14px] font-semibold text-gray-900">Email or Matric No</label>
                <Input required placeholder="e.g. CSC/2022/305" className="h-12" />
              </div>
              <Button type="submit" className="w-full h-12 text-[16px]">Send Reset Link</Button>
            </form>
          </>
        ) : (
          <>
            <p className="text-[15px] text-gray-600 mb-8">
              If an account matches that identifier, we have sent a password reset link. Please check your institutional email.
            </p>
            <Button variant="secondary" className="w-full h-12 text-[16px]" onClick={() => setSubmitted(false)}>
              Try another address
            </Button>
          </>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100">
          <Link href="/login" className="flex items-center justify-center text-[14px] font-medium text-blue-700 hover:text-blue-900 transition-colors">
            <ArrowLeft className="mr-2" size={16} /> Back to Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
