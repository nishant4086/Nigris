"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, Search, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw, Filter, Mail, X } from "lucide-react";

interface Project {
  _id: string;
  name: string;
}

interface MailLog {
  _id: string;
  status: string;
  to: string;
  subject: string;
  template?: { _id: string; name: string };
  variables?: Record<string, unknown>;
  error?: string;
  createdAt: string;
}

export default function CentralizedMailLogsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<MailLog | null>(null);

  // Load all projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/projects");
        setProjects(data || []);
        if (data && data.length > 0) {
          setSelectedProjectId(data[0]._id);
        }
      } catch {
        toast.error("Failed to fetch workspaces");
      } finally {
        setLoadingProjects(false);
      }
    };

    Promise.resolve().then(() => {
      fetchProjects();
    });
  }, []);

  // Fetch logs for the selected project
  const fetchLogs = useCallback(async () => {
    if (!selectedProjectId) return;
    setLoadingLogs(true);
    try {
      const { data } = await api.get(`/mail/logs/${selectedProjectId}`);
      setLogs(data || []);
    } catch {
      toast.error("Failed to fetch outbox logs");
    } finally {
      setLoadingLogs(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchLogs();
    });
  }, [fetchLogs]);

  // Retry sending email
  const retryEmail = async (log: MailLog) => {
    try {
      await api.post("/mail/test-send", {
        templateId: log.template?._id,
        to: log.to,
        variables: log.variables,
      });
      toast.success("Retry initiated successfully!");
      fetchLogs();
    } catch {
      toast.error("Failed to retry email delivery");
    }
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.template?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <CheckCircle className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />;
      case "failed":
        return <XCircle className="w-4 h-4 text-red-500 dark:text-red-400" />;
      case "pending":
        return <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />;
      default:
        return null;
    }
  };

  if (loadingProjects) {
    return (
      <div className="flex justify-center p-20">
        <Loader2 className="animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-900 dark:text-slate-100">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white md:text-5xl bg-gradient-to-r from-slate-900 via-slate-750 to-slate-500 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
            Outbox Delivery Logs
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Monitor transactional email delivery rates, inspect payload parameters, and track delivery status.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {projects.length > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white/60 dark:border-slate-800 dark:bg-slate-950/40 px-3 py-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-300 outline-none border-none cursor-pointer"
              >
                {projects.map((p) => (
                  <option key={p._id} value={p._id} className="bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-300">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-405" />
            <input
              type="text"
              placeholder="Search recipients, subjects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500/30 outline-none w-64 transition-all"
            />
          </div>

          <button
            onClick={fetchLogs}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 rounded-xl text-slate-500 dark:text-slate-400 transition-all border border-slate-200 dark:border-slate-850"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loadingLogs ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {loadingLogs ? (
        <div className="flex justify-center p-20">
          <Loader2 className="animate-spin text-indigo-500" />
        </div>
      ) : (
        <GlassCard className="overflow-hidden border-slate-100 dark:border-white/5" hover={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Recipient</th>
                  <th className="px-6 py-4 font-semibold">Subject</th>
                  <th className="px-6 py-4 font-semibold">Template</th>
                  <th className="px-6 py-4 font-semibold">Date</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredLogs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(log.status)}
                        <span
                          className={`text-xs font-bold capitalize ${
                            log.status === "sent"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : log.status === "failed"
                              ? "text-red-600 dark:text-red-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {log.status}
                        </span>
                      </div>
                      {log.error && (
                        <p className="text-[10px] text-red-500/80 mt-1 max-w-[150px] truncate" title={log.error}>
                          {log.error}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200">{log.to}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs block">
                        {log.subject}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md border border-blue-500/20 font-semibold">
                        {log.template?.name || "Manual / Custom"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right flex justify-end space-x-3">
                      {log.status === "failed" && (
                        <button
                          onClick={() => retryEmail(log)}
                          className="text-slate-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors cursor-pointer"
                          title="Retry Sending"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No matching outbox logs found in this workspace.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Details View Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/40 dark:bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 w-full max-w-xl max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <button
              onClick={() => setSelectedLog(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 rounded-xl">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Email Log Details</h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {selectedLog._id}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-3 border-b border-slate-100 dark:divide-slate-800/30 pb-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Recipient</span>
                <span className="col-span-2 font-mono font-medium">{selectedLog.to}</span>
              </div>

              <div className="grid grid-cols-3 border-b border-slate-100 dark:divide-slate-800/30 pb-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Subject</span>
                <span className="col-span-2 font-medium">{selectedLog.subject}</span>
              </div>

              <div className="grid grid-cols-3 border-b border-slate-100 dark:divide-slate-800/30 pb-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Status</span>
                <span className="col-span-2 flex items-center gap-2">
                  {getStatusIcon(selectedLog.status)}
                  <span className="font-bold capitalize">{selectedLog.status}</span>
                </span>
              </div>

              <div className="grid grid-cols-3 border-b border-slate-100 dark:divide-slate-800/30 pb-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Template</span>
                <span className="col-span-2">
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded border border-blue-500/20 text-xs font-semibold">
                    {selectedLog.template?.name || "Manual / Custom"}
                  </span>
                </span>
              </div>

              <div className="grid grid-cols-3 border-b border-slate-100 dark:divide-slate-800/30 pb-3">
                <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Delivered At</span>
                <span className="col-span-2 text-slate-600 dark:text-slate-350">
                  {new Date(selectedLog.createdAt).toLocaleString()}
                </span>
              </div>

              {selectedLog.variables && Object.keys(selectedLog.variables).length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-slate-400 uppercase tracking-wider text-[10px] block">Variables Payload</span>
                  <pre className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-900 text-xs font-mono text-indigo-650 dark:text-indigo-300 overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.variables, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.error && (
                <div className="space-y-1.5 pt-1">
                  <span className="font-semibold text-red-500 uppercase tracking-wider text-[10px] block">Error logs</span>
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/50 p-4 rounded-2xl text-xs font-mono text-red-650 dark:text-red-400 overflow-x-auto">
                    {selectedLog.error}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              {selectedLog.status === "failed" && (
                <button
                  onClick={() => {
                    retryEmail(selectedLog);
                    setSelectedLog(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Sending</span>
                </button>
              )}
              <button
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-100 font-bold rounded-xl text-xs transition-all border border-slate-200 dark:border-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
