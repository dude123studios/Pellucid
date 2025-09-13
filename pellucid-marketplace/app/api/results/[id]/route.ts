import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { ObjectId } from 'mongodb'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const db = await getDatabase()
    const submissionId = new ObjectId(params.id)
    const userId = new ObjectId(auth.userId)

    // Get submission details
    const submission = await db.collection(COLLECTIONS.SUBMISSIONS).findOne({
      _id: submissionId,
      userId // Ensure user can only access their own submissions
    })

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    // Get analysis results
    const analyses = await db.collection(COLLECTIONS.ANALYSES)
      .find({ submissionId })
      .sort({ createdAt: 1 })
      .toArray()

    // Calculate summary statistics
    const totalValue = analyses.reduce((sum, analysis) => sum + analysis.estimatedValue, 0)
    const categoryBreakdown = analyses.reduce((acc, analysis) => {
      if (!acc[analysis.category]) {
        acc[analysis.category] = {
          count: 0,
          value: 0,
          severity: analysis.severity
        }
      }
      acc[analysis.category].count++
      acc[analysis.category].value += analysis.estimatedValue
      return acc
    }, {} as Record<string, { count: number; value: number; severity: string }>)

    // Format response
    const response = {
      submission: {
        id: submission._id.toString(),
        status: submission.status,
        privacyScore: submission.privacyScore,
        processingTime: submission.processingTime,
        createdAt: submission.createdAt,
        updatedAt: submission.updatedAt,
        fileInfo: submission.fileInfo
      },
      results: analyses.map(analysis => ({
        id: analysis._id.toString(),
        category: analysis.category,
        severity: analysis.severity,
        confidence: analysis.confidence,
        description: analysis.description,
        excerpt: analysis.excerpt,
        estimatedValue: analysis.estimatedValue
      })),
      summary: {
        totalValue: Math.round(totalValue * 100) / 100,
        totalIssues: analyses.length,
        privacyScore: Math.round(submission.privacyScore * 100) / 100,
        processingTime: submission.processingTime,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([category, data]) => ({
          category,
          count: data.count,
          value: Math.round(data.value * 100) / 100,
          severity: data.severity,
          percentage: Math.round((data.value / totalValue) * 100)
        }))
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Results fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch results' }, { status: 500 })
  }
}
