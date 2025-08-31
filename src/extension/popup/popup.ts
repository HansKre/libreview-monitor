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

interface StoredGlucoseData {
  value?: number;
  data?: GlucoseData[];
  lastUpdate?: number;
}

class PopupController {
  private currentTab = 'graph';
  private refreshInterval: number | null = null;
  private readonly REFRESH_INTERVAL_MS = 60000; // 1 minute

  constructor() {
    console.log('PopupController initialized');
    this.initializeTabs();
    this.initializeGraph();
    this.initializeSettings();
    this.startAutoRefresh();
  }

  private initializeTabs() {
    console.log('Initializing tabs...');
    const tabs = document.querySelectorAll('.tab');
    const tabPanes = document.querySelectorAll('.tab-pane');

    console.log(`Found ${tabs.length} tabs and ${tabPanes.length} tab panes`);

    tabs.forEach((tab, index) => {
      console.log(`Setting up tab ${index}:`, tab.getAttribute('data-tab'));
      tab.addEventListener('click', (e) => {
        console.log('Tab clicked:', tab.getAttribute('data-tab'));
        e.preventDefault();
        
        const tabId = tab.getAttribute('data-tab');
        
        // Update active tab
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Update active tab pane
        tabPanes.forEach(pane => pane.classList.remove('active'));
        const targetPane = document.getElementById(`${tabId}-tab`);
        console.log('Target pane:', targetPane);
        targetPane?.classList.add('active');
        
        this.currentTab = tabId || 'graph';
        
        // Refresh data when switching to graph tab
        if (this.currentTab === 'graph') {
          this.loadGlucoseData();
        }
      });
    });
  }

  private initializeGraph() {
    this.loadGlucoseData();
    
    // Refresh button
    document.getElementById('refresh-btn')?.addEventListener('click', () => {
      this.forceUpdateGlucoseData();
    });
  }

