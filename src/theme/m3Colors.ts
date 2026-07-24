// Material Design 3 — Baseline Purple Dynamic Color Scheme
// Light and dark token sets matching the Lock Screen's M3 system.
// Reference: https://m3.material.io/styles/color/roles

export const M3_LIGHT = {
  primary: "#6750A4",
  onPrimary: "#FFFFFF",
  primaryContainer: "#EADDFF",
  onPrimaryContainer: "#21005E",

  secondary: "#625B71",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#E8DEF8",
  onSecondaryContainer: "#1E192B",

  tertiary: "#7D5260",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FFD8E4",
  onTertiaryContainer: "#31111D",

  error: "#B3261E",
  onError: "#FFFFFF",
  errorContainer: "#F9DEDC",
  onErrorContainer: "#410E0B",

  background: "#FFFBFE",
  onBackground: "#1C1B1F",

  surface: "#FFFBFE",
  onSurface: "#1C1B1F",
  surfaceVariant: "#E7E0EC",
  onSurfaceVariant: "#49454F",

  outline: "#79747E",
  outlineVariant: "#CAC4D0",

  surfaceContainerLowest: "#FFFFFF",
  surfaceContainerLow: "#F7F2FA",
  surfaceContainer: "#F3EDF7",
  surfaceContainerHigh: "#ECE6F0",
  surfaceContainerHighest: "#E6E0E9",

  inverseSurface: "#313033",
  inverseOnSurface: "#F4EFF4",
  inversePrimary: "#D0BCFF",

  scrim: "#000000",
} as const;

export const M3_DARK = {
  primary: "#D0BCFF",
  onPrimary: "#381E72",
  primaryContainer: "#4F378B",
  onPrimaryContainer: "#EADDFF",

  secondary: "#CCC2DC",
  onSecondary: "#332D41",
  secondaryContainer: "#4A4458",
  onSecondaryContainer: "#E8DEF8",

  tertiary: "#EFB8C8",
  onTertiary: "#492532",
  tertiaryContainer: "#633B48",
  onTertiaryContainer: "#FFD8E4",

  error: "#F2B8B5",
  onError: "#601410",
  errorContainer: "#8C1D18",
  onErrorContainer: "#F9DEDC",

  background: "#0F0D13",
  onBackground: "#E6E1E5",

  surface: "#0F0D13",
  onSurface: "#E6E1E5",
  surfaceVariant: "#49454F",
  onSurfaceVariant: "#CAC4D0",

  outline: "#938F99",
  outlineVariant: "#49454F",

  surfaceContainerLowest: "#0F0D13",
  surfaceContainerLow: "#1D1B20",
  surfaceContainer: "#211F26",
  surfaceContainerHigh: "#2B2930",
  surfaceContainerHighest: "#36343B",

  inverseSurface: "#E6E1E5",
  inverseOnSurface: "#313033",
  inversePrimary: "#6750A4",

  scrim: "#000000",
} as const;

export type M3Tokens = typeof M3_LIGHT;

// M3 Elevation shadow presets (CSS box-shadow)
export const M3_ELEVATION = {
  level0: { boxShadow: "none" },
  level1: {
    boxShadow: "0px 1px 2px rgba(0,0,0,0.1), 0px 1px 3px 1px rgba(0,0,0,0.08)",
  },
  level2: {
    boxShadow: "0px 1px 2px rgba(0,0,0,0.12), 0px 2px 6px 2px rgba(0,0,0,0.08)",
  },
  level3: {
    boxShadow: "0px 4px 8px 3px rgba(0,0,0,0.1), 0px 1px 3px rgba(0,0,0,0.12)",
  },
} as const;

// M3 Expressive sizing constants (matching Lock Screen)
export const M3_SIZE = {
  buttonHeight: 56,
  iconButtonSize: 56,
  listItemMinHeight: 72,
  listIconContainer: 48,
  heroIconContainer: 104,
  screenPaddingX: 24,
  sectionGap: 28,
} as const;
