import axios from "axios";
import * as dotenv from "dotenv";
import * as crypto from "crypto";
import { render } from "ink";
import React, { useState, useEffect } from "react";

dotenv.config();

const DEBUG = false;
const API_BASE_URL = "https://api.libreview.io";
const HEADERS = {
  "accept-encoding": "gzip",
  "cache-control": "no-cache",
  connection: "Keep-Alive",
  "content-type": "application/json",
  product: "llu.android",
  version: "4.13.0",
};

interface GlucoseData {
  FactoryTimestamp: string;
  Timestamp: string;
  type: number;
  ValueInMgPerDl: number;
  MeasurementColor: number;
  GlucoseUnits: number;
  Value: number;
  isHigh: boolean;
  isLow: boolean;
}

interface ApiResponse {
  jwtToken: string;
  accountIdHash: string;
  patientId: string;
}

/**
 * api documentation:
 * https://gist.github.com/khskekec/6c13ba01b10d3018d816706a32ae8ab2
 */
async function authenticate(): Promise<ApiResponse> {
  const email = process.env.EMAIL;
  const password = process.env.PASSWORD;

  if (!email || !password) {
    throw new Error("EMAIL and PASSWORD environment variables must be set");
  }

  // Retrieve auth token
  const { data: loginResponse } = await axios.post(
    `${API_BASE_URL}/llu/auth/login`,
    { email, password },
    { headers: HEADERS }
  );

  const jwtToken = loginResponse?.data?.authTicket?.token;
  const accountId = loginResponse?.data?.user?.id;

  if (!jwtToken) throw new Error("Authentication failed");
  if (!accountId) throw new Error("Account ID not found");

  // SHA256 digest of a user's id as a 64-char hexadecimal string
  const accountIdHash = crypto.createHash("sha256").update(accountId).digest("hex");

  // retrieve patientId
  const { data: connectionsResponse } = await axios.get(
    `${API_BASE_URL}/llu/connections`,
    {
      headers: {
        ...HEADERS,
        authorization: `Bearer ${jwtToken}`,
        "account-id": accountIdHash,
      },
    }
  );

  const patientId = connectionsResponse?.data[0]?.patientId;
  if (!patientId) throw new Error("No patient ID found");

  return { jwtToken, accountIdHash, patientId };
}

async function fetchGlucoseData(auth: ApiResponse): Promise<GlucoseData[]> {
  const { data: graphResponse } = await axios.get(
    `${API_BASE_URL}/llu/connections/${auth.patientId}/graph`,
    {
      headers: {
        ...HEADERS,
        authorization: `Bearer ${auth.jwtToken}`,
        "account-id": auth.accountIdHash,
      },
    }
  );

  return graphResponse?.data?.graphData || [];
}

