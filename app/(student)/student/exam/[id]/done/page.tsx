"use client";

import Link from "next/link";
import { CheckCircle2, Download, Copy, AlertTriangle, Loader2, Info } from "lucide-react";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ExamDoneContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Use search params for testing the different states
  const paramState = searchParams?.get("state") as "confirmed" | "queued" | null;
  const paramCause = searchParams?.get("cause") as "manual" | "auto" | "invigilator" | null;

  const [submitState, setSubmitState] = useState<"confirmed" | "queued">(paramState || "confirmed");
  const [submitCause, setSubmitCause] = useState<"manual" | "auto" | "invigilator">(paramCause || "manual");
  
  const [time, setTime] = useState<string>("");
  const [countdown, setCountdown] = useState(30);
  const [copied, setCopied] = useState(false);
  
  // Mock data
  const refCode = "AX7-K9M-2P";
  const studentName = "Nifemi Osadare";
  const matric = "CSC/22/101";

  // Fullscreen exit & Time initialization
  useEffect(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error("Could not exit fullscreen", err));
    }
    
    // Replace history to prevent back navigation
    window.history.replaceState(null, "", window.location.href);

    // Format time in Africa/Lagos
    setTime(new Intl.DateTimeFormat('en-NG', {
      timeZone: 'Africa/Lagos',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    }).format(new Date()));
  }, []);

  // Sign out countdown (only starts when confirmed)
  useEffect(() => {
    if (submitState === "confirmed") {
      const int = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(int);
            router.push("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(int);
    }
  }, [submitState, router]);

  const handleCopy = () => {
    navigator.clipboard.writeText(refCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isQueued = submitState === "queued";

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      
      {/* Dev toolbar to toggle states (for review purposes) */}
      <div className="fixed top-4 left-4 bg-white border border-slate-200 p-2 flex gap-2 rounded-lg shadow-sm text-xs z-50">
        <button onClick={() => setSubmitState('confirmed')} className={`px-2 py-1 rounded ${!isQueued ? 'bg-blue-100 text-blue-700' : 'bg-slate-100'}`}>Confirmed</button>
        <button onClick={() => setSubmitState('queued')} className={`px-2 py-1 rounded ${isQueued ? 'bg-amber-100 text-amber-700' : 'bg-slate-100'}`}>Queued</button>
        <div className="w-px bg-slate-200 mx-1" />
        <button onClick={() => setSubmitCause('manual')} className={`px-2 py-1 rounded ${submitCause === 'manual' ? 'bg-slate-200' : 'bg-slate-100'}`}>Manual</button>
        <button onClick={() => setSubmitCause('auto')} className={`px-2 py-1 rounded ${submitCause === 'auto' ? 'bg-slate-200' : 'bg-slate-100'}`}>Auto</button>
        <button onClick={() => setSubmitCause('invigilator')} className={`px-2 py-1 rounded ${submitCause === 'invigilator' ? 'bg-slate-200' : 'bg-slate-100'}`}>Invigilator</button>
      </div>

      <div className="max-w-md w-full space-y-6">
        
        {/* Cause Banner */}
        {submitCause === "auto" && (
          <div className="bg-blue-50 text-blue-800 px-4 py-3 rounded-xl border border-blue-100 flex items-start gap-3 text-sm font-medium">
            <Info size={18} className="shrink-0 mt-0.5" />
            <p>Time ran out and your answers were submitted automatically.</p>
          </div>
        )}
        {submitCause === "invigilator" && (
          <div className="bg-amber-50 text-amber-900 px-4 py-3 rounded-xl border border-amber-200 flex items-start gap-3 text-sm font-medium">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600" />
            <p>Your exam was ended by the invigilator. Your saved answers were submitted.</p>
          </div>
        )}

        {/* Status Card */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center">
          
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 transition-colors ${
            isQueued ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
          }`}>
            {isQueued ? (
              <Loader2 size={40} className="stroke-[2.5] animate-spin" />
            ) : (
              <CheckCircle2 aria-hidden="true" size={40} className="stroke-[2.5]" />
            )}
          </div>
          
          <h1 role="status" aria-live="polite" className="text-2xl font-bold text-slate-900 mb-2">
            {isQueued ? "Submitting answers..." : "Exam Submitted"}
          </h1>
          
          <p className="text-slate-600 mb-8 text-sm">
            {isQueued 
              ? "Your answers are securely saved on this device but the network is slow. Keep this tab open while we securely transmit them to the server." 
              : "Your answers have been acknowledged by the server. You can now leave the hall."}
          </p>
          
          {/* Summary Details */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 text-sm text-slate-700 text-left space-y-4 mb-8 shadow-inner">
            
            <div className="pb-3 border-b border-slate-200">
              <p className="font-bold text-slate-900">{studentName}</p>
              <p className="font-mono text-slate-500 text-xs mt-0.5">{matric}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Course</span>
                <span className="font-bold text-slate-900">CSC 301</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Time {isQueued ? "queued" : "submitted"}</span>
                <span className="font-bold text-slate-900">{time || "--:--"}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-600 font-medium">Questions answered</span>
                <span className="font-bold text-slate-900">40 / 40</span>
              </div>
              
              {!isQueued && (
                <div className="flex justify-between items-center pt-3 mt-1 border-t border-slate-200">
                  <span className="text-slate-600 font-medium">Reference code</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold tracking-widest text-slate-900 bg-slate-200 px-2 py-0.5 rounded text-xs select-all">
                      {refCode}
                    </span>
                    <button 
                      onClick={handleCopy}
                      className="text-slate-400 hover:text-slate-700 transition-colors focus:outline-none"
                      aria-label="Copy reference code"
                    >
                      {copied ? <CheckCircle2 size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button 
              disabled={isQueued}
              onClick={() => router.push("/login")}
              className="flex items-center justify-center w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isQueued ? "Waiting for server..." : `Sign out and leave (${countdown}s)`}
            </button>
            
            {!isQueued && (
              <Link 
                href="/student"
                className="flex items-center justify-center w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              >
                Return to Dashboard
              </Link>
            )}
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center px-4 space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">What happens next?</h3>
            <p className="text-sm text-slate-600 leading-relaxed">Results appear in My results after the exam officer releases them.</p>
          </div>
          
          <p className="text-sm text-slate-500">
            Need help? <Link href="/support" className="text-blue-600 hover:underline font-medium">Contact Exam Support</Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}

export default function ExamDonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32}/></div>}>
      <ExamDoneContent />
    </Suspense>
  );
}
