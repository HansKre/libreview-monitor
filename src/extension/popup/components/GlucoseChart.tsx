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
import { formatTooltipValue, formatTooltipLabel, tooltipContentStyle } from "../utils/tooltipUtils";
import {
  Y_AXIS_CONFIG,
  CHART_STYLES,
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

  return (
    <div style={{ background: "white", padding: "0 16px 16px" }}>
      <ChartTitle />

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
