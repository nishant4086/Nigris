"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { 
  Users, 
  UserPlus, 
  Shield, 
  ShieldCheck, 
  User, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  XCircle,
  MoreVertical,
  Mail,
  ChevronLeft,
  Loader2,
  X
} from "lucide-react";

type Member = {
  _id: string;
  userId: string | null;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  status: "pending" | "accepted";
  invitedBy: string | null;
  joinedAt: string | null;
};

export default function ProjectTeamPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "editor" | "viewer">("viewer");
  const [inviting, setInviting] = useState(false);

  const loadMembers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/projects/${projectId}/members`);
      setMembers(res.data);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to load team members"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) loadMembers();
  }, [projectId]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setInviting(true);
    setError("");
    setSuccess("");

    try {
      await api.post(`/projects/${projectId}/invite`, {
        email: inviteEmail,
        role: inviteRole
      });
      setSuccess(`Invite sent to ${inviteEmail}`);
      setInviteEmail("");
      setIsInviteModalOpen(false);
      loadMembers();
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to send invite"));
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;

    try {
      await api.delete(`/projects/${projectId}/members/${userId}`);
      setMembers(prev => prev.filter(m => m.userId !== userId));
      setSuccess("Member removed successfully");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to remove member"));
    }
  };

  const handleChangeRole = async (userId: string, newRole: string) => {
    try {
      await api.patch(`/projects/${projectId}/members/${userId}`, { role: newRole });
      setMembers(prev => prev.map(m => m.userId === userId ? { ...m, role: newRole as any } : m));
      setSuccess("Role updated successfully");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to update role"));
    }
  };

  const roleIcons = {
    owner: <ShieldCheck className="w-4 h-4 text-amber-500" />,
    admin: <Shield className="w-4 h-4 text-blue-500" />,
    editor: <User className="w-4 h-4 text-emerald-500" />,
    viewer: <User className="w-4 h-4 text-slate-400" />
  };

  if (loading && members.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto pb-24 animate-in fade-in duration-500">
      {/* Breadcrumbs / Back */}
      <button 
        onClick={() => router.back()}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 mb-6 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Back to Project
      </button>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Team Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage roles and access for collaborators on this project.
          </p>
        </div>
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
        >
          <UserPlus className="w-5 h-5" />
          Invite Member
        </button>
      </div>

      {/* Messages */}
      {(error || success) && (
        <div className={`mb-6 p-4 rounded-xl border flex items-center gap-3 animate-in slide-in-from-top-4 duration-300 ${
          error 
            ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-700 dark:text-red-400" 
            : "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400"
        }`}>
          {error ? <XCircle className="w-5 h-5 shrink-0" /> : <CheckCircle2 className="w-5 h-5 shrink-0" />}
          <span className="text-sm font-medium">{error || success}</span>
        </div>
      )}

      {/* Members List Table */}
      <div className="bg-white dark:bg-[#191919] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-[#1c1c1c] border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Invited By</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {members.map((member) => (
                <tr key={member._id} className="group hover:bg-slate-50/30 dark:hover:bg-[#1e1e1e] transition-colors">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold border border-blue-100 dark:border-blue-900/30">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{member.name}</p>
                        <p className="text-xs text-slate-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    {member.status === "pending" ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-900/20 text-[11px] font-bold text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-800/30">
                        <Clock className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Accepted
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-2">
                      {roleIcons[member.role]}
                      {member.role === "owner" ? (
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 capitalize">{member.role}</span>
                      ) : (
                        <select 
                          value={member.role}
                          onChange={(e) => handleChangeRole(member.userId!, e.target.value)}
                          className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-transparent border-none focus:ring-0 cursor-pointer capitalize hover:text-blue-600 transition-colors"
                        >
                          <option value="admin">Admin</option>
                          <option value="editor">Editor</option>
                          <option value="viewer">Viewer</option>
                        </select>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-sm text-slate-500">{member.invitedBy || "System"}</span>
                  </td>
                  <td className="px-6 py-5 text-right">
                    {member.role !== "owner" && (
                      <button 
                        onClick={() => handleRemove(member.userId!)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Remove member"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {members.length === 0 && !loading && (
            <div className="p-20 text-center">
              <Users className="w-16 h-16 text-slate-200 dark:text-slate-800 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">No members found in this project.</p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-[#191919] w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                Invite Team Member
              </h3>
              <button onClick={() => setIsInviteModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleInvite} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    autoFocus
                    type="email"
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-[#111111] border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Role Access</label>
                <div className="grid grid-cols-1 gap-2">
                  {[
                    { id: "viewer", name: "Viewer", desc: "Read-only access to all data" },
                    { id: "editor", name: "Editor", desc: "Can create and edit entries" },
                    { id: "admin", name: "Admin", desc: "Manage members and collections" }
                  ].map(r => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setInviteRole(r.id as any)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        inviteRole === r.id 
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500" 
                          : "border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-[#202020]"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{r.name}</p>
                        <p className="text-[10px] text-slate-500">{r.desc}</p>
                      </div>
                      {inviteRole === r.id && <CheckCircle2 className="w-5 h-5 text-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button 
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="flex-1 py-3 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={inviting || !inviteEmail}
                  className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
                >
                  {inviting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  {inviting ? "Sending..." : "Send Invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
