"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import Link from "next/link";
import {
  CreditCard,
  Crown,
  Calendar,
  Loader2,
  Check,
  AlertTriangle,
  ArrowUpRight,
  Zap,
  Shield,
} from "lucide-react";

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => setError("Failed to load billing info"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (
      !confirm(
        "Are you sure you want to cancel your subscription? You will be downgraded to the Free plan."
      )
    ) {
      return;
    }

    setCancelling(true);
    setError("");
    setNotice("");

    try {
      const res = await api.post("/billing/cancel");
      setNotice(res.data.message || "Subscription cancelled.");
      const meRes = await api.get("/users/me");
      setUser(meRes.data);
    } catch (err: any) {
      setError(
        err?.response?.data?.error || "Failed to cancel subscription"
      );
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto animate-pulse space-y-6 py-4">
        <div className="h-8 w-48 bg-slate-200 dark:bg-[#252525] rounded-lg" />
        <div className="h-48 bg-slate-200 dark:bg-[#252525] rounded-2xl" />
        <div className="h-48 bg-slate-200 dark:bg-[#252525] rounded-2xl" />
      </div>
    );
  }

  const plan = user?.plan || "free";
  const status =
    user?.subscriptionStatus || user?.planStatus || "active";
  const nextBilling = user?.nextBillingDate
    ? new Date(user.nextBillingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const hasSubscription = Boolean(user?.razorpaySubscriptionId);

  const statusStyles: Record<string, string> = {
    active:
      "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    cancelled:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    halted:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
    past_due:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800",
  };

  const planGradients: Record<string, string> = {
    free: "from-slate-500 to-slate-700",
    pro: "from-indigo-500 to-violet-600",
    enterprise: "from-amber-500 to-orange-600",
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
          Billing
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          Manage your subscription, view your plan details, and update
          payment methods.
        </p>
      </div>

      {notice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
          <Check className="w-4 h-4" />
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* ─── CURRENT PLAN CARD ─── */}
      <section className="bg-white dark:bg-[#191919] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-6 overflow-hidden">
        <div
          className={`relative overflow-hidden bg-gradient-to-br ${
            planGradients[plan] || planGradients.free
          } p-8 text-white`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Crown className="w-5 h-5" />
                <span className="text-sm font-bold uppercase tracking-wider opacity-80">
                  Current Plan
                </span>
              </div>
              <h2 className="text-3xl font-bold capitalize mb-1">
                {plan}
              </h2>
              <p className="text-sm opacity-80">
                {plan === "free"
                  ? "Basic features with limited API requests"
                  : plan === "pro"
                  ? "Full access with increased limits"
                  : "Unlimited access and priority support"}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold border ${
                statusStyles[status] || "bg-white/20 text-white border-white/30"
              }`}
            >
              {status}
            </span>
          </div>

          <div className="relative z-10 mt-6 grid grid-cols-2 gap-4">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs font-semibold uppercase opacity-70 mb-0.5">
                API Limit
              </p>
              <p className="text-lg font-bold">
                {user?.requestLimit
                  ? user.requestLimit.toLocaleString() + " / day"
                  : "Unlimited"}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-xs font-semibold uppercase opacity-70 mb-0.5">
                Next Billing
              </p>
              <p className="text-lg font-bold">
                {nextBilling || (plan === "free" ? "N/A" : "—")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── SUBSCRIPTION DETAILS ─── */}
      {hasSubscription && (
        <section className="bg-white dark:bg-[#191919] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm mb-6 overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              <CreditCard className="w-4 h-4 inline mr-2 -mt-0.5" />
              Subscription Details
            </h2>
          </div>

          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Subscription ID
              </span>
              <code className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-[#111111] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                {user.razorpaySubscriptionId}
              </code>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Status
              </span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                  statusStyles[status] || "bg-slate-100 text-slate-600"
                }`}
              >
                {status}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                Next Billing Date
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                {nextBilling || "—"}
              </span>
            </div>
          </div>

          {status === "active" && (
            <div className="px-6 py-4 bg-slate-50/50 dark:bg-[#111111]/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Cancelling will immediately downgrade you to the Free
                plan.
              </p>
              <button
                onClick={handleCancel}
                disabled={cancelling}
                className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-red-600 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors disabled:opacity-50"
              >
                {cancelling && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {cancelling ? "Cancelling..." : "Cancel Subscription"}
              </button>
            </div>
          )}
        </section>
      )}

      {/* ─── UPGRADE PROMPT ─── */}
      {plan === "free" && (
        <section className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/20 dark:to-violet-900/20 border border-indigo-200 dark:border-indigo-800 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 dark:bg-indigo-900/40 p-3 rounded-xl">
              <Zap className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-1">
                Unlock More with Pro
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md">
                Get 10x more API requests, priority support, and
                advanced analytics features.
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/plans"
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-md transition-colors whitespace-nowrap"
          >
            Upgrade Now
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </section>
      )}

      {/* ─── SECURITY NOTE ─── */}
      <section className="flex items-start gap-3 text-xs text-slate-400 px-2">
        <Shield className="w-4 h-4 shrink-0 mt-0.5" />
        <p>
          All billing is securely processed by Razorpay. Nigris never
          stores your payment details. For billing disputes or refund
          requests, contact support.
        </p>
      </section>
    </div>
  );
}
