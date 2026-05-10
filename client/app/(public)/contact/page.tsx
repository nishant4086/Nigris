"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

export default function ContactPage() {
  const container = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useGSAP(() => {
    gsap.fromTo(".fade-in", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" });
  }, { scope: container });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
      const res = await fetch(`${baseURL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  };

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

          {status === "sent" ? (
            <div className="fade-in rounded-lg border border-[#22c55e]/30 bg-[#22c55e]/5 p-6 text-center">
              <p className="text-[15px] font-medium text-[#22c55e]">Message sent!</p>
              <p className="text-[13px] text-[#71717a] mt-1">We&apos;ll get back to you soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="fade-in space-y-5">
              <div>
                <label htmlFor="name" className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Name</label>
                <input type="text" id="name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent px-3.5 text-[14px] text-white placeholder:text-[#3f3f46] outline-none transition focus:border-[#52525b]"
                  placeholder="Jane Doe" />
              </div>
              <div>
                <label htmlFor="email" className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Email</label>
                <input type="email" id="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent px-3.5 text-[14px] text-white placeholder:text-[#3f3f46] outline-none transition focus:border-[#52525b]"
                  placeholder="jane@company.com" />
              </div>
              <div>
                <label htmlFor="subject" className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Subject</label>
                <input type="text" id="subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className="w-full h-10 rounded-lg border border-[#27272a] bg-transparent px-3.5 text-[14px] text-white placeholder:text-[#3f3f46] outline-none transition focus:border-[#52525b]"
                  placeholder="Pricing question" />
              </div>
              <div>
                <label htmlFor="message" className="block text-[13px] font-medium text-[#a1a1aa] mb-1.5">Message</label>
                <textarea id="message" required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-lg border border-[#27272a] bg-transparent px-3.5 py-2.5 text-[14px] text-white placeholder:text-[#3f3f46] outline-none transition focus:border-[#52525b] resize-none"
                  placeholder="Tell us how we can help…" />
              </div>
              {status === "error" && <p className="text-sm text-red-400">Something went wrong. Please try again.</p>}
              <button type="submit" disabled={status === "sending"}
                className="w-full h-10 rounded-lg bg-white text-[14px] font-medium text-[#09090b] transition hover:bg-[#e4e4e7] disabled:opacity-50">
                {status === "sending" ? "Sending..." : "Send message"}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
