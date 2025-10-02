import React from "react";
import { Line } from "recharts";
import type { GlucoseData } from "../../../types";
import { getGlucoseColor } from "../utils/glucoseUtils";
import { calculateGlucoseTrend } from "../utils/tooltipUtils";
import { ANIMATION_CONFIG } from "../config/glucoseConfig";

type Props = {
  data: GlucoseData[];
  currentValue?: number;
};

export const GlucoseLines: React.FC<Props> = ({ data, currentValue }) => {
  const lastDataPoint = data[data.length - 1];
  const strokeColor = getGlucoseColor(lastDataPoint?.Value || 100);

  // Calculate trend to determine line order for tooltip
  const isDownwardTrend = calculateGlucoseTrend(data) < 0;

  // Define projection lines with conditional ordering
  const standardProjectionLine = (
    <Line
      key="projectedValue"
      type="monotone"
      dataKey="projectedValue"
      stroke={strokeColor}
      strokeWidth={2}
      strokeDasharray="8 4"
      strokeOpacity={0.7}
      dot={false}
      activeDot={{
        r: 4,
        fill: getGlucoseColor(currentValue || 100),
        stroke: "white",
        strokeWidth: 1,
        strokeOpacity: 0.7,
      }}
      connectNulls={true}
      animationBegin={ANIMATION_CONFIG.projectedLines.begin}
      animationDuration={ANIMATION_CONFIG.projectedLines.duration}
    />
  );

  const timeAwareProjectionLine = (
    <Line
      key="timeAwareProjectedValue"
      type="monotone"
      dataKey="timeAwareProjectedValue"
      stroke={strokeColor}
      strokeWidth={2}
      strokeDasharray="4 2"
      strokeOpacity={0.5}
      dot={false}
      activeDot={{
        r: 3,
        fill: getGlucoseColor(currentValue || 100),
        stroke: "white",
        strokeWidth: 1,
        strokeOpacity: 0.5,
      }}
      connectNulls={true}
      animationBegin={ANIMATION_CONFIG.projectedLines.begin}
      animationDuration={ANIMATION_CONFIG.projectedLines.duration}
    />
  );

  return (
    <>
      {/* Actual glucose data line - always first */}
      <Line
        type="monotone"
        dataKey="value"
        stroke={strokeColor}
        strokeWidth={3}
        dot={false}
        activeDot={{
          r: 6,
          fill: getGlucoseColor(currentValue || 100),
          stroke: "white",
          strokeWidth: 2,
        }}
        connectNulls={false}
        animationBegin={ANIMATION_CONFIG.actualLine.begin}
        animationDuration={ANIMATION_CONFIG.actualLine.duration}
      />

      {/* Projection lines - order based on trend */}
      {isDownwardTrend ? (
        <>
          {timeAwareProjectionLine}
          {standardProjectionLine}
        </>
      ) : (
        <>
          {standardProjectionLine}
          {timeAwareProjectionLine}
        </>
      )}
    </>
  );
};
