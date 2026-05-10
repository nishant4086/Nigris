"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Trash2 } from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  status: string;
  tags: string[];
  createdAt: string;
  author?: { name: string };
}

export default function BlogListPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    api.get("/admin/blogs").then((r) => setBlogs(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const deleteBlog = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    await api.delete(`/admin/blogs/${id}`);
    setBlogs((prev) => prev.filter((b) => b._id !== id));
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading blogs...</div>;

  return (
    <div className="py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Blog Posts</h1>
          <p className="text-sm text-slate-500">Create and manage blog content.</p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
        >
          <Plus className="h-4 w-4" /> New Post
        </Link>
      </div>

      {blogs.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p>No blog posts yet. Create your first one!</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden dark:border-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50 dark:bg-gray-800/50 dark:border-slate-800">
                <th className="text-left px-4 py-3 font-medium text-slate-500">Title</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden sm:table-cell">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-500 hidden md:table-cell">Date</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {blogs.map((b) => (
                <tr key={b._id} className="border-b last:border-0 dark:border-slate-800 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition">
                  <td className="px-4 py-3">
                    <button onClick={() => router.push(`/admin/blogs/${b._id}`)} className="text-left font-medium hover:text-blue-600 transition">
                      {b.title}
                    </button>
                    {b.tags.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {b.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[11px] px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-slate-500">{t}</span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      b.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    }`}>
                      {b.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 hidden md:table-cell">{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => deleteBlog(b._id)} className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800" title="Delete">
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
