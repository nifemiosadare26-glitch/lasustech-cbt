"use client";

import * as React from "react";
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ApiError } from "@/lib/apiClient";

export const selectCls =
  "w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500";

export function humanizeError(raw: string): string {
  if (!raw) return "Unable to complete request. Please try again.";
  const lower = raw.toLowerCase();
  if (lower.includes("fetch") || lower.includes("network") || lower.includes("econnrefused") || lower.includes("failed to fetch")) {
    return "Unable to connect to the examination network. Please check your internet connection.";
  }
  if (lower.includes("jwt") || lower.includes("token") || lower.includes("unauthorized") || lower.includes("session expired")) {
    return "Your login session has expired. Please sign in again to continue.";
  }
  if (lower.includes("forbidden") || lower.includes("permission") || lower.includes("access denied")) {
    return "You do not have administrative permission to perform this action.";
  }
  if (lower.includes("not found") || lower.includes("404")) {
    return "The requested record or examination could not be found.";
  }
  if (lower.includes("duplicate") || lower.includes("already exists") || lower.includes("unique constraint") || lower.includes("p2002")) {
    return "A record with these details already exists. Please check and try a different code or identifier.";
  }
  if (lower.includes("cannot be deleted") || lower.includes("foreign key") || lower.includes("p2003")) {
    return "This item cannot be deleted because it is linked to active candidate records or sittings. You can cancel it instead.";
  }
  if (lower.includes("identifier") || lower.includes("credential")) {
    return "Wrong email or password. Please verify and try again.";
  }
  if (lower.includes("500") || lower.includes("internal server error") || lower.includes("crash") || lower.includes("prisma")) {
    return "The system encountered a temporary problem processing this request. Please try again in a moment.";
  }
  return raw;
}

export function errMessage(e: unknown, fallback = "Unable to complete request. Please try again.") {
  const err = e as ApiError | undefined;
  if (!err) return fallback;
  if (err.code === "VALIDATION_FAILED" && Array.isArray(err.details) && err.details.length) {
    const list = (err.details as { path?: (string | number)[]; message?: string }[])
      .slice(0, 3)
      .map((i) => {
        const field = i.path?.length ? String(i.path[i.path.length - 1]) : "";
        const cleanField = field.replace(/([A-Z])/g, " $1").toLowerCase();
        return `${cleanField ? cleanField + ": " : ""}${i.message}`;
      })
      .join(" · ");
    return humanizeError(list);
  }
  return humanizeError(err.message || fallback);
}

// ---------- toast ----------
export function useToast() {
  const [msg, setMsg] = React.useState<{ text: string; tone: "ok" | "err" } | null>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const show = React.useCallback((text: string, tone: "ok" | "err" = "ok") => {
    setMsg({ text, tone });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setMsg(null), tone === "err" ? 6000 : 3500);
  }, []);
  const node = msg ? (
    <div role="status" className="fixed bottom-6 right-6 z-[60] flex max-w-sm items-start gap-2.5 bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700">
      {msg.tone === "ok" ? <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} /> : <AlertCircle className="text-rose-400 shrink-0 mt-0.5" size={18} />}
      <span className="text-[14px] font-medium">{msg.text}</span>
    </div>
  ) : null;
  return { show, node };
}

