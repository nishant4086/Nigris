"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, Plus, Mail, Edit3, Trash2, Copy, Eye } from "lucide-react";
import { CreateTemplateModal, ConfirmDeleteModal } from "@/components/mail/TemplateModals";

interface Template {
  _id: string;
  name: string;
  slug: string;
  subject: string;
  html: string;
  variables: string[];
  type?: string;
}

export default function TemplatesList() {
  const params = useParams();
  const projectId = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Template | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      const { data } = await api.get(`/email-templates/${projectId}`);
      setTemplates(data);
    } catch {
      toast.error("Failed to fetch templates");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchTemplates();
    });
  }, [fetchTemplates]);

  const handleCreate = async (name: string, starterId?: string) => {
    const slug = name.toLowerCase().replace(/\s+/g, "-");
    
    // Find starter HTML
    const starters: Record<string, string> = {
      blank: "<h1>Hello {{name}}</h1>",
      welcome: "<div style='font-family:sans-serif;padding:20px;'><h1 style='color:#3b82f6;'>Welcome to Nigris!</h1><p>We are excited to have you on board.</p></div>",
      otp: "<div style='font-family:sans-serif;text-align:center;padding:40px;'><h2 style='color:#1e293b;'>Verification Code</h2><div style='font-size:32px;font-weight:bold;color:#3b82f6;'>{{otp}}</div></div>",
      reset: "<div style='font-family:sans-serif;padding:20px;'><h2 style='color:#1e293b;'>Password Reset</h2><p>Click below to reset:</p><a href='{{reset_url}}' style='display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;'>Reset Password</a></div>"
    };

    const html = starters[starterId || "blank"] || starters.blank;

    try {
      const { data } = await api.post(`/email-templates/${projectId}`, {
        name,
        slug,
        subject: "New Template",
        html,
      });
      toast.success("Template created");
      router.push(`/dashboard/projects/${projectId}/templates/${data._id}`);
    } catch {
      toast.error("Failed to create template");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/email-templates/${deleteTarget._id}`);
      toast.success("Template deleted");
      fetchTemplates();
    } catch {
      toast.error("Failed to delete template");
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleDuplicate = async (template: Template) => {
    try {
      await api.post(`/email-templates/${projectId}`, {
        name: `${template.name} (Copy)`,
        slug: `${template.slug}-copy-${Date.now().toString().slice(-4)}`,
        subject: template.subject,
        html: template.html,
        type: template.type,
      });
      toast.success("Template duplicated");
      fetchTemplates();
    } catch {
      toast.error("Failed to duplicate template");
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-100">
          Email Templates
        </h1>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center space-x-2 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Template</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <GlassCard key={template._id} className="p-6 hover:border-blue-500/50 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Mail className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                  onClick={() => router.push(`/dashboard/projects/${projectId}/templates/${template._id}`)}
                  className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button 
                   onClick={() => handleDuplicate(template)}
                   className="p-2 hover:bg-emerald-500/10 rounded-lg text-slate-400 hover:text-emerald-400"
                   title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button 
                   onClick={() => setDeleteTarget(template)}
                   className="p-2 hover:bg-red-500/10 rounded-lg text-slate-400 hover:text-red-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-white mb-1">{template.name}</h3>
            <p className="text-sm text-slate-400 font-mono mb-4">{template.slug}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {template.variables.slice(0, 3).map((v: string) => (
                <span key={v} className="px-2 py-1 bg-slate-800 text-slate-400 text-xs rounded border border-slate-700">
                  {v}
                </span>
              ))}
              {template.variables.length > 3 && <span className="text-xs text-slate-500">+{template.variables.length - 3} more</span>}
            </div>

            <button
              onClick={() => router.push(`/dashboard/projects/${projectId}/templates/${template._id}`)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm transition-all flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>Preview & Edit</span>
            </button>
          </GlassCard>
        ))}

        {templates.length === 0 && (
          <div className="col-span-full py-20 text-center">
            <div className="flex justify-center mb-4">
              <Mail className="w-12 h-12 text-slate-600" />
            </div>
            <h2 className="text-xl text-slate-400">No templates found</h2>
            <p className="text-slate-500 mb-6">Create your first reusable email template</p>
            <button onClick={() => setIsCreateOpen(true)} className="text-blue-400 hover:underline">Create Now</button>
          </div>
        )}
      </div>

      <CreateTemplateModal 
        isOpen={isCreateOpen} 
        onClose={() => setIsCreateOpen(false)} 
        onSubmit={handleCreate} 
      />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Template"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
