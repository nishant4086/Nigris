"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Bell, Search, Menu, LogOut, ChevronDown, Command } from "lucide-react";
import ThemeToggle3D from "@/components/ui/ThemeToggle3D";
import CommandPalette from "@/components/layout/CommandPalette";
import NotificationPopover from "@/components/layout/NotificationPopover";

interface NotificationAlert {
  _id: string;
  isRead: boolean;
}

export default function Navbar({ toggleSidebar }: NavbarProps) {
  const router = useRouter();
  const path = usePathname();
  
  const [plan, setPlan] = useState("...");
  const [name, setName] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Convert /dashboard/api-keys to "Api Keys"
  const getPageTitle = () => {
    if (path === "/dashboard") return "Dashboard";
    const segments = path.split("/");
    const last = segments[segments.length - 1];
    return last.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get("/users/me");
        setPlan(res.data?.plan || "free");
        setName(res.data?.name || "User");
      } catch {
        setPlan("free");
        setName("User");
      }
    };
    
    Promise.resolve().then(() => {
      loadProfile();
      // Initial unread count
      api.get("/keys/alerts").then(res => {
        const unread = (res.data || []).filter((n: NotificationAlert) => !n.isRead).length;
        setUnreadCount(unread);
      }).catch(() => {});
    });

    const handleGlobalKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);

    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <header className="glass-nav z-10 m-3 flex h-16 items-center justify-between rounded-2xl px-4 transition-all duration-300 md:m-4 md:px-6">
      <div className="flex items-center gap-4">
        {toggleSidebar && (
          <button 
            onClick={toggleSidebar}
            className="rounded-xl p-2 text-slate-500 transition-colors hover:bg-white/50 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-slate-200 md:hidden"
            type="button"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <p className="hidden text-xs font-semibold uppercase text-slate-400 md:block">Workspace</p>
          <h2 className="text-lg font-bold tracking-tight text-slate-950 dark:text-white">{getPageTitle()}</h2>
        </div>
      </div>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="w-4 h-4 absolute left-3 text-slate-400" />
          <button
            onClick={() => setSearchOpen(true)}
            className="glass-input w-72 rounded-full py-2 pl-9 pr-4 text-sm text-slate-500 text-left transition-all hover:bg-white/70 dark:text-slate-400 dark:hover:bg-slate-950/55 flex items-center justify-between"
          >
            <span>Search...</span>
            <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 dark:bg-white/10 rounded border border-slate-200 dark:border-white/5">
              <Command className="w-2.5 h-2.5" />
              <span className="text-[10px]">K</span>
            </div>
          </button>
        </div>

        {/* Theme & Notifications */}
        <div className="flex items-center gap-3 relative">
          <ThemeToggle3D />
          <button 
            onClick={() => setNotifOpen(!notifOpen)}
            className="glass-pill relative rounded-full p-2 text-slate-500 transition-all hover:scale-105 hover:text-slate-700 dark:text-slate-300 dark:hover:text-white" 
            type="button" 
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-blue-600 dark:border-slate-900 animate-pulse"></span>
            )}
          </button>

          <NotificationPopover isOpen={notifOpen} onClose={() => setNotifOpen(false)} />
        </div>

        <div className="mx-1 hidden h-7 w-px bg-slate-200/80 dark:bg-white/10 md:block"></div>

        {/* User Dropdown */}
        <div className="relative">
          <button 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="glass-pill flex items-center gap-2 rounded-full p-1.5 pr-2 transition-all hover:scale-[1.02] hover:bg-white/70 dark:hover:bg-white/15"
            type="button"
            aria-haspopup="menu"
            aria-expanded={dropdownOpen}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-blue-500 to-indigo-500 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
              {name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200 leading-none">{name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-0.5 capitalize">{plan} Plan</p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 hidden md:block" />
          </button>

          {dropdownOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} aria-hidden="true" />
              <div className="glass-popover absolute right-0 z-50 mt-3 w-52 overflow-hidden py-1" role="menu">
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{name}</p>
                  <p className="text-xs text-slate-500">{plan} Plan</p>
                </div>
                
                <button 
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <CommandPalette isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
