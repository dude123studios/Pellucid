// Demo data for visualization components

export interface DataPoint {
  id: string;
  x: number;
  y: number;
  z: number;
  category: string;
  label: string;
  payload: string;
  sanitizedPayload?: string;
  clusterId?: number;
}

export interface Cluster {
  clusterId: number;
  category: string;
  count: number;
  center: { x: number; y: number; z: number };
  dominantCategory: string;
  categoryDistribution: Record<string, number>;
}

export interface VisualizationStats {
  totalObjects: number;
  categoryDistribution: Record<string, number>;
  totalClusters: number;
  averageClusterSize: number;
  embeddingDimensions: number;
  processingTimeMs: number;
}

export interface VisualizationData {
  dataId: string;
  points: DataPoint[];
  clusters: Cluster[];
  stats: VisualizationStats;
  visualization_type: string;
  generatedAt: string;
}

// Color palette for categories - using app's color scheme
export const categoryColors: Record<string, string> = {
  "Harmful Content": "hsl(var(--destructive))", // Red for harmful content
  "Hallucination": "hsl(var(--chart-1))", // Blue for hallucination
  "Reasoning Errors": "hsl(var(--chart-2))", // Green for reasoning errors
  "Creativity Weakness": "hsl(var(--chart-3))", // Yellow for creativity
  "Alignment Issues": "hsl(var(--chart-4))", // Purple for alignment
  "Context Failures": "hsl(var(--chart-5))", // Orange for context
  "Bias": "#ec4899", // Pink for bias
  "Misinformation": "#f43f5e", // Red-pink for misinformation
  "Good Response": "#10b981", // Green for good responses
  "Unknown": "hsl(var(--muted-foreground))" // Muted for unknown
};

// Generate demo data points
export function generateDemoDataPoints(count: number = 50): DataPoint[] {
  const categories = Object.keys(categoryColors);
  const points: DataPoint[] = [];

  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const x = (Math.random() - 0.5) * 10;
    const y = (Math.random() - 0.5) * 10;
    const z = (Math.random() - 0.5) * 10;
    
    points.push({
      id: `demo_point_${i}`,
      x,
      y,
      z,
      category,
      label: `Sample ${i + 1}`,
      payload: `This is a sample data point ${i + 1} demonstrating ${category.toLowerCase()} in AI responses.`,
      sanitizedPayload: `This is a sample data point ${i + 1} demonstrating <CATEGORY:${category.toUpperCase()}> in AI responses.`,
      clusterId: Math.floor(Math.random() * 5)
    });
  }

  return points;
}

// Generate demo clusters
export function generateDemoClusters(points: DataPoint[]): Cluster[] {
  const clusters: Cluster[] = [];
  const clusterGroups = points.reduce((acc, point) => {
    if (!acc[point.clusterId!]) {
      acc[point.clusterId!] = [];
    }
    acc[point.clusterId!].push(point);
    return acc;
  }, {} as Record<number, DataPoint[]>);

  Object.entries(clusterGroups).forEach(([clusterId, clusterPoints]) => {
    const categoryDist: Record<string, number> = {};
    clusterPoints.forEach(point => {
      categoryDist[point.category] = (categoryDist[point.category] || 0) + 1;
    });

    const dominantCategory = Object.entries(categoryDist).reduce((a, b) => 
      categoryDist[a[0]] > categoryDist[b[0]] ? a : b
    )[0];

    const centerX = clusterPoints.reduce((sum, p) => sum + p.x, 0) / clusterPoints.length;
    const centerY = clusterPoints.reduce((sum, p) => sum + p.y, 0) / clusterPoints.length;
    const centerZ = clusterPoints.reduce((sum, p) => sum + p.z, 0) / clusterPoints.length;

    clusters.push({
      clusterId: parseInt(clusterId),
      category: dominantCategory,
      count: clusterPoints.length,
      center: { x: centerX, y: centerY, z: centerZ },
      dominantCategory,
      categoryDistribution: categoryDist
    });
  });

  return clusters;
}

// Generate demo stats
export function generateDemoStats(points: DataPoint[], clusters: Cluster[]): VisualizationStats {
  const categoryDist: Record<string, number> = {};
  points.forEach(point => {
    categoryDist[point.category] = (categoryDist[point.category] || 0) + 1;
  });

  return {
    totalObjects: points.length,
    categoryDistribution: categoryDist,
    totalClusters: clusters.length,
    averageClusterSize: points.length / clusters.length,
    embeddingDimensions: 1536,
    processingTimeMs: Math.random() * 2000 + 500
  };
}

// Generate complete demo visualization data
export function generateDemoVisualizationData(
  type: "submission" | "dataset" = "submission",
  pointCount: number = 50
): VisualizationData {
  const points = generateDemoDataPoints(pointCount);
  const clusters = generateDemoClusters(points);
  const stats = generateDemoStats(points, clusters);

  return {
    dataId: `demo_${type}_${Date.now()}`,
    points,
    clusters,
    stats,
    visualization_type: type,
    generatedAt: new Date().toISOString()
  };
}

// Sample conversation data for chatbot
export const sampleConversations = [
  {
    id: "conv_1",
    user: "What can you tell me about this dataset?",
    assistant: "This dataset contains 50 data points across 9 different AI alignment categories. The most common issues are Hallucination (15%) and Reasoning Errors (12%). Would you like me to analyze specific patterns or clusters?",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: "conv_2", 
    user: "Show me the cluster analysis",
    assistant: "I can see 5 distinct clusters in your data. Cluster 0 is dominated by Hallucination issues (8 points), while Cluster 2 contains mostly Creativity Weakness examples (6 points). The clusters show clear separation in the 3D space, indicating distinct patterns in the data.",
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString()
  },
  {
    id: "conv_3",
    user: "What's the value of this data?",
    assistant: "Based on the category distribution and quality metrics, this dataset has an estimated value of $247.50. The high concentration of Hallucination and Reasoning Errors makes it particularly valuable for AI safety research. The data quality score is 8.7/10.",
    timestamp: new Date(Date.now() - 1000 * 60 * 1).toISOString()
  }
];
