import { useState, useEffect, useRef } from "react";
import { api, getApiErrorMessage } from "@/lib/api";

type FieldValue = string | number | boolean | null | undefined | Record<string, unknown>;
type ReferenceOption = Record<string, FieldValue> & { _id: string };

type FieldProps = {
  field: { name: string; type: string; required: boolean; ref?: string };
  value: FieldValue;
  rowId: string;
  collectionId?: string;
  onUpdate: (rowId: string, fieldName: string, newValue: FieldValue) => void;
  refData?: Record<string, ReferenceOption[]>;
};

const mediaAcceptByType: Record<string, string> = {
  image: "image/*,.heic,.heif,.avif",
  video: "video/*,.mov,.m4v,.mkv",
  file: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json",
};

const getReferenceLabel = (item: Record<string, unknown>) => {
  for (const key of ["name", "title", "email", "slug", "_id"]) {
    const value = item[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return "";
};

const getFormValue = (fieldValue: FieldValue) => {
  if (typeof fieldValue === "string" || typeof fieldValue === "number") {
    return fieldValue;
  }

  if (typeof fieldValue === "object" && fieldValue !== null) {
    const id = fieldValue._id;
    return typeof id === "string" || typeof id === "number" ? id : "";
  }

  return "";
};

export default function FieldRenderer({ field, value, rowId, onUpdate, refData }: FieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localValue, setLocalValue] = useState<FieldValue>(value);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = async () => {
    setIsEditing(false);
    if (localValue === value) return; // No change

    setSaving(true);
    try {
      // Optimistic UI update
      onUpdate(rowId, field.name, localValue);

      // Persist to backend
      await api.put(`/data/${rowId}`, {
        [field.name]: localValue
      });
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save field"));
      // Revert on failure
      onUpdate(rowId, field.name, value);
      setLocalValue(value);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSave();
    }
    if (e.key === "Escape") {
      setIsEditing(false);
      setLocalValue(value);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSaving(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const url = (res.data as { url?: string }).url;
      if (!url) {
        throw new Error("Upload completed without a media URL");
      }

      await api.put(`/data/${rowId}`, {
        [field.name]: url
      });

      setLocalValue(url);
      onUpdate(rowId, field.name, url);
      setIsEditing(false);
    } catch (err) {
      alert(getApiErrorMessage(err, "Upload failed"));
      setLocalValue(value);
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const isSafeUrl = (url: string) => {
    if (!url) return false;
    const lower = url.toLowerCase().trim();
    // Allow http, https, and relative paths starting with /
    // Block javascript:, data: (can be used for XSS), etc.
    return lower.startsWith("http://") || lower.startsWith("https://") || lower.startsWith("/");
  };

  const renderDisplay = () => {
    const displayValue = saving ? localValue : value;
    if (saving) return <span className="text-slate-400 text-xs animate-pulse">Saving...</span>;
    if (displayValue == null || displayValue === "") return <span className="text-slate-300 dark:text-slate-600 italic">Empty</span>;

    switch (field.type) {
      case "boolean":
        return (
           <input 
             type="checkbox"
             checked={!!displayValue}
             onChange={(e) => {
                const checked = e.target.checked;
                setLocalValue(checked);
                onUpdate(rowId, field.name, checked);
                api.put(`/data/${rowId}`, { [field.name]: checked }).catch(() => {
                   setLocalValue(displayValue);
                   onUpdate(rowId, field.name, displayValue);
                });
             }}
             className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500 cursor-pointer"
           />
        );
      
      case "reference":
        let referenceLabel = "";
        if (typeof displayValue === "object" && displayValue !== null) {
           referenceLabel = getReferenceLabel(displayValue);
        } else if (field.ref && refData && refData[field.ref]) {
           const found = refData[field.ref].find(r => r._id === displayValue);
           if (found) referenceLabel = getReferenceLabel(found);
        } else if (typeof displayValue === "string" || typeof displayValue === "number") {
           referenceLabel = String(displayValue);
        }

        return (
          <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded text-xs truncate max-w-[150px] inline-block">
            {referenceLabel}
          </span>
        );
      
      case "image":
        const imageUrl = typeof displayValue === "string" ? displayValue : "";
        if (!isSafeUrl(imageUrl)) return <span className="text-red-400 text-xs italic">Invalid URL</span>;
        return (
          <a href={imageUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
            <img src={imageUrl} alt="preview" className="h-8 w-8 object-cover rounded shadow-sm border border-slate-200 dark:border-slate-700 hover:scale-110 transition-transform" />
          </a>
        );

      case "video":
      case "file":
        const fileUrl = typeof displayValue === "string" ? displayValue : "";
        if (!isSafeUrl(fileUrl)) return <span className="text-red-400 text-xs italic">Invalid URL</span>;
        return (
          <a href={fileUrl} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-indigo-600 dark:text-indigo-400 hover:underline text-xs flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {field.type}
          </a>
        );

      default:
        return <span className="truncate block max-w-[200px] text-slate-700 dark:text-slate-300 text-sm">{String(displayValue)}</span>;
    }
  };

  const renderEditor = () => {
    switch (field.type) {
      case "boolean":
        return null; // Checkbox handles its own state
      
      case "reference":
        return (
          <select
            ref={(node) => {
              inputRef.current = node;
            }}
            className="w-full bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-indigo-500 rounded px-2 py-1 text-sm outline-none shadow-sm dark:text-slate-200"
            value={getFormValue(localValue)}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          >
            <option value="">Select...</option>
            {(field.ref && refData && refData[field.ref] ? refData[field.ref] : []).map((opt) => (
              <option key={opt._id} value={opt._id}>
                {getReferenceLabel(opt)}
              </option>
            ))}
          </select>
        );
      
      case "image":
      case "video":
      case "file":
        return (
          <div className="flex w-full items-center gap-2" onClick={(e) => e.stopPropagation()}>
            <input
              type="file"
              ref={(node) => {
                inputRef.current = node;
              }}
              accept={mediaAcceptByType[field.type] || "*"}
              onChange={handleFileUpload}
              disabled={saving}
              className="w-full text-xs text-slate-500 file:mr-2 file:rounded file:border-0 file:bg-indigo-50 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-indigo-700 hover:file:bg-indigo-100 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={() => {
                setLocalValue(value);
                setIsEditing(false);
              }}
              className="rounded px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
          </div>
        );

      case "number":
        return (
          <input
            ref={(node) => {
              inputRef.current = node;
            }}
            type="number"
            className="w-full bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-indigo-500 rounded px-2 py-1 text-sm outline-none shadow-sm dark:text-slate-200"
            value={getFormValue(localValue)}
            onChange={(e) => setLocalValue(e.target.value ? Number(e.target.value) : "")}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        );

      default:
        return (
          <input
            ref={(node) => {
              inputRef.current = node;
            }}
            type="text"
            className="w-full bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-indigo-500 rounded px-2 py-1 text-sm outline-none shadow-sm dark:text-slate-200"
            value={getFormValue(localValue)}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
          />
        );
    }
  };

  // Skip click-to-edit for booleans as they edit directly via the checkbox
  const handleClick = () => {
    if (field.type !== "boolean") {
      setLocalValue(value);
      setIsEditing(true);
    }
  };

  return (
    <div 
      className={`min-h-[28px] flex items-center w-full ${!isEditing && field.type !== "boolean" ? "cursor-text hover:bg-slate-100 dark:hover:bg-slate-800 -mx-2 px-2 rounded transition-colors" : ""}`}
      onClick={handleClick}
    >
      {isEditing ? renderEditor() : renderDisplay()}
    </div>
  );
}
