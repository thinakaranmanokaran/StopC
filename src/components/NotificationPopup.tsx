import { AnimatePresence, motion } from "framer-motion";
import { Paper, Stack, Typography } from "@mui/material";
import { CheckCircle2, Image as ImageIcon, Files, Folder, FileText } from "lucide-react";
import type { ClipboardEventPayload } from "@/types/clipboard";
import type { NotificationAnimation, NotificationTheme } from "@/store/settingsStore";

interface Props {
  event: ClipboardEventPayload | null;
  theme: NotificationTheme;
  animation: NotificationAnimation;
  opacity: number;
  cornerRadius: number;
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

// Each theme maps to a background/text treatment. Extend freely —
// this is intentionally a flat lookup so new themes are a one-line add.
const THEME_STYLES: Record<NotificationTheme, { background: string; color: string; blur?: string }> = {
  material: { background: "#1E1E2E", color: "#FFFFFF" },
  glassmorphism: { background: "rgba(255,255,255,0.15)", color: "#FFFFFF", blur: "blur(16px)" },
  minimal: { background: "#FFFFFF", color: "#111111" },
  neon: { background: "#0D0D0D", color: "#39FF14" },
  macos: { background: "rgba(30,30,30,0.85)", color: "#FFFFFF", blur: "blur(20px)" },
  windows11: { background: "rgba(32,32,32,0.9)", color: "#FFFFFF", blur: "blur(24px)" },
  retro: { background: "#2B1B4E", color: "#FFD23F" },
  terminal: { background: "#000000", color: "#00FF00" },
  cute: { background: "#FFE3EC", color: "#7A2E4E" },
  dark: { background: "#121212", color: "#EAEAEA" },
  light: { background: "#FAFAFA", color: "#1A1A1A" },
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

export function NotificationPopup({ event, theme, animation, opacity, cornerRadius }: Props) {
  const style = THEME_STYLES[theme];
  const variant = VARIANTS[animation];
  const Icon = event ? ICONS[event.kind] : CheckCircle2;

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.timestamp}
          initial={variant.initial}
          animate={variant.animate}
          exit={variant.exit}
          transition={variant.transition ?? { duration: 0.22, ease: "easeOut" }}
        >
          <Paper
            elevation={0}
            sx={{
              background: style.background,
              color: style.color,
              backdropFilter: style.blur,
              WebkitBackdropFilter: style.blur,
              opacity,
              borderRadius: `${cornerRadius}px`,
              px: 2.5,
              py: 1.75,
              minWidth: 260,
              maxWidth: 340,
              boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Icon size={22} style={{ flexShrink: 0, marginTop: 2 }} />
              <Stack spacing={0.25} sx={{ overflow: "hidden" }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {TITLES[event.kind]}
                </Typography>
                {event.preview && (
                  <Typography
                    variant="body2"
                    sx={{
                      opacity: 0.85,
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
          </Paper>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
