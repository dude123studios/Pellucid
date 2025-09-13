import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { Data } from '@/lib/types'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { sanitizeUserData } from '@/lib/privacy-protection-python'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

// GET /api/data - Get user's staged data objects
export async function GET(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // For now, we'll get all data objects for the user
    // In a real implementation, you might want to filter by submission status
    const dataObjects = await db.collection(COLLECTIONS.DATA)
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      data: dataObjects.map(data => ({
        id: data._id.toString(),
        payload: data.payload,
        label: data.label,
        category: data.category,
        createdAt: data.createdAt,
        isSanitized: data.isSanitized
      }))
    })
  } catch (error) {
    console.error('Failed to fetch data objects:', error)
    return NextResponse.json({ error: 'Failed to fetch data objects' }, { status: 500 })
  }
}

// POST /api/data - Create a new data object with privacy sanitization and embedding
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Data API: Received POST request')
    const authHeader = request.headers.get('authorization')
    console.log('🔑 Data API: Auth header:', authHeader ? 'Present' : 'Missing')
    
    const auth = await verifyToken(request)
    console.log('👤 Data API: Auth result:', auth ? 'Success' : 'Failed')
    
    if (!auth) {
      console.log('❌ Data API: Authentication failed')
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { payload, label, category, skipPrivacyProtection } = await request.json()

    if (!payload || !label || !category) {
      return NextResponse.json({ 
        error: 'Missing required fields: payload, label, category' 
      }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Step 1: Create the data object first
    const dataObject: Omit<Data, '_id'> = {
      userId,
      createdAt: new Date(),
      payload,
      label,
      category,
      isSanitized: false
    }

    const result = await db.collection(COLLECTIONS.DATA).insertOne(dataObject)
    const dataId = result.insertedId.toString()

    try {
      let sanitizationResult = null
      let textToEmbed = payload

      // Step 2: Sanitize the payload using Python privacy service (unless skipped)
      if (!skipPrivacyProtection) {
        console.log('Sanitizing payload for data object:', dataId)
        sanitizationResult = await sanitizeUserData(payload, 'standard')
        textToEmbed = sanitizationResult.sanitizedText
      } else {
        console.log('Skipping privacy protection for data object:', dataId)
        // Mark as sanitized since it was already sanitized in the frontend
        sanitizationResult = {
          sanitizedText: payload,
          privacyScore: 1.0,
          replacements: []
        }
      }
      
      // Step 3: Generate embedding using Python service
      console.log('Generating embedding for data object:', dataId)
      const embeddingResponse = await fetch(`${PYTHON_SERVICE_URL}/embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToEmbed,
          data_id: dataId,
          model: 'text-embedding-3-small'
        }),
      })

      if (embeddingResponse.ok) {
        const embeddingResult = await embeddingResponse.json()
        
        // Step 4: Update the data object with sanitized payload and embedding
        await db.collection(COLLECTIONS.DATA).updateOne(
          { _id: result.insertedId },
          {
            $set: {
              sanitizedPayload: sanitizationResult.sanitizedText,
              isSanitized: true,
              embedding: embeddingResult.embedding,
              embeddingModel: embeddingResult.model,
              embeddingGeneratedAt: new Date()
            }
          }
        )

        console.log('Successfully processed data object:', dataId)
        
        return NextResponse.json({
          success: true,
          dataId,
          sanitized: true,
          embeddingGenerated: true,
          privacyScore: sanitizationResult.privacyScore,
          embeddingDimensions: embeddingResult.dimensions
        })
      } else {
        // If embedding fails, still save the sanitized version
        await db.collection(COLLECTIONS.DATA).updateOne(
          { _id: result.insertedId },
          {
            $set: {
              sanitizedPayload: sanitizationResult.sanitizedText,
              isSanitized: true
            }
          }
        )

        console.warn('Embedding generation failed for data object:', dataId)
        
        return NextResponse.json({
          success: true,
          dataId,
          sanitized: true,
          embeddingGenerated: false,
          privacyScore: sanitizationResult.privacyScore,
          warning: 'Embedding generation failed, but data was sanitized'
        })
      }
    } catch (processingError) {
      console.error('Processing error for data object:', dataId, processingError)
      
      // If processing fails, return the basic data object
      return NextResponse.json({
        success: true,
        dataId,
        sanitized: false,
        embeddingGenerated: false,
        warning: 'Privacy sanitization and embedding generation failed, but data was saved'
      })
    }
  } catch (error) {
    console.error('Failed to create data object:', error)
    return NextResponse.json({ error: 'Failed to create data object' }, { status: 500 })
  }
}

// DELETE /api/data - Delete a data object
export async function DELETE(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const dataId = searchParams.get('id')

    if (!dataId) {
      return NextResponse.json({ error: 'Data ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Verify the data object belongs to the user
    const dataObject = await db.collection(COLLECTIONS.DATA).findOne({
      _id: new ObjectId(dataId),
      userId
    })

    if (!dataObject) {
      return NextResponse.json({ error: 'Data object not found' }, { status: 404 })
    }

    await db.collection(COLLECTIONS.DATA).deleteOne({
      _id: new ObjectId(dataId),
      userId
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete data object:', error)
    return NextResponse.json({ error: 'Failed to delete data object' }, { status: 500 })
  }
}
