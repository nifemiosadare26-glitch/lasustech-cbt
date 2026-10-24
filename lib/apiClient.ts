export function getApiBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host !== "localhost" && host !== "127.0.0.1") {
      return "/api/v1";
    }
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}/api/v1`;
  }
  return "http://localhost:3001/api/v1";
}

const API_BASE_URL = getApiBaseUrl();

/** API root without the versioned path, used to resolve /api/v1/media/:id. */
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/v\d+\/?$/, "");

/**
 * Question figures are returned as API-relative paths (/api/v1/media/:id) so
 * the backend never hard-codes a host. Rendered with <img>, not next/image, so
 * the API host does not need adding to images.remotePatterns.
 */
export function mediaSrc(url: string | null | undefined): string | null {
  if (!url) return null;
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return `${API_ORIGIN}${url.startsWith("/") ? "" : "/"}${url}`;
}

export type ApiError = {
  status?: number;
  code?: string;
  message?: string;
  details?: unknown;
};

const getToken = () => (typeof window !== "undefined" ? localStorage.getItem("accessToken") : null);

let refreshing: Promise<string | null> | null = null;
function refreshAccessToken(): Promise<string | null> {
  refreshing ??= (async () => {
    try {
      const storedRefresh = typeof window !== "undefined" ? localStorage.getItem("refreshToken") : null;
      const baseUrl = getApiBaseUrl();
      const res = await fetch(`${baseUrl}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(storedRefresh ? { "x-refresh-token": storedRefresh } : {}),
        },
        body: JSON.stringify({ refreshToken: storedRefresh }),
        credentials: "include",
      });
      if (!res.ok) return null;
      const json = await res.json().catch(() => ({}));
      const token = json?.data?.accessToken as string | undefined;
      const nextRefresh = json?.data?.refreshToken as string | undefined;
      if (token && typeof window !== "undefined") {
        localStorage.setItem("accessToken", token);
        if (nextRefresh) localStorage.setItem("refreshToken", nextRefresh);
      }
      return token ?? null;
    } catch {
      return null;
    } finally {
      setTimeout(() => { refreshing = null; }, 0);
    }
  })();
  return refreshing;
}

function endSession() {
  if (typeof window === "undefined") return;
  const token = localStorage.getItem("accessToken") || "";
  if (token.startsWith("lasu_") || token.startsWith("demo_")) {
    return;
  }
  // Never redirect candidates out of an ongoing examination attempt on transient auth issues
  if (window.location.pathname.startsWith("/student/exam")) {
    return;
  }
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  if (!window.location.pathname.startsWith("/login")) window.location.assign("/session-ended");
}

async function request(endpoint: string, options: RequestInit, canRetry = true): Promise<Response> {
  const headers = new Headers(options.headers);
  headers.set("ngrok-skip-browser-warning", "true");
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const baseUrl = getApiBaseUrl();
  const res = await fetch(`${baseUrl}${endpoint}`, { ...options, headers, credentials: "include" });

  // Access token expired: refresh once, then retry. Never for /auth/* calls.
  if (res.status === 401 && canRetry && !endpoint.startsWith("/auth/")) {
    // If another concurrent request already refreshed the token in localStorage, retry with it
    const currentToken = getToken();
    if (currentToken && currentToken !== token) {
      return request(endpoint, options, false);
    }

    const fresh = await refreshAccessToken();
    if (fresh) return request(endpoint, options, false);
    endSession();
  }
  return res;
}

const toError = async (res: Response): Promise<ApiError> => {
  const json = await res.json().catch(() => ({}));
  return { status: res.status, code: json.error?.code, message: json.error?.message, details: json.error?.details };
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiClient<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await request(endpoint, options);
  if (!res.ok) throw await toError(res);
  return (await res.json().catch(() => ({}))) as T;
}

/** Fetches a file (CSV etc.) with auth and triggers a browser download. */
export async function apiDownload(endpoint: string, filename: string) {
  const res = await request(endpoint, {});
  if (!res.ok) throw await toError(res);
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
