"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity, 
  DollarSign,
  Target,
  Users,
  Zap
} from "lucide-react";

interface MarketData {
  id: string;
  categories: string[];
  timestamp: string;
  cost_usd: number;
}

interface MarketOverviewProps {
  data: MarketData[];
}

export default function MarketOverview({ data }: MarketOverviewProps) {
  const marketInsights = useMemo(() => {
    if (data.length === 0) return null;

    // Calculate category performance
    const categoryStats = data.reduce((acc, item) => {
      const category = item.categories[0] || 'Unknown';
      if (!acc[category]) {
        acc[category] = {
          count: 0,
          totalValue: 0,
          prices: []
        };
      }
      acc[category].count++;
      acc[category].totalValue += item.cost_usd;
      acc[category].prices.push(item.cost_usd);
      return acc;
    }, {} as Record<string, { count: number; totalValue: number; prices: number[] }>);

    // Calculate performance metrics
    const categoryPerformance = Object.entries(categoryStats).map(([category, stats]) => {
      const avgPrice = stats.totalValue / stats.count;
      const prices = stats.prices.sort((a, b) => a - b);
      const firstPrice = prices[0];
      const lastPrice = prices[prices.length - 1];
      const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
      
      return {
        category,
        avgPrice,
        changePercent,
        volume: stats.count,
        trend: changePercent > 2 ? 'up' : changePercent < -2 ? 'down' : 'stable'
      };
    }).sort((a, b) => b.avgPrice - a.avgPrice);

    // Overall market stats
    const allPrices = data.map(d => d.cost_usd);
    const currentPrice = allPrices[allPrices.length - 1];
    const previousPrice = allPrices.length > 1 ? allPrices[allPrices.length - 2] : currentPrice;
    const marketChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    const avgPrice = allPrices.reduce((sum, price) => sum + price, 0) / allPrices.length;
    const totalVolume = data.length;
    const uniqueCategories = new Set(data.map(d => d.categories[0])).size;

    return {
      currentPrice,
      marketChange,
      avgPrice,
      totalVolume,
      uniqueCategories,
      categoryPerformance
    };
  }, [data]);

  if (!marketInsights) {
    return (
      <Card className="glass border-0">
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">No market data available</p>
        </CardContent>
      </Card>
    );
  }

  const topGainers = marketInsights.categoryPerformance
    .filter(cat => cat.trend === 'up')
    .slice(0, 3);
  
  const topLosers = marketInsights.categoryPerformance
    .filter(cat => cat.trend === 'down')
    .slice(0, 3);

  return (
    <div className="space-y-6">
      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Price</p>
                <p className="text-2xl font-bold text-white">${marketInsights.currentPrice.toFixed(3)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {marketInsights.marketChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${marketInsights.marketChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {marketInsights.marketChange > 0 ? '+' : ''}{marketInsights.marketChange.toFixed(2)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Price</p>
                <p className="text-2xl font-bold text-white">${marketInsights.avgPrice.toFixed(3)}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Across all categories</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Volume</p>
                <p className="text-2xl font-bold text-white">{marketInsights.totalVolume.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Token transactions</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold text-white">{marketInsights.uniqueCategories}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Active markets</p>
          </CardContent>
        </Card>
      </div>

      {/* Category Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Gainers */}
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <TrendingUp className="h-5 w-5" />
              Top Performing Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topGainers.length > 0 ? (
                topGainers.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center text-sm font-bold text-green-500">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{category.category}</p>
                        <p className="text-sm text-muted-foreground">
                          ${category.avgPrice.toFixed(3)} avg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-green-500 font-medium">
                        +{category.changePercent.toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.volume} trades
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No significant gainers</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Losers */}
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <TrendingDown className="h-5 w-5" />
              Declining Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topLosers.length > 0 ? (
                topLosers.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center text-sm font-bold text-red-500">
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-white">{category.category}</p>
                        <p className="text-sm text-muted-foreground">
                          ${category.avgPrice.toFixed(3)} avg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-red-500 font-medium">
                        {category.changePercent.toFixed(2)}%
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.volume} trades
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No significant losers</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* All Categories Overview */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Category Performance Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {marketInsights.categoryPerformance.map((category) => (
              <div key={category.category} className="p-4 bg-slate-800/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{category.category}</h4>
                  <Badge 
                    variant={category.trend === 'up' ? 'default' : category.trend === 'down' ? 'destructive' : 'secondary'}
                    className="text-xs"
                  >
                    {category.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : category.trend === 'down' ? (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    ) : null}
                    {category.changePercent > 0 ? '+' : ''}{category.changePercent.toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    Avg Price: <span className="text-white font-medium">${category.avgPrice.toFixed(3)}</span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Volume: <span className="text-white font-medium">{category.volume}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
