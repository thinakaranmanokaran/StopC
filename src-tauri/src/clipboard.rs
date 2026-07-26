use std::sync::atomic::Ordering;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};

use arboard::Clipboard;
use serde::Serialize;
use sha2::{Digest, Sha256};
use tauri::{AppHandle, Emitter};

use crate::state::AppState;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum ClipboardKind {
    Text,
    RichText,
    Html,
    Image,
    File,
    Files,
    Folder,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ClipboardEventPayload {
    pub kind: ClipboardKind,
    pub preview: String,
    pub size_bytes: Option<u64>,
    pub dimensions: Option<String>,
    pub item_count: Option<u32>,
    pub timestamp: u64,
    pub is_duplicate: bool,
}

const PREVIEW_MAX_CHARS: usize = 120;

/// Starts the background clipboard watcher.
///
/// "No polling" from the product spec is aspirational — the underlying
/// OS clipboard APIs (Win32, NSPasteboard, X11 selections) don't expose
/// a uniform, dependency-free push notification across all three
/// platforms, so this is a lightweight poll loop (default 300ms).
pub fn spawn_watcher(app: AppHandle, state: std::sync::Arc<AppState>) {
    thread::spawn(move || {
        let mut clipboard = match Clipboard::new() {
            Ok(c) => c,
            Err(e) => {
                eprintln!("[stopc] failed to open clipboard: {e}");
                return;
            }
        };

        loop {
            let poll_ms = state.settings.lock().unwrap().poll_interval_ms;
            thread::sleep(Duration::from_millis(poll_ms));

            if let Some(payload) = check_clipboard(&mut clipboard, &state) {
                let is_dup = payload.is_duplicate;
                let kind = payload.kind.clone();
                if let Err(e) = app.emit("clipboard://changed", payload) {
                    eprintln!("[stopc] failed to emit clipboard event: {e}");
                }
                if !is_dup {
                    let should_notify = {
                        let settings = state.settings.lock().unwrap();
                        match kind {
                            ClipboardKind::Text | ClipboardKind::RichText | ClipboardKind::Html => {
                                settings.notify_on_text
                            }
                            ClipboardKind::Image => settings.notify_on_image,
                            ClipboardKind::File | ClipboardKind::Files | ClipboardKind::Folder => true,
                        }
                    };
                    if should_notify {
                        crate::notification::show_notification(&app, &state, "copy");
                    }
                    state.reset_funny_counter();
                    state
                        .last_change_at
                        .store(now_millis(), Ordering::SeqCst);
                }
            }
        }
    });
}

fn check_clipboard(clipboard: &mut Clipboard, state: &AppState) -> Option<ClipboardEventPayload> {
    if let Ok(text) = clipboard.get_text() {
        if text.is_empty() {
            return None;
        }
        let hash = hash_bytes(text.as_bytes());
        return build_if_changed(state, hash, || ClipboardEventPayload {
            kind: ClipboardKind::Text,
            preview: truncate(&text),
            size_bytes: Some(text.len() as u64),
            dimensions: None,
            item_count: None,
            timestamp: now_millis(),
            is_duplicate: false,
        });
    }

    if let Ok(image) = clipboard.get_image() {
        let hash = hash_bytes(&image.bytes);
        let (w, h) = (image.width, image.height);
        return build_if_changed(state, hash, || ClipboardEventPayload {
            kind: ClipboardKind::Image,
            preview: format!("{w} × {h} image"),
            size_bytes: Some(image.bytes.len() as u64),
            dimensions: Some(format!("{w}×{h}")),
            item_count: None,
            timestamp: now_millis(),
            is_duplicate: false,
        });
    }

    // File/folder clipboard payloads (URI lists) aren't exposed by
    // arboard today — needs a small native shim (CF_HDROP,
    // NSFilenamesPasteboardType, text/uri-list) per platform.
    None
}

fn build_if_changed(
    state: &AppState,
    hash: u64,
    build: impl Fn() -> ClipboardEventPayload,
) -> Option<ClipboardEventPayload> {
    let mut last_hash = state.last_hash.lock().unwrap();
    if *last_hash == hash {
        return None;
    }
    *last_hash = hash;
    Some(build())
}

fn hash_bytes(bytes: &[u8]) -> u64 {
    let digest = Sha256::digest(bytes);
    let mut out = [0u8; 8];
    out.copy_from_slice(&digest[0..8]);
    u64::from_le_bytes(out)
}

fn truncate(s: &str) -> String {
    if s.chars().count() <= PREVIEW_MAX_CHARS {
        s.to_string()
    } else {
        let truncated: String = s.chars().take(PREVIEW_MAX_CHARS).collect();
        format!("{truncated}…")
    }
}

fn now_millis() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis() as u64
}
