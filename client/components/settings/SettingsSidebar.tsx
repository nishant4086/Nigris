"use client";

import { 
  User, 
  CreditCard, 
  Key, 
  Users, 
  Shield, 
  Bell,
  ChevronRight
} from "lucide-react";

type TabId = "profile" | "billing" | "api-keys" | "team" | "security" | "notifications";

type SettingsSidebarProps = {
  activeTab: TabId;
  setActiveTab: (tab: TabId) => void;
};

export default function SettingsSidebar({ activeTab, setActiveTab }: SettingsSidebarProps) {
  const tabs = [
    { id: "profile", name: "Profile", icon: User, desc: "Personal info & avatar" },
    { id: "billing", name: "Billing", icon: CreditCard, desc: "Plans & subscriptions" },
    { id: "api-keys", name: "API Keys", icon: Key, desc: "Manage access tokens" },
    { id: "team", name: "Team", icon: Users, desc: "Project collaborators" },
    { id: "security", name: "Security", icon: Shield, desc: "Password & 2FA" },
    { id: "notifications", name: "Notifications", icon: Bell, desc: "Email & usage alerts" },
  ] as const;

  return (
    <div className="w-full lg:w-64 flex-shrink-0 space-y-1">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30" 
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-[#1e1e1e] hover:text-slate-900 dark:hover:text-slate-200 border border-transparent"
              }
            `}
          >
            <div className="flex items-center gap-3">
              <div className={`
                p-1.5 rounded-lg transition-colors
                ${isActive ? "bg-blue-600 text-white" : "bg-slate-100 dark:bg-slate-800/60 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"}
              `}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-bold leading-none">{tab.name}</p>
                <p className="text-[10px] mt-1 text-slate-500 font-medium opacity-0 lg:opacity-100 hidden lg:block">{tab.desc}</p>
              </div>
            </div>
            <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"}`} />
          </button>
        );
      })}
    </div>
  );
}