// Terminal chart component using text-based visualization
const GlucoseChart: React.FC<{ data: GlucoseData[]; countdown: number }> = ({ data, countdown }) => {
  const values = data.map(d => d.Value);
  const times = data.map(d => new Date(d.Timestamp));
  const latest = values[values.length - 1];
  
  // Create a simple text-based chart
  const createTextChart = () => {
    const width = 80;
    const height = 20;
    const maxVal = 350;
    const minVal = 0;
    
    // Create grid
    const grid: string[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = new Array(width).fill(' ');
    }
    
    // Plot data points
    for (let i = 0; i < values.length; i++) {
      const x = Math.round((i / (values.length - 1)) * (width - 1));
      const y = Math.round(((maxVal - values[i]) / (maxVal - minVal)) * (height - 1));
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y][x] = '●';
      }
      
      // Connect points with lines
      if (i > 0) {
        const prevX = Math.round(((i - 1) / (values.length - 1)) * (width - 1));
        const prevY = Math.round(((maxVal - values[i - 1]) / (maxVal - minVal)) * (height - 1));
        
        // Simple line drawing
        const steps = Math.abs(x - prevX) + Math.abs(y - prevY);
        for (let step = 0; step <= steps; step++) {
          const lineX = Math.round(prevX + (x - prevX) * (step / steps));
          const lineY = Math.round(prevY + (y - prevY) * (step / steps));
          
          if (lineX >= 0 && lineX < width && lineY >= 0 && lineY < height) {
            grid[lineY][lineX] = '─';
          }
        }
        
        // Ensure endpoints are visible
        if (x >= 0 && x < width && y >= 0 && y < height) {
          grid[y][x] = '●';
        }
      }
    }
    
    return grid;
  };
  
  const grid = createTextChart();
  
  // Create Y-axis labels
  const yAxisLabels = [];
  for (let i = 0; i < 20; i++) {
    const value = 350 - (i / 19) * 350;
    yAxisLabels.push(Math.round(value));
  }
  
  // Create time labels for X-axis
  const timeLabels = [];
  const numLabels = 5;
  for (let i = 0; i < numLabels; i++) {
    const index = Math.round((i / (numLabels - 1)) * (times.length - 1));
    if (times[index]) {
      timeLabels.push(times[index].toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
    }
  }
  
  // Progress bar
  const totalSeconds = 60;
  const remainingSeconds = Math.ceil(countdown / 1000);
  const progress = Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds);
  const barLength = 40;
  const filled = Math.floor(progress * barLength);
  const progressBar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
  
  // Create the complete display as a single string
  const displayLines = [
    '🩸 Blood Glucose Monitor',
    `Current: ${latest} mg/dL | Readings: ${values.length}`,
    '',
    ...grid.map((row, i) => 
      `${yAxisLabels[i].toString().padStart(3)} │ ${row.join('')}`
    ),
    `    └${'─'.repeat(80)}`,
    `    ${timeLabels.map((label) => 
      label + ' '.repeat(Math.max(1, Math.floor(80 / timeLabels.length) - label.length))
    ).join('')}`,
    '',
    `Next update in: ${remainingSeconds}s [${progressBar}]`,
    `Last updated: ${new Date().toLocaleTimeString()}`
  ];
  
  return (
    <div>
      {displayLines.map((line, i) => (
        <div key={i}>{line}</div>
      ))}
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<GlucoseData[]>([]);
  const [auth, setAuth] = useState<ApiResponse | null>(null);
  const [countdown, setCountdown] = useState<number>(60000);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const initAuth = async () => {
      try {
        const authData = await authenticate();
        setAuth(authData);
        setIsLoading(false);
      } catch (err: any) {
        setError(err.message);
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
        setCountdown(60000);
      } catch (err: any) {
        setError(err.message);
      }
    };
    
    // Initial fetch
    fetchData();
    
    // Set up intervals
    const fetchInterval = setInterval(fetchData, 60000);
    
    const countdownInterval = setInterval(() => {
      setCountdown(prev => Math.max(0, prev - 1000));
    }, 1000);
    
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

async function main() {
  // Since we're having issues with Ink's typing, let's use a simple console approach
  console.clear();
  
  try {
    const auth = await authenticate();
    let data: GlucoseData[] = [];
    let nextUpdateTime = Date.now() + 60000;
    
    const fetchAndUpdate = async () => {
      try {
        data = await fetchGlucoseData(auth);
        nextUpdateTime = Date.now() + 60000;
      } catch (error: any) {
        console.error("Error fetching data:", error.message);
      }
    };

    const displayChart = () => {
      if (data.length === 0) return;
      
      const values = data.map(d => d.Value);
      const times = data.map(d => new Date(d.Timestamp));
      const latest = values[values.length - 1];
      
      // Create a simple text-based chart
      const width = 80;
      const height = 20;
      const maxVal = 350;
      const minVal = 0;
      
      // Create grid
      const grid: string[][] = [];
      for (let y = 0; y < height; y++) {
        grid[y] = new Array(width).fill(' ');
      }
      
      // Plot data points
      for (let i = 0; i < values.length; i++) {
        const x = Math.round((i / (values.length - 1)) * (width - 1));
        const y = Math.round(((maxVal - values[i]) / (maxVal - minVal)) * (height - 1));
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          grid[y][x] = '●';
        }
        
        // Connect points with lines
        if (i > 0) {
          const prevX = Math.round(((i - 1) / (values.length - 1)) * (width - 1));
          const prevY = Math.round(((maxVal - values[i - 1]) / (maxVal - minVal)) * (height - 1));
          
          // Simple line drawing
          const steps = Math.abs(x - prevX) + Math.abs(y - prevY);
          for (let step = 0; step <= steps; step++) {
            const lineX = Math.round(prevX + (x - prevX) * (step / steps));
            const lineY = Math.round(prevY + (y - prevY) * (step / steps));
            
            if (lineX >= 0 && lineX < width && lineY >= 0 && lineY < height) {
              grid[lineY][lineX] = '─';
            }
          }
          
          // Ensure endpoints are visible
          if (x >= 0 && x < width && y >= 0 && y < height) {
            grid[y][x] = '●';
          }
        }
      }
      
      // Create Y-axis labels
      const yAxisLabels = [];
      for (let i = 0; i < height; i++) {
        const value = 350 - (i / (height - 1)) * 350;
        yAxisLabels.push(Math.round(value));
      }
      
      // Create time labels for X-axis
      const timeLabels = [];
      const numLabels = 5;
      for (let i = 0; i < numLabels; i++) {
        const index = Math.round((i / (numLabels - 1)) * (times.length - 1));
        if (times[index]) {
          timeLabels.push(times[index].toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }));
        }
      }
      
      // Progress bar
      const timeToNext = Math.max(0, nextUpdateTime - Date.now());
      const totalSeconds = 60;
      const remainingSeconds = Math.ceil(timeToNext / 1000);
      const progress = Math.max(0, (totalSeconds - remainingSeconds) / totalSeconds);
      const barLength = 40;
      const filled = Math.floor(progress * barLength);
      const progressBar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
      
      console.clear();
      console.log('🩸 Blood Glucose Monitor');
      console.log(`Current: ${latest} mg/dL | Readings: ${values.length}`);
      console.log('');
      
      // Display chart
      grid.forEach((row, i) => {
        console.log(`${yAxisLabels[i].toString().padStart(3)} │ ${row.join('')}`);
      });
      
      console.log(`    └${'─'.repeat(80)}`);
      console.log(`    ${timeLabels.map((label) => 
        label + ' '.repeat(Math.max(1, Math.floor(80 / timeLabels.length) - label.length))
      ).join('')}`);
      console.log('');
      console.log(`Next update in: ${remainingSeconds}s [${progressBar}]`);
      console.log(`Last updated: ${new Date().toLocaleTimeString()}`);
    };

    // Initial fetch
    await fetchAndUpdate();
    
    // Update display every second
    const displayInterval = setInterval(displayChart, 1000);
    
    // Refetch data every minute
    const fetchInterval = setInterval(fetchAndUpdate, 60000);
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
      clearInterval(displayInterval);
      clearInterval(fetchInterval);
      console.log('\nGoodbye!');
      process.exit(0);
    });
    
    // Initial display
    displayChart();
    
  } catch (error: any) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

main();