import { Box, Typography, useTheme } from "@mui/material";
import { cardShadow } from "@/utils/elevation";

interface M3IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export default function M3IconButton({ icon, label, onClick }: M3IconButtonProps) {
  const theme = useTheme();
  return (
    <Box
      onClick={onClick}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 1,
        cursor: onClick ? "pointer" : "default",
        transition: "transform 150ms",
        "&:hover": onClick ? { transform: "scale(1.05)" } : undefined,
        "&:active": onClick ? { transform: "scale(0.95)" } : undefined,
      }}
    >
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "secondaryContainer",
          color: "onSecondaryContainer",
          transition: "box-shadow 150ms",
          boxShadow: cardShadow(theme),
          "&:hover": {
            boxShadow: cardShadow(theme, "hover"),
          },
        }}
      >
        {icon}
      </Box>
      <Typography variant="caption" fontWeight={500} color="text.secondary">
        {label}
      </Typography>
    </Box>
  );
}
