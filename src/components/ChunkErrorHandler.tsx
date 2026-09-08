"use client";

import { useEffect } from "react";

/**
 * Handles ChunkLoadError caused by Turbopack/Next.js dev chunk hash invalidation.
 * Automatically performs a clean window reload so users never get stuck on a 404
 * or broken state during client-side navigation after rebuilds.
 */
export function ChunkErrorHandler() {
  useEffect(() => {
    const handleChunkError = (message: string) => {
      if (
        message.includes("ChunkLoadError") ||
        message.includes("Failed to load chunk") ||
        message.includes("Loading chunk")
      ) {
        const lastReload = sessionStorage.getItem("cv_chunk_reload_ts");
        const now = Date.now();
        // Guard against infinite reload loops (limit to once every 8 seconds)
        if (!lastReload || now - Number(lastReload) > 8000) {
          sessionStorage.setItem("cv_chunk_reload_ts", String(now));
          window.location.reload();
        }
      }
    };

    const onError = (e: ErrorEvent) => {
      handleChunkError(e?.message || "");
    };

    const onUnhandledRejection = (e: PromiseRejectionEvent) => {
      const reason = e?.reason?.message || String(e?.reason || "");
      handleChunkError(reason);
    };

    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onUnhandledRejection);

    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
    };
  }, []);

  return null;
}
