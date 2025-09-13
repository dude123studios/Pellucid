"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft, 
  Database, 
  DollarSign, 
  Users, 
  Calendar,
  Loader2,
  AlertCircle
} from "lucide-react";

import DataVisualizationPage from "@/components/DataVisualizationPage";
import { Navigation } from "@/components/navigation";
import { generateDemoVisualizationData } from "@/lib/demo-data";

interface Dataset {
  _id: string;
  category: string;
  description: string;
  submissions: string[];
  price: number;
  buyers: string[];
  createdAt: string;
  sampleCount?: number;
  usageCount?: number;
}

export default function DatasetVisualizationPage() {
  const params = useParams();
  const router = useRouter();
  const datasetId = params.id as string;

  const [dataset, setDataset] = useState<Dataset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataIds, setDataIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch dataset details
        const datasetResponse = await fetch(`/api/marketplace?datasetId=${datasetId}`);
        if (!datasetResponse.ok) {
          throw new Error('Failed to fetch dataset');
        }

        const datasetData = await datasetResponse.json();
        setDataset(datasetData);

        // Try to fetch visualization data, fallback to demo data
        try {
          const token = localStorage.getItem('auth_token');
          if (!token) {
            console.log('No auth token, using demo data for visualization');
            setDataIds([]);
            return;
          }

          const visualizationResponse = await fetch(`/api/visualize?datasetId=${datasetId}`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (visualizationResponse.ok) {
            const visualizationData = await visualizationResponse.json();
            setDataIds(visualizationData.points?.map((p: any) => p.id) || []);
          } else {
            // Use demo data if API fails
            console.log('API failed, using demo data for visualization');
            setDataIds([]);
          }
        } catch (apiError) {
          // Use demo data if API fails
          console.log('API error, using demo data for visualization:', apiError);
          setDataIds([]);
        }

      } catch (err) {
        console.error('Dataset fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load dataset');
      } finally {
        setLoading(false);
      }
    };

    if (datasetId) {
      fetchDataset();
    }
  }, [datasetId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <Card className="glass border-0">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading Dataset Visualization...
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="space-y-6">
              <Button 
                variant="outline" 
                onClick={() => router.back()}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!dataset) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Dataset not found.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-7xl space-y-6">
          
          {/* Back Button */}
          <Button 
            variant="outline" 
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Marketplace
          </Button>

          {/* Dataset Header */}
          <Card className="glass border-0">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-2xl">
                    <Database className="h-6 w-6" />
                    {dataset.category} Dataset
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    {dataset.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    ${dataset.price}
                  </div>
                  <p className="text-sm text-muted-foreground">Dataset Price</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {dataset.buyers.length} buyers
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  {dataset.sampleCount || dataset.submissions.length} samples
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(dataset.createdAt).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Visualization - Always show demo data */}
          <DataVisualizationPage
            dataIds={dataIds}
            visualizationType="dataset"
            title={`${dataset.category} Dataset Visualization`}
          />
        </div>
      </div>
    </div>
  );
}
