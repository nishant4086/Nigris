"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api, getApiErrorMessage } from "@/lib/api";

type Project = {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedProjectId, setSelectedProjectId] = useState("");
  const [error, setError] = useState("");
  const selectedProject = projects.find((project) => project._id === selectedProjectId);

  const loadProjects = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const res = await api.get("/projects");
      const list = Array.isArray(res.data) ? res.data : [];
      setProjects(list);
      setSelectedProjectId((current) => current || list[0]?._id || "");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load projects";
      setError(message);
      setProjects([]);
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadInitialProjects = async () => {
      if (!active) return;
      setLoading(true);
      setError("");
      try {
        const res = await api.get("/projects");
        const list = Array.isArray(res.data) ? res.data : [];
        if (active) {
          setProjects(list);
          setSelectedProjectId((current) => current || list[0]?._id || "");
        }
      } catch {
        if (active) {
          setError("Failed to load projects");
          setProjects([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void loadInitialProjects();

    return () => {
      active = false;
    };
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setError("");
    try {
      const res = await api.post("/projects", {
        name: name.trim(),
        description,
      });
      setName("");
      setDescription("");
      if (res.data?._id) {
        setSelectedProjectId(res.data._id);
      }
      await loadProjects();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create project"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError("");
    setDeletingId(id);
    try {
      await api.delete(`/projects/${id}`);
      setProjects((prev) => {
        const nextProjects = prev.filter((p) => p._id !== id);
        setSelectedProjectId((current) =>
          current === id ? nextProjects[0]?._id || "" : current
        );
        return nextProjects;
      });
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to delete project"));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Projects</h1>
          <p className="text-sm text-slate-500">
            Create projects to group collections, API keys, and usage limits.
          </p>
        </div>
        <button
          type="button"
          onClick={() => loadProjects(true)}
          disabled={loading}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          Refresh
        </button>
      </div>

      <form onSubmit={handleCreate} className="mb-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <label className="block text-sm font-medium text-slate-700">
            Project name
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Customer API"
              minLength={3}
              required
            />
          </label>
          <label className="block text-sm font-medium text-slate-700">
            Description
            <input
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional context"
            />
          </label>
          <button
            type="submit"
            disabled={saving}
            className="rounded-md bg-black px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? "Creating..." : "Create"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-500">Loading projects...</p>
      ) : projects.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
          No projects yet. Create your first project to unlock collections and API keys.
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((project) => {
              const selected = project._id === selectedProjectId;

              return (
                <button
                  key={project._id}
                  type="button"
                  onClick={() => setSelectedProjectId(project._id)}
                  className={`rounded-lg border bg-white p-4 text-left shadow-sm transition ${
                    selected ? "border-black ring-2 ring-black/10" : "border-slate-200 hover:border-slate-400"
                  }`}
                >
                  <div className="min-h-24">
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="font-semibold text-slate-900">{project.name}</h2>
                      {selected && (
                        <span className="rounded-full bg-black px-2 py-1 text-xs text-white">
                          Selected
                        </span>
                      )}
                    </div>
                    {project.description ? (
                      <p className="mt-1 text-sm text-slate-600">{project.description}</p>
                    ) : (
                      <p className="mt-1 text-sm text-slate-400">No description</p>
                    )}
                    {project.createdAt && (
                      <p className="mt-3 text-xs text-slate-400">
                        Created {new Date(project.createdAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Selected project</p>
            {selectedProject ? (
              <div className="mt-2">
                <h2 className="text-lg font-semibold text-slate-900">
                  {selectedProject.name}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedProject.description || "No description"}
                </p>
                <div className="mt-4 grid gap-2">
                  <Link
                    href="/dashboard/collections"
                    className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm"
                  >
                    Manage collections
                  </Link>
                  <Link
                    href="/dashboard/api-keys"
                    className="rounded-md border border-slate-300 px-3 py-2 text-center text-sm"
                  >
                    Create API key
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(selectedProject._id)}
                    disabled={deletingId === selectedProject._id}
                    className="rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingId === selectedProject._id ? "Deleting..." : "Delete project"}
                  </button>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                Select a project to manage its collections and keys.
              </p>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
