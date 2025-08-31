import { useState, useEffect } from 'react';
import type { GlucoseData } from '../../../types';

export interface StoredGlucoseData {
  value?: number;
  data?: GlucoseData[];
  lastUpdate?: number;
}

export const useGlucoseData = (currentTab: string) => {
  const [glucoseData, setGlucoseData] = useState<StoredGlucoseData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = (message: Record<string, unknown>): Promise<{ success: boolean; data?: StoredGlucoseData; error?: string }> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || { success: false, error: 'No response from background script' });
      });
    });
  };

  const loadGlucoseData = async () => {
    try {
      const response = await sendMessage({ type: 'GET_GLUCOSE_DATA' });
      if (response.success && response.data) {
        setGlucoseData(response.data);
        setError(null);
      } else {
        setError('No glucose data available. Please configure your credentials in Settings.');
      }
    } catch (error) {
      console.error('Failed to load glucose data:', error);
      setError('Failed to load glucose data. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  const forceUpdate = async () => {
    setLoading(true);
    try {
      const response = await sendMessage({ type: 'FORCE_UPDATE' });
      if (response.success && response.data) {
        setGlucoseData(response.data);
        setError(null);
      } else {
        setError(response.error || 'Failed to update glucose data');
      }
    } catch (error) {
      console.error('Failed to force update:', error);
      setError('Failed to update glucose data. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGlucoseData();

    // Auto-refresh every minute
    const interval = setInterval(() => {
      if (currentTab === 'graph') {
        loadGlucoseData();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentTab]);

  return {
    glucoseData,
    loading,
    error,
    forceUpdate
  };
};