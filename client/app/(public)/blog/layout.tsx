import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Nigris Platform Updates & API Engineering",
  description: "Read product announcements, backend engineering insights, and API architecture best practices from the Nigris team.",
  openGraph: {
    title: "Blog — Nigris Platform Updates & API Engineering",
    description: "Read product announcements, backend engineering insights, and API architecture best practices from the Nigris team.",
    url: "https://nigris.app/blog",
  },
  alternates: {
    canonical: "https://nigris.app/blog",
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Nigris Engineering Blog",
    url: "https://nigris.app/blog",
    description: "Read product announcements, backend engineering insights, and API architecture best practices from the Nigris team.",
    publisher: {
      "@type": "Organization",
      name: "Nigris",
      logo: {
        "@type": "ImageObject",
        url: "https://nigris.app/icon.png"
      }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
        suppressHydrationWarning
      />
      {children}
    </>
  );
}
