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
    <div className="flex h-screen bg-[#09090b] text-white overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1c1c1f] bg-[#0c0c0e] flex flex-col">
        <div className="h-14 flex items-center px-6 border-b border-[#1c1c1f]">
          <span className="font-bold tracking-tight text-[#3b82f6]">Nigris Admin</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 text-[14px] text-[#a1a1aa] rounded-md hover:text-white hover:bg-[#1c1c1f] transition-colors"
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-[#1c1c1f] space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 text-[14px] text-[#a1a1aa] rounded-md hover:text-white hover:bg-[#1c1c1f] transition-colors"
          >
            <Home className="h-4 w-4" />
            User Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-[14px] text-red-400 rounded-md hover:text-red-300 hover:bg-red-400/10 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#09090b]">
        <div className="flex-1 overflow-y-auto p-6 lg:p-10">
          <div className="max-w-5xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
