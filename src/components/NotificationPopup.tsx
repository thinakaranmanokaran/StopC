import { motion, type PanInfo, type Target, type TargetAndTransition, type Transition } from "framer-motion";
import { Box, Stack, Typography } from "@mui/material";
import { CheckCircle2, Image as ImageIcon, Files, Folder, FileText, Info } from "lucide-react";
import type { ActiveToast } from "@/types/toast";
import type { NotificationAnimation, NotificationTheme } from "@/store/settingsStore";
import { CatIllustration } from "@/components/mascot/CatIllustration";
import { MOOD_ACCENT } from "@/utils/mood";
import { AppLogo } from "@/components/AppLogo";
import { appConfig } from "@/config/appConfig";
import { THEME_STYLES, type ThemeStyle } from "@/utils/notificationThemes";
import type { ClipboardEventPayload } from "@/types/clipboard";

interface Props {
  toast: ActiveToast;
  theme: NotificationTheme;
  animation: NotificationAnimation;
  opacity: number;
  cornerRadius: number;
  durationMs: number;
  mascotsEnabled: boolean;
  showCounter: boolean;
  isPaused: boolean;
  onHoverChange: (hovering: boolean) => void;
  onDismiss: () => void;
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


type AnimationVariant = {
  initial: Target;
  animate: TargetAndTransition;
  exit: TargetAndTransition;
  transition?: Transition;
};

const DEFAULT_TRANSITION: Transition = { duration: 0.22, ease: "easeOut" };

const VARIANTS: Record<NotificationAnimation, AnimationVariant> = {
  slide: { initial: { x: 80, opacity: 0 }, animate: { x: 0, opacity: 1 }, exit: { x: 80, opacity: 0 } },
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  scale: { initial: { scale: 0.85, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.85, opacity: 0 } },
  spring: {
    initial: { y: -24, opacity: 0, scale: 0.9 },
    animate: { y: 0, opacity: 1, scale: 1 },
    exit: { y: -12, opacity: 0, scale: 0.95 },
    transition: { type: "spring", stiffness: 380, damping: 24 },
  },
};

/** CSS-keyframe countdown bar — plain CSS (not Framer Motion's JS-driven
 * animate) specifically so `animation-play-state` can pause/resume it
 * in perfect sync with the real dismiss timer on hover. */
function CountdownBar({ toastId, durationMs, color, paused }: { toastId: string; durationMs: number; color: string; paused: boolean }) {
  return (
    <Box sx={{ height: 3, borderRadius: 2, overflow: "hidden", mt: 1.25, background: `${color}22` }}>
      <Box
        key={toastId}
        sx={{
          height: "100%",
          background: color,
          borderRadius: 2,
          width: "100%",
          animation: `stopc-countdown ${durationMs}ms linear forwards`,
          animationPlayState: paused ? "paused" : "running",
          "@keyframes stopc-countdown": {
            from: { width: "100%" },
            to: { width: "0%" },
          },
        }}
      />
    </Box>
  );
}

function ToastHeader() {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1, opacity: 0.65 }}>
      <AppLogo size={13} />
      <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: "0.04em", fontSize: 11 }}>
        {appConfig.appName}
      </Typography>
    </Stack>
  );
}

function ToastBody({ toast, style, mascotsEnabled }: { toast: ActiveToast; style: ThemeStyle; mascotsEnabled: boolean }) {
  if (toast.kind === "copy" && toast.copy) {
    const event = toast.copy;
    const Icon = ICONS[event.kind];
    return (
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
              sx={{ opacity: 0.75, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
            >
              {event.dimensions ?? event.preview}
            </Typography>
          )}
        </Stack>
      </Stack>
    );
  }

  if (toast.kind === "funny" && toast.funny) {
    const event = toast.funny;
    const accent = MOOD_ACCENT[event.mood];
    return (
      <Stack direction="row" spacing={2} alignItems="center">
        {mascotsEnabled && (
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: "18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: `${accent}22`,
              flexShrink: 0,
            }}
          >
            <CatIllustration mood={event.mood} size={44} />
          </Box>
        )}
        <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.4, flex: 1 }}>
          {event.message}
        </Typography>
      </Stack>
    );
  }

  if (toast.kind === "system" && toast.system) {
    return (
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
          <Info size={18} />
        </Box>
        <Stack spacing={0.25} sx={{ flex: 1, pt: 0.25 }}>
          <Typography variant="subtitle2" fontWeight={700}>
            {toast.system.title}
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.75 }}>
            {toast.system.message}
          </Typography>
        </Stack>
      </Stack>
    );
  }

  return null;
}

const DRAG_DISMISS_THRESHOLD = 90;

export function NotificationPopup({
  toast,
  theme,
  animation,
  opacity,
  cornerRadius,
  durationMs,
  mascotsEnabled,
  showCounter,
  isPaused,
  onHoverChange,
  onDismiss,
}: Props) {
  const style = THEME_STYLES[theme];
  const variant = VARIANTS[animation];

  const accentColor =
    toast.kind === "funny" && toast.funny ? MOOD_ACCENT[toast.funny.mood] : style.color;

  // dragSnapToOrigin (below) handles the "not dismissed" elastic
  // snap-back declaratively. If the drag exceeds the threshold we just
  // tell the parent to dismiss — the toast unmounts and Framer Motion's
  // `exit` animation plays instead of a manual snap animation.
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    const distance = Math.hypot(info.offset.x, info.offset.y);
    if (distance > DRAG_DISMISS_THRESHOLD) {
      onDismiss();
    }
  };

  return (
    <motion.div
      key={toast.id}
      initial={variant.initial}
      animate={variant.animate}
      exit={variant.exit}
      transition={variant.transition ?? DEFAULT_TRANSITION}
      drag
      dragElastic={0.3}
      dragMomentum={false}
      dragSnapToOrigin
      onDragEnd={handleDragEnd}
      onHoverStart={() => onHoverChange(true)}
      onHoverEnd={() => onHoverChange(false)}
      style={{ cursor: "grab", touchAction: "none" }}
      whileDrag={{ cursor: "grabbing" }}
    >
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
          width: toast.kind === "funny" ? 320 : 300,
          boxShadow: style.shadow,
        }}
      >
        <ToastHeader />
        <ToastBody toast={toast} style={style} mascotsEnabled={mascotsEnabled} />
        {showCounter && (
          <CountdownBar toastId={toast.id} durationMs={durationMs} color={accentColor} paused={isPaused} />
        )}
      </Box>
    </motion.div>
  );
}
