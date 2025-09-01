import React from "react";
import {
  CartesianGrid,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { GlucoseData } from "../../../types";
import { Y_AXIS_CONFIG } from "../config/glucoseConfig";
import { getThemeAwareChartStyles } from "../config/themeConfig";
import { useTheme } from "../contexts/ThemeContext";
import { formatChartData } from "../utils/glucoseUtils";
import { formatTooltipLabel, formatTooltipValue } from "../utils/tooltipUtils";
import { ChartLegend } from "./ChartLegend";
import { ChartLoadingStates } from "./ChartLoadingStates";
import { ChartTitle } from "./ChartTitle";
import { GlucoseLines } from "./GlucoseLines";
import { ReferenceElements } from "./ReferenceElements";

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
  const { resolvedTheme, themeColors } = useTheme();
  const themeChartStyles = getThemeAwareChartStyles(resolvedTheme);

  if (error || loading || !data || data.length === 0) {
    return (
      <ChartLoadingStates
        error={error}
        loading={loading}
        hasData={data && data.length > 0}
      />
    );
  }

  const chartData = formatChartData(data);

  // Create theme-aware tooltip style
  const tooltipContentStyle = {
    backgroundColor: themeColors.background.primary,
    border: `1px solid ${themeColors.border.primary}`,
    borderRadius: "4px",
    fontFamily: themeChartStyles.axis.fontFamily,
    color: themeColors.text.primary,
  };

  return (
    <div
      style={{
        background: themeColors.background.primary,
        padding: "0 16px 16px",
      }}
    >
      <ChartTitle />

      <div
        style={{
          background: themeColors.background.primary,
          borderRadius: "0",
          padding: "0",
          margin: "0px -16px",
        }}
      >
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray={themeChartStyles.grid.strokeDasharray}
              stroke={themeChartStyles.grid.stroke}
            />
            <XAxis
              type="number"
              dataKey="time"
              domain={["dataMin", "dataMax"]}
              scale="time"
              tickFormatter={(timestamp) => {
                return new Date(timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
              }}
              interval="preserveStartEnd"
              tick={{
                fontSize: themeChartStyles.axis.fontSize,
                fontFamily: themeChartStyles.axis.fontFamily,
                fill: themeColors.text.secondary,
              }}
              axisLine={{ stroke: themeChartStyles.axis.stroke }}
            />
            <YAxis
              domain={Y_AXIS_CONFIG.domain}
              ticks={Y_AXIS_CONFIG.ticks}
              tick={{
                fontSize: themeChartStyles.axis.fontSize,
                fontFamily: themeChartStyles.axis.fontFamily,
                fill: themeColors.text.secondary,
              }}
              axisLine={{ stroke: themeChartStyles.axis.stroke }}
              width={40}
              label={{
                value: "mg/dL",
                angle: -90,
                position: "insideLeft",
                style: {
                  textAnchor: "middle",
                  fill: themeColors.text.secondary,
                },
                offset: -1,
              }}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelFormatter={(label, payload) => {
                // Use timeLabel from payload data if available, fallback to formatted timestamp
                if (
                  payload &&
                  payload[0] &&
                  payload[0].payload &&
                  payload[0].payload.timeLabel
                ) {
                  return formatTooltipLabel(payload[0].payload.timeLabel);
                }
                // Fallback: format the timestamp if no timeLabel available
                return formatTooltipLabel(
                  new Date(label).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }),
                );
              }}
              contentStyle={tooltipContentStyle}
            />

            <GlucoseLines data={data} currentValue={currentValue} />
            <ReferenceElements data={data} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <ChartLegend currentValue={currentValue} />
    </div>
  );
};
