# StopC Website — Build Plan

**Goal:** A minimal, text-first static website for StopC, hosted at `https://stopc.netlify.app/`. It supplies the privacy-policy URL required by Microsoft Store submission (policy 10.5.1), a support URL for the Store listing, and a plain home page explaining the product.

**Reference style:** `https://rafaelcespedes.com/` — one column of text, a few links, no imagery, no cards, no animation. User explicitly wants simple; no hero graphic, no screenshots, no motion. The design-taste kit's hero/moment/gate rules are intentionally not used here — they would add the things the user asked to leave out.

## Files

Repo root: `e:/Thinakaran/Development/StopC`

```
website/
  index.html              Home — plain text + links
  privacy/index.html      Privacy policy (Store URL: /privacy/)
  support/index.html      Support + FAQ (Store support URL)
  404.html                Plain not-found page
  _redirects              /privacy -> /privacy/ ; /support -> /support/
  assets/site.css         One small shared stylesheet
  robots.txt
  sitemap.xml
netlify.toml              Repo root: publish = "website", no build command
```

Netlify: connect the GitHub repo, deploy from `main`, publish directory `website` (configured in `netlify.toml`). Netlify provides HTTPS automatically. Verify `https://stopc.netlify.app/`, `/privacy/`, `/support/` return HTTP 200 before submitting to Partner Center.

## Visual style

- System font stack, ~16–17px body text, line-height ~1.6, max width ~680px, centered.
- Off-white background (`#fafafa` or similar), black/near-black text, one accent colour for links, underlined.
- Single column. One CSS file shared by all pages. No JS required.
- Same header (small "StopC" wordmark + links Home / Privacy / Support) and footer on every page.
- Responsive by nature: one column means no layout work at 390px versus 1440px.
- Accessibility basics: `<html lang="en">`, title + meta description per page, visible focus rings, real heading order, link text that makes sense out of context.

## Home page content (~200 words)

1. Small heading: **StopC**
2. Line: **Copy once. Trust forever.**
3. Short paragraph: StopC is a small background app that confirms every copy with a quick notification, so you stop pressing Ctrl+C twice out of doubt. It does not store clipboard history.
4. Plain links, one per line:
   - Download for Windows (GitHub Releases, or Store URL when live)
   - How it works (three short lines inline)
   - Privacy policy
   - Support
   - GitHub / source
5. Footer: Thinakaran Manokaran · MIT License

No sections-as-screens, no visuals, no screenshot frames, no feature cards, no equations, no animations.

## Privacy policy page content

Plain headings + paragraphs; same layout as home. Must cover Store policy 10.5.1: what personal information is accessed/collected/transmitted, how it is used, stored, secured, who it is disclosed to, what controls users have, and how to access it.

1. **Scope** — who publishes StopC, which product the policy covers, effective date.
2. **What StopC does not collect** — clipboard contents are never transmitted or written to disk; no clipboard history by default; no analytics, ads, accounts, or telemetry; the global Ctrl+C listener only counts shortcut presses and does not record typed keystrokes.
3. **What stays on your device** — settings (theme, toggles, optional user name, exclusions, snooze duration) in browser `localStorage`; copy events in memory only, capped at 50 and cleared on restart; foreground executable name read transiently on Windows only to apply Exclusions, never stored or uploaded.
4. **Network use** — the only outbound request happens when the user explicitly clicks Check for Updates or downloads an update: a GET to `https://api.github.com/repos/thinakaranmanokaran/StopC/releases/latest` and a download from a GitHub release asset. GitHub receives standard request metadata such as IP address and user agent, governed by GitHub's privacy statement. No automatic check at launch; no servers operated by us.
5. **Permissions used and why** — clipboard read/write, Ctrl+C press counter, notifications, autostart (user-controlled).
6. **Children** — not directed at children; no knowing collection from under-13s.
7. **Security and retention** — TLS for GitHub requests; no clipboard data on disk; local settings can be reset through the app; uninstall removes app data.
8. **Your choices** — reset settings, disable Funny Mode/sounds/autostart, manage exclusions, snooze, uninstall; how to clear browser storage if needed.
9. **Changes** — how updates to this policy are posted and dated.
10. **Contact** — public email or GitHub Issues link.

## Support page content

1. What StopC does and how to trigger a test notification (Dashboard → Try It Out).
2. FAQ lines:
   - Toast not appearing (notification toggles, snooze, exclusions per app).
   - Funny Mode not firing (terminal apps treat Ctrl+C as cancel; Windows UIPI/elevated apps; macOS Accessibility permission; repeated presses must be within the recent-copy window).
   - Notifications and focus assist.
   - How to pause notifications (tray Snooze / Settings).
   - How to uninstall.
3. Contact link (email or GitHub Issues) and link to Privacy policy.

## Implementation order

1. Create `website/` structure, `netlify.toml`, `_redirects`, shared CSS, header/footer, `robots.txt`, `sitemap.xml`.
2. Write the home page text first, then the HTML.
3. Write the privacy policy text, then the HTML.
4. Write the support page.
5. Add `404.html`.
6. Local checks: all internal and external links resolve; pages render readably at 390px and 1440px; headings order, titles, meta descriptions; no JavaScript errors (there is no JS).
7. Deploy to Netlify, verify the three public URLs over HTTPS.
8. After switching agents, add Privacy/Support links into StopC's About page and README, then paste `https://stopc.netlify.app/privacy/` into Partner Center → Properties → Privacy policy URL and `https://stopc.netlify.app/support/` into the support field.

## Pending decisions (needed before writing contact/download links)

1. Public contact email for the privacy/support pages, or GitHub Issues only?
2. Download link for now: GitHub Releases latest (`https://github.com/thinakaranmanokaran/StopC/releases/latest`) or an existing Store URL?
3. Keep `stopc.netlify.app` as canonical, or is a custom domain coming later? If a custom domain is added, update the canonical tags, sitemap, Store URLs, and in-app links.
