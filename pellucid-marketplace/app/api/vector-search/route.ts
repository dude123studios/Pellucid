import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { ObjectId } from 'mongodb'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

interface VectorSearchRequest {
  query: string
  limit?: number
  category?: string
  userId?: string
  similarityThreshold?: number
}

interface VectorSearchResult {
  dataId: string
  payload: string
  sanitizedPayload?: string
  label: string
  category: string
  similarity: number
  createdAt: Date
  hasEmbedding: boolean
}

export async function POST(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { 
      query, 
      limit = 10, 
      category, 
      userId, 
      similarityThreshold = 0.7 
    }: VectorSearchRequest = await request.json()

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 })
    }

    const db = await getDatabase()

    // Step 1: Generate embedding for the search query
    console.log('Generating embedding for search query:', query)
    const embeddingResponse = await fetch(`${PYTHON_SERVICE_URL}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: query,
        data_id: 'search_query',
        model: 'text-embedding-3-small'
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error(`Embedding generation failed: ${embeddingResponse.status}`)
    }

    const embeddingResult = await embeddingResponse.json()
    const queryEmbedding = embeddingResult.embedding

    // Step 2: Build the aggregation pipeline for vector search
    const pipeline: any[] = []

    // Match stage - filter by category and user if specified
    const matchStage: any = {
      embedding: { $exists: true, $ne: null }
    }

    if (category) {
      matchStage.category = category
    }

    if (userId) {
      matchStage.userId = new ObjectId(userId)
    }

    pipeline.push({ $match: matchStage })

    // Vector search stage using $vectorSearch (MongoDB Atlas Vector Search)
    pipeline.push({
      $vectorSearch: {
        index: "vector_index", // This should match your Atlas Vector Search index name
        path: "embedding",
        queryVector: queryEmbedding,
        numCandidates: limit * 10, // Search more candidates for better results
        limit: limit
      }
    })

    // Project stage - include similarity score and format results
    pipeline.push({
      $project: {
        _id: 1,
        payload: 1,
        sanitizedPayload: 1,
        label: 1,
        category: 1,
        createdAt: 1,
        embedding: 1,
        embeddingModel: 1,
        embeddingGeneratedAt: 1,
        score: { $meta: "vectorSearchScore" }
      }
    })

    // Add similarity threshold filter
    pipeline.push({
      $match: {
        score: { $gte: similarityThreshold }
      }
    })

    // Sort by similarity score
    pipeline.push({
      $sort: { score: -1 }
    })

    // Limit results
    pipeline.push({
      $limit: limit
    })

    try {
      // Execute the aggregation pipeline
      const results = await db.collection(COLLECTIONS.DATA).aggregate(pipeline).toArray()

      // Format results
      const formattedResults: VectorSearchResult[] = results.map((result: any) => ({
        dataId: result._id.toString(),
        payload: result.payload,
        sanitizedPayload: result.sanitizedPayload,
        label: result.label,
        category: result.category,
        similarity: result.score,
        createdAt: result.createdAt,
        hasEmbedding: !!result.embedding
      }))

      return NextResponse.json({
        success: true,
        query,
        results: formattedResults,
        totalResults: formattedResults.length,
        similarityThreshold,
        embeddingModel: embeddingResult.model,
        processingTimeMs: embeddingResult.processingTimeMs
      })

    } catch (vectorSearchError) {
      console.warn('Vector search failed, falling back to text search:', vectorSearchError)
      
      // Fallback to text-based search if vector search fails
      const textSearchResults = await db.collection(COLLECTIONS.DATA)
        .find({
          $and: [
            { embedding: { $exists: true, $ne: null } },
            category ? { category } : {},
            userId ? { userId: new ObjectId(userId) } : {},
            {
              $or: [
                { payload: { $regex: query, $options: 'i' } },
                { label: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
              ]
            }
          ]
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray()

      const formattedTextResults: VectorSearchResult[] = textSearchResults.map((result: any) => ({
        dataId: result._id.toString(),
        payload: result.payload,
        sanitizedPayload: result.sanitizedPayload,
        label: result.label,
        category: result.category,
        similarity: 0.5, // Default similarity for text search
        createdAt: result.createdAt,
        hasEmbedding: !!result.embedding
      }))

      return NextResponse.json({
        success: true,
        query,
        results: formattedTextResults,
        totalResults: formattedTextResults.length,
        similarityThreshold,
        embeddingModel: embeddingResult.model,
        processingTimeMs: embeddingResult.processingTimeMs,
        fallbackUsed: true,
        warning: 'Vector search failed, used text-based search instead'
      })
    }

  } catch (error) {
    console.error('Vector search error:', error)
    return NextResponse.json({ error: 'Vector search failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const category = searchParams.get('category')

    const db = await getDatabase()

    // Get statistics about embeddings
    const totalDataObjects = await db.collection(COLLECTIONS.DATA).countDocuments()
    const objectsWithEmbeddings = await db.collection(COLLECTIONS.DATA).countDocuments({
      embedding: { $exists: true, $ne: null }
    })

    // Get recent data objects with embeddings
    const recentObjects = await db.collection(COLLECTIONS.DATA)
      .find({
        embedding: { $exists: true, $ne: null },
        ...(category ? { category } : {})
      })
      .sort({ embeddingGeneratedAt: -1 })
      .limit(limit)
      .toArray()

    return NextResponse.json({
      totalDataObjects,
      objectsWithEmbeddings,
      embeddingCoverage: totalDataObjects > 0 ? (objectsWithEmbeddings / totalDataObjects) * 100 : 0,
      recentObjects: recentObjects.map(obj => ({
        dataId: obj._id.toString(),
        label: obj.label,
        category: obj.category,
        embeddingModel: obj.embeddingModel,
        embeddingGeneratedAt: obj.embeddingGeneratedAt,
        embeddingDimensions: obj.embedding?.length || 0
      }))
    })

  } catch (error) {
    console.error('Vector search stats error:', error)
    return NextResponse.json({ error: 'Failed to get vector search statistics' }, { status: 500 })
  }
}
