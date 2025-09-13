import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { PurchaseRequest, PurchaseResponse, Transaction, Dataset } from '@/lib/types'
import { ObjectId } from 'mongodb'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { datasetId, buyerId }: PurchaseRequest = await request.json()

    if (!datasetId) {
      return NextResponse.json({ error: 'Dataset ID is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const buyerObjectId = new ObjectId(auth.userId)
    const datasetObjectId = new ObjectId(datasetId)

    // Get dataset details
    const dataset = await db.collection(COLLECTIONS.DATASETS).findOne({
      _id: datasetObjectId,
      isActive: true
    }) as Dataset

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
    }

    // Check if user already purchased this dataset
    const existingPurchase = await db.collection(COLLECTIONS.TRANSACTIONS).findOne({
      buyerId: buyerObjectId,
      datasetId: datasetObjectId
    })

    if (existingPurchase) {
      return NextResponse.json({ error: 'Dataset already purchased' }, { status: 409 })
    }

    // Get submissions and their contributors
    const submissions = await db.collection(COLLECTIONS.SUBMISSIONS).find({
      _id: { $in: dataset.samples }
    }).toArray()

    // Calculate payout distribution
    const totalValue = submissions.reduce((sum, sub) => sum + (sub.valueEstimate || 0), 0)
    const platformFee = 0.1 // 10% platform fee
    const payoutAmount = dataset.price * (1 - platformFee)
    
    const contributors = submissions.map(submission => {
      const contributionRatio = (submission.valueEstimate || 0) / totalValue
      return {
        userId: submission.userId,
        submissionId: submission._id,
        amount: Math.round(payoutAmount * contributionRatio * 100) / 100
      }
    })

    // Create transaction record
    const transaction: Omit<Transaction, '_id'> = {
      buyerId: buyerObjectId,
      datasetId: datasetObjectId,
      amountPaid: dataset.price,
      payoutDistributed: false,
      payoutAmount,
      contributors,
      createdAt: new Date(),
      txHash: generateMockTxHash() // Mock blockchain transaction hash
    }

    const transactionResult = await db.collection(COLLECTIONS.TRANSACTIONS).insertOne(transaction)

    // Update dataset statistics
    await db.collection(COLLECTIONS.DATASETS).updateOne(
      { _id: datasetObjectId },
      {
        $inc: {
          buyerCount: 1,
          totalDownloads: 1
        },
        $set: {
          updatedAt: new Date()
        }
      }
    )

    // Trigger payout distribution (simulated)
    setTimeout(async () => {
      await distributePayouts(db, transactionResult.insertedId, contributors)
    }, 2000)

    const response: PurchaseResponse = {
      transactionId: transactionResult.insertedId.toString(),
      amount: dataset.price,
      contributors: contributors.length,
      estimatedPayout: payoutAmount
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Purchase error:', error)
    return NextResponse.json({ error: 'Failed to process purchase' }, { status: 500 })
  }
}

async function distributePayouts(db: any, transactionId: ObjectId, contributors: any[]) {
  try {
    // Update user earnings
    for (const contributor of contributors) {
      await db.collection(COLLECTIONS.USERS).updateOne(
        { _id: contributor.userId },
        {
          $inc: { totalEarnings: contributor.amount },
          $set: { updatedAt: new Date() }
        }
      )
    }

    // Mark transaction as completed
    await db.collection(COLLECTIONS.TRANSACTIONS).updateOne(
      { _id: transactionId },
      {
        $set: {
          payoutDistributed: true,
          updatedAt: new Date()
        }
      }
    )

    console.log(`Payouts distributed for transaction ${transactionId}`)
  } catch (error) {
    console.error('Payout distribution error:', error)
  }
}

function generateMockTxHash(): string {
  const chars = '0123456789abcdef'
  let result = '0x'
  for (let i = 0; i < 64; i++) {
    result += chars[Math.floor(Math.random() * chars.length)]
  }
  return result
}
