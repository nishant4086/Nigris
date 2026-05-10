"use client";

import Link from "next/link";
import Image from "next/image";
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

        {/* Dashboard visual */}
        <div className="hero-visual mx-auto mt-16 max-w-[1120px] px-6">
          <div className="relative overflow-hidden rounded-xl border border-[#1c1c1f] bg-[#111113]">
            <Image
              src="/dashboard-mockup.png"
              alt="Nigris dashboard"
              width={2048}
              height={2048}
              className="w-full h-auto"
              priority
            />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#09090b] to-transparent" />
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

      {/* ── Showcase ── */}
      <section className="py-24 lg:py-32 border-t border-[#1c1c1f]">
        <div className="mx-auto max-w-[1120px] px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="scroll-section relative overflow-hidden rounded-xl border border-[#1c1c1f]">
              <Image
                src="/api-settings-mockup.png"
                alt="API key settings"
                width={2048}
                height={2048}
                className="w-full h-auto"
              />
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[#09090b] to-transparent" />
            </div>
            <div className="scroll-section">
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
