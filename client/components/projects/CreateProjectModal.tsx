import { useState } from "react";
import { X, FolderPlus, Loader2, LayoutTemplate, CheckCircle2 } from "lucide-react";

type CreateProjectModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, description: string, template: string) => Promise<void>;
};

const TEMPLATES = [
  { id: "blank", name: "Blank Project", desc: "Start from scratch with no collections." },
  { id: "blog", name: "Blog / CMS", desc: "Includes Posts, Authors, and Categories collections." },
  { id: "crm", name: "Basic CRM", desc: "Includes Customers, Deals, and Notes collections." },
  { id: "ecommerce", name: "E-Commerce", desc: "Includes Products, Orders, and Customers." },
];

export default function CreateProjectModal({ isOpen, onClose, onSubmit }: CreateProjectModalProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [template, setTemplate] = useState("blank");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 1 && !name.trim()) {
      setError("Project name is required.");
      return;
    }
    setError("");
    setStep(step + 1);
  };

  const handleBack = () => {
    setError("");
    setStep(step - 1);
  };

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      await onSubmit(name.trim(), description.trim(), template);
      // Reset state after successful submit
      setTimeout(() => {
        setStep(1);
        setName("");
        setDescription("");
        setTemplate("blank");
      }, 300); // Wait for modal close animation
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || "Failed to create project.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-xl rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FolderPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Create Project</h2>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Step {step} of 3</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            disabled={saving}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#252525] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 md:p-8 min-h-[300px]">
          {error && (
            <div className="mb-6 p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Project Details</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 -mt-3 mb-4">Give your new workspace a name and description.</p>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Project Name <span className="text-red-500">*</span></label>
                <input
                  autoFocus
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corp App"
                  className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all dark:text-slate-200"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Description (Optional)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brief context about this project..."
                  rows={3}
                  className="w-full bg-slate-50 dark:bg-slate-950/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:bg-white dark:focus:bg-[#111111] focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none dark:text-slate-200"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Select Template</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 -mt-3 mb-4">Start faster with pre-built collections or start from scratch.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTemplate(t.id)}
                    className={`text-left p-4 rounded-2xl border-2 transition-all ${
                      template === t.id 
                        ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 ring-4 ring-blue-500/10" 
                        : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#202020]"
                    }`}
                  >
                    <LayoutTemplate className={`w-6 h-6 mb-3 ${template === t.id ? "text-blue-500" : "text-slate-400"}`} />
                    <h4 className={`font-bold ${template === t.id ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-slate-100"}`}>{t.name}</h4>
                    <p className={`text-xs mt-1 ${template === t.id ? "text-blue-600/80 dark:text-blue-400/80" : "text-slate-500"}`}>{t.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center py-6">
              <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-500 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Ready to create!</h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                You are about to create <strong>{name}</strong> using the <strong>{TEMPLATES.find(t => t.id === template)?.name}</strong> template.
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 backdrop-blur-md flex items-center justify-between">
          <button
            onClick={step === 1 ? onClose : handleBack}
            disabled={saving}
            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-[#252525] rounded-xl transition-colors disabled:opacity-50"
          >
            {step === 1 ? "Cancel" : "Back"}
          </button>
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-sm shadow-blue-600/20"
            >
              Next Step
            </button>
          ) : (
            <button
              onClick={handleCreate}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-xl transition-colors shadow-sm shadow-blue-600/20 disabled:opacity-70"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Creating Project..." : "Create Project"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
