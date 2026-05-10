"use client";

import Link from "next/link";
import { Layers, Menu, X } from "lucide-react";
import { useState } from "react";

export default function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25 transition-transform group-hover:scale-110">
            <Layers className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Nigris
          </span>
        </Link>

        <nav className="hidden gap-8 md:flex">
          {["About", "Docs", "Blog", "Contact"].map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="relative text-sm font-medium text-slate-400 transition-colors hover:text-white after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-0 after:bg-blue-500 after:transition-all hover:after:w-full"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-slate-400 transition-colors hover:text-white">
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:shadow-blue-500/40 hover:scale-105"
          >
            Get Started Free
          </Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden text-slate-300">
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-slate-950/95 backdrop-blur-xl px-6 py-4 space-y-3">
          {["About", "Docs", "Blog", "Contact"].map((item) => (
            <Link key={item} href={`/${item.toLowerCase()}`} className="block text-sm text-slate-300 hover:text-white py-1">
              {item}
            </Link>
          ))}
          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            <Link href="/login" className="text-sm text-slate-300 hover:text-white py-1">Log in</Link>
            <Link href="/register" className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2.5 text-sm font-semibold text-white text-center">
              Get Started Free
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
