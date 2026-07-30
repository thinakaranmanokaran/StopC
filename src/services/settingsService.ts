import { invoke } from "@tauri-apps/api/core";
import { DEFAULT_SETTINGS, type StopCSettings } from "@/store/settingsStore";

const STORAGE_KEY = "stopc:settings";

/**
 * Settings persistence lives in localStorage — it's the source of
 * truth, is instant/synchronous to read, and (deliberately) never
 * stores clipboard content, only these small config values. The Rust
 * backend keeps an in-memory mirror (see src-tauri/src/state.rs)
 * because its own background threads — the clipboard poller and the
 * Funny Mode key listener — read settings synchronously and can't
 * reach into a webview's localStorage. So every save here also pushes
 * to Rust via `save_settings`, purely to keep that mirror current; Rust
 * no longer owns persistence itself.
 */

function readLocal(): StopCSettings | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Merge over defaults so a settings.json from an older version
    // (missing newer fields) doesn't leave them `undefined`.
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.error("[stopc] failed to read settings from localStorage:", e);
    return null;
  }
}

function writeLocal(settings: StopCSettings) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("[stopc] failed to write settings to localStorage:", e);
  }
}

/** Loads settings from localStorage, syncing Rust's in-memory copy to match. */
export async function loadSettings(): Promise<StopCSettings> {
  const local = readLocal() ?? DEFAULT_SETTINGS;
  try {
    await invoke("save_settings", { settings: local });
  } catch (e) {
    console.error("[stopc] failed to sync settings to backend on load:", e);
  }
  return local;
}

export async function saveSettings(settings: StopCSettings): Promise<void> {
  writeLocal(settings);
  await invoke("save_settings", { settings });
}

export async function resetSettingsBackend(): Promise<StopCSettings> {
  writeLocal(DEFAULT_SETTINGS);
  try {
    await invoke("reset_settings");
  } catch (e) {
    console.error("[stopc] failed to reset backend settings:", e);
  }
  return DEFAULT_SETTINGS;
}

/**
 * Subscribes to localStorage changes made in *other* windows of the
 * same app (the native `storage` event never fires in the window that
 * made the change, only siblings sharing the same origin/profile).
 * This is a supplementary sync path — the Rust `settings://updated`
 * event (see notification-main.tsx) is the reliable one that works
 * regardless of whether the OS webview shares a storage partition
 * across windows, so this is a "nice if available, harmless if not."
 */
export function subscribeToLocalSettingsChanges(onChange: (settings: StopCSettings) => void): () => void {
  const handler = (e: StorageEvent) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    try {
      onChange({ ...DEFAULT_SETTINGS, ...JSON.parse(e.newValue) });
    } catch {
      // ignore malformed cross-window payloads
    }
  };
  window.addEventListener("storage", handler);
  return () => window.removeEventListener("storage", handler);
}
