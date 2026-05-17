"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { 
  Loader2, 
  Settings, 
  Save, 
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import BillingSettings from "@/components/settings/BillingSettings";
import SecuritySettings from "@/components/settings/SecuritySettings";
import NotificationSettings from "@/components/settings/NotificationSettings";
import TeamSettings from "@/components/settings/TeamSettings";
import ApiKeySettings from "@/components/settings/ApiKeySettings";

type TabId = "profile" | "billing" | "api-keys" | "team" | "security" | "notifications";

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string | null;
  plan: string;
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/users/me")
      .then(res => setUser(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateUser = async (data: Partial<User>) => {
    try {
      const res = await api.patch("/users/me", data);
      setUser(res.data.user);
      window.dispatchEvent(new CustomEvent("user-profile-updated"));
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return <ProfileSettings user={user} onUpdate={handleUpdateUser} />;
      case "billing": return <BillingSettings user={user} />;
      case "api-keys": return <ApiKeySettings />;
      case "team": return <TeamSettings />;
      case "security": return <SecuritySettings />;
      case "notifications": return <NotificationSettings />;
      default: return null;
    }
  };

  const tabTitles = {
    profile: "Profile Settings",
    billing: "Subscription & Billing",
    "api-keys": "API Access Tokens",
    team: "Project Team Management",
    security: "Account Security",
    notifications: "Notification Preferences"
  };

  return (
    <div className="pb-24 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 md:px-0">
      {/* Header with Sticky Save Button */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 top-0 z-20 py-4 backdrop-blur-md -mx-4 px-4 md:-mx-0 md:px-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
            <Settings className="w-3 h-3" />
            Workspace Settings
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-slate-400 tracking-tight">
            {tabTitles[activeTab]}
          </h1>
        </div>
        
        <div className="flex items-center gap-3">
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-[#191919] border border-transparent hover:border-slate-200 dark:hover:border-slate-800 rounded-xl transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <button 
            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Left Sidebar */}
        <SettingsSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Right Panel - Dynamic Content */}
        <div className="flex-1 min-w-0">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
