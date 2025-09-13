import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { createApiResponse, createErrorResponse, handleApiError } from '@/lib/api-helpers'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Get all transactions with their associated datasets and submissions
    const transactions = await db.collection(COLLECTIONS.TRANSACTIONS)
      .aggregate([
        {
          $lookup: {
            from: COLLECTIONS.DATASETS,
            localField: 'datasetId',
            foreignField: '_id',
            as: 'dataset'
          }
        },
        {
          $unwind: '$dataset'
        },
        {
          $lookup: {
            from: COLLECTIONS.SUBMISSIONS,
            localField: 'dataset.submissions',
            foreignField: '_id',
            as: 'submissions'
          }
        },
        {
          $unwind: '$submissions'
        },
        {
          $project: {
            _id: 1,
            amountPaid: 1,
            createdAt: 1,
            'dataset.category': 1,
            'submissions.categories': 1,
            'submissions.createdAt': 1
          }
        },
        {
          $sort: { createdAt: 1 }
        }
      ])
      .toArray()

    // Always generate sample data for demonstration (remove this when you have real data)
    const sampleData = generateSampleMarketData()
    return createApiResponse(sampleData)

    // Process real transaction data
    const marketData = transactions.map((transaction, index) => {
      // Calculate cost per token (assuming each submission represents a token)
      const costPerToken = transaction.amountPaid / (transaction.submissions?.categories?.length || 1)
      
      return {
        id: transaction._id.toString(),
        categories: transaction.submissions?.categories || [transaction.dataset?.category || 'General'],
        timestamp: transaction.createdAt.toISOString(),
        cost_usd: Math.max(0.0001, costPerToken) // Ensure minimum value for chart
      }
    })

    // Add some recent sample data if we have very few transactions
    if (marketData.length < 10) {
      const additionalSampleData = generateSampleMarketData(10 - marketData.length)
      marketData.push(...additionalSampleData)
    }

    return createApiResponse(marketData)

  } catch (error) {
    return handleApiError(error, 'Market Stats')
  }
}

function generateSampleMarketData(count: number = 100) {
  const categories = [
    'Harmful Content',
    'Hallucination', 
    'Reasoning Errors',
    'Creativity Weakness',
    'Alignment Issues',
    'Context Failures',
    'Bias',
    'Misinformation',
    'Good Response'
  ]

  // Base prices for each category (in USD per token)
  const basePrices = {
    'Harmful Content': 0.25,
    'Hallucination': 0.18,
    'Reasoning Errors': 0.20,
    'Creativity Weakness': 0.15,
    'Alignment Issues': 0.30,
    'Context Failures': 0.16,
    'Bias': 0.22,
    'Misinformation': 0.19,
    'Good Response': 0.12
  }

  const data = []
  const now = new Date()
  
  // Generate data for the last 30 days with realistic patterns
  for (let i = 0; i < count; i++) {
    // Create timestamps over the last 30 days
    const daysAgo = Math.floor(i / (count / 30))
    const hoursInDay = (i % (count / 30)) * (24 / (count / 30))
    const timestamp = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000 - hoursInDay * 60 * 60 * 1000)
    
    const category = categories[Math.floor(Math.random() * categories.length)]
    const basePrice = basePrices[category as keyof typeof basePrices] || 0.15
    
    // Add realistic market dynamics
    const dayVariation = (Math.random() - 0.5) * 0.1 // ±5% daily variation
    const trendFactor = Math.sin((count - i) / count * Math.PI * 4) * 0.05 // Weekly cycles
    const volumeFactor = Math.random() * 0.03 // Random market noise
    
    const finalPrice = Math.max(0.01, basePrice * (1 + dayVariation + trendFactor + volumeFactor))
    
    data.push({
      id: `market_${i}`,
      categories: [category],
      timestamp: timestamp.toISOString(),
      cost_usd: Math.round(finalPrice * 1000) / 1000
    })
  }
  
  // Sort by timestamp
  return data.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
}
