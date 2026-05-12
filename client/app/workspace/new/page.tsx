"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Plus, Loader2, ArrowLeft, Trash2 } from "lucide-react";

type FieldInput = {
  name: string;
  type: "text" | "number" | "boolean" | "image" | "video" | "file" | "reference";
  required: boolean;
  unique?: boolean;
  ref?: string;
};

function NewCollectionForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get("project");

  const [name, setName] = useState("");
  const [fields, setFields] = useState<FieldInput[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleAddField = () => {
    setFields([...fields, { name: "", type: "text", required: false }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const updateField = (index: number, key: keyof FieldInput, value: string | number | boolean | undefined) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], [key]: value };
    // Clean up incompatible properties when switching types
    if (key === "type") {
      if (!["text", "number"].includes(value)) newFields[index].unique = false;
      if (value !== "reference") newFields[index].ref = undefined;
    }
    setFields(newFields);
  };

  const handleSave = async () => {
    if (!name.trim()) return setError("Collection name is required");
    if (!projectId) return setError("Project ID is missing from URL parameters");
    
    // Validate fields
    for (const f of fields) {
      if (!f.name.trim()) return setError("All fields must have a name");
      if (f.type === "reference" && !f.ref) return setError(`Field '${f.name}' requires a reference target`);
    }

    setSaving(true);
    setError("");

    try {
      const res = await api.post("/collections", {
        name: name.trim(),
        projectId,
        fields,
        isPublic: false,
      });
      router.push(`/workspace/${res.data._id}`);
      // Force a full refresh to update the sidebar collections
      window.location.href = `/workspace/${res.data._id}`;
    } catch (err) {
      setError("Failed to create collection");
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden h-full">
      <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <button 
            onClick={() => router.back()}
            className="hover:bg-slate-100 p-1.5 rounded-md transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <span className="font-medium text-slate-700">New Collection</span>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Database"}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl mx-auto">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
              {error}
            </div>
          )}

          <input
            type="text"
            placeholder="Collection Title"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full text-4xl font-bold text-slate-900 placeholder-slate-300 border-none focus:ring-0 px-0 mb-8 outline-none"
          />

          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-4 border-b border-slate-100 pb-2">Properties</h3>
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div key={idx} className="flex flex-col sm:flex-row gap-3 items-start p-4 bg-slate-50 border border-slate-200 rounded-lg group">
                    <div className="flex-1 space-y-3 w-full">
                      <div className="flex gap-3">
                        <input
                          type="text"
                          placeholder="Property name"
                          value={field.name}
                          onChange={(e) => updateField(idx, "name", e.target.value)}
                          className="flex-1 border border-slate-200 rounded px-3 py-1.5 text-sm"
                        />
                        <select
                          value={field.type}
                          onChange={(e) => updateField(idx, "type", e.target.value)}
                          className="border border-slate-200 rounded px-3 py-1.5 text-sm bg-white"
                        >
                          <option value="text">Text</option>
                          <option value="number">Number</option>
                          <option value="boolean">Checkbox</option>
                          <option value="image">Image</option>
                          <option value="video">Video</option>
                          <option value="file">File</option>
                          <option value="reference">Relation</option>
                        </select>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                        <label className="flex items-center gap-1.5">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => updateField(idx, "required", e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                          Required
                        </label>

                        {["text", "number"].includes(field.type) && (
                          <label className="flex items-center gap-1.5">
                            <input
                              type="checkbox"
                              checked={field.unique || false}
                              onChange={(e) => updateField(idx, "unique", e.target.checked)}
                              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            Unique
                          </label>
                        )}

                        {field.type === "reference" && (
                          <input
                            type="text"
                            placeholder="Target Collection ID"
                            value={field.ref || ""}
                            onChange={(e) => updateField(idx, "ref", e.target.value)}
                            className="border border-slate-200 rounded px-2 py-1 text-xs w-48"
                          />
                        )}
                      </div>
                    </div>
                    
                    <button
                      onClick={() => handleRemoveField(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-white rounded border border-transparent hover:border-red-100 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}

                <button
                  onClick={handleAddField}
                  className="flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 py-2 transition-colors font-medium"
                >
                  <Plus className="w-4 h-4" /> Add a property
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function NewCollectionPage() {
  return (
    <Suspense fallback={<div className="p-8 text-slate-500 text-sm">Loading editor...</div>}>
      <NewCollectionForm />
    </Suspense>
  );
}
