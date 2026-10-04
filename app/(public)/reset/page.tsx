"use client";

import * as React from "react";
import Link from "next/link";
import { KeyRound, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ResetPasswordPage() {
  const [submitted, setSubmitted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setSubmitted(true);
    }, 900);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center w-full bg-[#081229] font-sans overflow-hidden px-4 py-10">
      
      {/* CBT CENTRE PICTURE OVERLAY */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity transition-transform duration-[20000ms] hover:scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop')" }}
      />
      
      {/* GRADIENT FADE */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#081229]/75 via-[#081229]/85 to-[#081229] backdrop-blur-[1px]"></div>

      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-blue-600/15 blur-[120px] z-0 pointer-events-none"></div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full flex flex-col items-center text-center max-w-[100vw] px-4 animate-fade-in">
        
        {/* BRAND HEADER */}
        <div className="flex flex-col items-center text-center mb-6 w-full">
          <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center mb-5 drop-shadow-2xl animate-float-slow">
            <img 
              src="/lasustech-logo.png" 
              alt="LASUSTECH Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                e.currentTarget.src = "https://ui-avatars.com/api/?name=LS&background=081229&color=fff";
              }}
            />
          </div>
          
          <h1 className="font-heading font-semibold text-white uppercase drop-shadow-md tracking-[0.12em] text-lg sm:text-xl md:text-2xl lg:text-[1.85rem] leading-snug md:leading-relaxed">
            Lagos State University of <br /> Science and Technology
          </h1>
          
          <p className="text-blue-300/90 mt-3 text-[10px] md:text-xs font-semibold tracking-[0.35em] uppercase">
            Computer Based Test System
          </p>
        </div>

        {/* FLOATING CONTENT (NO CARDS) */}
        <div className="w-full max-w-[360px] mx-auto text-left mt-2">
          
          {/* Animated Icon Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative w-14 h-14 mb-3 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-sky-500/20 blur-md animate-pulse"></div>
              <div className="relative z-10 w-12 h-12 rounded-xl bg-white/5 border border-white/15 backdrop-blur-md flex items-center justify-center text-sky-400 shadow-lg animate-bounce-gentle">
                {!submitted ? (
                  <KeyRound className="w-6 h-6 animate-key-wiggle" />
                ) : (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 animate-scale-in" />
                )}
              </div>
            </div>

            <h2 className="text-white font-bold text-lg tracking-wider uppercase drop-shadow-sm">
              Reset Password
            </h2>
          </div>

          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4 animate-scale-up">
              <p className="text-[12px] md:text-[13px] text-blue-100/70 text-center leading-relaxed font-medium mb-4">
                Enter your matric number or staff email address, and we&apos;ll send you instructions to reset your password.
              </p>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-blue-100/90 block tracking-widest uppercase">
                  Email or Matric No <span className="text-sky-400">*</span>
                </label>
                <Input 
                  required 
                  placeholder="e.g. CSC/2022/305" 
                  className="h-11 bg-white/5 border border-white/15 text-white placeholder:text-blue-200/30 focus-visible:ring-sky-400 focus-visible:border-sky-400 backdrop-blur-md rounded-lg shadow-inner text-sm transition-all"
                />
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-11 text-[13px] font-bold bg-white text-[#081229] hover:bg-gray-100 shadow-[0_4px_14px_rgba(255,255,255,0.2)] transition-all mt-5 rounded-lg tracking-widest uppercase flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  "Sending Link..."
                ) : (
                  <>
                    Send Reset Link
                    <Send className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-5 animate-scale-up text-center">
              <p className="text-[13px] text-blue-100/80 leading-relaxed font-medium bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
                If an account matches that identifier, we have sent a password reset link. Please check your institutional email inbox.
              </p>

              <Button 
                variant="outline" 
                className="w-full h-11 text-[12px] font-bold border-white/20 text-white bg-white/5 hover:bg-white/15 hover:text-white transition-all rounded-lg tracking-widest uppercase" 
                onClick={() => setSubmitted(false)}
              >
                Try Another Address
              </Button>
            </div>
          )}

          {/* BACK TO SIGN IN LINK */}
          <div className="mt-8 pt-4 border-t border-white/10 text-center">
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center text-[12px] font-semibold text-sky-400 hover:text-white transition-colors tracking-wider uppercase group"
            >
              <ArrowLeft className="mr-2 w-3.5 h-3.5 transition-transform group-hover:-translate-x-1" /> 
              Back to Sign in
            </Link>
          </div>

        </div>
      </div>

      {/* HIGH CUSTOM ANIMATIONS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-heading {
          font-family: 'Inter', sans-serif;
        }
        body {
          font-family: 'Inter', sans-serif;
        }

        /* Smooth Entrance */
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { 
          animation: fade-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }

        /* Gentle floating logo */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        /* Subtle icon bounce */
        @keyframes bounce-gentle {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .animate-bounce-gentle {
          animation: bounce-gentle 3s ease-in-out infinite;
        }

        /* Key Wiggle Animation */
        @keyframes key-wiggle {
          0%, 100% { transform: rotate(0deg); }
          20% { transform: rotate(-12deg); }
          40% { transform: rotate(12deg); }
          60% { transform: rotate(-6deg); }
          80% { transform: rotate(6deg); }
        }
        .animate-key-wiggle {
          animation: key-wiggle 3s ease-in-out infinite;
        }

        /* Scale In Transition */
        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-in {
          animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        /* State Switch Smooth Scale Up */
        @keyframes scale-up {
          0% { opacity: 0; transform: translateY(10px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-scale-up {
          animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}