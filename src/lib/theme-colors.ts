import type { ThemeName } from "@/hooks/use-theme";

/**
 * Theme color palettes for inline styles in components.
 * CSS classes use CSS variables (globals.css), but some components
 * use inline styles with hardcoded hex values — this maps those.
 */

export interface ThemeColors {
  bodyBg: string;
  textPrimary: string;
  textMuted: string;
  textAccent: string;
  panelBg: string;
  panelBorder: string;
  buttonHoverBg: string;
  displayBg: string;
  displayText: string;
  displayBorder: string;
  accentOrange: string;  // primary action color
  accentGreen: string;
  accentRed: string;
  accentBlue: string;
  accentAmber: string;
  ledActive: string;
  ledGreen: string;
  padActive: string;
  padActiveGlow: string;
  stepBorder: string;
  mutedBorder: string;
  inputBg: string;
  guestBannerBg: string;
  guestBannerBorder: string;
  velocityHigh: string;
  velocityMed: string;
  velocityLow: string;
}

const defaultColors: ThemeColors = {
  bodyBg: "#1A1410",
  textPrimary: "#F5E6D3",
  textMuted: "#A08060",
  textAccent: "#E8732A",
  panelBg: "#2C1E14",
  panelBorder: "#4A3728",
  buttonHoverBg: "#3D2B1F",
  displayBg: "#0A0A0A",
  displayText: "#E8732A",
  displayBorder: "#333",
  accentOrange: "#E8732A",
  accentGreen: "#27AE60",
  accentRed: "#C0392B",
  accentBlue: "#3498db",
  accentAmber: "#F39C12",
  ledActive: "#E8732A",
  ledGreen: "#27AE60",
  padActive: "#E8732A",
  padActiveGlow: "rgba(232, 115, 42, 0.6)",
  stepBorder: "#D4A574",
  mutedBorder: "#6B5B47",
  inputBg: "#3D2B1F",
  guestBannerBg: "#2C1E14",
  guestBannerBorder: "#E8732A",
  velocityHigh: "#E8732A",
  velocityMed: "#8B6914",
  velocityLow: "#5C4A2A",
};

const darkNeonColors: ThemeColors = {
  bodyBg: "#050510",
  textPrimary: "#F0EFFF",
  textMuted: "#6B7BA0",
  textAccent: "#00FFFF",
  panelBg: "#0F0F25",
  panelBorder: "#1F1F45",
  buttonHoverBg: "#161630",
  displayBg: "#040410",
  displayText: "#00FFFF",
  displayBorder: "#1F1F45",
  accentOrange: "#FF0099",
  accentGreen: "#00FF99",
  accentRed: "#FF1166",
  accentBlue: "#00FFFF",
  accentAmber: "#FFFF00",
  ledActive: "#FF0099",
  ledGreen: "#00FF99",
  padActive: "#FF0099",
  padActiveGlow: "rgba(255, 0, 153, 0.8)",
  stepBorder: "#00FFFF",
  mutedBorder: "#2A2A4A",
  inputBg: "#161630",
  guestBannerBg: "#0F0F25",
  guestBannerBorder: "#FF0099",
  velocityHigh: "#FF0099",
  velocityMed: "#AA00DD",
  velocityLow: "#550088",
};

const lightNeonColors: ThemeColors = {
  bodyBg: "#E8DEFF",
  textPrimary: "#1A0A3A",
  textMuted: "#7050BB",
  textAccent: "#6600DD",
  panelBg: "#FFFFFF",
  panelBorder: "#B8A8E0",
  buttonHoverBg: "#F0E8FF",
  displayBg: "#1A0A3A",
  displayText: "#00FFCC",
  displayBorder: "#3A1A6A",
  accentOrange: "#FF0099",
  accentGreen: "#00FF99",
  accentRed: "#FF0055",
  accentBlue: "#6600FF",
  accentAmber: "#FFDD00",
  ledActive: "#FF0099",
  ledGreen: "#00FF99",
  padActive: "#FF0099",
  padActiveGlow: "rgba(255, 0, 153, 0.7)",
  stepBorder: "#6600FF",
  mutedBorder: "#B8A8E0",
  inputBg: "#F0E8FF",
  guestBannerBg: "#FFFFFF",
  guestBannerBorder: "#FF0099",
  velocityHigh: "#FF0099",
  velocityMed: "#DD0099",
  velocityLow: "#AA3388",
};

const THEME_MAP: Record<ThemeName, ThemeColors> = {
  default: defaultColors,
  "dark-neon": darkNeonColors,
  "light-neon": lightNeonColors,
};

export function getThemeColors(theme: ThemeName): ThemeColors {
  return THEME_MAP[theme];
}
