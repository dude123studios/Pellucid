import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { MarketplaceResponse, Dataset, ALIGNMENT_CATEGORIES } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const datasetId = searchParams.get('datasetId')
    
    // If requesting a specific dataset by ID
    if (datasetId) {
      const db = await getDatabase()
      const dataset = await db.collection(COLLECTIONS.DATASETS).findOne({
        _id: new ObjectId(datasetId)
      })
      
      if (!dataset) {
        return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
      }
      
      return NextResponse.json(dataset)
    }
    
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'popular'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const db = await getDatabase()

    // Build query - remove isActive filter since our synthetic datasets don't have this field
    const query: any = {}
    
    if (category && category !== 'all') {
      query.category = category
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ]
    }

    // Build sort
    let sort: any = { createdAt: -1 }
    switch (sortBy) {
      case 'popular':
        sort = { buyerCount: -1, totalDownloads: -1 }
        break
      case 'newest':
        sort = { createdAt: -1 }
        break
      case 'price-low':
        sort = { price: 1 }
        break
      case 'price-high':
        sort = { price: -1 }
        break
      case 'rating':
        sort = { rating: -1 }
        break
    }

    // Get datasets
    const skip = (page - 1) * limit
    const datasets = await db.collection(COLLECTIONS.DATASETS)
      .find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .toArray()

    // Get total count
    const totalCount = await db.collection(COLLECTIONS.DATASETS).countDocuments(query)

    // Get category statistics
    const categoryStats = await db.collection(COLLECTIONS.DATASETS).aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    ]).toArray()

    // Format response
    const response: MarketplaceResponse = {
      datasets: datasets.map(dataset => ({
        id: dataset._id.toString(),
        title: dataset.category + ' Dataset', // Use category as title
        category: dataset.category,
        description: dataset.description,
        price: dataset.price,
        samples: dataset.sampleCount || dataset.submissions?.length || 0,
        rating: 4.0 + Math.random() * 1.0, // Mock rating
        downloads: dataset.usageCount || 0,
        createdAt: dataset.createdAt.toISOString(),
        tags: generateTags(dataset.category),
        severity: ALIGNMENT_CATEGORIES[dataset.category as keyof typeof ALIGNMENT_CATEGORIES]?.severity || 'medium',
        preview: generatePreview(dataset.category, dataset.sampleCount || 0)
      })),
      totalCount,
      categories: categoryStats.map(stat => ({
        name: stat._id,
        count: stat.count,
        avgPrice: Math.round(stat.avgPrice)
      }))
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Marketplace fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch marketplace data' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // This would typically be admin-only in production
    const { category, title, description, submissionIds, price } = await request.json()

    if (!category || !title || !description || !submissionIds || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const db = await getDatabase()

    // Verify submissions exist and are approved
    const submissions = await db.collection(COLLECTIONS.SUBMISSIONS).find({
      _id: { $in: submissionIds.map((id: string) => new ObjectId(id)) },
      status: 'approved'
    }).toArray()

    if (submissions.length !== submissionIds.length) {
      return NextResponse.json({ error: 'Some submissions not found or not approved' }, { status: 400 })
    }

    // Create dataset
    const dataset: Omit<Dataset, '_id'> = {
      category,
      title,
      description,
      samples: submissionIds.map((id: string) => new ObjectId(id)),
      price,
      buyerCount: 0,
      totalDownloads: 0,
      rating: 4.0 + Math.random() * 1.0, // Mock rating
      tags: generateTags(category),
      severity: ALIGNMENT_CATEGORIES[category as keyof typeof ALIGNMENT_CATEGORIES]?.severity || 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true
    }

    const result = await db.collection(COLLECTIONS.DATASETS).insertOne(dataset)

    return NextResponse.json({
      success: true,
      datasetId: result.insertedId.toString()
    })
  } catch (error) {
    console.error('Dataset creation error:', error)
    return NextResponse.json({ error: 'Failed to create dataset' }, { status: 500 })
  }
}

function generatePreview(category: string, sampleCount: number): string {
  const previews = {
    'Harmful Content': `AI: "I think people from [LOCATION] are generally less intelligent..." - Clear example of harmful bias that needs to be addressed in AI training.`,
    'Hallucination': `Human: "When was the iPhone first released?" AI: "The iPhone was first released in 2009..." - Incorrect date (actual: 2007)`,
    'Reasoning Errors': `Human: "What is 15% of 200?" AI: "To find 15% of 200, I multiply 200 by 15 which equals 3000..." - Incorrect calculation method`,
    'Creativity Weakness': `Human: "Write a unique story about space exploration" AI: "Once upon a time, in a galaxy far, far away..." - Overused opening`,
    'Alignment Issues': `Human: "List 5 items in bullet points" AI: "Here are five items: 1. First item 2. Second item..." - Used numbers instead of bullets`,
    'Context Failures': `Turn 15: Human: "What was my original question?" AI: "I apologize, but I don't recall your original question..." - Lost context`
  }

  return previews[category as keyof typeof previews] || `Sample ${category.toLowerCase()} data with ${sampleCount} examples.`
}

function generateTags(category: string): string[] {
  const tagMap = {
    'Harmful Content': ['bias', 'toxicity', 'safety', 'moderation'],
    'Hallucination': ['factual-errors', 'misinformation', 'accuracy'],
    'Reasoning Errors': ['logic', 'mathematics', 'problem-solving'],
    'Creativity Weakness': ['creativity', 'writing', 'originality'],
    'Alignment Issues': ['instructions', 'formatting', 'compliance'],
    'Context Failures': ['context', 'memory', 'conversation']
  }

  return tagMap[category as keyof typeof tagMap] || ['ai-safety', 'alignment']
}
