"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useThemeMode } from "@/components/ThemeProvider";

export default function ThemeToggle3D() {
  const { toggleTheme, isDark } = useThemeMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex h-9 w-18.5 items-center rounded-full border border-white/50 bg-white/55 p-1 shadow-inner shadow-slate-200/70 outline-none backdrop-blur-xl transition-all duration-300 active:scale-95 dark:border-white/10 dark:bg-slate-900/55 dark:shadow-black/30"
      role="switch"
      aria-checked={mounted ? isDark : undefined}
      aria-label="Toggle theme"
      type="button"
    >
      <span className="sr-only">Toggle theme</span>
      <div className="absolute inset-y-1 left-1 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-linear-to-br from-white to-blue-50 text-amber-500 shadow-lg shadow-slate-400/20 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] dark:translate-x-9.5 dark:from-slate-700 dark:to-slate-950 dark:text-sky-200">
        <Sun className="h-4 w-4 dark:hidden" />
        <Moon className="hidden h-4 w-4 dark:block" />
      </div>

      <Sun className="ml-1.5 h-3.5 w-3.5 text-amber-500 transition-opacity dark:opacity-35" />
      <Moon className="ml-auto mr-1.5 h-3.5 w-3.5 text-sky-500 opacity-40 transition-opacity dark:opacity-100" />
    </button>
  );
}
