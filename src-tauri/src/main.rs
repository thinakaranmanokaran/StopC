// Prevents an extra console window from appearing on Windows release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod clipboard;
mod commands;
mod funny_messages;
mod funny_mode;
mod notification;
mod state;

use std::sync::Arc;

use tauri::menu::{Menu, MenuItem, PredefinedMenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Emitter, Manager, WindowEvent};
use tauri_plugin_notification::{NotificationExt, PermissionState};

use state::AppState;

/// CLI marker we register as an extra arg on the autostart entry (see
/// `tauri_plugin_autostart::init` below). If this arg is present, we
/// know the OS launched us silently at login — not a human clicking
/// the app icon — so the main window should stay hidden.
const AUTOSTART_MARKER: &str = "--autostart";

fn main() {
    tauri::Builder::default()
        // Must be the first plugin registered. When the app is already
        // running (in the tray) and the user launches it again — Start
        // Menu, Search, Desktop icon — the OS would normally spawn a
        // second process; this plugin intercepts that and instead fires
        // the callback below in the *existing* process, so we can just
        // show the dashboard instead of doing nothing (the old, no
        // single-instance-guard behavior silently did nothing, at best
        // launching a confusing 2nd process on some platforms).
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            if let Some(main) = app.get_webview_window("main") {
                let _ = main.show();
                let _ = main.set_focus();
                let _ = app.emit("tray://navigate", "dashboard");
            }
        }))
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![AUTOSTART_MARKER]),
        ))
        .manage(Arc::new(AppState::default()))
        .setup(|app| {
            let state: Arc<AppState> = app.state::<Arc<AppState>>().inner().clone();

            // Background threads: clipboard polling + global Ctrl+C listener.
            clipboard::spawn_watcher(app.handle().clone(), state.clone());
            funny_mode::spawn_key_listener(app.handle().clone(), state.clone());

            // Only show the dashboard on launches a human actually
            // triggered (first install, Start Menu, Search, Desktop
            // icon) — not on the silent OS autostart-at-login launch.
            // The single-instance handler above covers "app already
            // running, user clicked the icon again"; this covers "app
            // wasn't running yet and this very process is the one
            // starting because of that click."
            let launched_by_autostart = std::env::args().any(|a| a == AUTOSTART_MARKER);
            if !launched_by_autostart {
                if let Some(main) = app.get_webview_window("main") {
                    let _ = main.show();
                    let _ = main.set_focus();
                }
            } else {
                // Still a good moment to let the user know we're alive.
                announce_background_launch(app.handle());
            }

            // System tray.
            let open = MenuItem::with_id(app, "open", "Open Dashboard", true, None::<&str>)?;
            let pause = MenuItem::with_id(app, "pause", "Pause Notifications", true, None::<&str>)?;
            let funny = MenuItem::with_id(app, "funny", "Funny Mode", true, None::<&str>)?;
            let stats = MenuItem::with_id(app, "stats", "Statistics", true, None::<&str>)?;
            let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let about = MenuItem::with_id(app, "about", "About", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;

            let tray_menu = Menu::with_items(
                app,
                &[&open, &pause, &funny, &separator, &stats, &settings, &separator, &about, &quit],
            )?;

            TrayIconBuilder::new()
                .menu(&tray_menu)
                .show_menu_on_left_click(true)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| {
                    if event.id.as_ref() == "quit" {
                        app.exit(0);
                        return;
                    }
                    let Some(main) = app.get_webview_window("main") else {
                        return;
                    };
                    let _ = main.show();
                    let _ = main.set_focus();
                    match event.id.as_ref() {
                        "settings" => {
                            let _ = app.emit("tray://navigate", "settings");
                        }
                        "about" => {
                            let _ = app.emit("tray://navigate", "about");
                        }
                        "open" => {
                            let _ = app.emit("tray://navigate", "dashboard");
                        }
                        // "pause", "funny", "stats" still just focus the window for
                        // now — Pause/Funny toggles and a dedicated Stats page are
                        // tracked as follow-ups (see PLAN.md).
                        _ => {}
                    }
                })
                .build(app)?;

            // Closing the main window hides it to tray instead of quitting —
            // StopC is meant to live in the background.
            if let Some(main) = app.get_webview_window("main") {
                let main_clone = main.clone();
                main.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        api.prevent_close();
                        let _ = main_clone.hide();
                    }
                });
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::get_settings,
            commands::save_settings,
            commands::reset_settings,
            commands::record_copy_attempt,
            commands::hide_notification_window,
        ])
        .run(tauri::generate_context!())
        .expect("error while running StopC");
}

/// Shows a single native OS notification explaining that StopC runs in
/// the background with no window — otherwise a user who expects an app
/// window to appear (most apps do) may think nothing happened.
fn announce_background_launch(app: &tauri::AppHandle) {
    let handle = app.notification();
    match handle.permission_state() {
        Ok(PermissionState::Granted) => {
            let _ = handle
                .builder()
                .title("StopC is running")
                .body("It'll stay in the background — look for the tray icon. Copy something to see it in action.")
                .show();
        }
        Ok(PermissionState::Prompt) | Ok(PermissionState::PromptWithRationale) => {
            if let Ok(PermissionState::Granted) = handle.request_permission() {
                let _ = handle
                    .builder()
                    .title("StopC is running")
                    .body("It'll stay in the background — look for the tray icon. Copy something to see it in action.")
                    .show();
            }
        }
        _ => {}
    }
}
