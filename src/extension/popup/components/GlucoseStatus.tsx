import React from "react";
import { getGlucoseStatus } from "../utils/glucoseUtils";

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
          border: "2px solid #4caf50",
          color: "#4caf50",
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
        }}
      >
        <span style={{ fontSize: "16px" }}>🔄</span> Refresh
      </button>
    </div>
  );
};
