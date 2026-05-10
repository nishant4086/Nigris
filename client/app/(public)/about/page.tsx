"use client";

import { useRef } from "react";
import { Target, Eye, Users, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function AboutPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".about-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    gsap.fromTo(".about-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 });
    gsap.fromTo(".about-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", delay: 0.2 });
    gsap.fromTo(".value-card", { y: 40, opacity: 0 }, {
      scrollTrigger: { trigger: ".values-section", start: "top 80%" },
      y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "back.out(1.4)",
    });
    gsap.fromTo(".story-block", { y: 30, opacity: 0 }, {
      scrollTrigger: { trigger: ".story-section", start: "top 80%" },
      y: 0, opacity: 1, duration: 0.7, stagger: 0.2, ease: "power3.out",
    });
  }, { scope: container });

  return (
    <div ref={container} className="bg-slate-950 text-white min-h-screen overflow-x-hidden">
      {/* Hero */}
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute top-20 left-[20%] w-72 h-72 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-[15%] w-80 h-80 rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <div className="about-badge inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 mb-8">
            <Sparkles className="h-3.5 w-3.5" /> Our Story
          </div>
          <h1 className="about-title text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]">
            Building the future of
            <span className="block bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
              API infrastructure
            </span>
          </h1>
          <p className="about-desc mt-8 text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            We believe launching an API product should be about your core logic, not about 
            configuring rate limits, managing keys, and wiring up Stripe webhooks.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="values-section py-24 border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Target, title: "Our Mission", desc: "Democratize API monetization by providing a beautiful, unified dashboard that handles everything out-of-the-box." },
              { icon: Eye, title: "Our Vision", desc: "A world where anyone can launch a perfectly metered, beautifully documented API product in a single weekend." },
              { icon: Users, title: "Our Team", desc: "A passionate group of engineers and designers who have built infrastructure at scale for millions of users." },
              { icon: Sparkles, title: "Our Values", desc: "Developer experience first. Ship fast, iterate faster. Build tools we would want to use ourselves every day." },
            ].map((v, i) => (
              <div key={i} className="value-card group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.03]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 border border-blue-500/10">
                    <v.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story */}
      <section className="story-section py-24 border-t border-white/5">
        <div className="mx-auto max-w-3xl px-6 space-y-12">
          <div className="story-block">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3">Why we built Nigris</p>
            <h2 className="text-2xl font-bold mb-4">The problem we saw</h2>
            <p className="text-slate-400 leading-relaxed">
              Every time a developer wants to monetize an API, they end up writing the same 
              boilerplate: authentication middleware, rate limiting, usage tracking, Stripe integration, 
              and a dashboard to manage it all. We built Nigris so you never have to write that code again.
            </p>
          </div>
          <div className="story-block">
            <h2 className="text-2xl font-bold mb-4">What makes us different</h2>
            <p className="text-slate-400 leading-relaxed">
              Unlike other platforms, Nigris gives you dynamic schemas that adapt to your data model, 
              a published npm SDK for instant integration, and a real-time usage dashboard that your 
              customers will love. Everything is connected — from the first API call to the Stripe invoice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
