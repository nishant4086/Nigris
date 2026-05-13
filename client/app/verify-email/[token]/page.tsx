"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";

type VerificationState = "loading" | "success" | "error";

export default function VerifyEmailPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const [state, setState] = useState<VerificationState>("loading");
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    if (!token) {
      Promise.resolve().then(() => {
        setState("error");
        setMessage("Invalid or expired link");
      });
      return;
    }

    let cancelled = false;

    const verifyEmail = async () => {
      try {
        const res = await api.get(`/auth/verify-email/${token}`);
        if (cancelled) return;
        setState("success");
        setMessage(res.data?.message || "Email verified successfully. You can now log in.");
      } catch (err) {
        if (cancelled) return;
        setState("error");
        setMessage(getApiErrorMessage(err, "Invalid or expired link"));
      }
    };

    verifyEmail();

    return () => {
      cancelled = true;
    };
  }, [token]);

  const isLoading = state === "loading";
  const isSuccess = state === "success";

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-6">
      <section className="w-full max-w-md bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl text-center">
        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 ${
          isLoading
            ? "bg-blue-100 dark:bg-blue-900/20 text-blue-600"
            : isSuccess
              ? "bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600"
              : "bg-red-100 dark:bg-red-900/20 text-red-600"
        }`}>
          {isLoading && <Loader2 className="w-9 h-9 animate-spin" />}
          {isSuccess && <CheckCircle2 className="w-9 h-9" />}
          {state === "error" && <AlertTriangle className="w-9 h-9" />}
        </div>

        <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-3">
          {isLoading ? "Verifying email" : isSuccess ? "Email verified" : "Verification failed"}
        </h1>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-8">
          {message}
        </p>

        <Link
          href="/login"
          className="inline-flex w-full items-center justify-center py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Go to login
        </Link>
      </section>
    </main>
  );
}
