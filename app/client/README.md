# 🖥️ Forex Trading Dashboard (Client)

A React-based frontend for the Forex Trading Dashboard, providing real-time price charts, technical analysis, and market headlines.

## 📁 Directory Structure

```
client/
├── public/
│   ├── favicon.ico
│   ├── index.html          # HTML template
│   ├── manifest.json       # PWA manifest
│   └── robots.txt
├── src/
│   ├── app/
│   │   ├── api.js          # API client (Axios endpoints)
│   │   ├── chart.js        # Chart configuration utilities
│   │   └── data.js         # Static data (pairs, timeframes)
│   ├── components/
│   │   ├── AccountSummary.jsx   # Account balance display
│   │   ├── Button.jsx           # Reusable button component
│   │   ├── Footer.jsx           # Page footer
│   │   ├── Headline.jsx         # Single headline item
│   │   ├── Headlines.jsx        # Headlines list
│   │   ├── NavbarLink.jsx       # Navigation link
│   │   ├── NavigationBar.jsx    # Top navigation bar
│   │   ├── PriceChart.jsx       # Plotly candlestick chart
│   │   ├── Progress.jsx         # Loading progress indicator
│   │   ├── Select.jsx           # Dropdown select component
│   │   ├── Technicals.jsx       # Technical analysis display
│   │   └── TitleHead.jsx        # Section title component
│   ├── pages/
│   │   ├── Dashboard.jsx        # Main trading dashboard
│   │   └── Home.jsx             # Landing page with headlines
│   ├── App.jsx             # Root component with routing
│   ├── index.css           # Global styles
│   └── index.js            # Application entry point
├── env.example             # Environment variables template
├── package.json            # npm dependencies
├── package-lock.json
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm (comes with Node.js)
- Backend server running at `http://localhost:8000`

### Installation

```bash
# Navigate to client directory
cd app/client

# Install dependencies
npm install

# Copy environment file
cp env.example .env
```

### Running the Client

```bash
# Development mode with hot reload
npm start

# Or from project root
./scripts/start_client.sh
```

✅ Client runs at: **http://localhost:3000**

### Production Build

```bash
# Create optimized production build
npm run build

# The build folder is ready for deployment
```

## ⚙️ Configuration

### Environment Variables (`.env`)

```bash
# API endpoint URL
REACT_APP_API_URL=http://localhost:8000/api
```

Schedule
## 🧭 Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `Home` | Landing page with market headlines and account summary |
| `/dashboard` | `Dashboard` | Trading dashboard with charts and technicals |

## 🎨 Components

### Pages

#### `Home.jsx`
- Displays Bloomberg forex headlines
- Shows account summary (balance, margin, P/L)
- Provides navigation to dashboard

#### `Dashboard.jsx`
- Currency pair and timeframe selectors
- Technical analysis indicators (support/resistance, moving averages)
- Interactive candlestick price chart
- Adjustable candle count

### Core Components

#### `PriceChart.jsx`
Interactive candlestick chart powered by Plotly.js:
- OHLC candlesticks
- Volume bars (optional)
- Zoom and pan functionality
- Responsive sizing

#### `Technicals.jsx`
Displays technical analysis data:
- Support/Resistance levels
- Moving average indicators
- Summary signals (Buy/Sell/Neutral)

#### `AccountSummary.jsx`
Shows account information:
- Account balance
- Margin used
- Unrealized P/L
- Free margin

## 📡 API Integration

### API Client (`src/app/api.js`)

The API client provides methods for all backend endpoints:

```javascript
import endPoints from './app/api';

// Available methods
await endPoints.account();           // GET /api/account
await endPoints.headlines();         // GET /api/headlines
await endPoints.options();           // GET /api/options
await endPoints.technicals(pair, tf); // GET /api/technicals/{pair}/{tf}
await endPoints.prices(pair, gran, count); // GET /api/prices/{pair}/{gran}/{count}
```

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Run tests
npm test

# Create production build
npm run build

# Eject from Create React App (irreversible)
npm run eject
```

### Adding New Components

1. Create component in `src/components/`:
   ```jsx
   // src/components/MyComponent.jsx
   function MyComponent({ prop1, prop2 }) {
     return <div>...</div>;
   }
   export default MyComponent;
   ```

2. Import and use in pages:
   ```jsx
   import MyComponent from '../components/MyComponent';
   ```

### Adding New Pages

1. Create page in `src/pages/`:
   ```jsx
   // src/pages/MyPage.jsx
   function MyPage() {
     return <div>...</div>;
   }
   export default MyPage;
   ```

2. Add route in `App.jsx`:
   ```jsx
   <Route path="/mypage" element={<MyPage />}/>
   ```

### Styling

The project uses vanilla CSS with a global stylesheet (`index.css`). Key styling patterns:
- Container-based layout
- Flexbox for component arrangement
- CSS variables for theming (optional)

## 🧪 Testing

```bash
# Run tests in watch mode
npm test

# Run tests with coverage
npm test -- --coverage
```

## 📱 Responsive Design

The dashboard is optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (< 768px)

Charts automatically resize based on viewport.

## 🔧 Troubleshooting

### Common Issues

**API Connection Failed**
- Ensure backend server is running at the correct URL
- Check `REACT_APP_API_URL` in `.env`
- Verify CORS settings on backend

**Charts Not Loading**
- Check browser console for errors
- Ensure price data is returned from API
- Verify Plotly.js is properly installed

**Blank Page After Build**
- Check `homepage` field in `package.json`
- Ensure correct base URL for deployment

## 📄 License

MIT License - See main project LICENSE file for details.
