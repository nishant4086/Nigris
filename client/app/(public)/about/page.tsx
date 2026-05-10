"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function AboutPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".fade-in", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" });
  }, { scope: container });

  return (
    <div ref={container} className="bg-[#09090b] text-white min-h-screen">
      {/* Hero — left-aligned, editorial style */}
      <section className="pt-28 pb-20 lg:pt-40 lg:pb-28 border-b border-[#1c1c1f]">
        <div className="mx-auto max-w-[1120px] px-6">
          <p className="fade-in text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-5">About Nigris</p>
          <h1 className="fade-in max-w-2xl text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.12] tracking-[-0.02em]">
            We&apos;re building the infrastructure layer for API-first products
          </h1>
          <p className="fade-in mt-6 max-w-xl text-[16px] leading-relaxed text-[#a1a1aa]">
            Every API company rewrites the same code: auth, rate limits, usage tracking, billing integration. We believe that work should be invisible.
          </p>
        </div>
      </section>

      {/* Two-column story */}
      <section className="py-24 lg:py-32">
        <div className="mx-auto max-w-[1120px] px-6 grid lg:grid-cols-2 gap-16">
          <div className="fade-in">
            <p className="text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-3">Mission</p>
            <h2 className="text-xl font-semibold mb-4">Focus on your product, not plumbing</h2>
            <p className="text-[15px] leading-[1.7] text-[#71717a]">
              We started Nigris because we kept building the same backend scaffolding for every API project — authentication middleware, Stripe webhook handlers, usage dashboards. We believe these solved problems should be infrastructure, not custom code. Our mission is to reduce the time from idea to production-ready API from weeks to hours.
            </p>
          </div>
          <div className="fade-in">
            <p className="text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-3">Vision</p>
            <h2 className="text-xl font-semibold mb-4">APIs as a first-class product</h2>
            <p className="text-[15px] leading-[1.7] text-[#71717a]">
              We envision a world where launching a metered, documented, and monetized API is as simple as deploying a Vercel project. Nigris provides the dashboard, the SDK, the billing, and the analytics — you provide the business logic. That&apos;s the division of labor that makes sense.
            </p>
          </div>
        </div>
      </section>

      {/* Principles — horizontal list */}
      <section className="py-24 lg:py-32 border-t border-[#1c1c1f]">
        <div className="mx-auto max-w-[1120px] px-6">
          <p className="fade-in text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-8">How we work</p>
          <div className="grid gap-px bg-[#1c1c1f] rounded-xl overflow-hidden sm:grid-cols-2 lg:grid-cols-4">
            {[
              { title: "Ship daily", desc: "Small, frequent releases over big-bang launches." },
              { title: "Developer-first", desc: "If the DX is bad, it doesn't matter how powerful the feature is." },
              { title: "Earn trust", desc: "Open roadmap, honest changelogs, no surprise pricing." },
              { title: "Stay lean", desc: "A small team making deliberate choices beats a large team making safe ones." },
            ].map((p) => (
              <div key={p.title} className="fade-in bg-[#09090b] p-7">
                <h3 className="text-[15px] font-semibold mb-2">{p.title}</h3>
                <p className="text-[13px] leading-relaxed text-[#71717a]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
