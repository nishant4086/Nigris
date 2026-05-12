"use client";

import Link from "next/link";
import Logo from "./ui/Logo";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
  { label: "About", href: "/about" },
  { label: "Docs", href: "/docs" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

export default function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1c1c1f] bg-[#09090b]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-6">
        <Logo size={32} />

        <nav className="hidden md:flex items-center gap-6">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="text-[13px] text-[#a1a1aa] transition-colors hover:text-white">
              {n.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/login" className="text-[13px] text-[#a1a1aa] transition-colors hover:text-white">
            Log in
          </Link>
          <Link
            href="/register"
            className="inline-flex h-8 items-center rounded-md bg-white px-3.5 text-[13px] font-medium text-[#09090b] transition hover:bg-[#e4e4e7]"
          >
            Get Started
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden text-[#a1a1aa]">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-[#1c1c1f] bg-[#09090b] px-6 py-4 space-y-3">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)} className="block text-[14px] text-[#a1a1aa] hover:text-white py-1">
              {n.label}
            </Link>
          ))}
          <div className="pt-3 border-t border-[#1c1c1f] flex flex-col gap-2">
            <Link href="/login" className="text-[14px] text-[#a1a1aa] hover:text-white py-1">Log in</Link>
            <Link href="/register" className="mt-1 inline-flex h-9 items-center justify-center rounded-md bg-white text-[13px] font-medium text-[#09090b]">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
