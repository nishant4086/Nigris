import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  metadataBase: new URL("https://nigris.app"),
  verification: {
    google: "EgU21Lmr30Jj9HVTCgpqH73cYR9hwSVb8TdeFpIW1Jk",
  },
  title: {
    default: "Nigris — Ship APIs, Databases & Authentication Instantly",
    template: "%s | Nigris",
  },
  description:
    "Nigris is the complete backend platform for API products. Build dynamic MongoDB schemas, manage scoped API keys, meter request usage, and monetize with Stripe in one dashboard.",
  keywords: [
    "Backend as a Service",
    "BaaS",
    "API Key Management",
    "Dynamic Schemas",
    "Usage Metering",
    "Next.js Backend",
    "SaaS Infrastructure",
    "MongoDB Provisioning",
    "Developer Tools",
    "API Gateway",
    "Stripe Billing Sync",
  ],
  authors: [{ name: "Nigris Team", url: "https://nigris.app" }],
  creator: "Nigris Platform",
  publisher: "Nigris Inc.",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://nigris.app",
    siteName: "Nigris",
    title: "Nigris — Ship APIs, Databases & Authentication Instantly",
    description:
      "Nigris is the complete backend platform for API products. Build dynamic MongoDB schemas, manage scoped API keys, meter request usage, and monetize with Stripe in one dashboard.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Nigris — Ship APIs, Databases & Authentication Instantly",
    description:
      "Nigris is the complete backend platform for API products. Build dynamic MongoDB schemas, manage scoped API keys, meter request usage, and monetize with Stripe in one dashboard.",
    creator: "@nigrisapp",
  },
  alternates: {
    canonical: "https://nigris.app",
    languages: {
      "en-US": "https://nigris.app",
    },
  },
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png" },
    ],
    apple: [
      { url: "/logo.png", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Inline CSS to apply theme before React hydration (prevents flash)
  const themeInitCss = `
    html {
      color-scheme: light;
    }
    html.dark {
      color-scheme: dark;
    }
  `;

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Nigris",
    url: "https://nigris.app",
    logo: "https://nigris.app/logo.png",
    sameAs: [
      "https://twitter.com/nigrisapp",
      "https://github.com/nishant4086/Nigris",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Nigris",
    url: "https://nigris.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://nigris.app/docs?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        <style dangerouslySetInnerHTML={{ __html: themeInitCss }} suppressHydrationWarning />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
          suppressHydrationWarning
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
          suppressHydrationWarning
        />
      </head>
      <body className="min-h-full flex flex-col text-slate-900 dark:text-slate-100" suppressHydrationWarning>
        <ThemeInitializer />
        <ThemeProvider>
          <Providers>
            {children}
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
