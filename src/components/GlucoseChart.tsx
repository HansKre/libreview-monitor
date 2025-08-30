import React from "react";
import { Box, Text } from "ink";
import type { GlucoseData } from "../types";
import { createTextChart, createYAxisLabels, createTimeLabels } from "../utils/chart";
import { CHART_CONFIG } from "../utils/config";

interface GlucoseChartProps {
  data: GlucoseData[];
  countdown: number;
}

export const GlucoseChart: React.FC<GlucoseChartProps> = ({ data, countdown }) => {
  const values = data.map(d => d.Value);
  const latest = values[values.length - 1];
  
  const grid = createTextChart(data);
  const yAxisLabels = createYAxisLabels();
  const timeLabels = createTimeLabels(data);
  
  const remainingSeconds = Math.ceil(countdown / 1000);
  const progress = Math.max(0, (60 - remainingSeconds) / 60);
  const barLength = 40;
  const filled = Math.floor(progress * barLength);
  const progressBar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  const displayLines = [
    '🩸 Blood Glucose Monitor',
    `Current: ${latest} mg/dL | Readings: ${values.length}`,
    '',
    ...grid.map((row, i) => 
      `${yAxisLabels[i].toString().padStart(3)} │ ${row.join('')}`
    ),
    `    └${'─'.repeat(CHART_CONFIG.WIDTH)}`,
    `    ${timeLabels.map((label) => 
      label + ' '.repeat(Math.max(1, Math.floor(CHART_CONFIG.WIDTH / timeLabels.length) - label.length))
    ).join('')}`,
    '',
    `Next update in: ${remainingSeconds}s [${progressBar}]`,
    `Last updated: ${new Date().toLocaleTimeString()}`
  ];
  
  return (
    <Box flexDirection="column">
      {displayLines.map((line, i) => (
        <Text key={i}>{line}</Text>
      ))}
    </Box>
  );
};