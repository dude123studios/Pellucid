export interface DataPoint {
  x: number;
  y: number;
  z: number;
  category: string;
  id?: string;
  label?: string;
}

export interface Cluster {
  clusterId: number;
  category: string;
  count: number;
  center?: {
    x: number;
    y: number;
    z: number;
  };
}

export interface CategoryDistribution {
  [category: string]: number;
}

export interface DatasetStats {
  totalObjects: number;
  categoryDistribution: CategoryDistribution;
  totalClusters?: number;
  averageClusterSize?: number;
}

export interface DatasetVisualization {
  submissionId?: string;
  datasetId?: string;
  points: DataPoint[];
  clusters: Cluster[];
  stats: DatasetStats;
}

export interface FilterOptions {
  categories: string[];
  clusterIds: number[];
  pointSize: number;
  showClusters: boolean;
  showLabels: boolean;
}

export type CategoryColors = {
  [category: string]: string;
};
