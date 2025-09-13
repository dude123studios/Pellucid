import { MongoClient, Db } from 'mongodb'

// Database collections
export const COLLECTIONS = {
  USERS: 'users',
  DATA: 'data',
  SUBMISSIONS: 'submissions',
  DATASETS: 'datasets',
  TRANSACTIONS: 'transactions',
  ANALYSES: 'analyses'
} as const

let client: MongoClient | null = null
let clientPromise: Promise<MongoClient> | null = null

// Connect to MongoDB - no fallbacks
if (!process.env.MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is required')
}

const uri = process.env.MONGODB_URI
const options = {
  // Add connection timeout
  serverSelectionTimeoutMS: 30000,
  connectTimeoutMS: 30000,
  // Retry options
  retryWrites: true,
  retryReads: true,
  // SSL options for MongoDB Atlas
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
  // Additional options to help with SSL issues
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
}

if (process.env.NODE_ENV === 'development') {
  // In development mode, use a global variable so that the value
  // is preserved across module reloads caused by HMR (Hot Module Replacement).
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production mode, it's best to not use a global variable.
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export async function getDatabase(): Promise<Db> {
  if (!clientPromise) {
    throw new Error('MongoDB client not initialized')
  }
  
  try {
    const client = await clientPromise
    // Test the connection by pinging the admin database
    await client.db('admin').command({ ping: 1 })
    return client.db('pellucid')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    throw new Error(`Failed to connect to MongoDB: ${error.message}`)
  }
}

export default clientPromise
