import React from "react";
import { AnimatedGlucoseValue } from "./AnimatedGlucoseValue";
import { LastUpdatedInfo } from "./LastUpdatedInfo";
import { RefreshButton } from "./RefreshButton";
import { ErrorDisplay } from "./ErrorDisplay";

interface GlucoseStatusProps {
  value?: number;
  lastUpdate?: number;
  loading: boolean;
  onRefresh: () => void;
  isStale?: boolean;
  lastError?: string;
}

export const GlucoseStatus: React.FC<GlucoseStatusProps> = ({
  value,
  lastUpdate,
  loading,
  onRefresh,
  isStale = false,
  lastError,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "0px 0px 20px 16px",
        marginBottom: "0",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
          }}
        >
          <AnimatedGlucoseValue value={value} isStale={isStale} />
          <LastUpdatedInfo lastUpdate={lastUpdate} />
        </div>
        <RefreshButton loading={loading} onRefresh={onRefresh} />
      </div>
      <ErrorDisplay error={lastError} />
    </div>
  );
};
