# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LibreView Glucose Monitor is a dual-purpose TypeScript project that provides glucose monitoring functionality:
1. **Chrome Extension**: Real-time glucose monitoring with dynamic browser icons and interactive popup
2. **CLI Application**: Terminal-based glucose monitoring using Ink React components

The project integrates with the LibreView API (FreeStyle Libre CGM data) to fetch and display glucose trends with sophisticated projection algorithms.

## Development Commands

### Building
```bash
# Build Chrome extension for production
npm run build:extension

# Build extension with development mode and file watching
npm run build:extension:dev

# Run CLI version (terminal-based glucose monitor)
npm start
```

### Code Quality
```bash
# Lint TypeScript/TSX files
npm run lint

# Auto-fix linting issues
npm run lint:fix
```

## Architecture

### Dual Application Structure
The project maintains two separate applications sharing common utilities:

**Chrome Extension** (`src/extension/`):
- `background/background.ts` - Service worker handling API calls, data persistence, alarm scheduling, and dynamic icon updates
- `popup/popup.tsx` - React-based popup interface with Recharts visualization and 60-minute glucose projections
- `utils/storage.ts` - Chrome Storage API wrapper for secure credential management
- `utils/iconGenerator.ts` - Dynamic browser icon generation with glucose-based color coding

**CLI Application** (`src/`):
- `index.tsx` - Entry point using Ink React components for terminal rendering
- `components/App.tsx` - Main CLI interface
- `utils/` - Shared utilities for API calls, display formatting, and chart generation

### Key Technical Decisions

**Glucose Projection Algorithm**: Uses polynomial regression (regression library) with degree 2-3 curves to predict glucose trends up to 60 minutes ahead. The algorithm:
- Analyzes last 45 minutes of data (up to 15 points)
- Applies conservative bounds (max 30mg/dL change per 5-minute interval)  
- Uses adaptive polynomial degree based on available data points
- Provides more accurate curve fitting than linear regression

**Chrome Extension Persistence**: Uses Chrome Alarms API instead of setInterval for reliable background data fetching every minute, ensuring persistence across browser sessions.

**Icon Generation**: Real-time browser icon updates using OffscreenCanvas with glucose color zones:
- Green (100-155): Normal range
- Orange (156-189): Elevated  
- Red (70-99, 190-249): Low/High
- Dark Red (<70, 250+): Very Low/Very High

### Data Flow
1. Background service worker authenticates with LibreView API using stored credentials
2. Fetches glucose data every minute via Chrome alarms
3. Updates browser icon with current glucose value and appropriate color
4. Popup interface displays interactive Recharts visualization with actual + projected data
5. Sequential animation: actual glucose line renders first (1.5s), then projection line (1s)

## Key Dependencies

- **recharts@2.8.0**: Chart visualization (compatible with React 17)
- **regression**: Polynomial curve fitting for glucose projections  
- **axios**: HTTP client for LibreView API integration
- **webpack**: Extension bundling with TypeScript support

## Development Notes

### Extension Structure
- `extension/manifest.json` - Chrome Extension Manifest V3 configuration
- `extension/popup/popup.html` - Static HTML shell for React popup
- `dist/` - Built extension files ready for Chrome installation

### TypeScript Configuration
- Uses separate `tsconfig.extension.json` for extension builds
- Chrome types via `@types/chrome`
- React 17 compatibility maintained throughout

### API Integration
LibreView API endpoints:
- Authentication: POST `/llu/auth/login`  
- Glucose data: GET `/llu/connections/{patientId}/graph`
- Automatic token refresh on expiry

### Glucose Color Zones
The application implements medical glucose ranges:
- < 70 mg/dL: Very Low (Dark Red)
- 70-99 mg/dL: Low (Red)  
- 100-155 mg/dL: Normal (Green)
- 156-189 mg/dL: Elevated (Orange)
- 190-249 mg/dL: High (Red)
- 250+ mg/dL: Very High (Dark Red)