import { invoke } from "@tauri-apps/api/core";
import type { StopCSettings } from "@/store/settingsStore";

/**
 * Talks to the Rust `AppState.settings` (src-tauri/src/commands.rs).
 * Field names must stay camelCase on both sides — the Rust `Settings`
 * struct uses `#[serde(rename_all = "camelCase", default)]`, so any
 * field this frontend omits just falls back to the Rust-side default
 * rather than failing the whole save.
 */
export async function loadSettings(): Promise<StopCSettings> {
  return invoke<StopCSettings>("get_settings");
}

export async function saveSettings(settings: StopCSettings): Promise<void> {
  await invoke("save_settings", { settings });
}

export async function resetSettingsBackend(): Promise<StopCSettings> {
  return invoke<StopCSettings>("reset_settings");
}
