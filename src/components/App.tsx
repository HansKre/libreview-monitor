import { Text } from "ink";
import React, { useEffect, useState } from "react";
import { authenticate } from "../api/auth";
import { fetchGlucoseData } from "../api/glucose";
import type { ApiResponse, GlucoseData } from "../types";
import { CHART_CONFIG } from "../utils/config";
import { GlucoseChart } from "./GlucoseChart";

export const App: React.FC = () => {
  const [data, setData] = useState<GlucoseData[]>([]);
  const [auth, setAuth] = useState<ApiResponse | null>(null);
  const [countdown, setCountdown] = useState<number>(CHART_CONFIG.UPDATE_INTERVAL);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authData = await authenticate();
        setAuth(authData);
        setIsLoading(false);
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (!auth) return;

    const fetchData = async () => {
      try {
        const glucoseData = await fetchGlucoseData(auth);
        setData(glucoseData);
        setCountdown(CHART_CONFIG.UPDATE_INTERVAL);
        setError(null); // Clear any previous errors on successful fetch
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error";
        setError(errorMessage);
        // Continue fetching every minute despite errors
      }
    };

    fetchData();

    const fetchInterval = setInterval(fetchData, CHART_CONFIG.UPDATE_INTERVAL);
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - CHART_CONFIG.DISPLAY_INTERVAL));
    }, CHART_CONFIG.DISPLAY_INTERVAL);

    return () => {
      clearInterval(fetchInterval);
      clearInterval(countdownInterval);
    };
  }, [auth]);

  if (isLoading) {
    return <Text>Authenticating...</Text>;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  if (data.length === 0) {
    return <Text>Loading glucose data...</Text>;
  }

  return <GlucoseChart data={data} countdown={countdown} />;
  // return <GlucoseGraph graphData={data} />;
};
