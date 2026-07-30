import { Box, Stack, Typography } from "@mui/material";
import { CheckCircle2 } from "lucide-react";
import type { NotificationTheme } from "@/store/settingsStore";
import { THEME_STYLES } from "@/utils/notificationThemes";
import { AppLogo } from "@/components/AppLogo";
import { appConfig } from "@/config/appConfig";

export function ThemePreview({ theme, opacity, cornerRadius }: { theme: NotificationTheme; opacity: number; cornerRadius: number }) {
  const style = THEME_STYLES[theme];
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        py: 2.5,
        px: 2,
        mb: 1.5,
        borderRadius: "18px",
        background:
          "repeating-conic-gradient(rgba(128,128,128,0.06) 0% 25%, transparent 0% 50%) 0 0 / 16px 16px",
      }}
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
          width: 260,
          boxShadow: style.shadow,
        }}
      >
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1, opacity: 0.65 }}>
          <AppLogo size={13} />
          <Typography variant="caption" fontWeight={700} sx={{ letterSpacing: "0.04em", fontSize: 11 }}>
            {appConfig.appName}
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1.5} alignItems="flex-start">
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: style.accentBg,
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={17} />
          </Box>
          <Stack spacing={0.15}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ fontSize: 14 }}>
              Copied!
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.75, fontSize: 12.5 }}>
              This is a preview
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
