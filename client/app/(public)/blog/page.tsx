"use client";

import Link from "next/link";
import { useRef, useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  tags: string[];
  createdAt: string;
  author?: { name: string };
}

export default function BlogPage() {
  const container = useRef<HTMLDivElement>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
    fetch(`${baseURL}/blogs`)
      .then((r) => r.json())
      .then((data) => setPosts(Array.isArray(data) ? data : []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, []);

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

          {loading ? (
            <p className="text-center text-[#52525b] py-12">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-center text-[#52525b] py-12">No posts published yet. Check back soon!</p>
          ) : (
            <div className="space-y-0 divide-y divide-[#1c1c1f]">
              {posts.map((post) => (
                <article key={post._id} className="fade-in group py-8 first:pt-0">
                  <div className="flex items-center gap-3 text-[12px] text-[#52525b] mb-3">
                    <time>{new Date(post.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
                    {post.tags?.length > 0 && (
                      <>
                        <span className="text-[#3f3f46]">·</span>
                        <span className="text-[#71717a]">{post.tags[0]}</span>
                      </>
                    )}
                  </div>
                  <h2 className="text-[17px] font-semibold mb-2 group-hover:text-[#a1a1aa] transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt && <p className="text-[14px] leading-relaxed text-[#71717a] mb-3">{post.excerpt}</p>}
                  <Link href={`/blog/${post.slug}`} className="inline-flex items-center gap-1 text-[13px] font-medium text-[#a1a1aa] hover:text-white transition-colors">
                    Read more <ArrowRight className="h-3 w-3" />
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
