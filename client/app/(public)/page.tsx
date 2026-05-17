"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { ArrowRight, Check, Plus, Minus } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Home() {
  const container = useRef<HTMLDivElement>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "What is Nigris?",
      a: "Nigris is a modern backend platform that helps developers quickly build APIs, authentication systems, dynamic databases, SDKs, and scalable applications without creating everything from scratch.",
    },
    {
      q: "What can I build with Nigris?",
      a: "You can build SaaS platforms, mobile app backends, dynamic CRUD APIs, authentication systems, admin dashboards, AI-powered apps, analytics platforms, multi-tenant systems, developer tools, and SDKs.",
    },
    {
      q: "Does Nigris support API keys?",
      a: "Yes. Nigris includes an API key system that allows developers to generate secure API keys, control API access, track usage, apply rate limits, and create Free and Pro plans.",
    },
    {
      q: "Which technologies does Nigris use?",
      a: "Nigris is built using modern technologies including Node.js, Express.js, MongoDB, Redis, React, JWT Authentication, Docker, and a robust SDK architecture.",
    },
    {
      q: "Is Nigris production ready?",
      a: "Nigris already includes many production-grade features such as JWT authentication, API key middleware, usage tracking, security middleware, modular architecture, and dynamic route systems. Additional hardening like monitoring, advanced rate limiting, CI/CD, and webhook reliability can further improve production readiness.",
    },
  ];

  useGSAP(() => {
    // Hero entrance — staggered center-out (Vite-style)
    const tl = gsap.timeline({ delay: 1.5 }); // wait for loading screen
    tl.fromTo(".hero-glow", { scale: 0.5, opacity: 0 }, { scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" })
      .fromTo(".hero-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.8")
      .fromTo(".hero-sub", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .fromTo(".hero-cta", { y: 15, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .fromTo(".hero-visual", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.3");

    // Glow pulse animation (Vite-style)
    gsap.to(".hero-glow", { scale: 1.05, opacity: 0.8, duration: 3, repeat: -1, yoyo: true, ease: "sine.inOut" });

    // Scroll animations
    const sections = gsap.utils.toArray<HTMLElement>(".scroll-reveal");
    sections.forEach((el) => {
      gsap.fromTo(el, { y: 24, opacity: 0 }, {
        scrollTrigger: { trigger: el, start: "top 88%" },
        y: 0, opacity: 1, duration: 0.6, ease: "power2.out",
      });
    });

    // Stagger grid children
    gsap.fromTo(".feature-cell", { y: 20, opacity: 0 }, {
      scrollTrigger: { trigger: ".feature-grid", start: "top 80%" },
      y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: "power2.out",
    });

    // Line draw animation for chart
    gsap.fromTo(".chart-line", { strokeDashoffset: 800 }, {
      scrollTrigger: { trigger: ".chart-line", start: "top 90%" },
      strokeDashoffset: 0, duration: 1.5, ease: "power2.out",
    });
  }, { scope: container });

  return (
    <div ref={container} className="bg-[#09090b] text-white overflow-x-hidden">

      {/* ── Hero (Vite-style centered) ── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-28 overflow-hidden">
        {/* Animated glow (Vite-inspired) */}
        <div className="hero-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-[#3b82f6]/8 blur-[120px] pointer-events-none" />

        {/* Grid pattern (Next.js-inspired) */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:80px_80px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] pointer-events-none" />

        <div className="relative mx-auto max-w-[1120px] px-6 text-center">
          <h1 className="hero-title mx-auto max-w-4xl text-[clamp(2.5rem,6vw,4.5rem)] font-bold leading-[1.05] tracking-[-0.03em]">
            Ship APIs.{" "}
            <span className="bg-gradient-to-r from-[#3b82f6] to-[#06b6d4] bg-clip-text text-transparent">
              Not boilerplate.
            </span>
          </h1>
          <p className="hero-sub mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-[#a1a1aa]">
            Nigris is the complete infrastructure for API products — dynamic schemas, key management, usage metering, and Stripe billing in one dashboard.
          </p>
          <div className="hero-cta mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-[14px] font-semibold text-[#09090b] transition-all hover:bg-[#e4e4e7] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Get started free
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex h-11 items-center rounded-lg border border-[#27272a] px-6 text-[14px] font-medium text-[#a1a1aa] transition hover:border-[#3f3f46] hover:text-white"
            >
              Documentation
            </Link>
          </div>
        </div>

        {/* Dashboard visual */}
        <div className="hero-visual mx-auto mt-20 max-w-[1000px] px-6">
          <div className="rounded-xl border border-[#1c1c1f] bg-[#111113] overflow-hidden shadow-[0_0_80px_-20px_rgba(59,130,246,0.15)]">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[#1c1c1f] bg-[#0c0c0e]">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/40" />
              <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/40" />
              <div className="ml-3 flex-1 h-6 rounded-md bg-[#1c1c1f] flex items-center px-3">
                <span className="text-[11px] text-[#3f3f46]">nigris.app/dashboard</span>
              </div>
            </div>
            <div className="p-5 sm:p-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                {[
                  { label: "Total Requests", value: "12,847", change: "+14%" },
                  { label: "Active Keys", value: "24", change: "+3" },
                  { label: "Avg Latency", value: "42ms", change: "-8%" },
                  { label: "Error Rate", value: "0.3%", change: "-0.1%" },
                ].map((s) => (
                  <div key={s.label} className="rounded-lg border border-[#1c1c1f] bg-[#0c0c0e] p-3.5">
                    <p className="text-[11px] text-[#52525b] mb-1">{s.label}</p>
                    <p className="text-lg font-semibold tracking-tight">{s.value}</p>
                    <p className="text-[11px] text-[#22c55e] mt-0.5">{s.change}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-[#1c1c1f] bg-[#0c0c0e] p-4">
                <p className="text-[12px] text-[#52525b] mb-3">API Usage — 7d</p>
                <svg viewBox="0 0 600 100" className="w-full h-auto">
                  <defs>
                    <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path className="chart-line" d="M0,80 C60,75 80,60 150,50 S250,55 300,35 S400,40 450,20 S550,25 600,10"
                    fill="none" stroke="#3b82f6" strokeWidth="2" strokeDasharray="800" />
                  <path d="M0,80 C60,75 80,60 150,50 S250,55 300,35 S400,40 450,20 S550,25 600,10 L600,100 L0,100Z" fill="url(#cg)" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-[#1c1c1f] py-10">
        <div className="mx-auto max-w-[1120px] px-6 flex flex-wrap items-center justify-between gap-8 text-center">
          {[["10K+", "API calls"], ["99.9%", "Uptime"], ["< 50ms", "Latency"], ["SOC 2", "Ready"]].map(([v, l]) => (
            <div key={l} className="scroll-reveal flex-1 min-w-[120px]">
              <p className="text-2xl font-semibold tracking-tight">{v}</p>
              <p className="mt-1 text-[13px] text-[#52525b]">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features grid (Next.js card grid style) ── */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="scroll-reveal text-center max-w-lg mx-auto mb-14">
            <h2 className="text-3xl font-bold tracking-tight">Everything you need to launch</h2>
            <p className="mt-3 text-[15px] text-[#71717a]">From your first API call to your first invoice.</p>
          </div>
          <div className="feature-grid grid gap-px bg-[#1c1c1f] rounded-xl overflow-hidden md:grid-cols-3">
            {[
              { title: "Dynamic Schemas", desc: "Define data models from the dashboard. MongoDB collections provisioned instantly." },
              { title: "API Key Management", desc: "Scoped keys with granular read/write permissions. Every request validated." },
              { title: "Usage Metering", desc: "Real-time charts. Rate limits per key. Abuse prevention built in." },
              { title: "Stripe Billing", desc: "Tiers sync automatically. Upgrade flows, invoices, webhooks — all handled." },
              { title: "Team Collaboration", desc: "Invite members, assign roles, manage access across projects." },
              { title: "Published SDK", desc: "npm install, 3 lines of code, full TypeScript support. That's it." },
            ].map((f) => (
              <div key={f.title} className="feature-cell bg-[#09090b] p-7 transition-colors hover:bg-[#0f0f12]">
                <h3 className="text-[15px] font-semibold mb-2">{f.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#71717a]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Code section ── */}
      <section className="py-24 lg:py-32 border-t border-[#1c1c1f]">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="scroll-reveal">
              <p className="text-[13px] font-medium tracking-wide text-[#52525b] uppercase mb-3">Developer experience</p>
              <h2 className="text-3xl font-bold tracking-tight mb-5">Three lines to your first query</h2>
              <p className="text-[15px] leading-relaxed text-[#71717a] mb-8">
                The Nigris SDK handles auth, pagination, and errors. Install it, pass your key, build.
              </p>
              <ul className="space-y-3">
                {["TypeScript-first with full type safety", "Auto-validates against your schema", "Built-in pagination & filtering", "Counts towards billing automatically"].map((t) => (
                  <li key={t} className="flex items-start gap-2.5 text-[14px] text-[#a1a1aa]">
                    <Check className="mt-0.5 h-4 w-4 text-[#22c55e] shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="scroll-reveal">
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

      {/* ── API Keys showcase ── */}
      <section className="py-24 lg:py-32 border-t border-[#1c1c1f]">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-start">
            <div className="scroll-reveal rounded-xl border border-[#1c1c1f] bg-[#111113] overflow-hidden">
              <div className="px-5 py-4 border-b border-[#1c1c1f]">
                <p className="text-[13px] font-medium">API Keys</p>
              </div>
              <div className="p-4 space-y-2">
                {[
                  { name: "Production", key: "nig_live_8f2a...x9k1", active: true },
                  { name: "Staging", key: "nig_test_3d7b...m4p2", active: true },
                  { name: "CI/CD", key: "nig_test_9e1c...j6r8", active: false },
                ].map((k) => (
                  <div key={k.name} className="flex items-center justify-between rounded-lg border border-[#1c1c1f] bg-[#0c0c0e] px-4 py-3">
                    <div>
                      <p className="text-[13px] font-medium">{k.name}</p>
                      <p className="text-[12px] font-mono text-[#3f3f46] mt-0.5">{k.key}</p>
                    </div>
                    <span className={`text-[11px] font-medium ${k.active ? "text-[#22c55e]" : "text-[#ef4444]"}`}>
                      {k.active ? "Active" : "Expired"}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-5 py-4 border-t border-[#1c1c1f]">
                <p className="text-[12px] text-[#52525b] uppercase tracking-wider mb-3">Permissions</p>
                <div className="grid grid-cols-2 gap-2">
                  {["Read", "Write", "Delete", "Admin"].map((p, i) => (
                    <div key={p} className="flex items-center justify-between rounded-md border border-[#1c1c1f] px-3 py-2">
                      <span className="text-[12px] text-[#a1a1aa]">{p}</span>
                      <div className={`w-7 h-4 rounded-full ${i < 2 ? "bg-[#3b82f6]" : "bg-[#27272a]"} relative`}>
                        <div className={`absolute top-0.5 ${i < 2 ? "right-0.5" : "left-0.5"} w-3 h-3 rounded-full bg-white`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="scroll-reveal lg:pt-8">
              <p className="text-[13px] font-medium tracking-wide text-[#52525b] uppercase mb-3">Security</p>
              <h2 className="text-3xl font-bold tracking-tight mb-5">Fine-grained access control</h2>
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

      {/* ── FAQ ── */}
      <section className="py-24 lg:py-32 border-t border-[#1c1c1f]">
        <div className="mx-auto max-w-[800px] px-6">
          <div className="scroll-reveal text-center mb-16">
            <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-3">Got questions?</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
            <p className="mt-3 text-[15px] text-[#71717a]">Everything you need to know about the Nigris platform.</p>
          </div>
          <div className="scroll-reveal space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-[#1c1c1f] bg-[#111113] overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="flex w-full items-center justify-between px-6 py-5 text-left text-[16px] font-semibold text-white transition hover:text-[#3b82f6]"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <Minus className="h-5 w-5 text-[#3b82f6] shrink-0 ml-4" />
                  ) : (
                    <Plus className="h-5 w-5 text-[#71717a] shrink-0 ml-4" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-6 text-[15px] leading-relaxed text-[#a1a1aa] border-t border-[#1c1c1f]/50 pt-4 animate-in fade-in duration-200">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative py-24 lg:py-32 border-t border-[#1c1c1f] overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] rounded-full bg-[#3b82f6]/5 blur-[100px] pointer-events-none" />
        <div className="relative mx-auto max-w-[1120px] px-6 text-center">
          <h2 className="scroll-reveal text-3xl sm:text-4xl font-bold tracking-tight">Start building today</h2>
          <p className="scroll-reveal mt-4 text-[15px] text-[#71717a] max-w-md mx-auto">
            Free to start. No credit card required. Upgrade when you&apos;re ready.
          </p>
          <div className="scroll-reveal mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="group inline-flex h-11 items-center gap-2 rounded-lg bg-white px-6 text-[14px] font-semibold text-[#09090b] transition-all hover:bg-[#e4e4e7] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Create free account
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-lg border border-[#27272a] px-6 text-[14px] font-medium text-[#a1a1aa] transition hover:border-[#3f3f46] hover:text-white"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
