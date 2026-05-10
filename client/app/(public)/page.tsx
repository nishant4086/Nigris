import Link from "next/link";
import { ArrowRight, Database, Shield, Zap, Code, CreditCard, BarChart } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_55%,_#ffffff)] py-20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 mb-6">
            The Nigris Platform
          </p>
          <h1 className="mx-auto max-w-4xl text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl">
            Build, meter, and ship APIs <span className="text-blue-600">with confidence.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Nigris is the complete infrastructure for your API products. Manage dynamic schemas, 
            generate API keys, meter usage, and automatically sync with Stripe billing—all from a single dashboard.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/register"
              className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all"
            >
              Start building for free
            </Link>
            <Link href="/docs" className="text-sm font-semibold leading-6 text-slate-900 flex items-center gap-1 group">
              Read the docs <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 sm:py-32 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Everything you need to launch</h2>
            <p className="mt-4 text-lg text-slate-600">
              Stop writing boilerplate code for authentication and billing. Focus on your core product.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  Dynamic Collections
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">Create and modify your database schemas on the fly from the dashboard. Nigris automatically provisions MongoDB collections for you.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  API Key Management
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">Generate secure API keys for your users. Nigris automatically validates every request against your usage limits.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-slate-900">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <BarChart className="h-5 w-5 text-blue-600" />
                  </div>
                  Real-time Metering
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-600">
                  <p className="flex-auto">Track exactly how many requests your users are making. View beautiful charts and prevent abuse with automatic rate limiting.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      {/* Code SDK Section */}
      <section className="bg-slate-900 py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Developer-first SDK</h2>
              <p className="mt-6 text-lg text-slate-300">
                Integrate Nigris into your codebase in minutes using our official JavaScript SDK. 
                Enjoy full TypeScript support, automatic schema validation, and built-in pagination.
              </p>
              <ul className="mt-8 space-y-4 text-slate-300">
                <li className="flex items-center gap-3"><Zap className="h-5 w-5 text-blue-400" /> Connects securely via API key</li>
                <li className="flex items-center gap-3"><Code className="h-5 w-5 text-blue-400" /> Type-safe CRUD operations</li>
                <li className="flex items-center gap-3"><CreditCard className="h-5 w-5 text-blue-400" /> Automatically counts towards billing</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-slate-800/50 p-8 border border-slate-700 shadow-2xl">
              <pre className="text-sm text-slate-300 overflow-x-auto">
                <code className="language-javascript">
{`import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: process.env.NIGRIS_API_KEY,
});

// Insert data dynamically
const record = await client.create('my-collection', {
  name: "Jane Doe",
  role: "Admin"
});

console.log("Success:", record);`}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center rounded-3xl bg-blue-50 px-6 py-16 sm:p-20 border border-blue-100">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Ready to launch your API?
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Join developers who are shipping faster with Nigris. No credit card required to start building.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-full bg-blue-600 px-8 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-colors"
              >
                Create your workspace
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
