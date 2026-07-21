use tauri::{AppHandle, LogicalPosition, Manager, Monitor};

const WINDOW_LABEL: &str = "notification";
const MARGIN: f64 = 16.0;

/// Moves the notification window to the configured screen corner and
/// shows it. The window itself listens for `clipboard://changed` and
/// handles its own auto-hide timer (see src/notification-main.tsx) —
/// this just makes sure it's in the right place before content lands.
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
        _ => (screen_w - win_w - MARGIN, MARGIN), // default: top-right
    }
}
