import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
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

    // Get user's submissions
    const submissions = await db.collection(COLLECTIONS.SUBMISSIONS).find({
      userId
    }).sort({ createdAt: -1 }).toArray()

    // Get user's transactions (as buyer)
    const transactions = await db.collection(COLLECTIONS.TRANSACTIONS).find({
      buyerId: userId
    }).sort({ createdAt: -1 }).toArray()

    // Calculate earnings trend (last 6 months)
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const monthlyEarnings = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date()
      monthStart.setMonth(monthStart.getMonth() - i)
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)
      
      const monthEnd = new Date(monthStart)
      monthEnd.setMonth(monthEnd.getMonth() + 1)
      monthEnd.setDate(0)
      monthEnd.setHours(23, 59, 59, 999)

      // Calculate earnings for this month based on usage
      const monthSubmissions = submissions.filter(sub => 
        sub.createdAt >= monthStart && sub.createdAt <= monthEnd
      )
      
      const monthEarnings = monthSubmissions.reduce((sum, sub) => {
        return sum + (sub.usageCount || 0) * 0.1 // Mock earnings per usage
      }, 0)

      monthlyEarnings.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        earnings: monthEarnings,
        percentage: monthEarnings > 0 ? Math.min((monthEarnings / 100) * 100, 100) : 0
      })
    }

    // Calculate category performance
    const categoryStats: Record<string, { count: number; earnings: number }> = {}
    
    submissions.forEach(sub => {
      sub.categories?.forEach(category => {
        if (!categoryStats[category]) {
          categoryStats[category] = { count: 0, earnings: 0 }
        }
        categoryStats[category].count += 1
        categoryStats[category].earnings += (sub.usageCount || 0) * 0.1
      })
    })

    const categoryPerformance = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        earnings: stats.earnings,
        count: stats.count
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 4) // Top 4 categories

    return NextResponse.json({
      monthlyEarnings,
      categoryPerformance,
      totalEarnings: submissions.reduce((sum, sub) => sum + (sub.usageCount || 0) * 0.1, 0),
      totalContributions: submissions.length,
      averageEarningsPerContribution: submissions.length > 0 
        ? submissions.reduce((sum, sub) => sum + (sub.usageCount || 0) * 0.1, 0) / submissions.length 
        : 0
    })

  } catch (error: any) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics data' }, { status: 500 })
  }
}
