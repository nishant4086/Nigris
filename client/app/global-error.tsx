"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="text-6xl">💥</div>
          <h2 className="text-2xl font-bold">Critical Error</h2>
          <p className="text-slate-400">
            The application encountered a critical error. Please refresh the
            page.
          </p>
          <button
            onClick={reset}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
          >
            Refresh page
          </button>
        </div>
      </body>
    </html>
  );
}
