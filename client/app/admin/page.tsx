"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Mail, FileText, Activity, ArrowRight } from "lucide-react";

export default function AdminPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/stats").then((r) => setStats(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-slate-500">Loading...</div>;
  if (!stats) return <div className="py-12 text-center text-red-500">Failed to load admin stats. Make sure your account has admin role.</div>;

  const cards = [
    { title: "Messages", value: stats.messageCount, sub: `${stats.unreadCount} unread`, icon: Mail, href: "/admin/messages", color: "text-blue-500" },
    { title: "Blog Posts", value: stats.blogCount, sub: `${stats.publishedCount} published`, icon: FileText, href: "/admin/blogs", color: "text-emerald-500" },
    { title: "Activity Log", value: stats.activityCount, sub: "total events", icon: Activity, href: "/admin/activity", color: "text-amber-500" },
  ];

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-slate-100 tracking-tight">Admin Overview</h1>
      <p className="text-sm text-slate-500 mb-10">Manage messages, blogs, and view platform activity.</p>

      <div className="grid gap-6 sm:grid-cols-3 mb-8">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="group glass-card p-6 flex flex-col justify-between hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
              <ArrowRight className="h-5 w-5 text-slate-400 transition-transform group-hover:translate-x-1" />
            </div>
            <div>
              <p className="text-4xl font-black text-slate-900 dark:text-white mb-1">{c.value}</p>
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">{c.title}</p>
                <p className="text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-md">{c.sub}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
