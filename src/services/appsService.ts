import { invoke } from "@tauri-apps/api/core";

export interface InstalledApp {
  name: string;
  /** Lowercased exe basename, e.g. "code.exe". Empty if unresolved. */
  exe: string;
}

/**
 * Reads the Windows "installed programs" list (Uninstall registry
 * keys). Returns an empty array on other platforms — Exclusions is a
 * Windows-only feature for now (see src-tauri/src/apps.rs).
 */
export async function listInstalledApps(): Promise<InstalledApp[]> {
  return invoke<InstalledApp[]>("list_installed_apps_cmd");
}
