import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password — Nigris Platform",
  description: "Recover your Nigris account access by requesting a secure password reset link sent to your registered email address.",
  robots: { index: false, follow: true },
};

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
