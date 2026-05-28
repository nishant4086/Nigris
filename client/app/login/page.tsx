"use client";

import { useState, useEffect, Suspense } from "react";
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
  EyeOff,
  Sparkles,
  Zap,
  Shield,
  Globe
} from "lucide-react";
import { startAuthentication } from "@simplewebauthn/browser";
import Logo from "@/components/ui/Logo";

// Floating animated orb component
function FloatingOrb({ className }: { className: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl pointer-events-none animate-pulse ${className}`} />
  );
}

export function AuthForm({ defaultMode = "login" }: { defaultMode?: "login" | "signup" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState(defaultMode);
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
    if (verified) {
      // Use a microtask to avoid the synchronous setState warning
      Promise.resolve().then(() => {
        setMessage("Email verified successfully! You can now log in.");
      });
    }
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

  const handleResendVerification = async () => {
    if (!email) return setError("Please enter your email address first");
    
    setLoading(true);
    setError("");
    setMessage("");
    
    try {
      const res = await api.post("/auth/resend-verification", { email: email.trim() });
      setMessage(res.data.message || "Verification email sent! Please check your inbox.");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to resend verification email"));
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
    } catch {
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
      const assertion = await startAuthentication({ optionsJSON: options.data });
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

  // MFA Screen
  if (mfaRequired) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#050510] p-6 overflow-hidden relative">
        <FloatingOrb className="w-96 h-96 bg-indigo-600/15 top-0 -left-20" />
        <FloatingOrb className="w-72 h-72 bg-violet-600/10 bottom-10 right-10" />

        <div className="w-full max-w-md bg-slate-950/50 border border-white/10 rounded-3xl p-10 shadow-2xl shadow-indigo-950/30 backdrop-blur-xl text-center relative z-10">
          <div className="w-16 h-16 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/20">
            <ShieldCheck className="w-9 h-9" />
          </div>
          <h1 className="text-2xl font-extrabold text-white mb-2">Two-Step Verification</h1>
          <p className="text-sm text-slate-400 mb-8">
            {isRecoveryMode ? "Enter one of your emergency recovery codes." : "Enter the 6-digit code from your authenticator app."}
          </p>

          <form onSubmit={handleMfaSubmit} className="space-y-6">
            <input
              type="text"
              placeholder={isRecoveryMode ? "RECOVERY-CODE" : "000000"}
              value={mfaToken}
              onChange={(e) => setMfaToken(e.target.value)}
              className="w-full text-center text-2xl font-extrabold tracking-[0.2em] py-4 bg-slate-900/60 border border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none text-white placeholder:text-slate-600"
              required
            />
            {error && <p className="text-xs font-bold text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              Verify Identity
            </button>
          </form>

          <button
            onClick={() => setIsRecoveryMode(!isRecoveryMode)}
            className="mt-6 text-xs font-bold text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
          >
            {isRecoveryMode ? "Use authenticator app instead" : "Lost access? Use recovery code"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[#050510] overflow-hidden relative">
      {/* Background Effects */}
      <FloatingOrb className="w-[600px] h-[600px] bg-indigo-600/8 -top-40 -left-40" />
      <FloatingOrb className="w-[500px] h-[500px] bg-violet-600/6 -bottom-40 -right-40" />
      <FloatingOrb className="w-80 h-80 bg-cyan-500/5 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

      {/* Left Branding Panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-[45%] relative flex-col justify-between p-12 z-10">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <Logo size={44} withText={false} className="" />
          <span className="text-2xl font-extrabold text-white tracking-tight">Nigris</span>
        </div>

        {/* Center branding */}
        <div className="flex-1 flex flex-col justify-center max-w-md">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-xs font-bold text-indigo-400 w-fit mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Developer Platform
          </div>
          <h2 className="text-4xl font-extrabold text-white leading-[1.15] tracking-tight mb-4">
            Build APIs at
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              lightning speed.
            </span>
          </h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10">
            Ship backend APIs, manage API keys, monitor traffic, and scale your platform — all from one beautiful dashboard.
          </p>

          {/* Feature pills */}
          <div className="space-y-3">
            {[
              { icon: Zap, text: "Zero-config API key management", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
              { icon: Shield, text: "Enterprise-grade security & MFA", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
              { icon: Globe, text: "Global edge network with analytics", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
            ].map((feature) => (
              <div key={feature.text} className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${feature.color}`}>
                  <feature.icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-slate-300 font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-xs text-slate-600">
          © {new Date().getFullYear()} Nigris. All rights reserved.
        </p>
      </div>

      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 z-10 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <Logo size={40} withText={false} className="" />
            <span className="text-xl font-extrabold text-white tracking-tight">Nigris</span>
          </div>

          {/* Form Card */}
          <div className="bg-slate-950/40 border border-white/8 rounded-3xl p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-indigo-950/20 relative">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="mb-8">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                {mode === "login" ? "Welcome back" : "Create account"}
              </h1>
              <p className="text-sm text-slate-400 mt-1.5">
                {mode === "login" ? "Sign in to your Nigris account." : "Join thousands of developers worldwide."}
              </p>
            </div>

            {message && (
              <div className="mb-5 p-3.5 bg-emerald-500/8 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-sm font-semibold text-emerald-400">
                <CheckCircle2 className="w-4.5 h-4.5 shrink-0" />
                {message}
              </div>
            )}

            {error && (
              <div className="mb-5 p-3.5 bg-red-500/8 border border-red-500/20 rounded-xl space-y-2.5">
                <div className="flex items-center gap-3 text-sm font-semibold text-red-400">
                  <AlertTriangle className="w-4.5 h-4.5 shrink-0" />
                  {error}
                </div>
                {error.includes("verify your email") && (
                  <button 
                    onClick={handleResendVerification}
                    disabled={loading}
                    className="text-xs font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 hover:underline disabled:no-underline cursor-pointer"
                  >
                    Resend verification link?
                  </button>
                )}
              </div>
            )}

            <form onSubmit={mode === "login" ? handleLogin : handleSignup} className="space-y-3.5">
              {mode === "signup" && (
                <div className="relative group">
                  <input
                    type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 outline-none transition-all text-white text-sm placeholder:text-slate-500"
                  />
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 flex items-center justify-center text-xs font-bold">👤</div>
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-900/50 border border-white/8 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/40 outline-none transition-all text-white text-sm placeholder:text-slate-500"
                />
              </div>

              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
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

              {mode === "login" && (
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-slate-500 hover:text-indigo-400 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
              )}

              {mode === "signup" && (
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
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 group disabled:opacity-50 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer mt-1"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : mode === "login" ? "Sign In" : "Get Started"}
                {!loading && <ArrowRight className="w-4.5 h-4.5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

            {/* Divider */}
            <div className="mt-6 mb-5">
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/6"></div></div>
                <span className="relative bg-slate-950/40 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">Or continue with</span>
              </div>
            </div>

            {/* OAuth Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => loginWithOAuth("google")}
                className="flex items-center justify-center gap-2 py-3 bg-slate-900/40 border border-white/8 rounded-xl hover:bg-slate-800/60 hover:border-white/15 transition-all text-sm font-semibold text-slate-300 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                Google
              </button>
              <button
                onClick={() => loginWithOAuth("github")}
                className="flex items-center justify-center gap-2 py-3 bg-slate-900/40 border border-white/8 rounded-xl hover:bg-slate-800/60 hover:border-white/15 transition-all text-sm font-semibold text-slate-300 cursor-pointer"
              >
                <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg>
                GitHub
              </button>
            </div>

            {/* Passkey button */}
            <button
              onClick={loginWithPasskey}
              className="w-full mt-3 flex items-center justify-center gap-2 py-3 bg-indigo-500/8 border border-indigo-500/15 text-indigo-400 rounded-xl hover:bg-indigo-500/15 hover:border-indigo-500/25 transition-all text-sm font-semibold cursor-pointer"
            >
              <Fingerprint className="w-4.5 h-4.5" />
              Sign in with Passkey
            </button>

            {/* Switch auth mode */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setMode(mode === "login" ? "signup" : "login")}
                className="text-sm text-slate-500 hover:text-indigo-400 transition-colors cursor-pointer"
              >
                {mode === "login" ? (
                  <>Don&apos;t have an account? <span className="font-bold text-indigo-400">Sign up</span></>
                ) : (
                  <>Already have an account? <span className="font-bold text-indigo-400">Sign in</span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="h-screen flex items-center justify-center bg-[#050510]">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    }>
      <AuthForm defaultMode="login" />
    </Suspense>
  );
}
