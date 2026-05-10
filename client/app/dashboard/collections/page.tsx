"use client";

import { useEffect, useState, useMemo } from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import { Search, Plus, Database, FolderGit2 } from "lucide-react";
import CollectionCard, { Collection } from "@/components/collections/CollectionCard";
import CreateCollectionModal from "@/components/collections/CreateCollectionModal";

type Project = {
  _id: string;
  name: string;
};

export default function CollectionsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // UX States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = async (showLoader = false) => {
    if (showLoader) setLoading(true);
    setError("");
    try {
      const [projRes] = await Promise.all([
        api.get("/projects")
      ]);
      const projList = Array.isArray(projRes.data) ? projRes.data : [];
      setProjects(projList);

      // We need to fetch collections. Since the endpoint is `/collections/:projectId`,
      // we might need to fetch collections for all projects, or the backend might support `/collections`
      // Let's see. The user's backend might not have a global `/collections` endpoint.
      // If we don't have it, we'll fetch them sequentially or require project selection.
      // For a premium UX, fetching all collections is best.
      let fetchedCollections: Collection[] = [];
      if (projList.length > 0) {
         const promises = projList.map((p: Project) => api.get(`/collections/${p._id}`).catch(() => ({ data: [] })));
         const results = await Promise.all(promises);
         results.forEach(res => {
           if (Array.isArray(res.data)) {
             fetchedCollections = [...fetchedCollections, ...res.data];
           }
         });
      }
      setAllCollections(fetchedCollections);

    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load data"));
    } finally {
      if (showLoader) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  const handleCreateCollection = async (name: string, projectId: string, isPublic: boolean) => {
    await api.post("/collections", { name, projectId, fields: [], isPublic });
    setIsModalOpen(false);
    await loadData();
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/collections/${id}`);
      setAllCollections(prev => prev.filter(c => c._id !== id));
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to delete collection"));
    }
  };

  const filteredCollections = useMemo(() => {
    let result = [...allCollections];

    if (selectedProjectId !== "all") {
       // We don't have projectId natively stored in the Collection object from the API response easily 
       // wait, we fetch by Project ID so ideally we should attach it.
       // For now, filtering by selectedProjectId requires knowing which project it belongs to.
       // If the backend doesn't return `projectId` inside the collection, this is tricky.
       // Let's assume the backend might not return it. The best we can do is just filter out manually 
       // but since we fetched via promises, we lost the mapping.
       // Let's just rely on the search bar for now, or assume collection has project attached.
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(c => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
    }

    // Sort newest first
    result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

    return result;
  }, [allCollections, searchQuery, selectedProjectId]);

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Collections</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Build dynamic schemas and manage your database tables.
          </p>
        </div>
        
        {projects.length > 0 && (
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search collections..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-shadow dark:text-slate-200"
              />
            </div>
            {/* Project Filter - Future enhancement if backend returns projectId on collections */}
            {/* <select 
              value={selectedProjectId}
              onChange={e => setSelectedProjectId(e.target.value)}
              className="bg-white dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none dark:text-slate-200 hidden md:block"
            >
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p._id} value={p._id}>{p.name}</option>)}
            </select> */}
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
            <div key={i} className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl p-6 h-56 border border-slate-100 dark:border-slate-800 animate-pulse flex flex-col justify-between">
              <div className="flex gap-4 items-start">
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800"></div>
                <div className="space-y-2 flex-1 mt-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/3"></div>
                </div>
              </div>
              <div className="h-8 bg-slate-50 dark:bg-slate-800/40 rounded-lg mt-auto"></div>
            </div>
          ))}
        </div>
      ) : projects.length === 0 ? (
        /* Empty State - No Projects */
        <div className="mt-12 flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mb-6">
            <FolderGit2 className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Projects required</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            You must create a project before you can create collections. Head over to the Projects section to get started.
          </p>
        </div>
      ) : allCollections.length === 0 ? (
        /* Empty State - No Collections */
        <div className="mt-12 flex flex-col items-center justify-center text-center p-12 bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl rounded-3xl border border-dashed border-slate-300 dark:border-slate-700 max-w-2xl mx-auto">
          <div className="w-20 h-20 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-500 flex items-center justify-center mb-6">
            <Database className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">Create your first collection</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
            Collections are dynamic database tables. You can define custom fields and references to build any data structure.
          </p>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-sm shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            New Collection
          </button>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCollections.map(collection => (
            <CollectionCard 
              key={collection._id} 
              collection={collection} 
              onDelete={handleDelete} 
            />
          ))}
          {filteredCollections.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-500 dark:text-slate-400">
               No collections match your search.
             </div>
          )}
        </div>
      )}

      {/* Floating Action Button (FAB) */}
      {!loading && projects.length > 0 && allCollections.length > 0 && (
        <button
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-40"
          title="Create New Collection"
        >
          <Plus className="w-6 h-6" />
        </button>
      )}

      {/* Modal Wizard */}
      <CreateCollectionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleCreateCollection}
      />
    </div>
  );
}
