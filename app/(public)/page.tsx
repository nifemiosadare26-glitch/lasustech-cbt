"use client";

import Link from "next/link";
import { GraduationCap, ArrowRight, ShieldCheck, CheckCircle2, MonitorSmartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col font-sans">
      
      {/* Navigation */}
      <nav className="border-b border-gray-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center shadow-sm">
              <GraduationCap className="text-white" size={24} />
            </div>
            <span className="font-bold text-xl text-blue-900 tracking-tight">LASUSTECH</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="secondary" className="hidden sm:inline-flex border-blue-200 text-blue-800 hover:bg-blue-50">
                Staff Portal
              </Button>
            </Link>
            <Link href="/login">
              <Button className="shadow-md">
                Student Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="relative overflow-hidden bg-blue-900 text-[#ffffff] pb-24 pt-20 lg:pt-32 border-b border-blue-950">
          
          {/* Subtle Background Pattern / Image overlay */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-400 via-blue-900 to-black pointer-events-none"></div>
          
          <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col items-center text-center">
            <Badge text="CBT Portal v2.0" />
            <h1 className="text-[42px] sm:text-[56px] lg:text-[72px] font-extrabold tracking-tight mt-6 leading-[1.1] max-w-4xl">
              Next-generation examination platform for <span className="text-blue-300">LASUSTECH</span>.
            </h1>
            <p className="text-[18px] sm:text-[20px] text-blue-100 max-w-2xl mt-6 font-medium">
              A secure, high-performance computer-based testing environment designed for scale, integrity, and seamless academic assessment.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-10">
              <Link href="/login">
                <Button size="lg" className="h-14 px-8 text-[16px] font-bold shadow-xl bg-white text-blue-900 hover:bg-blue-50">
                  Access Portal <ArrowRight className="ml-2" size={20} />
                </Button>
              </Link>
              <Link href="/reset">
                <Button variant="secondary" size="lg" className="h-14 px-8 text-[16px] font-medium border-blue-700 bg-blue-800/50 text-white hover:bg-blue-800 backdrop-blur-sm">
                  Get IT Support
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={ShieldCheck}
                title="Bank-grade Security"
                desc="End-to-end encryption, strict biometric verifications, and automated anti-malpractice detection algorithms."
              />
              <FeatureCard 
                icon={CheckCircle2}
                title="Zero Data Loss"
                desc="Offline-first architecture ensures every keystroke and answer is safely synchronized even on unstable networks."
              />
              <FeatureCard 
                icon={MonitorSmartphone}
                title="Unified Access"
                desc="One central portal for Students, Lecturers, and Exam Officers to orchestrate the entire examination lifecycle."
              />
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-[14px] text-gray-500">
          <p>© {new Date().getFullYear()} Lagos State University of Science and Technology.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Link href="/login" className="hover:text-blue-700">Login</Link>
            <Link href="/maintenance" className="hover:text-blue-700">System Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-800/50 px-3 py-1 text-[13px] font-medium text-blue-200 backdrop-blur-sm">
      {text}
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-6">
        <Icon size={24} />
      </div>
      <h3 className="text-[20px] font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-[15px] text-gray-600 leading-relaxed">{desc}</p>
    </div>
  );
}
