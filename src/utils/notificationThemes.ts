import type { NotificationTheme } from "@/store/settingsStore";

export interface ThemeStyle {
  background: string;
  color: string;
  border: string;
  shadow: string;
  blur?: string;
  accentBg?: string;
}

// Every theme is a *complete* visual treatment: surface, text, border,
// and shadow — not just a background swap. Glassmorphism needs the
// blur to actually read against whatever's behind the window, which
// works because the notification window itself is transparent (see
// src-tauri/tauri.conf.json) and the toast sits directly on that
// transparent canvas with no intermediate opaque layer.
export const THEME_STYLES: Record<NotificationTheme, ThemeStyle> = {
  material: {
    background: "#1E1E2E",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.06)",
    shadow: "0 10px 40px rgba(0,0,0,0.45)",
    accentBg: "rgba(124,92,252,0.18)",
  },
  glassmorphism: {
    background: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.35)",
    shadow: "0 8px 32px rgba(0,0,0,0.25)",
    blur: "blur(20px) saturate(160%)",
    accentBg: "rgba(255,255,255,0.15)",
  },
  minimal: {
    background: "#FFFFFF",
    color: "#111111",
    border: "1px solid rgba(0,0,0,0.08)",
    shadow: "0 4px 20px rgba(0,0,0,0.12)",
    accentBg: "rgba(0,0,0,0.04)",
  },
  neon: {
    background: "#0A0A0F",
    color: "#39FF14",
    border: "1px solid #39FF14",
    shadow: "0 0 24px rgba(57,255,20,0.45), 0 0 4px rgba(57,255,20,0.8)",
    accentBg: "rgba(57,255,20,0.1)",
  },
  macos: {
    background: "rgba(28,28,30,0.78)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.12)",
    shadow: "0 12px 32px rgba(0,0,0,0.4)",
    blur: "blur(24px) saturate(180%)",
    accentBg: "rgba(255,255,255,0.08)",
  },
  windows11: {
    background: "rgba(32,32,32,0.82)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.1)",
    shadow: "0 8px 28px rgba(0,0,0,0.35)",
    blur: "blur(28px) saturate(150%)",
    accentBg: "rgba(255,255,255,0.06)",
  },
  retro: {
    background: "#2B1B4E",
    color: "#FFD23F",
    border: "2px solid #FFD23F",
    shadow: "4px 4px 0 #FFD23F",
    accentBg: "rgba(255,210,63,0.15)",
  },
  terminal: {
    background: "#000000",
    color: "#00FF00",
    border: "1px solid #00FF00",
    shadow: "0 0 16px rgba(0,255,0,0.35)",
    accentBg: "rgba(0,255,0,0.08)",
  },
  cute: {
    background: "#FFE3EC",
    color: "#7A2E4E",
    border: "1px solid #FFB6CE",
    shadow: "0 8px 24px rgba(255,105,150,0.25)",
    accentBg: "rgba(255,105,150,0.15)",
  },
  dark: {
    background: "#121212",
    color: "#EAEAEA",
    border: "1px solid rgba(255,255,255,0.08)",
    shadow: "0 8px 28px rgba(0,0,0,0.5)",
    accentBg: "rgba(255,255,255,0.06)",
  },
  light: {
    background: "#FAFAFA",
    color: "#1A1A1A",
    border: "1px solid rgba(0,0,0,0.06)",
    shadow: "0 6px 20px rgba(0,0,0,0.1)",
    accentBg: "rgba(0,0,0,0.04)",
  },
};
