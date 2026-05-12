import Link from "next/link";
import Logo from "./ui/Logo";

export default function PublicFooter() {
  return (
    <footer className="border-t border-[#1c1c1f] bg-[#09090b] py-14">
      <div className="mx-auto max-w-[1120px] px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo size={24} className="mb-4" />
            <p className="text-[13px] leading-relaxed text-[#52525b]">
              The complete API infrastructure platform.
            </p>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#52525b] mb-3">Product</p>
            <ul className="space-y-2">
              <li><Link href="/docs" className="text-[13px] text-[#71717a] hover:text-white transition-colors">Documentation</Link></li>
              <li><Link href="/login" className="text-[13px] text-[#71717a] hover:text-white transition-colors">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#52525b] mb-3">Company</p>
            <ul className="space-y-2">
              <li><Link href="/about" className="text-[13px] text-[#71717a] hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="text-[13px] text-[#71717a] hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/contact" className="text-[13px] text-[#71717a] hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-[12px] font-medium uppercase tracking-wider text-[#52525b] mb-3">Legal</p>
            <ul className="space-y-2">
              <li><Link href="/privacy" className="text-[13px] text-[#71717a] hover:text-white transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-[13px] text-[#71717a] hover:text-white transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-6 border-t border-[#1c1c1f]">
          <p className="text-[12px] text-[#3f3f46]">&copy; {new Date().getFullYear()} Nigris, Inc.</p>
        </div>
      </div>
    </footer>
  );
}
