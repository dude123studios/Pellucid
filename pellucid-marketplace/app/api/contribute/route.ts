import { type NextRequest, NextResponse } from "next/server"
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { sanitizeUserData } from '@/lib/privacy-protection-python'
import { ContributeRequest, ContributeResponse, Submission, ALIGNMENT_CATEGORIES } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { dataIds }: ContributeRequest = await request.json()

    if (!dataIds || !Array.isArray(dataIds) || dataIds.length === 0) {
      return NextResponse.json({ error: "No data objects provided for submission" }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Step 1: Verify all data objects belong to the user
    const dataObjects = await db.collection(COLLECTIONS.DATA).find({
      _id: { $in: dataIds.map(id => new ObjectId(id)) },
      userId
    }).toArray()

    if (dataObjects.length !== dataIds.length) {
      return NextResponse.json({ error: "Some data objects not found or don't belong to user" }, { status: 400 })
    }

    // Step 2: Apply privacy protection to all data objects
    const crypto = require('crypto')
    let allOriginalData = ''
    let allSanitizedData = ''
    let totalPrivacyScore = 0

    for (const dataObj of dataObjects) {
      allOriginalData += dataObj.payload + '\n'
      
      if (!dataObj.isSanitized) {
        const sanitizationResult = await sanitizeUserData(dataObj.payload, 'standard')
        allSanitizedData += sanitizationResult.sanitizedText + '\n'
        totalPrivacyScore += sanitizationResult.privacyScore
        
        // Update the data object with sanitized content
        await db.collection(COLLECTIONS.DATA).updateOne(
          { _id: dataObj._id },
          { 
            $set: { 
              sanitizedPayload: sanitizationResult.sanitizedText,
              isSanitized: true 
            } 
          }
        )
      } else {
        allSanitizedData += dataObj.sanitizedPayload + '\n'
        totalPrivacyScore += 0.95 // Assume already sanitized
      }
    }

    const averagePrivacyScore = totalPrivacyScore / dataObjects.length

    // Step 3: Create submission record - updated schema
    const originalDataHash = crypto.createHash('sha256').update(allOriginalData).digest('hex')

    const submission: Omit<Submission, '_id'> = {
      userId,
      dataIds: dataIds.map(id => new ObjectId(id)),
      originalDataHash,
      categories: [],
      critiques: [],
      createdAt: new Date(),
      usageCount: 0
    }

    const result = await db.collection(COLLECTIONS.SUBMISSIONS).insertOne(submission)
    const submissionId = result.insertedId

    // Step 4: Trigger background analysis (simulated)
    // In a real implementation, this would be queued for processing
    setTimeout(async () => {
      try {
        await performAnalysis(submissionId, dataObjects)
      } catch (error) {
        console.error('Background analysis failed:', error)
      }
    }, 1000)

    const response: ContributeResponse = {
      success: true,
      submissionId: submissionId.toString(),
      status: 'processing',
      privacyScore: averagePrivacyScore,
      dataCount: dataObjects.length
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Contribution error:', error)
    return NextResponse.json({ error: 'Failed to process contribution' }, { status: 500 })
  }
}

// Background analysis function
async function performAnalysis(submissionId: ObjectId, dataObjects: any[]) {
  const db = await getDatabase()
  
  // Simulate AI analysis
  const categories = new Set<string>()
  const critiques: string[] = []
  
  for (const dataObj of dataObjects) {
    // Simulate category detection based on content
    const content = dataObj.payload.toLowerCase()
    
    if (content.includes('hate') || content.includes('violence') || content.includes('harmful')) {
      categories.add('Harmful Content')
      critiques.push('Contains potentially harmful language')
    }
    
    if (content.includes('wrong') || content.includes('incorrect') || content.includes('false')) {
      categories.add('Hallucination')
      critiques.push('Contains factual inaccuracies')
    }
    
    if (content.includes('boring') || content.includes('generic') || content.includes('repetitive')) {
      categories.add('Creativity Weakness')
      critiques.push('Shows lack of creativity or originality')
    }
    
    if (content.includes('confused') || content.includes('misunderstood') || content.includes('context')) {
      categories.add('Context Failures')
      critiques.push('Demonstrates context misunderstanding')
    }
    
    if (content.includes('reasoning') || content.includes('logic') || content.includes('calculate')) {
      categories.add('Reasoning Errors')
      critiques.push('Contains logical reasoning errors')
    }
    
    if (content.includes('instruction') || content.includes('format') || content.includes('follow')) {
      categories.add('Alignment Issues')
      critiques.push('Fails to follow instructions properly')
    }
  }
  
  // If no categories detected, add a default one
  if (categories.size === 0) {
    categories.add('General')
    critiques.push('General AI interaction data')
  }
  
  // Update submission with analysis results
  await db.collection(COLLECTIONS.SUBMISSIONS).updateOne(
    { _id: submissionId },
    { 
      $set: { 
        categories: Array.from(categories),
        critiques,
        status: 'approved'
      } 
    }
  )
  
  console.log(`Analysis completed for submission ${submissionId}`)
}