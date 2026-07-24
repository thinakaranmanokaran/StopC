import { Box, Typography, type SxProps, type Theme } from "@mui/material";
import { ChevronRight } from "lucide-react";

interface M3ListItemProps {
  icon: React.ReactNode;
  iconBg?: string;
  iconColor?: string;
  title: string;
  subtitle?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  sx?: SxProps<Theme>;
}

export default function M3ListItem({
  icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  onClick,
  trailing,
  showChevron = true,
  sx,
}: M3ListItemProps) {
  const row = (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        minHeight: 72,
        px: 2.5,
        gap: 2,
        ...sx,
      }}
    >
      {icon && (
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            bgcolor: iconBg ?? "secondaryContainer",
            color: iconColor ?? "onSecondaryContainer",
          }}
        >
          {icon}
        </Box>
      )}
      <Box sx={{ flex: 1, py: 1.5 }}>
        <Typography variant="body1" fontWeight={500}>
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {trailing
        ? trailing
        : showChevron && onClick ? (
            <ChevronRight size={20} style={{ color: "inherit", opacity: 0.5 }} />
          ) : null}
    </Box>
  );

  if (!onClick) return row;

  return (
    <Box
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderRadius: 2,
        transition: "background-color 150ms",
        "&:hover": { bgcolor: "action.hover" },
        "&:active": { bgcolor: "action.selected" },
      }}
    >
      {row}
    </Box>
  );
}
