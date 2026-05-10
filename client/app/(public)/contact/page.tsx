"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ContactPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".fade-in", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" });
  }, { scope: container });

  return (
    <div ref={container} className="bg-[#09090b] text-white min-h-screen">
      <section className="pt-28 pb-24 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-[520px] px-6">
          <p className="fade-in text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-5">Contact</p>
          <h1 className="fade-in text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] mb-3">
            Get in touch
          </h1>
          <p className="fade-in text-[15px] text-[#71717a] mb-10">
            Questions about pricing, enterprise plans, or technical integration? We typically respond within a business day.
          </p>

          <form className="fade-in space-y-5">
            <div>
              <label htmlFor="name" className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Name</label>
              <input
                type="text" id="name" autoComplete="name" placeholder="Jane Doe"
                className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent px-3.5 text-[14px] text-white placeholder:text-[#3f3f46] outline-none transition focus:border-[#52525b]"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Email</label>
              <input
                type="email" id="email" autoComplete="email" placeholder="jane@company.com"
                className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent px-3.5 text-[14px] text-white placeholder:text-[#3f3f46] outline-none transition focus:border-[#52525b]"
              />
            </div>
            <div>
              <label htmlFor="subject" className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Subject</label>
              <input
                type="text" id="subject" placeholder="Pricing question"
                className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent px-3.5 text-[14px] text-white placeholder:text-[#3f3f46] outline-none transition focus:border-[#52525b]"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Message</label>
              <textarea
                id="message" rows={5} placeholder="Tell us how we can help…"
                className="w-full rounded-lg border border-[#27272a] bg-transparent px-3.5 py-2.5 text-[14px] text-white placeholder:text-[#3f3f46] outline-none transition focus:border-[#52525b] resize-none"
              />
            </div>
            <button
              type="button"
              className="w-full h-10 rounded-lg bg-white text-[14px] font-medium text-[#09090b] transition hover:bg-[#e4e4e7]"
            >
              Send message
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
