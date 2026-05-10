import Link from "next/link";
import { Database, Trash2, Settings, Type, Hash, Link as LinkIcon, ToggleLeft, Paperclip, Image as ImageIcon, Video } from "lucide-react";

export type Collection = {
  _id: string;
  name: string;
  slug: string;
  isPublic: boolean;
  fields: { name: string; type: string; required: boolean; unique?: boolean; ref?: string }[];
  createdAt?: string;
};

type CollectionCardProps = {
  collection: Collection;
  onDelete: (id: string) => void;
};

const getFieldIcon = (type: string) => {
  switch (type) {
    case "text": return <Type className="w-3 h-3 text-slate-400" />;
    case "number": return <Hash className="w-3 h-3 text-slate-400" />;
    case "boolean": return <ToggleLeft className="w-3 h-3 text-slate-400" />;
    case "reference": return <LinkIcon className="w-3 h-3 text-slate-400" />;
    case "image": return <ImageIcon className="w-3 h-3 text-slate-400" />;
    case "video": return <Video className="w-3 h-3 text-slate-400" />;
    case "file": return <Paperclip className="w-3 h-3 text-slate-400" />;
    default: return <Type className="w-3 h-3 text-slate-400" />;
  }
};

export default function CollectionCard({ collection, onDelete }: CollectionCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
              {collection.name}
            </h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-slate-500 font-mono bg-slate-100 dark:bg-slate-800/40 px-1.5 py-0.5 rounded">
                /{collection.slug}
              </span>
              {collection.isPublic && (
                <span className="text-[10px] uppercase font-bold text-green-600 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded border border-green-100 dark:border-green-800">
                  Public
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
          <button
            onClick={(e) => {
              e.preventDefault();
              if (confirm(`Are you sure you want to delete collection "${collection.name}"? This action cannot be undone.`)) {
                onDelete(collection._id);
              }
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Collection"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content - Fields Preview */}
      <div className="flex-1 min-h-0 mt-2">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
          Schema ({collection.fields?.length || 0})
        </p>
        <div className="flex flex-wrap gap-2">
          {collection.fields?.slice(0, 6).map((field, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-md">
              {getFieldIcon(field.type)}
              <span>{field.name}</span>
              {field.required && <span className="text-red-400">*</span>}
              {field.unique && <span className="text-[9px] font-bold text-indigo-500">PK</span>}
            </div>
          ))}
          {(collection.fields?.length || 0) > 6 && (
            <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 px-2 py-1 rounded-md">
              +{collection.fields!.length - 6} more
            </div>
          )}
          {(!collection.fields || collection.fields.length === 0) && (
            <div className="text-sm text-slate-400 italic">No fields defined yet.</div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          {/* Add entries count here if available in the future */}
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md">
            ID: {collection._id.slice()}
          </span>
        </div>
        {collection.createdAt && (
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {new Date(collection.createdAt).toLocaleDateString()}
          </p>
        )}
      </div>

      {/* Invisible overlay link to make whole card clickable */}
      <Link href={`/dashboard/collections/${collection._id}`} className="absolute inset-0 z-10 rounded-2xl" aria-label={`Open ${collection.name}`}></Link>
      <div className="absolute inset-0 z-0 pointer-events-none rounded-2xl ring-1 ring-inset ring-transparent group-focus-within:ring-indigo-500 transition-shadow"></div>
    </div>
  );
}
