"use client";

import { useRef } from "react";
import { BookOpen } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

export default function DocsPage() {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.fromTo(".docs-badge", { y: -20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
    gsap.fromTo(".docs-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", delay: 0.1 });
    gsap.fromTo(".docs-section", { y: 30, opacity: 0 }, {
      scrollTrigger: { trigger: ".docs-content", start: "top 85%" },
      y: 0, opacity: 1, duration: 0.7, stagger: 0.2, ease: "power3.out",
    });
  }, { scope: container });

  return (
    <div ref={container} className="bg-slate-950 text-white min-h-screen overflow-x-hidden">
      <section className="relative py-24 lg:py-32 overflow-hidden">
        <div className="absolute top-10 right-[20%] w-72 h-72 rounded-full bg-blue-600/15 blur-[120px] pointer-events-none" />
        <div className="absolute top-60 left-[15%] w-64 h-64 rounded-full bg-indigo-600/10 blur-[110px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] pointer-events-none" />

        <div className="relative mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center mb-20">
            <div className="docs-badge inline-flex items-center gap-2 rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-400 mb-8">
              <BookOpen className="h-3.5 w-3.5" /> Documentation
            </div>
            <h1 className="docs-title text-4xl sm:text-5xl font-bold tracking-tight">
              Get started with <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Nigris</span>
            </h1>
            <p className="mt-4 text-lg text-slate-400">Everything you need to integrate your API with Nigris.</p>
          </div>

          <div className="docs-content space-y-16">
            {/* Section 1 */}
            <div className="docs-section">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3">Step 1</p>
              <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                Install the official Nigris Node.js SDK via npm. The SDK provides full TypeScript support and handles authentication, pagination, and dynamic schema validation.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-slate-600">terminal</span>
                </div>
                <div className="p-5">
                  <code className="text-sm text-green-400">npm install @nishant4806/nigris-sdk</code>
                </div>
              </div>
            </div>

            {/* Section 2 */}
            <div className="docs-section">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3">Step 2</p>
              <h2 className="text-2xl font-bold mb-4">Initializing the Client</h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                Generate an API Key from your Nigris Dashboard under the &quot;API Keys&quot; section. Pass this key when initializing the client.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-slate-600">client.ts</span>
                </div>
                <pre className="p-5 text-sm text-slate-300 overflow-x-auto leading-relaxed">
                  <code>{`import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: 'YOUR_API_KEY_HERE',
  baseURL: 'https://nigris-1.onrender.com/api/public'
});`}</code>
                </pre>
              </div>
            </div>

            {/* Section 3 */}
            <div className="docs-section">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3">Step 3</p>
              <h2 className="text-2xl font-bold mb-4">Creating Entries</h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                Insert data into your collections. The SDK automatically validates your data against the dynamic schema defined in your dashboard.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-slate-600">create.ts</span>
                </div>
                <pre className="p-5 text-sm text-slate-300 overflow-x-auto leading-relaxed">
                  <code>{`const collectionId = 'my-collection-slug';

const response = await client.create(collectionId, {
  name: "Alice",
  email: "alice@example.com",
  age: 28
});

console.log(response); // { _id: "...", name: "Alice", ... }`}</code>
                </pre>
              </div>
            </div>

            {/* Section 4 */}
            <div className="docs-section">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-400 mb-3">Step 4</p>
              <h2 className="text-2xl font-bold mb-4">Fetching Data</h2>
              <p className="text-slate-400 leading-relaxed mb-5">
                Fetch records with built-in pagination, sorting, and filtering capabilities.
              </p>
              <div className="rounded-xl border border-white/10 bg-white/[0.03] overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500/60" />
                  <span className="ml-2 text-xs text-slate-600">fetch.ts</span>
                </div>
                <pre className="p-5 text-sm text-slate-300 overflow-x-auto leading-relaxed">
                  <code>{`const { data, pagination } = await client.list(collectionId, {
  page: 1,
  limit: 10,
  age: 28  // filter by any field
});

console.log(\`Found \${pagination.total} records\`);`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
