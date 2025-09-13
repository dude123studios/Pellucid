import { type NextRequest, NextResponse } from "next/server"
import { AnalysisRequest, AnalysisResponse, ALIGNMENT_CATEGORIES } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { text, files }: AnalysisRequest = await request.json()

    if (!text && (!files || files.length === 0)) {
      return NextResponse.json({ error: "No text or files provided for analysis" }, { status: 400 })
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 2000))

    let allResults: any[] = []

    // Analyze text input
    if (text) {
      const textResults = analyzeText(text)
      allResults = [...allResults, ...textResults]
    }

    // Analyze files (simulated)
    if (files && files.length > 0) {
      files.forEach((file: any, index: number) => {
        // Simulate file content analysis
        const mockContent = `File ${file.name} contains AI conversation data with potential alignment issues.`
        const fileResults = analyzeText(mockContent)
        allResults = [...allResults, ...fileResults]
      })
    }

    const totalValue = allResults.reduce((sum, result) => sum + result.estimatedValue, 0)
    const privacyScore = 0.95 + Math.random() * 0.05 // Simulate privacy protection score

    const response: AnalysisResponse = {
      results: allResults,
      totalValue: Math.round(totalValue * 100) / 100,
      processingTime: 1800 + Math.random() * 400, // 1.8-2.2 seconds
      privacyScore: Math.round(privacyScore * 100) / 100,
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Failed to analyze data" }, { status: 500 })
  }
}

function analyzeText(text: string) {
  const results: any[] = []
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 10)

  sentences.forEach((sentence, index) => {
    const lowerSentence = sentence.toLowerCase()

    Object.entries(ALIGNMENT_CATEGORIES).forEach(([categoryName, category]) => {
      const matchedKeywords = category.keywords.filter((keyword) => lowerSentence.includes(keyword))

      if (matchedKeywords.length > 0) {
        const confidence = Math.min(0.95, 0.6 + matchedKeywords.length * 0.15)
        const valueMultiplier = confidence * (Math.random() * 0.4 + 0.8)

        results.push({
          id: `analysis_${Date.now()}_${index}`,
          category: categoryName,
          severity: category.severity,
          confidence: Math.round(confidence * 100) / 100,
          description: generateDescription(categoryName, matchedKeywords),
          excerpt: sentence.trim().substring(0, 150) + "...",
          estimatedValue: Math.round(category.baseValue * valueMultiplier * 100) / 100,
        })
      }
    })
  })

  // Add some random findings for demonstration
  if (results.length === 0 && sentences.length > 0) {
    const categories = Object.keys(ALIGNMENT_CATEGORIES)
    const randomCategoryName = categories[Math.floor(Math.random() * categories.length)]
    const randomCategory = ALIGNMENT_CATEGORIES[randomCategoryName as keyof typeof ALIGNMENT_CATEGORIES]
    
    results.push({
      id: `analysis_${Date.now()}_random`,
      category: randomCategoryName,
      severity: randomCategory.severity,
      confidence: 0.7 + Math.random() * 0.2,
      description: `Potential ${randomCategoryName.toLowerCase()} detected through semantic analysis`,
      excerpt: sentences[0].substring(0, 150) + "...",
      estimatedValue: Math.round(randomCategory.baseValue * (0.7 + Math.random() * 0.3) * 100) / 100,
    })
  }

  return results
}

function generateDescription(category: string, keywords: string[]): string {
  const descriptions = {
    "Harmful Content": `Detected potentially harmful language patterns. Keywords: ${keywords.join(", ")}`,
    "Hallucination": `Identified possible factual inaccuracies or fabricated information. Triggers: ${keywords.join(", ")}`,
    "Reasoning Errors": `Found logical inconsistencies or flawed reasoning patterns. Issues: ${keywords.join(", ")}`,
    "Creativity Weakness": `Detected repetitive or uninspired content patterns. Indicators: ${keywords.join(", ")}`,
    "Alignment Issues": `Identified misalignment with user intent or instructions. Problems: ${keywords.join(", ")}`,
    "Context Failures": `Found context loss or inconsistency issues. Symptoms: ${keywords.join(", ")}`,
  }

  return (
    descriptions[category as keyof typeof descriptions] || `Analysis found issues related to ${category.toLowerCase()}`
  )
}
