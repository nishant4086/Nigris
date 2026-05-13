"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useRouter } from "next/navigation";
import { CreditCard, ArrowUpCircle, Crown } from "lucide-react";

interface BillingUser {
  plan: string;
}

interface BillingStats {
  projects?: { count: number; limit: number };
  apiKeys?: { count: number; limit: number };
}

export default function BillingSettings({ user }: { user: BillingUser | null }) {
  const router = useRouter();
  const [stats, setStats] = useState<BillingStats | null>(null);

  useEffect(() => {
    api.get("/users/me/stats").then(res => setStats(res.data)).catch(() => { });
  }, []);

  const handleGoPlan = () => {
    router.push("/dashboard/plans");
  }
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Current Plan Card */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
            <Crown className="w-7 h-7" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Current Plan</p>
            <h3 className="text-2xl font-black text-slate-900 dark:text-slate-100 capitalize">{user?.plan}</h3>
          </div>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]" onClick={handleGoPlan}>
          <ArrowUpCircle className="w-5 h-5" />
          Upgrade Plan
        </button>
      </div>

      {/* Usage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">Projects Usage</h4>
            <span className="text-sm font-bold text-slate-500">{stats?.projects?.count || 0} / {stats?.projects?.limit || 1}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-blue-600 h-full transition-all duration-1000"
              style={{ width: `${Math.min(((stats?.projects?.count || 0) / (stats?.projects?.limit || 1)) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-slate-900 dark:text-slate-100">API Keys Usage</h4>
            <span className="text-sm font-bold text-slate-500">{stats?.apiKeys?.count || 0} / {stats?.apiKeys?.limit || 2}</span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800/60 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-1000"
              style={{ width: `${Math.min(((stats?.apiKeys?.count || 0) / (stats?.apiKeys?.limit || 2)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Billing History Placeholder */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Billing History</h3>
          <p className="text-sm text-slate-500">Download and manage your past invoices.</p>
        </div>
        <div className="p-12 text-center">
          <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/60 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-800">
            <CreditCard className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-sm font-bold text-slate-400">No billing history yet.</p>
          <p className="text-xs text-slate-500 mt-1">Invoices will appear here once you start a paid subscription.</p>
        </div>
      </div>
    </div>
  );
}
