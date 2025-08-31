export interface StoredCredentials {
  email?: string;
  password?: string;
}

export interface StoredData {
  credentials?: StoredCredentials;
  lastGlucoseValue?: number;
  lastUpdate?: number;
  glucoseData?: any[];
  historicalData?: any[];
  lastHistoricalFetch?: number;
}

export class ChromeStorage {
  static async get<T extends keyof StoredData>(keys: T[]): Promise<Pick<StoredData, T>> {
    return new Promise((resolve) => {
      // Use local storage instead of sync to avoid quota issues
      chrome.storage.local.get(keys, (result) => {
        resolve(result as Pick<StoredData, T>);
      });
    });
  }

  static async set(data: Partial<StoredData>): Promise<void> {
    return new Promise((resolve, reject) => {
      // Use local storage for large data, sync only for credentials
      chrome.storage.local.set(data, () => {
        if (chrome.runtime.lastError) {
          console.error('Storage error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  static async getCredentials(): Promise<StoredCredentials> {
    // Get credentials from sync storage
    return new Promise((resolve) => {
      chrome.storage.sync.get(['credentials'], (result) => {
        resolve(result.credentials || {});
      });
    });
  }

  static async setCredentials(credentials: StoredCredentials): Promise<void> {
    // Store credentials in sync storage for cross-device sync
    return new Promise((resolve, reject) => {
      chrome.storage.sync.set({ credentials }, () => {
        if (chrome.runtime.lastError) {
          console.error('Credential storage error:', chrome.runtime.lastError);
          reject(new Error(chrome.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  static async getGlucoseData(): Promise<{ value?: number; data?: any[]; lastUpdate?: number }> {
    const result = await this.get(['lastGlucoseValue', 'glucoseData', 'lastUpdate']);
    return {
      value: result.lastGlucoseValue,
      data: result.glucoseData,
      lastUpdate: result.lastUpdate
    };
  }

  static async setGlucoseData(value: number, data: any[]): Promise<void> {
    // Limit stored data to last 50 readings to avoid quota issues
    const limitedData = data.slice(-50);
    await this.set({ 
      lastGlucoseValue: value, 
      glucoseData: limitedData, 
      lastUpdate: Date.now() 
    });
  }

  static async getHistoricalData(): Promise<{ data?: any[]; lastFetch?: number }> {
    const result = await this.get(['historicalData', 'lastHistoricalFetch']);
    return {
      data: result.historicalData,
      lastFetch: result.lastHistoricalFetch
    };
  }

  static cleanLogbookData(data: any[]): any[] {
    if (!data || data.length === 0) {
      return [];
    }

    // Sort data by timestamp (newest first)
    const sortedData = [...data].sort((a, b) => new Date(b.Timestamp).getTime() - new Date(a.Timestamp).getTime());
    
    const cleanedData = [];
    const GAP_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutes in milliseconds
    
    // Start with the most recent entry
    cleanedData.push(sortedData[0]);
    
    // Go through entries from newest to oldest
    for (let i = 1; i < sortedData.length; i++) {
      const currentTime = new Date(sortedData[i].Timestamp).getTime();
      const previousTime = new Date(sortedData[i - 1].Timestamp).getTime();
      
      // Calculate gap between this entry and the previous (more recent) one
      const timeGap = previousTime - currentTime;
      
      // If gap is larger than 30 minutes, stop including older entries
      if (timeGap > GAP_THRESHOLD_MS) {
        console.log(`Data cleaning: Found gap of ${Math.round(timeGap / (60 * 1000))} minutes at ${sortedData[i].Timestamp}, dropping older entries`);
        break;
      }
      
      cleanedData.push(sortedData[i]);
    }
    
    console.log(`Data cleaning: Kept ${cleanedData.length} of ${data.length} logbook entries`);
    
    // Return data sorted oldest to newest for display
    return cleanedData.reverse();
  }

  static async setHistoricalData(data: any[]): Promise<void> {
    // Store raw historical data - cleaning will be applied when combining with current data
    await this.set({ 
      historicalData: data, 
      lastHistoricalFetch: Date.now() 
    });
  }

  static async getCombinedGlucoseData(): Promise<{ value?: number; data?: any[]; lastUpdate?: number }> {
    const [current, historical] = await Promise.all([
      this.getGlucoseData(),
      this.getHistoricalData()
    ]);

    // Merge historical and current data, removing duplicates
    let combinedData: any[] = [];
    
    if (historical.data && historical.data.length > 0) {
      combinedData = [...historical.data];
    }
    
    if (current.data && current.data.length > 0) {
      // Add new data points that aren't already in historical data
      const existingTimestamps = new Set(combinedData.map(item => item.Timestamp));
      const newPoints = current.data.filter(item => !existingTimestamps.has(item.Timestamp));
      combinedData = [...combinedData, ...newPoints];
    }

    // Sort by timestamp before cleaning
    combinedData = combinedData
      .sort((a, b) => new Date(a.Timestamp).getTime() - new Date(b.Timestamp).getTime());

    // Apply data cleaning to the final combined dataset to remove large gaps
    const cleanedData = this.cleanLogbookData(combinedData);

    return {
      value: current.value,
      data: cleanedData,
      lastUpdate: current.lastUpdate
    };
  }
}