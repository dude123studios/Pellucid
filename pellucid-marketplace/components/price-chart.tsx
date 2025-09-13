"use client";

import { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, TrendingDown, BarChart3, Activity } from "lucide-react";

interface ConversationRecord {
  id: string;
  categories: string[];
  timestamp: string;
  cost_usd: number;
}

export default function PriceOverTimeChart({ data }: { data: ConversationRecord[] }) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Unique category list for dropdown
  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    data.forEach((item) => item.categories.forEach((cat) => set.add(cat)));
    return Array.from(set).sort();
  }, [data]);

  // Calculate market statistics
  const marketStats = useMemo(() => {
    if (data.length === 0) return null;

    const prices = data.map(d => d.cost_usd);
    const currentPrice = prices[prices.length - 1];
    const previousPrice = prices.length > 1 ? prices[prices.length - 2] : currentPrice;
    const priceChange = ((currentPrice - previousPrice) / previousPrice) * 100;
    
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const volume = data.length;

    return {
      currentPrice,
      priceChange,
      avgPrice,
      minPrice,
      maxPrice,
      volume
    };
  }, [data]);

  // Apply filtering BEFORE preparing chart data
  const filteredData = useMemo(() => {
    const relevant = selectedCategory === "all"
      ? data
      : data.filter((d) => d.categories.includes(selectedCategory));

    return relevant
      .map((item) => ({ ...item, time: new Date(item.timestamp).getTime() }))
      .sort((a, b) => a.time - b.time);
  }, [data, selectedCategory]);

  return (
    <Card className="glass border-0 shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Market Price Trends
          </CardTitle>
          {marketStats && (
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1">
                <span className="text-sm text-muted-foreground">Current:</span>
                <span className="font-semibold">${marketStats.currentPrice.toFixed(3)}</span>
                {marketStats.priceChange > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className={`text-sm ${marketStats.priceChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {marketStats.priceChange > 0 ? '+' : ''}{marketStats.priceChange.toFixed(2)}%
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">{marketStats.volume} trades</span>
              </div>
            </div>
          )}
        </div>
        <Select onValueChange={(v) => setSelectedCategory(v)}>
          <SelectTrigger className="w-[200px] mt-4 sm:mt-0">
            <SelectValue placeholder="Filter by Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categoryOptions.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>

      <CardContent className="h-[28rem]">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                     <XAxis
                       dataKey="time"
                       tickFormatter={(time) =>
                         new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                       }
                       stroke="#FFFFFF"
                       tick={{ fill: '#FFFFFF' }}
                       className="text-sm"
                     />
                     <YAxis 
                       tickFormatter={(value) => `$${value.toFixed(3)}`}
                       stroke="#FFFFFF"
                       tick={{ fill: '#FFFFFF' }}
                       className="text-sm"
                     />
              <Tooltip
                labelFormatter={(time) =>
                  new Date(time).toLocaleString([], { dateStyle: "short", timeStyle: "short" })
                }
                formatter={(value, name, props) => {
                  const category = props.payload?.categories?.[0] || 'Unknown';
                  return [
                    `$${Number(value).toFixed(4)}`,
                    `${category} Token Price`
                  ];
                }}
                contentStyle={{
                  backgroundColor: 'rgba(15, 23, 42, 0.95)',
                  border: '1px solid rgba(71, 85, 105, 0.3)',
                  borderRadius: '8px',
                  color: 'white'
                }}
                labelStyle={{ color: 'white' }}
              />
              <Line
                type="monotone"
                dataKey="cost_usd"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "hsl(var(--primary))", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground text-center">
              No market data available for this category.
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Market Statistics */}
      {marketStats && (
        <div className="px-6 pb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Average Price</p>
              <p className="text-lg font-semibold">${marketStats.avgPrice.toFixed(3)}</p>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-muted-foreground">24h High</p>
              <p className="text-lg font-semibold text-green-500">${marketStats.maxPrice.toFixed(3)}</p>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-muted-foreground">24h Low</p>
              <p className="text-lg font-semibold text-red-500">${marketStats.minPrice.toFixed(3)}</p>
            </div>
            <div className="text-center p-3 bg-slate-800/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Total Volume</p>
              <p className="text-lg font-semibold">{marketStats.volume.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
