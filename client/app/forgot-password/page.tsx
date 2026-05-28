"use client";

import { useState } from "react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api";
import { Mail, ArrowRight, Loader2, CheckCircle2, AlertTriangle, ArrowLeft, Sparkles } from "lucide-react";
import Logo from "@/components/ui/Logo";

function FloatingOrb({ className }: { className: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse ${className}`} />
  );
}

export default function ForgotPasswordPage() {
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
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send reset email"));
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="h-screen flex bg-[#050510] overflow-hidden relative">
        <FloatingOrb className="w-[600px] h-[600px] bg-emerald-600/8 -top-40 -left-40" />
        <FloatingOrb className="w-[500px] h-[500px] bg-cyan-600/6 -bottom-40 -right-40" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        {/* Left Branding Panel */}
        <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 z-10">
          <div className="flex items-center gap-3">
            <Logo size={44} withText={false} className="" />
            <span className="text-2xl font-extrabold text-white tracking-tight">Nigris</span>
          </div>
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-xs font-bold text-emerald-400 w-fit mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Account Recovery
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-4">
              Check your
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                inbox.
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              We&apos;ve sent a password reset link to your email. Click the link to set a new password and regain access.
            </p>
          </div>
          <p className="text-xs text-slate-600">© {new Date().getFullYear()} Nigris. All rights reserved.</p>
        </div>

        {/* Right Success Card */}
        <div className="flex-1 flex items-center justify-center px-6 py-8 z-10">
          <div className="w-full max-w-md">
            <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
              <Logo size={40} withText={false} className="" />
              <span className="text-xl font-extrabold text-white tracking-tight">Nigris</span>
            </div>

            <div className="bg-slate-950/40 border border-white/8 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-emerald-950/20 relative text-center">
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

              <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <h1 className="text-2xl font-extrabold text-white mb-2">Check your email</h1>
              <p className="text-sm text-slate-400 mb-8">
                We&apos;ve sent a password reset link. The link expires in <span className="font-bold text-slate-300">1 hour</span>.
              </p>

              <div className="space-y-3">
                <button
                  onClick={() => setSubmitted(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/20 cursor-pointer"
                >
                  Send another email
                </button>

                <Link
                  href="/login"
                  className="w-full py-3.5 bg-slate-900/40 border border-white/8 text-slate-300 font-semibold rounded-xl transition-all flex items-center justify-center gap-2 hover:bg-slate-800/60 hover:border-white/15"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#050510] overflow-hidden relative">
      <FloatingOrb className="w-[600px] h-[600px] bg-indigo-600/8 -top-40 -left-40" />
      <FloatingOrb className="w-[500px] h-[500px] bg-violet-600/6 -bottom-40 -right-40" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Left Branding Panel */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 z-10">
        <div className="flex items-center gap-3">
          <Logo size={44} withText={false} className="" />
          <span className="text-2xl font-extrabold text-white tracking-tight">Nigris</span>
        </div>
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400 w-fit mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Account Recovery
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-4">
            Forgot your
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              password?
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            No worries. Enter your email and we&apos;ll send a reset link so you can get back into your account in seconds.
          </p>
        </div>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} Nigris. All rights reserved.</p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 z-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Logo size={40} withText={false} className="" />
            <span className="text-xl font-extrabold text-white tracking-tight">Nigris</span>
          </div>

          <div className="bg-slate-950/40 border border-white/8 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-indigo-950/20 relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset your password</h1>
              <p className="text-sm text-slate-400 mt-1.5">Enter your email and we&apos;ll send you a reset link.</p>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-500/8 border border-red-500/20 rounded-xl flex items-center gap-3 text-sm font-semibold text-red-400">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 outline-none transition-all text-white text-sm placeholder:text-slate-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send reset link"}
                {!loading && <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-slate-500 hover:text-indigo-400 transition-colors inline-flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
