"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { getApiErrorMessage } from "@/lib/api";

export default function WebhookLogsPage() {
  type WebhookLog = {
    _id: string;
    status: string;
    event: string;
    url: string;
    responseCode?: number;
    errorMessage?: string;
    retryCount?: number;
    lastRetryAt?: string;
  };

  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");

  const fetchLogs = async () => {
    if (!apiKey) {
      setMessage("Please enter your API Key to fetch logs.");
      return;
    }
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.get("http://localhost:8000/api/webhooks/logs", {
        headers: { "x-api-key": apiKey },
      });
      setLogs(res.data.data || []);
    } catch (err) {
      setMessage("Failed to fetch logs: " + getApiErrorMessage(err, "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    setMessage("");
    try {
      await axios.post(`http://localhost:8000/api/webhooks/logs/${logId}/retry`, {}, {
        headers: { "x-api-key": apiKey },
      });
      setMessage("✅ Retry queued successfully!");
      // Refresh logs after a short delay to allow worker to process
      setTimeout(fetchLogs, 2000);
    } catch (err) {
      setMessage("❌ Retry failed: " + getApiErrorMessage(err, "Unknown error"));
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto text-white">
      <h1 className="text-3xl font-bold mb-6 text-indigo-400">Webhook Logs</h1>

      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Enter Project API Key..."
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded w-96 text-white focus:outline-none focus:border-indigo-500"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded transition font-medium disabled:opacity-50"
        >
          {loading ? "Loading..." : "Fetch Logs"}
        </button>
      </div>

      {message && (
        <div className="mb-4 p-4 rounded bg-gray-800 text-gray-200 border border-gray-700">
          {message}
        </div>
      )}

      <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700 shadow-xl">
        <table className="w-full text-left">
          <thead className="bg-gray-900 border-b border-gray-700 text-gray-400">
            <tr>
              <th className="p-4 font-semibold text-sm">Status</th>
              <th className="p-4 font-semibold text-sm">Event</th>
              <th className="p-4 font-semibold text-sm">URL</th>
              <th className="p-4 font-semibold text-sm">Response</th>
              <th className="p-4 font-semibold text-sm">Retries</th>
              <th className="p-4 font-semibold text-sm">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700 text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-500">No logs found</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log._id} className="hover:bg-gray-750 transition-colors">
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${log.status === 'success' ? 'bg-green-900/50 text-green-400' : 'bg-red-900/50 text-red-400'}`}>
                    {log.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 text-gray-300 font-medium">{log.event}</td>
                <td className="p-4 text-gray-400 truncate max-w-xs">{log.url}</td>
                <td className="p-4 text-gray-400 truncate max-w-xs">
                  {log.status === "success" ? `HTTP ${log.responseCode}` : log.errorMessage}
                </td>
                <td className="p-4 text-gray-400">
                  {log.retryCount || 0} / 5
                  {log.lastRetryAt && <div className="text-xs opacity-50 mt-1">Last: {new Date(log.lastRetryAt).toLocaleTimeString()}</div>}
                </td>
                <td className="p-4">
                  {log.status === "failed" && (
                    <button
                      onClick={() => handleRetry(log._id)}
                      disabled={retryingId === log._id || log.retryCount >= 5}
                      className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition"
                    >
                      {retryingId === log._id ? "Retrying..." : "Retry"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
