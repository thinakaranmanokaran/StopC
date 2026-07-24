import { Box, Typography } from "@mui/material";

interface OptionChipsProps<T extends string | number> {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
}

export default function OptionChips<T extends string | number>({
  label,
  options,
  value,
  onChange,
  disabled,
}: OptionChipsProps<T>) {
  return (
    <Box sx={{ opacity: disabled ? 0.38 : 1 }}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Box
              key={String(opt.value)}
              onClick={() => !disabled && onChange(opt.value)}
              sx={{
                position: "relative",
                px: 2,
                py: 0.75,
                borderRadius: "8px",
                cursor: disabled ? "default" : "pointer",
                border: "1.5px solid",
                borderColor: selected ? "primary.main" : "divider",
                bgcolor: selected ? "primaryContainer" : "transparent",
                color: selected ? "onPrimaryContainer" : "text.secondary",
                transition: "all 200ms",
                userSelect: "none",
                "&:hover": disabled
                  ? undefined
                  : {
                      borderColor: selected ? "primary.main" : "text.secondary",
                    },
              }}
            >
              <Typography variant="body2" fontWeight={selected ? 600 : 400}>
                {opt.label}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
