/**
 * Single source of truth for all common, brand, SEO, and page content.
 * Edit values here and run `npm run build` inside `website/` to update
 * both the React UI and the pre-rendered static HTML, sitemap, and JSON-LD.
 */

export const SITE = {
  name: "StopC",
  tagline: "Copy once. Trust forever.",
  siteUrl: "https://stopc.netlify.app",
  appVersion: "1.2.0",
  appIdentifier: "com.stopc.app",
  language: "en",
  locale: "en_US",
  themeColor: "#fafafa",
  author: {
    name: "Thinakaran Manokaran",
    url: "https://thinakaran.dev/",
  },
  license: {
    name: "MIT License",
    url: "https://github.com/thinakaranmanokaran/StopC/blob/main/LICENSE",
  },
  links: {
    githubRepo: "https://github.com/thinakaranmanokaran/StopC",
    githubReleases: "https://github.com/thinakaranmanokaran/StopC/releases/latest",
    githubIssues: "https://github.com/thinakaranmanokaran/StopC/issues",
    // Paste your live Microsoft Store URL here once Store certification is published, e.g.:
    // "https://apps.microsoft.com/detail/..."
    microsoftStoreUrl: "",
    // Optional public support/privacy email (renders mailto: automatically if non-empty):
    contactEmail: "",
  },
  nav: [
    { label: "Home", href: "/" },
    { label: "Privacy", href: "/privacy/" },
    { label: "Support", href: "/support/" },
  ],
};

export const PAGES = {
  home: {
    path: "/",
    title: "StopC - Copy Confirmation & Clipboard Notification App for Windows",
    description:
      "Stop pressing Ctrl+C twice. StopC gives you an instant on-screen copy confirmation notification on Windows when text or images copy - without saving clipboard history.",
    keywords: [
      "did ctrl c actually copy",
      "clipboard copy notification windows",
      "confirm ctrl c copied",
      "copy confirmation popup windows 11",
      "stop pressing ctrl c twice",
      "clipboard notification without history",
      "visual copy feedback windows",
      "StopC app",
      "StopC Microsoft Store",
    ],
    robots: "index, follow",
    ogType: "website",
  },
  privacy: {
    path: "/privacy/",
    title: "Privacy Policy | StopC Copy Confirmation App",
    description:
      "StopC never writes clipboard history to disk or sends copied content over the network. Read full privacy details for local preferences, exclusions, and update checks.",
    keywords: [
      "StopC privacy policy",
      "does StopC save clipboard history",
      "private clipboard notification app",
      "clipboard app no telemetry",
      "Microsoft Store privacy policy StopC",
    ],
    robots: "index, follow",
    ogType: "article",
  },
  support: {
    path: "/support/",
    title: "Support & FAQ | StopC Copy Confirmation App",
    description:
      "Get help with StopC copy notifications, Funny Mode repeats, Windows Focus Assist, Snooze, app exclusions, and uninstalling.",
    keywords: [
      "StopC support",
      "copy notification not appearing windows",
      "Ctrl+C popup not working",
      "StopC funny mode not firing",
      "pause clipboard notifications",
      "uninstall StopC",
    ],
    robots: "index, follow",
    ogType: "website",
  },
  notFound: {
    path: "/404.html",
    title: "Page Not Found | StopC",
    description: "The requested StopC page could not be found. Browse Home, Privacy Policy, or Support.",
    keywords: ["StopC"],
    robots: "noindex, follow",
    ogType: "website",
  },
};

export const HOME = {
  eyebrow: `Windows Utility · Version ${SITE.appVersion} · Open Source`,
  heading: "StopC",
  tagline: "Copy once. Trust forever.",
  summary:
    "Ever wondered \"did Ctrl+C actually copy?\" StopC is a tiny Windows 10 and Windows 11 utility that confirms every copy with a quick on-screen notification, so you stop pressing Ctrl+C twice out of doubt. It gives instant visual and audio feedback for copied text and images without storing clipboard history.",
  cta: {
    heading: "Download StopC",
    microsoftStore: {
      title: "Download from Microsoft Store",
      pendingTitle: "Microsoft Store (Windows 10 & 11)",
      pendingNote: "Microsoft Store listing coming soon - Store release in review.",
      liveNote: "Official packaged release for Windows 10 and Windows 11.",
    },
    githubRelease: {
      label: "Download for Windows via GitHub Releases",
      note: "Free MIT-licensed Windows installer (.exe / .msi) available directly on GitHub.",
    },
  },
  howItWorks: {
    heading: "How it works",
    steps: [
      {
        index: "01",
        text: "Runs quietly in your system tray and detects when new text or an image lands on your clipboard.",
      },
      {
        index: "02",
        text: "Shows a brief, click-through confirmation popup (with optional subtle sound) so you know the copy worked.",
      },
      {
        index: "03",
        text: "Notices repeated Ctrl+C presses on unchanged content - responding with Funny Mode or counting repeats.",
      },
    ],
  },
  highlights: {
    heading: "Why people keep it running",
    items: [
      "Zero clipboard history written to disk - your copied text and images stay off disk and never leave your PC.",
      "Click-through corner toast with 11 themes, 4 animations, custom opacity, and optional sound packs.",
      "Per-app exclusions on Windows, terminal safety for Ctrl+C, and one-click Snooze from the system tray.",
    ],
  },
  linksHeading: "Links",
};

