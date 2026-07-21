# StopC — Project Plan

**Tagline:** Copy Once. Trust Forever.
**Category:** Clipboard Confidence App (explicitly *not* a clipboard manager)
**License:** MIT

---

## 1. Vision & Philosophy

### The problem
Almost everyone presses Ctrl+C more than once for the same copy — not
because it failed, but because there's no immediate, trustworthy signal
that it worked. That half-second of doubt is the entire problem StopC
exists to solve.

### The product
StopC is a lightweight background utility that watches the clipboard and
gives an instant, beautiful, slightly playful confirmation the moment a
copy lands — text, image, file(s), folder, rich text, or HTML. It does
**not** store or manage clipboard history by default (that's an opt-in
side feature, disabled out of the box) — its job is reassurance, not
retrieval.

### Design pillars
| Pillar | What it means in practice |
|---|---|
| Native-feeling | Respects OS conventions (tray-first on Win/Linux, menu-bar-first on macOS), no Electron bloat |
| Instant | Sub-1s launch, near-zero idle CPU, <40MB RAM |
| Trustworthy by default | Works fully offline, no telemetry, no analytics, no cloud — ever |
| Delightful | Micro-animations, personality (Funny Mode, mascots), but never intrusive |
| Deeply customizable | Every visual/behavioral knob is user-editable, sensible defaults out of the box |

### Tone
Apple-level visual polish, Discord-level personality. Serious engineering
under a playful surface — the notification itself is minimal and classy;
the *personality* lives in Funny Mode, which is opt-in in spirit even
though it's on by default (one click to disable).

---

## 2. Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Backend | Rust | Memory safety + near-zero overhead for a background process |
| Shell | Tauri 2 | Native webview (not Electron) → small binary, low RAM |
| Frontend framework | React + TypeScript | Team familiarity, strong ecosystem |
| UI kit | Material UI (MUI v7) | Fast to build polished, consistent UI |
| Animation | Framer Motion | Physics-based spring animations for toasts |
| Icons | Lucide | Consistent, tree-shakeable icon set |
| State | Zustand | Minimal boilerplate vs. Redux for a small app |
| Persistence | Serde + JSON (Rust) / tauri-plugin-store (bridge) | Simple, human-readable settings file |
| Notifications | Custom toast window (primary) + tauri-plugin-notification (optional native mode) | Full control over theme/animation |
| Packaging | Tauri Bundler | Single toolchain → msi/dmg/AppImage/deb/rpm |

**Platforms:** Windows, macOS, Linux — from one codebase.

---

## 3. Architecture Overview

Two Tauri windows, one Rust core:

```
                    ┌─────────────────────────┐
                    │        Rust Core         │
                    │  (background, always on) │
                    │                           │
   OS Clipboard ───▶│  clipboard.rs (poll loop) │
                    │        │                  │
   OS Keyboard  ───▶│  funny_mode.rs (Ctrl+C)   │
                    │        │                  │
                    │   state.rs (shared state) │
                    │        │                  │
                    │   commands.rs (IPC)        │
                    └───┬───────────┬───────────┘
                        │ events    │ events
             ┌──────────▼───┐   ┌───▼─────────────┐
             │  main window  │   │ notification win │
             │  (dashboard)  │   │ (frameless toast) │
             │  React + MUI  │   │ React + Framer     │
             └───────────────┘   └────────────────────┘
```

- **`main` window** — normal dashboard: stats, settings, achievements,
  history. Closing it hides to tray rather than quitting.
- **`notification` window** — a tiny, frameless, transparent,
  always-on-top, taskbar-skipping window that renders *only* the toast.
  Keeping it separate means the toast can float above every other app
  without inheriting the dashboard's size/chrome constraints.
- Rust → frontend communication is event-based (`clipboard://changed`,
  `funny-mode://triggered`); frontend → Rust is command-based
  (`get_settings`, `save_settings`, `reset_settings`, growing over time).

### Why polling, despite "no polling" in the original spec
There is no single, dependency-free, push-based clipboard API that works
identically on Windows, macOS, and Linux. Windows has
`AddClipboardFormatListener`; macOS only exposes `NSPasteboard.changeCount`,
which Apple itself expects you to poll; X11/Wayland vary by compositor.
A ~300ms poll loop is the industry-standard pragmatic choice (most
clipboard utilities do this) and is imperceptible to users while costing
negligible idle CPU. A documented future optimization is a native
listener shim on Windows with poll fallback elsewhere.

---

## 4. Feature Breakdown

### 4.1 Clipboard Detection
- ✅ Text
- ✅ Images
- ⏳ Files / Multiple Files / Folders — needs a per-OS shim (`CF_HDROP`
  on Windows, `NSFilenamesPasteboardType` on macOS, `text/uri-list` on
  Linux); not exposed by the `arboard` crate today.
- ⏳ Rich Text / HTML — needs format-specific clipboard reads beyond
  plain text.

