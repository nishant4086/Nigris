"use client";

import { useEffect, useState } from "react";
import { api, getApiErrorMessage } from "@/lib/api";
import { Mail, Check, X } from "lucide-react";
import GlassCard from "@/components/ui/GlassCard";

type Invite = {
  _id: string;
  project: {
    _id: string;
    name: string;
    description?: string;
  };
  invitedBy: {
    name: string;
  };
  role: string;
};

export default function PendingInvites() {
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInvites = async () => {
    try {
      const res = await api.get("/projects/invites/mine");
      setInvites(res.data);
    } catch (err) {
      console.error("Failed to load invites", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvites();
  }, []);

  const handleAccept = async (projectId: string) => {
    try {
      await api.post(`/projects/${projectId}/accept`);
      setInvites(prev => prev.filter(i => i.project._id !== projectId));
      // Refresh the page or update state elsewhere if needed
      window.location.reload(); 
    } catch (err) {
      alert(getApiErrorMessage(err, "Failed to accept invite"));
    }
  };

  const handleDecline = async (projectId: string) => {
    // Declining is effectively removing yourself from the project (pending state)
    // We can use a delete endpoint for this later if we add it.
    // For now, let's just leave it or add a specific decline endpoint.
    // Since I didn't add a decline endpoint yet, I'll just alert.
    alert("Decline feature coming soon. For now, you can just ignore this invite.");
  };

  if (loading || invites.length === 0) return null;

  return (
    <GlassCard className="mb-8 border border-white/20" hover={false} delay={0.08}>
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-xl bg-linear-to-br from-blue-500/20 to-indigo-500/20 text-blue-600 dark:text-blue-200">
          <Mail className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">Project Invitations</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            You've been invited to collaborate on {invites.length} {invites.length === 1 ? "project" : "projects"}.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {invites.map((invite) => (
          <div key={invite._id} className="glass-pill flex flex-col md:flex-row md:items-center justify-between rounded-xl p-4 transition-colors gap-4">
            <div>
              <p className="font-semibold text-slate-900 dark:text-slate-100">{invite.project.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Invited by <span className="font-semibold">{invite.invitedBy.name}</span> • Role: <span className="capitalize">{invite.role}</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleAccept(invite.project._id)}
                className="flex-1 md:flex-none px-4 py-2 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" />
                Accept
              </button>
              <button 
                onClick={() => handleDecline(invite.project._id)}
                className="flex-1 md:flex-none px-4 py-2 bg-transparent hover:bg-white/10 text-slate-600 dark:text-slate-200 font-bold text-sm rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Ignore
              </button>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
