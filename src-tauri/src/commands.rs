use std::sync::Arc;

use tauri::{AppHandle, Emitter, State};

use crate::notification::{hide_notification, position_notification_window};
use crate::state::{AppState, Settings};

#[tauri::command]
pub fn get_settings(state: State<Arc<AppState>>) -> Settings {
    state.settings.lock().unwrap().clone()
}

#[tauri::command]
pub fn save_settings(
    app: AppHandle,
    state: State<Arc<AppState>>,
    settings: Settings,
) -> Result<(), String> {
    let position = settings.position.clone();
    {
        let mut guard = state.settings.lock().map_err(|e| e.to_string())?;
        *guard = settings.clone();
    }
    position_notification_window(&app, &position);
    // Broadcast to every window. The frontend's source of truth is
    // localStorage (shared across windows where the OS webview
    // supports it via the `storage` event), but this Tauri-level
    // broadcast is the one guaranteed to work regardless of webview
    // storage-partitioning quirks across platforms.
    let _ = app.emit("settings://updated", settings);
    Ok(())
}

#[tauri::command]
pub fn reset_settings(app: AppHandle, state: State<Arc<AppState>>) -> Settings {
    let defaults = Settings::default();
    *state.settings.lock().unwrap() = defaults.clone();
    let _ = app.emit("settings://updated", defaults.clone());
    defaults
}

/// The frontend calls this once its own (pausable-on-hover) countdown
/// finishes, or when a toast is drag-dismissed — see notification.rs
/// for why hiding isn't a fire-and-forget Rust-side timer anymore.
#[tauri::command]
pub fn record_copy_attempt(app: AppHandle, state: State<Arc<AppState>>) -> Result<(), String> {
    let settings = state
        .inner()
        .settings
        .lock()
        .map_err(|e| e.to_string())?
        .clone();

    if !settings.funny_mode_enabled {
        return Ok(());
    }

    crate::funny_mode::handle_repeat_attempt(&app, state.inner(), &settings);
    Ok(())
}

#[tauri::command]
pub fn hide_notification_window(app: AppHandle) {
    hide_notification(&app);
}
