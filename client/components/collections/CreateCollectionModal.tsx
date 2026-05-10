import { useState, useEffect } from "react";
import { X, Database, Loader2, FolderGit2 } from "lucide-react";
import { api } from "@/lib/api";

type Project = {
  _id: string;
  name: string;
};

type CreateCollectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, projectId: string, isPublic: boolean) => Promise<void>;
  initialProjectId?: string;
};

export default function CreateCollectionModal({ isOpen, onClose, onSubmit, initialProjectId }: CreateCollectionModalProps) {
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState(initialProjectId || "");
  const [isPublic, setIsPublic] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const fetchProjects = async () => {
        setLoadingProjects(true);
        try {
          const res = await api.get("/projects");
          const list = Array.isArray(res.data) ? res.data : [];
          setProjects(list);
          if (list.length > 0 && !projectId) {
            setProjectId(list[0]._id);
          }
        } catch (err) {
          console.error("Failed to fetch projects", err);
        } finally {
          setLoadingProjects(false);
        }
      };
      fetchProjects();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Collection name is required.");
      return;
    }
    if (!projectId) {
      setError("Please select a project.");
      return;
    }
    
    setSaving(true);
    setError("");
    try {
      await onSubmit(name.trim(), projectId, isPublic);
      setTimeout(() => {
        setName("");
        setIsPublic(false);
      }, 300);
    } catch (err: any) {
      setError(err.message || "Failed to create collection.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">New Collection</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Create a new database table</p>
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

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Collection Name <span className="text-red-500">*</span></label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Customers, Tasks, Posts"
                className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-slate-200"
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Parent Project <span className="text-red-500">*</span></label>
              <div className="relative">
                <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  disabled={loadingProjects}
                  className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all dark:text-slate-200 appearance-none disabled:opacity-50"
                >
                  <option value="" disabled>Select a project...</option>
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.name}</option>
                  ))}
                </select>
                {loadingProjects && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
              </div>
            </div>

            <label className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#202020] cursor-pointer transition-colors mt-2">
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Public Collection</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Allows unauthenticated API reads via the public SDK. Good for blogs or public catalogs.</p>
              </div>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-md flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#252525] rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            onClick={handleCreate}
            disabled={saving || loadingProjects}
            className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-colors shadow-sm shadow-indigo-600/20 disabled:opacity-70"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {saving ? "Creating..." : "Create Collection"}
          </button>
        </div>
      </div>
    </div>
  );
}
