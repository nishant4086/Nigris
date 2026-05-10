import Link from "next/link";

export const metadata = {
  title: "Blog | Nigris",
  description: "Product updates, engineering deep dives, and API best practices.",
};

const posts = [
  {
    id: 1,
    title: "Introducing Nigris: The Complete SaaS Dashboard for APIs",
    href: "#",
    description:
      "Today we are thrilled to announce the general availability of Nigris. We built Nigris to solve the painful boilerplate required to launch, meter, and monetize API products.",
    date: "Mar 16, 2026",
    datetime: "2026-03-16",
    category: { title: "Product", href: "#" },
  },
  {
    id: 2,
    title: "How we built the dynamic Next.js + MongoDB architecture",
    href: "#",
    description:
      "A deep dive into how Nigris dynamically provisions Mongoose collections on-the-fly to support flexible, user-defined schema routing.",
    date: "Apr 04, 2026",
    datetime: "2026-04-04",
    category: { title: "Engineering", href: "#" },
  },
  {
    id: 3,
    title: "Rate Limiting with Redis: Best Practices",
    href: "#",
    description:
      "Learn how to properly implement distributed rate limiting for your API endpoints to protect your infrastructure and enforce usage tiers.",
    date: "May 01, 2026",
    datetime: "2026-05-01",
    category: { title: "Tutorial", href: "#" },
  },
];

export default function BlogPage() {
  return (
    <div className="bg-slate-50 py-24 sm:py-32 h-full min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">From the blog</h2>
          <p className="mt-2 text-lg leading-8 text-slate-600">
            Product updates, engineering deep dives, and API best practices.
          </p>
        </div>
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 border-t border-slate-200 pt-10 sm:mt-16 sm:pt-16 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="flex max-w-xl flex-col items-start justify-between">
              <div className="flex items-center gap-x-4 text-xs">
                <time dateTime={post.datetime} className="text-slate-500">
                  {post.date}
                </time>
                <Link
                  href={post.category.href}
                  className="relative z-10 rounded-full bg-slate-100 px-3 py-1.5 font-medium text-slate-600 hover:bg-slate-200"
                >
                  {post.category.title}
                </Link>
              </div>
              <div className="group relative">
                <h3 className="mt-3 text-lg font-semibold leading-6 text-slate-900 group-hover:text-slate-600">
                  <Link href={post.href}>
                    <span className="absolute inset-0" />
                    {post.title}
                  </Link>
                </h3>
                <p className="mt-5 line-clamp-3 text-sm leading-6 text-slate-600">{post.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
