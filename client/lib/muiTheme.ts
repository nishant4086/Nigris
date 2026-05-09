import { createTheme } from "@mui/material/styles";

export type AppThemeMode = "light" | "dark";

declare module "@mui/material/styles" {
  interface Palette {
    glass: {
      background: string;
      backgroundStrong: string;
      border: string;
      shadow: string;
    };
  }

  interface PaletteOptions {
    glass?: {
      background?: string;
      backgroundStrong?: string;
      border?: string;
      shadow?: string;
    };
  }
}

const fontFamily = [
  "Inter",
  "-apple-system",
  "BlinkMacSystemFont",
  "\"SF Pro Display\"",
  "\"SF Pro Text\"",
  "Segoe UI",
  "sans-serif",
].join(",");

export const getMuiTheme = (mode: AppThemeMode) => {
  const isDark = mode === "dark";
  const glassBackground = isDark ? "rgba(30,41,59,0.6)" : "rgba(255,255,255,0.6)";
  const glassBackgroundStrong = isDark ? "rgba(15,23,42,0.78)" : "rgba(255,255,255,0.78)";
  const glassBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.72)";
  const glassShadow = isDark
    ? "0 24px 70px rgba(2,6,23,0.45)"
    : "0 24px 70px rgba(15,23,42,0.12)";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: "#3b82f6",
        light: "#60a5fa",
        dark: "#2563eb",
      },
      secondary: {
        main: "#6366f1",
        light: "#818cf8",
        dark: "#4f46e5",
      },
      background: {
        default: isDark ? "#0f172a" : "#f5f5f7",
        paper: glassBackground,
      },
      text: {
        primary: isDark ? "#f8fafc" : "#0f172a",
        secondary: isDark ? "#94a3b8" : "#64748b",
      },
      glass: {
        background: glassBackground,
        backgroundStrong: glassBackgroundStrong,
        border: glassBorder,
        shadow: glassShadow,
      },
    },
    shape: {
      borderRadius: 18,
    },
    typography: {
      fontFamily,
      h1: { fontWeight: 800, letterSpacing: "-0.02em" },
      h2: { fontWeight: 800, letterSpacing: "-0.02em" },
      h3: { fontWeight: 800, letterSpacing: "-0.015em" },
      h4: { fontWeight: 800, letterSpacing: "-0.012em" },
      h5: { fontWeight: 700, letterSpacing: "-0.01em" },
      h6: { fontWeight: 700, letterSpacing: "-0.01em" },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600 },
      button: {
        fontWeight: 700,
        textTransform: "none",
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: "var(--app-bg)",
            color: "var(--app-text)",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: glassBackgroundStrong,
            border: `1px solid ${glassBorder}`,
            boxShadow: glassShadow,
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: glassBackgroundStrong,
            borderBottom: `1px solid ${glassBorder}`,
            boxShadow: glassShadow,
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundColor: glassBackground,
            border: `1px solid ${glassBorder}`,
            boxShadow: glassShadow,
            backdropFilter: "blur(20px) saturate(160%)",
            WebkitBackdropFilter: "blur(20px) saturate(160%)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 14,
            fontWeight: 700,
          },
          containedPrimary: {
            backgroundImage: "var(--gradient-primary)",
            boxShadow: "0 16px 36px rgba(59, 130, 246, 0.3)",
          },
        },
      },
    },
  });
};
