// Theme configuration for light and dark modes
// Centralizes all theme-related colors, styles, and configurations

export type Theme = "light" | "dark" | "system";

// Light theme colors
export const LIGHT_THEME = {
  // Background colors
  background: {
    primary: "#ffffff",
    secondary: "#f5f5f5",
    header: "#f5f0f0",
    info: "#e3f2fd",
    success: "#e8f5e8",
    error: "#ffebee",
  },

  // Text colors
  text: {
    primary: "#333333",
    secondary: "#666666",
    info: "#1565c0",
    success: "#2e7d2e",
    error: "#f44336",
  },

  // Border colors
  border: {
    primary: "#e0e0e0",
    secondary: "#ddd",
    focus: "#2196f3",
  },

  // Interactive elements
  interactive: {
    primary: "#2196f3",
    primaryHover: "#1976d2",
    disabled: "#cccccc",
    hover: "#e8e8e8",
  },

  // Chart and glucose-specific colors
  chart: {
    grid: "#f0f0f0",
    axis: "#cccccc",
    separator: "#999999",
  },
} as const;

// Dark theme colors
export const DARK_THEME = {
  // Background colors
  background: {
    primary: "#1a1a1a",
    secondary: "#2d2d2d",
    header: "#252525",
    info: "#1e3a8a",
    success: "#166534",
    error: "#7f1d1d",
  },

  // Text colors
  text: {
    primary: "#ffffff",
    secondary: "#cccccc",
    info: "#60a5fa",
    success: "#4ade80",
    error: "#f87171",
  },

  // Border colors
  border: {
    primary: "#404040",
    secondary: "#555555",
    focus: "#3b82f6",
  },

  // Interactive elements
  interactive: {
    primary: "#3b82f6",
    primaryHover: "#2563eb",
    disabled: "#4a5568",
    hover: "#374151",
  },

  // Chart and glucose-specific colors
  chart: {
    grid: "#404040",
    axis: "#666666",
    separator: "#888888",
  },
} as const;

export const THEMES = {
  light: LIGHT_THEME,
  dark: DARK_THEME,
} as const;

// Theme-aware glucose config that adapts colors based on current theme
export const getThemeAwareGlucoseColors = () => {
  // Glucose colors remain consistent across themes for medical clarity
  // But we can adjust opacity or provide better contrast if needed
  return {
    VERY_LOW: "#8B0000", // Dark Red
    LOW: "#f44336", // Red
    NORMAL: "#4caf50", // Green
    ELEVATED: "#ff9800", // Orange
    HIGH: "#f44336", // Red
    VERY_HIGH: "#8B0000", // Dark Red
  };
};

// Utility to get theme-aware chart styles
export const getThemeAwareChartStyles = (theme: "light" | "dark") => {
  const themeColors = THEMES[theme];

  return {
    grid: {
      strokeDasharray: "3 3",
      stroke: themeColors.chart.grid,
    },
    axis: {
      stroke: themeColors.chart.axis,
      fontSize: 12,
      fontFamily:
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    referenceLine: {
      strokeDasharray: "2 2",
      strokeWidth: 1,
      strokeOpacity: 0.5,
    },
    separatorLine: {
      strokeDasharray: "3 3",
      strokeWidth: 1,
      strokeOpacity: 0.6,
      color: themeColors.chart.separator,
    },
  };
};
