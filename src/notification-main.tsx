import React, { useCallback, useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import { listen } from "@tauri-apps/api/event";
import { invoke } from "@tauri-apps/api/core";
import { Box, ThemeProvider } from "@mui/material";
import { AnimatePresence } from "framer-motion";
import { NotificationPopup } from "@/components/NotificationPopup";
import { useSettingsStore, DEFAULT_SETTINGS } from "@/store/settingsStore";
import { loadSettings } from "@/services/settingsService";
import { playNotificationSound, playFunnySound, playSystemSound } from "@/services/soundPlayer";
import { darkTheme } from "@/theme/theme";
import type { ClipboardEventPayload, FunnyModeEvent } from "@/types/clipboard";
import type { ActiveToast } from "@/types/toast";
import { personalizeMessage } from "@/utils/personalize";
import "@/assets/fonts/fonts.css";

const FUNNY_MIN_DURATION_MS = 3500;
const SYSTEM_DURATION_MS = 2200;

/**
 * Standalone React root for notification.html — a separate, transparent,
 * always-on-top, frameless Tauri window (src-tauri/src/notification.rs)
 * so the toast can float above every other app.
 *
 * This window has its own isolated JS context, so settings are loaded
 * directly on mount and kept live via the "settings://updated" event
 * the backend broadcasts after every save.
 *
 * Every toast kind (copy / funny / system) flows through ONE state
 * variable and ONE timer/sound codepath below — earlier versions had
 * separate copy/funny effects which made it easy for the two to drift
 * out of sync (e.g. sound firing for one kind but not the other).
 */
function NotificationWindow() {
  const settings = useSettingsStore((s) => s.settings);
  const replaceSettings = useSettingsStore((s) => s.replaceSettings);

  const [toast, setToast] = useState<ActiveToast | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Pausable-timer bookkeeping (refs so they survive re-renders without
  // re-triggering effects).
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const remainingMsRef = useRef(0);
  const segmentStartRef = useRef(0);
  const durationRef = useRef(0);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
    setIsPaused(false);
    invoke("hide_notification_window").catch(() => {
      /* window may already be hidden; harmless */
    });
  }, []);

  const armTimer = useCallback((ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    remainingMsRef.current = ms;
    segmentStartRef.current = Date.now();
    timerRef.current = setTimeout(dismiss, ms);
  }, [dismiss]);

  const handleHoverChange = useCallback((hovering: boolean) => {
    setIsPaused(hovering);
    if (hovering) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      const elapsed = Date.now() - segmentStartRef.current;
      remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
    } else {
      segmentStartRef.current = Date.now();
      timerRef.current = setTimeout(dismiss, remainingMsRef.current);
    }
  }, [dismiss]);

  const showToast = useCallback(
    (next: ActiveToast, durationMs: number, playSound: () => void) => {
      playSound();
      setToast(next);
      durationRef.current = durationMs;
      armTimer(durationMs);
    },
    [armTimer]
  );

  // Hydrate settings + subscribe to live updates from the backend.
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

  // Event subscriptions — all three kinds funnel into the same showToast().
  useEffect(() => {
    const unlisteners: Array<() => void> = [];
    let cancelled = false;

    (async () => {
      const un1 = await listen<ClipboardEventPayload>("clipboard://changed", (event) => {
        if (event.payload.isDuplicate) return;
        const current = useSettingsStore.getState().settings;
        showToast(
          { id: `copy-${event.payload.timestamp}`, kind: "copy", copy: event.payload },
          current.durationMs,
          () => playNotificationSound(current)
        );
      });
      if (cancelled) un1();
      else unlisteners.push(un1);

      const un2 = await listen<FunnyModeEvent>("funny-mode://triggered", (event) => {
        const current = useSettingsStore.getState().settings;
        const personalized = { ...event.payload, message: personalizeMessage(event.payload.message, current.userName) };
        showToast(
          { id: `funny-${Date.now()}`, kind: "funny", funny: personalized },
          Math.max(current.durationMs, FUNNY_MIN_DURATION_MS),
          () => playFunnySound(current)
        );
      });
      if (cancelled) un2();
      else unlisteners.push(un2);

      // Generic app-level toast — e.g. "Settings saved" from the
      // dashboard's Settings page — so the app never falls back to a
      // separate MUI Snackbar for its own confirmations.
      const un3 = await listen<{ title: string; message: string }>("app://toast", (event) => {
        const current = useSettingsStore.getState().settings;
        showToast(
          { id: `system-${Date.now()}`, kind: "system", system: event.payload },
          SYSTEM_DURATION_MS,
          () => playSystemSound(current)
        );
      });
      if (cancelled) un3();
      else unlisteners.push(un3);
    })();

    return () => {
      cancelled = true;
      unlisteners.forEach((u) => u());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showToast]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  // Fixed-size transparent window (see tauri.conf.json) — content
  // edge-aligns to match settings.position so "bottom-right" hugs that
  // corner regardless of which toast kind is showing.
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
        pr: 1,
        boxSizing: "border-box",
      }}
    >
      <AnimatePresence>
        {toast && (
          <NotificationPopup
            key={toast.id}
            toast={toast}
            theme={settings.theme}
            animation={settings.animation}
            opacity={settings.opacity}
            cornerRadius={settings.cornerRadius}
            durationMs={durationRef.current}
            mascotsEnabled={settings.mascotsEnabled}
            showCounter={settings.showCounter}
            isPaused={isPaused}
            onHoverChange={handleHoverChange}
            onDismiss={dismiss}
          />
        )}
      </AnimatePresence>
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
