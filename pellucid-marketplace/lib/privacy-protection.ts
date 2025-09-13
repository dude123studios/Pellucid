// Privacy Protection Layer - Core functionality for data sanitization and anonymization

interface PrivacyConfig {
  enableTokenSubstitution: boolean
  enableDifferentialPrivacy: boolean
  privacyLevel: "standard" | "enhanced" | "maximum"
  preserveContext: boolean
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
}

// Patterns for identifying sensitive information
const SENSITIVE_PATTERNS = {
  names: {
    pattern: /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g,
    replacement: "[PERSON_NAME]",
    type: "personal_name",
  },
  emails: {
    pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
    replacement: "[EMAIL_ADDRESS]",
    type: "email",
  },
  phones: {
    pattern: /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/g,
    replacement: "[PHONE_NUMBER]",
    type: "phone",
  },
  addresses: {
    pattern:
      /\b\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Lane|Ln|Drive|Dr|Court|Ct|Place|Pl)\b/gi,
    replacement: "[ADDRESS]",
    type: "address",
  },
  ssn: {
    pattern: /\b\d{3}-?\d{2}-?\d{4}\b/g,
    replacement: "[SSN]",
    type: "ssn",
  },
  creditCards: {
    pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g,
    replacement: "[CREDIT_CARD]",
    type: "credit_card",
  },
  dates: {
    pattern:
      /\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}\b/g,
    replacement: "[DATE]",
    type: "date",
  },
  locations: {
    pattern:
      /\b(?:New York|Los Angeles|Chicago|Houston|Phoenix|Philadelphia|San Antonio|San Diego|Dallas|San Jose|Austin|Jacksonville|Fort Worth|Columbus|Charlotte|San Francisco|Indianapolis|Seattle|Denver|Washington|Boston|El Paso|Nashville|Detroit|Oklahoma City|Portland|Las Vegas|Memphis|Louisville|Baltimore|Milwaukee|Albuquerque|Tucson|Fresno|Sacramento|Mesa|Kansas City|Atlanta|Long Beach|Colorado Springs|Raleigh|Miami|Virginia Beach|Omaha|Oakland|Minneapolis|Tulsa|Arlington|Tampa|New Orleans)\b/g,
    replacement: "[CITY]",
    type: "location",
  },
  numbers: {
    pattern: /\b\d{4,}\b/g,
    replacement: "[NUMBER]",
    type: "number",
  },
}

export class PrivacyProtector {
  private config: PrivacyConfig

  constructor(config: Partial<PrivacyConfig> = {}) {
    this.config = {
      enableTokenSubstitution: true,
      enableDifferentialPrivacy: false,
      privacyLevel: "standard",
      preserveContext: true,
      ...config,
    }
  }

  /**
   * Main sanitization function that processes text and removes sensitive information
   */
  sanitizeText(text: string): SanitizationResult {
    let sanitizedText = text
    const replacements: SanitizationResult["replacements"] = []
    let totalReplacements = 0

    // Apply token substitution based on privacy level
    if (this.config.enableTokenSubstitution) {
      const patternsToUse = this.getPatternsByPrivacyLevel()

      for (const [key, patternConfig] of Object.entries(patternsToUse)) {
        const matches = Array.from(text.matchAll(patternConfig.pattern))

        matches.forEach((match) => {
          const original = match[0]
          const replacement = this.generateContextualReplacement(
            original,
            patternConfig.type,
            patternConfig.replacement,
          )

          sanitizedText = sanitizedText.replace(original, replacement)

          replacements.push({
            original,
            replacement,
            type: patternConfig.type,
            confidence: this.calculateConfidence(original, patternConfig.type),
          })

          totalReplacements++
        })
      }
    }

    // Apply differential privacy if enabled
    if (this.config.enableDifferentialPrivacy) {
      sanitizedText = this.applyDifferentialPrivacy(sanitizedText)
    }

    // Calculate privacy score
    const privacyScore = this.calculatePrivacyScore(text, sanitizedText, totalReplacements)

    return {
      sanitizedText,
      replacements,
      privacyScore,
      contextPreserved: this.config.preserveContext,
    }
  }

  /**
   * Get patterns based on privacy level
   */
  private getPatternsByPrivacyLevel() {
    switch (this.config.privacyLevel) {
      case "maximum":
        return SENSITIVE_PATTERNS
      case "enhanced":
        // Exclude some less sensitive patterns
        const { numbers, dates, ...enhancedPatterns } = SENSITIVE_PATTERNS
        return enhancedPatterns
      case "standard":
      default:
        // Only most sensitive patterns
        const { names, emails, phones, addresses, ssn, creditCards } = SENSITIVE_PATTERNS
        return { names, emails, phones, addresses, ssn, creditCards }
    }
  }

