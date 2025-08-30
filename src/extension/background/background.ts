import { ChromeStorage } from '../utils/storage';
import { IconGenerator } from '../utils/iconGenerator';

// API Configuration
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

class LibreViewAPI {
  private auth: ApiResponse | null = null;

  async authenticate(): Promise<ApiResponse> {
    const credentials = await ChromeStorage.getCredentials();
    
    if (!credentials.email || !credentials.password) {
      throw new Error("No credentials stored. Please configure in extension popup.");
    }

    const response = await fetch(`${API_BASE_URL}/llu/auth/login`, {
      method: 'POST',
      headers: HEADERS,
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password
      })
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const loginResponse = await response.json() as any;
    const jwtToken = loginResponse?.data?.authTicket?.token;
    const accountId = loginResponse?.data?.user?.id;

    if (!jwtToken) throw new Error("Authentication failed");
    if (!accountId) throw new Error("Account ID not found");

    // SHA256 digest of a user's id as a 64-char hexadecimal string
    const accountIdHash = await this.sha256(accountId);

    // Retrieve patientId
    const connectionsResponse = await fetch(`${API_BASE_URL}/llu/connections`, {
      headers: {
        ...HEADERS,
        authorization: `Bearer ${jwtToken}`,
        "account-id": accountIdHash,
      },
    });

    if (!connectionsResponse.ok) {
      throw new Error(`Failed to get connections: ${connectionsResponse.statusText}`);
    }

    const connectionsData = await connectionsResponse.json() as any;
    const patientId = connectionsData?.data[0]?.patientId;
    
    if (!patientId) throw new Error("No patient ID found");

    this.auth = { jwtToken, accountIdHash, patientId };
    return this.auth;
  }

  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async fetchGlucoseData(): Promise<GlucoseData[]> {
    if (!this.auth) {
      await this.authenticate();
    }

    if (!this.auth) {
      throw new Error("Authentication required");
    }

    const response = await fetch(`${API_BASE_URL}/llu/connections/${this.auth.patientId}/graph`, {
      headers: {
        ...HEADERS,
        authorization: `Bearer ${this.auth.jwtToken}`,
        "account-id": this.auth.accountIdHash,
      },
    });

    if (!response.ok) {
      // Try to re-authenticate once on failure
      if (response.status === 401) {
        this.auth = null;
        await this.authenticate();
        return this.fetchGlucoseData();
      }
      throw new Error(`Failed to fetch glucose data: ${response.statusText}`);
    }

    const graphResponse = await response.json() as any;
    return graphResponse?.data?.graphData || [];
  }
}

class BackgroundService {
  private api = new LibreViewAPI();
  private updateInterval: number | null = null;
  private readonly UPDATE_INTERVAL_MS = 60000; // 1 minute

  async initialize() {
    console.log('LibreView Extension Background Service Starting...');
    
    // Check if credentials exist before starting updates
    const credentials = await ChromeStorage.getCredentials();
    if (credentials.email && credentials.password) {
      console.log('Credentials found, starting periodic updates...');
      // Start periodic updates
      this.startPeriodicUpdates();
      // Initial update
      await this.updateGlucoseData();
    } else {
      console.log('No credentials found, waiting for user configuration...');
      // Set initial title to indicate setup needed
      if (chrome.action && chrome.action.setTitle) {
        chrome.action.setTitle({ 
          title: 'Glucose Monitor - Setup Required' 
        });
      }
    }
  }

  private startPeriodicUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(async () => {
      try {
        await this.updateGlucoseData();
      } catch (error) {
        console.error('Periodic update failed:', error);
      }
    }, this.UPDATE_INTERVAL_MS);
  }

  private async updateGlucoseData() {
    try {
      // Double-check credentials before fetching
      const credentials = await ChromeStorage.getCredentials();
      if (!credentials.email || !credentials.password) {
        console.log('No credentials available, skipping glucose data update');
        return;
      }

      console.log('Updating glucose data...');
      
      const glucoseData = await this.api.fetchGlucoseData();
      
      if (glucoseData && glucoseData.length > 0) {
        const latestValue = glucoseData[glucoseData.length - 1].Value;
        
        // Store data
        await ChromeStorage.setGlucoseData(latestValue, glucoseData);
        
        // Update icon
        await IconGenerator.updateBrowserIcon(latestValue);
        
        console.log(`Updated glucose value: ${latestValue} mg/dL`);
      }
      
    } catch (error) {
      console.error('Failed to update glucose data:', error);
      
      // Update icon to show error state
      if (chrome.action && chrome.action.setTitle) {
        chrome.action.setTitle({ 
          title: `Glucose Monitor - Error: ${(error as Error).message || 'Unknown error'}` 
        });
      }
    }
  }

  async handleMessage(message: any, sender: chrome.runtime.MessageSender, sendResponse: (response?: any) => void) {
    switch (message.type) {
      case 'GET_GLUCOSE_DATA':
        try {
          const data = await ChromeStorage.getGlucoseData();
          sendResponse({ success: true, data });
        } catch (error) {
          sendResponse({ success: false, error: (error as Error).message });
        }
        break;
        
      case 'UPDATE_CREDENTIALS':
        try {
          await ChromeStorage.setCredentials(message.credentials);
          // Clear auth to force re-authentication with new credentials
          this.api = new LibreViewAPI();
          
          // Start periodic updates now that we have credentials
          this.startPeriodicUpdates();
          
          // Trigger immediate update
          await this.updateGlucoseData();
          sendResponse({ success: true });
        } catch (error) {
          sendResponse({ success: false, error: (error as Error).message });
        }
        break;
        
      case 'FORCE_UPDATE':
        try {
          await this.updateGlucoseData();
          const data = await ChromeStorage.getGlucoseData();
          sendResponse({ success: true, data });
        } catch (error) {
          sendResponse({ success: false, error: (error as Error).message });
        }
        break;
        
      default:
        sendResponse({ success: false, error: 'Unknown message type' });
    }
  }
}

// Initialize background service
const backgroundService = new BackgroundService();

// Chrome extension event listeners
chrome.runtime.onInstalled.addListener(() => {
  backgroundService.initialize();
});

chrome.runtime.onStartup.addListener(() => {
  backgroundService.initialize();
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  backgroundService.handleMessage(message, sender, sendResponse);
  return true; // Keep message channel open for async response
});

// Handle service worker lifecycle
self.addEventListener('activate', (event) => {
  console.log('LibreView Extension Service Worker Activated');
  backgroundService.initialize();
});