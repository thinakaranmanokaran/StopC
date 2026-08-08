import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";

export interface UpdateInfo {
  available: boolean;
  currentVersion: string;
  latestVersion: string;
  downloadUrl: string | null;
  releaseUrl: string;
}

export interface DownloadProgress {
  downloaded: number;
  total: number;
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  return invoke<UpdateInfo>("check_for_updates");
}

/** Downloads the installer, launches it, then StopC exits so install can proceed. */
export async function downloadAndInstallUpdate(url: string): Promise<void> {
  await invoke("download_and_install_update", { url });
}

export function subscribeToUpdateProgress(
  onProgress: (p: DownloadProgress) => void
): Promise<() => void> {
  return listen<DownloadProgress>("update://progress", (event) => onProgress(event.payload)).then(
    (unlisten) => unlisten
  );
}

export function subscribeToUpdateStatus(onStatus: (status: string) => void): Promise<() => void> {
  return listen<string>("update://status", (event) => onStatus(event.payload)).then(
    (unlisten) => unlisten
  );
}
