import { Box, Typography } from "@mui/material";

interface ShapeSelectorProps {
  label: string;
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function ShapeSelector({ label, options, value, onChange, disabled }: ShapeSelectorProps) {
  return (
    <Box sx={{ opacity: disabled ? 0.38 : 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Box
              key={opt.value}
              onClick={() => !disabled && onChange(opt.value)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 0.5,
                cursor: disabled ? "default" : "pointer",
              }}
            >
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: `${opt.value}px`,
                  border: "2px solid",
                  borderColor: selected ? "primary.main" : "divider",
                  bgcolor: selected ? "primaryContainer" : "transparent",
                  transition: "all 200ms",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  "&:hover": disabled
                    ? undefined
                    : { borderColor: selected ? "primary.main" : "text.secondary" },
                }}
              >
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: `${Math.max(0, opt.value - 4)}px`,
                    bgcolor: selected ? "primary.main" : "action.hover",
                  }}
                />
              </Box>
              <Typography
                variant="caption"
                color={selected ? "primary.main" : "text.secondary"}
                fontWeight={selected ? 600 : 400}
              >
                {opt.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
