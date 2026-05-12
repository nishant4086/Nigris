"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { Plus, Loader2, Type, Hash, ToggleLeft, Link as LinkIcon, Image as ImageIcon, Video as VideoIcon, Paperclip, ArrowDown, ArrowUp, Filter, X } from "lucide-react";
import FieldRenderer from "@/components/workspace/FieldRenderer";
import { CollectionField, CollectionData, FieldValue } from "@/lib/types";

type Field = CollectionField;

const getFieldIcon = (type: string) => {
  switch (type) {
    case "text": return <Type className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />;
    case "number": return <Hash className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />;
    case "boolean": return <ToggleLeft className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />;
    case "reference": return <LinkIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />;
    case "image": return <ImageIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />;
    case "video": return <VideoIcon className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />;
    case "file": return <Paperclip className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />;
    default: return <Type className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />;
  }
};

type SortConfig = { field: string; order: "asc" | "desc" } | null;
type FilterRule = { field: string; operator: "eq" | "contains" | "gt" | "lt"; value: string };

export default function WorkspaceDatabasePage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;

  const [collectionName, setCollectionName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [data, setData] = useState<CollectionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  // Advanced UX States
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  const [filters, setFilters] = useState<FilterRule[]>([]);
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string, fieldName: string } | null>(null);
  const [editValue, setEditValue] = useState<FieldValue>("");

  const fetchData = async () => {
    try {
      setLoading(true);
      let query = `?limit=100`;
      if (sortConfig) {
        query += `&sortBy=${sortConfig.field}&order=${sortConfig.order}`;
      }
      filters.forEach(f => {
        if (f.field && f.operator && f.value) {
          query += `&${f.field}[${f.operator}]=${encodeURIComponent(f.value)}`;
        }
      });

      const [colRes, dataRes] = await Promise.all([
        api.get(`/collections/detail/${collectionId}`),
        api.get(`/data/${collectionId}${query}`)
      ]);
      setCollectionName(colRes.data.name);
      setFields(colRes.data.fields || []);
      setData(dataRes.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (collectionId) fetchData();
  }, [collectionId, sortConfig, filters]);

  const handleNewEntry = async () => {
    setCreating(true);
    try {
      await api.post(`/data/${collectionId}`, {});
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to create entry. Ensure required fields don't block empty creation.");
    } finally {
      setCreating(false);
    }
  };

  const handleSort = (fieldName: string) => {
    setSortConfig(prev => {
      if (prev?.field === fieldName) {
        if (prev.order === "asc") return { field: fieldName, order: "desc" };
        return null;
      }
      return { field: fieldName, order: "asc" };
    });
  };

  const addFilter = () => setFilters([...filters, { field: fields[0]?.name || "", operator: "contains", value: "" }]);
  
  const updateFilter = (index: number, key: keyof FilterRule, value: string) => {
    const newFilters = [...filters];
    (newFilters[index][key] as string) = value;
    setFilters(newFilters);
  };
  
  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  // Inline Editing Logic
  const startEdit = (row: CollectionData, f: Field, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent row click navigation
    if (["image", "video", "file"].includes(f.type)) return; // disable inline for complex files
    setEditingCell({ rowId: row._id, fieldName: f.name });
    
    let val = row[f.name];
    if (f.type === "reference" && val && typeof val === "object") {
      val = (val as { _id: string })._id;
    }
    setEditValue(val || "");
  };

  const saveInlineEdit = async () => {
    if (!editingCell) return;
    const { rowId, fieldName } = editingCell;
    const originalRow = data.find(r => r._id === rowId);
    if (!originalRow) return;
    
    // Optimistic Update
    setData(prev => prev.map(r => r._id === rowId ? { ...r, [fieldName]: editValue } : r));
    setEditingCell(null);

    try {
      await api.put(`/data/${rowId}`, { [fieldName]: editValue });
      // Reload silently to get populated refs if needed
      if (fields.find(f => f.name === fieldName)?.type === "reference") {
        fetchData();
      }
    } catch (err) {
      alert(getApiErrorMessage(err, "Update failed"));
      // Revert optimistic
      setData(prev => prev.map(r => r._id === rowId ? originalRow : r));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") saveInlineEdit();
    if (e.key === "Escape") setEditingCell(null);
  };

  const renderCell = (row: CollectionData, f: Field) => {
    const isEditing = editingCell?.rowId === row._id && editingCell?.fieldName === f.name;

    if (isEditing) {
      return (
        <div onClick={(e) => e.stopPropagation()} className="w-full">
          <FieldRenderer 
            field={f} 
            value={editValue} 
            onChange={setEditValue} 
            onBlur={saveInlineEdit}
            onKeyDown={handleKeyDown}
            autoFocus
          />
        </div>
      );
    }

    const val = row[f.name];
    if (val == null || val === "") return <span className="text-slate-300 dark:text-slate-600">—</span>;

    if (f.type === "boolean") {
      return val ? "✅" : "❌";
    }
    
    if (f.type === "reference") {
      if (val && typeof val === "object") {
        const v = val as any;
        const display = v.name || v.title || v.email || v.slug || v._id;
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-[#202020] text-slate-700 dark:text-slate-300 text-xs font-medium border border-slate-200 dark:border-slate-800">
            <LinkIcon className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            {display}
          </span>
        );
      }
      return <span className="text-slate-500">{String(val)}</span>;
    }

    if (["image", "video", "file"].includes(f.type)) {
      const url = String(val);
      return (
        <a href={url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline">
          <Paperclip className="w-3 h-3" />
          <span className="truncate max-w-[120px]">{url.split('/').pop()}</span>
        </a>
      );
    }

    return <span className="truncate block max-w-[200px] text-slate-700 dark:text-slate-300">{String(val)}</span>;
  };

  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-[#111111]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white dark:bg-[#111111] border-b border-slate-100 dark:border-slate-800/50 px-8 py-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">{collectionName}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{data.length} entries</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors border ${filters.length > 0 ? "bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300" : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-[#191919] dark:border-slate-800 dark:text-slate-300 dark:hover:bg-[#202020]"}`}
            >
              <Filter className="w-4 h-4" />
              Filter {filters.length > 0 && `(${filters.length})`}
            </button>
            {showFilterMenu && (
              <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-[#191919] border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 p-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Filters</h3>
                  <button onClick={() => setShowFilterMenu(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="space-y-3">
                  {filters.map((f, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <select value={f.field} onChange={(e) => updateFilter(i, "field", e.target.value)} className="flex-1 border dark:border-slate-700 bg-white dark:bg-[#111111] rounded px-2 py-1 text-sm dark:text-slate-200">
                        {fields.map(field => <option key={field.name} value={field.name}>{field.name}</option>)}
                      </select>
                      <select value={f.operator} onChange={(e) => updateFilter(i, "operator", e.target.value)} className="w-24 border dark:border-slate-700 bg-white dark:bg-[#111111] rounded px-2 py-1 text-sm dark:text-slate-200">
                        <option value="eq">=</option>
                        <option value="contains">contains</option>
                        <option value="gt">&gt;</option>
                        <option value="lt">&lt;</option>
                      </select>
                      <input type="text" value={f.value} onChange={(e) => updateFilter(i, "value", e.target.value)} className="flex-1 border dark:border-slate-700 bg-white dark:bg-[#111111] rounded px-2 py-1 text-sm dark:text-slate-200" placeholder="Value" />
                      <button onClick={() => removeFilter(i)} className="text-slate-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  <button onClick={addFilter} className="text-sm text-indigo-600 dark:text-indigo-400 font-medium hover:underline">+ Add filter</button>
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleNewEntry}
            disabled={creating}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            New
          </button>
        </div>
      </div>

      {/* Database Table */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden bg-white dark:bg-[#111111] shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#161616]">
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 w-12 text-center border-r border-slate-200 dark:border-slate-800">#</th>
                  {fields.map((f) => (
                    <th 
                      key={f.name} 
                      onClick={() => handleSort(f.name)}
                      className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap border-r border-slate-200 dark:border-slate-800 last:border-0 group cursor-pointer hover:bg-slate-100 dark:hover:bg-[#202020] transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        {getFieldIcon(f.type)}
                        <span className="capitalize">{f.name}</span>
                        {f.unique && <span className="text-[10px] uppercase tracking-wider bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">PK</span>}
                        {sortConfig?.field === f.name ? (
                          sortConfig.order === "asc" ? <ArrowUp className="w-3 h-3 text-indigo-500 ml-auto" /> : <ArrowDown className="w-3 h-3 text-indigo-500 ml-auto" />
                        ) : (
                          <ArrowUp className="w-3 h-3 opacity-0 group-hover:opacity-50 ml-auto" />
                        )}
                      </div>
                    </th>
                  ))}
                  <th className="px-4 py-3 font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading && data.length === 0 ? (
                  <tr>
                    <td colSpan={fields.length + 2} className="px-4 py-12 text-center">
                      <Loader2 className="w-6 h-6 text-slate-400 animate-spin mx-auto" />
                    </td>
                  </tr>
                ) : data.length === 0 ? (
                  <tr>
                    <td colSpan={fields.length + 2} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                      No entries found.
                    </td>
                  </tr>
                ) : (
                  data.map((row, idx) => (
                    <tr
                      key={row._id}
                      className="hover:bg-slate-50 dark:hover:bg-[#161616] transition-colors group"
                    >
                      <td className="px-4 py-2.5 text-center text-slate-400 border-r border-slate-100 dark:border-slate-800 group-hover:text-slate-600 dark:group-hover:text-slate-300">
                        {idx + 1}
                      </td>
                      {fields.map((f) => (
                        <td 
                          key={f.name} 
                          onClick={(e) => startEdit(row, f, e)}
                          className="px-4 py-2.5 text-slate-700 dark:text-slate-300 border-r border-slate-100 dark:border-slate-800 last:border-0 max-w-xs truncate relative group/cell"
                        >
                          {renderCell(row, f)}
                        </td>
                      ))}
                      <td className="px-4 py-2.5 text-slate-400 text-xs whitespace-nowrap">
                        {new Date(row.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
