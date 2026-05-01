"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const path = usePathname();

  const linkClass = (href: string) =>
    `block px-3 py-2 rounded-lg transition ${
      path === href ? "bg-white text-black" : "hover:bg-white/10"
    }`;

  return (
    <div className="w-64 h-screen bg-black text-white p-6">
      <h1 className="text-xl font-bold mb-8">Nigris</h1>

      <nav className="space-y-2">
        <Link href="/dashboard" className={linkClass("/dashboard")}>
          Dashboard
        </Link>
        <Link href="/dashboard/projects" className={linkClass("/dashboard/projects")}> 
          Projects
        </Link>
        <Link href="/dashboard/collections" className={linkClass("/dashboard/collections")}> 
          Collections
        </Link>
        <Link href="/dashboard/api-keys" className={linkClass("/dashboard/api-keys")}>
          API Keys
        </Link>
        <Link href="/dashboard/usage" className={linkClass("/dashboard/usage")}>
          Usage
        </Link>
        <Link href="/dashboard/plans" className={linkClass("/dashboard/plans")}>
          Plans
        </Link>
        <Link href="/dashboard/billing" className={linkClass("/dashboard/billing")}>
          Billing
        </Link>
      </nav>
    </div>
  );
}