# LibreView Glucose Monitor Chrome Extension

**LibreView Glucose Monitor** – A Chrome extension for FreeStyle Libre users that displays real-time blood glucose values and trends directly in your browser.

---

## ⚠️ Disclaimer

This project is **not affiliated with Abbott Laboratories** or the official FreeStyle Libre product line.  
Use at your own risk. Data accuracy may vary. Always follow guidance from your healthcare provider.

---

## 📌 Features

- Display your **current glucose value** in the Chrome toolbar icon.
- Interactive **graph of glucose trends** over time.
- Supports real-time updates for FreeStyle Libre CGM users.
- Lightweight and minimalistic design.

---

## 🖥 Installation

1. **Clone or download this repository:**

   ```bash
   git clone https://github.com/yourusername/libreview-monitor.git
   cd libreview-monitor
   npm install
   ```

2. **Build the extension:**

   ```bash
   npm run build:extension
   ```

3. **Load in Chrome:**

   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top right)
   - Click "Load unpacked"
   - Select the `dist` folder from your project

4. **Configure:**
   - Click the extension icon in your browser toolbar
   - Go to "Settings" tab
   - Enter your LibreView credentials
   - Save and wait for data to sync

## 🔧 Development

```bash
# Build extension for production
npm run build:extension

# Build extension with development mode and watch
npm run build:extension:dev

# Lint code
npm run lint
```

## 📖 API Documentation

<https://gist.github.com/khskekec/6c13ba01b10d3018d816706a32ae8ab2>
<https://libreview-unofficial.stoplight.io/docs/libreview-unofficial/4503bd234db99-get-logbook>

## Todos

- [ ] colorize reference areas in Chart
- [ ] Improve colors and styling
- [ ] generate descriptions, screenshots
- [ ] Publish to chrome webstore

## UI

<https://app.visily.ai/projects/0df74f50-8d40-42cd-a18a-2e853fcc5acd/boards/2155906>
