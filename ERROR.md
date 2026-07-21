
D:\Development\Applications\StopC>npm run tauri dev

> stopc@0.1.0 tauri
> tauri dev

     Running BeforeDevCommand (`npm run dev`)

> stopc@0.1.0 dev
> vite

        Warn Waiting for your frontend dev server to start on http://localhost:1420/...
        Warn Waiting for your frontend dev server to start on http://localhost:1420/...

  VITE v5.4.21  ready in 19658 ms

  ➜  Local:   http://localhost:1420/
  ➜  Network: use --host to expose
     Running DevCommand (`cargo  run --no-default-features --color always --`)
Error: The following dependencies are imported but could not be resolved:

  @/App (imported by D:/Development/Applications/StopC/src/main.tsx)
  @/components/NotificationPopup (imported by D:/Development/Applications/StopC/src/notification-main.tsx)
  @/hooks/useClipboardWatcher (imported by D:/Development/Applications/StopC/src/notification-main.tsx)
  @/store/clipboardStore (imported by D:/Development/Applications/StopC/src/notification-main.tsx)
  @/store/settingsStore (imported by D:/Development/Applications/StopC/src/notification-main.tsx)

Are they installed?
    at file:///D:/Development/Applications/StopC/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:50669:15
    at process.processTicksAndRejections (node:internal/process/task_queues:104:5)
    at async file:///D:/Development/Applications/StopC/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:50174:26
        Info Watching D:\Development\Applications\StopC\src-tauri for changes...
   Compiling proc-macro2 v1.0.106
   Compiling quote v1.0.46
   Compiling cfg-if v1.0.4
   Compiling windows-link v0.2.1
   Compiling serde_core v1.0.228
   Compiling smallvec v1.15.2
   Compiling syn v2.0.118
   Compiling siphasher v1.0.3
   Compiling litemap v0.8.2
   Compiling writeable v0.6.3
   Compiling phf_shared v0.13.1
   Compiling memchr v2.8.3
   Compiling utf8_iter v1.0.4
   Compiling synstructure v0.13.2
   Compiling fastrand v2.4.1
   Compiling phf_generator v0.13.1
   Compiling zerofrom-derive v0.1.7
   Compiling yoke-derive v0.8.2
   Compiling zerovec-derive v0.11.3
   Compiling zerofrom v0.1.8
   Compiling serde_derive v1.0.228
   Compiling displaydoc v0.2.6
   Compiling stable_deref_trait v1.2.1
   Compiling icu_properties_data v2.2.0
   Compiling itoa v1.0.18
   Compiling icu_normalizer_data v2.2.0
   Compiling thiserror v2.0.18
   Compiling yoke v0.8.3
   Compiling thiserror-impl v2.0.18
   Compiling zmij v1.0.21
   Compiling zerovec v0.11.6
   Compiling serde v1.0.228
   Compiling phf_macros v0.13.1
   Compiling autocfg v1.5.1
   Compiling num-conv v0.2.2
   Compiling parking_lot_core v0.9.12
   Compiling time-core v0.1.9
   Compiling log v0.4.33
   Compiling winnow v1.0.3
   Compiling tinystr v0.8.3
   Compiling toml_parser v1.1.2+spec-1.1.0
   Compiling phf_codegen v0.13.1
   Compiling powerfmt v0.2.0
   Compiling strsim v0.11.1
   Compiling typeid v1.0.3
   Compiling ident_case v1.0.1
   Compiling toml_writer v1.1.1+spec-1.1.0
   Compiling scopeguard v1.2.0
   Compiling lock_api v0.4.14
   Compiling darling_core v0.23.0
   Compiling icu_locale_core v2.2.0
   Compiling potential_utf v0.1.5
   Compiling zerotrie v0.2.4
   Compiling thiserror v1.0.69
   Compiling erased-serde v0.4.10
   Compiling byteorder v1.5.0
   Compiling icu_provider v2.2.0
   Compiling darling_macro v0.23.0
   Compiling icu_collections v2.2.0
   Compiling parking_lot v0.12.5
   Compiling thiserror-impl v1.0.69
   Compiling aho-corasick v1.1.4
   Compiling new_debug_unreachable v1.0.6
   Compiling fnv v1.0.7
   Compiling unic-common v0.9.0
   Compiling unic-char-range v0.9.0
   Compiling regex-syntax v0.8.11
   Compiling unic-char-property v0.9.0
   Compiling unic-ucd-version v0.9.0
   Compiling regex-automata v0.4.14
   Compiling darling v0.23.0
   Compiling phf v0.13.1
   Compiling string_cache_codegen v0.6.1
   Compiling hashbrown v0.17.1
   Compiling equivalent v1.0.2
   Compiling alloc-no-stdlib v2.0.4
   Compiling bytes v1.12.1
   Compiling precomputed-hash v0.1.1
   Compiling serde_json v1.0.150
   Compiling getrandom v0.4.3
   Compiling alloc-stdlib v0.2.4
   Compiling indexmap v2.14.0
   Compiling web_atoms v0.2.5
   Compiling regex v1.12.4
   Compiling serde_with_macros v3.21.0
   Compiling unic-ucd-ident v0.9.0
   Compiling icu_properties v2.2.0
   Compiling icu_normalizer v2.2.0
   Compiling quick-xml v0.41.0
   Compiling serde_spanned v1.1.1
   Compiling windows-sys v0.61.2
   Compiling dunce v1.0.5
   Compiling base64 v0.22.1
   Compiling anyhow v1.0.103
   Compiling idna_adapter v1.2.2
   Compiling brotli-decompressor v5.0.3
   Compiling string_cache v0.9.0
   Compiling http v1.4.2
   Compiling semver v1.0.28
   Compiling percent-encoding v2.3.2
   Compiling ctor-proc-macro v0.0.7
   Compiling dtoa v1.0.11
   Compiling dtoa-short v0.3.5
   Compiling ctor v0.8.0
   Compiling form_urlencoded v1.2.2
   Compiling brotli v8.0.4
   Compiling uuid v1.23.4
   Compiling idna v1.1.0
   Compiling tendril v0.5.1
   Compiling selectors v0.36.1
   Compiling indexmap v1.9.3
   Compiling cssparser-macros v0.6.1
   Compiling derive_more-impl v2.1.1
   Compiling toml_datetime v1.1.1+spec-1.1.0
   Compiling glob v0.3.3
   Compiling camino v1.2.4
   Compiling derive_more v2.1.1
   Compiling toml v1.1.2+spec-1.1.0
   Compiling cssparser v0.36.0
   Compiling markup5ever v0.38.0
   Compiling url v2.5.8
   Compiling winapi-util v0.1.11
   Compiling servo_arc v0.4.3
   Compiling serde_derive_internals v0.29.1
   Compiling bitflags v2.13.0
   Compiling bit-vec v0.8.0
   Compiling hashbrown v0.12.3
   Compiling rustc-hash v2.1.3
   Compiling deranged v0.5.8
   Compiling schemars v0.8.22
   Compiling schemars_derive v0.8.22
   Compiling time v0.3.53
   Compiling bit-set v0.8.0
   Compiling same-file v1.0.6
   Compiling html5ever v0.38.0
   Compiling cfb v0.7.3
   Compiling jsonptr v0.6.3
   Compiling cargo-platform v0.1.9
   Compiling foldhash v0.2.0
   Compiling windows_x86_64_msvc v0.52.6
   Compiling dyn-clone v1.0.20
   Compiling dom_query v0.27.0
   Compiling serde-untagged v0.1.9
   Compiling cargo_metadata v0.19.2
   Compiling infer v0.19.0
   Compiling json-patch v3.0.1
   Compiling plist v1.10.0
   Compiling walkdir v2.5.0
   Compiling urlpattern v0.3.0
   Compiling serde_with v3.21.0
   Compiling libc v0.2.186
   Compiling find-msvc-tools v0.1.9
   Compiling tauri-utils v2.9.3
   Compiling windows-link v0.1.3
   Compiling shlex v2.0.1
   Compiling cc v1.2.66
   Compiling windows-targets v0.52.6
   Compiling version_check v0.9.5
   Compiling vswhom-sys v0.1.3
   Compiling windows-strings v0.4.2
   Compiling windows-result v0.3.4
   Compiling windows-interface v0.59.3
   Compiling windows-implement v0.60.2
   Compiling option-ext v0.2.0
   Compiling windows-core v0.61.2
   Compiling windows-sys v0.59.0
   Compiling winreg v0.55.0
   Compiling vswhom v0.1.0
   Compiling rustc_version v0.4.1
   Compiling toml_datetime v0.7.5+spec-1.1.0
   Compiling winnow v0.7.15
   Compiling toml v0.9.12+spec-1.1.0
   Compiling embed-resource v3.0.11
   Compiling dirs-sys v0.5.0
   Compiling windows-threading v0.1.0
   Compiling crc32fast v1.5.0
   Compiling heck v0.5.0
   Compiling simd-adler32 v0.3.9
   Compiling dirs v6.0.0
   Compiling windows-future v0.2.1
   Compiling cargo_toml v0.22.3
   Compiling tauri-winres v0.3.6
   Compiling windows-numerics v0.2.0
   Compiling windows-collections v0.2.0
   Compiling adler2 v2.0.1
   Compiling tauri-build v2.6.3
   Compiling miniz_oxide v0.8.9
   Compiling windows v0.61.3
   Compiling tauri-plugin v2.6.3
   Compiling generic-array v0.14.7
   Compiling once_cell v1.21.4
   Compiling flate2 v1.1.9
   Compiling fdeflate v0.3.7
   Compiling time-macros v0.2.31
   Compiling typenum v1.20.1
   Compiling crossbeam-utils v0.8.22
   Compiling tauri v2.11.5
   Compiling dpi v0.1.2
   Compiling webview2-com-sys v0.38.2
   Compiling windows-version v0.1.7
   Compiling raw-window-handle v0.6.2
   Compiling cookie v0.18.1
   Compiling unicode-segmentation v1.13.3
   Compiling getrandom v0.3.4
   Compiling crossbeam-channel v0.5.16
   Compiling block-buffer v0.10.4
   Compiling crypto-common v0.1.7
   Compiling webview2-com-macros v0.8.1
   Compiling bitflags v1.3.2
   Compiling pin-project-lite v0.2.17
   Compiling png v0.17.16
   Compiling webview2-com v0.38.2
   Compiling digest v0.10.7
   Compiling tracing-core v0.1.36
   Compiling tracing-attributes v0.1.31
   Compiling cpufeatures v0.2.17
   Compiling tauri-runtime v2.11.3
   Compiling zerocopy v0.8.53
   Compiling wry v0.55.1
   Compiling tracing v0.1.44
   Compiling sha2 v0.10.9
   Compiling ico v0.5.0
   Compiling keyboard-types v0.7.0
   Compiling num-traits v0.2.19
   Compiling tauri-runtime-wry v2.11.4
   Compiling muda v0.19.3
   Compiling tauri-codegen v2.6.3
   Compiling softbuffer v0.4.8
   Compiling tao v0.35.3
   Compiling tokio-macros v2.7.0
   Compiling serialize-to-javascript-impl v0.1.2
   Compiling winapi v0.3.9
   Compiling windows_x86_64_msvc v0.53.1
   Compiling serialize-to-javascript v0.1.2
   Compiling tokio v1.52.3
   Compiling window-vibrancy v0.6.0
   Compiling tauri-macros v2.6.3
   Compiling ppv-lite86 v0.2.21
   Compiling tray-icon v0.24.1
   Compiling serde_repr v0.1.20
   Compiling mime v0.3.17
   Compiling winreg v0.10.1
   Compiling pxfm v0.1.30
   Compiling moxcms v0.8.1
   Compiling windows-targets v0.53.5
   Compiling rand_core v0.9.5
   Compiling png v0.18.1
   Compiling tauri-plugin-clipboard-manager v2.3.2
   Compiling tauri-plugin-autostart v2.5.1
   Compiling tauri-plugin-notification v2.3.3
   Compiling tauri-plugin-store v2.4.3
   Compiling getrandom v0.2.17
   Compiling error-code v3.3.2
   Compiling byteorder-lite v0.1.0
   Compiling bytemuck v1.25.0
   Compiling image v0.25.10
   Compiling clipboard-win v5.4.1
   Compiling rand_core v0.6.4
   Compiling rand_chacha v0.9.0
   Compiling windows-sys v0.60.2
   Compiling tauri-winrt-notification v0.7.3
   Compiling notify-rust v4.18.0
   Compiling auto-launch v0.5.0
   Compiling arboard v3.6.1
   Compiling rand v0.9.4
   Compiling rand_chacha v0.3.1
   Compiling stopc v0.1.0 (D:\Development\Applications\StopC\src-tauri)
   Compiling lazy_static v1.5.0
   Compiling rdev v0.5.3
   Compiling rand v0.8.6
   Compiling chrono v0.4.45
warning: variants `RichText`, `Html`, `File`, `Files`, and `Folder` are never constructed
  --> src\clipboard.rs:16:5
   |
14 | pub enum ClipboardKind {
   |          ------------- variants in this enum
15 |     Text,
16 |     RichText,
   |     ^^^^^^^^
17 |     Html,
   |     ^^^^
18 |     Image,
19 |     File,
   |     ^^^^
20 |     Files,
   |     ^^^^^
21 |     Folder,
   |     ^^^^^^
   |
   = note: `ClipboardKind` has derived impls for the traits `Clone` and `Debug`, but these are intentionally ignored during dead code analysis
   = note: `#[warn(dead_code)]` (part of `#[warn(unused)]`) on by default

warning: `stopc` (bin "stopc") generated 1 warning
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 78m 33s
     Running `target\debug\stopc.exe`

thread 'main' (10704) panicked at src\main.rs:96:10:
error while running StopC: PluginInitialization("autostart", "Error deserializing 'plugins.autostart' within your Tauri configuration: invalid type: map, expected unit")
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace
error: process didn't exit successfully: `target\debug\stopc.exe` (exit code: 101)
