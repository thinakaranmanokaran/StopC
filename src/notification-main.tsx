import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { NotificationPopup } from "@/components/NotificationPopup";
import { useClipboardWatcher } from "@/hooks/useClipboardWatcher";
import { useClipboardStore } from "@/store/clipboardStore";
import { useSettingsStore } from "@/store/settingsStore";
import type { ClipboardEventPayload } from "@/types/clipboard";

/**
 * Standalone React root for notification.html.
 * This runs in a small, transparent, always-on-top, click-through
 * Tauri window (see src-tauri/src/notification.rs) so the toast can
 * float above every other app without stealing focus.
 */
function NotificationWindow() {
  const settings = useSettingsStore((s) => s.settings);
  const lastEvent = useClipboardStore((s) => s.lastEvent);
  const [visibleEvent, setVisibleEvent] = useState<ClipboardEventPayload | null>(null);

  useClipboardWatcher();

  // Auto-hide after settings.durationMs; re-armed on every new event.
  React.useEffect(() => {
    if (!lastEvent || lastEvent.is_duplicate) return;
    setVisibleEvent(lastEvent);
    const t = setTimeout(() => setVisibleEvent(null), settings.durationMs);
    return () => clearTimeout(t);
  }, [lastEvent, settings.durationMs]);

  return (
    <NotificationPopup
      event={visibleEvent}
      theme={settings.theme}
      animation={settings.animation}
      opacity={settings.opacity}
      cornerRadius={settings.cornerRadius}
    />
  );
}

ReactDOM.createRoot(document.getElementById("notif-root")!).render(
  <React.StrictMode>
    <NotificationWindow />
  </React.StrictMode>
);
