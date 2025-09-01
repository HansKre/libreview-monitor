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
import { formatChartData } from "../utils/glucoseUtils";
import { ChartLoadingStates } from "./ChartLoadingStates";
import { ChartTitle } from "./ChartTitle";
import { GlucoseLines } from "./GlucoseLines";
import { ReferenceElements } from "./ReferenceElements";
import { ChartLegend } from "./ChartLegend";
import { formatTooltipValue, formatTooltipLabel } from "../utils/tooltipUtils";
import {
  Y_AXIS_CONFIG,
  CHART_STYLES,
} from "../config/glucoseConfig";
import { useTheme } from "../contexts/ThemeContext";
import { getThemeAwareChartStyles } from "../config/themeConfig";

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
    <div style={{ background: themeColors.background.primary, padding: "0 16px 16px" }}>
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
              dataKey="time"
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
                value: 'mg/dL', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle', fill: themeColors.text.secondary }
              }}
            />
            <Tooltip
              formatter={formatTooltipValue}
              labelFormatter={formatTooltipLabel}
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
