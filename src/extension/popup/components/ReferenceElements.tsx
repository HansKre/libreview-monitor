import React from "react";
import { ReferenceLine, ReferenceArea } from "recharts";
import type { GlucoseData } from "../../../types";
import {
  CHART_STYLES,
} from "../config/glucoseConfig";

interface ReferenceElementsProps {
  data: GlucoseData[];
}

export const ReferenceElements: React.FC<ReferenceElementsProps> = ({
  data,
}) => {
  const lastDataPoint = data[data.length - 1];
  const referenceValues = [350, 300, 250, 200, 150, 100, 50];

  return (
    <>
      {/* Reference lines at specified values */}
      {referenceValues.map((value) => (
        <ReferenceLine
          key={value}
          y={value}
          stroke="#ccc"
          strokeDasharray={CHART_STYLES.referenceLine.strokeDasharray}
          strokeWidth={CHART_STYLES.referenceLine.strokeWidth}
          strokeOpacity={CHART_STYLES.referenceLine.strokeOpacity}
        />
      ))}
      
      {/* Reference area between 70 and 180 */}
      <ReferenceArea
        y1={70}
        y2={180}
        fill="#4caf50"
        fillOpacity={0.1}
      />

      {/* Vertical line separating actual from projected data */}
      <ReferenceLine
        x={new Date(
          lastDataPoint?.Timestamp || Date.now()
        ).toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })}
        stroke={CHART_STYLES.separatorLine.color}
        strokeDasharray={CHART_STYLES.separatorLine.strokeDasharray}
        strokeWidth={CHART_STYLES.separatorLine.strokeWidth}
        strokeOpacity={CHART_STYLES.separatorLine.strokeOpacity}
      />
    </>
  );
};