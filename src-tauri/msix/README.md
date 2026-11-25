# StopC MSIX Packaging (Microsoft Store)

This folder contains the MSIX manifest template used to package StopC for the Microsoft Store (where Microsoft handles code signing automatically for free).

## Files

- `AppxManifest.template.xml`: MSIX manifest template declaring `runFullTrust`, Store tile/logo assets from `src-tauri/icons/`, and `<uap5:StartupTask>` (`TaskId="StopCAutostart"`, `uap10:Parameters="--autostart"`).
- `../../scripts/package-msix.ps1`: Builds `--features msix` with `VITE_MSIX_BUILD=true`, stages files, and creates `StopC_<version>_x64.msix` using `makeappx.exe`.

## Microsoft Partner Center Setup

1. In **Partner Center**, create a **new MSIX or PWA app** (do not delete your existing EXE draft until the MSIX app is live).
2. Reserve your app name and open **Product management -> Product identity** to copy:
   - **Package/Identity/Name** (e.g. `12345ThinakaranManokaran.StopC`)
   - **Package/Identity/Publisher** (e.g. `CN=XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX`)
   - **Package/Properties/PublisherDisplayName** (e.g. `Thinakaran Manokaran`)
3. Add those three values as GitHub Actions **Repository Variables** (`Settings -> Secrets and variables -> Actions -> Variables`):
   - `MSIX_IDENTITY_NAME`
   - `MSIX_PUBLISHER`
   - `MSIX_PUBLISHER_DISPLAY_NAME`
4. Push to `main` (or trigger `Build & Release` manually) and download the `stopc-store-msix-x64` artifact from GitHub Actions.
5. Upload the `.msix` to Partner Center (leave it unsigned — Microsoft signs it after certification).
6. Under **Submission options -> Restricted capabilities**, provide a justification for `runFullTrust`, for example:

   > StopC is a Tauri 2 (Rust + WebView2) desktop utility packaged as an MSIX. It requires `runFullTrust` to run at standard user (Medium) integrity in the system tray, monitor clipboard changes, detect repeat Ctrl+C keystrokes, and read the foreground process name for per-app notification exclusions.

## Local Build & Sideload Testing

Requires Node.js, Rust, and the Windows 10/11 SDK (`makeappx.exe`, `signtool.exe`):

```powershell
# Self-signed build for local Add-AppxPackage testing:
./scripts/package-msix.ps1 -SelfSign
```
