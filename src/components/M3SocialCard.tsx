import { Box, Typography, useTheme } from "@mui/material";
import { cardShadow } from "@/utils/elevation";

interface M3SocialCardProps {
  icon: React.ReactNode;
  label: string;
  url: string;
}

export default function M3SocialCard({ icon, label, url }: M3SocialCardProps) {
  const theme = useTheme();
  const handleClick = () => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        width: "calc(50% - 8px)",
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 2.5,
        py: 2,
        borderRadius: "16px",
        border: "1.5px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        cursor: "pointer",
        transition: "all 150ms",
        boxShadow: cardShadow(theme),
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: cardShadow(theme, "hover"),
          transform: "translateY(-1px)",
        },
        "&:active": { transform: "translateY(0)" },
      }}
    >
      <Box sx={{ color: "primary.main", display: "flex", alignItems: "center" }}>{icon}</Box>
      <Typography variant="body2" fontWeight={500}>
        {label}
      </Typography>
    </Box>
  );
}
