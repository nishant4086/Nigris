"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  LayoutDashboard, 
  FolderGit2, 
  Database, 
  Key, 
  Activity, 
  CreditCard,
  Settings,
  Mail,
  X,
  Command as CommandIcon,
  ChevronRight
} from "lucide-react";
import { api } from "@/lib/api";

type SearchResult = {
  id: string;
  name: string;
  href: string;
  icon: any;
  category: string;
};

export default function CommandPalette({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const staticResults: SearchResult[] = [
    { id: "dashboard", name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Services" },
    { id: "projects", name: "All Projects", href: "/dashboard/projects", icon: FolderGit2, category: "Services" },
    { id: "collections", name: "Collections", href: "/dashboard/collections", icon: Database, category: "Services" },
    { id: "api-keys", name: "API Keys", href: "/dashboard/api-keys", icon: Key, category: "Services" },
    { id: "usage", name: "Usage Analytics", href: "/dashboard/usage", icon: Activity, category: "Services" },
    { id: "plans", name: "Plans & Pricing", href: "/dashboard/plans", icon: CreditCard, category: "Services" },
    { id: "settings", name: "Account Settings", href: "/dashboard/settings", icon: Settings, category: "Services" },
    { id: "templates", name: "Mail Templates", href: "/dashboard/templates", icon: Mail, category: "Services" },
  ];

  useEffect(() => {
    if (isOpen) {
      api.get("/projects").then(res => setProjects(res.data || [])).catch(() => {});
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      setResults(staticResults);
      return;
    }

    const filteredStatic = staticResults.filter(s => s.name.toLowerCase().includes(q));
    const filteredProjects = projects
      .filter(p => p.name.toLowerCase().includes(q))
      .map(p => ({
        id: p._id,
        name: p.name,
        href: `/dashboard/projects/${p._id}/smtp`,
        icon: FolderGit2,
        category: "Projects"
      }));

    setResults([...filteredStatic, ...filteredProjects]);
    setSelectedIndex(0);
  }, [query, projects]);

  const handleSelect = useCallback((result: SearchResult) => {
    router.push(result.href);
    onClose();
  }, [router, onClose]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % results.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
      } else if (e.key === "Enter") {
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, results, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#0f172a] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-white/10 animate-in zoom-in-95 duration-200">
        <div className="relative flex items-center border-b border-slate-100 dark:border-white/5 p-4">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            autoFocus
            type="text"
            placeholder="Search services, projects, or settings..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 text-lg placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-100 dark:bg-white/5 rounded-md">
            <span className="text-[10px] font-bold text-slate-500">ESC</span>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-slate-500 text-sm">No results found for "{query}"</p>
            </div>
          ) : (
            <div className="space-y-4 pb-2">
              {["Services", "Projects"].map(category => {
                const catResults = results.filter(r => r.category === category);
                if (catResults.length === 0) return null;

                return (
                  <div key={category}>
                    <p className="px-3 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{category}</p>
                    <div className="space-y-1">
                      {catResults.map((result) => {
                        const globalIndex = results.indexOf(result);
                        const isSelected = globalIndex === selectedIndex;
                        const Icon = result.icon;

                        return (
                          <button
                            key={result.id}
                            onClick={() => handleSelect(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                              isSelected 
                                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5"
                            }`}
                          >
                            <div className={`p-2 rounded-lg ${isSelected ? "bg-white/20" : "bg-slate-100 dark:bg-white/5 text-slate-500"}`}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <div className="flex-1 text-left">
                              <p className={`text-sm font-bold ${isSelected ? "text-white" : "text-slate-900 dark:text-slate-100"}`}>{result.name}</p>
                              <p className={`text-[10px] ${isSelected ? "text-blue-100" : "text-slate-500"}`}>{result.href}</p>
                            </div>
                            {isSelected && <ChevronRight className="w-4 h-4 text-blue-100" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <div className="flex gap-4">
            <span className="flex items-center gap-1"><ChevronRight className="w-3 h-3 rotate-90" /> Select</span>
            <span className="flex items-center gap-1"><CommandIcon className="w-3 h-3" /> Enter to Open</span>
          </div>
          <span>Nigris Search</span>
        </div>
      </div>
    </div>
  );
}
