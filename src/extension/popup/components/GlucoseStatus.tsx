import React from 'react';
import { getGlucoseStatus } from '../utils/glucoseUtils';

interface GlucoseStatusProps {
  value?: number;
  lastUpdate?: number;
  loading: boolean;
  onRefresh: () => void;
}

export const GlucoseStatus: React.FC<GlucoseStatusProps> = ({
  value,
  lastUpdate,
  loading,
  onRefresh
}) => {
  return (
    <div className="glucose-status">
      <div>
        <div 
          className="current-value"
          style={{ color: value ? getGlucoseStatus(value).color : '#2196f3' }}
        >
          {value ? `${value} mg/dL` : '--'}
        </div>
        <div className="last-update">
          {lastUpdate 
            ? `Last updated: ${new Date(lastUpdate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}`
            : 'Loading...'
          }
        </div>
      </div>
      <button className="refresh-button" onClick={onRefresh} disabled={loading}>
        {loading ? 'Updating...' : 'Refresh'}
      </button>
    </div>
  );
};