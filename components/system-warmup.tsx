"use client";

import { useEffect } from "react";

const WARM_ENDPOINTS = [
  "https://backend-lasustech.onrender.com/health",
  "https://realtime-websockets.onrender.com/health",
  "https://background-worker-9ml0.onrender.com/health",
];

export function SystemWarmup() {
  useEffect(() => {
    // Non-blocking background warm-up to ensure zero cold-start delay for users
    const warmUp = () => {
      WARM_ENDPOINTS.forEach((url) => {
        try {
          fetch(url, { method: "GET", mode: "no-cors", cache: "no-store" }).catch(() => {});
        } catch {}
      });
    };

    // Run after idle/mount
    if (typeof window !== "undefined") {
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(warmUp);
      } else {
        setTimeout(warmUp, 1000);
      }
    }
  }, []);

  return null;
}
