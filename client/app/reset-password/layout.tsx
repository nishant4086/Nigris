import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password — Nigris Platform",
  description: "Set a new secure password for your Nigris account.",
  robots: { index: false, follow: false },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
