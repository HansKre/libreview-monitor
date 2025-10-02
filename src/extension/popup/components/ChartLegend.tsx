import React from "react";
import { getGlucoseColor } from "../utils/glucoseUtils";
import { CHART_STYLES } from "../config/glucoseConfig";

type Props = {
  currentValue?: number;
};

export const ChartLegend: React.FC<Props> = ({ currentValue }) => {
  const legendItems = [
    {
      label: "Actual",
      style: { backgroundColor: getGlucoseColor(currentValue || 100) },
    },
    {
      label: "Standard Projection",
      style: {
        backgroundColor: getGlucoseColor(currentValue || 100),
        opacity: 0.7,
        backgroundImage:
          "repeating-linear-gradient(to right, transparent, transparent 4px, white 4px, white 6px)",
      },
    },
    {
      label: "Time-aware Projection",
      style: {
        backgroundColor: getGlucoseColor(currentValue || 100),
        opacity: 0.5,
        backgroundImage:
          "repeating-linear-gradient(to right, transparent, transparent 2px, white 2px, white 4px)",
      },
    },
  ];

  return (
    <div
      data-testid="chart-legend"
      style={{
        padding: "0 32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontFamily: CHART_STYLES.axis.fontFamily,
        fontSize: "11px",
        color: "#666",
        gap: "16px",
      }}
    >
      {legendItems.map((item) => (
        <div
          key={item.label}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "4px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div style={{ width: "16px", height: "2px", ...item.style }}></div>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  );
};
