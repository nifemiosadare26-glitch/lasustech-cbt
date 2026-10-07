import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Play,
  FlaskConical,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* MOCK DATA - replace with a server fetch (session + exam schedule). */
/* ------------------------------------------------------------------ */
const STUDENT = { firstName: "Nifemi" };

type Exam = {
  id: string;
  code: string;
  title: string;
  status: "live" | "upcoming" | "completed";
  dateLabel: string;
  windowLabel?: string;
  timeLabel?: string;
  durationLabel: string;
  venue: string | null;
  seat?: string;
  lateText?: string;
  score?: string;
};

const EXAMS: Exam[] = [
  {
    id: "csc301",
    code: "CSC 301",
    title: "Data Structures",
    status: "live",
    dateLabel: "Today, 7 Oct",
    windowLabel: "09:00 to 10:30",
    durationLabel: "60 min",
    venue: "CBT Centre 1",
    seat: "Seat 42",
    lateText: "Started 8 min ago, join until 09:15",
  },
  {
    id: "mth201",
    code: "MTH 201",
    title: "Mathematical Methods I",
    status: "upcoming",
    dateLabel: "Tomorrow, 8 Oct",
    timeLabel: "11:30 AM",
    durationLabel: "90 min",
    venue: "CBT Centre 3",
  },
  {
    id: "phy101",
    code: "PHY 101",
    title: "General Physics",
    status: "upcoming",
    dateLabel: "Thursday, 10 Oct",
    timeLabel: "09:00 AM",
    durationLabel: "120 min",
    venue: null,
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
  }
];

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2";

/* ------------------------------ UI bits ----------------------------- */

function DetailItem({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={18} className="mt-0.5 shrink-0 text-blue-700" aria-hidden />
      <div>
        <dt className="text-sm font-medium text-slate-600">{label}</dt>
        <dd className="text-base font-semibold text-slate-900">{children}</dd>
      </div>
    </div>
  );
}

/* -------------------------------- Page ------------------------------ */

