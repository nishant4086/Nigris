"use client";

import Link from "next/link";
import { useRef } from "react";
import { Newspaper, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const posts = [
  {
    id: 1,
    title: "Introducing Nigris: The Complete SaaS Dashboard for APIs",
    description: "Today we are thrilled to announce the general availability of Nigris — the platform we built to eliminate the painful boilerplate of launching, metering, and monetizing API products.",
    date: "Mar 16, 2026",
    category: "Product",
  },
  {
    id: 2,
    title: "How we built the dynamic Next.js + MongoDB architecture",
    description: "A deep dive into how Nigris dynamically provisions Mongoose collections on-the-fly to support flexible, user-defined schema routing.",
    date: "Apr 04, 2026",
    category: "Engineering",
  },
  {
    id: 3,
    title: "Rate Limiting with Redis: Best Practices",
    description: "Learn how to properly implement distributed rate limiting for your API endpoints to protect your infrastructure and enforce usage tiers.",
    date: "May 01, 2026",
    category: "Tutorial",
  },
];

export default function BlogPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".blog-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    gsap.fromTo(".blog-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 });
    gsap.fromTo(".blog-card", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, stagger: 0.15, ease: "back.out(1.4)", delay: 0.3 });
  }, { scope: container });

  return (
    <div ref={container} className="bg-slate-950 text-white min-h-screen overflow-x-hidden">
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute top-20 left-[10%] w-72 h-72 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-60 right-[15%] w-80 h-80 rounded-full bg-indigo-600/10 blur-[130px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="blog-badge inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 mb-8">
              <Newspaper className="h-3.5 w-3.5" /> From the Blog
            </div>
            <h1 className="blog-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Updates & <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Insights</span>
            </h1>
            <p className="mt-4 text-lg text-slate-400">Product updates, engineering deep dives, and API best practices.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <article key={post.id} className="blog-card group relative rounded-2xl border border-white/5 bg-white/[0.02] p-8 transition-all hover:border-blue-500/30 hover:bg-blue-500/[0.03]">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-3 text-xs mb-4">
                    <time className="text-slate-500">{post.date}</time>
                    <span className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-blue-400 font-medium">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold mb-3 group-hover:text-blue-300 transition-colors">
                    <Link href="#">{post.title}</Link>
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed line-clamp-3">{post.description}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
