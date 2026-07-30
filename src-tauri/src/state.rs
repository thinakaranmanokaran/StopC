use std::sync::atomic::{AtomicU32, AtomicU64, Ordering};
use std::sync::Mutex;

/// Process-wide state shared between the clipboard watcher thread,
/// the Ctrl+C key-listener thread, and Tauri command handlers.
pub struct AppState {
    /// Hash of the last clipboard content we emitted an event for.
    pub last_hash: Mutex<u64>,
    /// Millis timestamp (unix epoch) of the last real clipboard change.
    pub last_change_at: AtomicU64,
    /// Consecutive Ctrl+C presses observed with no clipboard change.
    pub repeat_count: AtomicU32,
    pub settings: Mutex<Settings>,
}

impl Default for AppState {
    fn default() -> Self {
        Self {
            last_hash: Mutex::new(0),
            last_change_at: AtomicU64::new(0),
            repeat_count: AtomicU32::new(0),
            settings: Mutex::new(Settings::default()),
        }
    }
}

impl AppState {
    pub fn reset_funny_counter(&self) {
        self.repeat_count.store(0, Ordering::SeqCst);
    }
}

/// Mirrors `StopCSettings` on the frontend (src/store/settingsStore.ts).
/// The frontend's localStorage is the actual persistence layer (see
/// src/services/settingsService.ts) — this in-memory copy exists so
/// Rust's own background threads (clipboard poller, Funny Mode key
/// listener) can read current settings synchronously without crossing
/// into a webview's localStorage, and so it can broadcast
/// "settings://updated" to keep every window's copy in sync.
///
/// IMPORTANT: every field here must have a matching camelCase field in
/// StopCSettings on the frontend, or a round-trip through this struct
/// (e.g. the settings://updated broadcast after a save) will silently
/// drop it from the frontend's copy even though it's still safe in
/// localStorage.
#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
#[serde(rename_all = "camelCase", default)]
pub struct Settings {
    pub theme: String,
    pub animation: String,
    pub position: String,
    pub duration_ms: u64,
    pub opacity: f32,
    pub corner_radius: u32,
    pub funny_mode_enabled: bool,
    pub mascots_enabled: bool,
    pub sound_enabled: bool,
    pub sound_pack: String,
    pub sound_volume: f32,
    pub auto_start: bool,
    /// How many no-op Ctrl+C presses in a row trigger a Funny Mode popup.
    pub funny_mode_threshold: u32,
    /// How often (ms) the clipboard is polled. See clipboard.rs for why
    /// this is polling rather than a true push-based OS event.
    pub poll_interval_ms: u64,
    /// Show a toast when a text/rich-text/HTML copy is detected.
    pub notify_on_text: bool,
    /// Show a toast when an image copy is detected.
    pub notify_on_image: bool,
    /// Show the countdown progress bar along the bottom of the toast.
    pub show_counter: bool,
    /// Set via the first-run name screen; editable in Settings. Empty
    /// string means "not set" — Rust doesn't otherwise use this value,
    /// it's purely carried through for cross-window sync.
    pub user_name: String,
}

// `#[serde(default)]` on the struct above means any field missing from
// a payload (e.g. an older saved settings shape) is silently filled
// from Default::default() below, instead of failing the whole
// deserialization. Keep this in sync with settingsStore.ts.
impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: "material".into(),
            animation: "spring".into(),
            position: "top-right".into(),
            duration_ms: 2000,
            opacity: 0.96,
            corner_radius: 16,
            funny_mode_enabled: true,
            mascots_enabled: true,
            sound_enabled: true,
            sound_pack: "pop".into(),
            sound_volume: 0.6,
            auto_start: true,
            funny_mode_threshold: 2,
            poll_interval_ms: 300,
            notify_on_text: true,
            notify_on_image: true,
            show_counter: true,
            user_name: String::new(),
        }
    }
}
