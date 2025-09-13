// Python-based Privacy Protection Service Integration
// This module calls the Python FastAPI privacy service for advanced ML-based anonymization

interface PythonPrivacyRequest {
  text: string
  privacy_level: "minimal" | "standard" | "strict"
  preserve_format?: boolean
  custom_entities?: string[]
}

interface PythonPrivacyResponse {
  sanitized_text: string
  privacy_score: number
  entities_found: Array<{
    original: string
    replacement: string
    entity_type: string
    confidence: number
    position: { start: number; end: number }
  }>
  processing_time_ms: number
  privacy_level: string
}

interface SanitizationResult {
  sanitizedText: string
  replacements: Array<{
    original: string
    replacement: string
    type: string
    confidence: number
  }>
  privacyScore: number
  contextPreserved: boolean
  processingTimeMs: number
}

const PYTHON_PRIVACY_SERVICE_URL = process.env.PYTHON_SERVICE_URL || 'http://localhost:8000'

/**
 * Sanitize user data using the Python ML-based privacy service
 */
export async function sanitizeUserData(
  text: string, 
  privacyLevel: "standard" | "enhanced" | "maximum" = "standard"
): Promise<SanitizationResult> {
  try {
    console.log('🔍 Frontend: Starting privacy sanitization...')
    console.log('📝 Frontend: Text to sanitize:', text.substring(0, 100) + '...')
    console.log('🌐 Frontend: Calling Python backend at:', `${PYTHON_PRIVACY_SERVICE_URL}/anonymize`)
    
    // Map privacy levels to Python service levels
    const pythonPrivacyLevel = mapPrivacyLevel(privacyLevel)
    
    const request: PythonPrivacyRequest = {
      text,
      privacy_level: pythonPrivacyLevel,
      preserve_format: true,
    }

    console.log('📤 Frontend: Sending request:', request)

    const response = await fetch(`${PYTHON_PRIVACY_SERVICE_URL}/anonymize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    console.log('📥 Frontend: Response status:', response.status, response.statusText)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ Frontend: Privacy service error:', errorText)
      throw new Error(`Privacy service error: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result: any = await response.json()
    console.log('✅ Frontend: Received result:', result)
    console.log('🔍 Frontend: Result type check:', typeof result, 'keys:', Object.keys(result))

    // Handle both camelCase and snake_case response formats
    const sanitizedText = result.sanitized_text || result.sanitizedText
    const privacyScore = result.privacy_score || result.privacyScore
    const processingTimeMs = result.processing_time_ms || result.processingTimeMs
    const entitiesFound = result.entities_found || result.replacements || []

    // Convert Python response to our expected format
    return {
      sanitizedText: sanitizedText,
      privacyScore: privacyScore,
      contextPreserved: true, // Python service preserves context by design
      processingTimeMs: processingTimeMs,
      replacements: entitiesFound.map((entity: any) => ({
        original: entity.original,
        replacement: entity.replacement,
        type: entity.entity_type || entity.type,
        confidence: entity.confidence,
      }))
    }

  } catch (error) {
    console.error('Python privacy service error:', error)
    
    // Fallback to basic sanitization if Python service is unavailable
    console.warn('Falling back to basic sanitization')
    return fallbackSanitization(text, privacyLevel)
  }
}

/**
 * Batch sanitize multiple texts using the Python service
 */
export async function batchSanitizeUserData(
  texts: string[], 
  privacyLevel: "standard" | "enhanced" | "maximum" = "standard"
): Promise<SanitizationResult[]> {
  try {
    const pythonPrivacyLevel = mapPrivacyLevel(privacyLevel)
    
    const requests: PythonPrivacyRequest[] = texts.map(text => ({
      text,
      privacy_level: pythonPrivacyLevel,
      preserve_format: true,
    }))

    const response = await fetch(`${PYTHON_PRIVACY_SERVICE_URL}/batch-anonymize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requests),
    })

    if (!response.ok) {
      throw new Error(`Batch privacy service error: ${response.status} ${response.statusText}`)
    }

    const results = await response.json()
    
    return results.results.map((result: PythonPrivacyResponse) => ({
      sanitizedText: result.sanitized_text,
      privacyScore: result.privacy_score,
      contextPreserved: true,
      processingTimeMs: result.processing_time_ms,
      replacements: result.entities_found.map(entity => ({
        original: entity.original,
        replacement: entity.replacement,
        type: entity.entity_type,
        confidence: entity.confidence,
      }))
    }))

  } catch (error) {
    console.error('Batch Python privacy service error:', error)
    
    // Fallback to individual sanitization
    return Promise.all(texts.map(text => fallbackSanitization(text, privacyLevel)))
  }
}

/**
 * Detect entities without replacement (for debugging/preview)
 */
export async function detectEntities(
  text: string, 
  privacyLevel: "standard" | "enhanced" | "maximum" = "standard"
): Promise<Array<{
  text: string
  entity_type: string
  confidence: number
  position: { start: number; end: number }
  replacement: string
}>> {
  try {
    const pythonPrivacyLevel = mapPrivacyLevel(privacyLevel)
    
    const response = await fetch(
      `${PYTHON_PRIVACY_SERVICE_URL}/entities/detected?text=${encodeURIComponent(text)}&privacy_level=${pythonPrivacyLevel}`
    )

    if (!response.ok) {
      throw new Error(`Entity detection error: ${response.status} ${response.statusText}`)
    }

    const result = await response.json()
    return result.entities

  } catch (error) {
    console.error('Entity detection error:', error)
    return []
  }
}

/**
 * Check if the Python privacy service is available
 */
export async function checkPrivacyServiceHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${PYTHON_PRIVACY_SERVICE_URL}/health`, {
      method: 'GET',
      timeout: 5000, // 5 second timeout
    })

    return response.ok
  } catch (error) {
    console.warn('Python privacy service not available:', error)
    return false
  }
}

/**
 * Get privacy service statistics
 */
export async function getPrivacyServiceStats(): Promise<{
  total_mappings: number
  spacy_model_loaded: boolean
  supported_entities: string[]
  privacy_levels: string[]
} | null> {
  try {
    const response = await fetch(`${PYTHON_PRIVACY_SERVICE_URL}/stats`)

    if (!response.ok) {
      throw new Error(`Stats error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Privacy service stats error:', error)
    return null
  }
}

/**
 * Map our privacy levels to Python service levels
 */
function mapPrivacyLevel(level: "standard" | "enhanced" | "maximum"): "minimal" | "standard" | "strict" {
  switch (level) {
    case "standard":
      return "standard"
    case "enhanced":
      return "standard" // Enhanced maps to standard for now
    case "maximum":
      return "strict"
    default:
      return "standard"
  }
}

/**
 * Fallback sanitization using basic regex patterns
 * This is used when the Python service is unavailable
 */
function fallbackSanitization(
  text: string, 
  privacyLevel: "standard" | "enhanced" | "maximum"
): SanitizationResult {
  const replacements: Array<{
    original: string
    replacement: string
    type: string
    confidence: number
  }> = []

  let sanitizedText = text

  // Basic patterns for fallback
  const patterns = [
    {
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
      replacement: "[EMAIL_ADDRESS]",
      type: "email",
      confidence: 0.8
    },
    {
      regex: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
      replacement: "[PHONE_NUMBER]",
      type: "phone",
      confidence: 0.9
    },
    {
      regex: /\b\d{3}-?\d{2}-?\d{4}\b/g,
      replacement: "[SSN]",
      type: "ssn",
      confidence: 0.95
    }
  ]

  patterns.forEach(pattern => {
    const matches = sanitizedText.match(pattern.regex)
    if (matches) {
      matches.forEach(match => {
        replacements.push({
          original: match,
          replacement: pattern.replacement,
          type: pattern.type,
          confidence: pattern.confidence
        })
      })
      sanitizedText = sanitizedText.replace(pattern.regex, pattern.replacement)
    }
  })

  return {
    sanitizedText,
    privacyScore: Math.min(1.0, replacements.length * 0.2 + 0.3),
    contextPreserved: true,
    processingTimeMs: 0, // Fallback is instant
    replacements
  }
}

// Export the main function for backward compatibility
export { sanitizeUserData as sanitizeUserDataPython }
