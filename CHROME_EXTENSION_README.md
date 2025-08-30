# LibreView Glucose Monitor Chrome Extension

A Chrome extension that provides real-time glucose monitoring with LibreView API integration, featuring a dynamic icon showing current glucose values and a popup with interactive chart and settings.

## Features

### 🩸 Real-time Glucose Monitoring
- Automatic glucose data fetching every minute
- Dynamic browser icon that changes color based on glucose levels:
  - 🟢 **Green**: Normal range (70-180 mg/dL)
  - 🟠 **Orange**: High glucose (>180 mg/dL)  
  - 🔴 **Red**: Low glucose (<70 mg/dL)

### 📊 Interactive Popup
**Graph Tab:**
- Real-time glucose chart with ASCII visualization
- Current glucose value with color coding
- Last update timestamp
- Manual refresh button

**Settings Tab:**
- Secure credential storage (email/password)
- LibreView account configuration
- Automatic data sync after credential update

### 🔒 Security
- Credentials stored securely in Chrome's sync storage
- HTTPS-only API communication
- No credential logging or external transmission

## Installation

### Option 1: Load Unpacked Extension (Development)

1. **Build the extension:**
   ```bash
   npm run build:extension
   ```

2. **Load in Chrome:**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from your project

3. **Configure:**
   - Click the extension icon in your browser toolbar
   - Go to "Settings" tab
   - Enter your LibreView credentials
   - Save and wait for data to sync

### Option 2: Build Production Package

1. **Build and package:**
   ```bash
   npm run build:extension
   cd dist
   zip -r libreview-extension.zip .
   ```

2. **Install the zip file as an unpacked extension or submit to Chrome Web Store**

## Usage

1. **Initial Setup:**
   - Install and pin the extension to your toolbar
   - Click the extension icon
   - Navigate to the "Settings" tab
   - Enter your LibreView account credentials
   - Click "Save Credentials"

2. **Monitoring:**
   - The extension icon will automatically update with your current glucose value
   - Icon color indicates glucose level status
   - Hover over the icon to see "Glucose: XXX mg/dL"
   - Click the icon to view detailed graph and data

3. **Manual Updates:**
   - Click the "Refresh" button in the Graph tab for immediate data update
   - Extension automatically fetches new data every minute

## Project Structure

```
extension/
├── manifest.json              # Chrome extension manifest
├── popup/
│   └── popup.html            # Popup interface
└── icons/                    # Extension icons

src/extension/
├── background/
│   └── background.ts         # Service worker (data fetching, icon updates)
├── popup/
│   └── popup.ts             # Popup functionality
└── utils/
    ├── storage.ts           # Chrome storage management
    └── iconGenerator.ts     # Dynamic icon generation

dist/                         # Built extension files
```

## Development

### Build Commands

```bash
# Build extension for production
npm run build:extension

# Build extension with development mode and watch
npm run build:extension:dev

# Run CLI version (original functionality)
npm start

# Lint code
npm run lint
```

### Key Technologies

- **TypeScript** - Type-safe extension development
- **Webpack** - Module bundling and build process
- **Chrome Extensions API** - Browser integration
- **LibreView API** - Glucose data source
- **Chrome Storage API** - Secure credential storage

## API Integration

The extension integrates with the LibreView API using:

1. **Authentication:** Email/password login with JWT token
2. **Data Fetching:** Glucose readings from patient graph endpoint
3. **Auto-refresh:** Periodic updates every 60 seconds
4. **Error Handling:** Automatic re-authentication on token expiry

## Privacy & Security

- ✅ Credentials encrypted in Chrome's sync storage
- ✅ HTTPS-only API communication  
- ✅ No data transmitted to third parties
- ✅ Local processing and caching
- ✅ Automatic credential validation

## Troubleshooting

### Extension Not Updating
1. Check your LibreView credentials in Settings tab
2. Verify internet connection
3. Click "Refresh" button manually
4. Check browser console for errors

### Icon Not Changing
1. Ensure extension has proper permissions
2. Try disabling and re-enabling the extension
3. Check if Chrome has blocked the extension

### No Data Displaying
1. Verify LibreView account has recent glucose data
2. Check credentials are correctly saved
3. Look for error messages in popup

## Contributing

1. Fork the repository
2. Create a feature branch
3. Build and test the extension locally
4. Submit a pull request

## License

ISC License - See package.json for details.