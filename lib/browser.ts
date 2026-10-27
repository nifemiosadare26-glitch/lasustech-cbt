/**
 * Cross-Browser Compatibility Utility Library for LASUSTECH CBT
 * Standardizes browser APIs across Chrome, Safari, Firefox, Edge, Opera, Samsung Internet, iOS WebKit & Android Blink.
 */

// --- 1. Clipboard Copy with Legacy Fallback ---------------------------------
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // Modern Async Clipboard API (Secure Context)
  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fallback below
    }
  }

  // Legacy DOM Fallback (Non-secure context, HTTP in exam hall LANs, older Safari/Firefox)
  if (typeof document !== "undefined") {
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.top = "-9999px";
      textarea.style.left = "-9999px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);

      // iOS Safari selection range handling
      const isIOS = typeof navigator !== "undefined" && /iPad|iPhone|iPod/.test(navigator.userAgent);
      if (isIOS) {
        const range = document.createRange();
        range.selectNodeContents(textarea);
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
        }
        textarea.setSelectionRange(0, 999999);
      } else {
        textarea.select();
      }

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);
      return successful;
    } catch {
      return false;
    }
  }

  return false;
}

// --- 2. Fullscreen Multi-Vendor API -----------------------------------------
export function isFullscreen(): boolean {
  if (typeof document === "undefined") return false;
  const doc = document as any;
  return Boolean(
    doc.fullscreenElement ||
    doc.webkitFullscreenElement ||
    doc.mozFullScreenElement ||
    doc.msFullscreenElement
  );
}

export async function requestFullscreen(elem?: HTMLElement | null): Promise<void> {
  if (typeof document === "undefined") return;
  const el = (elem || document.documentElement) as any;
  if (!el) return;

  try {
    if (el.requestFullscreen) {
      await el.requestFullscreen();
    } else if (el.webkitRequestFullscreen) {
      await el.webkitRequestFullscreen();
    } else if (el.webkitRequestFullScreen) {
      await el.webkitRequestFullScreen();
    } else if (el.mozRequestFullScreen) {
      await el.mozRequestFullScreen();
    } else if (el.msRequestFullscreen) {
      await el.msRequestFullscreen();
    }
  } catch {
    // User denied or browser restriction (e.g. mobile Safari non-video element)
  }
}

export async function exitFullscreen(): Promise<void> {
  if (typeof document === "undefined") return;
  const doc = document as any;

  try {
    if (doc.exitFullscreen) {
      await doc.exitFullscreen();
    } else if (doc.webkitExitFullscreen) {
      await doc.webkitExitFullscreen();
    } else if (doc.webkitCancelFullScreen) {
      await doc.webkitCancelFullScreen();
    } else if (doc.mozCancelFullScreen) {
      await doc.mozCancelFullScreen();
    } else if (doc.msExitFullscreen) {
      await doc.msExitFullscreen();
    }
  } catch {
    // Ignore error
  }
}

export function onFullscreenChange(callback: (isFullscreenActive: boolean) => void): () => void {
  if (typeof document === "undefined") return () => {};

  const handler = () => {
    callback(isFullscreen());
  };

  const events = [
    "fullscreenchange",
    "webkitfullscreenchange",
    "mozfullscreenchange",
    "MSFullscreenChange",
  ];

  events.forEach((evt) => {
    document.addEventListener(evt, handler, false);
  });

  return () => {
    events.forEach((evt) => {
      document.removeEventListener(evt, handler, false);
    });
  };
}

// --- 3. Safe Storage (handles Private Browsing Quota/Security Errors) ---------
const inMemoryStore = new Map<string, string>();

export const safeLocalStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.localStorage.getItem(key);
    } catch {
      return inMemoryStore.get(key) ?? null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(key, value);
    } catch {
      inMemoryStore.set(key, value);
    }
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {
      inMemoryStore.delete(key);
    }
  },
};

export const safeSessionStorage = {
  getItem(key: string): string | null {
    if (typeof window === "undefined") return null;
    try {
      return window.sessionStorage.getItem(key);
    } catch {
      return inMemoryStore.get(`session_${key}`) ?? null;
    }
  },
  setItem(key: string, value: string): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.setItem(key, value);
    } catch {
      inMemoryStore.set(`session_${key}`, value);
    }
  },
  removeItem(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.sessionStorage.removeItem(key);
    } catch {
      inMemoryStore.delete(`session_${key}`);
    }
  },
};

// --- 4. Cross-Browser Date Parser (Safari SQL Datetime Normalizer) -----------
export function parseDateSafe(val?: string | number | Date | null): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isNaN(val.getTime()) ? null : val;
  if (typeof val === "number") {
    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }
  let str = String(val).trim();
  // Safari treats "YYYY-MM-DD HH:mm:ss" as Invalid Date; convert space to 'T'
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}/.test(str)) {
    str = str.replace(/\s+/, "T");
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

// --- 5. Browser Environment Detectors ---------------------------------------
export const isBrowser = typeof window !== "undefined";

export const getBrowserInfo = () => {
  if (!isBrowser) return { name: "server", isSafari: false, isIOS: false, isFirefox: false, isChrome: false };
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua);
  const isFirefox = /firefox/i.test(ua);
  const isChrome = /chrome|crios/i.test(ua) && !isSafari;

  return {
    name: isFirefox ? "firefox" : isSafari ? "safari" : isChrome ? "chrome" : "other",
    isSafari,
    isIOS,
    isFirefox,
    isChrome,
  };
};
