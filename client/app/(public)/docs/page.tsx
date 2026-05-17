"use client";

import { useState } from "react";
import {
  BookOpen,
  Terminal,
  Code,
  Layers,
  Shield,
  Key,
  Database,
  RefreshCw,
  Zap,
  Server,
  Copy,
  Check,
  Menu,
  X,
  Info,
  AlertTriangle,
  FileText,
  Mail,
  Sliders,
  Sparkles
} from "lucide-react";

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [frameworkTab, setFrameworkTab] = useState("react");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const navSections = [
    {
      category: "Getting Started",
      items: [
        { id: "overview", label: "Overview & Architecture", icon: BookOpen },
        { id: "quickstart", label: "5-Minute Quickstart", icon: Zap },
      ],
    },
    {
      category: "Framework Guides",
      items: [
        { id: "frameworks", label: "React, Vite & Next.js", icon: Code },
        { id: "nodejs", label: "Node.js & Express", icon: Server },
        { id: "rest", label: "REST API & cURL", icon: Terminal },
      ],
    },
    {
      category: "SDK Reference",
      items: [
        { id: "sdk-init", label: "Client Initialization", icon: Sliders },
        { id: "sdk-crud", label: "CRUD Operations", icon: Database },
        { id: "sdk-queries", label: "Filtering & Pagination", icon: Layers },
        { id: "sdk-errors", label: "Error Handling & Retries", icon: RefreshCw },
      ],
    },
    {
      category: "Platform Features",
      items: [
        { id: "api-keys", label: "API Keys & Permissions", icon: Key },
        { id: "schemas", label: "Dynamic Schemas & MongoDB", icon: FileText },
        { id: "rate-limits", label: "Rate Limiting & Quotas", icon: Shield },
        { id: "webhooks", label: "Webhooks & Events", icon: RefreshCw },
        { id: "smtp", label: "SMTP & Transactional Mail", icon: Mail },
      ],
    },
    {
      category: "Production Readiness",
      items: [
        { id: "production", label: "Hardening & Best Practices", icon: Sparkles },
      ],
    },
  ];

  const codeSnippet = (id: string, filename: string, code: string, lang = "typescript") => (
    <div className="my-6 rounded-xl border border-[#1c1c1f] bg-[#111113] overflow-hidden shadow-lg">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#1c1c1f] bg-[#0c0c0e]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#eab308]/50" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]/50" />
          <span className="ml-2 font-mono text-[12px] text-[#71717a]">{filename}</span>
          <span className="ml-2 rounded bg-[#27272a] px-1.5 py-0.5 text-[10px] font-semibold uppercase text-[#a1a1aa]">{lang}</span>
        </div>
        <button
          onClick={() => handleCopy(code, id)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-[12px] font-medium text-[#a1a1aa] transition hover:bg-[#27272a] hover:text-white"
        >
          {copiedId === id ? (
            <>
              <Check className="w-3.5 h-3.5 text-[#22c55e]" />
              <span className="text-[#22c55e]">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-5 text-[13px] leading-[1.7] text-[#d4d4d8] overflow-x-auto font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );

  const callout = (type: "note" | "tip" | "warning", title: string, content: React.ReactNode) => {
    const config = {
      note: { bg: "bg-blue-500/10", border: "border-blue-500/20", text: "text-blue-400", icon: Info },
      tip: { bg: "bg-emerald-500/10", border: "border-emerald-500/20", text: "text-emerald-400", icon: Sparkles },
      warning: { bg: "bg-amber-500/10", border: "border-amber-500/20", text: "text-amber-400", icon: AlertTriangle },
    }[type];

    const Icon = config.icon;

    return (
      <div className={`my-6 flex gap-4 rounded-xl border ${config.border} ${config.bg} p-5`}>
        <Icon className={`w-5 h-5 shrink-0 ${config.text} mt-0.5`} />
        <div>
          <h4 className={`text-[14px] font-bold ${config.text} mb-1 uppercase tracking-wider`}>{title}</h4>
          <div className="text-[14px] leading-relaxed text-[#a1a1aa]">{content}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white pt-24 lg:pt-32">
      <div className="mx-auto max-w-[1440px] px-6 flex flex-col lg:flex-row gap-12">
        {/* ── Mobile Header Drawer Toggle ── */}
        <div className="lg:hidden flex items-center justify-between border-b border-[#1c1c1f] pb-4 mb-4">
          <h1 className="text-xl font-bold tracking-tight">Documentation</h1>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex items-center gap-2 rounded-lg border border-[#27272a] px-3 py-1.5 text-sm"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span>{mobileMenuOpen ? "Close menu" : "Menu"}</span>
          </button>
        </div>

        {/* ── Sidebar Navigation ── */}
        <aside
          className={`w-full lg:w-[280px] shrink-0 border-r border-[#1c1c1f] pr-6 ${
            mobileMenuOpen ? "block" : "hidden lg:block"
          }`}
        >
          <div className="sticky top-32 space-y-8 pb-12 max-h-[calc(100vh-8rem)] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-[#27272a]">
            {navSections.map((section) => (
              <div key={section.category}>
                <p className="text-[12px] font-bold tracking-wider text-[#52525b] uppercase mb-3 px-3">
                  {section.category}
                </p>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setMobileMenuOpen(false);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[14px] font-medium transition-colors ${
                          isActive
                            ? "bg-[#3b82f6]/10 text-[#3b82f6] font-semibold"
                            : "text-[#a1a1aa] hover:bg-[#1c1c1f] hover:text-white"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#3b82f6]" : "text-[#71717a]"}`} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main Documentation Content Area ── */}
        <main className="flex-1 pb-32 max-w-[880px]">
          {/* SECTION: Overview & Architecture */}
          {activeSection === "overview" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Platform Overview</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Architecture & Core Concepts</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Nigris is a next-generation Backend-as-a-Service (BaaS) engineered for developers building API products, SaaS platforms, and dynamic web applications.
                </p>
              </div>

              {callout(
                "note",
                "Why Nigris?",
                "Unlike traditional BaaS tools that lock you into proprietary client libraries, Nigris is built on open standards (Node.js, Express, MongoDB, Redis) and natively integrates API key management, usage quotas, and Stripe billing."
              )}

              <div className="space-y-4">
                <h2 className="text-2xl font-bold tracking-tight">How Nigris Works</h2>
                <p className="text-[#a1a1aa] leading-relaxed">
                  At the core of Nigris is a dynamic routing engine combined with granular API key middleware. When your frontend or client application makes a request:
                </p>
                <div className="grid sm:grid-cols-3 gap-4 my-6">
                  {[
                    { step: "1. Gateway & Auth", desc: "Requests are verified against active API keys or JWT user sessions." },
                    { step: "2. Metering & Quotas", desc: "Redis increments usage counters and checks real-time rate limits." },
                    { step: "3. Dynamic MongoDB", desc: "Dynamic route handlers execute CRUD operations on MongoDB collections." },
                  ].map((s) => (
                    <div key={s.step} className="p-5 rounded-xl bg-[#111113] border border-[#1c1c1f]">
                      <h4 className="font-bold text-white mb-2 text-sm">{s.step}</h4>
                      <p className="text-xs text-[#71717a] leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4 border-t border-[#1c1c1f] pt-8">
                <h2 className="text-2xl font-bold tracking-tight">Key Advantages</h2>
                <ul className="space-y-3 text-[#a1a1aa]">
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>No Boilerplate Database Setup:</strong> Create collections instantly from the dashboard or dynamically via your first SDK insert.</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Native Stripe & Razorpay Billing:</strong> Link your API key tiers directly to billing plans. Automated cutoff when usage limits are exceeded.</span>
                  </li>
                  <li className="flex gap-3">
                    <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span><strong>Flawless Developer Experience:</strong> Available via REST or a fully typed TypeScript SDK.</span>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* SECTION: 5-Minute Quickstart */}
          {activeSection === "quickstart" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Quickstart</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">5-Minute Quickstart</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Go from zero to production-ready database inserts and queries in less than five minutes.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold">Step 1: Install the SDK</h3>
                <p className="text-[#a1a1aa]">Add the Nigris SDK to your Node.js, React, or frontend application.</p>
                {codeSnippet("qs-1", "terminal", "npm install @nishant4806/nigris-sdk", "shell")}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold">Step 2: Obtain your API Key</h3>
                <p className="text-[#a1a1aa]">
                  Login to your dashboard at <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-white font-mono">nigris.app/dashboard</code>, navigate to <strong>API Keys</strong>, and generate a new key with Read and Write permissions.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold">Step 3: Initialize and Save Data</h3>
                <p className="text-[#a1a1aa]">
                  Create an instance of the client and insert a record into any collection name. If the collection doesn&apos;t exist, Nigris provisions it automatically.
                </p>
                {codeSnippet(
                  "qs-2",
                  "quickstart.ts",
                  `import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: "nig_live_98a71b...c43e",
  baseURL: "https://nigris.app/api/public",
});

async function run() {
  // Insert a new record into the 'customers' collection
  const customer = await client.create("customers", {
    name: "Acme Corp",
    tier: "Enterprise",
    usersCount: 150,
    active: true,
  });

  console.log("Created Customer ID:", customer._id);
}

run();`,
                  "typescript"
                )}
              </div>
            </div>
          )}

          {/* SECTION: Framework Guides (React, Vite & Next.js) */}
          {activeSection === "frameworks" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Frameworks</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">React, Vite & Next.js</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  How to securely integrate Nigris into client-side React apps, Vite single-page applications, and Next.js full-stack frameworks.
                </p>
              </div>

              {/* Framework Tabs */}
              <div className="border-b border-[#1c1c1f] flex gap-6">
                {[
                  { id: "react", label: "React & Vite (Client)" },
                  { id: "next-server", label: "Next.js (Server Components)" },
                  { id: "next-client", label: "Next.js (Client Components)" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFrameworkTab(t.id)}
                    className={`pb-3 text-sm font-bold transition-all border-b-2 ${
                      frameworkTab === t.id
                        ? "border-[#3b82f6] text-[#3b82f6]"
                        : "border-transparent text-[#71717a] hover:text-white"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {frameworkTab === "react" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <p className="text-[#a1a1aa]">
                    In Vite and pure React applications, store your public API key in <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-white font-mono">.env</code> as <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-white font-mono">VITE_NIGRIS_API_KEY</code>. Make sure the API key is configured with Read-Only permissions if exposed to the browser.
                  </p>
                  {codeSnippet(
                    "fw-react",
                    "src/hooks/useNigris.ts",
                    `import { useState, useEffect } from 'react';
import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: import.meta.env.VITE_NIGRIS_API_KEY,
  baseURL: 'https://nigris.app/api/public',
});

export function useCollection<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetch() {
      try {
        const result = await client.list(collectionName);
        setData(result.data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch collection");
      } finally {
        setLoading(false);
      }
    }
    fetch();
  }, [collectionName]);

  return { data, loading, error };
}`,
                    "typescript"
                  )}
                </div>
              )}

              {frameworkTab === "next-server" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <p className="text-[#a1a1aa]">
                    With Next.js App Router Server Components, your API key remains fully secure on the server. You can safely use privileged keys with Write and Delete permissions.
                  </p>
                  {codeSnippet(
                    "fw-next-s",
                    "app/dashboard/page.tsx",
                    `import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: process.env.NIGRIS_SECRET_API_KEY, // Server-only env
  baseURL: 'https://nigris.app/api/public',
});

export const revalidate = 60; // Cache for 60 seconds

export default async function DashboardPage() {
  const { data: projects } = await client.list("projects", { limit: 20 });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Active Projects</h1>
      <div className="grid grid-cols-3 gap-4">
        {projects.map((p: any) => (
          <div key={p._id} className="p-4 border rounded-lg bg-slate-900">
            <h3 className="font-semibold">{p.name}</h3>
            <p className="text-sm text-slate-400">{p.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}`,
                    "tsx"
                  )}
                </div>
              )}

              {frameworkTab === "next-client" && (
                <div className="space-y-6 animate-in fade-in duration-200">
                  <p className="text-[#a1a1aa]">
                    When using Client Components in Next.js, use <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-white font-mono">NEXT_PUBLIC_NIGRIS_API_KEY</code> and combine with SWR or React Query for excellent revalidation and caching.
                  </p>
                  {codeSnippet(
                    "fw-next-c",
                    "components/TaskList.tsx",
                    `"use client";

import useSWR from 'swr';
import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: process.env.NEXT_PUBLIC_NIGRIS_API_KEY,
  baseURL: 'https://nigris.app/api/public',
});

const fetcher = (collection: string) => client.list(collection).then(res => res.data);

export default function TaskList() {
  const { data: tasks, error, isLoading } = useSWR('tasks', fetcher);

  if (isLoading) return <div>Loading tasks...</div>;
  if (error) return <div>Error loading tasks.</div>;

  return (
    <ul className="space-y-2">
      {tasks.map((task: any) => (
        <li key={task._id} className="flex justify-between p-3 bg-[#111113] rounded border">
          <span>{task.title}</span>
          <span className="text-xs text-blue-400">{task.priority}</span>
        </li>
      ))}
    </ul>
  );
}`,
                    "tsx"
                  )}
                </div>
              )}
            </div>
          )}

          {/* SECTION: Node.js & Express */}
          {activeSection === "nodejs" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Backend Integration</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Node.js & Express</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Leverage Nigris as a high-speed data microservice or storage plane inside existing Express.js and Node backends.
                </p>
              </div>

              {codeSnippet(
                "nd-1",
                "server/controllers/orderController.js",
                `import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: process.env.NIGRIS_API_KEY,
  baseURL: "https://nigris.app/api/public",
});

export async function createOrder(req, res) {
  try {
    const { itemId, quantity, customerEmail } = req.body;

    // 1. Create order record in Nigris
    const order = await client.create("orders", {
      itemId,
      quantity,
      customerEmail,
      status: "processing",
      createdAt: new Date().toISOString()
    });

    // 2. Return confirmation
    res.status(201).json({ success: true, orderId: order._id });
  } catch (error) {
    console.error("Order creation error:", error.message);
    res.status(500).json({ error: error.message });
  }
}`,
                "javascript"
              )}

              {callout(
                "tip",
                "Express Middleware Interoperability",
                "Because Nigris responses are clean JSON objects, you can seamlessly pass data directly into your Express route responses without manual data formatting."
              )}
            </div>
          )}

          {/* SECTION: REST API & cURL */}
          {activeSection === "rest" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Direct HTTP Protocol</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">REST API & cURL</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  You can communicate directly with Nigris endpoints from any language (Python, Go, Rust, PHP) using standard HTTP requests.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Authentication Header</h3>
                <p className="text-[#a1a1aa]">
                  Pass your API key using either the <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-white font-mono">X-API-Key</code> header or standard Bearer authorization.
                </p>
                {codeSnippet(
                  "rest-1",
                  "cURL — Get Collection List",
                  `curl -X GET "https://nigris.app/api/public/customers?page=1&limit=5" \\
  -H "X-API-Key: nig_live_883a...c912" \\
  -H "Content-Type: application/json"`,
                  "bash"
                )}
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Creating Records via POST</h3>
                {codeSnippet(
                  "rest-2",
                  "cURL — Create Record",
                  `curl -X POST "https://nigris.app/api/public/analytics" \\
  -H "X-API-Key: nig_live_883a...c912" \\
  -H "Content-Type: application/json" \\
  -d '{"event": "signup", "userId": "usr_9981", "device": "iOS"}'`,
                  "bash"
                )}
              </div>
            </div>
          )}

          {/* SECTION: Client Initialization */}
          {activeSection === "sdk-init" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">SDK Reference</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Client Initialization</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Configuration options available when creating a new <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-white font-mono">NigrisClient</code> instance.
                </p>
              </div>

              {codeSnippet(
                "sdk-in",
                "client-config.ts",
                `import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: "nig_live_xxxxxx",
  baseURL: "https://nigris.app/api/public", // Optional, defaults to production
  timeout: 10000,                           // Timeout in milliseconds (default: 15000)
  maxRetries: 3                             // Automatic exponential backoff retries
});`,
                "typescript"
              )}

              <div className="border border-[#1c1c1f] rounded-xl overflow-hidden bg-[#111113]">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#0c0c0e] border-b border-[#1c1c1f] text-[#71717a] font-bold">
                    <tr>
                      <th className="p-4">Option</th>
                      <th className="p-4">Type</th>
                      <th className="p-4">Description</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1c1c1f] text-[#a1a1aa]">
                    <tr>
                      <td className="p-4 font-mono font-bold text-white">apiKey</td>
                      <td className="p-4 font-mono text-emerald-400">string (required)</td>
                      <td className="p-4">The secret or public API key generated from your Nigris dashboard.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold text-white">baseURL</td>
                      <td className="p-4 font-mono text-blue-400">string</td>
                      <td className="p-4">Override the default production API gateway URL.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold text-white">timeout</td>
                      <td className="p-4 font-mono text-amber-400">number</td>
                      <td className="p-4">Request timeout in milliseconds before failing with a timeout error.</td>
                    </tr>
                    <tr>
                      <td className="p-4 font-mono font-bold text-white">maxRetries</td>
                      <td className="p-4 font-mono text-amber-400">number</td>
                      <td className="p-4">Number of automatic retries on rate-limited (429) or transient network errors.</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* SECTION: CRUD Operations */}
          {activeSection === "sdk-crud" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">SDK Reference</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">CRUD Operations</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Complete reference for Creating, Reading, Updating, and Deleting records across your collections.
                </p>
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Create a Record</h3>
                {codeSnippet(
                  "crud-c",
                  "create.ts",
                  `const item = await client.create("articles", {
  title: "Building Scalable APIs",
  author: "Nishant",
  tags: ["backend", "database", "saas"],
  views: 0
});`,
                  "typescript"
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Get Single Record by ID</h3>
                {codeSnippet(
                  "crud-r",
                  "read.ts",
                  `const article = await client.get("articles", "65f3a9b1...e412");
console.log(article.title);`,
                  "typescript"
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Update a Record</h3>
                {codeSnippet(
                  "crud-u",
                  "update.ts",
                  `// Partial update — merges fields without overwriting the entire document
const updated = await client.update("articles", "65f3a9b1...e412", {
  views: 1045,
  updatedAt: new Date().toISOString()
});`,
                  "typescript"
                )}
              </div>

              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Delete a Record</h3>
                {codeSnippet(
                  "crud-d",
                  "delete.ts",
                  `const response = await client.delete("articles", "65f3a9b1...e412");
console.log("Deleted:", response.success);`,
                  "typescript"
                )}
              </div>
            </div>
          )}

          {/* SECTION: Filtering & Pagination */}
          {activeSection === "sdk-queries" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">SDK Reference</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Filtering & Pagination</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Query multiple records with advanced filtering parameters, sorting, and pagination metadata.
                </p>
              </div>

              {codeSnippet(
                "sdk-q-1",
                "query-advanced.ts",
                `const { data, pagination } = await client.list("products", {
  // Pagination
  page: 2,
  limit: 25,
  
  // Sorting (prefix with '-' for descending order)
  sort: "-price",
  
  // Exact field matching
  category: "electronics",
  inStock: true
});

console.log(\`Showing page \${pagination.page} of \${pagination.totalPages}\`);
console.log(\`Total matching items: \${pagination.total}\`);`,
                "typescript"
              )}

              {callout(
                "note",
                "Pagination Structure",
                "Every .list() query returns a standard object containing both the data array and a pagination metadata object with properties: total, page, limit, and totalPages."
              )}
            </div>
          )}

          {/* SECTION: Error Handling & Retries */}
          {activeSection === "sdk-errors" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">SDK Reference</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Error Handling & Retries</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Robustly catch API errors, inspect HTTP status codes, and handle rate limit backoff.
                </p>
              </div>

              {codeSnippet(
                "sdk-err",
                "error-handling.ts",
                `import { NigrisClient, NigrisError } from '@nishant4806/nigris-sdk';

async function performUpdate() {
  try {
    await client.update("sensitive_data", "12345", { secret: "xyz" });
  } catch (error: any) {
    if (error instanceof NigrisError) {
      console.error(\`API Failure [\${error.status}]: \${error.message}\`);
      
      if (error.status === 401 || error.status === 403) {
        console.error("API Key missing required permissions!");
      } else if (error.status === 429) {
        console.error("Rate limit exceeded. Please retry shortly.");
      }
    } else {
      console.error("Unexpected network failure:", error.message);
    }
  }
}`,
                "typescript"
              )}
            </div>
          )}

          {/* SECTION: API Keys & Permissions */}
          {activeSection === "api-keys" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Platform Features</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">API Keys & Permissions</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Generate secure tokens with granular access control and automatic expiration rules.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 my-6">
                {[
                  { title: "Scoped Permissions", desc: "Select exactly which HTTP methods (Read, Write, Delete) are allowed for each individual key." },
                  { title: "Plan Enforcement", desc: "Link keys to Free or Pro tiers to automatically regulate maximum request limits." },
                  { title: "Automatic Expiration", desc: "Set a TTL (Time-To-Live) on temporary tokens for enhanced security." },
                  { title: "Instant Revocation", desc: "Revoke compromised keys immediately from the dashboard with zero downtime." },
                ].map((k) => (
                  <div key={k.title} className="p-6 rounded-xl bg-[#111113] border border-[#1c1c1f]">
                    <h3 className="font-bold text-white mb-2 text-base">{k.title}</h3>
                    <p className="text-sm text-[#71717a] leading-relaxed">{k.desc}</p>
                  </div>
                ))}
              </div>

              {callout(
                "warning",
                "Protecting Your Keys",
                "Never commit privileged API keys with Write or Delete permissions to public GitHub repositories or embed them in client-side HTML bundles."
              )}
            </div>
          )}

          {/* SECTION: Dynamic Schemas & MongoDB */}
          {activeSection === "schemas" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Platform Features</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Dynamic Schemas & MongoDB</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Nigris uses dynamic MongoDB collection routing, allowing you to define schemas flexibly or provision collections instantly on the fly.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">How Dynamic Provisioning Works</h3>
                <p className="text-[#a1a1aa] leading-relaxed">
                  When you send a POST request to <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-white font-mono">/api/public/anything</code>, Nigris checks if the collection <code className="bg-[#27272a] px-1.5 py-0.5 rounded text-white font-mono">anything</code> exists in your project. If it doesn&apos;t, Nigris creates it automatically, inspects the payload structure, and stores the document securely.
                </p>
              </div>

              {callout(
                "tip",
                "Schema Validation",
                "In your dashboard under Collection Settings, you can switch from 'Dynamic/Loose' schema mode to 'Strict/Enforced' mode, where incoming requests are rigorously validated against required fields and data types."
              )}
            </div>
          )}

          {/* SECTION: Rate Limiting & Quotas */}
          {activeSection === "rate-limits" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Platform Features</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Rate Limiting & Quotas</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Nigris protects your infrastructure using high-performance Redis token bucket rate limiting.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Standard Plan Tiers</h3>
                <div className="grid sm:grid-cols-2 gap-6 my-4">
                  <div className="p-6 rounded-xl border border-blue-500/30 bg-blue-500/5">
                    <h4 className="font-black text-xl text-blue-400 mb-1">Free Tier</h4>
                    <p className="text-sm text-[#71717a] mb-4">Great for development and testing.</p>
                    <ul className="space-y-2 text-sm text-[#d4d4d8]">
                      <li>• 10,000 requests / month</li>
                      <li>• 5 requests / second burst limit</li>
                      <li>• 2 active API keys</li>
                    </ul>
                  </div>
                  <div className="p-6 rounded-xl border border-purple-500/30 bg-purple-500/5">
                    <h4 className="font-black text-xl text-purple-400 mb-1">Pro Tier</h4>
                    <p className="text-sm text-[#71717a] mb-4">Engineered for production scale.</p>
                    <ul className="space-y-2 text-sm text-[#d4d4d8]">
                      <li>• 1,000,000+ requests / month</li>
                      <li>• 100 requests / second burst limit</li>
                      <li>• Unlimited API keys & team members</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION: Webhooks & Events */}
          {activeSection === "webhooks" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Platform Features</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Webhooks & Events</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Subscribe to real-time HTTP callbacks whenever data in your collections is created, updated, or deleted.
                </p>
              </div>

              {codeSnippet(
                "wh-ex",
                "Webhook Payload Example",
                `{
  "event": "record.created",
  "collection": "orders",
  "timestamp": "2026-05-17T16:00:00.000Z",
  "data": {
    "_id": "65f3a9b1...e412",
    "amount": 299.99,
    "currency": "USD"
  }
}`,
                "json"
              )}

              {callout(
                "note",
                "Signature Verification",
                "Every webhook request sent by Nigris includes an X-Nigris-Signature header calculated using HMAC SHA-256 with your Webhook Secret. Always verify this signature in your receiving endpoint."
              )}
            </div>
          )}

          {/* SECTION: SMTP & Transactional Mail */}
          {activeSection === "smtp" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Platform Features</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">SMTP & Transactional Mail</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Configure custom SMTP servers or Resend API keys to send branded transactional emails, notifications, and verification links.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-bold">Configuring Mail in Dashboard</h3>
                <p className="text-[#a1a1aa] leading-relaxed">
                  Navigate to <strong>Project Settings &gt; SMTP</strong>. You can enter standard SMTP credentials (Host, Port, User, Pass) or provide a Resend API token. All credentials are encrypted in the database before storage.
                </p>
              </div>
            </div>
          )}

          {/* SECTION: Hardening & Best Practices */}
          {activeSection === "production" && (
            <div className="animate-in fade-in duration-300 space-y-8">
              <div>
                <p className="text-[13px] font-medium tracking-wide text-[#3b82f6] uppercase mb-2">Production</p>
                <h1 className="text-4xl font-black tracking-tight mb-4">Hardening & Best Practices</h1>
                <p className="text-lg text-[#a1a1aa] leading-relaxed">
                  Checklist to ensure your Nigris deployment is secure, resilient, and highly scalable.
                </p>
              </div>

              <div className="space-y-6">
                {[
                  {
                    title: "1. Enforce Strict Collection Schemas",
                    desc: "Transition from loose dynamic schemas to strict enforcement in the dashboard before releasing your API to public users.",
                  },
                  {
                    title: "2. Set Up Key Expiration & Rotation",
                    desc: "Regularly rotate API keys and enforce short TTLs on tokens distributed to mobile applications or external contractors.",
                  },
                  {
                    title: "3. Enable Redis Rate Limiting",
                    desc: "Verify that your REDIS_URL is correctly configured in your server environment to protect against DDoS and brute force attacks.",
                  },
                  {
                    title: "4. Monitor Webhook Logs",
                    desc: "Check the Webhook Logs section in the dashboard to ensure external services are responding with 200 OK success statuses.",
                  },
                ].map((h) => (
                  <div key={h.title} className="p-6 rounded-xl bg-[#111113] border border-[#1c1c1f]">
                    <h3 className="font-bold text-lg text-white mb-2">{h.title}</h3>
                    <p className="text-sm text-[#71717a] leading-relaxed">{h.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
