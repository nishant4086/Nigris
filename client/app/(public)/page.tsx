"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ArrowRight, Database, Shield, Zap, Code, CreditCard, BarChart, Globe, Lock, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function Home() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const heroTl = gsap.timeline();
    heroTl
      .fromTo(".hero-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
      .fromTo(".hero-title", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.3")
      .fromTo(".hero-desc", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6")
      .fromTo(".hero-buttons", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }, "-=0.4")
      .fromTo(".hero-image-wrapper", { y: 80, scale: 0.92, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power3.out" }, "-=0.5");

    // Floating orbs parallax
    gsap.to(".orb-1", { y: -30, duration: 4, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".orb-2", { y: 25, duration: 5, repeat: -1, yoyo: true, ease: "sine.inOut" });
    gsap.to(".orb-3", { y: -20, duration: 3.5, repeat: -1, yoyo: true, ease: "sine.inOut" });

    // Stats counter
    gsap.fromTo(".stat-item", { y: 30, opacity: 0 }, {
      scrollTrigger: { trigger: ".stats-section", start: "top 85%" },
      y: 0, opacity: 1, duration: 0.6, stagger: 0.15, ease: "power3.out",
    });

    // Features
    gsap.fromTo(".feature-header", { y: 40, opacity: 0 }, {
      scrollTrigger: { trigger: ".features-section", start: "top 80%" },
      y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
    });
    gsap.fromTo(".feature-card", { y: 50, opacity: 0 }, {
      scrollTrigger: { trigger: ".features-section", start: "top 70%" },
      y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: "back.out(1.4)",
    });

    // SDK
    const sdkTl = gsap.timeline({ scrollTrigger: { trigger: ".sdk-section", start: "top 75%" } });
    sdkTl
      .fromTo(".sdk-text", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(".sdk-code", { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6");

    // Settings
    const setTl = gsap.timeline({ scrollTrigger: { trigger: ".settings-section", start: "top 75%" } });
    setTl
      .fromTo(".settings-text", { x: 50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
      .fromTo(".settings-image", { x: -50, opacity: 0 }, { x: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.6");

    // CTA
    gsap.fromTo(".cta-box", { scale: 0.9, y: 30, opacity: 0 }, {
      scrollTrigger: { trigger: ".cta-section", start: "top 85%" },
      scale: 1, y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
    });
  }, { scope: container });

  return (
    <div ref={container} className="flex flex-col min-h-screen overflow-x-hidden bg-slate-950 text-white">

      {/* ===== HERO ===== */}
      <section className="relative py-24 lg:py-40 overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="orb-1 absolute top-20 left-[15%] w-72 h-72 rounded-full bg-blue-600/20 blur-[120px] pointer-events-none" />
        <div className="orb-2 absolute top-40 right-[10%] w-96 h-96 rounded-full bg-indigo-600/15 blur-[140px] pointer-events-none" />
        <div className="orb-3 absolute bottom-0 left-[40%] w-80 h-80 rounded-full bg-cyan-500/10 blur-[100px] pointer-events-none" />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <div className="hero-badge inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 mb-8">
            <Sparkles className="h-3.5 w-3.5" /> Now in public beta
          </div>

          <h1 className="hero-title mx-auto max-w-5xl text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            The modern way to
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              build & ship APIs
            </span>
          </h1>

          <p className="hero-desc mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-400">
            Nigris gives you dynamic schemas, secure API keys, real-time metering, and Stripe billing—wired together in one beautiful dashboard so you can focus on your product.
          </p>

          <div className="hero-buttons mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/register"
              className="group relative rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105"
            >
              Start building for free
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
            </Link>
            <Link href="/docs" className="flex items-center gap-2 text-sm font-semibold text-slate-300 hover:text-white transition-colors group">
              Read the docs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          {/* Dashboard preview */}
          <div className="hero-image-wrapper mt-20 sm:mt-28 relative mx-auto max-w-5xl">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/30 via-indigo-500/20 to-cyan-500/30 opacity-60 blur-3xl pointer-events-none" />
            <div className="relative rounded-2xl bg-slate-900/80 p-1.5 shadow-2xl ring-1 ring-white/10 backdrop-blur-sm">
              <Image
                src="/dashboard-mockup.png"
                alt="Nigris Dashboard Analytics"
                width={2048}
                height={2048}
                className="rounded-xl w-full h-auto object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="stats-section relative border-y border-white/5 bg-slate-900/50 py-16">
        <div className="mx-auto max-w-7xl px-6 grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "10K+", label: "API Requests" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "<50ms", label: "Avg Latency" },
            { value: "256-bit", label: "Encryption" },
          ].map((s) => (
            <div key={s.label} className="stat-item text-center">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{s.value}</p>
              <p className="mt-1 text-sm text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section className="features-section py-28 relative">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="feature-header mx-auto max-w-2xl text-center mb-20">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3">Platform Features</p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Everything you need to launch</h2>
            <p className="mt-4 text-lg text-slate-400">Stop writing boilerplate. Focus on your core product.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Database, title: "Dynamic Collections", desc: "Create and modify database schemas on the fly. Nigris auto-provisions MongoDB collections." },
              { icon: Shield, title: "API Key Management", desc: "Generate secure API keys with granular permissions. Every request is validated automatically." },
              { icon: BarChart, title: "Real-time Metering", desc: "Track requests in real-time with beautiful charts. Prevent abuse with automatic rate limiting." },
              { icon: Globe, title: "Global Edge Network", desc: "Your API responses served from the edge, guaranteeing sub-50ms latency worldwide." },
              { icon: Lock, title: "Enterprise Security", desc: "256-bit AES encryption, SOC2-ready architecture, and automatic key rotation built in." },
              { icon: CreditCard, title: "Stripe-ready Billing", desc: "Convert users with clean upgrade flows. Webhook sync keeps everything in perfect harmony." },
            ].map((f, i) => (
              <div key={i} className="feature-card group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.03]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/10">
                    <f.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SDK ===== */}
      <section className="sdk-section relative py-28 overflow-hidden border-t border-white/5">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-blue-600/10 blur-[160px] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="sdk-text">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3">Developer Experience</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Developer-first SDK</h2>
              <p className="mt-6 text-lg text-slate-400 leading-relaxed">
                Integrate Nigris in minutes with our official JavaScript SDK. Full TypeScript support, automatic schema validation, and built-in pagination.
              </p>
              <ul className="mt-8 space-y-4">
                {[
                  { icon: Zap, text: "Connects securely via API key" },
                  { icon: Code, text: "Type-safe CRUD operations" },
                  { icon: CreditCard, text: "Automatically counts towards billing" },
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 border border-blue-500/20">
                      <item.icon className="h-4 w-4 text-blue-400" />
                    </div>
                    {item.text}
                  </li>
                ))}
              </ul>
            </div>
            <div className="sdk-code relative">
              <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-2xl pointer-events-none" />
              <div className="relative rounded-2xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-slate-900/80">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-slate-500">index.ts</span>
                </div>
                <pre className="p-6 text-sm text-slate-300 overflow-x-auto leading-relaxed">
                  <code>{`import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: process.env.NIGRIS_API_KEY,
});

// Insert data dynamically
const record = await client.create('users', {
  name: "Jane Doe",
  role: "Admin"
});

console.log("Created:", record._id);`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== SETTINGS SHOWCASE ===== */}
      <section className="settings-section relative py-28 overflow-hidden border-t border-white/5">
        <div className="absolute top-20 left-0 w-[400px] h-[400px] rounded-full bg-indigo-600/10 blur-[140px] pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="settings-image relative order-2 lg:order-1">
              <div className="absolute -inset-3 rounded-2xl bg-gradient-to-l from-indigo-500/20 to-blue-500/20 blur-2xl pointer-events-none" />
              <div className="relative rounded-2xl bg-white/[0.03] p-1.5 ring-1 ring-white/10">
                <Image
                  src="/api-settings-mockup.png"
                  alt="API Settings and Keys"
                  width={2048}
                  height={2048}
                  className="rounded-xl w-full h-auto object-cover"
                />
              </div>
            </div>
            <div className="settings-text order-1 lg:order-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-3">Fine-grained Control</p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">Granular API Keys</h2>
              <p className="mt-6 text-lg text-slate-400 leading-relaxed">
                Generate keys with specific read/write permissions. Revoke access instantly, set expiration dates, and monitor rate limit usage per key.
              </p>
              <Link href="/login" className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300 transition-colors group">
                Explore the dashboard <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="cta-section relative py-28 border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/20 to-slate-950 pointer-events-none" />
        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="cta-box mx-auto max-w-3xl text-center rounded-3xl border border-white/10 bg-white/[0.02] px-8 py-20 sm:px-16 backdrop-blur-sm">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Ready to launch your API?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-slate-400">
              Join developers who ship faster with Nigris. No credit card required.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register"
                className="group relative rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105"
              >
                Create your workspace
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 blur-xl transition-opacity -z-10" />
              </Link>
              <Link href="/docs" className="text-sm font-semibold text-slate-400 hover:text-white transition-colors">
                View documentation →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
