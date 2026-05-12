"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";
import { Database, Plus, Search, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useIsMounted } from "@/lib/hooks";

type Project = { _id: string; name: string };
type Collection = { _id: string; name: string; slug: string };

export default function WorkspaceSidebar() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const mounted = useIsMounted();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectId, setProjectId] = useState<string>("");
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // 🚀 Initial projects load
  useEffect(() => {
    let active = true;
    const loadProjects = async () => {
      try {
        const res = await api.get("/projects");
        const list = Array.isArray(res.data) ? res.data : [];
        if (!active) return;
        setProjects(list);
        if (list.length > 0 && !projectId) {
          setProjectId(list[0]._id);
        }
      } catch (err) {
        console.error("Failed to load projects", err);
      }
    };
    loadProjects();
    return () => { active = false; };
  }, [projectId]);

  // 📦 Load collections when project changes
  useEffect(() => {
    let active = true;
    const loadCollections = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const res = await api.get(`/collections/${projectId}`);
        if (active) setCollections(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load collections", err);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadCollections();
    return () => { active = false; };
  }, [projectId]);

  return (
    <div className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-xl flex flex-col h-full select-none hidden md:flex transition-all duration-300">
      {/* Workspace Header */}
      <div className="px-4 py-3 flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-[#202020] cursor-pointer transition-colors">
        <div className="w-5 h-5 bg-black dark:bg-white text-white dark:text-black rounded flex items-center justify-center text-xs font-bold">
          N
        </div>
        <select 
          value={projectId} 
          onChange={(e) => setProjectId(e.target.value)}
          className="bg-transparent font-medium text-sm text-slate-800 dark:text-slate-200 outline-none flex-1 cursor-pointer truncate"
        >
          {projects.length === 0 && <option value="">Loading...</option>}
          {projects.map(p => (
            <option key={p._id} value={p._id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div className="px-3 py-2 space-y-1 mt-2 border-b border-slate-200 dark:border-slate-800 pb-4">
        <button className="w-full flex items-center gap-2 px-2 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-[#2a2a2a] rounded transition-colors">
          <Search className="w-4 h-4" />
          Search
        </button>
        <Link href="/dashboard" className="w-full flex items-center gap-2 px-2 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-[#2a2a2a] rounded transition-colors">
          <Settings className="w-4 h-4" />
          Settings (Admin)
        </Link>
        {mounted && (
          <button 
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-full flex items-center gap-2 px-2 py-1 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-[#2a2a2a] rounded transition-colors"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            {theme === "dark" ? "Light Mode" : "Dark Mode"}
          </button>
        )}
      </div>

      <div className="mt-4 flex-1 overflow-y-auto px-3">
        <div className="group flex items-center justify-between px-2 py-1 text-xs font-semibold text-slate-500 dark:text-slate-500 uppercase tracking-wider">
          <span>Collections</span>
          <Link href={`/workspace/new?project=${projectId}`} className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-200 dark:hover:bg-[#2a2a2a] rounded p-0.5">
            <Plus className="w-3.5 h-3.5" />
          </Link>
        </div>
        
        <div className="mt-1 space-y-0.5">
          {loading ? (
            <div className="px-2 py-1 text-sm text-slate-400">Loading...</div>
          ) : collections.length === 0 ? (
            <div className="px-2 py-1 text-sm text-slate-400">No collections</div>
          ) : (
            collections.map(col => {
              const isActive = pathname.startsWith(`/workspace/${col._id}`);
              return (
                <Link
                  key={col._id}
                  href={`/workspace/${col._id}`}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${
                    isActive ? "bg-slate-200/70 dark:bg-[#2a2a2a] font-medium text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-[#202020]"
                  }`}
                >
                  <Database className={`w-4 h-4 ${isActive ? "text-indigo-500 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"}`} />
                  <span className="truncate flex-1">{col.name}</span>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
