import rawConfig from "./app.config.json";

export interface AppConfig {
  appName: string;
  slogan: string;
  /** Empty string means "no custom logo" — components fall back to the built-in icon. */
  logoUrl: string;
  logoAlt: string;
}

const FALLBACK_CONFIG: AppConfig = {
  appName: "StopC",
  slogan: "Copy Once. Trust Forever.",
  logoUrl: "",
  logoAlt: "App logo",
};

/**
 * Reads src/config/app.config.json (bundled at build time via Vite's
 * JSON import, so this needs no network/filesystem access at runtime).
 * Edit that file to rebrand the app — name, slogan, logo — without
 * touching any component. Any missing/malformed field silently falls
 * back to FALLBACK_CONFIG so a bad edit to the JSON can't crash the app.
 */
export const appConfig: AppConfig = {
  appName: typeof rawConfig?.appName === "string" && rawConfig.appName.trim() ? rawConfig.appName : FALLBACK_CONFIG.appName,
  slogan: typeof rawConfig?.slogan === "string" && rawConfig.slogan.trim() ? rawConfig.slogan : FALLBACK_CONFIG.slogan,
  logoUrl: typeof rawConfig?.logoUrl === "string" ? rawConfig.logoUrl : FALLBACK_CONFIG.logoUrl,
  logoAlt: typeof rawConfig?.logoAlt === "string" && rawConfig.logoAlt.trim() ? rawConfig.logoAlt : FALLBACK_CONFIG.logoAlt,
};
