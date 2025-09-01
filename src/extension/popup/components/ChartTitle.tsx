import React from "react";
import { useTheme } from "../contexts/ThemeContext";

export const ChartTitle: React.FC = () => {
  const { themeColors } = useTheme();
  
  return (
    <h3
      style={{
        fontSize: "18px",
        fontWeight: "600",
        color: themeColors.text.primary,
        marginBottom: "16px",
        margin: "0 0 16px 0",
      }}
    >
      Glucose Trends
    </h3>
  );
};