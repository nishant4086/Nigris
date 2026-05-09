"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api";
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
      setEmail("");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send reset email"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-6 animate-in fade-in duration-500">
        <div className="w-full max-w-md bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl text-center overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[80px] -z-10" />

          <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Check your email</h1>
          <p className="text-sm text-slate-500 mb-8">
            We've sent a password reset link to <span className="font-bold text-slate-700 dark:text-slate-300">{email}</span>
          </p>

          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              The link will expire in <span className="font-bold">1 hour</span>. If you don't see the email, check your spam folder.
            </p>

            <button
              onClick={() => setSubmitted(false)}
              className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Send another email
            </button>

            <Link
              href="/login"
              className="w-full py-4 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 font-bold rounded-2xl transition-all flex items-center justify-center gap-2 hover:bg-slate-50 dark:hover:bg-[#161616]"
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] p-6 animate-in fade-in duration-500">
      <div className="w-full max-w-md bg-white dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-[2.5rem] p-10 shadow-xl overflow-hidden relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] -z-10" />

        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4 text-white font-black text-xl shadow-lg shadow-blue-600/20">N</div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">Forgot password?</h1>
          <p className="text-sm text-slate-500 mt-2">Enter your email and we'll send you a link to reset it.</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3 text-sm font-bold text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-[#0d0d0d] border border-slate-100 dark:border-slate-900 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 group hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send reset link"}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link
            href="/login"
            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            Remember your password? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
