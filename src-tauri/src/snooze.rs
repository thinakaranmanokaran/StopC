use std::sync::atomic::Ordering;
use std::sync::Arc;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;
use tauri::{AppHandle, Emitter, Manager, State};
use tauri_plugin_notification::NotificationExt;

use crate::state::AppState;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SnoozeState {
    /// Unix-millis timestamp until which notifications are snoozed.
    /// 0 means "not snoozed".
    pub snoozed_until_ms: u64,
}

pub fn now_ms() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}

/// True if notifications (toasts, sounds, and Funny Mode) are currently
/// snoozed.
pub fn is_snoozed(state: &AppState) -> bool {
    state.snoozed_until_ms.load(Ordering::SeqCst) > now_ms()
}

fn current_state(state: &AppState) -> SnoozeState {
    let until = state.snoozed_until_ms.load(Ordering::SeqCst);
    let until = if until > now_ms() { until } else { 0 };
    SnoozeState { snoozed_until_ms: until }
}

fn broadcast(app: &AppHandle, state: &AppState) {
    let _ = app.emit("snooze://updated", current_state(state));
}

/// Applies a snooze for `seconds` starting now. Used both by the
/// Settings-page "Snooze Now" button and the tray "Snooze" menu item
/// (which always applies the currently configured duration).
pub fn apply_snooze(app: &AppHandle, state: &Arc<AppState>, seconds: u64) {
    let until = now_ms() + seconds.saturating_mul(1000);
    state.snoozed_until_ms.store(until, Ordering::SeqCst);
    broadcast(app, state);
    notify_snooze_applied(app, seconds);
}

pub fn cancel(app: &AppHandle, state: &Arc<AppState>) {
    state.snoozed_until_ms.store(0, Ordering::SeqCst);
    broadcast(app, state);
}

fn format_duration(seconds: u64) -> String {
    match seconds {
        0..=59 => format!("{seconds}s"),
        60..=3599 => format!("{}m", seconds / 60),
        3600..=86399 => format!("{}h", seconds / 3600),
        _ => format!("{}d", seconds / 86400),
    }
}

/// Tray actions have no visible surface of their own, so a quick native
/// notification is the only feedback the user gets that it worked.
fn notify_snooze_applied(app: &AppHandle, seconds: u64) {
    let _ = app
        .notification()
        .builder()
        .title("StopC snoozed")
        .body(format!("Notifications are paused for {}.", format_duration(seconds)))
        .show();
}

/// Called from the tray "Snooze" menu item — applies whatever duration
/// is currently configured in Settings.
pub fn snooze_from_tray(app: &AppHandle) {
    let state: Arc<AppState> = app.state::<Arc<AppState>>().inner().clone();
    let seconds = state.settings.lock().unwrap().snooze_duration_seconds;
    apply_snooze(app, &state, seconds);
}

pub fn cancel_from_tray(app: &AppHandle) {
    let state: Arc<AppState> = app.state::<Arc<AppState>>().inner().clone();
    cancel(app, &state);
}

#[tauri::command]
pub fn get_snooze_state(state: State<Arc<AppState>>) -> SnoozeState {
    current_state(state.inner())
}

#[tauri::command]
pub fn set_snooze(app: AppHandle, state: State<Arc<AppState>>, seconds: u64) -> SnoozeState {
    let inner = state.inner().clone();
    apply_snooze(&app, &inner, seconds);
    current_state(&inner)
}

#[tauri::command]
pub fn cancel_snooze(app: AppHandle, state: State<Arc<AppState>>) -> SnoozeState {
    let inner = state.inner().clone();
    cancel(&app, &inner);
    current_state(&inner)
}
