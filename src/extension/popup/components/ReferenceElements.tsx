import React from "react";
import { ReferenceLine } from "recharts";
import type { GlucoseData } from "../../../types";
import { DelayedReferenceArea } from "./DelayedReferenceArea";
import {
  REFERENCE_LINES,
  REFERENCE_AREAS,
  CHART_STYLES,
} from "../config/glucoseConfig";

interface ReferenceElementsProps {
  data: GlucoseData[];
}

export const ReferenceElements: React.FC<ReferenceElementsProps> = ({
  data,
}) => {
  const lastDataPoint = data[data.length - 1];

  return (
    <>
      {/* Reference lines for glucose ranges */}
      <ReferenceLine
        y={REFERENCE_LINES.VERY_LOW_THRESHOLD.value}
        stroke={REFERENCE_LINES.VERY_LOW_THRESHOLD.color}
        strokeDasharray={CHART_STYLES.referenceLine.strokeDasharray}
        strokeWidth={CHART_STYLES.referenceLine.strokeWidth}
        strokeOpacity={CHART_STYLES.referenceLine.strokeOpacity}
      />
      <DelayedReferenceArea 
        y1={REFERENCE_AREAS.NORMAL.y1} 
        y2={REFERENCE_AREAS.NORMAL.y2}
      />
      <ReferenceLine
        y={REFERENCE_LINES.HIGH_THRESHOLD.value}
        stroke={REFERENCE_LINES.HIGH_THRESHOLD.color}
        strokeDasharray={CHART_STYLES.referenceLine.strokeDasharray}
        strokeWidth={CHART_STYLES.referenceLine.strokeWidth}
        strokeOpacity={CHART_STYLES.referenceLine.strokeOpacity}
      />
      <ReferenceLine
        y={REFERENCE_LINES.VERY_HIGH_THRESHOLD.value}
        stroke={REFERENCE_LINES.VERY_HIGH_THRESHOLD.color}
        strokeDasharray={CHART_STYLES.referenceLine.strokeDasharray}
        strokeWidth={CHART_STYLES.referenceLine.strokeWidth}
        strokeOpacity={CHART_STYLES.referenceLine.strokeOpacity}
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