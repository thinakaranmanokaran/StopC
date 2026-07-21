import { create } from "zustand";

export type NotificationTheme =
  | "material"
  | "glassmorphism"
  | "minimal"
  | "neon"
  | "macos"
  | "windows11"
  | "retro"
  | "terminal"
  | "cute"
  | "dark"
  | "light";

export type NotificationAnimation = "slide" | "fade" | "scale" | "spring";
export type NotificationPosition =
  | "top-left"
  | "top-right"
  | "top-center"
  | "bottom-left"
  | "bottom-right"
  | "bottom-center";

export interface StopCSettings {
  theme: NotificationTheme;
  animation: NotificationAnimation;
  position: NotificationPosition;
  durationMs: number;
  opacity: number;
  cornerRadius: number;
  funnyModeEnabled: boolean;
  mascotsEnabled: boolean;
  soundEnabled: boolean;
  soundPack: "pop" | "click" | "bubble" | "retro" | "mute";
  autoStart: boolean;
}

export const DEFAULT_SETTINGS: StopCSettings = {
  theme: "material",
  animation: "spring",
  position: "top-right",
  durationMs: 2000,
  opacity: 0.96,
  cornerRadius: 16,
  funnyModeEnabled: true,
  mascotsEnabled: true,
  soundEnabled: true,
  soundPack: "pop",
  autoStart: true,
};

interface SettingsState {
  settings: StopCSettings;
  setSettings: (partial: Partial<StopCSettings>) => void;
  resetSettings: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,
  setSettings: (partial) =>
    set((state) => ({ settings: { ...state.settings, ...partial } })),
  resetSettings: () => set({ settings: DEFAULT_SETTINGS }),
}));
