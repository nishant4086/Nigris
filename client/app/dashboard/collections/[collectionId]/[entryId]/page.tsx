"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { ArrowLeft, Check, Copy, Trash2, Calendar, HardDrive } from "lucide-react";
import FieldRenderer from "@/components/collections/FieldRenderer";
import SortableItem from "@/components/collections/SortableItem";

// dnd-kit
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

type Field = { name: string; type: string; required: boolean; unique?: boolean; ref?: string };

export default function EntryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const collectionId = params.collectionId as string;
  const entryId = params.entryId as string;

  const [collectionName, setCollectionName] = useState("");
  const [fields, setFields] = useState<Field[]>([]);
  const [orderedFieldNames, setOrderedFieldNames] = useState<string[]>([]);
  const [entryData, setEntryData] = useState<any>(null);
  const [refData, setRefData] = useState<Record<string, any[]>>({});
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Fetch Collection and Entry Data
  useEffect(() => {
    if (!collectionId || !entryId) return;
    
    setLoading(true);
    Promise.all([
      api.get(`/collections/detail/${collectionId}`),
      api.get(`/data/detail/${collectionId}/${entryId}`)
    ]).then(([colRes, entryRes]) => {
      setCollectionName(colRes.data.name);
      
      const f = colRes.data.fields || [];
      setFields(f);
      
      // Load saved field order from localStorage or use default
      const savedOrder = localStorage.getItem(`nigris_field_order_${collectionId}`);
      if (savedOrder) {
        const parsed = JSON.parse(savedOrder);
        // Ensure all current fields are in the parsed list
        const currentNames = f.map((x: Field) => x.name);
        const validParsed = parsed.filter((name: string) => currentNames.includes(name));
        const missing = currentNames.filter((name: string) => !validParsed.includes(name));
        setOrderedFieldNames([...validParsed, ...missing]);
      } else {
        setOrderedFieldNames(f.map((x: Field) => x.name));
      }

      setEntryData(entryRes.data);
    }).catch(err => {
      setError(getApiErrorMessage(err, "Failed to load entry"));
    }).finally(() => {
      setLoading(false);
    });
  }, [collectionId, entryId]);

  // Fetch References
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
  }, [fields]);

  const handleUpdate = (rowId: string, fieldName: string, newValue: any) => {
    setEntryData((prev: any) => ({ ...prev, [fieldName]: newValue }));
  };

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setOrderedFieldNames((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newOrder = arrayMove(items, oldIndex, newIndex);
        localStorage.setItem(`nigris_field_order_${collectionId}`, JSON.stringify(newOrder));
        return newOrder;
      });
    }
  };

  const copyId = async () => {
    try {
      // Try modern Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(entryId);
      } else {
        // Fallback for non-HTTPS or older browsers
        const textArea = document.createElement("textarea");
        textArea.value = entryId;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy ID:", err);
      // Still show feedback even if it fails
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    try {
      await api.delete(`/data/${collectionId}/${entryId}`);
      router.push(`/dashboard/collections/${collectionId}`);
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete entry"));
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-slate-400 animate-pulse">Loading entry...</div>;
  }

  if (error) {
    return <div className="p-12 text-center text-red-500">{error}</div>;
  }

  // Generate primary title from first text field
  let entryTitle = "Untitled";
  if (entryData) {
    const titleField = fields.find(f => f.type === "text" || f.unique);
    if (titleField && entryData[titleField.name]) {
      entryTitle = entryData[titleField.name];
    }
  }

  return (
    <div className="pb-24 max-w-3xl mx-auto animate-in fade-in duration-500">
      <button
        onClick={() => router.push(`/dashboard/collections/${collectionId}`)}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100 transition-colors mb-8 font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Table
      </button>

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-4">
          {entryTitle}
        </h1>
        
        <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#202020] px-2 py-1 rounded-md">
            <HardDrive className="w-3.5 h-3.5" />
            Collection: {collectionName}
          </div>
          
          <button 
            onClick={copyId}
            className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#202020] hover:bg-slate-200 dark:hover:bg-[#2a2a2a] px-2 py-1 rounded-md transition-colors cursor-pointer"
            title="Copy ID"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
            {entryId.slice(0, 8)}...
          </button>
          
          {entryData?.createdAt && (
            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-[#202020] px-2 py-1 rounded-md">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(entryData.createdAt).toLocaleString()}
            </div>
          )}

          <div className="flex-1"></div>

          <button 
            onClick={handleDelete}
            className="flex items-center gap-1.5 text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/30 px-2 py-1 rounded-md transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Notion-style properties */}
      <div className="space-y-1 bg-white dark:bg-[#191919] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={orderedFieldNames} strategy={verticalListSortingStrategy}>
            {orderedFieldNames.map(fieldName => {
              const field = fields.find(f => f.name === fieldName);
              if (!field) return null;

              return (
                <SortableItem key={fieldName} id={fieldName}>
                  <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-8 py-2">
                    <div className="w-full md:w-1/3 pt-1">
                      <label className="text-sm font-semibold text-slate-500 dark:text-slate-400 capitalize flex items-center gap-2">
                        {field.name}
                        {field.required && <span className="text-red-400">*</span>}
                        {field.unique && <span className="text-[10px] text-indigo-500 uppercase bg-indigo-50 dark:bg-indigo-900/20 px-1 py-0.5 rounded">Unique</span>}
                      </label>
                    </div>
                    <div className="flex-1 min-w-0">
                      <FieldRenderer
                        field={field}
                        value={entryData[field.name]}
                        rowId={entryId}
                        collectionId={collectionId}
                        onUpdate={handleUpdate}
                        refData={refData}
                      />
                    </div>
                  </div>
                </SortableItem>
              );
            })}
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
}