export const PRIVACY = {
  eyebrow: "Microsoft Store Policy 10.5.1",
  heading: "Privacy Policy",
  effectiveDate: "November 25, 2026",
  effectiveIso: "2026-11-25",
  intro:
    "This privacy policy applies to the StopC desktop application (com.stopc.app) published by Thinakaran Manokaran. StopC is built to confirm clipboard copies locally with strict respect for your privacy.",
  sections: [
    {
      id: "scope",
      index: "01",
      title: "Scope",
      paragraphs: [
        "This policy covers the StopC desktop application across Windows, macOS, and Linux builds, including packages distributed via GitHub Releases and the Microsoft Store.",
        "StopC is developed and published as open-source software by Thinakaran Manokaran under the MIT License.",
      ],
    },
    {
      id: "not-collected",
      index: "02",
      title: "What StopC does not collect",
      paragraphs: [
        "StopC is a copy confirmation tool, not a clipboard manager. It does not save clipboard history to disk and never uploads, transmits, sells, or shares your clipboard content.",
        "StopC contains no analytics SDKs, no crash telemetry, no advertising trackers, and no user accounts.",
        "When Funny Mode or repeat-copy detection is active, the global keyboard listener checks solely for Ctrl+C presses so it can count repeated copy attempts. It never logs typed characters, passwords, or general keyboard activity.",
      ],
    },
    {
      id: "device-storage",
      index: "03",
      title: "What stays on your device",
      paragraphs: [
        "Clipboard change detection compares SHA-256 hashes in memory (RAM) and builds a transient event payload (content kind, byte size or image dimensions, and up to a 120-character text preview for displaying the toast). Any recent copy metadata held in memory (capped at 50 items) clears completely when StopC exits and is never persisted to files or databases.",
        "Your preferences - notification theme, animation, position, duration, opacity, corner radius, text/image toggles, Funny Mode settings, sound pack and volume, autostart preference, optional first name, snooze duration, and excluded app executable names - are saved locally in the app's WebView storage (localStorage under stopc:settings and stopc:namePrompted).",
        "On Windows, StopC transiently checks the active foreground application's executable basename in memory solely to skip notifications for apps you added to Exclusions and to prevent Funny Mode from triggering inside terminals (where Ctrl+C cancels commands). When you open the Exclusions page, StopC reads local Windows Uninstall registry entries so you can pick installed apps; only the executables you explicitly exclude are saved locally.",
      ],
    },
    {
      id: "network",
      index: "04",
      title: "Network use",
      paragraphs: [
        "StopC works offline and never phones home or checks for updates automatically when launched.",
        "An outbound HTTPS request occurs only if you manually trigger Check for Updates (from the About page or system tray) or click Download & Install. StopC sends a GET request to https://api.github.com/repos/thinakaranmanokaran/StopC/releases/latest with User-Agent: StopC-Updater and downloads the release installer from GitHub.",
        "When making that request, GitHub receives standard connection metadata such as your IP address and user agent, governed by the GitHub Privacy Statement. The developer operates no servers and receives no data from your device.",
      ],
    },
    {
      id: "permissions",
      index: "05",
      title: "Permissions and system access used",
      bullets: [
        "Clipboard read and write: detects copy changes and powers the Dashboard \"Try It Out\" test button.",
        "Global Ctrl+C shortcut detection: counts repeated Ctrl+C presses on unchanged clipboard content for Funny Mode and repeat copy alerts (requires Accessibility permission on macOS).",
        "Notifications: displays StopC's click-through confirmation toast and native OS notices for silent login start or Snooze status.",
        "Launch at login (autostart): optional setting you can turn on or off at any time in Settings.",
        "Active window and installed apps lookup (Windows): applies your Exclusions list and keeps terminal Ctrl+C shortcuts uninterrupted.",
      ],
    },
    {
      id: "children",
      index: "06",
      title: "Children's privacy",
      paragraphs: [
        "StopC is a general-purpose desktop utility not directed at children under 13, and it does not knowingly collect personal information from children.",
      ],
    },
    {
      id: "security",
      index: "07",
      title: "Security and retention",
      paragraphs: [
        "Optional GitHub update checks and installer downloads run strictly over HTTPS/TLS. Active snooze countdowns and recent copy payloads remain in volatile memory only and reset when StopC closes.",
        "Local preferences remain in your device's application storage until you reset or uninstall StopC.",
      ],
    },
    {
      id: "choices",
      index: "08",
      title: "Your choices and controls",
      paragraphs: [
        "You are in full control of local preferences and behavior inside the app: clear or change your optional display name, toggle text or image notifications, disable Funny Mode, mascots, sounds, or launch-at-login, edit Exclusions, snooze notifications, or click Reset to Defaults in Settings.",
        "Uninstalling StopC removes the app; when using the Windows NSIS installer, selecting Delete app data removes local WebView storage and application data folders from your user profile.",
      ],
    },
    {
      id: "changes",
      index: "09",
      title: "Changes to this policy",
      paragraphs: [
        "If StopC introduces features that alter how data is accessed or stored, this policy will be updated on this page with a revised effective date prior to release.",
      ],
    },
    {
      id: "contact",
      index: "10",
      title: "Contact",
      paragraphs: [
        "Questions, privacy requests, or security reports can be submitted directly through the StopC repository on GitHub.",
      ],
      showContact: true,
    },
  ],
};

