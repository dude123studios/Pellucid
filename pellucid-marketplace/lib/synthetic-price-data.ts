// Synthetic token price data for AI alignment categories over time

export interface PriceDataPoint {
  date: string;
  timestamp: number;
  harm: number;
  hallucination: number;
  bias: number;
  reasoning: number;
  creativity: number;
  alignment: number;
  context: number;
  total: number;
}

export interface PriceTrend {
  category: string;
  color: string;
  data: Array<{
    date: string;
    price: number;
    volume: number;
  }>;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
}

// Generate synthetic price data for the last 30 days
export function generateSyntheticPriceData(): PriceDataPoint[] {
  const data: PriceDataPoint[] = [];
  const now = new Date();
  
  // Base prices for each category (in USD per token)
  const basePrices = {
    harm: 0.25,
    hallucination: 0.18,
    bias: 0.22,
    reasoning: 0.20,
    creativity: 0.15,
    alignment: 0.30,
    context: 0.16
  };

  // Generate 30 days of data
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    // Add some realistic volatility and trends
    const dayVariation = (Math.random() - 0.5) * 0.1; // ±5% daily variation
    const trendFactor = Math.sin((29 - i) / 30 * Math.PI * 2) * 0.05; // Weekly cycle
    
    const harm = basePrices.harm * (1 + dayVariation + trendFactor + (Math.random() - 0.5) * 0.02);
    const hallucination = basePrices.hallucination * (1 + dayVariation + trendFactor * 0.8 + (Math.random() - 0.5) * 0.03);
    const bias = basePrices.bias * (1 + dayVariation + trendFactor * 1.2 + (Math.random() - 0.5) * 0.025);
    const reasoning = basePrices.reasoning * (1 + dayVariation + trendFactor * 0.6 + (Math.random() - 0.5) * 0.02);
    const creativity = basePrices.creativity * (1 + dayVariation + trendFactor * 0.4 + (Math.random() - 0.5) * 0.03);
    const alignment = basePrices.alignment * (1 + dayVariation + trendFactor * 1.5 + (Math.random() - 0.5) * 0.015);
    const context = basePrices.context * (1 + dayVariation + trendFactor * 0.7 + (Math.random() - 0.5) * 0.025);
    
    const total = (harm + hallucination + bias + reasoning + creativity + alignment + context) / 7;
    
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      harm: Math.round(harm * 1000) / 1000,
      hallucination: Math.round(hallucination * 1000) / 1000,
      bias: Math.round(bias * 1000) / 1000,
      reasoning: Math.round(reasoning * 1000) / 1000,
      creativity: Math.round(creativity * 1000) / 1000,
      alignment: Math.round(alignment * 1000) / 1000,
      context: Math.round(context * 1000) / 1000,
      total: Math.round(total * 1000) / 1000
    });
  }
  
  return data;
}

// Generate price trends for each category
export function generatePriceTrends(): PriceTrend[] {
  const priceData = generateSyntheticPriceData();
  
  const categories = [
    { key: 'harm', name: 'Harmful Content', color: '#ef4444' },
    { key: 'hallucination', name: 'Hallucination', color: '#f97316' },
    { key: 'bias', name: 'Bias', color: '#ec4899' },
    { key: 'reasoning', name: 'Reasoning Errors', color: '#eab308' },
    { key: 'creativity', name: 'Creativity Weakness', color: '#22c55e' },
    { key: 'alignment', name: 'Alignment Issues', color: '#06b6d4' },
    { key: 'context', name: 'Context Failures', color: '#8b5cf6' }
  ];
  
  return categories.map(category => {
    const data = priceData.map(point => ({
      date: point.date,
      price: point[category.key as keyof PriceDataPoint] as number,
      volume: Math.random() * 1000 + 500 // Synthetic volume data
    }));
    
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
    
    let trend: 'up' | 'down' | 'stable' = 'stable';
    if (changePercent > 2) trend = 'up';
    else if (changePercent < -2) trend = 'down';
    
    return {
      category: category.name,
      color: category.color,
      data,
      trend,
      changePercent: Math.round(changePercent * 100) / 100
    };
  });
}

// Get market statistics
export function getMarketStats() {
  const priceData = generateSyntheticPriceData();
  const trends = generatePriceTrends();
  
  const latest = priceData[priceData.length - 1];
  const previous = priceData[priceData.length - 2];
  
  const totalChange = ((latest.total - previous.total) / previous.total) * 100;
  
  const topGainers = trends
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 3);
  
  const topLosers = trends
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 3);
  
  return {
    currentPrice: latest.total,
    priceChange: Math.round(totalChange * 100) / 100,
    marketCap: Math.round(latest.total * 1000000 * 100) / 100, // Assuming 1M tokens
    volume24h: Math.round(Math.random() * 50000 + 25000),
    topGainers,
    topLosers,
    trends
  };
}

// Category colors for consistency
export const categoryColors = {
  'Harmful Content': '#ef4444',
  'Hallucination': '#f97316', 
  'Bias': '#ec4899',
  'Reasoning Errors': '#eab308',
  'Creativity Weakness': '#22c55e',
  'Alignment Issues': '#06b6d4',
  'Context Failures': '#8b5cf6'
};

// Sample data for quick testing
export const samplePriceData = generateSyntheticPriceData();
export const samplePriceTrends = generatePriceTrends();
export const sampleMarketStats = getMarketStats();
