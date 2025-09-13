"use client"

import { useState, useEffect } from "react"
import { Shield, User, LogOut, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { WalletConnect } from "@/components/wallet-connect"
import Image from "next/image"

export function Navigation() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('auth_token')
    if (token) {
      try {
        // Decode JWT token to get user info
        const payload = JSON.parse(atob(token.split('.')[1]))
        setIsLoggedIn(true)
        setUserEmail(payload.email || 'User')
      } catch (error) {
        // Invalid token, remove it
        localStorage.removeItem('auth_token')
        setIsLoggedIn(false)
        setUserEmail(null)
      }
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    setIsLoggedIn(false)
    setUserEmail(null)
    window.location.href = '/'
  }

  return (
    <nav className="fixed top-0 w-full z-50 glass rounded-none border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <a href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 relative">
                <Image
                  src="/pellucid-logo.png"
                  alt="Pellucid Logo"
                  fill
                  className="object-contain rounded-lg"
                />
              </div>
              <span className="text-xl font-bold text-foreground">Pellucid</span>
            </a>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <a href="/contribute" className="text-muted-foreground hover:text-foreground transition-colors">
              Contribute
            </a>
            <a href="/marketplace" className="text-muted-foreground hover:text-foreground transition-colors">
              Marketplace
            </a>
            <a href="/token-prices" className="text-muted-foreground hover:text-foreground transition-colors">
              Token Prices
            </a>
            <a href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
              Dashboard
            </a>
            <a href="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </a>
            
            {/* Login/Logout Section */}
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span>{userEmail}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="glass bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="glass bg-transparent"
                >
                  <a href="/auth">
                    <LogIn className="w-4 h-4 mr-2" />
                    Login
                  </a>
                </Button>
                <WalletConnect />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
