"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertCircle, ArrowRight, Building2, CalendarClock, CheckCircle2, Clock, FileQuestion,
  Globe, KeyRound, Loader2, Lock, PlayCircle, ShieldCheck, User,
} from "lucide-react";
import {
  publicApi,
  publicErrorMessage,
  readAttemptSession,
  saveAttemptSession,
  type PublicAttempt,
  type PublicExamMeta,
} from "@/lib/publicExamClient";

const fmtDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(iso))
    : null;

function instructionsText(instructions: unknown): string {
  if (!instructions) return "";
  if (typeof instructions === "string") return instructions;
  if (typeof instructions === "object" && !Array.isArray(instructions)) {
    const text = (instructions as { text?: unknown }).text;
    if (typeof text === "string") return text;
  }
  return "";
}

export default function PublicExamLanding() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";
  const router = useRouter();

  const [exam, setExam] = React.useState<PublicExamMeta | null>(null);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [accessCode, setAccessCode] = React.useState("");
  const [formError, setFormError] = React.useState<string | null>(null);
  const [starting, setStarting] = React.useState(false);

  const [existing, setExisting] = React.useState<{ attemptId: string; token: string; name?: string } | null>(null);

  React.useEffect(() => {
    if (!slug) return;
    let active = true;
    setLoading(true);
    publicApi<{ data: PublicExamMeta }>(`/public/exams/${encodeURIComponent(slug)}`)
      .then((res) => {
        if (!active) return;
        setExam(res.data);
        setLoadError(null);
      })
      .catch((error) => {
        if (active) setLoadError(publicErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    setExisting(readAttemptSession(slug));
    return () => {
      active = false;
    };
  }, [slug]);

  const start = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    if (name.trim().length < 2) {
      setFormError("Enter your full name so your result can be matched to you.");
      return;
    }
    if (exam?.requiresCode && !accessCode.trim()) {
      setFormError("This exam needs the access code from the examiner.");
      return;
    }

    setStarting(true);
    try {
      const res = await publicApi<{ data: PublicAttempt }>(
        `/public/exams/${encodeURIComponent(slug)}/start`,
        {
          method: "POST",
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim() || undefined,
            accessCode: accessCode.trim() || undefined,
          }),
        },
      );
      saveAttemptSession(slug, { attemptId: res.data.attemptId, token: res.data.token, name: name.trim() });
      router.push(`/exam/${slug}/attempt`);
    } catch (error) {
      setFormError(publicErrorMessage(error));
      setStarting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <Loader2 size={20} className="animate-spin mr-2" /> Loading exam...
      </div>
    );
  }

  if (loadError || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center">
            <AlertCircle size={22} />
          </div>
          <h1 className="text-[20px] font-semibold text-gray-900">Exam unavailable</h1>
          <p className="text-[14px] text-gray-600">
            {loadError ?? "This exam link is not valid. Check the link from your examiner and try again."}
          </p>
          <Link href="/" className="inline-block text-[13px] font-medium text-blue-700 hover:underline">
            Go to the home page
          </Link>
        </div>
      </div>
    );
  }

  const notOpen = exam.state === "NOT_OPEN";
  const closed = exam.state === "CLOSED";
  const blocked = notOpen || closed;
  const instructions = instructionsText(exam.instructions);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-blue-700 text-white">
        <div className="max-w-4xl mx-auto px-5 py-8 sm:py-10">
          <div className="flex items-center gap-2 text-[12px] uppercase tracking-wider text-blue-100 font-semibold">
            <Globe size={14} /> Public exam
          </div>
          <h1 className="mt-2 text-[24px] sm:text-[30px] font-semibold tracking-tight">{exam.title}</h1>
          <p className="mt-2 text-[14px] text-blue-100">{exam.ownerLabel}</p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            {exam.institutionName && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-800/60 px-3 py-1 text-[12px]">
                <Building2 size={13} /> {exam.institutionName}
              </span>
            )}
            {exam.levelLabel && (
              <span className="rounded-full bg-blue-800/60 px-3 py-1 text-[12px]">{exam.levelLabel}</span>
            )}
            {exam.examBoard && (
              <span className="rounded-full bg-blue-800/60 px-3 py-1 text-[12px]">{exam.examBoard}</span>
            )}
            <span className="rounded-full bg-blue-800/60 px-3 py-1 text-[12px] capitalize">{exam.kindLabel}</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-5 py-8 grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <section className="bg-white border border-gray-200 rounded-xl p-5">
            <h2 className="text-[15px] font-semibold text-gray-900">Before you begin</h2>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
              <Fact icon={<FileQuestion size={16} />} label="Questions" value={String(exam.questionCount)} />
              <Fact
                icon={<Clock size={16} />}
                label="Duration"
                value={exam.durationMin ? `${exam.durationMin} min` : "No limit"}
              />
              <Fact
                icon={<CheckCircle2 size={16} />}
                label="Pass mark"
                value={exam.passMark != null ? `${exam.passMark}%` : "—"}
              />
            </div>

            {instructions.trim() ? (
              <div className="mt-5 rounded-lg bg-gray-50 border border-gray-200 p-4">
                <p className="text-[12px] font-semibold uppercase tracking-wider text-gray-500 mb-2">
                  Instructions
                </p>
                <p className="text-[13px] text-gray-700 whitespace-pre-wrap leading-relaxed">{instructions}</p>
              </div>
            ) : (
              <p className="mt-5 text-[13px] text-gray-600">
                Answer every question. Your answers save as you go, and the exam submits automatically when the timer
                runs out.
              </p>
            )}

            {(notOpen || closed) && (
              <div className="mt-5 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
                <CalendarClock size={16} className="shrink-0 mt-0.5" />
                <span>
                  {notOpen
                    ? `This exam opens on ${fmtDate(exam.opensAt) ?? "a later date"}.`
                    : `This exam closed on ${fmtDate(exam.closesAt) ?? "an earlier date"}.`}
                </span>
              </div>
            )}
            {!blocked && exam.closesAt && (
              <p className="mt-4 text-[12px] text-gray-500">Closes {fmtDate(exam.closesAt)}.</p>
            )}
          </section>

          {existing && !blocked && (
            <section className="bg-white border border-blue-200 rounded-xl p-5">
              <h2 className="text-[15px] font-semibold text-gray-900">You have an exam in progress</h2>
              <p className="mt-1 text-[13px] text-gray-600">
                {existing.name ? `${existing.name}, your` : "Your"} attempt is still open in this browser.
              </p>
              <Button className="mt-4" onClick={() => router.push(`/exam/${slug}/attempt`)}>
                <PlayCircle size={16} className="mr-2" /> Continue exam
              </Button>
            </section>
          )}
        </div>

        <div className="lg:col-span-2">
          <form onSubmit={start} className="bg-white border border-gray-200 rounded-xl p-5 space-y-4">
            <div>
              <h2 className="text-[15px] font-semibold text-gray-900">Enter your details</h2>
              <p className="text-[12px] text-gray-500 mt-0.5">
                {exam.allowRetake ? "You can retake this exam." : "Your name appears on your result."}
              </p>
            </div>

            {formError && (
              <div
                role="alert"
                className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[12px] text-red-800"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <span>{formError}</span>
              </div>
            )}

            <div>
              <label htmlFor="candidate-name" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Full name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="candidate-name"
                  className="pl-9"
                  placeholder="e.g. Amina Okafor"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="candidate-email" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                Email <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <Input
                id="candidate-email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Use the same email to resume, and to prevent taking the exam twice.
              </p>
            </div>

            {exam.requiresCode && (
              <div>
                <label htmlFor="candidate-code" className="block text-[13px] font-medium text-gray-700 mb-1.5">
                  Access code <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    id="candidate-code"
                    className="pl-9"
                    placeholder="Code from your examiner"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    autoComplete="off"
                    required
                  />
                </div>
              </div>
            )}

            <Button type="submit" className="w-full" isLoading={starting} disabled={blocked}>
              {blocked ? "Not available" : "Start exam"}
              {!blocked && !starting && <ArrowRight size={16} className="ml-2" />}
            </Button>

            <div className="flex items-start gap-2 text-[11px] text-gray-500">
              <Lock size={13} className="shrink-0 mt-0.5" />
              <span>Your answers are saved securely. Do not close this tab during the exam.</span>
            </div>
          </form>

          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
            <ShieldCheck size={13} /> Computer-based testing platform
          </div>
        </div>
      </main>
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 p-3">
      <div className="flex items-center gap-1.5 text-gray-400">{icon}</div>
      <div className="mt-1.5 text-[16px] font-semibold text-gray-900 leading-none">{value}</div>
      <div className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-gray-500">{label}</div>
    </div>
  );
}
