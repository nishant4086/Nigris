"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { api, getApiErrorMessage } from "@/lib/api";
import { Paperclip, Loader2, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { CollectionField, FieldValue } from "@/lib/types";

type Field = CollectionField;

type ReferenceOption = Record<string, FieldValue> & { _id: string };

type FieldRendererProps = {
  field: Field;
  value: FieldValue;
  onChange: (val: FieldValue) => void;
  onBlur?: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  autoFocus?: boolean;
};

const mediaAcceptByType: Record<string, string> = {
  image: "image/*,.heic,.heif,.avif",
  video: "video/*,.mov,.m4v,.mkv",
  file: ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.json",
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

const getReferenceLabel = (item: ReferenceOption) => {
  for (const key of ["name", "title", "email", "slug", "_id"]) {
    const value = item[key];
    if (typeof value === "string" || typeof value === "number") {
      return String(value);
    }
  }

  return "";
};

export default function FieldRenderer({ field, value, onChange, onBlur, onKeyDown, disabled, autoFocus }: FieldRendererProps) {
  const [uploading, setUploading] = useState(false);
  const [refOptions, setRefOptions] = useState<ReferenceOption[]>([]);

  useEffect(() => {
    if (field.type === "reference" && field.ref) {
      api.get(`/data/${field.ref}?limit=100`)
        .then(res => setRefOptions((res.data.data || []) as ReferenceOption[]))
        .catch(err => console.error("Failed to load refs", err));
    }
  }, [field]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await api.post("/upload", form, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      if (!res.data.url) {
        throw new Error("Upload completed without a media URL");
      }
      onChange(res.data.url);
    } catch (err) {
      alert(getApiErrorMessage(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  const baseInputClass = "w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition bg-white disabled:bg-slate-50 disabled:text-slate-500 placeholder-slate-400";

  switch (field.type) {
    case "text":
      return (
        <input
          type="text"
          value={getFormValue(value)}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder="Empty text"
          className={baseInputClass}
        />
      );

    case "number":
      return (
        <input
          type="number"
          value={getFormValue(value)}
          onChange={(e) => onChange(Number(e.target.value))}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          placeholder="Empty number"
          className={baseInputClass}
        />
      );

    case "boolean":
      return (
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(e.target.checked)}
            onBlur={onBlur}
            onKeyDown={onKeyDown}
            disabled={disabled}
            autoFocus={autoFocus}
            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 disabled:opacity-50"
          />
          <span className="text-sm text-slate-700 select-none">
            {value ? "True" : "False"}
          </span>
        </label>
      );

    case "reference":
      return (
        <select
          value={getFormValue(value)}
          onChange={(e) => { onChange(e.target.value); if(onBlur) onBlur(); }}
          onBlur={onBlur}
          disabled={disabled}
          autoFocus={autoFocus}
          className={baseInputClass}
        >
          <option value="" className="text-slate-400">Select relation...</option>
          {refOptions.map(opt => (
            <option key={opt._id} value={opt._id}>
              {getReferenceLabel(opt)}
            </option>
          ))}
        </select>
      );

    case "image":
    case "video":
    case "file":
      const isImage = field.type === "image";
      const isVideo = field.type === "video";
      const Icon = isImage ? ImageIcon : isVideo ? VideoIcon : Paperclip;

      return (
        <div className="space-y-2">
          {value ? (
            <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg bg-slate-50 group">
              {isImage ? (
                <Image 
                  src={String(value)} 
                  alt="Preview" 
                  width={40} 
                  height={40} 
                  className="w-10 h-10 object-cover rounded shadow-sm bg-white" 
                />
              ) : (
                <div className="w-10 h-10 flex items-center justify-center bg-white rounded shadow-sm text-slate-400">
                  <Icon className="w-5 h-5" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <a href={String(value)} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-slate-700 hover:text-indigo-600 truncate block transition-colors">
                  {String(value).split('/').pop() || "View File"}
                </a>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onChange(null)}
                  className="text-xs text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  Remove
                </button>
              )}
            </div>
          ) : (
            <div className="relative">
              <input
                type="file"
                accept={mediaAcceptByType[field.type] || "*"}
                onChange={handleUpload}
                disabled={disabled || uploading}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
              />
              <div className={`flex items-center justify-center gap-2 border border-dashed rounded-lg p-4 transition-colors ${uploading ? 'bg-indigo-50/50 border-indigo-200' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}>
                {uploading ? (
                  <><Loader2 className="w-4 h-4 text-indigo-500 animate-spin" /><span className="text-sm text-indigo-600 font-medium">Uploading...</span></>
                ) : (
                  <><Icon className="w-4 h-4 text-slate-400" /><span className="text-sm text-slate-600 font-medium">Click to upload {field.type}</span></>
                )}
              </div>
            </div>
          )}
        </div>
      );

    default:
      return (
        <input
          type="text"
          value={getFormValue(value)}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          disabled={disabled}
          autoFocus={autoFocus}
          className={baseInputClass}
        />
      );
  }
}
