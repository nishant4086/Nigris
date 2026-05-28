"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import Link from "next/link";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, Server, ArrowRight, ShieldCheck, ShieldAlert, Plus } from "lucide-react";

interface Project {
  _id: string;
  name: string;
  description?: string;
}

interface SmtpStatus {
  projectId: string;
  configured: boolean;
  provider?: string;
  host?: string;
  fromEmail?: string;
}

export default function GlobalSmtpPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusMap, setStatusMap] = useState<Record<string, SmtpStatus>>({});
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      const { data: fetchedProjects } = await api.get("/projects");
      setProjects(fetchedProjects || []);

      // Fetch SMTP status for each project in parallel
      const statuses = await Promise.all(
        (fetchedProjects || []).map(async (project: Project) => {
          try {
            const { data } = await api.get(`/smtp/${project._id}`);
            const activeConfig = data?.find((c: { isActive: boolean }) => c.isActive);
            return {
              projectId: project._id,
              configured: !!activeConfig,
              provider: activeConfig?.provider,
              host: activeConfig?.host,
              fromEmail: activeConfig?.fromEmail,
            };
          } catch {
            return { projectId: project._id, configured: false };
          }
        })
      );

      const map: Record<string, SmtpStatus> = {};
      statuses.forEach((s) => {
        map[s.projectId] = s;
      });
      setStatusMap(map);
    } catch {
      toast.error("Failed to load workspace data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => {
      loadData();
    });
  }, [loadData]);

  if (loading) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900 dark:text-slate-100">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl bg-gradient-to-r from-slate-900 via-slate-750 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
          SMTP Server Configurations
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2">
          Manage outgoing mail servers (SMTP) for transactional email delivery across your workspaces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => {
          const status = statusMap[project._id] || { projectId: project._id, configured: false };
          return (
            <GlassCard key={project._id} className="p-6 flex flex-col justify-between h-64 border-slate-100 dark:border-white/5 group hover:border-indigo-500/30 transition-all duration-300">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-500/10 text-indigo-655 dark:text-indigo-400 rounded-xl">
                    <Server className="w-6 h-6" />
                  </div>
                  {status.configured ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold bg-emerald-500/10 text-emerald-650 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Configured</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 px-2.5 py-1 rounded-full border border-slate-200 dark:border-white/10">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      <span>Not Setup</span>
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-1 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                  {project.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-4">
                  {project.description || "No description provided for this workspace."}
                </p>

                {status.configured && (
                  <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <p className="truncate"><span className="text-slate-400 dark:text-slate-500">Host:</span> {status.host}</p>
                    <p className="truncate"><span className="text-slate-400 dark:text-slate-500">Sender:</span> {status.fromEmail}</p>
                  </div>
                )}
              </div>

              <Link
                href={`/dashboard/projects/${project._id}/smtp`}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-100 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 transition-all flex items-center justify-center gap-1.5 mt-4"
              >
                <span>Configure SMTP Settings</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </GlassCard>
          );
        })}

        {projects.length === 0 && (
          <div className="col-span-full py-24 text-center glass-card border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
            <Server className="w-16 h-16 text-slate-400 dark:text-slate-700 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-400 dark:text-slate-500">No workspaces found</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 mb-8">You need to create a project workspace before setting up SMTP servers.</p>
            <Link href="/dashboard/projects" className="px-6 py-3 bg-indigo-650 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all inline-flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Browse Projects</span>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
