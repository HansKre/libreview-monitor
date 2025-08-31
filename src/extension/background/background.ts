import { ChromeStorage } from "../utils/storage";
import { IconGenerator } from "../utils/iconGenerator";
import type { GlucoseData, ApiResponse } from "../../types";

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


class LibreViewAPI {
  private auth: ApiResponse | null = null;

  async authenticate(): Promise<ApiResponse> {
    const credentials = await ChromeStorage.getCredentials();

    if (!credentials.email || !credentials.password) {
      throw new Error(
        "No credentials stored. Please configure in extension popup."
      );
    }

    const response = await fetch(`${API_BASE_URL}/llu/auth/login`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
      }),
    });

    if (!response.ok) {
      throw new Error(`Authentication failed: ${response.statusText}`);
    }

    const loginResponse = (await response.json()) as any;
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
      throw new Error(
        `Failed to get connections: ${connectionsResponse.statusText}`
      );
    }

    const connectionsData = (await connectionsResponse.json()) as any;
    const patientId = connectionsData?.data[0]?.patientId;

    if (!patientId) throw new Error("No patient ID found");

    this.auth = { jwtToken, accountIdHash, patientId };
    return this.auth;
  }

  private async sha256(message: string): Promise<string> {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  }

  async fetchGlucoseData(): Promise<{ data: GlucoseData[], currentMeasurementValue?: number }> {
    if (!this.auth) {
      await this.authenticate();
    }

    if (!this.auth) {
      throw new Error("Authentication required");
    }

    const response = await fetch(
      `${API_BASE_URL}/llu/connections/${this.auth.patientId}/graph`,
      {
        headers: {
          ...HEADERS,
          authorization: `Bearer ${this.auth.jwtToken}`,
          "account-id": this.auth.accountIdHash,
        },
      }
    );

    if (!response.ok) {
      // Try to re-authenticate once on failure
      if (response.status === 401) {
        this.auth = null;
        await this.authenticate();
        return this.fetchGlucoseData();
      }
      throw new Error(`Failed to fetch glucose data: ${response.statusText}`);
    }

    const graphResponse = (await response.json()) as any;
    const currentMeasurementValue = graphResponse?.data?.connection?.glucoseMeasurement?.Value;
    
    return {
      data: graphResponse?.data?.graphData || [],
      currentMeasurementValue
    };
  }
}

class BackgroundService {
  private api = new LibreViewAPI();
  private lastUpdateTime = 0;
  private readonly UPDATE_INTERVAL_MS = 60000; // 1 minute
  private readonly MIN_UPDATE_INTERVAL_MS = 55000; // Minimum 55 seconds between updates
  readonly ALARM_NAME = 'glucoseUpdate';

  async initialize() {
    console.log("LibreView Extension Background Service Starting...");

    // Check if credentials exist before starting updates
    const credentials = await ChromeStorage.getCredentials();
    if (credentials.email && credentials.password) {
      console.log("Credentials found, starting periodic updates...");

      // Check if we have existing glucose data to display immediately
      const existingData = await ChromeStorage.getGlucoseData();
      if (existingData.value) {
        console.log(`Found existing glucose data: ${existingData.value} mg/dL`);
        await IconGenerator.updateBrowserIcon(existingData.value);
      }

      // Start periodic updates
      this.startPeriodicUpdates();
      // Initial update (respecting rate limiting)
      await this.updateGlucoseData();
    } else {
      console.log("No credentials found, waiting for user configuration...");
      // Set initial title to indicate setup needed
      if (chrome.action && chrome.action.setTitle) {
        chrome.action.setTitle({
          title: "LibreView Glucose Monitor - Setup Required",
        });
      }
    }
  }

  private startPeriodicUpdates() {
    // Clear any existing alarm
    chrome.alarms.clear(this.ALARM_NAME);
    
    // Create a repeating alarm for glucose updates (more reliable than setInterval in service workers)
    chrome.alarms.create(this.ALARM_NAME, {
      delayInMinutes: 1, // Start after 1 minute
      periodInMinutes: 1 // Repeat every minute
    });
    
    console.log("Created repeating alarm for glucose updates every 1 minute");
  }

  async updateGlucoseData() {
    try {
      // Rate limiting: Check if enough time has passed since last update
      const now = Date.now();
      const timeSinceLastUpdate = now - this.lastUpdateTime;

      if (
        this.lastUpdateTime > 0 &&
        timeSinceLastUpdate < this.MIN_UPDATE_INTERVAL_MS
      ) {
        console.log(
          `Rate limiting: Only ${Math.round(
            timeSinceLastUpdate / 1000
          )}s since last update, minimum ${
            this.MIN_UPDATE_INTERVAL_MS / 1000
          }s required`
        );
        return;
      }

      // Double-check credentials before fetching
      const credentials = await ChromeStorage.getCredentials();
      if (!credentials.email || !credentials.password) {
        console.log("No credentials available, skipping glucose data update");
        return;
      }

      console.log(
        `Updating glucose data... (${Math.round(
          timeSinceLastUpdate / 1000
        )}s since last update)`
      );

      const result = await this.api.fetchGlucoseData();

      if (result && result.data && result.data.length > 0) {
        // Use currentMeasurementValue as the very latest value if available, 
        // otherwise fall back to the last item from graphData
        const latestValue = result.currentMeasurementValue ?? result.data[result.data.length - 1].Value;

        // Store data
        await ChromeStorage.setGlucoseData(latestValue, result.data);

        // Update icon
        await IconGenerator.updateBrowserIcon(latestValue);

        // Update last fetch time
        this.lastUpdateTime = now;

        console.log(
          `✓ Updated glucose value: ${latestValue} mg/dL at ${new Date().toLocaleTimeString()}${result.currentMeasurementValue ? ' (from current measurement)' : ' (from graph data)'}`
        );
      } else {
        console.log("No glucose data received from API");
      }
    } catch (error) {
      console.error("Failed to update glucose data:", error);

      // Update icon to show error state
      if (chrome.action && chrome.action.setTitle) {
        chrome.action.setTitle({
          title: `LibreView Glucose Monitor - Error: ${
            (error as Error).message || "Unknown error"
          }`,
        });
      }
    }
  }

  async handleMessage(
    message: any,
    sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    switch (message.type) {
      case "GET_GLUCOSE_DATA":
        try {
          const data = await ChromeStorage.getGlucoseData();
          sendResponse({ success: true, data });
        } catch (error) {
          sendResponse({ success: false, error: (error as Error).message });
        }
        break;

      case "UPDATE_CREDENTIALS":
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

      case "FORCE_UPDATE":
        try {
          console.log("Force update requested from popup");
          await this.updateGlucoseData();
          const data = await ChromeStorage.getGlucoseData();
          sendResponse({ success: true, data });
        } catch (error) {
          sendResponse({ success: false, error: (error as Error).message });
        }
        break;

      default:
        sendResponse({ success: false, error: "Unknown message type" });
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

// Handle chrome alarms for periodic glucose updates
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === backgroundService.ALARM_NAME) {
    console.log("Glucose update alarm triggered");
    try {
      await backgroundService.updateGlucoseData();
    } catch (error) {
      console.error("Alarm-triggered update failed:", error);
    }
  }
});

// Handle service worker lifecycle
self.addEventListener("activate", (event) => {
  console.log("LibreView Extension Service Worker Activated");
  backgroundService.initialize();
});
