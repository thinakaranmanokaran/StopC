import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, Stack, Typography } from "@mui/material";
import { CheckCircle2, Image as ImageIcon, Files, Folder, FileText } from "lucide-react";
import type { ClipboardEventPayload, FunnyModeEvent } from "@/types/clipboard";
import type { NotificationAnimation, NotificationTheme } from "@/store/settingsStore";
import { CatIllustration } from "@/components/mascot/CatIllustration";
import { MOOD_ACCENT } from "@/utils/mood";

interface Props {
  copyEvent: ClipboardEventPayload | null;
  funnyEvent: FunnyModeEvent | null;
  theme: NotificationTheme;
  animation: NotificationAnimation;
  opacity: number;
  cornerRadius: number;
  durationMs: number;
  mascotsEnabled: boolean;
}

const ICONS: Record<ClipboardEventPayload["kind"], typeof CheckCircle2> = {
  text: CheckCircle2,
  rich_text: FileText,
  html: FileText,
  image: ImageIcon,
  file: Files,
  files: Files,
  folder: Folder,
};

const TITLES: Record<ClipboardEventPayload["kind"], string> = {
  text: "Copied!",
  rich_text: "Rich Text Copied",
  html: "HTML Copied",
  image: "Image Copied",
  file: "File Copied",
  files: "Files Copied",
  folder: "Folder Copied",
};

// Every theme is a *complete* visual treatment: surface, text, border,
// and shadow — not just a background swap. Glassmorphism in particular
// needs the blur to actually read against whatever's behind the window,
// which only happens because the notification window itself is
// transparent (see src-tauri/tauri.conf.json) and this Box sits
// directly on that transparent canvas with no intermediate opaque layer.
interface ThemeStyle {
  background: string;
  color: string;
  border: string;
  shadow: string;
  blur?: string;
  accentBg?: string;
}

const THEME_STYLES: Record<NotificationTheme, ThemeStyle> = {
  material: {
    background: "#1E1E2E",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.06)",
    shadow: "0 10px 40px rgba(0,0,0,0.45)",
    accentBg: "rgba(124,92,252,0.18)",
  },
  glassmorphism: {
    background: "rgba(255,255,255,0.12)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.35)",
    shadow: "0 8px 32px rgba(0,0,0,0.25)",
    blur: "blur(20px) saturate(160%)",
    accentBg: "rgba(255,255,255,0.15)",
  },
  minimal: {
    background: "#FFFFFF",
    color: "#111111",
    border: "1px solid rgba(0,0,0,0.08)",
    shadow: "0 4px 20px rgba(0,0,0,0.12)",
    accentBg: "rgba(0,0,0,0.04)",
  },
  neon: {
    background: "#0A0A0F",
    color: "#39FF14",
    border: "1px solid #39FF14",
    shadow: "0 0 24px rgba(57,255,20,0.45), 0 0 4px rgba(57,255,20,0.8)",
    accentBg: "rgba(57,255,20,0.1)",
  },
  macos: {
    background: "rgba(28,28,30,0.78)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.12)",
    shadow: "0 12px 32px rgba(0,0,0,0.4)",
    blur: "blur(24px) saturate(180%)",
    accentBg: "rgba(255,255,255,0.08)",
  },
  windows11: {
    background: "rgba(32,32,32,0.82)",
    color: "#FFFFFF",
    border: "1px solid rgba(255,255,255,0.1)",
    shadow: "0 8px 28px rgba(0,0,0,0.35)",
    blur: "blur(28px) saturate(150%)",
    accentBg: "rgba(255,255,255,0.06)",
  },
  retro: {
    background: "#2B1B4E",
    color: "#FFD23F",
    border: "2px solid #FFD23F",
    shadow: "4px 4px 0 #FFD23F",
    accentBg: "rgba(255,210,63,0.15)",
  },
  terminal: {
    background: "#000000",
    color: "#00FF00",
    border: "1px solid #00FF00",
    shadow: "0 0 16px rgba(0,255,0,0.35)",
    accentBg: "rgba(0,255,0,0.08)",
  },
  cute: {
    background: "#FFE3EC",
    color: "#7A2E4E",
    border: "1px solid #FFB6CE",
    shadow: "0 8px 24px rgba(255,105,150,0.25)",
    accentBg: "rgba(255,105,150,0.15)",
  },
  dark: {
    background: "#121212",
    color: "#EAEAEA",
    border: "1px solid rgba(255,255,255,0.08)",
    shadow: "0 8px 28px rgba(0,0,0,0.5)",
    accentBg: "rgba(255,255,255,0.06)",
  },
  light: {
    background: "#FAFAFA",
    color: "#1A1A1A",
    border: "1px solid rgba(0,0,0,0.06)",
    shadow: "0 6px 20px rgba(0,0,0,0.1)",
    accentBg: "rgba(0,0,0,0.04)",
  },
};

