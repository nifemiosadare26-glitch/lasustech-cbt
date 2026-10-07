"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShieldCheck,
  Zap,
  Clock,
  Monitor,
  Ban,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  FileText,
  Printer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Search,
  BookOpen,
  WifiOff,
  Calculator,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RulesPage() {
  const [activeCategory, setActiveCategory] = useState<"all" | "entry" | "terminal" | "glitches" | "prohibited">("all");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  const toggleCheck = (id: string) => {
    setCheckedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const faqs = [
    {
      q: "What happens if NEPA takes light or my computer turns off suddenly?",
      a: "Don't panic! The LASUSTECH CBT engine automatically saves your selected answer every 3 seconds to our server. If the power blinks or your computer restarts, simply raise your hand. The invigilator will log you back in on the same terminal (or move you to a standby machine), and your exam and timer will resume exactly where you stopped."
    },
    {
      q: "Can I review or change my answers before final submission?",
      a: "Yes! You can jump back to any previous question, change your answer, or unflag questions whenever you like before the clock runs out. The question palette on the right side of the screen shows you at a glance which questions are answered (green), unanswered (gray), or flagged for review (yellow)."
    },
    {
      q: "What if I accidentally click 'Submit' before finishing?",
      a: "The system is built so you can't submit by accident. Clicking 'Submit' will show a clear confirmation screen listing how many questions you still have left unanswered and how much time remains. You have to click a second confirmation button to actually submit."
    },
    {
      q: "Can I bring my own scientific calculator or rough sheet?",
      a: "No outside paper or physical calculators are permitted. For calculations, an on-screen scientific calculator is built right into the exam interface. The invigilator will also hand you official, stamped blank sheets for your calculations before the test begins."
    },
    {
      q: "What if my mouse freezes or the questions won't load?",
      a: "Do not bang on the table or try unplugging cables. Quietly raise your hand. A roving IT support technician in your hall will fix the terminal or migrate your session in under 30 seconds without losing any of your allotted time."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
      {/* Top Bar */}
      <header className="h-[60px] bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-20 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-sm">
            L
          </div>
          <div>
            <span className="font-bold text-blue-950 tracking-tight text-[16px] block leading-tight">
              LASUSTECH CBT
            </span>
            <span className="text-[11px] text-slate-500 block leading-tight">
              Academic Examination Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePrint}
            className="text-[13px] text-slate-700 hover:text-blue-700"
          >
            <Printer size={15} className="mr-1.5" /> Print Rules
          </Button>
          <Link href="/student">
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-[13px]">
              Go to Student Portal
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full py-8 px-4 sm:px-6">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 print:hidden">
          <Link
            href="/student"
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-blue-700 transition-colors"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to student dashboard
          </Link>
        </div>

        {/* Hero Banner */}
        <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-sm mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16"></div>
          
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-[12px] font-semibold mb-3 border border-blue-400/20">
              <Sparkles size={14} /> Official Examination Protocol • 2026/2027
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
              LASUSTECH CBT Student Guide & Hall Rules
            </h1>
            <p className="text-blue-100 text-[14.5px] leading-relaxed">
              Everything you need to know before sitting for your computer-based tests at the Ikorodu campus CBT Centres. 
              Our system autosaves your answers continuously so you can take your test with complete peace of mind.
            </p>

            <div className="mt-5 flex flex-wrap gap-4 text-[13px] text-blue-200 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 size={16} className="text-emerald-400" /> Continuous Auto-Save
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={16} className="text-blue-300" /> Server-Synchronized Timer
              </span>
              <span className="flex items-center gap-1.5">
                <Zap size={16} className="text-amber-300" /> Instant Technical Support in Hall
              </span>
            </div>
          </div>
        </div>

        {/* Quick Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mb-8 print:hidden">
          {[
            { id: "all", label: "All Guidelines" },
            { id: "entry", label: "🎒 Before Entering Hall" },
            { id: "terminal", label: "🖥️ At Your Computer" },
            { id: "glitches", label: "⚡ If Tech Glitches Occur" },
            { id: "prohibited", label: "🚫 What Stays Outside" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveCategory(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all cursor-pointer ${
                activeCategory === tab.id
                  ? "bg-blue-900 text-white shadow-xs"
                  : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {/* SECTION 1: ENTRY & ARRIVAL */}
          {(activeCategory === "all" || activeCategory === "entry") && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900">
                    1. Before You Enter the CBT Hall
                  </h2>
                  <p className="text-[12.5px] text-slate-500">Arrival, verification, and entry procedures</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13.5px]">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <Clock size={16} className="text-blue-600" /> Arrive 25–30 Minutes Early
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[13px]">
                    Don&apos;t rush at the biometric turnstiles. Getting to your assigned CBT Lab (Hall 1, 2, or 3) early gives you time to verify your lab batch and settle in without anxiety.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <FileText size={16} className="text-blue-600" /> Hold Your Student ID & Docket
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[13px]">
                    Your physical LASUSTECH Student Identity Card (or verified exam docket) is strictly required for biometric hall clearance. Digital phone screenshots will not be accepted.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <BookOpen size={16} className="text-blue-600" /> Stamped Rough Sheets Only
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[13px]">
                    Official signed calculation paper will be provided at your desk by hall invigilators. 
                    <strong> Do not bring your own sheets from home</strong>—having any personal paper on you in the hall is treated as an integrity violation.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                  <span className="font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 size={16} className="text-emerald-600" /> Bring Only Pens / Pencils
                  </span>
                  <p className="text-slate-600 leading-relaxed text-[13px]">
                    You only need a pen or HB pencil for working on your rough paper. Everything else (jackets, heavy pouches, cases) should be deposited outside.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: AT THE TERMINAL */}
          {(activeCategory === "all" || activeCategory === "terminal") && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Monitor size={20} />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900">
                    2. Sitting at Your Computer Terminal
                  </h2>
                  <p className="text-[12.5px] text-slate-500">How the test screen works and how to protect your score</p>
                </div>
              </div>

              {/* Crucial Screen Rule Banner */}
              <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-950 mb-4 flex items-start gap-3">
                <AlertTriangle size={20} className="text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-[14px] block mb-0.5">
                    Stay Locked in Full-Screen: Keep Your Eyes and Cursor on the Test
                  </span>
                  <p className="text-[13px] text-amber-900 leading-relaxed">
                    The CBT platform runs in a locked fullscreen environment. <strong>Do not press the Windows key, Alt+Tab, or attempt to minimize the browser.</strong> The proctoring system flags window switches automatically. More than 2 tab-switch events will lock your terminal and require invigilator intervention.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-[13.5px]">
                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                  <div>
                    <strong className="text-slate-900">Continuous Auto-Save:</strong> Every answer you select is saved instantly to the server. You never have to fear losing your progress if your computer reboots.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                  <div>
                    <strong className="text-slate-900">On-Screen Calculator:</strong> If your subject involves math or engineering computations, click the <em>Calculator</em> icon on your screen. You do not need a physical calculator.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                  <div>
                    <strong className="text-slate-900">Flag Difficult Questions:</strong> If you get stuck on a difficult question, click <strong>&quot;Flag Question&quot;</strong> and move ahead. Come back to it at the end using the numbered question palette on the right side of your screen.
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors">
                  <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
                  <div>
                    <strong className="text-slate-900">Review Before You Submit:</strong> When you finish, check the summary palette. Any questions colored gray are unanswered. When you are 100% satisfied, click <strong>Submit Exam</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: WHAT IF GLITCHES HAPPEN */}
          {(activeCategory === "all" || activeCategory === "glitches") && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <Zap size={20} />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900">
                    3. What If Something Glitches? (Don&apos;t Panic!)
                  </h2>
                  <p className="text-[12.5px] text-slate-500">Real-world situations & how the system protects you</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[13px]">
                <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/50 space-y-2">
                  <div className="font-bold text-emerald-950 text-[14px]">
                    If the Power Blinks or PC Shuts Down
                  </div>
                  <p className="text-emerald-900 leading-relaxed">
                    Generator changeovers can happen. <strong>Your answers are already safely stored in our central database.</strong> When power returns, the technician logs you right back in and your timer continues from the exact second it stopped.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/50 space-y-2">
                  <div className="font-bold text-blue-950 text-[14px]">
                    If the Screen Freezes or Won&apos;t Click
                  </div>
                  <p className="text-blue-900 leading-relaxed">
                    <strong>Do NOT press the CPU power button or unplug cables.</strong> Simply raise your hand quietly. An invigilator or IT assistant will refresh the secure terminal or provide an instant mouse swap.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/50 space-y-2">
                  <div className="font-bold text-indigo-950 text-[14px]">
                    If You Need to Relocate Systems
                  </div>
                  <p className="text-indigo-900 leading-relaxed">
                    If any terminal has a hardware fault, the invigilator can immediately transfer your session to a hot-standby machine. You will never lose answers or test minutes.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: STRICT PROHIBITED ITEMS */}
          {(activeCategory === "all" || activeCategory === "prohibited") && (
            <div className="bg-white rounded-xl border border-red-200 p-6 shadow-2xs">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-red-100">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-700 flex items-center justify-center">
                  <Ban size={20} />
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-red-950">
                    4. Strictly Prohibited in the Hall (Zero Tolerance)
                  </h2>
                  <p className="text-[12.5px] text-red-700">These items must remain outside in the storage lockers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]">
                <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2.5">
                  <span className="text-red-600 font-bold text-base leading-none mt-0.5">&times;</span>
                  <div>
                    <strong className="text-red-950 block">Smartphones & Smartwatches:</strong>
                    Must be completely powered OFF and kept in your bag outside. Having a phone on your body—even turned off in your pocket—is classified as malpractice by Senate regulations.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2.5">
                  <span className="text-red-600 font-bold text-base leading-none mt-0.5">&times;</span>
                  <div>
                    <strong className="text-red-950 block">Earbuds, AirPods & Headsets:</strong>
                    All wireless Bluetooth and wired audio accessories are completely barred.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2.5">
                  <span className="text-red-600 font-bold text-base leading-none mt-0.5">&times;</span>
                  <div>
                    <strong className="text-red-950 block">Physical Calculators:</strong>
                    Use the on-screen digital calculator provided within the exam screen.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg bg-red-50/50 border border-red-100 flex items-start gap-2.5">
                  <span className="text-red-600 font-bold text-base leading-none mt-0.5">&times;</span>
                  <div>
                    <strong className="text-red-950 block">Bags, Books, Notes or Blank Paper:</strong>
                    No personal papers or notebooks may be taken past the security threshold.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 5: REAL STUDENT FAQS (INTERACTIVE ACCORDION) */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs">
            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
                <HelpCircle size={20} />
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900">
                  5. Frequently Asked Questions by LASUSTECH Students
                </h2>
                <p className="text-[12.5px] text-slate-500">Quick answers to common exam concerns</p>
              </div>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-slate-200 rounded-lg overflow-hidden transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 bg-white hover:bg-slate-50 font-semibold text-[14px] text-slate-900 cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp size={18} className="text-blue-600 shrink-0" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="p-4 bg-slate-50 border-t border-slate-100 text-[13px] text-slate-700 leading-relaxed">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* SECTION 6: QUICK READINESS CHECKLIST */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-xl p-6 text-white shadow-sm print:hidden">
            <div className="flex items-center gap-2.5 mb-4">
              <CheckCircle2 size={20} className="text-emerald-400" />
              <h3 className="font-bold text-[17px] text-white">
                Exam Day Readiness Checklist
              </h3>
            </div>
            <p className="text-[13px] text-slate-300 mb-4">
              Check off these items before walking out of your hostel or home on test morning:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13.5px]">
              {[
                { id: "c1", label: "LASUSTECH Student ID Card / Verified Exam Docket in hand" },
                { id: "c2", label: "2 working blue or black ballpoint pens for rough work" },
                { id: "c3", label: "Confirmed CBT Hall assignment (Hall 1, 2, or 3) and batch time" },
                { id: "c4", label: "Phone powered OFF before stepping into the verification queue" },
                { id: "c5", label: "Arrived at least 25 minutes prior to scheduled start" },
                { id: "c6", label: "Memorized your student Matriculation Number" },
              ].map((item) => (
                <label
                  key={item.id}
                  onClick={() => toggleCheck(item.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                    checkedItems[item.id]
                      ? "bg-blue-900/60 border-emerald-500/50 text-emerald-200"
                      : "bg-white/5 border-white/10 hover:bg-white/10 text-slate-200"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={!!checkedItems[item.id]}
                    onChange={() => {}}
                    className="rounded border-slate-400 text-emerald-500 focus:ring-0 cursor-pointer w-4 h-4 shrink-0"
                  />
                  <span className={checkedItems[item.id] ? "line-through opacity-80" : ""}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left print:hidden">
          <div>
            <h4 className="font-semibold text-slate-900 text-[15px]">Ready to begin?</h4>
            <p className="text-[13px] text-slate-500">
              Return to your dashboard or review scheduled mock tests.
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/student">
              <Button variant="secondary" className="h-10 text-[13.5px]">
                Student Dashboard
              </Button>
            </Link>
            <Link href="/student/mock">
              <Button className="h-10 bg-blue-600 hover:bg-blue-700 text-[13.5px]">
                Try CBT Practice Mock &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
