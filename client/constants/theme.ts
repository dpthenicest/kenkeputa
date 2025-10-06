/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

/**
 * Color palette for light and dark modes.
 * Designed for readability and aesthetic balance.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#4FC3F7";

export const Colors = {
  light: {
    text: "#000000",
    background: "#FFFFFF",
    tint: tintColorLight,
    icon: "#1C1C1E",
    button: "#007AFF",
    tabIconDefault: "#8E8E93",
    tabIconSelected: tintColorLight,
    // Added new properties
    card: "#F8F9FA",       // Subtle light gray card
    border: "#E5E5EA",     // Soft neutral border
    accent: "#0a7ea4",     // Matches tint for emphasis
    subtle: "#6B7280",
  },
  dark: {
    text: "#FFFFFF",
    background: "#000000",
    tint: tintColorDark,
    icon: "#FFFFFF",
    button: "#1E90FF",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
    // Added new properties
    card: "#1C1C1E",       // Slightly lighter than background for contrast
    border: "#2C2C2E",     // Muted gray border for dark mode
    accent: "#4FC3F7",     // Matches tint for dark emphasis
    subtle: "#9CA3AF",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
