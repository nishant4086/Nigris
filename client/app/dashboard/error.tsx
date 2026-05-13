"use client";

import { useEffect } from "react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="max-w-md w-full text-center space-y-5">
        <div className="text-5xl">🔧</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
          Dashboard Error
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Something went wrong loading this page. Your data is safe.
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
}
