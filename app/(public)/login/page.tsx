"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, ShieldCheck, Cloud, WifiOff, GraduationCap } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [identifier, setIdentifier] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mocking authentication and role-based redirect
    setTimeout(() => {
      setIsLoading(false);
      const lowerId = identifier.toLowerCase();
      
      // Auto-detect role for prototype demonstration based on keywords
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
    <div className="min-h-screen flex w-full bg-white font-sans">
      
      {/* LEFT: BRAND PANEL (Hidden on mobile/tablet) */}
      <div className="relative hidden lg:flex flex-col justify-between w-1/2 bg-blue-900 text-white overflow-hidden p-14 border-r border-blue-900/10">
        
        {/* Background Overlays - Masterclass Design */}
        {/* Faint School/Building Overlay Image */}
        <div 
          className="absolute inset-0 z-0 mix-blend-overlay opacity-20 bg-cover bg-center transition-transform duration-10000 hover:scale-105"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1920&auto=format&fit=crop')" }}
        />
        {/* Gradient fades for readability */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-blue-900/80 via-blue-900/60 to-blue-900"></div>
        {/* PRD Specified Blue-700 circle motifs */}
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full border-[40px] border-blue-700/20 z-0 pointer-events-none"></div>
        <div className="absolute bottom-10 -right-20 w-[400px] h-[400px] rounded-full bg-blue-700/30 blur-3xl z-0 pointer-events-none"></div>

        {/* Top: Logo */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl shadow-float flex items-center justify-center">
            <GraduationCap className="text-blue-900" size={28} />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-2xl tracking-tight leading-none">LASUSTECH</span>
            <span className="text-blue-100 text-sm font-medium tracking-widest uppercase mt-1">Ikorodu</span>
          </div>
        </div>
        
        {/* Middle: Value Prop & Trust Points */}
        <div className="relative z-10 max-w-lg mb-20">
          <h1 className="text-[40px] font-bold leading-tight mb-8 tracking-tight">
            LASUSTECH's digital exam platform
          </h1>
          <ul className="space-y-6">
            <li className="flex items-center gap-4">
              <div className="bg-blue-800/50 p-2.5 rounded-lg border border-blue-700/50">
                <ShieldCheck className="text-blue-100" size={24} />
              </div>
              <span className="text-lg text-blue-50 font-medium">Secure, proctored environment</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="bg-blue-800/50 p-2.5 rounded-lg border border-blue-700/50">
                <Cloud className="text-blue-100" size={24} />
              </div>
              <span className="text-lg text-blue-50 font-medium">Answers saved automatically</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="bg-blue-800/50 p-2.5 rounded-lg border border-blue-700/50">
                <WifiOff className="text-blue-100" size={24} />
              </div>
              <span className="text-lg text-blue-50 font-medium">Works flawlessly on slow networks</span>
            </li>
          </ul>
        </div>
        
        {/* Bottom: Copyright */}
        <div className="relative z-10 text-blue-200/80 text-[13px] font-medium">
          © {new Date().getFullYear()} Lagos State University of Science and Technology. All rights reserved.
        </div>
      </div>


      {/* RIGHT: SIGN-IN FORM */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-20">
        <div className="w-full max-w-[420px] space-y-8">
          
          {/* Mobile Logo Header */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl text-blue-900 tracking-tight">LASUSTECH</span>
          </div>
          
          {/* Form Header */}
          <div>
            <h2 className="text-[32px] font-bold text-gray-900 tracking-tight">Sign in</h2>
            <p className="text-gray-500 mt-2 text-[16px]">One portal to set, monitor and take exams.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            
            {/* Identifier Field */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-[14px] font-semibold text-gray-900">
                Matric number or staff email (required)
              </label>
              <Input 
                id="identifier"
                placeholder="e.g. CSC/2022/305" 
                required 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
                className="h-12"
              />
            </div>
            
            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-[14px] font-semibold text-gray-900">
                Password (required)
              </label>
              <div className="relative">
                <Input 
                  id="password"
                  type={showPassword ? "text" : "password"} 
                  required 
                  autoComplete="current-password"
                  className="pr-12 h-12"
                />
                <button 
                  type="button" 
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative flex items-center justify-center">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 border-2 border-gray-300 rounded-[4px] appearance-none checked:bg-blue-600 checked:border-blue-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 transition-colors cursor-pointer" 
                  />
                  <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-[14px] text-gray-700 font-medium group-hover:text-gray-900 transition-colors">
                  Keep me signed in on this device
                </span>
              </label>
            </div>
            
            {/* Submit Button */}
            <Button 
              type="submit" 
              size="lg" 
              className="w-full h-12 text-[16px] font-semibold shadow-sm hover:shadow-md transition-all"
              isLoading={isLoading}
            >
              Sign in
            </Button>
          </form>
          
          {/* Help Links Footer */}
          <div className="pt-6 border-t border-gray-200/60 flex flex-col gap-5 text-center text-[14px]">
            <a href="/reset" className="text-blue-700 hover:text-blue-900 hover:underline font-semibold transition-colors">
              Forgot password?
            </a>
            
            <div className="text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
              <span className="font-medium text-gray-700 mb-1 block">Need help? Contact ICT</span>
              <a href="tel:0800LASUSTECH" className="text-blue-700 hover:underline font-semibold mr-1">0800 LASUSTECH</a> 
              or <a href="mailto:support@lasustech.edu.ng" className="text-blue-700 hover:underline font-semibold ml-1">support@lasustech.edu.ng</a>
            </div>
            
            <div className="text-[13px] text-gray-500 flex items-center justify-center gap-3 mt-2">
              <a href="#" className="hover:text-gray-900 hover:underline transition-colors">Help</a>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <a href="#" className="hover:text-gray-900 hover:underline transition-colors">Terms</a>
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              <a href="#" className="hover:text-gray-900 hover:underline transition-colors">Privacy (NDPA)</a>
            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
