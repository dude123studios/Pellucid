'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FilterOptions, CategoryDistribution } from '@/lib/dataset';
import { categoryColors } from '@/lib/mockData';
import { Eye, EyeOff, Tag, X, RotateCcw } from 'lucide-react';

interface VisualizationControlsProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  categoryDistribution: CategoryDistribution;
  availableCategories: string[];
  onReset: () => void;
}

export function VisualizationControls({
  filters,
  onFiltersChange,
  categoryDistribution,
  availableCategories,
  onReset
}: VisualizationControlsProps) {
  
  const toggleCategory = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({
      ...filters,
      categories: newCategories
    });
  };

  const toggleClusterVisibility = () => {
    onFiltersChange({
      ...filters,
      showClusters: !filters.showClusters
    });
  };

  const toggleLabels = () => {
    onFiltersChange({
      ...filters,
      showLabels: !filters.showLabels
    });
  };

  const handlePointSizeChange = (value: number[]) => {
    onFiltersChange({
      ...filters,
      pointSize: value[0]
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Category Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {availableCategories.map((category) => {
              const count = categoryDistribution[category] || 0;
              const isSelected = filters.categories.length === 0 || filters.categories.includes(category);
              const color = categoryColors[category] || categoryColors.default;
              
              return (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-white"
                      style={{ backgroundColor: color }}
                    />
                    <span className="capitalize">{category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{count}</Badge>
                    <Button
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                    >
                      {isSelected ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Display Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Show Clusters</span>
            <Button
              variant={filters.showClusters ? "default" : "outline"}
              size="sm"
              onClick={toggleClusterVisibility}
            >
              {filters.showClusters ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Show Labels</span>
            <Button
              variant={filters.showLabels ? "default" : "outline"}
              size="sm"
              onClick={toggleLabels}
            >
              {filters.showLabels ? <Tag className="h-4 w-4" /> : <X className="h-4 w-4" />}
            </Button>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Point Size</label>
            <Slider
              value={[filters.pointSize]}
              onValueChange={handlePointSizeChange}
              max={2}
              min={0.1}
              step={0.1}
              className="w-full"
            />
            <div className="text-xs text-gray-500 text-center">
              {filters.pointSize.toFixed(1)}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Button 
            variant="outline" 
            onClick={onReset}
            className="w-full"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset Filters
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
