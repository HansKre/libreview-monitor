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
    <div
      className="chart-container"
      style={{
        height: "360px",
        background: "white",
        borderRadius: "8px",
        padding: "0",
        margin: "0px -4px 0px -14px",
      }}
    >
      {/* Header with Legend and Time Period Controls */}
      <div
        style={{
          padding: "8px 16px 0px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily:
            '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Legend */}
        <div
          style={{
            fontSize: "11px",
            color: "#666",
            display: "flex",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "16px",
                height: "2px",
                backgroundColor: getGlucoseColor(currentValue || 100),
              }}
            ></div>
            <span>Actual</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "16px",
                height: "2px",
                backgroundColor: getGlucoseColor(currentValue || 100),
                opacity: 0.7,
                backgroundImage:
                  "repeating-linear-gradient(to right, transparent, transparent 4px, white 4px, white 6px)",
              }}
            ></div>
            <span>Standard Projection</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <div
              style={{
                width: "16px",
                height: "2px",
                backgroundColor: getGlucoseColor(currentValue || 100),
                opacity: 0.5,
                backgroundImage:
                  "repeating-linear-gradient(to right, transparent, transparent 2px, white 2px, white 4px)",
              }}
            ></div>
            <span>Time-aware Projection</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="time"
            interval="preserveStartEnd"
            tick={{
              fontSize: 12,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
            axisLine={{ stroke: "#ccc" }}
          />
          <YAxis
            domain={[50, 350]}
            tick={{
              fontSize: 12,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
            axisLine={{ stroke: "#ccc" }}
            width={40}
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
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          />

          {/* Reference lines for glucose ranges */}
          <ReferenceLine
            y={70}
            stroke="#8B0000"
            strokeDasharray="2 2"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={100}
            stroke="#f44336"
            strokeDasharray="2 2"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={156}
            stroke="#ff9800"
            strokeDasharray="2 2"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={190}
            stroke="#f44336"
            strokeDasharray="2 2"
            strokeWidth={1}
            strokeOpacity={0.5}
          />
          <ReferenceLine
            y={250}
            stroke="#8B0000"
            strokeDasharray="2 2"
            strokeWidth={1}
            strokeOpacity={0.5}
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
            stroke="#999"
            strokeDasharray="3 3"
            strokeWidth={1}
            strokeOpacity={0.6}
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
            animationBegin={0}
            animationDuration={1500}
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
            animationBegin={1500}
            animationDuration={1000}
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
            animationBegin={1500}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
