use std::sync::Arc;

use tauri::{AppHandle, LogicalPosition, LogicalSize, Manager, Monitor};

use crate::state::AppState;

const WINDOW_LABEL: &str = "notification";
// Small offset from the screen edge; the rest of the visual spacing to
// the toast itself comes from padding inside the (larger, transparent)
// notification window — see src/notification-main.tsx's edge-aligned
// flex wrapper.
const MARGIN: f64 = 8.0;

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

fn logical_size(window: &tauri::WebviewWindow) -> (f64, f64) {
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
