"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  BarChart3, 
  Settings, 
  Database, 
  MessageSquare,
  Loader2,
  AlertCircle,
  Bot,
  Sparkles,
  Zap,
  Eye
} from "lucide-react";

import dynamic from 'next/dynamic';

const DataVisualization3D = dynamic(() => import('./DataVisualization3D').then(mod => ({ default: mod.DataVisualization3D })), {
  ssr: false,
  loading: () => <div className="h-[600px] w-full flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
});
import { VisualizationControls } from './VisualizationControls';
import { StatsDashboard } from './StatsDashboard';
import { ChatInterface } from './ChatInterface';
import { FilterOptions, DataPoint, DatasetVisualization } from '@/lib/dataset';
import { generateMockDataset } from '@/lib/mockData';

interface DataVisualizationPageProps {
  dataIds?: string[];
  visualizationType?: "submission" | "dataset";
  title?: string;
  className?: string;
}

export default function DataVisualizationPage({ 
  dataIds = [], 
  visualizationType = "submission",
  title = "Data Visualization",
  className = "" 
}: DataVisualizationPageProps) {
  const [selectedPoint, setSelectedPoint] = useState<DataPoint | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    categories: [],
    clusterIds: [],
    pointSize: 1,
    showClusters: true,
    showLabels: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("visualization");

  // Generate mock data (in real app, this would come from API)
  const dataset = useMemo(() => generateMockDataset(), []);

  const availableCategories = useMemo(() => {
    return Object.keys(dataset.stats.categoryDistribution);
  }, [dataset.stats.categoryDistribution]);

  const handlePointClick = (point: DataPoint) => {
    setSelectedPoint(point);
  };

  const handleResetFilters = () => {
    setFilters({
      categories: [],
      clusterIds: [],
      pointSize: 1,
      showClusters: true,
      showLabels: false
    });
    setSelectedPoint(null);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="glass border-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            {title}
          </CardTitle>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="outline" className="flex items-center gap-1">
              <Database className="h-3 w-3" />
              {dataset.stats.totalObjects} data points
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              {dataset.clusters.length} clusters
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Settings className="h-3 w-3" />
              {Object.keys(dataset.stats.categoryDistribution).length} categories
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Visualization Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visualization" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            3D Visualization
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Chat with Data
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Controls
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visualization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 3D Visualization */}
            <div className="lg:col-span-3">
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle>3D Data Visualization</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-[600px] w-full">
                    <DataVisualization3D
                      points={dataset.points}
                      clusters={dataset.clusters}
                      filters={filters}
                      onPointClick={handlePointClick}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Selected Point Info */}
            <div className="space-y-4">
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle>Selected Point</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedPoint ? (
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium">Category:</span>
                        <span className="ml-2 capitalize">
                          {selectedPoint.category.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">Position:</span>
                        <div className="text-sm text-muted-foreground">
                          X: {selectedPoint.x.toFixed(2)}<br />
                          Y: {selectedPoint.y.toFixed(2)}<br />
                          Z: {selectedPoint.z.toFixed(2)}
                        </div>
                      </div>
                      {selectedPoint.label && (
                        <div>
                          <span className="font-medium">Label:</span>
                          <div className="text-sm text-muted-foreground">
                            {selectedPoint.label}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      Click on a data point to see details
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="glass border-0">
                <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total Points:</span>
                      <span className="font-medium">{dataset.stats.totalObjects}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Categories:</span>
                      <span className="font-medium">{Object.keys(dataset.stats.categoryDistribution).length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clusters:</span>
                      <span className="font-medium">{dataset.clusters.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <StatsDashboard 
            stats={dataset.stats} 
            clusters={dataset.clusters} 
          />
        </TabsContent>

        <TabsContent value="chat" className="space-y-4">
          <div className="h-[600px]">
            <ChatInterface 
              datasetId={dataset.datasetId || 'mock_dataset_1'}
              datasetName="AI Safety Dataset"
            />
          </div>
        </TabsContent>

        <TabsContent value="controls" className="space-y-4">
          <div className="max-w-md mx-auto">
            <VisualizationControls
              filters={filters}
              onFiltersChange={setFilters}
              categoryDistribution={dataset.stats.categoryDistribution}
              availableCategories={availableCategories}
              onReset={handleResetFilters}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
