"use client";

import * as React from "react";
import {
  Globe,
  Building2,
  KeyRound,
  Copy,
  CheckCircle2,
  ExternalLink,
  RefreshCw,
  Eye,
  EyeOff,
  Clock,
  Calendar,
  Shield,
  FileText,
  Share2,
  Sparkles,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal, errMessage, useToast } from "@/components/admin/ui";
import { apiClient } from "@/lib/apiClient";
import { copyToClipboard } from "@/lib/browser";

export interface CandidateParticipationExam {
  id: string;
  sittingId?: string | null;
  title: string;
  courseCode?: string | null;
  courseTitle?: string | null;
  ownerLabel?: string | null;
  audience: "INSTITUTIONAL" | "PUBLIC";
  status?: string | null;
  durationMin?: number | null;
  passMark?: number | string | null;
  questionCount?: number | null;
  publicSlug?: string | null;
  publicLink?: string | null;
  publicUrl?: string | null;
  accessCode?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
  venue?: string | null;
  requireWebcam?: boolean | null;
}

interface CandidateParticipationModalProps {
  exam: CandidateParticipationExam;
  role?: "ADMIN" | "LECTURER";
  onClose: () => void;
  onCodeUpdated?: (newCode: string) => void;
}

const fmtLagosDateTime = (iso: string | null | undefined): string => {
  if (!iso) return "Not scheduled yet";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-NG", {
    timeZone: "Africa/Lagos",
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d) + " (WAT)";
};

