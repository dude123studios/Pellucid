import { NextRequest, NextResponse } from 'next/server'
import { getDatabase, COLLECTIONS } from '@/lib/mongodb'
import { verifyToken } from '@/app/api/auth/route'
import { ObjectId } from 'mongodb'

const PYTHON_VISUALIZATION_URL = process.env.PYTHON_VISUALIZATION_URL || 'http://localhost:8000'

interface VisualizeRequest {
  data_ids: string[]
  visualization_type: "submission" | "dataset"
  n_clusters?: number
  include_analytics?: boolean
}

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await verifyToken(request)
    if (!auth) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data_ids, visualization_type, n_clusters = 5, include_analytics = true }: VisualizeRequest = await request.json()

    if (!data_ids || !Array.isArray(data_ids) || data_ids.length === 0) {
      return NextResponse.json({ error: 'Data IDs are required' }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    // Verify all data objects belong to the user (for submissions)
    // For datasets, we'll need to check if the user has access
    if (visualization_type === "submission") {
      const dataObjects = await db.collection(COLLECTIONS.DATA).find({
        _id: { $in: data_ids.map(id => new ObjectId(id)) },
        userId
      }).toArray()

      if (dataObjects.length !== data_ids.length) {
        return NextResponse.json({ error: 'Some data objects not found or access denied' }, { status: 403 })
      }
    }

    // Call Python visualization service
    const visualizationResponse = await fetch(`${PYTHON_VISUALIZATION_URL}/visualize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data_ids: data_ids,
        visualization_type: visualization_type,
        n_clusters: n_clusters,
        include_analytics: include_analytics
      }),
    })

    if (!visualizationResponse.ok) {
      throw new Error(`Visualization service error: ${visualizationResponse.status}`)
    }

    const visualizationData = await visualizationResponse.json()

    return NextResponse.json(visualizationData)

  } catch (error) {
    console.error('Visualization error:', error)
    return NextResponse.json({ error: 'Failed to generate visualization' }, { status: 500 })
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
    const submissionId = searchParams.get('submissionId')
    const datasetId = searchParams.get('datasetId')
    const nClusters = parseInt(searchParams.get('nClusters') || '5')

    if (!submissionId && !datasetId) {
      return NextResponse.json({ error: 'Either submissionId or datasetId is required' }, { status: 400 })
    }

    const db = await getDatabase()
    const userId = new ObjectId(auth.userId)

    let dataIds: string[] = []

    if (submissionId) {
      // Get data objects from submission
      const submission = await db.collection(COLLECTIONS.SUBMISSIONS).findOne({
        _id: new ObjectId(submissionId),
        userId
      })

      if (!submission) {
        return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
      }

      dataIds = submission.dataIds.map((id: ObjectId) => id.toString())
    } else if (datasetId) {
      // Get data objects from dataset
      const dataset = await db.collection(COLLECTIONS.DATASETS).findOne({
        _id: new ObjectId(datasetId)
      })

      if (!dataset) {
        return NextResponse.json({ error: 'Dataset not found' }, { status: 404 })
      }

      // For demo purposes, allow access to all datasets
      // In production, check if user has purchased this dataset
      // const hasAccess = dataset.buyers.some((buyerId: ObjectId) => 
      //   buyerId.toString() === userId.toString()
      // )
      // if (!hasAccess) {
      //   return NextResponse.json({ error: 'Access denied - dataset not purchased' }, { status: 403 })
      // }

      // Get data objects that match this dataset's category
      const dataObjects = await db.collection(COLLECTIONS.DATA).find({
        category: dataset.category
      }).limit(50).toArray()

      dataIds = dataObjects.map(obj => obj._id.toString())
    }

    if (dataIds.length === 0) {
      return NextResponse.json({ error: 'No data objects found' }, { status: 404 })
    }

    // Call Python visualization service
    const visualizationResponse = await fetch(`${PYTHON_VISUALIZATION_URL}/visualize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data_ids: dataIds,
        visualization_type: submissionId ? "submission" : "dataset",
        n_clusters: nClusters,
        include_analytics: true
      }),
    })

    if (!visualizationResponse.ok) {
      throw new Error(`Visualization service error: ${visualizationResponse.status}`)
    }

    const visualizationData = await visualizationResponse.json()

    return NextResponse.json(visualizationData)

  } catch (error) {
    console.error('Visualization error:', error)
    return NextResponse.json({ error: 'Failed to generate visualization' }, { status: 500 })
  }
}
