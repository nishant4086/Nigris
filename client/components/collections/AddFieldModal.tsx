import { useState, useEffect } from "react";
import { X, Plus, Settings2, Loader2, Database } from "lucide-react";
import { api } from "@/lib/api";

type Collection = { _id: string; name: string };

type AddFieldModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (field: any) => Promise<void>;
  projectId?: string; // Optional, to fetch other collections for References
};

export default function AddFieldModal({ isOpen, onClose, onAdd, projectId }: AddFieldModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState("text");
  const [required, setRequired] = useState(false);
  const [unique, setUnique] = useState(false);
  const [ref, setRef] = useState("");
  
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && projectId && type === "reference" && collections.length === 0) {
      setLoadingCollections(true);
      api.get(`/collections/${projectId}`)
        .then(res => setCollections(Array.isArray(res.data) ? res.data : []))
        .catch(err => console.error("Failed to load collections for references", err))
        .finally(() => setLoadingCollections(false));
    }
  }, [isOpen, projectId, type, collections.length]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Field name is required");
      return;
    }
    if (type === "reference" && !ref) {
      setError("Please select a reference collection");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await onAdd({
        name: name.trim(),
        type,
        required,
        unique: ["text", "number"].includes(type) ? unique : undefined,
        ref: type === "reference" ? ref : undefined
      });
      // Reset form
      setName("");
      setType("text");
      setRequired(false);
      setUnique(false);
      setRef("");
    } catch (err: any) {
      setError(err.message || "Failed to add field");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Add Field</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Update collection schema</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={saving}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#252525] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
             <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
               {error}
             </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Field Name <span className="text-red-500">*</span></label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. title, price, isPublished"
                className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-slate-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Field Type</label>
              <select
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setUnique(false);
                  setRef("");
                }}
                className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-slate-200 appearance-none"
              >
                <option value="text">Text (String)</option>
                <option value="number">Number</option>
                <option value="boolean">Boolean (True/False)</option>
                <option value="image">Image URL</option>
                <option value="video">Video URL</option>
                <option value="file">File (Generic URL)</option>
                <option value="reference">Reference (Foreign Key)</option>
              </select>
            </div>

            {type === "reference" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Target Collection <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Database className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={ref}
                    onChange={(e) => setRef(e.target.value)}
                    disabled={loadingCollections}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-slate-200 appearance-none disabled:opacity-50"
                  >
                    <option value="" disabled>Select target collection...</option>
                    {collections.map(c => (
                      <option key={c._id} value={c._id}>{c.name}</option>
                    ))}
                  </select>
                  {loadingCollections && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
                </div>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={required}
                  onChange={(e) => setRequired(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                />
                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">Required</span>
              </label>

              {["text", "number"].includes(type) && (
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={unique}
                    onChange={(e) => setUnique(e.target.checked)}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">Unique (Primary Key)</span>
                </label>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full mt-8 flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            {saving ? "Adding Field..." : "Add Field"}
          </button>
        </form>
      </div>
    </div>
  );
}
