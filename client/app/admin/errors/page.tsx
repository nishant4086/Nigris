"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/lib/api";
import { 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  TerminalSquare, 
  Eye, 
  X,
  ServerCrash,
  ShieldCheck
} from "lucide-react";

interface SystemErrorItem {
  _id: string;
  statusCode?: number;
  method?: string;
  route?: string;
  message?: string;
  stackTrace?: string;
  traceId?: string;
  resolved?: boolean;
  createdAt: string;
}

export default function AdminErrorsPage() {
  const [errors, setErrors] = useState<SystemErrorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedError, setSelectedError] = useState<SystemErrorItem | null>(null);

  const fetchErrors = useCallback(async () => {
    try {
      const res = await api.get("/admin/errors");
      setErrors(res.data.errors);
    } catch (err) {
      console.error("Failed to fetch errors:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      await fetchErrors();
    };
    void run();
  }, [fetchErrors]);

  const handleResolve = async (id: string) => {
    try {
      await api.patch(`/admin/errors/${id}/resolve`);
      fetchErrors();
    } catch (err) {
      console.error("Failed to resolve error:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
          <ServerCrash className="h-8 w-8 text-red-500" />
          System Errors
        </h1>
        <p className="text-slate-500">
          Monitor and resolve critical backend exceptions (500+). Alerts are automatically sent to r.nishant4806@gmail.com.
        </p>
      </div>

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-500 dark:text-slate-400">
            <thead className="bg-slate-50 text-xs uppercase text-slate-700 dark:bg-white/5 dark:text-slate-300 border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Route</th>
                <th className="px-6 py-4">Message</th>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {errors.map((err) => (
                <tr key={err._id} className="border-b border-slate-200 dark:border-white/10 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    {err.resolved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" /> Resolved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700 dark:bg-red-500/10 dark:text-red-400">
                        <AlertCircle className="h-3 w-3" /> {err.statusCode || 500}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 font-mono text-xs">
                    <span className="text-slate-400">{err.method}</span> {err.route}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate font-medium text-slate-900 dark:text-white">
                    {err.message}
                  </td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    <Clock className="h-3 w-3 text-slate-400" />
                    {new Date(err.createdAt).toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setSelectedError(err)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors"
                        title="View Stack Trace"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      {!err.resolved && (
                        <button
                          onClick={() => handleResolve(err._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                          title="Mark Resolved"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {errors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center">
                      <ShieldCheck className="h-12 w-12 text-emerald-500 mb-3 opacity-50" />
                      <p className="text-lg font-medium text-slate-900 dark:text-slate-100">Zero System Errors</p>
                      <p>Your backend is running perfectly.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stack Trace Modal */}
      {selectedError && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 backdrop-blur-sm p-4">
          <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 p-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <TerminalSquare className="h-5 w-5 text-indigo-500" />
                Error Details
              </h3>
              <button
                onClick={() => setSelectedError(null)}
                className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-4 overflow-y-auto space-y-4 flex-1">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <p className="text-slate-500 text-xs mb-1">Trace ID</p>
                  <p className="font-mono">{selectedError.traceId || 'N/A'}</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5">
                  <p className="text-slate-500 text-xs mb-1">Endpoint</p>
                  <p className="font-mono text-red-500">{selectedError.method} {selectedError.route}</p>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-900 dark:text-red-200 font-medium">
                {selectedError.message}
              </div>

              <div className="rounded-xl overflow-hidden bg-[#1e1e1e] border border-slate-800">
                <div className="bg-[#2d2d2d] px-4 py-2 text-xs font-mono text-slate-400 border-b border-slate-800 flex justify-between">
                  <span>Stack Trace</span>
                  <span>Node.js</span>
                </div>
                <pre className="p-4 text-sm font-mono text-red-400 overflow-x-auto whitespace-pre-wrap">
                  {selectedError.stackTrace || "No stack trace available."}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
