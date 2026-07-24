import { createTheme, type ThemeOptions } from "@mui/material";
import { M3_LIGHT, M3_DARK } from "./m3Colors";

function buildTheme(mode: "light" | "dark"): ReturnType<typeof createTheme> {
  const m3 = mode === "light" ? M3_LIGHT : M3_DARK;

  const palette: ThemeOptions["palette"] = {
    mode,
    primary: { main: m3.primary, contrastText: m3.onPrimary },
    secondary: { main: m3.secondary, contrastText: m3.onSecondary },
    error: { main: m3.error, contrastText: m3.onError },
    background: { default: m3.background, paper: m3.surfaceContainer },
    text: { primary: m3.onSurface, secondary: m3.onSurfaceVariant },
    divider: m3.outlineVariant,
  };

  return createTheme({
    palette,
    shape: { borderRadius: 16 },
    typography: {
      fontFamily: '"Inter Tight", sans-serif',
      h4: { fontWeight: 800, fontSize: "2rem", lineHeight: 1.275, letterSpacing: "-0.01em" },
      h3: { fontWeight: 700, fontSize: "2.5rem", lineHeight: 1.2, letterSpacing: 0 },
      h6: { fontWeight: 700, fontSize: "1.15rem", lineHeight: 1.4, letterSpacing: 0 },
      subtitle1: { fontWeight: 600, fontSize: "1rem", lineHeight: 1.5, letterSpacing: "0.01em" },
      subtitle2: { fontWeight: 500, fontSize: "0.875rem", lineHeight: 1.43, letterSpacing: "0.01em" },
      body1: { fontWeight: 400, fontSize: "1rem", lineHeight: 1.6, letterSpacing: "0.03em" },
      body2: { fontWeight: 400, fontSize: "0.875rem", lineHeight: 1.5, letterSpacing: "0.02em" },
      overline: {
        fontWeight: 500,
        fontSize: "0.75rem",
        lineHeight: 1.33,
        letterSpacing: "0.08em",
        textTransform: "uppercase" as const,
      },
      button: { fontWeight: 600, letterSpacing: "0.02em", textTransform: "none" as const },
    },
    components: {
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            backgroundColor: m3.surfaceContainer,
            borderRadius: 28,
          },
          elevation1: {
            boxShadow: "0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px 1px rgba(0,0,0,0.08)",
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 100,
            height: M3_LIGHT === m3 ? 56 : 56,
            paddingInline: 24,
            fontWeight: 600,
            fontSize: "1rem",
          },
          contained: {
            boxShadow: "0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px 1px rgba(0,0,0,0.08)",
            "&:hover": {
              boxShadow: "0px 1px 2px rgba(0,0,0,0.12), 0px 2px 6px 2px rgba(0,0,0,0.08)",
            },
          },
          outlined: {
            borderColor: m3.outline,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
          },
          outlined: {
            borderColor: m3.outline,
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            "& .MuiSwitch-switchBase.Mui-checked": {
              color: m3.primary,
            },
            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
              backgroundColor: m3.primary,
            },
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: m3.outlineVariant,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 16,
          },
        },
      },
      MuiCssBaseline: {
        styleOverrides: {
          ":root": {
            "--m3-primary": m3.primary,
            "--m3-on-primary": m3.onPrimary,
            "--m3-primary-container": m3.primaryContainer,
            "--m3-on-primary-container": m3.onPrimaryContainer,
            "--m3-secondary-container": m3.secondaryContainer,
            "--m3-on-secondary-container": m3.onSecondaryContainer,
            "--m3-surface": m3.surface,
            "--m3-on-surface": m3.onSurface,
            "--m3-on-surface-variant": m3.onSurfaceVariant,
            "--m3-outline": m3.outline,
            "--m3-outline-variant": m3.outlineVariant,
            "--m3-surface-highest": m3.surfaceContainerHighest,
            "--m3-surface-container": m3.surfaceContainer,
            "--m3-background": m3.background,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: m3.surfaceContainerLow,
            borderRight: `1px solid ${m3.outlineVariant}`,
          },
        },
      },
      MuiContainer: {
        styleOverrides: {
          root: {
            paddingTop: 48,
            paddingBottom: 48,
          },
        },
      },
    },
  });
}

export const lightTheme = buildTheme("light");
export const darkTheme = buildTheme("dark");
export { buildTheme };
