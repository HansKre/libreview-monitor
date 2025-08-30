import React, { useState, useEffect } from "react";
import type { GlucoseData, ApiResponse } from "../types";
import { authenticate } from "../api/auth";
import { fetchGlucoseData } from "../api/glucose";
import { GlucoseChart } from "./GlucoseChart";
import { CHART_CONFIG } from "../utils/config";

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
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
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
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setError(errorMessage);
      }
    };
    
    fetchData();
    
    const fetchInterval = setInterval(fetchData, CHART_CONFIG.UPDATE_INTERVAL);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - CHART_CONFIG.DISPLAY_INTERVAL));
    }, CHART_CONFIG.DISPLAY_INTERVAL);
    
    return () => {
      clearInterval(fetchInterval);
      clearInterval(countdownInterval);
    };
  }, [auth]);
  
  if (isLoading) {
    return <div>Authenticating...</div>;
  }
  
  if (error) {
    return <div>Error: {error}</div>;
  }
  
  if (data.length === 0) {
    return <div>Loading glucose data...</div>;
  }
  
  return <GlucoseChart data={data} countdown={countdown} />;
};