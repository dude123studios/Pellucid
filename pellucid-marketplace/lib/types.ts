import { ObjectId } from 'mongodb'

// User model - updated with proper authentication fields
export interface User {
  _id: ObjectId
  email: string // primary identifier for login
  password: string // encrypted password
  name: string // user's display name
  walletAddress?: string // optional blockchain address for payouts
  createdAt: Date
  totalEarnings: number
  submissions: ObjectId[] // refs to conversations
  isActive: boolean // account status
}

// Data object model - individual data points
export interface Data {
  _id: ObjectId
  userId: ObjectId // ref to users
  createdAt: Date
  payload: string // the actual data content
  label: string // user-provided label/description
  category: string // user-selected category
  sanitizedPayload?: string // privacy-filtered version
  isSanitized: boolean // whether privacy filtering has been applied
  embedding?: number[] // vector embedding for MongoDB Atlas vector search
  embeddingModel?: string // OpenAI model used for embedding
  embeddingGeneratedAt?: Date // when embedding was created
}

// Submission model - updated to reference Data objects
export interface Submission {
  _id: ObjectId
  userId: ObjectId // ref to users
  dataIds: ObjectId[] // refs to individual Data objects
  originalDataHash: string // hash of original data for audit
  critiques: string[] // e.g., ["lack of creativity", "hallucination"]
  categories: string[] // ["harm", "hallucination"]
  createdAt: Date
  usageCount: number // increments when researchers purchase dataset containing this sample
}

// Dataset model - matches exact schema
export interface Dataset {
  _id: ObjectId
  category: string // e.g. "hallucination"
  description: string
  submissions: ObjectId[] // list of sample refs
  price: number
  buyers: ObjectId[] // ref to researchers who purchased
  createdAt: Date
}

// Transaction model - matches exact schema
export interface Transaction {
  _id: ObjectId
  buyerId: ObjectId
  datasetId: ObjectId
  amountPaid: number
  payoutDistributed: boolean
  createdAt: Date
}

// Analysis result model
export interface AnalysisResult {
  _id: ObjectId
  submissionId: ObjectId
  category: string
  severity: 'low' | 'medium' | 'high'
  confidence: number
  description: string
  excerpt: string
  estimatedValue: number
  createdAt: Date
}

// API Request/Response types
export interface ContributeRequest {
  dataIds: string[] // Array of Data object IDs to submit
}

export interface ContributeResponse {
  success: boolean
  submissionId: string
  status: string
  privacyScore: number
  dataCount: number
}

export interface AnalysisRequest {
  text: string
  files?: Array<{
    name: string
    size: number
  }>
}

export interface AnalysisResponse {
  results: Array<{
    id: string
    category: string
    severity: 'low' | 'medium' | 'high'
    confidence: number
    description: string
    excerpt: string
    estimatedValue: number
  }>
  totalValue: number
  processingTime: number
  privacyScore: number
}

export interface MarketplaceResponse {
  datasets: Array<{
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
    severity: 'low' | 'medium' | 'high'
    preview: string
  }>
  totalCount: number
  categories: Array<{
    name: string
    count: number
    avgPrice: number
  }>
}

export interface DashboardResponse {
  totalEarnings: number
  pendingPayments: number
  totalContributions: number
  activeDatasets: number
  recentContributions: Array<{
    id: string
    title: string
    category: string
    status: string
    earnings: number
    date: string
    downloads: number
  }>
  paymentHistory: Array<{
    id: string
    amount: number
    date: string
    txHash: string
    status: string
  }>
}

export interface PurchaseRequest {
  datasetId: string
  buyerId: string
}

export interface PurchaseResponse {
  transactionId: string
  amount: number
  contributors: number
  estimatedPayout: number
}

// Privacy protection types
export interface PrivacyConfig {
  enableTokenSubstitution: boolean
  enableDifferentialPrivacy: boolean
  privacyLevel: 'standard' | 'enhanced' | 'maximum'
  preserveContext: boolean
}

export interface SanitizationResult {
  sanitizedText: string
  replacements: Array<{
    original: string
    replacement: string
    type: string
    confidence: number
  }>
  privacyScore: number
  contextPreserved: boolean
}

// Alignment categories with pricing
export const ALIGNMENT_CATEGORIES = {
  'Harmful Content': {
    baseValue: 18,
    severity: 'high' as const,
    keywords: ['offensive', 'bias', 'discriminat', 'hate', 'toxic', 'inappropriate']
  },
  'Hallucination': {
    baseValue: 12,
    severity: 'medium' as const,
    keywords: ['incorrect', 'false', 'wrong', 'inaccurate', 'made up', 'fictional']
  },
  'Reasoning Errors': {
    baseValue: 15,
    severity: 'high' as const,
    keywords: ['illogical', 'contradiction', 'fallacy', 'invalid', 'flawed logic']
  },
  'Creativity Weakness': {
    baseValue: 8,
    severity: 'low' as const,
    keywords: ['generic', 'repetitive', 'boring', 'uninspired', 'template']
  },
  'Alignment Issues': {
    baseValue: 22,
    severity: 'high' as const,
    keywords: ['misunderstood', 'ignored request', 'unhelpful', 'off-topic']
  },
  'Context Failures': {
    baseValue: 10,
    severity: 'medium' as const,
    keywords: ['lost context', 'forgot', 'inconsistent', 'confused']
  }
} as const

export type AlignmentCategory = keyof typeof ALIGNMENT_CATEGORIES
