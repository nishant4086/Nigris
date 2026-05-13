"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { Shield, Eye, EyeOff, Loader2, Lock, Smartphone, Fingerprint, X } from "lucide-react";
import Image from "next/image";
import { startRegistration } from "@simplewebauthn/browser";

export default function SecuritySettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // MFA State
  const [isMfaModalOpen, setIsMfaModalOpen] = useState(false);
  const [mfaStep, setMfaStep] = useState(1); // 1: QR, 2: Recovery Codes
  const [qrCode, setQrCode] = useState("");
  const [mfaToken, setMfaToken] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [mfaLoading, setMfaLoading] = useState(false);

  // Passkey State
  const [passkeyLoading, setPasskeyLoading] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return setError("Passwords do not match");

    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      await api.post("/users/me/password", { currentPassword, newPassword });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      const errorData = err as { response?: { data?: { error?: string } } };
      setError(errorData.response?.data?.error || "Failed to update password");
    } finally {
      setSaving(false);
    }
  };

  const startMfaSetup = async () => {
    setMfaLoading(true);
    try {
      const res = await api.post("/auth/mfa/setup");
      setQrCode(res.data.qrCodeUrl);
      setIsMfaModalOpen(true);
      setMfaStep(1);
    } catch {
      setError("Failed to start MFA setup");
    } finally {
      setMfaLoading(false);
    }
  };

  const verifyMfa = async () => {
    setMfaLoading(true);
    try {
      const res = await api.post("/auth/mfa/enable", { token: mfaToken });
      setRecoveryCodes(res.data.recoveryCodes);
      setMfaStep(2);
    } catch (err: unknown) {
      const errorData = err as { response?: { data?: { error?: string } } };
      alert(errorData.response?.data?.error || "Invalid MFA code");
    } finally {
      setMfaLoading(false);
    }
  };

  const registerPasskey = async () => {
    setPasskeyLoading(true);
    try {
      const optionsRes = await api.post("/auth/passkey/register-options");
      const attestation = await startRegistration(optionsRes.data);
      await api.post("/auth/passkey/register-verify", { body: attestation });
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError("Passkey registration failed");
    } finally {
      setPasskeyLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Password</h3>
          <p className="text-sm text-slate-500">Update your password to keep your account secure.</p>
        </div>

        <form onSubmit={handlePasswordChange} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/30 rounded-xl text-xs font-bold text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-900/30 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400">
              Password updated successfully
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Current Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPass ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
              <input
                type={showPass ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
              <input
                type={showPass ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                required
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="text-xs font-bold text-slate-500 flex items-center gap-1.5 hover:text-slate-900 transition-colors"
            >
              {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              {showPass ? "Hide Passwords" : "Show Passwords"}
            </button>
          </div>
        </form>

        <div className="px-6 py-4 bg-slate-50/50 dark:bg-[#1c1c1c] border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={handlePasswordChange}
            disabled={saving || !newPassword}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Update Password
          </button>
        </div>
      </div>

      {/* 2FA Card */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-6 group hover:border-blue-500/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Two-Factor Authentication (MFA)</h4>
            <p className="text-xs text-slate-500 mt-0.5">Protect your account with an authenticator app.</p>
          </div>
        </div>
        <button
          onClick={startMfaSetup}
          disabled={mfaLoading}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2"
        >
          {mfaLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Enable MFA
        </button>
      </div>

      {/* Passkeys Card */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center justify-between gap-6 group hover:border-indigo-500/50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform">
            <Fingerprint className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Passkeys & Biometrics</h4>
            <p className="text-xs text-slate-500 mt-0.5">Sign in faster using TouchID, FaceID, or security keys.</p>
          </div>
        </div>
        <button
          onClick={registerPasskey}
          disabled={passkeyLoading}
          className="px-6 py-2.5 border border-slate-200 dark:text-white dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#202020] text-sm font-bold rounded-xl transition-all flex items-center gap-2"
        >
          {passkeyLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          Add Passkey
        </button>
      </div>

      {/* MFA Setup Modal */}
      {isMfaModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100">Setup Authenticator App</h3>
              <button onClick={() => setIsMfaModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6">
              {mfaStep === 1 ? (
                <div className="space-y-6 text-center">
                  <p className="text-sm text-slate-500">Scan this QR code in your authenticator app (Google Authenticator, Authy, etc.)</p>
                  <div className="w-48 h-48 mx-auto bg-white p-2 rounded-2xl border-4 border-slate-50 shadow-inner relative">
                    {qrCode && <Image src={qrCode} alt="MFA QR Code" fill className="object-contain" />}
                  </div>
                  <div className="space-y-4 pt-4">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest">Verification Code</label>
                    <input
                      type="text"
                      placeholder="000000"
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      className="w-full text-center text-2xl font-black tracking-[0.5em] py-3 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                    <button
                      onClick={verifyMfa}
                      disabled={mfaLoading || mfaToken.length < 6}
                      className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {mfaLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      Verify & Activate
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                      <Shield className="w-8 h-8" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-900 dark:text-slate-100">MFA is Active!</h4>
                    <p className="text-sm text-slate-500 mt-2">Please save these recovery codes in a safe place. You can use them if you lose access to your authenticator app.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md p-4 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs">
                    {recoveryCodes.map(code => (
                      <div key={code} className="flex items-center justify-between p-2 bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-lg border border-slate-100 dark:border-slate-800">
                        <span>{code}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => setIsMfaModalOpen(false)}
                    className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-all"
                  >
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