  private initializeSettings() {
    this.loadCredentials();
    
    // Form submission
    document.getElementById('credentials-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveCredentials();
    });
  }

  private async loadGlucoseData() {
    try {
      console.log('Loading glucose data...');
      const response = await this.sendMessage({ type: 'GET_GLUCOSE_DATA' });
      console.log('Glucose data response:', response);
      console.log('Response data:', response?.data);
      console.log('Response data value:', response?.data?.value);
      console.log('Response data data:', response?.data?.data);
      
      if (response.success && response.data && (response.data.value || response.data.data)) {
        console.log('Displaying glucose data');
        this.displayGlucoseData(response.data);
      } else {
        console.log('No valid glucose data found');
        this.displayError('No glucose data available. Please configure your credentials in Settings.');
      }
    } catch (error) {
      console.error('Failed to load glucose data:', error);
      this.displayError('Failed to load glucose data. Please check your internet connection.');
    }
  }

  private async forceUpdateGlucoseData() {
    const refreshBtn = document.getElementById('refresh-btn') as HTMLButtonElement;
    if (refreshBtn) {
      refreshBtn.disabled = true;
      refreshBtn.textContent = 'Updating...';
    }

    try {
      const response = await this.sendMessage({ type: 'FORCE_UPDATE' });
      
      if (response.success && response.data) {
        this.displayGlucoseData(response.data);
      } else {
        this.displayError(response.error || 'Failed to update glucose data');
      }
    } catch (error) {
      console.error('Failed to force update:', error);
      this.displayError('Failed to update glucose data. Please check your credentials.');
    } finally {
      if (refreshBtn) {
        refreshBtn.disabled = false;
        refreshBtn.textContent = 'Refresh';
      }
    }
  }

  private displayGlucoseData(data: StoredGlucoseData) {
    const currentValueEl = document.getElementById('current-value');
    const lastUpdateEl = document.getElementById('last-update');
    const chartContainer = document.getElementById('chart-container');

    if (currentValueEl && data.value) {
      currentValueEl.textContent = `${data.value} mg/dL`;
      
      // Color code based on glucose ranges
      if (data.value < 70) {
        currentValueEl.style.color = '#f44336'; // Red for low
      } else if (data.value > 180) {
        currentValueEl.style.color = '#ff9800'; // Orange for high
      } else {
        currentValueEl.style.color = '#4caf50'; // Green for normal
      }
    }

    if (lastUpdateEl && data.lastUpdate) {
      const updateTime = new Date(data.lastUpdate);
      lastUpdateEl.textContent = `Last updated: ${updateTime.toLocaleTimeString()}`;
    }

    if (chartContainer && data.data && data.data.length > 0) {
      const chart = this.generateTextChart(data.data);
      chartContainer.textContent = chart;
    }
  }

  private generateTextChart(glucoseData: GlucoseData[]): string {
    const width = 45;
    const height = 15;
    const maxVal = 350;
    const minVal = 50;

    // Create grid
    const grid: string[][] = [];
    for (let y = 0; y < height; y++) {
      grid[y] = new Array(width).fill(' ');
    }

    // Plot data points (use last 45 points to fit width)
    const dataToPlot = glucoseData.slice(-width);
    
    for (let i = 0; i < dataToPlot.length; i++) {
      const value = dataToPlot[i].Value;
      const x = i;
      const y = Math.round(((maxVal - value) / (maxVal - minVal)) * (height - 1));
      
      if (x >= 0 && x < width && y >= 0 && y < height) {
        grid[y][x] = '●';
      }
    }

    // Create Y-axis labels and chart
    let chart = '';
    for (let i = 0; i < height; i++) {
      const yValue = Math.round(maxVal - (i / (height - 1)) * (maxVal - minVal));
      chart += `${yValue.toString().padStart(3)} │${grid[i].join('')}\n`;
    }

    // Add bottom border and time labels
    chart += `    └${'─'.repeat(width)}\n`;
    
    // Add time labels (show first, middle, and last times)
    if (dataToPlot.length >= 3) {
      const firstTime = new Date(dataToPlot[0].Timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', hour12: false 
      });
      const lastTime = new Date(dataToPlot[dataToPlot.length - 1].Timestamp).toLocaleTimeString('en-US', { 
        hour: '2-digit', minute: '2-digit', hour12: false 
      });
      
      chart += `    ${firstTime}${' '.repeat(width - firstTime.length - lastTime.length)}${lastTime}`;
    }

    return chart;
  }

  private displayError(message: string) {
    const chartContainer = document.getElementById('chart-container');
    if (chartContainer) {
      chartContainer.innerHTML = `<div class="error">${message}</div>`;
    }

    const currentValueEl = document.getElementById('current-value');
    const lastUpdateEl = document.getElementById('last-update');
    
    if (currentValueEl) currentValueEl.textContent = '--';
    if (lastUpdateEl) lastUpdateEl.textContent = 'Error loading data';
  }

  private async loadCredentials() {
    try {
      const result = await chrome.storage.sync.get(['credentials']);
      const credentials = result.credentials || {};
      
      const emailInput = document.getElementById('email') as HTMLInputElement;
      const passwordInput = document.getElementById('password') as HTMLInputElement;
      
      if (emailInput && credentials.email) {
        emailInput.value = credentials.email;
      }
      
      // Don't populate password for security
      if (passwordInput) {
        passwordInput.value = '';
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
  }

  private async saveCredentials() {
    const emailInput = document.getElementById('email') as HTMLInputElement;
    const passwordInput = document.getElementById('password') as HTMLInputElement;
    const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
    const messageDiv = document.getElementById('save-message');

    if (!emailInput || !passwordInput || !saveBtn || !messageDiv) return;

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
      this.showMessage('Please fill in both email and password.', 'error');
      return;
    }

    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    try {
      const response = await this.sendMessage({
        type: 'UPDATE_CREDENTIALS',
        credentials: { email, password }
      });

      if (response.success) {
        this.showMessage('Credentials saved successfully! Glucose data will update automatically.', 'success');
        passwordInput.value = ''; // Clear password after saving
      } else {
        this.showMessage(`Failed to save credentials: ${response.error}`, 'error');
      }
    } catch (error) {
      console.error('Failed to save credentials:', error);
      this.showMessage('Failed to save credentials. Please try again.', 'error');
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = 'Save Credentials';
    }
  }

  private showMessage(message: string, type: 'success' | 'error') {
    const messageDiv = document.getElementById('save-message');
    if (!messageDiv) return;

    messageDiv.textContent = message;
    messageDiv.className = type === 'success' ? 'success-message' : 'error';
    messageDiv.style.display = 'block';

    // Hide message after 5 seconds
    setTimeout(() => {
      messageDiv.style.display = 'none';
    }, 5000);
  }

  private startAutoRefresh() {
    // Clear any existing interval
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }

    // Start auto-refresh every minute
    this.refreshInterval = setInterval(() => {
      console.log('Auto-refreshing glucose data...');
      if (this.currentTab === 'graph') {
        this.loadGlucoseData();
      }
    }, this.REFRESH_INTERVAL_MS);

    // Clear interval when popup is closed/unloaded
    window.addEventListener('beforeunload', () => {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval);
      }
    });

    console.log('Auto-refresh enabled: glucose data will update every minute');
  }

  private sendMessage(message: any): Promise<any> {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(message, (response) => {
        resolve(response || { success: false, error: 'No response from background script' });
      });
    });
  }
}

// Initialize popup when DOM is ready
function initPopup() {
  console.log('Initializing popup, document ready state:', document.readyState);
  try {
    new PopupController();
  } catch (error) {
    console.error('Failed to initialize popup:', error);
  }
}

if (document.readyState === 'loading') {
  console.log('Document still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', initPopup);
} else {
  console.log('Document already loaded, initializing immediately');
  initPopup();
}