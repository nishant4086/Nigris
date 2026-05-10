"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Link from "next/link";
import { LogOut, Home, Mail, FileText, Activity, ShieldCheck } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await api.get("/users/me");
        if (res.data.role !== "admin") {
          router.replace("/dashboard");
        } else {
          setLoading(false);
        }
      } catch (err) {
        router.replace("/login");
      }
    };
    checkAdmin();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.replace("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="w-8 h-8 border-2 border-[#3b82f6] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const navLinks = [
    { href: "/admin", label: "Overview", icon: ShieldCheck },
    { href: "/admin/messages", label: "Messages", icon: Mail },
    { href: "/admin/blogs", label: "Blogs", icon: FileText },
    { href: "/admin/activity", label: "Activity", icon: Activity },
  ];

  return (
    <div className="liquid-shell flex h-screen overflow-hidden text-slate-900 dark:text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 z-30 m-3 glass-sidebar flex flex-col transition-all duration-300">
        <div className="flex h-20 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/25">
              <span className="text-sm font-black text-white">N</span>
            </div>
            <div>
              <span className="block text-base font-black tracking-tight text-slate-950 dark:text-white">Admin</span>
              <span className="block text-xs font-semibold text-slate-400">Control Panel</span>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 rounded-2xl border border-transparent px-3 py-2.5 text-sm font-semibold transition-all duration-200 text-slate-600 hover:bg-white/45 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors bg-slate-100/60 text-slate-400 dark:bg-white/5">
                <link.icon className="h-4 w-4" />
              </span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-3 mt-auto space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 text-slate-600 hover:bg-white/45 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-100"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors bg-slate-100/60 text-slate-400 dark:bg-white/5">
              <Home className="h-4 w-4" />
            </span>
            User Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-600 dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl transition-colors bg-red-50 dark:bg-red-500/10">
              <LogOut className="h-4 w-4" />
            </span>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 overflow-y-auto px-4 pb-6 pt-2 md:px-6 lg:px-8 mt-4 md:mt-8">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