### 4.2 Notifications
- ✅ Custom toast window with content-aware copy ("Copied!",
  "Image Copied — 1920×1080 PNG", "3 Files Copied", etc.)
- ✅ 4 animation styles: Slide, Fade, Scale, Spring
- ✅ 11 visual themes: Material, Glassmorphism, Minimal, Neon, macOS,
  Windows 11, Retro, Terminal, Cute, Dark, Light
- ✅ Configurable duration (default 2s), position (6 corners/edges),
  opacity, corner radius
- ⏳ Native OS notification mode as an alternate to the custom toast

### 4.3 Funny Mode
- ✅ Detection logic: global Ctrl+C listener + repeat counter that
  resets on any real clipboard change
- ✅ Configurable trigger threshold
- ✅ Starter set: 20 messages, 9 mascot emoji, random pairing
- ⏳ Full 100+ message library
- ⏳ Custom message creation, import/export
- ⏳ Per-mascot expression states (happy/excited/sleepy/confused/crying/
  angry/celebrating/thinking/surprised) — currently emoji placeholders,
  needs actual illustrated mascot art
- ⏳ Enable/disable toggle wired into a real Settings UI (backend
  respects the flag already; no UI to flip it yet)

### 4.4 Statistics
- ⏳ Today / weekly / monthly / total copy counts
- ⏳ Breakdown by content type (text/image/file/folder)
- ⏳ Funny warnings triggered count
- ⏳ Most active hour, longest copied text, average daily copies
- ⏳ Chart visualizations on the dashboard
- Note: `clipboardStore.ts` already tracks running counts and recent
  history in memory — this phase is mostly persistence + charting.

### 4.5 Dashboard
- ✅ Minimal shell proving the pipeline (today's count, recent activity,
  live Funny Mode banner)
- ⏳ Full MUI dashboard: stat cards, charts, achievements panel,
  settings entry point

### 4.6 Achievements
- ⏳ Full system: First Copy, 100/1000 Copies, Ctrl+C Master, Keyboard
  Warrior, Copy Ninja, Office Hero, Clipboard Legend, Spam King, Trust
  Issues, Legendary Copier + completion percentage tracking

### 4.7 Sounds
- ⏳ Pop, Click, Bubble, Pop Cat, Dog Bark, Retro, Windows XP, Mac Pop,
  Mute + volume slider
- `Settings.sound_enabled` / `sound_pack` fields already exist on the
  Rust struct; playback isn't implemented yet

### 4.8 Settings
- ✅ Backend struct + Zustand store cover: theme, animation, position,
  duration, opacity, corner radius, Funny Mode on/off, mascots on/off,
  sound on/off + pack, auto-start
- ⏳ Actual Settings *page* UI to edit these (currently only reachable
  via the Tauri commands, not a visual form)
- ⏳ Backup / Restore, Language, Reset-to-defaults UI (reset command
  exists on the backend already)

### 4.9 System Tray
- ✅ Tray icon + menu: Open Dashboard, Pause Notifications, Funny Mode,
  Statistics, Settings, About, Quit
- ⏳ Menu items beyond Open/Quit currently just focus the main window —
  need to route to specific dashboard tabs once those exist

### 4.10 Auto Startup
- ✅ `tauri-plugin-autostart` integrated; `Settings.auto_start` flag
  exists; needs UI toggle

### 4.11 Clipboard History (opt-in, off by default)
- ⏳ Not started. Planned: capped (50/100/500) or unlimited local
  storage, search, pin, delete, export/import — deliberately scoped
  after the core confidence-notification experience is solid, since
  it's an optional side feature, not the product's core value.

### 4.12 Privacy
- ✅ Already true by construction: no network calls anywhere in the
  codebase, no analytics SDKs, settings persist to a local JSON file
  only.

---

## 5. Folder Structure (current)

```
/stopc
  /src-tauri
    /src
      main.rs            App entry, plugins, tray, window lifecycle
      clipboard.rs         Clipboard polling + change detection
      funny_mode.rs          Global Ctrl+C listener + counting
      funny_messages.rs        Message/mascot data + selection
      notification.rs          Notification window positioning
      commands.rs                Tauri IPC commands
      state.rs                    Shared AppState + Settings struct
    /icons                Generated app/tray icons
    /capabilities          Tauri v2 permission grants
    tauri.conf.json          Window/bundle/tray config
    Cargo.toml
  /src
    main.tsx              Dashboard window entry
    notification-main.tsx   Notification window entry
    App.tsx                   Dashboard shell (to grow into pages/)
    /components
      NotificationPopup.tsx     Toast UI (themes + animations)
    /hooks
      useClipboardWatcher.ts      Backend event subscription
    /store
      clipboardStore.ts             Copy history/counts
      settingsStore.ts                User settings
    /types
      clipboard.ts                     Shared payload types
  index.html / notification.html
  package.json / vite.config.ts / tsconfig.json
  README.md / LICENSE / PLAN.md (this file)
```

