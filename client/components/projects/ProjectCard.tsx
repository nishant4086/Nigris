import Link from "next/link";
import { FolderGit2, Trash2, Settings, ArrowRight, Database, Users } from "lucide-react";

export type Project = {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  collectionsCount?: number;
};

type ProjectCardProps = {
  project: Project;
  onDelete: (id: string) => void;
};

export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    <div className="group relative bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
      
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
          <FolderGit2 className="w-6 h-6" />
        </div>
        
        {/* Hover Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
          <Link 
            href={`/dashboard/projects/${project._id}/team`}
            className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Team Management"
          >
            <Users className="w-4 h-4" />
          </Link>
          <Link 
            href={`/dashboard/collections?project=${project._id}`}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-[#252525] rounded-lg transition-colors"
            title="Manage Collections"
          >
            <Settings className="w-4 h-4" />
          </Link>
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(project._id);
            }}
            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Delete Project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0">
        <div className="block focus:outline-none">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
            {project.name}
          </h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {project.description || "No description provided for this project."}
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 px-2 py-1 rounded-md">
            <Database className="w-3.5 h-3.5 text-slate-400" />
            {project.collectionsCount || 0} Collections
          </div>
        </div>
        {project.createdAt && (
          <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            {new Date(project.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Invisible overlay link to make whole card clickable, except where other buttons exist */}
      <div className="absolute inset-0 z-10 pointer-events-none rounded-2xl ring-1 ring-inset ring-transparent group-focus-within:ring-blue-500 transition-shadow"></div>
    </div>
  );
}
