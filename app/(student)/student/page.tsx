"use client";

import Link from "next/link";
import {
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle2,
  Award,
  ExternalLink,
} from "lucide-react";

const STUDENT = {
  firstName: "Nifemi",
  fullName: "Nifemi Osadare",
  matricNo: "CSC/22/101",
  college: "College of Basic Sciences",
  department: "Computer Science",
  level: "300 Level",
};

type Exam = {
  id: string;
  code: string;
  title: string;
  status: "live" | "completed";
  dateLabel: string;
  windowLabel?: string;
  durationLabel: string;
  venue: string | null;
  seat?: string;
  lateText?: string;
  score?: string;
  grade?: string;
  unit?: number;
};

const EXAMS: Exam[] = [
  {
    id: "csc301",
    code: "CSC 301",
    title: "Data Structures & Algorithms",
    status: "live",
    dateLabel: "Today, 7 Oct",
    windowLabel: "09:00 to 10:30",
    durationLabel: "60 min",
    venue: "CBT Centre 1",
    seat: "Seat 42",
    lateText: "Session is active — proceed to exam hall",
    unit: 3,
  },
  {
    id: "gst101",
    code: "GST 101",
    title: "Use of English",
    status: "completed",
    dateLabel: "Monday, 2 Oct",
    durationLabel: "60 min",
    venue: "CBT Centre 2",
    score: "72%",
    grade: "A",
    unit: 2,
  },
  {
    id: "csc201",
    code: "CSC 201",
    title: "Computer Programming I",
    status: "completed",
    dateLabel: "Friday, 29 Sep",
    durationLabel: "90 min",
    venue: "CBT Centre 1",
    score: "81%",
    grade: "A",
    unit: 3,
  },
];

export default function StudentDashboard() {
  const live = EXAMS.filter((e) => e.status === "live");
  const completed = EXAMS.filter((e) => e.status === "completed");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-6 pb-12 pt-2">
      {/* Student Profile Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            Student Examination Portal
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-2">
            Welcome, {STUDENT.firstName}
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {STUDENT.matricNo} • {STUDENT.department} ({STUDENT.level})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/student/results"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-800 shadow-2xs"
          >
            <Award size={16} />
            View Results
          </Link>
          <Link
            href="/support"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Help & Support <ExternalLink size={14} className="text-slate-400" />
          </Link>
        </div>
      </div>

      {/* SECTION 1: Active Exam to Take (Live) */}
      {live.length > 0 && (
        <section aria-labelledby="live-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="live-heading" className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75 motion-safe:animate-ping" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-600" />
              </span>
              Exam Ready to Take Now
            </h2>
            <span className="text-xs font-semibold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active Session
            </span>
          </div>

          {live.map((exam) => (
            <div
              key={exam.id}
              className="overflow-hidden rounded-2xl border-2 border-blue-600 bg-white shadow-md p-6 relative"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 rounded-md bg-blue-100 text-blue-900 font-mono font-bold text-base">
                      {exam.code}
                    </span>
                    <span className="text-xs font-medium text-slate-500">{exam.unit} Credit Units</span>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900">{exam.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{STUDENT.college}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-700 pt-1">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Clock size={16} className="text-blue-600" />
                      <span>{exam.durationLabel} ({exam.windowLabel})</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium">
                      <MapPin size={16} className="text-blue-600" />
                      <span>{exam.venue} {exam.seat ? `• ${exam.seat}` : ""}</span>
                    </div>
                  </div>

                  {exam.lateText && (
                    <p className="text-xs font-medium text-blue-900 bg-blue-50 border border-blue-200 inline-block px-3 py-1.5 rounded-lg">
                      {exam.lateText}
                    </p>
                  )}
                </div>

                <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2 w-full md:w-auto">
                  <Link
                    href={`/student/exam/${exam.id}/start`}
                    className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 text-base font-bold text-white transition-all hover:bg-blue-700 shadow-sm hover:shadow cursor-pointer"
                  >
                    Start Exam
                    <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </section>
      )}

      {/* SECTION 2: Completed Exams & Results */}
      {completed.length > 0 && (
        <section aria-labelledby="completed-heading" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 id="completed-heading" className="text-lg font-bold text-slate-900">
              Completed Exams
            </h2>
            <Link
              href="/student/results"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
            >
              All Results <ArrowRight size={14} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xs">
            {completed.map((exam) => (
              <div key={exam.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900 bg-slate-100 px-2.5 py-0.5 rounded">
                      {exam.code}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={12} /> Completed
                    </span>
                  </div>
                  <h3 className="text-base font-semibold text-slate-900">{exam.title}</h3>
                  <p className="text-xs text-slate-500">Taken on {exam.dateLabel} • {exam.venue}</p>
                </div>

                <div className="flex items-center gap-4">
                  {exam.score && (
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block font-medium">Score</span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-extrabold text-slate-900">{exam.score}</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          Grade {exam.grade}
                        </span>
                      </div>
                    </div>
                  )}

                  <Link
                    href="/student/results"
                    className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
                  >
                    View Slip
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}