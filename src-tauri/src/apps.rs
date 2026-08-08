use serde::Serialize;

use crate::state::Settings;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct InstalledApp {
    /// Display name from the registry, e.g. "Visual Studio Code".
    pub name: String,
    /// Lowercased executable basename, e.g. "code.exe". Empty string
    /// if we couldn't resolve one (the app is still listed but can't
    /// be matched against the foreground process, so the frontend
    /// should disable selecting it).
    pub exe: String,
}

/// Well-known terminal/shell executables. Ctrl+C in these conventionally
/// means "send SIGINT / cancel the running command", not "copy" — so
/// Funny Mode's repeated-Ctrl+C detector should never fire here. This
/// is what previously caused a false "did you forget to copy?" popup
/// when terminating a task in cmd.exe.
const TERMINAL_DENYLIST: &[&str] = &[
    "cmd.exe",
    "powershell.exe",
    "pwsh.exe",
    "windowsterminal.exe",
    "conhost.exe",
    "wt.exe",
    "cmder.exe",
    "mintty.exe",
    "bash.exe",
    "wsl.exe",
    "wslhost.exe",
    "alacritty.exe",
    "hyper.exe",
    "terminal.exe",
    "ubuntu.exe",
    "ubuntu2004.exe",
    "debian.exe",
    "kali.exe",
];

/// Returns true if the given (lowercased) exe basename should never
/// trigger Funny Mode, either because it's a terminal/shell or because
/// the user explicitly excluded it on the Exclusions page.
pub fn is_funny_mode_excluded(exe: &str, settings: &Settings) -> bool {
    if exe.is_empty() {
        return false;
    }
    TERMINAL_DENYLIST.contains(&exe) || settings.excluded_apps.iter().any(|e| e == exe)
}

/// Returns true if a copy made while `exe` was the foreground app
/// should be tracked (dashboard/history) but not surfaced as a toast.
pub fn is_notification_excluded(exe: &str, settings: &Settings) -> bool {
    if exe.is_empty() {
        return false;
    }
    settings.excluded_apps.iter().any(|e| e == exe)
}

#[cfg(target_os = "windows")]
pub fn foreground_process_exe_name() -> Option<String> {
    use std::ffi::OsString;
    use std::os::windows::ffi::OsStringExt;
    use winapi::um::handleapi::CloseHandle;
    use winapi::um::processthreadsapi::OpenProcess;
    use winapi::um::psapi::GetModuleFileNameExW;
    use winapi::um::winnt::{PROCESS_QUERY_INFORMATION, PROCESS_VM_READ};
    use winapi::um::winuser::{GetForegroundWindow, GetWindowThreadProcessId};

    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return None;
        }
        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut pid);
        if pid == 0 {
            return None;
        }
        let handle = OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, 0, pid);
        if handle.is_null() {
            return None;
        }
        let mut buffer = [0u16; 260];
        let len =
            GetModuleFileNameExW(handle, std::ptr::null_mut(), buffer.as_mut_ptr(), buffer.len() as u32);
        CloseHandle(handle);
        if len == 0 {
            return None;
        }
        let os_string = OsString::from_wide(&buffer[..len as usize]);
        let path = os_string.to_string_lossy().to_string();
        path.rsplit(['\\', '/']).next().map(|s| s.to_lowercase())
    }
}

#[cfg(not(target_os = "windows"))]
pub fn foreground_process_exe_name() -> Option<String> {
    // Reliable cross-desktop-environment foreground-window detection
    // needs a platform-specific shim (Accessibility API on macOS,
    // varies by compositor on Linux/Wayland) — not implemented yet,
    // so Exclusions/the terminal-app fix are Windows-only for now.
    None
}

#[cfg(target_os = "windows")]
pub fn list_installed_apps() -> Vec<InstalledApp> {
    use winreg::enums::{HKEY_CURRENT_USER, HKEY_LOCAL_MACHINE, KEY_READ, KEY_WOW64_32KEY};
    use winreg::RegKey;

    const UNINSTALL_PATH: &str = "Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall";

    let mut apps: Vec<InstalledApp> = Vec::new();
    let mut seen = std::collections::HashSet::new();

    let hklm = RegKey::predef(HKEY_LOCAL_MACHINE);
    let hkcu = RegKey::predef(HKEY_CURRENT_USER);
    let scans: [(&RegKey, u32); 3] = [
        (&hklm, KEY_READ),
        (&hklm, KEY_READ | KEY_WOW64_32KEY),
        (&hkcu, KEY_READ),
    ];

    for (hive, access) in scans {
        let Ok(uninstall) = hive.open_subkey_with_flags(UNINSTALL_PATH, access) else {
            continue;
        };
        for key_name in uninstall.enum_keys().flatten() {
            let Ok(subkey) = uninstall.open_subkey_with_flags(&key_name, access) else {
                continue;
            };

            let display_name: Option<String> = subkey.get_value("DisplayName").ok();
            let Some(display_name) = display_name else { continue };
            let display_name = display_name.trim().to_string();
            if display_name.is_empty() {
                continue;
            }

            // Skip Windows updates/hotfixes and hidden system components.
            let system_component: u32 = subkey.get_value("SystemComponent").unwrap_or(0);
            if system_component == 1 {
                continue;
            }
            let release_type: String = subkey.get_value("ReleaseType").unwrap_or_default();
            if release_type == "Update" || release_type == "Hotfix" || release_type == "Security Update" {
                continue;
            }
            let parent: Option<String> = subkey.get_value("ParentKeyName").ok();
            if parent.is_some() {
                continue;
            }

            if !seen.insert(display_name.to_lowercase()) {
                continue;
            }

            let display_icon: Option<String> = subkey.get_value("DisplayIcon").ok();
            let install_location: Option<String> = subkey.get_value("InstallLocation").ok();
            let exe = resolve_exe_name(display_icon.as_deref(), install_location.as_deref());

            apps.push(InstalledApp {
                name: display_name,
                exe: exe.unwrap_or_default(),
            });
        }
    }

    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    apps
}

#[cfg(target_os = "windows")]
fn resolve_exe_name(display_icon: Option<&str>, install_location: Option<&str>) -> Option<String> {
    // DisplayIcon is often "C:\Path\To\App.exe,0" (icon index suffix).
    if let Some(icon) = display_icon {
        let path = icon.rsplit_once(',').map(|(p, _)| p).unwrap_or(icon);
        let trimmed = path.trim().trim_matches('"');
        if trimmed.to_lowercase().ends_with(".exe") {
            if let Some(base) = trimmed.rsplit(['\\', '/']).next() {
                return Some(base.to_lowercase());
            }
        }
    }

    // Fall back to a shallow scan of the install directory for a
    // single obvious .exe (best-effort — skips uninstaller-looking names).
    if let Some(dir) = install_location {
        if let Ok(entries) = std::fs::read_dir(dir) {
            for entry in entries.flatten() {
                let path = entry.path();
                if path.extension().and_then(|e| e.to_str()).map(|e| e.eq_ignore_ascii_case("exe")) == Some(true) {
                    let name = path.file_name().and_then(|n| n.to_str()).unwrap_or_default().to_lowercase();
                    if name.contains("uninstall") || name.contains("unins0") || name.contains("setup") {
                        continue;
                    }
                    return Some(name);
                }
            }
        }
    }

    None
}

#[cfg(not(target_os = "windows"))]
pub fn list_installed_apps() -> Vec<InstalledApp> {
    Vec::new()
}

#[tauri::command]
pub fn list_installed_apps_cmd() -> Vec<InstalledApp> {
    list_installed_apps()
}
