import type { GlucoseData } from "../types";
import { CHART_CONFIG } from "./config";

export function createTextChart(data: GlucoseData[]): string[][] {
  const values = data.map(d => d.Value);
  const { WIDTH, HEIGHT, MAX_VALUE, MIN_VALUE } = CHART_CONFIG;
  
  const grid: string[][] = [];
  for (let y = 0; y < HEIGHT; y++) {
    grid[y] = new Array(WIDTH).fill(' ');
  }
  
  for (let i = 0; i < values.length; i++) {
    const x = Math.round((i / (values.length - 1)) * (WIDTH - 1));
    const y = Math.round(((MAX_VALUE - values[i]) / (MAX_VALUE - MIN_VALUE)) * (HEIGHT - 1));
    
    if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
      grid[y][x] = '●';
    }
    
    if (i > 0) {
      const prevX = Math.round(((i - 1) / (values.length - 1)) * (WIDTH - 1));
      const prevY = Math.round(((MAX_VALUE - values[i - 1]) / (MAX_VALUE - MIN_VALUE)) * (HEIGHT - 1));
      
      const steps = Math.abs(x - prevX) + Math.abs(y - prevY);
      for (let step = 0; step <= steps; step++) {
        const lineX = Math.round(prevX + (x - prevX) * (step / steps));
        const lineY = Math.round(prevY + (y - prevY) * (step / steps));
        
        if (lineX >= 0 && lineX < WIDTH && lineY >= 0 && lineY < HEIGHT) {
          grid[lineY][lineX] = '─';
        }
      }
      
      if (x >= 0 && x < WIDTH && y >= 0 && y < HEIGHT) {
        grid[y][x] = '●';
      }
    }
  }
  
  return grid;
}

export function createYAxisLabels(): number[] {
  const { HEIGHT, MAX_VALUE } = CHART_CONFIG;
  const yAxisLabels = [];
  for (let i = 0; i < HEIGHT; i++) {
    const value = MAX_VALUE - (i / (HEIGHT - 1)) * MAX_VALUE;
    yAxisLabels.push(Math.round(value));
  }
  return yAxisLabels;
}

export function createTimeLabels(data: GlucoseData[]): string[] {
  const times = data.map(d => new Date(d.Timestamp));
  const timeLabels = [];
  const numLabels = 5;
  for (let i = 0; i < numLabels; i++) {
    const index = Math.round((i / (numLabels - 1)) * (times.length - 1));
    if (times[index]) {
      timeLabels.push(times[index].toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }
  }
  return timeLabels;
}

export function createProgressBar(timeToNext: number): { remainingSeconds: number; progressBar: string } {
  const totalSeconds = 60;
  const remainingSeconds = Math.ceil(timeToNext / 1000);
  const progress = Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds);
  const barLength = 40;
  const filled = Math.floor(progress * barLength);
  const progressBar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  return { remainingSeconds, progressBar };
}