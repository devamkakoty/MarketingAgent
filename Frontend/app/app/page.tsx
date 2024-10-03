'use client';
import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Upload,  Youtube, Instagram, Facebook, Mail,LayoutDashboard,User,LogOut,Send } from 'lucide-react'
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase';
import { InstagramPreview } from '@/components/InstagramPreview';
import { FacebookPreview } from '@/components/FacebookPreview';
import dynamic from 'next/dynamic'

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

export default function AppPage() {
  const [file, setFile] = useState<File | null>(null)
  const [industry, setIndustry] = useState('')
  const [designFile, setDesignFile] = useState<File | null>(null)
  const [designRequirements, setDesignRequirements] = useState('')
  const [segmentedData, setSegmentedData] = useState<any[]>([])
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null)
  const [generatedContent, setGeneratedContent] = useState<Record<string, string>>({})
  const [selectedContentType, setSelectedContentType] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [adPreview, setAdPreview] = useState<{ type: string; imageUrl: string; caption: string } | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.push('/')
      }
    })

    return () => unsubscribe()
  }, [router])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0])
    }
  }

  const handleDesignFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setDesignFile(e.target.files[0])
    }
  }

  const handleSegmentation = async () => {
    if (!file || !industry) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('industry', industry)
    if (designFile) {
      formData.append('designFile', designFile)
    }
    if (designRequirements) {
      formData.append('designRequirements', designRequirements)
    }

    try {
      setIsLoading(true)
      const token = await auth.currentUser?.getIdToken()
      const response = await axios.post('/segment', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': token
        }
      })
      setSegmentedData(response.data.segmentedData)
      setError(null)
    } catch (error) {
      setError('Failed to segment data. Please try again.')
      console.error('Segmentation error:', error)
    } finally{
      setIsLoading(false)
    }
  }

  const fetchSegmentedData = async() =>{
    setIsLoading(true)
    try{
      const token = await auth.currentUser?.getIdToken()
      const response = await axios.get('http://127.0.0.1:8080/get-customer-segment-profiles', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        }
      })
      setSegmentedData(response.data.segmentedData)
      setError(null)
      alert('Check next tab to select segments')
    } catch (error) {
      setError('Failed to get segment data. Please try again.')
      console.error('Segmentation error:', error)
    } finally{
      setIsLoading(false)
    }
    }
  

  const handleContentGeneration = async (contentType: string) => {
    setIsLoading(true)
    try {
      setError(null)
      setVideoUrl(null)
      setAdPreview(null)

      const token = await auth.currentUser?.getIdToken()

      const selectedSegmentData = segmentedData.find(segment => segment.datasetId === selectedSegment)
      if (!selectedSegmentData) {
        throw new Error('Selected segment not found')
      }

      // Request body
      const requestData = {
        customerProfile: selectedSegmentData.profile
      }
      const emailRequestdata = {
        customerProfile: selectedSegmentData.profile,
        designGuidelines: (!designFile) ? designRequirements:designFile
      }

      // Request headers
      const headers = {
        "Content-Type": "application/json",
        'Authorization': token
      }

      let response

      if (contentType === 'youtube') {
        response = await axios.post('http://127.0.0.1:8080/generate-youtube-ad', requestData, { headers })
        setVideoUrl(response.data.videoUrl)
      } else if (contentType === 'instagram') {
        response = await axios.post('http://127.0.0.1:8080/generate-instagram-ad', requestData, { headers })
        setAdPreview({
          type: 'instagram',
          imageUrl: `data:image/jpg;base64,${response.data.imageUrl}`,
          caption: response.data.caption
        })
      } else if (contentType === 'facebook') {
        response = await axios.post('http://127.0.0.1:8080/generate-meta-ad', requestData, { headers })
        setAdPreview({
          type: 'facebook',
          imageUrl: `data:image/jpg;base64,${response.data.imageUrl}`,
          caption: response.data.caption
        })
      } else if (contentType === 'email') {
      response = await axios.post('http://127.0.0.1:8080/generate-email', emailRequestdata, { headers })
      setEmailSubject(response.data.emailSubject)
      setEmailBody(response.data.emailBody)
    }

      setGeneratedContent({
        ...generatedContent,
        [contentType]: response?.data.caption || response?.data.content
      })
      setSelectedContentType(contentType)
    } catch (error) {
      console.error('Content generation error:', error)
      setError('Failed to generate content. Please try again.')
    } finally{
      setIsLoading(false)
    }
  }

  const handleSendEmail = async () => {
    if (!emailBody && !emailSubject) return

    try {
      setIsLoading(true)
      const token = await auth.currentUser?.getIdToken()
      const response = await axios.post('http://127.0.0.1:8080/send-email', 
        { 
          subject: emailBody, 
          body: emailBody 
        },
        {
          headers: {
            'Authorization': token
          }
        }
      )
      alert('Email sent successfully!')
    } catch (error) {
      console.error('Email sending error:', error)
      setError('Failed to send email. Please try again.')
    } finally{
      setIsLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await auth.signOut()
      router.push('/')
    } catch (error) {
      console.error('Logout error:', error)
      setError('Failed to log out. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <nav className="bg-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">SegmentGenius</h1>
          <div className="flex space-x-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-gray-100">
                <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
              </Button>
            </Link>
            <Link href="/profile">
              <Button variant="ghost" className="text-gray-100">
                <User className="mr-2 h-4 w-4" /> Profile
              </Button>
            </Link>
            <Button variant="ghost" className="text-gray-100" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-8 tab1Content">
        <h2 className="text-3xl font-bold mb-8">Content Generation</h2>

        <Tabs defaultValue="upload" className="space-y-4">
          <TabsList>
            <TabsTrigger value="upload">Upload Data</TabsTrigger>
            <TabsTrigger value="generate">Generate Content</TabsTrigger>
          </TabsList>

          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle>Upload Customer Data</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="customerData">Customer Data (CSV)</Label>
                  <Input id="customerData" type="file" onChange={handleFileUpload} accept=".csv" />
                </div>

                <div>
                  <Label htmlFor="industry">Select Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger id="industry">
                      <SelectValue placeholder="Select an industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="technology">Technology</SelectItem>
                      <SelectItem value="healthcare">Healthcare</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="retail">Retail</SelectItem>
                      <SelectItem value="education">Education</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="designFile">Design Guidelines (PDF/Word)</Label>
                  <Input id="designFile" type="file" onChange={handleDesignFileUpload} accept=".pdf,.doc,.docx" />
                </div>

                <div>
                  <Label htmlFor="designRequirements">Design Requirements</Label>
                  <Textarea
                    id="designRequirements"
                    placeholder="Enter design requirements here..."
                    value={designRequirements}
                    onChange={(e) => setDesignRequirements(e.target.value)}
                  />
                </div>

                <Button onClick={handleSegmentation} disabled={!file || !industry}>
                  <Upload className="mr-2 h-4 w-4" /> Upload and Segment
                </Button><br></br>
                <Button onClick={fetchSegmentedData}>
                  {isLoading ? (<Upload className="mr-2 h-4 w-4 animate-spin" /> ):(<Upload className="mr-2 h-4 w-4 " />)}Fetch Segmented Data
                  
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate">
            <Card>
              <CardHeader>
                <CardTitle>Generate Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    {segmentedData.length > 0 ? (
                      <Select value={selectedSegment || ''} onValueChange={setSelectedSegment}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a segment" />
                        </SelectTrigger>
                        <SelectContent>
                          {segmentedData.map((segment) => (
                            <SelectItem value={segment.datasetId} className="focus:bg-gray-600">
                              {segment.datasetId}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTitle>No segmented data available</AlertTitle>
                        <AlertDescription>
                          Please upload and segment your data in the "Upload Data" tab first.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-4">
                    <Button
                      onClick={() => handleContentGeneration('youtube')}
                      variant="outline"
                      disabled={!selectedSegment}
                    >
                      {isLoading && selectedContentType === 'youtube' ? (
                        <Youtube className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Youtube className="mr-2 h-4 w-4" />
                      )}
                      YouTube
                    </Button>
                    <Button
                      onClick={() => handleContentGeneration('instagram')}
                      variant="outline"
                      disabled={!selectedSegment}
                    >
                     {isLoading && selectedContentType === 'instagram' ? (
                        <Instagram className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Instagram className="mr-2 h-4 w-4" />
                      )}
                      Instagram
                    </Button>
                    <Button
                      onClick={() => handleContentGeneration('facebook')}
                      variant="outline"
                      disabled={!selectedSegment}
                    >
                      {isLoading && selectedContentType === 'facebook' ? (
                        <Facebook className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Facebook className="mr-2 h-4 w-4" />
                      )}
                      Facebook
                    </Button>
                    <Button
                      onClick={() => handleContentGeneration('email')}
                      variant="outline"
                      disabled={!selectedSegment}
                    >
                      {isLoading && selectedContentType === 'email' ? (
                        <Mail className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      Email
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {adPreview && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>{adPreview.type === 'instagram' ? 'Instagram' : 'Facebook'} Ad Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  {adPreview.type === 'instagram' ? (
                    <InstagramPreview imageUrl={adPreview.imageUrl} caption={adPreview.caption} />
                  ) : (
                    <FacebookPreview imageUrl={adPreview.imageUrl} caption={adPreview.caption} />
                  )}
                </CardContent>
              </Card>
            )}

            {selectedContentType === 'youtube' && videoUrl && (
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Generated YouTube Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <video controls className="w-full max-w-xl mx-auto">
                    <source src={videoUrl} type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </CardContent>
              </Card>
            )}
            {selectedContentType === 'email' &&(
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Generated Email</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="emailSubject">Subject</Label>
                      <Input id="emailSubject" value={emailSubject} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="emailBody">Body</Label>
                      <ReactQuill
                        theme="snow"
                        value={emailBody}
                        onChange={setEmailBody}
                        modules={{
                          toolbar: [
                            [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                            [{size: []}],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{'list': 'ordered'}, {'list': 'bullet'}, 
                             {'indent': '-1'}, {'indent': '+1'}],
                            ['link', 'image'],
                            ['clean']
                          ],
                        }}
                      />
                    </div>
                    <Button onClick={handleSendEmail}>
                    {isLoading ? (
                        <>
                          <Send className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Email
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
          </TabsContent>
        </Tabs>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}