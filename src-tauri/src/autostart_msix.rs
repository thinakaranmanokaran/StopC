//! MSIX-specific autostart implementation.
//!
//! When StopC is packaged as an MSIX for the Microsoft Store, the
//! traditional registry-based autostart (`tauri-plugin-autostart`)
//! silently fails because MSIX virtualizes `HKCU\...\Run` writes.
//!
//! Instead, the MSIX manifest declares a `<uap5:StartupTask>` with
//! TaskId `StopCAutostart`, and this module uses the WinRT
//! `StartupTask` API to enable/disable it at runtime.
//!
//! The `AppxManifest.xml` must contain:
//! ```xml
//! <uap5:Extension Category="windows.startupTask"
//!                 Executable="stopc.exe"
//!                 EntryPoint="Windows.FullTrustApplication"
//!                 uap10:Parameters="--autostart">
//!   <uap5:StartupTask TaskId="StopCAutostart"
//!                     Enabled="true"
//!                     DisplayName="StopC" />
//! </uap5:Extension>
//! ```
//!
//! Compile-gated behind `#[cfg(all(windows, feature = "msix"))]` — the
//! plain EXE/NSIS build still uses `tauri-plugin-autostart`.

/// The TaskId string from the MSIX manifest's `<uap5:StartupTask>`.
const STARTUP_TASK_ID: &str = "StopCAutostart";

/// Checks whether this process is running with MSIX package identity.
/// Returns `false` for unpackaged (dev / NSIS / MSI) builds so callers
/// can gracefully skip WinRT packaged-only APIs.
pub fn has_package_identity() -> bool {
    #[link(name = "kernel32")]
    extern "system" {
        fn GetCurrentPackageFamilyName(length: *mut u32, name: *mut u16) -> i32;
    }

    let mut len: u32 = 0;
    let result = unsafe { GetCurrentPackageFamilyName(&mut len, std::ptr::null_mut()) };
    // APPMODEL_ERROR_NO_PACKAGE = 15700
    result != 15700i32
}

/// Ensures `RoUninitialize` is called when leaving scope if `RoInitialize`
/// succeeded (`S_OK` or `S_FALSE`).
struct RoInitGuard(bool);

impl Drop for RoInitGuard {
    fn drop(&mut self) {
        if self.0 {
            unsafe { windows::Win32::System::WinRT::RoUninitialize() };
        }
    }
}

/// Synchronises the OS-level startup task with the user's preference.
/// Called from `commands::sync_autostart` when `feature = "msix"`.
pub fn sync_autostart(auto_start: bool) {
    if !has_package_identity() {
        eprintln!(
            "[stopc/msix] running without MSIX package identity — skipping StartupTask sync"
        );
        return;
    }

    // Spawn a dedicated OS thread so we neither block Tauri's main UI
    // thread (which runs in an STA) nor run WinRT async awaits inside
    // an existing Tokio worker context.
    std::thread::spawn(move || {
        if let Err(e) = sync_autostart_blocking(auto_start) {
            eprintln!("[stopc/msix] failed to sync startup task (enable={auto_start}): {e}");
        }
    });
}

fn sync_autostart_blocking(enable: bool) -> Result<(), String> {
    use windows::core::HSTRING;
    use windows::ApplicationModel::{StartupTask, StartupTaskState};
    use windows::Win32::System::WinRT::{RoInitialize, RO_INIT_MULTITHREADED};

    let ro_ok = unsafe { RoInitialize(RO_INIT_MULTITHREADED) }.is_ok();
    let _ro_guard = RoInitGuard(ro_ok);

    // Run WinRT objects in an inner scope so they drop before `_ro_guard`
    // uninitializes the WinRT apartment.
    {
        let task_id = HSTRING::from(STARTUP_TASK_ID);

        let task = tauri::async_runtime::block_on(async {
            let op = StartupTask::GetAsync(&task_id)
                .map_err(|e| format!("StartupTask::GetAsync failed: {e}"))?;
            op.await
                .map_err(|e| format!("StartupTask::GetAsync await failed: {e}"))
        })?;

        let current_state = task
            .State()
            .map_err(|e| format!("StartupTask::State failed: {e}"))?;

        if enable {
            if current_state == StartupTaskState::Enabled {
                return Ok(());
            }

            let new_state = tauri::async_runtime::block_on(async {
                let op = task
                    .RequestEnableAsync()
                    .map_err(|e| format!("StartupTask::RequestEnableAsync failed: {e}"))?;
                op.await
                    .map_err(|e| format!("StartupTask::RequestEnableAsync await failed: {e}"))
            })?;

            match new_state {
                StartupTaskState::Enabled => {
                    eprintln!("[stopc/msix] startup task enabled");
                }
                StartupTaskState::DisabledByUser => {
                    eprintln!(
                        "[stopc/msix] startup task was disabled by the user in Windows Settings/Task Manager \
                         — cannot re-enable programmatically"
                    );
                }
                StartupTaskState::DisabledByPolicy => {
                    eprintln!("[stopc/msix] startup task is disabled by system policy");
                }
                other => {
                    eprintln!("[stopc/msix] startup task state after enable: {other:?}");
                }
            }
        } else if current_state == StartupTaskState::Enabled {
            task.Disable()
                .map_err(|e| format!("StartupTask::Disable failed: {e}"))?;
            eprintln!("[stopc/msix] startup task disabled");
        }
    }

    Ok(())
}
