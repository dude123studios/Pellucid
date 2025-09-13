"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  Activity,
  DollarSign,
  Target
} from "lucide-react";
import { 
  generateSyntheticPriceData, 
  generatePriceTrends, 
  getMarketStats
} from "@/lib/synthetic-price-data";

interface FallbackTokenChartProps {
  className?: string;
}

export default function FallbackTokenChart({ className = "" }: FallbackTokenChartProps) {
  const priceData = generateSyntheticPriceData();
  const priceTrends = generatePriceTrends();
  const marketStats = getMarketStats();

  const formatPrice = (price: number) => `$${price.toFixed(3)}`;
  const formatPercent = (percent: number) => `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Market Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Price</p>
                <p className="text-2xl font-bold text-white">{formatPrice(marketStats.currentPrice)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {marketStats.priceChange > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`text-sm ${marketStats.priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatPercent(marketStats.priceChange)}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Market Cap</p>
                <p className="text-2xl font-bold text-white">${marketStats.marketCap.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">Based on 1M tokens</p>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">24h Volume</p>
                <p className="text-2xl font-bold text-white">{marketStats.volume24h.toLocaleString()}</p>
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
                <p className="text-sm text-muted-foreground">Active Categories</p>
                <p className="text-2xl font-bold text-white">{priceTrends.length}</p>
              </div>
              <Target className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">AI alignment types</p>
          </CardContent>
        </Card>
      </div>

      {/* Simple Price Display */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Token Price Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Current market prices for AI alignment data tokens:
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {priceTrends.map((trend) => (
                <div key={trend.category} className="p-4 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-white">{trend.category}</h4>
                    <Badge 
                      variant={trend.trend === 'up' ? 'default' : trend.trend === 'down' ? 'destructive' : 'secondary'}
                      className="text-xs"
                      style={{ backgroundColor: trend.color }}
                    >
                      {trend.trend === 'up' ? (
                        <TrendingUp className="h-3 w-3 mr-1" />
                      ) : trend.trend === 'down' ? (
                        <TrendingDown className="h-3 w-3 mr-1" />
                      ) : null}
                      {formatPercent(trend.changePercent)}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">
                      Current: <span className="text-white font-medium">{formatPrice(trend.data[trend.data.length - 1].price)}</span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Volume: <span className="text-white font-medium">{trend.data.length}</span>
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Top Gainers and Losers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <TrendingUp className="h-5 w-5" />
              Top Gainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketStats.topGainers.map((trend, index) => (
                <div key={trend.category} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{trend.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(trend.data[trend.data.length - 1].price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-green-500 font-medium">
                      {formatPercent(trend.changePercent)}
                    </p>
                    <TrendingUp className="h-4 w-4 text-green-500 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-0">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <TrendingDown className="h-5 w-5" />
              Top Losers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {marketStats.topLosers.map((trend, index) => (
                <div key={trend.category} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-white">{trend.category}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(trend.data[trend.data.length - 1].price)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-red-500 font-medium">
                      {formatPercent(trend.changePercent)}
                    </p>
                    <TrendingDown className="h-4 w-4 text-red-500 ml-auto" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
