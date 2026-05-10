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

  if (loading) return <div className="py-12 text-center text-gray-500">Loading...</div>;
  if (!stats) return <div className="py-12 text-center text-red-500">Failed to load admin stats. Make sure your account has admin role.</div>;

  const cards = [
    { title: "Messages", value: stats.messageCount, sub: `${stats.unreadCount} unread`, icon: Mail, href: "/dashboard/admin/messages", color: "text-blue-500" },
    { title: "Blog Posts", value: stats.blogCount, sub: `${stats.publishedCount} published`, icon: FileText, href: "/dashboard/admin/blogs", color: "text-emerald-500" },
    { title: "Activity Log", value: stats.activityCount, sub: "total events", icon: Activity, href: "/dashboard/admin/activity", color: "text-amber-500" },
  ];

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-1">Admin Panel</h1>
      <p className="text-sm text-gray-500 mb-8">Manage messages, blogs, and view platform activity.</p>

      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="group rounded-xl border p-5 transition hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600">
            <div className="flex items-center justify-between mb-3">
              <c.icon className={`h-5 w-5 ${c.color}`} />
              <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-0.5" />
            </div>
            <p className="text-2xl font-bold">{c.value}</p>
            <p className="text-sm text-gray-500">{c.sub}</p>
            <p className="text-xs text-gray-400 mt-1">{c.title}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
