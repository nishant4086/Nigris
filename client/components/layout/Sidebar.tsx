"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FolderGit2, 
  Database, 
  Key, 
  Activity, 
  CreditCard,
  Settings,
  X,
  Mail
} from "lucide-react";

import Logo from "../ui/Logo";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const path = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Projects", href: "/dashboard/projects", icon: FolderGit2 },
    { name: "Collections", href: "/dashboard/collections", icon: Database },
    { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
    { name: "Usage", href: "/dashboard/usage", icon: Activity },
    { name: "Plans", href: "/dashboard/plans", icon: CreditCard },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Mail Templates", href: "/dashboard/templates", icon: Mail },
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-30 m-3 w-64 glass-sidebar rounded-3xl
      transform transition-transform duration-300 ease-in-out flex flex-col
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      md:relative md:translate-x-0
    `}>
      {/* Header */}
      <div className="flex h-20 items-center justify-between px-5">
        <Logo size={40} withText={false} />
        <button 
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/50 hover:text-slate-600 dark:hover:bg-white/10 dark:hover:text-slate-200 md:hidden"
          onClick={() => setIsOpen(false)}
          type="button"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1" aria-label="Primary">
        {navItems.map((item) => {
          const isActive = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
          const Icon = item.icon;
          
          return (
            <Link 
              key={`${item.name}-${item.href}`}
              href={item.href} 
              className={`
                flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm font-semibold transition-all duration-200
                ${isActive 
                  ? "nav-item-active shadow-sm" 
                  : "text-slate-600 hover:bg-white/45 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
                }
              `}
              onClick={() => setIsOpen(false)}
            >
              <span className={`flex h-8 w-8 items-center justify-center rounded-xl transition-colors ${
                isActive
                  ? "bg-white/70 text-[var(--primary)] dark:bg-white/10 dark:text-[var(--primary)]"
                  : "bg-slate-100/60 text-slate-400 dark:bg-white/5"
              }`}>
                <Icon className="h-4 w-4" />
              </span>
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer Settings */}
      <div className="p-3 mt-auto">
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-all duration-200 hover:bg-white/45 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-100/60 text-slate-400 dark:bg-white/5">
            <Settings className="w-4 h-4" />
          </span>
          Settings
        </Link>
      </div>
    </div>
  );
}
