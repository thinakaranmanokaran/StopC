import { Box, Typography } from "@mui/material";
import M3Switch from "./M3Switch";

interface ToggleRowProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export default function ToggleRow({ label, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        minHeight: 48,
        py: 0.5,
      }}
    >
      <Typography
        variant="body1"
        fontWeight={500}
        sx={{ opacity: disabled ? 0.38 : 1, flex: 1, mr: 2 }}
      >
        {label}
      </Typography>
      <M3Switch checked={checked} onChange={onChange} disabled={disabled} />
    </Box>
  );
}
