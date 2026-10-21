const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

/**
 * Public exams are taken by anonymous candidates. They authenticate with the
 * scoped attempt token issued by POST /public/exams/:slug/start, so this client
 * deliberately has no access-token refresh and never redirects to
 * /session-ended — a failed call is surfaced to the candidate instead.
 */

export interface PublicApiError {
  status?: number;
  code?: string;
  message?: string;
  details?: unknown;
}

export class PublicRequestError extends Error {
  status?: number;
  code?: string;
  details?: unknown;

  constructor(error: PublicApiError) {
    super(error.message || "Something went wrong. Try again.");
    this.name = "PublicRequestError";
    this.status = error.status;
    this.code = error.code;
    this.details = error.details;
  }
}

export async function publicApi<T>(
  endpoint: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers = new Headers(init.headers);
  headers.set("ngrok-skip-browser-warning", "true");
  if (init.body && !(init.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE_URL}${endpoint}`, { ...init, headers });
  if (!res.ok) {
    const json = await res.json().catch(() => ({}));
    throw new PublicRequestError({
      status: res.status,
      code: json.error?.code,
      message: json.error?.message,
      details: json.error?.details,
    });
  }
  return (await res.json().catch(() => ({}))) as T;
}

export function publicErrorMessage(error: unknown): string {
  if (error instanceof PublicRequestError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Check your connection and try again.";
}

// --- Attempt hand-off -------------------------------------------------------
// The attempt token only ever lives in this browser tab. sessionStorage keeps
// it across the landing → attempt navigation without persisting it after the
// tab closes.
export interface PublicAttemptSession {
  attemptId: string;
  token: string;
  name?: string;
}

const sessionKey = (slug: string) => `public-exam:${slug}`;

export function readAttemptSession(slug: string): PublicAttemptSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(sessionKey(slug));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PublicAttemptSession>;
    if (!parsed.attemptId || !parsed.token) return null;
    return { attemptId: parsed.attemptId, token: parsed.token, name: parsed.name };
  } catch {
    return null;
  }
}

export function saveAttemptSession(slug: string, session: PublicAttemptSession) {
  try {
    window.sessionStorage.setItem(sessionKey(slug), JSON.stringify(session));
  } catch {
    // Storage can be unavailable in private windows; the landing page then
    // simply cannot resume after a reload.
  }
}

export function clearAttemptSession(slug: string) {
  try {
    window.sessionStorage.removeItem(sessionKey(slug));
  } catch {
    // ignore
  }
}

// --- Response shapes --------------------------------------------------------
export interface PublicMedia {
  id: string;
  url: string;
  mime: string;
  altText: string;
}

export interface PublicExamMeta {
  slug: string;
  title: string;
  kind: string;
  kindLabel: string;
  course: { id: string; code: string; title: string; level: string | null } | null;
  subject: {
    id: string;
    name: string;
    code: string | null;
    level: string | null;
    institution: string | null;
  } | null;
  ownerLabel: string;
  institutionName: string | null;
  levelLabel: string | null;
  examBoard: string | null;
  instructions: unknown;
  durationMin: number | null;
  passMark: number | null;
  questionCount: number;
  requiresCode: boolean;
  opensAt: string | null;
  closesAt: string | null;
  showResults: boolean;
  allowRetake: boolean;
  state: "NOT_OPEN" | "CLOSED" | "OPEN";
}

export interface PublicQuestion {
  questionVersionId: string;
  position: number;
  sectionId: string;
  marks: number;
  answerFormat: "MCQ_SINGLE" | "MCQ_MULTI" | "MATCHING";
  stem: { text?: string } | null;
  stemMedia: PublicMedia | null;
  stemMediaUrl: string | null;
  options: {
    id: string;
    position: number;
    body: { text?: string } | null;
    media: PublicMedia | null;
    mediaUrl: string | null;
  }[];
  saved: { positions: number[]; flagged: boolean; clientSeq: number } | null;
}

export interface PublicScore {
  showResults: boolean;
  rawScore: number | null;
  maxScore: number | null;
  percent: number | null;
  grade: string | null;
  gradeLabel?: string | null;
  passed: boolean | null;
}

export interface PublicAttempt {
  attemptId: string;
  token: string;
  status: string;
  startedAt: string;
  deadlineAt: string | null;
  remainingSec: number | null;
  questionCount: number;
  totalMarks: number;
  exam: PublicExamMeta;
  questions: PublicQuestion[];
  result: { rawScore: number; maxScore: number; percent: number; grade: string } | null;
  score?: PublicScore;
}