export const SUPPORT = {
  eyebrow: "Help & Troubleshooting",
  heading: "Support & FAQ",
  intro:
    "StopC runs quietly in the background to confirm your clipboard copies. Try the quick self-test below or browse common fixes if notifications aren't showing as expected.",
  quickTest: {
    heading: "Quick check: trigger a test copy notification",
    steps: [
      "Open StopC from your system tray icon (or launch StopC from the Start Menu).",
      "If prompted for your name on first launch, enter one or click Skip.",
      "On the Dashboard, scroll to Try It Out and click Copy This Text - a confirmation toast should appear immediately.",
    ],
  },
  faqsHeading: "Frequently asked questions",
  faqs: [
    {
      id: "toast-not-appearing",
      question: "Why isn't the copy confirmation popup appearing?",
      answer:
        "Open Settings → Notifications and confirm Notify on text copy or Notify on image copy is enabled. Next, check whether notifications are snoozed (Settings → Snooze, or choose Cancel Snooze in the tray menu) or whether the current app is listed on the Exclusions page (Windows only). Also note that StopC currently detects text and image copies - file and folder copy detection is on the roadmap.",
    },
    {
      id: "funny-mode-not-firing",
      question: "Why isn't Funny Mode triggering when I press Ctrl+C multiple times?",
      answer:
        "Repeated Ctrl+C presses only count within 10 seconds of a real clipboard change and must reach your configured Funny Mode Threshold in Settings (2x to 10x, default 2x). Terminal apps such as cmd.exe, PowerShell, and Windows Terminal are intentionally skipped so cancelling commands never triggers Funny Mode. On Windows, apps running as Administrator block global hooks from non-elevated apps (UIPI). On macOS, grant Accessibility access in System Settings → Privacy & Security → Accessibility. On Linux, X11 is supported while Wayland depends on compositor policies.",
    },
    {
      id: "focus-assist",
      question: "How do StopC alerts work with Windows Focus Assist or Do Not Disturb?",
      answer:
        "StopC's copy and Funny Mode toasts appear inside StopC's own click-through always-on-top overlay window so they never interrupt clicks behind them. Native system alerts - used only when StopC launches silently at login or confirms a tray Snooze - follow Windows Focus Assist and notification settings.",
    },
    {
      id: "pause-notifications",
      question: "How do I pause or snooze notifications during a meeting or screen share?",
      answer:
        "Click the StopC system tray icon and pick Snooze to pause all copy and Funny Mode alerts for your configured duration (30 seconds up to 1 day), or choose Cancel Snooze to resume early. You can also choose Pause Notifications in the tray to turn off text or image notifications in Settings.",
    },
    {
      id: "uninstall",
      question: "How do I uninstall StopC and clear local settings?",
      answer:
        "Right-click or click the StopC system tray icon and choose Quit. Then open Windows Settings → Apps → Installed apps, locate StopC, and click Uninstall. If using the standalone NSIS installer, check Delete app data during uninstall to remove local WebView preferences as well (or click Reset to Defaults in Settings beforehand).",
    },
  ],
  contact: {
    heading: "Need more help?",
    description:
      "If something still isn't working, open an issue with your Windows version and steps to reproduce, or review our Privacy Policy.",
  },
};

export const NOT_FOUND = {
  eyebrow: "404",
  heading: "Page not found",
  message:
    "The address you opened doesn't match a page on this site. Use one of the links below to continue.",
};
