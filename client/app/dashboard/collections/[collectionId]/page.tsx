"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";

type Field = { name: string; type: string; required: boolean };

export default function CollectionDataPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;

  const [collectionName, setCollectionName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [data, setData] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Entry Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch collection metadata
  useEffect(() => {
    if (!collectionId) return;
    api.get(`/collections/detail/${collectionId}`)
      .then((res) => {
        setCollectionName(res.data.name);
        setFields(res.data.fields || []);
      })
      .catch(() => setError("Failed to load collection info"));
  }, [collectionId]);

  const loadData = () => {
    setLoading(true);
    setError("");
    api.get(`/data/${collectionId}?page=${page}&limit=${limit}`)
      .then((res) => {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch((err) => {
        const msg = err?.response?.data?.error || "Failed to load data";
        setError(msg);
        setData([]);
      })
      .finally(() => setLoading(false));
  };

  // Fetch data with pagination
  useEffect(() => {
    if (!collectionId) return;
    loadData();
  }, [collectionId, page, limit]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingField(fieldName);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFormData((prev) => ({ ...prev, [fieldName]: res.data.url }));
    } catch (err: any) {
      alert(err.response?.data?.error || "Upload failed");
    } finally {
      setUploadingField(null);
    }
  };

  const handleAddEntry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/data/${collectionId}`, formData);
      setIsModalOpen(false);
      setFormData({});
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to add entry");
    } finally {
      setSubmitting(false);
    }
  };

  const renderFieldValue = (row: any, f: Field) => {
    const val = row[f.name];
    if (val == null || val === "") return "—";

    if (f.type === "boolean") return val ? "✅" : "❌";
    
    if (f.type === "image") {
      return (
        <a href={val} target="_blank" rel="noopener noreferrer">
          <img src={val} alt="preview" className="h-10 w-10 object-cover rounded shadow-sm border border-slate-200" />
        </a>
      );
    }

    if (f.type === "video") {
      return (
        <a href={val} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline flex items-center gap-1">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          Video
        </a>
      );
    }

    return String(val);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard/collections")}
            className="text-sm text-gray-500 hover:text-black transition"
          >
            ← Collections
          </button>
          <h1 className="text-2xl font-bold">
            {collectionName || "Collection Data"}
          </h1>
          <span className="text-sm text-gray-400">
            {total} {total === 1 ? "entry" : "entries"}
          </span>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition"
        >
          Add Entry
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="animate-pulse space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-gray-200 h-10 rounded" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl shadow border border-dashed border-slate-300 p-12 text-center text-sm text-gray-400">
          No data in this collection yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left px-4 py-3 font-medium text-gray-500">#</th>
                  {fields.map((f) => (
                    <th key={f.name} className="text-left px-4 py-3 font-medium text-gray-500 capitalize">
                      {f.name}
                    </th>
                  ))}
                  <th className="text-left px-4 py-3 font-medium text-gray-500">Created</th>
                </tr>
              </thead>
              <tbody>
                {data.map((row, idx) => (
                  <tr key={row._id || idx} className="border-b last:border-0 hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 text-gray-400">{(page - 1) * limit + idx + 1}</td>
                    {fields.map((f) => (
                      <td key={f.name} className="px-4 py-3">
                        {renderFieldValue(row, f)}
                      </td>
                    ))}
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {row.createdAt
                        ? new Date(row.createdAt).toLocaleString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t bg-slate-50">
              <span className="text-sm text-gray-500">
                Page {page} of {pages} · {total} total
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pages, p + 1))}
                  disabled={page >= pages}
                  className="px-3 py-1 rounded border text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-white transition"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Entry Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Add Entry</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddEntry} className="space-y-4">
              {fields.map((field) => (
                <div key={field.name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
                    {field.name} {field.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {field.type === "text" && (
                    <input
                      type="text"
                      required={field.required}
                      className="w-full border rounded px-3 py-2"
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    />
                  )}

                  {field.type === "number" && (
                    <input
                      type="number"
                      required={field.required}
                      className="w-full border rounded px-3 py-2"
                      value={formData[field.name] || ""}
                      onChange={(e) => setFormData({ ...formData, [field.name]: Number(e.target.value) })}
                    />
                  )}

                  {field.type === "boolean" && (
                    <input
                      type="checkbox"
                      checked={formData[field.name] || false}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                    />
                  )}

                  {(field.type === "image" || field.type === "video") && (
                    <div className="space-y-2">
                      <input
                        type="file"
                        accept={field.type === "image" ? "image/*" : "video/*"}
                        required={field.required && !formData[field.name]}
                        onChange={(e) => handleFileUpload(e, field.name)}
                        disabled={uploadingField === field.name}
                        className="w-full border rounded px-3 py-2 text-sm file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                      />
                      {uploadingField === field.name && (
                        <p className="text-xs text-indigo-600 animate-pulse">Uploading {field.type}...</p>
                      )}
                      {formData[field.name] && !uploadingField && (
                        <div className="flex items-center gap-2 mt-2 p-2 bg-slate-50 rounded border">
                          {field.type === "image" ? (
                            <img src={formData[field.name]} alt="preview" className="h-10 w-10 object-cover rounded" />
                          ) : (
                            <div className="h-10 w-10 bg-slate-200 rounded flex items-center justify-center">▶️</div>
                          )}
                          <a href={formData[field.name]} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:underline truncate">
                            View file
                          </a>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, [field.name]: null })}
                            className="ml-auto text-xs text-red-500 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border rounded text-sm hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || uploadingField !== null}
                  className="px-4 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
