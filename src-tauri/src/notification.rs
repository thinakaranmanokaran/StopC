use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use std::time::Duration;

use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, Monitor, WebviewWindow};

use crate::state::AppState;

const WINDOW_LABEL: &str = "notification";
// Small offset from the screen edge; the rest of the visual spacing to
// the toast itself comes from padding inside the (larger, transparent)
// notification window — see src/notification-main.tsx's edge-aligned
// flex wrapper.
const MARGIN: f64 = 8.0;

/// Set by the frontend while the user is dragging the toast. Keeps the
/// window interactive even when the pointer leaves the (small, shrink-
/// wrapped) window rect mid-drag.
static DRAGGING: AtomicBool = AtomicBool::new(false);

pub fn set_dragging(dragging: bool) {
    DRAGGING.store(dragging, Ordering::Relaxed);
}

/// Positions the notification window at the configured screen corner
/// and shows it. Hiding is NOT handled here — the frontend owns that
/// (see `hide_notification_window` in commands.rs), because it needs
/// to pause the countdown on hover and resume it on mouse-leave, which
/// a fire-and-forget Rust-side timer can't react to.
pub fn show_notification(app: &AppHandle, state: &Arc<AppState>, _kind: &str) {
    let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
        return;
    };

    let position = state.settings.lock().unwrap().position.clone();

    if let Some(monitor) = window.current_monitor().ok().flatten() {
        let (win_w, win_h) = logical_size(&window);
        let (x, y) = compute_position(&monitor, &position, win_w, win_h);
        let _ = window.set_position(LogicalPosition::new(x, y));
    }

    // Re-assert always-on-top around `.show()`. The window is created
    // topmost (tauri.conf.json) but merely calling `.show()` on a hidden
    // window does not always raise it above other topmost/fullscreen
    // windows (e.g. Edge in fullscreen on Windows). Re-applying the
    // flag re-inserts us at the top of the topmost z-order band, so the
    // toast floats above every application — the native equivalent of a
    // huge z-index.
    let _ = window.set_always_on_top(true);
    let _ = window.show();
    let _ = window.set_always_on_top(true);
    // Click-through is owned by `start_cursor_watcher`: the window passes
    // clicks through while idle, but becomes interactive whenever the
    // pointer is over the toast so hover-pause and drag-to-dismiss work.
}

/// Hides the notification window. Called by the frontend once its own
/// (pausable) countdown actually finishes, or the toast is drag-dismissed.
pub fn hide_notification(app: &AppHandle) {
    if let Some(window) = app.get_webview_window(WINDOW_LABEL) {
        let _ = window.hide();
    }
}

/// Repositions the notification window without showing/hiding it —
/// used when the user changes the position setting while idle.
pub fn position_notification_window(app: &AppHandle, position: &str) {
    let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
        return;
    };
    let Some(monitor) = window.current_monitor().ok().flatten() else {
        return;
    };
    let (win_w, win_h) = logical_size(&window);
    let (x, y) = compute_position(&monitor, position, win_w, win_h);
    let _ = window.set_position(LogicalPosition::new(x, y));
}

/// Shrink-wraps the transparent notification window around the rendered
/// toast. The window is configured at 380x260 (see tauri.conf.json) to
/// leave animation room, but once the toast has actually rendered we can
/// resize it down to just the toast + padding and re-anchor it to the
/// same corner.
///
/// Without this the whole 380x260 region swallows mouse clicks even
/// where it's fully transparent — an invisible dead zone that makes a
/// big chunk of the screen (e.g. Chrome's bookmark bar in the top-right)
/// unclickable for as long as a toast is on screen.
pub fn resize_notification_window(app: &AppHandle, state: &Arc<AppState>, width: f64, height: f64) {
    let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
        return;
    };
    if width <= 0.0 || height <= 0.0 {
        return;
    }
    let _ = window.set_size(LogicalSize::new(width, height));
    let position = state.settings.lock().unwrap().position.clone();
    if let Some(monitor) = window.current_monitor().ok().flatten() {
        let (x, y) = compute_position(&monitor, &position, width, height);
        let _ = window.set_position(LogicalPosition::new(x, y));
    }
}

/// Keeps the transparent toast window click-through except while the
/// pointer is actually over it. This restores hover-pause and drag-to-
/// dismiss without reintroducing an invisible dead zone over other apps.
#[cfg(windows)]
pub fn start_cursor_watcher(app: AppHandle) {
    use winapi::shared::windef::POINT;
    use winapi::um::winuser::GetCursorPos;

    std::thread::spawn(move || {
        let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
            return;
        };
        let mut interactive = false;

        loop {
            std::thread::sleep(Duration::from_millis(80));

            // During a drag the pointer can travel outside the small
            // shrink-wrapped window; stay interactive until it ends.
            let inside = DRAGGING.load(Ordering::Relaxed)
                || (window.is_visible().unwrap_or(false)
                    && unsafe {
                        let mut pt = POINT { x: 0, y: 0 };
                        GetCursorPos(&mut pt) != 0
                            && match (window.outer_position(), window.outer_size()) {
                                (Ok(pos), Ok(size)) => {
                                    pt.x >= pos.x
                                        && pt.x < pos.x.saturating_add(size.width as i32)
                                        && pt.y >= pos.y
                                        && pt.y < pos.y.saturating_add(size.height as i32)
                                }
                                _ => false,
                            }
                    });

            if inside != interactive {
                let _ = window.set_ignore_cursor_events(!inside);
                interactive = inside;
            }
        }
    });
}

#[cfg(not(windows))]
pub fn start_cursor_watcher(_app: AppHandle) {}

fn logical_size(window: &WebviewWindow) -> (f64, f64) {
    let size = window
        .outer_size()
        .unwrap_or(tauri::PhysicalSize {
            width: 380,
            height: 260,
        });
    let scale = window.scale_factor().unwrap_or(1.0);
    (size.width as f64 / scale, size.height as f64 / scale)
}

fn compute_position(monitor: &Monitor, position: &str, win_w: f64, win_h: f64) -> (f64, f64) {
    let screen_size = monitor.size();
    let scale = monitor.scale_factor();
    let screen_w = screen_size.width as f64 / scale;
    let screen_h = screen_size.height as f64 / scale;

    match position {
        "top-left" => (MARGIN, MARGIN),
        "top-center" => ((screen_w - win_w) / 2.0, MARGIN),
        "top-right" => (screen_w - win_w - MARGIN, MARGIN),
        "bottom-left" => (MARGIN, screen_h - win_h - MARGIN),
        "bottom-center" => ((screen_w - win_w) / 2.0, screen_h - win_h - MARGIN),
        "bottom-right" => (screen_w - win_w - MARGIN, screen_h - win_h - MARGIN),
        _ => (screen_w - win_w - MARGIN, MARGIN),
    }
}
