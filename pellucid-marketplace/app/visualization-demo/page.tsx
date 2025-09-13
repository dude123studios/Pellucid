"use client";

import { Navigation } from "@/components/navigation";
import DataVisualizationPage from "@/components/DataVisualizationPage";

export default function VisualizationDemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Data Visualization Demo
            </h1>
            <p className="text-xl text-muted-foreground">
              Interactive 3D visualization with AI-powered chatbot assistant
            </p>
          </div>
          
          <DataVisualizationPage
            dataIds={[]} // Empty array since we're using demo data
            visualizationType="submission"
            title="Demo Data Visualization"
          />
        </div>
      </div>
    </div>
  );
}
