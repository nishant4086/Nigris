export const metadata = {
  title: "Documentation | Nigris",
  description: "Learn how to integrate Nigris into your application.",
};

export default function DocsPage() {
  return (
    <div className="bg-slate-50 py-24 sm:py-32 h-full min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Documentation
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          Everything you need to know to integrate your API with Nigris.
        </p>

        <div className="mt-16 space-y-16">
          <section>
            <h2 className="text-2xl font-bold text-slate-900">1. Quick Start</h2>
            <p className="mt-4 text-slate-600">
              Install the official Nigris Node.js SDK via npm. The SDK provides full TypeScript 
              support and handles authentication, pagination, and dynamic schema validation out of the box.
            </p>
            <div className="mt-4 rounded-md bg-slate-900 p-4">
              <code className="text-sm text-green-400">npm install @nishant4806/nigris-sdk</code>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">2. Initializing the Client</h2>
            <p className="mt-4 text-slate-600">
              To authenticate, you need an API Key. You can generate one from your Nigris Dashboard 
              under the "API Keys" section. Pass this key when initializing the client.
            </p>
            <div className="mt-4 rounded-md bg-slate-900 p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300">
                <code className="language-javascript">
{`import { NigrisClient } from '@nishant4806/nigris-sdk';

const client = new NigrisClient({
  apiKey: 'YOUR_API_KEY_HERE',
  baseURL: 'https://nigris-1.onrender.com/api/public'
});`}
                </code>
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">3. Creating Entries</h2>
            <p className="mt-4 text-slate-600">
              Once initialized, you can insert data into your collections. The SDK automatically validates 
              your data against the dynamic schema defined in your dashboard.
            </p>
            <div className="mt-4 rounded-md bg-slate-900 p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300">
                <code className="language-javascript">
{`// collectionId can be either the MongoDB _id or the URL-friendly slug
const collectionId = 'my-custom-collection-slug';

const response = await client.create(collectionId, {
  name: "Alice",
  email: "alice@example.com",
  age: 28
});

console.log(response); // { _id: "...", name: "Alice", ... }`}
                </code>
              </pre>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-slate-900">4. Fetching Data</h2>
            <p className="mt-4 text-slate-600">
              Fetch records with built-in pagination, sorting, and filtering capabilities.
            </p>
            <div className="mt-4 rounded-md bg-slate-900 p-4 overflow-x-auto">
              <pre className="text-sm text-slate-300">
                <code className="language-javascript">
{`const { data, pagination } = await client.list(collectionId, {
  page: 1,
  limit: 10,
  // You can filter by any field defined in your schema
  age: 28 
});

console.log(\`Found \${pagination.total} records\`);`}
                </code>
              </pre>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
