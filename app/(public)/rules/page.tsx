import Link from "next/link";
import { ArrowLeft, AlertTriangle, Clock, Monitor, Ban, FileWarning } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-[56px] bg-white border-b border-slate-200 flex items-center px-6">
        <span className="font-bold text-blue-900 tracking-tight">LASUSTECH CBT</span>
      </header>

      <main className="flex-1 max-w-3xl mx-auto w-full py-12 px-6">
        <Link href="/student" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 mb-8">
          <ArrowLeft size={16} className="mr-2" />
          Back to dashboard
        </Link>
        
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Exam Day Rules</h1>
          <p className="text-slate-600 mb-8">Please read these rules carefully. Violating these rules may result in automatic submission of your exam or disciplinary action.</p>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle size={20} className="text-amber-600" />
                Malpractice & Integrity
              </h2>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3 bg-red-50 text-red-900 p-4 rounded-xl border border-red-100">
                  <Monitor size={20} className="shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-1">Stay on the exam screen.</span>
                    <span className="text-sm">Navigating away, switching tabs, or leaving full-screen mode automatically triggers a malpractice alert and may lock your exam.</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>Impersonation is a severe offense. Your identity is verified at the start of every exam and random checks occur during remote exams.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Clock size={20} className="text-blue-600" />
                Timing & Arrival
              </h2>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>Be seated at your designated CBT centre at least 30 minutes before the exam begins.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>Late arrivals (more than 15 minutes after start time) will not be allowed into the exam hall.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>The timer is controlled by the server. Time lost due to brief network drops is usually restored, but the system clock is final.</span>
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <Ban size={20} className="text-slate-600" />
                Prohibited Items
              </h2>
              <ul className="space-y-4 text-slate-700">
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>No physical calculators are allowed. A scientific calculator is built into the exam screen.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>Mobile phones, smartwatches, and all other electronic devices are strictly prohibited in the exam hall.</span>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2 shrink-0" />
                  <span>No bags, printed materials, or written notes.</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
