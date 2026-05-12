"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api";
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  Fingerprint,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Eye,
  EyeOff
} from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import Logo from "@/components/ui/Logo";

export function AuthForm({ defaultMode = "login" }: { defaultMode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(defaultMode);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // MFA State
  const [mfaRequired, setMfaRequired] = useState(false);
  const [mfaUserId, setMfaUserId] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified) setMessage("Email verified successfully! You can now log in.");
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email: email.trim(), password });

      if (res.data.mfaRequired) {
        setMfaUserId(res.data.userId);
        setMfaRequired(true);
      } else {
        localStorage.setItem("token", res.data.token);
        if (res.data.user?.role === "admin") {
          router.replace("/admin");
        } else {
          router.replace("/dashboard");
        }
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Invalid credentials"));
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) return setError("Passwords do not match");

    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/signup", { name, email: email.trim(), password });
      setMessage(res.data.message);
      setMode("login");
    } catch (err) {
      setError(getApiErrorMessage(err, "Registration failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isRecoveryMode ? "/auth/mfa/verify-recovery" : "/auth/mfa/verify-login";
      const payload = isRecoveryMode ? { userId: mfaUserId, code: mfaToken } : { userId: mfaUserId, token: mfaToken };

      const res = await api.post(endpoint, payload);
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      setError("Invalid MFA code");
    } finally {
      setLoading(false);
    }
  };

  const loginWithPasskey = async () => {
    if (!email) return setError("Enter your email to use passkey");
    setLoading(true);
    try {
      const options = await api.post("/auth/passkey/login-options", { email });
      const assertion = await startAuthentication(options.data);
      const res = await api.post("/auth/passkey/login-verify", { email, body: assertion });
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(getApiErrorMessage(err, "Passkey authentication failed"));
    } finally {
      setLoading(false);
    }
  };

  const loginWithOAuth = (provider: "google" | "github") => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/${provider}`;
  };

  if (mfaRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center liquid-shell p-6 animate-in fade-in duration-500" ref={containerRef}>
        <div className="w-full max-w-md glass-card border border-white/20 dark:border-white/10 rounded-[2.5rem] p-10 shadow-xl text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100 mb-2">Two-Step Verification</h1>
          <p className="text-sm text-slate-500 mb-8">
            {isRecoveryMode ? "Enter one of your emergency recovery codes." : "Enter the 6-digit code from your authenticator app."}
          </p>

          <form onSubmit={handleMfaSubmit} className="space-y-6">
            <input
              type="text"
              placeholder={isRecoveryMode ? "RECOVERY-CODE" : "000000"}
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              className="w-full text-center text-2xl font-black tracking-[0.2em] py-4 bg-slate-50 dark:bg-[#0d0d0d] border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
            {error && <p className="text-xs font-bold text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="auth-animate-item w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify Identity
            </button>
          </form>

          <button
            onClick={() => setIsRecoveryMode(!isRecoveryMode)}
            className="mt-6 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            {isRecoveryMode ? "Use authenticator app instead" : "Lost access? Use recovery code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center liquid-shell py-12 px-6">
      <div className="w-full max-w-md glass-card border border-white/20 dark:border-white/10 rounded-[2.5rem] pt-12 p-8 md:p-10 shadow-xl relative">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-[80px] -z-10" />

        <div className="mb-10 text-center">
          <Logo size={80} withText={false} className="justify-center mb-6" />
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {mode === "login" ? "Build, scale and grow with Nigris." : "Join thousands of developers worldwide."}
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl flex items-center gap-3 text-sm font-bold text-emerald-700 dark:text-emerald-400">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/50 rounded-2xl flex items-center gap-3 text-sm font-bold text-red-700 dark:text-red-400">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-4">
          {mode === "signup" && (
            <div className="relative group">
              <input
                type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
                className="w-full pl-12 pr-4 py-4 glass-input rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
              <Loader2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 opacity-0" />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
              className="w-full pl-12 pr-4 py-4 glass-input rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-12 pr-12 py-4 glass-input rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {mode === "login" && (
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="text-xs font-bold text-slate-500 hover:text-blue-600 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          )}

          {mode === "signup" && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full pl-12 pr-12 py-4 glass-input rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="auth-animate-item w-full py-4 gradient-button text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Sign In" : "Get Started"}
            {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="mt-8">
          <div className="relative flex items-center justify-center mb-6">
            <div className="absolute inset-0 flex items-center px-4"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
            <span className="relative bg-white dark:bg-[#111111] px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => loginWithOAuth("google")}
              className="flex text-black hover:cursor-pointer dark:text-white items-center justify-center gap-2 py-3 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#161616] transition-all text-sm font-bold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
              Google
            </button>
            <button
              onClick={() => loginWithOAuth("github")}
              className="flex text-black hover:cursor-pointer dark:text-white items-center justify-center gap-2 py-3 border border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#161616] transition-all text-sm font-bold"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
              GitHub
            </button>
          </div>

          <button
            onClick={loginWithPasskey}
            className="w-full mt-4 flex items-center justify-center gap-2 py-3 bg-indigo-50 dark:bg-indigo-900/10 text-indigo-600 dark:text-indigo-400 rounded-2xl hover:bg-indigo-100 transition-all text-sm font-bold"
          >
            <Fingerprint className="w-5 h-5" />
            Sign in with Passkey
          </button>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors"
          >
            {mode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center liquid-shell p-6 animate-in fade-in duration-500">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    }>
      <AuthForm defaultMode="login" />
    </Suspense>
  );
}
