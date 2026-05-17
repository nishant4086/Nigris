import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Tag } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
  try {
    const res = await fetch(`${baseURL}/blogs/${slug}`);
    if (res.ok) {
      const post = (await res.json()) as Record<string, unknown>;
      const title = typeof post.title === "string" ? post.title : "Article";
      const excerpt = typeof post.excerpt === "string" ? post.excerpt : "";
      const createdAt = typeof post.createdAt === "string" ? post.createdAt : "";
      const authorName = (post.author as { name?: string })?.name || "Nigris Team";

      return {
        title: `${title} | Nigris Blog`,
        description: excerpt || `Read ${title} on the Nigris Engineering blog.`,
        openGraph: {
          title,
          description: excerpt,
          url: `https://nigris.app/blog/${slug}`,
          type: "article",
          publishedTime: createdAt,
          authors: [authorName],
        },
        alternates: {
          canonical: `https://nigris.app/blog/${slug}`,
        },
      };
    }
  } catch {
    // Fallback to default
  }

  return {
    title: "Article | Nigris Blog",
    description: "Engineering insights from Nigris.",
  };
}

export default async function BlogPostPage({ params }: Props) {
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
  
  let post: Record<string, unknown> | null = null;
  try {
    const res = await fetch(`${baseURL}/blogs/${slug}`, { next: { revalidate: 60 } });
    if (res.ok) {
      post = (await res.json()) as Record<string, unknown>;
    }
  } catch {
    post = null;
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[#09090b] text-white pt-36 pb-24 text-center px-6">
        <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
        <p className="text-[#71717a] mb-8">The article you are looking for does not exist or has been removed.</p>
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-[#3b82f6]">
          <ArrowLeft className="w-4 h-4" /> Back to blog
        </Link>
      </div>
    );
  }

  const title = typeof post.title === "string" ? post.title : "Article";
  const excerpt = typeof post.excerpt === "string" ? post.excerpt : "";
  const content = typeof post.content === "string" ? post.content : excerpt;
  const createdAt = typeof post.createdAt === "string" ? post.createdAt : "2026-05-17T00:00:00.000Z";
  const updatedAt = typeof post.updatedAt === "string" ? post.updatedAt : createdAt;
  const authorName = (post.author as { name?: string })?.name || "Nigris Team";
  const tags = Array.isArray(post.tags) ? (post.tags as string[]) : [];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: title,
    description: excerpt,
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "Nigris",
      logo: {
        "@type": "ImageObject",
        url: "https://nigris.app/icon.png",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        suppressHydrationWarning
      />
      <article className="min-h-screen bg-[#09090b] text-white pt-32 pb-32">
        <div className="mx-auto max-w-[760px] px-6">
          <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium text-[#71717a] hover:text-white mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to all posts
          </Link>

          <header className="mb-12 border-b border-[#1c1c1f] pb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.15] mb-6">
              {title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-[#71717a]">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-[#3b82f6]" />
                <span>{authorName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <time>{new Date(createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
              </div>
              {tags.length > 0 && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-500" />
                  <span>{tags.join(", ")}</span>
                </div>
              )}
            </div>
          </header>

          <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-lg space-y-6">
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </article>
    </>
  );
}
