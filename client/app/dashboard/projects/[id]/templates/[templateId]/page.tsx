"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, Save, ArrowLeft, Eye, Code, Terminal, Sparkles, Send } from "lucide-react";
import { TestEmailModal } from "@/components/mail/TemplateModals";

export default function TemplateEditor() {
  const { templateId } = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [isTestOpen, setIsTestOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const { register, handleSubmit, watch, reset, setValue } = useForm();

  const htmlContent = watch("html", "");
  const subject = watch("subject", "");

  const fetchTemplate = useCallback(async () => {
    try {
      const { data } = await api.get(`/email-templates/detail/${templateId}`);
      reset(data);
    } catch {
      toast.error("Failed to fetch template");
    } finally {
      setLoading(false);
    }
  }, [templateId, reset]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchTemplate();
    });
  }, [fetchTemplate]);

  const onSubmit = async (data: Record<string, unknown>) => {
    setSaving(true);
    try {
      await api.put(`/email-templates/${templateId}`, data);
      toast.success("Template saved");
    } catch {
      toast.error("Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async (to: string) => {
    setSendingTest(true);
    try {
      const variables: Record<string, string> = {};
      const matches = htmlContent.matchAll(/\{\{\s*(\w+)\s*\}\}/g);
      for (const match of matches) {
        variables[match[1]] = `[${match[1]}_test_value]`;
      }

      await api.post("/mail/test-send", {
        templateId,
        to,
        variables
      });
      toast.success("Test email sent!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  const renderPreview = (content: string) => {
    // Simple placeholder replacement for preview
    return content.replace(/\{\{\s*(\w+)\s*\}\}/g, (match, key) => {
      return `<span class="bg-blue-500/20 text-blue-400 px-1 rounded border border-blue-500/30 font-mono text-sm">${key}</span>`;
    });
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-[calc(100vh-80px)] flex flex-col space-y-4 p-4 lg:p-6">
      <div className="flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-white">Edit Template</h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewMode(!previewMode)}
            className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-all ${previewMode ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'}`}
          >
            {previewMode ? <Code className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            <span>{previewMode ? 'Code Editor' : 'Live Preview'}</span>
          </button>
          <button
            onClick={() => setIsTestOpen(true)}
            disabled={sendingTest}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center space-x-2 transition-all border border-slate-700"
          >
            {sendingTest ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>Send Test</span>
          </button>
          <button
            onClick={handleSubmit(onSubmit)}
            disabled={saving}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-lg flex items-center space-x-2 font-semibold transition-all shadow-lg"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Template</span>
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4 overflow-hidden">
        {/* Editor Section */}
        <div className={`flex-1 flex flex-col space-y-4 ${previewMode ? 'hidden lg:flex' : 'flex'}`}>
          <GlassCard className="p-4 flex flex-col space-y-4 border-slate-700/50">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Subject Line</label>
              <input
                {...register("subject", { required: true })}
                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                placeholder="Welcome to Nigris!"
              />
            </div>
            
            <div className="flex-1 flex flex-col space-y-2">
              <label className="text-xs font-medium text-slate-500 uppercase tracking-wider flex justify-between">
                <span>HTML Content</span>
                <span className="flex items-center space-x-1 text-blue-400 cursor-help" title="Use {{variable}} for dynamic content">
                  <Terminal className="w-3 h-3" />
                  <span>Variables Helper</span>
                </span>
              </label>
              <textarea
                {...register("html", { required: true })}
                className="flex-1 w-full bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm resize-none"
                placeholder="<h1>Hello {{name}}</h1>"
              />
              
              <div className="pt-2 flex flex-wrap gap-2">
                 <button 
                   type="button"
                   onClick={() => setValue("html", "<h1>Welcome, {{name}}!</h1>\n<p>We are glad to have you on board.</p>\n<div style='padding: 20px; background: #f3f4f6; border-radius: 8px;'>\n  Your verification code is: <strong>{{otp}}</strong>\n</div>")}
                   className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-700 transition-colors"
                 >
                   + Sample Verification
                 </button>
                 <button 
                   type="button"
                   onClick={() => setValue("html", "<h2 style='color: #2563eb;'>Password Reset Request</h2>\n<p>Hi {{name}},</p>\n<p>You requested a password reset. Click the link below to continue:</p>\n<a href='{{reset_link}}' style='display: inline-block; padding: 10px 20px; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;'>Reset Password</a>")}
                   className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-400 text-[10px] rounded border border-slate-700 transition-colors"
                 >
                   + Sample Reset
                 </button>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Preview Section */}
        <div className={`flex-1 flex flex-col ${previewMode ? 'flex' : 'hidden lg:flex'}`}>
           <GlassCard className="flex-1 flex flex-col overflow-hidden border-slate-700/50">
             <div className="p-3 border-b border-slate-700/50 bg-slate-800/30 flex justify-between items-center shrink-0">
                <div className="flex space-x-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/50" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                  <div className="w-3 h-3 rounded-full bg-green-500/50" />
                </div>
                <span className="text-xs text-slate-500 font-medium">Email Preview</span>
                <div className="w-10" />
             </div>
             
             <div className="bg-white text-slate-900 p-6 flex-1 overflow-auto">
                <div className="max-w-2xl mx-auto">
                   <div className="mb-6 pb-6 border-b border-slate-100">
                      <div className="text-sm text-slate-500 mb-1">Subject:</div>
                      <div className="text-lg font-semibold">{subject || '(No Subject)'}</div>
                   </div>
                   <div 
                      dangerouslySetInnerHTML={{ __html: renderPreview(htmlContent) }} 
                      className="prose prose-blue max-w-none"
                   />
                </div>
             </div>
           </GlassCard>
        </div>
      </div>
      
      <div className="shrink-0 flex items-center justify-center space-x-2 text-xs text-slate-500 bg-slate-900/50 py-2 rounded-lg border border-slate-800">
         <Sparkles className="w-3 h-3 text-amber-500" />
         <span>Pro-tip: Use <strong>{"{{variable_name}}"}</strong> to insert dynamic data from your SDK or API calls.</span>
      </div>

      <TestEmailModal 
        isOpen={isTestOpen} 
        onClose={() => setIsTestOpen(false)} 
        onSend={handleSendTest} 
      />
    </div>
  );
}
