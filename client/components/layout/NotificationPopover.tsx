"use client";

import { useState, useEffect } from "react";
import { 
  Bell, 
  X, 
  Check, 
  Trash2, 
  Package, 
  Database, 
  CreditCard, 
  AlertTriangle,
  Globe
} from "lucide-react";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationPopover({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get("/keys/alerts");
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const markAsRead = async (id: string) => {
    try {
      await api.patch(`/keys/alerts/${id}/read`);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const deleteNotification = async (id: string) => {
    // We don't have a delete API yet, so we'll just filter from UI or add one later
    setNotifications(prev => prev.filter(n => n._id !== id));
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const getIcon = (type: string) => {
    switch (type) {
      case "project": return <Package className="w-4 h-4 text-blue-500" />;
      case "collection": return <Database className="w-4 h-4 text-emerald-500" />;
      case "plan": return <CreditCard className="w-4 h-4 text-purple-500" />;
      case "billing": return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case "community": return <Globe className="w-4 h-4 text-indigo-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, y: 10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="glass-popover absolute right-0 top-full mt-3 w-[380px] z-50 overflow-hidden shadow-2xl rounded-3xl border border-slate-200 dark:border-white/10"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        <div className="max-h-[450px] overflow-y-auto">
          {loading ? (
            <div className="p-12 text-center">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-xs text-slate-500">Checking for updates...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-12 h-12 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 dark:text-slate-700">
                <Bell className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">No new notifications at the moment.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {notifications.map((n) => (
                <div 
                  key={n._id} 
                  className={`relative flex items-start gap-4 p-5 transition-colors group ${!n.isRead ? 'bg-blue-500/5 dark:bg-blue-500/10' : 'hover:bg-slate-50 dark:hover:bg-white/5'}`}
                >
                  <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${!n.isRead ? 'bg-white dark:bg-slate-800 shadow-sm' : 'bg-slate-50 dark:bg-white/5'}`}>
                    {getIcon(n.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-relaxed ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>
                      {n.message}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1.5 uppercase font-medium tracking-wider">
                      {new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  
                  <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {!n.isRead && (
                      <button 
                        onClick={() => markAsRead(n._id)}
                        className="p-1.5 text-emerald-500 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Mark as read"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button 
                      onClick={() => deleteNotification(n._id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {!n.isRead && (
                    <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-full" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50/50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-center">
          <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-blue-500 transition-colors">
            View All Notifications
          </button>
        </div>
      </motion.div>
    </>
  );
}
