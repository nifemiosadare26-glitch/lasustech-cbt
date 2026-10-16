import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  MonitorCheck,
  BookOpen,
  PlayCircle,
  Info,
  RefreshCcw,
  Clock,
  CheckCircle2,
  CalendarDays,
  Trophy,
} from "lucide-react";

// No hooks or interactivity — this is a pure Server Component
export default function MockExamPage() {
  const mockHistory = [
    {
      id: 1,
      date: "Monday, 30 Sep 2026",
      score: 62,
      total: 100,
      timeTaken: "43 mins",
      grade: "Pass",
    },
    {
      id: 2,
      date: "Tuesday, 01 Oct 2026",
      score: 74,
      total: 100,
      timeTaken: "38 mins",
      grade: "Pass",
    },
  ];

  const steps = [
    {
      step: 1,
      iconName: "monitor",
      title: "System Check",
      description:
        "The platform will verify your browser compatibility, screen resolution, and internet stability before the session begins.",
    },
    {
      step: 2,
      iconName: "book",
      title: "Read Instructions",
      description:
        "Carefully review the exam guidelines, total question count, time limit, and any specific rules before proceeding.",
    },
    {
      step: 3,
      iconName: "play",
      title: "Start Exam",
      description:
        "Once you click 'Begin', the timer starts. Answer all questions and submit before time elapses.",
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Mock Examination</h1>
        <p className="text-gray-500 text-sm">
          CSC 301 — Data Structures and Algorithms &nbsp;|&nbsp; 2026/2027 Session
        </p>
      </div>

      {/* Main CTA Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm">
        <h2 className="text-blue-800 text-lg font-semibold mb-1">Ready to practise?</h2>
        <p className="text-blue-700 text-sm mb-5">
          This is a full-length mock examination designed to simulate the actual CBT experience for
          CSC 301. Use it to identify your weak areas and improve your performance before the real exam.
        </p>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-6 text-sm text-blue-800 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" /> 60 Minutes
            </span>
            <span className="flex items-center gap-1">
              <BookOpen className="w-4 h-4" /> 50 Questions
            </span>
            <span className="flex items-center gap-1">
              <Trophy className="w-4 h-4" /> Objectives Only
            </span>
          </div>
          <Link
            href="/student/exam/csc301/start"
            className="ml-auto inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-colors"
          >
            <PlayCircle className="w-4 h-4" />
            Start Mock Exam Now
          </Link>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-green-50 border border-green-100 rounded-xl p-5">
          <h3 className="flex items-center gap-2 text-green-800 font-semibold text-sm mb-2">
            <Info className="w-5 h-5" />
            No Score Recorded
          </h3>
          <p className="text-sm text-green-700 leading-relaxed">
            Mock exam results are <strong>not submitted</strong> to the registry and do not affect
            your semester grade or GPA. They exist solely for practice and self-assessment.
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-100 rounded-xl p-5">
          <h3 className="flex items-center gap-2 text-purple-800 font-semibold text-sm mb-2">
            <RefreshCcw className="w-5 h-5" />
            Practice at Any Time
          </h3>
          <p className="text-sm text-purple-700 leading-relaxed">
            You may retake this mock exam as many times as you wish. Each attempt may present a
            randomised selection of questions to broaden your practice coverage.
          </p>
        </div>
      </div>

      {/* What to Expect */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800">What to Expect</h2>
        <div className="space-y-3">
          {steps.map(({ step, iconName, title, description }) => (
            <div
              key={step}
              className="flex items-start gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm"
            >
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-sm">
                {step}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {iconName === "monitor" && <MonitorCheck className="w-5 h-5 text-blue-600" />}
                  {iconName === "book" && <BookOpen className="w-5 h-5 text-blue-600" />}
                  {iconName === "play" && <PlayCircle className="w-5 h-5 text-blue-600" />}
                  <p className="font-semibold text-gray-800 text-sm">{title}</p>
                </div>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mock History */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-gray-800">Previous Mock Sessions</h2>
        <div className="divide-y divide-gray-100 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm">
          {mockHistory.map((session) => {
            const pct = Math.round((session.score / session.total) * 100);
            return (
              <div
                key={session.id}
                className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <CalendarDays className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{session.date}</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" /> {session.timeTaken}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">
                      {session.score}/{session.total}
                    </p>
                    <p className="text-xs text-gray-500">{pct}%</p>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                      pct >= 50
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    {session.grade}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
