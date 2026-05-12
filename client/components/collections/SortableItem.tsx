import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

type SortableItemProps = {
  id: string;
  children: React.ReactNode;
};

export default function SortableItem({ id, children }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    position: "relative" as const,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`group flex items-start gap-2 p-2 -mx-2 rounded-xl border border-transparent transition-colors ${
        isDragging 
          ? "bg-white dark:bg-slate-800/60 shadow-xl border-slate-200 dark:border-slate-700 opacity-90 ring-2 ring-indigo-500/20" 
          : "hover:bg-slate-50 dark:hover:bg-[#1a1a1a]"
      }`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className={`mt-2 p-1 text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400 cursor-grab active:cursor-grabbing rounded transition-opacity ${isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
