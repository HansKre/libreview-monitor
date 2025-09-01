import React from "react";

interface ErrorDisplayProps {
  error?: string;
}

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  if (!error) return null;

  return (
    <div
      style={{
        fontSize: "13px",
        color: "#d32f2f",
        fontWeight: "500",
        marginTop: "6px",
        padding: "6px 0",
        borderRadius: "4px",
      }}
    >
      Error: {error}
    </div>
  );
};
