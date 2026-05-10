"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function DocsPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".fade-in", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, stagger: 0.08, ease: "power2.out" });
    gsap.fromTo(".doc-block", { y: 20, opacity: 0 }, {
      scrollTrigger: { trigger: ".doc-content", start: "top 90%" },
      y: 0, opacity: 1, duration: 0.5, stagger: 0.12, ease: "power2.out",
    });
  }, { scope: container });

  const codeBlock = (filename: string, code: string) => (
    <div className="mt-4 rounded-lg border border-[#1c1c1f] bg-[#111113] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-[#1c1c1f]">
        <span className="w-2 h-2 rounded-full bg-[#ef4444]/40" />
        <span className="w-2 h-2 rounded-full bg-[#eab308]/40" />
        <span className="w-2 h-2 rounded-full bg-[#22c55e]/40" />
        <span className="ml-1.5 text-[11px] text-[#3f3f46]">{filename}</span>
      </div>
      <pre className="p-4 text-[13px] leading-[1.7] text-[#a1a1aa] overflow-x-auto"><code>{code}</code></pre>
    </div>
  );

  return (
    <div ref={container} className="bg-[#09090b] text-white min-h-screen">
      <section className="pt-28 pb-24 lg:pt-40 lg:pb-32">
        <div className="mx-auto max-w-[680px] px-6">
          <p className="fade-in text-[13px] font-medium tracking-wide text-[#a1a1aa] mb-5">Documentation</p>
          <h1 className="fade-in text-[clamp(1.75rem,3.5vw,2.5rem)] font-semibold leading-[1.15] tracking-[-0.02em] mb-3">
            Getting started
          </h1>
          <p className="fade-in text-[15px] text-[#71717a] mb-14">
            Install the SDK, authenticate, and make your first API call in under five minutes.
          </p>

          <div className="doc-content space-y-14">
            <div className="doc-block">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1c1c1f] text-[12px] font-semibold text-[#71717a]">1</span>
                <h2 className="text-[17px] font-semibold">Install</h2>
              </div>
              <p className="text-[14px] text-[#71717a] leading-relaxed mb-1">Add the SDK to your project.</p>
              {codeBlock("terminal", "npm install @nishant4806/nigris-sdk")}
            </div>

            <div className="doc-block">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1c1c1f] text-[12px] font-semibold text-[#71717a]">2</span>
                <h2 className="text-[17px] font-semibold">Initialize</h2>
              </div>
              <p className="text-[14px] text-[#71717a] leading-relaxed mb-1">Create a client with your API key from the dashboard.</p>
              {codeBlock("client.ts", `import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: 'YOUR_API_KEY',
  baseURL: 'https://nigris-1.onrender.com/api/public'
});`)}
            </div>

            <div className="doc-block">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1c1c1f] text-[12px] font-semibold text-[#71717a]">3</span>
                <h2 className="text-[17px] font-semibold">Create a record</h2>
              </div>
              <p className="text-[14px] text-[#71717a] leading-relaxed mb-1">Insert data into any collection.</p>
              {codeBlock("create.ts", `const user = await client.create('users', {
  name: "Alice",
  email: "alice@example.com",
  age: 28
});

console.log(user._id);`)}
            </div>

            <div className="doc-block">
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-[#1c1c1f] text-[12px] font-semibold text-[#71717a]">4</span>
                <h2 className="text-[17px] font-semibold">Query data</h2>
              </div>
              <p className="text-[14px] text-[#71717a] leading-relaxed mb-1">Fetch with pagination and filters.</p>
              {codeBlock("query.ts", `const { data, pagination } = await client.list('users', {
  page: 1,
  limit: 10,
  age: 28
});

console.log(\`\${pagination.total} results\`);`)}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
