"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function BillingPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/users/me")
      .then((res) => setUser(res.data))
      .catch(() => setError("Failed to load billing info"))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? You will be downgraded to the Free plan.")) {
      return;
    }

    setCancelling(true);
    setError("");
    setNotice("");

    try {
      const res = await api.post("/billing/cancel");
      setNotice(res.data.message || "Subscription cancelled.");
      // Refresh user data
      const meRes = await api.get("/users/me");
      setUser(meRes.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return <div className="p-6 text-sm text-slate-500">Loading billing info...</div>;
  }

  const plan = user?.plan || "free";
  const status = user?.subscriptionStatus || user?.planStatus || "active";
  const nextBilling = user?.nextBillingDate
    ? new Date(user.nextBillingDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;
  const hasSubscription = Boolean(user?.razorpaySubscriptionId);

  const statusColor: Record<string, string> = {
    active: "bg-emerald-100 text-emerald-800",
    cancelled: "bg-red-100 text-red-800",
    halted: "bg-yellow-100 text-yellow-800",
    past_due: "bg-yellow-100 text-yellow-800",
  };

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold">Billing</h1>

      {notice && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow border border-slate-200 divide-y divide-slate-100">
        {/* Current Plan */}
        <div className="p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Current Plan</p>
            <p className="text-xl font-bold capitalize">{plan}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor[status] || "bg-slate-100 text-slate-600"}`}>
            {status}
          </span>
        </div>

        {/* Subscription Status */}
        {hasSubscription && (
          <div className="p-6">
            <p className="text-sm text-gray-500">Subscription ID</p>
            <p className="text-sm font-mono text-slate-700">{user.razorpaySubscriptionId}</p>
          </div>
        )}

        {/* Next Billing */}
        <div className="p-6">
          <p className="text-sm text-gray-500">Next Billing Date</p>
          <p className="text-lg font-semibold">
            {nextBilling || (plan === "free" ? "N/A — Free plan" : "—")}
          </p>
        </div>

        {/* Cancel Button */}
        {hasSubscription && status === "active" && (
          <div className="p-6">
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className={`px-6 py-2 rounded text-sm font-medium ${
                cancelling
                  ? "bg-gray-300 text-gray-500 cursor-wait"
                  : "bg-red-600 text-white hover:bg-red-700 transition-colors"
              }`}
            >
              {cancelling ? "Cancelling..." : "Cancel Subscription"}
            </button>
            <p className="text-xs text-gray-400 mt-2">
              You will be downgraded to the Free plan immediately.
            </p>
          </div>
        )}
      </div>

      {plan === "free" && (
        <div className="text-center">
          <a href="/dashboard/plans" className="text-indigo-600 hover:underline text-sm font-medium">
            Upgrade to Pro →
          </a>
        </div>
      )}
    </div>
  );
}
