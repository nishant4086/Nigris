"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

const posts = [
  { title: "Introducing Nigris", desc: "The complete SaaS dashboard for API products is now in public beta.", date: "Mar 16, 2026", tag: "Product" },
  { title: "Dynamic collections under the hood", desc: "How we auto-provision Mongoose models to support user-defined schemas at runtime.", date: "Apr 04, 2026", tag: "Engineering" },
  { title: "Rate limiting done right", desc: "Distributed rate limiting patterns for multi-tenant API products using Redis.", date: "May 01, 2026", tag: "Tutorial" },
];

export default function BlogPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".fade-in", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" });
  }, { scope: container });

  return (
    <div ref={container} className="bg-[#09090b] text-white min-h-screen">
      <section className="pt-28 pb-24 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-[720px] px-6">
          <p className="fade-in text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-5">Blog</p>
          <h1 className="fade-in text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] mb-3">
            Updates & insights
          </h1>
          <p className="fade-in text-[15px] text-[#71717a] mb-12">
            Product announcements, engineering deep-dives, and API best practices.
          </p>

          <div className="space-y-0 divide-y divide-[#1c1c1f]">
            {posts.map((post) => (
              <article key={post.title} className="fade-in group py-8 first:pt-0">
                <div className="flex items-center gap-3 text-[12px] text-[#52525b] mb-3">
                  <time>{post.date}</time>
                  <span className="text-[#3f3f46]">·</span>
                  <span className="text-[#71717a]">{post.tag}</span>
                </div>
                <h2 className="text-[17px] font-semibold mb-2 group-hover:text-[#a1a1aa] transition-colors">
                  <Link href="#">{post.title}</Link>
                </h2>
                <p className="text-[14px] leading-relaxed text-[#71717a] mb-3">{post.desc}</p>
                <Link href="#" className="inline-flex items-center gap-1 text-[13px] font-medium text-[#a1a1aa] hover:text-white transition-colors">
                  Read more <ArrowRight className="h-3 w-3" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
