"use client";

import Link from "next/link";
import { LogOut, LogIn, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SessionEndedPage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center w-full bg-[#081229] font-sans overflow-hidden px-4 py-10">
      
      {/* SOLID BACKGROUND & AMBIENT GLOW (NO PHOTOS) */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#081229] to-[#050b18]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-blue-600/10 blur-[120px] z-0 pointer-events-none animate-pulse-slow"></div>

      {/* MAIN CONTENT CONTAINER (NO CARDS) */}
      <div className="relative z-10 w-full max-w-[380px] mx-auto flex flex-col items-center text-center animate-fade-in-up">
        
        {/* Animated Logout Icon */}
        <div className="relative mb-8 flex items-center justify-center">
          {/* Animated rings */}
          <div className="absolute inset-[-20px] rounded-full border border-sky-500/20 animate-ping-slow"></div>
          <div className="absolute inset-[-10px] rounded-full bg-sky-500/10 blur-sm animate-pulse"></div>
          
          {/* Icon core */}
          <div className="relative z-10 w-20 h-20 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md flex items-center justify-center shadow-[0_0_30px_rgba(56,189,248,0.15)] animate-float">
            <ShieldCheck className="absolute w-14 h-14 text-sky-500/20" strokeWidth={1} />
            <LogOut className="w-8 h-8 text-sky-400 relative z-10 animate-slide-right" />
          </div>
        </div>

        {/* Text Content */}
        <h1 className="text-2xl md:text-[28px] font-heading font-bold text-white mb-3 tracking-wide drop-shadow-md">
          Session Ended
        </h1>
        
        <p className="text-[14px] text-blue-100/70 mb-10 leading-relaxed font-medium px-2">
          You have been securely logged out of the platform. For your security, please close your browser window if you are on a public device.
        </p>

        {/* Action Button */}
        <div className="w-full animate-scale-up animation-delay-200">
          <Link href="/login" className="block w-full">
            <Button className="w-full h-12 text-[14px] font-bold bg-white text-[#081229] hover:bg-gray-100 shadow-[0_4px_20px_rgba(255,255,255,0.15)] transition-all rounded-xl tracking-widest uppercase flex items-center justify-center gap-2 group">
              <LogIn className="w-4 h-4 transition-transform group-hover:-translate-x-1" /> 
              Log in again
            </Button>
          </Link>
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
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up { 
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }

        /* Icon Floating */
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float {
          animation: float 5s ease-in-out infinite;
        }

        /* Ambient Glow Pulse */
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 0.8; transform: translate(-50%, -50%) scale(1.05); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 6s ease-in-out infinite;
        }

        /* Ring Ping */
        @keyframes ping-slow {
          0% { transform: scale(0.8); opacity: 0.8; }
          100% { transform: scale(1.5); opacity: 0; }
        }
        .animate-ping-slow { 
          animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite; 
        }

        /* Icon Slide Out Simulation */
        @keyframes slide-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(4px); }
        }
        .animate-slide-right {
          animation: slide-right 3s ease-in-out infinite;
        }

        /* Button Scale Up */
        @keyframes scale-up {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-scale-up {
          opacity: 0;
          animation: scale-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animation-delay-200 {
          animation-delay: 0.2s;
        }
      `}</style>
    </div>
  );
}