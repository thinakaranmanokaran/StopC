use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::thread;

use rdev::{listen, Event, EventType, Key};
use serde::Serialize;
use tauri::{AppHandle, Emitter};

use crate::funny_messages::random_message;
use crate::state::AppState;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct FunnyModeEvent {
    pub repeat_count: u32,
    pub message: String,
    pub mascot: String,
}

/// Watches for Ctrl+C key combos system-wide and counts how many land
/// with no accompanying clipboard change (tracked via AppState, which
/// the clipboard watcher resets on every real change).
///
/// PLATFORM NOTES:
/// - macOS: requires the app to be granted Accessibility permission
///   (System Settings > Privacy & Security > Accessibility), or `rdev`
///   will silently receive no events. Prompt the user on first launch.
/// - Windows: low-level keyboard hooks (`SetWindowsHookEx`) can be
///   blocked by some security software / UAC contexts; document this
///   as a known limitation.
/// - Linux: X11 is supported; Wayland compositors vary in whether they
///   allow global key listening at all — this is a known gap.
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
                    on_ctrl_c(&app, &state);
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

    // The clipboard watcher runs on its own poll cycle; give it a brief
    // window to observe a real change before we decide this Ctrl+C was
    // a no-op. This avoids a race where Funny Mode fires on the very
    // press that *did* copy something new.
    let settle = std::cmp::min(settings.poll_interval_ms + 50, 500);
    thread::sleep(std::time::Duration::from_millis(settle));

    let count = state.repeat_count.fetch_add(1, Ordering::SeqCst) + 1;

    if count >= settings.funny_mode_threshold {
        let (message, mascot) = random_message();
        let payload = FunnyModeEvent {
            repeat_count: count,
            message: message.to_string(),
            mascot: mascot.to_string(),
        };
        if let Err(e) = app.emit("funny-mode://triggered", payload) {
            eprintln!("[stopc] failed to emit funny-mode event: {e}");
        }
        // Reset so the next few presses build back up rather than
        // spamming a popup on every single subsequent press.
        state.repeat_count.store(0, Ordering::SeqCst);
    }
}
