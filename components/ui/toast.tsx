"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Milliseconds before auto-dismiss. 0 keeps it until dismissed. */
  duration?: number;
};

type Toast = ToastInput & { id: number; variant: ToastVariant };

type ToastContextValue = { toast: (input: ToastInput) => void };

const ToastContext = React.createContext<ToastContextValue | null>(null);

/**
 * The tokens here are the theme-aware ones (`bg-white` reads `--theme-white`,
 * which flips under `.dark`), so a toast inherits the surface of whichever scope
 * raised it — the admin's dark dashboard gets a dark toast, not a white card.
 */
const VARIANT_STYLES: Record<ToastVariant, { box: string; icon: string }> = {
  success: { box: "border-success/40 bg-success-tint", icon: "text-success-ink" },
  error: { box: "border-danger/40 bg-danger-tint", icon: "text-danger-ink" },
  info: { box: "border-gray-200 bg-white", icon: "text-blue-600" },
};

const VARIANT_ICON = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const DEFAULT_DURATION = 5000;
const MAX_VISIBLE = 4;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const nextId = React.useRef(1);
  const timers = React.useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = React.useCallback((id: number) => {
    setToasts((current) => current.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = React.useCallback(
    (input: ToastInput) => {
      const id = nextId.current++;
      const entry: Toast = { ...input, id, variant: input.variant ?? "info" };

      // Newest first, and never let the stack grow without bound — a burst of
      // import failures would otherwise cover the page.
      setToasts((current) => [entry, ...current].slice(0, MAX_VISIBLE));

      const duration = input.duration ?? DEFAULT_DURATION;
      if (duration > 0) {
        timers.current.set(id, setTimeout(() => dismiss(id), duration));
      }
    },
    [dismiss],
  );

  // Clear pending timers on unmount so a dismissed provider cannot fire into
  // an unmounted tree.
  React.useEffect(() => {
    const pending = timers.current;
    return () => {
      pending.forEach(clearTimeout);
      pending.clear();
    };
  }, []);

  const value = React.useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        // Announce politely: a success toast should not interrupt a screen
        // reader mid-sentence, but it must still be read.
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(24rem,calc(100vw-2rem))] flex-col gap-2"
      >
        {toasts.map((t) => {
          const Icon = VARIANT_ICON[t.variant];
          const styles = VARIANT_STYLES[t.variant];
          return (
            <div
              key={t.id}
              role={t.variant === "error" ? "alert" : "status"}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-3.5 shadow-lg",
                "animate-in fade-in slide-in-from-bottom-2 duration-200",
                styles.box,
              )}
            >
              <Icon size={18} className={cn("mt-0.5 shrink-0", styles.icon)} aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-gray-900">{t.title}</p>
                {t.description && (
                  <p className="mt-0.5 text-[13px] text-gray-600 break-words">{t.description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                className="shrink-0 rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

/**
 * Returns a no-op when there is no provider rather than throwing, so a shared
 * component can call it from a screen rendered outside the shell.
 */
export function useToast(): ToastContextValue {
  const ctx = React.useContext(ToastContext);
  return ctx ?? { toast: () => {} };
}
