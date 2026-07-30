import { useMemo } from "react";
import type { Mood } from "@/utils/mood";
import { MOOD_ACCENT } from "@/utils/mood";

interface Props {
  mood: Mood;
  size?: number;
}

// Vite statically discovers any images the developer has downloaded via
// `scripts/fetch-cat-images.mjs` (from cataas.com) into
// src/assets/cats/<mood>/*.jpg at BUILD time — this glob runs once
// during bundling, not at runtime, so there's no network dependency or
// missing-folder error even if the script was never run (the glob just
// resolves to an empty object).
const PHOTO_MODULES = import.meta.glob("/src/assets/cats/*/*.{jpg,jpeg,png,webp}", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const PHOTOS_BY_MOOD: Partial<Record<Mood, string[]>> = {};
for (const [filePath, url] of Object.entries(PHOTO_MODULES)) {
  const match = filePath.match(/\/cats\/([a-z]+)\//);
  const mood = match?.[1] as Mood | undefined;
  if (!mood) continue;
  (PHOTOS_BY_MOOD[mood] ??= []).push(url);
}

/**
 * Prefers a real downloaded cat photo for this mood if one exists;
 * otherwise falls back to the original hand-coded SVG illustration
 * below. Either way this never touches the network — real photos are
 * bundled at build time, not fetched live (see the glob above and
 * scripts/fetch-cat-images.mjs for why).
 */
export function CatIllustration({ mood, size = 96 }: Props) {
  const photoUrl = useMemo(() => {
    const photos = PHOTOS_BY_MOOD[mood];
    if (!photos || photos.length === 0) return null;
    return photos[Math.floor(Math.random() * photos.length)];
  }, [mood]);

  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={`A cat looking ${mood}`}
        width={size}
        height={size}
        style={{ borderRadius: "14px", objectFit: "cover", display: "block" }}
      />
    );
  }

  return <CatSvg mood={mood} size={size} />;
}

/**
 * The always-available fallback: deliberately simple geometric shapes
 * (circle head, triangle ears, path-based features) — this is original
 * artwork drawn directly in SVG, not a reproduction of any existing
 * meme template or copyrighted character, which keeps Funny Mode's
 * "relatable cat reaction" idea safe to ship with zero download weight.
 */
function CatSvg({ mood, size = 96 }: Props) {
  const accent = MOOD_ACCENT[mood];
  const fur = "#2A2438";
  const furLight = "#3A3350";

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Ears */}
      <path d="M22 38 L34 8 L46 40 Z" fill={furLight} />
      <path d="M98 38 L86 8 L74 40 Z" fill={furLight} />
      <path d="M27 34 L34 16 L41 35 Z" fill={accent} opacity={0.7} />
      <path d="M93 34 L86 16 L79 35 Z" fill={accent} opacity={0.7} />

      {/* Head */}
      <circle cx="60" cy="66" r="42" fill={fur} />

      {/* Face features by mood */}
      <MoodFeatures mood={mood} accent={accent} />

      {/* Cheeks */}
      <circle cx="30" cy="76" r="7" fill={accent} opacity={0.25} />
      <circle cx="90" cy="76" r="7" fill={accent} opacity={0.25} />
    </svg>
  );
}

function MoodFeatures({ mood, accent }: { mood: Mood; accent: string }) {
  switch (mood) {
    case "laughing":
      return (
        <>
          <path d="M38 58 Q44 50 50 58" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M70 58 Q76 50 82 58" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M42 78 Q60 96 78 78" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M48 82 Q60 90 72 82" fill={accent} opacity={0.6} />
        </>
      );
    case "shocked":
      return (
        <>
          <circle cx="44" cy="62" r="8" fill="#FFFFFF" />
          <circle cx="76" cy="62" r="8" fill="#FFFFFF" />
          <circle cx="44" cy="62" r="4" fill="#171320" />
          <circle cx="76" cy="62" r="4" fill="#171320" />
          <ellipse cx="60" cy="84" rx="7" ry="9" fill="#171320" />
        </>
      );
    case "judging":
      return (
        <>
          <rect x="36" y="58" width="16" height="4" rx="2" fill="#FFFFFF" />
          <rect x="68" y="58" width="16" height="4" rx="2" fill="#FFFFFF" />
          <path d="M34 50 L52 54" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
          <path d="M86 48 L70 56" stroke="#FFFFFF" strokeWidth={3} strokeLinecap="round" />
          <path d="M50 86 Q60 82 72 88" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      );
    case "crying":
      return (
        <>
          <path d="M38 58 L50 66 M50 58 L38 66" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
          <path d="M70 58 L82 66 M82 58 L70 66" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
          <path d="M42 90 Q60 78 78 90" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M40 68 Q36 80 42 88 Q48 80 40 68 Z" fill="#4FC3F7" />
          <path d="M80 68 Q76 80 82 88 Q88 80 80 68 Z" fill="#4FC3F7" />
        </>
      );
    case "proud":
      return (
        <>
          <path d="M40 62 L44 54 L48 62 L44 66 Z" fill="#FFD23F" />
          <path d="M72 62 L76 54 L80 62 L76 66 Z" fill="#FFD23F" />
          <path d="M42 80 Q60 96 78 80" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" />
        </>
      );
    case "sleepy":
      return (
        <>
          <path d="M36 60 Q44 64 52 60" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" />
          <path d="M68 60 Q76 64 84 60" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" fill="none" />
          <ellipse cx="60" cy="86" rx="6" ry="4" fill="#FFFFFF" opacity={0.8} />
          <text x="86" y="30" fontSize="14" fill={accent} fontWeight={700}>
            z
          </text>
          <text x="96" y="20" fontSize="10" fill={accent} fontWeight={700}>
            z
          </text>
        </>
      );
    case "annoyed":
    default:
      return (
        <>
          <path d="M34 52 L52 58" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
          <path d="M86 52 L68 58" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
          <rect x="37" y="62" width="14" height="4" rx="2" fill="#FFFFFF" />
          <rect x="69" y="62" width="14" height="4" rx="2" fill="#FFFFFF" />
          <path d="M46 88 L74 88" stroke="#FFFFFF" strokeWidth={4} strokeLinecap="round" />
        </>
      );
  }
}
