use std::sync::Arc;

use tauri::{AppHandle, State};

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
        *guard = settings;
    }
    position_notification_window(&app, &position);
    Ok(())
}

#[tauri::command]
pub fn reset_settings(state: State<Arc<AppState>>) -> Settings {
    let defaults = Settings::default();
    *state.settings.lock().unwrap() = defaults.clone();
    defaults
}
