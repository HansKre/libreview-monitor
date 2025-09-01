import React from "react";
import { getGlucoseStatus } from "../utils/glucoseUtils";
import { GLUCOSE_COLORS } from "../config/glucoseConfig";

interface GlucoseStatusProps {
  value?: number;
  lastUpdate?: number;
  loading: boolean;
  onRefresh: () => void;
}

export const GlucoseStatus: React.FC<GlucoseStatusProps> = ({
  value,
  lastUpdate,
  loading,
  onRefresh,
}) => {
  const status = value ? getGlucoseStatus(value) : null;

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "0 16px 20px",
        background: "white",
        marginBottom: "0",
      }}
    >
      <div>
        <div
          style={{
            fontSize: "48px",
            fontWeight: "bold",
            color: value ? status?.color : "#666",
            lineHeight: "1",
            marginBottom: "4px",
          }}
        >
          {value || "--"}
          <span
            style={{
              fontSize: "20px",
              fontWeight: "normal",
              marginLeft: "4px",
            }}
          >
            mg/dL
          </span>
        </div>
        <div
          style={{
            fontSize: "14px",
            color: "#666",
            fontWeight: "normal",
          }}
        >
          {lastUpdate
            ? `Last updated: ${new Date(lastUpdate).toLocaleTimeString(
                "en-US",
                {
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                  hour12: false,
                }
              )}`
            : "Loading..."}
        </div>
      </div>
      <button
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
            e.currentTarget.style.backgroundColor = GLUCOSE_COLORS.NORMAL;
            e.currentTarget.style.color = "white";
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
    </div>
  );
};
