"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertTriangle,
  DollarSign,
  Shield,
} from "lucide-react"
import { Navigation } from "@/components/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import DataVisualizationPage from "@/components/DataVisualizationPage"

interface AnalysisResult {
  id: string
  category: string
  severity: string
  confidence: number
  description: string
  excerpt: string
  estimatedValue: number
}

export default function ResultsPage({ params }: { params: { id: string } }) {
  const [submission, setSubmission] = useState<any>(null)
  const [results, setResults] = useState<AnalysisResult[]>([])
  const [loading, setLoading] = useState(true)
  const [dataIds, setDataIds] = useState<string[]>([])

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (!token) {
          window.location.href = '/auth'
          return
        }

        const response = await fetch(`/api/results/${params.id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })

        if (response.ok) {
          const data = await response.json()
          setSubmission(data.submission)
          setResults(data.results || [])
          setDataIds(data.submission?.dataIds || [])
        } else {
          console.error('Failed to fetch results')
        }
      } catch (error) {
        console.error('Error fetching results:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [params.id])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-destructive"
      case "medium":
        return "text-chart-1"
      case "low":
        return "text-chart-4"
      default:
        return "text-muted-foreground"
    }
  }

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High Value</Badge>
      case "medium":
        return <Badge className="bg-chart-1 text-white">Medium Value</Badge>
      case "low":
        return <Badge className="bg-chart-4 text-white">Low Value</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-4xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Analyzing Your Submission</h2>
              <p className="text-muted-foreground">This may take a few moments...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <CheckCircle className="w-8 h-8 text-chart-4" />
              <h1 className="text-3xl font-bold">Analysis Complete</h1>
            </div>
            <p className="text-xl text-muted-foreground">
              Your data has been successfully analyzed for AI alignment issues
            </p>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-1">
                  ${results.reduce((sum, result) => sum + result.estimatedValue, 0).toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground">Estimated earnings</p>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Issues Found</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-2">{results.length}</div>
                <p className="text-xs text-muted-foreground">Alignment problems</p>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-3">
                  {submission?.processingTime?.toFixed(1) || '0.0'}s
                </div>
                <p className="text-xs text-muted-foreground">Analysis duration</p>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Status</CardTitle>
              </CardHeader>
              <CardContent>
                <Badge className="bg-chart-4 text-white">
                  {submission?.status || 'Completed'}
                </Badge>
                <p className="text-xs text-muted-foreground mt-1">Ready for marketplace</p>
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          <Tabs defaultValue="issues" className="w-full">
            <TabsList className="glass">
              <TabsTrigger value="issues">Issues Found</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="visualization">3D Visualization</TabsTrigger>
              <TabsTrigger value="privacy">Privacy Report</TabsTrigger>
            </TabsList>

            <TabsContent value="issues" className="space-y-6">
              {results.length > 0 ? (
                <div className="space-y-4">
                  {results.map((result) => (
                    <Card key={result.id} className="glass border-0 shadow-lg">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              <AlertTriangle className={`w-5 h-5 ${getSeverityColor(result.severity)}`} />
                              {result.category}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              Confidence: {(result.confidence * 100).toFixed(0)}%
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            {getSeverityBadge(result.severity)}
                            <div className="text-lg font-bold text-primary mt-1">
                              ${result.estimatedValue.toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-3">{result.description}</p>
                        {result.excerpt && (
                          <div className="p-3 bg-secondary/30 rounded-lg">
                            <p className="text-sm font-mono">{result.excerpt}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="glass border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <CheckCircle className="w-16 h-16 mx-auto mb-4 text-chart-4" />
                    <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
                    <p className="text-muted-foreground">
                      Your submission appears to be free of alignment issues. Great job!
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                  <CardDescription>
                    Overview of the alignment issues found in your submission
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Category Breakdown</h4>
                        <div className="space-y-2">
                          {Object.entries(
                            results.reduce(
                              (acc, result) => {
                                acc[result.category] = (acc[result.category] || 0) + 1
                                return acc
                              },
                              {} as Record<string, number>
                            )
                          ).map(([category, count]) => (
                            <div key={category} className="flex justify-between">
                              <span className="text-sm">{category}</span>
                              <span className="text-sm font-medium">{count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Value Distribution</h4>
                        <div className="space-y-2">
                          {results.map((result) => (
                            <div key={result.id} className="flex justify-between">
                              <span className="text-sm">{result.category}</span>
                              <span className="text-sm font-medium">${result.estimatedValue.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="visualization" className="space-y-6">
              {dataIds.length > 0 ? (
                <DataVisualizationPage
                  dataIds={dataIds}
                  visualizationType="submission"
                  title="Submission Data Visualization"
                />
              ) : (
                <Card className="glass border-0 shadow-lg">
                  <CardContent className="text-center py-12">
                    <AlertTriangle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                    <h3 className="text-xl font-semibold mb-2">No Data Available</h3>
                    <p className="text-muted-foreground">
                      This submission doesn't have any data points available for visualization.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="privacy" className="space-y-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Privacy Protection Report
                  </CardTitle>
                  <CardDescription>
                    Details about how your data was protected during analysis
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert className="glass border-0">
                    <Shield className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Privacy Confirmed:</strong> All personal information has been removed from your submission. 
                      Only anonymized data is stored and used for analysis.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex justify-center gap-4 mt-8">
            <Button size="lg" className="bg-primary text-black">
              <DollarSign className="w-4 h-4 mr-2" />
              Approve & List for Sale
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="px-8 glass bg-transparent"
              onClick={() => window.location.href = '/contribute'}
            >
              Submit More Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}