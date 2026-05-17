import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Sales — Nigris Enterprise & Custom Integrations",
  description: "Get in touch with the Nigris team for enterprise pricing, custom database quotas, dedicated support tiers, or technical questions.",
  openGraph: {
    title: "Contact Sales — Nigris Enterprise & Custom Integrations",
    description: "Get in touch with the Nigris team for enterprise pricing, custom database quotas, dedicated support tiers, or technical questions.",
    url: "https://nigris.app/contact",
  },
  alternates: {
    canonical: "https://nigris.app/contact",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Nigris Sales",
    url: "https://nigris.app/contact",
    description: "Get in touch with the Nigris team for enterprise pricing, custom database quotas, dedicated support tiers, or technical questions.",
    mainEntity: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: "support@nigris.app",
      url: "https://nigris.app/contact"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactSchema) }}
        suppressHydrationWarning
      />
      {children}
    </>
  );
}