export default function StudentDashboard() {
  const live = EXAMS.filter((e) => e.status === "live");
  const upcoming = EXAMS.filter((e) => e.status === "upcoming");
  const completed = EXAMS.filter((e) => e.status === "completed");

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-12 pt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Hello, {STUDENT.firstName}
        </h1>
        <Link
          href="/support"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
        >
          Exam day support <ExternalLink size={14} />
        </Link>
      </div>

      {/* Urgent Notification Banner */}
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex items-start gap-3">
        <div className="mt-0.5 shrink-0 rounded-full bg-blue-600 p-1">
          <MapPin size={14} className="text-white" aria-hidden />
        </div>
        <div>
          <h3 className="text-sm font-bold text-blue-900">Venue updated</h3>
          <p className="text-sm font-medium text-blue-800 mt-0.5">
            Your exam <strong>MTH 201</strong> tomorrow has been moved to <strong>CBT Centre 3</strong>.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* BLOCK 1: Available now (Live) */}
        {live.length > 0 && (
          <section aria-labelledby="live-heading" className="space-y-4">
            <h2 id="live-heading" className="text-lg font-semibold text-slate-900">
              Available now
            </h2>
            {live.map((exam) => (
              <div
                key={exam.id}
                className="relative overflow-hidden rounded-xl border border-blue-200 border-l-[6px] border-l-blue-600 bg-white shadow-sm ring-1 ring-blue-600/10 p-6"
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                  
                  <div className="flex-1">
                    <p className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-800 mb-3">
                      <span className="relative flex h-2 w-2" aria-hidden>
                        <span className="absolute inline-flex h-full w-full rounded-full bg-blue-600 opacity-60 motion-safe:animate-ping" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
                      </span>
                      Live
                    </p>
                    <h3 className="text-xl font-bold text-slate-900">{exam.code}</h3>
                    <p className="text-base font-medium text-slate-700">{exam.title}</p>
                    
                    <dl className="mt-5 grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
                      <DetailItem icon={Calendar} label="Date">
                        {exam.dateLabel}
                      </DetailItem>
                      <DetailItem icon={MapPin} label="Venue">
                        {exam.venue ?? "To be announced"}
                        {exam.seat ? `, ${exam.seat}` : ""}
                      </DetailItem>
                    </dl>
                  </div>

                  <div className="w-full md:w-[320px] shrink-0 flex flex-col justify-center bg-slate-50 p-5 rounded-xl border border-slate-100">
                    <div className="mb-4">
                      <p className="text-sm font-medium text-slate-600">Window</p>
                      <p className="text-xl font-bold tabular-nums text-slate-900">{exam.windowLabel}</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">Duration {exam.durationLabel}</p>
                      {exam.lateText && (
                        <p className="text-sm font-medium text-amber-700 mt-2 bg-amber-50 inline-block px-2 py-1 rounded">
                          {exam.lateText}
                        </p>
                      )}
                    </div>
                    
                    <Link
                      href={`/student/exam/${exam.id}/start`}
                      className={`inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 text-base font-semibold text-white transition-colors hover:bg-blue-800 shadow-sm ${focusRing}`}
                    >
                      Continue to instructions
                    </Link>
                    <div className="mt-3 text-center">
                      <Link
                        href="/rules"
                        className={`text-sm font-medium text-blue-700 underline underline-offset-4 hover:text-blue-900 ${focusRing}`}
                      >
                        Read exam-day rules
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* BLOCK 2: Upcoming */}
        {upcoming.length > 0 && (
          <section aria-labelledby="upcoming-heading" className="space-y-4">
            <h2 id="upcoming-heading" className="text-lg font-semibold text-slate-900">
              Upcoming
            </h2>
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {upcoming.map((exam) => (
                <li key={exam.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-slate-900">{exam.code}</p>
                    <p className="text-sm font-medium text-slate-700">{exam.title}</p>
                  </div>
                  <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-700">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-slate-500" aria-hidden />
                      <dd>{exam.dateLabel}</dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-slate-500" aria-hidden />
                      <dd className="tabular-nums">
                        {exam.timeLabel} ({exam.durationLabel})
                      </dd>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={16} className="text-slate-500" aria-hidden />
                      <dd className={exam.venue ? "" : "text-slate-500 italic"}>
                        {exam.venue ?? "To be announced"}
                      </dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* BLOCK 3: Mock exam */}
        <section aria-labelledby="mock-heading" className="space-y-4">
          <h2 id="mock-heading" className="text-lg font-semibold text-slate-900">
            Practice
          </h2>
          <Link
            href="/student/mock"
            className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-blue-300 hover:bg-blue-50 shadow-sm ${focusRing}`}
          >
            <div className="flex items-center gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                <FlaskConical size={24} aria-hidden />
              </span>
              <div>
                <span className="block text-base font-bold text-slate-900">
                  Take a Mock Exam
                </span>
                <span className="block text-sm font-medium text-slate-700">
                  Get familiar with the CBT interface and controls
                </span>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-blue-700 font-medium items-center gap-1">
              Start practice <ChevronRight size={18} aria-hidden className="transition-transform group-hover:translate-x-1" />
            </span>
          </Link>
        </section>

        {/* BLOCK 4: Completed */}
        {completed.length > 0 && (
          <section aria-labelledby="completed-heading" className="space-y-4">
            <h2 id="completed-heading" className="text-lg font-semibold text-slate-900">
              Completed
            </h2>
            <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {completed.map((exam) => (
                <li key={exam.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <p className="text-base font-bold text-slate-900">{exam.code}</p>
                    <p className="text-sm font-medium text-slate-700">{exam.title}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <dl className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={16} className="text-slate-500" aria-hidden />
                        <dd>{exam.dateLabel}</dd>
                      </div>
                    </dl>
                    {exam.score && (
                      <span className="rounded-md bg-slate-100 px-3 py-1 text-sm font-bold text-slate-900">
                        {exam.score}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

      </div>
    </div>
  );
}