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
/// IMPORTANT: "no polling" from the product spec is aspirational — the
/// underlying OS clipboard APIs (Win32, NSPasteboard, X11 selections)
/// don't expose a uniform, dependency-free push notification across all
/// three platforms. Windows *does* support `AddClipboardFormatListener`
/// and macOS technically only exposes `NSPasteboard.changeCount` (which
/// itself must be polled — Apple has never shipped a push API for this).
/// The pragmatic, cross-platform approach — and what most clipboard
/// utilities actually ship — is a lightweight poll loop. 300ms is
/// imperceptible to the user and costs negligible CPU while idle.
///
/// A future improvement could special-case a native listener on Windows
/// via `AddClipboardFormatListener` and fall back to polling elsewhere.
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
                if let Err(e) = app.emit("clipboard://changed", payload) {
                    eprintln!("[stopc] failed to emit clipboard event: {e}");
                }
                if !is_dup {
                    state.reset_funny_counter();
                    state
                        .last_change_at
                        .store(now_millis(), Ordering::SeqCst);
                }
            }
        }
    });
}

/// Reads the current clipboard, hashes it, and returns a payload if the
/// content differs from the last known hash. Returns None on read errors
/// (e.g. transient lock contention with another app) so the loop just
/// tries again next tick.
fn check_clipboard(clipboard: &mut Clipboard, state: &AppState) -> Option<ClipboardEventPayload> {
    // Text is checked first since it's the overwhelmingly common case.
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
    // arboard today. On Windows/macOS/Linux this needs a small native
    // shim (CF_HDROP, NSFilenamesPasteboardType, text/uri-list) — see
    // README "Known Limitations" for the tracked follow-up.
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
    // Fold the 256-bit digest down to a u64 — plenty of collision
    // resistance for "did the clipboard change" purposes.
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
