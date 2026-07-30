import { emit } from "@tauri-apps/api/event";

/**
 * Broadcasts an "app://toast" event, which the notification window
 * (src/notification-main.tsx) picks up and renders through the exact
 * same toast component/theme/sound pipeline as copy and funny-mode
 * notifications — so the app never falls back to a separate MUI
 * Snackbar for its own confirmations (e.g. "Settings saved").
 */
export async function notify(title: string, message: string): Promise<void> {
  try {
    await emit("app://toast", { title, message });
  } catch (e) {
    console.error("[stopc] failed to emit app toast:", e);
  }
}
