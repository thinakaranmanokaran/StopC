import { Box, Typography } from "@mui/material";

interface OpacitySelectorProps {
  label: string;
  options: { value: number; label: string }[];
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export default function OpacitySelector({ label, options, value, onChange, disabled }: OpacitySelectorProps) {
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
                  borderRadius: "12px",
                  border: "2px solid",
                  borderColor: selected ? "primary.main" : "divider",
                  overflow: "hidden",
                  transition: "all 200ms",
                  position: "relative",
                  "&:hover": disabled
                    ? undefined
                    : { borderColor: selected ? "primary.main" : "text.secondary" },
                }}
              >
                {/* Checkerboard background */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    backgroundImage:
                      "repeating-conic-gradient(var(--m3-outline-variant) 0% 25%, transparent 0% 50%)",
                    backgroundSize: "10px 10px",
                  }}
                />
                {/* Colored overlay at given opacity */}
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    bgcolor: "primary.main",
                    opacity: opt.value,
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