const VARIANTS: Record<NotificationAnimation, { initial: object; animate: object; exit: object; transition?: object }> = {
  slide: {
    initial: { x: 80, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 80, opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { scale: 0.85, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.85, opacity: 0 },
  },
  spring: {
    initial: { y: -24, opacity: 0, scale: 0.9 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -12, opacity: 0, scale: 0.95 },
    transition: { type: "spring", stiffness: 380, damping: 24 },
  },
};

/** Thin countdown bar along the bottom edge, tracks the toast's own lifetime. */
function CountdownBar({ durationMs, color }: { durationMs: number; color: string }) {
  return (
    <Box sx={{ height: 3, borderRadius: 2, overflow: "hidden", mt: 1.25, background: `${color}22` }}>
      <motion.div
        style={{ height: "100%", background: color, borderRadius: 2 }}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: durationMs / 1000, ease: "linear" }}
      />
    </Box>
  );
}

function CopyToast({ event, style, cornerRadius, opacity, durationMs }: {
  event: ClipboardEventPayload;
  style: ThemeStyle;
  cornerRadius: number;
  opacity: number;
  durationMs: number;
}) {
  const Icon = ICONS[event.kind];
  return (
    <Box
      sx={{
        background: style.background,
        color: style.color,
        border: style.border,
        backdropFilter: style.blur,
        WebkitBackdropFilter: style.blur,
        opacity,
        borderRadius: `${cornerRadius}px`,
        px: 2.5,
        py: 2,
        width: 300,
        boxShadow: style.shadow,
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: style.accentBg,
            flexShrink: 0,
          }}
        >
          <Icon size={19} />
        </Box>
        <Stack spacing={0.25} sx={{ overflow: "hidden", flex: 1, pt: 0.25 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {TITLES[event.kind]}
          </Typography>
          {event.preview && (
            <Typography
              variant="body2"
              sx={{
                opacity: 0.75,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {event.dimensions ?? event.preview}
            </Typography>
          )}
        </Stack>
      </Stack>
      <CountdownBar durationMs={durationMs} color={style.color} />
    </Box>
  );
}

function FunnyToast({ event, style, cornerRadius, opacity, durationMs, mascotsEnabled }: {
  event: FunnyModeEvent;
  style: ThemeStyle;
  cornerRadius: number;
  opacity: number;
  durationMs: number;
  mascotsEnabled: boolean;
}) {
  const accent = MOOD_ACCENT[event.mood];
  return (
    <Box
      sx={{
        background: style.background,
        color: style.color,
        border: style.border,
        backdropFilter: style.blur,
        WebkitBackdropFilter: style.blur,
        opacity,
        borderRadius: `${cornerRadius}px`,
        px: 2.5,
        py: 2.25,
        width: 320,
        boxShadow: style.shadow,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        {mascotsEnabled && (
          <Box
            sx={{
              width: 60,
              height: 60,
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${accent}22`,
              flexShrink: 0,
            }}
          >
            <CatIllustration mood={event.mood} size={48} />
          </Box>
        )}
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Typography
            variant="caption"
            fontWeight={700}
            sx={{ color: accent, letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Funny Mode · Copy #{event.repeatCount}
          </Typography>
          <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.35 }}>
            {event.message}
          </Typography>
        </Stack>
      </Stack>
      <CountdownBar durationMs={durationMs} color={accent} />
    </Box>
  );
}

/**
 * Renders whichever toast is currently active. Only one shows at a
 * time — if a funny-mode event lands while a copy toast is visible (or
 * vice versa), the newer one takes over immediately rather than
 * stacking, since the notification window is only tall enough for one.
 */
export function NotificationPopup({
  copyEvent,
  funnyEvent,
  theme,
  animation,
  opacity,
  cornerRadius,
  durationMs,
  mascotsEnabled,
}: Props) {
  const style = THEME_STYLES[theme];
  const variant = VARIANTS[animation];

  // Whichever event has the more recent timestamp wins the render slot.
  const [activeKey, setActiveKey] = useState<"copy" | "funny" | null>(null);
  useEffect(() => {
    const copyTs = copyEvent?.timestamp ?? -1;
    const funnyTs = funnyEvent ? Date.now() : -1; // FunnyModeEvent has no timestamp field
    if (funnyEvent && (!copyEvent || funnyTs >= copyTs)) {
      setActiveKey("funny");
    } else if (copyEvent) {
      setActiveKey("copy");
    } else {
      setActiveKey(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [copyEvent, funnyEvent]);

  return (
    <AnimatePresence mode="wait">
      {activeKey === "copy" && copyEvent && (
        <motion.div
          key={`copy-${copyEvent.timestamp}`}
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          transition={variant.transition ?? { duration: 0.22, ease: "easeOut" }}
        >
          <CopyToast event={copyEvent} style={style} cornerRadius={cornerRadius} opacity={opacity} durationMs={durationMs} />
        </motion.div>
      )}
      {activeKey === "funny" && funnyEvent && (
        <motion.div
          key={`funny-${funnyEvent.repeatCount}-${funnyEvent.message}`}
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          transition={variant.transition ?? { duration: 0.22, ease: "easeOut" }}
        >
          <FunnyToast
            event={funnyEvent}
            style={style}
            cornerRadius={cornerRadius}
            opacity={opacity}
            durationMs={durationMs}
            mascotsEnabled={mascotsEnabled}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
