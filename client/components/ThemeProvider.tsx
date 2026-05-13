"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { CssBaseline, ThemeProvider as MuiThemeProvider } from "@mui/material";
import { AppThemeMode, getMuiTheme } from "@/lib/muiTheme";

const THEME_STORAGE_KEY = "nigris-theme";

type ThemeContextValue = {
  mode: AppThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setThemeMode: (mode: AppThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const getInitialMode = (): AppThemeMode => {
  if (typeof window === "undefined") return "light";

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
  if (storedTheme === "dark" || storedTheme === "light") return storedTheme;

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

const applyDocumentTheme = (mode: AppThemeMode) => {
  document.documentElement.classList.toggle("dark", mode === "dark");
  document.documentElement.dataset.theme = mode;
  document.documentElement.style.colorScheme = mode;
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize with light theme to match server
  const [mode, setMode] = useState<AppThemeMode>("light");
  useEffect(() => {
    const initialMode = getInitialMode();
    Promise.resolve().then(() => {
      setMode(initialMode);
    });
    applyDocumentTheme(initialMode);
  }, []);

  const setThemeMode = useCallback((nextMode: AppThemeMode) => {
    setMode(nextMode);
    window.localStorage.setItem(THEME_STORAGE_KEY, nextMode);
    applyDocumentTheme(nextMode);
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode(mode === "dark" ? "light" : "dark");
  }, [mode, setThemeMode]);

  const muiTheme = useMemo(() => getMuiTheme(mode), [mode]);
  const value = useMemo(
    () => ({
      mode,
      isDark: mode === "dark",
      toggleTheme,
      setThemeMode,
    }),
    [mode, toggleTheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export const useThemeMode = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useThemeMode must be used inside ThemeProvider");
  }

  return context;
}
