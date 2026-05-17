import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeInitializer } from "@/components/ThemeInitializer";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Nigris",
  description: "SaaS dashboard for API products",
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

  return (
    <html
      lang="en"
      className={cn("h-full antialiased", "font-sans", geist.variable)}
      suppressHydrationWarning
    >
      <head suppressHydrationWarning>
        {/* Critical CSS for theme initialization before React hydration */}
        <style dangerouslySetInnerHTML={{ __html: themeInitCss }} suppressHydrationWarning />
        {/* Theme class will be set by ThemeProvider during hydration */}
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
