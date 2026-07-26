import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { Box, ThemeProvider } from "@mui/material";
import { NotificationPopup } from "@/components/NotificationPopup";
import { useClipboardStore } from "@/store/clipboardStore";
import { useSettingsStore, DEFAULT_SETTINGS } from "@/store/settingsStore";
import { loadSettings } from "@/services/settingsService";
import { playNotificationSound, playFunnySound } from "@/services/soundPlayer";
import { darkTheme } from "@/theme/theme";
import type { ClipboardEventPayload, FunnyModeEvent } from "@/types/clipboard";
import "@/assets/fonts/fonts.css";

/**
 * Standalone React root for notification.html — a separate, transparent,
 * always-on-top, frameless Tauri window (src-tauri/src/notification.rs)
 * so the toast can float above every other app.
 *
 * This window has its own isolated JS context (Zustand state in the
 * main dashboard window is NOT shared here), so settings are loaded
 * directly from the Rust backend on mount and kept live via the
 * "settings://updated" event the backend emits after every save.
 */
function NotificationWindow() {
  const settings = useSettingsStore((s) => s.settings);
  const replaceSettings = useSettingsStore((s) => s.replaceSettings);

  const [copyEvent, setCopyEvent] = useState<ClipboardEventPayload | null>(null);
  const [funnyEvent, setFunnyEvent] = useState<FunnyModeEvent | null>(null);

  // Hydrate + subscribe to live settings changes.
  useEffect(() => {
    loadSettings()
      .then(replaceSettings)
      .catch((e) => {
        console.error("[stopc] notification window: failed to load settings, using defaults:", e);
        replaceSettings(DEFAULT_SETTINGS);
      });

    const unlistenPromise = listen<typeof DEFAULT_SETTINGS>("settings://updated", (event) => {
      replaceSettings(event.payload);
    });
    return () => {
      unlistenPromise.then((unlisten) => unlisten());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clipboard + funny-mode event subscriptions, independent of the
  // shared Zustand store's own listener in the dashboard window.
  useEffect(() => {
    let unlistenCopy: (() => void) | undefined;
    let unlistenFunny: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      const un1 = await listen<ClipboardEventPayload>("clipboard://changed", (event) => {
        if (event.payload.isDuplicate) return;
        setCopyEvent(event.payload);
      });
      if (cancelled) un1();
      else unlistenCopy = un1;

      const un2 = await listen<FunnyModeEvent>("funny-mode://triggered", (event) => {
        setFunnyEvent(event.payload);
      });
      if (cancelled) un2();
      else unlistenFunny = un2;
    })();

    return () => {
      cancelled = true;
      unlistenCopy?.();
      unlistenFunny?.();
    };
  }, []);

  // Also mirror into the shared clipboard store so history/counts stay
  // consistent if this window is ever inspected/devtools'd.
  const pushEvent = useClipboardStore((s) => s.pushEvent);
  useEffect(() => {
    if (copyEvent) pushEvent(copyEvent);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyEvent]);

  // Auto-hide timers, and sound playback on genuinely new events.
  useEffect(() => {
    if (!copyEvent) return;
    playNotificationSound(settings);
    const t = setTimeout(() => setCopyEvent(null), settings.durationMs);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyEvent]);

  useEffect(() => {
    if (!funnyEvent) return;
    playFunnySound(settings);
    const t = setTimeout(() => setFunnyEvent(null), Math.max(settings.durationMs, 3500));
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [funnyEvent]);

  // The Rust-side notification window is a fixed size (see
  // tauri.conf.json) so it never needs to resize on show — instead this
  // wrapper edge-aligns the toast content to match settings.position,
  // so "bottom-right" visually hugs the window's bottom-right corner
  // regardless of whether the current toast is the compact copy toast
  // or the taller funny-mode one.
  const vertical = settings.position.startsWith("top") ? "flex-start" : "flex-end";
  const horizontal = settings.position.includes("left")
    ? "flex-start"
    : settings.position.includes("right")
      ? "flex-end"
      : "center";

  return (
    <Box
      sx={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: vertical,
        justifyContent: horizontal,
        p: 2,
        boxSizing: "border-box",
      }}
    >
      <NotificationPopup
        copyEvent={copyEvent}
        funnyEvent={funnyEvent}
        theme={settings.theme}
        animation={settings.animation}
        opacity={settings.opacity}
        cornerRadius={settings.cornerRadius}
        durationMs={funnyEvent ? Math.max(settings.durationMs, 3500) : settings.durationMs}
        mascotsEnabled={settings.mascotsEnabled}
      />
    </Box>
  );
}

ReactDOM.createRoot(document.getElementById("notif-root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <NotificationWindow />
    </ThemeProvider>
  </React.StrictMode>
);
