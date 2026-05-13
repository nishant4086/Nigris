"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { loadRazorpayScript } from "@/lib/loadRazorpay";
import {
  Check,
  Zap,
  Crown,
  Shield,
  Activity,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

type Plan = {
  name: string;
  requestLimit: number;
  price: number;
  currency: string;
  stripeConfigured?: boolean;
  isCurrent: boolean;
};

// ─── PLAN FEATURES ───
const PLAN_FEATURES: Record<string, { features: string[]; highlight?: boolean }> = {
  free: {
    features: [
      "1,000 API requests / day",
      "3 Projects",
      "5 Collections per project",
      "Community support",
      "Basic analytics",
    ],
  },
  pro: {
    highlight: true,
    features: [
      "10,000 API requests / day",
      "Unlimited Projects",
      "Unlimited Collections",
      "Priority email support",
      "Advanced analytics & export",
      "Webhook integrations",
      "Real-time usage alerts",
    ],
  },
  enterprise: {
    features: [
      "Unlimited API requests",
      "Unlimited everything",
      "Dedicated account manager",
      "Custom SLA & uptime guarantee",
      "SSO & advanced security",
      "On-premise deployment option",
    ],
  },
};

// ─── COMPARISON TABLE ───
const COMPARISON_ROWS = [
  { feature: "API Requests / Day", free: "1,000", pro: "10,000", enterprise: "Unlimited" },
  { feature: "Projects", free: "3", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "Collections", free: "5 / project", pro: "Unlimited", enterprise: "Unlimited" },
  { feature: "API Key Management", free: "✓", pro: "✓", enterprise: "✓" },
  { feature: "Usage Analytics", free: "Basic", pro: "Advanced", enterprise: "Advanced + Custom" },
  { feature: "CSV Export", free: "—", pro: "✓", enterprise: "✓" },
  { feature: "Webhooks", free: "—", pro: "✓", enterprise: "✓" },
  { feature: "Real-time Alerts", free: "—", pro: "✓", enterprise: "✓" },
  { feature: "Support", free: "Community", pro: "Priority Email", enterprise: "Dedicated Manager" },
  { feature: "SLA", free: "—", pro: "99.9%", enterprise: "Custom" },
];

function PlansContent() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyPlan, setBusyPlan] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [showComparison, setShowComparison] = useState(false);
  const [usageData, setUsageData] = useState<{ totalUsage: number; totalLimit: number; remaining: number; nextResetAt?: string } | null>(null);
  const searchParams = useSearchParams();

  const statusMessage = useMemo(() => {
    const status = searchParams.get("status");
    if (status === "success") return "🎉 Upgrade successful! Your plan will update shortly.";
    if (status === "cancel") return "Checkout was cancelled. You can try again anytime.";
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
    // Fetch live usage
    api.get("/keys/summary").then(res => setUsageData(res.data)).catch(() => {});
  }, []);

  const startSubscription = async (planId: string) => {
    setBusyPlan(planId);
    setError("");
    setNotice("");

    try {
      const orderRes = await api.post("/billing/create-subscription", { planId });
      const { subscriptionId, key } = orderRes.data;

      const loaded = await loadRazorpayScript();
      if (!loaded) {
        setError("Failed to load payment gateway. Please try again.");
        setBusyPlan(null);
        return;
      }

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
            setTimeout(() => window.location.reload(), 1500);
          } catch (verifyErr) {
            setError(
              getApiErrorMessage(verifyErr, "Payment verification failed. Contact support if charged.")
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
        theme: { color: "#4f46e5" },
      };

      const rzp = new (window as unknown as { Razorpay: new (options: unknown) => { on: (event: string, cb: (res: { error: { description: string } }) => void) => void; open: () => void } }).Razorpay(options);
      rzp.on("payment.failed", (response: { error: { description: string } }) => {
        setError(response.error?.description || "Payment failed.");
        setBusyPlan(null);
      });
      rzp.open();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to start checkout"));
      setBusyPlan(null);
    }
  };

  const currentPlan = plans.find((p) => p.isCurrent);
  const isCurrentPro = currentPlan?.name === "pro";

  const planCards = [
    {
      id: "free",
      name: "Free",
      icon: Shield,
      price: 0,
      priceLabel: "Free",
      period: "forever",
      description: "For hobby projects and getting started",
      gradient: "from-slate-50 to-slate-100 dark:from-[#1a1a1a] dark:to-[#191919]",
      borderColor: currentPlan?.name === "free" ? "border-slate-900 dark:border-slate-100" : "border-slate-200 dark:border-slate-800",
      iconBg: "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
      isCurrent: currentPlan?.name === "free",
      buttonAction: null,
    },
    {
      id: "pro",
      name: "Pro",
      icon: Zap,
      price: billingCycle === "monthly" ? 199 : 1999,
      priceLabel: billingCycle === "monthly" ? "₹199" : "₹1,999",
      period: billingCycle === "monthly" ? "/ month" : "/ year",
      description: "For teams and growing businesses",
      gradient: "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20",
      borderColor: isCurrentPro ? "border-red-600 dark:border-red-400" : "border-red-300 dark:border-red-700",
      iconBg: "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400",
      isCurrent: isCurrentPro,
      buttonAction: () => startSubscription(billingCycle === "monthly" ? "pro_monthly" : "pro_yearly"),
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: Crown,
      price: -1,
      priceLabel: "Custom",
      period: "",
      description: "For large-scale & mission-critical apps",
      gradient: "from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20",
      borderColor: "border-amber-200 dark:border-amber-800",
      iconBg: "bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400",
      isCurrent: currentPlan?.name === "enterprise",
      buttonAction: null,
    },
  ];

  return (
    <div className="pb-24 animate-in fade-in duration-500 max-w-5xl mx-auto">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-3">
          Simple, transparent pricing
        </h1>
        <p className="text-slate-500 dark:text-slate-400 max-w-lg mx-auto text-sm leading-relaxed">
          Choose the plan that fits your needs. Upgrade, downgrade, or cancel at any time. No hidden fees.
        </p>
      </div>

      {/* Status / Notices */}
      {statusMessage && (
        <div className="mb-6 p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 text-sm text-indigo-700 dark:text-indigo-400 text-center font-medium">
          {statusMessage}
        </div>
      )}
      {notice && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-sm text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-2">
          <Check className="w-4 h-4" /> {notice}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" /> {error}
        </div>
      )}

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center mb-10">
        <div className="bg-slate-100 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl p-1 flex items-center">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
              billingCycle === "yearly"
                ? "bg-white dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 shadow-sm"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-700"
            }`}
          >
            Yearly
            <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
              Save 16%
            </span>
          </button>
        </div>
      </div>

      {/* Plan Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-[420px] bg-slate-200 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {planCards.map((card) => {
            const features = PLAN_FEATURES[card.id]?.features || [];
            const isHighlight = PLAN_FEATURES[card.id]?.highlight;
            const isBusy = busyPlan === (billingCycle === "monthly" ? "pro_monthly" : "pro_yearly") && card.id === "pro";

            return (
              <div
                key={card.id}
                className={`relative bg-gradient-to-b ${card.gradient} border-2 ${card.borderColor} rounded-2xl p-6 md:p-8 flex flex-col transition-all hover:shadow-lg ${
                  isHighlight ? "md:-mt-4 md:mb-4 shadow-md" : ""
                }`}
              >
                {/* Most Popular Badge */}
                {isHighlight && !card.isCurrent && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="flex items-center gap-1 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      <Sparkles className="w-3 h-3" /> Most Popular
                    </span>
                  </div>
                )}

                {/* Header */}
                <div className="mb-6">
                  <div className={`w-10 h-10 rounded-xl ${card.iconBg} flex items-center justify-center mb-3`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{card.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.description}</p>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <span className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                    {card.priceLabel}
                  </span>
                  {card.period && (
                    <span className="text-sm text-slate-500 dark:text-slate-400 ml-1">{card.period}</span>
                  )}
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {card.isCurrent ? (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold cursor-not-allowed"
                  >
                    Current Plan
                  </button>
                ) : card.id === "enterprise" ? (
                  <a
                    href="mailto:support@nigris.dev"
                    className="block w-full py-3 rounded-xl border-2 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-400 text-sm font-bold text-center hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                  >
                    Contact Sales
                  </a>
                ) : card.buttonAction ? (
                  <button
                    onClick={card.buttonAction}
                    disabled={!!busyPlan}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                      isHighlight
                        ? "bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg"
                        : "bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 shadow-sm"
                    } disabled:opacity-60`}
                  >
                    {isBusy ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                    {isBusy ? "Processing..." : `Upgrade to ${card.name}`}
                  </button>
                ) : (
                  <button
                    disabled
                    className="w-full py-3 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-sm font-bold cursor-not-allowed"
                  >
                    Default
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Usage Bar (if user has a plan) */}
      {currentPlan && (() => {
        const used = usageData?.totalUsage || 0;
        const limit = usageData?.totalLimit || currentPlan.requestLimit || 1;
        const pct = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
        const barColor = pct >= 90 ? "from-red-500 to-red-600" : pct >= 70 ? "from-amber-500 to-orange-500" : "from-indigo-500 to-violet-500";

        return (
          <section className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-500" /> Daily Usage
              </h3>
              <span className="text-xs font-semibold text-slate-500">
                {usageData?.nextResetAt ? `Resets ${new Date(usageData.nextResetAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : "Resets every 24 hours"}
              </span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800/60 rounded-full h-3 mb-2">
              <div
                className={`bg-gradient-to-r ${barColor} h-3 rounded-full transition-all duration-1000`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>{used.toLocaleString()} / {limit.toLocaleString()} requests</span>
              <span className={pct >= 90 ? "text-red-500 font-bold" : ""}>{pct}%</span>
            </div>
          </section>
        );
      })()}

      {/* Feature Comparison Toggle */}
      <div className="text-center mb-6">
        <button
          onClick={() => setShowComparison(!showComparison)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-colors"
        >
          {showComparison ? "Hide" : "Show"} Full Feature Comparison
          {showComparison ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Comparison Table */}
      {showComparison && (
        <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden mb-8 animate-in slide-in-from-top-4 duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="text-left px-6 py-4 font-bold text-slate-900 dark:text-slate-100">Feature</th>
                  <th className="text-center px-6 py-4 font-bold text-slate-600 dark:text-slate-300">Free</th>
                  <th className="text-center px-6 py-4 font-bold text-indigo-600 dark:text-indigo-400">Pro</th>
                  <th className="text-center px-6 py-4 font-bold text-amber-600 dark:text-amber-400">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {COMPARISON_ROWS.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-[#202020]/50 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-700 dark:text-slate-300">{row.feature}</td>
                    <td className="px-6 py-3.5 text-center text-slate-500 dark:text-slate-400">{row.free}</td>
                    <td className="px-6 py-3.5 text-center font-medium text-slate-900 dark:text-slate-100">{row.pro}</td>
                    <td className="px-6 py-3.5 text-center font-medium text-slate-900 dark:text-slate-100">{row.enterprise}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Trust Footer */}
      <div className="text-center text-xs text-slate-400 space-y-1">
        <p className="flex items-center justify-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Payments securely processed by Razorpay. We never store your card details.
        </p>
        <p>Cancel or change your plan anytime from the Billing page. No questions asked.</p>
      </div>
    </div>
  );
}

export default function PlansPage() {
  return (
    <Suspense fallback={
      <div className="max-w-5xl mx-auto py-12 text-center text-sm text-slate-500 animate-pulse">
        Loading pricing plans...
      </div>
    }>
      <PlansContent />
    </Suspense>
  );
}
