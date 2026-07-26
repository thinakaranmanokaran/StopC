use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;

use rdev::{listen, Event, EventType, Key};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::funny_messages::{random_message, Mood};
use crate::state::AppState;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FunnyModeEvent {
    pub repeat_count: u32,
    pub message: String,
    pub mood: Mood,
}

/// Watches for Ctrl+C key combos system-wide and counts how many land
/// with no accompanying clipboard change (tracked via AppState, which
/// the clipboard watcher resets on every real change).
///
/// PLATFORM NOTES:
/// - macOS: requires Accessibility permission (System Settings > Privacy
///   & Security > Accessibility) or `rdev` silently receives no events.
/// - Windows: low-level keyboard hooks can be blocked by security
///   software, and won't see keys typed into an *elevated* window while
///   StopC itself runs unelevated (a Windows UIPI restriction, not a
///   StopC bug) — copying from an app "Run as administrator" won't be
///   detected by Funny Mode in that case.
/// - Linux: X11 is supported; Wayland global key listening varies by
///   compositor.
pub fn spawn_key_listener(app: AppHandle, state: Arc<AppState>) {
    thread::spawn(move || {
        let ctrl_down = Arc::new(AtomicBool::new(false));
        let ctrl_down_cb = ctrl_down.clone();

        let callback = move |event: Event| {
            match event.event_type {
                EventType::KeyPress(Key::ControlLeft) | EventType::KeyPress(Key::ControlRight) => {
                    ctrl_down_cb.store(true, Ordering::SeqCst);
                }
                EventType::KeyRelease(Key::ControlLeft)
                | EventType::KeyRelease(Key::ControlRight) => {
                    ctrl_down_cb.store(false, Ordering::SeqCst);
                }
                EventType::KeyPress(Key::KeyC) if ctrl_down_cb.load(Ordering::SeqCst) => {
                    // IMPORTANT: rdev's `listen` callback runs *synchronously*
                    // on the OS-level global-hook thread. The previous
                    // version of this code called a settle-delay + counting
                    // routine directly here, which blocked that hook thread
                    // for up to 500ms on every single Ctrl+C — under rapid
                    // repeated presses, this caused the OS to drop or
                    // coalesce keystrokes before they ever reached this
                    // callback, so most presses were silently lost and the
                    // funny-mode threshold was rarely reached. Spawning a
                    // fresh thread per press keeps the hook thread free.
                    let app = app.clone();
                    let state = state.clone();
                    thread::spawn(move || on_ctrl_c(&app, &state));
                }
                _ => {}
            }
        };

        if let Err(e) = listen(callback) {
            eprintln!("[stopc] key listener failed to start: {:?}", e);
            eprintln!("[stopc] on macOS this usually means Accessibility permission is missing.");
        }
    });
}

fn on_ctrl_c(app: &AppHandle, state: &Arc<AppState>) {
    let settings = state.settings.lock().unwrap().clone();
    if !settings.funny_mode_enabled {
        return;
    }

    // Give the clipboard watcher's poll cycle a brief window to observe
    // a real change before deciding this Ctrl+C was a no-op — avoids a
    // race where Funny Mode fires on the very press that *did* copy
    // something new. Safe to block here now since this runs on its own
    // thread, not the OS hook thread.
    let settle = std::cmp::min(settings.poll_interval_ms + 50, 500);
    thread::sleep(std::time::Duration::from_millis(settle));

    let count = state.repeat_count.fetch_add(1, Ordering::SeqCst) + 1;

    if count >= settings.funny_mode_threshold {
        let (message, mood) = random_message();
        let payload = FunnyModeEvent {
            repeat_count: count,
            message: message.to_string(),
            mood,
        };
        if let Err(e) = app.emit("funny-mode://triggered", payload) {
            eprintln!("[stopc] failed to emit funny-mode event: {e}");
        }
        crate::notification::show_notification(app, state, "funny");
        // Reset so the next few presses build back up rather than
        // spamming a popup on every single subsequent press.
        state.repeat_count.store(0, Ordering::SeqCst);
    }
}
