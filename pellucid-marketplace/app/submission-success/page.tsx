"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  Sparkles, 
  Trophy, 
  Star, 
  Zap, 
  ArrowRight,
  Users,
  DollarSign,
  TrendingUp,
  Shield
} from "lucide-react"
import { Navigation } from "@/components/navigation"

export default function SubmissionSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [progress, setProgress] = useState(0)
  const [showContent, setShowContent] = useState(false)
  const [dataCount, setDataCount] = useState(0)
  const [estimatedValue, setEstimatedValue] = useState(0)
  const [submissionId, setSubmissionId] = useState('')

  useEffect(() => {
    // Get data from URL params
    const count = parseInt(searchParams.get('count') || '0')
    const value = parseFloat(searchParams.get('value') || '0')
    const submission = searchParams.get('submissionId') || ''
    
    setDataCount(count)
    setEstimatedValue(value)
    setSubmissionId(submission)

    // Animate progress bar
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval)
          setShowContent(true)
          return 100
        }
        return prev + 2
      })
    }, 50)

    // Auto redirect to dashboard after 5 seconds
    const redirectTimer = setTimeout(() => {
      router.push('/dashboard')
    }, 5000)

    return () => {
      clearInterval(progressInterval)
      clearTimeout(redirectTimer)
    }
  }, [router, searchParams])

  const handleGoToDashboard = () => {
    router.push('/dashboard')
  }

  const handleSubmitMore = () => {
    router.push('/contribute')
  }

  const handleViewResults = () => {
    if (submissionId) {
      router.push(`/results/${submissionId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-accent/5 to-chart-4/5">
      <Navigation />
      
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-chart-4/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="pt-24 pb-12 px-6 relative z-10">
        <div className="container mx-auto max-w-4xl">
          
          {/* Success Animation */}
          <div className="text-center mb-12">
            <div className="relative inline-block mb-8">
              {/* Main Success Icon */}
              <div className="w-32 h-32 bg-gradient-to-r from-chart-4 to-primary rounded-full flex items-center justify-center mx-auto shadow-2xl animate-bounce">
                <CheckCircle className="w-20 h-20 text-white" />
              </div>
              
              {/* Floating Sparkles */}
              <div className="absolute -top-4 -right-4 animate-ping">
                <Sparkles className="w-8 h-8 text-yellow-400" />
              </div>
              <div className="absolute -bottom-2 -left-2 animate-ping delay-300">
                <Star className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="absolute top-4 -left-6 animate-ping delay-700">
                <Zap className="w-5 h-5 text-blue-400" />
              </div>
            </div>

            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent animate-fade-in">
              Submission Successful!
            </h1>
            <p className="text-xl text-muted-foreground mb-8 animate-fade-in delay-300">
              Your data has been processed and is ready for analysis
            </p>

            {/* Progress Bar */}
            <div className="max-w-md mx-auto mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>Processing</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>
          </div>

          {/* Content that appears after progress */}
          {showContent && (
            <div className="space-y-8 animate-fade-in-up">
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Users className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-3xl font-bold text-primary mb-2">{dataCount}</div>
                    <div className="text-sm text-muted-foreground">Data Objects</div>
                  </CardContent>
                </Card>

                <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 delay-100">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-chart-1/20 to-chart-2/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <DollarSign className="w-8 h-8 text-chart-1" />
                    </div>
                    <div className="text-3xl font-bold text-chart-1 mb-2">${estimatedValue.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">Estimated Value</div>
                  </CardContent>
                </Card>

                <Card className="glass border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 delay-200">
                  <CardContent className="pt-6 text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-chart-4/20 to-chart-5/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <TrendingUp className="w-8 h-8 text-chart-4" />
                    </div>
                    <div className="text-3xl font-bold text-chart-4 mb-2">100%</div>
                    <div className="text-sm text-muted-foreground">Privacy Protected</div>
                  </CardContent>
                </Card>
              </div>

              {/* Achievement Badge */}
              <Card className="glass border-0 shadow-lg">
                <CardContent className="pt-6 text-center">
                  <div className="flex items-center justify-center mb-4">
                    <Trophy className="w-12 h-12 text-yellow-500 mr-4" />
                    <div>
                      <h3 className="text-2xl font-bold">Data Contributor</h3>
                      <p className="text-muted-foreground">You've successfully contributed to AI safety research!</p>
                    </div>
                  </div>
                  
                  <div className="flex justify-center gap-2 mb-6">
                    <Badge className="bg-primary text-white">Privacy First</Badge>
                    <Badge className="bg-chart-4 text-white">AI Safety</Badge>
                    <Badge className="bg-accent text-white">Research Impact</Badge>
                  </div>

                  <div className="text-sm text-muted-foreground">
                    Your data is now being analyzed by our AI systems and will be available in the marketplace soon.
                  </div>
                </CardContent>
              </Card>

              {/* Next Steps */}
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    What Happens Next?
                  </CardTitle>
                  <CardDescription>
                    Your contribution is being processed through our secure pipeline
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-chart-4/20 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-chart-4" />
                      </div>
                      <span className="text-sm">Privacy protection applied</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-chart-1/20 rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-chart-1 rounded-full animate-pulse"></div>
                      </div>
                      <span className="text-sm">AI analysis in progress</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-muted-foreground rounded-full"></div>
                      </div>
                      <span className="text-sm text-muted-foreground">Marketplace listing (pending)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-primary text-black hover:bg-primary/90 transition-all duration-300 hover:scale-105"
                  onClick={handleGoToDashboard}
                >
                  <TrendingUp className="w-5 h-5 mr-2" />
                  View Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                
                {submissionId && (
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="glass bg-transparent hover:bg-chart-4/10 transition-all duration-300 hover:scale-105"
                    onClick={handleViewResults}
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    View Results
                  </Button>
                )}
                
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="glass bg-transparent hover:bg-accent/10 transition-all duration-300 hover:scale-105"
                  onClick={handleSubmitMore}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Submit More Data
                </Button>
              </div>

              {/* Auto-redirect notice */}
              <div className="text-center text-sm text-muted-foreground">
                <p>Redirecting to dashboard in a few seconds...</p>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
