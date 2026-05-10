import Link from "next/link";
import { Layers } from "lucide-react";

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
            <Layers className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Nigris
          </span>
        </Link>
        <nav className="hidden gap-8 md:flex">
          <Link
            href="/about"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            About
          </Link>
          <Link
            href="/docs"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Docs
          </Link>
          <Link
            href="/blog"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Blog
          </Link>
          <Link
            href="/contact"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Contact
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-800"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}
