import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Free Account — Nigris BaaS Platform",
  description: "Start building dynamic APIs, databases, and authentication systems instantly with Nigris. Free tier includes 10,000 monthly requests with zero boilerplate.",
  openGraph: {
    title: "Create Free Account — Nigris BaaS Platform",
    description: "Start building dynamic APIs, databases, and authentication systems instantly with Nigris. Free tier includes 10,000 monthly requests with zero boilerplate.",
    url: "https://nigris.app/register",
  },
  alternates: {
    canonical: "https://nigris.app/register",
  },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
