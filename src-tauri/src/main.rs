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

use state::AppState;

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            None,
        ))
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(Arc::new(AppState::default()))
        .setup(|app| {
            let state: Arc<AppState> = app.state::<Arc<AppState>>().inner().clone();

            // Background threads: clipboard polling + global Ctrl+C listener.
            clipboard::spawn_watcher(app.handle().clone(), state.clone());
            funny_mode::spawn_key_listener(app.handle().clone(), state.clone());

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
                    let Some(main) = app.get_webview_window("main") else {
                        return;
                    };
                    let _ = main.show();
                    let _ = main.set_focus();
                    match event.id.as_ref() {
                        "quit" => app.exit(0),
                        "settings" => {
                            let _ = app.emit("tray://navigate", "settings");
                        }
                        "about" => {
                            let _ = app.emit("tray://navigate", "developer");
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running StopC");
}
