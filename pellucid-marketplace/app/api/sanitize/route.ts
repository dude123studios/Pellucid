import { type NextRequest, NextResponse } from "next/server"
import { sanitizeUserData } from "@/lib/privacy-protection-python"

export async function POST(request: NextRequest) {
  try {
    const { text, privacyLevel = "standard" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "No text provided for sanitization" }, { status: 400 })
    }

    // Sanitize the text using Python ML-based service
    const result = await sanitizeUserData(text, privacyLevel)

    // Add processing metadata
    const response = {
      ...result,
      processingTime: Date.now(),
      privacyLevel,
      status: "success",
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Sanitization error:", error)
    return NextResponse.json({ error: "Failed to sanitize data" }, { status: 500 })
  }
}
