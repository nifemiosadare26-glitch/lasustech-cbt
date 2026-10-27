import { parseDateSafe } from "./browser";

const TZ = "Africa/Lagos";

export const fmtDateTime = (iso?: string | null) => {
  if (!iso) return "—";
  const d = parseDateSafe(iso);
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("en-NG", {
      timeZone: TZ,
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return d.toLocaleString("en-GB");
  }
};

/** "YYYY-MM-DD" (a calendar date, no timezone) -> "1 Oct 2026" */
export const fmtDay = (day?: string | null) => {
  if (!day) return "—";
  const d = parseDateSafe(day.includes("T") ? day : `${day}T00:00:00Z`);
  if (!d) return "—";
  try {
    return new Intl.DateTimeFormat("en-NG", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(d);
  } catch {
    return d.toLocaleDateString("en-GB");
  }
};

export function timeAgo(iso?: string | null) {
  if (!iso) return "Never";
  const d = parseDateSafe(iso);
  if (!d) return "Never";
  const s = Math.max(0, (Date.now() - d.getTime()) / 1000);
  if (s < 60) return "Just now";
  if (s < 3600) return `${Math.floor(s / 60)} min ago`;
  if (s < 86400) return `${Math.floor(s / 3600)} h ago`;
  if (s < 7 * 86400) return `${Math.floor(s / 86400)} d ago`;
  return fmtDateTime(iso);
}

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: "Admin",
  LECTURER: "Lecturer",
  STUDENT: "Student",
};

const ACTION_LABEL: Record<string, string> = {
  "auth.login": "Signed in",
  "user.create": "Created user",
  "user.update": "Updated user",
  "user.delete": "Deleted user",
  "user.import": "Imported users",
  "user.export": "Exported users",
  "user.reset_password": "Reset password",
  "college.create": "Created college",
  "college.update": "Updated college",
  "college.delete": "Deleted college",
  "department.create": "Created department",
  "department.update": "Updated department",
  "department.delete": "Deleted department",
  "programme.create": "Created programme",
  "programme.update": "Updated programme",
  "programme.delete": "Deleted programme",
  "course.create": "Created course",
  "course.update": "Updated course",
  "course.delete": "Deleted course",
  "session.create": "Created session",
  "session.update": "Updated session dates",
  "session.activate": "Made session current",
  "session.close": "Closed session",
  "session.delete": "Deleted session",
  "settings.update": "Changed settings",
  "security.flush_sessions": "Signed out all users",
  "audit.export": "Exported audit log",
};
export const actionLabel = (a: string) => ACTION_LABEL[a] ?? a;

// ---------- CSV ----------
export const toCsv = (rows: (string | number | null | undefined)[][]) =>
  rows
    .map((r) =>
      r
        .map((c) => {
          const s = c == null ? "" : String(c);
          return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
        })
        .join(",")
    )
    .join("\r\n");

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [],
    cell = "",
    quoted = false;
  const t = text.replace(/^\uFEFF/, "");
  const endRow = () => {
    row.push(cell);
    cell = "";
    if (row.some((x) => x.trim() !== "")) rows.push(row);
    row = [];
  };
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (quoted) {
      if (c === '"') {
        if (t[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(cell);
      cell = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && t[i + 1] === "\n") i++;
      endRow();
    } else cell += c;
  }
  endRow();
  return rows;
}

export function downloadText(filename: string, text: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob(["\uFEFF" + text], { type: mime });
  // Cross-browser download support (including legacy IE/Edge if window.navigator.msSaveBlob exists)
  if (typeof window !== "undefined" && (window.navigator as any).msSaveBlob) {
    (window.navigator as any).msSaveBlob(blob, filename);
    return;
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
