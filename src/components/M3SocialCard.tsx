import { Box, Typography } from "@mui/material";

interface M3SocialCardProps {
  icon: React.ReactNode;
  label: string;
  url: string;
}

export default function M3SocialCard({ icon, label, url }: M3SocialCardProps) {
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
        boxShadow: "0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px 1px rgba(0,0,0,0.08)",
        "&:hover": {
          borderColor: "primary.main",
          boxShadow: "0px 1px 2px rgba(0,0,0,0.12), 0px 2px 6px 2px rgba(0,0,0,0.08)",
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
