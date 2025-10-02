import React from "react";

type Props = {
  lastUpdate?: number;
};

export const LastUpdatedInfo: React.FC<Props> = ({ lastUpdate }) => {
  return (
    <div
      data-testid="last-updated-info"
      style={{
        fontSize: "14px",
        color: "#666",
        fontWeight: "normal",
      }}
    >
      {lastUpdate
        ? `Last updated: ${new Date(lastUpdate).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })}`
        : "Loading..."}
    </div>
  );
};
