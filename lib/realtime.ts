"use client";

import { useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";

const REALTIME_URL =
  process.env.NEXT_PUBLIC_REALTIME_URL || "http://localhost:3002";

let socketInstance: Socket | null = null;

export function getRealtimeSocket(): Socket {
  if (typeof window === "undefined") {
    return null as unknown as Socket;
  }

  if (!socketInstance) {
    const token = localStorage.getItem("accessToken");

    socketInstance = io(REALTIME_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    socketInstance.on("connect", () => {
      console.log(`[Realtime Socket] Connected to ${REALTIME_URL} (${socketInstance?.id})`);
    });

    socketInstance.on("connect_error", (err) => {
      console.warn("[Realtime Socket] Connection warning:", err.message);
    });

    socketInstance.on("disconnect", (reason) => {
      console.log("[Realtime Socket] Disconnected:", reason);
    });
  }

  // Update auth token if it changed
  const currentToken = localStorage.getItem("accessToken");
  if (socketInstance.auth && typeof socketInstance.auth === "object") {
    (socketInstance.auth as any).token = currentToken;
  }

  return socketInstance;
}

/**
 * React hook to subscribe to a real-time event.
 */
export function useRealtimeEvent<T = any>(
  event: string,
  callback: (data: T) => void,
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;

  useEffect(() => {
    if (typeof window === "undefined") return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    const handler = (data: T) => {
      cbRef.current(data);
    };

    socket.on(event, handler);

    // If socket is disconnected, ensure it connects
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off(event, handler);
    };
  }, [event]);
}

/**
 * Join an exam/sitting room for live invigilation or sitting updates.
 */
export function useSittingRoom(sittingId: string | null | undefined) {
  useEffect(() => {
    if (!sittingId || typeof window === "undefined") return;

    const socket = getRealtimeSocket();
    if (!socket) return;

    socket.emit("join_sitting", sittingId);

    return () => {
      socket.emit("leave_sitting", sittingId);
    };
  }, [sittingId]);
}
