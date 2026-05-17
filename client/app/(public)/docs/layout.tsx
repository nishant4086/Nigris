import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Documentation — Nigris Platform",
  description: "Explore comprehensive guides, SDK references, and tutorials for integrating Nigris BaaS into your React, Next.js, and Node.js applications.",
  openGraph: {
    title: "Documentation — Nigris Platform",
    description: "Explore comprehensive guides, SDK references, and tutorials for integrating Nigris BaaS into your React, Next.js, and Node.js applications.",
    url: "https://nigris.app/docs",
  },
  alternates: {
    canonical: "https://nigris.app/docs",
  },
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is Nigris?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nigris is a modern backend platform that helps developers quickly build APIs, authentication systems, dynamic databases, SDKs, and scalable applications without creating everything from scratch."
        }
      },
      {
        "@type": "Question",
        name: "Does Nigris support API keys?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Nigris includes an API key system that allows developers to generate secure API keys, control API access, track usage, apply rate limits, and create Free and Pro plans."
        }
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        suppressHydrationWarning
      />
      {children}
    </>
  );
}
