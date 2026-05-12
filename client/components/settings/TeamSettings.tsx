"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Users, FolderGit2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function TeamSettings() {
  const [projects, setProjects] = useState<{ _id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/projects").then(res => setProjects(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Project Teams</h3>
          <p className="text-sm text-slate-500">Manage collaborative access for each of your projects.</p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {projects.map((project) => (
            <div key={project._id} className="p-6 flex items-center justify-between group hover:bg-slate-50/50 dark:hover:bg-[#1e1e1e] transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 border border-blue-100 dark:border-blue-900/30">
                  <FolderGit2 className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100">{project.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Owner Access</span>
                  </div>
                </div>
              </div>
              <Link 
                href={`/dashboard/projects/${project._id}/team`}
                className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              >
                Manage Team
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}

          {projects.length === 0 && (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-200 mx-auto mb-4" />
              <p className="text-sm font-bold text-slate-400">No projects found.</p>
              <p className="text-xs text-slate-500 mt-1">Create a project to start building a team.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
