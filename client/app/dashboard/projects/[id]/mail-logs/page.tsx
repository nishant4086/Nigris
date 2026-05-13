"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";
import GlassCard from "@/components/ui/GlassCard";
import { Loader2, Search, CheckCircle, XCircle, Clock, ExternalLink, RefreshCw } from "lucide-react";

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

export default function EmailLogs() {
  const params = useParams();
  const projectId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<MailLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchLogs = useCallback(async () => {
    try {
      const { data } = await api.get(`/mail/logs/${projectId}`);
      setLogs(data);
    } catch {
      toast.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    Promise.resolve().then(() => {
      fetchLogs();
    });
  }, [fetchLogs]);

  const retryEmail = async (log: MailLog) => {
    try {
      await api.post("/mail/test-send", {
        templateId: log.template?._id,
        to: log.to,
        variables: log.variables
      });
      toast.success("Retry initiated successfully!");
      fetchLogs();
    } catch {
      toast.error("Failed to retry email");
    }
  };

  const filteredLogs = logs.filter(log => 
    log.to.toLowerCase().includes(searchTerm.toLowerCase()) || 
    log.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.template?.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle className="w-4 h-4 text-green-400" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-400" />;
      case "pending": return <Clock className="w-4 h-4 text-amber-400" />;
      default: return null;
    }
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-100">
          Email Delivery Logs
        </h1>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search recipient, subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-900/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none w-64 transition-all"
            />
          </div>
          <button onClick={fetchLogs} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-all border border-slate-700">
            <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <GlassCard className="overflow-hidden border-slate-700/50">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-800/50 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Recipient</th>
                <th className="px-6 py-4 font-medium">Subject</th>
                <th className="px-6 py-4 font-medium">Template</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredLogs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(log.status)}
                      <span className={`text-xs font-medium capitalize ${
                        log.status === 'sent' ? 'text-green-400' : 
                        log.status === 'failed' ? 'text-red-400' : 'text-amber-400'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    {log.error && (
                      <p className="text-[10px] text-red-500/70 mt-1 max-w-[150px] truncate" title={log.error}>
                        {log.error}
                      </p>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-white font-medium">{log.to}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-slate-400 truncate max-w-xs block">{log.subject}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                      {log.template?.name || "Manual / Custom"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-xs text-slate-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right flex justify-end space-x-2">
                    {log.status === 'failed' && (
                      <button 
                        onClick={() => retryEmail(log)}
                        className="text-slate-500 hover:text-blue-400 transition-colors" 
                        title="Retry Sending"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                    <button className="text-slate-500 hover:text-white transition-colors" title="View Details">
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    No logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>
      
      <div className="flex justify-between items-center text-xs text-slate-500">
        <span>Showing {filteredLogs.length} of {logs.length} recent emails</span>
        <div className="flex space-x-2">
           <button disabled className="px-3 py-1 bg-slate-800 rounded border border-slate-700 disabled:opacity-50">Previous</button>
           <button disabled className="px-3 py-1 bg-slate-800 rounded border border-slate-700 disabled:opacity-50">Next</button>
        </div>
      </div>
    </div>
  );
}
