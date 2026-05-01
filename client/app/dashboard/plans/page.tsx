"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/loadRazorpay";

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

const SUBSCRIPTION_OPTIONS = [
  { id: "pro_monthly", label: "Monthly", priceLabel: "₹199/mo" },
  { id: "pro_yearly", label: "Yearly", priceLabel: "₹1,999/yr", badge: "Save 16%" },
];

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

  const startSubscription = async (planId: string) => {
    setBusyPlan(planId);
    setError("");
    setNotice("");

    try {
      // Step 1: Create subscription on backend
      const orderRes = await api.post("/billing/create-subscription", { planId });
      const { subscriptionId, key } = orderRes.data;

      // Step 2: Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load payment gateway. Please try again.");
        setBusyPlan(null);
        return;
      }

      // Step 3: Open Razorpay Checkout in subscription mode
      const options = {
        key,
        subscription_id: subscriptionId,
        name: "Nigris",
        description: `Pro Plan (${planId.includes("yearly") ? "Yearly" : "Monthly"})`,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_subscription_id: string;
          razorpay_signature: string;
        }) => {
          try {
            const verifyRes = await api.post("/billing/verify-subscription", {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id,
              razorpay_signature: response.razorpay_signature,
              plan: "pro",
            });
            setNotice(verifyRes.data.message || "Successfully subscribed!");
            const plansRes = await api.get("/plans");
            setPlans(Array.isArray(plansRes.data) ? plansRes.data : []);
          } catch (verifyErr: any) {
            setError(
              verifyErr?.response?.data?.error ||
              "Payment verification failed. Contact support if charged."
            );
          } finally {
            setBusyPlan(null);
          }
        },
        modal: {
          ondismiss: () => {
            setBusyPlan(null);
            setNotice("Payment was cancelled.");
          },
        },
        theme: { color: "#000000" },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on("payment.failed", (response: any) => {
        setError(response.error?.description || "Payment failed.");
        setBusyPlan(null);
      });
      rzp.open();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to start checkout");
      setBusyPlan(null);
    }
  };

  const currentPlan = plans.find((p) => p.isCurrent);

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
          {/* FREE PLAN */}
          {plans.filter(p => p.name === "free").map((plan) => (
            <div key={plan.name} className={`rounded-xl border bg-white p-6 shadow ${plan.isCurrent ? "border-black" : "border-slate-200"}`}>
              <h2 className="text-lg font-semibold capitalize">Free</h2>
              <p className="text-gray-500 mb-4">{plan.requestLimit.toLocaleString()} requests/day</p>
              <h3 className="text-2xl font-bold mb-4">Free</h3>
              <ul className="text-sm space-y-2 mb-6 text-gray-600">
                <li>Usage limit: {plan.requestLimit.toLocaleString()}</li>
                <li>API keys with usage tracking</li>
                <li>Collections + dynamic endpoints</li>
              </ul>
              <button disabled className="w-full py-2 rounded bg-gray-200 text-gray-600 cursor-not-allowed">
                {plan.isCurrent ? "Current Plan" : "Default"}
              </button>
            </div>
          ))}

          {/* PRO MONTHLY */}
          <div className={`rounded-xl border bg-white p-6 shadow ${currentPlan?.name === "pro" ? "border-black" : "border-slate-200"}`}>
            <h2 className="text-lg font-semibold">Pro Monthly</h2>
            <p className="text-gray-500 mb-4">10,000 requests/day</p>
            <h3 className="text-2xl font-bold mb-4">₹199<span className="text-sm font-normal text-gray-400">/mo</span></h3>
            <ul className="text-sm space-y-2 mb-6 text-gray-600">
              <li>Usage limit: 10,000</li>
              <li>Priority support</li>
              <li>Auto-renewing subscription</li>
            </ul>
            <button
              onClick={() => startSubscription("pro_monthly")}
              disabled={currentPlan?.name === "pro" || busyPlan === "pro_monthly"}
              className={`w-full py-2 rounded ${
                currentPlan?.name === "pro"
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                  : busyPlan === "pro_monthly"
                  ? "bg-gray-400 text-white cursor-wait"
                  : "bg-black text-white hover:bg-gray-800 transition-colors"
              }`}
            >
              {currentPlan?.name === "pro" ? "Current Plan" : busyPlan === "pro_monthly" ? "Processing..." : "Subscribe Monthly"}
            </button>
          </div>

          {/* PRO YEARLY */}
          <div className={`rounded-xl border bg-white p-6 shadow relative ${currentPlan?.name === "pro" ? "border-black" : "border-indigo-500 border-2"}`}>
            <span className="absolute -top-3 right-4 bg-indigo-500 text-white text-xs px-3 py-1 rounded-full">Save 16%</span>
            <h2 className="text-lg font-semibold">Pro Yearly</h2>
            <p className="text-gray-500 mb-4">10,000 requests/day</p>
            <h3 className="text-2xl font-bold mb-4">₹1,999<span className="text-sm font-normal text-gray-400">/yr</span></h3>
            <ul className="text-sm space-y-2 mb-6 text-gray-600">
              <li>Usage limit: 10,000</li>
              <li>Priority support</li>
              <li>Auto-renewing subscription</li>
              <li className="text-indigo-600 font-medium">Best value</li>
            </ul>
            <button
              onClick={() => startSubscription("pro_yearly")}
              disabled={currentPlan?.name === "pro" || busyPlan === "pro_yearly"}
              className={`w-full py-2 rounded ${
                currentPlan?.name === "pro"
                  ? "bg-gray-200 text-gray-600 cursor-not-allowed"
                  : busyPlan === "pro_yearly"
                  ? "bg-gray-400 text-white cursor-wait"
                  : "bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
              }`}
            >
              {currentPlan?.name === "pro" ? "Current Plan" : busyPlan === "pro_yearly" ? "Processing..." : "Subscribe Yearly"}
            </button>
          </div>
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
