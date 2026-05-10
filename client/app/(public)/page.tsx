"use client";

import Link from "next/link";

import { useRef } from "react";
import { ArrowRight, Check } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".hero-eyebrow", { opacity: 0 }, { opacity: 1, duration: 0.5, ease: "power2.out" });
    gsap.fromTo(".hero-title", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power2.out", delay: 0.1 });
    gsap.fromTo(".hero-sub", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out", delay: 0.2 });
    gsap.fromTo(".hero-cta", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", delay: 0.3 });
    gsap.fromTo(".hero-visual", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", delay: 0.4 });

    gsap.fromTo(".scroll-section", { y: 24, opacity: 0 }, {
      scrollTrigger: { trigger: ".scroll-section", start: "top 85%" },
      y: 0, opacity: 1, duration: 0.6, stagger: 0.1, ease: "power2.out",
    });
  }, { scope: container });

  return (
    <div ref={container} className="bg-[#09090b] text-white overflow-x-hidden">

      {/* ── Hero ── */}
      <section className="relative pt-28 pb-20 lg:pt-40 lg:pb-28">
        <div className="mx-auto max-w-[1120px] px-6">
          <p className="hero-eyebrow text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-5">
            The API infrastructure platform
          </p>
          <h1 className="hero-title max-w-3xl text-[clamp(2.25rem,5vw,4rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-white">
            Ship production-ready APIs without the boilerplate
          </h1>
          <p className="hero-sub mt-5 max-w-xl text-[17px] leading-relaxed text-[#a1a1aa]">
            Dynamic schemas, API key management, usage metering, and Stripe billing — all connected in one dashboard.
          </p>
          <div className="hero-cta mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-lg bg-white px-5 text-[14px] font-medium text-[#09090b] transition hover:bg-[#e4e4e7]"
            >
              Get started
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#27272a] px-5 text-[14px] font-medium text-[#a1a1aa] transition hover:border-[#3f3f46] hover:text-white"
            >
              Documentation <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Dashboard visual — built in code */}
        <div className="hero-visual mx-auto mt-16 max-w-[1120px] px-6">
          <div className="rounded-xl border border-[#1c1c1f] bg-[#111113] overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1c1c1f] bg-[#0c0c0e]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/40" />
              <div className="ml-3 flex-1 h-6 rounded-md bg-[#1c1c1f] flex items-center px-3">
                <span className="text-[11px] text-[#3f3f46]">nigris.app/dashboard</span>
              </div>
            </div>
            {/* Dashboard content */}
            <div className="p-5 sm:p-6">
              {/* Stat cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Total Requests", value: "12,847", change: "+14%" },
                  { label: "Active Keys", value: "24", change: "+3" },
                  { label: "Avg Latency", value: "42ms", change: "-8%" },
                  { label: "Error Rate", value: "0.3%", change: "-0.1%" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-[#1c1c1f] bg-[#0c0c0e] p-4">
                    <p className="text-[11px] text-[#52525b] mb-1">{s.label}</p>
                    <p className="text-xl font-semibold tracking-tight">{s.value}</p>
                    <p className="text-[11px] text-[#22c55e] mt-0.5">{s.change}</p>
                  </div>
                ))}
              </div>
              {/* Chart area */}
              <div className="rounded-lg border border-[#1c1c1f] bg-[#0c0c0e] p-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-[13px] font-medium">API Usage — Last 7 days</p>
                  <div className="flex gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[11px] bg-[#1c1c1f] text-[#71717a]">Day</span>
                    <span className="px-2 py-0.5 rounded text-[11px] bg-white/5 text-[#a1a1aa]">Week</span>
                  </div>
                </div>
                {/* SVG chart */}
                <svg viewBox="0 0 600 120" className="w-full h-auto">
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d="M0,95 Q50,90 100,75 T200,60 T300,40 T400,50 T500,25 T600,15" fill="none" stroke="#3b82f6" strokeWidth="2" />
                  <path d="M0,95 Q50,90 100,75 T200,60 T300,40 T400,50 T500,25 T600,15 L600,120 L0,120Z" fill="url(#chartGrad)" />
                </svg>
              </div>
              {/* Table */}
              <div className="rounded-lg border border-[#1c1c1f] overflow-hidden">
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-4 py-2 border-b border-[#1c1c1f] text-[11px] text-[#52525b] uppercase tracking-wider">
                  <span>Status</span><span>Endpoint</span><span>Latency</span><span>Time</span>
                </div>
                {[
                  { status: "bg-[#22c55e]", endpoint: "GET /api/users", latency: "34ms", time: "2s ago" },
                  { status: "bg-[#22c55e]", endpoint: "POST /api/entries", latency: "67ms", time: "5s ago" },
                  { status: "bg-[#eab308]", endpoint: "GET /api/keys", latency: "124ms", time: "12s ago" },
                  { status: "bg-[#22c55e]", endpoint: "DELETE /api/entries/8f2", latency: "41ms", time: "18s ago" },
                ].map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_2fr_1fr_1fr] gap-4 px-4 py-2.5 border-b border-[#1c1c1f] last:border-0 text-[13px] text-[#a1a1aa]">
                    <span className="flex items-center gap-2"><span className={`w-1.5 h-1.5 rounded-full ${r.status}`} /><span className="text-[#52525b]">200</span></span>
                    <span className="font-mono text-[12px]">{r.endpoint}</span>
                    <span>{r.latency}</span>
                    <span className="text-[#52525b]">{r.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Social proof strip ── */}
      <section className="border-y border-[#1c1c1f] py-10">
        <div className="mx-auto max-w-[1120px] px-6 flex flex-wrap items-center justify-between gap-8 text-center">
          {[
            ["10K+", "API calls processed"],
            ["99.9%", "Uptime guarantee"],
            ["< 50ms", "Response latency"],
            ["SOC 2", "Security ready"],
          ].map(([value, label]) => (
            <div key={label} className="flex-1 min-w-[140px]">
              <p className="text-2xl font-semibold tracking-tight text-white">{value}</p>
              <p className="mt-1 text-[13px] text-[#71717a]">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1120px] px-6">
          <p className="text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-3">Platform</p>
          <h2 className="scroll-section max-w-lg text-3xl font-semibold tracking-tight">Everything you need to launch, meter, and monetize</h2>

          <div className="mt-14 grid gap-px bg-[#1c1c1f] rounded-xl overflow-hidden md:grid-cols-3">
            {[
              { title: "Dynamic Schemas", desc: "Define and modify your data models from the dashboard. Collections are provisioned automatically in MongoDB." },
              { title: "API Key Management", desc: "Generate scoped keys with granular read/write permissions. Every request is validated and metered." },
              { title: "Usage Metering", desc: "Real-time charts show exactly how your endpoints are being consumed. Set rate limits per key." },
              { title: "Stripe Billing", desc: "Subscription tiers sync automatically. Upgrade flows, invoices, and webhook handling — built in." },
              { title: "Team Collaboration", desc: "Invite team members, assign roles, and manage access across projects from one workspace." },
              { title: "Published SDK", desc: "Install our npm package and start querying in 3 lines of code. Full TypeScript support included." },
            ].map((f) => (
              <div key={f.title} className="scroll-section bg-[#09090b] p-8">
                <h3 className="text-[15px] font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-[14px] leading-relaxed text-[#71717a]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code section ── */}
      <section className="py-24 lg:py-32 border-t border-[#1c1c1f]">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="scroll-section">
              <p className="text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-3">Developer experience</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-5">Three lines to your first query</h2>
              <p className="text-[15px] leading-relaxed text-[#71717a] mb-8">
                The Nigris SDK handles authentication, pagination, and error handling. Install it, pass your API key, and start building.
              </p>
              <ul className="space-y-3">
                {["TypeScript-first with full type safety", "Auto-validates against your schema", "Built-in pagination & filtering", "Counts towards your billing tier automatically"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[14px] text-[#a1a1aa]">
                    <Check className="mt-0.5 h-4 w-4 text-[#22c55e] shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="scroll-section">
              <div className="rounded-xl border border-[#1c1c1f] bg-[#111113] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1c1c1f]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/50" />
                  <span className="ml-2 text-[12px] text-[#52525b]">index.ts</span>
                </div>
                <pre className="p-5 text-[13px] leading-[1.7] text-[#d4d4d8] overflow-x-auto"><code>{`import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: process.env.NIGRIS_API_KEY,
});

const user = await client.create('users', {
  name: "Jane Doe",
  email: "jane@acme.com",
  plan: "pro"
});

console.log(user._id);`}</code></pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Showcase — code-built API keys UI ── */}
      <section className="py-24 lg:py-32 border-t border-[#1c1c1f]">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="scroll-section rounded-xl border border-[#1c1c1f] bg-[#111113] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1c1c1f]">
                <p className="text-[13px] font-medium">API Keys</p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { name: "Production", key: "nig_live_8f2a...x9k1", status: "Active", color: "text-[#22c55e]" },
                  { name: "Staging", key: "nig_test_3d7b...m4p2", status: "Active", color: "text-[#22c55e]" },
                  { name: "CI/CD", key: "nig_test_9e1c...j6r8", status: "Expired", color: "text-[#ef4444]" },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between rounded-lg border border-[#1c1c1f] bg-[#0c0c0e] px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium">{k.name}</p>
                      <p className="text-[12px] font-mono text-[#3f3f46] mt-0.5">{k.key}</p>
                    </div>
                    <span className={`text-[11px] font-medium ${k.color}`}>{k.status}</span>
                  </div>
                ))}
              </div>
              {/* Permissions */}
              <div className="px-5 py-4 border-t border-[#1c1c1f]">
                <p className="text-[12px] text-[#52525b] uppercase tracking-wider mb-3">Permissions</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Read", "Write", "Delete", "Admin"].map((p, i) => (
                    <div key={p} className="flex items-center justify-between rounded-md border border-[#1c1c1f] px-3 py-2">
                      <span className="text-[12px] text-[#a1a1aa]">{p}</span>
                      <div className={`w-7 h-4 rounded-full ${i < 2 ? 'bg-[#3b82f6]' : 'bg-[#27272a]'} relative`}>
                        <div className={`absolute top-0.5 ${i < 2 ? 'right-0.5' : 'left-0.5'} w-3 h-3 rounded-full bg-white`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="scroll-section lg:pt-8">
              <p className="text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-3">Security</p>
              <h2 className="text-3xl font-semibold tracking-tight mb-5">Fine-grained access control</h2>
              <p className="text-[15px] leading-relaxed text-[#71717a] mb-6">
                Generate API keys with scoped permissions. Monitor rate limit usage per key, set automatic expiration, and revoke access in one click.
              </p>
              <Link
                href="/login"
                className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#27272a] px-5 text-[14px] font-medium text-[#a1a1aa] transition hover:border-[#3f3f46] hover:text-white"
              >
                Try the dashboard <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 lg:py-32 border-t border-[#1c1c1f]">
        <div className="mx-auto max-w-[1120px] px-6 text-center">
          <h2 className="scroll-section text-3xl sm:text-4xl font-semibold tracking-tight">Start building today</h2>
          <p className="scroll-section mt-4 text-[15px] text-[#71717a] max-w-md mx-auto">
            Free to start. No credit card required. Upgrade when you&apos;re ready.
          </p>
          <div className="scroll-section mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex h-10 items-center rounded-lg bg-white px-5 text-[14px] font-medium text-[#09090b] transition hover:bg-[#e4e4e7]"
            >
              Create free account
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-[#27272a] px-5 text-[14px] font-medium text-[#a1a1aa] transition hover:border-[#3f3f46] hover:text-white"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
