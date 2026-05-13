import { useState } from "react";
import { X, Mail, Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

type CreateTemplateModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (name: string, starter?: string) => Promise<void>;
};

const STARTERS = [
  { id: "blank", name: "Blank Slate", desc: "Start from scratch", html: "<h1>Hello {{name}}</h1>" },
  { id: "welcome", name: "Welcome Email", desc: "Greet new users", html: "<div style='font-family:sans-serif;padding:20px;'><h1 style='color:#3b82f6;'>Welcome to Nigris!</h1><p>We are excited to have you on board. Your journey starts here.</p></div>" },
  { id: "otp", name: "Verification OTP", desc: "Send security codes", html: "<div style='font-family:sans-serif;text-align:center;padding:40px;background:#f8fafc;'><h2 style='color:#1e293b;'>Security Verification</h2><p>Use the code below to verify your identity:</p><div style='font-size:32px;font-weight:bold;color:#3b82f6;letter-spacing:5px;margin:20px 0;'>{{otp}}</div><p style='color:#64748b;font-size:12px;'>This code will expire in 10 minutes.</p></div>" },
  { id: "reset", name: "Password Reset", desc: "Recovery link", html: "<div style='font-family:sans-serif;padding:20px;'><h2 style='color:#1e293b;'>Reset Your Password</h2><p>Click the button below to set a new password for your account.</p><a href='{{reset_url}}' style='display:inline-block;padding:12px 24px;background:#3b82f6;color:white;text-decoration:none;border-radius:8px;font-weight:bold;'>Reset Password</a></div>" },
];

export function CreateTemplateModal({ isOpen, onClose, onSubmit }: CreateTemplateModalProps) {
  const [name, setName] = useState("");
  const [starter, setStarter] = useState("blank");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSubmit(name.trim(), starter);
      setName("");
      setStarter("blank");
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">New Template</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#252525] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Template Name</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Welcome Email"
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-200"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>

          <div>
             <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Select a Starter</label>
             <div className="grid grid-cols-2 gap-3">
               {STARTERS.map(t => (
                 <button
                   key={t.id}
                   onClick={() => setStarter(t.id)}
                   className={`p-3 text-left rounded-2xl border-2 transition-all ${
                     starter === t.id 
                       ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10" 
                       : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                   }`}
                 >
                   <p className={`text-sm font-bold ${starter === t.id ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-slate-100"}`}>{t.name}</p>
                   <p className="text-[10px] text-slate-500">{t.desc}</p>
                 </button>
               ))}
             </div>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex justify-end space-x-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Cancel</button>
          <button
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create Template</span>
          </button>
        </div>
      </div>
    </div>
  );
}

type ConfirmDeleteModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
};

export function ConfirmDeleteModal({ isOpen, onClose, onConfirm, title, message }: ConfirmDeleteModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-slate-200 dark:border-white/10">
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex flex-col md:flex-row gap-3">
          <button onClick={onClose} className="flex-1 px-5 py-3 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-white/5 rounded-xl transition-colors">No, Keep it</button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-5 py-3 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-all shadow-lg shadow-red-600/20 flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Yes, Delete</span>
          </button>
        </div>
      </div>
    </div>
  );
}

type TestEmailModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSend: (email: string) => Promise<void>;
};

export function TestEmailModal({ isOpen, onClose, onSend }: TestEmailModalProps) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await onSend(email.trim());
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Send Test Email</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#252525] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">
          <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Recipient Address</label>
          <input
            autoFocus
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. dev@example.com"
            className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none dark:text-slate-200"
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex justify-end space-x-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Cancel</button>
          <button
            onClick={handleSend}
            disabled={loading || !email.trim()}
            className="px-6 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Send Test</span>
          </button>
        </div>
      </div>
    </div>
  );
}

type ComposeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSend: (to: string, subject: string, html: string) => Promise<void>;
  loading: boolean;
};

export function ComposeModal({ isOpen, onClose, onSend, loading }: ComposeModalProps) {
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [html, setHtml] = useState("");

  if (!isOpen) return null;

  const handleSend = async () => {
    if (!to || !subject || !html) return;
    await onSend(to, subject, html);
    if (!loading) {
      setTo("");
      setSubject("");
      setHtml("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300 border border-slate-200 dark:border-white/10">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Compose Email</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-[#252525] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Recipient</label>
            <input
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@example.com"
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject line"
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Content (HTML)</label>
            <textarea
              value={html}
              onChange={(e) => setHtml(e.target.value)}
              placeholder="<h1>Hello!</h1>"
              rows={8}
              className="w-full bg-slate-50 dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-blue-500 font-mono text-white"
            />
          </div>
        </div>
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 flex justify-end space-x-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">Cancel</button>
          <button
            onClick={handleSend}
            disabled={loading || !to || !subject || !html}
            className="px-6 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            <span>{loading ? "Sending..." : "Send via Nodemailer"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
