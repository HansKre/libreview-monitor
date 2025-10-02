import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Theme, THEMES } from "../config/themeConfig";
import { ChromeStorage } from "../../utils/storage";

type ThemeContextType = {
  theme: Theme;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: Theme) => void;
  themeColors: typeof THEMES.light | typeof THEMES.dark;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

type Props = {
  children: ReactNode;
};

// Detect system theme preference
const getSystemTheme = (): "light" | "dark" => {
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }
  return "light";
};

export const ThemeProvider: React.FC<Props> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getSystemTheme,
  );

  // Resolve the actual theme (light/dark) based on theme preference
  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const themeColors = THEMES[resolvedTheme];

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

      const handleSystemThemeChange = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? "dark" : "light");
      };

      mediaQuery.addEventListener("change", handleSystemThemeChange);
      return () =>
        mediaQuery.removeEventListener("change", handleSystemThemeChange);
    }
  }, []);

  // Load theme preference from storage on mount
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const result = await ChromeStorage.get(["theme"]);
        if (result.theme) {
          setThemeState(result.theme as Theme);
        }
      } catch (error) {
        console.error("Failed to load theme preference:", error);
      }
    };

    loadThemePreference();
  }, []);

  // Update CSS custom properties when theme changes
  useEffect(() => {
    const root = document.documentElement;
    const colors = themeColors;

    // Set CSS custom properties for theme colors
    root.style.setProperty("--bg-primary", colors.background.primary);
    root.style.setProperty("--bg-secondary", colors.background.secondary);
    root.style.setProperty("--bg-header", colors.background.header);
    root.style.setProperty("--bg-info", colors.background.info);
    root.style.setProperty("--bg-success", colors.background.success);
    root.style.setProperty("--bg-error", colors.background.error);

    root.style.setProperty("--text-primary", colors.text.primary);
    root.style.setProperty("--text-secondary", colors.text.secondary);
    root.style.setProperty("--text-info", colors.text.info);
    root.style.setProperty("--text-success", colors.text.success);
    root.style.setProperty("--text-error", colors.text.error);

    root.style.setProperty("--border-primary", colors.border.primary);
    root.style.setProperty("--border-secondary", colors.border.secondary);
    root.style.setProperty("--border-focus", colors.border.focus);

    root.style.setProperty("--interactive-primary", colors.interactive.primary);
    root.style.setProperty(
      "--interactive-primary-hover",
      colors.interactive.primaryHover,
    );
    root.style.setProperty(
      "--interactive-disabled",
      colors.interactive.disabled,
    );
    root.style.setProperty("--interactive-hover", colors.interactive.hover);

    root.style.setProperty("--chart-grid", colors.chart.grid);
    root.style.setProperty("--chart-axis", colors.chart.axis);
    root.style.setProperty("--chart-separator", colors.chart.separator);
  }, [themeColors]);

  const setTheme = async (newTheme: Theme) => {
    try {
      setThemeState(newTheme);
      await ChromeStorage.set({ theme: newTheme });
    } catch (error) {
      console.error("Failed to save theme preference:", error);
    }
  };

  const contextValue: ThemeContextType = {
    theme,
    resolvedTheme,
    setTheme,
    themeColors,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
