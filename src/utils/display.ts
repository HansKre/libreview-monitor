import type { GlucoseData } from "../types";
import { createTextChart, createYAxisLabels, createTimeLabels, createProgressBar } from "./chart";
import { CHART_CONFIG } from "./config";

export function displayChart(data: GlucoseData[], nextUpdateTime: number): void {
  if (data.length === 0) return;
  
  const values = data.map(d => d.Value);
  const latest = values[values.length - 1];
  
  const grid = createTextChart(data);
  const yAxisLabels = createYAxisLabels();
  const timeLabels = createTimeLabels(data);
  
  const timeToNext = Math.max(0, nextUpdateTime - Date.now());
  const { remainingSeconds, progressBar } = createProgressBar(timeToNext);
  
  console.clear();
  console.log('🩸 Blood Glucose Monitor');
  console.log(`Current: ${latest} mg/dL | Readings: ${values.length}`);
  console.log('');
  
  grid.forEach((row, i) => {
    console.log(`${yAxisLabels[i].toString().padStart(3)} │ ${row.join('')}`);
  });
  
  console.log(`    └${'─'.repeat(CHART_CONFIG.WIDTH)}`);
  console.log(`    ${timeLabels.map((label) => 
    label + ' '.repeat(Math.max(1, Math.floor(CHART_CONFIG.WIDTH / timeLabels.length) - label.length))
  ).join('')}`);
  console.log('');
  console.log(`Next update in: ${remainingSeconds}s [${progressBar}]`);
  console.log(`Last updated: ${new Date().toLocaleTimeString()}`);
}