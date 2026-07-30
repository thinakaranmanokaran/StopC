#!/usr/bin/env node
/**
 * Downloads real cat photos from cataas.com (https://cataas.com) into
 * src/assets/cats/<mood>/, one folder per Funny Mode mood.
 *
 * WHY THIS IS A SCRIPT AND NOT A RUNTIME FETCH:
 * StopC's users won't necessarily have internet access when Funny Mode
 * triggers, and the app should never depend on a network call to show
 * a notification. So this script runs once at DEV TIME (on a machine
 * that does have internet — yours), and its output gets bundled into
 * the app like any other static asset. At runtime the app only ever
 * reads local files.
 *
 * If you don't run this at all, nothing breaks — CatIllustration.tsx
 * automatically falls back to the built-in original SVG cat art for
 * any mood that has no downloaded photos. Run this once, several
 * times to get more variety, or never; it's entirely optional.
 *
 * Usage:
 *   node scripts/fetch-cat-images.mjs            # 4 photos per mood
 *   node scripts/fetch-cat-images.mjs --count 8   # 8 photos per mood
 *
 * cataas.com's exact tag catalogue isn't guaranteed to be stable —
 * these tags are a best-effort mapping. If a tagged request 404s, the
 * script falls back to an untagged random cat so you still get
 * *something* for that mood, just less targeted. Feel free to edit
 * MOOD_TAGS below if you find better-fitting tags on cataas.com.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_ROOT = path.resolve(__dirname, "../src/assets/cats");

const MOOD_TAGS = {
  annoyed: ["angry", "grumpy"],
  laughing: ["funny", "cute"],
  shocked: ["surprised", "cute"],
  judging: ["grumpy", "cute"],
  crying: ["sad", "cute"],
  proud: ["cute", "happy"],
  sleepy: ["sleepy", "cute"],
};

const args = process.argv.slice(2);
const countIdx = args.indexOf("--count");
const COUNT_PER_MOOD = countIdx !== -1 ? parseInt(args[countIdx + 1], 10) || 4 : 4;

async function fetchOne(tag) {
  const url = tag
    ? `https://cataas.com/cat?tag=${encodeURIComponent(tag)}&type=square`
    : `https://cataas.com/cat?type=square`;
  const res = await fetch(url, { redirect: "follow" });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  return buf;
}

async function downloadForMood(mood, tags) {
  const dir = path.join(OUTPUT_ROOT, mood);
  await fs.mkdir(dir, { recursive: true });

  let saved = 0;
  let attempt = 0;
  const maxAttempts = COUNT_PER_MOOD * 3; // allow retries/duplicates without infinite looping

  while (saved < COUNT_PER_MOOD && attempt < maxAttempts) {
    attempt++;
    const tag = tags[attempt % tags.length];
    try {
      const buf = await fetchOne(tag);
      const filePath = path.join(dir, `${mood}-${saved + 1}.jpg`);
      await fs.writeFile(filePath, buf);
      saved++;
      console.log(`[${mood}] saved ${filePath} (tag: ${tag})`);
    } catch (e) {
      console.warn(`[${mood}] attempt ${attempt} failed (tag: ${tag}):`, e.message);
      // Last resort: untagged random cat, so the mood folder isn't empty.
      if (attempt === maxAttempts - 1) {
        try {
          const buf = await fetchOne(null);
          const filePath = path.join(dir, `${mood}-${saved + 1}.jpg`);
          await fs.writeFile(filePath, buf);
          saved++;
          console.log(`[${mood}] saved ${filePath} (untagged fallback)`);
        } catch (e2) {
          console.warn(`[${mood}] untagged fallback also failed:`, e2.message);
        }
      }
    }
  }

  if (saved === 0) {
    console.warn(`[${mood}] got 0 images — CatIllustration will use the SVG fallback for this mood.`);
  }
}

async function main() {
  console.log(`Fetching ${COUNT_PER_MOOD} cat photo(s) per mood from cataas.com...`);
  for (const [mood, tags] of Object.entries(MOOD_TAGS)) {
    await downloadForMood(mood, tags);
  }
  console.log("\nDone. Re-run `npm run dev` / `npm run build` to pick up the new images.");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
