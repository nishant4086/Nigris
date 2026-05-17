import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login to Nigris — Secure Dashboard Access",
  description: "Sign in to your Nigris dashboard using secure passkey WebAuthn, OAuth, or email credentials. Manage your API keys, MongoDB schemas, and usage analytics.",
  openGraph: {
    title: "Login to Nigris — Secure Dashboard Access",
    description: "Sign in to your Nigris dashboard using secure passkey WebAuthn, OAuth, or email credentials. Manage your API keys, MongoDB schemas, and usage analytics.",
    url: "https://nigris.app/login",
  },
  alternates: {
    canonical: "https://nigris.app/login",
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
