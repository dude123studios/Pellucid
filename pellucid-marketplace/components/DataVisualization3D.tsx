'use client';

import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Sphere } from '@react-three/drei';
import { DataPoint, Cluster, FilterOptions } from '@/lib/dataset';
import { categoryColors } from '@/lib/mockData';
import * as THREE from 'three';

interface PointProps {
  position: [number, number, number];
  category: string;
  label?: string;
  size: number;
  showLabels: boolean;
  onClick?: () => void;
}

function Point({ position, category, label, size, showLabels, onClick }: PointProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(hovered ? size * 1.2 : size);
    }
  });

  const color = categoryColors[category] || categoryColors.default;
  
  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[0.05, 16, 16]}
        onClick={onClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial color={color} />
      </Sphere>
      {showLabels && label && (
        <Text
          position={[0, 0.1, 0]}
          fontSize={0.05}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  );
}

interface ClusterCenterProps {
  position: [number, number, number];
  category: string;
  count: number;
  size: number;
}

function ClusterCenter({ position, category, count, size }: ClusterCenterProps) {
  const color = categoryColors[category] || categoryColors.default;
  
  return (
    <group position={position}>
      <Sphere args={[size, 16, 16]}>
        <meshStandardMaterial color={color} transparent opacity={0.3} />
      </Sphere>
      <Text
        position={[0, 0, 0]}
        fontSize={0.08}
        color="white"
        anchorX="center"
        anchorY="middle"
      >
        {count}
      </Text>
    </group>
  );
}

interface DataVisualization3DProps {
  points: DataPoint[];
  clusters: Cluster[];
  filters: FilterOptions;
  onPointClick?: (point: DataPoint) => void;
}

export function DataVisualization3D({ 
  points, 
  clusters, 
  filters, 
  onPointClick 
}: DataVisualization3DProps) {
  const filteredPoints = useMemo(() => {
    return points.filter(point => 
      filters.categories.length === 0 || filters.categories.includes(point.category)
    );
  }, [points, filters.categories]);

  const filteredClusters = useMemo(() => {
    return clusters.filter(cluster => 
      filters.clusterIds.length === 0 || filters.clusterIds.includes(cluster.clusterId)
    );
  }, [clusters, filters.clusterIds]);

  return (
    <div className="w-full h-full bg-gray-900 rounded-lg">
      <Canvas camera={{ position: [5, 5, 5], fov: 60 }}>
        <ambientLight intensity={0.4} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <pointLight position={[-10, -10, -5]} intensity={0.5} />
        
        {/* Grid */}
        <gridHelper args={[10, 20, '#444444', '#222222']} />
        
        {/* Axes */}
        <axesHelper args={[2]} />
        
        {/* Data Points */}
        {filteredPoints.map((point, index) => (
          <Point
            key={point.id || index}
            position={[point.x, point.y, point.z]}
            category={point.category}
            label={point.label}
            size={filters.pointSize}
            showLabels={filters.showLabels}
            onClick={() => onPointClick?.(point)}
          />
        ))}
        
        {/* Cluster Centers */}
        {filters.showClusters && filteredClusters.map((cluster) => {
          if (!cluster.center) return null;
          return (
            <ClusterCenter
              key={cluster.clusterId}
              position={[cluster.center.x, cluster.center.y, cluster.center.z]}
              category={cluster.category}
              count={cluster.count}
              size={0.15}
            />
          );
        })}
        
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={2}
          maxDistance={20}
        />
      </Canvas>
    </div>
  );
}
