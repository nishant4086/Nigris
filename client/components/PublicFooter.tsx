import Link from "next/link";
import { Layers } from "lucide-react";

export default function PublicFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="flex flex-col gap-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                Nigris
              </span>
            </Link>
            <p className="text-sm text-slate-500">
              The complete SaaS dashboard for API products. Build, meter, and ship with confidence.
            </p>
          </div>
          <div className="md:col-span-1">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Product</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/docs" className="text-sm text-slate-600 hover:text-slate-900">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Company</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/about" className="text-sm text-slate-600 hover:text-slate-900">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-sm text-slate-600 hover:text-slate-900">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-slate-600 hover:text-slate-900">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div className="md:col-span-1">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">Legal</h3>
            <ul className="flex flex-col gap-3">
              <li>
                <Link href="/privacy" className="text-sm text-slate-600 hover:text-slate-900">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-slate-600 hover:text-slate-900">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200 pt-8 sm:flex-row">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} Nigris, Inc. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
