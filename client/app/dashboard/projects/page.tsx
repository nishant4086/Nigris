"use client";

import { useEffect, useState, useMemo } from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import { Search, Plus, FolderGit2, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import ProjectCard, { Project } from "@/components/projects/ProjectCard";
import CreateProjectModal from "@/components/projects/CreateProjectModal";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // UX States
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "name">("newest");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [limits, setLimits] = useState<any>(null);

  const loadProjects = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const res = await api.get("/projects");
      const list = Array.isArray(res.data) ? res.data : [];

      // Fetch collections count for each project
      const projectsWithCounts = await Promise.all(
        list.map(async (project) => {
          try {
            const collectionsRes = await api.get(`/collections/${project._id}`);
            const collections = Array.isArray(collectionsRes.data) ? collectionsRes.data : [];
            return { ...project, collectionsCount: collections.length };
          } catch {
            return { ...project, collectionsCount: 0 };
          }
        })
      );

      setProjects(projectsWithCounts);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load projects"));
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects(true);
    api.get("/users/me/limits").then(res => setLimits(res.data)).catch(() => {});
  }, []);

  const atLimit = limits && limits.limits.maxProjects > 0 && limits.usage.projects >= limits.limits.maxProjects;

  const handleCreateProject = async (name: string, description: string, template: string) => {
    const res = await api.post("/projects", { name, description, template });
    setIsModalOpen(false);
    await loadProjects();
    api.get("/users/me/limits").then(res => setLimits(res.data)).catch(() => {});
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project? This will delete all associated collections and data.")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete project"));
    }
  };

  const filteredAndSortedProjects = useMemo(() => {
    let result = [...projects];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }

    result.sort((a, b) => {
      if (sortOrder === "name") {
        return a.name.localeCompare(b.name);
      }
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return sortOrder === "newest" ? dateB - dateA : dateA - dateB;
    });

    return result;
  }, [projects, searchQuery, sortOrder]);

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Projects</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your workspaces, group collections, and track usage.
          </p>
          {limits && limits.limits.maxProjects > 0 && (
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-2">
              {limits.usage.projects} / {limits.limits.maxProjects} projects used
              {atLimit && (
                <Link href="/dashboard/plans" className="ml-2 text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-0.5">
                  Upgrade <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}
            </p>
          )}
        </div>
        
        {projects.length > 0 && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="glass-input w-full pl-9 pr-4 py-2 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-shadow dark:text-slate-200"
              />
            </div>
            <select 
              value={sortOrder}
              onChange={e => setSortOrder(e.target.value as any)}
              className="glass-select rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-200"
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-8 rounded-xl border border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-900/30 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Main Content Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="glass-card rounded-2xl p-6 h-48 animate-pulse flex flex-col justify-between">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                <div className="space-y-2 flex-1 mt-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-full"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-50 dark:bg-slate-800/40 rounded-lg mt-auto"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State */
        <div className="mt-12 flex flex-col items-center justify-center text-center p-12 glass-card border border-dashed border-slate-300 dark:border-slate-700 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mb-6">
            <FolderGit2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create your first project</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            Projects help you organize collections and API keys. Start by creating a blank project or use one of our templates.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm shadow-blue-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProjects.map(project => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              onDelete={handleDelete} 
            />
          ))}
          {filteredAndSortedProjects.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
               No projects match your search.
             </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      {!loading && projects.length > 0 && !atLimit && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
          title="Create New Project"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal Wizard */}
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateProject}
      />
    </div>
  );
}
