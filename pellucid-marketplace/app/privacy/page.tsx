"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Shield, Lock, Eye, EyeOff } from "lucide-react"
import { Navigation } from "@/components/navigation"
import { sanitizeUserData } from "@/lib/privacy-protection-python"

export default function PrivacyPage() {
  const [inputText, setInputText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)

  const handleSanitize = async () => {
    if (!inputText.trim()) return

    console.log('🚀 Privacy Demo: Starting sanitization...')
    console.log('📝 Privacy Demo: Input text:', inputText)
    
    setIsProcessing(true)
    
    try {
      // Call the Python privacy service directly
      console.log('🌐 Privacy Demo: Calling sanitizeUserData...')
      const result = await sanitizeUserData(inputText, 'standard')
      console.log('✅ Privacy Demo: Received result:', result)
      console.log('🔍 Privacy Demo: Result sanitizedText:', result.sanitizedText)
      console.log('🔍 Privacy Demo: Result privacyScore:', result.privacyScore)
      setResult(result)
    } catch (error) {
      console.error('❌ Privacy Demo: Error:', error)
      // Show error message to user
      setResult({
        sanitizedText: `Error: Could not connect to privacy service. ${error.message}`,
        privacyScore: 0,
        replacements: [],
        contextPreserved: false,
        processingTimeMs: 0
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const exampleTexts = {
    personal: `Hi, I'm John Smith from New York. My email is john.smith@email.com and my phone number is (555) 123-4567. I live at 123 Main Street.`,
    conversation: `User: Can you help me with my project?
AI: Hello John! I'd be happy to help you. However, I should mention that sharing personal information like your full name, email, phone number, and address in our conversation isn't necessary for most requests.`,
    technical: `The system processes data from user [USER_ID] located in [CITY] with contact [EMAIL] and processes [AMOUNT] transactions per day.`,
    creative: `Sarah Johnson from Los Angeles wrote a story about her dog Max who lives at 456 Oak Street. Her phone number is (213) 555-0123.`
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-4">Privacy Protection Demo</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              See how our privacy protection works. Enter text below to see how we automatically remove sensitive information.
            </p>
          </div>

          {/* Demo Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card className="glass border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Original Text
                </CardTitle>
                <CardDescription>
                  Enter text that contains personal information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Enter text with personal information..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="min-h-[200px] mb-4"
                />
                <div className="flex gap-2 mb-4">
                  <Button
                    onClick={handleSanitize}
                    disabled={!inputText.trim() || isProcessing}
                    className="bg-primary text-black"
                  >
                    {isProcessing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Sanitize Text
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Example buttons */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Try these examples:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputText(exampleTexts.personal)}
                      className="text-xs"
                    >
                      Personal Info
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputText(exampleTexts.conversation)}
                      className="text-xs"
                    >
                      AI Chat
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputText(exampleTexts.technical)}
                      className="text-xs"
                    >
                      Technical
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setInputText(exampleTexts.creative)}
                      className="text-xs"
                    >
                      Creative
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <EyeOff className="w-5 h-5" />
                  Sanitized Text
                </CardTitle>
                <CardDescription>
                  See how personal information is automatically removed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {result ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-secondary/30 rounded-lg min-h-[200px]">
                      <p className="whitespace-pre-wrap">{result.sanitizedText}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Privacy Score:</span>
                        <Badge 
                          className={`${
                            result.privacyScore >= 0.9 ? 'bg-green-500' :
                            result.privacyScore >= 0.7 ? 'bg-yellow-500' : 'bg-red-500'
                          } text-white`}
                        >
                          {(result.privacyScore * 100).toFixed(0)}%
                        </Badge>
                      </div>
                      
                      {result.replacements && result.replacements.length > 0 && (
                        <div>
                          <p className="text-sm font-medium mb-2">Replacements Made:</p>
                          <div className="space-y-1">
                            {result.replacements.map((replacement: any, index: number) => (
                              <div key={index} className="flex items-center justify-between text-xs p-2 bg-secondary/20 rounded">
                                <span className="font-mono">{replacement.original}</span>
                                <span>→</span>
                                <span className="font-mono text-primary">{replacement.replacement}</span>
                                <Badge variant="outline" className="text-xs">{replacement.type}</Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center min-h-[200px] text-muted-foreground">
                    <div className="text-center">
                      <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Enter text and click "Sanitize Text" to see the privacy protection in action</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* How it Works */}
          <Card className="glass border-0 shadow-lg">
            <CardHeader>
              <CardTitle>How Privacy Protection Works</CardTitle>
              <CardDescription>
                Our advanced privacy protection system automatically identifies and replaces sensitive information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">Detection</h3>
                  <p className="text-sm text-muted-foreground">
                    Advanced pattern recognition identifies names, emails, phone numbers, addresses, and other PII
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-6 h-6 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">Replacement</h3>
                  <p className="text-sm text-muted-foreground">
                    Sensitive data is replaced with generic tokens while preserving context and meaning
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-chart-4/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-6 h-6 text-chart-4" />
                  </div>
                  <h3 className="font-semibold mb-2">Protection</h3>
                  <p className="text-sm text-muted-foreground">
                    Original data is never stored - only the sanitized version is kept for analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}