"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Key, Shield, Plus, Trash2, Loader2, Lock } from "lucide-react";
import Link from "next/link";

export default function ApiKeySettings() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/keys").then(res => setKeys(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id: string) => {
    if (!confirm("Are you sure? This will immediately break any apps using this key.")) return;
    try {
      await api.delete(`/keys/${id}`);
      setKeys(prev => prev.filter(k => k._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">API Access Tokens</h3>
            <p className="text-sm text-slate-500">Keys used to authenticate your external requests.</p>
          </div>
          <Link 
            href="/dashboard/api-keys" 
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Create New Key
          </Link>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {keys.map((key) => (
            <div key={key._id} className="p-6 group hover:bg-slate-50/50 dark:hover:bg-[#1e1e1e] transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800/60 flex items-center justify-center text-slate-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100">{key.name || "Untitled Key"}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <code className="text-[10px] font-mono text-slate-500 bg-slate-100 dark:bg-slate-950/50 backdrop-blur-md px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-800">
                        {key.maskedKey}
                      </code>
                      <div className="flex gap-1">
                        {key.permissions?.map((p: string) => (
                          <span key={p} className="text-[9px] font-black uppercase text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-1 py-0.5 rounded border border-indigo-100 dark:border-indigo-800/30">
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => handleRevoke(key._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  title="Revoke Key"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}

          {keys.length === 0 && (
            <div className="p-12 text-center">
              <Lock className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">No active API keys.</p>
              <p className="text-xs text-slate-500 mt-1">Create a key to start integrating Nigris with your apps.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