export function CandidateParticipationModal({
  exam,
  role = "LECTURER",
  onClose,
  onCodeUpdated,
}: CandidateParticipationModalProps) {
  const toast = useToast();
  const [accessCode, setAccessCode] = React.useState<string | null>(exam.accessCode ?? null);
  const [showCode, setShowCode] = React.useState(true);
  const [busy, setBusy] = React.useState(false);
  const [confirmRegen, setConfirmRegen] = React.useState(false);
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  // Compute public URLs
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const slug = exam.publicSlug || exam.id;
  const publicRelativePath = exam.audience === "PUBLIC" ? `/exam/${slug}` : `/student/exam/${exam.sittingId || exam.id}/start`;
  const computedPublicUrl = exam.publicUrl
    ? exam.publicUrl.replace(/\/public\/exam\//, "/exam/")
    : origin
      ? `${origin}${publicRelativePath}`
      : publicRelativePath;

  const quickJoinUrl = accessCode
    ? `${computedPublicUrl}${computedPublicUrl.includes("?") ? "&" : "?"}code=${accessCode}`
    : computedPublicUrl;

  // If code is not available, automatically fetch it with resilient fallbacks
  React.useEffect(() => {
    if (!accessCode) {
      let isMounted = true;
      const fetchCode = async () => {
        setBusy(true);
        const candidates = [
          exam.sittingId ? `/admin/schedule/${exam.sittingId}/access-code` : null,
          `/admin/schedule/${exam.id}/access-code`,
          `/admin/exams/${exam.id}/access-code`,
          `/lecturer/exams/${exam.id}/access-code`,
        ].filter(Boolean) as string[];

        let retrieved: string | null = null;
        for (const endpoint of candidates) {
          try {
            const res = await apiClient<{ data: { accessCode: string | null } }>(endpoint);
            if (res.data?.accessCode) {
              retrieved = res.data.accessCode;
              break;
            }
          } catch {
            // try next endpoint
          }
        }

        if (isMounted) {
          if (retrieved) {
            setAccessCode(retrieved);
            onCodeUpdated?.(retrieved);
            setBusy(false);
          } else {
            // Auto-generate code silently if none exists yet!
            void handleRegenerateCode(true);
          }
        }
      };
      void fetchCode();
      return () => {
        isMounted = false;
      };
    }
  }, [accessCode, exam.id, exam.sittingId, onCodeUpdated]);

  const copyText = async (text: string, key: string, label: string) => {
    await copyToClipboard(text);
    setCopiedKey(key);
    toast.show(`${label} copied to clipboard!`);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2500);
  };

  const handleRegenerateCode = async (silent = false) => {
    setBusy(true);
    setConfirmRegen(false);
    const candidates = [
      exam.sittingId ? `/admin/schedule/${exam.sittingId}/access-code` : null,
      `/admin/schedule/${exam.id}/access-code`,
      `/admin/exams/${exam.id}/access-code`,
      `/lecturer/exams/${exam.id}/access-code`,
    ].filter(Boolean) as string[];

    let generated: string | null = null;
    let lastError: unknown = null;

    for (const endpoint of candidates) {
      try {
        const res = await apiClient<{ data: { accessCode: string } }>(endpoint, { method: "POST" });
        if (res.data?.accessCode) {
          generated = res.data.accessCode;
          break;
        }
      } catch (e) {
        lastError = e;
      }
    }

    if (generated) {
      setAccessCode(generated);
      onCodeUpdated?.(generated);
      if (!silent) toast.show("Access code generated successfully!");
    } else if (!silent) {
      toast.show(errMessage(lastError), "err");
    }
    setBusy(false);
  };

  const copyFullCandidateNotice = async () => {
    const courseCode = exam.courseCode || exam.ownerLabel || "EXAM";
    const courseTitle = exam.courseTitle || exam.title;
    const windowStart = fmtLagosDateTime(exam.startsAt);
    const windowEnd = fmtLagosDateTime(exam.endsAt);
    const code = accessCode || "CONTACT INVIGILATOR";

    const notice = [
      `🎓 *EXAMINATION PARTICIPATION NOTICE*`,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `📚 Course: ${courseCode} - ${courseTitle}`,
      `📝 Exam: ${exam.title}`,
      `🌐 Type: ${exam.audience === "PUBLIC" ? "Public Examination" : "Internal Institutional Examination"}`,
      ``,
      `🗓 Schedule: ${windowStart} ${exam.endsAt ? `until ${windowEnd}` : ""}`,
      `⏱ Duration: ${exam.durationMin ? `${exam.durationMin} minutes` : "Standard duration"}`,
      exam.passMark ? `🎯 Pass Mark: ${exam.passMark}%` : null,
      exam.requireWebcam ? `📷 Security Policy: Live Webcam Proctoring Required` : null,
      ``,
      `🔑 *CANDIDATE ACCESS CODE:* ${code}`,
      ``,
      `🔗 *Direct Participation Link:*`,
      `${quickJoinUrl}`,
      ``,
      `📋 *Instructions for Candidates:*`,
      `1. Open the Direct Participation Link above or navigate to the examination portal and enter your Access Code.`,
      `2. Supply your full name and student email/matriculation number to begin.`,
      `3. Maintain a stable internet connection in a quiet environment.`,
      `4. Do not switch browser tabs, leave fullscreen, or minimize the window during the exam.`,
      exam.requireWebcam
        ? `5. Ensure your webcam is enabled and your face remains fully visible throughout the session.`
        : null,
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
      `Good luck with your examination!`,
    ]
      .filter((line) => line !== null)
      .join("\n");

    await copyText(notice, "full_notice", "Complete candidate instructions");
  };

  const courseDisplay = exam.courseCode || exam.ownerLabel || "Exam Paper";

  return (
    <Modal
      title="Candidate Participation & Access Code"
      subtitle={`${courseDisplay} • ${exam.title}`}
      onClose={onClose}
      width="max-w-xl"
    >
      <div className="space-y-5 py-1">
        {toast.node}

        {/* Top summary card */}
        <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-600 text-white rounded-lg shrink-0">
              {exam.audience === "PUBLIC" ? <Globe size={18} /> : <Building2 size={18} />}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[14px] text-blue-950 truncate">{exam.title}</span>
                <Badge variant={exam.audience === "PUBLIC" ? "blue-solid" : "default"} className="text-[11px]">
                  {exam.audience === "PUBLIC" ? "Public" : "Institutional"}
                </Badge>
              </div>
              <p className="text-[12px] text-blue-700 truncate mt-0.5">{courseDisplay}</p>
            </div>
          </div>
          {exam.status && (
            <Badge variant="success" className="shrink-0 text-[11px]">
              {exam.status}
            </Badge>
          )}
        </div>

        {/* Access Code Section */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-blue-600" />
              <span className="text-[13px] font-semibold text-gray-900">Candidate Access Code</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="tertiary"
                className="h-7 px-2 text-[12px] text-gray-600 hover:text-gray-900"
                onClick={() => setShowCode(!showCode)}
              >
                {showCode ? <EyeOff size={13} className="mr-1" /> : <Eye size={13} className="mr-1" />}
                {showCode ? "Mask" : "Reveal"}
              </Button>
              {confirmRegen ? (
                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="danger"
                    className="h-7 px-2 text-[11px]"
                    disabled={busy}
                    onClick={() => void handleRegenerateCode()}
                  >
                    Confirm
                  </Button>
                  <Button
                    size="sm"
                    variant="tertiary"
                    className="h-7 px-2 text-[11px]"
                    onClick={() => setConfirmRegen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="tertiary"
                  className="h-7 px-2 text-[12px] text-amber-700 hover:text-amber-900"
                  disabled={busy}
                  onClick={() => setConfirmRegen(true)}
                  title="Generate a new access code"
                >
                  <RefreshCw size={12} className={`mr-1 ${busy ? "animate-spin" : ""}`} />
                  Regenerate
                </Button>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
            {busy && !accessCode ? (
              <div className="flex items-center gap-2 text-gray-500 text-[13px]">
                <Loader2 size={16} className="animate-spin text-blue-600" /> Loading code...
              </div>
            ) : accessCode ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-[24px] font-bold tracking-widest text-blue-900 select-all">
                  {showCode ? accessCode : "••••••"}
                </span>
                <span className="text-[11px] text-gray-500 uppercase tracking-wide font-medium bg-white px-2 py-0.5 rounded border border-gray-200">
                  Required to Start
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-gray-500 italic">No access code generated yet</span>
                <Button
                  size="sm"
                  variant="primary"
                  className="h-7 px-2.5 text-[11px] bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs"
                  disabled={busy}
                  onClick={() => void handleRegenerateCode()}
                >
                  {busy ? <Loader2 size={12} className="animate-spin mr-1" /> : <KeyRound size={12} className="mr-1" />}
                  Generate Code
                </Button>
              </div>
            )}

            {accessCode && (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-3"
                onClick={() => void copyText(accessCode, "code", "Access code")}
              >
                {copiedKey === "code" ? (
                  <>
                    <CheckCircle2 size={14} className="mr-1.5 text-emerald-600" /> Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1.5" /> Copy Code
                  </>
                )}
              </Button>
            )}
          </div>
          <p className="text-[12px] text-gray-500">
            Candidates must enter this code before the test paper unlocks. You can regenerate it anytime.
          </p>
        </div>

        {/* Direct Link & Quick-Join URL */}
        <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-gray-900 flex items-center gap-1.5">
              <Share2 size={15} className="text-blue-600" /> Candidate Entrance Links
            </span>
            <Button
              size="sm"
              variant="tertiary"
              className="h-7 px-2 text-[12px] text-blue-600 hover:text-blue-800"
              onClick={() => window.open(computedPublicUrl, "_blank", "noopener")}
            >
              <ExternalLink size={13} className="mr-1" /> Open Entrance Page
            </Button>
          </div>

          {/* Quick-join with embedded code */}
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-gray-600 flex items-center gap-1">
              <Sparkles size={11} className="text-amber-500" /> Quick-Join Link (Code Pre-Filled)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={quickJoinUrl}
                className="flex-1 px-3 py-1.5 text-[12px] font-mono bg-gray-50 border border-gray-200 rounded-lg text-gray-800 select-all focus:outline-none"
              />
              <Button
                size="sm"
                variant="secondary"
                className="h-8 shrink-0"
                onClick={() => void copyText(quickJoinUrl, "quick_url", "Quick-join link")}
              >
                {copiedKey === "quick_url" ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </Button>
            </div>
            <p className="text-[11px] text-gray-400">
              Students clicking this link land directly on the exam with their access code already filled in.
            </p>
          </div>

          {/* Plain portal link */}
          <div className="space-y-1 pt-1 border-t border-gray-100">
            <label className="text-[11px] font-medium text-gray-600">Standard Exam Link</label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={computedPublicUrl}
                className="flex-1 px-3 py-1.5 text-[12px] font-mono bg-gray-50 border border-gray-200 rounded-lg text-gray-800 select-all focus:outline-none"
              />
              <Button
                size="sm"
                variant="secondary"
                className="h-8 shrink-0"
                onClick={() => void copyText(computedPublicUrl, "std_url", "Exam link")}
              >
                {copiedKey === "std_url" ? <CheckCircle2 size={13} className="text-emerald-600" /> : <Copy size={13} />}
              </Button>
            </div>
          </div>
        </div>

        {/* Timetable & Rules Breakdown */}
        <div className="grid grid-cols-2 gap-3 text-[12px]">
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-gray-500 block text-[11px] font-medium flex items-center gap-1">
              <Calendar size={12} className="text-gray-400" /> Start Schedule (WAT)
            </span>
            <span className="font-medium text-gray-900 block mt-1">
              {fmtLagosDateTime(exam.startsAt)}
            </span>
          </div>
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <span className="text-gray-500 block text-[11px] font-medium flex items-center gap-1">
              <Clock size={12} className="text-gray-400" /> Duration & Pass Mark
            </span>
            <span className="font-medium text-gray-900 block mt-1">
              {exam.durationMin ?? 60} mins {exam.passMark ? `• Pass: ${exam.passMark}%` : ""}
            </span>
          </div>
        </div>

        {/* Big Action: Copy formatted candidate broadcast instructions */}
        <div className="pt-2">
          <Button
            className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-medium py-2.5 h-auto text-[13px] flex items-center justify-center gap-2"
            onClick={() => void copyFullCandidateNotice()}
          >
            {copiedKey === "full_notice" ? (
              <>
                <CheckCircle2 size={16} className="text-emerald-300" />
                Copied Full Instructions to Clipboard!
              </>
            ) : (
              <>
                <FileText size={16} />
                Copy Full Candidate Instructions (for WhatsApp / Email / LMS)
              </>
            )}
          </Button>
          <p className="text-center text-[11px] text-gray-400 mt-1.5">
            Formats a ready-to-broadcast message with exam link, code, schedule, and candidate rules.
          </p>
        </div>
      </div>
    </Modal>
  );
}
