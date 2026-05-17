import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us — Nigris Platform Mission & Engineering Vision",
  description: "Learn about the mission, engineering vision, and operating principles driving Nigris to build the invisible infrastructure layer for API products.",
  openGraph: {
    title: "About Us — Nigris Platform Mission & Engineering Vision",
    description: "Learn about the mission, engineering vision, and operating principles driving Nigris to build the invisible infrastructure layer for API products.",
    url: "https://nigris.app/about",
  },
  alternates: {
    canonical: "https://nigris.app/about",
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Nigris",
    url: "https://nigris.app/about",
    description: "Learn about the mission, engineering vision, and operating principles driving Nigris to build the invisible infrastructure layer for API products.",
    mainEntity: {
      "@type": "Organization",
      name: "Nigris",
      foundingDate: "2024",
      url: "https://nigris.app",
      logo: "https://nigris.app/icon.png"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
        suppressHydrationWarning
      />
      {children}
    </>
  );
}
