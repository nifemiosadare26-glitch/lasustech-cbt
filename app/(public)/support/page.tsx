"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Headphones,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Send,
  BookOpen,
  FileQuestion,
  UserCheck,
  Building2,
  Loader2,
  Copy,
  Check,
  Trash2,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface SavedTicket {
  ref: string;
  name: string;
  identifier: string;
  category: string;
  priority: string;
  message: string;
  email?: string;
  phone?: string;
  submittedAt: string;
}

export default function SupportPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    identifier: "",
    email: "",
    phone: "",
    category: "EXAM_ACCESS",
    priority: "NORMAL",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"new" | "history">("new");
  const [myTickets, setMyTickets] = useState<SavedTicket[]>([]);

  // Load ticket history from localStorage
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("lasustech_cbt_support_tickets");
      if (stored) {
        setMyTickets(JSON.parse(stored));
      }
    } catch {}
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.identifier || !form.message) return;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${baseUrl}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error?.message || "Failed to submit ticket.");
      }

      const ref = data.data?.referenceNo || "LASU-SUP-" + Math.random().toString(36).substring(2, 7).toUpperCase();
      const newTicket: SavedTicket = {
        ...form,
        ref,
        submittedAt: new Date().toISOString(),
      };
      const updated = [newTicket, ...myTickets];
      setMyTickets(updated);
      try {
        localStorage.setItem("lasustech_cbt_support_tickets", JSON.stringify(updated));
      } catch {}

      setTicketRef(ref);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit ticket. Please check your connection or contact the CBT Centre.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-[#0B2A5B] dark:bg-blue-800 flex items-center justify-center p-1.5 shadow-sm">
              <Image
                src="/lasustech-logo.png"
                alt="LASUSTECH Logo"
                width={28}
                height={28}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <span className="font-bold text-sm text-[#0B2A5B] dark:text-blue-300 block leading-tight">
                LASUSTECH CBT
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Examination Support & Helpdesk
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800" />
            <button
              type="button"
              onClick={() => router.back()}
              className="inline-flex items-center text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} className="mr-1.5" />
              Back
            </button>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              href="/"
              className="text-xs font-semibold text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              Portal Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 space-y-8">
        {/* Hero Banner with Directorate Responsibilities */}
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-[#0B2A5B] via-blue-900 to-indigo-950 text-white p-6 sm:p-10 shadow-lg">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-blue-200 backdrop-blur-md border border-white/10">
              <ShieldCheck size={14} /> Directorate of Information & Communication Technology (DICT)
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Official Examination Helpdesk & Technical Support
            </h1>
            <p className="text-sm text-blue-100 leading-relaxed">
              Responsible for the administration, security, timetable scheduling, and candidate assistance for all Computer Based Tests at Lagos State University of Science and Technology.
            </p>
          </div>
        </div>

        {/* 3 Key Contact Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Physical CBT Center</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                ICT Complex, Ground Floor, Room 104<br />
                Ikorodu Main Campus, Lagos State
              </p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded">
                Active during all exam sessions
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Headphones size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Direct Helplines</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Helpline: <strong>+234 1 800 LASU-CBT</strong><br />
                WhatsApp Desk: <strong>+234 802 345 6789</strong>
              </p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded">
                Mon - Fri: 7:30 AM - 6:00 PM
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-700 dark:text-violet-400 flex items-center justify-center shrink-0">
              <Mail size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Email & Registry</h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                Email: <strong>cbt-support@lasustech.edu.ng</strong><br />
                Registry: <strong>academic.registry@lasustech.edu.ng</strong>
              </p>
              <span className="inline-block mt-2 text-[11px] font-semibold text-violet-700 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/50 px-2 py-0.5 rounded">
                Average reply time &lt; 2 hours
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Section: Ticket Submission & FAQs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Official Ticket Form & Ticket Tracking */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <FileQuestion size={20} className="text-blue-700 dark:text-blue-400" />
                  Support Desk &amp; Incident Logging
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Assigned directly to the CBT Technical Desk and Department Advisors.
                </p>
              </div>

              {/* Tab Selector */}
              <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 self-start sm:self-auto shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab("new")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "new"
                      ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  New Request
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("history")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeTab === "history"
                      ? "bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                  }`}
                >
                  My Tickets ({myTickets.length})
                </button>
              </div>
            </div>

            {activeTab === "history" ? (
              <div className="space-y-3">
                {myTickets.length === 0 ? (
                  <div className="text-center py-10 px-4 space-y-2">
                    <HelpCircle size={32} className="mx-auto text-slate-400" />
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                      No tickets submitted yet on this browser.
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      When you submit an inquiry, its tracking code and timestamp will appear here.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab("new")}
                      className="mt-2 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Submit a new report &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pb-1">
                      <span>Saved reports ({myTickets.length})</span>
                      <button
                        type="button"
                        onClick={() => {
                          setMyTickets([]);
                          try {
                            localStorage.removeItem("lasustech_cbt_support_tickets");
                          } catch {}
                        }}
                        className="text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 size={12} /> Clear history
                      </button>
                    </div>
                    {myTickets.map((t) => (
                      <div
                        key={t.ref}
                        className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono font-bold text-sm text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                            {t.ref}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {new Date(t.submittedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                        <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                          {t.name} &bull; {t.identifier}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                          {t.message}
                        </p>
                        <div className="flex items-center justify-between pt-1">
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                            {t.priority === "URGENT" ? "Urgent &bull; Transmitted" : "Logged &bull; Under Review"}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(t.ref);
                              setCopied(true);
                              setTimeout(() => setCopied(false), 2000);
                            }}
                            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <Copy size={12} /> Copy Ref
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : ticketRef ? (
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-6 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mx-auto">
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                  Inquiry Dispatched Successfully
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed max-w-md mx-auto">
                  Your ticket has been logged with the Technical Helpdesk:
                </p>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <div className="font-mono font-bold text-lg text-emerald-900 dark:text-emerald-200 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-700 py-1.5 px-4 rounded-lg inline-block shadow-2xs">
                    {ticketRef}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(ticketRef);
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                    className="p-2 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    {copied ? (
                      <>
                        <Check size={14} className="text-emerald-600" /> Copied!
                      </>
                    ) : (
                      <>
                        <Copy size={14} /> Copy Ref
                      </>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 pt-2">
                  Please quote this reference number at ICT Room 104 if you require urgent in-person assistance before your exam.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTicketRef(null);
                    setForm({ name: "", identifier: "", email: "", phone: "", category: "EXAM_ACCESS", priority: "NORMAL", message: "" });
                  }}
                  className="mt-4 text-xs font-bold text-blue-700 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  Submit another report
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Nifemi Osadare"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full h-11 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Matric No / Staff ID <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. LASU/CSC/2023/001"
                      value={form.identifier}
                      onChange={(e) => setForm({ ...form, identifier: e.target.value.toUpperCase() })}
                      className="w-full h-11 px-3.5 text-sm font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Address (for response)
                    </label>
                    <input
                      type="email"
                      placeholder="student@lasustech.edu.ng"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full h-11 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Phone Number (optional)
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 08012345678"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full h-11 px-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Issue Category</label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full h-11 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
                    >
                      <option value="EXAM_ACCESS">Exam Schedule / Missing Paper</option>
                      <option value="COURSE_ENROLLMENT">Course Assignment / Enrollment</option>
                      <option value="LOGIN_AUTH">Login / Password Issue</option>
                      <option value="RESULT_APPEAL">Result / Grade Dispute</option>
                      <option value="TECHNICAL">Computer / Technical Glitch</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Urgency Level</label>
                    <select
                      value={form.priority}
                      onChange={(e) => setForm({ ...form, priority: e.target.value })}
                      className="w-full h-11 px-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
                    >
                      <option value="NORMAL">Normal (Within 24 Hours)</option>
                      <option value="URGENT">Urgent (Exam taking place today)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Detailed Explanation <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Describe your issue with course codes, venue, or specific error message..."
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full p-3.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/70 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 dark:text-slate-100"
                  />
                </div>

                {submitError && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-300">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full h-12 bg-blue-700 dark:bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-800 dark:hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Logging ticket...
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Transmit Support Request
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Right Column: FAQ & Official Policies */}
          <div className="lg:col-span-5 space-y-5">
            <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <HelpCircle size={18} className="text-blue-700 dark:text-blue-400" />
                Frequently Answered Questions
              </h2>

              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px] flex items-center gap-1.5">
                    <UserCheck size={14} className="text-blue-700 dark:text-blue-400" />
                    Who assigns courses to students?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Course enrollment is managed by your <strong>Department Course Advisor</strong> and the <strong>Academic Registry</strong>. Once registered on the university portal, courses are synced into CBT so you can take scheduled exams.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px] flex items-center gap-1.5">
                    <BookOpen size={14} className="text-blue-700 dark:text-blue-400" />
                    Why is my scheduled exam not showing?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Exams appear on your dashboard only when:
                    (1) You are enrolled in the course, and
                    (2) The Admin has published a live or upcoming sitting for your batch.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px] flex items-center gap-1.5">
                    <Building2 size={14} className="text-blue-700 dark:text-blue-400" />
                    Can a staff member hold multiple roles?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Yes. The System Administrator can assign multiple roles (e.g., Lecturer + Admin). When signing in, a role switcher modal will appear allowing you to select your active workspace.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-700/60">
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-[13px] flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-blue-700 dark:text-blue-400" />
                    What if my computer restarts mid-exam?
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                    Do not panic. Every selected answer is auto-saved in real time. Notify the invigilator in your hall immediately to re-authenticate your workstation without loss of time.
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Link Card - Password reset removed per institution policy */}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6">
        <div className="max-w-6xl mx-auto px-4 text-center text-xs text-slate-500 dark:text-slate-400">
          LASUSTECH CBT Support Desk &copy; {new Date().getFullYear()} Lagos State University of Science and Technology. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