// ---------- modal ----------
export function Modal({
  title,
  subtitle,
  onClose,
  children,
  footer,
  width = "max-w-md",
  lockDismiss = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  width?: string;
  /** When true, Escape and backdrop click do nothing (used while a request is in flight). */
  lockDismiss?: boolean;
}) {
  const panelRef = React.useRef<HTMLDivElement>(null);
  const previousFocus = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    previousFocus.current = document.activeElement as HTMLElement | null;
    // Focus first focusable control inside the dialog (skip the header X if footer exists).
    const t = setTimeout(() => {
      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;
      // Prefer a footer button over the header close icon when possible
      const footerBtn = panelRef.current?.querySelector<HTMLElement>(
        '[data-modal-footer] button:not([disabled])',
      );
      (footerBtn ?? focusable[0])?.focus();
    }, 0);
    return () => {
      clearTimeout(t);
      previousFocus.current?.focus?.();
    };
  }, []);

  React.useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lockDismiss) onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, lockDismiss]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !lockDismiss) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`bg-white rounded-xl shadow-2xl border border-gray-200 w-full ${width} max-h-[90vh] flex flex-col overflow-hidden`}
      >
        <div className="flex items-start justify-between p-5 border-b border-gray-100 shrink-0">
          <div>
            <h3 className="text-[17px] font-semibold text-gray-900">{title}</h3>
            {subtitle && <p className="text-[12px] text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            disabled={lockDismiss}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md disabled:opacity-40 disabled:pointer-events-none"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && (
          <div
            data-modal-footer
            className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-2 shrink-0"
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmModal({
  title,
  body,
  confirmLabel = "Confirm",
  danger,
  onConfirm,
  onClose,
}: {
  title: string;
  body: React.ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}) {
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const footerRef = React.useRef<HTMLDivElement>(null);

  // Focus Cancel for danger actions, Confirm otherwise.
  // Uses DOM query — no refs on Button (avoids forwardRef issues).
  React.useEffect(() => {
    const t = setTimeout(() => {
      const buttons = footerRef.current?.querySelectorAll<HTMLButtonElement>("button");
      if (!buttons || buttons.length < 2) return;
      // [0] = Cancel, [1] = Confirm
      (danger ? buttons[0] : buttons[1])?.focus();
    }, 10);
    return () => clearTimeout(t);
  }, [danger]);

  const handleConfirm = async () => {
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      // Caller closes the modal on success (so it can show a toast first).
    } catch (e) {
      setError(errMessage(e));
      setPending(false);
    }
  };

  return (
    <Modal title={title} onClose={onClose} lockDismiss={pending}>
      <div className="text-[14px] text-gray-600 leading-relaxed">{body}</div>
      {error && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800"
        >
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}
      {/* Footer buttons live inside children so they always render,
          even if the Modal footer slot has styling quirks. */}
      <div
        ref={footerRef}
        className="mt-6 flex items-center justify-end gap-2 pt-4 border-t border-gray-100"
      >
        <Button type="button" variant="secondary" disabled={pending} onClick={onClose}>
          Cancel
        </Button>
        <Button
          type="button"
          isLoading={pending}
          onClick={handleConfirm}
          className={
            danger
              ? "bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-200 disabled:text-gray-500"
              : "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-200 disabled:text-gray-500"
          }
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

// ---------- generic form modal (values are strings; callers convert) ----------
export type FieldDef = {
  key: string;
  label: string;
  type?: "text" | "number" | "email" | "date" | "select";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
  half?: boolean;
  hint?: string;
  min?: number;
  max?: number;
};

export function FormModal({
  title,
  subtitle,
  fields,
  initial = {},
  submitLabel = "Save",
  onSubmit,
  onClose,
  onDelete,
  extra,
  width,
}: {
  title: string;
  subtitle?: string;
  fields: FieldDef[];
  initial?: Record<string, string>;
  submitLabel?: string;
  onSubmit: (values: Record<string, string>) => Promise<void>;
  onClose: () => void;
  onDelete?: () => Promise<void>;
  extra?: (values: Record<string, string>, set: (k: string, v: string) => void) => React.ReactNode;
  width?: string;
}) {
  const [values, setValues] = React.useState<Record<string, string>>(() => ({
    ...Object.fromEntries(fields.map((f) => [f.key, ""])),
    ...initial,
  }));
  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const set = (k: string, v: string) => setValues((s) => ({ ...s, [k]: v }));

  const run = async (fn: () => Promise<void>) => {
    setPending(true);
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      title={title}
      subtitle={subtitle}
      onClose={onClose}
      width={width}
      lockDismiss={pending}
      footer={
        <>
          {onDelete && (
            <Button
              type="button"
              variant="danger-outline"
              className="mr-auto"
              disabled={pending}
              onClick={() => run(onDelete)}
            >
              <Trash2 size={14} className="mr-1.5" />
              Delete
            </Button>
          )}
          <Button type="button" variant="secondary" disabled={pending} onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form="form-modal" isLoading={pending}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form
        id="form-modal"
        onSubmit={(e) => {
          e.preventDefault();
          run(() => onSubmit(values));
        }}
        className="grid grid-cols-2 gap-3"
      >
        {fields.map((f) => (
          <div key={f.key} className={f.half ? "col-span-1" : "col-span-2"}>
            <label htmlFor={`f-${f.key}`} className="text-[13px] font-medium text-gray-700 block mb-1">
              {f.label} {f.required && <span className="text-red-500">*</span>}
            </label>
            {f.type === "select" ? (
              <select
                id={`f-${f.key}`}
                className={selectCls}
                value={values[f.key]}
                required={f.required}
                onChange={(e) => set(f.key, e.target.value)}
              >
                {f.options?.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : (
              <Input
                id={`f-${f.key}`}
                type={f.type ?? "text"}
                required={f.required}
                placeholder={f.placeholder}
                min={f.min}
                max={f.max}
                value={values[f.key]}
                onChange={(e) => set(f.key, e.target.value)}
              />
            )}
            {f.hint && <p className="text-[12px] text-gray-500 mt-1">{f.hint}</p>}
          </div>
        ))}
        {extra && <div className="col-span-2">{extra(values, set)}</div>}
        {error && (
          <div
            role="alert"
            className="col-span-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] text-red-800"
          >
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </form>
    </Modal>
  );
}

// ---------- misc ----------
export function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (p: number) => void;
}) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  return (
    <div className="p-4 border-t border-gray-100 flex items-center justify-between text-[13px] text-gray-500 bg-white shrink-0">
      <span>
        Showing <strong className="text-gray-900">{from}</strong> to{" "}
        <strong className="text-gray-900">{Math.min(page * pageSize, total)}</strong> of{" "}
        <strong className="text-gray-900">{total.toLocaleString()}</strong>
      </span>
      <div className="flex items-center gap-2">
        <span className="text-[12px] mr-2">
          Page {page} of {totalPages}
        </span>
        <Button type="button" variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft size={14} className="mr-1" />
          Previous
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page >= totalPages}
          onClick={() => onPage(page + 1)}
        >
          Next
          <ChevronRight size={14} className="ml-1" />
        </Button>
      </div>
    </div>
  );
}

export function ErrorBanner({ error, onRetry }: { error: ApiError; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex items-center justify-between gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-[14px] text-red-800"
    >
      <span className="flex items-center gap-2">
        <AlertCircle size={16} />
        {errMessage(error, "Could not load data.")}
      </span>
      {onRetry && (
        <Button size="sm" variant="secondary" onClick={onRetry}>
          Retry
        </Button>
      )}
    </div>
  );
}