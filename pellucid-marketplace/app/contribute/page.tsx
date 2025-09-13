"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Upload, FileText, MessageSquare, Shield, CheckCircle, AlertCircle, Info, ArrowLeft, User, Plus, Trash2, X } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Navigation } from "@/components/navigation"
import { sanitizeUserData } from "@/lib/privacy-protection-python"

interface StagedData {
  id?: string
  payload: string
  label: string
  category: string
}

const CATEGORIES = [
  'Harmful Content',
  'Hallucination', 
  'Reasoning Errors',
  'Creativity Weakness',
  'Alignment Issues',
  'Context Failures'
]

export default function ContributePage() {
  const router = useRouter()
  const [stagedData, setStagedData] = useState<StagedData[]>([])
  const [currentData, setCurrentData] = useState<StagedData>({
    payload: '',
    label: '',
    category: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessingPrivacy, setIsProcessingPrivacy] = useState(false)
  const [privacyAnimation, setPrivacyAnimation] = useState(false)

  const generateLabel = async (payload: string) => {
    try {
      const response = await fetch('http://localhost:8000/label-single', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ payload })
      })

      if (response.ok) {
        const result = await response.json()
        return {
          label: result.label,
          category: result.category
        }
      }
    } catch (error) {
      console.error('Error generating label:', error)
    }
    
    // Fallback if API fails
    return {
      label: 'AI Interaction',
      category: 'General'
    }
  }

  const addStagedData = async () => {
    if (!currentData.payload.trim()) {
      alert("Please provide data content")
      return
    }

    setIsProcessingPrivacy(true)
    setPrivacyAnimation(true)

    try {
      let label = currentData.label.trim()
      let category = currentData.category

      // If no label or category provided, generate them automatically
      if (!label || !category) {
        const generated = await generateLabel(currentData.payload)
        label = label || generated.label
        category = category || generated.category
      }

      // Apply privacy protection using Python backend
      const privacyResult = await sanitizeUserData(currentData.payload, 'standard')
      
      // Create data object with sanitized text (skip privacy protection in API since we already did it)
      const token = localStorage.getItem('auth_token')
      console.log('🔑 Frontend: Auth token:', token ? 'Present' : 'Missing')
      if (!token) {
        alert('Please log in to continue')
        window.location.href = '/auth'
        return
      }

      const response = await fetch('/api/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          payload: privacyResult.sanitizedText, // Use sanitized text
          label,
          category,
          skipPrivacyProtection: true // Flag to skip privacy protection in API
        })
      })

      console.log('📥 Frontend: Response status:', response.status, response.statusText)
      
      if (response.ok) {
        const result = await response.json()
        console.log('✅ Frontend: Data object created successfully:', result)
        setStagedData(prev => [...prev, { 
          id: result.dataId,
          payload: privacyResult.sanitizedText, // Store sanitized text
          label, 
          category 
        }])
        setCurrentData({ payload: '', label: '', category: '' })
      } else {
        const errorText = await response.text()
        console.error('❌ Frontend: Failed to create data object:', response.status, errorText)
        alert(`Failed to process data: ${response.status} ${errorText}`)
      }
    } catch (error) {
      console.error('Error adding staged data:', error)
      alert('Error processing data. Please try again.')
    } finally {
      setIsProcessingPrivacy(false)
      setTimeout(() => setPrivacyAnimation(false), 1000)
    }
  }

  const removeStagedData = (index: number) => {
    setStagedData(prev => prev.filter((_, i) => i !== index))
  }

  const extractConversationText = (mapping: any): string => {
    let text = ''
    
    // Extract user and assistant messages
    for (const [key, node] of Object.entries(mapping)) {
      if (node && typeof node === 'object' && 'message' in node) {
        const message = (node as any).message
        if (message && message.content && message.content.parts) {
          const role = message.author?.role
          const content = message.content.parts.join(' ')
          
          if (content && content.trim()) {
            if (role === 'user') {
              text += `User: ${content}\n`
            } else if (role === 'assistant') {
              text += `AI: ${content}\n`
            }
          }
        }
      }
    }
    
    return text.trim()
  }

  const uploadBulkData = async (dataArray: StagedData[]) => {
    try {
      setIsProcessingPrivacy(true)
      setPrivacyAnimation(true)

      // Apply privacy protection to all data using Python backend
      console.log('Applying privacy protection to', dataArray.length, 'data items')
      const sanitizedDataArray = []
      
      for (const dataItem of dataArray) {
        try {
          const privacyResult = await sanitizeUserData(dataItem.payload, 'standard')
          sanitizedDataArray.push({
            ...dataItem,
            payload: privacyResult.sanitizedText
          })
        } catch (error) {
          console.error('Error sanitizing data item:', error)
          // If sanitization fails, use original data
          sanitizedDataArray.push(dataItem)
        }
      }

      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert('Please log in to continue')
        window.location.href = '/auth'
        return
      }

      const response = await fetch('/api/data/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          dataArray: sanitizedDataArray,
          skipPrivacyProtection: true // Skip privacy protection in API since we already did it
        })
      })

      if (response.ok) {
        const result = await response.json()
        // Add to staged data for visualization
        setStagedData(prev => [...prev, ...sanitizedDataArray])
        alert(`Successfully processed ${dataArray.length} conversation(s) from JSON file!`)
      } else {
        console.error('Failed to upload bulk data')
        alert('Failed to process JSON file. Please try again.')
      }
    } catch (error) {
      console.error('Error uploading bulk data:', error)
      alert('Error uploading data. Please try again.')
    } finally {
      setIsProcessingPrivacy(false)
      setTimeout(() => setPrivacyAnimation(false), 1000)
    }
  }


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (files.length === 0) return

    setUploadedFiles(prev => [...prev, ...files])
    
    // Process JSON files
    files.forEach(file => {
      if (file.type === 'application/json' || file.name.endsWith('.json')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string
            const jsonData = JSON.parse(content)
            
            if (Array.isArray(jsonData)) {
              // Check if it's ChatGPT conversation format
              if (jsonData.length > 0 && jsonData[0].mapping) {
                // Process ChatGPT conversation format
                const conversations = jsonData
                const processedData: StagedData[] = []
                
                for (const conversation of conversations) {
                  if (conversation.mapping) {
                    const extractedText = extractConversationText(conversation.mapping)
                    if (extractedText.trim()) {
                      processedData.push({
                        payload: extractedText,
                        label: conversation.title || 'ChatGPT Conversation',
                        category: 'General'
                      })
                    }
                  }
                }
                
                if (processedData.length > 0) {
                  // Upload to backend with privacy protection
                  uploadBulkData(processedData)
                }
              } else {
                // Process array of data objects
                const newData = jsonData.map((item, index) => ({
                  payload: item.payload || item.text || item.content || '',
                  label: item.label || item.title || `Data ${index + 1}`,
                  category: item.category || 'General'
                })).filter(data => data.payload.trim())
                
                setStagedData(prev => [...prev, ...newData])
              }
            } else if (jsonData.mapping) {
              // Single ChatGPT conversation
              const extractedText = extractConversationText(jsonData.mapping)
              if (extractedText.trim()) {
                const processedData = [{
                  payload: extractedText,
                  label: jsonData.title || 'ChatGPT Conversation',
                  category: 'General'
                }]
                uploadBulkData(processedData)
              }
            } else if (jsonData.payload || jsonData.text || jsonData.content) {
              // Process single data object
              setStagedData(prev => [...prev, {
                payload: jsonData.payload || jsonData.text || jsonData.content || '',
                label: jsonData.label || jsonData.title || 'Imported Data',
                category: jsonData.category || 'General'
              }])
            }
          } catch (error) {
            console.error('Error parsing JSON file:', error)
            alert('Error parsing JSON file. Please ensure it contains valid data objects.')
          }
        }
        reader.readAsText(file)
      }
    })
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (stagedData.length === 0) {
      alert("Please add at least one data object before submitting")
      return
    }

    setIsSubmitting(true)
    
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        alert("Please log in to contribute data")
        router.push('/auth')
        return
      }

      // Step 1: Create all data objects
      const dataIds: string[] = []
      
      for (const data of stagedData) {
        const response = await fetch('/api/data', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(data)
        })

        if (response.ok) {
          const result = await response.json()
          dataIds.push(result.dataId)
        } else {
          throw new Error('Failed to create data object')
        }
      }

      // Step 2: Submit all data objects
      const submitResponse = await fetch('/api/contribute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ dataIds })
      })

      if (submitResponse.ok) {
        const result = await submitResponse.json()
        // Redirect to celebration page with data count and estimated value
        const estimatedValue = stagedData.length * 12.5 // Average value per data object
        router.push(`/submission-success?count=${stagedData.length}&value=${estimatedValue}&submissionId=${result.submissionId}`)
      } else {
        const errorData = await submitResponse.json()
        alert(errorData.error || "Submission failed")
      }
    } catch (error) {
      console.error('Submission error:', error)
      alert("Submission failed. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      {/* Privacy Protection Animation Overlay */}
      {privacyAnimation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-900 rounded-lg p-8 max-w-md mx-4 text-center">
            <div className="mb-4">
              <Shield className="w-16 h-16 mx-auto text-green-500 animate-pulse" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Protecting Your Privacy</h3>
            <p className="text-slate-300 mb-4">
              Our AI is analyzing your data and removing sensitive information while preserving context...
            </p>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      )}
      
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <Button variant="ghost" className="mb-6 glass bg-transparent" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Header */}
          <div className="text-center mb-12">
            <Badge className="mb-4 glass" variant="secondary">
              <Shield className="w-4 h-4 mr-2" />
              Privacy-First Data Contribution
            </Badge>
            <h1 className="text-4xl font-bold mb-4">Contribute AI Data</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Add individual data points or upload JSON files. Stage your data before submitting for analysis.
            </p>
          </div>

          {/* Staging Counter */}
          {stagedData.length > 0 && (
            <Card className="glass border-0 shadow-lg mb-8">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-chart-4" />
                    <span className="font-semibold">{stagedData.length} data objects staged</span>
                  </div>
                  <Button 
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="bg-primary text-black"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit All Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <Tabs defaultValue="manual" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
              <TabsTrigger value="file">File Upload</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Add Data Object
                  </CardTitle>
                  <CardDescription>
                    Add individual AI interaction examples with labels and categories
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Data Content</label>
                    <Textarea
                      placeholder="Paste your AI conversation or interaction here..."
                      value={currentData.payload}
                      onChange={(e) => setCurrentData(prev => ({ ...prev, payload: e.target.value }))}
                      className="min-h-[200px] resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Label (optional - auto-generated if empty)</label>
                      <Input
                        placeholder="Brief description of this data"
                        value={currentData.label}
                        onChange={(e) => setCurrentData(prev => ({ ...prev, label: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Category (optional - auto-detected if empty)</label>
                      <Select value={currentData.category} onValueChange={(value) => setCurrentData(prev => ({ ...prev, category: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(category => (
                            <SelectItem key={category} value={category}>{category}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <Button 
                    onClick={addStagedData}
                    disabled={!currentData.payload.trim() || isProcessingPrivacy}
                    className="bg-primary text-black w-full"
                  >
                    {isProcessingPrivacy ? (
                      <>
                        <div className="w-4 h-4 mr-2 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        Processing Privacy...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Add to Staging
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="file" className="space-y-6">
              <Card className="glass border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Upload JSON Files
                  </CardTitle>
                  <CardDescription>
                    Upload JSON files containing arrays of data objects
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-lg font-medium mb-2">Drop JSON files here or click to browse</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Supports .json files with data objects
                    </p>
                    <input
                      type="file"
                      multiple
                      accept=".json"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button asChild variant="outline" className="glass bg-transparent">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        Choose Files
                      </label>
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div className="mt-6 space-y-2">
                      <h4 className="font-medium">Uploaded Files:</h4>
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="w-4 h-4" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="secondary" className="text-xs">
                              {(file.size / 1024).toFixed(1)} KB
                            </Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Staged Data Preview */}
          {stagedData.length > 0 && (
            <Card className="glass border-0 shadow-lg mt-8">
              <CardHeader>
                <CardTitle>Staged Data Objects ({stagedData.length})</CardTitle>
                <CardDescription>
                  Review your data before submitting
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {stagedData.map((data, index) => (
                    <div key={index} className="p-4 bg-secondary/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{data.category}</Badge>
                          <span className="font-medium text-sm">{data.label}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeStagedData(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {data.payload}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy Notice */}
          <Alert className="mt-8 glass border-0">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Privacy Protection:</strong> All submitted data is automatically processed to remove personal information 
              like names, emails, and phone numbers before being stored. Your original data is never saved.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  )
}