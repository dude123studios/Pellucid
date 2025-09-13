import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { User } from '@/lib/types'
import { ObjectId } from 'mongodb'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createApiResponse, createErrorResponse, handleApiError, validateRequiredFields, validateEmail, sanitizeInput } from '@/lib/api-helpers'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-pellucid-marketplace-2024'
console.log('🔑 JWT_SECRET loaded:', JWT_SECRET ? 'Yes' : 'No')
const BCRYPT_ROUNDS = 12

export async function POST(request: NextRequest) {
  try {
    const { action, email, password, name, walletAddress, confirmPassword } = await request.json()
    const db = await getDatabase()

    if (action === 'login') {
      return await handleLogin(db, email, password)
    } else if (action === 'signup') {
      return await handleSignup(db, email, password, name, confirmPassword)
    } else if (action === 'wallet-connect') {
      return await handleWalletConnect(db, walletAddress)
    } else {
      return createErrorResponse('Invalid action', 400)
    }
  } catch (error) {
    return handleApiError(error, 'Authentication')
  }
}

async function handleLogin(db: any, email: string, password: string) {
  // Validate input
  if (!email || !password) {
    return createErrorResponse('Email and password are required', 400)
  }

  if (!validateEmail(email)) {
    return createErrorResponse('Invalid email format', 400)
  }

  // Find user by email
  const user = await db.collection(COLLECTIONS.USERS).findOne({ email: email.toLowerCase() })
  
  if (!user) {
    return createErrorResponse('Invalid email or password', 401)
  }

  if (!user.isActive) {
    return createErrorResponse('Account is deactivated', 401)
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password)
  if (!isValidPassword) {
    return createErrorResponse('Invalid email or password', 401)
  }
  
  const token = jwt.sign(
    { 
      userId: user._id.toString(), 
      email: user.email,
      walletAddress: user.walletAddress 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return createApiResponse({
    success: true,
    token,
    user: {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      walletAddress: user.walletAddress,
      totalEarnings: user.totalEarnings
    }
  })
}

async function handleSignup(db: any, email: string, password: string, name: string, confirmPassword?: string) {
  // Validate input
  if (!email || !password || !name) {
    return createErrorResponse('Email, password, and name are required', 400)
  }

  if (!validateEmail(email)) {
    return createErrorResponse('Invalid email format', 400)
  }

  if (password.length < 8) {
    return createErrorResponse('Password must be at least 8 characters long', 400)
  }

  if (confirmPassword && password !== confirmPassword) {
    return createErrorResponse('Passwords do not match', 400)
  }

  // Check if user already exists
  const existingUser = await db.collection(COLLECTIONS.USERS).findOne({ email: email.toLowerCase() })
  if (existingUser) {
    return createErrorResponse('User with this email already exists', 409)
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS)

  // Generate wallet address (optional for future blockchain integration)
  const crypto = require('crypto')
  const walletAddress = `0x${crypto.createHash('sha256').update(email).digest('hex').substring(0, 40)}`
  
  const newUser: Omit<User, '_id'> = {
    email: email.toLowerCase(),
    password: hashedPassword,
    name: sanitizeInput(name),
    walletAddress,
    createdAt: new Date(),
    totalEarnings: 0,
    submissions: [],
    isActive: true
  }

  const result = await db.collection(COLLECTIONS.USERS).insertOne(newUser)
  
  const token = jwt.sign(
    { 
      userId: result.insertedId.toString(), 
      email: newUser.email,
      walletAddress: newUser.walletAddress 
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return createApiResponse({
    success: true,
    token,
    user: {
      id: result.insertedId.toString(),
      email: newUser.email,
      name: newUser.name,
      walletAddress: newUser.walletAddress,
      totalEarnings: 0
    }
  })
}

async function handleWalletConnect(db: any, walletAddress: string) {
  // For demo purposes, create a user if they don't exist
  let user = await db.collection(COLLECTIONS.USERS).findOne({ walletAddress })
  
  if (!user) {
    const newUser: Omit<User, '_id'> = {
      walletAddress,
      createdAt: new Date(),
      totalEarnings: 0,
      submissions: []
    }

    const result = await db.collection(COLLECTIONS.USERS).insertOne(newUser)
    user = { ...newUser, _id: result.insertedId }
  }

  const token = jwt.sign(
    { userId: user._id.toString(), walletAddress },
    JWT_SECRET,
    { expiresIn: '7d' }
  )

  return createApiResponse({
    success: true,
    token,
    user: {
      id: user._id.toString(),
      email: 'wallet@example.com',
      name: 'Wallet User',
      walletAddress: user.walletAddress,
      totalEarnings: user.totalEarnings
    }
  })
}

// Verify JWT token
export async function verifyToken(request: NextRequest): Promise<{ userId: string; email?: string; walletAddress?: string } | null> {
  try {
    const authHeader = request.headers.get('authorization')
    console.log('🔍 verifyToken: Auth header:', authHeader ? 'Present' : 'Missing')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('❌ verifyToken: No Bearer token found')
      return null
    }

    const token = authHeader.substring(7)
    console.log('🔑 verifyToken: Token length:', token.length)
    
    const decoded = jwt.verify(token, JWT_SECRET) as any
    console.log('✅ verifyToken: Token verified successfully for user:', decoded.userId)
    
    return {
      userId: decoded.userId,
      email: decoded.email,
      walletAddress: decoded.walletAddress
    }
  } catch (error) {
    console.log('❌ verifyToken: Token verification failed:', error.message)
    return null
  }
}
