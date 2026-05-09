"use client";

import { useState } from "react";
import { Bell, Mail, Zap, Shield, Info } from "lucide-react";

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState({
    emailInvoices: true,
    emailSecurity: true,
    usageAlerts: true,
    projectInvites: true,
    marketing: false
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      title: "Account & Billing",
      items: [
        { id: "emailInvoices", name: "Billing Invoices", desc: "Receive email invoices for every payment.", icon: Mail },
        { id: "emailSecurity", name: "Security Alerts", desc: "Get notified about new logins and password changes.", icon: Shield },
      ]
    },
    {
      title: "Usage & Projects",
      items: [
        { id: "usageAlerts", name: "Usage Thresholds", desc: "Get alerted when you reach 80% of your plan limits.", icon: Zap },
        { id: "projectInvites", name: "Project Invitations", desc: "Receive emails when you are invited to a project.", icon: Bell },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-white dark:bg-[#191919] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">Notification Preferences</h3>
          <p className="text-sm text-slate-500">Control how and when we reach out to you.</p>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {sections.map((section) => (
            <div key={section.title} className="p-6">
              <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{section.title}</h4>
              <div className="space-y-6">
                {section.items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-[#252525] flex items-center justify-center text-slate-400">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => toggle(item.id as any)}
                      className={`
                        relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out outline-none
                        ${prefs[item.id as keyof typeof prefs] ? "bg-blue-600" : "bg-slate-200 dark:bg-slate-700"}
                      `}
                    >
                      <span className={`
                        pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out
                        ${prefs[item.id as keyof typeof prefs] ? "translate-x-5" : "translate-x-0"}
                      `} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="px-6 py-4 bg-blue-50/50 dark:bg-blue-900/10 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-3">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300">Push notifications for browser alerts are coming soon.</p>
        </div>
      </div>
    </div>
  );
}
