"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api";

type Project = {
  _id: string;
  name: string;
};

type ApiKey = {
  _id: string;
  name?: string;
  key: string;
  usage: number;
  limit: number;
  isActive: boolean;
  project?: {
    name: string;
  };
};

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyKeyId, setBusyKeyId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [error, setError] = useState("");
  const selectedProject = projects.find((project) => project._id === projectId);

  const loadKeys = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
    const res = await api.get("/keys");
    setKeys(Array.isArray(res.data) ? res.data : []);
    } catch {
      setKeys([]);
      setError("Failed to load API keys");
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const [projectsRes, keysRes] = await Promise.all([
          api.get("/projects"),
          api.get("/keys"),
        ]);
        if (!active) return;

        const projectList = Array.isArray(projectsRes.data) ? projectsRes.data : [];
        setProjects(projectList);
        setProjectId((current) => current || projectList[0]?._id || "");
        setKeys(Array.isArray(keysRes.data) ? keysRes.data : []);
      } catch {
        if (active) {
          setError("Failed to load API keys");
          setProjects([]);
          setKeys([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, []);

  const createKey = async () => {
    if (!projectId) {
      setError("Create a project before generating an API key");
      return;
    }

    if (!name.trim()) {
      setError("API key name is required");
      return;
    }

    setError("");
    setSaving(true);
    try {
      await api.post("/keys", { name: name.trim(), projectId });
      setName("");
      await loadKeys();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create API key"));
    } finally {
      setSaving(false);
    }
  };

  const deleteKey = async (id: string) => {
    setError("");
    setBusyKeyId(id);
    try {
      await api.delete(`/keys/${id}`);
      await loadKeys();
    } catch {
      setError("Failed to delete API key");
    } finally {
      setBusyKeyId(null);
    }
  };

  const startEdit = (key: ApiKey) => {
    setEditingId(key._id);
    setEditName(key.name || "");
  };

  const saveEdit = async () => {
    if (!editingId) return;
    if (!editName.trim()) return;
    setError("");
    setBusyKeyId(editingId);
    try {
      await api.patch(`/keys/${editingId}`, { name: editName.trim() });
      setEditingId(null);
      setEditName("");
      await loadKeys();
    } catch {
      setError("Failed to update API key");
    } finally {
      setBusyKeyId(null);
    }
  };

  const toggleActive = async (key: ApiKey) => {
    setError("");
    setBusyKeyId(key._id);
    try {
      await api.patch(`/keys/${key._id}`, { isActive: !key.isActive });
      await loadKeys();
    } catch {
      setError("Failed to update API key status");
    } finally {
      setBusyKeyId(null);
    }
  };

  const rotateKey = async (id: string) => {
    setError("");
    setBusyKeyId(id);
    try {
      await api.patch(`/keys/${id}`, { rotate: true });
      await loadKeys();
    } catch {
      setError("Failed to rotate API key");
    } finally {
      setBusyKeyId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">API Keys</h1>
          <p className="text-sm text-slate-500">
            Generate metered keys for a selected project.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadKeys(true)}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white p-4 rounded-xl shadow mb-6">
        <div className="mb-3">
          <h2 className="font-semibold">Create API Key</h2>
          <p className="text-sm text-slate-500">
            {selectedProject
              ? `New key will be linked to ${selectedProject.name}.`
              : "Select a project to link this key."}
          </p>
        </div>
        <div className="flex flex-col md:flex-row gap-3">
          <input
            placeholder="Key name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded flex-1"
          />
          <select
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="border p-2 rounded md:w-64"
            disabled={projects.length === 0}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
          <button
            onClick={createKey}
            disabled={saving || projects.length === 0}
            className="bg-black text-white px-4 py-2 rounded disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
        {projects.length === 0 && !loading && (
          <p className="mt-3 text-sm text-slate-500">
            No projects found.{" "}
            <Link href="/dashboard/projects" className="font-medium text-black underline">
              Create a project first
            </Link>
            .
          </p>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-slate-500">Loading API keys...</p>
      ) : keys.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No API keys yet. Create a project first, then generate a key for metered access.
        </div>
      ) : (
        <div className="space-y-4">
          {keys.map((key) => (
            <div
              key={key._id}
              className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              <div className="flex-1">
                {editingId === key._id ? (
                  <div className="flex gap-2">
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="border p-2 rounded flex-1"
                    />
                    <button
                      onClick={saveEdit}
                      className="bg-black text-white px-3 py-2 rounded"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold">{key.name || "Untitled"}</p>
                    <p className="text-sm text-gray-500 break-all">{key.key}</p>
                    <p className="text-sm">
                      {key.project?.name ? `Project: ${key.project.name}` : ""}
                    </p>
                    <p className="text-sm">
                      Status: {key.isActive ? "Active" : "Inactive"}
                    </p>
                    <p className="text-sm">
                      Usage: {key.usage} / {key.limit}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => startEdit(key)}
                  disabled={busyKeyId === key._id}
                  className="text-sm border px-3 py-1 rounded"
                >
                  Rename
                </button>
                <button
                  onClick={() => toggleActive(key)}
                  disabled={busyKeyId === key._id}
                  className="text-sm border px-3 py-1 rounded disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {key.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => rotateKey(key._id)}
                  disabled={busyKeyId === key._id}
                  className="text-sm border px-3 py-1 rounded disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Rotate
                </button>
                <button
                  onClick={() => deleteKey(key._id)}
                  disabled={busyKeyId === key._id}
                  className="text-sm text-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {busyKeyId === key._id ? "Working..." : "Delete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
