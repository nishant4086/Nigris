import { useState, useEffect } from "react";
import { X, KeyRound, Loader2, ShieldCheck, FolderGit2, AlertTriangle } from "lucide-react";
import { api } from "@/lib/api";
import CopyButton from "./CopyButton";

type Project = { _id: string; name: string };

type CreateKeyModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // To refresh the list
};

export default function CreateKeyModal({ isOpen, onClose, onSuccess }: CreateKeyModalProps) {
  const [name, setName] = useState("");
  const [environment, setEnvironment] = useState("Development");
  const [projectId, setProjectId] = useState("");
  const [permissions, setPermissions] = useState<string[]>(["read"]);
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  
  // Success state holds the newly generated raw key
  const [newKey, setNewKey] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Reset state
      setName("");
      setEnvironment("Development");
      setNewKey(null);
      setError("");
      setPermissions(["read"]);
      
      const fetchProjects = async () => {
        setLoadingProjects(true);
        try {
          const res = await api.get("/projects");
          const list = Array.isArray(res.data) ? res.data : [];
          setProjects(list);
          if (list.length > 0) setProjectId(list[0]._id);
        } catch (err) {
          console.error(err);
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
      setError("API Key name is required.");
      return;
    }
    if (!projectId) {
      setError("Please select a project.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const res = await api.post("/keys", { 
        name: name.trim(), 
        projectId,
        environment,
        permissions
      });
      // The backend now returns the raw `key` just this once
      setNewKey(res.data.key);
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || "Failed to create API key");
    } finally {
      setSaving(false);
    }
  };

  const handleDone = () => {
    setNewKey(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${newKey ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100'}`}>
              {newKey ? <ShieldCheck className="w-5 h-5" /> : <KeyRound className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {newKey ? "API Key Created" : "Create API Key"}
              </h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {newKey ? "Store this safely" : "Generate a new secure key"}
              </p>
            </div>
          </div>
          {!newKey && (
            <button 
              onClick={onClose} 
              disabled={saving}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#252525] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {newKey ? (
            /* SUCCESS VIEW - SHOW KEY ONCE */
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 rounded-xl p-4 flex gap-3 text-amber-800 dark:text-amber-500">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p className="text-sm">
                  <strong>Please copy this key now.</strong> For your security, it will never be shown again.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Your API Key</label>
                <div className="flex items-center gap-2 p-1 pl-4 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl">
                  <code className="flex-1 text-sm text-slate-900 dark:text-slate-100 font-mono break-all">{newKey}</code>
                  <CopyButton text={newKey} className="p-3 bg-white dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:shadow" />
                </div>
              </div>
            </div>
          ) : (
            /* CREATION FORM */
            <div className="space-y-5 animate-in slide-in-from-left-4 duration-300">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Key Name <span className="text-red-500">*</span></label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Production Frontend App"
                  className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-slate-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project <span className="text-red-500">*</span></label>
                <div className="relative">
                  <FolderGit2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={loadingProjects}
                    className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-all dark:text-slate-200 appearance-none disabled:opacity-50"
                  >
                    <option value="" disabled>Select a project...</option>
                    {projects.map(p => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  {loadingProjects && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 animate-spin" />}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Environment</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setEnvironment("Development")}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      environment === "Development" 
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 ring-2 ring-blue-500/20" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#202020]"
                    }`}
                  >
                    Development
                  </button>
                  <button
                    onClick={() => setEnvironment("Production")}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                      environment === "Production" 
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 ring-2 ring-emerald-500/20" 
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#202020]"
                    }`}
                  >
                    Production
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Permissions (Scopes)</label>
                <div className="space-y-2">
                  {[
                    { id: "read", name: "Read", desc: "Can read entries and collections" },
                    { id: "write", name: "Write", desc: "Can create and update entries" },
                    { id: "admin", name: "Admin", desc: "Manage schemas and keys via API" }
                  ].map(perm => (
                    <button
                      key={perm.id}
                      type="button"
                      onClick={() => {
                        if (permissions.includes(perm.id)) {
                          if (permissions.length > 1) setPermissions(permissions.filter(p => p !== perm.id));
                        } else {
                          setPermissions([...permissions, perm.id]);
                        }
                      }}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        permissions.includes(perm.id)
                          ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10 ring-1 ring-indigo-500"
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#202020]"
                      }`}
                    >
                      <div>
                        <p className={`text-sm font-bold ${permissions.includes(perm.id) ? 'text-indigo-700 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-300'}`}>{perm.name}</p>
                        <p className="text-[10px] text-slate-500">{perm.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${permissions.includes(perm.id) ? 'border-indigo-500 bg-indigo-500' : 'border-slate-300 dark:border-slate-700'}`}>
                        {permissions.includes(perm.id) && <div className="w-2 h-2 bg-white rounded-full" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-md flex items-center justify-end">
          {newKey ? (
            <button
              onClick={handleDone}
              className="px-6 py-2.5 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 active:bg-slate-950 rounded-xl transition-colors shadow-sm"
            >
              Done
            </button>
          ) : (
            <div className="flex items-center gap-3 w-full justify-between">
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
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-slate-900 dark:bg-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 active:bg-slate-950 rounded-xl transition-colors shadow-sm disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? "Generating..." : "Generate Key"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