Folders implied by the original spec but not yet populated —
`/pages`, `/services`, `/utils`, `/themes`, `/settings` (frontend-side)
— will fill in as their corresponding features (§4.4–4.8) are built,
rather than being scaffolded empty ahead of need.

---

## 6. Data Model Sketch

```ts
// Clipboard event (Rust → frontend, per copy)
ClipboardEventPayload {
  kind: "text" | "rich_text" | "html" | "image" | "file" | "files" | "folder"
  preview: string
  size_bytes?: number
  dimensions?: string       // images
  item_count?: number       // files/folders
  timestamp: number
  is_duplicate: boolean
}

// Funny Mode event (Rust → frontend, per triggered popup)
FunnyModeEvent {
  repeat_count: number
  message: string
  mascot: string
}

// Settings (Rust <-> frontend, persisted to disk)
Settings {
  theme, animation, position, durationMs, opacity, cornerRadius,
  funnyModeEnabled, mascotsEnabled, soundEnabled, soundPack,
  autoStart, funnyModeThreshold, pollIntervalMs
}
```

Future additions: `ClipboardHistoryEntry` (id, payload, pinned, expiry),
`StatSnapshot` (day/week/month rollups), `Achievement` (id, progress,
unlockedAt).

---

## 7. Phased Roadmap

### Phase 0 — Core Skeleton ✅ (current)
Clipboard detection (text/image), notification pipeline, Funny Mode
detection logic + starter content, settings plumbing, tray, minimal
dashboard, branding, README.

### Phase 1 — Funny Mode Content
Full 100+ message library, mascot personality/expression data model,
enable/disable + custom message import/export (backend-first, simple
UI after).

### Phase 2 — Settings & Theming UI
Real Settings page: theme picker (11 themes, live preview), animation
picker, position/duration/opacity/corner-radius controls, Funny Mode
and mascot toggles, auto-start toggle, backup/restore, reset.

### Phase 3 — Dashboard, Stats & Achievements
Persisted statistics (daily/weekly/monthly/all-time), charts, most-
active-hour/longest-text insights, achievements system with progress
tracking, recent activity polish.

### Phase 4 — File/Folder/Rich-Text Detection
Per-OS clipboard shims for `CF_HDROP` / `NSFilenamesPasteboardType` /
`text/uri-list`, plus rich text (RTF) and HTML clipboard formats.

### Phase 5 — Sounds & Mascot Art
Sound pack playback + volume control; commissioned/generated mascot
illustrations across all emotion states, replacing emoji placeholders.

### Phase 6 — Clipboard History (opt-in)
Local-only history store with configurable cap, search, pin, delete,
export/import — gated behind an explicit opt-in toggle, off by default.

### Phase 7 — Testing & Hardening
Unit tests (clipboard hashing, funny-mode threshold logic, settings
serialization), integration tests (event pipeline), clipboard-specific
tests across content types, notification rendering tests, basic
performance benchmarks (RAM/CPU/startup time budgets from §8), and a
first pass at cross-platform CI.

### Phase 8 — Packaging & Release
CI matrix building `.msi`/NSIS, `.dmg`, `.AppImage`/`.deb`/`.rpm`;
code-signing/notarization research for macOS/Windows; GitHub release
process; polished About page and final branding pass.

---

## 8. Performance Budget

| Metric | Target |
|---|---|
| Idle RAM | Under 40 MB |
| Idle CPU | Near zero |
| Cold start | Under 1 second |
| Notification latency (copy → visible toast) | Under 300ms (bounded by poll interval) |

These are targets to validate once the app is actually compiled and
profiled on real hardware — not yet measured, since this codebase
hasn't been built outside a sandboxed, network-isolated environment.

---

## 9. Known Risks & Open Questions

- **Global key listening reliability.** `rdev` needs Accessibility
  permission on macOS and can be blocked by security software on
  Windows; Wayland support on Linux is inconsistent across compositors.
  Funny Mode should degrade gracefully (silently disabled) rather than
  crash if the listener fails to start.
- **File/folder clipboard formats** aren't cross-platform-uniform;
  Phase 4 needs real per-OS testing, not just code that compiles.
- **Code signing / notarization** for macOS and Windows installers is
  unscoped — needed before public distribution, not before internal
  testing.
- **Crate churn.** Tauri 2 plugins and `rdev` are actively developed;
  expect minor version-pin adjustments on first real compile (see
  README "Known risk areas on first build").

---

## 10. Deliverable Definition

A GitHub-publishable repository containing: complete Rust + React
source, generated branding assets, build configuration for all three
OS bundle targets, README with real setup/build instructions, MIT
LICENSE, and (as phases land) a test suite. "Done" for the *project*
means Phases 0–8 above are complete and the app has been built and
smoke-tested on real Windows, macOS, and Linux machines — not just
compiled in CI.
