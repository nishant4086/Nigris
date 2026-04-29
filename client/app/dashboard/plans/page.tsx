"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";

type Plan = {
  name: string;
  requestLimit: number;
  price: number;
  currency: string;
  stripeConfigured?: boolean;
  isCurrent: boolean;
};

const formatPrice = (price: number, currency: string) => {
  if (price === 0) return "Free";
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  });
  return formatter.format(price);
};

function PlansContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const searchParams = useSearchParams();

  const statusMessage = useMemo(() => {
    const status = searchParams.get("status");
    if (status === "success") return "Upgrade successful. Your plan will update shortly.";
    if (status === "cancel") return "Checkout canceled. You can try again anytime.";
    return null;
  }, [searchParams]);

  useEffect(() => {
    const loadPlans = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/plans");
        setPlans(Array.isArray(res.data) ? res.data : []);
      } catch {
        setPlans([]);
        setError("Failed to load plans");
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  const startCheckout = async (plan: Plan) => {
    if (plan.name === "free") return;
    setBusyPlan(plan.name);
    setError("");
    setNotice("");
    try {
      const res = await api.post("/billing/checkout", { plan: plan.name });
      if (res.data?.url) {
        window.location.assign(res.data.url);
        return;
      }
      if (res.data?.upgraded) {
        setNotice(res.data.message || `Upgraded to ${plan.name}.`);
        const plansRes = await api.get("/plans");
        setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
      }
    } catch (err) {
      const message =
        err && typeof err === "object" && "response" in err
          ? (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.error ||
            (err as { response?: { data?: { error?: string; message?: string } } }).response?.data?.message
          : null;
      setError(message || "Failed to start checkout");
    } finally {
      setBusyPlan(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Plans & Pricing</h1>
      {statusMessage && (
        <div className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {statusMessage}
        </div>
      )}
      {notice && (
        <div className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {notice}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading plans...</p>
      ) : plans.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No plans are available.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-xl border bg-white p-6 shadow ${
                plan.isCurrent ? "border-black" : "border-slate-200"
              }`}
            >
              <h2 className="text-lg font-semibold capitalize">{plan.name}</h2>
              <p className="text-gray-500 mb-4">
                {plan.requestLimit.toLocaleString()} requests/day
              </p>
              <h3 className="text-2xl font-bold mb-4">
                {formatPrice(plan.price, plan.currency)}
              </h3>

              <ul className="text-sm space-y-2 mb-6 text-gray-600">
                <li>Usage limit: {plan.requestLimit.toLocaleString()}</li>
                <li>API keys with usage tracking</li>
                <li>Collections + dynamic endpoints</li>
                {plan.name !== "free" && !plan.stripeConfigured && (
                  <li>Local dev upgrade enabled until Stripe keys are configured</li>
                )}
              </ul>

              <button
                onClick={() => startCheckout(plan)}
                disabled={plan.isCurrent || busyPlan === plan.name}
                className={`w-full py-2 rounded ${
                  plan.isCurrent
                    ? "bg-gray-200 text-gray-600"
                    : "bg-black text-white"
                }`}
              >
                {plan.isCurrent
                  ? "Current Plan"
                  : busyPlan === plan.name
                  ? "Redirecting..."
                  : `Upgrade to ${plan.name.charAt(0).toUpperCase()}${plan.name.slice(1)}`}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">Loading plans...</p>}>
      <PlansContent />
    </Suspense>
  );
}
