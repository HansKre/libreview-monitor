import React from "react";
import { GLUCOSE_COLORS } from "../config/glucoseConfig";
import { useTheme } from "../contexts/ThemeContext";

type Props = {
  loading: boolean;
  onRefresh: () => void;
};

export const RefreshButton: React.FC<Props> = ({ loading, onRefresh }) => {
  const { themeColors } = useTheme();

  return (
    <button
      data-testid="refresh-button"
      onClick={onRefresh}
      disabled={loading}
      style={{
        background: "none",
        border: `2px solid ${GLUCOSE_COLORS.NORMAL}`,
        color: GLUCOSE_COLORS.NORMAL,
        padding: "8px 16px",
        borderRadius: "20px",
        cursor: loading ? "not-allowed" : "pointer",
        fontSize: "14px",
        fontWeight: "500",
        display: "flex",
        alignItems: "center",
        alignSelf: "end",
        gap: "6px",
        opacity: loading ? 0.6 : 1,
        transition: "all 0.2s ease",
      }}
      onMouseEnter={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = themeColors.interactive.hover;
          e.currentTarget.style.color = themeColors.text.primary;
        }
      }}
      onMouseLeave={(e) => {
        if (!loading) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = GLUCOSE_COLORS.NORMAL;
        }
      }}
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{
          transform: loading ? "rotate(360deg)" : "rotate(0deg)",
          transition: "transform 0.6s ease-in-out",
        }}
      >
        <polyline points="23 4 23 10 17 10" />
        <polyline points="1 20 1 14 7 14" />
        <path d="m20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
      </svg>
      Refresh
    </button>
  );
};
