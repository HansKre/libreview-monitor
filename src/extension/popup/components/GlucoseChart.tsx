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

type Props = {
  data: GlucoseData[];
  currentValue?: number;
  error?: string | null;
  loading: boolean;
};

export const GlucoseChart: React.FC<Props> = ({
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

  // Calculate dynamic time span and tick configuration
  const calculateXAxisConfig = () => {
    if (chartData.length === 0) {
      return {
        ticks: undefined,
        interval: "preserveStartEnd" as const,
        minDomain: undefined,
        maxDomain: undefined,
      };
    }

    // Get time range from actual data (not including projections)
    const actualDataPoints = chartData.filter((d) => !d.isProjected);
    if (actualDataPoints.length === 0) {
      return {
        ticks: undefined,
        interval: "preserveStartEnd" as const,
        minDomain: undefined,
        maxDomain: undefined,
      };
    }

    const minTime = Math.min(...actualDataPoints.map((d) => d.time));
    const maxTime = Math.max(...actualDataPoints.map((d) => d.time));
    const timeSpanHours = (maxTime - minTime) / (1000 * 60 * 60);

    // Debug logging
    console.log(
      `Chart data points: ${data.length} total, ${actualDataPoints.length} actual`,
    );
    console.log(
      `Time span: ${timeSpanHours.toFixed(2)} hours (${new Date(minTime).toLocaleTimeString()} - ${new Date(maxTime).toLocaleTimeString()})`,
    );
    if (data.length > 0) {
      const firstTimestamp = new Date(data[0].Timestamp).toLocaleTimeString();
      const lastTimestamp = new Date(
        data[data.length - 1].Timestamp,
      ).toLocaleTimeString();
      console.log(`Original data range: ${firstTimestamp} - ${lastTimestamp}`);
    }

    // Determine tick interval and count based on time span
    // Aim for 4-6 ticks to avoid overlap in the popup width
    let tickIntervalMs: number;
    if (timeSpanHours <= 2) {
      // 30 minute ticks for <= 2 hours
      tickIntervalMs = 30 * 60 * 1000;
    } else if (timeSpanHours <= 6) {
      // 1 hour ticks for 2-6 hours
      tickIntervalMs = 60 * 60 * 1000;
    } else if (timeSpanHours <= 12) {
      // 2 hour ticks for 6-12 hours
      tickIntervalMs = 2 * 60 * 60 * 1000;
    } else if (timeSpanHours <= 18) {
      // 3 hour ticks for 12-18 hours
      tickIntervalMs = 3 * 60 * 60 * 1000;
    } else {
      // 4 hour ticks for > 18 hours
      tickIntervalMs = 4 * 60 * 60 * 1000;
    }

    // Round minTime down to nearest tick interval for tick generation
    const roundedMinTime =
      Math.floor(minTime / tickIntervalMs) * tickIntervalMs;
    // Round maxTime up to nearest tick interval for clean axis end
    const roundedMaxTime = Math.ceil(maxTime / tickIntervalMs) * tickIntervalMs;

    // Generate tick values from rounded start to rounded end
    const ticks: number[] = [];
    let currentTick = roundedMinTime;
    while (currentTick <= roundedMaxTime) {
      ticks.push(currentTick);
      currentTick += tickIntervalMs;
    }

    // Remove the first tick to eliminate the leftmost label
    const filteredTicks = ticks.slice(1);

    return {
      ticks: filteredTicks,
      interval: 0 as const,
      minDomain: minTime, // Start at actual first data point
      maxDomain: roundedMaxTime,
    };
  };

  const xAxisConfig = calculateXAxisConfig();

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
      data-testid="glucose-chart"
      style={{
        background: themeColors.background.primary,
        padding: "0 16px 16px",
      }}
    >
      <ChartTitle />

      <div
        data-testid="chart-container"
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
              domain={
                xAxisConfig.minDomain && xAxisConfig.maxDomain
                  ? [xAxisConfig.minDomain, xAxisConfig.maxDomain]
                  : ["dataMin", "dataMax"]
              }
              scale="time"
              ticks={xAxisConfig.ticks}
              interval={xAxisConfig.interval}
              tickFormatter={(timestamp) => {
                return new Date(timestamp).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                });
              }}
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
