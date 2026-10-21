"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { apiClient, type ApiError } from "./apiClient";
import { useRealtimeEvent } from "./realtime";

export type NotificationType =
  | "SYSTEM"
  | "EXAM_REMINDER"
  | "STUDENT_DISCONNECT"
  | "OFFICER_APPROVAL"
  | "HEALTH_ALERT"
  | "RESULT_RELEASED";

export interface NotificationMeta {
  kind?: string;
  href?: string;
  sittingId?: string;
  appealId?: string;
  [key: string]: unknown;
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  meta: NotificationMeta | null;
  readAt: string | null;
  createdAt: string;
}

interface NotificationResponse {
  data: NotificationItem[];
  meta?: { unread?: number };
}

const POLL_MS = 30_000;
const LIMIT = 30;

/**
 * Live in-app notifications for the signed-in user.
 *
 * Polls while the tab is visible and refreshes on focus and when the panel is
 * opened. Mutations are optimistic; a failed request silently refetches, which
 * restores the server's truth without showing an error mid-click.
 */
export function useNotifications() {
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Last-write-wins: an older in-flight poll must not overwrite a newer result.
  const seq = useRef(0);

  const load = useCallback(async (quiet = false) => {
    const id = ++seq.current;
    if (!quiet) setLoading(true);
    try {
      const res = await apiClient<NotificationResponse>(`/notifications?limit=${LIMIT}`);
      if (id !== seq.current) return;
      setItems(res.data ?? []);
      setUnread(res.meta?.unread ?? (res.data ?? []).filter((n) => !n.readAt).length);
      setError(null);
    } catch (e) {
      if (id !== seq.current) return;
      setError(e as ApiError);
    } finally {
      if (id === seq.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();

    const tick = () => {
      if (document.visibilityState === "visible") void load(true);
    };
    const onFocus = () => void load(true);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load(true);
    };

    const timer = window.setInterval(tick, POLL_MS);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [load]);

  // Instantly refresh notifications when receiving real-time event from WebSocket
  useRealtimeEvent("notification", () => {
    void load(true);
  });

  const markRead = useCallback(
    async (id: string) => {
      const target = items.find((n) => n.id === id);
      if (!target || target.readAt) return;

      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)),
      );
      setUnread((n) => Math.max(0, n - 1));

      try {
        await apiClient(`/notifications/${id}/read`, { method: "POST" });
      } catch {
        void load(true);
      }
    },
    [items, load],
  );

  const markAllRead = useCallback(async () => {
    if (!unread) return;

    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    setUnread(0);

    try {
      await apiClient("/notifications/read-all", { method: "POST" });
    } catch {
      void load(true);
    }
  }, [unread, load]);

  return { items, unread, loading, error, reload: load, markRead, markAllRead };
}
