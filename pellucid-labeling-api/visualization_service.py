
"""
Data Visualization Service for Pellucid AI Alignment Data Marketplace

This service provides visualization data generation for:
1. 3D scatter plot visualization using embeddings
2. K-means clustering analysis
3. Statistical analysis and insights
4. Category distribution analysis
"""

import os
import json
import numpy as np
from datetime import datetime
from typing import Dict, List, Tuple, Optional, Any
from dataclasses import dataclass
from enum import Enum

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
from pydantic import BaseModel, Field
import uvicorn
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
import requests

class VisualizationType(str, Enum):
    SUBMISSION = "submission"
    DATASET = "dataset"
    USER_DATA = "user_data"

class VisualizationRequest(BaseModel):
    data_ids: List[str] = Field(..., description="List of data object IDs to visualize")
    visualization_type: VisualizationType = Field(default=VisualizationType.SUBMISSION, description="Type of visualization")
    n_clusters: int = Field(default=5, description="Number of clusters for K-means")
    include_analytics: bool = Field(default=True, description="Include statistical analytics")

class DataPoint(BaseModel):
    id: str
    x: float
    y: float
    z: float
    category: str
    label: str
    payload: str
    sanitizedPayload: Optional[str] = None
    clusterId: Optional[int] = None

class Cluster(BaseModel):
    clusterId: int
    category: str
    count: int
    center: Dict[str, float]
    dominantCategory: str
    categoryDistribution: Dict[str, int]

class VisualizationStats(BaseModel):
    totalObjects: int
    categoryDistribution: Dict[str, int]
    totalClusters: int
    averageClusterSize: float
    embeddingDimensions: int
    processingTimeMs: float

class VisualizationResponse(BaseModel):
    dataId: str
    points: List[DataPoint]
    clusters: List[Cluster]
    stats: VisualizationStats
    visualization_type: VisualizationType
    generatedAt: str

class VisualizationService:
    def __init__(self):
        self.mongodb_uri = os.getenv("MONGODB_URI")
        self.nextjs_api_url = os.getenv("NEXTJS_API_URL", "http://localhost:3000")
        
    async def fetch_data_objects(self, data_ids: List[str]) -> List[Dict[str, Any]]:
        """Fetch data objects from MongoDB via Next.js API"""
        try:
            # In a real implementation, you'd connect directly to MongoDB
            # For now, we'll simulate the data structure
            mock_data = []
            for i, data_id in enumerate(data_ids):
                mock_data.append({
                    "_id": data_id,
                    "payload": f"Sample data point {i+1}",
                    "label": f"Label {i+1}",
                    "category": ["Harmful Content", "Hallucination", "Reasoning Errors", "Creativity Weakness"][i % 4],
                    "embedding": np.random.rand(1536).tolist(),  # Mock 1536-dim embedding
                    "embeddingModel": "text-embedding-3-small",
                    "embeddingGeneratedAt": datetime.now().isoformat()
                })
            return mock_data
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to fetch data objects: {str(e)}")

    def reduce_dimensions(self, embeddings: np.ndarray, n_components: int = 3) -> np.ndarray:
        """Reduce embedding dimensions to 3D using PCA"""
        try:
            # Standardize the embeddings
            scaler = StandardScaler()
            embeddings_scaled = scaler.fit_transform(embeddings)
            
            # Apply PCA to reduce to 3D
            pca = PCA(n_components=n_components)
            reduced_embeddings = pca.fit_transform(embeddings_scaled)
            
            return reduced_embeddings
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Dimension reduction failed: {str(e)}")

    def perform_clustering(self, embeddings: np.ndarray, n_clusters: int) -> Tuple[np.ndarray, KMeans]:
        """Perform K-means clustering on embeddings"""
        try:
            # Standardize embeddings for clustering
            scaler = StandardScaler()
            embeddings_scaled = scaler.fit_transform(embeddings)
            
            # Perform K-means clustering
            kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
            cluster_labels = kmeans.fit_predict(embeddings_scaled)
            
            return cluster_labels, kmeans
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Clustering failed: {str(e)}")

    def calculate_cluster_stats(self, data_objects: List[Dict], cluster_labels: np.ndarray, kmeans: KMeans) -> List[Cluster]:
        """Calculate cluster statistics and category distributions"""
        clusters = []
        
        for cluster_id in range(kmeans.n_clusters):
            # Get data points in this cluster
            cluster_mask = cluster_labels == cluster_id
            cluster_data = [data_objects[i] for i in range(len(data_objects)) if cluster_mask[i]]
            
            if not cluster_data:
                continue
                
            # Calculate category distribution
            category_dist = {}
            for data_point in cluster_data:
                category = data_point.get('category', 'Unknown')
                category_dist[category] = category_dist.get(category, 0) + 1
            
            # Find dominant category
            dominant_category = max(category_dist.items(), key=lambda x: x[1])[0]
            
            # Calculate cluster center (in original embedding space)
            cluster_embeddings = np.array([data_point['embedding'] for data_point in cluster_data])
            center_embedding = np.mean(cluster_embeddings, axis=0)
            
            # Reduce center to 3D for visualization
            center_3d = self.reduce_dimensions(center_embedding.reshape(1, -1))[0]
            
            clusters.append(Cluster(
                clusterId=cluster_id,
                category=dominant_category,
                count=len(cluster_data),
                center={"x": float(center_3d[0]), "y": float(center_3d[1]), "z": float(center_3d[2])},
                dominantCategory=dominant_category,
                categoryDistribution=category_dist
            ))
        
        return clusters

    def calculate_statistics(self, data_objects: List[Dict], clusters: List[Cluster], processing_time: float) -> VisualizationStats:
        """Calculate overall statistics for the visualization"""
        # Category distribution
        category_dist = {}
        for data_point in data_objects:
            category = data_point.get('category', 'Unknown')
            category_dist[category] = category_dist.get(category, 0) + 1
        
        # Calculate average cluster size
        total_clusters = len(clusters)
        average_cluster_size = sum(cluster.count for cluster in clusters) / total_clusters if total_clusters > 0 else 0
        
        return VisualizationStats(
            totalObjects=len(data_objects),
            categoryDistribution=category_dist,
            totalClusters=total_clusters,
            averageClusterSize=average_cluster_size,
            embeddingDimensions=len(data_objects[0]['embedding']) if data_objects else 0,
            processingTimeMs=processing_time
        )

    async def generate_visualization_data(self, request: VisualizationRequest) -> VisualizationResponse:
        """Generate complete visualization data"""
        start_time = datetime.now()
        
        try:
            # Step 1: Fetch data objects
            data_objects = await self.fetch_data_objects(request.data_ids)
            
            if not data_objects:
                raise HTTPException(status_code=404, detail="No data objects found")
            
            # Step 2: Extract embeddings
            embeddings = np.array([data_point['embedding'] for data_point in data_objects])
            
            # Step 3: Reduce dimensions to 3D
            reduced_embeddings = self.reduce_dimensions(embeddings)
            
            # Step 4: Perform clustering
            cluster_labels, kmeans = self.perform_clustering(embeddings, request.n_clusters)
            
            # Step 5: Create data points
            points = []
            for i, data_point in enumerate(data_objects):
                points.append(DataPoint(
                    id=data_point['_id'],
                    x=float(reduced_embeddings[i][0]),
                    y=float(reduced_embeddings[i][1]),
                    z=float(reduced_embeddings[i][2]),
                    category=data_point.get('category', 'Unknown'),
                    label=data_point.get('label', ''),
                    payload=data_point.get('payload', ''),
                    sanitizedPayload=data_point.get('sanitizedPayload'),
                    clusterId=int(cluster_labels[i])
                ))
            
            # Step 6: Calculate cluster statistics
            clusters = self.calculate_cluster_stats(data_objects, cluster_labels, kmeans)
            
            # Step 7: Calculate overall statistics
            processing_time = (datetime.now() - start_time).total_seconds() * 1000
            stats = self.calculate_statistics(data_objects, clusters, processing_time)
            
            return VisualizationResponse(
                dataId=f"viz_{request.visualization_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                points=points,
                clusters=clusters,
                stats=stats,
                visualization_type=request.visualization_type,
                generatedAt=datetime.now().isoformat()
            )
            
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Visualization generation failed: {str(e)}")

    async def get_stats(self) -> Dict[str, Any]:
        """Get visualization service statistics"""
        return {
            "service_status": "healthy",
            "mongodb_connected": bool(self.mongodb_uri),
            "nextjs_api_url": self.nextjs_api_url,
            "supported_visualization_types": ["submission", "dataset"],
            "supported_clustering_algorithms": ["kmeans"],
            "supported_dimension_reduction": ["pca"],
            "max_clusters": 20,
            "min_clusters": 2
        }

