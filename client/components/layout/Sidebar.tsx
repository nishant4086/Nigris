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
  Mail,
  Server,
  History
} from "lucide-react";

import Logo from "../ui/Logo";

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const path = usePathname();

  const categories = [
    {
      title: "Core Platform",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "Workspaces", href: "/dashboard/projects", icon: FolderGit2 },
        { name: "Collections", href: "/dashboard/collections", icon: Database },
        { name: "API Keys", href: "/dashboard/api-keys", icon: Key },
      ]
    },
    {
      title: "Mail Platform",
      items: [
        { name: "Mail Templates", href: "/dashboard/templates", icon: Mail },
        { name: "SMTP Settings", href: "/dashboard/smtp", icon: Server },
        { name: "Outbox Logs", href: "/dashboard/mail-logs", icon: History },
      ]
    },
    {
      title: "Billing & Operations",
      items: [
        { name: "Usage Analytics", href: "/dashboard/usage", icon: Activity },
        { name: "Plans & Limits", href: "/dashboard/plans", icon: CreditCard },
        { name: "Billing Info", href: "/dashboard/billing", icon: CreditCard },
      ]
    }
  ];

  return (
    <div className={`
      fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800/50 dark:bg-slate-950/40
      transform transition-transform duration-300 ease-in-out flex flex-col h-screen shrink-0
      ${isOpen ? "translate-x-0" : "-translate-x-full"}
      md:relative md:translate-x-0
    `}>
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-slate-800/50 shrink-0">
        <Logo size={28} withText={true} />
        <button 
          className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-650 dark:hover:bg-slate-800 dark:hover:text-slate-200 md:hidden"
          onClick={() => setIsOpen(false)}
          type="button"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-6" aria-label="Primary">
        {categories.map((category) => (
          <div key={category.title} className="space-y-1.5">
            <p className="px-3 pb-1 text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">
              {category.title}
            </p>
            <div className="space-y-0.5">
              {category.items.map((item) => {
                const isActive = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
                const Icon = item.icon;
                
                return (
                  <Link 
                    key={`${item.name}-${item.href}`}
                    href={item.href} 
                    className={`
                      flex items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-sm font-semibold transition-all duration-200
                      ${isActive 
                        ? "nav-item-active shadow-xs" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/40 dark:hover:text-slate-100"
                      }
                    `}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                      isActive
                        ? "bg-white/70 text-[var(--primary)] dark:bg-white/10 dark:text-[var(--primary)]"
                        : "bg-slate-100/60 text-slate-500 dark:bg-slate-800/55 dark:text-slate-400"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Settings */}
      <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/50 shrink-0">
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-100 transition-all duration-200"
          onClick={() => setIsOpen(false)}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100/60 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
            <Settings className="w-4 h-4" />
          </span>
          Settings
        </Link>
      </div>
    </div>
  );
}
