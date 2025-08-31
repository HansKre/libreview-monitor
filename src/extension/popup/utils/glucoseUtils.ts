import type { GlucoseData } from '../../../types';

export interface GlucoseStatus {
  status: string;
  color: string;
}

export const getGlucoseStatus = (value: number): GlucoseStatus => {
  if (value < 70) return { status: 'VERY LOW', color: '#8B0000' };
  if (value < 100) return { status: 'LOW', color: '#f44336' };
  if (value >= 250) return { status: 'VERY HIGH', color: '#8B0000' };
  if (value >= 190) return { status: 'HIGH', color: '#f44336' };
  if (value >= 156) return { status: 'ELEVATED', color: '#ff9800' };
  return { status: 'NORMAL', color: '#4caf50' };
};

export const getGlucoseColor = (value: number): string => {
  if (value < 70) return '#8B0000'; // Very low - Dark Red
  if (value < 100) return '#f44336'; // Low - Red
  if (value >= 250) return '#8B0000'; // Very high - Dark Red
  if (value >= 190) return '#f44336'; // High - Red
  if (value >= 156) return '#ff9800'; // Elevated - Orange
  return '#4caf50'; // Normal - Green
};

export interface ProjectionPoint {
  timestamp: number;
  value: number;
  isProjected: true;
}

export const calculateProjection = (data: GlucoseData[], minutesAhead: number = 60): ProjectionPoint[] => {
  if (data.length < 3) return [];
  
  // Use last 30 minutes of data for trend analysis
  const now = new Date().getTime();
  const thirtyMinutesAgo = now - (30 * 60 * 1000);
  const recentData = data.filter(item => new Date(item.Timestamp).getTime() >= thirtyMinutesAgo);
  
  if (recentData.length < 2) return [];
  
  // Calculate trend using linear regression on recent data
  const points = recentData.map((item, index) => ({
    x: index,
    y: item.Value,
    timestamp: new Date(item.Timestamp).getTime()
  }));
  
  // Simple linear regression
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const sumXY = points.reduce((sum, p) => sum + (p.x * p.y), 0);
  const sumXX = points.reduce((sum, p) => sum + (p.x * p.x), 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Generate projection points
  const projectionPoints: ProjectionPoint[] = [];
  const lastTimestamp = new Date(data[data.length - 1].Timestamp).getTime();
  const projectionInterval = 5 * 60 * 1000; // 5 minute intervals
  const projectionCount = minutesAhead / 5;
  
  for (let i = 1; i <= projectionCount; i++) {
    const futureTimestamp = lastTimestamp + (i * projectionInterval);
    const futureX = n + i;
    let projectedValue = slope * futureX + intercept;
    
    // Add some bounds to prevent unrealistic projections
    projectedValue = Math.max(40, Math.min(400, projectedValue));
    
    projectionPoints.push({
      timestamp: futureTimestamp,
      value: projectedValue,
      isProjected: true
    });
  }
  
  return projectionPoints;
};

export interface ChartDataPoint {
  time: string;
  value: number | null;
  projectedValue: number | null;
  timestamp: string;
  color: string;
  isProjected: boolean;
}

export const formatChartData = (data: GlucoseData[]): ChartDataPoint[] => {
  const actualData: ChartDataPoint[] = data.map(item => ({
    time: new Date(item.Timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    }),
    value: item.Value,
    projectedValue: null, // No projection for actual data
    timestamp: item.Timestamp,
    color: getGlucoseColor(item.Value),
    isProjected: false
  }));
  
  // Start projection from the last actual data point for smooth connection
  const lastDataPoint = data[data.length - 1];
  const projectionStartPoint: ChartDataPoint = {
    time: new Date(lastDataPoint.Timestamp).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false
    }),
    value: null,
    projectedValue: lastDataPoint.Value, // Connect from last actual value
    timestamp: lastDataPoint.Timestamp,
    color: getGlucoseColor(lastDataPoint.Value),
    isProjected: true
  };
  
  const projectionData: ChartDataPoint[] = [
    projectionStartPoint,
    ...calculateProjection(data).map(item => ({
      time: new Date(item.timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false
      }),
      value: null, // No actual value for projected data
      projectedValue: item.value,
      timestamp: new Date(item.timestamp).toISOString(),
      color: getGlucoseColor(item.value),
      isProjected: true
    }))
  ];
  
  return [...actualData, ...projectionData];
};