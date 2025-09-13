import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { transactionId } = await request.json()

    if (!transactionId) {
      return NextResponse.json({ error: 'Transaction ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const transactionObjectId = new ObjectId(transactionId)

    // Get transaction details
    const transaction = await db.collection(COLLECTIONS.TRANSACTIONS).findOne({
      _id: transactionObjectId
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    if (transaction.payoutDistributed) {
      return NextResponse.json({ error: 'Payouts already distributed' }, { status: 409 })
    }

    // Distribute payouts to contributors
    const payoutResults = []
    for (const contributor of transaction.contributors) {
      const result = await db.collection(COLLECTIONS.USERS).updateOne(
        { _id: contributor.userId },
        {
          $inc: { totalEarnings: contributor.amount },
          $set: { updatedAt: new Date() }
        }
      )
      
      payoutResults.push({
        userId: contributor.userId.toString(),
        amount: contributor.amount,
        success: result.modifiedCount > 0
      })
    }

    // Mark transaction as completed
    await db.collection(COLLECTIONS.TRANSACTIONS).updateOne(
      { _id: transactionObjectId },
      {
        $set: {
          payoutDistributed: true,
          updatedAt: new Date()
        }
      }
    )

    // In a real implementation, this would trigger blockchain transactions
    const mockTxHash = generateMockBlockchainTx()

    return NextResponse.json({
      success: true,
      transactionId: transactionId,
      totalPayout: transaction.payoutAmount,
      contributors: payoutResults.length,
      blockchainTxHash: mockTxHash,
      payouts: payoutResults
    })
  } catch (error) {
    console.error('Payout error:', error)
    return NextResponse.json({ error: 'Failed to process payout' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Get pending payouts for user
    const pendingPayouts = await db.collection(COLLECTIONS.TRANSACTIONS).aggregate([
      {
        $match: {
          'contributors.userId': userId,
          payoutDistributed: false
        }
      },
      {
        $unwind: '$contributors'
      },
      {
        $match: {
          'contributors.userId': userId
        }
      },
      {
        $lookup: {
          from: COLLECTIONS.DATASETS,
          localField: 'datasetId',
          foreignField: '_id',
          as: 'dataset'
        }
      },
      {
        $project: {
          transactionId: '$_id',
          amount: '$contributors.amount',
          datasetTitle: { $arrayElemAt: ['$dataset.title', 0] },
          createdAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]).toArray()

    const totalPending = pendingPayouts.reduce((sum, payout) => sum + payout.amount, 0)

    return NextResponse.json({
      pendingPayouts: pendingPayouts.map(payout => ({
        transactionId: payout.transactionId.toString(),
        amount: payout.amount,
        datasetTitle: payout.datasetTitle,
        createdAt: payout.createdAt
      })),
      totalPending: Math.round(totalPending * 100) / 100
    })
  } catch (error) {
    console.error('Pending payouts fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch pending payouts' }, { status: 500 })
  }
}

function generateMockBlockchainTx(): string {
  const chars = '0123456789abcdef'
  let result = '0x'
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
