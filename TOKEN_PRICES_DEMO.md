# 🪙 Token Price Trends Demo

## Overview

I've added comprehensive synthetic token price data with colored points and lines for different AI alignment categories. The system tracks price trends over time for:

- **Harmful Content** (Red) - $0.25
- **Hallucination** (Orange) - $0.18  
- **Bias** (Pink) - $0.22
- **Reasoning Errors** (Yellow) - $0.20
- **Creativity Weakness** (Green) - $0.15
- **Alignment Issues** (Cyan) - $0.30
- **Context Failures** (Purple) - $0.16

## Features Added

### 1. Synthetic Price Data (`lib/synthetic-price-data.ts`)
- **30 days of realistic price data** with volatility and trends
- **Category-specific pricing** based on market demand
- **Volume data** for trading insights
- **Trend analysis** with percentage changes

### 2. Interactive Token Price Chart (`components/TokenPriceChart.tsx`)
- **Multiple chart types**: Line, Scatter, Area charts
- **Time range selection**: 7d, 30d, 90d views
- **Category filtering**: Click to show/hide specific categories
- **Market overview cards**: Current price, market cap, volume, active categories
- **Top gainers/losers**: Performance rankings
- **Custom tooltips**: Detailed price information on hover

### 3. Dedicated Token Prices Page (`app/token-prices/page.tsx`)
- **Comprehensive market overview** with key metrics
- **Category insights** explaining pricing factors
- **Trading information** about how pricing works
- **Professional market analysis** layout

### 4. Marketplace Integration
- **Added to marketplace page** below existing price chart
- **Navigation link** added to main menu
- **Seamless integration** with existing design

## Visual Features

### Chart Types
1. **Line Chart**: Connected points showing price trends over time
2. **Scatter Chart**: Individual data points for detailed analysis  
3. **Area Chart**: Filled areas showing cumulative trends

### Interactive Elements
- **Category badges**: Click to toggle visibility
- **Time range buttons**: Switch between 7d, 30d, 90d views
- **Chart type selector**: Switch between line, scatter, area
- **Hover tooltips**: Detailed price information
- **Trend indicators**: Up/down arrows with percentages

### Color Coding
- **Consistent colors** across all components
- **Category-specific colors** for easy identification
- **Trend indicators** with green/red for gains/losses
- **Professional dark theme** with glass morphism

## Data Characteristics

### Price Ranges
- **Harmful Content**: $0.20 - $0.30 (highest value)
- **Alignment Issues**: $0.25 - $0.35 (premium category)
- **Bias**: $0.18 - $0.26 (growing demand)
- **Reasoning Errors**: $0.16 - $0.24 (stable)
- **Hallucination**: $0.14 - $0.22 (moderate)
- **Context Failures**: $0.12 - $0.20 (emerging)
- **Creativity Weakness**: $0.10 - $0.18 (affordable)

### Market Dynamics
- **Daily volatility**: ±5% price fluctuations
- **Weekly cycles**: Natural market rhythms
- **Category correlations**: Related categories move together
- **Volume patterns**: Higher volume during price movements

## Usage

### View Token Prices
1. **Visit**: http://localhost:3000/token-prices
2. **Or**: Go to Marketplace → Token Price Trends section
3. **Navigate**: Use the "Token Prices" link in the main menu

### Interact with Charts
1. **Select categories**: Click category badges to show/hide
2. **Change time range**: Use 7d, 30d, 90d buttons
3. **Switch chart types**: Use line, scatter, area buttons
4. **Hover for details**: Mouse over points for price info

### Market Analysis
- **View top gainers**: See which categories are performing best
- **Check top losers**: Identify declining categories
- **Monitor trends**: Track price movements over time
- **Compare categories**: See relative performance

## Technical Implementation

### Data Generation
```typescript
// Realistic price simulation with:
- Base prices for each category
- Daily volatility (±5%)
- Weekly trend cycles
- Random market noise
- Volume correlation
```

### Chart Components
```typescript
// Recharts integration with:
- ResponsiveContainer for mobile
- Custom tooltips with styling
- Multiple chart types
- Interactive legends
- Professional theming
```

### State Management
```typescript
// React hooks for:
- Selected categories
- Chart type selection
- Time range filtering
- Data memoization
- Performance optimization
```

## Market Insights

### Pricing Factors
1. **Data Quality**: Higher quality = higher price
2. **Category Demand**: Safety categories are premium
3. **Market Supply**: Rare data types cost more
4. **Research Interest**: Active areas drive demand
5. **Privacy Level**: Better anonymization increases value

### Trading Benefits
1. **Fair Compensation**: Contributors earn based on value
2. **Market Efficiency**: Prices reflect true worth
3. **Quality Incentives**: Higher prices encourage better data
4. **Research Access**: Affordable access to quality datasets
5. **Transparency**: Open pricing for all participants

## 🎯 Ready to Use!

The token price trends system is now fully integrated and ready for use:

- ✅ **Synthetic data** with realistic market dynamics
- ✅ **Interactive charts** with multiple visualization types
- ✅ **Professional UI** with dark theme and glass morphism
- ✅ **Market analysis** with insights and explanations
- ✅ **Navigation integration** for easy access
- ✅ **Responsive design** for all devices

**Visit http://localhost:3000/token-prices to see it in action!** 🚀✨
