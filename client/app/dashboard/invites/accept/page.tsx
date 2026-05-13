"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      Promise.resolve().then(() => {
        setError("No invitation token provided.");
        setLoading(false);
      });
      return;
    }

    const accept = async () => {
      try {
        const res = await api.post("/projects/invites/accept-token", { token });
        // No need for setSuccess(true) as we use loading and error states to determine success
        // Automatically redirect after 3 seconds
        setTimeout(() => {
          router.push(`/dashboard/collections?project=${res.data.projectId}`);
        }, 3000);
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to accept invitation. The link may be expired or invalid."));
      } finally {
        setLoading(false);
      }
    };

    accept();
  }, [token, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <div className="w-full max-w-md bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        {loading ? (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Validating Invitation...</h2>
            <p className="text-slate-500 text-sm">Please wait while we add you to the project.</p>
          </div>
        ) : error ? (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <XCircle className="w-16 h-16 text-red-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Invite Error</h2>
            <p className="text-slate-500 text-sm">{error}</p>
            <button 
              onClick={() => router.push("/dashboard")}
              className="w-full py-3 bg-slate-900 dark:bg-white dark:text-slate-900 text-white font-bold rounded-xl mt-4 hover:opacity-90 transition-opacity"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Success!</h2>
            <p className="text-slate-500 text-sm">
              You&apos;ve successfully joined the project. You&apos;ll be redirected to the project dashboard in a few seconds...
            </p>
            <div className="pt-4">
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full animate-[progress_3s_linear_forwards]" />
              </div>
            </div>
          </div>
        )}
      </div>
      
      <style jsx>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    }>
      <AcceptInviteContent />
    </Suspense>
  );
}
