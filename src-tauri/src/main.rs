// Prevents an extra console window from appearing on Windows release builds.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod apps;
mod clipboard;
mod commands;
mod funny_messages;
mod funny_mode;
mod notification;
mod snooze;
mod state;
mod updater;

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

            // The main window is created visible (see tauri.conf.json) so
            // Windows initializes its native frame/title bar correctly —
            // a window created hidden and later shown via `.show()` during
            // setup can render with a broken (non-interactive) title bar,
            // making it impossible to move, close, minimize or maximize.
            //
            // So on a normal launch we do nothing (already visible) and on
            // the silent OS autostart-at-login launch we hide it straight
            // away to live in the tray instead. The single-instance handler
            // above covers "app already running, user clicked the icon
            // again"; this covers "app wasn't running yet and this very
            // process is the one starting because of that click."
            let launched_by_autostart = std::env::args().any(|a| a == AUTOSTART_MARKER);
            if launched_by_autostart {
                if let Some(main) = app.get_webview_window("main") {
                    let _ = main.hide();
                }
                // Still a good moment to let the user know we're alive.
                announce_background_launch(app.handle());
            } else if let Some(main) = app.get_webview_window("main") {
                let _ = main.set_focus();
            }

            // System tray.
            let open = MenuItem::with_id(app, "open", "Open Dashboard", true, None::<&str>)?;
            let pause = MenuItem::with_id(app, "pause", "Pause Notifications", true, None::<&str>)?;
            let funny = MenuItem::with_id(app, "funny", "Funny Mode", true, None::<&str>)?;
            let snooze_item = MenuItem::with_id(app, "snooze", "Snooze", true, None::<&str>)?;
            let cancel_snooze_item =
                MenuItem::with_id(app, "cancel_snooze", "Cancel Snooze", true, None::<&str>)?;
            let stats = MenuItem::with_id(app, "stats", "Statistics", true, None::<&str>)?;
            let settings = MenuItem::with_id(app, "settings", "Settings", true, None::<&str>)?;
            let exclusions = MenuItem::with_id(app, "exclusions", "Exclusions", true, None::<&str>)?;
            let check_updates =
                MenuItem::with_id(app, "check_updates", "Check for Updates", true, None::<&str>)?;
            let about = MenuItem::with_id(app, "about", "About", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let separator = PredefinedMenuItem::separator(app)?;

            let tray_menu = Menu::with_items(
                app,
                &[
                    &open,
                    &pause,
                    &funny,
                    &snooze_item,
                    &cancel_snooze_item,
                    &separator,
                    &stats,
                    &settings,
                    &exclusions,
                    &separator,
                    &about,
                    &check_updates,
                    &quit,
                ],
            )?;

            TrayIconBuilder::new()
                .menu(&tray_menu)
                .tooltip("StopC")
                .show_menu_on_left_click(true)
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| {
                    if event.id.as_ref() == "quit" {
                        app.exit(0);
                        return;
                    }

                    // Snooze / Cancel Snooze act immediately and don't need
                    // the main window to be shown — that's the whole point
                    // of a tray-only quick action.
                    match event.id.as_ref() {
                        "snooze" => {
                            snooze::snooze_from_tray(app);
                            return;
                        }
                        "cancel_snooze" => {
                            snooze::cancel_from_tray(app);
                            return;
                        }
                        _ => {}
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
                        // Pause Notifications / Funny Mode jump straight to the
                        // relevant section of the Settings page.
                        "pause" => {
                            let _ = app.emit("tray://navigate", "settings#notifications");
                        }
                        "funny" => {
                            let _ = app.emit("tray://navigate", "settings#funny");
                        }
                        // Statistics lives on the Dashboard page.
                        "stats" => {
                            let _ = app.emit("tray://navigate", "dashboard");
                        }
                        "exclusions" => {
                            let _ = app.emit("tray://navigate", "exclusions");
                        }
                        "about" => {
                            let _ = app.emit("tray://navigate", "about");
                        }
                        "check_updates" => {
                            let _ = app.emit("tray://navigate", "about");
                            let _ = app.emit("tray://trigger-update-check", ());
                        }
                        "open" => {
                            let _ = app.emit("tray://navigate", "dashboard");
                        }
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
            apps::list_installed_apps_cmd,
            snooze::get_snooze_state,
            snooze::set_snooze,
            snooze::cancel_snooze,
            updater::check_for_updates,
            updater::download_and_install_update,
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
