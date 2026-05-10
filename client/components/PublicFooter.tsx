import Link from "next/link";
import { Layers } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 border-t border-white/5 py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Layers className="h-4.5 w-4.5 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-white">Nigris</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              The complete SaaS infrastructure for API products. Build, meter, and ship with confidence.
            </p>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Product</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/docs" className="text-sm text-slate-500 hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/login" className="text-sm text-slate-500 hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Company</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about" className="text-sm text-slate-500 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/blog" className="text-sm text-slate-500 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-sm text-slate-500 hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-slate-400">Legal</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/privacy" className="text-sm text-slate-500 hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-sm text-slate-500 hover:text-white transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-14 flex flex-col items-center justify-between border-t border-white/5 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            &copy; {new Date().getFullYear()} Nigris, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
