"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { 
  CheckCircle2, AlertTriangle, Monitor, Wifi, 
  Maximize, Camera, ArrowLeft, ArrowRight, User, Play, ChevronDown, Lock
} from "lucide-react";

export default function ExamStartPage() {
  const router = useRouter();
  const params = useParams();
  const examId = params?.id as string;
  const [accessCode, setAccessCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [checks, setChecks] = useState({
    browser: "pending",
    connection: "pending",
    fullscreen: "pending",
    webcam: "pending"
  });

  useEffect(() => {
    // Simulate system checks
    const timer = setTimeout(() => {
      setChecks({
        browser: "pass",
        connection: "pass",
        fullscreen: "pass",
        webcam: "pass"
      });
      setIsChecking(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const allPassed = Object.values(checks).every((c) => c === "pass");
  const canStart = allPassed && agreed && accessCode.length === 6;

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (canStart) {
      router.push(`/student/exam/${examId}/attempt`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-slate-900 border-b border-slate-200 pb-4">
        <h1 className="text-xl font-bold tracking-tight">CSC 301 Mid-semester</h1>
        <span className="text-slate-400">|</span>
        <h2 className="text-lg font-medium text-slate-700">Instructions and check</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        
        {/* Left Column: Instructions */}
        <div className="space-y-6">
          <section className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm flex flex-col h-full">
            <div className="p-5 border-b border-slate-100 bg-slate-50">
              <h3 className="font-semibold text-slate-900 text-lg">1. Instructions</h3>
              <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium text-slate-700">
                <span>Duration: <strong className="text-slate-900">60 min</strong></span>
                <span>Questions: <strong className="text-slate-900">40</strong></span>
              </div>
            </div>
            
            <div className="p-5 overflow-y-auto max-h-[400px] flex-1">
              <ul className="space-y-4 text-slate-700 text-sm">
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Answers save automatically.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>Flag questions to review them later.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                  <span>A calculator and protractor are provided on every question.</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <span className="font-semibold text-slate-900">Do not leave full screen or switch tabs. Doing so will trigger a malpractice alert.</span>
                </li>
              </ul>

              <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-100 text-sm text-blue-900">
                <p><strong>Extra time notice:</strong> You have 15 extra minutes.</p>
              </div>
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50 text-center">
              <span className="text-sm font-medium text-slate-500 flex items-center justify-center gap-1">
                Read all instructions above <ChevronDown size={16} />
              </span>
            </div>
          </section>
        </div>

        {/* Right Column: System & Identity */}
        <div className="space-y-6 flex flex-col">
          
          {/* System Check */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-900 text-lg">2. System check</h3>
              <button 
                onClick={() => {
                  setIsChecking(true);
                  setChecks({ browser: "pending", connection: "pending", fullscreen: "pending", webcam: "pending" });
                  setTimeout(() => {
                    setChecks({ browser: "pass", connection: "pass", fullscreen: "pass", webcam: "pass" });
                    setIsChecking(false);
                  }, 2000);
                }}
                className="text-sm font-medium text-blue-600 hover:text-blue-800"
              >
                Run check again
              </button>
            </div>
            
            <ul className="space-y-3">
              <CheckItem 
                icon={Monitor} 
                label="Browser supported" 
                status={checks.browser} 
                isChecking={isChecking} 
              />
              <CheckItem 
                icon={Wifi} 
                label="Connection 1.2 Mbps" 
                status={checks.connection} 
                isChecking={isChecking} 
              />
              <CheckItem 
                icon={Maximize} 
                label="Full screen allowed" 
                status={checks.fullscreen} 
                isChecking={isChecking} 
              />
              <CheckItem 
                icon={Camera} 
                label="Webcam ready" 
                status={checks.webcam} 
                isChecking={isChecking} 
              />
            </ul>
          </section>

          {/* Identity */}
          <section className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
            <h3 className="font-semibold text-slate-900 text-lg mb-4">3. Identity</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center text-slate-400 overflow-hidden shrink-0">
                <User size={32} />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-base">Nifemi Osadare</p>
                <p className="text-sm font-mono text-slate-600 mt-0.5">CSC/22/101</p>
                <p className="text-xs text-slate-500 mt-1">
                  Not you? <Link href="/support" className="text-blue-600 hover:underline">Contact invigilator</Link>
                </p>
              </div>
            </div>
          </section>

        </div>
      </div>

      {/* Bottom Action Bar */}
      <form onSubmit={handleStart} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between mt-8">
        <div className="space-y-4 flex-1">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                maxLength={6}
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Access code"
                className="w-40 pl-9 pr-3 py-2.5 font-mono text-lg font-bold tracking-widest uppercase border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent placeholder:text-slate-300 placeholder:font-sans placeholder:tracking-normal placeholder:font-normal placeholder:text-sm"
                required
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="checkbox" 
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-600 cursor-pointer"
              />
              <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900">
                I agree to the rules and consent to webcam
              </span>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto shrink-0">
          <Link 
            href="/student"
            className="hidden md:inline-flex items-center justify-center h-12 px-6 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={!canStart}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 h-12 px-8 rounded-lg bg-blue-600 text-white font-semibold text-base transition-colors hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            Start exam <ArrowRight size={18} />
          </button>
        </div>
      </form>
      
      <div className="text-center mt-6">
        <Link href="/student/mock" target="_blank" className="text-sm font-medium text-blue-600 hover:text-blue-800 underline underline-offset-4">
          Try the mock exam first
        </Link>
      </div>

    </div>
  );
}

function CheckItem({ icon: Icon, label, status, isChecking }: { icon: any, label: string, status: string, isChecking: boolean }) {
  return (
    <li className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50">
      <div className="flex items-center gap-3">
        <div className={`p-1.5 rounded-md ${status === 'pass' ? 'bg-emerald-100 text-emerald-700' : isChecking ? 'bg-slate-200 text-slate-500 animate-pulse' : 'bg-red-100 text-red-700'}`}>
          <Icon size={16} />
        </div>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <div>
        {isChecking ? (
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
        ) : status === 'pass' ? (
          <CheckCircle2 size={18} className="text-emerald-600" />
        ) : (
          <AlertTriangle size={18} className="text-red-600" />
        )}
      </div>
    </li>
  );
}
