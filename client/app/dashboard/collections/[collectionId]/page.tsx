"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { ReferenceOption, FieldValue } from "@/lib/types";
import { Plus, ArrowLeft, FileText, Search, GripVertical, Edit3, Trash2, Save, X, Eye, Pencil } from "lucide-react";
import FieldRenderer from "@/components/collections/FieldRenderer";
import AddFieldModal from "@/components/collections/AddFieldModal";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Field = { name: string; type: string; required: boolean; unique?: boolean; ref?: string };
type Entry = { _id: string; createdAt?: string } & Record<string, unknown>;

export default function CollectionDataPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;

  const [collectionName, setCollectionName] = useState("");
  const [projectId, setProjectId] = useState<string>("");
  const [fields, setFields] = useState<Field[]>([]);
  const [data, setData] = useState<Entry[]>([]);
  const [refData, setRefData] = useState<Record<string, ReferenceOption[]>>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [limit] = useState(20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modals
  const [isAddFieldOpen, setIsAddFieldOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [isModalEditing, setIsModalEditing] = useState(false);
  const [fieldsOrder, setFieldsOrder] = useState<string[]>([]);
  const [isReorderMode, setIsReorderMode] = useState(false);

  // Fetch collection metadata
  useEffect(() => {
    if (!collectionId) return;
    api.get(`/collections/detail/${collectionId}`)
      .then((res) => {
        const loadedFields = (res.data.fields || []) as Field[];
        setCollectionName(res.data.name);
        setProjectId(res.data.project);
        setFields(loadedFields);
        setFieldsOrder(loadedFields.map((f) => f.name));
      })
      .catch(() => setError("Failed to load collection info"));
  }, [collectionId]);

  // Fetch reference options
  useEffect(() => {
    const fetchRefs = async () => {
      const refs = fields.filter((f) => f.type === "reference" && f.ref);
      for (const r of refs) {
        if (!r.ref || refData[r.ref]) continue;
        try {
          const res = await api.get(`/data/${r.ref}?limit=100`);
          setRefData((prev) => ({ ...prev, [r.ref as string]: res.data.data || [] }));
        } catch (err) {
          console.error(`Failed to load reference data for ${r.name}`, err);
        }
      }
    };
    fetchRefs();
  }, [fields, refData]);

  const loadData = useCallback(() => {
    setLoading(true);
    setError("");
    api.get(`/data/${collectionId}?page=${page}&limit=${limit}`)
      .then((res) => {
        setData(res.data.data || []);
        setTotal(res.data.total || 0);
        setPages(res.data.pages || 1);
      })
      .catch((err: unknown) => {
        setError(getApiErrorMessage(err, "Failed to load data"));
        setData([]);
      })
      .finally(() => setLoading(false));
  }, [collectionId, page, limit]);

  useEffect(() => {
    if (!collectionId) return;
    Promise.resolve().then(() => {
      loadData();
    });
  }, [collectionId, loadData]);

  const handleAddField = async (newField: Field) => {
    // Optimistically add the field
    const updatedFields = [...fields, newField];
    setFields(updatedFields);
    setIsAddFieldOpen(false);

    try {
      await api.patch(`/collections/${collectionId}`, {
        fields: updatedFields
      });
      // reload collection detail to confirm
      const res = await api.get(`/collections/detail/${collectionId}`);
      setFields(res.data.fields || []);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to update schema"));
      setFields(fields); // revert
    }
  };

  const handleCreateEmptyEntry = async () => {
    try {
      // Create empty entry
      const payload: Record<string, unknown> = {};
      fields.forEach(f => {
        if (f.type === "boolean") payload[f.name] = false;
        else if (f.type === "number") payload[f.name] = 0;
        else payload[f.name] = "";
      });
      
      const res = await api.post(`/data/${collectionId}`, payload);
      // Prepend to list
      setData([res.data, ...data]);
      setTotal(prev => prev + 1);
      setEditingEntry(res.data);
      setIsModalEditing(true); // Open in edit mode for newly created entry
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to create entry. Ensure required fields are handled or wait for modal."));
    }
  };

  const handleInlineUpdate = (rowId: string, fieldName: string, newValue: unknown) => {
    setData(prev => prev.map(row =>
      row._id === rowId ? { ...row, [fieldName]: newValue } : row
    ));
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleFieldDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = fieldsOrder.indexOf(active.id as string);
      const newIndex = fieldsOrder.indexOf(over.id as string);
      const newOrder = arrayMove(fieldsOrder, oldIndex, newIndex);
      setFieldsOrder(newOrder);

      try {
        const reorderedFields = newOrder.map(name => fields.find(f => f.name === name));
        await api.patch(`/collections/${collectionId}`, { fields: reorderedFields });
      } catch (err) {
        alert(getApiErrorMessage(err, "Failed to save field order"));
        setFieldsOrder(fieldsOrder); // revert
      }
    }
  };

  const handleSaveEntry = async () => {
    if (!editingEntry) return;
    try {
      await api.put(`/data/${editingEntry._id}`, editingEntry);
      setData(prev => prev.map(d => d._id === editingEntry._id ? editingEntry : d));
      setIsModalEditing(false);
      setEditingEntry(null);
      alert("Entry updated successfully");
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to save entry"));
    }
  };

  const handleDeleteEntry = async (entryId: string) => {
    if (!confirm("Delete this entry?")) return;
    try {
      await api.delete(`/data/${entryId}`);
      setData(prev => prev.filter(d => d._id !== entryId));
      setTotal(prev => prev - 1);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete entry"));
    }
  };

  const orderedFields = useMemo(() => {
    const fieldMap = new Map(fields.map(f => [f.name, f]));
    return fieldsOrder.map(name => fieldMap.get(name)).filter(Boolean) as typeof fields;
  }, [fields, fieldsOrder]);

  // Sortable Field Header Component
  function SortableFieldHeader({ field }: { field: Field }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useSortable({
      id: field.name,
      disabled: !isReorderMode
    });

    const style = {
      transform: CSS.Transform.toString(transform),
      zIndex: isDragging ? 10 : 1,
    };

    return (
      <th
        key={field.name}
        ref={setNodeRef}
        style={style}
        className={`px-4 py-3 font-medium text-slate-600 dark:text-slate-300 border-r border-slate-200 dark:border-slate-800 min-w-[150px] ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="flex items-center gap-2">
          {isReorderMode && (
            <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600">
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <span>{field.name}</span>
          {field.required && <span className="text-red-400">*</span>}
        </div>
      </th>
    );
  }

  return (
    <div className="pb-24 animate-in fade-in duration-500 max-w-full overflow-x-hidden">
      {/* Header Area */}
      <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <button
            onClick={() => router.push("/dashboard/collections")}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-3 font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Collections
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              {collectionName || "Loading..."}
            </h1>
            <span className="bg-slate-100 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 text-xs font-bold px-2 py-1 rounded-md">
              {total} Entries
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter entries..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full md:w-64 pl-9 pr-4 py-2 bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow dark:text-slate-200"
            />
          </div>
          <button
            onClick={() => setIsReorderMode(!isReorderMode)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-xl transition-all ${isReorderMode ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-[#2a2a2a]'}`}
          >
            <GripVertical className="w-4 h-4" />
            {isReorderMode ? 'Done' : 'Reorder'}
          </button>
          <button
            onClick={handleCreateEmptyEntry}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Airtable-like Grid */}
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col min-h-[500px]">
        {loading ? (
          <div className="p-8 flex items-center justify-center text-slate-400">Loading data...</div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleFieldDragEnd}
            >
              <table className="w-full text-sm text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                    <th className="w-12 px-4 py-3 font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 sticky left-0 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md z-10 text-center">#</th>
                    <th className="w-12 px-4 py-3 font-medium text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-800 text-center"></th>
                    <SortableContext
                      items={fieldsOrder}
                      strategy={horizontalListSortingStrategy}
                    >
                      {orderedFields.map(f => (
                        <SortableFieldHeader key={f.name} field={f} />
                      ))}
                    </SortableContext>
                    {/* Add Field Column Header */}
                    <th className="px-4 py-3 font-medium border-slate-200 dark:border-slate-800 w-[100px]">
                      <button
                        onClick={() => setIsAddFieldOpen(true)}
                        className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                      >
                        <Plus className="w-4 h-4" /> Add Field
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={orderedFields.length + 3} className="px-4 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center justify-center">
                          <FileText className="w-10 h-10 text-slate-300 mb-3" />
                          <p>No entries found. Click &quot;New&quot; to add one.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    data.map((row, idx) => (
                      <tr key={row._id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-[#202020]/50 transition-colors group">
                        {/* Row Number */}
                        <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-800 text-slate-400 text-xs text-center sticky left-0 bg-white dark:bg-slate-900/50 backdrop-blur-xl group-hover:bg-slate-50/50 dark:group-hover:bg-[#202020]/50 z-10 transition-colors">
                          {(page - 1) * limit + idx + 1}
                        </td>

                        {/* Actions Button */}
                        <td className="px-4 py-2 border-r border-slate-100 dark:border-slate-800 text-center">
                          <button
                            onClick={() => {
                              setEditingEntry({ ...row });
                              setIsModalEditing(false); // Read-only by default
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"
                            title="View / Edit Entry"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>

                        {/* Data Cells */}
                        {orderedFields.map(f => (
                          <td key={f.name} className="px-4 py-2 border-r border-slate-100 dark:border-slate-800">
                            <FieldRenderer
                              field={f}
                              value={row[f.name] as FieldValue}
                              rowId={row._id}
                              collectionId={collectionId}
                              onUpdate={handleInlineUpdate}
                              refData={refData}
                              isReadOnly={true}
                            />
                          </td>
                        ))}

                        {/* Empty pad column */}
                        <td></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </DndContext>
          </div>
        )}

        {/* Footer Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-md mt-auto">
            <span className="text-sm text-slate-500">
              Showing page {page} of {pages}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-40 hover:bg-white dark:hover:bg-[#252525] transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(pages, p + 1))}
                disabled={page >= pages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-sm font-medium disabled:opacity-40 hover:bg-white dark:hover:bg-[#252525] transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <AddFieldModal
        isOpen={isAddFieldOpen}
        onClose={() => setIsAddFieldOpen(false)}
        onAdd={handleAddField}
        projectId={projectId}
      />

      {/* Edit Entry Modal */}
      {editingEntry && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 backdrop-blur-xl z-10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {isModalEditing ? "Edit Entry" : "Entry Details"}
              </h2>
              <div className="flex items-center gap-2">
                {!isModalEditing && (
                  <button
                    onClick={() => setIsModalEditing(true)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit Mode
                  </button>
                )}
                <button
                  onClick={() => setEditingEntry(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {orderedFields.map(f => (
                <div key={f.name} className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    {f.name}
                    {f.required && <span className="text-red-400">*</span>}
                  </label>
                  <FieldRenderer
                    field={f}
                    value={editingEntry[f.name] as FieldValue}
                    rowId={editingEntry._id}
                    collectionId={collectionId}
                    onUpdate={(_, fieldName, val) => setEditingEntry({ ...editingEntry, [fieldName]: val })}
                    refData={refData}
                    isReadOnly={!isModalEditing}
                  />
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 flex items-center justify-between p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md gap-3 z-10">
              {isModalEditing && (
                <button
                  onClick={() => handleDeleteEntry(editingEntry._id)}
                  className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center gap-2 font-medium"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              )}
              <div className="flex gap-3 ml-auto">
                {!isModalEditing ? (
                  <button
                    onClick={() => setEditingEntry(null)}
                    className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                  >
                    Close
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => setIsModalEditing(false)}
                      className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEntry}
                      className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 font-semibold shadow-sm shadow-indigo-600/20"
                    >
                      <Save className="w-4 h-4" />
                      Save Changes
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
