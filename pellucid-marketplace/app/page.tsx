"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Database, Users, Upload, Search, Lock, Zap, ArrowRight } from "lucide-react"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

export default function HomePage() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("animate")
        }
      })
    }, observerOptions)

    const animatedElements = document.querySelectorAll(".fade-in-up, .scale-in")
    animatedElements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6">
        <div className="container mx-auto text-center">
          {/* Main Logo */}
          <div className="mb-8 fade-in-up">
            <div className="w-24 h-24 mx-auto relative">
              <Image
                src="/pellucid-logo.png"
                alt="Pellucid Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <Badge className="mb-6 glass fade-in-up" variant="secondary">
            <Zap className="w-4 h-4 mr-2" />
            The Transparent AI Alignment Data Marketplace
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance fade-in-up">
            <span
              className="inline-block text-white px-4 py-2 rounded-lg"
              style={{
                background: "linear-gradient(135deg, #00d4aa, #0ea5e9)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                filter: "drop-shadow(0 0 8px rgba(0, 212, 170, 0.3))",
              }}
            >
              A transparent path to safer AI
            </span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto text-pretty fade-in-up">
            Pellucid is the first platform where you can contribute your AI interaction data while preserving privacy.
            Help build safer, more aligned AI systems and participate in the future of AI safety.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center fade-in-up">
            <Button
              size="lg"
              className="text-lg px-8 py-6 text-white font-semibold"
              className="bg-primary"
              asChild
            >
              <a href="/auth">
                <Upload className="w-5 h-5 mr-2" />
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-6 glass bg-transparent border-primary/30"
              asChild
            >
              <a href="/marketplace">
                <Search className="w-5 h-5 mr-2" />
                Explore Marketplace
              </a>
            </Button>
          </div>
          <div className="mt-12 glass rounded-2xl p-8 max-w-4xl mx-auto scale-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div
                  className="text-3xl font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #00d4aa, #0ea5e9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 4px rgba(0, 212, 170, 0.5))",
                  }}
                >
                  150K+
                </div>
                <div className="text-muted-foreground">Datasets Created</div>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #00d4aa, #0ea5e9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 4px rgba(0, 212, 170, 0.5))",
                  }}
                >
                  100%
                </div>
                <div className="text-muted-foreground">Privacy Protected</div>
              </div>
              <div className="text-center">
                <div
                  className="text-3xl font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg, #00d4aa, #0ea5e9)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 0 4px rgba(0, 212, 170, 0.5))",
                  }}
                >
                  24/7
                </div>
                <div className="text-muted-foreground">AI Analysis</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="contribute" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl font-bold mb-4">How Pellucid Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Four simple steps to contribute to AI safety research
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="glass border-0 shadow-lg fade-in-up">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-6 h-6 text-primary" />
                </div>
                <CardTitle>1. Upload Data</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Paste conversations or upload files containing your AI interactions
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-lg fade-in-up">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-6 h-6 text-accent" />
                </div>
                <CardTitle>2. Privacy Protection</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Our system automatically replaces sensitive identifiers while preserving meaning
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-lg fade-in-up">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-chart-3/20 to-chart-4/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Database className="w-6 h-6 text-chart-3" />
                </div>
                <CardTitle>3. AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Advanced AI critiques your data for alignment issues and categorizes it
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-lg fade-in-up">
              <CardHeader className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-chart-4/20 to-primary/20 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-chart-4" />
                </div>
                <CardTitle>4. Research Impact</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center">
                  Your data helps researchers build safer, more aligned AI systems
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Dataset Categories */}
      <section id="marketplace" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <h2 className="text-4xl font-bold mb-4">Dataset Categories</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your data helps researchers identify and fix specific AI alignment issues
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass border-0 shadow-lg hover:shadow-xl transition-shadow fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-destructive">Harmful Content</CardTitle>
                  <Badge variant="destructive">High Value</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Examples where AI produces offensive, biased, or unsafe responses</CardDescription>
                <div className="mt-4 text-sm text-muted-foreground">
                  Average payout: <span className="font-semibold text-foreground">$12-25</span> per example
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-lg hover:shadow-xl transition-shadow fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-chart-2">Hallucination</CardTitle>
                  <Badge className="bg-chart-2 text-white">Popular</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Instances where AI generates factually incorrect information</CardDescription>
                <div className="mt-4 text-sm text-muted-foreground">
                  Average payout: <span className="font-semibold text-foreground">$8-15</span> per example
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-lg hover:shadow-xl transition-shadow fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-chart-1">Reasoning Errors</CardTitle>
                  <Badge className="bg-chart-1 text-white">In Demand</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Cases where AI shows flawed logical reasoning or problem-solving</CardDescription>
                <div className="mt-4 text-sm text-muted-foreground">
                  Average payout: <span className="font-semibold text-foreground">$10-20</span> per example
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-lg hover:shadow-xl transition-shadow fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-accent">Creativity Weakness</CardTitle>
                  <Badge className="bg-accent text-white">Growing</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Examples of unoriginal, repetitive, or uninspired AI responses</CardDescription>
                <div className="mt-4 text-sm text-muted-foreground">
                  Average payout: <span className="font-semibold text-foreground">$5-12</span> per example
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-lg hover:shadow-xl transition-shadow fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-chart-4">Alignment Issues</CardTitle>
                  <Badge className="bg-chart-4 text-white">Research Focus</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>Cases where AI fails to understand or follow human intentions</CardDescription>
                <div className="mt-4 text-sm text-muted-foreground">
                  Average payout: <span className="font-semibold text-foreground">$15-30</span> per example
                </div>
              </CardContent>
            </Card>
            <Card className="glass border-0 shadow-lg hover:shadow-xl transition-shadow fade-in-up">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-chart-5">Context Failures</CardTitle>
                  <Badge className="bg-chart-5 text-white">Emerging</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Examples where AI loses track of conversation context or misunderstands
                </CardDescription>
                <div className="mt-4 text-sm text-muted-foreground">
                  Average payout: <span className="font-semibold text-foreground">$6-18</span> per example
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy & Trust */}
      <section id="privacy" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16 fade-in-up">
            <Badge className="mb-4 glass" variant="secondary">
              <Shield className="w-4 h-4 mr-2" />
              Your privacy is mathematically protected
            </Badge>
            <h2 className="text-4xl font-bold mb-4">Privacy & Trust</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Advanced cryptographic techniques ensure your data remains private while contributing to AI safety
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 fade-in-up">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-primary/20 to-accent/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Lock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Token Substitution</h3>
                  <p className="text-muted-foreground">
                    Sensitive identifiers like names, locations, and numbers are automatically replaced while preserving
                    the meaning and context of your conversations.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-accent/20 to-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Differential Privacy</h3>
                  <p className="text-muted-foreground">
                    Mathematical guarantees that your individual contributions cannot be reverse-engineered from the
                    final datasets.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-chart-3/20 to-chart-4/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-chart-3" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Decentralized Storage</h3>
                  <p className="text-muted-foreground">
                    Your data is distributed across multiple secure nodes. No single entity has access to your complete
                    information.
                  </p>
                </div>
              </div>
            </div>
            <Card className="glass border-0 shadow-xl p-8 scale-in">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">Trust Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data Anonymization</span>
                  <Badge className="bg-primary text-white">100%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payment Transparency</span>
                  <Badge className="bg-primary text-white">Blockchain Verified</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Data Retention</span>
                  <Badge className="bg-primary text-white">User Controlled</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Third-party Audits</span>
                  <Badge className="bg-primary text-white">Quarterly</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/5 to-accent/5">
        <div className="container mx-auto text-center fade-in-up">
          <h2 className="text-4xl font-bold mb-4">Ready to Start Contributing?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join the movement to build safer AI while contributing to groundbreaking research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="text-lg px-8 py-6 text-white font-semibold"
              className="bg-primary"
              asChild
            >
              <a href="/auth">
                <Upload className="w-5 h-5 mr-2" />
                Get Started Today
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6 glass bg-transparent border-primary/30">
              Learn More About Privacy
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t glass">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold">Pellucid</span>
              </div>
              <p className="text-muted-foreground">
                A transparent path to safer AI through privacy-preserving data contribution.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Contribute Data
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Browse Marketplace
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    API Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Privacy</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Data Protection
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Security Audits
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Discord
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    GitHub
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Pellucid. All rights reserved. Building safer AI together.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
