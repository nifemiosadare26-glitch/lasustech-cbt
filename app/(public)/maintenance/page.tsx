"use client";

import React from "react";
import { Wrench, Clock, Settings } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center w-full bg-[#081229] font-sans overflow-hidden px-4 py-10">
      
      {/* EXACT SAME CBT CENTRE PICTURE OVERLAY AS LOGIN PAGE */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity transition-transform duration-[20000ms] hover:scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop')" }}
      />
      
      {/* EXACT SAME GRADIENT FADE */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#081229]/75 via-[#081229]/85 to-[#081229] backdrop-blur-[1px]"></div>

      {/* Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-blue-600/15 blur-[120px] z-0 pointer-events-none"></div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full flex flex-col items-center text-center max-w-[100vw] px-4 animate-fade-in">
        
        {/* BRAND HEADER (Matches Login Page) */}
        <div className="flex flex-col items-center text-center mb-8 w-full">
          <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center mb-7 drop-shadow-2xl animate-float-slow">
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
          
          <p className="text-blue-300/90 mt-3.5 text-[10px] md:text-xs font-semibold tracking-[0.35em] uppercase">
            Computer Based Test System
          </p>
        </div>

        {/* FLOATING MAINTENANCE CONTENT (No Card) */}
        <div className="w-full max-w-[400px] mx-auto flex flex-col items-center mt-4">
          
          {/* Animated Icon Cluster */}
          <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
            <Settings className="absolute w-14 h-14 text-sky-500/30 animate-spin-slow" strokeWidth={1.5} />
            <Wrench className="w-6 h-6 text-sky-400 relative z-10 animate-wrench" />
          </div>
          
          {/* Status Text */}
          <h2 className="text-sky-400 font-bold tracking-[0.2em] uppercase text-sm md:text-base mb-3 drop-shadow-[0_0_15px_rgba(56,189,248,0.4)]">
            System Maintenance
          </h2>
          
          <p className="text-[13px] md:text-[14px] text-blue-100/70 text-center leading-relaxed font-medium tracking-wide mb-8 px-4">
            The portal is currently undergoing scheduled upgrades to improve reliability and performance. Please check back shortly.
          </p>

          {/* Minimalist ETA Indicator */}
          <div className="w-full border-t border-b border-white/10 py-4 flex items-center justify-center gap-3 group">
            <Clock className="w-4 h-4 text-sky-500 animate-pulse" />
            <div className="flex flex-col text-left">
              <span className="text-[9px] text-sky-400/80 font-bold uppercase tracking-[0.2em]">
                Estimated Completion
              </span>
              <span className="text-[13px] text-white font-semibold tracking-wider mt-0.5 group-hover:text-sky-300 transition-colors">
                Today at 18:00 PM
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* CUSTOM ANIMATIONS */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-heading {
          font-family: 'Inter', sans-serif;
        }
        body {
          font-family: 'Inter', sans-serif;
        }

        /* Entrance Animation */
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(15px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { 
          animation: fade-in 1s cubic-bezier(0.16, 1, 0.3, 1) forwards; 
        }

        /* Gentle floating for logo */
        @keyframes float-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow {
          animation: float-slow 6s ease-in-out infinite;
        }

        /* Gear spinning */
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow { 
          animation: spin-slow 8s linear infinite; 
        }

        /* Wrench turning */
        @keyframes wrench-turn {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          75% { transform: rotate(-15deg); }
        }
        .animate-wrench { 
          animation: wrench-turn 2.5s ease-in-out infinite; 
        }
      `}</style>
    </div>
  );
}