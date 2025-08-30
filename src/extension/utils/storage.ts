export interface StoredCredentials {
  email?: string;
  password?: string;
}

export interface StoredData {
  credentials?: StoredCredentials;
  lastGlucoseValue?: number;
  lastUpdate?: number;
  glucoseData?: any[];
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
}