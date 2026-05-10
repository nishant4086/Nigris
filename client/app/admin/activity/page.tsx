"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Activity } from "lucide-react";

interface LogEntry {
  _id: string;
  action: string;
  resource: string;
  details: string;
  userId?: { name: string; email: string };
  createdAt: string;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  contact_form_submitted: { label: "Contact", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  blog_created: { label: "Blog Created", color: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" },
  blog_updated: { label: "Blog Updated", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" },
  blog_deleted: { label: "Blog Deleted", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
};

export default function ActivityPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/admin/activities").then((r) => setLogs(r.data.activities)).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-12 text-center text-gray-500">Loading activity...</div>;

  return (
    <div className="py-6">
      <h1 className="text-2xl font-bold mb-1">Activity Log</h1>
      <p className="text-sm text-gray-500 mb-6">All platform events in chronological order.</p>

      {logs.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Activity className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p>No activity logged yet</p>
        </div>
      ) : (
        <div className="space-y-0 divide-y dark:divide-gray-800">
          {logs.map((log) => {
            const meta = actionLabels[log.action] || { label: log.action, color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400" };
            return (
              <div key={log._id} className="flex items-start gap-4 py-4">
                <div className="mt-0.5 w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${meta.color}`}>
                      {meta.label}
                    </span>
                    {log.userId && (
                      <span className="text-xs text-gray-500">{log.userId.name}</span>
                    )}
                    <span className="text-xs text-gray-400 ml-auto shrink-0">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{log.details}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
