"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api";
import { Lock, ArrowRight, Loader2, CheckCircle2, AlertTriangle, Eye, EyeOff, ArrowLeft, Sparkles, KeyRound } from "lucide-react";
import Logo from "@/components/ui/Logo";

function FloatingOrb({ className }: { className: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse ${className}`} />
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [validating, setValidating] = useState(true);

  useEffect(() => {
    Promise.resolve().then(() => {
      if (!token) {
        setError("No reset token provided. Please use the link from your email.");
        setValidating(false);
      } else {
        setValidating(false);
      }
    });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    if (password.length < 6) {
      return setError("Password must be at least 6 characters");
    }

    setLoading(true);

    try {
      await api.post("/auth/reset-password", { token, password });
      setSuccess(true);

      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      const errorMsg = getApiErrorMessage(err, "Failed to reset password");
      if (errorMsg.includes("expired")) {
        setError("Reset link has expired. Please request a new one.");
      } else {
        setError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  if (validating) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050510]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  // Invalid / missing token state
  if (!token) {
    return (
      <div className="h-screen flex bg-[#050510] overflow-hidden relative">
        <FloatingOrb className="w-[600px] h-[600px] bg-red-600/8 -top-40 -left-40" />
        <FloatingOrb className="w-[500px] h-[500px] bg-violet-600/6 -bottom-40 -right-40" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="flex-1 flex items-center justify-center px-6 py-8 z-10">
          <div className="w-full max-w-md">
            <div className="flex items-center gap-3 mb-8 justify-center">
              <Logo size={40} withText={false} className="" />
              <span className="text-xl font-extrabold text-white tracking-tight">Nigris</span>
            </div>

            <div className="bg-slate-950/40 border border-white/8 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-red-950/20 relative text-center">
              <div className="w-16 h-16 bg-red-500/10 text-red-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                <AlertTriangle className="w-9 h-9" />
              </div>

              <h1 className="text-2xl font-extrabold text-white mb-2">Invalid link</h1>
              <p className="text-sm text-slate-400 mb-8">
                The password reset link is missing or invalid. Please request a new one.
              </p>

              <Link
                href="/forgot-password"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all inline-flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                Request new link
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
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
              Password Updated
            </div>
            <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-4">
              You&apos;re all
              <br />
              <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                set!
              </span>
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Your password has been updated. You&apos;ll be redirected to the login page shortly.
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

              <h1 className="text-2xl font-extrabold text-white mb-2">Password reset successful!</h1>
              <p className="text-sm text-slate-400 mb-8">
                Your password has been updated. Redirecting to login...
              </p>

              <Link
                href="/login"
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all inline-flex items-center justify-center shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                Go to login
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main reset form
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
            Secure Reset
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-4">
            Create a new
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              password.
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Choose a strong password to keep your account secure. Use a mix of letters, numbers, and special characters.
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

            <div className="mb-8 flex items-start gap-4">
              <div className="w-11 h-11 bg-indigo-500/10 text-indigo-400 rounded-xl flex items-center justify-center border border-indigo-500/20 shrink-0">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-white tracking-tight">Reset password</h1>
                <p className="text-sm text-slate-400 mt-1">Enter your new password below.</p>
              </div>
            </div>

            {error && (
              <div className="mb-5 p-3.5 bg-red-500/8 border border-red-500/20 rounded-xl flex items-center gap-3 text-sm font-semibold text-red-400">
                <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-900/50 border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 outline-none transition-all text-white text-sm placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-11 py-3.5 bg-slate-900/50 border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 outline-none transition-all text-white text-sm placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer mt-1"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Reset password"}
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

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#050510]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
