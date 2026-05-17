"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, Send, Save, Trash2, CheckCircle2, XCircle, Mail as MailIcon, Pencil, X } from "lucide-react";
import { ConfirmDeleteModal, ComposeModal } from "@/components/mail/TemplateModals";

interface SmtpConfig {
  _id?: string;
  provider: string;
  host: string;
  port: number;
  secure: boolean;
  username: string;
  password?: string;
  fromName: string;
  fromEmail: string;
  isActive: boolean;
}

export default function SmtpSettings() {
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [configs, setConfigs] = useState<SmtpConfig[]>([]);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [sendingDirect, setSendingDirect] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { register, handleSubmit, reset, watch, getValues } = useForm();

  const fetchConfigs = useCallback(async () => {
    try {
      const { data } = await api.get(`/smtp/${projectId}`);
      setConfigs(data);
      if (data.length > 0) {
        reset(data[0]);
        setIsEditing(false); // Read-only by default if config exists
      } else {
        setIsEditing(true); // Edit mode if no config exists
      }
    } catch {
      toast.error("Failed to fetch SMTP settings");
    } finally {
      setLoading(false);
    }
  }, [projectId, reset]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchConfigs();
    });
  }, [fetchConfigs]);

  const onTest = async (data: Record<string, unknown>) => {
    setTesting(true);
    try {
      await api.post("/smtp/test", data);
      toast.success("SMTP Connection Successful!");
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "SMTP Connection Failed");
    } finally {
      setTesting(false);
    }
  };

  const onSubmit = async (data: Record<string, unknown>) => {
    try {
      if (data._id) {
        await api.put(`/smtp/${data._id}`, data);
        toast.success("SMTP Settings Updated");
      } else {
        await api.post(`/smtp/${projectId}`, data);
        toast.success("SMTP Settings Saved");
      }
      fetchConfigs();
    } catch {
      toast.error("Failed to save SMTP settings");
    }
  };

  const handleDelete = async () => {
    const configId = getValues("_id");
    if (!configId) return;

    try {
      await api.delete(`/smtp/${configId}`);
      toast.success("SMTP Configuration deleted");
      setConfigs([]);
      reset({ provider: "custom", host: "", port: 587, secure: false, username: "", password: "", fromName: "", fromEmail: "" });
      setIsEditing(true);
    } catch {
      toast.error("Failed to delete SMTP settings");
    } finally {
      setIsDeleteOpen(false);
    }
  };

  const handleSendDirect = async (to: string, subject: string, html: string) => {
    setSendingDirect(true);
    try {
      await api.post("/mail/send-direct", {
        projectId,
        to,
        subject,
        html
      });
      toast.success("Email sent successfully via Nodemailer!");
      setIsComposeOpen(false);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { error?: string } } };
      toast.error(err.response?.data?.error || "Failed to send email");
    } finally {
      setSendingDirect(false);
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-100">
          SMTP Settings
        </h1>
        {configs.length > 0 && (
          <button
            onClick={() => setIsComposeOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center space-x-2 transition-all shadow-lg shadow-emerald-500/20"
          >
            <MailIcon className="w-4 h-4" />
            <span>Compose Direct</span>
          </button>
        )}
      </div>

      <GlassCard className="p-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Provider</label>
              <select
                {...register("provider")}
                disabled={!isEditing}
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              >
                <option value="custom">Custom SMTP</option>
                <option value="gmail">Gmail</option>
                <option value="sendgrid">SendGrid</option>
                <option value="mailgun">Mailgun</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">SMTP Host</label>
              <input
                {...register("host", { required: true })}
                disabled={!isEditing}
                placeholder="smtp.example.com"
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Port</label>
              <input
                {...register("port", { required: true, valueAsNumber: true })}
                type="number"
                disabled={!isEditing}
                placeholder="587"
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="flex flex-col space-y-2 pt-6">
              <div className="flex items-center space-x-2">
                <input type="checkbox" {...register("secure")} disabled={!isEditing} id="secure" className={`w-4 h-4 rounded border-slate-700 bg-slate-900 ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`} />
                <label htmlFor="secure" className="text-sm font-medium text-slate-300">Use Secure Connection (SSL/TLS)</label>
              </div>
              <p className="text-xs text-slate-500 italic">
                Note: Use <b>Port 465</b> for SSL/TLS (Secure Checked). Use <b>Port 587</b> for STARTTLS (Secure Unchecked).
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <input
                {...register("username", { required: true })}
                disabled={!isEditing}
                placeholder="user@example.com"
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input
                {...register("password")}
                type="password"
                disabled={!isEditing}
                placeholder={!isEditing ? "•••••••• (Encrypted)" : "••••••••"}
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
              <p className="text-xs text-slate-500">Leave empty to keep existing password</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">From Name</label>
              <input
                {...register("fromName", { required: true })}
                disabled={!isEditing}
                placeholder="Nigris System"
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">From Email</label>
              <input
                {...register("fromEmail", { required: true })}
                disabled={!isEditing}
                placeholder="noreply@example.com"
                className={`w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white focus:ring-2 focus:ring-blue-500 outline-none ${!isEditing ? 'opacity-70 cursor-not-allowed' : ''}`}
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-800">
            <div>
              {watch("_id") && isEditing && (
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(true)}
                  className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all flex items-center space-x-2 border border-red-500/50"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Config</span>
                </button>
              )}
            </div>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleSubmit(onTest)}
                disabled={testing}
                className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-all flex items-center space-x-2 border border-slate-700"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Test Connection</span>
              </button>

              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-indigo-500/20 flex items-center space-x-2"
                >
                  <Pencil className="w-4 h-4" />
                  <span>Edit Settings</span>
                </button>
              ) : (
                <>
                  {configs.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        reset(configs[0]);
                        setIsEditing(false);
                      }}
                      className="px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all flex items-center space-x-2 border border-slate-700"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/20 flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Configuration</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </GlassCard>

      {configs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-white">Active Status</h2>
          <div className={`p-4 rounded-xl border flex items-center justify-between ${configs[0].isActive ? 'bg-green-500/10 border-green-500/50 text-green-400' : 'bg-red-500/10 border-red-500/50 text-red-400'}`}>
            <div className="flex items-center space-x-3">
              {configs[0].isActive ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
              <span>{configs[0].isActive ? 'SMTP is active and ready to send' : 'SMTP is currently inactive'}</span>
            </div>
          </div>
        </div>
      )}

      <ConfirmDeleteModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete SMTP Config"
        message="Are you sure you want to delete this SMTP configuration? You will not be able to send emails until a new one is configured."
      />

      <ComposeModal 
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSend={handleSendDirect}
        loading={sendingDirect}
      />
    </div>
  );
}
