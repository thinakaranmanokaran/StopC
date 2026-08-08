import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { useSnoozeStore } from "@/store/snoozeStore";

export interface SnoozeState {
  snoozedUntilMs: number;
}

export async function getSnoozeState(): Promise<SnoozeState> {
  return invoke<SnoozeState>("get_snooze_state");
}

export async function setSnooze(seconds: number): Promise<SnoozeState> {
  return invoke<SnoozeState>("set_snooze", { seconds });
}

export async function cancelSnooze(): Promise<SnoozeState> {
  return invoke<SnoozeState>("cancel_snooze");
}

/**
 * Subscribes to "snooze://updated", broadcast whenever the backend's
 * snooze state changes — including from the tray "Snooze" item, which
 * no window UI triggers directly. Mount once near the app root.
 */
export function subscribeToSnoozeUpdates(): Promise<() => void> {
  return listen<SnoozeState>("snooze://updated", (event) => {
    useSnoozeStore.getState().setSnoozedUntilMs(event.payload.snoozedUntilMs);
  }).then((unlisten) => unlisten);
}
