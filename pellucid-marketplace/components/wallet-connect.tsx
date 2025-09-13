"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Wallet, CheckCircle, ExternalLink } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface WalletConnectProps {
  className?: string
}

export function WalletConnect({ className }: WalletConnectProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if user is already authenticated
    const token = localStorage.getItem("auth_token")
    if (token) {
      // In a real app, you'd verify the token and get user info
      // For now, we'll just show as connected
      setIsConnected(true)
      setWalletAddress("0x1234...5678") // Mock address
    }
  }, [])

  const handleConnect = async () => {
    setIsConnecting(true)

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
        setWalletAddress(mockAddress)
        setIsConnected(true)
      } else {
        const errorData = await response.json()
        console.error("Wallet connection failed:", errorData.error)
        alert("Wallet connection failed. Please try again.")
      }
    } catch (error) {
      console.error("Wallet connection error:", error)
      alert("Wallet connection failed. Please try again.")
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = () => {
    setIsConnected(false)
    setWalletAddress(null)
    localStorage.removeItem("auth_token")
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnected && walletAddress) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className={`glass ${className}`}>
            <CheckCircle className="w-4 h-4 mr-2 text-chart-4" />
            {formatAddress(walletAddress)}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="glass">
          <DropdownMenuItem className="flex items-center gap-2">
            <div className="w-2 h-2 bg-chart-4 rounded-full"></div>
            Connected
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <ExternalLink className="w-4 h-4 mr-2" />
            View on Explorer
          </DropdownMenuItem>
          <DropdownMenuItem>Copy Address</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button variant="outline" className={`glass ${className}`} onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
          Connecting...
        </>
      ) : (
        <>
          <Wallet className="w-4 h-4 mr-2" />
          Connect Wallet
        </>
      )}
    </Button>
  )
}
