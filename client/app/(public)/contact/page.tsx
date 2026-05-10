"use client";

import { useRef } from "react";
import { Mail, Sparkles } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function ContactPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const tl = gsap.timeline();
    tl.fromTo(".contact-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" })
      .fromTo(".contact-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.3")
      .fromTo(".contact-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out" }, "-=0.5")
      .fromTo(".contact-form", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.4");
  }, { scope: container });

  return (
    <div ref={container} className="bg-slate-950 text-white min-h-screen overflow-x-hidden">
      <section className="relative py-24 lg:py-36 overflow-hidden">
        <div className="absolute top-20 left-[25%] w-72 h-72 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-60 right-[20%] w-64 h-64 rounded-full bg-indigo-600/10 blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative mx-auto max-w-2xl px-6">
          <div className="text-center mb-16">
            <div className="contact-badge inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 mb-8">
              <Mail className="h-3.5 w-3.5" /> Get in Touch
            </div>
            <h1 className="contact-title text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
              Contact <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Sales & Support</span>
            </h1>
            <p className="contact-desc mt-4 text-lg text-slate-400">
              Have questions about pricing, enterprise plans, or need technical support? We&apos;re here to help.
            </p>
          </div>

          <div className="contact-form relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/10 to-indigo-500/10 blur-2xl pointer-events-none" />
            <form className="relative rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-sm p-8 sm:p-10 space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">Full name</label>
                <input
                  type="text" name="name" id="name" autoComplete="name"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors text-sm"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email" name="email" id="email" autoComplete="email"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors text-sm"
                  placeholder="jane@company.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-2">Message</label>
                <textarea
                  name="message" id="message" rows={5}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 focus:outline-none transition-colors text-sm resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="button"
                className="w-full rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02]"
              >
                Send message
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
