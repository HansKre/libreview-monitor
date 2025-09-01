// Glucose monitoring configuration
// Centralizes all glucose ranges, colors, labels, and chart settings

// Color constants for glucose zones
export const GLUCOSE_COLORS = {
  VERY_LOW: '#8B0000',    // Dark Red
  LOW: '#f44336',         // Red
  NORMAL: '#4caf50',      // Green
  ELEVATED: '#ff9800',    // Orange
  HIGH: '#f44336',        // Red
  VERY_HIGH: '#8B0000',   // Dark Red
} as const;

// Glucose range thresholds
export const GLUCOSE_RANGES = {
  VERY_LOW: { min: 0, max: 69 },
  LOW: { min: 70, max: 99 },
  NORMAL: { min: 100, max: 155 },
  ELEVATED: { min: 156, max: 189 },
  HIGH: { min: 190, max: 249 },
  VERY_HIGH: { min: 250, max: 500 },
} as const;

// Reference lines configuration for chart
export const REFERENCE_LINES = {
  VERY_LOW_THRESHOLD: {
    value: 70,
    color: GLUCOSE_COLORS.VERY_LOW,
    label: 'Very Low',
  },
  HIGH_THRESHOLD: {
    value: 190,
    color: GLUCOSE_COLORS.HIGH,
    label: 'High',
  },
  VERY_HIGH_THRESHOLD: {
    value: 250,
    color: GLUCOSE_COLORS.VERY_HIGH,
    label: 'Very High',
  },
} as const;

// DelayedReferenceArea configuration for normal range
export const REFERENCE_AREAS = {
  NORMAL: {
    y1: GLUCOSE_RANGES.NORMAL.min,
    y2: GLUCOSE_RANGES.NORMAL.max,
    fill: GLUCOSE_COLORS.NORMAL,
    fillOpacity: 0.2,
    label: 'Normal Range',
  },
} as const;

// Y-axis configuration
export const Y_AXIS_CONFIG = {
  domain: [50, 350],
  ticks: [50, 70, 100, 150, 190, 250, 300, 350],
} as const;

// Chart styling configuration
export const CHART_STYLES = {
  grid: {
    strokeDasharray: '3 3',
    stroke: '#f0f0f0',
  },
  axis: {
    stroke: '#ccc',
    fontSize: 12,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  referenceLine: {
    strokeDasharray: '2 2',
    strokeWidth: 1,
    strokeOpacity: 0.5,
  },
  separatorLine: {
    strokeDasharray: '3 3',
    strokeWidth: 1,
    strokeOpacity: 0.6,
    color: '#999',
  },
} as const;

// Animation configuration
export const ANIMATION_CONFIG = {
  actualLine: {
    begin: 0,
    duration: 1500,
  },
  projectedLines: {
    begin: 1500,
    duration: 1000,
  },
  referenceArea: {
    delay: 2500,
    duration: 250,
  },
} as const;

// Status labels for different glucose ranges
export const GLUCOSE_STATUS_LABELS = {
  VERY_LOW: 'VERY LOW',
  LOW: 'LOW', 
  NORMAL: 'NORMAL',
  ELEVATED: 'ELEVATED',
  HIGH: 'HIGH',
  VERY_HIGH: 'VERY HIGH',
} as const;

// Utility functions
export const getGlucoseZone = (value: number): keyof typeof GLUCOSE_RANGES => {
  if (value < GLUCOSE_RANGES.LOW.min) return 'VERY_LOW';
  if (value <= GLUCOSE_RANGES.LOW.max) return 'LOW';
  if (value <= GLUCOSE_RANGES.NORMAL.max) return 'NORMAL';
  if (value <= GLUCOSE_RANGES.ELEVATED.max) return 'ELEVATED';
  if (value <= GLUCOSE_RANGES.HIGH.max) return 'HIGH';
  return 'VERY_HIGH';
};

export const getGlucoseColorFromConfig = (value: number): string => {
  const zone = getGlucoseZone(value);
  return GLUCOSE_COLORS[zone];
};

export const getGlucoseStatusFromConfig = (value: number) => {
  const zone = getGlucoseZone(value);
  return {
    status: GLUCOSE_STATUS_LABELS[zone],
    color: GLUCOSE_COLORS[zone],
  };
};