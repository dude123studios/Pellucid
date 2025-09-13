import { getDatabase, COLLECTIONS } from './mongodb'
import { ALIGNMENT_CATEGORIES } from './types'

export async function initializeDatabase() {
  try {
    const db = await getDatabase()
    
    // Create indexes for better performance
    await createIndexes(db)
    
    // Seed initial datasets if they don't exist
    await seedInitialDatasets(db)
    
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Database initialization failed:', error)
    throw error
  }
}

async function createIndexes(db: any) {
  // Users collection indexes
  await db.collection(COLLECTIONS.USERS).createIndex({ email: 1 }, { unique: true, sparse: true })
  await db.collection(COLLECTIONS.USERS).createIndex({ walletAddress: 1 }, { unique: true, sparse: true })
  await db.collection(COLLECTIONS.USERS).createIndex({ createdAt: -1 })

  // Submissions collection indexes
  await db.collection(COLLECTIONS.SUBMISSIONS).createIndex({ userId: 1 })
  await db.collection(COLLECTIONS.SUBMISSIONS).createIndex({ status: 1 })
  await db.collection(COLLECTIONS.SUBMISSIONS).createIndex({ createdAt: -1 })
  await db.collection(COLLECTIONS.SUBMISSIONS).createIndex({ categories: 1 })

  // Datasets collection indexes
  await db.collection(COLLECTIONS.DATASETS).createIndex({ category: 1 })
  await db.collection(COLLECTIONS.DATASETS).createIndex({ isActive: 1 })
  await db.collection(COLLECTIONS.DATASETS).createIndex({ price: 1 })
  await db.collection(COLLECTIONS.DATASETS).createIndex({ createdAt: -1 })
  await db.collection(COLLECTIONS.DATASETS).createIndex({ tags: 1 })

  // Transactions collection indexes
  await db.collection(COLLECTIONS.TRANSACTIONS).createIndex({ buyerId: 1 })
  await db.collection(COLLECTIONS.TRANSACTIONS).createIndex({ datasetId: 1 })
  await db.collection(COLLECTIONS.TRANSACTIONS).createIndex({ createdAt: -1 })
  await db.collection(COLLECTIONS.TRANSACTIONS).createIndex({ payoutDistributed: 1 })

  // Analyses collection indexes
  await db.collection(COLLECTIONS.ANALYSES).createIndex({ submissionId: 1 })
  await db.collection(COLLECTIONS.ANALYSES).createIndex({ category: 1 })
  await db.collection(COLLECTIONS.ANALYSES).createIndex({ createdAt: -1 })

  console.log('Database indexes created')
}

async function seedInitialDatasets(db: any) {
  const existingDatasets = await db.collection(COLLECTIONS.DATASETS).countDocuments()
  
  if (existingDatasets > 0) {
    console.log('Datasets already exist, skipping seed')
    return
  }

  const initialDatasets = [
    {
      category: 'Harmful Content',
      title: 'Harmful Content Detection Dataset',
      description: 'Comprehensive collection of AI responses containing bias, discrimination, and toxic language patterns for safety training.',
      price: 299.99,
      samples: [],
      buyerCount: 0,
      totalDownloads: 0,
      rating: 4.8,
      tags: ['bias', 'toxicity', 'safety', 'moderation'],
      severity: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      category: 'Hallucination',
      title: 'Hallucination Examples in Q&A',
      description: 'Factually incorrect responses from various AI models across different domains including science, history, and current events.',
      price: 199.99,
      samples: [],
      buyerCount: 0,
      totalDownloads: 0,
      rating: 4.6,
      tags: ['factual-errors', 'misinformation', 'accuracy'],
      severity: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      category: 'Reasoning Errors',
      title: 'Mathematical Reasoning Failures',
      description: 'Collection of logical fallacies and mathematical errors in AI problem-solving approaches.',
      price: 249.99,
      samples: [],
      buyerCount: 0,
      totalDownloads: 0,
      rating: 4.9,
      tags: ['logic', 'mathematics', 'problem-solving'],
      severity: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      category: 'Creativity Weakness',
      title: 'Creative Writing Repetition Patterns',
      description: 'Examples of repetitive, generic, and uninspired creative outputs from AI writing assistants.',
      price: 149.99,
      samples: [],
      buyerCount: 0,
      totalDownloads: 0,
      rating: 4.3,
      tags: ['creativity', 'writing', 'originality'],
      severity: 'low',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      category: 'Alignment Issues',
      title: 'Instruction Following Failures',
      description: 'Cases where AI models fail to follow specific user instructions or formatting requirements.',
      price: 329.99,
      samples: [],
      buyerCount: 0,
      totalDownloads: 0,
      rating: 4.7,
      tags: ['instructions', 'formatting', 'compliance'],
      severity: 'high',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    },
    {
      category: 'Context Failures',
      title: 'Context Loss in Long Conversations',
      description: 'Examples of AI losing track of conversation context in extended dialogues.',
      price: 179.99,
      samples: [],
      buyerCount: 0,
      totalDownloads: 0,
      rating: 4.4,
      tags: ['context', 'memory', 'conversation'],
      severity: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }
  ]

  await db.collection(COLLECTIONS.DATASETS).insertMany(initialDatasets)
  console.log('Initial datasets seeded')
}
