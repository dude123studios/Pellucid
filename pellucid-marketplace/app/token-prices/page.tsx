"use client";

import { Navigation } from "@/components/navigation";
import SimpleTokenPriceChart from "@/components/SimpleTokenPriceChart";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, BarChart3, Activity, Target } from "lucide-react";

export default function TokenPricesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 glass" variant="secondary">
              <BarChart3 className="w-4 h-4 mr-2" />
              AI Alignment Token Economics
            </Badge>
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Token Price Trends
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Track the value of AI alignment data across different categories. 
              Each token represents a unit of high-quality, privacy-preserved AI interaction data.
            </p>
          </div>

          {/* Key Metrics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
            <Card className="glass border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Market Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">$0.22</p>
                  <p className="text-sm text-green-500">+5.2% (24h)</p>
                  <p className="text-xs text-muted-foreground">Average token price</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Total Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">42.5K</p>
                  <p className="text-sm text-blue-500">+12.8% (24h)</p>
                  <p className="text-xs text-muted-foreground">Tokens traded</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Active Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">7</p>
                  <p className="text-sm text-purple-500">All trending</p>
                  <p className="text-xs text-muted-foreground">AI alignment types</p>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Market Cap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-2xl font-bold text-white">$220K</p>
                  <p className="text-sm text-orange-500">+8.1% (24h)</p>
                  <p className="text-xs text-muted-foreground">Based on 1M tokens</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Token Price Chart */}
          <SimpleTokenPriceChart />

          {/* Category Insights */}
          <div className="mt-12">
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Category Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-red-500 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      Harmful Content
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Highest value category due to critical safety importance. 
                      Premium pricing reflects the high demand for harmful content detection data.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: $0.25 | Trend: ↗️ +3.2%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-orange-500 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                      Hallucination
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Steady demand for factual accuracy improvements. 
                      Moderate pricing with consistent trading volume.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: $0.18 | Trend: ↗️ +1.8%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-pink-500 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-pink-500"></div>
                      Bias
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Growing awareness drives increased demand. 
                      Emerging category with strong growth potential.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: $0.22 | Trend: ↗️ +4.1%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-yellow-500 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Reasoning Errors
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Critical for logical AI systems. 
                      Stable pricing with high research interest.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: $0.20 | Trend: ↗️ +2.5%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-green-500 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      Creativity Weakness
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Lower priority category with moderate demand. 
                      Affordable pricing for content generation improvements.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: $0.15 | Trend: ↗️ +0.8%
                    </p>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-cyan-500 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-cyan-500"></div>
                      Alignment Issues
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      Premium category for instruction following. 
                      Highest value due to fundamental AI alignment importance.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Current: $0.30 | Trend: ↗️ +5.7%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Trading Information */}
          <div className="mt-12">
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle>How Token Pricing Works</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold mb-3">Pricing Factors</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Data Quality:</strong> Higher quality data commands premium prices</li>
                      <li>• <strong>Category Demand:</strong> Critical safety categories are more valuable</li>
                      <li>• <strong>Market Supply:</strong> Rare data types have higher prices</li>
                      <li>• <strong>Research Interest:</strong> Active research areas drive demand</li>
                      <li>• <strong>Privacy Level:</strong> Better anonymization increases value</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Trading Benefits</h4>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• <strong>Fair Compensation:</strong> Contributors earn based on data value</li>
                      <li>• <strong>Market Efficiency:</strong> Prices reflect true data worth</li>
                      <li>• <strong>Quality Incentives:</strong> Higher prices encourage better data</li>
                      <li>• <strong>Research Access:</strong> Affordable access to quality datasets</li>
                      <li>• <strong>Transparency:</strong> Open pricing for all participants</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
