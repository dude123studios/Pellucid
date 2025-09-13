"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Shield, Wallet, Mail, Lock, User, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import Image from "next/image"

export default function AuthPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectedWallet, setConnectedWallet] = useState<string | null>(null)
  const [loginForm, setLoginForm] = useState({
    email: "",
    password: "",
  })
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  
  // Error and loading states
  const [loginError, setLoginError] = useState<string | null>(null)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [walletError, setWalletError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSignupLoading, setIsSignupLoading] = useState(false)
  
  // Validation states
  const [loginValidation, setLoginValidation] = useState<{[key: string]: string}>({})
  const [signupValidation, setSignupValidation] = useState<{[key: string]: string}>({})

  // Helper functions to clear errors when user starts typing
  const clearLoginError = () => {
    if (loginError) setLoginError(null)
  }
  
  const clearSignupError = () => {
    if (signupError) setSignupError(null)
  }
  
  const clearWalletError = () => {
    if (walletError) setWalletError(null)
  }

  const handleWalletConnect = async (walletType: string) => {
    setIsConnecting(true)
    setWalletError(null)

    try {
      // Simulate wallet connection
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const mockAddress = `0x${Math.random().toString(16).substr(2, 40)}`
      
      // Connect wallet via backend
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "wallet-connect",
          walletAddress: mockAddress,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("auth_token", data.token)
        setConnectedWallet(mockAddress)
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        setWalletError(errorData.error || "Wallet connection failed")
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      setWalletError("Network error. Please check your connection and try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError(null)
    setLoginValidation({})

    // Client-side validation
    const validation: {[key: string]: string} = {}
    
    if (!loginForm.email) {
      validation.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginForm.email)) {
      validation.email = "Please enter a valid email address"
    }
    
    if (!loginForm.password) {
      validation.password = "Password is required"
    }
    
    if (Object.keys(validation).length > 0) {
      setLoginValidation(validation)
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "login",
          email: loginForm.email,
          password: loginForm.password,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("auth_token", data.token)
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        setLoginError(errorData.error || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      setLoginError("Network error. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSignupLoading(true)
    setSignupError(null)
    setSignupValidation({})
    
    // Client-side validation
    const validation: {[key: string]: string} = {}
    
    if (!signupForm.name.trim()) {
      validation.name = "Full name is required"
    } else if (signupForm.name.trim().length < 2) {
      validation.name = "Name must be at least 2 characters long"
    }
    
    if (!signupForm.email) {
      validation.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(signupForm.email)) {
      validation.email = "Please enter a valid email address"
    }
    
    if (!signupForm.password) {
      validation.password = "Password is required"
    } else if (signupForm.password.length < 8) {
      validation.password = "Password must be at least 8 characters long"
    }
    
    if (!signupForm.confirmPassword) {
      validation.confirmPassword = "Please confirm your password"
    } else if (signupForm.password !== signupForm.confirmPassword) {
      validation.confirmPassword = "Passwords do not match"
    }
    
    if (Object.keys(validation).length > 0) {
      setSignupValidation(validation)
      setIsSignupLoading(false)
      return
    }
    
    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "signup",
          email: signupForm.email,
          password: signupForm.password,
          name: signupForm.name,
          confirmPassword: signupForm.confirmPassword,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        localStorage.setItem("auth_token", data.token)
        router.push("/dashboard")
      } else {
        const errorData = await response.json()
        setSignupError(errorData.error || "Signup failed")
      }
    } catch (error) {
      console.error("Signup error:", error)
      setSignupError("Network error. Please check your connection and try again.")
    } finally {
      setIsSignupLoading(false)
    }
  }

  const walletOptions = [
    {
      name: "MetaMask",
      icon: "🦊",
      description: "Connect using MetaMask wallet",
      popular: true,
    },
    {
      name: "WalletConnect",
      icon: "🔗",
      description: "Connect with WalletConnect protocol",
      popular: false,
    },
    {
      name: "Coinbase Wallet",
      icon: "🔵",
      description: "Connect using Coinbase Wallet",
      popular: true,
    },
    {
      name: "Rainbow",
      icon: "🌈",
      description: "Connect with Rainbow wallet",
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Back Button */}
          <Button variant="ghost" className="mb-6 glass bg-transparent" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 relative">
                <Image
                  src="/pellucid-logo.png"
                  alt="Pellucid Logo"
                  fill
                  className="object-contain rounded-xl"
                />
              </div>
              <h1 className="text-4xl font-bold">Welcome to Pellucid</h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join the AI alignment data marketplace. Contribute data, earn rewards, and help build safer AI systems.
            </p>
          </div>

          {/* Auth Tabs */}
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="space-y-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Sign In
                  </CardTitle>
                  <CardDescription>
                    Sign in with your email and password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loginError && (
                    <Alert className="mb-4 border-destructive/50 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{loginError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="login-email">Email</Label>
                      <Input
                        id="login-email"
                        type="email"
                        placeholder="Enter your email"
                        value={loginForm.email}
                        onChange={(e) => {
                          setLoginForm({ ...loginForm, email: e.target.value })
                          clearLoginError()
                          if (loginValidation.email) {
                            setLoginValidation({ ...loginValidation, email: '' })
                          }
                        }}
                        className={loginValidation.email ? "border-destructive" : ""}
                        required
                      />
                      {loginValidation.email && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {loginValidation.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="login-password">Password</Label>
                      <div className="relative">
                        <Input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={loginForm.password}
                          onChange={(e) => {
                            setLoginForm({ ...loginForm, password: e.target.value })
                            clearLoginError()
                            if (loginValidation.password) {
                              setLoginValidation({ ...loginValidation, password: '' })
                            }
                          }}
                          className={loginValidation.password ? "border-destructive" : ""}
                          required
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                      {loginValidation.password && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {loginValidation.password}
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Signing In...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="signup" className="space-y-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Create Account
                  </CardTitle>
                  <CardDescription>
                    Sign up with your email and password
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {signupError && (
                    <Alert className="mb-4 border-destructive/50 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{signupError}</AlertDescription>
                    </Alert>
                  )}
                  
                  <form onSubmit={handleSignup} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-name">Full Name</Label>
                      <Input
                        id="signup-name"
                        type="text"
                        placeholder="Enter your full name"
                        value={signupForm.name}
                        onChange={(e) => {
                          setSignupForm({ ...signupForm, name: e.target.value })
                          clearSignupError()
                          if (signupValidation.name) {
                            setSignupValidation({ ...signupValidation, name: '' })
                          }
                        }}
                        className={signupValidation.name ? "border-destructive" : ""}
                        required
                      />
                      {signupValidation.name && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {signupValidation.name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        placeholder="Enter your email"
                        value={signupForm.email}
                        onChange={(e) => {
                          setSignupForm({ ...signupForm, email: e.target.value })
                          clearSignupError()
                          if (signupValidation.email) {
                            setSignupValidation({ ...signupValidation, email: '' })
                          }
                        }}
                        className={signupValidation.email ? "border-destructive" : ""}
                        required
                      />
                      {signupValidation.email && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {signupValidation.email}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        placeholder="Create a password (min 8 characters)"
                        value={signupForm.password}
                        onChange={(e) => {
                          setSignupForm({ ...signupForm, password: e.target.value })
                          clearSignupError()
                          if (signupValidation.password) {
                            setSignupValidation({ ...signupValidation, password: '' })
                          }
                        }}
                        className={signupValidation.password ? "border-destructive" : ""}
                        required
                      />
                      {signupValidation.password && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {signupValidation.password}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signup-confirm">Confirm Password</Label>
                      <Input
                        id="signup-confirm"
                        type="password"
                        placeholder="Confirm your password"
                        value={signupForm.confirmPassword}
                        onChange={(e) => {
                          setSignupForm({ ...signupForm, confirmPassword: e.target.value })
                          clearSignupError()
                          if (signupValidation.confirmPassword) {
                            setSignupValidation({ ...signupValidation, confirmPassword: '' })
                          }
                        }}
                        className={signupValidation.confirmPassword ? "border-destructive" : ""}
                        required
                      />
                      {signupValidation.confirmPassword && (
                        <p className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {signupValidation.confirmPassword}
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isSignupLoading}>
                      {isSignupLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Creating Account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex items-center my-8">
            <Separator className="flex-1" />
            <span className="px-4 text-sm text-muted-foreground">OR</span>
            <Separator className="flex-1" />
          </div>

          {/* Wallet Connect */}
          <Card className="glass border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="w-5 h-5" />
                Connect Wallet
              </CardTitle>
              <CardDescription>
                Connect your crypto wallet to get started
              </CardDescription>
            </CardHeader>
            <CardContent>
              {walletError && (
                <Alert className="mb-4 border-destructive/50 text-destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{walletError}</AlertDescription>
                </Alert>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walletOptions.map((wallet) => (
                  <Button
                    key={wallet.name}
                    variant="outline"
                    className="h-auto p-4 glass bg-transparent hover:bg-secondary/50"
                    onClick={() => {
                      handleWalletConnect(wallet.name)
                      clearWalletError()
                    }}
                    disabled={isConnecting}
                  >
                    <div className="flex items-center gap-4 w-full">
                      <div className="text-2xl">{wallet.icon}</div>
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{wallet.name}</span>
                          {wallet.popular && (
                            <Badge variant="secondary" className="text-xs">
                              Popular
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{wallet.description}</div>
                      </div>
                      {isConnecting && (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Getting Started */}
          <Card className="glass border-0 shadow-lg mt-8">
            <CardHeader>
              <CardTitle>Getting Started</CardTitle>
              <CardDescription>
                Once you've created your account and connected your wallet, you can immediately start contributing data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="flex-1 text-white font-semibold"
                  style={{ background: "linear-gradient(135deg, #00d4aa, #0ea5e9)" }}
                  asChild
                >
                  <a href="/contribute">Start Contributing</a>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 glass bg-transparent"
                  asChild
                >
                  <a href="/marketplace">Browse Marketplace</a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}