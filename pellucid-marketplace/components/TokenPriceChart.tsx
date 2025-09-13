"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Area,
  AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3, 
  Activity,
  DollarSign,
  Target,
  AlertTriangle
} from "lucide-react";
import { 
  generateSyntheticPriceData, 
  generatePriceTrends, 
  getMarketStats,
  categoryColors,
  type PriceDataPoint,
  type PriceTrend 
} from "@/lib/synthetic-price-data";

interface TokenPriceChartProps {
  className?: string;
}

export default function TokenPriceChart({ className = "" }: TokenPriceChartProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([
    'Harmful Content', 'Hallucination', 'Bias'
  ]);
  const [chartType, setChartType] = useState<'line' | 'scatter' | 'area'>('line');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const priceData = useMemo(() => generateSyntheticPriceData(), []);
  const priceTrends = useMemo(() => generatePriceTrends(), []);
  const marketStats = useMemo(() => getMarketStats(), []);

  const filteredData = useMemo(() => {
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    return priceData.slice(-days);
  }, [priceData, timeRange]);

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatPrice = (price: number) => `$${price.toFixed(3)}`;
  const formatPercent = (percent: number) => `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/95 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-300">{entry.dataKey}:</span>
              <span className="text-white font-medium">{formatPrice(entry.value)}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

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

      {/* Main Chart */}
      <Card className="glass border-0">
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Token Price Trends
            </CardTitle>
            
            <div className="flex flex-wrap gap-2">
              {/* Time Range Selector */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                {(['7d', '30d', '90d'] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className="h-8 px-3"
                  >
                    {range}
                  </Button>
                ))}
              </div>

              {/* Chart Type Selector */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                {(['line', 'scatter', 'area'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={chartType === type ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setChartType(type)}
                    className="h-8 px-3 capitalize"
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Category Filters */}
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-3">Select Categories:</p>
            <div className="flex flex-wrap gap-2">
              {priceTrends.map((trend) => (
                <Badge
                  key={trend.category}
                  variant={selectedCategories.includes(trend.category) ? "default" : "outline"}
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  style={{ 
                    backgroundColor: selectedCategories.includes(trend.category) ? trend.color : undefined,
                    color: selectedCategories.includes(trend.category) ? "white" : undefined
                  }}
                  onClick={() => toggleCategory(trend.category)}
                >
                  <div className="flex items-center gap-1">
                    {getTrendIcon(trend.trend)}
                    {trend.category}
                    <span className="text-xs opacity-75">
                      {formatPercent(trend.changePercent)}
                    </span>
                  </div>
                </Badge>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' ? (
                <LineChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={formatPrice}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedCategories.map((category) => {
                    const trend = priceTrends.find(t => t.category === category);
                    if (!trend) return null;
                    
                    return (
                      <Line
                        key={category}
                        type="monotone"
                        dataKey={category.toLowerCase().replace(/\s+/g, '')}
                        stroke={trend.color}
                        strokeWidth={2}
                        dot={{ fill: trend.color, strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: trend.color, strokeWidth: 2 }}
                        name={category}
                      />
                    );
                  })}
                </LineChart>
              ) : chartType === 'scatter' ? (
                <ScatterChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={formatPrice}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedCategories.map((category) => {
                    const trend = priceTrends.find(t => t.category === category);
                    if (!trend) return null;
                    
                    return (
                      <Scatter
                        key={category}
                        dataKey={category.toLowerCase().replace(/\s+/g, '')}
                        fill={trend.color}
                        name={category}
                      />
                    );
                  })}
                </ScatterChart>
              ) : (
                <AreaChart data={filteredData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    fontSize={12}
                    tickFormatter={formatPrice}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedCategories.map((category) => {
                    const trend = priceTrends.find(t => t.category === category);
                    if (!trend) return null;
                    
                    return (
                      <Area
                        key={category}
                        type="monotone"
                        dataKey={category.toLowerCase().replace(/\s+/g, '')}
                        stackId="1"
                        stroke={trend.color}
                        fill={trend.color}
                        fillOpacity={0.3}
                        name={category}
                      />
                    );
                  })}
                </AreaChart>
              )}
            </ResponsiveContainer>
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
