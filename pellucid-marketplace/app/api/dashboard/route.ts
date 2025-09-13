import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { DashboardResponse } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Get user details
    const user = await db.collection(COLLECTIONS.USERS).findOne({ _id: userId })
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get user's submissions
    const submissions = await db.collection(COLLECTIONS.SUBMISSIONS).find({
      userId
    }).sort({ createdAt: -1 }).toArray()

    // Get user's transactions (as buyer)
    const transactions = await db.collection(COLLECTIONS.TRANSACTIONS).find({
      buyerId: userId
    }).sort({ createdAt: -1 }).toArray()

    // Get user's contributions to datasets (submissions that are part of sold datasets)
    const userSubmissions = submissions.map(sub => sub._id)
    const datasetsWithUserSubmissions = await db.collection(COLLECTIONS.DATASETS).find({
      submissions: { $in: userSubmissions }
    }).toArray()

    // Calculate statistics
    const totalEarnings = user.totalEarnings || 0
    const pendingPayments = submissions
      .filter(sub => sub.usageCount > 0)
      .reduce((sum, sub) => sum + (sub.usageCount * 0.1), 0) // Mock earnings calculation
    const totalContributions = submissions.length
    const activeDatasets = datasetsWithUserSubmissions.length

    // Get recent contributions
    const recentContributions = submissions.slice(0, 10).map(submission => {
      // Calculate downloads for this submission
      const downloads = datasetsWithUserSubmissions
        .filter(dataset => dataset.submissions.some(sample => sample.toString() === submission._id.toString()))
        .reduce((sum, dataset) => sum + dataset.buyers.length, 0)

      return {
        id: submission._id.toString(),
        title: generateSubmissionTitle(submission.categories, 'submission'),
        category: submission.categories[0] || 'Unknown',
        status: submission.usageCount > 0 ? 'approved' : 'processing',
        earnings: submission.usageCount * 0.1, // Mock earnings calculation
        date: submission.createdAt.toISOString().split('T')[0],
        downloads
      }
    })

    // Get payment history (simplified for new schema)
    const formattedPaymentHistory = transactions
      .filter(tx => tx.payoutDistributed)
      .slice(0, 10)
      .map(tx => ({
        id: tx._id.toString(),
        amount: tx.amountPaid * 0.1, // Mock contributor share
        date: tx.createdAt.toISOString().split('T')[0],
        txHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        status: 'completed'
      }))

    const response: DashboardResponse = {
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      pendingPayments: Math.round(pendingPayments * 100) / 100,
      totalContributions,
      activeDatasets,
      recentContributions,
      paymentHistory: formattedPaymentHistory
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Dashboard fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 })
  }
}

function generateSubmissionTitle(categories: string[], fileName?: string): string {
  if (categories.length > 0) {
    return `${categories[0]} Examples`
  }
  if (fileName) {
    return `Data from ${fileName}`
  }
  return 'AI Interaction Data'
}
