import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { Data } from '@/lib/types'
import { ObjectId } from 'mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { batchSanitizeUserData } from '@/lib/privacy-protection-python'

const PYTHON_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

// POST /api/data/bulk - Create multiple data objects from JSON
export async function POST(request: NextRequest) {
  try {
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { dataArray, skipPrivacyProtection } = await request.json()

    if (!Array.isArray(dataArray) || dataArray.length === 0) {
      return NextResponse.json({ 
        error: 'dataArray must be a non-empty array' 
      }, { status: 400 })
    }

    // Validate each data object
    for (const dataItem of dataArray) {
      if (!dataItem.payload || !dataItem.label || !dataItem.category) {
        return NextResponse.json({ 
          error: 'Each data object must have payload, label, and category' 
        }, { status: 400 })
      }
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Prepare data objects for insertion
    const dataObjects = dataArray.map((dataItem: any) => ({
      userId,
      createdAt: new Date(),
      payload: dataItem.payload,
      label: dataItem.label,
      category: dataItem.category,
      isSanitized: false
    }))

    // Insert all data objects first
    const result = await db.collection(COLLECTIONS.DATA).insertMany(dataObjects)
    const insertedIds = Object.values(result.insertedIds).map(id => id.toString())

    try {
      let sanitizationResults = []
      let textToEmbedArray = []

      // Step 1: Batch sanitize all payloads (unless skipped)
      if (!skipPrivacyProtection) {
        console.log('Batch sanitizing payloads for', insertedIds.length, 'data objects')
        sanitizationResults = await batchSanitizeUserData(
          dataArray.map(item => item.payload), 
          'standard'
        )
        textToEmbedArray = sanitizationResults.map(result => result.sanitizedText)
      } else {
        console.log('Skipping privacy protection for', insertedIds.length, 'data objects')
        // Mark as sanitized since it was already sanitized in the frontend
        sanitizationResults = dataArray.map(item => ({
          sanitizedText: item.payload,
          privacyScore: 1.0,
          replacements: []
        }))
        textToEmbedArray = dataArray.map(item => item.payload)
      }

      // Step 2: Batch generate embeddings
      console.log('Batch generating embeddings for', insertedIds.length, 'data objects')
      const embeddingRequests = textToEmbedArray.map((text, index) => ({
        text: text,
        data_id: insertedIds[index],
        model: 'text-embedding-3-small'
      }))

      const embeddingResponse = await fetch(`${PYTHON_SERVICE_URL}/batch-embed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(embeddingRequests),
      })

      if (embeddingResponse.ok) {
        const embeddingResults = await embeddingResponse.json()
        
        // Step 3: Update all data objects with sanitized payloads and embeddings
        const updatePromises = insertedIds.map((dataId, index) => {
          const sanitizationResult = sanitizationResults[index]
          const embeddingResult = embeddingResults.results[index]
          
          return db.collection(COLLECTIONS.DATA).updateOne(
            { _id: new ObjectId(dataId) },
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
        })

        await Promise.all(updatePromises)
        console.log('Successfully processed', insertedIds.length, 'data objects')

        return NextResponse.json({
          success: true,
          insertedCount: result.insertedCount,
          dataIds: insertedIds,
          sanitized: true,
          embeddingGenerated: true,
          averagePrivacyScore: sanitizationResults.reduce((sum, r) => sum + r.privacyScore, 0) / sanitizationResults.length,
          embeddingDimensions: embeddingResults.results[0]?.dimensions || 0
        })
      } else {
        // If embedding fails, still save the sanitized versions
        const updatePromises = insertedIds.map((dataId, index) => {
          const sanitizationResult = sanitizationResults[index]
          
          return db.collection(COLLECTIONS.DATA).updateOne(
            { _id: new ObjectId(dataId) },
            {
              $set: {
                sanitizedPayload: sanitizationResult.sanitizedText,
                isSanitized: true
              }
            }
          )
        })

        await Promise.all(updatePromises)
        console.warn('Embedding generation failed for bulk data objects')

        return NextResponse.json({
          success: true,
          insertedCount: result.insertedCount,
          dataIds: insertedIds,
          sanitized: true,
          embeddingGenerated: false,
          averagePrivacyScore: sanitizationResults.reduce((sum, r) => sum + r.privacyScore, 0) / sanitizationResults.length,
          warning: 'Embedding generation failed, but data was sanitized'
        })
      }
    } catch (processingError) {
      console.error('Processing error for bulk data objects:', processingError)
      
      return NextResponse.json({
        success: true,
        insertedCount: result.insertedCount,
        dataIds: insertedIds,
        sanitized: false,
        embeddingGenerated: false,
        warning: 'Privacy sanitization and embedding generation failed, but data was saved'
      })
    }
  } catch (error) {
    console.error('Failed to create bulk data objects:', error)
    return NextResponse.json({ error: 'Failed to create bulk data objects' }, { status: 500 })
  }
}
