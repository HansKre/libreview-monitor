export const API_BASE_URL = "https://api.libreview.io";

export const HEADERS = {
  "accept-encoding": "gzip",
  "cache-control": "no-cache",
  connection: "Keep-Alive",
  "content-type": "application/json",
  product: "llu.android",
  version: "4.13.0",
};

export const CHART_CONFIG = {
  WIDTH: 80,
  HEIGHT: 20,
  MAX_VALUE: 350,
  MIN_VALUE: 0,
  UPDATE_INTERVAL: 60000,
  DISPLAY_INTERVAL: 1000,
} as const;