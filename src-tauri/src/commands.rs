use std::sync::Arc;

use tauri::{AppHandle, Emitter, State};

use crate::notification::position_notification_window;
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
    // Broadcast to every window (notably the notification window, which
    // has its own isolated JS context and otherwise never learns about
    // a theme/sound/position change made from the Settings page until
    // the app restarts).
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
