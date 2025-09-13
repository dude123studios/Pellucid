import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { ObjectId } from 'mongodb'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

interface EmbeddingRequest {
  dataId: string
  model?: string
}

interface EmbeddingResponse {
  dataId: string
  embedding: number[]
  model: string
  dimensions: number
  processingTimeMs: number
  textLength: number
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { dataId, model = 'text-embedding-3-small' }: EmbeddingRequest = await request.json()

    if (!dataId) {
      return NextResponse.json({ error: 'Data ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Find the data object
    const dataObject = await db.collection(COLLECTIONS.DATA).findOne({
      _id: new ObjectId(dataId),
      userId
    })

    if (!dataObject) {
      return NextResponse.json({ error: 'Data object not found' }, { status: 404 })
    }

    // Check if embedding already exists
    if (dataObject.embedding && dataObject.embeddingModel === model) {
      return NextResponse.json({
        dataId,
        embedding: dataObject.embedding,
        model: dataObject.embeddingModel,
        dimensions: dataObject.embedding.length,
        processingTimeMs: 0,
        textLength: dataObject.payload.length,
        cached: true
      })
    }

    // Use sanitized payload if available, otherwise use original payload
    const textToEmbed = dataObject.sanitizedPayload || dataObject.payload

    // Call Python embedding service
    const embeddingResponse = await fetch(`${PYTHON_SERVICE_URL}/embed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: textToEmbed,
        data_id: dataId,
        model: model
      }),
    })

    if (!embeddingResponse.ok) {
      throw new Error(`Embedding service error: ${embeddingResponse.status}`)
    }

    const embeddingResult: EmbeddingResponse = await embeddingResponse.json()

    // Update the data object with the embedding
    await db.collection(COLLECTIONS.DATA).updateOne(
      { _id: new ObjectId(dataId) },
      {
        $set: {
          embedding: embeddingResult.embedding,
          embeddingModel: embeddingResult.model,
          embeddingGeneratedAt: new Date()
        }
      }
    )

    return NextResponse.json({
      success: true,
      dataId: embeddingResult.dataId,
      embedding: embeddingResult.embedding,
      model: embeddingResult.model,
      dimensions: embeddingResult.dimensions,
      processingTimeMs: embeddingResult.processingTimeMs,
      textLength: embeddingResult.textLength
    })

  } catch (error) {
    console.error('Embedding generation error:', error)
    return NextResponse.json({ error: 'Failed to generate embedding' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dataId = searchParams.get('dataId')

    if (!dataId) {
      return NextResponse.json({ error: 'Data ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Find the data object
    const dataObject = await db.collection(COLLECTIONS.DATA).findOne({
      _id: new ObjectId(dataId),
      userId
    })

    if (!dataObject) {
      return NextResponse.json({ error: 'Data object not found' }, { status: 404 })
    }

    return NextResponse.json({
      dataId,
      hasEmbedding: !!dataObject.embedding,
      embeddingModel: dataObject.embeddingModel,
      embeddingGeneratedAt: dataObject.embeddingGeneratedAt,
      dimensions: dataObject.embedding?.length || 0
    })

  } catch (error) {
    console.error('Embedding retrieval error:', error)
    return NextResponse.json({ error: 'Failed to retrieve embedding info' }, { status: 500 })
  }
}