# Initialize the visualization service
visualization_service = VisualizationService()

# FastAPI app for visualization service
app = FastAPI(
    title="Pellucid Visualization Service",
    description="Data visualization service for AI alignment data marketplace",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js frontend
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "visualization",
        "timestamp": datetime.now().isoformat()
    }

@app.post("/visualize", response_model=VisualizationResponse)
async def generate_visualization(request: VisualizationRequest):
    """Generate visualization data for a set of data objects"""
    try:
        return await visualization_service.generate_visualization_data(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Visualization failed: {str(e)}")

@app.post("/visualize/submission/{submission_id}")
async def visualize_submission(submission_id: str, n_clusters: int = 5):
    """Generate visualization for a specific submission"""
    try:
        # In a real implementation, you'd fetch the submission and its data objects
        # For now, we'll simulate with mock data IDs
        mock_data_ids = [f"data_{i}" for i in range(20)]  # Mock 20 data points
        
        request = VisualizationRequest(
            data_ids=mock_data_ids,
            visualization_type=VisualizationType.SUBMISSION,
            n_clusters=n_clusters
        )
        
        return await visualization_service.generate_visualization_data(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Submission visualization failed: {str(e)}")

@app.post("/visualize/dataset/{dataset_id}")
async def visualize_dataset(dataset_id: str, n_clusters: int = 5):
    """Generate visualization for a specific dataset"""
    try:
        # In a real implementation, you'd fetch the dataset and its submissions
        # For now, we'll simulate with mock data IDs
        mock_data_ids = [f"data_{i}" for i in range(50)]  # Mock 50 data points
        
        request = VisualizationRequest(
            data_ids=mock_data_ids,
            visualization_type=VisualizationType.DATASET,
            n_clusters=n_clusters
        )
        
        return await visualization_service.generate_visualization_data(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dataset visualization failed: {str(e)}")

@app.get("/stats")
async def get_visualization_stats():
    """Get visualization service statistics"""
    return {
        "service": "visualization",
        "supported_visualization_types": [vt.value for vt in VisualizationType],
        "supported_clustering_algorithms": ["K-means"],
        "supported_dimension_reduction": ["PCA"],
        "max_clusters": 20,
        "max_data_points": 10000
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)
