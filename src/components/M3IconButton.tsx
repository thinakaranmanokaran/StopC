import { Box, Typography } from "@mui/material";

interface M3IconButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export default function M3IconButton({ icon, label, onClick }: M3IconButtonProps) {
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
          boxShadow: "0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px 1px rgba(0,0,0,0.08)",
          "&:hover": {
            boxShadow: "0px 1px 2px rgba(0,0,0,0.12), 0px 2px 6px 2px rgba(0,0,0,0.08)",
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
