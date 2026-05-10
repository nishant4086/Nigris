"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Mail, Trash2, CheckCircle } from "lucide-react";

interface Message {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Message | null>(null);

  const fetchMessages = () => {
    api.get("/admin/messages").then((r) => setMessages(r.data.messages)).catch(console.error).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMessages(); }, []);

  const markRead = async (id: string) => {
    await api.patch(`/admin/messages/${id}/read`);
    setMessages((prev) => prev.map((m) => (m._id === id ? { ...m, read: true } : m)));
    if (selected?._id === id) setSelected({ ...selected, read: true });
  };

  const deleteMsg = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await api.delete(`/admin/messages/${id}`);
    setMessages((prev) => prev.filter((m) => m._id !== id));
    if (selected?._id === id) setSelected(null);
  };

  if (loading) return <div className="py-12 text-center text-slate-500">Loading messages...</div>;

  return (
    <div className="py-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <h1 className="text-3xl font-black mb-2 text-slate-900 dark:text-slate-100 tracking-tight">Contact Messages</h1>
      <p className="text-sm text-slate-500 mb-8">Messages from the public contact form.</p>

      {messages.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <Mail className="mx-auto h-10 w-10 mb-3 opacity-40" />
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-4">
          {/* List */}
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {messages.map((m) => (
              <button
                key={m._id}
                onClick={() => { setSelected(m); if (!m.read) markRead(m._id); }}
                className={`w-full text-left rounded-2xl p-4 transition-all duration-200 border ${
                  selected?._id === m._id 
                    ? "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800/50" 
                    : "bg-white dark:bg-slate-900/50 backdrop-blur-xl border-slate-200 dark:border-slate-800 hover:-translate-y-0.5 hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium truncate">{m.name}</span>
                  {!m.read && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                </div>
                <p className="text-xs text-slate-500 truncate">{m.subject || m.email}</p>
                <p className="text-xs text-slate-400 mt-1">{new Date(m.createdAt).toLocaleDateString()}</p>
              </button>
            ))}
          </div>

          {/* Detail */}
          {selected ? (
            <div className="bg-white dark:bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 p-6 lg:p-8 shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold">{selected.name}</h2>
                  <p className="text-sm text-slate-500">{selected.email}</p>
                  {selected.subject && <p className="text-sm text-slate-400 mt-0.5">{selected.subject}</p>}
                </div>
                <div className="flex gap-2">
                  {!selected.read && (
                    <button onClick={() => markRead(selected._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Mark as read">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </button>
                  )}
                  <button onClick={() => deleteMsg(selected._id)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Delete">
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
              <p className="text-xs text-slate-400 mb-4">{new Date(selected.createdAt).toLocaleString()}</p>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center bg-white/50 dark:bg-slate-900/30 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-400 text-sm min-h-[400px]">
              <Mail className="w-12 h-12 mb-4 opacity-20" />
              Select a message to read
            </div>
          )}
        </div>
      )}
    </div>
  );
}
