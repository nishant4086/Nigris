"use client";

import { useState } from "react";
import { User, Mail, Camera, Loader2, CheckCircle2 } from "lucide-react";

type ProfileSettingsProps = {
  user: any;
  onUpdate: (data: any) => Promise<void>;
};

export default function ProfileSettings({ user, onUpdate }: ProfileSettingsProps) {
  const [name, setName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === user?.name) return;

    setSaving(true);
    setSuccess(false);
    try {
      await onUpdate({ name: name.trim() });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-[#191919] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Personal Information</h3>
          <p className="text-sm text-slate-500">Manage your profile details and how others see you.</p>
        </div>

        <div className="p-6 space-y-8">
          {/* Avatar Upload Placeholder */}
          <div className="flex items-center gap-6">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-[#191919] shadow-lg">
                {(user?.name || "U").charAt(0).toUpperCase()}
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white dark:bg-[#252525] rounded-full border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
                <Camera className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Profile Photo</p>
              <p className="text-xs text-slate-500 mt-1">PNG, JPG or GIF. Max 5MB.</p>
              <button className="mt-2 text-xs font-bold text-blue-600 hover:text-blue-700">Change Avatar</button>
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
                  className="w-full  text-black dark:text-white  pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
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
