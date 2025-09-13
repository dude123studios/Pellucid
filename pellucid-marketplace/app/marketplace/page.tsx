"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Download, Star, Users, Calendar, TrendingUp, ShoppingCart, Eye, Zap } from "lucide-react"
import { Navigation } from "@/components/navigation"
import PriceOverTimeChart from "@/components/price-chart"
import MarketOverview from "@/components/MarketOverview"

interface Dataset {
  id: string
  title: string
  category: string
  description: string
  price: number
  samples: number
  rating: number
  downloads: number
  createdAt: string
  tags: string[]
}

interface MarketData {
  id: string
  categories: string[]
  timestamp: string
  cost_usd: number
}

export default function MarketplacePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedSort, setSelectedSort] = useState("newest")
  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartLoading, setChartLoading] = useState(true)

  useEffect(() => {
    const fetchDatasets = async () => {
      try {
        const response = await fetch('/api/marketplace')
        if (response.ok) {
          const data = await response.json()
          setDatasets(data.datasets || [])
        } else {
          setDatasets([])
        }
      } catch (error) {
        console.error('Error fetching datasets:', error)
        setDatasets([])
      } finally {
        setLoading(false)
      }
    }

    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market-stats')
        if (response.ok) {
          const data = await response.json()
          setMarketData(data || [])
        } else {
          setMarketData([])
        }
      } catch (error) {
        console.error('Error fetching market data:', error)
        setMarketData([])
      } finally {
        setChartLoading(false)
      }
    }

    fetchDatasets()
    fetchMarketData()
  }, [])

  const filteredDatasets = datasets.filter(dataset => {
    const matchesSearch = dataset.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dataset.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || dataset.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedDatasets = [...filteredDatasets].sort((a, b) => {
    switch (selectedSort) {
      case "price-low":
        return a.price - b.price
      case "price-high":
        return b.price - a.price
      case "popular":
        return b.downloads - a.downloads
      case "newest":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Loading Marketplace</h2>
              <p className="text-muted-foreground">Fetching datasets...</p>
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
        <div className="container mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 glass" variant="secondary">
              <Zap className="w-4 h-4 mr-2" />
              AI Alignment Dataset Marketplace
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Browse Datasets</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover high-quality AI alignment datasets to improve your models' safety, accuracy, and performance
            </p>
          </div>

          {/* Market Price Chart */}
          <div className="mb-12">
            {chartLoading ? (
              <Card className="glass border-0 shadow-lg">
                <CardContent className="h-[28rem] flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading market data...</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <PriceOverTimeChart data={marketData} />
            )}
          </div>

          {/* Market Overview */}
          <div className="mb-12">
            <MarketOverview data={marketData} />
          </div>


          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search datasets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 glass bg-transparent"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48 glass bg-transparent">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="hallucination">Hallucination</SelectItem>
                <SelectItem value="harmful">Harmful Content</SelectItem>
                <SelectItem value="reasoning">Reasoning Errors</SelectItem>
                <SelectItem value="creativity">Creativity Issues</SelectItem>
                <SelectItem value="alignment">Alignment Problems</SelectItem>
                <SelectItem value="context">Context Failures</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSort} onValueChange={setSelectedSort}>
              <SelectTrigger className="w-full md:w-48 glass bg-transparent">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Results */}
          {sortedDatasets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedDatasets.map((dataset) => (
                <Card key={dataset.id} className="glass border-0 shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <Badge variant="secondary" className="mb-2">
                        {dataset.category}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{dataset.rating}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{dataset.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {dataset.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          <span>{dataset.samples} samples</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          <span>{dataset.downloads} downloads</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="text-2xl font-bold text-primary">
                          ${dataset.price}
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => window.location.href = `/dataset/${dataset.id}/visualization`}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            Visualize
                          </Button>
                          <Button className="bg-primary text-black">
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Purchase
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No datasets found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCategory !== "all" 
                  ? "Try adjusting your search or filters" 
                  : "No datasets available yet. Check back soon!"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}