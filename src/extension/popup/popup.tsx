import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { GlucoseData } from '../../types';

interface StoredGlucoseData {
  value?: number;
  data?: GlucoseData[];
  lastUpdate?: number;
}

const PopupApp: React.FC = () => {
  const [currentTab, setCurrentTab] = useState('graph');
  const [glucoseData, setGlucoseData] = useState<StoredGlucoseData>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [saveMessage, setSaveMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    loadGlucoseData();
    loadCredentials();

    // Auto-refresh every minute
    const interval = setInterval(() => {
      if (currentTab === 'graph') {
        loadGlucoseData();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [currentTab]);

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

  const loadCredentials = async () => {
    try {
      const result = await chrome.storage.sync.get(['credentials']);
      const storedCredentials = result.credentials || {};
      setCredentials({ email: storedCredentials.email || '', password: '' });
    } catch (err) {
      console.error('Failed to load credentials:', err);
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

  const saveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentials.email || !credentials.password) {
      setSaveMessage({ text: 'Please fill in both email and password.', type: 'error' });
      return;
    }

    try {
      const response = await sendMessage({
        type: 'UPDATE_CREDENTIALS',
        credentials: credentials
      });

      if (response.success) {
        setSaveMessage({ text: 'Credentials saved successfully! Glucose data will update automatically.', type: 'success' });
        setCredentials({ ...credentials, password: '' });
      } else {
        setSaveMessage({ text: `Failed to save credentials: ${response.error}`, type: 'error' });
      }
    } catch {
      setSaveMessage({ text: 'Failed to save credentials. Please try again.', type: 'error' });
    }

    setTimeout(() => setSaveMessage(null), 5000);
  };

  const getGlucoseStatus = (value: number) => {
    if (value < 70) return { status: 'VERY LOW', color: '#8B0000' };
    if (value < 100) return { status: 'LOW', color: '#f44336' };
    if (value >= 250) return { status: 'VERY HIGH', color: '#8B0000' };
    if (value >= 190) return { status: 'HIGH', color: '#f44336' };
    if (value >= 156) return { status: 'ELEVATED', color: '#ff9800' };
    return { status: 'NORMAL', color: '#4caf50' };
  };

  const getGlucoseColor = (value: number) => {
    if (value < 70) return '#8B0000'; // Very low - Dark Red
    if (value < 100) return '#f44336'; // Low - Red
    if (value >= 250) return '#8B0000'; // Very high - Dark Red
    if (value >= 190) return '#f44336'; // High - Red
    if (value >= 156) return '#ff9800'; // Elevated - Orange
    return '#4caf50'; // Normal - Green
  };

  const calculateProjection = (data: GlucoseData[], minutesAhead: number = 60) => {
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
    const projectionPoints = [];
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

  const formatChartData = (data: GlucoseData[]) => {
    const actualData = data.map(item => ({
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
    const projectionStartPoint = {
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
    
    const projectionData = [
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

  return (
    <div className="container">
      <div className="header">
        <h1>🩸 LibreView Glucose Monitor</h1>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${currentTab === 'graph' ? 'active' : ''}`}
          onClick={() => setCurrentTab('graph')}
        >
          Graph
        </button>
        <button 
          className={`tab ${currentTab === 'settings' ? 'active' : ''}`}
          onClick={() => setCurrentTab('settings')}
        >
          Settings
        </button>
      </div>

      <div className="tab-content">
        {currentTab === 'graph' && (
          <div className="tab-pane active">
            <div className="glucose-status">
              <div>
                <div 
                  className="current-value"
                  style={{ color: glucoseData.value ? getGlucoseStatus(glucoseData.value).color : '#2196f3' }}
                >
                  {glucoseData.value ? `${glucoseData.value} mg/dL` : '--'}
                </div>
                <div className="last-update">
                  {glucoseData.lastUpdate 
                    ? `Last updated: ${new Date(glucoseData.lastUpdate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`
                    : 'Loading...'
                  }
                </div>
              </div>
              <button className="refresh-button" onClick={forceUpdate} disabled={loading}>
                {loading ? 'Updating...' : 'Refresh'}
              </button>
            </div>

            <div className="chart-container" style={{ height: '320px', background: 'white', borderRadius: '8px', padding: '0', margin: "0px -4px 0px -14px" }}>
              {/* Legend */}
              <div style={{ 
                padding: '8px 16px 0px 16px', 
                fontSize: '11px', 
                color: '#666',
                display: 'flex',
                gap: '16px',
                justifyContent: 'center',
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ width: '16px', height: '2px', backgroundColor: getGlucoseColor(glucoseData.value || 100) }}></div>
                  <span>Actual</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <div style={{ 
                    width: '16px', 
                    height: '2px', 
                    backgroundColor: getGlucoseColor(glucoseData.value || 100),
                    opacity: 0.7,
                    backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 4px, white 4px, white 6px)'
                  }}></div>
                  <span>60min Projection</span>
                </div>
              </div>
              {error ? (
                <div className="error">{error}</div>
              ) : loading ? (
                <div className="loading">Loading glucose data...</div>
              ) : glucoseData.data && glucoseData.data.length > 0 ? (
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart 
                    data={formatChartData(glucoseData.data)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="time" 
                      interval="preserveStartEnd"
                      tick={{ fontSize: 12, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                      axisLine={{ stroke: '#ccc' }}
                    />
                    <YAxis 
                      domain={[50, 350]}
                      tick={{ fontSize: 12, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}
                      axisLine={{ stroke: '#ccc' }}
                      width={40}
                    />
                    <Tooltip 
                      formatter={(value: number) => [
                        `${value} mg/dL`, 
                        'Glucose'
                      ]}
                      labelFormatter={(label) => `Time: ${label}`}
                      contentStyle={{
                        backgroundColor: 'white',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
                      }}
                    />
                    
                    {/* Reference lines for glucose ranges */}
                    <ReferenceLine y={70} stroke="#8B0000" strokeDasharray="2 2" strokeWidth={1} strokeOpacity={0.5} />
                    <ReferenceLine y={100} stroke="#f44336" strokeDasharray="2 2" strokeWidth={1} strokeOpacity={0.5} />
                    <ReferenceLine y={156} stroke="#ff9800" strokeDasharray="2 2" strokeWidth={1} strokeOpacity={0.5} />
                    <ReferenceLine y={190} stroke="#f44336" strokeDasharray="2 2" strokeWidth={1} strokeOpacity={0.5} />
                    <ReferenceLine y={250} stroke="#8B0000" strokeDasharray="2 2" strokeWidth={1} strokeOpacity={0.5} />
                    
                    {/* Vertical line separating actual from projected data */}
                    <ReferenceLine 
                      x={new Date(glucoseData.data[glucoseData.data.length - 1]?.Timestamp || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                      stroke="#999" 
                      strokeDasharray="3 3" 
                      strokeWidth={1} 
                      strokeOpacity={0.6}
                    />
                    
                    {/* Actual glucose data line */}
                    <Line 
                      type="monotone" 
                      dataKey="value" 
                      stroke={getGlucoseColor(glucoseData.data[glucoseData.data.length - 1]?.Value || 100)}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ 
                        r: 6, 
                        fill: getGlucoseColor(glucoseData.value || 100),
                        stroke: 'white',
                        strokeWidth: 2
                      }}
                      connectNulls={false}
                      animationBegin={0}
                      animationDuration={1500}
                    />
                    
                    {/* Projected glucose data line */}
                    <Line 
                      type="monotone" 
                      dataKey="projectedValue" 
                      stroke={getGlucoseColor(glucoseData.data[glucoseData.data.length - 1]?.Value || 100)}
                      strokeWidth={2}
                      strokeDasharray="8 4"
                      strokeOpacity={0.7}
                      dot={false}
                      activeDot={{ 
                        r: 4, 
                        fill: getGlucoseColor(glucoseData.value || 100),
                        stroke: 'white',
                        strokeWidth: 1,
                        strokeOpacity: 0.7
                      }}
                      connectNulls={true}
                      animationBegin={1500}
                      animationDuration={1000}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="loading">No glucose data available</div>
              )}
            </div>
          </div>
        )}

        {currentTab === 'settings' && (
          <div className="tab-pane active">
            <div className="settings-info">
              Enter your LibreView credentials to enable automatic glucose monitoring. 
              Your credentials are stored securely in Chrome's local storage.
            </div>

            <form onSubmit={saveCredentials}>
              <div className="form-group">
                <label htmlFor="email">Email:</label>
                <input
                  type="email"
                  id="email"
                  value={credentials.email}
                  onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                  placeholder="your@email.com"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password:</label>
                <input
                  type="password"
                  id="password"
                  value={credentials.password}
                  onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                  placeholder="Your password"
                  required
                />
              </div>

              <button type="submit" className="btn">
                Save Credentials
              </button>

              {saveMessage && (
                <div className={saveMessage.type === 'success' ? 'success-message' : 'error'}>
                  {saveMessage.text}
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// Initialize the React app
const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<PopupApp />);
}