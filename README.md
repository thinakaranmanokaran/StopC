# StopC

**Copy Once. Trust Forever.**

A clipboard confidence app — not a clipboard manager. StopC watches your
clipboard and gives you an instant, delightful confirmation the moment a
copy lands, so you stop double- and triple-pressing Ctrl+C out of doubt.

> **Status: Settings + Developer pages added, notification bug fixed.**
> Clipboard detection, the notification pipeline (now actually visible —
> see Changelog), Funny Mode's detection logic, and a real Settings page
> are wired end-to-end. Stats/Achievements pages, the full 100+ message
> library, mascot art, sounds, clipboard history, and file/folder
> detection are **not yet built** (see [Roadmap](#roadmap)).

## Changelog

### This pass (hover-pause, drag-close, first-run flow, localStorage settings, and 13 other fixes)

1. **Sound now plays for every toast kind, not just copy.** Consolidated
   copy/funny/system sound into one shared code path
   (`soundPlayer.ts`) so there's no longer any asymmetry between how
   the different toast kinds are handled.
2. **Hover-to-hold.** The notification's dismiss timer is now a
   pausable ref-based countdown — hovering pauses both the timer and
   the visual countdown bar, resuming with the correct remaining time
   on mouse-leave, instead of a fire-and-forget `setTimeout`.
3. **Elastic drag-to-close.** Drag the toast any direction past ~90px
   and it dismisses; release before that and it snaps back
   (`dragElastic` + `dragSnapToOrigin`). Along the way, fixed a real
   structural bug in the first draft: Framer Motion's `AnimatePresence`
   needs the keyed animated element as a *direct* child to fire exit
   animations — it was nested inside a component that internally
   toggled null, so exits silently never played.
4. **First-launch-only dashboard.** Added `tauri-plugin-single-instance`
   (clicking the icon while already running now refocuses the existing
   window instead of doing nothing) plus a `--autostart` marker
   injected only into the OS autostart registration, so the app can
   tell "silently launched at login" apart from "a human clicked the
   icon" — the two cases that previously couldn't be distinguished.
5. **Real cat photos:** tried fetching from the cataas.com URL
   provided and confirmed this environment's fetch tool can't retrieve
   binary image content at all — there was no path to downloading
   actual photos into the project here. Built the honest alternative
   instead: the original SVG cat art stays as the always-available,
   zero-weight default, and `scripts/fetch-cat-images.mjs` is a Node
   script *you* run locally (with real internet) to pull photos from
   cataas.com into `src/assets/cats/<mood>/`. `CatIllustration.tsx`
   uses Vite's `import.meta.glob` to discover them at build time (so
   there's still no runtime network dependency) and falls back to SVG
   for any mood with no downloaded photos.
6. **Notification header simplified** to just the app name/logo,
   removed "Funny Mode · Copy #N".
7. **User name:** first-run capture screen, editable in Settings,
   avatar initial shown top-right on the Dashboard, and a handful of
   funny messages personalize via a `{name}` template token (Rust
   side) that the frontend substitutes or cleanly removes.
8. **Settings persistence moved to localStorage** as the source of
   truth (`settingsService.ts`); Rust keeps an in-memory mirror synced
   purely so its background threads can read current settings
   synchronously. Removed the never-actually-wired-up
   `tauri-plugin-store` dependency (both the Rust crate and the JS
   package) since it wasn't doing anything.
9. **Countdown-bar visibility is now a Settings toggle.**
10. **In-app confirmations use StopC's own toast**, not a separate MUI
    Snackbar — Settings save/reset now emit an `app://toast` event
    the notification window renders through the same pipeline.
11. **Live theme preview** shown above the theme picker in Settings.
12. **Sticky save bar** pinned to the bottom of the Settings page,
    disabled when there are no unsaved changes (draft vs. last-saved
    comparison).
13. **Dashboard simplified**: removed the copy counter, background-run
    disclaimer, Recent Activity list, and the redundant nav icon row;
    expanded "Try It Out" with quick-fill example chips; added a
    `navigator.clipboard` fallback if the Tauri plugin call fails.
14. **Removed "Mute" from the sound pack list** — the Enable Sound
    toggle already covers that.
15. **Native-app feel**: global CSS disables text selection outside
    inputs/textareas, restyles the scrollbar, and suppresses the
    browser-style right-click context menu.
16. **Light theme redesigned.** The M3 color tokens themselves were
    already correct (not actually "inverted dark"), but `M3Card`,
    `M3IconButton`, and `M3SocialCard` all hardcoded a flat black
    shadow inline — bypassing the theme entirely — which is what made
    light mode look flat. Added a shared `cardShadow()` helper that
    tints shadows with the primary color in light mode (an M3
    "surface tint" effect) plus a soft gradient body background.
17. **`src/config/app.config.json`** — app name, slogan, logo URL/alt
    text, all with typed fallbacks (`appConfig.ts`) — wired into the
    nav header, toast header, theme preview, About page, and first-run
    screen so rebranding doesn't require touching component code.

**Bugs found while auditing, unrelated to the list above but fixed
along the way:**
- `state.rs`'s `Settings` struct was missing the new `userName`/
  `showCounter` fields entirely. Since Rust re-broadcasts its own
  settings object after every save, this would have silently wiped
  both fields from every window's in-memory copy on the next sync
  (while leaving them intact in localStorage) — a subtle
  works-until-it-doesn't bug.
- `src/vite-env.d.ts` (the standard Vite client type reference) never
  existed in this project. `import.meta.glob` (used for the cat-photo
  discovery in #5) would have failed a real `tsc` type-check without
  it, even though it's invisible to `transpileModule`-based syntax
  checks.
- Two Cargo dependencies (`once_cell`, `chrono`) were declared but
  never actually used anywhere in the Rust source — pure dead weight.
  Removed.

### Earlier pass (themes, sound, Funny Mode, mascots, dashboard, background-run)

⚠️ **`src-tauri` was missing from the uploaded project again**, so the
Rust backend below was reconstructed from the last known-good version
plus these fixes — if you hand-edited any `.rs` files outside this
chat since then, those changes aren't reflected here. Please diff
before assuming nothing else changed.

- **Fixed — themes never applied:** the notification window runs in
  its own isolated JS context and never loaded settings from the
  backend, so it always used hardcoded defaults regardless of what was
  picked in Settings. It now calls `get_settings` on launch and stays
  live-synced via a new `settings://updated` event the backend emits
  after every save/reset. All 11 themes were also rebuilt as complete
  treatments (border + shadow + blur, not just a background swap) —
  glassmorphism in particular now gets real `backdrop-filter` blur
  against the transparent window.
- **Fixed — sound never played:** nothing played audio at all before.
  Added a Web Audio–based synthesizer (`src/services/soundPlayer.ts`)
  with distinct pop/click/bubble/retro tones — no bundled audio files
  needed, works fully offline. Added a volume control and "Test Sound"
  button in Settings.
- **Fixed — Funny Mode not firing:** the real bug was that `rdev`'s
  global key-hook callback ran a blocking `sleep` (up to 500ms)
  *synchronously on the OS hook thread* on every Ctrl+C press. Under
  rapid repeated presses this caused the OS to drop/coalesce keystrokes
  before they ever reached the counting logic, so the threshold was
  rarely reached. Fixed by moving that work to a spawned thread per
  press (`funny_mode.rs`). Separately, the floating toast window never
  listened for `funny-mode://triggered` at all — only the Dashboard
  page did — so even a successful trigger was invisible unless you had
  the dashboard open. Both are fixed.
- **Added — cat mood illustrations:** original SVG cat-face art (7
  moods: annoyed/laughing/shocked/judging/crying/proud/sleepy),
  genuinely hand-coded shapes rather than any reproduction of an
  existing meme template, shown alongside each funny message.
- **Improved — notification UI:** countdown progress bar, icon badge
  styling, theme-correct shadows/borders, and an edge-aligned layout
  so the toast correctly hugs whichever screen corner is configured
  regardless of whether it's showing the compact copy toast or the
  taller funny-mode one.
- **Added — Dashboard "Try It Out" card:** a text field + Copy button
  so you can trigger a real notification immediately without leaving
  the app to find something to copy.
- **Fixed — background-run behavior:** the main window used to open
  automatically on every launch (`"visible": true` in
  `tauri.conf.json`). It now starts hidden — StopC only runs the tray
  icon + background watchers until you click "Open Dashboard." A
  one-time native OS notification on first launch plus an in-app
  notice on the Dashboard both explain this explicitly, since most
  apps *do* open a window and the silent default could otherwise read
  as broken.
- **Fixed — three silent field-name bugs:** Rust's
  `#[serde(rename_all = "camelCase")]` was serializing
  `FunnyModeEvent.repeat_count` as `repeatCount` and
  `ClipboardEventPayload.{is_duplicate,size_bytes,item_count}` as
  `{isDuplicate,sizeBytes,itemCount}`, but the frontend TypeScript
  types declared the snake_case Rust names — meaning those fields were
  silently `undefined` on every event since the very first version of
  this codebase. Fixed across `types/clipboard.ts` and every file that
  read them.
- **Fixed — missing production build entry:** `vite.config.ts` never
  registered `notification.html` as a Rollup input, so it would be
  silently absent from `dist/` in a production `tauri build` even
  though `tauri dev` masked the problem (Vite's dev server serves any
  file, entry or not).
- **Cleaned up:** removed unused `Info`/`InfoIcon` imports in
  `SettingsPage.tsx` that would fail a strict `tsc` build
  (`noUnusedLocals` is on in `tsconfig.json`).

### Earlier pass

- **Fixed:** the notification toast window was created but never shown —
  `clipboard.rs` emitted events correctly and the frontend updated
  state, but nothing ever called `window.show()` on the notification
  window, so it silently never appeared. `notification.rs` now has a
  `show_notification()` that positions, shows, and auto-hides the
  window on every real (non-duplicate) clipboard change.
- **Fixed:** an invalid `"plugins": { "autostart": {...} } }` block in
  `tauri.conf.json` crashed the app on launch
  (`PluginInitialization("autostart", ...)`). Autostart's
  `macosLauncher` config only belongs in `main.rs`'s
  `tauri_plugin_autostart::init(...)` call — removed the duplicate.
- **Added:** Settings page (`src/pages/SettingsPage.tsx`) with
  per-type notification toggles (text / image), theme/animation/
  position pickers, duration/opacity/corner-radius sliders, Funny Mode
  + mascot toggles, sound settings, and auto-start — all synced to the
  Rust `Settings` struct via `get_settings`/`save_settings`/
  `reset_settings`.
- **Added:** `notifyOnText` / `notifyOnImage` settings so each content
  type's toast can be silenced independently (`state.rs`,
  `clipboard.rs`).
- **Added:** Developer/About page (`src/pages/DeveloperPage.tsx`)
  crediting the app's creator.
- **Added:** left-nav app shell (`src/App.tsx`) with Dashboard /
  Settings / Developer pages; tray menu's Settings and About items now
  actually navigate to those pages instead of just focusing the window.
- **Changed:** `Settings` now deserializes with `#[serde(default)]` at
  the container level, so future new fields won't break loading an
  older saved `settings.json`.

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
- **Statistics / Achievements / Clipboard History pages,** sound
  playback (the picker exists in Settings, but nothing plays yet),
  mascot artwork (currently emoji placeholders), the full 100+
  funny-message library, and a custom theme editor.
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
4. **`tauri-plugin-notification`'s exact method names** in
   `main.rs`'s `announce_background_launch()` —
   `NotificationExt::permission_state()` / `request_permission()` and
   the `PermissionState` enum variants (`Granted`/`Prompt`/
   `PromptWithRationale`) are correct as of the plugin's early-2.x API,
   but this is one of the areas most likely to have shifted by the
   time you build. If it doesn't compile, the fix is almost always
   just adjusting these two calls — the rest of the startup-notification
   logic doesn't depend on the exact API shape.
5. **`tauri_plugin_single_instance::init`'s callback signature** in
   `main.rs` — `|app, _argv, _cwd|` is correct for the plugin's early-2.x
   API; if it doesn't compile, check the plugin's current callback
   signature (parameter count/order occasionally changes between
   versions).
6. **Hover-to-pause and drag-to-close depend on the notification
   window actually receiving mouse events** despite being created with
   `focus: false` (so it doesn't steal focus from whatever app you're
   using). This *should* work — hover/drag detection doesn't require
   keyboard focus, only the cursor being over the window's screen
   region — but it's untested on real hardware in this pass, so treat
   it as the first thing to verify if dragging/hovering feels
   unresponsive.

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
