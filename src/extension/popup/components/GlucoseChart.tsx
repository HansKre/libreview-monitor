import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GlucoseData } from "../../../types";
import { formatChartData, getGlucoseColor } from "../utils/glucoseUtils";
import { DelayedReferenceArea } from "./DelayedReferenceArea";
import {
  REFERENCE_LINES,
  REFERENCE_AREAS,
  Y_AXIS_CONFIG,
  CHART_STYLES,
  ANIMATION_CONFIG,
} from "../config/glucoseConfig";

interface GlucoseChartProps {
  data: GlucoseData[];
  currentValue?: number;
  error?: string | null;
  loading: boolean;
}

export const GlucoseChart: React.FC<GlucoseChartProps> = ({
  data,
  currentValue,
  error,
  loading,
}) => {
  if (error) {
    return <div className="error">{error}</div>;
  }

  if (loading) {
    return <div className="loading">Loading glucose data...</div>;
  }

  if (!data || data.length === 0) {
    return <div className="loading">No glucose data available</div>;
  }

  const chartData = formatChartData(data);
  const lastDataPoint = data[data.length - 1];

  return (
    <div style={{ background: "white", padding: "0 16px 16px" }}>
      {/* Chart Title */}
      <h3
        style={{
          fontSize: "18px",
          fontWeight: "600",
          color: "#333",
          marginBottom: "16px",
          margin: "0 0 16px 0",
        }}
      >
        Glucose Trends
      </h3>

      <div
        style={{
          background: "white",
          borderRadius: "0",
          padding: "0",
          margin: "0px -16px",
        }}
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid 
              strokeDasharray={CHART_STYLES.grid.strokeDasharray}
              stroke={CHART_STYLES.grid.stroke}
            />
            <XAxis
              dataKey="time"
              interval="preserveStartEnd"
              tick={{
                fontSize: CHART_STYLES.axis.fontSize,
                fontFamily: CHART_STYLES.axis.fontFamily,
              }}
              axisLine={{ stroke: CHART_STYLES.axis.stroke }}
            />
            <YAxis
              domain={Y_AXIS_CONFIG.domain}
              ticks={Y_AXIS_CONFIG.ticks}
              tick={{
                fontSize: CHART_STYLES.axis.fontSize,
                fontFamily: CHART_STYLES.axis.fontFamily,
              }}
              axisLine={{ stroke: CHART_STYLES.axis.stroke }}
              width={40}
              label={{ 
                value: 'mg/dL', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            <Tooltip
              formatter={(value: number, name: string) => {
                if (name === "value") {
                  return [`${value} mg/dL`, "Actual"];
                }
                if (name === "projectedValue") {
                  return [`${value} mg/dL`, "Standard Projection"];
                }
                if (name === "timeAwareProjectedValue") {
                  return [`${value} mg/dL`, "Time-aware Projection"];
                }
                return [`${value} mg/dL`, "Glucose"];
              }}
              labelFormatter={(label: string) => `Time: ${label}`}
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #ccc",
                borderRadius: "4px",
                fontFamily: CHART_STYLES.axis.fontFamily,
              }}
            />

            {/* Actual glucose data line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={getGlucoseColor(lastDataPoint?.Value || 100)}
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

            {/* Standard projected glucose data line */}
            <Line
              type="monotone"
              dataKey="projectedValue"
              stroke={getGlucoseColor(lastDataPoint?.Value || 100)}
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

            {/* Time-aware projected glucose data line */}
            <Line
              type="monotone"
              dataKey="timeAwareProjectedValue"
              stroke={getGlucoseColor(lastDataPoint?.Value || 100)}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Legend */}
      <div
        style={{
          padding: "0 32px",
          display: "flex",
          justifyContent: "space-between", // distributes evenly
          alignItems: "center",
          fontFamily: CHART_STYLES.axis.fontFamily,
          fontSize: "11px",
          color: "#666",
          gap: "16px",
        }}
      >
        {[
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
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              flex: 1, // make each entry take equal space
              justifyContent: "center", // center content inside
            }}
          >
            <div style={{ width: "16px", height: "2px", ...item.style }}></div>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
