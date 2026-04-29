"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

type Project = {
  _id: string;
  name: string;
};

type Collection = {
  _id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  fields: { name: string; type: string; required: boolean }[];
  createdAt?: string;
};

type FieldInput = {
  name: string;
  type: "text" | "number" | "boolean";
  required: boolean;
};

export default function CollectionsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [projectId, setProjectId] = useState("");
  const [name, setName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [fields, setFields] = useState<FieldInput[]>([]);
  const [fieldName, setFieldName] = useState("");
  const [fieldType, setFieldType] = useState<FieldInput["type"]>("text");
  const [fieldRequired, setFieldRequired] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingCollections, setLoadingCollections] = useState(false);
  const [error, setError] = useState("");
  const selectedProject = projects.find((project) => project._id === projectId);

  const loadCollectionsForProject = async (selectedProjectId: string) => {
    if (!selectedProjectId) {
      setCollections([]);
      return;
    }

    setLoadingCollections(true);
    setError("");
    try {
      const res = await api.get(`/collections/${selectedProjectId}`);
      setCollections(Array.isArray(res.data) ? res.data : []);
    } catch {
      setCollections([]);
      setError("Failed to load collections");
    } finally {
      setLoadingCollections(false);
    }
  };

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      setLoadingProjects(true);
      setError("");
      try {
        const res = await api.get("/projects");
        const list = Array.isArray(res.data) ? res.data : [];
        if (!active) return;
        setProjects(list);
        setProjectId((current) => current || list[0]?._id || "");
      } catch {
        if (active) setError("Failed to load projects");
      } finally {
        if (active) setLoadingProjects(false);
      }
    };

    void loadProjects();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadCollections = async () => {
      if (!projectId) {
        setCollections([]);
        return;
      }
      setLoadingCollections(true);
      setCollections([]);
      setError("");
      try {
        const res = await api.get(`/collections/${projectId}`);
        if (active) setCollections(Array.isArray(res.data) ? res.data : []);
      } catch {
        if (active) {
          setCollections([]);
          setError("Failed to load collections");
        }
      } finally {
        if (active) setLoadingCollections(false);
      }
    };

    void loadCollections();

    return () => {
      active = false;
    };
  }, [projectId]);

  const addField = () => {
    if (!fieldName.trim()) return;
    setFields((prev) => [
      ...prev,
      { name: fieldName.trim(), type: fieldType, required: fieldRequired },
    ]);
    setFieldName("");
    setFieldType("text");
    setFieldRequired(false);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const createCollection = async () => {
    if (!name.trim() || !projectId) return;
    setError("");
    try {
      await api.post("/collections", {
        name: name.trim(),
        projectId,
        fields,
        isPublic,
      });
      setName("");
      setFields([]);
      setIsPublic(false);
      await loadCollectionsForProject(projectId);
    } catch {
      setError("Failed to create collection");
    }
  };

  const deleteCollection = async (id: string) => {
    setError("");
    try {
      await api.delete(`/collections/${id}`);
      await loadCollectionsForProject(projectId);
    } catch {
      setError("Failed to delete collection");
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Collections</h1>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">Create Collection</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Collection name"
            className="border rounded px-3 py-2"
          />
          <select
            value={projectId}
            onChange={(e) => {
              setProjectId(e.target.value);
              setCollections([]);
            }}
            className="border rounded px-3 py-2"
            disabled={loadingProjects}
          >
            <option value="">Select project</option>
            {projects.map((project) => (
              <option key={project._id} value={project._id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <input
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
          <span className="text-sm text-gray-600">Public collection</span>
        </div>

        <div className="mt-4 border-t pt-4">
          <h3 className="text-sm font-semibold mb-2">Fields</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              value={fieldName}
              onChange={(e) => setFieldName(e.target.value)}
              placeholder="Field name"
              className="border rounded px-3 py-2"
            />
            <select
              value={fieldType}
              onChange={(e) => setFieldType(e.target.value as FieldInput["type"])}
              className="border rounded px-3 py-2"
            >
              <option value="text">Text</option>
              <option value="number">Number</option>
              <option value="boolean">Boolean</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={fieldRequired}
                onChange={(e) => setFieldRequired(e.target.checked)}
              />
              Required
            </label>
          </div>
          <button
            onClick={addField}
            className="mt-2 border px-3 py-2 rounded"
          >
            Add field
          </button>

          {fields.length > 0 && (
            <div className="mt-3 space-y-2">
              {fields.map((field, index) => (
                <div
                  key={`${field.name}-${index}`}
                  className="flex items-center justify-between bg-slate-50 px-3 py-2 rounded"
                >
                  <span className="text-sm">
                    {field.name} · {field.type}
                    {field.required ? " · required" : ""}
                  </span>
                  <button
                    onClick={() => removeField(index)}
                    className="text-sm text-red-500"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={createCollection}
          className="mt-4 bg-black text-white px-4 py-2 rounded"
        >
          Create Collection
        </button>
      </div>

      <div className="bg-white rounded-xl shadow p-4">
        <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="font-semibold">Collections List</h2>
            <p className="text-sm text-gray-500">
              {selectedProject
                ? `${collections.length} collection${collections.length === 1 ? "" : "s"} in ${selectedProject.name}`
                : "Choose a project to view its collections"}
            </p>
          </div>
          {projectId && (
            <button
              type="button"
              onClick={() => loadCollectionsForProject(projectId)}
              disabled={loadingCollections}
              className="rounded border px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh
            </button>
          )}
        </div>
        {!projectId ? (
          <p className="text-sm text-gray-500">Select a project to view collections.</p>
        ) : loadingCollections ? (
          <p className="text-sm text-gray-500">Loading collections...</p>
        ) : collections.length === 0 ? (
          <p className="text-sm text-gray-500">No collections yet.</p>
        ) : (
          <div className="space-y-3">
            {collections.map((collection) => (
              <div
                key={collection._id}
                className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border rounded-lg p-3"
              >
                <div>
                  <p className="font-semibold">{collection.name}</p>
                  <p className="text-xs text-gray-500">Slug: {collection.slug}</p>
                  <p className="text-xs text-gray-500">
                    Fields: {collection.fields?.length || 0} · {collection.isPublic ? "Public" : "Private"}
                  </p>
                  {collection.createdAt && (
                    <p className="text-xs text-gray-400">
                      Created {new Date(collection.createdAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => deleteCollection(collection._id)}
                  className="text-sm text-red-500"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
