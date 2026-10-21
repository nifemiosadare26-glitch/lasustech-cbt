"use client";

import * as React from "react";
import { apiClient, type ApiError } from "./apiClient";
import { useToast } from "@/components/ui/toast";

/** Field name -> message, for rendering under the offending input. */
export type FieldErrors = Record<string, string>;

/**
 * Pulls per-field messages out of a zod failure.
 *
 * The API answers `error.details` with the raw zod `issues` array
 * (apps/api/src/main.ts), and each issue carries a `path` and a `message`. The
 * shape is whatever zod produced, so every read is guarded — a `details` payload
 * from some other error type must not throw here.
 */
export function fieldErrorsFrom(details: unknown): FieldErrors {
  if (!Array.isArray(details)) return {};

  const errors: FieldErrors = {};
  for (const issue of details) {
    if (!issue || typeof issue !== "object") continue;
    const { path, message } = issue as { path?: unknown; message?: unknown };
    if (typeof message !== "string") continue;
    // A path is a list of keys; join nested ones so `semesters.first.endsOn`
    // stays addressable as a single form field.
    const key = Array.isArray(path) ? path.join(".") : typeof path === "string" ? path : "";
    // First message wins: zod reports the outermost failure first, which is the
    // one worth showing.
    if (key && !errors[key]) errors[key] = message;
  }
  return errors;
}

export type RunOptions<T, M> = {
  /** Toast title on success, e.g. "Session closed". Omit to stay silent. */
  success?: string;
  /** Replaces the API's message when the request fails. */
  failure?: string;
  /**
   * Applies the change to local state immediately and returns an undo. The undo
   * runs if the request fails, so the UI never keeps a change the server
   * rejected. Return `undefined` when there is nothing to roll back.
   */
  optimistic?: () => (() => void) | undefined;
  /**
   * Called after a successful request — refetch here, or navigate. `meta` is the
   * response envelope's second half, which carries things the caller needs but
   * that are not the record itself: a generated temporary password on user
   * creation, or the session promoted when one is closed.
   */
  onSuccess?: (data: T, meta: M | undefined) => void | Promise<void>;
  /** Called after a failed request, for anything the toast cannot express. */
  onError?: (error: ApiError) => void;
};

/** The API's response envelope, as returned to the caller on success. */
export type ActionResult<T, M> = { data: T; meta?: M };

/**
 * Runs a mutation and gives every call the same three reactions: a pending flag
 * for the button, a toast for the outcome, and field-level errors for the form.
 *
 * `reload` from useApi is the usual `onSuccess`, which is what makes an action
 * visibly change the list behind it.
 */
export function useAction() {
  const { toast } = useToast();
  const [pending, setPending] = React.useState(false);
  const [fieldErrors, setFieldErrors] = React.useState<FieldErrors>({});

  // A page that unmounts mid-request must not set state afterwards.
  const alive = React.useRef(true);
  React.useEffect(() => {
    alive.current = true;
    return () => { alive.current = false; };
  }, []);

  const clearFieldErrors = React.useCallback(() => setFieldErrors({}), []);

  const run = React.useCallback(
    async <T, M = unknown>(
      endpoint: string,
      options: RequestInit & RunOptions<T, M> = {},
    ): Promise<ActionResult<T, M> | null> => {
      const { success, failure, optimistic, onSuccess, onError, ...init } = options;

      setPending(true);
      setFieldErrors({});
      const rollback = optimistic?.();

      try {
        const body = init.body;
        const response = await apiClient<ActionResult<T, M>>(endpoint, {
          ...init,
          headers: {
            ...(body && !(body instanceof FormData) ? { "Content-Type": "application/json" } : {}),
            ...init.headers,
          },
        });

        if (!alive.current) return null;

        if (success) toast({ title: success, variant: "success" });
        await onSuccess?.(response.data, response.meta);
        return response;
      } catch (e) {
        const error = e as ApiError;
        if (!alive.current) return null;

        rollback?.();

        // Prefer the server's message; it is written for the user already
        // ("Those dates overlap with session 2025/2026.").
        const message = failure ?? error?.message ?? "Something went wrong. Please try again.";
        toast({ title: message, variant: "error" });

        const fields = fieldErrorsFrom(error?.details);
        setFieldErrors(fields);

        onError?.(error);
        return null;
      } finally {
        if (alive.current) setPending(false);
      }
    },
    [toast],
  );

  return { run, pending, fieldErrors, clearFieldErrors };
}
