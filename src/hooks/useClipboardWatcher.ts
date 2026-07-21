import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useClipboardStore } from "@/store/clipboardStore";
import type { ClipboardEventPayload, FunnyModeEvent } from "@/types/clipboard";

/**
 * Subscribes to the two events emitted by the Rust backend:
 *   - "clipboard://changed"   fired on every detected clipboard change
 *   - "funny-mode://triggered" fired when repeated Ctrl+C without a
 *                              clipboard change crosses the threshold
 *
 * Mount this once near the app root (or in the notification window)
 * — it's cheap, but duplicate listeners would double-fire toasts.
 */
export function useClipboardWatcher(onFunnyMode?: (e: FunnyModeEvent) => void) {
  const pushEvent = useClipboardStore((s) => s.pushEvent);

  useEffect(() => {
    let unlistenClipboard: (() => void) | undefined;
    let unlistenFunny: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const un1 = await listen<ClipboardEventPayload>("clipboard://changed", (event) => {
        pushEvent(event.payload);
      });
      if (cancelled) {
        un1();
      } else {
        unlistenClipboard = un1;
      }

      const un2 = await listen<FunnyModeEvent>("funny-mode://triggered", (event) => {
        onFunnyMode?.(event.payload);
      });
      if (cancelled) {
        un2();
      } else {
        unlistenFunny = un2;
      }
    })();

    return () => {
      cancelled = true;
      unlistenClipboard?.();
      unlistenFunny?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