  /**
   * Generate contextually appropriate replacements
   */
  private generateContextualReplacement(original: string, type: string, defaultReplacement: string): string {
    if (!this.config.preserveContext) {
      return defaultReplacement
    }

    // Generate contextual replacements that preserve meaning
    switch (type) {
      case "personal_name":
        return this.generatePersonName()
      case "email":
        return "[USER]@[DOMAIN].com"
      case "phone":
        return "(555) 123-4567"
      case "address":
        return "123 [STREET_NAME] Street"
      case "date":
        return "[MONTH] [DAY], [YEAR]"
      case "location":
        return "[CITY_NAME]"
      case "number":
        return "[" + "X".repeat(Math.min(original.length, 6)) + "]"
      default:
        return defaultReplacement
    }
  }

  /**
   * Generate realistic but fake person names
   */
  private generatePersonName(): string {
    const firstNames = ["Alex", "Jordan", "Taylor", "Casey", "Morgan", "Riley", "Avery", "Quinn"]
    const lastNames = ["Smith", "Johnson", "Williams", "Brown", "Jones", "Garcia", "Miller", "Davis"]

    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)]
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)]

    return `${firstName} ${lastName}`
  }

  /**
   * Calculate confidence score for pattern matches
   */
  private calculateConfidence(text: string, type: string): number {
    // Simple confidence calculation based on pattern strength
    const baseConfidence = {
      email: 0.95,
      phone: 0.9,
      ssn: 0.98,
      credit_card: 0.95,
      personal_name: 0.75,
      address: 0.85,
      date: 0.7,
      location: 0.8,
      number: 0.6,
    }

    return baseConfidence[type as keyof typeof baseConfidence] || 0.5
  }

  /**
   * Apply differential privacy techniques
   */
  private applyDifferentialPrivacy(text: string): string {
    // Simplified differential privacy - add noise to numerical values
    return text.replace(/\b\d+\b/g, (match) => {
      const num = Number.parseInt(match)
      if (num > 100) {
        // Add Laplace noise for larger numbers
        const noise = this.generateLaplaceNoise(0, 1)
        return Math.max(0, Math.round(num + noise)).toString()
      }
      return match
    })
  }

  /**
   * Generate Laplace noise for differential privacy
   */
  private generateLaplaceNoise(mu: number, b: number): number {
    const u = Math.random() - 0.5
    return mu - b * Math.sign(u) * Math.log(1 - 2 * Math.abs(u))
  }

  /**
   * Calculate overall privacy score
   */
  private calculatePrivacyScore(originalText: string, sanitizedText: string, replacements: number): number {
    const originalLength = originalText.length
    const sanitizedLength = sanitizedText.length
    const replacementRatio = replacements / (originalText.split(" ").length || 1)

    // Base score starts high
    let score = 0.95

    // Reduce score if not many replacements were made
    if (replacementRatio < 0.05) {
      score -= 0.1
    }

    // Increase score for more comprehensive sanitization
    if (replacementRatio > 0.15) {
      score = Math.min(0.99, score + 0.05)
    }

    // Ensure minimum score
    return Math.max(0.7, score)
  }

  /**
   * Validate that sanitization was successful
   */
  validateSanitization(result: SanitizationResult): boolean {
    // Check that no obvious sensitive patterns remain
    const sensitivePatterns = [
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // emails
      /\b\d{3}-?\d{2}-?\d{4}\b/, // SSN
      /(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})/, // phones
    ]

    for (const pattern of sensitivePatterns) {
      if (pattern.test(result.sanitizedText)) {
        return false
      }
    }

    return result.privacyScore >= 0.7
  }
}

// Export utility functions
export function createPrivacyProtector(level: "standard" | "enhanced" | "maximum" = "standard") {
  return new PrivacyProtector({
    privacyLevel: level,
    enableTokenSubstitution: true,
    enableDifferentialPrivacy: level === "maximum",
    preserveContext: true,
  })
}

export function sanitizeUserData(text: string, privacyLevel: "standard" | "enhanced" | "maximum" = "standard") {
  const protector = createPrivacyProtector(privacyLevel)
  return protector.sanitizeText(text)
}
