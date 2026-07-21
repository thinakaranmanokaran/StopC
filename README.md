# StopC

**Copy Once. Trust Forever.**

A clipboard confidence app — not a clipboard manager. StopC watches your
clipboard and gives you an instant, delightful confirmation the moment a
copy lands, so you stop double- and triple-pressing Ctrl+C out of doubt.

> **Status: core skeleton.** This is the first build pass — clipboard
> detection, the notification pipeline, and Funny Mode's detection logic
> are wired end-to-end. Settings/Stats/Achievements pages, the full
> 100+ message library, mascot art, sounds, and clipboard history are
> **not yet built** (see [Roadmap](#roadmap)). This README is honest
> about that so nobody is surprised.

---

## What's actually implemented

- **Clipboard watcher** (Rust, `src-tauri/src/clipboard.rs`) — detects
  text and image copies via `arboard`, hashes content to avoid firing on
  unchanged clipboard reads, emits a `clipboard://changed` Tauri event.
- **Notification window** — a second, frameless, always-on-top,
  transparent Tauri window (`notification.html`) that renders an
  animated MUI toast (`src/components/NotificationPopup.tsx`) using
  Framer Motion, with 4 animation styles and 11 visual themes already
  defined.
- **Funny Mode detection** (`src-tauri/src/funny_mode.rs`) — a global
  Ctrl+C key listener (via `rdev`) that counts consecutive presses with
  no clipboard change and emits `funny-mode://triggered` past a
  configurable threshold, with a starter set of 20 messages + 9 mascot
  emoji (`src-tauri/src/funny_messages.rs`).
- **Settings plumbing** — a `Settings` struct on the Rust side and a
  matching Zustand store on the frontend, plus `get_settings` /
  `save_settings` / `reset_settings` Tauri commands.
- **System tray** — tray icon with an Open/Pause/Funny Mode/Stats/
  Settings/About/Quit menu (menu items other than Open/Quit currently
  just focus the main window — routing to specific pages is a
  follow-up once those pages exist).
- **Minimal dashboard** (`src/App.tsx`) — proves the pipeline visually:
  today's copy count and a live recent-activity list.
- **Branding** — a generated app icon (purple rounded-square with a
  clipboard + checkmark) in `src-tauri/icons/`, exported to the sizes
  Tauri's bundler expects.

## What's stubbed or missing

- **File/folder clipboard detection.** `arboard` doesn't expose
  `CF_HDROP` / `NSFilenamesPasteboardType` / `text/uri-list` directly.
  This needs a small per-platform shim — tracked in Roadmap.
- **Native OS notifications.** The spec calls for these, but the
  custom in-app toast window gives far more control over theming/
  animation, so that's what's implemented first. The
  `tauri-plugin-notification` dependency is already included and wired
  for a "use native notifications" toggle later.
- **Settings / Statistics / Achievements / Clipboard History pages,**
  sounds, mascot artwork (currently emoji placeholders), the full
  100+ funny-message library, and light/custom theme editor.
- **`icon.icns`** (macOS) isn't committed as a binary — generate it
  (along with a full re-check of all icon sizes) by running the Tauri
  CLI's icon generator against the included master image, see Setup.
- **This project has not been compiled.** The sandbox this was built
  in has no network access, so `npm install` / `cargo build` could not
  be run here. Treat the very first build on your machine as the real
  first compile — see [Known risk areas](#known-risk-areas-on-first-build)
  below for what's most likely to need a small fix.

---

## Architecture

```
/stopc
  /src-tauri              Rust backend (Tauri 2)
    /src
      main.rs              App entry: plugins, tray, window lifecycle
      clipboard.rs          Clipboard polling + change detection
      funny_mode.rs          Global Ctrl+C listener + repeat counting
      funny_messages.rs       Message/mascot data + random selection
      notification.rs        Notification window positioning
      commands.rs             Tauri commands (settings get/save/reset)
      state.rs                 Shared AppState + Settings struct
    /icons                  App/tray icons
    /capabilities            Tauri v2 permission grants
    tauri.conf.json           Window, bundle, tray config
    Cargo.toml
  /src                     React frontend (TypeScript + MUI)
    main.tsx                 Dashboard window entry
    notification-main.tsx      Notification window entry
    App.tsx                     Dashboard shell
    /components
      NotificationPopup.tsx      Toast UI (themes + animations)
    /hooks
      useClipboardWatcher.ts      Subscribes to backend events
    /store
      clipboardStore.ts            Zustand: clipboard history/counts
      settingsStore.ts              Zustand: user settings
    /types
      clipboard.ts                   Shared payload types
  index.html                Dashboard window HTML
  notification.html         Notification window HTML
  package.json / vite.config.ts / tsconfig.json
```

Two Tauri windows are used deliberately: `main` is the normal dashboard
window, and `notification` is a tiny frameless/transparent/always-on-top
window that only ever shows the toast — this is the standard pattern for
"floating over everything else" notifications in Tauri, and keeps the
notification UI free of the dashboard's layout constraints.

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://www.rust-lang.org/tools/install) (stable toolchain)
- Platform build tools for Tauri — follow the official
  [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/)
  for your OS (WebView2 on Windows, Xcode CLT on macOS, `webkit2gtk` +
  friends on Linux).

### Install

```bash
npm install
```

### Generate real platform icons (one-time, before your first build)

The repo includes a master `src-tauri/icons/icon.png` plus pre-rendered
`.png`/`.ico` variants, but not a macOS `.icns`. Regenerate the full set
(including `.icns`) from the master image:

```bash
npx tauri icon src-tauri/icons/icon.png
```

### Run in development

```bash
npm run tauri dev
```

On first run:
- **macOS**: grant Accessibility permission when prompted (required for
  Funny Mode's global Ctrl+C detection via `rdev`) — System Settings →
  Privacy & Security → Accessibility.
- **Linux (Wayland)**: global key listening may not work depending on
  your compositor; X11 sessions are the well-supported path today.

### Build for production

```bash
npm run tauri build
```

Produces installers per `tauri.conf.json`'s `bundle.targets`: `.msi` and
NSIS on Windows, `.dmg` on macOS, `.AppImage`/`.deb`/`.rpm` on Linux.
Cross-compiling installers for other OSes generally isn't supported by
Tauri — build each target on (or in a CI runner matching) that OS.

---

## Known risk areas on first build

Since this couldn't be compiled in the environment it was written in,
these are the spots most likely to need a small adjustment:

1. **Crate version pins in `Cargo.toml`** — `rdev`, `arboard`, and the
   `tauri-plugin-*` crates move fairly often; if `cargo build` reports a
   version conflict, relax the pin (e.g. `"2"` instead of `"2.1"`) and
   let Cargo resolve.
2. **`rdev`'s `Key::KeyC` variant name** — double-check against whatever
   `rdev` version Cargo resolves; some versions use `Key::KeyC`, others
   may differ slightly. The compiler error will point straight at it.
3. **Tauri v2 capability permission identifiers** in
   `src-tauri/capabilities/default.json` — plugin permission strings
   occasionally get renamed between minor versions; if the app fails to
   start with a permission error, the console message names the exact
   missing permission to add.

None of these affect the overall architecture — they're the normal
"first compile after scaffolding" friction of a fast-moving ecosystem.

---

## Roadmap

- [ ] File/folder clipboard detection (native shim per OS)
- [ ] Settings page UI (theme/animation/position/sound pickers)
- [ ] Statistics dashboard with charts (today/week/month/all-time)
- [ ] Achievements system + progress tracking
- [ ] Clipboard history (opt-in, capped or unlimited, search/pin/export)
- [ ] Full 100+ funny message library + custom message import/export
- [ ] Mascot illustration set (happy/excited/sleepy/confused/etc. per
      mascot) to replace emoji placeholders
- [ ] Sound pack playback + volume control
- [ ] Native OS notification mode as an alternative to the custom toast
- [ ] Tray menu routing to specific dashboard tabs
- [ ] Unit/integration/clipboard/notification/performance test suites
- [ ] CI matrix building all three installer targets

## License

MIT — see [LICENSE](./LICENSE).
