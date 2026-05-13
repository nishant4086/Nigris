"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, Mail, ArrowUpRight, FolderGit2 } from "lucide-react";
import Link from "next/link";

interface Template {
  _id: string;
  name: string;
  projectId: string;
  projectName: string;
  variables: string[];
  createdAt: string;
}

export default function GlobalTemplatesPage() {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data: projects } = await api.get("/projects");
      const templatePromises = projects.map((p: { _id: string }) => api.get(`/email-templates/${p._id}`));
      const templateResults = await Promise.all(templatePromises);

      const allTemplates: Template[] = templateResults.flatMap((res, index) => {
        return res.data.map((t: Record<string, unknown>) => ({
          ...t,
          projectName: projects[index].name,
          projectId: projects[index]._id
        } as Template));
      });

      setTemplates(allTemplates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchTemplates();
    });
  }, [fetchTemplates]);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div>
        <h1 className="text-4xl font-black dark:text-white text-black tracking-tight">Email Templates</h1>
        <p className="text-slate-400 mt-2">Manage and design your transactional email templates across all projects.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <GlassCard key={template._id} className="p-6 group hover:border-emerald-500/50 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/10 rounded-xl">
                <Mail className="w-6 h-6 text-emerald-400" />
              </div>
              <Link
                href={`/dashboard/projects/${template.projectId}/templates/${template._id}`}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
              >
                <ArrowUpRight className="w-5 h-5" />
              </Link>
            </div>

            <h3 className="text-lg font-bold text-black dark:text-white  mb-1">{template.name}</h3>

            <div className="flex items-center space-x-2 text-xs text-slate-500 mb-4">
              <FolderGit2 className="w-3 h-3" />
              <span>{template.projectName}</span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {template.variables.map((v) => (
                <span key={v} className="px-2 py-1 dark:bg-slate-900/50 text-slate-400 text-[10px] uppercase tracking-wider rounded border border-slate-800">
                  {v}
                </span>
              ))}
              {template.variables.length === 0 && <span className="text-xs text-slate-600 italic">No variables</span>}
            </div>

            <Link
              href={`/dashboard/projects/${template.projectId}/templates/${template._id}`}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/20"
            >
              <Mail className="w-4 h-4" />
              <span>Design Template</span>
            </Link>
          </GlassCard>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full py-24 text-center glass-card border-dashed border-slate-800 rounded-3xl">
            <Mail className="w-16 h-16 text-slate-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-400">No templates found</h2>
            <p className="text-slate-500 mt-2 mb-8">You haven&apos;t created any templates yet. Go to a project to start designing.</p>
            <Link href="/dashboard/projects" className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all">
              Browse Projects
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
