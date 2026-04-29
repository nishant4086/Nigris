import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%,_#ffffff)]">
      <div className="mx-auto max-w-5xl px-6 py-20">
        <div className="flex flex-col gap-8">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
            Nigris SaaS
          </p>
          <h1 className="text-4xl md:text-6xl font-semibold text-slate-900">
            Build, meter, and ship your API products with confidence.
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl">
            Manage projects, collections, API keys, and usage from a single
            dashboard. Upgrade in seconds with Stripe-powered billing.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-white shadow-lg shadow-slate-900/20"
            >
              Get started
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-full border border-slate-300 px-6 py-3 text-slate-700"
            >
              View dashboard
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/80 p-5 shadow-lg shadow-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                Usage insights
              </h3>
              <p className="text-sm text-slate-600">
                Track limits, remaining quotas, and upcoming resets per key.
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-5 shadow-lg shadow-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                Projects + collections
              </h3>
              <p className="text-sm text-slate-600">
                Organize data models and surface dynamic APIs instantly.
              </p>
            </div>
            <div className="rounded-2xl bg-white/80 p-5 shadow-lg shadow-slate-200">
              <h3 className="text-base font-semibold text-slate-900">
                Stripe-ready billing
              </h3>
              <p className="text-sm text-slate-600">
                Convert users with clean upgrade flows and webhook sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
