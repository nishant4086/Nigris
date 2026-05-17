"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { User, Mail, Camera, Loader2, CheckCircle2, X } from "lucide-react";
import { api } from "@/lib/api";

type ProfileSettingsProps = {
  user: { name?: string; email?: string; avatar?: string | null } | null;
  onUpdate: (data: { name?: string; avatar?: string | null }) => Promise<void>;
};

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === user?.name) return;

    setSaving(true);
    setSuccess(false);
    try {
      await onUpdate({ name: name.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (_err) {
      console.error(_err);
    } finally {
      setSaving(false);
    }
  };

  const triggerFilePicker = () => {
    setAvatarError("");
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so selecting the same file again still fires
    if (!file) return;

    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      setAvatarError("Only PNG, JPG, GIF, or WebP images are allowed.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setAvatarError("Image is too large. Max 5MB.");
      return;
    }

    setAvatarUploading(true);
    setAvatarError("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = uploadRes.data?.url;
      if (!url) throw new Error("Upload succeeded but no URL returned");
      await onUpdate({ avatar: url });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setAvatarError(e.response?.data?.error || e.message || "Failed to upload avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  const removeAvatar = async () => {
    setAvatarUploading(true);
    setAvatarError("");
    try {
      await onUpdate({ avatar: null });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      const e = err as { response?: { data?: { error?: string } }; message?: string };
      setAvatarError(e.response?.data?.error || e.message || "Failed to remove avatar");
    } finally {
      setAvatarUploading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
          <p className="text-sm text-slate-500">Manage your profile details and how others see you.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_AVATAR_TYPES.join(",")}
              onChange={handleAvatarChange}
              className="hidden"
            />
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-[#191919] shadow-lg">
                {user?.avatar ? (
                  <Image
                    src={user.avatar}
                    alt={user.name || "Avatar"}
                    width={80}
                    height={80}
                    className="w-full h-full object-cover"
                    unoptimized
                  />
                ) : (
                  (user?.name || "U").charAt(0).toUpperCase()
                )}
                {avatarUploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={triggerFilePicker}
                disabled={avatarUploading}
                className="absolute bottom-0 right-0 p-2 bg-white dark:bg-slate-800/60 rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-colors disabled:opacity-50"
                aria-label="Change avatar"
              >
                <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Profile Photo</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG, GIF or WebP. Max 5MB.</p>
              <div className="flex items-center gap-3 mt-2">
                <button
                  type="button"
                  onClick={triggerFilePicker}
                  disabled={avatarUploading}
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
                >
                  {avatarUploading ? "Uploading…" : user?.avatar ? "Change Avatar" : "Upload Avatar"}
                </button>
                {user?.avatar && !avatarUploading && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                  >
                    <X className="w-3 h-3" /> Remove
                  </button>
                )}
              </div>
              {avatarError && (
                <p className="text-xs font-bold text-red-600 mt-1.5">{avatarError}</p>
              )}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full  text-black dark:text-white  pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-100 dark:bg-[#0d0d0d] border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50/50 dark:bg-[#1c1c1c] border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {success && (
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold animate-in fade-in slide-in-from-left-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Profile updated
              </div>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving || !name.trim() || name === user?.name}
            className="flex items-center gap-2 px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
