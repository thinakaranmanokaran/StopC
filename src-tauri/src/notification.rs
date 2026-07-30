use std::sync::Arc;

use tauri::{AppHandle, LogicalPosition, Manager, Monitor};

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
        let (x, y) = compute_position(&monitor, &position, &window);
        let _ = window.set_position(LogicalPosition::new(x, y));
    }

    let _ = window.show();
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
    let (x, y) = compute_position(&monitor, position, &window);
    let _ = window.set_position(LogicalPosition::new(x, y));
}

fn compute_position(monitor: &Monitor, position: &str, window: &tauri::WebviewWindow) -> (f64, f64) {
    let screen_size = monitor.size();
    let scale = monitor.scale_factor();
    let screen_w = screen_size.width as f64 / scale;
    let screen_h = screen_size.height as f64 / scale;

    let win_size = window.outer_size().unwrap_or(tauri::PhysicalSize {
        width: 380,
        height: 260,
    });
    let win_w = win_size.width as f64 / scale;
    let win_h = win_size.height as f64 / scale;

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
