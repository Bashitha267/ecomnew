"use client";

import React, { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If chunk failed to load due to a new build deployment, automatically reload page
    if (
      error.name === "ChunkLoadError" ||
      /Loading chunk|ChunkLoadError|Failed to fetch dynamically imported module/i.test(
        error.message || ""
      )
    ) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-12 h-12 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center mb-4 text-amber-400">
        ⚠️
      </div>
      <h2 className="text-lg sm:text-xl font-serif tracking-wider uppercase text-white mb-2">
        Atelier Session Notice
      </h2>
      <p className="text-xs text-neutral-400 max-w-md mb-6 font-mono leading-relaxed">
        {error.message || "A temporary asset loading error occurred. Please reload the page."}
      </p>
      <div className="flex space-x-3">
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-white text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          Reload Page
        </button>
        <button
          type="button"
          onClick={() => reset()}
          className="px-6 py-2.5 bg-neutral-900 border border-neutral-800 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
