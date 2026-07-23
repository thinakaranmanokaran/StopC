use std::sync::Arc;
use std::thread;
use std::time::Duration;

use tauri::{AppHandle, LogicalPosition, Manager, Monitor};

use crate::state::AppState;

const WINDOW_LABEL: &str = "notification";
const MARGIN: f64 = 16.0;

/// Positions the notification window at the configured screen corner,
/// shows it, and schedules it to hide again after `duration_ms`.
/// This is the piece that was previously missing: the window used to
/// only ever get *positioned*, never actually shown.
pub fn show_notification(app: &AppHandle, state: &Arc<AppState>) {
    let Some(window) = app.get_webview_window(WINDOW_LABEL) else {
        return;
    };

    let (position, duration_ms) = {
        let settings = state.settings.lock().unwrap();
        (settings.position.clone(), settings.duration_ms)
    };

    if let Some(monitor) = window.current_monitor().ok().flatten() {
        let (x, y) = compute_position(&monitor, &position, &window);
        let _ = window.set_position(LogicalPosition::new(x, y));
    }

    let _ = window.show();

    // Hide it again after the configured duration. Spawning a thread per
    // toast is cheap at this frequency; if this needs to be more precise
    // later (e.g. cancel-on-next-event so back-to-back copies don't
    // fight over the hide timer), swap this for a shared
    // debounce/generation counter in AppState.
    let window_clone = window.clone();
    thread::spawn(move || {
        thread::sleep(Duration::from_millis(duration_ms));
        let _ = window_clone.hide();
    });
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
        width: 360,
        height: 120,
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
