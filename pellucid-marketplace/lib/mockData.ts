import { DatasetVisualization, DataPoint, Cluster, CategoryDistribution } from '@/types/dataset';

// Generate random 3D points with some clustering
function generateClusteredPoints(count: number, categories: string[]): DataPoint[] {
  const points: DataPoint[] = [];
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    // Create some clustering by adding noise to cluster centers
    let x, y, z;
    
    switch (category) {
      case 'hallucination':
        x = (Math.random() - 0.5) * 2 + 1;
        y = (Math.random() - 0.5) * 2 + 1;
        z = (Math.random() - 0.5) * 2 + 0.5;
        break;
      case 'harmful_content':
        x = (Math.random() - 0.5) * 2 - 1;
        y = (Math.random() - 0.5) * 2 - 1;
        z = (Math.random() - 0.5) * 2 - 0.5;
        break;
      case 'general_questions':
        x = (Math.random() - 0.5) * 4;
        y = (Math.random() - 0.5) * 4;
        z = (Math.random() - 0.5) * 4;
        break;
      case 'jailbreak_attempts':
        x = (Math.random() - 0.5) * 1.5 + 0.5;
        y = (Math.random() - 0.5) * 1.5 - 0.5;
        z = (Math.random() - 0.5) * 1.5 + 1;
        break;
      default:
        x = (Math.random() - 0.5) * 4;
        y = (Math.random() - 0.5) * 4;
        z = (Math.random() - 0.5) * 4;
    }
    
    points.push({
      x,
      y,
      z,
      category,
      id: `point-${i}`,
      label: `Sample ${category} ${i + 1}`
    });
  }
  
  return points;
}

function generateClusters(categories: string[], points: DataPoint[]): Cluster[] {
  const clusters: Cluster[] = [];
  
  categories.forEach((category, index) => {
    const categoryPoints = points.filter(p => p.category === category);
    const count = categoryPoints.length;
    
    if (count > 0) {
      // Calculate cluster center
      const center = {
        x: categoryPoints.reduce((sum, p) => sum + p.x, 0) / count,
        y: categoryPoints.reduce((sum, p) => sum + p.y, 0) / count,
        z: categoryPoints.reduce((sum, p) => sum + p.z, 0) / count,
      };
      
      clusters.push({
        clusterId: index,
        category,
        count,
        center
      });
    }
  });
  
  return clusters;
}

function generateCategoryDistribution(points: DataPoint[]): CategoryDistribution {
  const distribution: CategoryDistribution = {};
  
  points.forEach(point => {
    distribution[point.category] = (distribution[point.category] || 0) + 1;
  });
  
  return distribution;
}

export function generateMockDataset(): DatasetVisualization {
  const categories = ['hallucination', 'harmful_content', 'general_questions', 'jailbreak_attempts'];
  const totalObjects = 150;
  
  const points = generateClusteredPoints(totalObjects, categories);
  const clusters = generateClusters(categories, points);
  const categoryDistribution = generateCategoryDistribution(points);
  
  return {
    datasetId: 'mock_dataset_1',
    points,
    clusters,
    stats: {
      totalObjects,
      categoryDistribution,
      totalClusters: clusters.length,
      averageClusterSize: totalObjects / clusters.length
    }
  };
}

export const categoryColors: { [key: string]: string } = {
  hallucination: '#ef4444', // red
  harmful_content: '#dc2626', // dark red
  general_questions: '#3b82f6', // blue
  jailbreak_attempts: '#f59e0b', // amber
  default: '#6b7280' // gray
};
