"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, Upload, Calendar, Eye, Download, Wallet, BarChart3, Clock, CheckCircle, TrendingUp } from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function DashboardPage() {
  const [totalEarnings, setTotalEarnings] = useState(0)
  const [pendingPayments, setPendingPayments] = useState(0)
  const [totalContributions, setTotalContributions] = useState(0)
  const [activeDatasets, setActiveDatasets] = useState(0)
  const [loading, setLoading] = useState(true)
  const [recentContributions, setRecentContributions] = useState<any[]>([])
  const [paymentHistory, setPaymentHistory] = useState<any[]>([])
  const [analyticsData, setAnalyticsData] = useState<any>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("auth_token")
        if (!token) {
          window.location.href = '/auth'
          return
        }

        // Fetch dashboard data
        const response = await fetch("/api/dashboard", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        // Fetch analytics data
        const analyticsResponse = await fetch("/api/analytics", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTotalEarnings(data.totalEarnings)
          setPendingPayments(data.pendingPayments)
          setTotalContributions(data.totalContributions)
          setActiveDatasets(data.activeDatasets)
          setRecentContributions(data.recentContributions)
          setPaymentHistory(data.paymentHistory)
        } else {
          const errorData = await response.json()
          console.error('Failed to fetch dashboard data:', errorData.error)
          // Set empty data instead of mock data
          setTotalEarnings(0)
          setPendingPayments(0)
          setTotalContributions(0)
          setActiveDatasets(0)
          setRecentContributions([])
          setPaymentHistory([])
        }

        if (analyticsResponse.ok) {
          const analytics = await analyticsResponse.json()
          setAnalyticsData(analytics)
        } else {
          setAnalyticsData(null)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        // Set empty data instead of mock data
        setTotalEarnings(0)
        setPendingPayments(0)
        setTotalContributions(0)
        setActiveDatasets(0)
        setRecentContributions([])
        setPaymentHistory([])
        setAnalyticsData(null)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-chart-4 text-white">Approved</Badge>
      case "processing":
        return <Badge className="bg-chart-1 text-white">Processing</Badge>
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="pt-24 pb-12 px-6">
          <div className="container mx-auto max-w-7xl">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Loading Dashboard</h2>
              <p className="text-muted-foreground">Fetching your data...</p>
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
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Track your contributions, earnings, and impact on AI safety</p>
            </div>
            <Button asChild>
              <a href="/contribute">
                <Upload className="w-4 h-4 mr-2" />
                New Contribution
              </a>
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="glass border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                <DollarSign className="h-4 w-4 text-chart-1" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-1">${totalEarnings.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Lifetime earnings</p>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                <Clock className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-2">${pendingPayments.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Awaiting payout</p>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contributions</CardTitle>
                <Upload className="h-4 w-4 text-chart-3" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-3">{totalContributions}</div>
                <p className="text-xs text-muted-foreground">Total data submissions</p>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Datasets</CardTitle>
                <BarChart3 className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-chart-4">{activeDatasets}</div>
                <p className="text-xs text-muted-foreground">Currently for sale</p>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs defaultValue="contributions" className="w-full">
            <TabsList className="glass">
              <TabsTrigger value="contributions">My Contributions</TabsTrigger>
              <TabsTrigger value="payments">Payment History</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="contributions" className="space-y-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Recent Contributions</CardTitle>
                  <CardDescription>Your latest data submissions and their status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentContributions.length > 0 ? (
                      recentContributions.map((contribution) => (
                        <div key={contribution.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-chart-3/10 rounded-lg flex items-center justify-center">
                              <Eye className="w-5 h-5 text-chart-3" />
                            </div>
                            <div>
                              <div className="font-semibold">{contribution.title}</div>
                              <div className="text-sm text-muted-foreground">
                                {contribution.date} • {contribution.category}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              {getStatusBadge(contribution.status)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${contribution.earnings} • {contribution.downloads} downloads
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Upload className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No contributions yet</p>
                        <p className="text-sm">Start contributing data to see your submissions here</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payments" className="space-y-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>All your completed blockchain transactions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {paymentHistory.length > 0 ? (
                      paymentHistory.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-chart-4/10 rounded-lg flex items-center justify-center">
                              <Wallet className="w-5 h-5 text-chart-4" />
                            </div>
                            <div>
                              <div className="font-semibold">${payment.amount}</div>
                              <div className="text-sm text-muted-foreground">
                                {new Date(payment.date).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <CheckCircle className="w-4 h-4 text-chart-4" />
                              <span className="text-sm text-chart-4">Completed</span>
                            </div>
                            <div className="text-xs text-muted-foreground font-mono">{payment.txHash}</div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Wallet className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No payments yet</p>
                        <p className="text-sm">Your earnings will appear here once you start contributing</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-6">
              {analyticsData ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="glass border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Earnings Trend</CardTitle>
                      <CardDescription>Your monthly earnings over time</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.monthlyEarnings && analyticsData.monthlyEarnings.length > 0 ? (
                          analyticsData.monthlyEarnings.map((month: any, index: number) => (
                            <div key={index}>
                              <div className="flex justify-between items-center">
                                <span className="text-sm">{month.month}</span>
                                <span className="font-semibold">${month.earnings.toFixed(2)}</span>
                              </div>
                              <Progress value={month.percentage} className="h-2" />
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No earnings data available yet</p>
                            <p className="text-sm">Start contributing data to see your earnings trend</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="glass border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle>Category Performance</CardTitle>
                      <CardDescription>Which categories earn you the most</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.categoryPerformance && analyticsData.categoryPerformance.length > 0 ? (
                          analyticsData.categoryPerformance.map((category: any, index: number) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm">{category.category}</span>
                              <span className="font-semibold text-primary">${category.earnings.toFixed(2)}</span>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-8 text-muted-foreground">
                            <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>No category data available yet</p>
                            <p className="text-sm">Submit data to see category performance</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <h3 className="text-lg font-semibold mb-2">Loading Analytics</h3>
                  <p className="text-muted-foreground">Fetching your analytics data...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}