import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface M3SwitchProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
}

const TRACK_W = 52;
const TRACK_H = 32;
const THUMB_OFF = 16;
const THUMB_ON = 24;

export default function M3Switch({ checked, onChange, disabled }: M3SwitchProps) {
  return (
    <Box
      component="button"
      type="button"
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      sx={{
        m: 0,
        p: 0,
        border: "none",
        bg: "none",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.38 : 1,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: TRACK_W,
        height: TRACK_H,
        borderRadius: `${TRACK_H / 2}px`,
        position: "relative",
        "&:focus-visible": {
          outline: "2px solid",
          outlineOffset: 2,
          outlineColor: "primary.main",
        },
      }}
    >
      {/* Track */}
      <motion.div
        animate={{
          backgroundColor: checked ? "var(--m3-primary)" : "var(--m3-surface-highest)",
          borderColor: checked ? "var(--m3-primary)" : "var(--m3-outline)",
        }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: TRACK_H / 2,
          borderWidth: 2,
          borderStyle: "solid",
          boxSizing: "border-box",
        }}
      />

      {/* State layer ripple */}
      <motion.div
        whileHover={{ opacity: 0.08, scale: 1 }}
        whileTap={{ opacity: 0.12, scale: 1 }}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{
          backgroundColor: checked ? "var(--m3-primary)" : "var(--m3-on-surface-variant)",
        }}
        transition={{ duration: 0.16 }}
        style={{
          position: "absolute",
          width: 40,
          height: 40,
          borderRadius: "50%",
        }}
      />

      {/* Thumb */}
      <motion.div
        animate={{
          x: checked ? TRACK_W / 5 : -(TRACK_W / 5),
          width: checked ? THUMB_ON : THUMB_OFF,
          height: checked ? THUMB_ON : THUMB_OFF,
          backgroundColor: checked ? "var(--m3-on-primary)" : "var(--m3-outline)",
        }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: "absolute",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1,
        }}
      >
        {/* Checkmark */}
        <motion.div
          animate={{
            opacity: checked ? 1 : 0,
            scale: checked ? 1 : 0.4,
          }}
          transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1], delay: checked ? 0.1 : 0 }}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Check
            size={14}
            color="var(--m3-primary)"
            strokeWidth={3}
            style={{ display: "block" }}
          />
        </motion.div>
      </motion.div>
    </Box>
  );
}
