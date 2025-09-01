import { CHART_STYLES } from "../config/glucoseConfig";

export const formatTooltipValue = (value: number, name: string) => {
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
};

export const formatTooltipLabel = (label: string) => `Time: ${label}`;

export const tooltipContentStyle = {
  backgroundColor: "white",
  border: "1px solid #ccc",
  borderRadius: "4px",
  fontFamily: CHART_STYLES.axis.fontFamily,
};