import { Box, Typography } from "@mui/material";
import { motion } from "framer-motion";

interface GridOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
}

interface M3SelectableGridProps {
  options: GridOption[];
  value: string | number;
  onChange: (value: string | number) => void;
  columns?: 2 | 3;
  disabled?: boolean;
}

export default function M3SelectableGrid({
  options,
  value,
  onChange,
  columns = 2,
  disabled,
}: M3SelectableGridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: 1.5,
        opacity: disabled ? 0.38 : 1,
      }}
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Box
            key={opt.value}
            onClick={() => !disabled && onChange(opt.value)}
            sx={{
              position: "relative",
              p: 2.5,
              borderRadius: "16px",
              border: "1.5px solid",
              cursor: disabled ? "default" : "pointer",
              overflow: "hidden",
              transition: "border-color 220ms",
              "&:hover": disabled
                ? undefined
                : {
                    borderColor: selected ? "primary.main" : "text.secondary",
                  },
            }}
          >
            {/* Background */}
            <motion.div
              animate={{
                backgroundColor: selected
                  ? "var(--m3-secondary-container)"
                  : "var(--m3-surface-container-lowest, var(--m3-background))",
                borderColor: selected
                  ? "rgba(103, 80, 164, 0.44)"
                  : "var(--m3-outline)",
              }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: 0,
                borderRadius: 16,
                borderWidth: 0,
                zIndex: 0,
              }}
            />
            <Box sx={{ position: "relative", zIndex: 1 }}>
              {opt.icon && (
                <Box sx={{ mb: 1.25, color: selected ? "onSecondaryContainer" : "text.secondary" }}>
                  {opt.icon}
                </Box>
              )}
              <motion.div
                animate={{
                  color: selected
                    ? "var(--m3-on-secondary-container)"
                    : "var(--m3-on-surface-variant)",
                }}
                transition={{ duration: 0.22 }}
              >
                <Typography variant="body2" fontWeight={500}>
                  {opt.label}
                </Typography>
              </motion.div>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
}
