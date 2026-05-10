"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: "",
    status: "draft" as "draft" | "published",
  });

  useEffect(() => {
    api.get(`/admin/blogs/${id}`)
      .then((r) => {
        const b = r.data;
        setForm({
          title: b.title,
          content: b.content || "",
          excerpt: b.excerpt || "",
          tags: (b.tags || []).join(", "),
          status: b.status,
        });
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.put(`/admin/blogs/${id}`, {
        ...form,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      });
      router.push("/admin/blogs");
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading...</div>;

  return (
    <div className="py-6 max-w-3xl">
      <Link href="/admin/blogs" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to posts
      </Link>
      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      {error && <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 text-sm p-3">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full rounded-lg border px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-gray-800"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Content (Markdown)</label>
          <textarea
            value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            rows={16}
            className="w-full rounded-lg border px-3.5 py-2.5 text-sm font-mono dark:border-slate-800 dark:bg-gray-800 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Excerpt</label>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            rows={2}
            className="w-full rounded-lg border px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-gray-800 resize-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Tags (comma separated)</label>
          <input
            value={form.tags}
            onChange={(e) => setForm({ ...form, tags: e.target.value })}
            className="w-full rounded-lg border px-3.5 py-2.5 text-sm dark:border-slate-800 dark:bg-gray-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Status</label>
          <div className="flex gap-3">
            {(["draft", "published"] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setForm({ ...form, status: s })}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition ${
                  form.status === s
                    ? s === "published"
                      ? "bg-emerald-600 text-white border-emerald-600"
                      : "bg-amber-600 text-white border-amber-600"
                    : "dark:border-slate-800 text-slate-500 hover:border-gray-400"
                }`}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
