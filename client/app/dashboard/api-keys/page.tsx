"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Filter, Key, Activity, Trash2, Play, Square, Shield, ArrowUpRight, Eye, EyeOff, Copy, Loader2, RotateCw } from "lucide-react";
import { api, getApiErrorMessage } from "@/lib/api";
import Link from "next/link";
import CreateKeyModal from "@/components/api-keys/CreateKeyModal";
import RevokeKeyModal from "@/components/api-keys/RevokeKeyModal";
import CopyButton from "@/components/api-keys/CopyButton";

type ApiKey = {
  _id: string;
  name?: string;
  key?: string;
  maskedKey: string;
  environment: string;
  usage: number;
  limit: number;
  isActive: boolean;
  permissions?: string[];
  revealable?: boolean;
  createdAt: string;
  lastUsedAt?: string;
  project?: {
    name: string;
  };
};

interface UsageLimits {
  limits: {
    maxApiKeys: number;
  };
  usage: {
    apiKeys: number;
  };
}

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [envFilter, setEnvFilter] = useState<string>("All");
  const [visibleKeyIds, setVisibleKeyIds] = useState<Record<string, boolean>>({});
  const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});
  const [revealingKeyId, setRevealingKeyId] = useState<string | null>(null);
  const [rotatingKeyId, setRotatingKeyId] = useState<string | null>(null);

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [revokeKeyData, setRevokeKeyData] = useState<{ id: string, name: string } | null>(null);
  const [limits, setLimits] = useState<UsageLimits | null>(null);

  const loadKeys = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const res = await api.get("/keys");
      setKeys(Array.isArray(res.data) ? res.data : []);
    } catch {
      setKeys([]);
      setError("Failed to load API keys.");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    // Avoid synchronous setState warning by using a microtask
    Promise.resolve().then(() => {
      loadKeys(true);
      api.get("/users/me/limits").then(res => setLimits(res.data)).catch(() => {});
    });
  }, []);

  const atLimit = limits && limits.limits.maxApiKeys > 0 && limits.usage.apiKeys >= limits.limits.maxApiKeys;

  const toggleActive = async (key: ApiKey) => {
    try {
      await api.patch(`/keys/${key._id}`, { isActive: !key.isActive });
      await loadKeys();
    } catch {
      alert("Failed to update API key status.");
    }
  };

  const toggleKeyVisibility = async (key: ApiKey) => {
    const keyId = key._id;
    const isVisible = !!visibleKeyIds[keyId];
    const localKey = revealedKeys[keyId] || key.key;

    if (isVisible) {
      setVisibleKeyIds((prev) => ({
        ...prev,
        [keyId]: false,
      }));
      return;
    }

    if (!localKey && key.revealable === false) {
      setError("This key was created before secure storage. Rotate it to reveal.");
      return;
    }

    if (!localKey) {
      setRevealingKeyId(keyId);
      setError("");
      try {
        const res = await api.get(`/keys/${keyId}/reveal`);
        const rawKey = res.data?.key;
        if (!rawKey) {
          throw new Error("Key not available");
        }
        setRevealedKeys((prev) => ({
          ...prev,
          [keyId]: rawKey,
        }));
      } catch (err) {
        setError(getApiErrorMessage(err, "Failed to reveal API key."));
        return;
      } finally {
        setRevealingKeyId(null);
      }
    }

    setVisibleKeyIds((prev) => ({
      ...prev,
      [keyId]: true,
    }));
  };

  const rotateKey = async (key: ApiKey) => {
    setRotatingKeyId(key._id);
    setError("");
    try {
      const res = await api.patch(`/keys/${key._id}`, { rotate: true });
      const updated = res.data;
      setKeys((prev) =>
        prev.map((item) =>
          item._id === key._id
            ? { ...item, ...updated, revealable: true }
            : item
        )
      );
      if (updated?.key) {
        setRevealedKeys((prev) => ({ ...prev, [key._id]: updated.key }));
        setVisibleKeyIds((prev) => ({ ...prev, [key._id]: true }));
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to rotate API key."));
    } finally {
      setRotatingKeyId(null);
    }
  };

  const filteredKeys = keys.filter(key => {
    const matchesSearch = (key.name || "Untitled").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesEnv = envFilter === "All" || key.environment === envFilter;
    return matchesSearch && matchesEnv;
  });

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-2">
            API Keys
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Manage the secret keys used to authenticate API requests from your applications.
            Do not share these keys in publicly accessible areas such as GitHub or client-side code.
          </p>
          {limits && limits.limits.maxApiKeys > 0 && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
              {limits.usage.apiKeys} / {limits.limits.maxApiKeys} API keys used
              {atLimit && (
                <Link href="/dashboard/plans" className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  Upgrade <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCreateOpen(true)}
            disabled={!!atLimit}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-bold rounded-xl shadow-sm transition-all ${atLimit ? 'bg-slate-300 dark:bg-slate-700 text-slate-500 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 hover:-translate-y-0.5 active:translate-y-0'}`}
          >
            <Plus className="w-4 h-4" />
            Create Key
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-t-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search keys by name..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-100 outline-none transition-shadow dark:text-slate-200"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={envFilter}
            onChange={(e) => setEnvFilter(e.target.value)}
            className="bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-slate-900 outline-none dark:text-slate-200"
          >
            <option value="All">All Environments</option>
            <option value="Development">Development</option>
            <option value="Production">Production</option>
          </select>
        </div>
      </div>

      {/* Keys Table */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border-x border-b border-slate-200 dark:border-slate-800 rounded-b-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-6 flex items-center justify-between animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800/60 rounded-xl" />
                  <div className="space-y-2">
                    <div className="w-32 h-4 bg-slate-200 dark:bg-slate-800/60 rounded" />
                    <div className="w-48 h-3 bg-slate-200 dark:bg-slate-800/60 rounded" />
                  </div>
                </div>
                <div className="w-24 h-8 bg-slate-200 dark:bg-slate-800/60 rounded-lg" />
              </div>
            ))}
          </div>
        ) : keys.length === 0 ? (
          <div className="p-16 text-center flex flex-col items-center">
            <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/40 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">No API keys generated</h3>
            <p className="text-sm text-slate-500 max-w-sm mb-6">
              Create your first API key to start making authenticated requests to your Nigris backend.
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-5 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 text-sm font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              Create API Key
            </button>
          </div>
        ) : filteredKeys.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No API keys match your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                   <th className="px-6 py-4 font-medium w-1/4">Key Name</th>
                   <th className="px-6 py-4 font-medium">Environment</th>
                   <th className="px-6 py-4 font-medium">Permissions</th>
                   <th className="px-6 py-4 font-medium">Secret Key</th>
                   <th className="px-6 py-4 font-medium">Activity</th>
                   <th className="px-6 py-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredKeys.map(key => (
                  <tr key={key._id} className={`group transition-colors ${!key.isActive ? 'opacity-60 bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-md' : 'hover:bg-slate-50/30 dark:hover:bg-[#202020]/30'}`}>

                    {/* Name & Project */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${key.isActive ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                          <Key className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                            {key.name || "Untitled"}
                            {!key.isActive && <span className="text-[10px] uppercase font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded">Inactive</span>}
                          </div>
                          <div className="text-xs text-slate-500">
                            Project: {key.project?.name || "Unknown"}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Environment */}
                    <td className="px-6 py-5">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${key.environment === 'Production'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                          : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
                        }`}>
                        {key.environment}
                      </span>
                    </td>

                    {/* Permissions */}
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-1">
                        {key.permissions?.map(p => (
                          <span key={p} className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-900/20 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-800 uppercase tracking-tighter">
                            {p}
                          </span>
                        )) || (
                          <span className="text-slate-400 text-xs italic">Default (Read)</span>
                        )}
                      </div>
                    </td>

                    {/* API Key */}
                    <td className="px-6 py-5">
                      {(() => {
                        const isVisible = !!visibleKeyIds[key._id];
                        const rawKey = revealedKeys[key._id] || key.key;
                        const isRevealable = key.revealable !== false;
                        const displayKey = rawKey && isVisible ? rawKey : (key.maskedKey || "sk_****");
                        const revealDisabled = revealingKeyId === key._id || (!rawKey && !isRevealable);
                        const revealTitle = !rawKey && !isRevealable
                          ? "Rotate to reveal"
                          : isVisible
                            ? "Hide key"
                            : "Show key";

                        return (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-2 font-mono text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 w-max">
                              <span className="max-w-56 truncate" title={displayKey}>{displayKey}</span>
                              <div className="flex items-center gap-1 border-l border-slate-200 dark:border-slate-700 pl-2">
                                <button
                                  type="button"
                                  onClick={() => toggleKeyVisibility(key)}
                                  disabled={revealDisabled}
                                  title={revealTitle}
                                  className={`p-1 rounded-md transition-colors ${revealDisabled ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"}`}
                                  aria-pressed={isVisible}
                                >
                                  {revealingKeyId === key._id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : isVisible ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </button>
                                {rawKey ? (
                                  <CopyButton text={rawKey} className="p-1" />
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    title="Key only visible at creation"
                                    className="p-1 text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                  >
                                    <Copy className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })()}
                    </td>

                    {/* Activity */}
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <div className="flex flex-col">
                          <span className="text-slate-900 dark:text-slate-100">{key.usage.toLocaleString()} / {key.limit.toLocaleString()}</span>
                          <span className="text-xs text-slate-500">
                            {key.lastUsedAt ? `Used ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-5 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => toggleActive(key)}
                          className="p-2 text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          title={key.isActive ? "Deactivate Key" : "Activate Key"}
                        >
                          {key.isActive ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => rotateKey(key)}
                          disabled={rotatingKeyId === key._id}
                          className={`p-2 rounded-lg transition-colors ${rotatingKeyId === key._id ? "text-slate-300 dark:text-slate-600 cursor-not-allowed" : "text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
                          title="Rotate Key"
                        >
                          {rotatingKeyId === key._id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <RotateCw className="w-4 h-4" />
                          )}
                        </button>

                        <button
                          onClick={() => setRevokeKeyData({ id: key._id, name: key.name || "Untitled" })}
                          className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CreateKeyModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={() => loadKeys(false)}
      />

      {revokeKeyData && (
        <RevokeKeyModal
          isOpen={true}
          onClose={() => setRevokeKeyData(null)}
          onSuccess={() => loadKeys(false)}
          keyId={revokeKeyData.id}
          keyName={revokeKeyData.name}
        />
      )}
    </div>
  );
}
