use serde::{Deserialize, Serialize};
use tauri::{AppHandle, Emitter, Manager};
use tokio::io::AsyncWriteExt;

const RELEASES_API: &str = "https://api.github.com/repos/thinakaranmanokaran/StopC/releases/latest";

#[derive(Debug, Deserialize)]
struct GithubAsset {
    name: String,
    browser_download_url: String,
}

#[derive(Debug, Deserialize)]
struct GithubRelease {
    tag_name: String,
    html_url: String,
    #[serde(default)]
    assets: Vec<GithubAsset>,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct UpdateInfo {
    pub available: bool,
    pub current_version: String,
    pub latest_version: String,
    /// Direct download URL for the Windows installer asset, when found.
    pub download_url: Option<String>,
    pub release_url: String,
}

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct DownloadProgress {
    downloaded: u64,
    total: u64,
}

/// Parses "v1.2.3" / "1.2.3" into a comparable tuple. Non-numeric
/// trailing parts (e.g. "-beta") are ignored for comparison purposes.
fn parse_version(v: &str) -> (u64, u64, u64) {
    let v = v.trim().trim_start_matches(['v', 'V']);
    let core = v.split(['-', '+']).next().unwrap_or(v);
    let mut parts = core.split('.').map(|p| p.parse::<u64>().unwrap_or(0));
    (
        parts.next().unwrap_or(0),
        parts.next().unwrap_or(0),
        parts.next().unwrap_or(0),
    )
}

fn is_newer(latest: &str, current: &str) -> bool {
    parse_version(latest) > parse_version(current)
}

fn pick_windows_asset(assets: &[GithubAsset]) -> Option<String> {
    assets
        .iter()
        .find(|a| a.name.to_lowercase().ends_with("-setup.exe"))
        .or_else(|| assets.iter().find(|a| a.name.to_lowercase().ends_with(".msi")))
        .or_else(|| assets.iter().find(|a| a.name.to_lowercase().ends_with(".exe")))
        .map(|a| a.browser_download_url.clone())
}

#[tauri::command]
pub async fn check_for_updates(app: AppHandle) -> Result<UpdateInfo, String> {
    let current_version = app.package_info().version.to_string();

    let client = reqwest::Client::builder()
        .user_agent("StopC-Updater")
        .build()
        .map_err(|e| e.to_string())?;

    let resp = client
        .get(RELEASES_API)
        .send()
        .await
        .map_err(|e| format!("Couldn't reach GitHub: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("GitHub returned {}", resp.status()));
    }

    let release: GithubRelease = resp
        .json()
        .await
        .map_err(|e| format!("Couldn't parse the release info: {e}"))?;

    let latest_version = release.tag_name.trim_start_matches(['v', 'V']).to_string();
    let available = is_newer(&latest_version, &current_version);
    let download_url = if available { pick_windows_asset(&release.assets) } else { None };

    Ok(UpdateInfo {
        available,
        current_version,
        latest_version,
        download_url,
        release_url: release.html_url,
    })
}

/// Downloads the installer with periodic progress events, then launches
/// it and exits StopC so the installer can replace the running app.
///
/// The exit is deliberately deferred to a background task AFTER this
/// command returns: calling `app.exit(0)` from inside the command would
/// tear down the runtime and cancel the command's response, so the
/// frontend's `invoke()` promise would never resolve and the dialog
/// would sit on "Downloading…" forever — which is exactly how this
/// surfaced as "the update failed".
///
/// NOTE: the downloaded installer is unsigned (see the "Unknown
/// publisher" SmartScreen warning), so Windows will still show the
/// same SmartScreen prompt for it as for any manual download — this
/// isn't something the app itself can suppress without a code-signing
/// certificate.
#[tauri::command]
pub async fn download_and_install_update(app: AppHandle, url: String) -> Result<(), String> {
    let client = reqwest::Client::builder()
        .user_agent("StopC-Updater")
        .build()
        .map_err(|e| e.to_string())?;

    eprintln!("[stopc] update: downloading {url}");
    let mut resp = client
        .get(&url)
        .send()
        .await
        .map_err(|e| format!("Download failed to start: {e}"))?;

    if !resp.status().is_success() {
        return Err(format!("Download failed: HTTP {}", resp.status()));
    }

    let total = resp.content_length().unwrap_or(0);
    let file_name = url
        .rsplit('/')
        .next()
        .unwrap_or("StopC-update")
        .to_string();

    // Unique per-run temp name so a stale (or still-locked) file from a
    // previous attempt can never make the download or the launch fail.
    let dest = std::env::temp_dir().join(format!("stopc-{}-{file_name}", std::process::id()));

    let mut file = tokio::fs::File::create(&dest)
        .await
        .map_err(|e| format!("Couldn't create the download file: {e}"))?;

    let mut downloaded: u64 = 0;
    let mut last_emit = std::time::Instant::now();

    while let Some(chunk) = resp
        .chunk()
        .await
        .map_err(|e| format!("Download interrupted: {e}"))?
    {
        file.write_all(&chunk)
            .await
            .map_err(|e| format!("Couldn't write the download file: {e}"))?;
        downloaded += chunk.len() as u64;

        if last_emit.elapsed().as_millis() > 120 {
            let _ = app.emit("update://progress", DownloadProgress { downloaded, total });
            last_emit = std::time::Instant::now();
        }
    }
    file.flush().await.map_err(|e| e.to_string())?;
    let _ = app.emit(
        "update://progress",
        DownloadProgress { downloaded, total: total.max(downloaded) },
    );

    // GitHub can hand back an HTML error page if the asset was removed
    // after the check — refuse to "launch" garbage as an installer.
    if downloaded == 0 {
        let _ = std::fs::remove_file(&dest);
        return Err("Downloaded file was empty — the release asset may have been removed.".into());
    }

    eprintln!(
        "[stopc] update: downloaded {downloaded} bytes to {}",
        dest.display()
    );
    let _ = app.emit("update://status", "installing");

    launch_installer(&dest)?;

    // Give the installer's own window a moment to appear before we
    // close StopC. Runs on a separate task so this command can return
    // Ok first (see the doc comment above about exit cancelling the
    // response).
    let app = app.clone();
    tokio::spawn(async move {
        tokio::time::sleep(std::time::Duration::from_millis(1200)).await;
        app.exit(0);
    });

    Ok(())
}

#[cfg(windows)]
fn launch_installer(path: &std::path::Path) -> Result<(), String> {
    let is_msi = path
        .file_name()
        .and_then(|n| n.to_str())
        .is_some_and(|n| n.to_lowercase().ends_with(".msi"));

    if is_msi {
        // `.msi` isn't an executable — CreateProcess can't run it.
        eprintln!("[stopc] update: launching {} via msiexec", path.display());
        std::process::Command::new("msiexec.exe")
            .arg("/i")
            .arg(path)
            .spawn()
            .map_err(|e| format!("Couldn't launch the installer: {e}"))?;
    } else {
        eprintln!("[stopc] update: launching {} (update mode)", path.display());
        // `/UPDATE` tells the Tauri NSIS installer to skip the
        // reinstall/uninstall question and run as a straight upgrade.
        std::process::Command::new(path)
            .arg("/UPDATE")
            .spawn()
            .map_err(|e| format!("Couldn't launch the installer: {e}"))?;
    }
    Ok(())
}

#[cfg(not(windows))]
fn launch_installer(path: &std::path::Path) -> Result<(), String> {
    std::process::Command::new(path)
        .spawn()
        .map_err(|e| format!("Couldn't launch the installer: {e}"))?;
    Ok(())
}

