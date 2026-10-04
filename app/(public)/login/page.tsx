"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const lowerId = identifier.toLowerCase();
      
      if (lowerId.includes("admin")) {
        router.push("/admin");
      } else if (lowerId.includes("lecturer") || lowerId.includes("staff")) {
        router.push("/lecturer");
      } else if (lowerId.includes("officer")) {
        router.push("/officer");
      } else if (lowerId.includes("invigilator")) {
        router.push("/invigilator");
      } else {
        router.push("/student");
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center w-full bg-[#081229] font-sans overflow-hidden px-4 py-10">
      
      {/* CBT CENTRE PICTURE OVERLAY */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-40 mix-blend-luminosity transition-transform duration-[20000ms] hover:scale-105"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop')" }}
      />
      
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#081229]/75 via-[#081229]/85 to-[#081229] backdrop-blur-[1px]"></div>

      {/* Decorative Subtle Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] rounded-full bg-blue-600/15 blur-[120px] z-0 pointer-events-none"></div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="relative z-10 w-full flex flex-col items-center text-center max-w-[100vw] px-4">
        
        {/* BRAND HEADER */}
        <div className="flex flex-col items-center text-center mb-8 w-full">
          {/* INCREASED LOGO SIZE FOR PROMINENCE */}
          <div className="w-36 h-36 md:w-40 md:h-40 flex items-center justify-center mb-7 drop-shadow-2xl">
            <img 
              src="/lasustech-logo.png" 
              alt="LASUSTECH Logo" 
              className="w-full h-full object-contain filter drop-shadow-[0_6px_20px_rgba(0,0,0,0.5)]"
              onError={(e) => {
                e.currentTarget.src = "https://ui-avatars.com/api/?name=LS&background=081229&color=fff";
              }}
            />
          </div>
          
          {/* PROPORTIONAL, ELEGANT HEADING */}
          <h1 className="font-heading font-semibold text-white uppercase drop-shadow-md tracking-[0.12em] text-lg sm:text-xl md:text-2xl lg:text-[1.85rem] leading-snug md:leading-relaxed">
            Lagos State University of <br /> Science and Technology
          </h1>
          
          <p className="text-blue-300/90 mt-3.5 text-[10px] md:text-xs font-semibold tracking-[0.35em] uppercase">
            Computer Based Test System
          </p>
        </div>

        {/* FORM CONTAINER */}
        <div className="w-full max-w-[360px] mx-auto text-left mt-1">
          <form onSubmit={handleLogin} className="space-y-4">
            
            {/* Identifier Field */}
            <div className="space-y-1.5">
              <label htmlFor="identifier" className="text-[11px] font-semibold text-blue-100/90 block tracking-widest uppercase">
                Matric number or staff email <span className="text-sky-400">*</span>
              </label>
              <Input 
                id="identifier"
                placeholder="e.g. CSC/2022/305" 
                required 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="h-11 bg-white/5 border border-white/15 text-white placeholder:text-blue-200/30 focus-visible:ring-sky-400 focus-visible:border-sky-400 backdrop-blur-md rounded-lg shadow-inner text-sm transition-all"
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-[11px] font-semibold text-blue-100/90 block tracking-widest uppercase">
                Password <span className="text-sky-400">*</span>
              </label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  required 
                  autoComplete="current-password"
                  className="pr-10 h-11 bg-white/5 border border-white/15 text-white placeholder:text-blue-200/30 focus-visible:ring-sky-400 focus-visible:border-sky-400 backdrop-blur-md rounded-lg shadow-inner text-sm transition-all"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-200/50 hover:text-white transition-colors p-1 rounded-md focus:outline-none"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            
            {/* Remember Me & Reset Password */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="w-[14px] h-[14px] border border-blue-400/50 rounded-[3px] appearance-none bg-white/5 checked:bg-sky-500 checked:border-sky-500 focus:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 transition-colors cursor-pointer" 
                  />
                  <svg className="absolute w-2 h-2 text-white pointer-events-none opacity-0 peer-checked:opacity-100 font-extrabold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[11px] text-blue-100/80 font-medium group-hover:text-white transition-colors tracking-wide">
                  Keep me signed in
                </span>
              </label>

              <a href="/reset" className="text-[11px] text-sky-400 hover:text-white hover:underline font-medium transition-colors tracking-wide">
                Reset password
              </a>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-11 text-[13px] font-bold bg-white text-[#081229] hover:bg-gray-100 shadow-[0_4px_14px_rgba(255,255,255,0.2)] transition-all mt-5 rounded-lg tracking-widest uppercase"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        .font-heading {
          font-family: 'Inter', sans-serif;
        }
        body {
          font-family: 'Inter', sans-serif;
        }
      `}</style>
    </div>
  );
}