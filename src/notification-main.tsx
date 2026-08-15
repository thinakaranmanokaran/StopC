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

// Matches the wrapper Box's `p: 2, pr: 1` spacing (see the render below).
// Used to shrink-wrap the transparent window around the toast so the
// invisible window region doesn't eat mouse clicks elsewhere on screen.
const TOAST_PADDING = { top: 16, bottom: 16, left: 16, right: 4 };
// Extra window room so enter animations aren't clipped at the window
// edge. `slide` enters from +80px horizontally, `spring` from -24px.
const SLIDE_SLACK_X = 80;
const SPRING_SLACK_Y = 24;

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
  const toastRef = useRef<HTMLDivElement | null>(null);

  // Single auto-dismiss timer. The notification window is fully
  // click-through (see src-tauri/src/notification.rs), so there's no
  // hover-pause or drag-to-dismiss interaction anymore — the toast just
  // lives out its `durationMs` and the frontend hides the window.
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const durationRef = useRef(0);

  const dismiss = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setToast(null);
    invoke("hide_notification_window").catch(() => {
      /* window may already be hidden; harmless */
    });
  }, []);

  const armTimer = useCallback((ms: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(dismiss, ms);
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

  // The notification window starts out at 380x260 (tauri.conf.json).
  // Once a toast renders we resize the window down to just the toast +
  // padding + animation slack and re-anchor it to the configured corner,
  // so the transparent window no longer blocks clicks across a large
  // invisible rectangle (e.g. over Chrome's bookmark bar).
  const fitWindowToToast = useCallback(() => {
    const el = toastRef.current;
    if (!el) return;
    const toastW = el.offsetWidth;
    const toastH = el.offsetHeight;
    if (toastW <= 0 || toastH <= 0) return;

    const { animation, position } = useSettingsStore.getState().settings;

    // `slide` enters from +80px (the right). Anchored to a right-side
    // corner the overshoot leaves the screen and is clipped naturally at
    // the window/screen edge, so no extra room is needed there.
    const slackX = animation === "slide" && !position.includes("right") ? SLIDE_SLACK_X : 0;
    // `spring` enters from -24px (above); only top-anchored corners need
    // the extra headroom so the toast isn't clipped during the entrance.
    const slackY = animation === "spring" && position.startsWith("top") ? SPRING_SLACK_Y : 0;

    const width = toastW + TOAST_PADDING.left + TOAST_PADDING.right + slackX;
    const height = toastH + TOAST_PADDING.top + TOAST_PADDING.bottom + slackY;

    invoke("resize_notification_window", {
      width: Math.ceil(width),
      height: Math.ceil(height),
    }).catch((e) => console.error("[stopc] failed to shrink notification window:", e));
  }, []);

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
        // Suppressed = snoozed, or copied while an excluded app was in
        // the foreground. Still tracked in the dashboard's history via
        // useClipboardWatcher — just no toast, no sound.
        if (event.payload.suppressed) return;
        const current = useSettingsStore.getState().settings;
        // Duplicate copies (same content re-copied) only surface as
        // toasts when Funny Mode is OFF — with it on, they're Funny
        // Mode's job.
        if (event.payload.isDuplicate && current.funnyModeEnabled) return;
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

  // Shrink the window around the toast as soon as it's on screen.
  useEffect(() => {
    if (!toast) return;
    const raf = requestAnimationFrame(fitWindowToToast);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast]);

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
            toastRef={toastRef}
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
