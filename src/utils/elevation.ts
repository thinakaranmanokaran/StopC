import type { Theme } from "@mui/material";

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/**
 * A flat black shadow at low opacity reads fine in dark mode (it's
 * already darker than its surroundings) but looks flat in light mode.
 * Tinting with the primary color gives light-mode cards the same soft,
 * colored depth Material 3 intends ("surface tint") instead of looking
 * like dark mode with the colors numerically flipped.
 */
export function cardShadow(theme: Theme, strength: "resting" | "hover" = "resting"): string {
  const isLight = theme.palette.mode === "light";
  const color = isLight ? theme.palette.primary.main : "#000000";
  const a1 = isLight ? (strength === "hover" ? 0.16 : 0.12) : strength === "hover" ? 0.12 : 0.1;
  const a2 = isLight ? (strength === "hover" ? 0.2 : 0.16) : strength === "hover" ? 0.08 : 0.08;
  const c1 = isLight ? hexToRgba(color, a1) : `rgba(0,0,0,${a1})`;
  const c2 = isLight ? hexToRgba(color, a2) : `rgba(0,0,0,${a2})`;
  return strength === "hover"
    ? `0px 1px 2px ${c1}, 0px 2px 6px 2px ${c2}`
    : `0px 1px 2px ${c1}, 0px 1px 3px 1px ${c2}`;
}
